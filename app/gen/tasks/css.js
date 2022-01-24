'use strict';

const fs = require('fs');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

const { replaceFilename } = require('../util');

module.exports = (opts) => async (_, builder) => {
  builder.data.css ||= new Set();

  const entry = opts.entry;

  const stream = await fs.promises.readFile(entry);
  let pipeline = postcss()
    .use(postcssImport())
    .use(postcssPresetEnv());

  if (!builder.dev) {
    pipeline = pipeline.use(cssnano());
  }

  const res = await pipeline
    .process(stream, { from: entry });

  const data = res.css;

  const filename = replaceFilename(opts.filename, { data });
  builder.data.css.add(`/${filename}`);

  return { filename, data };
};
