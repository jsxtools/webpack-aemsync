/**
* Return an array of the array-like source or a new array of many combined array-like sources
* @param {any} source - array-like value being returned as an array
* @param {...any} more - additional array-like vaues being combined with source into a new array
* @returns {Array}
*/
export default function asArray(source) { // 113/108
	return arguments.length === 1 && Array.isArray(source)
		? source
		: [].concat.apply([], Array.apply(1, arguments));
}
