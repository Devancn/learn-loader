const htmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  /*
  resolveLoader: {
    alias: {
      "babel-loader": path.resolve("./loaders/babel-loader.js"),
    },
    modules: [path.resolve("./loaders"), "node_modules"],
  },
  */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [path.resolve(__dirname, "./loaders2/inline-loader1.js")],
        include: path.resolve("src"),
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: path.resolve("./loaders/url-loader.js"),
          options: {
            name: "[hash:8].[ext]",
            limit: 1024 * 20,
          },
        },
        include: path.resolve("src"),
      },
      {
        test: /\.less$/,
        use: [
          path.resolve("./loaders/style-loader.js"),
          path.resolve("./loaders/less-loader.js"),
        ],
        include: path.resolve("src"),
      },
    ],
  },
  plugins: [new htmlWebpackPlugin()],
};
