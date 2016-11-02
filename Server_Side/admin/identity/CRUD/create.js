'use strict';

//var tracing = require(__dirname+'/../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

// let request = require('request');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
// let configFile = require(__dirname+'/../../../configurations/configuration.js');

function makeAccount(req, res, usersToSecurityContext) //Checks to see if user details passed are valid. If so, log them in and start a session.
{
    let userID = map_ID.user_to_id(req.body.account);
    let securityContext = usersToSecurityContext[userID];

    tracing.create('ENTER', 'POST admin/identity', req.body);

    tracing.create('INFO', 'POST admin/identity', 'Calling /registrar endpoint');

    if (securityContext.getEnrolledMember) {
        let user = securityContext.getEnrolledMember();
        req.session.user = map_ID.id_to_user(user.getName());
        req.session.identity = user.getName();
        tracing.create('EXIT', 'POST admin/identity', {'message': 'Successfully logged user in'});
        res.send({'message': 'Successfully logged user in'});
    } else {
        res.status(400);
        tracing.create('ERROR', 'POST admin/identity', {'message':'Unable to log user in', 'error': true});
        res.send({'message':'Unable to log user in', 'error': true});
    }
}

exports.create = makeAccount;
