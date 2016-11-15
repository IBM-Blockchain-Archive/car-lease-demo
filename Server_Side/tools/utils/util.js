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

            args.forEach(function(arg) {
                if (typeof arg !== 'string') {
                    throw new Error('invalid arg specified ' + arg + ' in ', JSON.stringify(args));
                }
            });

            let user = securityContext.getEnrolledMember();

            return new Promise(function(resolve, reject) {
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
            console.log(e);
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

            args.forEach(function(arg) {
                if (typeof arg !== 'string') {
                    throw new Error('invalid arg specified ' + arg + ' in ', args);
                }
            });

            let user = securityContext.getEnrolledMember();

            return new Promise(function(resolve, reject) {
                let tx = user.invoke({
                    chaincodeID: securityContext.getChaincodeID(),
                    fcn: functionName,
                    args: args,
                    attrs: ATTRS
                });

                tx.on('submitted', function(data) {
                    console.log('invode submitted:', data);
                });

                tx.on('complete', function(data) {
                    console.log('invode complete:', data);
                    resolve(data.result);
                });

                tx.on('error', function (err) {
                    console.log('invode error:', err);
                    if (err instanceof hfc.EventTransactionError) {
                        reject(new Error(err.msg));
                    } else {
                        reject(err);
                    }
                });
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = Util;
