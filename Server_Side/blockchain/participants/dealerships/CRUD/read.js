/*eslint-env node*/


var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{

	tracing.create('ENTER', 'GET blockchain/participants/dealerships', []);
	
	if(participants.participants.dealerships == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/dealerships', 'Unable to retrive dealerships');
		var error = {}
		error.message = 'Unable to retrive dealerships';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.dealerships)
	}
}

exports.read = read;