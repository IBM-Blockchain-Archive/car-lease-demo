'use strict';
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> IBM-Blockchain-Archive/0.6
let express         = require('express');
let session         = require('express-session');
let cookieParser     = require('cookie-parser');
let bodyParser         = require('body-parser');
let app             = express();
let url             = require('url');
let cors             = require('cors');
let fs                 = require('fs');
let path = require('path');
let hfc = require('hfc');
let tracing = require(__dirname+'/Server_Side/tools/traces/trace.js');

let configFile = require(__dirname+'/Server_Side/configurations/configuration.js');

<<<<<<< HEAD
//Our own modules
let blocks             = require(__dirname+'/Server_Side/blockchain/blocks/blocks.js');
let block             = require(__dirname+'/Server_Side/blockchain/blocks/block/block.js');
let participants     = require(__dirname+'/Server_Side/blockchain/participants/participants.js');
let identity          = require(__dirname+'/Server_Side/admin/identity/identity.js');
let vehicles         = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicles.js');
let vehicle          = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js');
let demo              = require(__dirname+'/Server_Side/admin/demo/demo.js');
let chaincode          = require(__dirname+'/Server_Side/blockchain/chaincode/chaincode.js');
let transactions     = require(__dirname+'/Server_Side/blockchain/transactions/transactions.js');
let startup            = require(__dirname+'/Server_Side/configurations/startup/startup.js');
let http = require('http');

const SecurityContext = require(__dirname+'/Server_Side/tools/security/securitycontext');

// Object of users' names linked to their security context
let usersToSecurityContext = {};

let port = process.env.VCAP_APP_PORT || configFile.config.appPort;


=======
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

// For logging
var TAG = "app.js:";

var port;

//Check if running on Bluemix or if using a local Network JSON file
check_if_config_requires_overwriting(function(updatedPort){
	
	//Define port number for app server to use
	port = updatedPort;
	
})

<<<<<<< HEAD
>>>>>>> IBM-Blockchain-Archive/0.5-final
=======
//Our own modules
let blocks             = require(__dirname+'/Server_Side/blockchain/blocks/blocks.js');
let block             = require(__dirname+'/Server_Side/blockchain/blocks/block/block.js');
let participants     = require(__dirname+'/Server_Side/blockchain/participants/participants.js');
let identity          = require(__dirname+'/Server_Side/admin/identity/identity.js');
let vehicles         = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicles.js');
let vehicle          = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js');
let demo              = require(__dirname+'/Server_Side/admin/demo/demo.js');
let chaincode          = require(__dirname+'/Server_Side/blockchain/chaincode/chaincode.js');
let transactions     = require(__dirname+'/Server_Side/blockchain/transactions/transactions.js');
let startup            = require(__dirname+'/Server_Side/configurations/startup/startup.js');
let http = require('http');

const SecurityContext = require(__dirname+'/Server_Side/tools/security/securitycontext');

// Object of users' names linked to their security context
let usersToSecurityContext = {};

let port = process.env.VCAP_APP_PORT || configFile.config.appPort;


>>>>>>> IBM-Blockchain-Archive/0.6
=======
>>>>>>> IBM-Blockchain-Archive/0.5-final
////////  Pathing and Module Setup  ////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'Somethignsomething1234!test', resave: true, saveUninitialized: true}));

// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());
app.use(express.static(__dirname + '/Client_Side'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//===============================================================================================
//    Routing
//===============================================================================================

//-----------------------------------------------------------------------------------------------
//    Admin - Identity
//-----------------------------------------------------------------------------------------------
app.post('/admin/identity', function(req, res, next)     //Sets the session user to have the account address for the page they are currently on
{
    identity.create(req, res, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Admin - Demo
//-----------------------------------------------------------------------------------------------

app.post('/admin/demo', function(req, res, next)
{
    demo.create(req, res, next, usersToSecurityContext);
});

app.get('/admin/demo', function(req, res, next)
{
    demo.read(req, res, next, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - chaincode
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/chaincode/vehicles', function(req, res,next){
    chaincode.vehicles.create(req, res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Blocks8d55b8daf0
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/blocks', function(req, res,next){
    blocks.read(req, res,next,usersToSecurityContext);
});

app.get('/blockchain/blocks/:blockNum(\\d+)', function(req, res, next){
    block.read(req, res, next, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/assets/vehicles' , function(req,res,next)
{
    vehicles.create(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/assets/vehicles' , function(req,res, next)
{
    vehicles.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle
//-----------------------------------------------------------------------------------------------

app.get('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
{
    vehicle.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Owner
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
{
    vehicle.owner.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
{
    vehicle.owner.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - VIN
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
{
    vehicle.VIN.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
{
    vehicle.VIN.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Colour
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
{
    vehicle.colour.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
{
    vehicle.colour.update(req,res,next,usersToSecurityContext);
});


//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Make
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
{
    vehicle.make.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
{
    vehicle.make.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Model
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
{
    vehicle.model.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
{
    vehicle.model.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Reg
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
{
    vehicle.reg.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
{

    vehicle.reg.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Scrapped
//-----------------------------------------------------------------------------------------------
app.delete('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
{
    vehicle.delete(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/assets/vehicles/:v5cID/scrap' , function(req,res,next)
{
    vehicle.scrapped.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Participants
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/participants', function(req,res,next){
    participants.create(req, res,next,usersToSecurityContext);
});

app.get('/blockchain/participants', function(req,res,next){
    participants.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/regulators', function(req, res,next){
    participants.regulators.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/manufacturers', function(req, res,next){
    participants.manufacturers.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/dealerships', function(req, res,next){
    participants.dealerships.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/lease_companies', function(req, res,next){
    participants.lease_companies.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/leasees', function(req, res,next){
    participants.leasees.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/scrap_merchants', function(req, res,next){
    participants.scrap_merchants.read(req,res,next,usersToSecurityContext);
});


//-----------------------------------------------------------------------------------------------
//    Blockchain - Transactions
//------------------------chain.setDeployWaitTime(100);-----------------------------------------------------------------------
app.get('/blockchain/transactions', function(req, res,next){
    transactions.read(req, res,next,usersToSecurityContext);
});

///////////  Configure Webserver  ///////////
app.use(function (req, res, next) {
    let keys;
    console.log('------------------------------------------ incoming request ------------------------------------------');
    console.log('New ' + req.method + ' request for', req.url);
    req.bag = {};                                            //create my object for my stuff
    req.session.count = eval(req.session.count) + 1;
    req.bag.session = req.session;

    let url_parts = url.parse(req.url, true);
    req.parameters = url_parts.query;
    keys = Object.keys(req.parameters);
    if (req.parameters && keys.length > 0) {console.log({parameters: req.parameters});}        //print request parameters
    keys = Object.keys(req.body);
    if (req.body && keys.length > 0) {console.log({body: req.body});}                        //print request body
    next();
});

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {        // = development error handler, print stack trace
    console.log('Error Handler -', req.url, err);
    let errorCode = err.status || 500;
    res.status(errorCode);
    if (req.bag) {
        req.bag.error = {msg: err.stack, status: errorCode};
        if (req.bag.error.status === 404) {
            req.bag.error.msg = 'Sorry, I cannot locate that file';
        }
    }
    //res.render('template/error', {bag: req.bag});
    res.send({'message':err});
});

// Track the application deployments
require('cf-deployment-tracker-client').track();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_ENV = 'production';
process.env.GOPATH = path.resolve(__dirname, 'Chaincode');

let vcapServices;
let pem;
let server;
let registrar;
let credentials;
let webAppAdminPassword = configFile.config.registrar_password;
if (process.env.VCAP_SERVICES) {
    console.log('\n[!] VCAP_SERVICES detected');
<<<<<<< HEAD
    port = process.env.PORT;
} else {
    port = configFile.config.appPort;
}

// Setup HFC
let chain = hfc.newChain('myChain');
//This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
chain.setKeyValStore(hfc.newFileKeyValStore(configFile.config.key_store_location));
=======
    port = process.env.VCAP_APP_PORT;
} else {
    port = configFile.config.appPort;
}

// Setup HFC
let chain = hfc.newChain('myChain');
//This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
chain.setKeyValStore(hfc.newFileKeyValStore(configFile.config.key_store_location));

//TODO: Change this to be a boolean stating if ssl is enabled or disabled
//Retrieve the certificate if grpcs is being used
if(configFile.config.hfcProtocol === 'grpcs'){
    // chain.setECDSAModeForGRPC(true);
    pem = fs.readFileSync(__dirname+'/Chaincode/src/vehicle_code/'+configFile.config.certificate_file_name, 'utf8');
}
>>>>>>> IBM-Blockchain-Archive/0.6

<<<<<<< HEAD
//TODO: Change this to be a boolean stating if ssl is enabled or disabled
//Retrieve the certificate if grpcs is being used
if(configFile.config.hfcProtocol === 'grpcs'){
    // chain.setECDSAModeForGRPC(true);
    pem = fs.readFileSync(__dirname+'/Chaincode/src/vehicle_code/'+configFile.config.certificate_file_name, 'utf8');
}

<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> IBM-Blockchain-Archive/0.6
if (process.env.VCAP_SERVICES) { // We are running in bluemix
    credentials = JSON.parse(process.env.VCAP_SERVICES)['ibm-blockchain-5-prod'][0].credentials;
    console.log('\n[!] Running in bluemix');
    if (!pem) {
        console.log('\n[!] No certificate is available. Will fail to connect to fabric');
    }
    startup.connectToPeers(chain, credentials.peers, pem);
    startup.connectToCA(chain, credentials.ca, pem);
<<<<<<< HEAD
    //startup.connectToEventHub(chain, credentials.peers[0], pem);
=======
    startup.connectToEventHub(chain, credentials.peers[0], pem);
>>>>>>> IBM-Blockchain-Archive/0.6

    // Get the WebAppAdmins password
    webAppAdminPassword = configFile.config.bluemix_registrar_password;

} else if (pem) { // We are running outside bluemix, connecting to bluemix fabric
    console.log('\n[!] Running locally with bluemix fabric');
    credentials = fs.readFileSync(__dirname + '/credentials.json');
    credentials = JSON.parse(credentials);

    webAppAdminPassword = configFile.config.bluemix_registrar_password;

    startup.connectToPeers(chain, credentials.peers, pem);
    startup.connectToCA(chain, credentials.ca, pem);
<<<<<<< HEAD
    //startup.connectToEventHub(chain, credentials.peers[0], pem);
=======
    startup.connectToEventHub(chain, credentials.peers[0], pem);
>>>>>>> IBM-Blockchain-Archive/0.6

} else { // We are running locally
    let credentials = fs.readFileSync(__dirname + '/credentials.json');
    credentials = JSON.parse(credentials);
    startup.connectToPeers(chain, credentials.peers);
    startup.connectToCA(chain, credentials.ca);
<<<<<<< HEAD
    //startup.connectToEventHub(chain, credentials.peers[0]);
}
//chain.getEventHub().disconnect();
=======
=======
>>>>>>> IBM-Blockchain-Archive/0.5-final
console.log("ENV VARIABLES", configFile.config.api_ip, configFile.config.api_port_external);
>>>>>>> IBM-Blockchain-Archive/0.5-final

server = http.createServer(app).listen(port, function () {
    console.log('Server Up');
    tracing.create('INFO', 'Startup complete on port', server.address().port);
});
server.timeout = 2400000;

<<<<<<< HEAD
let demoStatus = {
    status: 'IN_PROGRESS',
    success: false,
    error: null
};

let eventEmitter;
let io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
    eventEmitter = socket;
    console.log('connected');
    eventEmitter.emit('setup', demoStatus);
});

function setSetupError(err) {
    demoStatus.status = 'ERROR';
    demoStatus.success = false;
    if (!process.env.VCAP_SERVICES) {
        demoStatus.error = 'There was an error starting the demo. Please try again.';
        demoStatus.detailedError = err.message || 'Server error';
    } else {
        demoStatus.error = 'There was an error starting the demo. Please try again. Ensure you delete both the demo and the blockchain service';
        demoStatus.detailedError = err.message || 'Server error';
    }
    if (eventEmitter) {
        eventEmitter.emit('setup', demoStatus);
    }
}


let chaincodeID;

return startup.enrollRegistrar(chain, configFile.config.registrar_name, webAppAdminPassword)
.then(function(r) {
    registrar = r;
    chain.setRegistrar(registrar);
    tracing.create('INFO', 'Startup', 'Set registrar');
    let users = configFile.config.users;
    if (vcapServices || pem) {
        users.forEach(function(user){
            user.affiliation = 'group1';
        });
    }
    return startup.enrollUsers(chain, users, registrar);
})
.then(function(users) {
    tracing.create('INFO', 'Startup', 'All users registered');
    users.forEach(function(user) {
        usersToSecurityContext[user.getName()] = new SecurityContext(user);
    });
})
.then(function(){
    tracing.create('INFO', 'Startup', 'Checking if chaincode is deployed');
    return new Promise(function(resolve, reject) {
        fs.readFile('chaincode.txt', 'utf8', function(err, contents) {
            if (err) {
                resolve(false);
            } else {
                resolve(contents);
            }
        });
    });
})
.then(function(cc) { //ChaincodeID exists or doesnt
    if (cc) {
        chaincodeID = cc;
        let sc = new SecurityContext(usersToSecurityContext.DVLA.getEnrolledMember());
        sc.setChaincodeID(chaincodeID);
        tracing.create('INFO', 'Chaincode error may appear here - Ignore, chaincode has been pinged', '');
        try {
            return startup.pingChaincode(chain, sc);
        } catch(e) {
            //ping didnt work
            return false;
        }
    } else {
        return false;
    }
})
.then(function(exists) {
    if (!exists) {
        let certPath = (vcapServices) ? vcapServices.cert_path : '/certs/peer/cert.pem';
        //chain.getEventHub().connect();
        return startup.deployChaincode(registrar, 'vehicle_code', 'Init', [], certPath);
    } else {
        tracing.create('INFO', 'Startup', 'Chaincode already deployed');
        return {'chaincodeID': chaincodeID};
    }
})
.then(function(deploy) {
    //chain.getEventHub().disconnect();
    for (let name in usersToSecurityContext) {
        usersToSecurityContext[name].setChaincodeID(deploy.chaincodeID);
    }
    tracing.create('INFO', 'Startup', 'Chaincode successfully deployed');

    demoStatus.success = true;
    demoStatus.status = 'success';
    if (eventEmitter) {
        eventEmitter.emit('setup', demoStatus);
    }
})
.then(function() {
    // Query the chaincode every 3 minutes
    setInterval(function(){
        startup.pingChaincode(chain, usersToSecurityContext.DVLA)
        .then((success) => {
            if (!success){
                setSetupError();
            } else {
                demoStatus.status = 'SUCCESS';
                demoStatus.success = true;
                demoStatus.error = null;
                demoStatus.detailedError = null;
            }
        });
    }, 0.5 * 60000);
})
.catch(function(err) {
    setSetupError(err);
    console.log(err);
    tracing.create('ERROR', 'Startup', err);
});
=======
function check_if_config_requires_overwriting(assignPort)
{

	var app_url = configFile.config.app_url
	var app_port = configFile.config.app_port
	var api_ip = configFile.config.api_ip
	var api_port_external = configFile.config.api_port_external
	var api_port_internal = configFile.config.api_port_internal
	var api_port_discovery = configFile.config.api_port_discovery
	var peers = configFile.config.peers
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
			var ca = networkDetails.credentials.ca;
			var peers = networkDetails.credentials.peers;
			var peer_ip;
			var peers_array = [];
			
			//Get address of every peer on the network
			for(var i in peers){
				peer_ip = configFile.config.networkProtocol+'://'+peers[i].api_host  
				peers_array.push(peer_ip)
			}

			api_ip = peers_array[0];
			peers = peers_array;
			
			//Get details of the Certificate Authority
			for(var i in ca){
				ca_ip		= ca[i].discovery_host;
				ca_port		= ca[i].discovery_port;
			}

			api_port_external = networkDetails.credentials.peers[0].api_port;
			api_port_internal = networkDetails.credentials.peers[0].api_port;
			api_port_discovery = networkDetails.credentials.peers[0].discovery_port;
			
			//Username and password for the user we will assign as the registrar with the HFC module
			registrar_name = networkDetails.credentials.users[1].username;
			registrar_password = networkDetails.credentials.users[1].secret;

			console.log("Network JSON load successful")
		}
		catch(err)
		{
			console.error("Unable to read network JSON. Error:",err) // File either does not exist or JSON was invalid
			return
		}
	} 
	else if(process.env.VCAP_SERVICES){ //Check if the app is runnning on bluemix
		console.log("Attempting to use Bluemix VCAP Services")
		
		if(JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"]){		

			try
			{
				var credentials = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"];
			
				app_url 				= "http://" + JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];
				app_port 				= process.env.VCAP_APP_PORT;
				api_port_external 		= credentials["peers"][0]["api_port"];
				api_port_internal		= credentials["peers"][0]["api_port"];
				api_port_discovery 		= credentials["peers"][0]["discovery_port"];
<<<<<<< HEAD
				
				registrar_name 			= credentials["users"][0]["username"];
				registrar_password 		= credentials["users"][0]["secret"];

				var ca = credentials["ca"];
				var peers = credentials["peers"];
				var peers_array = [];
				
				//Get address of every peer on the network
				for(var i in peers){
					peer_ip = "https://"+peers[i]["api_host"]
					peers_array.push(peer_ip)
				}
				
=======
				
				registrar_name 			= credentials["users"][0]["username"];
				registrar_password 		= credentials["users"][0]["secret"];

				var ca = credentials["ca"];
				var peers = credentials["peers"];
				var peers_array = [];
				
				//Get address of every peer on the network
				for(var i in peers){
					peer_ip = "https://"+peers[i]["api_host"]
					peers_array.push(peer_ip)
				}
				
>>>>>>> IBM-Blockchain-Archive/0.5-final
				api_ip = peers_array[0]
				peers = peers_array

				//Get details of the Certificate Authority
				for(var i in ca){
					ca_ip		= ca[i]["discovery_host"]
					ca_port		= ca[i]["discovery_port"]
				}
			}
			catch(err)
			{
				console.error("Unable to use VCAP Services. Error:",err) //The VCAP Services JSON does not match the expected format
				return
			}
		}
		else{
			console.error("Unable to access blockchain service environment variables. The blockchain service may not exist or be working.")
			return
		}
	}
	
	//Start rewriting the config file with new values
	var data = fs.readFileSync(__dirname+'/Server_Side/configurations/configuration.js', 'utf8')
	
	var str = 'config\.peers(\\t*\\ *)*=(\\t*\\ *)*\\[\''+configFile.config.peers[0]+'\'.*?\\](\\t*\\ *)*(;)?'

	var regex = new RegExp(str, "g")

	var peersArrayAsString='';

	for(var i in peers){
		peersArrayAsString += '\''+peers[i]+'\''
		
		if(i != peers.length-1){
			peersArrayAsString += ','
		}
	}

	console.log("String", peersArrayAsString)
	
	var result = data.replace(regex, "config.peers = ["+peersArrayAsString+"];");
	
	regex = new RegExp('config\.api_ip(\\t*\\ *)*=(\\t*\\ *)*(\"|\\\')'+configFile.config.api_ip+'(\"|\\\')(\\t*\\ *)*(;)?', "g")
	result = result.replace(regex, "config.api_ip = '"+api_ip+"';");

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
<<<<<<< HEAD
} 
>>>>>>> IBM-Blockchain-Archive/0.5-final
=======
    startup.connectToEventHub(chain, credentials.peers[0]);
}
chain.getEventHub().disconnect();


server = http.createServer(app).listen(port, function () {
    console.log('Server Up');
    tracing.create('INFO', 'Startup complete on port', server.address().port);
});
server.timeout = 2400000;

let chaincodeID;
startup.enrollRegistrar(chain, configFile.config.registrar_name, webAppAdminPassword)
.then(function(r) {
    registrar = r;
    chain.setRegistrar(registrar);
    tracing.create('INFO', 'Startup', 'Set registrar');
    let users = configFile.config.users;
    if (vcapServices || pem) {
        users.forEach(function(user){
            user.affiliation = 'group1';
        });
    }
    return startup.enrollUsers(chain, users, registrar);
})
.then(function(users) {
    tracing.create('INFO', 'Startup', 'All users registered');
    users.forEach(function(user) {
        usersToSecurityContext[user.getName()] = new SecurityContext(user);
    });
})
.then(function(){
    tracing.create('INFO', 'Startup', 'Checking if chaincode is deployed');
    return new Promise(function(resolve, reject) {
        fs.readFile('chaincode.txt', 'utf8', function(err, contents) {
            if (err) {
                resolve(false);
            } else {
                resolve(contents);
            }
        });
    });
})
.then(function(cc) { //ChaincodeID exists or doesnt
    if (cc) {
        chaincodeID = cc;
        let sc = new SecurityContext(usersToSecurityContext.DVLA.getEnrolledMember());
        sc.setChaincodeID(chaincodeID);
        tracing.create('INFO', 'Chaincode error may appear here - Ignore, chaincode has been pinged', '');
        try {
            return startup.pingChaincode(chain, sc);
        } catch(e) {
            //ping didnt work
            return false;
        }
    } else {
        return false;
    }
})
.then(function(exists) {
    if (!exists) {
        let certPath = (vcapServices) ? vcapServices.cert_path : '/certs/peer/cert.pem';
        chain.getEventHub().connect();
        return startup.deployChaincode(registrar, 'vehicle_code', 'Init', [], certPath);
    } else {
        tracing.create('INFO', 'Startup', 'Chaincode already deployed');
        return {'chaincodeID': chaincodeID};
    }
})
.then(function(deploy) {
    chain.getEventHub().disconnect();
    for (let name in usersToSecurityContext) {
        usersToSecurityContext[name].setChaincodeID(deploy.chaincodeID);
    }
    tracing.create('INFO', 'Startup', 'Chaincode successfully deployed');
})
.then(function() {
    // Query the chaincode every 3 minutes
    setInterval(function(){
        startup.pingChaincode(chain, usersToSecurityContext.DVLA);
    }, 0.5 * 60000);
})
.catch(function(err) {
    console.log(err);
    tracing.create('ERROR', 'Startup', err);
});
>>>>>>> IBM-Blockchain-Archive/0.6
=======
} 
>>>>>>> IBM-Blockchain-Archive/0.5-final
