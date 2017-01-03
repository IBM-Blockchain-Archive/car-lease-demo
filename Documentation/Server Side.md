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

###config.networkProtocol
Defines the protocol to be used by the rest api for connecting to the peer. This should be `http` or `https`.

###config.appProtocol
Defines the protocol to be used by the nodeJS app. This should be `http` or `https`.

###config.hfcProtocol
Defines the protocol to be used HFC to talk to the peer. This should be `grpc` or `grpcs`.

###config.trace

If set to true then the application will write to a file a log of what has been called on the server. Used by the Server_Side/tools/traces/CRUD/create.js to decide whether it should write to file or not.

###config.traceFile

Defines the file path of where the logging of the server should be written to. Used by the Server_Side/tools/traces/CRUD/create.js to select the file to write its output to.

###config.registrar_name

Defines the identity of the user that should be enrolled by HFC to be the registrar so that they can register new users.

###config.registrar_password

Defines the password of the user that should be enrolled by HFC to be the registrar so that they can register new users.

###config.offlineUrl

The URL of the NodeJS server. Used by files that need to make HTTP requests to the server such as the vehicle updates requesting the read function.

###config.appPort

The port that the NodeJS server is running on. Used by files that need to make HTTP requests to the server such as the vehicle updates requesting the read function.

###config.vehicle

This is the location of the chaincode's go file. The file structure is \$GOPATH/src/`config.vehicle` . The $GOPATH is set to `./Chaincode` in `app.js`

##Sessions

The server uses sessions to handle which users are making the call. Each call made to the API will have a req.session field. The sessions are created by the Server_Side/admin/identity/create.js file and the req.session object has two fields: user and identity. User is the username of the user such as Andrew Hurt whilst identity stores their identity on the Blockchain so in the case of Andrew Hurt this is Andrew_Hurt. The identity is used for when they interact with the fabric and the user is used by the transaction API to see whether the user is the DVLA who has powers to read all.
