'use strict';

const Util = require('./util.js');
const hfc = require('hfc');

class Vehicle {

    constructor(usersToSecurityContext) {
        this.usersToSecurityContext = usersToSecurityContext;
        this.chain = hfc.getChain('myChain'); //TODO: Make this a config param?
    }

    create(userId) {
        let securityContext = this.usersToSecurityContext[userId];
        let v5cID = Vehicle.newV5cID();

        return this.doesV5cIDExist(userId, v5cID)
        .then(function() {
            return Util.invokeChaincode(securityContext, 'create_vehicle', [ v5cID ])
            .then(function() {
                return v5cID;
            });
        });
    }

    transfer(userId, buyer, functionName, v5cID) {
        return this.updateAttribute(userId, functionName , buyer, v5cID);
    }

    updateAttribute(userId, functionName, value, v5cID) {
        let securityContext = this.usersToSecurityContext[userId];
        return Util.invokeChaincode(securityContext, functionName, [ value, v5cID ]);
    }

    doesV5cIDExist(userId, v5cID) {
        let securityContext = this.usersToSecurityContext[userId];
        return Util.queryChaincode(securityContext, 'check_unique_v5c', [ v5cID ]);
    }

    static newV5cID() {
        let numbers = '1234567890';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let v5cID = '';
        for(let i = 0; i < 7; i++)
            {
            v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
        v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
        return v5cID;
    }
}

module.exports = Vehicle;
