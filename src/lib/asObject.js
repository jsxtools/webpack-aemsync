// 132/125
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
