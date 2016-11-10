'use strict';

//TO DO: Clean up vehicle chaincode and process for passing in users and eCert. Use JSON objects instead

let configFile = require(__dirname+'/../../configuration.js'),
    participants = require(__dirname+'/../../../blockchain/participants/participants_info.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');

const SecurityContext = require(__dirname+'/../../../tools/security/securitycontext');

const path = require('path');
let fs = require('fs');
let hfc = require('hfc');

let chainName = 'theChain';
let chain;
let usersToSecurityContext = {};

let registrarName = configFile.config.registrar_name;
let registrarPassword = configFile.config.registrar_password;

let vcapServices;
if (process.env.VCAP_SERVICES) {
    console.log('\n[!] VCAP_SERVICES detected');
    vcapServices = JSON.parse(process.env.VCAP_SERVICES)['ibm-blockchain-5-staging'][0].credentials;

    let users = vcapServices.users;
    users.forEach(function(user) {
        if (user.enrollId === 'WebAppAdmin') {
            registrarPassword = user.enrollSecret;
        }
    });
}

//TODO: Add bluemix error handling
//TODO: Seperate this into other smaller promises to handle errors more neatly
let create = function()
{
    tracing.create('ENTER', 'Startup', {});

    let pem = null;

    let deployUser;

    chain = hfc.newChain(chainName);
    //This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
    chain.setKeyValStore(hfc.newFileKeyValStore(configFile.config.key_store_location));
    chain.setDeployWaitTime(100);

    //TODO: Change this to be a boolean stating if ssl is enabled or disabled
    //Retrieve the certificate if grpcs is being used
    if(configFile.config.hfc_protocol === 'grpcs'){
        // chain.setECDSAModeForGRPC(true);
        pem = fs.readFileSync(__dirname+'/../../../../Chaincode/src/vehicle_code/'+configFile.config.certificate_file_name, 'utf8');
    }

    if(vcapServices || configFile.config.fabric){
        // Will be using bluemix in some respect..
        registrarPassword = configFile.config.bluemix_registrar_password;
        if (!pem) {
            console.log('\n[!] no certificate has been included');
        }

        configFile.config.vehicle_name = '';

        let peers;
        let membersrvc;

        if (vcapServices) { // Are we in bluemix?

            console.log('\n[!] looks like you are in bluemix');
            peers = vcapServices.peers;
            for (let key in vcapServices.ca) {
                membersrvc = vcapServices.ca[key];
            }
        } else {
            console.log('\n[!] looks like you are connecting to bluemix');
            peers = configFile.config.fabric.peers;
            for (let key in configFile.config.fabric.ca) {
                membersrvc = configFile.config.fabric.ca[key];
            }
        }

        chain.setMemberServicesUrl(configFile.config.hfc_protocol+'://'+membersrvc.discovery_host+':'+membersrvc.discovery_port, {pem:pem});
        console.log('membersrvc: '+configFile.config.hfc_protocol+'://'+membersrvc.discovery_host+':'+membersrvc.discovery_port);

        peers.forEach(function(peer, index) {
            chain.addPeer(configFile.config.hfc_protocol+'://'+peer.discovery_host+':'+peer.discovery_port, {pem:pem});
            console.log('peer'+index+': '+configFile.config.hfc_protocol+'://'+peer.discovery_host+':'+peer.discovery_port);
        });

        configFile.config.api_ip = peers[0].discovery_host;
        configFile.config.api_port_external = peers[0].discovery_port;
    } else {
        console.log('\n[!] looks like you are not using bluemix');

        chain.setMemberServicesUrl(configFile.config.hfc_protocol+'://'+configFile.config.ca_ip+':'+configFile.config.ca_port);
        chain.addPeer(configFile.config.hfc_protocol+'://'+configFile.config.api_ip+':'+configFile.config.api_port_discovery);
        chain.eventHubConnect(configFile.config.hfc_protocol+'://'+configFile.config.eventHubUrl+':'+configFile.config.eventHubPort);
    }

    return enrollRegistrar()
    .then(function(registrar) {
        chain.setRegistrar(registrar);
        tracing.create('INFO', 'Startup', 'Set registrar');
        return enrollUsers(registrar);
    })
    .then(function(users) {
        tracing.create('INFO', 'Startup', 'All users registered');
        users.forEach(function(user) {
            usersToSecurityContext[user.getName()] = new SecurityContext(user);
        });
    })
    .then(function() {
        return new Promise(function(resolve, reject) {
            fs.readFile('/tmp/chaincode', 'utf8', function(err, contents) {
                if (err) {
                    resolve(false);
                } else {
                    resolve(contents);
                }
            });
        });
    })
    .then(function(chaincodeID) {
        deployUser = chain.getRegistrar();
        // Checks if the chaincode has already been deployed
        return new Promise(function(resolve, reject) {
            if (chaincodeID) {
                let liveTx = deployUser.query({
                    args: [],
                    attrs: ['role', 'username'],
                    fcn: 'ping',
                    chaincodeID: chaincodeID
                });
                configFile.vehicle_name = chaincodeID;

                liveTx.on('error', function(err) {
                    tracing.create('INFO', 'Startup', 'Deploying chaincode again');
                    resolve('');
                });

                liveTx.on('complete', function() {
                    tracing.create('INFO', 'Startup', 'Chaincode already deployed');
                    resolve(chaincodeID);
                });
            } else {
                tracing.create('INFO', 'Startup', 'Deploying chaincode for the first time');
                resolve('');
            }
        });
    })
    .then(function(chaincodeID) {
        if (!chaincodeID) {
            return deployChaincode(deployUser, 'vehicle_code', 'Init', []);
        } else {
            return chaincodeID;
        }
    })
    .then(function(deploy) {
        let chaincodeID;
        if (typeof deploy === 'string') {
            chaincodeID = deploy;
        } else {
            chaincodeID = deploy.chaincodeID;
        }

        fs.writeFile('/tmp/chaincode', chaincodeID, function(err) {
            if(err) {
                console.log(err);
            }
        });

        tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on all peers');

        for (let user in usersToSecurityContext) {
            usersToSecurityContext[user].setChaincodeID(chaincodeID);
        }

        return usersToSecurityContext;
    })
    .catch(function(err) {
        console.log(err);
        tracing.create('ERROR', 'Startup', err);
    });
};

