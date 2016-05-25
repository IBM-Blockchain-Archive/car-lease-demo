/*eslint-env node */

var request = require('request');
var fs = require('fs');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	

var read = function(req,res)
{
	tracing.create('ENTER', 'GET admin/demo', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var data = fs.readFileSync(__dirname+'/../../../logs/demo_status.log').toString();
	
	res.send(data);

}

exports.read = read;
