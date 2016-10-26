'use strict';

let read = require(__dirname+'/../../property/read');

exports.read = function(req, res, next, usersToSecurityContext) {
    return read(req, res, next, usersToSecurityContext, 'colour');
};


// 'use strict';
// let request = require('request');
// let configFile = require(__dirname+'/../../../../../../configurations/configuration.js');
// let tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
// let map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');
//
// let user_id;
//
// let read = function (req,res)
// {
//     let v5cID = req.params.v5cID;
//
//     tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', {});
//
//     if(typeof req.cookies.user != 'undefined')
//     {
//         req.session.user = req.cookies.user;
//         req.session.identity = map_ID.user_to_id(req.cookies.user);
//     }
//
//     user_id = req.session.identity;
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
//             'secureContext': user_id
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
//             result.message = vehicle.colour;
//             tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', result);
//             res.send(result);
//         }
//         else
//         {
//             res.status(400);
//             var error = {};
//             error.message = 'Unable to read colour';
//             error.v5cID = v5cID;
//             error.error = true;
//             tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', error);
//             res.send(error);
//         }
//     });
// };
//
// exports.read = read;
