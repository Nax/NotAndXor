import path from 'node:path';
import { watchFile } from 'node:fs';

import { Builder } from './builder';
import { buildBlogIndex } from './tasks/blogIndex';
import { buildBlogArticle } from './tasks/blogArticle';
import { buildCss } from './tasks/css';
import { CONFIG } from './config';
import { PageData } from './types';
import { getArticles } from './articles';
import { buildFeed } from './tasks/feed';
import { buildStatic } from './tasks/static';
import { buildFavicons } from './tasks/favicons';
import { buildSitemap } from './tasks/sitemap';

function watch(name: string, callback: () => void) {
  const file = path.resolve(__dirname, '..', name);
  watchFile(file, { persistent: true, interval: 500 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      callback();
    }
  });
}

export async function build(builder: Builder, watchCallback?: () => void) {
  if (!watchCallback) {
    watchCallback = () => {};
  }

  const [articles, css, favicons] = await Promise.all([
    getArticles(),
    buildCss(builder),
    buildFavicons(builder),
  ]);

  const promises: Promise<unknown>[] = [];
  const pageData: PageData = { favicons, title: CONFIG.siteName, css: css.name, meta: [], ld: [] };

  promises.push(buildBlogIndex(builder, articles, pageData));
  for (const a of articles) {
    promises.push(buildBlogArticle(builder, a, pageData));
  }
  promises.push(buildStatic(builder));
  promises.push(buildFeed(builder, articles));
  promises.push(buildSitemap(builder, articles));

  await Promise.all(promises);

  if (CONFIG.dev) {
    watch('index.css', () => { buildCss(builder).then(watchCallback); });
    for (const a of articles) {
      watch(a.dir + '/article.md', async () => {
        const newArticles = await getArticles();
        articles.splice(0, articles.length, ...newArticles);
        const newA = newArticles.find(x => x.dir === a.dir);
        if (newA) {
          buildBlogArticle(builder, newA, pageData).then(watchCallback);
        }
      });
    }
  }
}

