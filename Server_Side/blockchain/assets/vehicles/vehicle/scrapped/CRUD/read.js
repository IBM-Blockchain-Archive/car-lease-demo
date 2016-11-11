'use strict';

let read = require(__dirname+'/../../property/read');

exports.read = function(req, res, next, usersToSecurityContext) {
    return read(req, res, next, usersToSecurityContext, 'scrapped');
};

// 'use strict';
// let request = require('request');
// let configFile = require(__dirname+'/../../../../../../configurations/configuration.js');
// let tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
// let map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');
//
//
// let read = function (req,res,next,usersToSecurityContext)
// {
//
//     let querySpec =                    {
//         'jsonrpc': '2.0',
//         'method': 'query',
//         'params': {
//             'type': 1,
//             'chaincodeID': {
//                 'name': configFile.config.vehicle_name
//             },
//             'ctorMsg': {
//                 'function': 'get_vehicle_details',
//                 'args': [
//                     v5cID
//                 ]
//             },
//             'secureContext': user_id,
//         },
//         'id': 123
//     };
//
//
//
//     let options =     {
//         url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
//         method: 'POST',
//         body: querySpec,
//         json: true
//     };
//
//     request(options, function(error, response, body)
//     {
//
//         if (!error && !body.hasOwnProperty('error') && response.statusCode == 200)
//         {
//             let result = {};
//             let vehicle = JSON.parse(body.result.message);
//             result.message = vehicle.scrapped;
//             tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', result);
//             res.send(result);
//         }
//         else
//         {
//             res.status(400);
//             var error = {};
//             error.message = 'Unable to read scrap';
//             error.v5cID = v5cID;
//             error.error = true;
//             tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', error);
//             res.send(error);
//         }
//     });
// };
//
// exports.read = read;
