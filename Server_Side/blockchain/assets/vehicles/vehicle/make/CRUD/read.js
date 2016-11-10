var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');
var hfc = require('hfc');

var user_id;
var attrList = ["name", "affiliation"];

var read = function (req,res)
{
	var v5cID = req.params.v5cID;
	tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', {});
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}

	user_id = req.session.identity

        var chain = hfc.getChain(configFile.config.chain_name);

        chain.getUser(user_id, function(err, user) {
                if (err) {
                        res.status(400);
			var error = {};
			error.message = 'Unable to read make.';
			error.v5cID = v5cID;
			error.error = true;
			tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', error);
			res.send(error);
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
                                var result = {}
                                var vehicle = JSON.parse(results.result.toString('utf8'));
                                result.message = vehicle.make;
                                tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', result);
                                res.send(result);
                        });

                        queryTx.on('error', function(error) {
                                res.status(400)
                                or = {}
                                error.message = 'Unable to read make.'
                                error.v5cID = v5cID;
                                error.error = true;
                                tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', error)
                                res.send(error)
                        });
                }
        });
}

exports.read = read;



// var request = require('request');
// var reload = require('require-reload')(require),
//     configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
// var tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
// var map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');
//
// var user_id;
//
// var read = function (req,res)
// {
// 	var v5cID = req.params.v5cID;
//
// 	tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', {});
// 	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
// 	if(typeof req.cookies.user != "undefined")
// 	{
// 		req.session.user = req.cookies.user;
// 		req.session.identity = map_ID.user_to_id(req.cookies.user);
// 	}
//
// 	user_id = req.session.identity
//
// 	var querySpec =					{
// 										"jsonrpc": "2.0",
// 										"method": "query",
// 										"params": {
// 										    "type": 1,
// 											"chaincodeID": {
// 												"name": configFile.config.vehicle_name
// 											},
// 											"ctorMsg": {
// 											  "function": "get_vehicle_details",
// 											  "args": [
// 											  		v5cID
// 											  ]
// 											},
// 											"secureContext": user_id
// 										},
// 										"id": 123
// 									};
//
// 	var options = 	{
// 					url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
// 					method: "POST",
// 					body: querySpec,
// 					json: true
// 				}
//
// 	request(options, function(error, response, body)
// 	{
// 		if (!error && !body.hasOwnProperty("error") && response.statusCode == 200)
// 		{
// 			var result = {}
// 			var vehicle = JSON.parse(body.result.message);
// 			result.message = vehicle.make;
// 			tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', result);
// 			res.send(result)
// 		}
// 		else
// 		{
// 			res.status(400)
// 			var error = {}
// 			error.message = 'Unable to read make'
// 			error.v5cID = v5cID;
// 			error.error = true;
// 			tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID+'/make', error)
// 			res.send(error)
// 		}
// 	});
// }
//
// exports.read = read;
