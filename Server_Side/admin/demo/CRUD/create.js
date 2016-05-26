/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs')

var reload = require('require-reload')(require),
    participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");


var initial_vehicles = require(__dirname+"/../../../blockchain/assets/vehicles/initial_vehicles.js");


var send_error = false;
var counter = 0;
var users = [];
var cars = [];

var create = function(req,res)
{
	res.end(JSON.stringify({"message": "performing scenario creation now"}));
	fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', "");
	update_demo_status(JSON.stringify({"message":"Creating demo scenario"})+'&&');
	
	tracing.create('ENTER', 'POST admin/demo', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');

	if(initial_vehicles.vehicles.hasOwnProperty('cars'))
	{
		cars = initial_vehicles.vehicles.cars;
		counter = 0
		addUsers(req, res);
	}
	else
	{
		tracing.create('ERROR', 'POST admin/demo', 'Initial vehicles file not found');
		var error = {}
		error.message = 'Initial vehicles not found';
		error.error = true;
		update_demo_status(JSON.stringify(error));
	}
}

exports.create = create;

function addUsers(req, res)
{
	
	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");
	
	if(participants.participants_info.hasOwnProperty('regulators'))
	{
		var data = participants.participants_info;
		
		for(var key in data)
		{
			if(data.hasOwnProperty(key))
			{
				for(var i = 0; i < data[key].length; i++)
				{
					users.push({"type":key,"identity":data[key][i].name});
				}
			}
		}
		update_demo_status(JSON.stringify({"message":"Creating and registering users"})+'&&')
		addUser(req, res)
	}
	else
	{
		//tracing.create('ERROR', 'GET blockchain/participants', 'Participants file not found');
		var error = {}
		error.error = true;
		error.message = 'Participants information not found';
		update_demo_status(JSON.stringify(error))
	}
}

function addUser(req, res)
{
		
	var userAff;

	console.log("ADD USER BEFORE",users[counter]);

	switch (users[counter].type) {
			case "regulators": 
				userAff = "Regulator";
				break;
			case "manufacturers":
				userAff = "Manufacturer";
				break;
			case "dealerships":
				userAff = "Dealership";
				break;
			case "lease_companies":
				userAff = "Lease Company";
				break;
			case "leasees":
				userAff = "Leasee";
				break;
			case "scrap_merchants":
				userAff = "Scrap Merchant";
				break;
	}

	var data = {};
	data.user = users[counter].identity;
	data.role = 1;
	data.aff = userAff;

	console.log("ADD USER",JSON.stringify(data));

	var j = request.jar();
	var str = "user="+req.session.user;
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/participants';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		method: 'POST',
		json: data,
		jar: j
	}

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if(counter < users.length - 1)
			{
				counter++;
				update_demo_status(JSON.stringify({"message":"Created and registered user:" + users.identity, "counter": true})+'&&')
				setTimeout(addUser(req, res), 500);
			}
			else
			{
				deploy_vehicle_log(req, res);
			}
		}
		else
		{
			tracing.create('ERROR', 'POST admin/identity', 'Unable to log user in: '+users[counter].identity);
			var error = {}
			error.message = 'Unable to log user in: '+users[counter].identity;
			error.error = false;
			update_demo_status(JSON.stringify(error)+'&&');
			console.log('FAILED AREA');
			if(counter < users.length - 1)
			{
				counter++;
				setTimeout(addUser(req, res), 500);
			}
			else
			{
				deploy_vehicle_log(req, res);
			}
		}
	});
}

function deploy_vehicle_log(req, res)
{
	update_demo_status(JSON.stringify({"message":"Deploying vehicle log chaincode"})+'&&')
	var j = request.jar();
	var str = "user="+req.session.user
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/chaincode/vehicle_logs';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		body: "",
		method: 'POST',
		jar: j
	}

	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200) 
		{
			update_demo_status(JSON.stringify({"message":"Deploying vehicle chaincode"})+'&&')
			deploy_vehicle(req, res)
		}
		else
		{
			update_demo_status(JSON.stringify({"message":"Unable to deploy vehicle log chaincode", "error": true}))
		}
	});
}

