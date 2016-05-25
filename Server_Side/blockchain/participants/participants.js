/*eslint-env node */
var create = require(__dirname+'/CRUD/create.js');
exports.create = create.create;

var read = require(__dirname+'/CRUD/read.js');
exports.read = read.read;

var regulatorsFile = require(__dirname+'/regulators/regulators.js');
var regulators = {};
regulators.read = regulatorsFile.read;
exports.regulators = regulators;

var manufacturersFile = require(__dirname+'/manufacturers/manufacturers.js');
var manufacturers = {};
manufacturers.read = manufacturersFile.read;
exports.manufacturers = manufacturers;

var dealershipsFile = require(__dirname+'/dealerships/dealerships.js');
var dealerships = {};
dealerships.read = dealershipsFile.read;
exports.dealerships = dealerships;

var lease_companiesFile = require(__dirname+'/lease_companies/lease_companies.js');
var lease_companies = {};
lease_companies.read = lease_companiesFile.read;
exports.lease_companies = lease_companies;

var leaseesFile = require(__dirname+'/leasees/leasees.js');
var leasees = {};
leasees.read = leaseesFile.read;
exports.leasees = leasees;

var scrap_merchantsFile = require(__dirname+'/scrap_merchants/scrap_merchants.js');
var scrap_merchants = {};
scrap_merchants.read = scrap_merchantsFile.read;
exports.scrap_merchants = scrap_merchants;