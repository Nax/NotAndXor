const fs = require('fs');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

const { assetHash, emit } = require('./util');

module.exports = async (src, outDir, outName) => {
  const stream = await fs.promises.readFile(src);
  const data = await postcss()
    .use(postcssImport())
    .use(postcssPresetEnv())
    .use(cssnano())
    .process(stream, { from: src });
  outName = assetHash(outName, data.css);
  await emit(`${outDir}/${outName}`, data.css);
  return `/${outName}`;
};
