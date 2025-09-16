import path from 'node:path';
import { watchFile } from 'node:fs';

import { Builder } from './builder';
import { buildBlogIndex } from './tasks/blogIndex';
import { buildBlogArticle } from './tasks/blogArticle';
import { buildCss } from './tasks/css';
import { CONFIG } from './config';
import { PageData } from './types';
import { getArticles } from './articles';
import { buildRss } from './tasks/rss';

function watch(name: string, callback: () => void) {
  const file = path.resolve(__dirname, '..', name);
  watchFile(file, { persistent: true, interval: 500 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      callback();
    }
  });
}

export async function build(builder: Builder) {
  const [articles, css] = await Promise.all([
    getArticles(),
    buildCss(builder),
  ]);

  const promises: Promise<unknown>[] = [];
  const pageData: PageData = { title: CONFIG.siteName, css: css.name };

  promises.push(buildBlogIndex(builder, articles, pageData));
  for (const a of articles) {
    promises.push(buildBlogArticle(builder, a, pageData));
  }
  promises.push(buildRss(builder, articles));

  await Promise.all(promises);

  if (CONFIG.dev) {
    watch('index.css', () => { buildCss(builder); });
    for (const a of articles) {
      watch(a.dir + '/article.md', () => { buildBlogArticle(builder, a, pageData); });
    }
  }
}

