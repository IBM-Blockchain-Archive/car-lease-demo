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

config.networkFile = __dirname+"/../../mycreds.json"; //Put filepath to network data here from bluemix if not using VCAP
config.networkProtocol = 'https'


//--------------------------------------------------------------------------------------------------------------------
//	Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration

config.api_ip = 'https://42be62e3-e345-4ac6-aec5-da128a0128ec_vp0.us.blockchain.ibm.com'; //IP of the peer attempting to be connected to

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

config.vehicle = "https://github.com/jpayne23/car-lease-demo-1/Chaincode/vehicle_code"

//Chaincode deployed names
config.vehicle_name = '2057d4fa1442cc510c6fa586787282c5952cad8a58c78e0c6d762e5a6b7b3fdb6b04d93fe7bfd429a4f0145cc97d1ba4a49b7ee82cebdeaba4570ad6b66557d1';


exports.config = config; // Exports for use in other files that require this one