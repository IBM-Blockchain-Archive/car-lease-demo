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

                let query = {
                    chaincodeID: securityContext.getChaincodeID(),
                    fcn: functionName,
                    args: args,
                    attrs: ATTRS
                };

                console.log('[#] Query: ', JSON.stringify(query));

                let tx = user.query(query);

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

                let invoke = {
                    chaincodeID: securityContext.getChaincodeID(),
                    fcn: functionName,
                    args: args,
                    attrs: ATTRS
                };

                console.log('[#] Invoke: ', JSON.stringify(invoke));

                let tx = user.invoke(invoke);

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
