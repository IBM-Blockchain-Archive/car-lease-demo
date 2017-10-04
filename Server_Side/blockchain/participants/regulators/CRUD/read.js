'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/regulators', {});

    if(!participants.hasOwnProperty('regulators'))
    {
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve regulators';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/regulators', error);
        res.send(error);
    }
    else
    {
        tracing.create('EXIT', 'GET blockchain/participants/regulators', {'result':participants.regulators});
        res.send({'result':participants.regulators});
    }
};
exports.read = read;
