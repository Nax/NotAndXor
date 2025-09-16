import path from 'node:path';
import fs from 'node:fs/promises';

import { OutputFile } from '../types';
import { Builder } from '../builder';

export async function buildStatic(builder: Builder): Promise<OutputFile[]> {
  const dir = path.resolve(__dirname, '../../static');
  const files = await fs.readdir(dir);

  return Promise.all(files.map(async f => {
    const filePath = path.join(dir, f);
    const data = await fs.readFile(filePath);
    return builder.emit({ name: f, content: data });
  }));
}
