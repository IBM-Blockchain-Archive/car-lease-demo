'use strict';

let fs = require('fs');

//TODO: Change this a be compatible with the Config npm module

let config = {};

//--------------------------------------------------------------------------------------------------------------------
//    Local Config
//--------------------------------------------------------------------------------------------------------------------
config.networkProtocol = 'http';                 // If deploying locally, this value needs to be changed to 'http'
config.appProtocol = 'http';                     // If deploying locally, this value needs to be changed to 'http'
config.hfcProtocol = 'grpc';                    // If deploying locally, this value needs to be changed to 'grpc'

//--------------------------------------------------------------------------------------------------------------------
//    Tracing
//--------------------------------------------------------------------------------------------------------------------

config.trace        = true;
config.traceFile    = __dirname+'/../logs/app_trace.log';     // File where traces should be written to


//Settings for the nodeJS application server
config.offlineUrl = 'localhost';
config.appPort = (parseInt(process.env.PORT)) ? parseInt(process.env.PORT) : 8080;                         //Port that the NodeJS server is operating on


//--------------------------------------------------------------------------------------------------------------------
//    User information - These credentials are used for HFC to enroll this user and then set them as the registrar to create new users.
//--------------------------------------------------------------------------------------------------------------------
config.registrar_name = 'WebAppAdmin';
config.registrar_password = 'DJY27pEnl16d';

//--------------------------------------------------------------------------------------------------------------------
//    HFC configuration - Defines what protocol to use for communication, bluemix certificate location and key store location
//--------------------------------------------------------------------------------------------------------------------

//Protocol used by HFC to communicate with blockchain peers and CA, need to change this manually.
config.certificate_file_name    = 'certificate.pem';
config.key_store_location       = './keyValStore';

//--------------------------------------------------------------------------------------------------------------------
//    Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location
config.vehicle = 'github.com/hyperledger/fabric/vehicle_code';

config.users = [
    {
        enrollmentID: 'DVLA',
        attributes: [
            {name: 'role', value: 'regulator'},
            {name: 'username', value: 'DVLA'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Toyota',
        attributes: [
            {name: 'role', value: 'manufacturer'},
            {name: 'username', value: 'Toyota'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Alfa_Romeo',
        attributes: [
            {name: 'role', value: 'manufacturer'},
            {name: 'username', value: 'Alfa_Romeo'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Jaguar_Land_Rover',
        attributes: [
            {name: 'role', value: 'manufacturer'},
            {name: 'username', value: 'Jaguar_Land_Rover'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Beechvale_Group',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Beechvale_Group'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Milescape',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Milescape'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Viewers_Alfa_Romeo',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Viewers_Alfa_Romeo'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Joe_Payne',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Joe_Payne'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Andrew_Hurt',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Andrew_Hurt'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Anthony_O_Dowd',
        attributes: [
            {name: 'role', value: 'private'},
            {name: 'username', value: 'Anthony_O_Dowd'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'LeaseCan',
        attributes: [
            {name: 'role', value: 'lease_company'},
            {name: 'username', value: 'LeaseCan'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Every_Car_Leasing',
        attributes: [
            {name: 'role', value: 'lease_company'},
            {name: 'username', value: 'Every_Car_Leasing'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Regionwide_Vehicle_Contracts',
        attributes: [
            {name: 'role', value: 'lease_company'},
            {name: 'username', value: 'Regionwide_Vehicle_Contracts'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Cray_Bros_London_Ltd',
        attributes: [
            {name: 'role', value: 'scrap_merchant'},
            {name: 'username', value: 'Cray_Bros_London_Ltd'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'Aston_Scrap_Centre',
        attributes: [
            {name: 'role', value: 'scrap_merchant'},
            {name: 'username', value: 'Aston_Scrap_Centre'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    },
    {
        enrollmentID: 'ScrapIt_UK',
        attributes: [
            {name: 'role', value: 'scrap_merchant'},
            {name: 'username', value: 'ScrapIt_UK'}
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    }
];

//--------------------------------------------------------------------------------------------------------------------
//    Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration
// config.api_ip = config.peers[0].discovery_host; //IP of the peer attempting to be connected to. By default this is the first peer in the peers array.
let credentials;

if (process.env.VCAP_SERVICES) {
    credentials = JSON.parse(process.env.VCAP_SERVICES)['ibm-blockchain-5-prod'][0].credentials;
} else {
    credentials = fs.readFileSync(__dirname + '/../../credentials.json', 'utf8');
    credentials = JSON.parse(credentials);
}

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external  = credentials.peers[0].api_port; //port number used when calling api from outside of the vagrant environment
config.api_port_internal  = credentials.peers[0].discovery_port; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api
config.api_port_discovery = credentials.peers[0].discovery_port; //port number used for HFC

config.api_ip = credentials.peers[0].discovery_host;

let ca;
for(let key in credentials.ca) {
    ca = credentials.ca[key];
}

//IP and port configuration for the Certificate Authority. This is used for enrolling WebAppAdmin and creating all the user via HFC. Default values are for running Hyperledger locally.
config.ca_ip = ca.discovery_host;     //IP of the CA attempting to be connected to
config.ca_port = ca.discovery_port;         //Discovery port of the Certificate Authority. Used for HFC

if (credentials.users) {
    credentials.users.forEach(function(user) {
        if (user.username === config.registrar_name) {
            config.bluemix_registrar_password = user.secret;
        }
    });
}

exports.config = config; // Exports for use in other files that require this one
