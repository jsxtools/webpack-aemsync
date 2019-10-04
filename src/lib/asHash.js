// 108/105
export default function asHash(source) {
	return Object.keys(Object(source)).reduce(function (source, name) {
		source[name] = source;

		return source;
	}, Object.create(null));
}
