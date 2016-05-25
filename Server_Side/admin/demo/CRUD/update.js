var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');	
var spawn = require('child_process').spawn;
var fs = require('fs')

var send_error = false;
var counter = 0;
var users = [];
var cars = [];

var update = function(req,res)
{
	tracing.create('ENTER', 'POST admin/demo', []);
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	counter = 0;
	killPeers(req, res)
}

exports.update = update;

function killPeers(req, res)
{
	res.write(JSON.stringify({"message":"Killing existing blockchain processes"}) + '&&')
	var deploySh = spawn('sh', [__dirname+'/../kill_peers.sh'],{
		uid:1000,
		close: checkKilled(req, res)
	});
}

function checkKilled(req, res)
{
	var deploySh = spawn('sh', [__dirname+'/../check_running.sh'], {
		uid:1000
	});

	deploySh.stdout.on('data', function(data){
		if(data.toString().trim() == 'false')
		{
			counter = 0;
			startCA(req, res)
		}
		else if(counter < 5)
		{
			counter++
			setTimeout(function(){killPeers(req, res);}, 2500)
		}
		else
		{
			var error = {}
			error.message = 'Unable to kill peer';
			error.error = true;
			res.end(JSON.stringify(error))
		}
	})
}

function startCA(req, res)
{
	counter = 0;
	res.write(JSON.stringify({"message":"Restarting CA"}) + '&&')
	var deploySh = spawn('sh', [__dirname+'/../restart_ca.sh'],{
		uid:1000,
		close: setTimeout(function(){
			startPeer(req, res) }, 2500)
	});
}

function startPeer(req, res)
{
	counter++
	res.write(JSON.stringify({"message":"Restarting Peer"}) + '&&')
	var deploySh = spawn('sh', [__dirname+'/../restart_peer.sh', "COPY"],{
		uid:1000,
		close: setTimeout(function(){check_peer_counter = 0; checkPeerRunning(req, res)}, 5000)
	});
}
var check_peer_counter = 0;

function checkPeerRunning(req, res)
{
	fs.readFile(__dirname+'/../../../logs/peer_log.log', function(err, data){
		if(err) 
		{
			console.log(err)
		}
		else if(data.toString().indexOf('Failed to listen') > -1)
		{
			var error = {}
			error.message = 'Unable to start peer. Peer already running';
			error.error = true;
			res.end(JSON.stringify(error))
		}
		else if(data.toString().indexOf('Starting peer with id') > -1)
		{
			counter = 0;
			confComplete(req, res)
		}
		else if (data.toString().indexOf('try again'))
		{
			if(counter < 5)
			{
				if(check_peer_counter > 3)
				{
					startPeer(req, res)
				}
				else 
				{
					check_peer_counter++
					setTimeout(function(){checkPeerRunning(req, res)}, 2500)
				}
			}
			else
			{
				res.end(JSON.stringify({'message':'Unable to start peer. Request timed out.', 'error':true}))
			}
		}
	})
}

function confComplete(req, res)
{
	var interval = setInterval(function(){
		if(counter < 5){
			var options = 	{
				url: configFile.config.api_ip+":"+configFile.config.api_port_external+'/chain',
				body: {},
				json: true,
				method: "GET"
			};
	
			request(options, function (error, response, body){
				if (!error && response.statusCode == 200) {
					if(body.height > 0){
						clearInterval(interval);
						counter = 0;
						res.write(JSON.stringify({"message":"Registering users"})+'&&')					
						loadUsers(req, res);
					}
				}
			});
			counter++
		}
		else{
			res.status(400)
			tracing.create('ERROR', 'POST admin/demo', 'Unable to confirm reset. Request timed out.')
			var error = {}
			error.message = 'Unable to confirm reset. Request timed out.';
			error.error = true;
			res.end(JSON.stringify(error))
			clearInterval(interval);
		}
	},5000)
}

function loadUsers(req, res)
{
	fs.readFile(__dirname+"/../../../blockchain/participants/participants.json", "utf8", function(err, data)
	{
		if(err)
		{
			res.status(404)
			//tracing.create('ERROR', 'GET blockchain/participants', 'Participants file not found');
			var error = {}
			error.error = true;
			error.message = 'Participants file not found';
			res.end(JSON.stringify(error))
		}
		else
		{
			try
			{
				data = JSON.parse(data)
			}
			catch(e)
			{
				res.status(400)
				//tracing.create('ERROR', 'GET blockchain/participants', 'Invalid JSON object');
				var error = {}
				error.error = true
				error.message = 'Invalid JSON object';
				res.end(JSON.stringify(error))
				return;
			}
			for(var key in data)
			{
				if(data.hasOwnProperty(key))
				{
					for(var i = 0; i < data[key].length; i++)
					{
						users.push(data[key][i].identity.split(' ').join('_'))
					}
				}
			}
			loginUsers(req, res)
		}
	})
}

function loginUsers(req, res)
{

	var enrollmentDetails = {
					"enrollId":users[counter],
					"enrollSecret":"ibm4you2"
				}
	
	var options = 	{
				url: configFile.config.api_ip+":"+configFile.config.api_port_external+'/registrar',
				body: enrollmentDetails,
				json: true,
				method: "POST"
			};
	
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			if(counter < users.length - 1)
			{
				counter++;
				setTimeout(loginUsers(req, res), 500);
			}
			else
			{
				res.end(JSON.stringify({"message":"Demo reset"}))
			}
		}
		else
		{
			res.status(400)
			tracing.create('ERROR', 'POST admin/identity', 'Unable to log user in: '+users[counter]);
			var error = {}
			error.message = 'Unable to log user in: '+users[counter];
			error.error = true;
			res.end(JSON.stringify(error))
		}
	});
	
}






