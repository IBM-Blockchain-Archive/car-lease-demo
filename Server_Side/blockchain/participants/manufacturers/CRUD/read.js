'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/manufacturers', {});

    if(!participants.hasOwnProperty('manufacturers'))
    {
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve manufacturers';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/manufacturers', error);
        res.send(error);
    }
    else
    {
        tracing.create('EXIT', 'GET blockchain/participants/manufacturers', {'result':participants.manufacturers});
        res.send({'result':participants.manufacturers});
    }

};
exports.read = read;
