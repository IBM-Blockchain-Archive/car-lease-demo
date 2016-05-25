/*eslint-env node */
"use strict";

var request = require('request');
var fs = require('fs')
// This connector let's us register users against a CA
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js'),
    participants = reload(__dirname+'/../participants_info.js');

// Use a tag to make logs easier to find
var TAG = "user_manager";

/**
 * Registers a new user against the given CA.
 * @param username The name of the user.
 * @param role The role to assign to the user. [Don't need role anymore, can be hardcoded to 1]
 * @param cb A callback of the form: function(err, credentials);
 */

var counter = 0;

var registerUser = function(dataSource, username, role, aff, res) {

    if (!dataSource.connector) {
    	res.status(400);
    	res.send(JSON.stringify({"message":"Cannot register users before the CA connector is setup!", "error":true}));
    }
    
    var numberAff = "0000"
    
    switch(aff)
	{
		case "Regulator":
			numberAff = "0001";
			break;
		case "Manufacturer":
			numberAff = "0002";
			break;
		case "Dealership":
			numberAff = "0003";
			break;
		case "Lease Company":
			numberAff = "0004";
			break;
		case "Leasee":
			numberAff = "0003";
			break;
		case "Scrap Merchant":
			numberAff = "0005";
			break;
	}

    // Register the user on the CA
    var user = {
    	"identity": username,
    	"role": role,
    	"account": "group1",
    	"affiliation": numberAff
    }
 
    dataSource.connector.registerUser(user, function (err, response) {
        if (err) {
        	
        	if(counter >= 5){
        		counter = 0;
        		console.error(TAG, "RegisterUser failed:", username, JSON.stringify(err));
        		res.status(400)
        		res.send(JSON.stringify({"error":err}));
        	}
        	else{
	            counter++
	            console.log("Trying again", counter);
	            setTimeout(function(){registerUser(dataSource,username,role,aff,res);},2000)	            
        	}

        } else {
        	
        	counter = 0;
        	
            console.log(TAG, "RegisterUser succeeded:", JSON.stringify(response));
            // Send the response (username and secret) to the callback
            var creds = {
                id: response.identity,
                secret: response.token
            };
            //updateParticipantInfo(creds, res);
            setTimeout(function(){loginUser(username, aff, creds.secret, res);},2000)
        }
    });

}

function loginUser(username, aff, secret, res)
{
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var credentials = {
						  "enrollId": username,
						  "enrollSecret": secret
						}
	
	var options = 	{
						url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/registrar',
						method: "POST", 
						body: credentials,
						json: true
					}
					
	request(options, function(error, response, body){
		
		if (!error && response.statusCode == 200)
		{
			writeUserToFile(username, aff, secret, res)
			//res.send(JSON.stringify({"message":"User created and registered with peer.", "id": username, "secret": secret}))
		}
		else
		{
			res.status(400)
			res.send(JSON.stringify({"message":"Unable to register user with peer", "error":true}))
		}
	})

}

function writeUserToFile(username, aff, secret, res)
{
	participants = reload(__dirname+'/../participants_info.js');
	
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
	if(userType == "")
	{
		switch(aff)
		{
			case "Regulator":
				userType="regulators";
				break;
			case "Manufacturer":
				userType="manufacturers";
				break;
			case "Dealership":
				userType="dealerships";
				break;
			case "Lease Company":
				userType="lease_companies";
				break;
			case "Leasee":
				userType="leasees";
				break;
			case "Scrap Merchant":
				userType="scrap_merchants";
				break;
		}
		console.log("USER TYPE", aff, userType);
		userNumber = newData[userType].length;
		newData[userType].push({})
		newData[userType][userNumber].name = username;
		newData[userType][userNumber].identity = username;
		newData[userType][userNumber].address_line_1 = "123 Abc Street";
		newData[userType][userNumber].address_line_2 = "Milton Keynes";
		newData[userType][userNumber].address_line_3 = "Buckinghamshire";
		newData[userType][userNumber].postcode = "MK9 3GA"
		
		var configData = "config.participants.users."+userType+"["+userNumber+"] = {}\n";
		configData += "config.participants.users."+userType+"["+userNumber+"].company = '"+username+"'\n";
		configData += "config.participants.users."+userType+"["+userNumber+"].type = '"+aff+"'\n";
		configData += "config.participants.users."+userType+"["+userNumber+"].user = 'Laura'\n";
		fs.appendFileSync(__dirname+'/../../../../Client_Side/JavaScript/config/config.js', configData);
			
	}
	newData[userType][userNumber].password = secret;
	
	var updatedFile = '/*eslint-env node*/\n\nvar user_info = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["users"];\n\nvar participants_info = '+JSON.stringify(newData)+'\n\nexports.participants_info = participants_info;';
	
	fs.writeFileSync(__dirname+'/../participants_info.js', updatedFile);
	
	res.send(JSON.stringify({"message":updatedFile, "id": username, "secret": secret}))
}

/*
function updateParticipantInfo(creds, res) {
		
}
*/

exports.create = registerUser;