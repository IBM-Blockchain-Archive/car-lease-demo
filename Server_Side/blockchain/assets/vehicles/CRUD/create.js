/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var vehicle_logs = require(__dirname+'/../../../vehicle_logs/vehicle_logs.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');

var user_id;

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
	
	checkIfAlreadyExists(req, res, v5cID)

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	user_id = req.session.user;
} 

exports.create = createV5cID;

function checkIfAlreadyExists(req, res, v5cID)
{
	res.write(JSON.stringify({"message":"Checking V5cID is unique"})+'&&');

	console.log("VEHICLE CREATE INVOKE NAME", v5cID, configFile.config.vehicle_name);

	var querySpec =				{
									  "jsonrpc": "2.0",
									  "method": "query",
									  "params": {
									    "type": 1,
									    "chaincodeID": {
									      "name": configFile.config.vehicle_name
									    },
									    "ctorMsg": {
									      "function": "get_all",
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
		if (response.statusCode == 200 && body.error.data.indexOf("Error retrieving v5c") > -1)
		{
			tracing.create('ENTER', 'POST blockchain/assets/vehicles', []);
			createVehicle(req, res, v5cID)
		}
		else if (response.statusCode == 200)
		{
			createV5cID(req, res)
		}
		else
		{
			
			console.log(error);
			
			res.status(400)
			var error = {}
			error.message = 'Unable to confirm V5cID is unique';
			error.error = true;
			error.v5cID = v5cID;
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to confirm V5cID is unique')
		}
	})
}

function createVehicle(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
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
			result.message = "Achieving Consensus"
			res.write(JSON.stringify(result) + "&&")
			confirmCreated(req, res, v5cID);
		}
		else
		{
			console.log(error);
			
			res.status(400)
			var error = {}
			error.message = 'Unable to create vehicle';
			error.error = true;
			error.v5cID = v5cID;
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to create vehicle')
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
									      "function": "get_all",
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
	var counter = 0;
	var interval = setInterval(function(){
		if(counter < 5){				
			request(options, function(error, response, body){
				console.log("VEHICLE CREATE RESPONSE",body);
				if (!body.hasOwnProperty("error") && response.statusCode == 200) {
					
					console.log("VeHICLE CREATE CONFIRMED", v5cID)
					
					var result = {}
					result.message = "Creation confirmed";
					result.v5cID = v5cID;
					clearInterval(interval);
					vehicle_logs.create(["Create", "Create V5C", v5cID, user_id], req,res);
					tracing.create('EXIT', 'POST blockchain/assets/vehicles', JSON.stringify(result));
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
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to confirm vehicle create. Request timed out.')
		}
	},1500)
}
