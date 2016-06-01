var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var vehicle_logs = require(__dirname+'/../../../../../vehicle_logs/vehicle_logs.js');

var update = function(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}		

	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', []);
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	
	var oldValue = req.body.oldValue;
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
						    "secureContext": req.session.user
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
	request(options, function(error, response, body)
	{
		
		console.log("Update colour response", body);
		
		if (!error && response.statusCode == 200)
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
			res.write('{"message":"Achieving Consensus"}&&');
			var counter = 0;
			var interval = setInterval(function(){
				if(counter < 15){
					request(options, function (error, response, body) {
						
						console.log("Update colour confirm response", body);
						
						if (!error && response.statusCode == 200) {
							if(JSON.parse(body).vehicle.colour == newValue)
							{
								var result = {};
								result.message = 'Colour updated'
								vehicle_logs.create(["Update", "Colour: " + oldValue + " →  " + req.body.value ,v5cID, req.session.user], req,res);
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
					tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Unable to update colour. v5cID: '+ v5cID)
					var error = {}
					error.error = true
					error.message = 'Unable to confirm colour update. Request timed out.'
					error.v5cID = v5cID;
					res.end(JSON.stringify(error))
					clearInterval(interval);
				}
			}, 2000)
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
