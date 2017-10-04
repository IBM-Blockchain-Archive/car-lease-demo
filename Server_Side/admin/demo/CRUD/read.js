'use strict';

let fs = require('fs');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');

let read = function(req,res)
{
    // tracing.create('ENTER', 'GET admin/demo', {});

    try{
        let data = fs.readFileSync(__dirname+'/../../../logs/demo_status.log').toString();
        try
        {
            data = JSON.parse(data);
            // tracing.create('EXIT', 'GET admin/demo', data.logs);
            res.send(data.logs);
        } catch (e)
        {
            res.status(400);
            let error = {};
            error.message = 'Invalid JSON Object';
            error.error = true;
            tracing.create('ERROR', 'GET admin/demo', error);
            res.end(error);
        }
    } catch (err) {
        res.status(400);
        let error = {};
        error.message = 'Unable to load demo_status.log file';
        error.error = true;
        tracing.create('ERROR', 'GET admin/demo', error);
        res.end(error);
    }
};

exports.read = read;
