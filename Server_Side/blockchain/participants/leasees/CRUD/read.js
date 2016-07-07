/*eslint-env node */

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
	participants = reload(__dirname+'/../../participants_info.js');

var read = function(req, res)
{
	participants = reload(__dirname+'/../../participants_info.js');
	tracing.create('ENTER', 'GET blockchain/participants/leasees', {});
	
	if(!participants.participants_info.hasOwnProperty('leasees'))
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve leasees';
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/leasees', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/leasees', {"result":participants.participants_info.leasees});
		res.send({"result":participants.participants_info.leasees})
	}
}
exports.read = read;