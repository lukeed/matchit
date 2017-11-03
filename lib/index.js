'use strict';

const SEP = '/';
// Char Codes ~> / : *
const [SLASH, COLON, ASTER] = [47, 58, 42];

function strip(str) {
	if (str === SEP) return str;
	return str.charCodeAt(0) === SLASH ? str.substring(1) : str;
}
exports.parse = function (arr) {
	//
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
