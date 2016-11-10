/*eslint-env node*/

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');
var hfc = require('hfc');

var user_id;
var counter = 0;
var attrList = ["name", "affiliation"];

function create (req, res)
{
	tracing.create('ENTER', 'POST blockchain/assets/vehicles', req.body);

        if(typeof req.cookies.user != "undefined")
	{
	        req.session.user = req.cookies.user;
                req.session.identity = map_ID.user_to_id(req.cookies.user);
	}

	user_id = req.session.identity;

        createV5cID(req, res);
}

exports.create = create;

function createV5cID(req, res)
{
        configFile = reload(__dirname+'/../../../../configurations/configuration.js');

	res.write(JSON.stringify({"message":"Generating V5cID"})+'&&')

        var numbers = "1234567890";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var v5cID = "";
	for(var i = 0; i < 7; i++)
	{
		v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
	}
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
	v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;

	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Generated V5cID: "+v5cID);

        checkIfAlreadyExists(req, res, v5cID)
}

function checkIfAlreadyExists(req, res, v5cID)
{
	res.write(JSON.stringify({"message":"Checking V5cID is unique"})+'&&');
	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Checking V5cID is unique");

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.getUser(user_id, function(err, user) {
                if (err) {
                        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err);
                }
                else {
                        var queryRequest = {
                                chaincodeID: configFile.config.vehicle_name,
                                fcn: "get_vehicle_details",
                                args: [v5cID],
                                attrs: attrList
                        }

                        var queryTx = user.query(queryRequest);

                        queryTx.on('complete', function(results) {
                                createV5cID(req, res);
                        });

                        queryTx.on('error', function(error) {
                                tracing.create('INFO', 'POST blockchain/assets/vehicles', "V5cID is unique");
                                createVehicle(req, res, v5cID);
                        });
                }
        }); // chain.getUser(...)
}

function createVehicle(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');
	tracing.create('INFO', 'POST blockchain/assets/vehicles', "Creating vehicle with v5cID: "+v5cID);
	res.write(JSON.stringify({"message":"Creating vehicle with v5cID: "+ v5cID})+'&&');

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.getUser(user_id, function(err, user) {
                if (err) {
                        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err);
                }
                else {
                        var invokeRequest = {
                                chaincodeID: configFile.config.vehicle_name,
                                fcn: "create_vehicle",
                                args: [v5cID],
                                attrs: attrList
                        }

                        var invokeTx = user.invoke(invokeRequest);

                        invokeTx.on('submitted', function(results) {
                                tracing.create('INFO', 'POST blockchain/assets/vehicles', "Create new vehicle request submitted.")
                        });

                        invokeTx.on('complete', function(results) {
                                var result = {}
                                result.message = 'Achieving consensus';
                                tracing.create('INFO', 'POST blockchain/assets/vehicles', "Achieving consensus");
                                res.write(JSON.stringify(result) + '&&');
                                confirmCreated(req, res, v5cID);
                        });

                        invokeTx.on('error', function(err) {
                                res.status(400);
                                var error = {};
                                error.message = 'Unable to create vehicle';
                                error.error = true;
                                error.v5cID = v5cID;
                                tracing.create('ERROR', 'POST blockchain/assets/vehicles', error);
                                res.end(JSON.stringify(error));
                        });
                }
        });   // chain.getUser(...)
}

function confirmCreated(req, res, v5cID)
{
	configFile = reload(__dirname+'/../../../../configurations/configuration.js');

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.getUser(user_id, function(err, user) {
                if (err) {
                        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err);
                }
                else {
                        var queryRequest = {
                                chaincodeID: configFile.config.vehicle_name,
                                fcn: 'get_vehicle_details',
                                args: [v5cID],
                                attrs: attrList
                        }

                        var queryTx = user.query(queryRequest);

                        queryTx.on('complete', function(results) {
                                var result = {};
                                result.message = "Creation confirmed";
                                result.v5cID = v5cID;
                                tracing.create('EXIT', 'POST blockchain/assets/vehicles', result);
                                res.end(JSON.stringify(result));
                        });

                        queryTx.on('error', function(error) {
                                res.status(400)
                                var error = {}
                                error.error = true;
                                error.message = 'Unable to confirm vehicle create. Request timed out.';
                                error.v5cID = v5cID;
                                res.end(JSON.stringify(error))
                                tracing.create('ERROR', 'POST blockchain/assets/vehicles', error)
                        });
                }
        });   // chain.getUser(...)
}
