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

Running Node 6.11.1

```
matchit.parse
  --> 311,463 ops/sec ±0.39% (96 runs sampled)
path-to-regexp
  --> 63,187 ops/sec ±0.78% (95 runs sampled)
path-to-regexp.parse
  --> 194,130 ops/sec ±0.50% (97 runs sampled)

matchit.match (index)
  --> 19,015,297 ops/sec ±0.48% (95 runs sampled)
path-to-regexp.exec (index)
  --> 994,152 ops/sec ±0.50% (92 runs sampled)
path-to-regexp.tokens (index)
  --> 68,463 ops/sec ±0.41% (96 runs sampled)

matchit.match (param)
  --> 2,569,858 ops/sec ±0.98% (91 runs sampled)
path-to-regexp.exec (param)
  --> 903,529 ops/sec ±0.55% (90 runs sampled)
path-to-regexp.tokens (param)
  --> 68,158 ops/sec ±0.45% (93 runs sampled)

matchit.match (optional)
  --> 3,012,451 ops/sec ±1.57% (90 runs sampled)
path-to-regexp.exec (optional)
  --> 1,780,864 ops/sec ±0.48% (93 runs sampled)
path-to-regexp.tokens (optional)
  --> 71,376 ops/sec ±0.50% (93 runs sampled)

matchit.match (wildcard)
  --> 2,996,976 ops/sec ±1.18% (89 runs sampled)
path-to-regexp.exec (wildcard)
  --> 1,776,872 ops/sec ±0.52% (90 runs sampled)
path-to-regexp.tokens (wildcard)
  --> 70,687 ops/sec ±0.43% (95 runs sampled)

matchit.exec (params)
  --> 1,171,416 ops/sec ±0.66% (96 runs sampled)
path-to-regexp.exec (params)
  --> 71,773 ops/sec ±0.47% (96 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