function deploy_vehicle(req, res)
{

	var j = request.jar();
	var str = "user="+req.session.user
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/chaincode/vehicles';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		body: "",
		method: 'POST',
		jar: j
	}

	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200) 
		{
			counter = 0;
			setTimeout(function(){create_cars(req, res);},20000)

		}
		else
		{
			update_demo_status(JSON.stringify({"message":"Unable to deploy vehicle chaincode", "error": true}))
		}
	});
}

var v5cIDs = []

function create_cars(req, res)
{
	update_demo_status(JSON.stringify({"message":"Creating cars"})+'&&')
	console.log("Done waiting")
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	v5cIDs = []
	send_error = false;
	var prevCount = -1;
	var check_create = setInterval(function(){
		if(v5cIDs.length == cars.length && !send_error)
		{
			update_demo_status(JSON.stringify({"message":"Transferring vehicles to manufacturers"})+'&&')
			clearInterval(check_create)
			counter = 0;
			transfer_created_cars(req, res)
		}
		else if(send_error)
		{
			clearInterval(check_create)
			counter = 0;
			update_demo_status(JSON.stringify({"message":"Unable to write vehicle", "error": true}))
		}
		else if(v5cIDs.length > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status(JSON.stringify({"message":"Created vehicle "+v5cIDs[v5cIDs.length -1], "counter": true})+'&&')
			}
			prevCount = v5cIDs.length;
			create_car()
		}
	}, 500)
}
function create_car()
{
	
	console.log("CREATE CAR TIME",configFile.config.vehicle_name, configFile.config.vehicle_log_name);
	
	var j = request.jar();
	var str = "user=DVLA"
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/assets/vehicles';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		body: "",
		method: 'POST',
		jar: j
	}

	request(options, function(error, response, body)
	{
		if (!error && response.statusCode == 200 && body.indexOf('error') == -1) 
		{
			var array = body.split("&&");
			for(var i = 0; i < array.length; i++)
			{
				var data = JSON.parse(array[i]).message
				if(data.indexOf('Creating vehicle with v5cID:') != -1)
				{
					v5cIDs.push(data.substring(data.indexOf(':')+2, data.length).trim())
				}
			}
		}
		else
		{
			send_error = true;
		}
	});	

}
function transfer_created_cars(req, res)
{
	
	send_error = false;
	var prevCount = -1;
	var check_int = setInterval(function(){
		if(counter == cars.length && !send_error)
		{
			update_demo_status(JSON.stringify({"message":"Updating vehicles' details"})+'&&')
			clearInterval(check_int)
			counter = 0;
			ind_update_counter = 0;
			update_cars(req, res);
		}
		else if(send_error)
		{
			clearInterval(check_int)
			counter = 0;
			update_demo_status(JSON.stringify({"message":"Unable to transfer vehicles", "error": true}))
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status(JSON.stringify({"message":"Transfered vehicle "+v5cIDs[counter]+"(DVLA -> "+cars[counter].Owners[1]+")", "counter": true})+'&&')
			}
			prevCount = counter;
			transfer_car("DVLA", cars[counter].Owners[1], v5cIDs[counter], 'authority_to_manufacturer', "counter")
		}
	}, 500)
}
function transfer_car(sender, receiver, id, function_name, toUpdate)
{
	
	console.log("TRANSFER CAR TIME", sender,receiver,id);
	
	var data = {};
	data.function_name= function_name;
	data.value= receiver;

	var j = request.jar();
	var str = "user="+sender
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/assets/vehicles/'+id+'/owner';
	j.setCookie(cookie, url);
	var options = {
		url: url,
		json: data,
		method: 'PUT',
		jar: j
	}

	request(options, function(error, response, body)
	{
		if(toUpdate == "counter")
		{
			counter++
		}
		else
		{
			ind_transfer_counter++;
		}
		console.log("VEHICLE TRANSFER", id, body)
		if (!error && response.statusCode == 200 && body.indexOf('error') == -1) 
		{

		}
		else
		{
			send_error = true;
		}
	})
}
function update_cars(req, res)
{
	send_error = false;
	var prevCount = -1;
	var check_update = setInterval(function(){
		if(counter == cars.length && !send_error)
		{
			update_demo_status(JSON.stringify({"message":"Transferring vehicles to private owners"})+'&&')
			clearInterval(check_update)
			counter = 0;
			ind_transfer_counter = 2;
			
			transfer_updated_cars(req, res)
		}
		else if(send_error)
		{
			clearInterval(check_update)
			counter = 0;
			update_demo_status(JSON.stringify({"message":"Unable to update vehicles", "error": true}))
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status(JSON.stringify({"message":"Updated all fields for vehicle "+v5cIDs[counter], "counter": true})+'&&')
			}
			prevCount = counter;
			update_all_car_parts(v5cIDs[counter])
		}
	}, 500)
}

