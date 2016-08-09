#Startup Process
When the NodeJS server starts up app.js is the file run. When this starts the express server, using the createServer command, it calls Server_Side/configurations/startup/CRUD/create.js. This file runs commands to get the environment set up ready for start-up in the following order:

##Registering Users
The code loads up the users that are located in the participants_info.js file and goes through each of their identities calling to the Blockchain Rest API registrar endpoint to log them in. If the login responds that the user hasn't been created then it uses HFC to create a new user. It then logs in the new user.

##Deploying Chaincode
The demo deploys the vehicle chaincode as the user DVLA. This chaincode is what is used in the demo to define vehicles and who can do what with them. It passes an array of users and their ecerts in the format [user, ecert, user, ecert, ...]. These are used by the chaincode so that it knows the identities of the users and who has what permission. 

The code then updates the server side configuration file to contain the name of the newly deployed chaincode.

##Polling Chain Height
The app polls the height of the blockchain and if the height becomes greater than 1 then it assumes the chaincode is deployed and the code finishes.
