# matchit [![Build Status](https://travis-ci.org/lukeed/matchit.svg?branch=master)](https://travis-ci.org/lukeed/matchit)

> Quickly parse & match URLs

## Install

```
$ npm install --save matchit
```


## Usage

```js
const { match, parse } = require('matchit');

const info = parse(['/', '/foo', 'bar', '/baz', '/baz/:title','/bat/*']);

match('/', info);
//=> '/'

match('/foo', info);
//=> '/foo'

match('/bar', info);
//=> 'bar'

match('/baz', info);
//=> '/baz'

match('/baz/hello', info);
//=> '/baz/:title'

match('/bat/quz/qut', info);
//=> '/bat/*'
```


## API

### matchit.parse(items)

Returns: `Array`

Every URL inside `items` will be `split` into an array of segments. This means that the function returns an `Array` of arrays.

#### items

Type: `Array`

An array of URL strings.

> **Note:** Each URL will be stripped of all leading & trailing `/` characters, so there's no need to normalize your own URLs before passing it to `parse`!

### matchit.match(url, parsed)

Returns: `String`

Returns the original URL pattern used to describe the url.

#### url

Type: `String`

The `url` you want to be matched.

#### parsed

Type: `Array`

The "parsed" output from [`matchit.parse`](#matchitparseitems).


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
