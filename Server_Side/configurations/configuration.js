/*eslint-env node*/

var fs = require("fs");

var config = {};

//--------------------------------------------------------------------------------------------------------------------
//	Tracing
//--------------------------------------------------------------------------------------------------------------------

config.trace = true; // If true then the tracing will be written to file
config.traceFile = __dirname+'/../logs/app_trace.log'; // File where traces should be written to



//--------------------------------------------------------------------------------------------------------------------
//	Network file - A JSON file that holds the details of the peers, CA etc example at my_creds.json
//--------------------------------------------------------------------------------------------------------------------

config.networkFile = null; //Put filepath to network data here from bluemix if not using VCAP
config.networkProtocol = 'https'


//--------------------------------------------------------------------------------------------------------------------
//	Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration

config.api_ip = 'https://5f165faf-61bf-4867-a71b-cf7534996955_vp0.us.blockchain.ibm.com'; //IP of the peer attempting to be connected to

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = '443'; //port number used when calling api from outside of the vagrant environment
config.api_port_internal = '443'; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api

//Settings for the nodeJS application server
config.app_url = 'http://localhost:80'; //Url of the NodeJS Server
config.app_port = 80; //Port that the NodeJS server is operating on


//--------------------------------------------------------------------------------------------------------------------
//	Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location

config.vehicle = "github.com/hyperledger/fabric/vehicle_code"

//Chaincode deployed name
config.vehicle_name = 'adcd04749b649ff2757b7903ae18aea52cdc3707de684f459f7c26b0c03f016cc31b961887d64d643924a4f8206391fbbb109741774e426ed8f1a8ee64cc1ebf';


exports.config = config; // Exports for use in other files that require this one