function enrollRegistrar() {
    tracing.create('INFO', 'Startup', 'Attempting to enroll registrar');
    return new Promise(function(resolve, reject) {
        chain.enroll(registrarName, registrarPassword, function(err, registrar) {
            if (!err) {
                tracing.create('INFO', 'Startup', 'Enrolled registrar');
                resolve(registrar);
            } else {

                tracing.create('ERROR', 'Startup', 'Failed to enroll registrar with '+registrarName + ' ' + registrarPassword);
                reject(err);
            }
        });
    });
}

function enrollUsers(registrar) {
    // let allParticipants = [].concat(
    //     participants.regulators,
    //     participants.manufacturers,
    //     participants.dealerships,
    //     participants.lease_companies,
    //     participants.leasees,
    //     participants.scrap_merchants);
    let allParticipants = configFile.config.users;

    let promises = [];
    allParticipants.forEach(function (user) {
        user.registrar = registrar;
        promises.push(enrollUser(user));
    });
    return Promise.all(promises);
}

function enrollUser(user) {
    // let registrationRequest = {
    //     affiliation: 'institution_a',
    //     attributes: {}
    // };
    return new Promise(function(resolve, reject) {
        chain.registerAndEnroll(user, function(err, enrolledUser) {
            if (!err){
                        // Successfully enrolled registrar and set this user as the chain's registrar which is authorized to register other users.
                tracing.create('INFO', 'Startup', 'Registrar enroll worked with user '+user.enrollmentID);
                resolve(enrolledUser);
            }
            else{
                tracing.create('INFO', 'Startup', 'Failed to enroll '+user.enrollmentID+' using HFC. Error: '+JSON.stringify(err));
                reject(err);
            }
        });
    });
}

function deployChaincode(enrolledMember, chaincodePath, functionName, args) {
    return new Promise(function(resolve, reject) {
        process.env.GOPATH = path.resolve(__dirname, '..', '..', '..', '..', 'Chaincode');
        let deployRequest = {
            fcn: functionName,
            args: args,
            chaincodePath: chaincodePath
        };

        if (vcapServices) {
            deployRequest.certificatePath = vcapServices.cert_path;
        } else if (configFile.config.fabric) {
            deployRequest.certificatePath = '/certs/peer/cert.pem';
        }

        console.log('deploy request: ', deployRequest);

        let transactionContext = enrolledMember.deploy(deployRequest);

        transactionContext.on('submitted', function() {
            console.log('attempted to deploy chaincode');
        });

        transactionContext.on('complete', function (result) {
            resolve(result);
        });
        transactionContext.on('error', function (error) {
            if (error instanceof hfc.EventTransactionError) {
                reject(new Error(error.msg));
            } else {
                reject(error);
            }
        });
    });
}
exports.create = create;
