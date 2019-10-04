import path from 'path';
import webpack from 'webpack';
import WebpackAemDev from '../src';
import clientlibConfig from './clientlib.config';

/** @type webpack.Configuration */
const config = {
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	plugins: [
		new WebpackAemDev(clientlibConfig)
	]
};

const compiler = webpack(config);

compiler.watch({}, () => { });
