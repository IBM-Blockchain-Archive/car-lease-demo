/*eslint-env node */

var request = require('request');
var fs = require('fs');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	

var read = function(req,res)
{
	tracing.create('ENTER', 'GET admin/demo', {});
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	try{
		var data = fs.readFileSync(__dirname+'/../../../logs/demo_status.log').toString();
		try 
		{
			tracing.create('EXIT', 'GET admin/demo', JSON.parse(data).logs);
			res.send(JSON.parse(data).logs);
		} catch (e)
		{
			res.status(400)
			var error = {}
			error.message = "Invalid JSON Object"
			error.error = true;
			tracing.create('ERROR', 'GET admin/demo', error);
			res.end(error)
		}
	} catch (err) {
		res.status(400)
		var error = {}
		error.message = "Unable to load demo_status.log file"
		error.error = true;
		tracing.create('ERROR', 'GET admin/demo', error);
		res.end(error)
	}
}

exports.read = read;
