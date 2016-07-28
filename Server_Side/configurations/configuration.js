/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';

var api_ip = "http://127.0.0.1";
var app_url = 'http://localhost:3000'

if(process.env.VCAP_SERVICES){ //Check if the app is runnning on bluemix
	api_ip = "https://" + JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_host"]
	app_url = "http://" + JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];
}


//IP and port configuration
config.api_ip = api_ip
//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = "5000";		//port number used when calling api from outside of the vagrant environment
config.api_port_internal = "5000";		//port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api

config.app_url = app_url
config.app_port = process.env.VCAP_APP_PORT || "3000";

//Chaincode file locations
config.vehicle = "github.com/hyperledger/fabric/vehicle_code";

//Chaincode deployed names
config.vehicle_name = '1e10b74f793ee02f1faee18772c81f6fb9957fee7b75e95dce9cfdcaea1c8fe81d68ab30e847b73929b146cdcf9d304729e39916439475b923db087078c6ecbd';

exports.config = config;

