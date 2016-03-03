/*eslint-env node*/

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{
	tracing.create('ENTER', 'GET blockchain/participants/leasees', []);
	
	if(participants.participants.leasees == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/leasees', 'Unable to retrive leasees');
		var error = {}
		error.message = 'Unable to retrive leasees';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.leasees)
	}
}

exports.read = read;