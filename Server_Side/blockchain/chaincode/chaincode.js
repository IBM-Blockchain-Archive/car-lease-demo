var eventsFile = require(__dirname+'/events/events.js');
var events = {};
events.create = eventsFile.create;
exports.events = events;

var vehiclesFile = require(__dirname+'/vehicles/vehicles.js');
var vehicles = {};
vehicles.create = vehiclesFile.create;
exports.vehicles = vehicles;