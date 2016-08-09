"use strict";
/* global process */
/* global __dirname */
/*eslint-env node*/

/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 *******************************************************************************/
/////////////////////////////////////////
///////////// Setup Node.js /////////////
/////////////////////////////////////////
var express 		= require('express');
var session 		= require('express-session');
var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var http 			= require('http');
var app 			= express();
var url 			= require('url');
var cors 			= require('cors');
var fs 				= require('fs');
var path 			= require('path')
var hfc				= require('hfc');



var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/Server_Side/configurations/configuration.js');
//Our own modules
var blocks 			= require(__dirname+'/Server_Side/blockchain/blocks/blocks.js');
var block 			= require(__dirname+'/Server_Side/blockchain/blocks/block/block.js');
var participants 	= require(__dirname+'/Server_Side/blockchain/participants/participants.js');
var identity 	 	= require(__dirname+'/Server_Side/admin/identity/identity.js');
var vehicles	 	= require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicles.js')
var vehicle 	 	= require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js')
var demo 	 		= require(__dirname+'/Server_Side/admin/demo/demo.js')
var chaincode 	 	= require(__dirname+'/Server_Side/blockchain/chaincode/chaincode.js')
var transactions 	= require(__dirname+'/Server_Side/blockchain/transactions/transactions.js');
var startup			= require(__dirname+'/Server_Side/configurations/startup/startup.js');

//User manager modules
var user_manager = require(__dirname+'/utils/user.js');

// For logging
var TAG = "app.js:";

var port;

//Check if running on Bluemix or if using a local Network JSON file
check_if_config_requires_overwriting(function(updatedPort){
	
	//Define port number for app server to use
	port = updatedPort;
	
})




////////  Pathing and Module Setup  ////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'Somethignsomething1234!test', resave: true, saveUninitialized: true}));

// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());

app.use(express.static(__dirname + '/Client_Side'));

//===============================================================================================
//	Routing
//===============================================================================================

//-----------------------------------------------------------------------------------------------
//	Admin - Identity
//-----------------------------------------------------------------------------------------------

app.post('/admin/identity', function(req, res) 	//Sets the session user to have the account address for the page they are currently on
{
	identity.create(req, res);
});

//-----------------------------------------------------------------------------------------------
//	Admin - Demo
//-----------------------------------------------------------------------------------------------

app.post('/admin/demo', function(req, res)
{
	demo.create(req, res);
});

