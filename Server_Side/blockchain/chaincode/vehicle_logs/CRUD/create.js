/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');


function deploy(req, res)
{
	
	console.log(configFile.credentials.users[0]["username"])
	
	var chaincodeSpec = 	{
										"type": "GOLANG",
										"chaincodeID": {
											"path": "https://github.com/jpayne23/Car-Lease-Demo/Chaincode/vehicle_log_code"
										},
										"ctorMsg": {
											"function": "init",
											"args": [""]
										},
									  "secureContext": configFile.credentials.users[0]["username"],
									  "confidentialityLevel": "PUBLIC"
									}
									
	var options = 	{
						url: configFile.config.api_url+'/devops/deploy',
						method: "POST", 
						body: chaincodeSpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			console.log(body.message)
			return response.statusCode
		}
		else
		{
			return error
		}
	})
}

exports.create = deploy;