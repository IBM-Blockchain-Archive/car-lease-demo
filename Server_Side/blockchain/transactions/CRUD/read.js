/*eslint-env node */

var request = require('request');
var fs = require('fs');
//var x509 = require('x509');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../tools/map_ID/map_ID.js');
    
var result = {"transactions":[]};
var height = 1;
var stateHash = "";

var get_height = function(req, res) //Checks to see if chain height is greater than 0,
{
	tracing.create('ENTER', 'GET blockchain/transactions', {});
	var validV5cs = "";
	result = {"transactions":[]};
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	var options = {
		url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain',
		method: "GET"
	};
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			if(JSON.parse(body).height > 1)
			{
				height = JSON.parse(body).height;
				tracing.create('INFO', 'GET blockchain/transactions', "Retrieved height: "+height);
				get_block(req, res, 1);
			}
			else
			{
				tracing.create('EXIT', 'GET blockchain/transactions', result);
				res.send(result);
			}
		}
		else
		{
			res.status(400);
			var error = {}
			error.message = 'Unable to get chain length';
			error.error = true;
			tracing.create('ERROR', 'GET blockchain/transactions', error);
			res.send(error);
		}
	});
	
}
exports.read = get_height;

function get_block(req, res, number) //Retrieves block, and retrieves transactions within the block
{
	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	var options = {
		url: configFile.config.api_ip+':'+configFile.config.api_port_external+'/chain/blocks/'+number,
		method: "GET"
	};
	request(options, function (error, response, body){
		if (!error && response.statusCode == 200) {
			var block = JSON.parse(body);
			for(var i = 0; i < block.transactions.length; i++)
			{
				block.transactions[i].payload = new Buffer(block.transactions[i].payload, 'base64').toString('ascii');
				var cert = block.transactions[i].cert;
				cert = cert.replace(/(.{1,64})/g, '$1\n');
				cert = '-----BEGIN CERTIFICATE-----\n' + cert + '-----END CERTIFICATE-----\n'
				//block.transactions[i].cert = x509.parseCert(cert);
				block.transactions[i].caller = block.transactions[i].cert.subject.commonName;
				block.transactions[i].failed = false;
				if(stateHash == block.stateHash)
				{
					block.transactions[i].failed = true;
				}
				if(block.transactions[i].payload.indexOf("create_vehicle_log") == -1)
				{
					result.transactions.push(block.transactions[i]);
				}
			}
			stateHash = block.stateHash;
			if(number + 1 < height)
			{
				get_block(req, res, number + 1);
			}
			else if (req.session.user == "DVLA")
			{
				tracing.create('EXIT', 'GET blockchain/transactions', result);
				res.send(result);
			}
			else
			{
				tracing.create('INFO', 'GET blockchain/transactions', 'Evaluating transactions');
				result.transactions.reverse();
				evaluate_transactions(req, res);
			}
		}
		else
		{
			res.status(400);
			var error = {}
			error.message = 'Unable to get block ' + number;
			error.error = true;
			tracing.create('ERROR', 'GET blockchain/transactions', error);
			res.send(error);
		}
	});
}

function evaluate_transactions(req, res)
{
	var validV5cs = "";
	var user_id = map_ID.user_to_id(req.session.user)
	
	
	for(var i = 0; i < result.transactions.length; i++)
	{
		var transaction = result.transactions[i];
		var v5cID = transaction.payload.match(/[A-Z]{2}[0-9]{7}/g);
		if(JSON.stringify(transaction).indexOf(user_id) == -1 && validV5cs.indexOf(v5cID) == -1)
		{
			result.transactions.splice(i, 1);
			i--;
		}
		else if (validV5cs.indexOf(v5cID) == -1)
		{
			validV5cs += "["+v5cID+"]";
		}
	}

	tracing.create('EXIT', 'GET blockchain/transactions', result);
	result.transactions.reverse()
	res.send(result);
}

