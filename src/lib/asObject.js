// 132/125
/**
 * Return an object of the object-like source or a new object of many combined object-like sources
 * @param {any} source - value being returned as an object
 * @param {...any} more - additional values being combined with source into a new object
 * @returns {Object.<string, any>}
 */
export default function asObject(source) {
	let args;

	return 1 === arguments.length && source === Object(source)
		? source
		: (
			(
				args = [{}]
			).push.apply(args, arguments),
			Object.assign.apply(args, args)
		);
}
