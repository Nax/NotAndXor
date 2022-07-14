import { rollup } from 'rollup';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import { TaskFunc } from '../task';
import { replaceFilename } from '../util';

type JsOpts = {
  entry: string;
  filename: string;
};
export default (opts: JsOpts): TaskFunc => async (_, builder) => {
  if (!builder.data.javascript) {
    builder.data.javascript = {
      scripts: [],
      modules: [],
    }
  }

  let filenameScript = opts.filename;
  let filenameModule = opts.filename;

  const plugins = builder.opts.dev ? [] : [terser()];

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
  } as const;

  const outputOptionsModule = {
    file: filenameModule,
    format: 'es',
    plugins
  } as const;

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
