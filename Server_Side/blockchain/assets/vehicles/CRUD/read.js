/*eslint-env node*/

var request = require("request")
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js')


var user_id;

function getV5cIDs(req, res)
{
	
	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	user_id = req.session.user;
	
	tracing.create('ENTER', 'GET blockchain/assets/vehicles', []);
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	var ids = [];
									
									
	var querySpec = {
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
			var data = JSON.parse(body.result.message).vehicle_logs;

			if(typeof data != undefined)
			{
				for(var i = data.length-1; i > -1; i--)
				{
					if(data[i].name == "Create")
					{
						var v5cID = data[i].obj_id;
						ids.push(v5cID);
					}
				}
				if(ids.length > 0)
				{
					getV5cDetails(ids, 0, req, res)
				}
				else
				{
					res.end();
					tracing.create('EXIT', 'GET blockchain/assets/vehicles', '');
				}
			}
			else
			{
				res.status(400)
				var error = {}
				error.error = true;
				error.message = 'Unable to get blockchain assets';
				res.end(JSON.stringify(error))
				tracing.create('ERROR', 'GET blockchain/assets/vehicles', 'Unable to get blockchain assets');
			}
		}
		else
		{
			res.status(400)
			var error = {}
			error.error = true;
			error.message = 'Unable to get blockchain assets';
			res.end(JSON.stringify(error))
			tracing.create('ERROR', 'GET blockchain/assets/vehicles', 'Unable to get blockchain assets');
		}
	})
}

exports.read = getV5cIDs;

function getV5cDetails(ids, i, req, res)
{
	
	var querySpec = {
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
					        ids[i].toString()
					      ]
					    },
					    "secureContext": user_id
					  },
					  "id": 123
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
			var resp = JSON.parse(body.result.message);
			resp.v5cID = ids[i];
			res.write(JSON.stringify(resp)+'&&');
			if(i < ids.length -1)
			{
				getV5cDetails(ids, i+1, req, res);
			}
			else
			{
				res.end();
				tracing.create('EXIT', 'GET blockchain/assets/vehicles', 'Got '+(i+1)+' vehicles');
			}
		}
		else
		{
			console.log("VEHICLES READ ERROR", body.error)
			
			if(body.error.data.indexOf("Permission Denied") > -1)
			{
				if(i < ids.length -1)
				{
					getV5cDetails(ids, i+1, req, res);
				}
				else
				{
					res.end();
					tracing.create('EXIT', 'GET blockchain/assets/vehicles', 'Got '+(i+1)+' vehicles');
				}
			}
			else
			{
				res.status(400)
				var error = {}
				error.message = 'Unable to get v5c '+ids[i];
				res.end(JSON.stringify(error))
				tracing.create('ERROR', 'GET blockchain/assets/vehicles', 'Unable to get v5c '+ids[i]);
			}
		}
	})
}
