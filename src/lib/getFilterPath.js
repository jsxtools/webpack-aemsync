/** Return a filter-safe path */
export default pathname => pathname
	// with any content before and including jcr_root removed, and
	// with any xml file that is not "content.xml" removed, and
	// with any .dir removed, and
	.replace(/(?:.*jcr_root)|(?:(?!content)\.xml$)|(?:\.dir)/g, '$1')
	// with any underscore-like paths normalized
	.replace(/\/_([^/]*)_([^/]*)$/g, '/$1:$2')
