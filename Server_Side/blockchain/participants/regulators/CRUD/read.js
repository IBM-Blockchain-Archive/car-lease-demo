/*eslint-env node*/


var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{
	tracing.create('ENTER', 'GET blockchain/participants/regulators', []);
	
	if(participants.participants.regulators == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/regulators', 'Unable to retrive regulators');
		var error = {}
		error.message = 'Unable to retrive regulators';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.regulators)
	}
	
}
exports.read = read;