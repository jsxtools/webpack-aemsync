# webpack-aemsync

A webpack plugin to directly sync webpack with AEM.

```js
// webpack.config.js
const WebpackAemSync = require('webpack-aemsync');
const clientLibConfig = require('/path/to/clientlib.config.js');

module.exports = {
  plugins: [
    new WebpackAemSync(clientLibConfig),
    // ...additional plugins
  ],
  // ...additional configuration
};
```
