'use strict';

//TODO: Change this a be compatible with the Config npm module

let config = {};

/*
//Application configuration

config.timeout = 60000;
config.number_of_timeout_checks     = 15;
*/
//--------------------------------------------------------------------------------------------------------------------
//    Application information
//--------------------------------------------------------------------------------------------------------------------

//Height of the blockchain at the time of deploying the application, used to verify chaincode deploy has completed
config.start_height = '0';

//--------------------------------------------------------------------------------------------------------------------
//    Tracing
//--------------------------------------------------------------------------------------------------------------------

config.trace        = true;                                 // If true then the tracing will be written to file
config.traceFile    = __dirname+'/../logs/app_trace.log';     // File where traces should be written to

//--------------------------------------------------------------------------------------------------------------------
//    Network file - A JSON file that holds the details of the peers, CA etc example at my_creds.json
//--------------------------------------------------------------------------------------------------------------------

config.networkFile         = null;                 //Put filepath to network data here from bluemix if not using VCAP.  e.g. __dirname+"/../../mycreds.json";
config.networkProtocol     = 'https';             // The protocol to be used for connecting via rest to the network data peers

//--------------------------------------------------------------------------------------------------------------------
//    Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration
config.api_ip = 'vp0'; //IP of the peer attempting to be connected to. By default this is the first peer in the peers array.

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external = '7050'; //port number used when calling api from outside of the vagrant environment
config.api_port_internal = '7050'; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api
config.api_port_discovery = '7051'; //port number used for HFC

//IP and port configuration for the Certificate Authority. This is used for enrolling WebAppAdmin and creating all the user via HFC. Default values are for running Hyperledger locally.
config.ca_ip = 'fabric-ca';     //IP of the CA attempting to be connected to
config.ca_port = '7054';         //Discovery port of the Certificate Authority. Used for HFC

//TODO: Merge these two
//Settings for the nodeJS application server
config.app_url = 'http://localhost:8080';     //Url of the NodeJS Server
config.app_port = 8080;                         //Port that the NodeJS server is operating on

config.eventHubUrl = 'vp0';
config.eventHubPort = '7053';

//Information about all peers in the network, currently only used for checking that chaincode has been deployed to all peers on startup
config.peers = ['vp0'];

//--------------------------------------------------------------------------------------------------------------------
//    User information - These credentials are used for HFC to enroll this user and then set them as the registrar to create new users.
//--------------------------------------------------------------------------------------------------------------------

config.registrar_name = 'WebAppAdmin';
config.registrar_password = 'DJY27pEnl16d';

//--------------------------------------------------------------------------------------------------------------------
//    HFC configuration - Defines what protocol to use for communication, bluemix certificate location and key store location
//--------------------------------------------------------------------------------------------------------------------

//Protocol used by HFC to communicate with blockchain peers and CA, need to change this manually.
config.hfc_protocol             = 'grpcs';
config.certificate_file_name    = 'stage.blockchain.ibm.com.cert';
config.key_store_location       = '/tmp/keyValStore';

//--------------------------------------------------------------------------------------------------------------------
//    Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location
//config.vehicle = 'https://github.com/IBM-Blockchain/car-lease-demo/Chaincode/vehicle_code/';
config.vehicle = 'github.com/hyperledger/fabric/vehicle_code';
//Chaincode deployed names
config.vehicle_name = '2e436d1363bb9f7c00342fa3fe30eff2c303f06ed4a396a06416a5e1e488ead7edd99f337e31fc6692d785bc0d9a30e942f111caccae15e7c34de6c716f0d92a';

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

config.fabric = {
    'peers': [
        {
            'discovery_host': 'a5cacfd7717a4266a93abb3763647c30-vp1.stage.blockchain.ibm.com',
            'discovery_port': 30001,
            'api_host': 'a5cacfd7717a4266a93abb3763647c30-vp1.stage.blockchain.ibm.com',
            'api_port_tls': 5001,
            'api_port': 5001,
            'type': 'peer',
            'network_id': 'a5cacfd7717a4266a93abb3763647c30',
            'container_id': 'adb61b865673441d01d79339bd2c5671c8e61a7f667141414d76d257eba44f6d',
            'id': 'a5cacfd7717a4266a93abb3763647c30-vp1',
            'api_url': 'http://a5cacfd7717a4266a93abb3763647c30-vp1.stage.blockchain.ibm.com:5001'
        },
        {
            'discovery_host': 'a5cacfd7717a4266a93abb3763647c30-vp2.stage.blockchain.ibm.com',
            'discovery_port': 30001,
            'api_host': 'a5cacfd7717a4266a93abb3763647c30-vp2.stage.blockchain.ibm.com',
            'api_port_tls': 5001,
            'api_port': 5001,
            'type': 'peer',
            'network_id': 'a5cacfd7717a4266a93abb3763647c30',
            'container_id': '6ec552d2457e92280865559cde5f62632d8c43b0ba3e9d486b82a04a1ad1c001',
            'id': 'a5cacfd7717a4266a93abb3763647c30-vp2',
            'api_url': 'http://a5cacfd7717a4266a93abb3763647c30-vp2.stage.blockchain.ibm.com:5001'
        },
        {
            'discovery_host': 'a5cacfd7717a4266a93abb3763647c30-vp0.stage.blockchain.ibm.com',
            'discovery_port': 30001,
            'api_host': 'a5cacfd7717a4266a93abb3763647c30-vp0.stage.blockchain.ibm.com',
            'api_port_tls': 5001,
            'api_port': 5001,
            'type': 'peer',
            'network_id': 'a5cacfd7717a4266a93abb3763647c30',
            'container_id': '719502abdcc202657ed02a7a71b2252db339fe575ffeb30255896d9e4827a354',
            'id': 'a5cacfd7717a4266a93abb3763647c30-vp0',
            'api_url': 'http://a5cacfd7717a4266a93abb3763647c30-vp0.stage.blockchain.ibm.com:5001'
        },
        {
            'discovery_host': 'a5cacfd7717a4266a93abb3763647c30-vp3.stage.blockchain.ibm.com',
            'discovery_port': 30001,
            'api_host': 'a5cacfd7717a4266a93abb3763647c30-vp3.stage.blockchain.ibm.com',
            'api_port_tls': 5001,
            'api_port': 5001,
            'type': 'peer',
            'network_id': 'a5cacfd7717a4266a93abb3763647c30',
            'container_id': 'ab0faa84ca8c67420fae9cf15848827685a316ff58620067f66eecc5bf585854',
            'id': 'a5cacfd7717a4266a93abb3763647c30-vp3',
            'api_url': 'http://a5cacfd7717a4266a93abb3763647c30-vp3.stage.blockchain.ibm.com:5001'
        }
    ],
    'ca': {
        'a5cacfd7717a4266a93abb3763647c30-ca': {
            'url': 'a5cacfd7717a4266a93abb3763647c30-ca.stage.blockchain.ibm.com:30001',
            'discovery_host': 'a5cacfd7717a4266a93abb3763647c30-ca.stage.blockchain.ibm.com',
            'discovery_port': 30001,
            'api_host': 'a5cacfd7717a4266a93abb3763647c30-ca.stage.blockchain.ibm.com',
            'api_port_tls': 30001,
            'api_port': 30001,
            'type': 'ca',
            'network_id': 'a5cacfd7717a4266a93abb3763647c30',
            'container_id': 'eb9fb4440ab031708b43ff078bdc1b39ea89ca4043a177667234289374a3af0d'
        }
    }
};

exports.config = config; // Exports for use in other files that require this one
