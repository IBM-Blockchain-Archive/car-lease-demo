/*eslint-env node*/


var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');

var update = function(req, res)
{
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', []);
	var newValue = req.body.value.split(' ').join('_');
	var function_name = req.body.function_name;
	var v5cID = req.params.v5cID;
	
	res.write('{"message":"Formatting request"}&&');
	var chaincodeInvocationSpec = 	{
										"chaincodeSpec": {
											"type": "GOLANG",
											"chaincodeID": {
												"name": configFile.config.vehicle_address
											},
											"ctorMsg": {
												"function": function_name.toString(),
												"args": [ req.session.user, newValue.toString(), v5cID ]
											},
											"secureContext": req.session.user,
											"confidentialityLevel": "PUBLIC"
										}
									}

	var options = 	{
						url: configFile.config.api_url+'/devops/invoke',
						method: "POST", 
						body: chaincodeInvocationSpec,
						json: true
					}
	
	res.write('{"message":"Updating owner value"}&&');			
	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200) // if it appears to work run a query to check if the new owner can see the car
		{
			var j = request.jar();
			var str = "user="+newValue
			var cookie = request.cookie(str);
			var url = 'https://'+configFile.config.app_url+'/blockchain/assets/vehicles/'+v5cID+'/owner';
			j.setCookie(cookie, url);
			var options = {
				url: url,
				method: 'GET',
				jar: j
			}
			res.write('{"message":"Confirming update"}&&');
			var counter = 0;
			var interval = setInterval(function(){
				if(counter < 5){
					request(options, function (error, response, body) {
						if (!error && response.statusCode == 200)
						{
							var result = {};
							result.message = 'Owner updated'
							tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', JSON.stringify(result));
							res.end(JSON.stringify(result))
							clearInterval(interval);
						}
						else // new user can't read it so it can't be there
						{
							console.log(error)
							res.status(400)
							tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Unable to update owner. v5cID: '+ v5cID)
							var error = {}
							error.message = 'Unable to update owner'
							error.v5cID = v5cID;
							error.error = true;
							res.end(JSON.stringify(error))
							clearInterval(interval);
						}
					})
				}
				else
				{
					res.status(400)
					tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Unable to confirm owner update. Request timed out.')
					var error = {}
					error.message = 'Unable to confirm owner update. Request timed out.';
					res.end(JSON.stringify(error))
					clearInterval(interval);
				}
			}, 1500)
		}
		else
		{
			res.status(400)
			var error = {}
			tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Unable to update owner. v5cID: '+ v5cID)
			error.message = 'Unable to update owner' 
			error.v5cID = v5cID;
			error.error = true;
			res.end(JSON.stringify(error))
		}
	})
}
exports.update = update;