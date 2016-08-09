/*eslint-env node */
/**
 * Copyright 2015 IBM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/
/**
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corp. 2016
 */

var debug = require('debug')('OBCCAConnector');

var fs = require('fs');
var kdf = require('./kdf')
//crypto stuff
var jsrsa = require('jsrsasign');
var KEYUTIL = jsrsa.KEYUTIL;
var asn1 = jsrsa.asn1;
var elliptic = require('elliptic');
var sha3_256 = require('js-sha3').sha3_256;
var sha3_384 = require('js-sha3').sha3_384;
//grpc
var grpc = require("grpc");
var protoFile = __dirname + "/protos/ca.proto";
var Timestamp = grpc.load(__dirname + "/protos/google/protobuf/timestamp.proto").google.protobuf.Timestamp;
//internal state
var connector;

//Implement Loopback.io connector interface
exports.initialize = function (dataSource, callback) {

	console.log("Datasource object",dataSource.settings)


    //instantiate OBCCAConnector with dataSource.settings
    connector = new OBCCAConnector(dataSource.settings);
	
    //set dataSource.connector to connector
    dataSource.connector = connector;
    connector.dataSource = dataSource;

    connector.DataAccessObject = function () { };
    for (var m in OBCCAConnector.prototype) {
        var method = OBCCAConnector.prototype[m];
        if ('function' === typeof method) {
            connector.DataAccessObject[m] = method.bind(connector);
            for (var k in method) {
                connector.DataAccessObject[m][k] = method[k];
            }
        }
    };
    
    
    //check to see if being used within loopback framework
    if (dataSource.createModel && typeof dataSource.createModel == 'function') {
        dataSource.DataAccessObject = connector.DataAccessObject;
        //create models
        dataSource.createModel('RegisterUserRequest',
            {
                identity: {
                    type: "string",
                    id: true,
                    required: true
                },
                role: {
                    type: "number",
                    required: true
                }

            });
        dataSource.createModel('RegisterUserResponse',
            {
                identity: {
                    type: "string",
                    id: true
                },
                token: {
                    type: "string"
                }

            });
    };

    callback && callback();

};

exports.stop = function () {
    connector.stop();
};

exports.start = function () {
    connector.start();
};

function OBCCAConnector(settings) {

    this.name = 'OBCConnector';
    this.grpcServerAddress = settings.host + ":" + settings.port;
    if (settings.secure)
    {
        this.grpcCredentials = grpc.credentials.createSsl();
    }
    else
    {
        this.grpcCredentials = grpc.credentials.createInsecure();
    }
    
    
    //load the protobuf definitions
    this.protos = grpc.load(protoFile).protos;
    this.ecaaClient = new this.protos.ECAA(this.grpcServerAddress, this.grpcCredentials);
    this.ecapClient = new this.protos.ECAP(this.grpcServerAddress, this.grpcCredentials);
    this.tcapClient = new this.protos.TCAP(this.grpcServerAddress, this.grpcCredentials);
    this.tlscapClient = new this.protos.TLSCAP(this.grpcServerAddress, this.grpcCredentials);

    this.initialized = false;

};

//for testing
exports.OBCCAConnector = OBCCAConnector;


/**
 * @typedef RegisterUserResponse
 * @type Object
 * @property {string} identity Identity
 * @property {string} token One time token for the registered identity
 */

/**
 * Register a new user with membership services
 * @param {Object} UserRequest
 * @param {string} UserRequest.identity
 * @param {number} UserRequest.role
 * @return {RegisterUserResponse}
 */
OBCCAConnector.prototype.registerUser = function (userRequest, callback) {

    var registerUserRequest = new this.protos.RegisterUserReq();
    registerUserRequest.setId({ id: userRequest.identity });
    registerUserRequest.setRole(userRequest.role);
    registerUserRequest.setAccount(userRequest.account);
    registerUserRequest.setAffiliation(userRequest.affiliation);
    this.ecaaClient.registerUser(registerUserRequest, function (err, token) {
        if (err) {
			console.log("Loopback error:", JSON.stringify(err));
            if (callback) {
                callback(err, null);
            }
        }
        else {

            if (callback) {
                debug(userRequest.identity + ' | ' + token.tok.toString());
                callback(null, { identity: userRequest.identity, token: token.tok.toString() });
            }
        }
    })
};

/**
 * 
 */ 

/**
 * Retrieve the ECA root certificate
 * 
 */
OBCCAConnector.prototype.getECACertificate = function (callback) {

    this.ecapClient.readCaCertificate(new this.protos.Empty(), function (err, cert) {
        if (err) {

            if (callback) {
                callback(err, null);
            }
        }
        else {

            var ecaCert = cert.cert.toString('hex');
            debug('ECA Root Cert:\n', ecaCert);
            callback(null,ecaCert);
        }

    });

};

