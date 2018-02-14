const fs = require('fs');
const mkdir = require('mk-dirs');
const { resolve } = require('path');
const imports = require('rewrite-imports');
const pkg = require('./package');

let data = fs.readFileSync('src/index.js', 'utf8');

mkdir('lib').then(_ => {
	// Copy as is for ESM
	fs.writeFileSync(pkg.module, data);

	// Mutate imports for CJS
	data = imports(data).replace(/export function\s?(.+?)(?=\()/gi, (_, x) => `exports.${x} = function `);
	fs.writeFileSync(pkg.main, data);
});
