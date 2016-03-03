/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');


function deploy(req, res)
{
	var chaincodeSpec = 	{
										"type": "GOLANG",
										"chaincodeID": {
											"path": "https://github.com/jpayne23/testDeployCC/Chaincode/vehicle_log_code"
										},
										"ctorMsg": {
											"function": "init",
											"args": ["0.0.1"]
										},
									  "secureContext": "DVLA",
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
			res.send(body.message);
		}
		else
		{
			res.status(400)
			res.send(error)
		}
	})
}

exports.create = deploy;

