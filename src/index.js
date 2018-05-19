'use strict';

import every from '@arr/every';

const SEP = '/';
// Types ~> static, param, any, optional
const [STYPE, PTYPE, ATYPE, OTYPE] = [0, 1, 2, 3];
// Char Codes ~> / : *
const [SLASH, COLON, ASTER, QMARK] = [47, 58, 42, 63];

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
	return (obj.val === str && obj.type === STYPE) || (str === SEP ? obj.type > PTYPE : obj.type !== STYPE);
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

export function parse(str) {
	if (str === SEP) {
		return [{ old:str, type:STYPE, val:str }];
	}

	let c, x, t, nxt=strip(str), i=-1, j=0, len=nxt.length, out=[];

	while (++i < len) {
		c = nxt.charCodeAt(i);

		if (c === COLON) {
			j = i + 1; // begining of param
			t = PTYPE; // set type
			x = 0; // reset mark

			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				if (nxt.charCodeAt(i) === QMARK) {
					x=i; t=OTYPE;
				}
				i++; // move on
			}

			out.push({
				old: str,
				type: t,
				val: nxt.substring(j, x||i)
			});

			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=0;

			continue; // loop
		} else if (c === ASTER) {
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

export function exec(str, arr) {
	let i=0, x, y, segs=split(str), out={};
	for (; i < arr.length; i++) {
		x=segs[i]; y=arr[i];
		if (x === SEP) continue;
		if (x !== void 0 && y.type | 2 === OTYPE) {
			out[ y.val ] = x;
		}
	}
	return out;
}
