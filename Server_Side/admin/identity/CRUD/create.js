/*eslint-env node */

//var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

var request = require('request');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
    


function makeAccount(req, res)
{
	tracing.create('ENTER', 'POST admin/identity', req.body);
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var user_id = req.body.account;
	var user_pass = map_ID.get_password(req.body.participantType, req.body.account);
	
	var enrollmentDetails = 	{
					  "enrollId": user_id,
					  "enrollSecret": user_pass
					};
	
	var options = {
		url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
		body: enrollmentDetails,
		json:true,
		method: "POST"
	};
	tracing.create('INFO', 'POST admin/identity', "Calling /registrar endpoint");
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			req.session.user = user_id;
			tracing.create('EXIT', 'POST admin/identity', {"message": "Successfully logged user in"});
			res.send({"message": "Successfully logged user in"});
		}
		else
		{
			res.status(400);
			tracing.create('ERROR', 'POST admin/identity', {"message":"Unable to log user in", "error": true});
			res.send({"message":"Unable to log user in", "error": true});
		}
	});
}

exports.create = makeAccount;