'use strict';

//TO DO: Clean up vehicle chaincode and process for passing in users and eCert. Use JSON objects instead

let request = require('request');
let configFile = require(__dirname+'/../../configuration.js'),
    participants = require(__dirname+'/../../../blockchain/participants/participants_info.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');

const SecurityContext = require(__dirname+'/../../../tools/security/securitycontext');

const path = require('path');
// let spawn = require('child_process').spawn;
let fs = require('fs');
// let crypto = require('crypto');
let hfc = require('hfc');

// let send_error = false;
let counter = 0;
let innerCounter = 0;
let error_number = 0;
let ecertCounter = 0;
let users = [];
// let userEcert;
let userEcertHolder = [];
let chain;
let usersToSecurityContext = {};

let create = function()
{
    tracing.create('ENTER', 'Startup', {});

    let pem = null;

    let deployUser;
    // let registrar_name = configFile.config.registrar_name;
    // let registrar_password = configFile.config.registrar_password;

    chain = hfc.newChain('theChain');
    //This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
    chain.setKeyValStore( hfc.newFileKeyValStore(configFile.config.key_store_location) );
    // chain.setDeployWaitTime(60);

    //TODO: Change this to be a boolean stating if ssl is enabled or disabled
    //Retrieve the certificate if grpcs is being used
    if(configFile.config.hfc_protocol === 'grpcs'){
        chain.setECDSAModeForGRPC(true);
        pem = fs.readFileSync(__dirname +'/../../../../'+configFile.config.certificate_file_name);
    }

    chain.setMemberServicesUrl(configFile.config.hfc_protocol+'://'+configFile.config.ca_ip+':'+configFile.config.ca_port, {pem:pem});
    chain.addPeer(configFile.config.hfc_protocol+'://'+configFile.config.api_ip+':'+configFile.config.api_port_discovery, {pem:pem});
    // chain.eventHubConnect(configFile.config.hfc_protocol+'://'+configFile.config.eventHubUrl+':'+configFile.config.eventHubPort);

    return enrollUsers()
    .then(function(users) {
        tracing.create('INFO', 'Startup', 'All users registered');
        users.forEach(function(user) {
            usersToSecurityContext[user.getName()] = new SecurityContext(user);
        });
        return users[0];
    })
    .then(function(user) {
        deployUser = user;
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
        return new Promise(function(resolve, reject) {
            if (chaincodeID) {
                let liveTx = deployUser.query({
                    args: [],
                    attrs: ['role'],
                    fcn: 'ping',
                    chaincodeID: chaincodeID
                });

                liveTx.on('error', function(err) {
                    tracing.create('INFO', 'Startup', 'Deploying chaincode again');
                    resolve(true);
                });

                liveTx.on('complete', function() {
                    tracing.create('INFO', 'Startup', 'Chaincode already deployed');
                    resolve(false);
                });
            } else {
                tracing.create('INFO', 'Startup', 'Deploying chaincode for the first time');
                resolve(true);
            }
        });
    })
    .then(function(pingRejected) {
        if (pingRejected) {
            return deployChaincode(deployUser, 'vehicle_code', 'Init', []);
        } else {
            return false;
        }
    })
    .then(function(deploy) {
        if (deploy) {
            fs.writeFile('/tmp/chaincode', deploy.chaincodeID, function(err) {
                if(err) {
                    console.log(err);
                }
            });
        }
        tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on all peers');

        return usersToSecurityContext;
    })
    .catch(function(err) {
        console.log(err);
    });
};

function enrollUsers() {
    let allParticipants = [].concat(
        participants.regulators,
        participants.manufacturers,
        participants.dealerships,
        participants.lease_companies,
        participants.leasees,
        participants.scrap_merchants);

    let promises = [];
    allParticipants.forEach(function (user) {
        promises.push(enrollUser(user));
    });
    return Promise.all(promises);
}

