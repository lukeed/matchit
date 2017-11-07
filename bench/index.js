const Table = require('cli-table2');
const { Suite } = require('benchmark');
const pathRegex = require('path-to-regexp');
const curr = require('../lib');

const data = {};
const routes = ['/', '/about', 'books', '/books/:title', '/foo/*', '/bar/:baz/:bat?'];

new Suite()
	.add('matchit.parse', _ => {
		data.matchit = routes.map(curr.parse);
	})
	.add('path-to-regexp', _ => {
		data.pregex = routes.map(x => pathRegex(x));
	})
	.add('path-to-regexp.parse', _ => {
		data.ptokens = routes.map(pathRegex.parse);
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (index)', _ => curr.match('/', data.matchit))
	.add('path-to-regexp.exec (index)', _ => data.pregex.filter(rgx => rgx.exec('/')))
	.add('path-to-regexp.tokens (index)', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/'));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (param)', _ => curr.match('/bar/hello/world', data.matchit))
	.add('path-to-regexp.exec (param)', _ => data.pregex.filter(rgx => rgx.exec('/bar/hello/world')))
	.add('path-to-regexp.tokens (param)', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/bar/hello/world'));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (optional)', _ => curr.match('/foo/bar', data.matchit))
	.add('path-to-regexp.exec (optional)', _ => data.pregex.filter(rgx => rgx.exec('/foo/bar')))
	.add('path-to-regexp.tokens (optional)', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/foo/bar'));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (wildcard)', _ => curr.match('/foo/bar', data.matchit))
	.add('path-to-regexp.exec (wildcard)', _ => data.pregex.filter(rgx => rgx.exec('/foo/bar')))
	.add('path-to-regexp.tokens (wildcard)', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/foo/bar'));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

function matchitParams(uri) {
	let arr = curr.match(uri, data.matchit);
	return curr.exec(uri, arr);
}

function pathRegexParams(uri) {
	let i=0, j, tmp, tokens, obj={};
	let regex = data.ptokens.map(x => pathRegex.tokensToRegExp(x));

	for (; i < regex.length; i++) {
		tmp = regex[i].exec(uri);

		if (tmp && tmp.length > 0) {
			tokens = data.ptokens[i];
			for (j=0; j < tokens.length; j++) {
				if (typeof tokens[j] === 'object') {
					obj[ tokens[j].name ] = tmp[j];
				}
			}
			return obj;
		}
	}
	return obj;
}

new Suite()
	.add('matchit.exec (params)', _ => matchitParams('/books/foobar'))
	.add('path-to-regexp.exec (params)', _ => pathRegexParams('/books/foobar'))
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

function onComplete() {
	console.log('Fastest is ' + this.filter('fastest').map('name'));

	const tbl = new Table({
		head: ['Name', 'Mean time', 'Ops/sec', 'Diff']
	});

	let prev, diff;
	this.forEach(el => {
		diff = prev ? (((el.hz - prev) * 100 / prev).toFixed(2) + '% faster') : 'N/A';
		tbl.push([el.name, el.stats.mean, el.hz.toLocaleString(), diff])
		prev = el.hz;
	});
	console.log(tbl.toString());
}
