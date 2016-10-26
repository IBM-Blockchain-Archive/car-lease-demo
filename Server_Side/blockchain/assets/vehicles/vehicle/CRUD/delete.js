'use strict';
let request = require('request');
let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');

let user_id;
let securityContext;
let user;

let update = function(req, res, next, usersToSecurityContext)
{

    if(typeof req.cookies.user != 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    let v5cID = req.params.v5cID;

    tracing.create('ENTER', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', {});

    res.write('{"message":"Formatting request"}&&');

    let securityContext = usersToSecurityContext[user_id];
    let user = securityContext.getEnrolledMember();

    let tx = user.invoke({
        'args': [ v5cID ],
        'attrs': [ 'role', 'username' ],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': 'scrap_vehicle'
    });

    tx.on('complete', function(data) {
        tracing.create('INFO', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Achieving consensus');
        res.write('{"message":"Achieving consensus"}&&');
        let result = {};
        result.message = 'Scrap updated';
        tracing.create('EXIT', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', result);
        res.end(JSON.stringify(result));
    });

    tx.on('error', function(err) {
        res.status(400);
        tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Unable to update scrap. v5cID: '+ v5cID);
        let error = {};
        error.error = true;
        error.message = 'Unable to update scrap.';
        error.v5cID = v5cID;
        tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', error);
        res.end(JSON.stringify(error));
    });
};
exports.delete = update;
