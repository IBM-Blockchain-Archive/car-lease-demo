'use strict';
let request = require('request');
let reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');

let user_id;

let read = function (req,res)
{
    let v5cID = req.params.v5cID;

    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, {});
    configFile = reload(__dirname+'/../../../../../configurations/configuration.js');
    if(typeof req.cookies.user != 'undefined')
	{
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    let querySpec =					{
        'jsonrpc': '2.0',
        'method': 'query',
        'params': {
										    'type': 1,
            'chaincodeID': {
                'name': configFile.config.vehicle_name
            },
            'ctorMsg': {
											  'function': 'get_vehicle_details',
											  'args': [
											  		v5cID
											  ]
            },
            'secureContext': user_id
        },
        'id': 123
    };



    let options = 	{
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
        method: 'POST',
        body: querySpec,
        json: true
    };

    request(options, function(error, response, body)
	{
        if (!error && response.statusCode == 200)
		{
            let result = {};
            result.vehicle = JSON.parse(body.result.message);
            tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, result);
            res.send(result.vehicle);
        }
        else
		{
            res.status(400);
            tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, 'Unable to get vehicle. v5cID: '+ v5cID);
            var error = {};
            error.message = 'Unable to read vehicle';
            error.v5cID = v5cID;
            error.error = true;
            tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error);
            res.send(error);
        }
    });
};

exports.read = read;
