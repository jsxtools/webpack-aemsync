import getCleanPath from './getCleanPath';

/** Return a clean path from jcr_root */
export default pathname => getCleanPath(pathname)
	// with any content before jcr_root removed
	.replace(/.*\/(jcr_root\/.*)/, '$1');
