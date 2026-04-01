import path from 'node:path';
import { fileURLToPath } from 'node:url';
import favicons from 'favicons';

import { Builder } from '../builder';

export async function buildFavicons(builder: Builder): Promise<string[]> {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = path.resolve(dirname, '../../favicon.png');
  const data = await favicons(src, {
    icons: {
      favicons: true,
      android: false,
      appleIcon: false,
      appleStartup: false,
      windows: false,
      yandex: false,
    }
  });

  for (const image of data.images) {
    builder.emit({ name: image.name, content: image.contents });
  }

  return data.html;
}
