// 113/108
export default function asArray(source) {
	return arguments.length === 1 && Array.isArray(source)
		? source
		: [].concat.apply([], Array.apply(1, arguments));
}
