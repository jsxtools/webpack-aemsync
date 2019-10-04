const getFilterXmlData = libDir => xml(
	x('workspaceFilter', { version: '1.0' },
		x('filter', { root: libDir },
			x('exclude', { pattern: `${libDir}/.*` })
		)
	)
);

const getContentXmlData = config => xml(
	x('jcr:root', {
		'xmlns:cq': 'http://www.day.com/jcr/cq/1.0',
		'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
		'jcr:primaryType': 'cq:ClientLibraryFolder',
		...config
	})
);
