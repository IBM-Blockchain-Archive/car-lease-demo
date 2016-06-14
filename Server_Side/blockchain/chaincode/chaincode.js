var vehiclesFile = require(__dirname+'/vehicles/vehicles.js');
var vehicles = {};
vehicles.create = vehiclesFile.create;
exports.vehicles = vehicles;
