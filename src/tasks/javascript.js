'use strict';

const { rollup } = require('rollup');
const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

const { replaceFilename } = require('../util');

module.exports = opts => async (_, builder) => {
  if (!builder.data.javascript) {
    builder.data.javascript = {
      scripts: [],
      modules: [],
    }
  }

  let filenameScript = opts.filename;
  let filenameModule = opts.filename;

  const plugins = builder.dev ? [] : [terser()];

  const inputOptions = {
    input: opts.entry,
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

  filenameScript = replaceFilename(filenameScript, { ext: 'js', data: outputScript.code });
  filenameModule = replaceFilename(filenameModule, { ext: 'mjs', data: outputModule.code });

  builder.data.javascript.scripts = [`/${filenameScript}`];
  builder.data.javascript.modules = [`/${filenameModule}`];

  return [
    { filename: filenameScript, data: outputScript.code },
    { filename: filenameModule, data: outputModule.code },
  ]
};
