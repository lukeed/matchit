const test = require('tape');
const $ = require('../lib');

const ALL = ['/', '/about', 'contact', '/books', '/books/:title', '/foo/*'];
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

test('match wildcard (simple)', t => {
	toMatch(t, '/foo/bar', 5);
});

test('match wildcard (multi-level)', t => {
	toMatch(t, '/foo/bar/baz', 5);
});
