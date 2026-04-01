import http from 'node:http';

import { Builder } from './gen/builder';
import { build } from './gen/build';
import { OutputFile } from './gen/types';

const PORT = 8080;

async function devServer() {
  /* Eagerly build all files */
  const files = new Map<string, OutputFile>();
  const builder = new Builder(f => { files.set(f.name, f); });
  await build(builder);

  /* Run the dev server */
  const server = http.createServer((req, res) => {
    const pathComponents = req.url?.split('/').filter(c => c.length > 0) || [];
    let paths: string[];
    if (pathComponents.length === 0) {
      paths = ['index.html'];
    } else {
      const basePath = pathComponents.join('/');
      paths = [basePath, basePath + '.html', basePath + '/index.html'];
    }
    for (const p of paths) {
      const f = files.get(p);
      if (f) {
        if (f.mimeType) {
          res.setHeader('Content-Type', f.mimeType);
        }
        res.end(f.content);
        return;
      }
    }
  });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dev server listening at http://localhost:${PORT}/`);
  });
}

devServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
