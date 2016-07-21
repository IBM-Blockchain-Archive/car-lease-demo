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
config.vehicle_name = '7ffc0c7ceb46f02a0c7de734854beafe34836cee06e2ade1ddffca5a4275cba4fa4e37b0f9ef47868ea575bc9b5d0bd204518e6a74f38ca13fd735c25bba4ac5';

exports.config = config;

