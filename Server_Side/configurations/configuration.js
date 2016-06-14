/*eslint-env node*/

var config = {};

//Tracing
config.trace = true;
config.traceFile = __dirname+'/../logs/app_trace.log';

//IP and port configuration
config.api_ip = "http://"+JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_host"];
//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"]; //"3000";		//port number used when calling api from outside of the vagrant environment
config.api_port_internal = 	JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["peers"][0]["api_port"]; //"5000";		//port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api

config.app_url = 'http://'+JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];

//Chaincode file locations
config.vehicle = "https://github.com/jpayne23/testDeployCC/Chaincode_v0601/vehicle_code";


//Chaincode deployed names
config.vehicle_name = 'd8e23925846b3e2482693f0f0e4c486120b4a78596d8cf9e7ae5658e2d65bcbad4e4a6b6efdd617e67cfec352089471483289b1e221fd8b265c160b42abc5309';

exports.config = config;

