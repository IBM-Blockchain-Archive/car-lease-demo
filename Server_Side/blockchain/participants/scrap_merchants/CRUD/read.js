/*eslint-env node */

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
	participants = reload(__dirname+'/../../participants_info.js');

var read = function(req, res)
{
	participants = reload(__dirname+'/../../participants_info.js');
	tracing.create('ENTER', 'GET blockchain/participants/scrap_merchants', {});
	
	if(!participants.participants_info.hasOwnProperty('scrap_merchants'))
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve scrap merchants';
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/scrap_merchants', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/scrap_merchants', {"result":participants.participants_info.scrap_merchants});
		res.send({"result":participants.participants_info.scrap_merchants})
	}
}
exports.read = read;