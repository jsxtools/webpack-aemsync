import { posix as path } from 'path';
import AdmZip from 'adm-zip';
import stream from 'stream';

const emptyBuffer = Buffer.alloc(0);
const trailingSlashMatch = /\/$/;
const trimTrailingSlash = string => string.replace(trailingSlashMatch, '');

export default class Zip {
	constructor() {
		this.raw = new AdmZip();
	}

	entries() {
		return this.raw ? this.raw.getEntries() : [];
	}

	hasPath(pathname) {
		return this.raw && Boolean(this.raw.getEntry(pathname));
	}

	set(pathname, content) {
		// pathname has a trailing slash if content is undefined, otherwise it is itself
		pathname = content === undefined ? trimTrailingSlash(pathname) + '/' : pathname;

		// content is an empty buffer if the pathname has a trailing slash, otherwise it is itself
		content = trailingSlashMatch.test(pathname) ? emptyBuffer : content;

		const zip = this.raw;

		if (zip) {
			if (!zip.getEntry(pathname)) {
				// create a parent directory that may not already exist
				const dirname = path.dirname(pathname);

				if (dirname !== pathname && dirname !== '.' && !zip.getEntry(dirname + '/')) {
					this.set(dirname);
				}

				// add the file or directory
				// console.log('add', pathname);
				zip.addFile(pathname, content);
			} else if (!trailingSlashMatch.test(pathname)) {
				// update the file or directory
				// console.log('set', pathname);
				zip.updateFile(pathname, content);
			}

		}

		return this;
	}

	toClone() {
		const nextZip = new Zip();

		this.raw.getEntries().forEach(entry => {
			nextZip.raw.addFile(entry.entryName, entry.getData());
		});

		return nextZip;
	}

	toStream(pathname) {
		const bufferStream = new stream.PassThrough();

		bufferStream.end(this.raw ? this.raw.toBuffer() : emptyBuffer);
		bufferStream.path = pathname;

		return bufferStream;
	}

	unset(pathname) {
		this.raw.getEntries().slice(0).forEach(entry => {
			if (entry.entryName.startsWith(pathname)) {
				// console.log('nil', entry.entryName);
				this.raw.deleteFile(entry.entryName)
			}
		});

		return this;
	}
}
