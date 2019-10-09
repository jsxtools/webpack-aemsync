import FormData from 'form-data';

export default (zip, filename) => {
	const formData = new FormData();

	formData.append('file', zip.toStream(filename)); // 2ms
	formData.append('force', 'true');
	formData.append('install', 'true');

	return formData;
};
