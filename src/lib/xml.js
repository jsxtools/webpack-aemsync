export const x = (name, props, ...nodes) => {
	const attrs = Object.keys(props).reduce((attrs, name) => {
		let value = props[name];

		if (value !== undefined && value !== null) {
			value = typeof value === 'boolean'
				? `{Boolean}${value}`
				: Array.isArray(value)
					? `[${value.join(',')}]`
					: value;

			attrs.push(` ${name}="${value}"`);
		}

		return attrs;
	}, []).join('');
	const data = nodes.join('');

	return `<${name}${attrs}${data ? `>${data}</${name}>` : `/>`}`;
};

export const xml = (...nodes) => `<?xml version="1.0" encoding="UTF-8" ?>\n${nodes.join('')}`;
