/*eslint-env node */

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    participants = reload(__dirname+'/../../participants_info.js');

var read = function(req, res)
{
	participants = reload(__dirname+'/../../participants_info.js');
	tracing.create('ENTER', 'GET blockchain/participants/dealerships', {});
	
	if(!participants.participants_info.hasOwnProperty('dealerships'))
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve dealerships'
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/dealerships', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/dealerships', {"result":participants.participants_info.dealerships});
		res.send({"result":participants.participants_info.dealerships})
	}
}
exports.read = read;