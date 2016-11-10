/*eslint-env node */

//TO DO:
// -- Clean up vehicle chaincode and process for passing in users and eCert. Use JSON objects instead

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../configuration.js'),
	participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var spawn = require('child_process').spawn;
var fs = require('fs');
var crypto = require('crypto');
var hfc = require('hfc');

var send_error = false;
var counter = 0;
var innerCounter = 0;
var error_number = 0;
var ecertCounter = 0;
var users = [];
var userEcert;
var userEcertHolder = [];
var chain;

var deployer;
var attrList = ["name", "affiliation"];

var create = function()
{
	configFile = reload(__dirname+'/../../configuration.js');
	tracing.create('ENTER', 'Startup', {});

	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");

	tracing.create('INFO', 'Startup', 'Locating initial participants');

	//Build the array of JSON objects from participants_info.js to use for registering if they don't already exist and enrolling
	if(participants.participants_info.hasOwnProperty('regulators'))
	{
		var data = participants.participants_info;

		for(var key in data)
		{
			if(data.hasOwnProperty(key))
			{
				for(var i = 0; i < data[key].length; i++)
				{
					users.push({"type":key,"identity":data[key][i].identity, "password":data[key][i].password});
				}
			}
		}
	}
	else
	{
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		tracing.create('ERROR', 'Startup', error);

		return JSON.stringify(error)
	}
	//Load the array of peers in the blockchain network, by default we use the first peer in the array
	var api_ip = configFile.config.api_ip
	api_ip = api_ip[0].substring(api_ip.indexOf("://")+3);

	var pem = null
	var registrar_name = configFile.config.registrar_name
	var registrar_password = configFile.config.registrar_password

	chain = hfc.newChain("theChain");
	//This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
	chain.setKeyValStore( hfc.newFileKeyValStore(configFile.config.key_store_location) );
	chain.setDeployWaitTime(60);

	//Retrieve the certificate if grpcs is being used
	if(configFile.config.hfc_protocol == 'grpcs'){
		chain.setECDSAModeForGRPC(true);
		pem = fs.readFileSync(__dirname +'/../../../../'+configFile.config.certificate_file_name);
	}

	chain.setMemberServicesUrl(configFile.config.hfc_protocol+"://"+configFile.config.ca_ip+":"+configFile.config.ca_port, {pem:pem});
	chain.addPeer(configFile.config.hfc_protocol+"://"+api_ip+":"+configFile.config.api_port_discovery, {pem:pem});
	chain.enroll(registrar_name, registrar_password, function(err, registrar) {

		if (!err){
			// Successfully enrolled registrar and set this user as the chain's registrar which is authorized to register other users.
			tracing.create('INFO', 'Startup', 'Registrar enroll worked with user ' + registrar_name);
			chain.setRegistrar(registrar);
		}
		else{
			tracing.create('INFO', 'Startup', 'Failed to register using HFC, user may have already been enrolled. '+err);
		}

		//Start the process of registering and enrolling the demo participants with the CA
		addUser()
	});
}

function addUser()
{
	var userAff = "00000";

	//mapping participant type to an integer which will be stored in the user's eCert as their affiliation. Dealerships and Leasees both map to the same affiliation as they are both seen as 'Private entities'
	switch (users[counter].type) {
			case "regulators":
				userAff = "00001";
				break;
			case "manufacturers":
				userAff = "00002";
				break;
			case "dealerships":
				userAff = "00003";
				break;
			case "lease_companies":
				userAff = "00004";
				break;
			case "leasees":
				userAff = "00003";
				break;
			case "scrap_merchants":
				userAff = "00005";
				break;
	}

  var attrs = [{name:'affiliation',value:userAff},{name:"name",value:users[counter].identity}];

  chain.getUser(users[counter].identity, function(err, user) {
    if (err) {
      tracing.create('ERROR', 'Startup', {"message":"Failed getting user: " + err, "error":true})
    }
    else {
      var userId = user.getName();

      if (users[counter].type == "regulators") {
        deployer = user;
      }

      var registrationRequest = {
        enrollmentID: users[counter].identity,
        affiliation: 'bank_a',
        attributes: attrs
      }

      user.register(registrationRequest, function(err) {
        if (err) {
          tracing.create('ERROR', 'Startup', {"message": "Failed to register user: " + err, "error":true});
        }
        else {
          var userSecret = JSON.parse(user.toString()).enrollmentSecret;

          user.enroll(userSecret, function(err) {
            if (err) {
              tracing.create('ERROR', 'Startup', {"message": "Failed to enroll user: " + err, "error":true});
            }
            else {
              user.getUserCert(attrList, function(err, userCert) {
                if (err) {
                  tracing.create('ERROR', 'Startup', {"message": "Failed getting user certificate: " + err, "error":true});
                }
                else {
                  userEcertHolder.push(userId, userCert.encode().toString('base64'));
                  if (counter < users.length - 1) {
                    counter++;
                    writeUserToFile(userId, userSecret, function() { addUser(); });
                  }
                  else {
                    get_height(function() {
                      deploy_vehicle();
                    });
                  }
                }
              }); // user.getUserCert(...)
            }
          }); // user.enroll(...)
        }
      }); // user.register(...)
    }
  }); // chain.getUser(...)
}

