'use strict';
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');

let user_id;

let user;
let securityContext;

let update = function(req, res, next, usersToSecurityContext, property)
{
    console.log(req.body);
    let newValue = req.body.value;
    let functionName = req.body.function_name;
    let v5cID = req.params.v5cID;

    req.session.user = req.cookies.user;
    console.log(newValue, functionName, v5cID);
    req.session.identity = map_ID.user_to_id(req.cookies.user);

    user_id = req.session.identity;

    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    tracing.create('ENTER', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, req.body);

    tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Formatting request');
    // res.write('{"message":"Formatting request"}&&');
    let tx = user.invoke({
        'args': [ newValue, v5cID ],
        'attrs': [ 'role', 'username' ],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': (functionName) ? functionName : 'update_'+property.toLowerCase()
    });

    tx.on('complete', function(data) {
        tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Updating owner value');
        // res.write('{"message":"Updating owner value"}&&');
        tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, 'Achieving Consensus');
        // res.write('{"message":"Achieving Consensus"}&&');
        let result = {};
        result.message = property + ' updated';
        tracing.create('EXIT', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, data);
        res.send(result);
    });

    tx.on('error', function(err) {
        res.status(400);
        let error = {};
        error.error  = true;
        error.message = err;
        tracing.create('ERROR', 'PUT blockchain/assets/vehicles/'+v5cID+'/' + property, error);
        res.send(error);
    });
};

module.exports = update;
