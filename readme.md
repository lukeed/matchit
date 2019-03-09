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
  matchit                x 1,460,292 ops/sec ±4.07% (97 runs sampled)
  regexparam             x   415,862 ops/sec ±0.10% (96 runs sampled)
  path-to-regexp         x    81,541 ops/sec ±0.66% (93 runs sampled)
  path-to-regexp.parse   x   416,109 ops/sec ±1.35% (90 runs sampled)

# Match (index)
  matchit                x 71,183,130 ops/sec ±0.59% (94 runs sampled)
  regexparam             x 48,959,096 ops/sec ±0.17% (97 runs sampled)
  path-to-regexp.exec    x  7,004,677 ops/sec ±0.34% (97 runs sampled)
  path-to-regexp.tokens  x     99,730 ops/sec ±0.35% (97 runs sampled)

# Match (param)
  matchit                x 2,603,951 ops/sec ±0.37% (96 runs sampled)
  regexparam             x 6,177,036 ops/sec ±0.39% (94 runs sampled)
  path-to-regexp.exec    x 4,810,037 ops/sec ±0.23% (96 runs sampled)
  path-to-regexp.tokens  x    98,713 ops/sec ±0.16% (98 runs sampled)

# Match (optional)
  matchit                x 2,714,604 ops/sec ±0.75% (96 runs sampled)
  regexparam             x 8,013,834 ops/sec ±0.31% (95 runs sampled)
  path-to-regexp.exec    x 5,745,747 ops/sec ±1.56% (91 runs sampled)
  path-to-regexp.tokens  x    99,505 ops/sec ±0.17% (96 runs sampled)

# Match (wildcard)
  matchit                x 3,283,630 ops/sec ±1.01% (96 runs sampled)
  regexparam             x 9,765,801 ops/sec ±0.70% (91 runs sampled)
  path-to-regexp.exec    x 8,091,002 ops/sec ±0.35% (95 runs sampled)
  path-to-regexp.tokens  x    99,979 ops/sec ±0.44% (96 runs sampled)

# Exec
  matchit                x 1,532,356 ops/sec ±0.11% (98 runs sampled)
  regexparam             x 6,623,901 ops/sec ±0.15% (94 runs sampled)
  path-to-regexp         x    98,759 ops/sec ±0.44% (97 runs sampled)
```

## Related

- [regexparam](https://github.com/lukeed/regexparam) - A similar (285B) utility, but relies on `RegExp` instead of String comparisons.


## License

MIT © [Luke Edwards](https://lukeed.com)
