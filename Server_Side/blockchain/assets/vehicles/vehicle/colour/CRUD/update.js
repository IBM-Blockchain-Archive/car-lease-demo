var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

var user_id;

var update = function(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}		

	user_id = req.session.identity
	
	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', req.body);
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	
	var newValue = req.body.value;
	var v5cID = req.params.v5cID;
	
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
						      "function": "update_colour",
						      "args": [
						        newValue.toString(), v5cID
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
	
	res.write('{"message":"Updating colour value"}&&');
	tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Updating colour value');
	request(options, function(error, response, body)
	{
		if (!error && !body.hasOwnProperty("error") && response.statusCode == 200)
		{
			var j = request.jar();
			var str = "user="+req.session.user
			var cookie = request.cookie(str);
			var url = configFile.config.app_url + '/blockchain/assets/vehicles/'+v5cID+'/colour';
			j.setCookie(cookie, url);
			var options = {
				url: url,
				method: 'GET',
				jar: j
			}
			tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Achieving consensus');
			res.write('{"message":"Achieving consensus"}&&');
			var counter = 0;
			var interval = setInterval(function(){
				if(counter < 15){
					request(options, function (error, response, body) {
						
						if (!error && response.statusCode == 200) {
							if(JSON.parse(body).message == newValue)
							{
								var result = {};
								result.message = 'Colour updated'
								tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', result);
								res.end(JSON.stringify(result))
								clearInterval(interval);
							}
						}
					})
					counter++;
				}	
				else
				{
					res.status(400)
					var error = {}
					error.error = true
					error.message = 'Unable to confirm colour update. Request timed out.'
					error.v5cID = v5cID;
					tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', error)
					res.end(JSON.stringify(error))
					clearInterval(interval);
				}
			}, 4000)
		}
		else 
		{
			res.status(400)
			tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Unable to update colour. v5cID: '+ v5cID)
			var error = {}
			error.error = true
			error.message = 'Unable to update colour.'
			error.v5cID = v5cID;
			res.end(JSON.stringify(error))
		}
	})
}
exports.update = update;
