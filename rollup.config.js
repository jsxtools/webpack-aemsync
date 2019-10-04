import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy'

export default {
	input: 'src/index.js',
	output: {
		file: 'dist/index.js',
		format: 'cjs',
		strict: false
	},
	plugins: [
		babel({
			presets: [['@babel/env', { modules: false, targets: { node: 8 } }]]
		}),
		terser(),
		copy({
			targets: [
				{ src: 'src/thumbnail.png', dest: 'dist' }
			]
		})
	]
};
