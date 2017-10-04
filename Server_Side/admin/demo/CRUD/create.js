<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> IBM-Blockchain-Archive/0.6
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
let v5cIDResults;

function create(req, res, next, usersToSecurityContext) {
    try {
        v5cIDResults = [];
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
            updateDemoStatus({message: 'Creating vehicles'});
<<<<<<< HEAD
            // chain.getEventHub().connect();
=======
            chain.getEventHub().connect();
>>>>>>> IBM-Blockchain-Archive/0.6
            return createVehicles(cars)
            .then(function() {
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
<<<<<<< HEAD
                // chain.getEventHub().disconnect();
=======
                chain.getEventHub().disconnect();
>>>>>>> IBM-Blockchain-Archive/0.6
                res.end(JSON.stringify({message: 'Demo setup'}));
            })
            .catch(function(err) {
                tracing.create('ERROR   DEMO', JSON.stringify(err), '');
<<<<<<< HEAD
                updateDemoStatus({message: JSON.stringify(err), error: true});
                tracing.create('ERROR', 'POST admin/demo', err.stack);
                // chain.getEventHub().disconnect();
=======
                updateDemoStatus({'message: ': JSON.stringify(err), error: true});
                tracing.create('ERROR', 'POST admin/demo', err.stack);
                chain.getEventHub().disconnect();
>>>>>>> IBM-Blockchain-Archive/0.6
                res.end(JSON.stringify(err));
            });
        } else {
            let error = {};
            error.message = 'Initial vehicles not found';
            error.error = true;
<<<<<<< HEAD
            updateDemoStatus({message: JSON.stringify(error), error: true});
=======
            updateDemoStatus({'message: ': JSON.stringify(error), error: true});
>>>>>>> IBM-Blockchain-Archive/0.6
            res.end(JSON.stringify(error));
            return;
        }
    } catch (e) {
        console.log(e);
        res.end(JSON.stringify(e));
    }
<<<<<<< HEAD
=======
/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js'),
	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs')
var map_ID = require(__dirname+"/../../../tools/map_ID/map_ID.js");


var initial_vehicles = require(__dirname+"/../../../blockchain/assets/vehicles/initial_vehicles.js");
var send_error = false;
var counter = 0;
var users = [];
var cars = [];
var cars_info;

var create = function(req,res)
{
	//req.body.scenario valid values = simple, full
	res.end(JSON.stringify({"message": "performing scenario creation now"}));
	fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', '{"logs": []}');
	
	tracing.create('ENTER', 'POST admin/demo', req.body);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var scenario = req.body.scenario;
	
	if(scenario == "simple")
	{
		cars_info = initial_vehicles.simple_scenario;
	}
	else if(scenario == "full")
	{
		cars_info = initial_vehicles.full_scenario;	
	}
	else
	{
		var error = {}
		error.message = 'Scenario type not recognised';
		error.error = true;
		update_demo_status(error);
	}
	
	if(cars_info.hasOwnProperty('cars'))
	{
		cars = cars_info.cars;
		counter = 0
		create_cars(req, res);
	}
	else
	{
		var error = {}
		error.message = 'Initial vehicles not found';
		error.error = true;
		update_demo_status(error);
	}
}

exports.create = create;

var v5cIDs = []

function create_cars(req, res)
{
	update_demo_status({"message":"Creating vehicles"})
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	v5cIDs = []
	send_error = false;
	var prevCount = -1;
	var check_create = setInterval(function(){
		if(v5cIDs.length == cars.length && !send_error)
		{
			update_demo_status({"message":"Transferring vehicles to manufacturers"})
			clearInterval(check_create)
			counter = 0;
			transfer_created_cars(req, res)
		}
		else if(send_error)
		{
			clearInterval(check_create)
			counter = 0;
			update_demo_status({"message":"Unable to write vehicle", "error": true})
		}
		else if(v5cIDs.length > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status({"message":"Created vehicle "+v5cIDs[v5cIDs.length -1], "counter": true})
			}
			prevCount = v5cIDs.length;
			create_car()
		}
	}, 500)
>>>>>>> IBM-Blockchain-Archive/0.5-final
=======
>>>>>>> IBM-Blockchain-Archive/0.6
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
        })
        .catch((err) => {
            console.log('[X] Unable to transfer vehicle', err);
        });
    } else {
        return Promise.resolve(results);
    }
}

function createVehicles(cars) {
    return cars.reduce(function(prev, car, index) {
        return prev.then(function() {
            return createVehicle()
            .then(function(result) {
                v5cIDResults.push(result);
            });
        });
    }, Promise.resolve());
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
