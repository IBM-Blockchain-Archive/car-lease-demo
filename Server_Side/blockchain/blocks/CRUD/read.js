'use strict';

let request = require('request');
let configFile = require(__dirname+'/../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');

let read = function(req, res, next, usersToSecurityContext) {
    tracing.create('ENTER', 'GET blockchain/blocks', '');
    let options = {
        url: configFile.config.networkProtocol+'://'+configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
        method: 'GET'
    };
    request(options, function (error, response, body){
        if (!error && response && response.statusCode === 200) {
            let result = {};
            result.height = JSON.parse(body).height;

            // If the dvla hasnt been given a chaincode ID yet, do not adjust the block height
            if (!usersToSecurityContext.DVLA) {
                result.height = 1;
            } else if (usersToSecurityContext.DVLA && !usersToSecurityContext.DVLA.getChaincodeID()) {
                result.height = 1;
            }

            result.currentBlockHash = JSON.parse(body).currentBlockHash;
            tracing.create('EXIT', 'GET blockchain/blocks', result);
            res.send(result);
        }
        else
        {
            let err = {};
            err.message = 'Unable to get chain length';
            err.error = true;
            res.status(400);
            tracing.create('ERROR', 'GET blockchain/blocks', error);
            res.send(err);
        }
    });
};
exports.read = read;