var ind_update_counter = 0;

function update_all_car_parts(id)
{
	var car_owner = cars[counter].Owners[1]
	var update_fields = [{"value":cars[counter].VIN,"field":"VIN", "title": "VIN"},{"value":cars[counter].Make,"field":"make", "title": "Make"},{"value":cars[counter].Model,"field":"model", "title": "Model"},{"value":cars[counter].Colour,"field":"colour", "title": "Colour"},{"value":cars[counter].Reg,"field":"reg", "title": "Registration"}]
	var prevCount = -1;
	var check_ind_update = setInterval(function(){
		if(ind_update_counter == 5)
		{
			ind_update_counter = 0;
			clearInterval(check_ind_update)
			counter++;
		}
		else if(send_error)
		{
			clearInterval(check_ind_update)
		}
		else if(ind_update_counter>prevCount)
		{
			prevCount = ind_update_counter;
			update_car(car_owner, update_fields[ind_update_counter].value, id, update_fields[ind_update_counter].field)
		}
	},500)
}

function update_car(manufacturer, value, id, field)
{
	
	console.log("UPDATE CAR TIME")
	
	var data = {};
	data.value= value
	data.oldValue = "undefined";

	var j = request.jar();
	var str = "user="+manufacturer;
	var cookie = request.cookie(str);
	var url = configFile.config.app_url + '/blockchain/assets/vehicles/'+id+'/'+field;
	j.setCookie(cookie, url);
	var options = {
		url: url,
		json: data,
		method: 'PUT',
		jar: j
	}

	request(options, function(error, response, body)
	{
		ind_update_counter++
		if (!error && response.statusCode == 200 && body.indexOf('error') == -1) 
		{
			console.log("UPDATE DONE", ind_update_counter)
		}
		else
		{
			send_error = true;
		}
	})
}

function transfer_updated_cars(req, res)
{
	
	console.log("TRANSFER UPDATED CARS");
	
	send_error = false;
	var prevCount = -1;
	var check_trans = setInterval(function(){
		if(counter == cars.length && !send_error)
		{
			clearInterval(check_trans)
			counter = 0;
			console.log("Demo setup");
			update_demo_status(JSON.stringify({"message":"Demo setup"}))
		}
		else if(send_error)
		{
			clearInterval(check_trans)
			counter = 0;
			update_demo_status(JSON.stringify({"message":"Unable to transfer vehicles", "error": true}))
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status(JSON.stringify({"message":"Transfered all owners for vehicle "+v5cIDs[counter], "counter": true})+'&&')
			}
			prevCount = counter;
			transfer_all_owners(v5cIDs[counter])
		}
	}, 500)
}

var ind_transfer_counter = 2;

function transfer_all_owners(id)
{
	var car_owner = cars[counter].Owners[1]
	var update_fields = [{"value":cars[counter].VIN,"field":"VIN", "title": "VIN"},{"value":cars[counter].Make,"field":"make", "title": "Make"},{"value":cars[counter].Model,"field":"model", "title": "Model"},{"value":cars[counter].Colour,"field":"colour", "title": "Colour"},{"value":cars[counter].Reg,"field":"reg", "title": "Registration"}]
	var prevCount = -1;
	var check_ind_transfer = setInterval(function(){
		if(ind_transfer_counter == cars[counter].Owners.length)
		{
			ind_transfer_counter = 2;
			clearInterval(check_ind_transfer)
			counter++;
		}
		else if(send_error)
		{
			clearInterval(check_ind_transfer)
		}
		else if(ind_transfer_counter>prevCount)
		{
			var types = ["manufacturer_to_private", "private_to_lease_company", "lease_company_to_private", "private_to_scrap_merchant"]
			prevCount = ind_transfer_counter;
			transfer_car(cars[counter].Owners[ind_transfer_counter-1], cars[counter].Owners[ind_transfer_counter], id, types[ind_transfer_counter-2], "ind_transfer_counter")
		}
	},500)
}


function update_demo_status(content)
{
	fs.appendFileSync(__dirname+'/../../../logs/demo_status.log', content);
}

