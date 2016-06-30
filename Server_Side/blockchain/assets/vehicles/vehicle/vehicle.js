
var remove = require(__dirname+'/CRUD/delete.js');
exports.delete = remove.delete;

var read = require(__dirname+'/CRUD/read.js');
exports.read = read.read;


var colourFile = require(__dirname+'/colour/colour.js');
var colour = {};
colour.update = colourFile.update;
colour.read = colourFile.read;
exports.colour = colour;

var makeFile = require(__dirname+'/make/make.js');
var make = {};
make.update = makeFile.update;
make.read = makeFile.read;
exports.make = make;

var modelFile = require(__dirname+'/model/model.js');
var model = {};
model.update = modelFile.update;
model.read = modelFile.read;
exports.model = model;

var regFile = require(__dirname+'/reg/reg.js');
var reg = {};
reg.update = regFile.update;
reg.read = regFile.read;
exports.reg = reg;

var scrappedFile = require(__dirname+'/scrapped/scrapped.js');
var scrapped = {};
scrapped.read = scrappedFile.read;
exports.scrapped = scrapped;

var VINFile = require(__dirname+'/VIN/vin.js');
var VIN = {};
VIN.update = VINFile.update;
VIN.read = VINFile.read;
exports.VIN = VIN;

var ownerFile = require(__dirname+'/owner/owner.js');
var owner = {};
owner.update = ownerFile.update;
owner.read = ownerFile.read;
exports.owner = owner;
