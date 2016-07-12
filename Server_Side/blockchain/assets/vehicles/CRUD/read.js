/*eslint-env node*/

var request = require("request")
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js')


var user_id;

function get_all_cars(req, res)
{
	
	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	user_id = req.session.user;
	
	tracing.create('ENTER', 'GET blockchain/assets/vehicles', {});
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	var ids = [];
									
									
	var querySpec = {
					  "jsonrpc": "2.0",
					  "method": "query",
					  "params": {
					    "type": 1,
					    "chaincodeID": {
					      "name": configFile.config.vehicle_name
					    },
					    "ctorMsg": {
					      "function": "get_vehicles",
					      "args": []
					    },
					    "secureContext": user_id
					  },
					  "id": 111
					}
	
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: querySpec,
						json: true
					}
					
	request(options, function(error, response, body)
	{
		if (!body.hasOwnProperty("error") && response.statusCode == 200)
		{
			var data = JSON.parse(body.result.message);
			for(var i = 0; i < data.length; i++)
			{
				tracing.create('INFO', 'GET blockchain/assets/vehicles', JSON.stringify(data[i]));
				res.write(JSON.stringify(data[i])+'&&')
			}
			tracing.create('EXIT', 'GET blockchain/assets/vehicles', {});
			res.end()
		}
		else
		{
			res.status(400)
			var error = {}
			error.error = true;
			error.message = 'Unable to get blockchain assets';
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'GET blockchain/assets/vehicles', error);
		}
	})
}

exports.read = get_all_cars;
