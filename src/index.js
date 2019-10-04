import { packmgrPath, targets } from './lib/defaults';
import { posix as path } from 'path';
import { URL } from 'url';
import { x, xml } from './lib/xml';
import asArray from './lib/asArray';
import asExt from './lib/asExt';
import asHash from './lib/asHash';
import asObject from './lib/asObject';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import hasOwnProperty from './lib/hasOwnProperty';
import Zip from './lib/zip';

const formatClientLibRoot = string => string.replace(/^[\W\w]*(jcr_root)|\/$/g, '$1');
const formatClientLibFilterRoot = string => string.replace(/^[\W\w]*(jcr_root)/, '');
const appsContentXmlPath = 'jcr_root/apps/.content.xml';
const appsContentXmlData = xml(
	x('jcr:root', {
		'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
		'xmlns:nt': 'http://www.jcp.org/jcr/nt/1.0',
		'xmlns:rep': 'internal',
		'jcr:mixinTypes': '[rep:AccessControllable]',
		'jcr:primaryType': 'nt:folder'
	})
);
const metaInfVaultPropertiesXmlPath = 'META-INF/vault/properties.xml';
const metaInfVaultPropertiesXmlData = xml(
	'<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">',
	x('properties', {},
		x('comment', {}, 'FileVault Package Properties'),
		x('entry', { key: 'createdBy' }, 'aemsync'),
		x('entry', { key: 'group' }, 'aemsync'),
		x('entry', { key: 'name' }, 'webpack')
	)
);
const thumnailPngPath = path.join(__dirname, 'thumbnail.png');
const metaInfVaultDefinitionThumbnailPngPath = 'META-INF/vault/definition/thumbnail.png';
const metaInfVaultDefinitionThumbnailPngData = fs.readFileSync(thumnailPngPath);

const createFormData = zip => {
	const formData = new FormData();

	formData.append('file', zip.toStream('aemsync.zip'));
	formData.append('force', 'true');
	formData.append('install', 'true');

	return formData;
}

export default class WebpackAemDev {
	/** construct an instance of WebpackAemDev
	* @param {Object<string, any>} options - Bla bla bla
	*/
	constructor(clientLibConfig) {
		this.constructClientLib(clientLibConfig);
	}

	constructClientLib(config) {
		config = asObject(config);

		// get the client library object as either the first item in `libs` or `libs` itself
		const clientLib = asObject(asArray(config.libs)[0]);

		// get the supported client file extensions
		this.clientLibExts = asHash(clientLib.assets);

		// get the raw path of the current client library
		const clientLibPath = hasOwnProperty(clientLib, 'path') ? clientLib.path : config.clientLibRoot;

		// get the raw path of the current client library
		const clientLibRoot = path.join(formatClientLibRoot(clientLibPath), clientLib.name);
		const clientLibFilterContextXmlPath = path.join(clientLibRoot, 'content.xml');
		const clientLibFilterContextXmlData = xml(
			x(
				'jcr:root',
				'allowProxy,categories,cssProcessor,dependencies,embed,jsProcessor,longCacheKey,name'.split(',').reduce(
					(props, name) => {
						if (hasOwnProperty(clientLib, name)) {
							props[name] = clientLib[name];
						}

						return props;
					},
					{
						'xmlns:cq': 'http://www.day.com/jcr/cq/1.0',
						'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
						'jcr:primaryType': 'cq:ClientLibraryFolder'
					}
				)
			)
		);
		const clientLibFilterRoot = formatClientLibFilterRoot(clientLibRoot);
		const metaInfVaultFilterXmlPath = 'META-INF/vault/filter.xml';
		const metaInfVaultFilterXmlData = xml(
			x('workspaceFilter', { version: '1.0' },
				x('filter', { root: clientLibFilterRoot },
					x('exclude', { pattern: `${clientLibFilterRoot}/.*` })
				)
			)
		);

		const zip = new Zip();

		zip.set(appsContentXmlPath, appsContentXmlData);
		zip.set(metaInfVaultFilterXmlPath, metaInfVaultFilterXmlData);
		zip.set(metaInfVaultPropertiesXmlPath, metaInfVaultPropertiesXmlData);
		zip.set(metaInfVaultDefinitionThumbnailPngPath, metaInfVaultDefinitionThumbnailPngData);
		zip.set(clientLibFilterContextXmlPath, clientLibFilterContextXmlData);

		this.clientLibRoot = clientLibRoot;
		this.zip = zip;

		return config;
	}

	apply(compiler) {
		compiler.hooks.afterEmit.tapAsync('webpack-aemsync', (compilation, callback) => {
			const hrstarted = process.hrtime();
			const clone = this.zip.toClone(); // 0ms
			const assetTexts = Object.create(null);

			for (let [filename, asset] of Object.entries(compilation.assets)) {
				const extname = asExt(filename);

				if (extname in this.clientLibExts) {
					const basename = path.basename(filename);

					filename = path.join(this.clientLibRoot, extname, basename);

					if (!hasOwnProperty(assetTexts, extname)) {
						assetTexts[extname] = ['#base=' + extname, ''];
					}

					assetTexts[extname].push(basename);

					const data = Array.isArray(asset.children)
						? asset.children[0]._value
						: asset._value;

					clone.set(filename, data); // 1ms
				}
			}

			// create asset text files
			for (let name in assetTexts) {
				const filepath = path.join(this.clientLibRoot, name + '.txt');
				const filedata = assetTexts[name].join('\n');

				clone.set(filepath, filedata);
			}

			// create form data
			const formData = createFormData(clone); // 2ms

			// promise each target is updated
			return Promise.all(
				targets.map(target => {
					const url = new URL(packmgrPath, target);
					const request = fetch(url, { method: 'POST', body: formData }); // 10ms

					return request.then(
						response => response.text()
					).then(() => {
						const hrelapsed = Math.round(process.hrtime(hrstarted)[1] / 1000000);
						console.info('syncing %s completed in %dmd', target, hrelapsed);
					}, () => {
						const hrelapsed = Math.round(process.hrtime(hrstarted)[1] / 1000000);
						console.error('syncing %s failed in %dmd', target, hrelapsed);
					});
				})
			).then(callback);
		});
	}
}