app.get('/admin/demo', function(req, res)
{
	demo.read(req, res);
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - chaincode
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/chaincode/vehicles', function(req, res){
	chaincode.vehicles.create(req, res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Blocks
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/blocks', function(req, res){
	blocks.read(req, res);
});

app.get('/blockchain/blocks/:blockNum(\\d+)', function(req, res){
	block.read(req, res);
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/assets/vehicles' , function(req,res)
{
	vehicles.create(req,res)
});

app.get('/blockchain/assets/vehicles' , function(req,res)
{
	vehicles.read(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle
//-----------------------------------------------------------------------------------------------

app.get('/blockchain/assets/vehicles/:v5cID' , function(req,res)
{
	vehicle.read(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Owner
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res)
{
	vehicle.owner.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res)
{
	vehicle.owner.update(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - VIN
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res)
{
	vehicle.VIN.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res)
{
	vehicle.VIN.update(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Colour
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res)
{
	vehicle.colour.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res)
{
	vehicle.colour.update(req,res)
});


//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Make
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/make' , function(req,res)
{
	vehicle.make.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/make' , function(req,res)
{
	vehicle.make.update(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Model
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/model' , function(req,res)
{
	vehicle.model.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/model' , function(req,res)
{
	vehicle.model.update(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Reg
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res)
{
	vehicle.reg.read(req,res)
});

app.put('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res)
{
	vehicle.reg.update(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles - Vehicle - Scrapped
//-----------------------------------------------------------------------------------------------
app.delete('/blockchain/assets/vehicles/:v5cID' , function(req,res)
{
	vehicle.delete(req,res)
});

app.get('/blockchain/assets/vehicles/:v5cID/scrap' , function(req,res)
{
	vehicle.scrapped.read(req,res)
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Participants
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/participants', function(req,res){
	participants.create(req, res);
});

app.get('/blockchain/participants', function(req,res){
	participants.read(req,res);
});

app.get('/blockchain/participants/regulators', function(req, res){
	participants.regulators.read(req,res);
});

app.get('/blockchain/participants/manufacturers', function(req, res){
	participants.manufacturers.read(req,res);
});

app.get('/blockchain/participants/dealerships', function(req, res){
	participants.dealerships.read(req,res);
});

app.get('/blockchain/participants/lease_companies', function(req, res){
	participants.lease_companies.read(req,res);
});

app.get('/blockchain/participants/leasees', function(req, res){
	participants.leasees.read(req,res);
});

app.get('/blockchain/participants/scrap_merchants', function(req, res){
	participants.scrap_merchants.read(req,res);
});


//-----------------------------------------------------------------------------------------------
//	Blockchain - Transactions
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/transactions', function(req, res){
	transactions.read(req, res);
});

///////////  Configure Webserver  ///////////
app.use(function (req, res, next) {
    var keys;
    console.log('------------------------------------------ incoming request ------------------------------------------');
    console.log('New ' + req.method + ' request for', req.url);
    req.bag = {};											//create my object for my stuff
    req.session.count = eval(req.session.count) + 1;
    req.bag.session = req.session;

    var url_parts = url.parse(req.url, true);
    req.parameters = url_parts.query;
    keys = Object.keys(req.parameters);
    if (req.parameters && keys.length > 0) console.log({parameters: req.parameters});		//print request parameters
    keys = Object.keys(req.body);
    if (req.body && keys.length > 0) console.log({body: req.body});						//print request body
    next();
});

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, next) {		// = development error handler, print stack trace
    console.log("Error Handler -", req.url, err);
    var errorCode = err.status || 500;
    res.status(errorCode);
    req.bag.error = {msg: err.stack, status: errorCode};
    if (req.bag.error.status == 404) req.bag.error.msg = "Sorry, I cannot locate that file";
    //res.render('template/error', {bag: req.bag});
    res.send({"message":err})
});

// Track the application deployments
require("cf-deployment-tracker-client").track();

// ============================================================================================================================
// 														Launch Webserver
// ============================================================================================================================
var server = http.createServer(app).listen(port, function () {
	
	var result = startup.create()
	
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_ENV = 'production';
process.env['GRPC_SSL_CIPHER_SUITES'] = 'ECDHE-ECDSA-AES128-GCM-SHA256';


server.timeout = 2400000;
console.log('------------------------------------------ Server Up - ' + configFile.config.app_url + ' ------------------------------------------');


console.log("ENV VARIABLES", configFile.config.api_ip, configFile.config.api_port_external);

//--------------------------------------------------------------------------------------------------------------------
//	Functions that will overwrite default config values
//--------------------------------------------------------------------------------------------------------------------

function check_if_config_requires_overwriting(assignPort)
{
	console.log("I'VE BEEN CALLED")
	var app_url = configFile.config.app_url
	var app_port = configFile.config.app_port
	var api_ip = configFile.config.api_ip
	var api_port_external = configFile.config.api_port_external
	var api_port_internal = configFile.config.api_port_internal
	var api_port_discovery = configFile.config.api_port_discovery
	var ca_ip = configFile.config.ca_ip
	var ca_port = configFile.config.ca_port
	var registrar_name = configFile.config.registrar_name
	var registrar_password = configFile.config.registrar_password
	
	if (configFile.config.networkFile != null) // If network file is defined then overwrite the api variables to use these
	{
		console.log("Attempting to use network JSON specified")
		try
		{
			var networkDetails = JSON.parse(fs.readFileSync(configFile.config.networkFile, 'utf8'))

			api_ip = configFile.config.networkProtocol+'://'+networkDetails.credentials.peers[0].api_host;
			api_port_external = networkDetails.credentials.peers[0].api_port;
			api_port_internal = networkDetails.credentials.peers[0].api_port;
			api_port_discovery = networkDetails.credentials.peers[0].discovery_port;
			ca_ip = networkDetails.credentials.ca[0].discovery_host;
			ca_port = networkDetails.credentials.ca[0].discovery_port;
			registrar_name = networkDetails.credentials.users[1].username;
			registrar_password = networkDetails.credentials.users[1].secret;
			console.log("Network JSON load successful")
		}
		catch(err)
		{
			console.error("Unable to read network JSON") // File either does not exist or JSON was invalid
			return
		}
	} 

	if(process.env.VCAP_SERVICES){ //Check if the app is runnning on bluemix
		console.log("Attempting to use Bluemix VCAP Services NEW17")
		try
		{
			
			//var credentials = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"];
			
			app_url 				= "http://" + JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];
			app_port 				= process.env.VCAP_APP_PORT;
			api_ip 					= "https://"+JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_host"];
			api_port_external 		= JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"];
			api_port_internal		= JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"];
			api_port_discovery 		= JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["discovery_port"];
			registrar_name 			= JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["users"][1]["username"];
			registrar_password 		= JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["users"][1]["secret"];
			
			var ca = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["ca"];
			
			for(var i in ca){
				ca_ip		= ca[i]["discovery_host"]
				ca_port		= ca[i]["discovery_port"]
			}
			
			//ca = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["ca"];
			
			console.log("REGISTRAR INFO",registrar_name, registrar_password)
			/*
			for (var z in ca){
				
				console.log("CA INFO",ca[z])
				
				ca_ip = ca[z].discovery_host;
				ca_port = ca[z].discovery_port
			}*/
			
		}
		catch(err)
		{
			console.error("Unable to use VCAP Services",err) //The VCAP Services JSON does not match the expected format
			return
		}
	}
	
	//Start rewriting the config file with new values
	var data = fs.readFileSync(__dirname+'/Server_Side/configurations/configuration.js', 'utf8')
	var regex = new RegExp('config.api_ip(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+addSlashes(configFile.config.api_ip)+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	var result = data.replace(regex, "config.api_ip = '"+api_ip+"';");

	regex = new RegExp('config\.api_port_external(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+configFile.config.api_port_external+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.api_port_external = '"+api_port_external+"';");

	regex = new RegExp('config\.api_port_internal(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+configFile.config.api_port_internal+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.api_port_internal = '"+api_port_internal+"';");
	
	regex = new RegExp('config\.api_port_discovery(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+configFile.config.api_port_discovery+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.api_port_discovery = '"+api_port_discovery+"';");

	regex = new RegExp('config.app_url(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+addSlashes(configFile.config.app_url)+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.app_url = '"+app_url+"';");

	regex = new RegExp('config\.app_port(\\t*\\ *)*=(\\t*\\ *)*'+configFile.config.app_port+'(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.app_port = "+app_port+";");
	
	regex = new RegExp('config\.ca_ip(\t*\ *)*=(\t*\ *)*(\"|\\\')'+configFile.config.ca_ip+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.ca_ip = '"+ca_ip+"';");
	
	regex = new RegExp('config\.ca_port(\t*\ *)*=(\t*\ *)*(\"|\\\')'+configFile.config.ca_port+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.ca_port = '"+ca_port+"';");
	
	regex = new RegExp('config\.registrar_name(\t*\ *)*=(\t*\ *)*(\"|\\\')'+configFile.config.registrar_name+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.registrar_name = '"+registrar_name+"';");
	
	regex = new RegExp('config\.registrar_password(\t*\ *)*=(\t*\ *)*(\"|\\\')'+configFile.config.registrar_password+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.registrar_password = '"+registrar_password+"';");

	try
	{
		//console.log("Updated config file",result)
		
		fs.writeFileSync(__dirname+'/Server_Side/configurations/configuration.js', result, 'utf8');
		console.log("Updated config file.")
	}
	catch(err)
	{
		console.error("Unable to write new variables to config file.")
			
	}
	
	configFile = reload(__dirname+'/Server_Side/configurations/configuration.js');
	
	assignPort(configFile.config.app_port)	
}

function addSlashes(str)
{ 
   //no need to do (str+'') anymore because 'this' can only be a string
   return str.split('/').join('\\/')
} 
