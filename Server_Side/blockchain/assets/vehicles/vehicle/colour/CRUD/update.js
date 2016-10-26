'use strict';
let request = require('request');
let configFile = require(__dirname+'/../../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../../tools/map_ID/map_ID.js');

let user_id;

let update = function(req, res)
{

    if(typeof req.cookies.user != 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    tracing.create('ENTER', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', req.body);

    let newValue = req.body.value;
    let v5cID = req.params.v5cID;

    res.write('{"message":"Formatting request"}&&');

    let invokeSpec =     {
        'jsonrpc': '2.0',
        'method': 'invoke',
        'params': {
            'type': 1,
            'chaincodeID': {
                'name': configFile.config.vehicle_name
            },
            'ctorMsg': {
                'function': 'update_colour',
                'args': [
                    newValue.toString(), v5cID
                ]
            },
            'secureContext': user_id
        },
        'id': 123
    };


    let options =     {
        url: configFile.config.networkProtocol + '://' + configFile.config.api_ip+':'+configFile.config.api_port_external+'/chaincode',
        method: 'POST',
        body: invokeSpec,
        json: true
    };

    res.write('{"message":"Updating colour value"}&&');
    tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Updating colour value');
    request(options, function(error, response, body)
    {
        if (!error && !body.hasOwnProperty('error') && response.statusCode == 200)
        {
            let j = request.jar();
            let str = 'user='+req.session.user;
            let cookie = request.cookie(str);
            let url = configFile.config.app_url + '/blockchain/assets/vehicles/'+v5cID+'/colour';
            j.setCookie(cookie, url);
            let options = {
                url: url,
                method: 'GET',
                jar: j
            };
            tracing.create('INFO', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Achieving consensus');
            res.write('{"message":"Achieving consensus"}&&');
            let counter = 0;
            let interval = setInterval(function(){
                if(counter < 15){
                    request(options, function (error, response, body) {

                        if (!error && response.statusCode == 200) {
                            if(JSON.parse(body).message == newValue)
                            {
                                let result = {};
                                result.message = 'Colour updated';
                                tracing.create('EXIT', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', result);
                                res.end(JSON.stringify(result));
                                clearInterval(interval);
                            }
                        }
                    });
                    counter++;
                }
                else
                {
                    res.status(400);
                    let error = {};
                    error.error = true;
                    error.message = 'Unable to confirm colour update. Request timed out.';
                    error.v5cID = v5cID;
                    tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', error);
                    res.end(JSON.stringify(error));
                    clearInterval(interval);
                }
            }, 4000);
        }
        else
        {
            res.status(400);
            tracing.create('ERROR', 'PUT blockchain/assets/vehicles/vehicle/'+v5cID+'/colour', 'Unable to update colour. v5cID: '+ v5cID);
            var error = {};
            error.error = true;
            error.message = 'Unable to update colour.';
            error.v5cID = v5cID;
            res.end(JSON.stringify(error));
        }
    });
};
exports.update = update;
