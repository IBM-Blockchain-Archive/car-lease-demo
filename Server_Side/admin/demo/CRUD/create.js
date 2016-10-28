'use strict';

let request = require('request');
let configFile = require(__dirname+'/../../../configurations/configuration.js');
let participants = require(__dirname+'/../../../blockchain/participants/participants_info.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');

let initial_vehicles = require(__dirname+'/../../../blockchain/assets/vehicles/initial_vehicles.js');
let v5cIDs = [];

let baseUrl = configFile.config.networkProtocol + '://localhost:' + configFile.config.app_port;

function create(req, res, next, usersToSecurityContext) {
    let cars;

    res.write(JSON.stringify({'message': 'performing scenario creation now'}));
    tracing.create('ENTER', 'POST admin/demo', req.body);

    let scenario = req.body.scenario;

    if(scenario === 'simple' || scenario === 'full') {
        cars = initial_vehicles[scenario];
    } else {
        let error = {};
        error.message = 'Scenario type not recognised';
        error.error = true;
        res.end(JSON.stringify(error));
        return;
    }

    if(cars.hasOwnProperty('cars')) {
        cars = cars.cars;
        return createVehicles(cars)
            .then(function(bodies) {
                console.log(bodies);
                // bodys.forEach(function(body){
                //     let results = body.split('&&'); //Split responses
                //     results.forEach(function(result) {
                //         let data = JSON.parse(result).message;
                //         if(data.indexOf('Creating vehicle with v5cID:') !== -1) {
                //             let v5cID = data
                //                     .substring(data.indexOf(':')+2, data.length)
                //                     .trim();
                //             v5cIDs.push(v5cID);
                //         }
                //     });
                // });
                res.end('{message:"Created vehicles"}');
                return;
            })
            .catch(function(err) {
                tracing.create('EXIT', 'POST admin/demo', err.stack);
            });
    } else {
        let error = {};
        error.message = 'Initial vehicles not found';
        error.error = true;
        res.end(JSON.stringify(error));
        return;
    }
}

function createVehicles(cars) {
    let promises = [];
    cars.forEach(function() {
        promises.push(createVehicle());
    });
    return Promise.all(promises);
}

function createVehicle() {
    let url = baseUrl + '/blockchain/assets/vehicles';
    let options = {
        url: url,
        method: 'POST',
    };
    return RESTRequest(options, 'DVLA');
}

function transferVehicle(v5cID, seller, buyer) {
    let url = baseUrl + '/blockchain/assets/vehicles/'+v5cID+'/owner/';
    let options = {
        url: url,
        body: {
            value: buyer,
            function_name: 'update_owner'
        },
        method: 'PUT'
    };
    return RESTRequest(options, seller);
}

function RESTRequest(options, user) {
    let cookie = request.cookie('user='+user);
    let j = request.jar();
    j.setCookie(cookie, options.url);
    options.jar = j;
    return new Promise(function(resolve, reject) {
        request(options, function(err, resp, body) {
            if (!err) {
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
}

exports.create = create;
