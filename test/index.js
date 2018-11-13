const test = require('tape');
const $ = require('../lib/matchit');

const ALL = ['/', '/about', 'contact', '/books', '/books/:title', '/foo/*', 'bar/:baz/:bat?', '/videos/:title.mp4'];
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
		t.is(Object.keys(obj).length, 5, '~~> segment has `old`, `type` & `val` keys');
		t.is(typeof obj.type, 'number', '~~> segment.type is a number');
		t.is(obj.type, expect[idx].type, '~~> segment.type returns expected value');
		t.is(typeof obj.val, 'string', '~~> segment.val is a string');
		t.is(obj.val, expect[idx].val, '~~> segment.val returns expected value');
		t.is(typeof obj.end, 'string', '~~> segment.end is a string');
		t.is(obj.end, expect[idx].end, '~~> segment.end returns expected value');
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
		[{ type:0, val:'/', end:'' }]
	]);
});

test('parse statics', t => {
	const input = ['/about', 'contact', '/foobar'];
	toParse(t, input, [
		[{ type:0, val:'about', end:'' }],
		[{ type:0, val:'contact', end:'' }],
		[{ type:0, val:'foobar', end:'' }],
	]);
});

test('parse params', t => {
	const input = ['/:foo', 'books/:title', '/foo/:bar'];
	toParse(t, input, [
		[{ type:1, val:'foo', end:'' }],
		[{ type:0, val:'books', end:'' }, { type:1, val:'title', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:1, val:'bar', end:'' }]
	]);
});

test('parse params (suffix)', t => {
	const input = ['/:foo.bar', 'books/:title.jpg', '/foo/:bar.html'];
	toParse(t, input, [
		[{ type:1, val:'foo', end:'.bar' }],
		[{ type:0, val:'books', end:'' }, { type:1, val:'title', end:'.jpg' }],
		[{ type:0, val:'foo', end:'' }, { type:1, val:'bar', end:'.html' }]
	]);
});

test('parse params (multiple)', t => {
	const input = ['/foo/:bar/:baz', '/foo/bar/:baz', '/foo/bar/:baz/:bat'];
	toParse(t, input, [
		[{ type:0, val:'foo', end:'' }, { type:1, val:'bar', end:'' }, { type:1, val:'baz', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:0, val:'bar', end:'' }, { type:1, val:'baz', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:0, val:'bar', end:'' }, { type:1, val:'baz', end:'' }, { type:1, val:'bat', end:'' }]
	]);
});

test('parse params (optional)', t => {
	const input = ['/:foo?', 'foo/:bar?', '/foo/:bar?/:baz?'];
	toParse(t, input, [
		[{ type:3, val:'foo', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:3, val:'bar', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:3, val:'bar', end:'' }, { type:3, val:'baz', end:'' }],
	]);
});

test('parse wilds', t => {
	const input = ['*', '/*', 'foo/*', 'foo/bar/*'];
	toParse(t, input, [
		[{ type:2, val:'*', end:'' }],
		[{ type:2, val:'*', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:2, val:'*', end:'' }],
		[{ type:0, val:'foo', end:'' }, { type:0, val:'bar', end:'' }, { type:2, val:'*', end:'' }]
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

test('match params (root index-vs-param)', t => {
	let foo = $.match('/', [$.parse('/')]);
	t.same(foo[0], { old:'/', type:0, val:'/', end:'', matcher: null }, 'matches root-index route with index-static pattern');

	let bar = $.match('/', [$.parse('/:title')]);
	t.is(bar[0], undefined, 'does not match root-index route with param-pattern');

	let baz = $.match('/narnia', [$.parse('/:title')]);
	t.same(baz[0], { old:'/:title', type:1, val:'title', end:'', matcher: null }, 'matches param-based route with param-pattern');

	let bat = $.match('/', [$.parse('/:title?')]);
	t.same(bat[0], { old:'/:title?', type:3, val:'title', end:'', matcher: null }, 'matches root-index route with optional-param pattern');

	let quz = $.match('/', [$.parse('*')]);
	t.same(quz[0], { old:'*', type:2, val:'*', end:'', matcher: null }, 'matches root-index route with root-wilcard pattern');

	let qut = $.match('/', ['/x', '*'].map($.parse));
	t.same(qut[0], { old:'*', type:2, val:'*', end:'', matcher: null }, 'matches root-index with wildcard pattern');

	let qar = $.match('/', ['*', '/x'].map($.parse));
	t.same(qar[0], { old:'*', type:2, val:'*', end:'', matcher: null }, 'matches root-index with wildcard pattern (reorder)');

	t.end();
});

test('match params (index-vs-param)', t => {
	let foo = $.match('/books', [$.parse('/books/:title')]);
	t.same(foo, [], 'does not match index route with param-pattern');
	let bar = $.match('/books/123', [$.parse('/books')]);
	t.same(bar, [], 'does not match param-based route with index-pattern');
	t.end();
});

test('match params (suffix)', t => {
	toMatch(t, '/videos/buckbunny.mp4', 7);
});

test('match params (suffix, nomatch)', t => {
	toMatch(t, '/videos/buckbunny', -1);
});

// test('match params (suffix, nomatch)', t => {
// 	let foo = $.match('/', [$.parse('/')]);
// 	t.same(foo[0], { old:'/', type:0, val:'/', end:'' }, 'matches root-index route with index-static pattern');
// });

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

test('exec index (optional)', t => {
	const arr = $.parse('/:type?');
	const foo = $.exec('/', arr);
	const bar = $.exec('/news', arr);

	t.is(typeof foo, 'object', 'returns an object');
	t.same(foo, {}, 'returns empty object (no params)');

	t.is(typeof bar, 'object', 'returns an object');
	const keys = Object.keys(bar);
	t.is(keys.length, 1, 'returns object with 1 key');
	t.is(keys[0], 'type', '~> contains `type` key');
	t.is(bar.type, 'news', '~> adds `key:val` pair');

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

test('exec params (suffix)', t => {
	const arr = $.match('/videos/foo.mp4', PREP);
	const out = $.exec('/videos/foo.mp4', arr);
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

test('match params not a regex (raise error)', t => {
	const foo = () => $.parse('/foo/:bar', {
		bar: 1
	});

	t.throws(foo, /matcher for bar is not a regex/, 'matcher must be a regex');
	t.end();
});

test('match params via matcher (no match)', t => {
	const foo = $.parse('/foo/:bar', {
		bar: /[a-z]+/
	});

	t.is($.match('/foo/1', [foo]).length, 0, 'no match found');
	t.end();
});

test('match params via matcher (found match)', t => {
	const foo = $.parse('/foo/:bar', {
		bar: /[a-z]+/
	});

	t.deepEqual($.match('/foo/bar', [foo]), foo);
	t.end();
});

test('match params via matcher (optional-param)', t => {
	const foo = $.parse('/foo/:bar?', {
		bar: /[a-z]+/
	});

	t.deepEqual($.match('/foo', [foo]), foo);
	t.is($.match('/foo/1', [foo]).length, 0);
	t.end();
});

test('continue match when matcher regex fails', t => {
	const foo = $.parse('/foo/:bar?', {
		bar: /[a-z]+/
	});

	const foo1 = $.parse('/foo/:id?', {
		bar: /[0-9]+/
	});

	t.deepEqual($.match('/foo/1', [foo, foo1]), foo1);
	t.end();
});
