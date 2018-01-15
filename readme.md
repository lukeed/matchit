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
//=> b.params ~> { title:'hello' }
//=> typeof b.handler ~> 'function'

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

Returns an object with `params` and `handler` key.

The `params` is an object of `key:val` pairs, as defined by your [`route`](#route) pattern.

#### url

Type: `String`

The URL (`pathname`) to evaluate.

> **Important:** This should be `pathname`s only as any `querystring`s will be included the response.

#### match

Type: `Array`

The route definition to use, via [`matchit.match`](#matchitmatchurl-routes).


## Benchmarks

```
matchit.parse
  --> 307,336 ops/sec ±0.52% (93 runs sampled)
path-to-regexp
  --> 61,995 ops/sec ±0.71% (91 runs sampled)
path-to-regexp.parse
  --> 211,109 ops/sec ±0.63% (92 runs sampled)

matchit.match (index)
  --> 5,197,884 ops/sec ±0.57% (95 runs sampled)
path-to-regexp.exec (index)
  --> 925,370 ops/sec ±0.55% (91 runs sampled)
path-to-regexp.tokens (index)
  --> 69,317 ops/sec ±0.48% (94 runs sampled)

matchit.match (param)
  --> 1,850,751 ops/sec ±0.87% (90 runs sampled)
path-to-regexp.exec (param)
  --> 818,080 ops/sec ±0.64% (94 runs sampled)
path-to-regexp.tokens (param)
  --> 68,879 ops/sec ±0.48% (94 runs sampled)

matchit.match (optional)
  --> 2,051,647 ops/sec ±0.87% (90 runs sampled)
path-to-regexp.exec (optional)
  --> 1,597,584 ops/sec ±0.67% (92 runs sampled)
path-to-regexp.tokens (optional)
  --> 72,507 ops/sec ±0.50% (96 runs sampled)

matchit.match (wildcard)
  --> 2,040,094 ops/sec ±0.80% (88 runs sampled)
path-to-regexp.exec (wildcard)
  --> 1,588,553 ops/sec ±0.81% (93 runs sampled)
path-to-regexp.tokens (wildcard)
  --> 71,419 ops/sec ±0.50% (91 runs sampled)

matchit.exec (params)
  --> 1,015,649 ops/sec ±0.73% (87 runs sampled)
path-to-regexp.exec (params)
  --> 72,230 ops/sec ±0.56% (95 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
