/*eslint-env node */

var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js'),
	participants = reload(__dirname+"/../../../blockchain/participants/participants_info.js");
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs')
var map_ID = require(__dirname+"/../../../tools/map_ID/map_ID.js");


var initial_vehicles = require(__dirname+"/../../../blockchain/assets/vehicles/initial_vehicles.js");
var send_error = false;
var counter = 0;
var users = [];
var cars = [];
var cars_info;

var create = function(req,res)
{
	//req.body.scenario valid values = simple, full
	res.end(JSON.stringify({"message": "performing scenario creation now"}));
	fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', '{"logs": []}');
	
	tracing.create('ENTER', 'POST admin/demo', req.body);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var scenario = req.body.scenario;
	
	if(scenario == "simple")
	{
		cars_info = initial_vehicles.simple_scenario;
	}
	else if(scenario == "full")
	{
		cars_info = initial_vehicles.full_scenario;	
	}
	else
	{
		var error = {}
		error.message = 'Scenario type not recognised';
		error.error = true;
		update_demo_status(error);
	}
	
	if(cars_info.hasOwnProperty('cars'))
	{
		cars = cars_info.cars;
		counter = 0
		create_cars(req, res);
	}
	else
	{
		var error = {}
		error.message = 'Initial vehicles not found';
		error.error = true;
		update_demo_status(error);
	}
}

exports.create = create;

var v5cIDs = []

function create_cars(req, res)
{
	update_demo_status({"message":"Creating vehicles"})
	
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	v5cIDs = []
	send_error = false;
	var prevCount = -1;
	var check_create = setInterval(function(){
		if(v5cIDs.length == cars.length && !send_error)
		{
			update_demo_status({"message":"Transferring vehicles to manufacturers"})
			clearInterval(check_create)
			counter = 0;
			transfer_created_cars(req, res)
		}
		else if(send_error)
		{
			clearInterval(check_create)
			counter = 0;
			update_demo_status({"message":"Unable to write vehicle", "error": true})
		}
		else if(v5cIDs.length > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status({"message":"Created vehicle "+v5cIDs[v5cIDs.length -1], "counter": true})
			}
			prevCount = v5cIDs.length;
			create_car()
		}
	}, 500)
}
function create_car()
{
	
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
			update_demo_status({"message":"Updating vehicles' details"})
			clearInterval(check_int)
			counter = 0;
			ind_update_counter = 0;
			update_cars(req, res);
		}
		else if(send_error)
		{
			clearInterval(check_int)
			counter = 0;
			update_demo_status({"message":"Unable to transfer vehicles", "error": true})
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status({"message":"Transfered vehicle "+v5cIDs[counter]+"(DVLA -> "+cars[counter].Owners[1]+")", "counter": true})
			}
			prevCount = counter;
			transfer_car("DVLA", map_ID.user_to_id(cars[counter].Owners[1]), v5cIDs[counter], 'authority_to_manufacturer', "counter")
		}
	}, 500)
}
function transfer_car(sender, receiver, id, function_name, toUpdate)
{
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
			update_demo_status({"message":"Transferring vehicles to private owners"})
			clearInterval(check_update)
			counter = 0;
			ind_transfer_counter = 2;
			
			transfer_updated_cars(req, res)
		}
		else if(send_error)
		{
			clearInterval(check_update)
			counter = 0;
			update_demo_status({"message":"Unable to update vehicles", "error": true})
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status({"message":"Updated all fields for vehicle "+v5cIDs[counter], "counter": true})
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

		}
		else
		{
			send_error = true;
		}
	})
}

function transfer_updated_cars(req, res)
{	
	send_error = false;
	var prevCount = -1;
	var check_trans = setInterval(function(){
		if(counter == cars.length && !send_error)
		{
			clearInterval(check_trans)
			counter = 0;
			update_demo_status({"message":"Demo setup"})
		}
		else if(send_error)
		{
			clearInterval(check_trans)
			counter = 0;
			update_demo_status({"message":"Unable to transfer vehicles", "error": true})
		}
		else if(counter > prevCount)
		{
			if(prevCount != -1)
			{
				update_demo_status({"message":"Transfered all owners for vehicle "+v5cIDs[counter], "counter": true})
			}
			prevCount = counter;
			transfer_all_owners(v5cIDs[counter])
		}
	}, 500)
}

var ind_transfer_counter = 2;

function transfer_all_owners(id)
{
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
			transfer_car(cars[counter].Owners[ind_transfer_counter-1], map_ID.user_to_id(cars[counter].Owners[ind_transfer_counter]), id, types[ind_transfer_counter-2], "ind_transfer_counter")
		}
	},500)
}


function update_demo_status(content)
{
	var demo_status_file = fs.readFileSync(__dirname+'/../../../logs/demo_status.log');
	var demo_status = JSON.parse(demo_status_file)
	demo_status.logs.push(content)
	fs.writeFileSync(__dirname+'/../../../logs/demo_status.log', JSON.stringify(demo_status))
	if(!content.hasOwnProperty('error'))
	{
		if(content.message == "Demo setup")
		{
			tracing.create('EXIT', 'POST admin/demo', content);
		}
		else
		{
			tracing.create('INFO', 'POST admin/demo', content.message);
		}
	}
	else
	{
		tracing.create('ERROR', 'POST admin/demo', content);
	}
}

