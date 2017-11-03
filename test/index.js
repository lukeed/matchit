const test = require('tape');
const $ = require('../lib');

const all = ['/', '/about', 'contact', '/books', '/books/*', '/books/:title'];

test('matchit', t => {
	t.is(typeof $, 'object', 'exports an object');
	const keys = Object.keys($);
	t.is(keys.length, 2, 'exports two items');
	keys.forEach(k => {
		t.is(typeof $[k], 'function', `exports.${k} is a function`);
	});
	t.end();
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
