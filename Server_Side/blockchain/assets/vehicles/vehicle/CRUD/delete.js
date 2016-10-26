'use strict';
let request = require('request');
let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');

let user_id;

let update = function(req, res)
{

    if(typeof req.cookies.user != 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    let v5cID = req.params.v5cID;

    tracing.create('ENTER', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', {});

    res.write('{"message":"Formatting request"}&&');

    let invokeSpec = {
        'jsonrpc': '2.0',
        'method': 'invoke',
        'params': {
            'type': 1,
            'chaincodeID': {
                'name': configFile.config.vehicle_name
            },
            'ctorMsg': {
                'function': 'scrap_vehicle',
                'args': [
                    v5cID
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

    tracing.create('INFO', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Updating scrap value');
    res.write('{"message":"Updating scrap value"}&&');
    request(options, function(error, response, body)
    {
        if (!error && !body.hasOwnProperty('error') && response.statusCode == 200)
        {
            let j = request.jar();
            let str = 'user='+req.session.user;
            let cookie = request.cookie(str);
            let url = configFile.config.app_url + '/blockchain/assets/vehicles/'+v5cID+'/scrap';
            j.setCookie(cookie, url);
            let options = {
                url: url,
                method: 'GET',
                jar: j
            };

            tracing.create('INFO', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Achieving consensus');
            res.write('{"message":"Achieving consensus"}&&');

            let counter = 0;
            let interval = setInterval(function(){
                if(counter < 5){
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            if(JSON.parse(body).message)
                            {
                                let result = {};
                                result.message = 'Scrap updated';
                                tracing.create('EXIT', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', result);
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
                    tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Unable to update scrap. v5cID: '+ v5cID);
                    let error = {};
                    error.error = true;
                    error.message = 'Unable to confirm scrap update. Request timed out.';
                    error.v5cID = v5cID;
                    tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', error);
                    res.end(JSON.stringify(error));
                    clearInterval(interval);
                }
            }, 1500);
        }
        else
        {
            res.status(400);
            tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', 'Unable to update scrap. v5cID: '+ v5cID);
            var error = {};
            error.error = true;
            error.message = 'Unable to update scrap.';
            error.v5cID = v5cID;
            tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+v5cID+'/scrap', error);
            res.end(JSON.stringify(error));
        }
    });
};
exports.delete = update;
