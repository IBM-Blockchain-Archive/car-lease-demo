/*eslint-env node*/

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{
	tracing.create('ENTER', 'GET blockchain/participants/manufacturers', []);

	if(participants.participants.manufacturers == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/manufacturers', 'Unable to retrive manufacturers');
		var error = {}
		error.message = 'Unable to retrive manufacturers';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.manufacturers)
	}

}
exports.read = read;