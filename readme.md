# matchit [![Build Status](https://travis-ci.org/lukeed/matchit.svg?branch=master)](https://travis-ci.org/lukeed/matchit)

> Quickly parse & match URLs

## Install

```
$ npm install --save matchit
```


## Usage

```js
const { exec, match, parse } = require('matchit');

parse('/foo/:bar');
//=> [
//=>   { old:'/foo/:bar', type:0, val:'foo' },
//=>   { old:'/foo/:bar', type:1, val:'bar' }
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

The true URL to evaluate.

#### match

Type: `Array`

The route definition to use, via [`matchit.match`](#matchitmatchurl-routes).


## Benchmarks

```
matchit.parse
  --> 436,157 ops/sec ±0.37% (95 runs sampled)
path-to-regexp
  --> 85,985 ops/sec ±0.52% (96 runs sampled)

matchit.match (index)
  --> 6,077,103 ops/sec ±0.76% (91 runs sampled)
path-to-regexp.exec (index)
  --> 1,111,688 ops/sec ±0.71% (92 runs sampled)

matchit.match (param)
  --> 2,216,572 ops/sec ±0.58% (93 runs sampled)
path-to-regexp.exec (param)
  --> 1,048,625 ops/sec ±0.63% (91 runs sampled)

matchit.match (wildcard)
  --> 2,140,698 ops/sec ±0.73% (90 runs sampled)
path-to-regexp.exec (wildcard)
  --> 2,044,279 ops/sec ±0.49% (94 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
