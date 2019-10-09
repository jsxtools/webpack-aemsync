import { resolve } from 'path';

/** Return a posix-style path */
export default pathname => resolve(pathname)
	// with windows-style backslashes replaced with posix-style slashes, and
	.replace(/\\/g, '/')
	// with trailing slashes removed
	.replace(/\/$/, '');
