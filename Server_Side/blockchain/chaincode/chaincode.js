var vehicle_logsFile = require(__dirname+'/vehicle_logs/vehicle_logs.js');
var vehicle_logs = {};
vehicle_logs.create = vehicle_logsFile.create;
exports.vehicle_logs = vehicle_logs;

var vehiclesFile = require(__dirname+'/vehicles/vehicles.js');
var vehicles = {};
vehicles.create = vehiclesFile.create;
exports.vehicles = vehicles;
