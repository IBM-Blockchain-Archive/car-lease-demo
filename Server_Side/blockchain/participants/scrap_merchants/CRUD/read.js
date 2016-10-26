'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/scrap_merchants', {});

    if(!participants.hasOwnProperty('scrap_merchants'))
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve scrap merchants';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/scrap_merchants', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/scrap_merchants', {'result':participants.scrap_merchants});
        res.send({'result':participants.scrap_merchants});
    }
};
exports.read = read;