/**
 * Retrieve the TCA root certificate
 * 
 */
OBCCAConnector.prototype.getTCACertificate = function (callback) {

    this.tcapClient.readCaCertificate(new this.protos.Empty(), function (err, cert) {
        if (err) {

            if (callback) {
                callback(err, null);
            }
        }
        else {

            var tcaCert = cert.cert.toString('hex');
            debug('TCA Root Cert:\n', tcaCert);
            callback(null,tcaCert);
        }

    });

};

/**
 * Retrieve the TLS root certificate
 * 
 */
OBCCAConnector.prototype.getTLSCertificate = function (callback) {

    this.tlscapClient.readCaCertificate(new this.protos.Empty(), function (err, cert) {
        if (err) {

            if (callback) {
                callback(err, null);
            }
        }
        else {

            var tlsCert = cert.cert.toString('hex');
            debug('TLS Root Cert:\n', tlsCert);
            callback(null,tlsCert);
        }

    });

};


/**
 * Retrieve enrollment certificates from the ECA
 * @param {Object} LoginRequest
 * @param {string} LoginRequest.identity
 * @param {string} LoginRequest.token
 */
OBCCAConnector.prototype.getEnrollmentCertificateFromECA = function (loginRequest, callback) {
    var self = this;

    var timestamp = new Timestamp({ seconds: Date.now() / 1000, nanos: 0 });

    //generate ECDSA keys
    //signing key
    var ecKeypair = KEYUTIL.generateKeypair("EC", "secp256r1");
    var spki = new asn1.x509.SubjectPublicKeyInfo(ecKeypair.pubKeyObj);
    
    //encryption key
    var ecKeypair2 = KEYUTIL.generateKeypair("EC", "secp256r1");
    var spki2 = new asn1.x509.SubjectPublicKeyInfo(ecKeypair2.pubKeyObj);
    
    //create the proto message
    var eCertCreateRequest = new this.protos.ECertCreateReq();
    eCertCreateRequest.setTs(timestamp);
    eCertCreateRequest.setId({ id: loginRequest.identity });
    eCertCreateRequest.setTok({ tok: new Buffer(loginRequest.token) });
    //public signing key (ecdsa)
    var signPubKey = new this.protos.PublicKey(
        {
            type: this.protos.CryptoType.ECDSA,
            key: new Buffer(spki.getASN1Object().getEncodedHex(), 'hex')
        });
    eCertCreateRequest.setSign(signPubKey);
    //public encryption key (ecdsa)
    var encPubKey = new this.protos.PublicKey(
        {
            type: this.protos.CryptoType.ECDSA,
            key: new Buffer(spki2.getASN1Object().getEncodedHex(), 'hex')
        });
    eCertCreateRequest.setEnc(encPubKey);

    self.createCertificatePair(eCertCreateRequest, function (err, eCertCreateResp) {
        if (err) {
            if (callback) {
                callback(err, null);
            }
        }
        else {
            var cipherText = eCertCreateResp.tok.tok;
            //cipherText = ephemeralPubKeyBytes + encryptedTokBytes + macBytes
            //ephemeralPubKeyBytes = first ((384+7)/8)*2 + 1 bytes = first 97 bytes
            //ephemeralPubKeyBytes = first ((256+7)/8)*2 + 1 bytes = first 65 bytes
            //hmac is sha3_384 = 48 bytes or sha3_256 = 32 bytes
            var ephemeralPublicKeyBytes = cipherText.slice(0, 65);
            var encryptedTokBytes = cipherText.slice(65, cipherText.length - 32);
            debug("encryptedTokBytes:\n", encryptedTokBytes);
            var macBytes = cipherText.slice(cipherText.length - 48);
            debug("length = ", ephemeralPublicKeyBytes.length + encryptedTokBytes.length + macBytes.length);
            //debug(rsaPrivKey.decrypt(eCertCreateResp.tok.tok));
            debug('encrypted Tok: ', eCertCreateResp.tok.tok);
            debug('encrypted Tok length: ', eCertCreateResp.tok.tok.length);
            //debug('public key obj:\n',ecKeypair2.pubKeyObj);
            debug('public key length: ', new Buffer(ecKeypair2.pubKeyObj.pubKeyHex, 'hex').length);
            //debug('private key obj:\n',ecKeypair2.prvKeyObj);
            debug('private key length: ', new Buffer(ecKeypair2.prvKeyObj.prvKeyHex, 'hex').length);



            var EC = elliptic.ec
            var curve = elliptic.curves['p256'];
            var ecdsa = new EC(curve);
            
            //convert bytes to usable key object
            var ephPubKey = ecdsa.keyFromPublic(ephemeralPublicKeyBytes.toString('hex'), 'hex');
            var encPrivKey = ecdsa.keyFromPrivate(ecKeypair2.prvKeyObj.prvKeyHex, 'hex');

            var secret = encPrivKey.derive(ephPubKey.getPublic());
            var aesKey = kdf.hkdf(secret.toArray(), 256, null, null, 'sha3-256');

            //debug('aesKey: ',aesKey);
            
            var decryptedTokBytes = kdf.aesCFBDecryt(aesKey, encryptedTokBytes);
            
            //debug(decryptedTokBytes);
            debug(decryptedTokBytes.toString());

            eCertCreateRequest.setTok({ tok: decryptedTokBytes });
            eCertCreateRequest.setSig(null);

            var buf = eCertCreateRequest.toBuffer();

            var signKey = ecdsa.keyFromPrivate(ecKeypair.prvKeyObj.prvKeyHex, 'hex');
            //debug(new Buffer(sha3_384(buf),'hex'));
            var sig = ecdsa.sign(new Buffer(sha3_256(buf), 'hex'), signKey);

            eCertCreateRequest.setSig(new self.protos.Signature(
                {
                    type: self.protos.CryptoType.ECDSA,
                    r: new Buffer(sig.r.toString()),
                    s: new Buffer(sig.s.toString())
                }
                ));
            self.createCertificatePair(eCertCreateRequest, function (err, eCertCreateResp) {
                if (err) {
                    if (callback) {
                        callback(err);
                    }
                }
                else {
                    debug(eCertCreateResp);
                    var enrollKey = ecKeypair.prvKeyObj.prvKeyHex;
                    var enrollCert = eCertCreateResp.certs.sign.toString('hex');
                    var enrollChainKey = eCertCreateResp.pkchain.toString('hex');
                    
                    
                    //debug('cert:\n\n',enrollCert)
                    
                    
                    callback(null, enrollKey, enrollCert, enrollChainKey);
                }
            });
        }

    });

};

