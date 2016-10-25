'use strict';
/*
//var tracing = require(__dirname+'/../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

let request = require('request');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let configFile = require(__dirname+'/../../../configurations/configuration.js');

function makeAccount(req, res) //Checks to see if user details passed are valid. If so, log them in and start a session.
{
    tracing.create('ENTER', 'POST admin/identity', req.body);

    let user_id = map_ID.user_to_id(req.body.account);
    let user_pass = map_ID.get_password(req.body.participantType, req.body.account);

    let enrollmentDetails =     {
        'enrollId': user_id,
        'enrollSecret': user_pass
    };

    let options = {
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
        body: enrollmentDetails,
        json:true,
        method: 'POST'
    };
    tracing.create('INFO', 'POST admin/identity', 'Calling /registrar endpoint');
    request(options, function (error, response, body){
        if (!error && response.statusCode === 200) {
            req.session.user = req.body.account;
            req.session.identity = user_id;
            tracing.create('EXIT', 'POST admin/identity', {'message': 'Successfully logged user in'});
            res.send({'message': 'Successfully logged user in'});
        }
        else
        {
            res.status(400);
            tracing.create('ERROR', 'POST admin/identity', {'message':'Unable to log user in', 'error': true});
            res.send({'message':'Unable to log user in', 'error': true});
        }
    });
}

exports.create = makeAccount;
*/
