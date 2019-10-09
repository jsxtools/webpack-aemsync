module.exports = {
	// default working directory (can be changed per 'cwd' in every asset option)
	context: __dirname,

	// path to the clientlib root folder (output)
	clientLibRoot: 'jcr_root/apps/test-lol/clientlibs',

	// define all clientlib options here as array... (multiple clientlibs)
	libs: [
		{
			name: 'test-lol-react',
			allowProxy: true,
			embed: ['test-lol.responsivegrid'],
			cssProcessor: ['default:none', 'min:none'],
			jsProcessor: ['default:none', 'min:none'],
			serializationFormat: 'xml',
			assets: {
				js: [
					'*.js',
					'*.js.map',
					'dist/*.js',
					'dist/*.js.map'
				],
				css: [
					'dist/*.css'
				]
			}
		}
	]
}
