var parent = module.parent;
//replace ALL of our paths with the parents ones (disabling this hack for now)
//module.paths.splice.apply(module.paths, [0, module.paths.length].concat(parent.paths));
//module.filename = parent.filename;

function reloadCtx(require, name) {
    var id = require.resolve(name),
        oldCache = require.cache[id];
    delete require.cache[id];
    try {
        return require(id);
    } catch (e) {
        if (oldCache !== undefined) {
            require.cache[id] = oldCache; //restore the old cache since the new failed
        }
        throw e;
    }
    return null;
}

//fallback in case module.filename override doesn't work
//see what _resolveLookupPaths is doing in nodejs/lib/module.js
function reloadParent(name) {
    var ctx = parent.constructor,
        id = ctx._resolveFilename(name, parent),
        oldCache = ctx._cache[id];
    delete ctx._cache[id];
    try {
        return parent.require(id);
    } catch (e) {
        if (oldCache !== undefined) {
            ctx._cache[id] = oldCache; //restore the old cache since the new failed
        }
        throw e;
    }
    return null;
}

function reload(name, ctx) {
    //detect if they did require('require-reload')(require)
    if (typeof name === 'function' && typeof name.cache === 'object') {
        var func = reloadCtx.bind(null, name);
        func.resolve = name.resolve;
        func.emptyCache = function() {
            for (var id in name.cache) {
                delete name.cache[id];
            }
        };
        return func;
    }
    if (ctx !== undefined) {
        return reloadCtx(ctx, name);
    }
    if (module.filename === undefined) {
        throw new Error("Cannot override module.filename since it isn't used anymore. Please upgrade require-reload!");
    }
    //no context means we must fallback to one of these hacks
    //return reloadCtx(require, name); //this only works if we hacked the filename at the top
    return reloadParent(name);
}

reload.resolve = function(req, context) {
    if (context !== undefined) {
        return context.resolve(req);
    }
    return parent.constructor._resolveFilename(req, parent);
};
reload.emptyCache = function(context) {
    var cache = context ? context.cache : parent.constructor._cache;
    for (var id in cache) {
        delete cache[id];
    }
};
module.exports = reload;

//don't allow reload.js to be cached otherwise we can't use the hack with the parent filename
delete require.cache[module.id];
