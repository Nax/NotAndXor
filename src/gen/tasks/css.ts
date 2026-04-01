import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import browserslist from 'browserslist';
import { bundle, browserslistToTargets } from 'lightningcss';

import { CONFIG } from '../config';
import { Builder } from '../builder';

const targets = browserslistToTargets(browserslist());

const depsMap = new Map<string, string>();
const preloadedFonts = new Set<string>();

const MIME_TYPES: Record<string, string> = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

async function bundleCss(builder: Builder, src: string) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(dirname, '../..');
  const inputFile = path.resolve(path.join(rootDir, src));
  console.log(inputFile);

  const { dependencies, code } = await bundle({
    projectRoot: rootDir,
    filename: inputFile,
    targets,
    minify: !CONFIG.dev,
    analyzeDependencies: true,
  });

  const urlDependencies = Object.fromEntries((dependencies || []).filter(d => d.type === 'url').map(d => [d.placeholder, path.resolve(rootDir, path.join(path.dirname(d.loc.filePath), d.url))]));
  const newDeps = Object.keys(urlDependencies).filter(k => !depsMap.has(k));

  /* Actually emit the fonts */
  await Promise.all(newDeps.map(async key => {
    const filePath = urlDependencies[key];
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    const outputFilePath = ['fonts/', CONFIG.dev ? path.basename(filePath) : '[hash]' + ext].join('');
    const outputFile = builder.emit({ name: outputFilePath, content, mimeType });
    depsMap.set(key, outputFile.name);
  }));

  /* Replace the placeholders */
  let codeText = code.toString();
  for (const [placeholder, outputPath] of depsMap.entries()) {
    codeText = codeText.replaceAll(placeholder, '/' + outputPath);
  }

  return codeText;
}

export async function buildCss(builder: Builder) {
  const [css, inline] = await Promise.all([
    bundleCss(builder, 'index.css'),
    bundleCss(builder, 'index.inline.css'),
  ]);

  const cssOut = builder.emit({ name: CONFIG.dev ? 'app.css' : 'app.[hash].min.css', content: css, mimeType: 'text/css' });

  return { css: cssOut.name, inline };
}
