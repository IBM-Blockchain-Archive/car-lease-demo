/*eslint-env node*/

//===============================================================================================
//	Required Node JS Modules
//===============================================================================================

var cfenv 		 = require('cfenv');
var express 	 = require('express');
var session 	 = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser 	 = require('body-parser');
var cors 		 = require('cors');


//===============================================================================================
//	Required Local Modules
//===============================================================================================

var blocks 		 = require(__dirname+'/Server_Side/blockchain/blocks/blocks.js')
var block 		 = require(__dirname+'/Server_Side/blockchain/blocks/block/block.js')
var chaincode	 = require(__dirname+'/Server_Side/blockchain/chaincode/chaincode.js')
var vehicles 	 = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicles.js')
var vehicle 	 = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js')
var identity 	 = require(__dirname+'/Server_Side/admin/identity/identity.js')
var participants = require(__dirname+'/Server_Side/blockchain/participants/participants.js')
var events 		 = require(__dirname+'/Server_Side/blockchain/events/events.js')
var trace 		 = require(__dirname+'/Server_Side/tools/traces/trace.js')

//===============================================================================================
//	Setup
//===============================================================================================

var app = express();
	app.use(express.static(__dirname + '/Client_Side'));											// setup directory to serve the HTML pages											// get the app environment from Cloud Foundry
	app.use(cors());
	app.use(bodyParser.json());
	app.use(cookieParser())
	app.use(session({
						secret: 		   '123',		
						resave: 		   true, 
						saveUninitialized: true, 
						cookie: 		   
						{
						   maxAge: 36000000,
						   httpOnly: false
						}
					}));																			// creating a session instance

var appEnv = cfenv.getAppEnv();

var user_id = map_ID.user_to_id("DVLA");
var user_pass = map_ID.get_password("DVLA");

var enrollmentDetails = 	{
				  "enrollId": user_id,
				  "enrollSecret": user_pass
				};

var options = {
	url: configFile.config.api_url+'/registrar',
	body: enrollmentDetails,
	json:true,
	method: "POST"
};

request(options, function (error, response, body){
	if (!error && response.statusCode == 200) {
		console.log("message: Successfully logged user in");
	}
	else
	{
		console.log("error: Login failed");
	}
});

//chaincode.events.create(null, null);
//chaincode.vehicles.create(null, null);

app.get('/deployEv', function(req, res){
	chaincode.events.create(req, res)
})

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
//	Tools - Traces
//-----------------------------------------------------------------------------------------------

app.get('/tools/traces', function(req, res)		//NOT WORKING YET(Can't write to file, can read from it though) - Sets the session user to have the account address for the page they are currently on
{
	trace.read(req, res);
});

app.put('/tools/traces', function(req, res)
{
	trace.update(req, res);
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Blocks
//-----------------------------------------------------------------------------------------------

app.get('/blockchain/blocks', function(req, res){
	blocks.read(req, res);
});

app.get('/blockchain/blocks/:blockNum(\\d+)/', function(req, res){
	block.read(req, res);
});

//-----------------------------------------------------------------------------------------------
//	Blockchain - Assets - Vehicles
//-----------------------------------------------------------------------------------------------

app.post('/blockchain/assets/vehicles/' , function(req,res)
{
	vehicles.create(req,res);	
});

//Read all vehicles
app.get('/blockchain/assets/vehicles/' , function(req,res)
{
	vehicles.read(req,res);
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
//	Blockchain - Events
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/events', function(req,res)
{
	events.create(req, res)
})

app.get('/blockchain/events', function(req,res)
{
	events.read(req, res)
})

//-----------------------------------------------------------------------------------------------
//	Blockchain - Participants
//-----------------------------------------------------------------------------------------------

app.get('/blockchain/participants', function(req,res)
{
	participants.read(res)
})

app.get('/blockchain/participants/regulators', function(req,res)
{
	participants.regulators.read(res)
})

app.get('/blockchain/participants/manufacturers', function(req,res)
{
	participants.manufacturers.read(res)
})

app.get('/blockchain/participants/dealerships', function(req,res)
{
	participants.dealerships.read(res)
})

app.get('/blockchain/participants/lease_companies', function(req,res)
{
	participants.lease_companies.read(res)
})

app.get('/blockchain/participants/leasees', function(req,res)
{
	participants.leasees.read(res)
})

app.get('/blockchain/participants/scrap_merchants', function(req,res)
{
	participants.scrap_merchants.read(res)
})

//===============================================================================================
//	Start listening (appEnv.port)
//===============================================================================================

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});