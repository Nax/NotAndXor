import { SitemapStream, streamToPromise, SitemapItemLoose } from 'sitemap';
import { Readable } from 'stream';

import { Article } from '../articles';
import { Builder } from '../builder';
import { CONFIG } from '../config';

export async function buildSitemap(builder: Builder, articles: Article[]): Promise<void> {
  const stream = new SitemapStream({ hostname: CONFIG.baseUrl });
  const items: SitemapItemLoose[] = [];
  items.push({ url: '/', lastmodISO: (new Date()).toISOString(), priority: 1.0 });
  for (const article of articles) {
    items.push({ url: `/${article.slug}`, lastmodISO: article.updatedAt.toISOString() });
  }
  const data = await streamToPromise(Readable.from(items).pipe(stream)).then(d => d.toString());
  await builder.emit({ name: 'sitemap.xml', content: data, mimeType: 'application/xml' });
}