OBCCAConnector.prototype.createCertificatePair = function (eCertCreateRequest, callback) {

    this.ecapClient.createCertificatePair(eCertCreateRequest, function (err, eCertCreateResp) {
        if (err) {
            debug('error:\n', err);

            if (callback) {
                callback(err, null);
            }
        }
        else {
            callback(null, eCertCreateResp);
        }

    });

};

/**
 * Retrieve transaction certificates from the TCA
 * @param {Object} TCertSetRequest
 * @param {string} TCertSetRequest.identity
 * @param {string} TCertSetRequest.enrollmentKey
 * @param {number} TCertSetRequest.num
 */
OBCCAConnector.prototype.tcaCreateCertificateSet = function (tCertSetRequest, callback) {
    var self = this;

    var timestamp = new Timestamp({ seconds: Date.now() / 1000, nanos: 0 });
    
    //create the proto
    var tCertCreateSetReq = new this.protos.TCertCreateSetReq();
    tCertCreateSetReq.setTs(timestamp);
    tCertCreateSetReq.setId({ id: tCertSetRequest.identity });
    tCertCreateSetReq.setNum(tCertSetRequest.num);
    
    //serialize proto
    var buf = tCertCreateSetReq.toBuffer();
    
    //sign the transaction using enrollmentKey
    var EC = elliptic.ec
    var curve = elliptic.curves['p256'];
    var ecdsa = new EC(curve);
    var signKey = ecdsa.keyFromPrivate(tCertSetRequest.enrollmentKey, 'hex');
    //debug(new Buffer(sha3_384(buf),'hex'));
    var sig = ecdsa.sign(new Buffer(sha3_256(buf), 'hex'), signKey);

    tCertCreateSetReq.setSig(new self.protos.Signature(
        {
            type: self.protos.CryptoType.ECDSA,
            r: new Buffer(sig.r.toString()),
            s: new Buffer(sig.s.toString())
        }
        ));

    //send the request
    this.tcapClient.createCertificateSet(tCertCreateSetReq, function (err, tCertCreateSetResp) {
        if (err) {
            debug('error:\n', err);

            if (callback) {
                callback(err, null);
            }
        }
        else {
            debug('tCertCreateSetResp:\n', tCertCreateSetResp);
            callback(null, tCertCreateSetResp.certs.key, tCertCreateSetResp.certs.certs);
        }

    })

};

//remote registerUser
setRemoting(OBCCAConnector.prototype.registerUser, {
    description: 'Register a new user with the Certificate Authority',
    accepts: [
        { arg: 'RegisterUserRequest', type: 'RegisterUserRequest', description: 'Unique user to register', https: { source: 'body' } }
    ],
    returns: { arg: 'RegisterUserResponse', type: 'RegisterUserResponse', root: true },
    https: { verb: 'post', path: '/registerUser' }
});

//helper function to expose remote functions for loopback datasource / models
function setRemoting(fn, options) {
    options = options || {};
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            fn[opt] = options[opt];
        }
    }
    fn.shared = true;
};

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return view;
};