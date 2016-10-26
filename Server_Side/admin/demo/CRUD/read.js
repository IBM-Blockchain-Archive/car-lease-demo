'use strict';

let request = require('request');
let fs = require('fs');
let configFile = require(__dirname+'/../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');

let read = function(req,res)
{
    tracing.create('ENTER', 'GET admin/demo', {});

    try{
        let data = fs.readFileSync(__dirname+'/../../../logs/demo_status.log').toString();
        try
        {
            tracing.create('EXIT', 'GET admin/demo', JSON.parse(data).logs);
            res.send(JSON.parse(data).logs);
        } catch (e)
        {
            res.status(400);
            var error = {};
            error.message = 'Invalid JSON Object';
            error.error = true;
            tracing.create('ERROR', 'GET admin/demo', error);
            res.end(error);
        }
    } catch (err) {
        res.status(400);
        var error = {};
        error.message = 'Unable to load demo_status.log file';
        error.error = true;
        tracing.create('ERROR', 'GET admin/demo', error);
        res.end(error);
    }
};

exports.read = read;
