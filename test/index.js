const test = require('tape');
const $ = require('../lib');

const ALL = ['/', '/about', 'contact', '/books', '/books/:title', '/foo/*', 'bar/:baz/:bat?'];
const PREP = ALL.map($.parse);

function toMatch(t, url, idx) {
	const out = $.match(url, PREP);
	t.true(Array.isArray(out), 'returns an array');
	if (idx !== -1) {
		t.deepEqual(out, PREP[idx], 'returns the expected definition');
	} else {
		t.is(out.length, 0, 'returns an empty array');
	}
	t.end();
}

function isEntry(t, segs, expect) {
	t.true(Array.isArray(segs), '~> entry is an array of segments');
	t.is(segs.length, expect.length, `~> entry has ${expect.length} segment(s)`)

	segs.forEach((obj, idx) => {
		t.is(Object.keys(obj).length, 3, '~~> segment has `old`, `type` & `val` keys');
		t.is(typeof obj.type, 'number', '~~> segment.type is a number');
		t.is(obj.type, expect[idx].type, '~~> segment.type returns expected value');
		t.is(typeof obj.val, 'string', '~~> segment.val is a string');
		t.is(obj.val, expect[idx].val, '~~> segment.val returns expected value');
	});
}

function toParse(t, ins, outs) {
	const res = ins.map($.parse);

	t.true(Array.isArray(res), 'returns an array');
	t.is(res.length, ins.length, `returns ${ins.length} item(s)`);

	res.forEach((val, idx) => {
		isEntry(t, val, outs[idx]);
	});

	t.end();
}

test('matchit', t => {
	t.is(typeof $, 'object', 'exports an object');
	const keys = Object.keys($);
	t.is(keys.length, 3, 'exports two items');
	keys.forEach(k => {
		t.is(typeof $[k], 'function', `exports.${k} is a function`);
	});
	t.end();
});

test('parse empty', t => {
	const out = $.parse('');
	t.true(Array.isArray(out), 'returns an array');
	t.is(out.length, 0, 'returns an empty array');
	t.end();
});

test('parse index', t => {
	const input = ['/'];
	toParse(t, input, [
		[{ type:0, val:'/' }]
	]);
});

test('parse statics', t => {
	const input = ['/about', 'contact', '/foobar'];
	toParse(t, input, [
		[{ type:0, val:'about' }],
		[{ type:0, val:'contact' }],
		[{ type:0, val:'foobar' }],
	]);
});

test('parse params', t => {
	const input = ['/:foo', 'books/:title', '/foo/:bar'];
	toParse(t, input, [
		[{ type:1, val:'foo' }],
		[{ type:0, val:'books' }, { type:1, val:'title' }],
		[{ type:0, val:'foo' }, { type:1, val:'bar' }]
	]);
});

test('parse params (multiple)', t => {
	const input = ['/foo/:bar/:baz', '/foo/bar/:baz', '/foo/bar/:baz/:bat'];
	toParse(t, input, [
		[{ type:0, val:'foo' }, { type:1, val:'bar' }, { type:1, val:'baz' }],
		[{ type:0, val:'foo' }, { type:0, val:'bar' }, { type:1, val:'baz' }],
		[{ type:0, val:'foo' }, { type:0, val:'bar' }, { type:1, val:'baz' }, { type:1, val:'bat' }]
	]);
});

test('parse params (optional)', t => {
	const input = ['/:foo?', 'foo/:bar?', '/foo/:bar?/:baz?'];
	toParse(t, input, [
		[{ type:3, val:'foo' }],
		[{ type:0, val:'foo' }, { type:3, val:'bar' }],
		[{ type:0, val:'foo' }, { type:3, val:'bar' }, { type:3, val:'baz' }],
	]);
});

test('parse wilds', t => {
	const input = ['*', '/*', 'foo/*', 'foo/bar/*'];
	toParse(t, input, [
		[{ type:2, val:'*' }],
		[{ type:2, val:'*' }],
		[{ type:0, val:'foo' }, { type:2, val:'*' }],
		[{ type:0, val:'foo' }, { type:0, val:'bar' }, { type:2, val:'*' }]
	]);
});


test('match index', t => {
	toMatch(t, '/', 0);
});

test('match static (exact)', t => {
	toMatch(t, '/about', 1);
});

test('match static (exact, no-slash)', t => {
	toMatch(t, 'contact', 2);
});

