/*var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var client = require('swagger-client');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var read = function(req,res)
{
	tracing.create('ENTER', 'GET admin/identity', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var result = {};
	
	if(typeof req.session.user != 'undefined')
	{
		var swagger = new client({
			url: configFile.config.api_url,
			success: function() {
				swagger.Registrar.getUserRegistration({"enrollmentID":req.session.user.split(' ').join('_')},{responseContentType: 'application/json'}, function(Registrar){
					res.send(JSON.parse('{"persona_id":"'+req.session.user+'"}'));
				},
				function(Error)
				{
					res.send(JSON.parse('{"persona_id":"undefined"}'))
				});
			},
			error: function() {
				res.status(400)
				tracing.create('ERROR', 'GET admin/identity', 'Unable to connect to API URL')
				var error = {}
				error = 'Unable to connect to API URL';
				res.send(error)
			}
		})
	}
	else
	{
		res.send(JSON.parse('{"persona_id":"undefined"}'))
	}
}
exports.read = read;*/

