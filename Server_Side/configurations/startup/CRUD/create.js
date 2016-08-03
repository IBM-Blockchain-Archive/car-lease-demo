/*eslint-env node */

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

var create = function()
{
	
	tracing.create('ENTER', 'Startup', {});

	chain = hfc.newChain("theBigMainChain");

	chain.setKeyValStore( hfc.newFileKeyValStore('/tmp/keyValStore') );
	chain.setECDSAModeForGRPC(true);

	var pem = fs.readFileSync(__dirname + '../../../../Chaincode/vehicle_code/certificate.pem');
	console.log("CREATION:: Finished reading certificate.  Connecting to membership services");

	chain.setMemberServicesUrl("grpcs://4a668f73-21a1-43fa-bce0-d42c8013e97f_ca.us.blockchain.ibm.com:30303", {pem:pem}); //HAVE ADDRESS IN CONFIG		//2aee5d0d-16c7-4e3e-9f8e-d18845452201_ca.us.blockchain.ibm.com:30303 	, {pem:pem, hostnameOverride:'tlsca'}

	chain.addPeer("grpcs://4a668f73-21a1-43fa-bce0-d42c8013e97f_ca.us.blockchain.ibm.com:30303", {pem:pem}); //HAVE ADDRESS IN CONFIG			//2aee5d0d-16c7-4e3e-9f8e-d18845452201_vp0.us.blockchain.ibm.com:30303	, {pem:pem, hostnameOverride:'tlsca'}

	chain.enroll("WebAppAdmin", "b0889222bb", function(err, webAppAdmin) {

		if (err) return console.log("ERROR: failed to register, %s",err);
		// Successfully enrolled WebAppAdmin during initialization.
		// Set this user as the chain's registrar which is authorized to register other users.
		chain.setRegistrar(webAppAdmin);

	});
	
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
		addUser()
	}
	else
	{
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		tracing.create('ERROR', 'Startup', error);
		return JSON.stringify(error)
	}
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
			if(counter < users.length - 1)
			{
				counter++;
				tracing.create('INFO', 'Startup', "Created and registered user:" + users[counter].identity);
				setTimeout(function(){addUser()}, 2000);
			}
			else
			{
				counter = 0;
				tracing.create('INFO', 'Startup', "Created and registered user:" + users[counter].identity);
				deploy_vehicle();
			}
			
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
	api_url = api_url.replace('http://', '')
	    
	var randomVal = crypto.randomBytes(256).toString('hex')
	
				
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
						      "args": [
						        api_url, randomVal
						      ]
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
		
		if (!body.hasOwnProperty('error') && response.statusCode == 200)
		{
			update_config(body.result.message)
			
			var interval = setInterval(function(){
				
				var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
						method: "GET",
						json: true
					}
					
				request(options, function(error, response, body){
					if(body.height >= 2){
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
		if (err) return cb(err);

		console.log("Registered user with secret:",secret)

		chain.getMember(username, function(err, member){
			
			member.setAccount("group1")
			member.setAffiliation(aff)
			member.setRoles([role])
			member.saveState()

			console.log("NEW USER", username , member)

			loginUser(username,aff,secret,cb)

		})
	});
	
	
}

function loginUser(username, aff, secret, cb)
{
	tracing.create('INFO', 'Startup', 'Attempting to register user "'+username+'" with CA');
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

		console.log("LOGIN RESPONSE BODY",body,"ERROR",error)		

		if (body && !body.hasOwnProperty("Error") && response.statusCode == 200)
		{
			innerCounter = 0;
			tracing.create('INFO', 'Startup', 'Registering user "'+username+'" with CA successful');
			writeUserToFile(username, secret,cb)
			return true
		}
		else
		{
			if(innerCounter >= 5){
				innerCounter = 0;
				tracing.create('ERROR', 'Startup', {"message": "Registering user \""+username+"\" with CA failed", "error": false});
				return cb("Registering user \""+username+"\" with CA failed")
			}
			else{
				innerCounter++
				tracing.create('INFO', 'Startup', 'Attempting to register user "'+username+'" with CA again');
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
