HashTable
=========

Sometimes you need to store so much data in memory that V8 can get a bit clogged up. This Node.js module provides an interface to a native hashmap data structure that exists outside of V8's memory constraints.

To install, simply:

    npm install hashtable

"But Isaac, javascript already has hash tables! They're called objects, dummy"
---

V8 is great, but was never really meant for driving large software systems. Try adding a few million non-integer keys to an object and you'll start to see things bog down. This module is *not* intended to be a general replacement for javascript objects (that would be silly). Instead, it is meant to be used when you need maps larger than V8's virtual machine can handle.

Usage
-----

*Update*: As of version 1.0.0, this module will no longer work on Node 0.10 or earlier. If this is a problem use 0.x.x.

Everything you might want to do first requires a new HashMap object (which corresponds to a native c++ unordered_map):

    var HashTable = require('hashtable');
    var hashtable = new HashTable();

    hashtable.put('key', {value: 'value'});

    console.log(hashtable.get('key'));

    ...

    > { value: 'value' }

And that's it! Note that values can be any javascript type, including objects. The module properly creates and removes references (aka 'handles' if you know something about v8 internals) as needed, so you don't have to worry about any garbage collection funny business. Just use the module like you would any other javascript library.

The hash table implementation is provided by C++11's `unordered_map` class. Currently there is no fallback for older compilers. Pull requests welcome.

### `put ( key, value )`

Insert a new key/value pair in the hashmap. The key can be any javascript type, except undefined and null, including objects. The value can be any javascript type, including objects.

### `get ( key )`

Lookup a value from its key. Will return undefined if the key does not exist.

### `has ( key )`

Check if key exists. Will return false if the key does not exist; otherwise true.

### `remove ( key )`

Remove a key/value pair by its key. If the key does not exist, no action will be performed and it will return false. If a pair is removed, then it will return true.

### `clear ()`

Removes all key/value pairs from the hash table.

### `size ()`

Returns the number of key/value pairs in the hash table.

### `forEach ( cb, context )`

`cb` is an iterator function that will be called with each key/value pair like `cb.call(c, key, value)`, if context is not provided, the global.

### `keys ()`
Will return an array of the keys stored in the hashtable.

### `rehash ( n )`

Will increase the number of buckets to at least `n`, possibly causing a rehash of the hash table. See [unordered_map#rehash](http://www.cplusplus.com/reference/unordered_map/unordered_map/rehash/)

### `reserve ( n )`

Gives a hint to the implementation which may cause a rehash to the most appropriate number of buckets to contain `n` key/value pairs. See [unordered_map#reserve](http://www.cplusplus.com/reference/unordered_map/unordered_map/reserve/)

### `max_load_factor ()` or `max_load_factor ( factor )`

Either returns or sets the max load factor of the hash table implementation. This value determines when the hash map is rehashed with a new bucket count. By default it is `1.0`. See [unordered_map#max_load_factor](http://www.cplusplus.com/reference/unordered_map/unordered_map/max_load_factor/)

<a name="es6-map"/>
"But Chad, what if I want a super fast version of ES6's Map? Isn't this really close?"
---

You're right anonymous internet user! Just install HashTable like above, but then use like this:

    var Map = require('hashtable/es6-map');

    var map = new Map();
    map.set('key', {value: 'value'});
    map.set('something', 'else');

    console.log('There are', map.size, 'item(s) in the map');

    iterator = map.entries();
    while (!iterator.done) {
        console.log(iterator.key, '=', iterator.value);
        iterator.next();
    }

See the official [ES6 Map documentation](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects)

This package is made possible because of [Grokker](http://grokker.com/), one of the best places to work. If you are a JS developer looking for a new gig, send me an email at &#x5b;'chad', String.fromCharCode(64), 'grokker', String.fromCharCode(0x2e), 'com'&#x5d;.join('').
