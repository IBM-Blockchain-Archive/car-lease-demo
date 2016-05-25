/*eslint-env node */

var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    participants = reload(__dirname+'/../participants_info.js');

var read = function(req, res)
{
	tracing.create('ENTER', 'GET blockchain/participants/', []);
	participants = reload(__dirname+'/../participants_info.js');
	if(participants.participants_info == null)
	{
		console.log("READ ALL PARTICPANTS ERROR");
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/', 'Unable to retrieve participants');
		var error = {}
		error.message = 'Unable to retrieve participants';
		res.send(JSON.stringify(error))
	} 
	else
	{
		res.send(JSON.stringify({"result":participants.participants_info}))
	}
}
exports.read = read; 