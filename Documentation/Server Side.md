#Server Side

* [Overview](#overview)
* [Folder Structure](#folder-structure)
* [API Methods](#api-methods)
* [Configuration File](#configuration-file)
* [Sessions](#sessions)

##Overview
The Application’s server side logic is a NodeJS server that uses express to create a RESTful API served using expressjs that can be called by the client side using HTTP requests. The API is outlined in the API methods file and is designed to try and be general so that most of it can be swapped out of a car leasing scenario and used in another demo with the majority of functions formatting data in a generic manner that the client side can then turn into the demo. The NodeJS server is the component of the application which directly interacts with the HyperLedger fabric making call outs using HTTP requests to the API HyperLedger provides. The HTTP requests can invoke, query and deploy chaincode as well as querying the Blockchain.

##Folder structure
The file run by the NodeJS server on startup is called app.js and is located in the main directory. This file acts as a router by using expressjs to take in requests and then call the correct file based on it. The API is outlined in the API methods file and the folder structure is based around this so all files that are called as part of the API are located in Server_Side and then subfolders based around the API call. The actual executed code for that call is located in the CRUD folder in a file based of the call type (POST → create, GET → read, PUT → update DELETE → delete) and the file with the same name as the end of the API call section exports that code as the function to be called. For example the API call:

    GET blockchain/blocks
  
Would have a file called blocks.js located in `Server_Side/blockchain/blocks` that exported function in file read.js located in `Server_Side/Blockchain/blocks/CRUD` as read.

If an API call takes in a parameter then the file would be located in a singular of previous folder so the API call to get the third block in the chain:

    GET Blockchain/blocks/3
  
Would have a file called block.js in `Server_Side/blockchain/blocks/block` that exported the function in file read.js located in `Server_Side/Blockchain/blocks/block/CRUD` as read.

##API Methods

Documentation on the API can be found in the [API Methods.md](/Documentation/API Methods.md) file.

##Configuration File

The configuration file has in it an object called config that is exported so that it can be accessed by files that require the file. The object contains that configuration settings for a number of things required by the app.

###config.trace

If set to true then the application will write to a file a log of what has been called on the server. Used by the Server_Side/tools/traces/CRUD/create.js to decide whether it should write to file or not.

###config.traceFile

Defines the file path of where the logging of the server should be written to. Used by the Server_Side/tools/traces/CRUD/create.js to select the file to write its output to.

###config.networkFile

Defines a file path to the file defining the network. If it is set then app.js will use that data to update the configuration file. If it is set to null then the hardcoded values in the configuration file will be used. The file linked to should match the format of the Bluemix VCAP data. An example file is [mycreds.json](/mycreds.json).

###config.networkProtocol

Defines the protocol to be used by the rest api for connecting to the peer. This is only used when running with config.networkFile defined and is used by app.js to create the api_ip concatenating it with the api-host from the file define in config.networkFile.

###config.api_ip

Defines the IP of the Blockchain peer that is used to interact with the ledger. Used by all files that call out to the fabric such as invoking chaincode or reading the chain height.

###config.api_port_external

Defines the external port of the Blockchain peer that is used to interact with the ledger. This is to account for a vagrant environment that means as becuase port forwarding is used the port is different when calling the peer from outside vagrant than the one when inside vagrant. Used by all files on the server that call out to the fabric such as invoking chaincode or reading the chain height.

###config.api_port_internal

Defines the internal port of the Blockchain peer that is used to interact with the ledger. This is to account for a vagrant environment that means as becuase port forwarding is used the port is different when calling the peer from outside vagrant than the one when inside vagrant. This is the port that is sent to the chaincode on deploy so that the chaincode can call the peer. The chaincode requires the internal port as it is executed within the vagrant VM.

###config.api_port_discovery

Defines the port used by HFC for the Node SDK connection. Used by files that create users.

###config.ca_ip

Defines the IP address of the certifcate authority. Used by files that use HFC for the members services url.

###config.ca_port

Defines the port used for connecting via HFC to the certificate authority. Used by files that use HFC for the members services url.

###config.registrar_name

Defines the identity of the user that should be enrolled by HFC to be the registrar so that they can register new users.

###config.registrar_password

Defines the password of the user that should be enrolled by HFC to be the registrar so that they can register new users.

###config.app_url

The URL of the NodeJS server. Used by files that need to make HTTP requests to the server such as the vehicle updates requesting the read function.

###config.app_port

The port that the NodeJS server is running on. Used by files that need to make HTTP requests to the server such as the vehicle updates requesting the read function.

###config.vehicle

The address that the vehicle chaincode is located at. If running locally the chaincode will need to be located in $GOPATH/src/github.com/fabric and the file path used in the configuration file must start at github.com and run to the folder not the go file. If running on Bluemix the chaincode must be stored in a public GitHub and the value for config.vehicle must be the git URL, including http:// and excluding parts such as master and tree, to the folder the go file is stored in. This URL is used when deploying chaincode on startup and by the Server_Side/blockchain/chaincode/vehicles/CRUD/create.js

###config.vehicle_name

The name returned when deploying the vehicle chaincode. It is overwritten when the server deploys it to be the latest one returned. It is used by all files that interact with the chaincode.

##Sessions

The server uses sessions to handle which users are making the call. Each call made to the API will have a req.session field. The sessions are created by the Server_Side/admin/identity/create.js file and the req.session object has two fields: user and identity. User is the username of the user such as Andrew Hurt whilst identity stores their identity on the Blockchain so in the case of Andrew Hurt this is Andrew_Hurt. The identity is used for when they interact with the fabric and the user is used by the transaction API to see whether the user is the DVLA who has powers to read all.
