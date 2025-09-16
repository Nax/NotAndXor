import fs from 'node:fs/promises';
import path from 'node:path';

import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash';
import { renderHtml } from '../html';
import { Article } from '../articles';
import { CONFIG } from '../config';
import { PageArticle } from '../../components/PageArticle';

async function buildArticleAssets(builder: Builder, article: Article): Promise<OutputFile[]> {
  const dir = article.dir;
  const files = await fs.readdir(dir);
  const assetsFiles = files.filter(f => /\.(png|jpg|mp4|webm)$/.test(f));

  return Promise.all(assetsFiles.map(async (f) => {
    const src = dir + '/' + f;
    const basename = path.basename(f).split('.')[0];
    const extname = path.extname(f);
    const dst = [article.slug, '/', basename, CONFIG.dev ? '' : '.[hash]', extname].join('');
    const content = await fs.readFile(src);

    return builder.emit({ source: f, name: dst, content });
  }));
}

export async function buildBlogArticle(builder: Builder, article: Article, pageData: PageData): Promise<OutputFile> {
  const assets = await buildArticleAssets(builder, article);
  const assetsMap = new Map(assets.map(a => [a.source!, '/' + a.name]));

  pageData = cloneDeep(pageData);
  pageData.canonicalUrl = CONFIG.baseUrl + '/' + article.slug;
  pageData.title = article.title + ' - ' + pageData.title;

  const html = await article.html(assetsMap);
  const data = renderHtml(PageArticle, { article, html }, pageData);
  return builder.emit({ name: `${article.slug}/index.html`, content: data, mimeType: 'text/html' });
}
