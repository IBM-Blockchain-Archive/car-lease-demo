'use strict';

let update = require(__dirname+'/../../property/update');

exports.update = function(req, res, next, usersToSecurityContext) {
    return update(req, res, next, usersToSecurityContext, 'make');
};
