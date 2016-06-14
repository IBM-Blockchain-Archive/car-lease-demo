/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;

var reload = require('require-reload')(require),
    participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");

var send_error = false;
var counter = 0;
var users = [];

var create = function()
{
	
	console.log("Creating and registering users");
	
	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");
	
	if(participants.participants_info.hasOwnProperty('regulators'))
	{
		var data = participants.participants_info;
		
		for(var key in data)
		{
			if(data.hasOwnProperty(key))
			{
				for(var i = 0; i < data[key].length; i++)
				{
					users.push({"type":key,"identity":data[key][i].name});
				}
			}
		}
		addUser()
	}
	else
	{
		tracing.create('ERROR', 'GET blockchain/participants', 'Participants file not found');
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		return JSON.stringify(error)
	}
}

function addUser()
{
		
	var userAff;

	switch (users[counter].type) {
			case "regulators": 
				userAff = "Regulator";
				break;
			case "manufacturers":
				userAff = "Manufacturer";
				break;
			case "dealerships":
				userAff = "Dealership";
				break;
			case "lease_companies":
				userAff = "Lease Company";
				break;
			case "leasees":
				userAff = "Leasee";
				break;
			case "scrap_merchants":
				userAff = "Scrap Merchant";
				break;
	}

	var data = {};
	data.user = users[counter].identity;
	data.role = 1;
	data.aff = userAff;

	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+users[counter].identity,
						method: "GET", 
						json: true
					}
	
	request(options, function(error, response, body)
	{	
		if(body.hasOwnProperty("OK"))
		{
			if(counter < users.length - 1)
			{
				counter++;
				console.log("Created and registered user:",users[counter].identity);
				setTimeout(addUser(), 2000);
			}
			else
			{
				counter = 0;
				console.log("Created and registered user:",users[counter].identity);
				deploy_vehicle();
			}
			
		}
		else
		{
			
			var j = request.jar();
			var str = "user=DVLA";
			var cookie = request.cookie(str);
			var url = configFile.config.app_url + '/blockchain/participants';
			j.setCookie(cookie, url);
			options = {
				url: url,
				method: 'POST',
				json: data,
				jar: j
			}
		
			request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					if(counter < users.length - 1)
					{
						counter++;
						console.log("Created and registered user:",users[counter].identity);
						setTimeout(function(){addUser();},1000);
					}
					else
					{
						counter = 0;
						console.log("Created and registered user:",users[counter].identity);
						deploy_vehicle();
					}
				}
				else
				{
					
					console.log("LOGGING IN BIG ERROR", error)
					console.log("LOGGING IN BIG BODY", body)
					
					tracing.create('ERROR', 'POST admin/identity', 'Unable to log user in: '+users[counter].identity);
					var error = {}
					error.message = 'Unable to register user: '+users[counter].identity;
					error.error = false;
					console.log(JSON.stringify(error));
					if(counter < users.length - 1)
					{
						counter++;
						setTimeout(addUser(), 500);
					}
					else
					{
						deploy_vehicle();
					}
				}
			});
		}
	})
}

function deploy_vehicle()
{

	var j = request.jar();
	var str = "user=DVLA";
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/chaincode/vehicles';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		body: "",
		method: 'POST',
		jar: j
	};

	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200) 
		{
			counter = 0;
			console.log("Application startup complete")
			return JSON.stringify({"message":"Application startup complete"})
		}
		else
		{
			return JSON.stringify({"message":"Unable to deploy vehicle chaincode on application startup", "error": true})
		}
	});
}


exports.create = create;