'use strict';
let fs = require('fs');
let dateTime = require(__dirname+'/../../../tools/date/formatUTC.js');
let configFile = require(__dirname+'/../../../configurations/configuration.js');

let create = function(type, name, data)
{
    /*
    Formats information to write to the trace log file. Creates a timestamp, classify the event (e.g. ENTER, ERROR,...) and displays input/output
    */


    //Checks if tracing is enabled in the config file
    if(!configFile.config.trace && name != 'toggleTrace')
    {
        return;
    }

    let formattedTime = dateTime.convert(Date.now());

    if(type == 'ENTER')
    {
        var value = formattedTime + '\t' + type + '\t' + name + '\tINPUT: ' + JSON.stringify(data) + '\n';
        console.log(type + '\t' + name + '\tINPUT: ' + JSON.stringify(data));
    }
    else if(type == 'INFO')
    {
        var value = '\t' + formattedTime + '\t' + type + '\t' + name + '\t' + data+ '\n';
        console.log(type + '\t' + name + '\t' + data+ '\n');
    }
    else if(type == 'EXIT')
    {
        var value = formattedTime + '\t' + type + '\t' + name + '\tOUTPUT: ' + JSON.stringify(data) + '\n';
        console.log(type + '\t' + name + '\tOUTPUT: ' + JSON.stringify(data));
    }
    else if(type == 'EVENT')
    {
        let eventTxt = data;
        if(name.trim() == 'toggleTrace' && eventTxt == 'OFF')
        {
            var value = formattedTime + '\t' + type + '\t' + name + '\t' + eventTxt + '\n----------------------------------------------------------------\n';
            console.log('---------------------------------------LOGGING TURNED OFF---------------------------------------');
        }
        else
        {
            var value = formattedTime + '\t' + type + '\t' + name + '\t' + eventTxt + '\n';
            console.log('---------------------------------------LOGGING TURNED ON----------------------------------------');
        }
    }
    else if(type == 'ERROR')
    {
        var value = '\t' + formattedTime + '\t' + type + '\t' + name + '\tOUTPUT: ' + JSON.stringify(data)+ '\n';
        console.error(type + '\t' + name + '\tOUTPUT: ' + JSON.stringify(data));
    }

    fs.appendFile(configFile.config.traceFile, value, function (err){
        if(err)
        {
            console.error('UNABLE TO WRITE LOGS TO FILE');
        }
    });
};

exports.create = create;
