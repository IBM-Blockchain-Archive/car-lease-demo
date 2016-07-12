/*eslint-env node */

var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    participants = reload(__dirname+'/../participants_info.js');

var read = function(req, res)
{
	tracing.create('ENTER', 'GET blockchain/participants/', {});
	participants = reload(__dirname+'/../participants_info.js');
	if(participants.participants_info == null)
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve participants';
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/', {"result":participants.participants_info});
		res.send({"result":participants.participants_info})
	}
}
exports.read = read; 