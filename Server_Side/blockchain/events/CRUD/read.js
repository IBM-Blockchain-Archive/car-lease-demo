/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');


var read = function(req, res)
{
	tracing.create('ENTER', 'GET blockchain/events', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var user_info;
	var user_info_array;
	var temp_text ="";
	
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_log_address
											},
											"ctorMsg": {
											  "function": "get_logs",
											  "args": [req.session.user]
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
			var result = body.OK.logs;
			for(var i = 0; i < result.length; i++)
			{
				temp_text = "";
				
				if(result[i].name == "Transfer")
				{
					user_info = result[i].text.substring(0,result[i].text.indexOf("&&"))
				
					user_info_array = user_info.split(" → ");
					
					for(var j = 0; j < user_info_array.length; j++)
					{
						user_info_array[j] = map_ID.id_to_user(user_info_array[j]);
						
						temp_text += user_info_array[j] + " → ";
					}

					temp_text = temp_text.substring(0,temp_text.length-3);
					
					result[i].text = temp_text+"&&"+result[i].text.substring(result[i].text.indexOf("&&")+2);
				}
				else
				{
					result[i].users[0] = map_ID.id_to_user(result[i].users[0]);
				}
				
				result[i].v5c_ID = result[i].obj_id;
				delete result[i]['obj_id'];
			}
			tracing.create('EXIT', 'GET blockchain/events', JSON.stringify(result));
			res.send(result)
		}
		else 
		{
			res.status(400)
			tracing.create('ERROR', 'GET blockchain/events', 'Unable to get blockchain events')
			var error = {};
			error.message = 'Unable to get blockchain events';
			res.send(error)
		}
	});
}

exports.read = read;