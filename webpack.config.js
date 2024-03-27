const path = require("path");

module.exports = {
  target: "node",
  entry: "./index.js",
  output: {
    path: path.resolve(),
    // publicPath:'/'
    filename: "index-bundle.js",
  },
  optimization: {
    minimize: false,
  },
  mode: "production",
};
