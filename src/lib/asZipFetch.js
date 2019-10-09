import { packmgrPath } from './defaults';
import fetch from 'node-fetch';
import { URL } from 'url';

export default (target, formData) => {
	const url = new URL(packmgrPath, target);
	const request = fetch(url, { method: 'POST', body: formData }); // 10ms

	return request.then(
		response => response.text()
	);
}
