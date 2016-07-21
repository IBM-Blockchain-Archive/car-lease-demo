/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';

//IP and port configuration
config.api_ip = "http://127.0.0.1"
//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = "5000";		//port number used when calling api from outside of the vagrant environment
config.api_port_internal = "5000";		//port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api

config.app_url = 'http://localhost:80'

//Chaincode file locations
config.vehicle = "github.com/hyperledger/fabric/vehicle_code";



//Chaincode deployed names
config.vehicle_name = '53fcb38a3f7ba95576a2f51c12f5954d98a292743ebe0456f19d0c86af79eff04bd1e18fd0c63863722f31de4f1ad308c435de86d87ab34472545bb4e5a3bc37';

exports.config = config;

