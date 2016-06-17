var reload = require('../reload.js'),
    timeFile = './lib/time.js',
    timeFileInContext = './time.js',
    testModule = 'require-reload-test',
    path = require('path'),
    context = require('./lib/getMyContext.js'),
    reloadInContext = reload(context);

//must be first time test otherwise require might be tainted by the timeFile already
exports.timeRequire = function(test) {
    test.strictEqual(require.cache[require.resolve(timeFile)], undefined);
    var model = reload(timeFile);
    test.ok(model.success);
    test.done();
};

exports.timeResolve = function(test) {
    test.equal(reload.resolve(timeFile), require.resolve(timeFile));
    test.done();
};

exports.emptyCache = function(test) {
    test.notStrictEqual(require.cache[require.resolve(timeFile)], undefined);
    reload.emptyCache();
    test.strictEqual(require.cache[require.resolve(timeFile)], undefined);
    test.done();
};

exports.timeReload = function(test) {
    var time = reload(timeFile),
        oldTime = time.time;
    test.ok(time.success);
    setTimeout(function() {
        time = reload(timeFile);
        test.ok(time.success);
        test.notEqual(time.time, oldTime);
        test.done();
    }, 20);
};

exports.nestedTimeReload = function(test) {
    var time = reload(timeFile),
        oldTime = time.nestedTime();
    test.ok(time.success);
    setTimeout(function() {
        time = reload(timeFile);
        test.ok(time.success);
        test.notEqual(time.nestedTime(), oldTime);
        test.done();
    }, 20);
};

exports.timeThrow = function(test) {
    var time = reload(timeFile),
        timeBefore = time;
    function throws() {
        time = reload(timeFile);
    }
    root.modelFail = true;
    test.throws(throws, Error, 'Failing for test');
    delete root.modelFail;
    test.strictEqual(time, timeBefore);
    test.done();
};

//must be first nodeModule test otherwise require might be tainted by the testModule already
exports.nodeModuleRequire = function(test) {
    test.strictEqual(require.cache[require.resolve(testModule)], undefined);
    var reloadTest = reload(testModule);
    test.ok(reloadTest.success);
    test.done();
};

exports.nodeModuleReload = function(test) {
    var reloadTest = reload(testModule),
        oldTime = reloadTest.time;
    test.ok(reloadTest.success);
    setTimeout(function() {
        reloadTest = reload(testModule);
        test.ok(reloadTest.success);
        test.notEqual(reloadTest.time, oldTime);
        test.done();
    }, 20);
};

exports.invalidPath = function(test) {
    function throws() {
        reload('./iDontExist.js');
    }
    test.throws(throws, Error, "Cannot find module './iDontExist.js'");
    test.done();
};

exports.timeRequireContext = function(test) {
    //the parent and the child share the same cache unfortunately..., but that is why we have the nodeModuleContext test
    reload.emptyCache();
    test.notStrictEqual(context, require);
    test.strictEqual(context.cache[context.resolve(timeFileInContext)], undefined);
    var time = reloadInContext(timeFileInContext);
    test.ok(time.success);
    test.done();
};

exports.invalidPathContext = function(test) {
    function throws() {
        reloadInContext(timeFile);
    }
    test.throws(throws, Error, "Cannot find module '" + timeFile + "'");
    test.done();
};

exports.timeResolveContext = function(test) {
    test.notStrictEqual(context, require);
    test.equal(reloadInContext.resolve(timeFileInContext), context.resolve(timeFileInContext));
    test.done();
};

exports.emptyCacheContext = function(test) {
    test.notStrictEqual(context, require);
    test.notStrictEqual(context.cache[context.resolve(timeFileInContext)], undefined);
    reloadInContext.emptyCache();
    test.strictEqual(context.cache[context.resolve(timeFileInContext)], undefined);
    test.done();
};

//this tests to make sure that reload(testModule) resolves to a different instance than reloadInContext(testModule)
//it also makes sure that require() from context and reload() from context would return the same instance
exports.nodeModuleContext = function(test) {
    test.notStrictEqual(context, require);
    test.strictEqual(context.cache[context.resolve(testModule)], undefined);
    var time = reload(testModule),
        timeContext = reloadInContext(testModule),
        timeContextDup = context(testModule);
    test.ok(time.success);
    test.ok(timeContext.success);
    test.notStrictEqual(time, timeContext);
    test.notEqual(reload.resolve(testModule), reloadInContext.resolve(testModule));
    test.strictEqual(timeContext, timeContextDup);
    test.done();
};
