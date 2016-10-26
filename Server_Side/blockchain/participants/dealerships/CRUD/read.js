'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/dealerships', {});

    if(!participants.hasOwnProperty('dealerships'))
    {
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve dealerships';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/dealerships', error);
        res.send(error);
    }
    else
    {
        tracing.create('EXIT', 'GET blockchain/participants/dealerships', {'result':participants.dealerships});
        res.send({'result':participants.dealerships});
    }
};
exports.read = read;
