import { Builder } from '../builder';

type HeaderRule = {
  paths: string[];
  headers: Record<string, string | string[]>;
};

const HEADER_RULES: HeaderRule[] = [
  {
    paths: ['/favicon.ico', '/atom.xml', '/rss.xml', '/feed.json', '/sitemap.xml', '/humans.txt', '/robots.txt'],
    headers: {
      'Cache-Control': ['public', 'max-age=3600'],
    }
  },
  {
    paths: [
      '/*.css', '/*.js',
      '/*.png', '/*.svg', '/*.jpg', '/*.webp',
      '/*.mp4', '/*.webm',
      '/*.woff', '/*.woff2', '/*.ttf', '/*.otf',
    ],
    headers: {
      'Cache-Control': ['public', 'max-age=31536000', 'immutable'],
    }
  },
  {
    paths: [
      '/*.html',
    ],
    headers: {
      'Cache-Control': ['public', 'max-age=300'],
    }
  }
];

export async function buildMeta(builder: Builder): Promise<void> {
  const headersBuffer: string[] = [];

  for (const rule of HEADER_RULES) {
    const perHeaders: string[] = [];
    for (const key of Object.keys(rule.headers)) {
      const valueRaw = rule.headers[key];
      const value = Array.isArray(valueRaw) ? valueRaw : [valueRaw];
      for (const v of value) {
        perHeaders.push(`  ${key}: ${v}`);
      }
    }
    const headersText = perHeaders.join('\n');
    for (const path of rule.paths) {
      headersBuffer.push(`${path}\n${headersText}\n`);
    }
  }

  await builder.emit({ name: '_headers', content: headersBuffer.join('\n'), mimeType: 'text/plain' });
}
