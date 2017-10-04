'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/lease_companies', {});

    if(!participants.hasOwnProperty('lease_companies'))
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve lease companies';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/lease_companies', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/lease_companies', {'result':participants.lease_companies});
        res.send({'result':participants.lease_companies});
    }
};
exports.read = read;
