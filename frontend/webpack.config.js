const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return {
    entry: {
      auth: "./static/js/auth.js",
      public: "./static/js/script.js",
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    devServer: {
      static: "./dist",
      port: 3000,
      open: true,
    },
    resolve: {
      fallback: {
        path: false,
        crypto: require.resolve("crypto-browserify"),
      },
    },
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./public/index.html",
        chunks: ["auth"],
      }),
      new HtmlWebpackPlugin({
        filename: "public.html",
        template: "./public/index.html",
        chunks: ["public"],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
      ],
    },
  };
};
