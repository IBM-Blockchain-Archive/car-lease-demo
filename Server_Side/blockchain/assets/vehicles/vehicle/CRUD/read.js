'use strict';
// let request = require('request');
// let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');

let user_id;
let securityContext;

let read = function (req,res,next,usersToSecurityContext)
{
    let v5cID = req.params.v5cID;

    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, {});
    if(typeof req.cookies.user != 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;
    securityContext = usersToSecurityContext[user_id];

    return Util.queryChaincode(securityContext, 'get_vehicle_details', [ v5cID ])
    .then(function(data) {
        let car = JSON.parse(data.toString());
        let result = {};
        result.vehicle = car;
        tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, result);
        res.send(result.vehicle);
    })
    .catch(function(err) {
        res.status(400);
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, 'Unable to get vehicle. v5cID: '+ v5cID);
        let error = {};
        error.message = err;
        error.v5cID = v5cID;
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error);
        res.send(error);
    });
};

exports.read = read;
