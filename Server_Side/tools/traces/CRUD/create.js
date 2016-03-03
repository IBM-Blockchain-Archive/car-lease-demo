/*eslint-env node*/

var fs = require('fs');
var dateTime = require(__dirname+'/../../../tools/date/formatUTC.js')
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../configurations/configuration.js');

var create = function(type, name, data)
{
	/*
	Formats information to write to the trace log file. Creates a timestamp, classify the event (e.g. ENTER, ERROR,...) and displays input/output
	*/

	configFile = reload(__dirname+'/../../../configurations/configuration.js');
	
	//Checks if tracing is enabled in the config file
	if(!configFile.config.trace && name != 'toggleTrace')
	{
		return;
	}
	
	var formattedTime = dateTime.convert(Date.now());

	if(type == 'ENTER')
	{	
		var parTxt = '';
		for(var i = 0; i < data.length; i++)
		{
			parTxt += data[i] + ', ';
		}
		parTxt = parTxt.substring(0, parTxt.length - 2);
		
		var value = formattedTime + '\t' + type + '\t' + name + '\tINPUT: ' + parTxt + '\n';
	}
	else if(type == 'EXIT')
	{
		var value = formattedTime + '\t' + type + '\t' + name + '\tOUTPUT: ' + data + '\n';
	}
	else if(type == 'EVENT')
	{
		var eventTxt = data;
		if(name.trim() == 'toggleTrace' && eventTxt == 'OFF')
		{
			var value = formattedTime + '\t' + type + '\t' + name + '\t' + eventTxt + '\n----------------------------------------------------------------\n';
		}
		else
		{
			var value = formattedTime + '\t' + type + '\t' + name + '\t' + eventTxt + '\n';
		}
	}
	else if(type == 'ERROR')
	{		
		var value = '\t' + formattedTime + '\t' + type + '\t' + name + '\t' + data+ '\n';
	}
	
	fs.appendFile(configFile.config.traceFile, value, function (err){
		if(err)
		{
			console.log(err);
		}
	});
}

exports.create = create;