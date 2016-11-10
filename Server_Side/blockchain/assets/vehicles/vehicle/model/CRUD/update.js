/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');
var hfc = require('hfc');

var user_id;
var attrList = ["name", "affiliation"];

var update = function(req, res)
{
	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}

	user_id = req.session.identity

	tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', req.body);

	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');

	var newValue = req.body.value;
	var function_name = req.body.function_name;
	var v5cID = req.params.v5cID;

	tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', 'Formatting request');
	res.write('{"message":"Formatting request"}&&');

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.getUser(user_id, function(err, user) {
                if (err) {
                        res.status(400);
                        var error = {}
			error.message = 'Unable to update model';
			error.v5cID = v5cID;
			error.error = true;
			tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', error)
			res.end(JSON.stringify(error))
                }
                else {
                        var invokeRequest = {
                                chaincodeID: configFile.config.vehicle_name,
                                fcn: "update_model", //function_name.toString(),
                                args: [newValue, v5cID],
                                attrs: attrList
                        }

                        var invokeTx = user.invoke(invokeRequest);

                        invokeTx.on('submitted', function(results) {
                                tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', 'Request to update model submitted succesfully');
                        });

                        invokeTx.on('complete', function(results) {
                                var j = request.jar();
                                var str = "user="+req.session.user;
                                var cookie = request.cookie(str);
                                var url = configFile.config.app_url +'/blockchain/assets/vehicles/'+v5cID+'/model';
                                j.setCookie(cookie, url);
                                var options = {
                                        url: url,
                                        method: 'GET',
                                        jar: j
                                }

                                tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', 'Achieving Consensus');
                                res.write('{"message":"Achieving Consensus"}&&');
                                var counter = 0;
                                var interval = setInterval(function() {
                                        if(counter < 15) {
                                                request(options, function (error, response, body) {
                                                        if (!error && response.statusCode == 200)
                                                        {
                                                                var result = {};
                                                                result.message = 'Model updated'
                                                                tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', result);
                                                                res.end(JSON.stringify(result))
                                                                clearInterval(interval);
                                                        }
                                                });
                                                counter++;
                                        }
                                        else
                                        {
                                                res.status(400)
                                                var error = {}
                                                error.error  = true;
                                                error.message = 'Unable to confirm model update. Request timed out.';
                                                tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', error)
                                                res.end(JSON.stringify(error))
                                                clearInterval(interval);
                                        }
                                }, 4000);
                        });

                        invokeTx.on('error', function(error) {
                                res.status(400);
                                var error = {}
                                error.error  = true;
                                error.message = 'Unable to confirm model update.';
                                tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/model', error)
                                res.end(JSON.stringify(error))
                        });
                }
        });
}

exports.update = update;