test('match static (bare-vs-slash)', t => {
	toMatch(t, 'about', 1);
});

test('match static (slash-vs-bare)', t => {
	toMatch(t, '/contact', 2);
});

test('match static (trailing slash)', t => {
	toMatch(t, '/books/', 3);
});

test('match params (single)', t => {
	toMatch(t, '/books/foobar', 4);
});

test('match params (no match, long)', t => {
	toMatch(t, '/books/foo/bar', -1);
});

test('match params (no match, base)', t => {
	toMatch(t, '/hello/world', -1);
});

test('match params (optional)', t => {
	toMatch(t, '/bar/hello', 6);
});

test('match params (optional, all)', t => {
	toMatch(t, '/bar/hello/world', 6);
});

test('match params (querystring)', t => {
	toMatch(t, '/books/narnia?author=lukeed', 4);
});

test('match wildcard (simple)', t => {
	toMatch(t, '/foo/bar', 5);
});

test('match wildcard (multi-level)', t => {
	toMatch(t, '/foo/bar/baz', 5);
});



test('exec index', t => {
	const arr = $.match('/', PREP);
	const out = $.exec('/', arr);
	t.is(typeof out, 'object', 'returns an object');
	t.is(Object.keys(out).length, 0, 'returns an empty object');
	t.end();
});

test('exec statics', t => {
	const foo = $.match('/about', PREP);
	const bar = $.exec('/about', foo);
	t.is(typeof bar, 'object', 'returns an object');
	t.is(Object.keys(bar).length, 0, 'returns an empty object');

	const baz = $.match('/contact', PREP);
	const bat = $.exec('/contact', baz);
	t.is(typeof bat, 'object', 'returns an object');
	t.is(Object.keys(bat).length, 0, 'returns an empty object');
	t.end();
});

test('exec params', t => {
	const arr = $.match('/books/foo', PREP);
	const out = $.exec('/books/foo', arr);
	t.is(typeof out, 'object', 'returns an object');
	const keys = Object.keys(out);
	t.is(keys.length, 1, 'returns object with 1 key');
	t.is(keys[0], 'title', '~> contains `title` key');
	t.is(out.title, 'foo', '~> adds `key:val` pair');
	t.end();
});

test('exec params (multiple)', t => {
	const foo = $.parse('/foo/:bar/:baz');
	const out = $.exec('/foo/hello/world', foo);
	t.is(typeof out, 'object', 'returns an object');
	const keys = Object.keys(out);
	t.is(keys.length, 2, 'returns object with 2 keys');
	t.deepEqual(keys, ['bar', 'baz'], '~> contains `bar` & `baz` keys');
	t.is(out.bar, 'hello', '~> adds `key:val` pair');
	t.is(out.baz, 'world', '~> adds `key:val` pair');
	t.end();
});

test('exec params (optional)', t => {
	const out = $.exec('/bar/hello', PREP[6]);
	t.is(typeof out, 'object', 'returns an object');
	const keys = Object.keys(out);
	t.is(keys.length, 1, 'returns object with 2 keys');
	t.is(keys[0], 'baz', '~> contains `baz` key');
	t.is(out.baz, 'hello', '~> adds `key:val` pair');
	t.end();
});

test('exec params (optional, all)', t => {
	const out = $.exec('/bar/hello/world', PREP[6]);
	t.is(typeof out, 'object', 'returns an object');
	const keys = Object.keys(out);
	t.is(keys.length, 2, 'returns object with 2 keys');
	t.deepEqual(keys, ['baz', 'bat'], '~> contains `baz` & `bat` keys');
	t.is(out.baz, 'hello', '~> adds `key:val` pair');
	t.is(out.bat, 'world', '~> adds `key:val` pair');
	t.end();
});

test('exec params (querystring)', t => {
	const url = '/books/foo?author=lukeed';
	const arr = $.match(url, PREP);
	const out = $.exec(url, arr);
	t.is(typeof out, 'object', 'returns an object');
	const keys = Object.keys(out);
	t.is(keys.length, 1, 'returns object with 1 key');
	t.is(keys[0], 'title', '~> contains `title` key');
	t.is(out.title, 'foo?author=lukeed', 'does NOT separate querystring from path');
	t.end();
});

test('exec empty (no match)', t => {
	const out = $.exec('foo', PREP[0]);
	t.is(typeof out, 'object', 'returns an object');
	t.is(Object.keys(out).length, 0, 'returns an empty object');
	t.end();
});
