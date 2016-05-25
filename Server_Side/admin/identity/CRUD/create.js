/*eslint-env node */

//var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');


function makeAccount(req, res)
{
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var user_id = map_ID.user_to_id(req.body.account);
	var user_pass = map_ID.get_password(req.body.participantType, req.body.account);
	
	console.log("ADMIN/IDENTITY", req.body.account, user_id, user_pass);
	
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
	
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			req.session.user = user_id;
			res.send({"message": "Successfully logged user in"});
		}
		else
		{
			res.status(400);
			res.send({"error":"Unable to log user in"});
		}
	});
}

exports.create = makeAccount;
