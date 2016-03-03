/*eslint-env node*/


var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{
	tracing.create('ENTER', 'GET blockchain/participants/lease_companies', []);
	
	if(participants.participants.lease_companies == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/lease_companies', 'Unable to retrive lease_companies');
		var error = {}
		error.message = 'Unable to retrive lease_companies';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.lease_companies)
	}
}

exports.read = read;