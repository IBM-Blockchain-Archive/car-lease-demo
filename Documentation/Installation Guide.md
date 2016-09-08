Installation Guide
=======
## Deploying to Bluemix ##
To deploy to Bluemix simply use the button below then follow the instructions. This will generate the NodeJS server and the Blockchain service for you.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/jpayne23/car-lease-demo-1.git)
##Deploying Locally##

###Prerequisites###
To deploy locally you will need to have installed:

 - [HyperLedger Fabric](https://github.com/hyperledger-archives/fabric/blob/master/docs/dev-setup/devenv.md) (commit level: [3e0e80a898b259fe463295eabff80ee64f20695e](https://github.com/hyperledger-archives/fabric/commit/3e0e80a898b259fe463295eabff80ee64f20695e)) (Note: This is only required if you are going to run a blockchain peer locally as well)
 - [NodeJS v4.x](https://nodejs.org/en/download/)
 - [npm](https://docs.npmjs.com/getting-started/installing-node)
 - [Git](https://git-scm.com/download)

###Cloning the repository###
Open up a terminal or command window where you wish to have the app then run:

    git clone https://github.com/ibm-blockchain/car-lease-demo.git

###Files to copy###
If you are running your peer locally i.e. not on Bluemix then copy the core.yaml file from Local_Files to the /peer folder of hyperledger/fabric to ensure that the security settings are correct.

You will then need to copy the vehicle_code folder from the Chaincode folder into the main fabric folder of hyperledger. This is only required if running the peer locally otherwise the demo will download the chaincode from github.

###Installing npm required modules###
The application makes use of a number of modules developed externally that must be installed to run. To do this open a terminal or command window in the car-lease-demo folder and run the command:

    npm install

###Updating the configurations file###

If you run everything as its default settings locally then you should only have to make one change to the configurations file.

More information on the configuration file can be found in [Server Side.md](/Documentation/Server Side.md)

####Pointing to chaincode file

By default the configuration file will point at chaincode on github.com. If you are running the peer locally you will need to change config.vehicle to github.com/fabric/vehicle_code.

####Connecting to a non-default NodeJS server####

The NodeJS server by default runs on localhost:80. If you are running in a different location then in Server_Side/configurations/configuration.js change the `app_url` variable to be the url of where the app server should run including the port. You will also need to change `app_port` to be the port for the NodeJS server.

####Connecting to a non-default setup local peer####
The configurations file by default is set up to use a local peer set up using the HyperLedger fabric default settings e.g. IP of 127.0.0.1 and external and internal ports 5000. If your local peer uses different settings then you will need to change the Server_Side/configurations/configuration.js file to reflect this you will need to update:

- `api_ip` to be the IP address of the peer
- `api_port_external` to be the port to connect to the peer's rest API from outside vagrant.
- `api_port_internal` to be the port to connect to the peer's rest API from inside vagrant.
- `api_port_discovery` to be the discovery port of the peer
- `ca_ip` to be the IP address of the certificate authority
- `ca_port` to be the discovery port of the certificate authority

####Connecting to an external Bluemix Peer####
To connect to an external Bluemix peer copy the peers VCAP varibales into a file locally to the NodeJS server (An example file is myCreds.json).  In the Server_Side/configurations/configuration.js file change `networkFile` to be the filepath to the file. The app will overwrite the configuration file to update it with the settings from this file.

More information on the configuration file can be found in the [Server Side.md](/Documentation/Server Side.md) file.

###Setting up the GRPC connection###
By default the grpc connection is set to grpcs to accomodate Bluemix. If you are running your CA locally then you will need to change this to grpc on lines 43 and 45 of Server_Side/configurations/startup/CRUD/create.js. You will also need to pem to equal null on line 40.

You will also need to ensure that the folder /tmp/keyValStore exists on the machine NodeJS is running on.

###Running the application###
To run the app start the NodeJS server by opening a terminal or command prompt window in the car-lease-demo folder and then running:

    node app.js
  *Note: On Ubuntu you may have to run nodejs instead of node*

You can then view it by opening your browser to where you have NodeJS running. By default it will load on http://localhost.
