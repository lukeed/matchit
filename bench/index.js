const Table = require('cli-table2');
const { Suite } = require('benchmark');
const pathRegex = require('path-to-regexp');
const curr = require('../lib');

const data = {};
const routes = ['/', '/about', 'books', '/books/:title', '/foo/*'];

new Suite()
	.add('matchit.parse', _ => {
		data.matchit = curr.parse(routes);
	})
	.add('path-to-regexp', _ => {
		data.pathRegex = routes.map(x => pathRegex(x));
	})
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', onComplete)
	.run();

// new Suite()


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