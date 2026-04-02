import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import mime from 'mime';

import { cache } from '../util/cache';
import { Builder } from '../builder';
import { Asset, OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash-es';
import { renderHtml } from '../html';
import { Article } from '../articles';
import { CONFIG } from '../config';
import { PageArticle } from '../../components/PageArticle';

function articleAssetName(article: Article, name: string): string {
  const basename = path.basename(name).split('.')[0];
  const extname = path.extname(name);
  return [article.slug, '/', basename, CONFIG.dev ? '' : '.[hash]', extname].join('');
}

function emitAsset(builder: Builder, article: Article, name: string, content: Buffer): OutputFile {
  const dst = articleAssetName(article, name);
  const source = path.basename(name);
  return builder.emit({ source, name: dst, content, mimeType: mime.getType(name) ?? undefined });
}

async function convertWebp(key: string, content: Buffer): Promise<Buffer> {
  return cache(`webp:${key}`, () => sharp(content).webp({ quality: 80 }).toBuffer());
}

async function convertAvif(key: string, content: Buffer): Promise<Buffer> {
  return cache(`avif:${key}`, () => sharp(content).avif({ quality: 50 }).toBuffer());
}

async function imageAssets(builder: Builder, article: Article): Promise<Asset[]> {
  const files = await fs.readdir(article.dir);
  const images = files.filter(f => /\.(png|jpg)$/.test(f));

  const promises = images.map(async img => {
    const src = article.dir + '/' + img;
    let content: Buffer = await fs.readFile(src);
    let contentHash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
    let meta = await sharp(content).metadata();

    if (meta.width > 800) {
      /* We want to downsize larger images */
      content = await cache(`resize:${contentHash}:800`, () => sharp(content).resize({ width: 800 }).toBuffer());
      contentHash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
      meta = await sharp(content).metadata();
    }

    const results: Asset[] = [];
    const of = emitAsset(builder, article, src, content);
    results.push({ type: 'image', width: meta.width!, height: meta.height!, source: of.source!, path: of.name });

    const versions = await Promise.all([
      convertWebp(contentHash, content).then(x => ({ content: x, ext: '.webp' })),
      convertAvif(contentHash, content).then(x => ({ content: x, ext: '.avif' })),
    ]);

    for (const v of versions) {
      const name = img.replace(/\.[^.]+$/, v.ext);
      const of = emitAsset(builder, article, name, v.content);
      results.push({ type: 'image', width: meta.width!, height: meta.height!, source: of.source!, path: of.name });
    }

    return results;
  });

  return Promise.all(promises).then(x => x.flat());
}

async function videoAssets(builder: Builder, article: Article): Promise<Asset[]> {
  const files = await fs.readdir(article.dir);
  const videos = files.filter(f => /\.(mp4|webm)$/.test(f));

  return Promise.all(videos.map(async video => {
    const src = article.dir + '/' + video;
    const content = await fs.readFile(src);
    const of = emitAsset(builder, article, src, content);
    return { type: 'video', source: of.source!, path: of.name };
  }));
}

async function articleAssets(builder: Builder, article: Article): Promise<Asset[]> {
  const assets = await Promise.all([
    imageAssets(builder, article),
    videoAssets(builder, article),
  ]);

  return assets.flat();
}

export async function buildBlogArticle(builder: Builder, article: Article, pageData: PageData): Promise<OutputFile> {
  const assets = (await articleAssets(builder, article)).map(x => ({ ...x, path: '/' + x.path }));
  const assetsMap = new Map(assets.map(a => [a.source!, { ...a, path: '/' + a.path }]));
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

  const body = await article.body(assetsMap);
  const data = renderHtml(PageArticle, { article, assets, body }, pageData);
  return builder.emit({ name: `${article.slug}/index.html`, content: data, mimeType: 'text/html' });
}
