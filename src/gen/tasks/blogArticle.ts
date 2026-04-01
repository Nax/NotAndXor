import fs from 'node:fs/promises';
import path from 'node:path';

import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash-es';
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
  const canonicalUrl = CONFIG.baseUrl + '/' + article.slug;

  pageData = cloneDeep(pageData);
  pageData.canonicalUrl = canonicalUrl;
  pageData.title = article.title + ' - ' + pageData.title;
  pageData.meta.push({ property: 'og:title', content: article.title });
  pageData.meta.push({ property: 'og:type', content: 'article' });
  pageData.meta.push({ property: 'og:url', content: canonicalUrl });
  pageData.meta.push({ name: 'description', content: article.description });
  pageData.meta.push({ property: 'article:published_time', content: article.createdAt.toISOString() });
  pageData.meta.push({ property: 'article:section', content: 'Technology' });
  pageData.meta.push({ property: 'article:author', content: CONFIG.baseUrl });
  pageData.meta.push({ property: 'article:publisher', content: CONFIG.baseUrl });

  pageData.meta.push({ name: 'twitter:title', content: article.title });
  pageData.meta.push({ name: 'twitter:description', content: article.description });

  pageData.ld.push({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "author": CONFIG.ldAuthor,
    "datePublished": article.createdAt.toISOString(),
    "dateCreated": article.createdAt.toISOString(),
    "url": canonicalUrl,
    "inLanguage": "en-US",
  });

  const html = await article.html(assetsMap);
  const data = renderHtml(PageArticle, { article, html }, pageData);
  return builder.emit({ name: `${article.slug}/index.html`, content: data, mimeType: 'text/html' });
}
