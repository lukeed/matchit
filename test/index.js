const test = require('tape');
const $ = require('../lib');

const all = ['/', '/about', 'contact', '/books', '/books/*', '/books/:title'];

function isEntry(t, segs, expect) {
	t.true(Array.isArray(segs), '~> entry is an array of segments');
	t.is(segs.length, expect.length, `~> entry has ${expect.length} segment(s)`)

	segs.forEach((obj, idx) => {
		t.is(Object.keys(obj).length, 2, '~~> segment has `type` & `val` keys');
		t.is(typeof obj.type, 'number', '~~> segment.type is a number');
		t.is(obj.type, expect[idx].type, '~~> segment.type returns expected value');
		t.is(typeof obj.val, 'string', '~~> segment.val is a string');
		t.is(obj.val, expect[idx].val, '~~> segment.val returns expected value');
	});
}

function toParse(t, ins, outs) {
	const res = $.parse(ins);

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
	t.is(keys.length, 2, 'exports two items');
	keys.forEach(k => {
		t.is(typeof $[k], 'function', `exports.${k} is a function`);
	});
	t.end();
});

test('parse empty', t => {
	const out = $.parse([]);
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
	const out = $.match('/', all);
	t.is(typeof out, 'string', 'returns a string');
	t.is(out, '/', 'returns the pattern value');
	t.end();
});

test('match static (exact)', t => {
	const foo = $.match('/about', all);
	t.is(typeof foo, 'string', 'returns a string');
	t.is(foo, '/about', 'returns the pattern value');

	const bar = $.match('contact', all);
	t.is(typeof bar, 'string', 'returns a string');
	t.is(bar, 'contact', 'returns the pattern value');
	t.end();
});

test('match static (bare-vs-slash)', t => {
	const foo = $.match('about', all);
	t.is(typeof foo, 'string', 'returns a string');
	t.is(foo, '/about', 'returns the pattern value');
	t.end();
});

test('match static (slash-vs-bare)', t => {
	const foo = $.match('/contact', all);
	t.is(typeof foo, 'string', 'returns a string');
	t.is(foo, 'contact', 'returns the pattern value');
	t.end();
});
