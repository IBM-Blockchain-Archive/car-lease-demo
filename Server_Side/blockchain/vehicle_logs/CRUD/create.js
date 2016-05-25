/*eslint-env node */


var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');

var user_id;

var create = function(args, req, res)
{
	
	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	user_id = req.session.user;
	
	var formattedTimestamp = getTimestamp();

	args.splice(3,0,formattedTimestamp); 

	tracing.create('ENTER', 'GET blockchain/vehicle_logs', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
									
	var invokeSpec = 				{
										"jsonrpc": "2.0",
										"method": "invoke",
										"params": {
										    "type": 1,
											"chaincodeID": {
												"name": configFile.config.vehicle_log_name
											},
											"ctorMsg": {
											  "function": "create_vehicle_log",
											  "args": args
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
		if (!error && response.statusCode == 200)
		{ 
			return;
		}
		else 
		{
			tracing.create('ERROR', 'POST blockchain/vehicle_logs', 'Unable to create vehicle log')
			var error = {}
			error.message = 'Unable to create vehicle log';
			return;
		}
	})
}

function getTimestamp(){

	var now = new Date();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();

	if( now.getMinutes() < 10){
		minutes = "0"+now.getMinutes();
	}

	if( now.getSeconds() < 10){
		seconds = "0"+now.getSeconds();
	}

	return now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear()+" "+now.getHours()+":"+minutes+":"+seconds;

} 

exports.create = create;