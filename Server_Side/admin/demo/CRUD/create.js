'use strict';

const hfc = require('hfc');
const Vehicle = require(__dirname+'/../../../tools/utils/vehicle');

let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');
let initial_vehicles = require(__dirname+'/../../../blockchain/assets/vehicles/initial_vehicles.js');
let fs = require('fs');

const TYPES = [
    'regulator_to_manufacturer',
    'manufacturer_to_private',
    'private_to_lease_company',
    'lease_company_to_private',
    'private_to_scrap_merchant'
];

let vehicleData;

function create(req, res, next, usersToSecurityContext) {
    try {
        let chain = hfc.getChain('myChain');
        vehicleData = new Vehicle(usersToSecurityContext);

        let cars;
        res.write(JSON.stringify({message:'Creating vehicles'})+'&&');
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
            updateDemoStatus({message: 'Creating vehicles'});
            chain.getEventHub().connect();
            return createVehicles(cars)
            .then(function(results) {
                v5cIDResults = results;
                return v5cIDResults.reduce(function(prev, v5cID, index) {
                    let car = cars[index];
                    let seller = map_ID.user_to_id('DVLA');
                    let buyer = map_ID.user_to_id(car.Owners[1]);
                    return prev.then(function() {
                        return transferVehicle(v5cID, seller, buyer, 'authority_to_manufacturer');
                    });
                }, Promise.resolve());
            })
            .then(function() {
                updateDemoStatus({message: 'Updating vehicles'});
                return v5cIDResults.reduce(function(prev, v5cID, index){
                    let car = cars[index];
                    return prev.then(function() {
                        return populateVehicle(v5cID, car);
                    });
                }, Promise.resolve());
            })
            .then(function() {
                updateDemoStatus({message: 'Transfering vehicles between owners'});
                return v5cIDResults.reduce(function(prev, v5cID, index) {
                    let car = cars[index];
                    return prev.then(function() {
                        return transferBetweenOwners(v5cID, car);
                    });
                }, Promise.resolve());
            })
            .then(function() {
                updateDemoStatus({message: 'Demo setup'});
                chain.getEventHub().disconnect();
                res.end(JSON.stringify({message: 'Demo setup'}));
            })
            .catch(function(err) {
                tracing.create('ERROR   DEMO', err, '');
                updateDemoStatus({'message: ': JSON.parse(err), error: true});
                tracing.create('ERROR', 'POST admin/demo', err.stack);
                chain.getEventHub().disconnect();
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
    } catch (e) {
        console.log(e);
    }
}

function transferBetweenOwners(v5cID, car, results) {
    let functionName;
    let newCar = JSON.parse(JSON.stringify(car));
    if (!results) {
        results = [];
    }
    if (newCar.Owners.length > 2) {
        let seller = map_ID.user_to_id(newCar.Owners[1]); // First after DVLA
        let buyer = map_ID.user_to_id(newCar.Owners[2]); // Second after DVLA
        functionName = TYPES[results.length + 1];
        return transferVehicle(v5cID, seller, buyer, functionName)
        .then(function(result) {
            console.log('[#] Transfer vehicle ' + v5cID + ' between ' + seller + ' -> ' + buyer);
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
        return createVehicle()
            .then(function(result) {
                console.log('[#] Created vehicle ' + result);
                results.push(result);
                newCars.pop();
                return createVehicles(newCars, results);
            });
    } else {
        return Promise.resolve(results);
    }
}

function createVehicle() {
    console.log('[#] Creating Vehicle');
    return vehicleData.create('DVLA');
}

function populateVehicleProperty(v5cID, ownerId, propertyName, propertyValue) {
    let normalisedPropertyName = propertyName.toLowerCase();
    return vehicleData.updateAttribute(ownerId, 'update_'+normalisedPropertyName, propertyValue, v5cID);
}

function populateVehicle(v5cID, car) {
    console.log('[#] Populating Vehicle');
    let result = Promise.resolve();
    for(let propertyName in car) {
        let normalisedPropertyName = propertyName.toLowerCase();
        let propertyValue = car[propertyName];
        if (propertyName !== 'Owners') {
            result = result.then(function() {
                return populateVehicleProperty(v5cID, map_ID.user_to_id(car.Owners[1]), normalisedPropertyName, propertyValue);
            });
        }
    }
    return result;
}

function transferVehicle(v5cID, seller, buyer, functionName) {
    console.log('[#] Transfering Vehicle to ' + buyer);
    return vehicleData.transfer(seller, buyer, functionName, v5cID);
}

function updateDemoStatus(status) {
    try {
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
    } catch (e) {
        console.log(e);
    }
}

exports.create = create;
