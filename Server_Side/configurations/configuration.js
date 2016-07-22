/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';

var api_ip = "http://127.0.0.1";
var app_url = 'http://localhost:80'

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
config.app_port = process.env.VCAP_APP_PORT || "80";

//Chaincode file locations
config.vehicle = "github.com/hyperledger/fabric/vehicle_code";

//Chaincode deployed names
config.vehicle_name = '6159392f3b113e17b2f3fb238560c08390a23a8de9ea93c90de6cc4218699ebd3733b52d14a753fc066bd83f00e1bdea21479d83d9ba33c7f9ac6d0fb5d2d71c';

exports.config = config;

