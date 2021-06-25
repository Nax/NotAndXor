'use strict';

const fs = require('fs');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

module.exports = builder => builder.task([], "app", "**/*.css", async (_) => {
  builder.data.css ||= new Set();

  const stream = await fs.promises.readFile("app/index.css");
  const data = await postcss()
    .use(postcssImport())
    .use(postcssPresetEnv())
    .use(cssnano())
    .process(stream, { from: "app/index.css" });

  const filename = "app.css";
  builder.data.css.add(`/${filename}`);

  return { filename, data: data.css };
});
