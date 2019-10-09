import glob from './glob';

/** Return an array of asset types alongside regular expressions that match assets for that type
* @param {{ [key: AssetType]: String[] }} assetGlobs - A collection of glob patterns that match a client library asset type
* @return {[AssetType, RegExp][]}
*/
export default function getAssetEntries(assetGlobs) {
	return Object.entries(assetGlobs).reduce(
		/**
		* @param {[ AssetType, RegExp ][]} assetEntries
		* @param {[ AssetType, String[] ]}
		*/
		(assetEntries, [assetType, assetGlobs]) => {
			assetGlobs.forEach(assetGlob => {
				const globRegExp = glob(assetGlob);

				/** @type {[AssetType, RegExp]} */
				const assetMatcher = [assetType, globRegExp];

				assetEntries.push(assetMatcher);
			});

			return assetEntries;
		},
		[]
	);
}

/**
* @typedef {"css" | "js" | "resources"} AssetType - A type of client library asset
*/
