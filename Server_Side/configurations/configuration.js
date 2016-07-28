/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';



var api_ip = "http://127.0.0.1";
var app_url = 'http://localhost:3000';


var api_port_external = "5000";
var api_port_internal = "5000";

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
config.vehicle = "github.com/hyperledger/fabric/vehicle_code";

//Chaincode deployed names
config.vehicle_name = '405a0ce734ed8ad3e9b66562cc64500c7d940b5161dfa7b26fcaa38f1093284e08d06c105f87724754bdb7cc255f7b50cc48ddbb935ffc8f21b9c33badb00b6f';

exports.config = config;

