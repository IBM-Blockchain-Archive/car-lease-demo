'use strict';

let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let user_id;
let user;
let securityContext;

function read(req,res,next,usersToSecurityContext, property) {
    let v5cID = req.params.v5cID;
    tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, {});

    user_id = req.cookies.user;

    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    let tx = user.query({
        'args': [ v5cID ],
        'attrs': [ 'role', 'username' ],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': 'get_vehicle_details'
    });

    tx.on('complete', function(data) {
        let vehicle = JSON.parse(data.result.toString());
        let result = {};
        result.message = vehicle[property];
        tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, result);
        res.send(result);
    });

    tx.on('error', function(err) {
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
