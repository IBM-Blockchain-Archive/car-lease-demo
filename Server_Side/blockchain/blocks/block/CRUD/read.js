'use strict';

let request = require('request');
let reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../tools/traces/trace.js');

let read = function(req, res)
{

    tracing.create('ENTER', 'GET blockchain/blocks/'+req.params.blockNum, {});

    let options = {
        url: configFile.config.api_ip + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain/blocks/'+req.params.blockNum,
        method: 'GET'
    };
    request(options, function (error, response, body){
        if (!error && response.statusCode == 200) {
            let result = {};
            result.block = JSON.parse(body);
            tracing.create('EXIT', 'GET blockchain/blocks/'+req.params.blockNum, result);
            res.send(result);
        }
        else
		{
            res.status(400);
            var error = {};
            error.message = 'Unable to get block';
            error.error = true;
            tracing.create('ERROR', 'GET blockchain/blocks/'+req.params.blockNum, error);
            res.send(error);
        }
    });
};
exports.read = read;
