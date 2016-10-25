'use strict';

let request = require('request');
let configFile = require(__dirname+'/../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');


let user_id;

function get_all_cars(req, res, securityContext)
{

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    tracing.create('ENTER', 'GET blockchain/assets/vehicles', {});
    let ids = [];


    let querySpec = {
        'jsonrpc': '2.0',
        'method': 'query',
        'params': {
            'type': 1,
            'chaincodeID': {
                'name': configFile.config.vehicle_name
            },
            'ctorMsg': {
                'function': 'get_vehicles',
                'args': []
            },
            'secureContext': user_id
        },
        'id': 111
    };

    let options =     {
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
        method: 'POST',
        body: querySpec,
        json: true
    };

    request(options, function(err, response, body)
    {
        if (!body.hasOwnProperty('error') && response.statusCode === 200)
        {
            let data = JSON.parse(body.result.message);
            for(let i = 0; i < data.length; i++)
            {
                tracing.create('INFO', 'GET blockchain/assets/vehicles', JSON.stringify(data[i]));
                res.write(JSON.stringify(data[i])+'&&');
            }
            tracing.create('EXIT', 'GET blockchain/assets/vehicles', {});
            res.end();
        }
        else
        {
            res.status(400);
            let error = {};
            error.error = true;
            error.message = body.error;
            tracing.create('ERROR', 'GET blockchain/assets/vehicles', error);
            res.end(error);
        }
    });
}

exports.read = get_all_cars;
