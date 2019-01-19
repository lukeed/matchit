const { Suite } = require('benchmark');
const pathRegex = require('path-to-regexp');
const regexparam = require('regexparam');
const curr = require('../lib/matchit');

const data = {};
const routes = ['/', '/about', 'books', '/books/:title', '/foo/*', '/bar/:baz/:bat?'];

function bench(name) {
  console.log(`\n# ${name}`);
  const suite = new Suite();
  suite.on('cycle', e => console.log('  ' + e.target));
  return suite;
}

bench('Parsing')
	.add('matchit', _ => {
		data.matchit = routes.map(curr.parse);
	})
	.add('regexparam', _ => {
		data.regexparam = routes.map(regexparam);
	})
	.add('path-to-regexp', _ => {
		data.pregex = routes.map(x => pathRegex(x));
	})
	.add('path-to-regexp.parse', _ => {
		data.ptokens = routes.map(pathRegex.parse);
	})
	.run();

bench('Match (index)')
	.add('matchit', _ => curr.match('/', data.matchit))
	.add('regexparam', _ => {
		for (let i=0; i < data.regexparam.length; i++) {
			if (data.regexparam[i].pattern.test('/')) {
				return data.regexparam[i];
			}
		}
	})
	.add('path-to-regexp.exec', _ => data.pregex.filter(rgx => rgx.exec('/')))
	.add('path-to-regexp.tokens', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/'));
	})
	.run();

bench('Match (param)')
	.add('matchit', _ => curr.match('/bar/hello/world', data.matchit))
	.add('regexparam', _ => {
		for (let i=0; i < data.regexparam.length; i++) {
			if (data.regexparam[i].pattern.test('/bar/hello/world')) {
				return data.regexparam[i];
			}
		}
	})
	.add('path-to-regexp.exec', _ => data.pregex.filter(rgx => rgx.exec('/bar/hello/world')))
	.add('path-to-regexp.tokens', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/bar/hello/world'));
	})
	.run();

bench('Match (optional)')
	.add('matchit', _ => curr.match('/bar/baz', data.matchit))
	.add('regexparam', _ => {
		for (let i=0; i < data.regexparam.length; i++) {
			if (data.regexparam[i].pattern.test('/bar/baz')) {
				return data.regexparam[i];
			}
		}
	})
	.add('path-to-regexp.exec', _ => data.pregex.filter(rgx => rgx.exec('/bar/baz')))
	.add('path-to-regexp.tokens', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/bar/baz'));
	})
	.run();

bench('Match (wildcard)')
	.add('matchit', _ => curr.match('/foo/bar', data.matchit))
	.add('regexparam', _ => {
		for (let i=0; i < data.regexparam.length; i++) {
			if (data.regexparam[i].pattern.test('/foo/bar')) {
				return data.regexparam[i];
			}
		}
	})
	.add('path-to-regexp.exec', _ => data.pregex.filter(rgx => rgx.exec('/foo/bar')))
	.add('path-to-regexp.tokens', _ => {
		data.ptokens.map(x => pathRegex.tokensToRegExp(x)).filter(rgx => rgx.exec('/foo/bar'));
	})
	.run();

function matchitParams(uri) {
	let arr = curr.match(uri, data.matchit);
	return curr.exec(uri, arr);
}

function toParam(uri) {
	let i=0, j=0, out={}, tmp, matches;
	for (; i < data.regexparam.length;) {
		tmp = data.regexparam[i++];
	  matches = tmp.pattern.exec(uri);
	  if (matches == null) continue;
	  while (j < tmp.keys.length) {
	    out[ tmp.keys[j] ] = matches[++j] || null;
	  }
	  return out;
	}
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

bench('Exec')
	.add('matchit', _ => matchitParams('/books/foobar'))
	.add('regexparam', _ => toParam('/books/foobar'))
	.add('path-to-regexp', _ => pathRegexParams('/books/foobar'))
	.run();
