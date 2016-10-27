'use strict';

let Util = require(__dirname+'/../../../../tools/utils/util');
let tracing = require(__dirname+'/../../../../tools/traces/trace.js');

let user_id;
let securityContext;
let user;


function create (req, res, next, usersToSecurityContext)
{
    tracing.create('ENTER', 'POST blockchain/assets/vehicles', req.body);

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = req.cookies.user;
    }

    user_id = req.session.identity;

    securityContext = usersToSecurityContext[user_id];
    user = securityContext.getEnrolledMember();

    return createV5cID(req, res)
    .then(function(v5cID){
        tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Generated V5cID: '+v5cID);
        res.write(JSON.stringify({'message':'Generating V5cID'})+'&&');

        return checkIfAlreadyExists(v5cID);
    })
    .then(function(v5cID) {
        tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Checking V5cID is unique');
        tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Creating vehicle with v5cID: '+v5cID);
        return createVehicle(req, res, v5cID);
    })
    .then(function(v5cID) {
        let result = {};
        result.message = 'Achieving consensus';
        result.v5cID = v5cID;
        tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Achieving consensus');
        tracing.create('INFO', 'POST blockchain/assets/vehicles', '');
        res.write(JSON.stringify({'message':'Creation Confirmed'})+'&&');
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err);
        res.end(err);
    });
}

exports.create = create;

function createV5cID(req, res)
{
    return new Promise(function(resolve, reject) {
        let numbers = '1234567890';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let v5cID = '';
        for(let i = 0; i < 7; i++)
        {
            v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
        v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
        resolve(v5cID);
    });
}

// TODO: Covert this to use the Util function
function checkIfAlreadyExists(v5cID)
{
    return new Promise(function(resolve, reject) {
        let tx = user.query({
            'args': [ v5cID ],
            'attrs': [ 'role', 'username' ],
            'chaincodeID': securityContext.getChaincodeID(),
            'fcn': 'get_vehicle_details'
        });

        tx.on('complete', function(success) {
            reject(success);
        });

        tx.on('error', function(err) {
            if (err && err.hasOwnProperty('error') && err.msg.indexOf('Error retrieving v5c') > -1) {
                resolve(v5cID);
            } else {
                reject(err);
            }
        });
    });
}

function createVehicle(req, res, v5cID)
{
    return Util.invokeChaincode(securityContext, 'create_vehicle', [ v5cID ])
    .then(function(result) {
        return v5cID;
    });
}
