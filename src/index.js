import { targets } from './lib/defaults';
import { posix as path, resolve } from 'path';
import asArray from './lib/asArray';
import asExt from './lib/asExt';
import asObject from './lib/asObject';
import asZipFormData from './lib/asZipFormData';
import asZipFetch from './lib/asZipFetch';
import has from './lib/hasOwnProperty';
import getAssetMatchers from './lib/getAssetMatchers';
import Zip from './lib/zip';
import * as xmlTemplates from './lib/xml.templates';
import getZipPath from './lib/getZipPath';

/** @type {WebpackAemsyncPlugin} */
export default class WebpackAemDev {
	/** construct an instance of WebpackAemDev
	* @param {SourceConfig} config - Configuration of all client libraries
	*/
	constructor(config) {
		config = asObject(config);

		/** @type {String} os-style working directory */
		this.cwd = resolve(has(config, 'context') ? config.context : has(config, 'cwd') ? config.cwd : process.cwd());

		/** @type {SourceLib[]} List of client libraries */
		this.clientLibs = [];

		this.constructClientLibs(config);
	}

	/** Construct a client library
	* @param {SourceLib} libConfig
	*/
	constructClientLib(libConfig) {
		// only construct a client library if...
		const shouldConstructClientLib = (
			// ...the library is an object, and
			libConfig === asObject(libConfig) &&
			// ...the library has a name
			has(libConfig, 'name')
		);

		if (!shouldConstructClientLib) {
			return;
		}

		/** Path to resolve sources of the client library
		* @type {String}
		*/
		const clientLibSourcePath = has(libConfig, 'path') ? resolve(this.cwd, libConfig.path) : this.clientLibRoot;

		/** Path to resolve destinations of the client library
		* @type {String}
		*/
		const clientLibOutputPath = has(libConfig, 'outputPath') ? resolve(this.cwd, libConfig.outputPath) : resolve(clientLibSourcePath, libConfig.name);

		// generate zip file withe predetermined xml files
		const zipRoot = new Zip();

		zipRoot.set(...xmlTemplates.clientLibFilterContextXml(libConfig, getZipPath(clientLibOutputPath)));
		zipRoot.set(...xmlTemplates.jcrRootAppsContentXml());
		zipRoot.set(...xmlTemplates.metaInfVaultDefinitionContentXml());
		zipRoot.set(...xmlTemplates.metaInfVaultDefinitionThumbnailPng(__dirname));
		zipRoot.set(...xmlTemplates.metaInfVaultFilterXml(clientLibSourcePath));
		zipRoot.set(...xmlTemplates.metaInfVaultPropertiesXml());

		this.libs.push({
			assets: getAssetMatchers(libConfig.assets),
			outputPath: clientLibOutputPath,
			sourcePath: clientLibSourcePath,
			zipRoot,
		});
	}

	/**
	* @param {{ clientLibRoot: ClientLibRoot }} config
	*/
	constructClientLibs(config) {
		// only construct client libraries if:
		// - there is a configuration to use, and
		// - there are libraries to construct
		const shouldConstructClientLibs = (
			config === asObject(config) &&
			has(config, 'libs')
		);

		if (!shouldConstructClientLibs) {
			return;
		}

		/** root directory (os-style) used by all client libraries
		* @type {ClientLibRoot}
		*/
		this.clientLibRoot = resolve(this.cwd, config.clientLibRoot);
		this.libs = [];

		// configure all client libraries, where a `libs` object will become the first item in an array
		asArray(config.libs).forEach(clientLib => {
			this.constructClientLib(clientLib);
		});
	}

