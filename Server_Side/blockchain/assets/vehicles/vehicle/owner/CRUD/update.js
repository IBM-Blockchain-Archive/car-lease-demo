/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

var user_id;
var new_user_name;

var update = function(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}		

	user_id = req.session.identity	
	
	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', req.body);

	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	
	var newValue = req.body.value;
	var function_name = req.body.function_name;
	var v5cID = req.params.v5cID;
	
	tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Formatting request');
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
	
	tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Updating owner value');
	res.write('{"message":"Updating owner value"}&&');			
	request(options, function(error, response, body)
	{
		
		if (!error && !body.hasOwnProperty("error") && response.statusCode == 200) // if it appears to work run a query to check if the new owner can see the car
		{
			var j = request.jar();
			var str = "user="+map_ID.id_to_user(newValue);
			var cookie = request.cookie(str);
			var url = configFile.config.app_url +'/blockchain/assets/vehicles/'+v5cID+'/owner';
			j.setCookie(cookie, url);
			var options = {
				url: url,
				method: 'GET',
				jar: j
			}
			
			tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Achieving Consensus');
			res.write('{"message":"Achieving Consensus"}&&');
			var counter = 0;
			var interval = setInterval(function(){
				if(counter < 15){
					request(options, function (error, response, body) {
						
						if (!error && response.statusCode == 200)
						{

							var result = {};
							result.message = 'Owner updated'
							tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', result);
							res.end(JSON.stringify(result))
							clearInterval(interval);
						}
					})
					counter++;
				}
				else
				{					
					res.status(400)
					var error = {}
					error.error  = true;
					error.message = 'Unable to confirm owner update. Request timed out.';
					tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error)
					res.end(JSON.stringify(error))
					clearInterval(interval);
				}
			}, 4000)
		}
		else
		{
			res.status(400)
			var error = {}
			error.message = 'Unable to update owner';
			error.v5cID = v5cID;
			error.error = true;
			tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error)
			res.end(JSON.stringify(error))
		}
	})
}
exports.update = update;
