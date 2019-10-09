import { xml, x } from './xml';
import asArray from './asArray';
import fs from 'fs';
import getFilterPath from './getFilterPath';
import hasOwnProperty from './hasOwnProperty';
import path from 'path';

/** Generates `META-INF/vault/definition/.content.xml` */
export const metaInfVaultDefinitionContentXml = () => [
	'META-INF/vault/definition/.content.xml',
	xml(
		x('jcr:root', {
			'xmlns:vlt': 'http://www.day.com/jcr/vault/1.0',
			'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
			'xmlns:nt': 'http://www.jcp.org/jcr/nt/1.0',
			'jcr:primaryTyp': 'vlt:PackageDefinition',
			'group': 'aemsync',
			'name': 'webpack-development',
			'providerLink': 'https://github.com/jsxtools/webpack-aemsync',
			'providerName': 'jsxtools',
			'providerUrl': 'https://github.com/jsxtools',
		},
			x('thumbnail', {
				'jcr:primaryType': 'nt:unstructured',
			},
				x('file', {})
			),
			x('thumbnail.png', {})
		)
	),
];

/** Generates `jcr_root/apps/.content.xml` */
export const jcrRootAppsContentXml = () => [
	'jcr_root/apps/.content.xml',
	xml(
		x('jcr:root', {
			'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
			'xmlns:nt': 'http://www.jcp.org/jcr/nt/1.0',
			'xmlns:rep': 'internal',
			'jcr:mixinTypes': '[rep:AccessControllable]',
			'jcr:primaryType': 'nt:folder'
		})
	),
];

/** Generates `META-INF/vault/properties.xml` */
export const metaInfVaultPropertiesXml = () => [
	'META-INF/vault/properties.xml',
	xml(
		'<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n',
		x('properties', {},
			x('comment', {}, 'FileVault Package Properties'),
			x('entry', { key: 'createdBy' }, 'aemsync'),
			x('entry', { key: 'group' }, 'aemsync'),
			x('entry', { key: 'name' }, 'webpack')
		)
	),
];

/** Generates `META-INF/vault/definition/thumbnail.png` */
export const metaInfVaultDefinitionThumbnailPng = dirname => [
	'META-INF/vault/definition/thumbnail.png',
	fs.readFileSync(path.join(dirname, 'thumbnail.png')),
];

const clientLibFilterContextXmlAllowedProperties = 'allowProxy,cssProcessor,dependencies,embed,jsProcessor,longCacheKey,name'.split(',');

export const clientLibFilterContextXml = (libConfig, outputPath) => [
	outputPath,
	xml(
		x(
			'jcr:root',
			clientLibFilterContextXmlAllowedProperties.reduce(
				(props, name) => {
					if (hasOwnProperty(libConfig, name)) {
						props[name] = libConfig[name];
					}

					return props;
				},
				{
					'xmlns:cq': 'http://www.day.com/jcr/cq/1.0',
					'xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
					'jcr:primaryType': 'cq:ClientLibraryFolder',
					'categories': (
						hasOwnProperty(libConfig, 'categories')
							? asArray(libConfig)
							: hasOwnProperty(libConfig, 'name')
								? asArray(libConfig.name)
								: []
					)
				}
			)
		)
	),
];

export const metaInfVaultFilterXml = clientLibOutputPath => [
	'META-INF/vault/filter.xml',
	xml(
		x('workspaceFilter', { version: '1.0' },
			x('filter', { root: getFilterPath(clientLibOutputPath) },
				x('exclude', { pattern: `${getFilterPath(clientLibOutputPath)}/.*` })
			)
		)
	),
];
