import { fileURLToPath } from 'node:url';
import path from 'node:path';
import browserslist from 'browserslist';
import { bundle, browserslistToTargets } from 'lightningcss';

import { CONFIG } from '../config';
import { Builder } from '../builder';
import { OutputFile } from '../types';

const targets = browserslistToTargets(browserslist());

export async function buildCss(builder: Builder): Promise<OutputFile> {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(dirname, '../../..');
  const inputFile = path.resolve(path.join(dirname, '../../index.css'));

  const { code } = await bundle({
    projectRoot: rootDir,
    filename: inputFile,
    targets,
    minify: !CONFIG.dev,
  });

  return builder.emit({ name: CONFIG.dev ? 'app.css' : 'app.[hash].min.css', content: code, mimeType: 'text/css' });
}
