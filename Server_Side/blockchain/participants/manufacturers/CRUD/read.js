/*eslint-env node*/

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
	participants = reload(__dirname+'/../../participants_info.js');

var read = function(req, res)
{
	participants = reload(__dirname+'/../../participants_info.js');
	
	tracing.create('ENTER', 'GET blockchain/participants/manufacturers', {});

	if(!participants.participants_info.hasOwnProperty('manufacturers'))
	{
		res.status(404)
		var error = {}
		error.message = 'Unable to retrieve manufacturers';
		error.error = true;
		tracing.create('ERROR', 'GET blockchain/participants/manufacturers', error);
		res.send(error)
	} 
	else
	{
		tracing.create('EXIT', 'GET blockchain/participants/manufacturers', {"result":participants.participants_info.manufacturers});
		res.send({"result":participants.participants_info.manufacturers})
	}

}
exports.read = read;