'use strict';
// let request = require('request');
// let configFile = require(__dirname+'/../../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
// let map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

let user_id;
let user;
let securityContext;

let read = function (req,res,next,usersToSecurityContext)
{
    let v5cID = req.params.v5cID;
    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', {});

    user_id = req.cookies.user;

    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    let tx = user.query({
        'args': [ v5cID ],
        'attrs': ['role'],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': 'get_vehicle_details'
    });

    tx.on('complete', function(data) {
        let vehicle = JSON.parse(data.result.toString());
        let result = {};
        result.message = vehicle.owner;
        tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', result);
        res.send(result);
    });

    tx.on('error', function(err) {
        res.status(400);
        let error = {};
        error.message = err;
        error.v5cID = v5cID;
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error);
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
    //
    // let options =     {
    //     url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
    //     method: 'POST',
    //     body: querySpec,
    //     json: true
    // };
    //
    // request(options, function(error, response, body)
    // {
    //     if (!error && !body.hasOwnProperty('error') && response.statusCode == 200)
    //     {
    //         let result = {};
    //         let vehicle = JSON.parse(body.result.message);
    //         result.message = vehicle.owner;
    //         tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', result);
    //         res.send(result);
    //     }
    //     else
    //     {
    //         res.status(400);
    //         var error = {};
    //         error.message = 'Unable to read owner.';
    //         error.v5cID = v5cID;
    //         error.error = true;
    //         tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error);
    //         res.send(error);
    //     }
    // });

};

exports.read = read;
