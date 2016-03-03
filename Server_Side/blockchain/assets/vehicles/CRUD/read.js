/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');

function getV5cIDs(req, res)
{

	tracing.create('ENTER', 'GET blockchain/assets/vehicles', []);
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	var ids = [];
	var chaincodeInvocationSpec =	 {
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
			var data = body.OK.logs
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
				//tracing.create('ERROR', 'GET blockchain/assets/vehicles', 'Unable to get blockchain assets');
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
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_address
											},
											"ctorMsg": {
											  "function": "get_all",
											  "args": [req.session.user, ids[i].toString()]
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
			var resp = body.OK;
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
			if(body.Error.indexOf("Permission Denied") > -1)
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
