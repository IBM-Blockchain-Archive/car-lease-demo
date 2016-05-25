var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');

function read(req,res)
{
	tracing.create('ENTER', 'GET trace', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	res.send(JSON.parse('{"trace":'+configFile.config.trace+'}'));
}

exports.read = read;