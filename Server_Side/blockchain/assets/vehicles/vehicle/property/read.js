'use strict';

let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID');
let user_id;
let user;
let securityContext;

function read(req,res,next,usersToSecurityContext,property) {
    let v5cID = req.params.v5cID;
    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, {});

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }
    user_id = req.session.identity;
    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    return Util.queryChaincode(securityContext, 'get_vehicle_details', [ v5cID ]).
    then(function(data) {
        let vehicle = JSON.parse(data.toString());
        let result = {};
        result.message = vehicle[property];
        tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, result);
        res.send(result);
    })
    .catch(function(err) {
        res.status(400);
        let error = {};
        error.message = err;
        error.v5cID = v5cID;
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, error);
        res.send(error);
    });
}

module.exports = read;
