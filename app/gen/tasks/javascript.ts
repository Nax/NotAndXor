import { rollup } from 'rollup';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

import { Builder } from '../builder';
import { replaceFilename } from '../../gen/util';

type JsOpts = {
  entry: string;
  filename: string;
};
export type JsSet = {[k: string]: string};

export const javascriptTask = (builder: Builder, dir: string, opts: JsOpts) => {
  const files = builder.files(dir, '**/*.ts');
  return builder.task({ files }, ({ files }, next: (v: Promise<JsSet>) => void) => {
    if (!files) return;
    const promise = (async () => {
      let filenameScript = opts.filename;
      let filenameModule = opts.filename;

      const plugins = builder.opts.dev ? [] : [terser()];

      const inputOptions = {
        input: [dir, opts.entry].join('/'),
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
      //const outputModule = (await bundle.generate(outputOptionsModule)).output[0];

      filenameScript = replaceFilename(filenameScript, { ext: 'js', data: outputScript.code });
      //filenameModule = replaceFilename(filenameModule, { ext: 'mjs', data: outputModule.code });

      await builder.emit({ filename: filenameScript, data: outputScript.code });
      //await builder.emit({ filename: filenameModule, data: outputModule.code });

      return {
        [opts.entry]: filenameScript,
        //[`${opts.entry} (.mjs)`]: filenameModule,
      };
    })();
    next(promise);
  });
};
