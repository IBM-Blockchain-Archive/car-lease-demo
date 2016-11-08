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

let create = function()
{
    tracing.create('ENTER', 'Startup', {});

    let pem = null;

    let deployUser;
    // let registrar_name = configFile.config.registrar_name;
    // let registrar_password = configFile.config.registrar_password;
    chain = hfc.newChain(chainName);
    //This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
    chain.setKeyValStore(hfc.newFileKeyValStore(configFile.config.key_store_location));

    //TODO: Change this to be a boolean stating if ssl is enabled or disabled
    //Retrieve the certificate if grpcs is being used
    if(configFile.config.hfc_protocol === 'grpcs'){
        chain.setECDSAModeForGRPC(true);
        pem = fs.readFileSync(__dirname +'/../../../../'+configFile.config.certificate_file_name);
    }

    // if(process.env.VCAP_SERVICES){
    //     console.log('\n[!] looks like you are in bluemix, I am going to clear out the deploy_name so that it deploys new cc.');
    //     configFile.config.vehicle_name = '';
    //
    //     let servicesObject = JSON.parse(process.env.VCAP_SERVICES);

    // } else {
    chain.setMemberServicesUrl(configFile.config.hfc_protocol+'://'+configFile.config.ca_ip+':'+configFile.config.ca_port, {pem:pem});
    chain.addPeer(configFile.config.hfc_protocol+'://'+configFile.config.api_ip+':'+configFile.config.api_port_discovery, {pem:pem});
    chain.eventHubConnect(configFile.config.hfc_protocol+'://'+configFile.config.eventHubUrl+':'+configFile.config.eventHubPort);
    // }

    return enrollRegistrar()
    .then(function(registrar) {
        chain.setRegistrar(registrar);
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
    .then(function() {
        tracing.create('INFO', 'Startup', 'Complete.');

    })
    .catch(function(err) {
        console.log(err);
        tracing.create('ERROR', 'Startup', err);
    });
};

function enrollRegistrar() {
    return new Promise(function(resolve, reject) {
        chain.enroll('WebAppAdmin', 'DJY27pEnl16d', function(err, registrar) {
            if (!err) {
                tracing.create('INFO', 'Startup', 'Enrolled registrar');
                resolve(registrar);
            } else {
                tracing.create('ERROR', 'Startup', 'Failed to enroll registrar');
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
        let transactionContext = enrolledMember.deploy(deployRequest);
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
