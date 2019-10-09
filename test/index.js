import path from 'path';
import webpack from 'webpack';
import WebpackAemDev from '../src';
import clientlibConfig from './clientlib.config';

/** @type webpack.Configuration */
const config = {
	devtool: 'cheap-module-source-map',
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	plugins: [
		new WebpackAemDev(clientlibConfig)
	]
};

const isWatching = process.argv.slice(2).indexOf('--watch') !== -1;

const compiler = webpack(config);

if (isWatching) {
	compiler.watch({}, () => { });
} else {
	compiler.run();
}


