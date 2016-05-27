/*eslint-env node */
"use strict";

var request = require('request');
var fs = require('fs')
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js'),
    participants = reload(__dirname+'/../participants_info.js');

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
        		console.error("RegisterUser failed:", username, JSON.stringify(err));
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
        	
            console.log("RegisterUser succeeded:", JSON.stringify(response));
            // Send the response (username and secret) for logging user in 
            var creds = {
                id: response.identity,
                secret: response.token
            };
            loginUser(username, aff, creds.secret, res);
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
		if (!body.hasOwnProperty("Error") && response.statusCode == 200)
		{
			counter = 0;
			console.log("LOGIN SUCCESSFUL", username)
			writeUserToFile(username, aff, secret, res)
		}
		else
		{
			if(counter >= 5){
        		counter = 0;
        		res.status(400)
				res.send(JSON.stringify({"message":"Unable to register user with peer", "error":true}))
        	}
			else{
	            counter++
	            console.log("Trying logging in again", counter);
	            setTimeout(function(){loginUser(username, aff, secret, res);},2000)	            
        	}
			
		}
	});
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

exports.create = registerUser;