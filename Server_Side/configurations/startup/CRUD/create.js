/*eslint-env node */


//TO DO:
// -- If user is already logged in, still get there eCert and add to userEcertHolder
// -- Add grpc protocol to config 
// -- Add cert location to config
// -- Add key store location to config

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
	
	var api_ip = configFile.config.api_ip
	api_ip = api_ip.substring(api_ip.indexOf("://")+3 );
	
	var registrar_name = configFile.config.registrar_name
	var registrar_password = configFile.config.registrar_password
	
	chain = hfc.newChain("theChain");
	chain.setKeyValStore( hfc.newFileKeyValStore('/tmp/keyValStore') );
	chain.setDeployWaitTime(60);
	chain.setECDSAModeForGRPC(true);

	var pem = fs.readFileSync('us.blockchain.ibm.com.cert');

	chain.setMemberServicesUrl("grpcs://"+configFile.config.ca_ip+":"+configFile.config.ca_port, {pem:pem});
	
	chain.addPeer("grpcs://"+api_ip+":"+configFile.config.api_port_discovery, {pem:pem});	
	
	chain.enroll(registrar_name, registrar_password, function(err, registrar) {

		if (err) return console.log("ERROR: failed to register, %s",err);
		// Successfully enrolled WebAppAdmin during initialization.
		// Set this user as the chain's registrar which is authorized to register other users.
		
		console.log("ENROLL WORKED", registrar_name, registrar_password)
		
		chain.setRegistrar(registrar);
		
		addUser()

	});
}

function addUser()
{
	var userAff = "00000";

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

	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
						method: "POST",
						body: userSpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{	
		
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
						deploy_vehicle();
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
						deploy_vehicle();
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
						deploy_vehicle();
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
						deploy_vehicle();
					}
				}

			})
		}
	})
	
}

function deploy_vehicle() //Deploy vehicle chaincode
{
	tracing.create('INFO', 'Startup', 'Deploying vehicle chaincode');
	var api_url = configFile.config.api_ip+":"+configFile.config.api_port_internal
	    
	var randomVal = crypto.randomBytes(256).toString('hex')
				
	//add check userEcertHolder has data in it
				
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
			update_config(body.result.message)
			
			var interval = setInterval(function(){
				
				var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
						method: "GET",
						json: true
					}
					
				request(options, function(error, response, body){
					if(body && body.height >= 2){
						tracing.create('INFO', 'Startup', 'Vehicle chaincode deployed');
						clearInterval(interval)
					}
				});	
			}, 2000)
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
			
		}

		chain.getMember(username, function(err, member){
			
		member.setAccount("group1")
		member.setAffiliation(aff)
		member.setRoles([role])
		member.saveState()

		loginUser(username,aff,secret,cb)

		})
	});	
}

function loginUser(username, aff, secret, cb)
{
	tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA');
	configFile = reload(__dirname+'/../../configuration.js');
	
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
			if(innerCounter >= 5){
				innerCounter = 0;
				tracing.create('ERROR', 'Startup', {"message": "Enrolling user \""+username+"\" with CA failed", "error": false});
				return cb("Enroll user \""+username+"\" with CA failed")
			}
			else{
				innerCounter++
				tracing.create('INFO', 'Startup', 'Attempting to enroll user "'+username+'" with CA again');
				setTimeout(function(){loginUser(username, aff, secret,cb);},2000)	            
			}
			
		}
	});
}

function update_config(name)
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

		var toMatch = "config.vehicle_name = '"+ configFile.config.vehicle_name+"';"
		var re = new RegExp(toMatch, "g")

		var result = data.replace(re, "config.vehicle_name = '"+name+"';");

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
				return true
			}			
		});
	});
}

var ecertCounter = 0;
function get_user_ecert(user, secret, cb){
	
	
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+user+'/ecert',
						method: "GET",
					}
			
	request(options, function(error, response, body){
		
		
		
		if(body && JSON.parse(body).hasOwnProperty("OK")){
			
			userEcertHolder.push(user)
			userEcertHolder.push(JSON.parse(body).OK)
			
			writeUserToFile(user,secret,cb)
			
		}
		else{
			if(ecertCounter > 5){
				console.log("BAD ECERT REQUEST", body)
				ecertCounter = 0;
			}
			else{
				ecertCounter++
				get_user_ecert(user,secret,cb)
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

exports.create = create;
