const {sassPlugin} = require("../../../lib")

module.exports = config => ({
  ...config,
  plugins: [
    sassPlugin({
      "filter": /^\.\.\/index.scss$/,
      "type": "style",
      "cache": true
    }),
    sassPlugin({
      "type": "lit-css",
      "cache": true
    })
  ]
})