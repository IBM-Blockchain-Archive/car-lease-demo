'use strict';
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');

let user_id;

let user;
let securityContext;

let update = function(req, res, next, usersToSecurityContext, property)
{
    let newValue = req.body.value;
    let functionName = req.body.function_name;
    let v5cID = req.params.v5cID;

    user_id = req.cookies.user;

    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, req.body);

    tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, 'Formatting request');
    res.write('{"message":"Formatting request"}&&');

    console.log(user.getName());

    let tx = user.invoke({
        'args': [ newValue, v5cID ],
        'attrs': ['role'],
        'chaincodeID': securityContext.getChaincodeID(),
        'fcn': functionName
    });

    tx.on('complete', function(data) {
        tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, 'Updating owner value');
        res.write('{"message":"Updating owner value"}&&');
        tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, 'Achieving Consensus');
        res.write('{"message":"Achieving Consensus"}&&');
        let result = {};
        result.message = property + ' updated';
        tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, data);
        res.end(JSON.stringify(result));
    });

    tx.on('error', function(err) {
        res.status(400);
        let error = {};
        error.error  = true;
        error.message = err;
        tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/' + property, error);
        res.end(JSON.stringify(error));
    });
};

module.exports = update;
