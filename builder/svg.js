const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const { assetHash, emit } = require('./util');

module.exports = async (src) => {
  const data = await fs.promises.readFile(src);
  let outName = dev ? src : '_assets/[hash].svg';
  outName = assetHash(outName, data);
  await emit(`./dist/${outName}`, data);
  return `/${outName}`;
};
