'use strict';

let request = require('request');
let configFile = require(__dirname+'/../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');
let initial_vehicles = require(__dirname+'/../../../blockchain/assets/vehicles/initial_vehicles.js');
let fs = require('fs');

let vcap_app;
let ext_uri;
if (process.env.VCAP_APPLICATION) {
    vcap_app = JSON.parse(process.env.VCAP_APPLICATION);
    for (let i in vcap_app.application_uris) {
        if (vcap_app.application_uris[i].indexOf(vcap_app.name) >= 0) {
            ext_uri = 'https://' + vcap_app.application_uris[i];
        }
    }
} else {
    ext_uri = 'http://' + configFile.config.offlineUrl + ':' + configFile.config.app_port;
}

// let baseUrl = configFile.config.appProtocol + '://' + configFile.config.app_ip + ':' + configFile.config.app_port;
let baseUrl = ext_uri;

console.log(baseUrl);

const TYPES = [
    'regulator_to_manufacturer',
    'manufacturer_to_private',
    'private_to_lease_company',
    'lease_company_to_private',
    'private_to_scrap_merchant'
];

function create(req, res, next, usersToSecurityContext) {
    let cars;
    res.write(JSON.stringify({message:'Creating vehicle with v5cID: '})+'&&');
    fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', '{"logs": []}');

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
        tracing.create('INFO', 'Demo', 'Found cars');
        cars = cars.cars;
        let v5cIDResults;
        return createVehicles(cars)
            .then(function(results) {
                v5cIDResults = results;
                let carIndex = 0;
                let promises = [];
                updateDemoStatus({message: 'Created vehicles'});
                res.write('{message:"Created vehicles"}&&');
                results.forEach(function(body) {
                    console.log(results);
                    body = JSON.parse(body);
                    let v5cID = body.v5cID;
                    let car = cars[carIndex];
                    let seller = 'DVLA';
                    let buyer = map_ID.user_to_id(car.Owners[1]);
                    promises.push(transferVehicle(v5cID, seller, buyer, 'authority_to_manufacturer')); //Move car to first owner after DVLA
                    carIndex++;
                });
                return Promise.all(promises);
            })
            .then(function(p) {
                updateDemoStatus({message: 'Transfered all vehicles'});
                let carIndex = 0;
                let promises = [];
                v5cIDResults.forEach(function(body){
                    body = JSON.parse(body);
                    let v5cID = body.v5cID;
                    let car = cars[carIndex];
                    promises.push(populateVehicle(v5cID, car));
                    carIndex++;
                });
                return Promise.all(promises);
            })
            .then(function() {
                updateDemoStatus({message: 'Updating vehicle details'});
                let promises = [];
                v5cIDResults.forEach(function(body, index) {
                    body = JSON.parse(body);
                    let v5cID = body.v5cID;
                    let car = cars[index];
                    promises.push(transferBetweenOwners(v5cID, car));
                });
                return Promise.all(promises);
            })
            .then(function() {
                updateDemoStatus({message: 'Demo setup'});
                res.end(JSON.stringify({message: 'Demo setup'}));
            })
            .catch(function(err) {
                tracing.create('ERROR   DEMO', err, '');
                updateDemoStatus({'message: ': JSON.parse(err), error: true});
                tracing.create('ERROR', 'POST admin/demo', err.stack);
                res.end(JSON.stringify(err));
            });
    } else {
        let error = {};
        error.message = 'Initial vehicles not found';
        error.error = true;
        updateDemoStatus({'message: ': JSON.parse(error), error: true});
        res.end(JSON.stringify(error));
        return;
    }
}

function transferBetweenOwners(v5cID, car, results) {
    let functionName;
    let newCar = JSON.parse(JSON.stringify(car));
    if (!results) {
        results = [];
    }
    if (newCar.Owners.length > 2) {
        let seller = newCar.Owners[1]; // First after DVLA
        let buyer = map_ID.user_to_id(newCar.Owners[2]); // Second after DVLA
        functionName = TYPES[results.length + 1];
        return transferVehicle(v5cID, seller, buyer, functionName)
        .then(function(result) {
            results.push(result);
            newCar.Owners.shift();
            return transferBetweenOwners(v5cID, newCar, results);
        });
    } else {
        return Promise.resolve(results);
    }
}

// Uses recurision because Promise.all() breaks HFC
function createVehicles(cars, results) {
    let newCars = JSON.parse(JSON.stringify(cars));
    if (!results) {results = [];}
    if (newCars.length > 0) {
        return createVehicle(newCars[newCars.length - 1])
        .then(function(result) {
            results.push(result);
            newCars.pop();
            return createVehicles(newCars, results);
        });
    } else {
        return Promise.resolve(results);
    }
}

function createVehicle() {
    let url = baseUrl + '/blockchain/assets/vehicles';
    let options = {
        url: url,
        method: 'POST',
    };
    return RESTRequest(options, 'DVLA');
}

function populateVehicle(v5cID, car) {
    let promises = [];
    let url;
    let normalisedProperty;
    for(let property in car) {
        if (property !== 'Owners') {
            normalisedProperty = (property === 'VIN') ? property : property.toLowerCase();
            url = baseUrl + '/blockchain/assets/vehicles/'+v5cID+'/'+normalisedProperty;
            let options = {
                url: url,
                method: 'PUT',
                json: {
                    value: car[property],
                }
            };
            promises.push(RESTRequest(options, car.Owners[1]));
            updateDemoStatus({'message':'Created vehicle '+v5cID, 'counter': true});
        }
    }
    return Promise.all(promises);
}


/**
 * transferVehicle - description
 *
 * @param  {string} v5cID  description
 * @param  {string} seller the sellers name
 * @param  {string} buyer  the buyers user ID
 * @param  {string} functionName  chaincode function name
 * @return {Promise}        description
 */
function transferVehicle(v5cID, seller, buyer, functionName) {
    updateDemoStatus({'message':'Transfered vehicle ' + v5cID + '(' + seller + ' -> '+ buyer +')', 'counter': true});
    let url = baseUrl + '/blockchain/assets/vehicles/'+v5cID+'/owner/';
    let options = {
        url: url,
        method: 'PUT',
        json: {
            value: buyer, // the users ID
            function_name: functionName
        }
    };
    return RESTRequest(options, seller);
}


/**
 * RESTRequest - description
 *
 * @param  {object} options description
 * @param  {string} user    the users name
 * @return {Promise}         description
 */
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
                console.log(err);
                reject(err);
            }
        });
    });
}

function updateDemoStatus(status) {
    let statusFile = fs.readFileSync(__dirname+'/../../../logs/demo_status.log');
    let demoStatus = JSON.parse(statusFile);
    demoStatus.logs.push(status);
    fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', JSON.stringify(demoStatus));

    if(!status.hasOwnProperty('error')) {
        if(status.message === 'Demo setup') {
            tracing.create('EXIT', 'POST admin/demo', status);
        } else {
            tracing.create('INFO', 'POST admin/demo', status.message);
        }
    } else {
        tracing.create('ERROR', 'POST admin/demo', status);
    }
}

exports.create = create;
