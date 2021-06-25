'use strict';

const { rollup } = require('rollup');
const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

const { dev } = require('../config');

module.exports = builder => builder.task([], "app", "index.js", matches => Promise.all(matches.map(async (m) => {
  if (!builder.data.javascript) {
    builder.data.javascript = {
      scripts: new Set(),
      modules: new Set(),
    }
  }

  const filenameScript = 'app.js';
  const filenameModule = filenameScript.replace(/\.js$/, ".mjs");

  const plugins = dev ? [] : [terser()];

  const inputOptions = {
    input: m.fullpath,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled'
      }),
      resolve(),
      commonjs(),
    ]
  };

  const outputOptions = {
    file: filenameScript,
    format: 'iife',
    plugins
  };

  const outputOptionsModule = {
    file: filenameModule,
    format: 'es',
    plugins
  };

  const bundle = await rollup(inputOptions);
  const outputScript = (await bundle.generate(outputOptions)).output[0];
  const outputModule = (await bundle.generate(outputOptionsModule)).output[0];

  builder.data.javascript.scripts.add(`/${filenameScript}`);
  builder.data.javascript.modules.add(`/${filenameModule}`);

  return [
    { filename: filenameScript, data: outputScript.code },
    { filename: filenameModule, data: outputModule.code },
  ]
})));
