'use strict';

import every from '@arr/every';

const SEP = '/';
// Types ~> static, param, any, optional
const STYPE=0, PTYPE=1, ATYPE=2, OTYPE=3;
// Char Codes ~> / : *
const SLASH=47, COLON=58, ASTER=42, QMARK=63;

function strip(str) {
	if (str === SEP) return str;
	(str.charCodeAt(0) === SLASH) && (str=str.substring(1));
	var len = str.length - 1;
	return str.charCodeAt(len) === SLASH ? str.substring(0, len) : str;
}

function split(str) {
	return (str=strip(str)) === SEP ? [SEP] : str.split(SEP);
}

function isMatch(str, obj) {
	return (obj.val === str && obj.type === STYPE) || (str === SEP ? obj.type > PTYPE : obj.type !== STYPE && (str || '').endsWith(obj.end) && (!!obj.matcher ? obj.matcher.test(str) : true));
}

export function match(str, all) {
	let segs=split(str), len=segs.length, l;
	let i=0, tmp, fn=(o,x) => isMatch(segs[x], o);

	for (; i < all.length; i++) {
		tmp = all[i];
		if ((l=tmp.length) === len || (l < len && tmp[l-1].type === ATYPE) || (l > len && tmp[l-1].type === OTYPE)) {
			if (every(tmp, fn)) return tmp;
		}
	}

	return [];
}

export function parse(str, matchers) {
	if (str === SEP) {
		return [{ old:str, type:STYPE, val:str, end:'' }];
	}

	if (typeof matchers === 'object') {
		for (let k in matchers) {
			if (matchers[k].constructor !== RegExp) {
				throw new Error(`the "${k}" key is not a RegExp`);
			}
		}
	} else {
		matchers = {};
	}

	let c, x, t, sfx, val, nxt=strip(str), i=-1, j=0, len=nxt.length, out=[];

	while (++i < len) {
		c = nxt.charCodeAt(i);

		if (c === COLON) {
			j = i + 1; // begining of param
			t = PTYPE; // set type
			x = 0; // reset mark
			sfx = '';

			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				c = nxt.charCodeAt(i);
				if (c === QMARK) {
					x=i; t=OTYPE;
				} else if (c === 46 && sfx.length === 0) {
					sfx = nxt.substring(x=i);
				}
				i++; // move on
			}

			val = nxt.substring(j, x||i);

			out.push({
				old: str,
				type: t,
				val: val,
				end: sfx,
				matcher: matchers[val]
			});

			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=0;

			continue; // loop
		} else if (c === ASTER) {
			out.push({
				old: str,
				type: ATYPE,
				val: nxt.substring(i),
				end: ''
			});
			continue; // loop
		} else {
			j = i;
			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				++i; // skip to next slash
			}

			val = nxt.substring(j, i);

			out.push({
				old: str,
				type: STYPE,
				val: val,
				end: ''
			});
			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=j=0;
		}
	}

	return out;
}

export function exec(str, arr) {
	let i=0, x, y, segs=split(str), out={};
	for (; i < arr.length; i++) {
		x=segs[i]; y=arr[i];
		if (x === SEP) continue;
		if (x !== void 0 && y.type | 2 === OTYPE) {
			out[ y.val ] = x.replace(y.end, '');
		}
	}
	return out;
}
