'use strict';

let request = require('request');
let configFile = require(__dirname+'/../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../tools/traces/trace.js');

let read = function(req, res)
{

    tracing.create('ENTER', 'GET blockchain/blocks/'+req.params.blockNum, {});
    let options = {
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain/blocks/'+req.params.blockNum,
        method: 'GET'
    };
    request(options, function (error, response, body){
        if (!error && response.statusCode === 200) {
            let result = {};
            result.block = JSON.parse(body);
            tracing.create('EXIT', 'GET blockchain/blocks/'+req.params.blockNum, '');
            res.send(result);
        }
        else
        {
            res.status(400);
            let err = {};
            err.message = 'Unable to get block';
            err.error = true;
            tracing.create('ERROR', 'GET blockchain/blocks/'+req.params.blockNum, error);
            res.send(err);
        }
    });
};
exports.read = read;
