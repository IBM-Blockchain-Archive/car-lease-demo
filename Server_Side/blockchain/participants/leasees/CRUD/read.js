'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/leasees', {});

    if(!participants.hasOwnProperty('leasees'))
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve leasees';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/leasees', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/leasees', {'result':participants.leasees});
        res.send({'result':participants.leasees});
    }
};
exports.read = read;