function enrollUser(user) {
    return new Promise(function(resolve, reject) {
        chain.enroll(user.identity, user.password, function(err, enrolledUser) {
            if (!err){
                // Successfully enrolled registrar and set this user as the chain's registrar which is authorized to register other users.
                tracing.create('INFO', 'Startup', 'Registrar enroll worked with user '+user.identity);
                resolve(enrolledUser);
            }
            else{
                tracing.create('INFO', 'Startup', 'Failed to enroll '+user.identity+' using HFC. Error: '+JSON.stringify(err));
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
/*
function addUser()
{
    let userAff = '00000';

    //mapping participant type to an integer which will be stored in the user's eCert as their affiliation. Dealerships and Leasees both map to the same affiliation as they are both seen as 'Private entities'
    switch (users[counter].type) {
    case 'regulators':
        userAff = '00001';
        break;
    case 'manufacturers':
        userAff = '00002';
        break;
    case 'dealerships':
        userAff = '00003';
        break;
    case 'lease_companies':
        userAff = '00004';
        break;
    case 'leasees':
        userAff = '00003';
        break;
    case 'scrap_merchants':
        userAff = '00005';
        break;
    }

    let userSpec = {
        'enrollId': users[counter].identity,
        'enrollSecret': users[counter].password
    };

    //Initial check to see if the user is already registered with the CA
    let options =     {
        url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
        method: 'POST',
        body: userSpec,
        json: true
    };

    request(options, function(error, response, body)
    {

        console.log('INITIAL LOGIN ATTEMPT', body);

        if(body && body.hasOwnProperty('OK'))    // Runs if user was already created will return ok if they exist with CA whether they are logged in or not
        {
            get_user_ecert(users[counter].identity, users[counter].password, function(err){

                if(!err){
                    if(counter < users.length - 1)
                    {
                        counter++;
                        tracing.create('INFO', 'Startup', 'User already registered and enrolled:' + users[counter].identity);

                        //want to get user ecert and add to userEcertHolder here
                        setTimeout(function(){addUser();}, 2000);
                    }
                    else
                    {
                        counter = 0;
                        tracing.create('INFO', 'Startup', 'User already registered and enrolled:' + users[counter].identity);
                        get_height(function(){deploy_vehicle();});
                    }
                }
                else
                {
                    let error = {};
                    error.message = 'Unable to get user ecert: '+users[counter].identity;
                    error.error = false;

                    tracing.create('ERROR', 'Startup', error+' '+err);

                    if(counter < users.length - 1)
                    {
                        counter++;
                        setTimeout(function(){addUser();}, 500);
                    }
                    else
                    {
                        get_height(function(){deploy_vehicle();});
                    }
                }
            });
        }
        else    // Runs if user hasn't been created yet
        {
            createUser(users[counter].identity, 1, userAff, function(err){
                if (!err) {
                    if(counter < users.length - 1)
                    {
                        counter++;
                        tracing.create('INFO', 'Startup', 'Created and registered user:' + users[counter].identity);
                        setTimeout(function(){addUser();},1000);
                    }
                    else
                    {
                        counter = 0;
                        tracing.create('INFO', 'Startup', 'Created and registered user:' + users[counter].identity);
                        get_height(function(){deploy_vehicle();});
                    }
                }
                else
                {
                    let error = {};
                    error.message = 'Unable to register user: '+users[counter].identity;
                    error.error = false;

                    tracing.create('ERROR', 'Startup', error+' '+err);

                    if(counter < users.length - 1)
                    {
                        counter++;
                        setTimeout(function(){addUser();}, 500);
                    }
                    else
                    {
                        get_height(function(){deploy_vehicle();});
                    }
                }
            });
        }
    });
}
*/


function get_height(cb){

    tracing.create('INFO', 'Startup', 'Getting initial height of the blockchain');

    let interval = setInterval(function(){
        let options =     {
            url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
            method: 'GET',
            json: true
        };

        request(options, function(error, response, body){
            if(!error && body && body.height >= 1){
                error_number = 0;
                cb();
                clearInterval(interval);
            }
            else{
                if(error_number > 5){
                    error_number = 0;
                    tracing.create('ERROR', 'Startup', {'message': 'Couldn\'t get blockchain height', 'error': false});
                    clearInterval(interval);
                }
                error_number++;
                tracing.create('INFO', 'Startup', 'Error, trying to get the blockchain height again');
            }
        });
    }, 5000);
}

/*
function deploy_vehicle() //Deploy vehicle chaincode
{
    configFile = reload(__dirname+'/../../configuration.js');
    tracing.create('INFO', 'Startup', 'Deploying vehicle chaincode');

    // let api_url = configFile.config.api_ip+':'+configFile.config.api_port_internal;

    //add check userEcertHolder has data in it

    console.log('UserEcertHolder',userEcertHolder.length);

    let deploySpec = {
        'jsonrpc': '2.0',
        'method': 'deploy',
        'params': {
            'type': 1,
            'chaincodeID': {
                'path': configFile.config.vehicle
            },
            'ctorMsg': {
                'function': 'init',
                'args': userEcertHolder
            },
            'secureContext': participants.participants_info.regulators[0].identity
        },
        'id': 12
    };

    let options =     {
        url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
        method: 'POST',
        body: deploySpec,
        json: true
    };

    request(options, function(error, response, body)
    {

        if (body && !body.hasOwnProperty('error') && response.statusCode === 200)
        {
            update_config('vehicle_name',body.result.message);

            let peers = configFile.config.peers;
            let peerCounter = 0;

            console.log('Start height', configFile.config.start_height);

            let interval = setInterval(function(){
                let options =     {
                    url: peers[peerCounter]+':'+configFile.config.api_port_external+'/chain',
                    method: 'GET',
                    json: true
                };

                request(options, function(error, response, body){
                    if(body && body.height > parseInt(configFile.config.start_height)){
                        if(peerCounter < peers.length-1){
                            tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on peer '+peers[peerCounter]);
                            peerCounter++;
                        }
                        else{
                            tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on all peers');
                            clearInterval(interval);
                        }
                    }
                });
            }, 5000);
        }
        else
        {
            tracing.create('ERROR', 'Startup', {'message':'Error deploying vehicle chaincode','body':body,'error':true});
            return JSON.stringify({'message':'Error deploying vehicle chaincode','body':body,'error':true});
        }
    });
}
*/

/*
let createCounter = 0;

function createUser(username, role, aff, cb)
{
    let registrationRequest = {
        enrollmentID: username,
        // Customize account & affiliation
        role: role,
        account: 'group1',
        affiliation: aff
    };

    chain.register( registrationRequest, function(err, secret) {
        if (err) {
            if(createCounter < 5){
                createCounter++;
                setTimeout(function(){createUser(username, role, aff, cb);}, 500);
            }
            else{
                createCounter = 0;
                return cb(err);
            }
        } else{

            chain.getMember(username, function(err, member){

                member.setAccount('group1');
                member.setAffiliation(aff);
                member.setRoles([role]);
                member.saveState();

                loginUser(username,aff,secret,cb);
            });
        }
    });
}
*/

/*
function loginUser(username, aff, secret, cb)
{
    configFile = reload(__dirname+'/../../configuration.js');
    tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA');

    let credentials = {
        'enrollId': username,
        'enrollSecret': secret
    };

    let options =     {
        url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
        method: 'POST',
        body: credentials,
        json: true
    };

    request(options, function(error, response, body){

        if (body && !body.hasOwnProperty('Error') && response.statusCode === 200)
        {
            innerCounter = 0;
            tracing.create('INFO', 'Startup', 'Enrolling user "'+username+'" with CA successful');

            get_user_ecert(username, secret, cb);
        }
        else
        {
            if(innerCounter > 5){
                innerCounter = 0;
                tracing.create('ERROR', 'Startup', {'message': 'Enrolling user "'+username+'" with CA failed', 'error': false});

                return cb('Enroll user "'+username+'" with CA failed');
            }
            else
            {
                innerCounter++;
                tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA again');
                setTimeout(function(){loginUser(username, aff, secret,cb);},2000);
            }
        }
    });
}
*/

/*
function update_config(attr, name)
{
    tracing.create('INFO', 'Startup', 'Updating config file');
    configFile = reload(__dirname+'/../../configuration.js');

    fs.readFile(__dirname+'/../../configuration.js', 'utf8', function (err,data)
    {
        if (err)
        {
            tracing.create('ERROR', 'Startup', {'message': 'Config file not found', 'error': false});

            return false;
        }

        let toMatch = 'config.'+attr+' = \''+ configFile.config[attr]+'\';';
        let re = new RegExp(toMatch, 'g');

        let result = data.replace(re, 'config.'+attr+' = \''+name+'\';');

        fs.writeFileSync(__dirname+'/../../configuration.js', result, 'utf8', function (err)
        {
            if (err)
            {
                tracing.create('ERROR', 'Startup', {'message': 'Unable to update config file', 'error': false});
                return false;
            }
            else
            {

                tracing.create('INFO', 'Startup', {'message': 'Config file updated', 'error': false});
                configFile = reload(__dirname+'/../../configuration.js');
                return true;
            }
        });
    });
}
*/

/*
function get_user_ecert(user, secret, cb){

    let options =     {
        url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+user+'/ecert',
        method: 'GET',
    };

    request(options, function(error, response, body){
        if(body && JSON.parse(body).hasOwnProperty('OK')){
            tracing.create('INFO', 'Startup', 'eCert for user '+user+': '+JSON.parse(body).OK);
            userEcertHolder.push(user,JSON.parse(body).OK);
            ecertCounter = 0;
            writeUserToFile(user,secret,cb);
        }
        else{
            if(ecertCounter > 5){
                tracing.create('INFO', 'Startup', 'Couldn\'t get eCert for user '+user);
                console.log('BAD ECERT REQUEST', body);
                ecertCounter = 0;
            }
            else{
                console.log('TRYING TO GET ECERT AGAIN');

                ecertCounter++;
                setTimeout(function(){get_user_ecert(user,secret,cb);},2000);
            }
        }
    });
}
*/

/*
function writeUserToFile(username, secret,cb)
{
    tracing.create('INFO', 'Startup', 'Writing user "'+username+'" to file');
    participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');

    let userType = '';
    let userNumber = '';

    for(let k in participants.participants_info)
    {
        if (participants.participants_info.hasOwnProperty(k))
        {
            let data = participants.participants_info[k];

            for(let i = 0; i < data.length; i++)
            {
                if(data[i].identity === username)
                {
                    userType = k;
                    userNumber = i;

                    break;
                }
            }
        }
    }

    let newData = participants.participants_info;
    newData[userType][userNumber].password = secret;

    let updatedFile = '\n\n\n\nvar participants_info = '+JSON.stringify(newData)+'\n\nexports.participants_info = participants_info;';

    fs.writeFileSync(__dirname+'/../../../blockchain/participants/participants_info.js', updatedFile);

    cb(null);
}
*/
exports.create = create;
