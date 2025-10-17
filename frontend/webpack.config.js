const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: {
      app: "./static/js/auth.js",
      admin: "./static/js/script.js",
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "",
      clean: true,
    },
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        vm: require.resolve("vm-browserify"),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
        ignoreStub: true,
      }),
      new HtmlWebpackPlugin({
        filename: "login.html",
        chunks: ["app"],
        template: "./public/login.html",
      }),
      new HtmlWebpackPlugin({
        filename: "register.html",
        chunks: ["app"],
        template: "./public/register.html",
      }),
      new HtmlWebpackPlugin({
        filename: "app.html",
        chunks: ["admin"],
        template: "./public/index.html",
      }),
    ],

    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "source-map",
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },
  };
};