function get_height(cb){

	tracing.create('INFO', 'Startup', 'Getting initial height of the blockchain');

	var interval = setInterval(function(){
		var options = 	{
			url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
			method: "GET",
			json: true
		}

		request(options, function(error, response, body){
			if(!error && body && body.height >= 1){
					error_number = 0;
					update_config("start_height",body.height)
					cb();
					clearInterval(interval)
			}
			else{
				if(error_number > 5){
					error_number = 0;
					tracing.create('ERROR', 'Startup', {"message": "Couldn't get blockchain height", "error": false});
					clearInterval(interval)
				}
				error_number++
				tracing.create('INFO', 'Startup', 'Error, trying to get the blockchain height again');
			}
		});
	}, 1000)
}

function deploy_vehicle() //Deploy vehicle chaincode
{
	configFile = reload(__dirname+'/../../configuration.js');
	tracing.create('INFO', 'Startup', 'Deploying vehicle chaincode');

	var api_url = configFile.config.api_ip+":"+configFile.config.api_port_internal

  var deployRequest = {
    chaincodePath: configFile.config.vehicle,
    fcn: "init",
    args: userEcertHolder
  }

  var deployTx = deployer.deploy(deployRequest);

  deployTx.on('submitted', function(results) {
    tracing.create('INFO', 'Startup', "Deploy request submitted successfully");
  });

  deployTx.on('complete', function(results) {
    tracing.create('INFO', 'Startup', 'Chaincode deployed successfully');
    update_config("vehicle_name", results.chaincodeID);
  });

  deployTx.on('error', function(error) {
    tracing.create('ERROR', 'Startup', {"message":"Failed to deploy chaincode", "error":true});
  });
}

function update_config(attr, name)
{
	tracing.create('INFO', 'Startup', 'Updating config file');
	configFile = reload(__dirname+'/../../configuration.js');

	fs.readFile(__dirname+'/../../configuration.js', 'utf8', function (err,data)
	{
		if (err)
		{
			tracing.create('ERROR', 'Startup', {"message": "Config file not found", "error": false});

			return false
		}

		var toMatch = "config."+attr+" = '"+ configFile.config[attr]+"';"
		var re = new RegExp(toMatch, "g")

		var result = data.replace(re, "config."+attr+" = '"+name+"';");

		fs.writeFileSync(__dirname+'/../../configuration.js', result, 'utf8', function (err)
		{
			if (err)
			{
				tracing.create('ERROR', 'Startup', {"message": "Unable to update config file", "error": false});
				return false
			}
			else
			{

				tracing.create('INFO', 'Startup', {"message": "Config file updated", "error": false});
				configFile = reload(__dirname+'/../../configuration.js');
				return true
			}
		});
	});
}

function writeUserToFile(username, secret,cb)
{
	tracing.create('INFO', 'Startup', 'Writing user "'+username+'" to file');
	participants = reload(__dirname+'/../../../blockchain/participants/participants_info.js');

	var userType = "";
	var userNumber = "";

	for(var k in participants.participants_info)
	{
		if (participants.participants_info.hasOwnProperty(k))
		{
			var data = participants.participants_info[k];

			for(var i = 0; i < data.length; i++)
			{
				if(data[i].identity == username)
				{
					userType = k;
					userNumber = i;

					break;
				}
			}
		}
	}

	var newData = participants.participants_info;
	newData[userType][userNumber].password = secret;

	var updatedFile = '/*eslint-env node*/\n\n\n\nvar participants_info = '+JSON.stringify(newData)+'\n\nexports.participants_info = participants_info;';

	fs.writeFileSync(__dirname+'/../../../blockchain/participants/participants_info.js', updatedFile);

	cb(null)
}

exports.create = create;
