'use strict';
// let request = require('request');
// let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
// let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');

let securityContext;
let user;

let read = function (req,res,next,usersToSecurityContext)
{
    let v5cID = req.params.v5cID;

    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, {});

    securityContext = usersToSecurityContext[req.cookies.user];
    user = securityContext.getEnrolledMember();

    let tx = user.query({
        'args': [ v5cID ],
        'attrs': ['role'],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': 'get_vehicle_details'
    });

    tx.on('complete', function(data) {
        let car = JSON.parse(data.result.toString());
        let result = {};
        result.vehicle = car;
        tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, result);
        res.send(result.vehicle);
    });

    tx.on('error', function(err) {
        res.status(400);
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, 'Unable to get vehicle. v5cID: '+ v5cID);
        let error = {};
        error.message = err;
        error.v5cID = v5cID;
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error);
        res.send(error);
    });
    // let querySpec =                    {
    //     'jsonrpc': '2.0',
    //     'method': 'query',
    //     'params': {
    //         'type': 1,
    //         'chaincodeID': {
    //             'name': configFile.config.vehicle_name
    //         },
    //         'ctorMsg': {
    //             'function': 'get_vehicle_details',
    //             'args': [
    //                 v5cID
    //             ]
    //         },
    //         'secureContext': user_id
    //     },
    //     'id': 123
    // };
    //
    // request(options, function(error, response, body)
    // {
    //     if (!error && response.statusCode == 200)
    //     {
    //         let result = {};
    //         result.vehicle = JSON.parse(body.result.message);
    //         tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, result);
    //         res.send(result.vehicle);
    //     }
    //     else
    //     {
    //         res.status(400);
    //         tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, 'Unable to get vehicle. v5cID: '+ v5cID);
    //         var error = {};
    //         error.message = 'Unable to read vehicle';
    //         error.v5cID = v5cID;
    //         error.error = true;
    //         tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error);
    //         res.send(error);
    //     }
    // });
};

exports.read = read;
