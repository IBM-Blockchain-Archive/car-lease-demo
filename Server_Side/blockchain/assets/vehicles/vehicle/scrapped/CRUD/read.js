/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');

var read = function (req,res)
{	
	var v5cID = req.params.v5cID;
	
	tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', []);
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
	}
	
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
											  "name": configFile.config.vehicle_address
											},
											"ctorMsg": {
												"function": "get_all",
												"args": [ req.session.user, v5cID ]
											},
											"secureContext": req.session.user,
											"confidentialityLevel": "PUBLIC"
										}
									}
	
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
			var result = {}
			result.scrapped = body.OK.scrapped;
			tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', JSON.stringify(result));
			res.send(result)
		}
		else 
		{
			res.status(400)
			tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Unable to read scrap. v5cID: '+ v5cID)
			var error = {}
			error.message = 'Unable to read scrap'
			error.v5cID = v5cID;
			res.send(error)
		}
	});
}

exports.read = read;

