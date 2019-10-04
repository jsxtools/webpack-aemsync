const fetch = require('node-fetch');
const FormData = require('form-data');
const stream = require('stream');
const Zip = require('adm-zip');

const zip = new Zip();

zip.addLocalFolder('jcr_root', 'jcr_root');
zip.addLocalFolder('META-INF', 'META-INF');

const bufferToReadStream = (buffer, filename) => {
	buffStream.end(buffer);
	buffStream.path = filename;
};

const readStream = bufferToReadStream(zip.toBuffer(), 'aemsync.zip');

// process.exit(0);

const form = new FormData();
form.append('file', readStream);
form.append('force', 'true');
form.append('install', 'true');

fetch('http://admin:admin@localhost:4502/crx/packmgr/service.jsp', {
	method: 'POST',
	body: form
})
	.then(response => {
		if (response.ok) {
			return response;
		} else {
			throw response;
		}
	})
	.then(() => {
		console.log('pushed');
	});
