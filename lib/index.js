'use strict';

const every = require('@arr/every');
const filter = require('@arr/filter');

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
	return (obj.val === str && obj.type === STYPE) || obj.type !== STYPE;
}

exports.match = function (str, all) {
	let segs=split(str), len=segs.length, l;

	// filter by segment length
	let arr=filter(all, x => {
		return (l=x.length) === len || (l < len && x[l-1].type === ATYPE) || (l > len && x[l-1].type === OTYPE);
	});

	let i=0, fn=(o,x) => isMatch(segs[x], o);

	for (; i < arr.length; i++) {
		if (every(arr[i], fn)) {
			return arr[i];
		}
	}

	return [];
};

exports.parse = function (str) {
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
};

exports.exec = function (str, arr) {
	let i=0, x, y, segs=split(str), out={};
	for (; i < arr.length; i++) {
		x=segs[i]; y=arr[i];
		if (x !== void 0 && y.type | 2 === OTYPE) {
			out[ y.val ] = x;
		}
	}
	return out;
};
