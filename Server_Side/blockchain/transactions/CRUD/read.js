/*eslint-env node */

var request = require('request');
var fs = require('fs');
var x509 = require('x509');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');
    
var result = {"transactions":[]};
var height = 1;
var stateHash = "";

var get_height = function(req, res)
{
	console.log('ENTERED');
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
				get_block(req, res, 1);
			}
			else
			{
				res.send(result);
			}
		}
		else
		{
			res.status(400);
			res.send({"error":"Unable to get chain length"});
		}
	});
	
}
exports.read = get_height;

function get_block(req, res, number)
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
				block.transactions[i].cert = x509.parseCert(cert);
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
				res.send(result);
			}
			else
			{
				result.transactions.reverse();
				evaluate_transactions(req, res);
			}
		}
		else
		{
			res.status(400);
			res.send({"error":"Unable to get block"});
		}
	});
}

function evaluate_transactions(req, res)
{
	var validV5cs = "";
	for(var i = 0; i < result.transactions.length; i++)
	{
		var transaction = result.transactions[i];
		var v5cID = transaction.payload.match(/[A-Z]{2}[0-9]{7}/g);
		if(JSON.stringify(transaction).indexOf(req.session.user) == -1 && validV5cs.indexOf(v5cID) == -1)
		{
			result.transactions.splice(i, 1);
			i--;
		}
		else if (validV5cs.indexOf(v5cID) == -1)
		{
			validV5cs += "["+v5cID+"]";
		}
	}

	result.transactions.reverse()
	res.send(result);
}

