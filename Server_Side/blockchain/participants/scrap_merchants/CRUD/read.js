/*eslint-env node*/

var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var participants = require(__dirname+'/../../participants_info.js');

var read = function(res)
{
	tracing.create('ENTER', 'GET blockchain/participants/scrap_merchants', []);
		
	if(participants.participants.scrap_merchants == undefined)
	{
		res.status(404)
		tracing.create('ERROR', 'GET blockchain/participants/scrap_merchants', 'Unable to retrive scrap_merchants');
		var error = {}
		error.message = 'Unable to retrive scrap_merchants';
		res.send(error)
	} 
	else
	{
		res.send(participants.participants.scrap_merchants)
	}
	
}
exports.read = read;