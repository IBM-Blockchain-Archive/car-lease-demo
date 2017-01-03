'use strict';
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');
let Vehicle = require(__dirname+'/../../../../../tools/utils/vehicle');

let user_id;

let vehicleData;

let update = function(req, res, next, usersToSecurityContext, property)
{
    vehicleData = new Vehicle(usersToSecurityContext);

    let newValue = req.body.value;
    let functionName = req.body.function_name;
    functionName = (functionName) ? functionName : 'update_'+property.toLowerCase();
    let v5cID = req.params.v5cID;

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }
    user_id = req.session.identity;

    tracing.create('ENTER', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, req.body);

    tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Formatting request');
    res.write('{"message":"Formatting request"}&&');

    return vehicleData.updateAttribute(user_id, functionName, newValue, v5cID)
    .then(function(data) {
        tracing.create('ENTER SUCCESS', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property);

        tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Updating '+property+' value');
        res.write('{"message":"Updating owner value"}&&');
        tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Achieving Consensus');
        res.write('{"message":"Achieving Consensus"}&&');
        let result = {};
        result.message = property + ' updated';
        tracing.create('EXIT', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, data);
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        res.status(400);
        let error = {};
        error.error  = true;
        error.message = err;
        tracing.create('ERROR', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, JSON.parse(err));
        res.end(JSON.stringify(err));
    });

    // return Util.invokeChaincode(securityContext, functionName, [ newValue, v5cID ])
    //     .then(function(data) {
    //         tracing.create('ENTER SUCCESS', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property);
    //
    //         tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Updating '+property+' value');
    //         res.write('{"message":"Updating owner value"}&&');
    //         tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Achieving Consensus');
    //         res.write('{"message":"Achieving Consensus"}&&');
    //         let result = {};
    //         result.message = property + ' updated';
    //         tracing.create('EXIT', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, data);
    //         res.end(JSON.stringify(result));
    //     })
    //     .catch(function(err) {
    //         res.status(400);
    //         let error = {};
    //         error.error  = true;
    //         error.message = err;
    //         tracing.create('ERROR', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, JSON.parse(err));
    //         res.end(JSON.stringify(err));
    //     });
};

module.exports = update;
