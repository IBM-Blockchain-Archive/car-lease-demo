/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');

var read = function(req, res)
{
	tracing.create('ENTER', 'GET blockchain/blocks', {})
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var options = {
		url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
		method: "GET"
	};
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			var result = {}
			result.height = JSON.parse(body).height
			result.currentBlockHash = JSON.parse(body).currentBlockHash
			tracing.create('EXIT', 'GET blockchain/blocks', result)
			res.send(result);	
		}
		else
		{
			var error = {}
			error.message = 'Unable to get chain length'
			error.error = true
			res.status(400);
			tracing.create('ERROR', 'GET blockchain/blocks', error)
			res.send(error);
		}
	});
}
exports.read = read;
