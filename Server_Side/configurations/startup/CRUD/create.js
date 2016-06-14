/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../configuration.js'),
	participants = reload(__dirname+'/../participants_info.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs');
var crypto = require('crypto');

var reload = require('require-reload')(require),
    participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");

var send_error = false;
var counter = 0;
var users = [];

var connectorInfo;

var create = function(dataSource)
{
	
	connectorInfo = dataSource
	
	console.log("Creating and registering users");
	
	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");
	
	if(participants.participants_info.hasOwnProperty('regulators'))
	{
		var data = participants.participants_info;
		
		for(var key in data)
		{
			if(data.hasOwnProperty(key))
			{
				for(var i = 0; i < data[key].length; i++)
				{
					users.push({"type":key,"identity":data[key][i].name});
				}
			}
		}
		addUser()
	}
	else
	{
		tracing.create('ERROR', 'GET blockchain/participants', 'Participants file not found');
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		return JSON.stringify({"message":"Participants information not found","error":true})
	}
}

function addUser()
{
		
	var userAff = "0000";

	switch (users[counter].type) {
			case "regulators": 
				userAff = "0001";
				break;
			case "manufacturers":
				userAff = "0002";
				break;
			case "dealerships":
				userAff = "0003";
				break;
			case "lease_companies":
				userAff = "0004";
				break;
			case "leasees":
				userAff = "0003";
				break;
			case "scrap_merchants":
				userAff = "0005";
				break;
	}

	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+users[counter].identity,
						method: "GET", 
						json: true
					}
	
	request(options, function(error, response, body)
	{	
		if(body.hasOwnProperty("OK"))
		{
			if(counter < users.length - 1)
			{
				counter++;
				console.log("Created and registered user:",users[counter].identity);
				setTimeout(addUser(), 2000);
			}
			else
			{
				counter = 0;
				console.log("Created and registered user:",users[counter].identity);
				deploy_vehicle();
			}
			
		}
		else
		{
			
			var result = createUser(users[counter].identity, 1, userAff)
			console.log("create user result",result)
			
			if (result) {
				if(counter < users.length - 1)
				{
					counter++;
					console.log("Created and registered user:",users[counter].identity);
					setTimeout(function(){addUser();},1000);
				}
				else
				{
					counter = 0;
					console.log("Created and registered user:",users[counter].identity);
					deploy_vehicle();
				}
			}
			else
			{
				
				console.log("LOGGING IN BIG ERROR")
				
				tracing.create('ERROR', 'POST admin/identity', 'Unable to log user in: '+users[counter].identity);
				var error = {}
				error.message = 'Unable to register user: '+users[counter].identity;
				error.error = false;
				console.log(JSON.stringify(error));
				if(counter < users.length - 1)
				{
					counter++;
					setTimeout(addUser(), 500);
				}
				else
				{
					deploy_vehicle();
				}
			}

		}
	})
}

function deploy_vehicle()
{

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
						    "secureContext": "DVLA"
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
		
		console.log("VEHICLE DEPLOY RESPONSE",body)
		
		if (!body.hasOwnProperty('error') && response.statusCode == 200)
		{
			
			console.log("Waiting 60s for chaincode to be deployed")
			setTimeout(function() {
				var result = update_config(body.result.message)
				console.log("Update config result",result)
				
				if(result){
					return JSON.stringify({"message":"Application startup complete","error":false})
				}
			}, 60000);
		}
		else
		{
			
			return JSON.stringify({"message":"Error deploying vehicle chaincode","body":body,"error":true})
		}
	})
}

function createUser(username, role, aff)
{
	
	var counter = 0;

	if (!connectorInfo.connector) {
		return false//JSON.stringify({"message":"Cannot register users before the CA connector is setup!", "error":true});
	}

	// Register the user on the CA
	var user = {
		"identity": username,
		"role": role,
		"account": "group1",
		"affiliation": aff
	}
	 
	connectorInfo.connector.registerUser(user, function (err, response) {
		if (err) {
			
			if(counter >= 5){
				counter = 0;
				console.error("RegisterUser failed:", username, JSON.stringify(err));
				return false
			}
			else{
				counter++
				console.log("Trying again", counter);
				setTimeout(function(){createUser(username,role,aff);},2000)	            
			}

		} else {
			
			counter = 0;
			
			console.log("RegisterUser succeeded:", JSON.stringify(response));
			// Send the response (username and secret) for logging user in 
			var creds = {
				id: response.identity,
				secret: response.token
			};
			loginUser(username, aff, creds.secret);
		}
	});	
}

function loginUser(username, aff, secret)
{
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
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
		if (!body.hasOwnProperty("Error") && response.statusCode == 200)
		{
			counter = 0;
			console.log("LOGIN SUCCESSFUL", username)
			return true
		}
		else
		{
			if(counter >= 5){
				counter = 0;
				return false
			}
			else{
				counter++
				console.log("Trying logging in again", counter);
				setTimeout(function(){loginUser(username, aff, secret);},2000)	            
			}
			
		}
	});
}

function update_config(name)
{

	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	fs.readFile(__dirname+'/../../../../configurations/configuration.js', 'utf8', function (err,data)
	{
		if (err)
		{
			return false
		}

		var toMatch = "config.vehicle_name = '"+ configFile.config.vehicle_name+"';"
		var re = new RegExp(toMatch, "g")

		var result = data.replace(re, "config.vehicle_name = '"+name+"';");

		fs.writeFile(__dirname+'/../../../../configurations/configuration.js', result, 'utf8', function (err)
		{
			if (err)
			{	
				return false;
			}
			else
			{
				return true
			}			
		});
	});
}

exports.create = create;