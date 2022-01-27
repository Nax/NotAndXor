'use strict';

const path = require('path');

const nodeExternals = require('webpack-node-externals');
const StaticSitePlugin = require('static-site-generator-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: {
    app: './app/index.ts',
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
      test: /\.css$/,
      type: 'asset/resource',
      generator: {
        filename: dev ? 'app.css' : 'app.[contenthash].min.css'
      },
      use: [
        'postcss-loader'
      ]
    }, {
      test: /\.svg$/,
      type: 'asset/source',
      use: [{
        loader: 'svgo-loader',
        options: {

        }
      }]
    }, {
      test: /\.md$/,
      type: 'asset/source'
    }]
  },
  target: "node",
  plugins: [
    new StaticSitePlugin({
      entry: 'gen',
      crawl: true
    })
  ],
  externals: [nodeExternals()]
};
