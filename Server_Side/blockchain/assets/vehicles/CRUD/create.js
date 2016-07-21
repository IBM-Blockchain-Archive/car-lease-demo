/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');

var user_id;
var counter = 0;

function create (req, res)
{
	tracing.create('ENTER', 'POST blockchain/assets/vehicles', req.body);
	createV5cID(req, res)
}

exports.create = create;

function createV5cID(req, res)
{
	
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	
	res.write(JSON.stringify({"message":"Generating V5cID"})+'&&')
	
	var numbers = "1234567890";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var v5cID = "";
	for(var i = 0; i < 7; i++)
	{
		v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
	}
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
	
	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Generated V5cID: "+v5cID);
	
	checkIfAlreadyExists(req, res, v5cID)

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}
	
	user_id = req.session.identity;
}

function checkIfAlreadyExists(req, res, v5cID)
{
	res.write(JSON.stringify({"message":"Checking V5cID is unique"})+'&&');
	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Checking V5cID is unique");

	var querySpec =				{
									  "jsonrpc": "2.0",
									  "method": "query",
									  "params": {
									    "type": 1,
									    "chaincodeID": {
									      "name": configFile.config.vehicle_name
									    },
									    "ctorMsg": {
									      "function": "get_vehicle_details",
									      "args": [
									       		v5cID
									      ]
									    },
									    "secureContext": user_id
									  },
									  "id": 123
								};
									
									
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: querySpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{	
		if (body.hasOwnProperty("error") && body.error.data.indexOf("Error retrieving v5c") > -1)
		{
			tracing.create('INFO', 'POST blockchain/assets/vehicles', "V5cID is unique");
			createVehicle(req, res, v5cID)
		}
		else if (response.statusCode == 200)
		{
			if(counter < 10){
				counter++
				setTimeout(function(){createV5cID(req, res);},3000);
			}
			else{
				counter = 0;
				var error = {}
				error.message = 'Timeout while checking v5cID is unique';
				error.error = true;
				error.v5cID = v5cID;
				tracing.create('ERROR', 'POST blockchain/assets/vehicles', error);
				res.end(JSON.stringify(error))
			}
			
		}
		else
		{
			
			counter = 0;
			res.status(400)
			var error = {}
			error.message = 'Unable to confirm v5cID is unique';
			error.error = true;
			error.v5cID = v5cID;
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', error);
		}
	})
}

function createVehicle(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Creating vehicle with v5cID: "+v5cID);
	res.write(JSON.stringify({"message":"Creating vehicle with v5cID: "+ v5cID})+'&&');
									
	var invokeSpec = {
						  "jsonrpc": "2.0",
						  "method": "invoke",
						  "params": {
						    "type": 1,
						    "chaincodeID": {
						      "name": configFile.config.vehicle_name
						    },
						    "ctorMsg": {
						      "function": "create_vehicle",
						      "args": [
						        v5cID
						      ]
						    },
						    "secureContext": user_id
						  },
						  "id": 123
					}								
	
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: invokeSpec,
						json: true
					}
					
	request(options, function(error, response, body){
				if (!error && response.statusCode == 200) {
			var result = {};
			result.message = "Achieving consensus"
			tracing.create('INFO', 'POST blockchain/assets/vehicles', "Achieving consensus");
			res.write(JSON.stringify(result) + "&&")
			confirmCreated(req, res, v5cID);
		}
		else
		{			
			res.status(400)
			var error = {}
			error.message = 'Unable to create vehicle';
			error.error = true;
			error.v5cID = v5cID;
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', error);
			res.end(JSON.stringify(error))
		}
	})
}

function confirmCreated(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');

	var querySpec =				{
									  "jsonrpc": "2.0",
									  "method": "query",
									  "params": {
									    "type": 1,
									    "chaincodeID": {
									      "name": configFile.config.vehicle_name
									    },
									    "ctorMsg": {
									      "function": "get_vehicle_details",
									      "args": [
									       		v5cID
									      ]
									    },
									    "secureContext": user_id
									  },
									  "id": 123
								};

	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: querySpec,
						json: true
					}
	counter = 0;
	var interval = setInterval(function(){
		if(counter < 15){				
			request(options, function(error, response, body){				
				if (!body.hasOwnProperty("error") && response.statusCode == 200) {
					var result = {}
					result.message = "Creation confirmed";
					result.v5cID = v5cID;
					clearInterval(interval);
					tracing.create('EXIT', 'POST blockchain/assets/vehicles', result);
					res.end(JSON.stringify(result))
				}
			})
			counter++
		}
		else
		{
			res.status(400)
			var error = {}
			error.error = true;
			error.message = 'Unable to confirm vehicle create. Request timed out.';
			error.v5cID = v5cID;
			res.end(JSON.stringify(error))
			clearInterval(interval);
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', error)
		}
	},2000)
}
