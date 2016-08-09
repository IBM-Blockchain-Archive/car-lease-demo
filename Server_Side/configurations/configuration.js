/*eslint-env node*/

var fs = require("fs");

var config = {};

//--------------------------------------------------------------------------------------------------------------------
//	Tracing
//--------------------------------------------------------------------------------------------------------------------

config.trace		= true; 								// If true then the tracing will be written to file
config.traceFile 	= __dirname+'/../logs/app_trace.log'; 	// File where traces should be written to



//--------------------------------------------------------------------------------------------------------------------
//	Network file - A JSON file that holds the details of the peers, CA etc example at my_creds.json
//--------------------------------------------------------------------------------------------------------------------

config.networkFile 		= null;				 //Put filepath to network data here from bluemix if not using VCAP.  e.g. __dirname+"/../../mycreds.json";
config.networkProtocol 	= 'https'


//--------------------------------------------------------------------------------------------------------------------
//	Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration
config.api_ip = 'http://127.0.0.1'; //IP of the peer attempting to be connected to

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external 	= '5000'; //port number used when calling api from outside of the vagrant environment
config.api_port_internal 	= '5000'; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api
config.api_port_discovery 	= '30303' //port number used for HFC

//IP and port configuration for the Certificate Authority. This is used for enrolling WebAppAdmin and creating all the user via HFC. Default values are for running Hyperledger locally.
config.ca_ip 	= '127.0.0.1'; 	//IP of the CA attempting to be connected to
config.ca_port 	= '50051'; 		//Discovery port of the Certificate Authority. Used for HFC


//Settings for the nodeJS application server
config.app_url 	= 'http://localhost:80'; 	//Url of the NodeJS Server
config.app_port = 80; 						//Port that the NodeJS server is operating on

//--------------------------------------------------------------------------------------------------------------------
//	User information - These credentials are used for HFC to enroll this user and then set them as the registrar to create new users.
//--------------------------------------------------------------------------------------------------------------------

config.registrar_name 		= "WebAppAdmin";
config.registrar_password 	= "1a9513992f";

//--------------------------------------------------------------------------------------------------------------------
//	Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location

config.vehicle = "https://github.com/jpayne23/car-lease-demo-1/Chaincode/vehicle_code/"

//Chaincode deployed names
config.vehicle_name = '2e436d1363bb9f7c00342fa3fe30eff2c303f06ed4a396a06416a5e1e488ead7edd99f337e31fc6692d785bc0d9a30e942f111caccae15e7c34de6c716f0d92a';


exports.config = config; // Exports for use in other files that require this one