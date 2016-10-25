'use strict';

let request = require('request');
let reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

let user_id;
let new_user_name;

let update = function(req, res)
{

    if(typeof req.cookies.user != 'undefined')
	{
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', req.body);

    configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');

    let newValue = req.body.value;
    let function_name = req.body.function_name;
    let v5cID = req.params.v5cID;

    tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Formatting request');
    res.write('{"message":"Formatting request"}&&');

    let invokeSpec = 	{
						  'jsonrpc': '2.0',
						  'method': 'invoke',
						  'params': {
						    'type': 1,
						    'chaincodeID': {
						      'name': configFile.config.vehicle_name
						    },
						    'ctorMsg': {
						      'function': function_name.toString(),
						      'args': [
						        newValue, v5cID
						      ]
						    },
						    'secureContext': user_id
						  },
						  'id': 123
    };

    let options = 	{
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
        method: 'POST',
        body: invokeSpec,
        json: true
    };

    tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Updating owner value');
    res.write('{"message":"Updating owner value"}&&');
    request(options, function(error, response, body)
	{

        if (!error && !body.hasOwnProperty('error') && response.statusCode == 200) // if it appears to work run a query to check if the new owner can see the car
		{
            let j = request.jar();
            let str = 'user='+map_ID.id_to_user(newValue);
            let cookie = request.cookie(str);
            let url = configFile.config.app_url +'/blockchain/assets/vehicles/'+v5cID+'/owner';
            j.setCookie(cookie, url);
            let options = {
                url: url,
                method: 'GET',
                jar: j
            };

            tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', 'Achieving Consensus');
            res.write('{"message":"Achieving Consensus"}&&');
            let counter = 0;
            let interval = setInterval(function(){
                if(counter < 15){
                    request(options, function (error, response, body) {

                        if (!error && response.statusCode == 200)
						{

                            let result = {};
                            result.message = 'Owner updated';
                            tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', result);
                            res.end(JSON.stringify(result));
                            clearInterval(interval);
                        }
                    });
                    counter++;
                }
                else
				{
                    res.status(400);
                    let error = {};
                    error.error  = true;
                    error.message = 'Unable to confirm owner update. Request timed out.';
                    tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error);
                    res.end(JSON.stringify(error));
                    clearInterval(interval);
                }
            }, 4000);
        }
        else
		{
            res.status(400);
            var error = {};
            error.message = 'Unable to update owner';
            error.v5cID = v5cID;
            error.error = true;
            tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/owner', error);
            res.end(JSON.stringify(error));
        }
    });
};
exports.update = update;
