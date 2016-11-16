'use strict';

// let request = require('request');
// let configFile = require(__dirname+'/../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../tools/traces/trace');
let map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID');
let Util = require(__dirname+'/../../../../tools/utils/util');

let user_id;
let securityContext;

function get_all_cars(req, res, next, usersToSecurityContext)
{

    tracing.create('ENTER', 'GET blockchain/assets/vehicles', {});

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }
    user_id = req.session.identity;
    securityContext = usersToSecurityContext[user_id];

    return Util.queryChaincode(securityContext, 'get_vehicles', [])
    .then(function(data) {
        let cars = JSON.parse(data.toString());
        console.log(cars);
        cars.forEach(function(car) {
            tracing.create('INFO', 'GET blockchain/assets/vehicles', JSON.stringify(car));
            res.write(JSON.stringify(car)+'&&');
        });
        tracing.create('EXIT', 'GET blockchain/assets/vehicles', {});
        res.end('');
    })
    .catch(function(err) {
        res.status(400);
        let error = {};
        error.error = true;
        error.message = err;
        tracing.create('ERROR', 'GET blockchain/assets/vehicles', err);
        res.end(JSON.stringify(error));
    });
}

exports.read = get_all_cars;
