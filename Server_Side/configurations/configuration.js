/*eslint-env node*/

var fs = require("fs");

var config = {};

/*
//Application configuration

config.timeout 						= 60000;
config.number_of_timeout_checks 	= 15;
*/
//--------------------------------------------------------------------------------------------------------------------
//	Application information
//--------------------------------------------------------------------------------------------------------------------

//Height of the blockchain at the time of deploying the application, used to verify chaincode deploy has completed
config.start_height = '1';

//--------------------------------------------------------------------------------------------------------------------
//	Tracing
//--------------------------------------------------------------------------------------------------------------------

config.trace		= true; 								// If true then the tracing will be written to file
config.traceFile 	= __dirname+'/../logs/app_trace.log'; 	// File where traces should be written to

//--------------------------------------------------------------------------------------------------------------------
//	Network file - A JSON file that holds the details of the peers, CA etc example at my_creds.json
//--------------------------------------------------------------------------------------------------------------------

config.networkFile 		= null;				 //Put filepath to network data here from bluemix if not using VCAP.  e.g. __dirname+"/../../mycreds.json";
config.networkProtocol 	= 'http'			 // The protocol to be used for connecting via rest to the network data peers

//--------------------------------------------------------------------------------------------------------------------
//	Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration
config.api_ip = 'http://127.0.0.1'; //IP of the peer attempting to be connected to. By default this is the first peer in the peers array.

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = '5000'; //port number used when calling api from outside of the vagrant environment
config.api_port_internal = '5000'; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api
config.api_port_discovery = '30303';//port number used for HFC

//IP and port configuration for the Certificate Authority. This is used for enrolling WebAppAdmin and creating all the user via HFC. Default values are for running Hyperledger locally.
config.ca_ip = '127.0.0.1'; 	//IP of the CA attempting to be connected to
config.ca_port = '50051'; 		//Discovery port of the Certificate Authority. Used for HFC

//Settings for the nodeJS application server
config.app_url = 'http://localhost:3000'; 	//Url of the NodeJS Server
config.app_port = 3000; 						//Port that the NodeJS server is operating on

//Information about all peers in the network, currently only used for checking that chaincode has been deployed to all peers on startup
config.peers = ['http://127.0.0.1'];

//--------------------------------------------------------------------------------------------------------------------
//	User information - These credentials are used for HFC to enroll this user and then set them as the registrar to create new users.
//--------------------------------------------------------------------------------------------------------------------

config.registrar_name = 'WebAppAdmin';
config.registrar_password = '1a9513992f';

//--------------------------------------------------------------------------------------------------------------------
//	HFC configuration - Defines what protocol to use for communication, bluemix certificate location and key store location
//--------------------------------------------------------------------------------------------------------------------

//Protocol used by HFC to communicate with blockchain peers and CA, need to change this manually.
config.hfc_protocol				= "grpc";
config.certificate_file_name	= "us.blockchain.ibm.com.cert";
config.key_store_location		= "/tmp/keyValStore";

//--------------------------------------------------------------------------------------------------------------------
//	Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location
config.vehicle = "github.com/hyperledger/fabric/vehicle_code/"

//Chaincode deployed names
config.vehicle_name = '54079a38b3e1e81ffe8a3d89fc4719f3e6017838f711c86ca389c8e3116e8321c85aec6843222acc29459fdc178065d1905a0d9e2f32cce78bbbf97a728ee0b9';

exports.config = config; // Exports for use in other files that require this one
