var reload = require('../../reload.js'),
    nestedTime = reload('./nestedTime.js');

if (root.modelFail) {
    throw new Error('Failing for test');
}

exports.success = true;
exports.time = Date.now();
exports.nestedTime = function() {
    return nestedTime.time;
};