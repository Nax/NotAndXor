import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Builder } from './gen/builder';
import { build } from './gen/build';
import { OutputFile } from './gen/types';

async function buildProduction() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(dirname, '../dist');
  if (await fs.stat(distPath).catch(() => false)) {
    await fs.rm(distPath, { recursive: true });
  }
  await fs.mkdir(distPath, { recursive: true });

  let promises: Promise<void>[] = [];

  const writeFile = async (f: OutputFile) => {
    const filePath = path.join(distPath, f.name);
    const fileDir = path.dirname(filePath);
    await fs.mkdir(fileDir, { recursive: true });
    return fs.writeFile(filePath, f.content);
  }

  const builder = new Builder(f => promises.push(writeFile(f)));
  await build(builder);
  await Promise.all(promises);
}

buildProduction().catch((err) => {
  console.error(err);
  process.exit(1);
});
