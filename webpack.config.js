'use strict';

const path = require('path');

const StaticSitePlugin = require('static-site-generator-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: {
    app: './app/index.tsx',
    gen: {
      import: './app/gen.ts',
      library: {
        type: 'umd'
      }
    }
  },
  output: {
    clean: true,
    path: path.join(__dirname, 'dist'),
    filename: dev ? '[name].js' : '[name].[contenthash].min.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  },
  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /\.md$/,
      type: 'asset/source'
    }]
  },
  target: "node",
  plugins: [
    new StaticSitePlugin({
      entry: 'gen'
    })
  ]
};
