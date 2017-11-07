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
	return str === SEP ? [SEP] : str.split(SEP);
}

function isMatch(str, obj) {
	return (obj.val === str && obj.type === STYPE) || obj.type !== STYPE;
}

function byLength(num, arr) {
	let x=arr.length, type=arr[x-1].type;
	return x===num || (x < num && type===ATYPE) || (x > num && type===OTYPE);
}

exports.match = function (str, all) {
	str = strip(str)

	let i = 0,
		segs = split(str),
		fn = (o,x) => isMatch(segs[x], o),
		by = byLength.bind(null, segs.length),
		arr = filter(all, by); // filter by segment length

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
	let segs=split(strip(str)), out={};
	filter(arr, (x,n) => {
		if (x.type === PTYPE) {
			out[x.val] = segs[n];
		}
	});
	return out;
};
