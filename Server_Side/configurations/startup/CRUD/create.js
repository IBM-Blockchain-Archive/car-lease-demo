<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> IBM-Blockchain-Archive/0.6
=======
>>>>>>> IBM-Blockchain-Archive/0.6
'use strict';

let configFile = require(__dirname+'/../../configuration.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let Util = require(__dirname+'/../../../tools/utils/util.js');
let fs = require('fs');

let hfc = require('hfc');

function connectToPeers(chain, peers, pem) {
    peers.forEach(function(peer, index) {
        chain.addPeer(configFile.config.hfcProtocol+'://'+peer.discovery_host+':'+peer.discovery_port, {pem:pem});
        console.log('peer'+index+': '+configFile.config.hfcProtocol+'://'+peer.discovery_host+':'+peer.discovery_port);
    });
}

exports.connectToPeers = connectToPeers;

function connectToCA(chain, ca, pem) {
    let membersrvc;
    for (let key in ca) {
        membersrvc = ca[key];
    }
    chain.setMemberServicesUrl(configFile.config.hfcProtocol+'://'+membersrvc.discovery_host+':'+membersrvc.discovery_port, {pem:pem});
    console.log('membersrvc: '+configFile.config.hfcProtocol+'://'+membersrvc.discovery_host+':'+membersrvc.discovery_port);
}

exports.connectToCA = connectToCA;

function connectToEventHub(chain, peer, pem) {
    chain.eventHubConnect(configFile.config.hfcProtocol+'://'+peer.event_host + ':' + peer.event_port, {pem: pem});
    console.log('eventhub: ' + configFile.config.hfcProtocol+'://'+peer.event_host + ':' + peer.event_port);
}

exports.connectToEventHub = connectToEventHub;

function enrollRegistrar(chain, username, secret) {
    return new Promise(function(resolve, reject) {
        chain.enroll(username, secret, function(err, registrar) {
            if (!err) {
                tracing.create('INFO', 'Startup', 'Enrolled registrar');
                resolve(registrar);
            } else {
                tracing.create('ERROR', 'Startup', 'Failed to enroll registrar with '+username + ' ' + secret);
                reject(err);
            }
        });
    });
}

exports.enrollRegistrar = enrollRegistrar;

function enrollUser(chain, user) {
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

function enrollUsers(chain, users, registrar) {

    let promises = [];
    users.forEach(function (user) {
        user.registrar = registrar;
        promises.push(enrollUser(chain, user));
    });
    return Promise.all(promises);
}

exports.enrollUsers = enrollUsers;

function deployChaincode(enrolledMember, chaincodePath, functionName, args, certPath) {
    return new Promise(function(resolve, reject) {
        let deployRequest = {
            fcn: functionName,
            args: args,
            chaincodePath: chaincodePath
        };
        deployRequest.certificatePath = certPath;

        let transactionContext = enrolledMember.deploy(deployRequest);

        transactionContext.on('submitted', function(result) {
            console.log('Attempted to deploy chaincode');
        });

        transactionContext.on('complete', function (result) {
            tracing.create('INFO', 'Chaincode deployed with chaincodeID ' + result.chaincodeID, '');
            fs.writeFileSync(__dirname + '/../../../../chaincode.txt', result.chaincodeID, 'utf8');
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

exports.deployChaincode = deployChaincode;

function pingChaincode(chain, securityContext) {
    return Util.queryChaincode(securityContext, 'ping', [])
    .then(function() {
        return true;
    })
    .catch(function(err) {
        console.log(err);
        return false;
    });
}

exports.pingChaincode = pingChaincode;
<<<<<<< HEAD
<<<<<<< HEAD
=======
/*eslint-env node */

//TO DO:
// -- Clean up vehicle chaincode and process for passing in users and eCert. Use JSON objects instead

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../configuration.js'),
	participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs');
var crypto = require('crypto');
var hfc = require('hfc');

var send_error = false;
var counter = 0;
var innerCounter = 0;
var error_number = 0;
var ecertCounter = 0;
var users = [];
var userEcert;
var userEcertHolder = [];
var chain;

var create = function()
{
	configFile = reload(__dirname+'/../../configuration.js');
	tracing.create('ENTER', 'Startup', {});

	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");

	tracing.create('INFO', 'Startup', 'Locating initial participants');

	//Build the array of JSON objects from participants_info.js to use for registering if they don't already exist and enrolling
	if(participants.participants_info.hasOwnProperty('regulators'))
	{
		var data = participants.participants_info;

		for(var key in data)
		{
			if(data.hasOwnProperty(key))
			{
				for(var i = 0; i < data[key].length; i++)
				{
					users.push({"type":key,"identity":data[key][i].identity, "password":data[key][i].password});
				}
			}
		}
	}
	else
	{
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		tracing.create('ERROR', 'Startup', error);
		
		return JSON.stringify(error)
	}
	//Load the array of peers in the blockchain network, by default we use the first peer in the array
	var api_ip = configFile.config.api_ip
	api_ip = api_ip[0].substring(api_ip.indexOf("://")+3);

	var pem = null	
	var registrar_name = configFile.config.registrar_name
	var registrar_password = configFile.config.registrar_password

	chain = hfc.newChain("theChain");
	//This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
	chain.setKeyValStore( hfc.newFileKeyValStore(configFile.config.key_store_location) );
	chain.setDeployWaitTime(60);

	//Retrieve the certificate if grpcs is being used
	if(configFile.config.hfc_protocol == 'grpcs'){
		chain.setECDSAModeForGRPC(true);
		pem = fs.readFileSync(__dirname +'/../../../../'+configFile.config.certificate_file_name);		
	}

	chain.setMemberServicesUrl(configFile.config.hfc_protocol+"://"+configFile.config.ca_ip+":"+configFile.config.ca_port, {pem:pem});
	chain.addPeer(configFile.config.hfc_protocol+"://"+api_ip+":"+configFile.config.api_port_discovery, {pem:pem});
	chain.enroll(registrar_name, registrar_password, function(err, registrar) {
		
		if (!err){
			// Successfully enrolled registrar and set this user as the chain's registrar which is authorized to register other users.
			tracing.create('INFO', 'Startup', 'Registrar enroll worked with user ' + registrar_name);
			chain.setRegistrar(registrar);
		} 
		else{
			tracing.create('INFO', 'Startup', 'Failed to register using HFC, user may have already been enrolled. '+err);
		}
		
		//Start the process of registering and enrolling the demo participants with the CA
		addUser()
	});
}

function addUser()
{
	var userAff = "00000";
	
	//mapping participant type to an integer which will be stored in the user's eCert as their affiliation. Dealerships and Leasees both map to the same affiliation as they are both seen as 'Private entities'
	switch (users[counter].type) {
			case "regulators": 
				userAff = "00001";
				break;
			case "manufacturers":
				userAff = "00002";
				break;
			case "dealerships":
				userAff = "00003";
				break;
			case "lease_companies":
				userAff = "00004";
				break;
			case "leasees":
				userAff = "00003";
				break;
			case "scrap_merchants":
				userAff = "00005";
				break;
	}

	var userSpec = {
		"enrollId": users[counter].identity,
		"enrollSecret": users[counter].password
	}

	//Initial check to see if the user is already registered with the CA
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
						method: "POST",
						body: userSpec,
						json: true
					}

	request(options, function(error, response, body)
	{	
	
		console.log("INITIAL LOGIN ATTEMPT", body)
	
		if(body && body.hasOwnProperty("OK"))	// Runs if user was already created will return ok if they exist with CA whether they are logged in or not
		{
			get_user_ecert(users[counter].identity, users[counter].password, function(err){

				if(!err){
					if(counter < users.length - 1)
					{
						counter++;
						tracing.create('INFO', 'Startup', "User already registered and enrolled:" + users[counter].identity);

						//want to get user ecert and add to userEcertHolder here
						setTimeout(function(){addUser()}, 2000);
					}
					else
					{
						counter = 0;
						tracing.create('INFO', 'Startup', "User already registered and enrolled:" + users[counter].identity);
						get_height(function(){deploy_vehicle()});
					}
				}
				else
				{
					var error = {}
					error.message = 'Unable to get user ecert: '+users[counter].identity;
					error.error = false;
					
					tracing.create('ERROR', 'Startup', error+" "+err);

					if(counter < users.length - 1)
					{
						counter++;
						setTimeout(function(){addUser()}, 500);
					}
					else
					{
						get_height(function(){deploy_vehicle()});
					}
				}
			})
		}
		else	// Runs if user hasn't been created yet
		{
			var result = createUser(users[counter].identity, 1, userAff, function(err){
				if (!err) {
					if(counter < users.length - 1)
					{
						counter++;
						tracing.create('INFO', 'Startup', "Created and registered user:" + users[counter].identity);
						setTimeout(function(){addUser();},1000);
					}
					else
					{
						counter = 0;
						tracing.create('INFO', 'Startup', "Created and registered user:" + users[counter].identity);
						get_height(function(){deploy_vehicle()});
					}
				}
				else
				{
					var error = {}
					error.message = 'Unable to register user: '+users[counter].identity;
					error.error = false;
					
					tracing.create('ERROR', 'Startup', error+" "+err);

					if(counter < users.length - 1)
					{
						counter++;
						setTimeout(function(){addUser()}, 500);
					}
					else
					{
						get_height(function(){deploy_vehicle()});
					}
				}
			})
		}
	})
}

function get_height(cb){
	
	tracing.create('INFO', 'Startup', 'Getting initial height of the blockchain');
	
	var interval = setInterval(function(){
		var options = 	{
			url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
			method: "GET",
			json: true
		}
			
		request(options, function(error, response, body){
			if(!error && body && body.height >= 1){
					error_number = 0;
					update_config("start_height",body.height)
					cb();
					clearInterval(interval)		
			}
			else{
				if(error_number > 5){
					error_number = 0;
					tracing.create('ERROR', 'Startup', {"message": "Couldn't get blockchain height", "error": false});
					clearInterval(interval)
				}
				error_number++
				tracing.create('INFO', 'Startup', 'Error, trying to get the blockchain height again');
			}
		});	
	}, 5000)
}

function deploy_vehicle() //Deploy vehicle chaincode
{
	configFile = reload(__dirname+'/../../configuration.js');
	tracing.create('INFO', 'Startup', 'Deploying vehicle chaincode');

	var api_url = configFile.config.api_ip+":"+configFile.config.api_port_internal

	//add check userEcertHolder has data in it

	console.log("UserEcertHolder",userEcertHolder.length)
	
	var deploySpec = {
						  "jsonrpc": "2.0",
						  "method": "deploy",
						  "params": {
						    "type": 1,
						    "chaincodeID": {
						      "path": configFile.config.vehicle
						    },
						    "ctorMsg": {
						      "function": "init",
						      "args": userEcertHolder
						    },
						    "secureContext": participants.participants_info.regulators[0].identity
						  },
						  "id": 12
						}

	var options = 	{
						url: configFile.config.api_ip+":"+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: deploySpec,
						json: true
					}

	request(options, function(error, response, body)
	{

		if (body && !body.hasOwnProperty('error') && response.statusCode == 200)
		{
			update_config("vehicle_name",body.result.message)
			
			var peers = configFile.config.peers
			var peerCounter = 0;
			
			console.log("Start height", configFile.config.start_height)
			
			var interval = setInterval(function(){
				var options = 	{
						url: peers[peerCounter]+':'+configFile.config.api_port_external+'/chain',
						method: "GET",
						json: true
					}
					
				request(options, function(error, response, body){
					if(body && body.height > parseInt(configFile.config.start_height)){
						if(peerCounter < peers.length-1){							
							tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on peer '+peers[peerCounter]);							
							peerCounter++										
						}
						else{
							tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed on all peers');
							clearInterval(interval)
						}
					}
				});	
			}, 5000)
		}
		else
		{
			tracing.create('ERROR', 'Startup', {"message":"Error deploying vehicle chaincode","body":body,"error":true});
			return JSON.stringify({"message":"Error deploying vehicle chaincode","body":body,"error":true})
		}
	})
}

var createCounter = 0;

function createUser(username, role, aff, cb)
{
	var registrationRequest = {
		enrollmentID: username,
		// Customize account & affiliation
		role: role,
		account: "group1",
		affiliation: aff
	};

	chain.register( registrationRequest, function(err, secret) {
		if (err) {
			if(createCounter < 5){
				createCounter++
				setTimeout(function(){createUser(username, role, aff, cb)}, 500);
			}
			else{
				createCounter = 0;
				return cb(err);
			}
		} else{

			chain.getMember(username, function(err, member){

				member.setAccount("group1")
				member.setAffiliation(aff)
				member.setRoles([role])
				member.saveState()

				loginUser(username,aff,secret,cb)
			})
		}
	});	
}

function loginUser(username, aff, secret, cb)
{
	configFile = reload(__dirname+'/../../configuration.js');
	tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA');

	var credentials = {
						  "enrollId": username,
						  "enrollSecret": secret
						}

	var options = 	{
				url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
				method: "POST", 
				body: credentials,
				json: true
			}

	request(options, function(error, response, body){		

		if (body && !body.hasOwnProperty("Error") && response.statusCode == 200)
		{
			innerCounter = 0;
			tracing.create('INFO', 'Startup', 'Enrolling user "'+username+'" with CA successful');

			get_user_ecert(username, secret, cb)
		}
		else
		{
			if(innerCounter > 5){
				innerCounter = 0;
				tracing.create('ERROR', 'Startup', {"message": "Enrolling user \""+username+"\" with CA failed", "error": false});

				return cb("Enroll user \""+username+"\" with CA failed")
			}
			else
			{
				innerCounter++
				tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA again');
				setTimeout(function(){loginUser(username, aff, secret,cb);},2000)	            
			}
		}
	});
}

function update_config(attr, name)
{
	tracing.create('INFO', 'Startup', 'Updating config file');
	configFile = reload(__dirname+'/../../configuration.js');

	fs.readFile(__dirname+'/../../configuration.js', 'utf8', function (err,data)
	{
		if (err)
		{
			tracing.create('ERROR', 'Startup', {"message": "Config file not found", "error": false});

			return false
		}
		
		var toMatch = "config."+attr+" = '"+ configFile.config[attr]+"';"
		var re = new RegExp(toMatch, "g")

		var result = data.replace(re, "config."+attr+" = '"+name+"';");

		fs.writeFileSync(__dirname+'/../../configuration.js', result, 'utf8', function (err)
		{
			if (err)
			{	
				tracing.create('ERROR', 'Startup', {"message": "Unable to update config file", "error": false});
				return false
			}
			else
			{
				
				tracing.create('INFO', 'Startup', {"message": "Config file updated", "error": false});
				configFile = reload(__dirname+'/../../configuration.js');
				return true
			}			
		});
	});
}

function get_user_ecert(user, secret, cb){

	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+user+'/ecert',
						method: "GET",
					}

	request(options, function(error, response, body){
		if(body && JSON.parse(body).hasOwnProperty("OK")){
			tracing.create('INFO', 'Startup', 'eCert for user '+user+': '+JSON.parse(body).OK);
			userEcertHolder.push(user,JSON.parse(body).OK)
			ecertCounter = 0;
			writeUserToFile(user,secret,cb)
		}
		else{
			if(ecertCounter > 5){
				tracing.create('INFO', 'Startup', 'Couldn\'t get eCert for user '+user);
				console.log("BAD ECERT REQUEST", body)
				ecertCounter = 0;
			}
			else{
				console.log("TRYING TO GET ECERT AGAIN")
				
				ecertCounter++
				setTimeout(function(){get_user_ecert(user,secret,cb);},2000)
			}
		}
	});
}

function writeUserToFile(username, secret,cb)
{
	tracing.create('INFO', 'Startup', 'Writing user "'+username+'" to file');
	participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');

	var userType = "";
	var userNumber = "";

	for(var k in participants.participants_info)
	{
		if (participants.participants_info.hasOwnProperty(k)) 
		{
			var data = participants.participants_info[k];

			for(var i = 0; i < data.length; i++)
			{
				if(data[i].identity == username)
				{
					userType = k;
					userNumber = i;

					break;
				}
			}
		}
	}

	var newData = participants.participants_info;
	newData[userType][userNumber].password = secret;

	var updatedFile = '/*eslint-env node*/\n\n\n\nvar participants_info = '+JSON.stringify(newData)+'\n\nexports.participants_info = participants_info;';

	fs.writeFileSync(__dirname+'/../../../blockchain/participants/participants_info.js', updatedFile);

	cb(null)
}

<<<<<<< HEAD
exports.create = create;
>>>>>>> IBM-Blockchain-Archive/0.5-final
=======
>>>>>>> IBM-Blockchain-Archive/0.6
=======
exports.create = create;
>>>>>>> IBM-Blockchain-Archive/0.5-final
=======
>>>>>>> IBM-Blockchain-Archive/0.6
