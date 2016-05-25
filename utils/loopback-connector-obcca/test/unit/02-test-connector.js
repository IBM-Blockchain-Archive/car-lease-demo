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

var connector = require('../..');
var assert = require('assert');
var test = require('tape');

var OBCCAConnector = require('../..').OBCCAConnector;
var dataSource = {};


test('Test #initialize Method', function (t) {
    t.plan(1);

    var settings = {
        host: "localhost",
        port: 50051
    };
    dataSource.settings = settings;
    connector.initialize(dataSource);

    t.equal(dataSource.connector instanceof OBCCAConnector, true, 'should be instance of OBCCAConnector');


});


var testUser = {
    identity: "testUser" + Date.now(),
    role: 1,
    account: "bank_a",
    affiliation: "00001"
};

var registeredUser;

test('Register User', function (t) {
    t.plan(1);

    dataSource.connector.registerUser(testUser, function (err, response) {

        if (err) {
            t.fail('registerUser failed: ' + err);
        }
        else {
            registeredUser = response;
            t.pass('should return token');
        }

    });

});

test('Register Duplicate User', function (t) {
    t.plan(1);

    dataSource.connector.registerUser(testUser, function (err, token) {

        if (err) {
            t.pass('should not be able to register user twice');
        }
        else {
            t.fail('should not be able to register user twice');
        }

    });

});

test('Get ECA Root Certificate', function (t) {
    t.plan(1);

    dataSource.connector.getECACertificate(function (err,cert) {
        if (err)
        {
            t.fail('failed to retrieve ECA root certificate: ',err);
        }
        else
        {
            t.pass('retrieved ECA root certificate');
        }
        
    })

});

test('Get TCA Root Certificate', function (t) {
    t.plan(1);

    dataSource.connector.getTCACertificate(function (err,cert) {
        if (err)
        {
            t.fail('failed to retrieve TCA root certificate: ',err);
        }
        else
        {
            t.pass('retrieved TCA root certificate');
        }
        
    })

});

test('Get TLS Root Certificate', function (t) {
    t.plan(1);

    dataSource.connector.getTLSCertificate(function (err,cert) {
        if (err)
        {
            t.fail('failed to retrieve TLS root certificate: ',err);
        }
        else
        {
            t.pass('retrieved TLS root certificate');
        }
        
    })

});

test('Get Enrollment Certificate From ECA', function (t) {
    t.plan(1);

    dataSource.connector.getEnrollmentCertificateFromECA(
        { identity: registeredUser.identity, token: registeredUser.token },
        function (err, enrollKey, enrollCert, enrollChainKey) {
            if (err)
            {
                t.fail('failed to retrieve enrollment certficate:\n',err);
            }
            else
            {
                debug('enrollKey: ', enrollKey);
                registeredUser.enrollmentKey = enrollKey;
                t.pass('retrieved enrollment certficate');
            }
            
        })

});

test('Get Transaction Certificates Set From TCA', function (t) {

    t.plan(1);
    
    var count = 10;
    var tCertSetRequest =
        {
            identity: registeredUser.identity,
            enrollmentKey: registeredUser.enrollmentKey,
            num: count
        };

    dataSource.connector.tcaCreateCertificateSet(tCertSetRequest,
        function (err,key,certs) {
            if (err)
            {
                t.fail('failed to retrieve transaction certificate set:\n',err)
            }
            else
            {
                debug('TCert key: ',key);
                debug('TCert certs:\n',certs);
                certs.forEach(function(cert,index){
                    debug('cert %d : %s',index,cert.toString('hex'));
                })
                //make sure we received the right number of TCerts
                t.equal(certs.length,count,'retrieved transaction certificate set');
            }
            
        })



});



test('Loopback integration', function (t) {

    t.plan(2);


    var dsOptions = {
        connector: require("../.."),
        host: "localhost",
        port: 50051
    };

    var DataSource = require('loopback-datasource-juggler').DataSource;

    var ds = new DataSource(dsOptions);
    
    //get models
    var model1 = ds.getModel('RegisterUserRequest');

    if (model1) {
        t.pass('successfully registered RegisterUserRequest model');
    }
    else {
        t.fail('failed to register RegisterUserRequest model');
    };

    var model2 = ds.getModel('RegisterUserResponse');

    if (model2) {
        t.pass('successfully registered RegisterUserResponse model');
    }
    else {
        t.fail('failed to register RegisterUserResponse model');
    };


})

