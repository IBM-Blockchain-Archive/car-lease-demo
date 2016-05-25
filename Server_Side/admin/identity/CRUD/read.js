/*eslint-env node*/

//var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var request = require("request")
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var read = function(req,res)
{
	tracing.create('ENTER', 'GET admin/identity', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var result = {};
	
	if(typeof req.session.user != 'undefined')
	{
		var options = 	{
					url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar/'+req.session.user.split(' ').join('_'),
					method: "GET"
				};
		
		request(options, function (error, response, body){
			if (!error && response.statusCode == 200) {
				res.send(JSON.parse('{"persona_id":"'+req.session.user+'"}'));
			}
			else
			{
				res.send(JSON.parse('{"persona_id":"undefined"}'))
			}
		});
	}
	else
	{
		res.send(JSON.parse('{"persona_id":"undefined"}'))
	}
}
exports.read = read;