	/**
	* apply the compilation whenever webpack emits files
	* @param {ClientLib[]} libs
	* @param {{}} compilation
	* @param {Function} callback
	*/
	async applyCompilation(libs, compilation, callback) {
		const hrstarted = process.hrtime();

		/** @type {{ [key: string]: { children?: string[], _value?: string } }} */
		const assets = compilation.assets;

		await Promise.all(libs.map(lib => {
			const zip = lib.zipRoot.toClone(); // 0ms

			/** @type {{ [key: string]: string[] }>} */
			const assetTexts = Object.create(null);

			for (let [filename, asset] of Object.entries(assets)) {
				const basename = path.basename(filename);
				const extname = asExt(filename);

				lib.assets.forEach(([base, matcher]) => {
					if (matcher.test(filename)) {
						if (!has(assetTexts, base)) {
							assetTexts[base] = ['#base=' + base, ''];
						}

						if (extname === base) {
							assetTexts[base].push(basename);
						}

						const assetPath = path.join(lib.sourcePath, base, basename);
						const assetData = (
							Array.isArray(asset.children)
								? asset.children[0]
								: asset
						)._value;

						zip.set(getZipPath(assetPath), assetData); // 1ms
					}
				});
			}

			// create asset text files
			for (let name in assetTexts) {
				const filepath = getZipPath(path.join(this.clientLibRoot, name + '.txt'));
				const filelist = assetTexts[name];
				const filedata = filelist.join('\n');

				zip.set(filepath, filedata);
			}

			// create form data
			const formData = asZipFormData(zip, 'aemsync.zip'); // 2ms

			// promise each target is updated
			return Promise.all(targets.map(target => {
				const request = asZipFetch(target, formData); // 10ms

				return request.then(() => {
					const hrelapsed = Math.round(process.hrtime(hrstarted)[1] / 1000000);
					console.info('syncing %s completed in %dms', target, hrelapsed);
				}, () => {
					const hrelapsed_1 = Math.round(process.hrtime(hrstarted)[1] / 1000000);
					console.error('syncing %s failed in %dms', target, hrelapsed_1);
				});
			}));
		}));

		const hrelapsed = Math.round(process.hrtime(hrstarted)[1] / 1000000);
		console.info('syncing completed in %dms', hrelapsed);

		callback();
	}

	apply(compiler) {
		// determine whether the plugin should apply, whether there are assets to match
		const libs = this.libs.filter(lib => lib.assets.length);

		const shouldApplyEmit = libs.length;

		if (!shouldApplyEmit) {
			return;
		}

		compiler.hooks.afterEmit.tapAsync('webpack-aemsync', this.applyCompilation.bind(this, libs));
	}
}

/**
* @typedef {Object} SourceConfig - Configuration of all client libraries
* @property {String} clientLibRoot - Path to the default root directory for all client libraries
* @property {String} context - Path to the default working directory
* @property {String} cwd - Fallback alias for "context"
* @property {Boolean} dry - Whether to run without file write operations
* @property {SourceLib | SourceLib[]} libs - One or more client Libraries
* @property {Boolean} verbose - Whether to print detailed information during generation
*
* @typedef {Object} SourceLib
* @property {Boolean} [allowProxy=false] - Whether to allow the client library to be referenced from /etc.clientlibs
* @property {{ css?: SourceAsset[], js?: SourceAsset[], resources?: SourceAsset[] }} assets - Content that should be copied to the client library directory
* @property {String[]} [categories] - Categories of the client library
* @property {String[]} [cssProcessor] - Configuration of the client library JS processor
* @property {String[]} [dependencies] - Additional client libraries to be included in the client library
* @property {String[]} [embed] - Additional client libraries to be embedded in the client library
* @property {String[]} [jsProcessor] - Configuration of the client library JS processor
* @property {String} [longCacheKey] - Placeholders to use with URL Fingerprinting
* @property {String} [outputPath] - Path to resolve destinations of the client library
* @property {String} name - Name of the client library
* @property {String} [path] - Path to resolve sources of the client library
* @property {"json" | "xml"} [serializationFormat="xml"] - Type of the target archive for which the resources must be generated
*
* @typedef {String} SourceAsset - Path to the asset copied to the client library directory
*
* @typedef {"css" | "js" | "resources"} AssetType - Type of client library asset
*/

/**
* @typedef {Object} ClientLib - client library configuration
* @property {[AssetType, RegExp][]} assets - content used by the client library
* @property {String} path - working directory (os-style) of the client library
* @property {String} outputPath - destination directory (os-style) of the client library
* @property {Zip} zipRoot - zip file containing predetermined contents of the client library
* @property {Zip} zip - zip file containing the most recent contents of the client library
*/
