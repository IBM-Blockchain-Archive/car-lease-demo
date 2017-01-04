var HashTable = require('./build/Release/native').HashTable;
HashTable.prototype.toJSON = function() {
    var ret = {};
    this.forEach(function(key, value) {
        ret[String(key)] = value;
    });

    return ret;
};

module.exports = HashTable;
