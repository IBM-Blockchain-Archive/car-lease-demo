/*eslint-env node */

var map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

var request = require('request');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var hfc = require('hfc');

function makeAccount(req, res) //Checks to see if user details passed are valid. If so, log them in and start a session.
{
	tracing.create('ENTER', 'POST admin/identity', req.body);

        configFile = reload(__dirname+'/../../../configurations/configuration.js');

	var user_id = map_ID.user_to_id(req.body.account);
	var user_pass = map_ID.get_password(req.body.participantType, req.body.account);

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.enroll(user_id, user_pass, function(err, user) {
                if (err) {
                        res.status(400);
                        tracing.create('ERROR', 'POST admin/identity', {"message": "Unable to log user in", "error": true});
                        res.send({"message": "Unable to log user in", "error":true});
                }
                req.session.user = req.body.account;
                req.session.identity = user_id;
                tracing.create('EXIT', 'POST admin/identity', {"message":"Successfully logged user in"});
                res.send({"message":"Successfully logged user in"});
        }); // chain.enroll(...)
}

exports.create = makeAccount;
