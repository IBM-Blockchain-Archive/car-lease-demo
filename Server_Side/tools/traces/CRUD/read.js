'use strict';
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let configFile = require(__dirname+'/../../../configurations/configuration.js');

function read(req,res)
{
    tracing.create('ENTER', 'GET trace', []);

    res.send(JSON.parse('{"trace":'+configFile.config.trace+'}'));
}

exports.read = read;
