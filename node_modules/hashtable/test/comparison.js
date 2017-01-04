'use strict';

var async = require('async');
var ES6Map = require('es6-map');
var HashMap = require('../es6-map');

var measureTime = function (name, test_func, callback) {
    var start_ms = Date.now();
    return test_func(function (err, count) {
        if (err) {
            console.log('error using up cpu', err);
            return callback(err);
        }
        var end_ms = Date.now();
        var elapsed_ms = end_ms - start_ms;
        //console.log('report:', name, 'ms:', elapsed_ms);

        return callback(null, elapsed_ms);
    });
};

var rawInsert = function (count, callback) {
    var map = {};

    var i;
    for (i = 0; i < count; i++) {
        map['key' + i] = 'value' + i;
    }
    return callback();
};

var rawInsertAndRemove = function (count, callback) {
    var map = {};

    var i;
    for (i = 0; i < 500; i++) {
        map['key' + i] = 'persistent_value' + i;
    }
    for (i = 0; i < count; i++) {
        map['key' + i] = 'value' + i;
    }
    for (i = 0; i < count; i++) {
        delete map['key' + i];
        map['key' + (count + i)] =  'value' + i;
    }
    return callback();
};

var rawInsertAndFind = function (count, callback) {
    var map = {};

    var i;
    var x;
    for (i = 0; i < count; i++) {
        map['key' + i] = 'value' + i;
    }
    for (i = 0; i < count; i++) {
        x = map.key0;
        x = map['key' + Math.floor(count / 2)];
        x = map['key' + (count - 1)];
    }
    return callback();
};

var es6Insert = function (count, callback) {
    var map = new ES6Map();

    var i;
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    return callback();
};

var es6InsertAndRemove = function (count, callback) {
    var map = new ES6Map();

    var i;
    for (i = 0; i < 500; i++) {
        map.set('key' + i, 'persistent_value' + i);
    }
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    for (i = 0; i < count; i++) {
        map.delete('key' + i);
        map.set('key' + (count + i), 'value' + i);
    }
    return callback();
};

var es6InsertAndFind = function (count, callback) {
    var map = new ES6Map();

    var i;
    var x;
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    for (i = 0; i < count; i++) {
        x = map.get('key0');
        x = map.get('key' + Math.floor(count / 2));
        x = map.get('key' + (count - 1));
    }
    return callback();
};

var hashInsert = function (count, callback) {
    var map = new HashMap();

    var i;
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    return callback();
};

var hashInsertAndRemove = function (count, callback) {
    var map = new HashMap();

    var i;
    for (i = 0; i < 500; i++) {
        map.set('key' + i, 'persistent_value' + i);
    }
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    for (i = 0; i < count; i++) {
        map.delete('key' + i);
        map.set('key' + (count + i), 'value' + i);
    }
    return callback();
};

var hashInsertAndFind = function (count, callback) {
    var map = new HashMap();

    var i;
    var x;
    for (i = 0; i < count; i++) {
        map.set('key' + i, 'value' + i);
    }
    for (i = 0; i < count; i++) {
        x = map.get('key0');
        x = map.get('key' + Math.floor(count / 2));
        x = map.get('key' + (count - 1));
    }
    return callback();
};

var numerical_sort = function (a, b) {
    return a - b;
};


var tests = [
    ['raw insert 10000', rawInsert.bind(null, 10000)],
    ['raw insert 20000', rawInsert.bind(null, 20000)],
    ['raw insert 50000', rawInsert.bind(null, 50000)],
    ['raw insert and remove 10000', rawInsertAndRemove.bind(null, 10000)],
    ['raw insert and remove 50000', rawInsertAndRemove.bind(null, 50000)],
    ['raw insert and find 10000', rawInsertAndFind.bind(null, 10000)],
    ['raw insert and find 20000', rawInsertAndFind.bind(null, 20000)],
    ['raw insert and find 50000', rawInsertAndFind.bind(null, 50000)]
];

if (process.argv.length < 3 || process.argv[2] !== '--no-es6') {
    tests.push(
        ['ES6 insert 10000', es6Insert.bind(null, 10000)],
        ['ES6 insert 20000', es6Insert.bind(null, 20000)],
        ['ES6 insert 50000', es6Insert.bind(null, 50000)],
        ['ES6 insert and remove 10000', es6InsertAndRemove.bind(null, 10000)],
        ['ES6 insert and remove 50000', es6InsertAndRemove.bind(null, 50000)],
        ['ES6 insert and find 10000', es6InsertAndFind.bind(null, 10000)],
        ['ES6 insert and find 20000', es6InsertAndFind.bind(null, 20000)],
        ['ES6 insert and find 50000', es6InsertAndFind.bind(null, 50000)]
    );
}

tests.push(
    ['HashMap insert 10000', hashInsert.bind(null, 10000)],
    ['HashMap insert 20000', hashInsert.bind(null, 20000)],
    ['HashMap insert 50000', hashInsert.bind(null, 50000)],
    ['HashMap insert and remove 10000', hashInsertAndRemove.bind(null, 10000)],
    ['HashMap insert and remove 50000', hashInsertAndRemove.bind(null, 50000)],
    ['HashMap insert and find 10000', hashInsertAndFind.bind(null, 10000)],
    ['HashMap insert and find 20000', hashInsertAndFind.bind(null, 20000)],
    ['HashMap insert and find 50000', hashInsertAndFind.bind(null, 50000)]
);

async.mapSeries(tests, function (params, cb) {
    return process.stdout.write('running ' + params[0] + ' tests', 'utf8', function () {
        return async.timesSeries(10, function (n, cb_times) {
            return process.stdout.write('.', 'utf8', function () {
                return measureTime.call(null, params[0], params[1], cb_times);
            });
        }, function (err, timings) {
            return process.stdout.write('\n', 'utf8', function () {
                if (err) {
                    console.log('error in timings', err);
                    return cb(err);
                }
                var mean = timings.reduce(function (total, ms) {return total + ms; }) / timings.length;
                var median = (timings.sort(numerical_sort)[4] + timings[5]) / 2;
                var low = timings[0];
                var high = timings[9];
                return cb(null, [low, mean, median, high]);
            });
        });
    });
}, function (err, stats) {
    if (err) {
        console.log('tests did not all complete');
        process.exit(1);
    }
    tests.forEach(function (test, index) {
        console.log(test[0], 'low:', stats[index][0], 'mean:', stats[index][1], 'median:', stats[index][2], 'high:', stats[index][3]);
    });
    process.exit(0);
});
