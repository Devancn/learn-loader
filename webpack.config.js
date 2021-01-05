module.exports = {
  module: {
    rule: [
      {
        test: /\.js$/,
        use: ["normal-loader1", "normal-loader2"],
      },
      {
        test: /\.js$/,
        enforce: "post",
        use: ["post-loader1", "post-loader2"],
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["pre-loader1", "pre-loader2"],
      },
    ],
  },
};
