/*eslint-env node*/
var fs = require('fs');
var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var crypto = require('crypto');


function deploy(req, res)
{
	
	tracing.create('ENTER', 'POST blockchain/chaincode/vehicles', {})
	
	var api_url = configFile.config.api_ip+":"+configFile.config.api_port_internal
	    api_url = api_url.replace('http://', '')
	    
    var randomVal = crypto.randomBytes(256).toString('hex')
				
	
				
				
	var deploySpec = {
						  "jsonrpc": "2.0",
						  "method": "deploy",
						  "params": {
						    "type": 1,
						    "chaincodeID": {
						      "path": configFile.config.vehicle
						    },
						    "ctorMsg": {
						      "function": "init",
						      "args": [
						        api_url, randomVal
						      ]
						    },
						    "secureContext": "DVLA"
						  },
						  "id": 12
						}
									
	var options = 	{
						url: configFile.config.api_ip+":"+configFile.config.api_port_external+'/chaincode',
						method: "POST", 
						body: deploySpec,
						json: true
					}
	
	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			
			setTimeout(function() {
				tracing.create('INFO', 'POST blockchain/chaincode/vehicles', 'Chaincode deployed. Writing to config.')
				update_config(body.result.message, res)
			}, 60000);
		}
		else
		{
			res.status(400)
			var error = {}
			error.message = "Unable to deploy chaincode"
			error.error = true
			res.send(error)
		}
	})
}

function update_config(name, res)
{

	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	fs.readFile(__dirname+'/../../../../configurations/configuration.js', 'utf8', function (err,data)
	{
		if (err)
		{
			return console.log(err);
		}

		var toMatch = "config.vehicle_name = '"+ configFile.config.vehicle_name+"';"
		var re = new RegExp(toMatch, "g")

		var result = data.replace(re, "config.vehicle_name = '"+name+"';");

		fs.writeFile(__dirname+'/../../../../configurations/configuration.js', result, 'utf8', function (err)
		{
			if (err)
			{	
				res.status(400)
				var error = {}
				error.message = "Unable to write chaincode deploy name to configuration file"
				error.error = true;
				tracing.create('ERROR', 'POST blockchain/chaincode/vehicles', error)
				res.send(error)
			}
			else
			{
				tracing.create('EXIT', 'POST blockchain/chaincode/vehicles', {"message":name})
				res.send({"message":name})
			}			
		});
	});
}

exports.create = deploy;

