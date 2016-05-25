var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');

var user_id;

var read = function(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	user_id = req.session.user;
	
	tracing.create('ENTER', 'GET blockchain/vehicle_logs', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
									
	var invokeSpec = 				{
										"jsonrpc": "2.0",
										"method": "query",
										"params": {
										    "type": 1,
											"chaincodeID": {
												"name": configFile.config.vehicle_log_name
											},
											"ctorMsg": {
											  "function": "get_vehicle_logs",
											  "args": []
											},
											"secureContext": user_id,
										},
										"id": 123
									};
									
									
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: invokeSpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{
		
		if (!body.hasOwnProperty("error") && response.statusCode == 200)
		{ 
			var result = JSON.parse(body.result.message).vehicle_logs;
			for(var i = 0; i < result.length; i++)
			{
				result[i].v5c_ID = result[i].obj_id;
				delete result[i]['obj_id'];
			}
			tracing.create('EXIT', 'GET blockchain/vehicle_logs', JSON.stringify(result));
			res.send(result)
		}
		else 
		{
			res.status(400)
			tracing.create('ERROR', 'GET blockchain/vehicle_logs', 'Unable to get blockchain vehicle logs')
			var error = {}
			error.message = 'Unable to get blockchain vehicle logs';
			res.send(error)
		}
	});
}
exports.read = read;
