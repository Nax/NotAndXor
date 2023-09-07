import fs from 'fs';
import path from 'path';
import { mkdirp } from 'mkdirp';
import bytes from 'bytes';
import c from 'ansi-colors';
import crypto from 'crypto';

import { SourceFile, OutputFile } from './file';

export const emitFile = async (destDir: string, f: OutputFile) => {
  const { filename, data } = f;
  const p = path.join(destDir, filename);

  /* Make the directory */
  const { dir } = path.parse(p);
  await mkdirp(dir);

  /* Write the actual file */
  await fs.promises.writeFile(p, data);

  /* Log */
  console.log(c.bold.green(filename.padEnd(70)) + c.yellow.bold(`${bytes(data.length).padStart(7)}`));
};

export const replaceFilename = (pattern: string, args: { file?: SourceFile, ext?: string, name?: string, path?: string, data?: string | Buffer }) => {
  if (args.file) {
    args.ext ||= path.extname(args.file.path).substring(1);
    args.name ||= path.basename(args.file.path).split('.')[0];
    args.path ||= path.dirname(args.file.path);
  }

  return pattern
    .replace(/\[ext\]/, args.ext || '')
    .replace(/\[name\]/, args.name || '')
    .replace(/\[path\]/, args.path || '')
    .replace(/\[hash\]/, () => {
      const cipher = crypto.createHash('md5');
      cipher.update(args.data || Buffer.from([]));
      return cipher.digest('hex');
    });
}
