/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../configuration.js'),
	participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs');
var crypto = require('crypto');

var send_error = false;
var counter = 0;
var innerCounter = 0;
var users = [];

//var connectorInfo;

var create = function() //dataSource was passed as a parameter. NOT ANYMORE
{
	
	tracing.create('ENTER', 'Startup', {});
	
	//connectorInfo = dataSource
	
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

		if(body.hasOwnProperty("OK"))	// Runs if user was already created will return ok if they exist with CA whether they are logged in or not
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
			
			
			//var result = createUser(users[counter].identity, 1, userAff) //Runs the connector to produce the user
			/*
			if (result) {
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
			*/
				var error = {}
				error.message = 'Unable to register user: '+users[counter].identity;
				error.error = false;
				tracing.create('ERROR', 'Startup', error);
				if(counter < users.length - 1)
				{
					counter++;
					setTimeout(function(){addUser()}, 500);
				}
				else
				{
					deploy_vehicle();
				}
			//}

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

function createUser(username, role, aff)
{
	/*
	if (!connectorInfo.connector) {
		tracing.create('ERROR', 'Startup', {"message":"Cannot register users before the CA connector is setup!", "error":true})
		return JSON.stringify({"message":"Cannot register users before the CA connector is setup!", "error":true});
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
			
			if(innerCounter >= 5){
				innerCounter = 0;
				tracing.create('ERROR', 'Startup', {"message": "Create user \""+username+"\" failed", "error": false});
			}
			else{
				innerCounter++
				tracing.create('INFO', 'Startup', 'Attempting to create user "'+username+'" again');
				setTimeout(function(){createUser(username,role,aff);},2000)	            
			}

		} else {
			
			innerCounter = 0;
			
			tracing.create('ERROR', 'Startup', {"message": "Create user \""+username+"\" succeeded", "error": false});
			// Send the response (username and secret) for logging user in 
			var creds = {
				id: response.identity,
				secret: response.token
			};
			loginUser(username, aff, creds.secret);
			
			return
			
		}
	});*/	
}

function loginUser(username, aff, secret)
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
		if (!body.hasOwnProperty("Error") && response.statusCode == 200)
		{
			innerCounter = 0;
			tracing.create('INFO', 'Startup', 'Registering user "'+username+'" with CA successful');
			writeUserToFile(username, secret)
			return true
		}
		else
		{
			if(innerCounter >= 5){
				innerCounter = 0;
				tracing.create('ERROR', 'Startup', {"message": "Registering user \""+username+"\" with CA failed", "error": false});
				return false
			}
			else{
				innerCounter++
				tracing.create('INFO', 'Startup', 'Attempting to register user "'+username+'" with CA again');
				setTimeout(function(){loginUser(username, aff, secret);},2000)	            
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


function writeUserToFile(username, secret)
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
	
	var updatedFile = '/*eslint-env node*/\n\nvar user_info = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["users"];\n\nvar participants_info = '+JSON.stringify(newData)+'\n\nexports.participants_info = participants_info;';
	
	fs.writeFileSync(__dirname+'/../../../blockchain/participants/participants_info.js', updatedFile);
}

exports.create = create;
