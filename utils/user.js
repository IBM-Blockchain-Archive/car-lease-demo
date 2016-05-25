/*eslint-env node */
"use strict";

// This connector let's us register users against a CA
var connector = require('./loopback-connector-obcca');

var dataSource = {};

// Use a tag to make logs easier to find
var TAG = "user_manager";

/**
 * Sets the registrar up to register/login users.
 * @param sdk The sdk object created from ibm-blockchain-js.
 * @param cc The chaincode for creating new user accounts.
 * @param cert_auth The service credentials for the networks certificate authority.
 * @param cb A callback of the form
 */

module.exports.setup = function (cert_auth, cb) {
    if (cert_auth) {
        // Initialize the connector to the CA
        dataSource.settings = {
            host: cert_auth.api_host,
            port: cert_auth.api_port_tls,
            secure: true
        };

        console.log(TAG, "initializing ca connection to:", dataSource.settings.host, ":", dataSource.settings.port);
        connector.initialize(dataSource, cb);
        return dataSource;
    } else {
        console.error(TAG, "user manager requires all of its setup parameters to function")
        return null
    }
};
