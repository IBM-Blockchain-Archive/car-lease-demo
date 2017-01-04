'use strict';
var HashMap = require('..'),
    test = require('test-more')(5);

var hashmap = new HashMap();

test.ok(hashmap, 'new HashMap()')
    .test('put/set', function (test) {
        test
            .is(function () {
                hashmap.put('42', 42);
                return hashmap.get('42');
            }, 42, 'integer')

            .is(function () {
                hashmap.put('str', 'hello world');
                return hashmap.get('str');
            }, 'hello world', 'string')

            .is(function () {
                hashmap.put('decimal', 0.5);
                return hashmap.get('decimal');
            }, 0.5, 'decimal')

            .done();
    })

    .test('max_load_factor', function (test) {
        test
            .is(function () {
                hashmap.max_load_factor(0.75);
                return hashmap.max_load_factor();
            }, 0.75, 'set/get 0.75')
            .more(function () {
                hashmap.max_load_factor(0);
                return hashmap.max_load_factor();
            }, 0, 'cannot set to 0')
            .done();
    })

    .is(function () {
        hashmap.max_load_factor(0.75);
        return hashmap.max_load_factor();
    }, 0.75, 'set/get max_load_factor 0.75')

    .test("object identity", function (test) {
        var obj = { hello: 'world' };
        hashmap.put('obj', obj);

        test.is(hashmap.get('obj'), obj, 'same object')
            .isnt(hashmap.get('obj'), { hello: 'world' }, 'different objects, same deep value')
            .done();
    })

    .done();
