'use strict';

const every = require('@arr/every');
const filter = require('@arr/filter');

const SEP = '/';
// Types ~> static, param, any
const [STYPE, PTYPE, ATYPE] = [0, 1, 2];
// Char Codes ~> / : *
const [SLASH, COLON, ASTER] = [47, 58, 42];

function strip(str) {
	if (str === SEP) return str;
	(str.charCodeAt(0) === SLASH) && (str=str.substring(1));
	var len = str.length - 1;
	return str.charCodeAt(len) === SLASH ? str.substring(0, len) : str;
}

function split(str) {
	return str === SEP ? [SEP] : str.split(SEP);
}

function parse(str) {
	if (str === SEP) {
		return [{ old:str, type:STYPE, val:str }];
	}

	let ch, nxt=strip(str), i=-1, j=0, len=nxt.length, out=[];

	while (++i < len) {
		ch = nxt.charCodeAt(i);

		if (ch === COLON) {
			j = i + 1; // begining of param

			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				i++; // skip to next slash
			}

			out.push({
				old: str,
				type: PTYPE,
				val: nxt.substring(j, i)
			});

			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=j;

			continue; // loop
		} else if (ch === ASTER) {
			out.push({
				old: str,
				type: ATYPE,
				val: nxt.substring(i)
			});
			continue; // loop
		} else {
			j = i;
			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				++i; // skip to next slash
			}
			out.push({
				old: str,
				type: STYPE,
				val: nxt.substring(j, i)
			});
			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=j=0;
		}
	}

	return out;
}

exports.parse = function (arr) {
	return arr.map(parse);
}

function isMatch(str, obj) {
	return (obj.val === str && obj.type === STYPE) || obj.type !== STYPE;
}

exports.match = function (str, all) {
	str = strip(str)
	let segs=split(str), len=segs.length;

	// filter down by number of segment size
	// ~> TODO optional (and any?) allows extra length
	// ~~> return (l=x.length) <= len || (l > len && x[l-1].type === ATYPE);
	let arr = filter(all, x => x.length === len);
	let i=0, fn=(o,x) => isMatch(segs[x], o);

	for (; i < arr.length; i++) {
		if (every(arr[i], fn)) {
			return arr[i][0].old;
		}
	}

	return '';
};
