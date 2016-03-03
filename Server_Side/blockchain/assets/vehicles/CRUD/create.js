/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');

function createV5cID(req, res)
{
	
	res.write(JSON.stringify({"message":"Generating V5cID"})+'&&')
	
	var numbers = "1234567890";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var v5cID = "";
	for(var i = 0; i < 7; i++)
	{
		v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
	}
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
	
	checkIfAlreadyExists(req, res, v5cID)
} 

exports.create = createV5cID;

function checkIfAlreadyExists(req, res, v5cID)
{
	res.write(JSON.stringify({"message":"Checking V5cID is unique"})+'&&');
	
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_address
											},
											"ctorMsg": {
											  "function": "get_all",
											  "args": [req.session.user, v5cID]
											},
											"secureContext": req.session.user,
											"confidentialityLevel": "PUBLIC"
										}
									};
									
	var options = 	{
						url: configFile.config.api_url+'/devops/query',
						method: "POST", 
						body: chaincodeInvocationSpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			createV5cID(req, res)
		}
		else
		{
			tracing.create('ENTER', 'POST blockchain/assets/vehicles', []);
			createVehicle(req, res, v5cID)
		}
	})
}

function createVehicle(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	res.write(JSON.stringify({"message":"Creating vehicle with v5cID: "+ v5cID})+'&&');
	
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_address
											},
											"ctorMsg": {
												"function": "create_vehicle",
												"args": [
													req.session.user, v5cID
												]
											},
											"secureContext": req.session.user,
											"confidentialityLevel": "PUBLIC"
										}
									};
	
	var options = 	{
						url: configFile.config.api_url+'/devops/invoke',
						method: "POST", 
						body: chaincodeInvocationSpec,
						json: true
					}
					
	request(options, function(error, response, body){
		if (!error && response.statusCode == 200) {
			var result = {};
			result.message = "Confirming creation"
			res.write(JSON.stringify(result) + "&&")
			confirmCreated(req, res, v5cID);
		}
		else
		{
			res.status(400)
			var error = {}
			error.message = 'Unable to create vehicle';
			error.error = true;
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to create vehicle')
		}
	})
}

function confirmCreated(req, res, v5cID)
{
	
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	res.write(JSON.stringify({"message":"Creating vehicle with v5cID: "+ v5cID})+'&&');
	
	var chaincodeInvocationSpec =	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_address
											},
											"ctorMsg": {
											  "function": "get_all",
											  "args": [
												req.session.user, v5cID
											  ]
											},
											"secureContext": req.session.user,
											"confidentialityLevel": "PUBLIC"
										}
									};
	
	var options = 	{
						url: configFile.config.api_url+'/devops/query',
						method: "POST", 
						body: chaincodeInvocationSpec,
						json: true
					}
	var counter = 0;
	var interval = setInterval(function(){
		if(counter < 5){				
			request(options, function(error, response, body){
				if (!error && response.statusCode == 200) {
					var result = {}
					result.message = "Creation confirmed"
					result.v5cID = v5cID
					res.end(JSON.stringify(result))
					clearInterval(interval);
					tracing.create('EXIT', 'POST blockchain/assets/vehicles', JSON.stringify(result));
				}
				else
				{
					res.status(400)
					var error = {}
					error.error = true;
					error.message = 'Unable to connect to API URL';
					res.end(JSON.stringify(error))
					tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to connect to API URL')
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
			res.end(JSON.stringify(error))
			clearInterval(interval);
			tracing.create('ERROR', 'POST blockchain/assets/vehicles', 'Unable to confirm vehicle create. Request timed out.')
		}
	},1500)
}