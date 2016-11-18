'use strict';

const ATTRS = ['username', 'role'];
const hfc = require('hfc');

class Util {
    static queryChaincode(securityContext, functionName, args) {

        try {
            if (!securityContext) {
                throw new Error('securityContext not provided');
            }  else if (!functionName) {
                throw new Error('functionName not provided');
            } else if (!args) {
                throw new Error('args not provided');
            }

            return new Promise(function(resolve, reject) {
                args.forEach(function(arg) {
                    if (typeof arg !== 'string') {
                        throw new Error('invalid arg specified ' + arg + ' in ', JSON.stringify(args));
                    }
                });

                let user = securityContext.getEnrolledMember();

                let tx = user.query({
                    chaincodeID: securityContext.getChaincodeID(),
                    fcn: functionName,
                    args: args,
                    attrs: ATTRS
                });

                tx.on('submitted', function() {
                });

                tx.on('complete', function(data) {
                    resolve(data.result);
                });

                tx.on('error', function (err) {
                    if (err instanceof hfc.EventTransactionError) {
                        reject(new Error(err.msg));
                    } else {
                        reject(err);
                    }
                });
            });

        } catch(e) {
            throw e;
        }
    }

    static invokeChaincode(securityContext, functionName, args) {
        try {
            if (!securityContext) {
                throw new Error('securityContext not provided');
            } else if (!functionName) {
                throw new Error('functionName not provided');
            } else if (!args) {
                throw new Error('args not provided');
            }

            return new Promise(function(resolve, reject) {
                args.forEach(function(arg) {
                    if (typeof arg !== 'string') {
                        throw new Error('invalid arg specified ' + arg + ' in ', args);
                    }
                });

                let user = securityContext.getEnrolledMember();

                let tx = user.invoke({
                    chaincodeID: securityContext.getChaincodeID(),
                    fcn: functionName,
                    args: args,
                    attrs: ATTRS
                });

                tx.on('submitted', function(data) {
                });

                tx.on('complete', function(data) {
                    resolve(data.result);
                });

                tx.on('error', function (err) {
                    if (err instanceof hfc.EventTransactionError) {
                        reject(new Error(err.msg));
                    } else {
                        reject(err);
                    }
                });
            });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = Util;
