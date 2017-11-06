# matchit [![Build Status](https://travis-ci.org/lukeed/matchit.svg?branch=master)](https://travis-ci.org/lukeed/matchit)

> Quickly parse & match URLs

## Install

```
$ npm install --save matchit
```


## Usage

```js
const { match, parse } = require('matchit');

const routes = ['/', '/foo', 'bar', '/baz', '/baz/:title','/bat/*'].map(parse);

match('/', routes);
//=> '/'

match('/foo', routes);
//=> '/foo'

match('/bar', routes);
//=> 'bar'

match('/baz', routes);
//=> '/baz'

match('/baz/hello', info);
//=> '/baz/:title'

match('/bat/quz/qut', routes);
//=> '/bat/*'
```


## API

### matchit.parse(route)

Returns: `Array`

Every URL inside `items` will be `split` into an array of segments. This means that the function returns an `Array` of arrays.

#### route

Type: `String`

A single URL pattern.

> **Note:** Input will be stripped of all leading & trailing `/` characters, so there's no need to normalize your own URLs before passing it to `parse`!


### matchit.match(url, routes)

Returns: `String`

Returns the original URL pattern used to describe the url.

#### url

Type: `String`

The true URL you want to be matched.

#### routes

Type: `Array`

_All_ "parsed" route definitions, via [`matchit.parse`](#matchitparseitems).

> **Important:** Multiple routes will require an Array of `matchit.parse` outputs.


## Benchmarks

```
matchit.parse
  --> 435,011 ops/sec ±0.43% (95 runs sampled)
path-to-regexp
  --> 87,469 ops/sec ±0.71% (92 runs sampled)

matchit.match (index)
  --> 5,967,166 ops/sec ±0.95% (90 runs sampled)
path-to-regexp.exec (index)
  --> 1,036,087 ops/sec ±0.83% (90 runs sampled)

matchit.match (param)
  --> 2,257,568 ops/sec ±0.47% (93 runs sampled)
path-to-regexp.exec (param)
  --> 1,012,662 ops/sec ±0.65% (90 runs sampled)

matchit.match (wilcard)
  --> 2,168,048 ops/sec ±0.72% (92 runs sampled)
path-to-regexp.exec (wilcard)
  --> 1,995,711 ops/sec ±0.70% (92 runs sampled
```

## License

MIT © [Luke Edwards](https://lukeed.com)
