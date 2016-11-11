'use strict';

let read = require(__dirname+'/../../property/read');

exports.read = function(req, res, next, usersToSecurityContext) {
    return read(req, res, next, usersToSecurityContext, 'owner');
};
