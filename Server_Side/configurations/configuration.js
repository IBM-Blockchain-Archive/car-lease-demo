/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';

var api_ip = "https://42be62e3-e345-4ac6-aec5-da128a0128ec_vp0.us.blockchain.ibm.com";	//"https://2aee5d0d-16c7-4e3e-9f8e-d18845452201_vp0.us.blockchain.ibm.com"; 		//"http://127.0.0.1";
var app_url = 'http://localhost:80';

var api_port_external = "443";	//"5000";
var api_port_internal = "443";	//"5000";

if(process.env.VCAP_SERVICES){ //Check if the app is runnning on bluemix
	api_ip = "https://" + JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_host"]
	app_url = "http://" + JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];
	api_port_external = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"];
	api_port_internal = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"];
}


//IP and port configuration
config.api_ip = api_ip

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = api_port_external;		//port number used when calling api from outside of the vagrant environment
config.api_port_internal = api_port_internal;		//port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api

//Settings for the nodeJS application server
config.app_url = app_url
config.app_port = process.env.VCAP_APP_PORT || "80";

//Chaincode file locations
config.vehicle = "https://github.com/jpayne23/car-lease-demo-1/Chaincode/vehicle_code"			//"https://github.com/jpayne23/car-lease-demo-1/Chaincode/vehicle_code"		//"github.com/hyperledger/fabric/vehicle_code"

//Chaincode deployed names
config.vehicle_name = '7a6cfd67e50e19e7392ab9303c2a6bcd9df46732fc17567f60e7e9eab5f4fb6942e6de592c004d27cdbf5d152a1d4a18aadfa4be24184fc7ecbfe5de55b71c76';

exports.config = config;

