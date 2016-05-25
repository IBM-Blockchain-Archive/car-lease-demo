/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var vehicle_logs = require(__dirname+'/../../../../../vehicle_logs/vehicle_logs.js');
var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

var user_id;
var new_user_name;

var update = function(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}	
	
	user_id = req.session.user;

	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	
	var newValue = req.body.value;
	var function_name = req.body.function_name;
	var v5cID = req.params.v5cID;
	
	console.log("VEHICLE OWNER UPDATE original owner", user_id, "new owner", newValue)
	
	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', []);
	res.write('{"message":"Formatting request"}&&');
	
	var invokeSpec = 	{
						  "jsonrpc": "2.0",
						  "method": "invoke",
						  "params": {
						    "type": 1,
						    "chaincodeID": {
						      "name": configFile.config.vehicle_name
						    },
						    "ctorMsg": {
						      "function": function_name.toString(),
						      "args": [
						        newValue, v5cID
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
	
	res.write('{"message":"Updating owner value"}&&');			
	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200) // if it appears to work run a query to check if the new owner can see the car
		{
			
			console.log("API URL:", configFile.config.app_url)
			
			var j = request.jar();
			var str = "user="+newValue;
			var cookie = request.cookie(str);
			var url = configFile.config.app_url +'/blockchain/assets/vehicles/'+v5cID+'/owner';
			j.setCookie(cookie, url);
			var options = {
				url: url,
				method: 'GET',
				jar: j
			}
			res.write('{"message":"Achieving Consensus"}&&');
			var counter = 0;
			var interval = setInterval(function(){
				if(counter < 5){
					request(options, function (error, response, body) {
						if (!error && response.statusCode == 200)
						{
							
							var vehicle = JSON.parse(body).vehicle;
							
							console.log("BODY", vehicle);
							var result = {};
							result.message = 'Owner updated'
							vehicle_logs.create(["Transfer", user_id + " →  " + req.body.value + "&&[" + vehicle.VIN +"]" + vehicle.make + " " + vehicle.model + ", " +vehicle.colour + ", " + vehicle.reg ,v5cID, user_id, req.body.value], req,res);
							tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', JSON.stringify(result));
							res.end(JSON.stringify(result))
							clearInterval(interval);
						}
					})
					counter++;
				}
				else
				{
					res.status(400)
					tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Unable to confirm owner update. Request timed out.')
					var error = {}
					error.error  = true;
					error.message = 'Unable to confirm owner update. Request timed out.';
					res.end(JSON.stringify(error))
					clearInterval(interval);
				}
			}, 1500)
		}
		else
		{
			res.status(400)
			var error = {}
			tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Unable to update owner. v5cID: '+ v5cID)
			error.message = 'Unable to update owner' 
			error.v5cID = v5cID;
			error.error = true;
			res.end(JSON.stringify(error))
		}
	})
}
exports.update = update;
