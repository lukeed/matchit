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
		data.pathRegex = routes.map(x => pathRegex(x));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (index)', _ => curr.match('/', data.matchit))
	.add('path-to-regexp.exec (index)', _ => data.pathRegex.filter(rgx => rgx.exec('/')))
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (param)', _ => curr.match('/bar/hello/world', data.matchit))
	.add('path-to-regexp.exec (param)', _ => data.pathRegex.filter(rgx => rgx.exec('/bar/hello/world')))
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (optional)', _ => curr.match('/foo/bar', data.matchit))
	.add('path-to-regexp.exec (optional)', _ => data.pathRegex.filter(rgx => rgx.exec('/foo/bar')))
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

new Suite()
	.add('matchit.match (wildcard)', _ => curr.match('/foo/bar', data.matchit))
	.add('path-to-regexp.exec (wildcard)', _ => data.pathRegex.filter(rgx => rgx.exec('/foo/bar')))
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
