import path from 'path';
import fs from 'fs/promises';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

import { CONFIG } from '../config';
import { Builder } from '../builder';
import { OutputFile } from '../types';

export async function buildCss(builder: Builder): Promise<OutputFile> {
  const inputFile = path.join(__dirname, '../../index.css');
  const data = await fs.readFile(inputFile, 'utf-8');

  const output = await postcss([
    postcssImport(),
    postcssPresetEnv(),
    CONFIG.dev ? null : cssnano(),
  ].filter(x => !!x)).process(data, { from: inputFile });

  return builder.emit({ name: CONFIG.dev ? 'app.css' : 'app.[hash].min.css', content: output.css, mimeType: 'text/css' });
}
