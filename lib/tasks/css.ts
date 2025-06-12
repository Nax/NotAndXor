import fs from 'fs';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

import { Builder } from '../builder';
import { replaceFilename } from '../util';

type CssOpts = {
  filename: string;
};

export type CssSet = {[k: string]: string};

export const cssTask = (builder: Builder, path: string, opts: CssOpts) => {
  const files = builder.files(path);
  return builder.task({ files }, ({ files }, next: (v: Promise<CssSet>) => void) => {
    if (!files) return;
    const promise = (async () => {
      const stream = await fs.promises.readFile(path);
      let pipeline = postcss()
        .use(postcssImport())
        .use(postcssPresetEnv());

      if (!builder.opts.dev) {
        pipeline = pipeline.use(cssnano());
      }
      const res = await pipeline
        .process(stream, { from: path });

      const data = res.css;
      const filename = replaceFilename(opts.filename, { data });

      await builder.emit({ filename, data });

      return {[path]: filename};
    })();
    next(promise);
  });
};
