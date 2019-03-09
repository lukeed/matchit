# matchit [![Build Status](https://travis-ci.org/lukeed/matchit.svg?branch=master)](https://travis-ci.org/lukeed/matchit)

> Quickly parse & match URLs

## Install

```
$ npm install --save matchit
```


## Usage

```js
const { exec, match, parse } = require('matchit');

parse('/foo/:bar/:baz?');
//=> [
//=>   { old:'/foo/:bar', type:0, val:'foo' },
//=>   { old:'/foo/:bar', type:1, val:'bar' },
//=>   { old:'/foo/:bar', type:3, val:'baz' }
//=> ]

const routes = ['/', '/foo', 'bar', '/baz', '/baz/:title','/bat/*'].map(parse);

match('/', routes);
//=> [{ old:'/', type:0, val:'/' }]

match('/foo', routes);
//=> [{ old:'/foo', type:0, val:'foo' }]

match('/bar', routes);
//=> [{ old:'bar', type:0, val:'bar' }]

match('/baz', routes);
//=> [{ old:'/baz', type:0, val:'baz' }]

let a = match('/baz/hello', routes);
//=> [{...}, {...}]
let b = exec('/baz/hello', a);
//=> { title:'hello' }

match('/bat/quz/qut', routes);
//=> [
//=>   { old:'/bat/*', type:0, val:'bat' },
//=>   { old:'/bat/*', type:2, val:'*' }
//=> ]
```


## API

### matchit.parse(route)

Returns: `Array`

The `route` is `split` and parsed into a "definition" array of objects. Each object ("segment") contains a `val`, `type`, and `old` key:

* `old` &mdash; The [`route`](#route)'s original value
* `type` &mdash; An numerical representation of the segment type.
    * `0` - static
    * `1` - parameter
    * `2` - any/wildcard
    * `3` - optional param
* `val` &mdash; The current segment's value. This is either a static value of the name of a parameter

#### route

Type: `String`

A single URL pattern.

> **Note:** Input will be stripped of all leading & trailing `/` characters, so there's no need to normalize your own URLs before passing it to `parse`!


### matchit.match(url, routes)

Returns: `Array`

Returns the [`route`](#route)'s encoded definition. See [`matchit.parse`](#matchitparseroute).

#### url

Type: `String`

The true URL you want to be matched.

#### routes

Type: `Array`

_All_ "parsed" route definitions, via [`matchit.parse`](#matchitparseroute).

> **Important:** Multiple routes will require an Array of `matchit.parse` outputs.


### matchit.exec(url, match)

Returns: `Object`

Returns an object an object of `key:val` pairs, as defined by your [`route`](#route) pattern.

#### url

Type: `String`

The URL (`pathname`) to evaluate.

> **Important:** This should be `pathname`s only as any `querystring`s will be included the response.

#### match

Type: `Array`

The route definition to use, via [`matchit.match`](#matchitmatchurl-routes).


## Benchmarks

> Running Node v10.13.0

```
# Parsing
  matchit                x 1,501,130 ops/sec ±0.27% (93 runs sampled)
  regexparam             x   406,465 ops/sec ±0.22% (96 runs sampled)
  path-to-regexp         x    83,692 ops/sec ±0.76% (91 runs sampled)
  path-to-regexp.parse   x   421,593 ops/sec ±1.29% (90 runs sampled)

# Match (index)
  matchit                x 71,761,834 ops/sec ±0.30% (95 runs sampled)
  regexparam             x 48,757,150 ops/sec ±0.50% (97 runs sampled)
  path-to-regexp.exec    x  7,073,405 ops/sec ±1.13% (95 runs sampled)
  path-to-regexp.tokens  x    101,567 ops/sec ±0.37% (93 runs sampled)

# Match (param)
  matchit                x 2,685,377 ops/sec ±0.51% (93 runs sampled)
  regexparam             x 6,855,532 ops/sec ±0.76% (90 runs sampled)
  path-to-regexp.exec    x 4,627,436 ops/sec ±1.54% (93 runs sampled)
  path-to-regexp.tokens  x   102,118 ops/sec ±0.25% (96 runs sampled)

# Match (optional)
  matchit                x 2,775,285 ops/sec ±0.83% (93 runs sampled)
  regexparam             x 8,559,692 ops/sec ±0.48% (94 runs sampled)
  path-to-regexp.exec    x 5,854,774 ops/sec ±0.33% (96 runs sampled)
  path-to-regexp.tokens  x   102,330 ops/sec ±0.48% (93 runs sampled)

# Match (wildcard)
  matchit                x  3,294,458 ops/sec ±1.05% (95 runs sampled)
  regexparam             x 10,831,738 ops/sec ±0.53% (97 runs sampled)
  path-to-regexp.exec    x  8,817,117 ops/sec ±0.51% (93 runs sampled)
  path-to-regexp.tokens  x    102,633 ops/sec ±0.26% (93 runs sampled)

# Exec
  matchit                x 1,520,250 ops/sec ±0.36% (97 runs sampled)
  regexparam             x 6,825,224 ops/sec ±0.38% (96 runs sampled)
  path-to-regexp         x   100,102 ops/sec ±0.45% (90 runs sampled)
```

## Related

- [regexparam](https://github.com/lukeed/regexparam) - A similar (285B) utility, but relies on `RegExp` instead of String comparisons.


## License

MIT © [Luke Edwards](https://lukeed.com)
