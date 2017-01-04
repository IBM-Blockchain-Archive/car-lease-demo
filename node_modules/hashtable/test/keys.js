'use strict';
var HashMap = require('..'),
    test = require('test-more')(1);

var hashmap = new HashMap();

hashmap.put('key1', 1);
hashmap.put('key2', 1);
hashmap.put('key3', 1);

test.deepEqual(function () {
    var keys = hashmap.keys();
    return keys.sort();
}, ['key1', 'key2', 'key3'])
    .done();
