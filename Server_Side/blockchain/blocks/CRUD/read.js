/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
//var tracing = require(__dirname+'/../../../tools/traces/trace.js');

var read = function(req, res)
{
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var options = {
		url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
		method: "GET"
	};
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			res.send({"height": JSON.parse(body).height, "currentBlockHash": JSON.parse(body).currentBlockHash});	
		}
		else
		{
			res.status(400);
			res.send({"message":"Unable to get chain length", "error": true});
		}
	});
}
exports.read = read;
