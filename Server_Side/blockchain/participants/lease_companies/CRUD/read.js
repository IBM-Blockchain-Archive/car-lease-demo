/*eslint-env node */

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    participants = reload(__dirname+'/../../participants_info.js');

var read = function(req, res)
{
	participants = reload(__dirname+'/../../participants_info.js');
	tracing.create('ENTER', 'GET blockchain/participants/lease_companies', {});
	
	if(!participants.participants_info.hasOwnProperty('lease_companies'))
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve lease companies';
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/lease_companies', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/lease_companies', {"result":participants.participants_info.lease_companies});
		res.send({"result":participants.participants_info.lease_companies})
	}
}
exports.read = read;