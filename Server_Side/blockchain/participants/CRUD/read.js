'use strict';

let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let participants = require(__dirname+'/../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/', {});
    if(participants == null)
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve participants';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/', {'result':participants});
        res.send({'result':participants});
    }
};
exports.read = read;
