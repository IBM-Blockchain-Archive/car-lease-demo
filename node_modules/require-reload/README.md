# require-reload #

require-reload facilitates hot-reloading files in node.js. Each call will re-fetch the file/module and `require` it.

## Example ##
```JS
//things will work just the same with require('require-reload') but see note after this example
var reload = require('require-reload')(require),
    api = reload('api.js');
//sometime later if you make changes to api.js, you can hot-reload it by calling
//this could also just be in a setInterval
try {
    api = reload('api.js');
} catch (e) {
    //if this threw an error, the api variable is still set to the old, working version
    console.error("Failed to reload api.js! Error: ", e);
}
```

## Notes/Caveats ##
Keep in mind that the cache is shared between child modules and their parents. If you want to reload your depdencies when
you're reloaded then you must also use `require-reload`. This is on purpose so things are not unintentionally reloaded.

Note: This uses internal methods to the module system without a context. These APIs may change at any time. I will keep this
maintained to support all version of Node.js >=0.6 and io.js >=1.0.4. Version management will be handled through npm.

**Because of this, it is recommend you use `require('require-reload')(require)` which works without any internal methods.**

## Advanced Usage ##

### reload([otherContext]) ###
If you want to run reload in the context of another module/file then pass in the `require` variable into `reload` to get an
instance that is bound to that context. The other module must return its require context to use this.
```JS
var otherModule = require('other-module'),
    reloadInContext = require('require-reload')(otherModule.requireCtx);
/*
 * other-module would need to do:
 * exports.requireCtx = require;
 */
```

### emptyCache([context]) ###
Empties the whole cache. Useful if you want to reload a file/module AND reload its dependencies. Optionally accepts a context
to clear another context's cache.
