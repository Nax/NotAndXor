import fs from 'fs';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

import { Builder } from '../builder';
import { replaceFilename } from '../util';

type CssOpts = {
  entry: string;
  filename: string;
};

export type CssSet = {[k: string]: string};

export const cssTask = (builder: Builder, dir: string, opts: CssOpts) => {
  const files = builder.files(dir, '**/*.css');
  return builder.task({ files }, ({ files }, next: (v: Promise<CssSet>) => void) => {
    if (!files) return;
    const promise = (async () => {
      const src = [dir, opts.entry].join('/');
      const stream = await fs.promises.readFile(src);
      let pipeline = postcss()
        .use(postcssImport())
        .use(postcssPresetEnv());

      if (!builder.opts.dev) {
        pipeline = pipeline.use(cssnano());
      }
      const res = await pipeline
        .process(stream, { from: src });

      const data = res.css;
      const filename = replaceFilename(opts.filename, { data });

      await builder.emit({ filename, data });

      return {[src]: filename};
    })();
    next(promise);
  });
};
