const { rollup } = require('rollup');
const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const { assetHash, emit } = require('./util');

module.exports = async (src, outDir, outName) => {
  const inputOptions = {
    input: src,
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
    file: outName,
    format: 'iife',
    plugins: [
      terser()
    ]
  };

  const outputOptionsModule = {
    file: outName,
    format: 'es',
    plugins: [
      terser()
    ]
  };

  const bundle = await rollup(inputOptions);
  const outputScripts = (await bundle.generate(outputOptions)).output;
  const outputModules = (await bundle.generate(outputOptionsModule)).output;

  const scripts = [];
  const modules = [];

  for (const c of outputScripts) {
    let outName = assetHash(c.fileName, c.code);
    outName = outName.replace(/\[ext\]/, 'js');
    scripts.push('/' + outName);
    await emit(`${outDir}/${outName}`, c.code);
  }

  for (const c of outputModules) {
    let outName = assetHash(c.fileName, c.code);
    outName = outName.replace(/\[ext\]/, 'mjs');
    modules.push('/' + outName);
    await emit(`${outDir}/${outName}`, c.code);
  }

  return { scripts, modules };
};
