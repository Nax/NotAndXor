import fs from 'fs';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

import { TaskFunc } from '../task';
import { replaceFilename } from '../util';

type CssOpts = {
  entry: string;
  filename: string;
};

export default (opts: CssOpts): TaskFunc => async (_, builder) => {
  builder.data.css ||= new Set();

  const entry = opts.entry;

  const stream = await fs.promises.readFile(entry);
  let pipeline = postcss()
    .use(postcssImport())
    .use(postcssPresetEnv());

  if (!builder.opts.dev) {
    pipeline = pipeline.use(cssnano());
  }

  const res = await pipeline
    .process(stream, { from: entry });

  const data = res.css;

  const filename = replaceFilename(opts.filename, { data });
  builder.data.css.add(`/${filename}`);

  return { filename, data };
};
