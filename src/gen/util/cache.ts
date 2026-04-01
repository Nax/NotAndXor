import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

export async function cache(key: string, fn: () => Buffer | Promise<Buffer>): Promise<Buffer> {
  const cacheKey = crypto.createHash('sha256').update(key).digest('hex');
  const cacheFile = '.cache/' + cacheKey.slice(0, 2) + '/' + cacheKey.slice(2, 4) + '/' + cacheKey.slice(4);
  const cacheDir = path.dirname(cacheFile);

  await fs.mkdir(cacheDir, { recursive: true });

  try {
    const cached = await fs.readFile(cacheFile);
    return cached;
  } catch (e) {
    const result = await fn();
    await fs.writeFile(cacheFile, result);
    return result;
  }
}
