'use strict';

const SEP = '/';
// Types ~> static, param, any
const [STYPE, PTYPE, ATYPE] = [0, 1, 2];
// Char Codes ~> / : *
const [SLASH, COLON, ASTER] = [47, 58, 42];

function strip(str) {
	if (str === SEP) return str;
	return str.charCodeAt(0) === SLASH ? str.substring(1) : str;
}

function parse(str) {
	if ((str=strip(str)) === SEP) {
		return [{ val:str, type:STYPE }];
	}

	let ch, i=-1, j=0, len=str.length, out=[];

	while (++i < len) {
		ch = str.charCodeAt(i);

		if (ch === COLON) {
			j = i + 1; // begining of param

			while (i < len && str.charCodeAt(i) !== SLASH) {
				i++; // skip ahead to next /
			}

			out.push({
				type: PTYPE,
				val: str.substring(j, i)
			});

			// shorten string & update pointers
			str=str.substring(i); len-=i; i=j;

			continue; // loop
		} else if (ch === ASTER) {
			out.push({
				type: ATYPE,
				val: str.substring(i)
			});
			continue; // loop
		} else {
			while (i < len && str.charCodeAt(i) !== SLASH) {
				i++; // skip ahead to next /
			}
		}

		out.push({
			type: STYPE,
			val: str.substring(0, i)
		});
	}

	return out;
}

exports.parse = function (arr) {
	return arr.map(parse);
}

exports.match = function (str, all) {
	str = strip(str);

	// format array & search `static`s first
	let i=0, tmp, len=all.length, arr=new Array(len);
	for (; i<len; i++) {
		tmp = strip(all[i]);
		if (str === tmp) {
			return all[i];
		}
		arr[i] = tmp;
	}

	console.log('> arr', arr);
};