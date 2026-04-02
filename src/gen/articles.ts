import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { articleBody } from './articles/parser';
import { CONFIG } from './config';
import { Asset } from './types';
import { JSX } from 'preact/jsx-runtime';

export type Article = {
  dir: string;
  title: string;
  description: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  draft: boolean;
  body: (assets: Map<string, Asset>) => Promise<JSX.Element>;
};

async function makeArticle(dir: string): Promise<Article> {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const fullDir = path.resolve(dirname, '..', dir);
  const file = path.resolve(fullDir, 'article.mdx');
  const fileData = await fs.readFile(file, 'utf-8');
  const { data, content } = matter(fileData);

  const title = data.title;
  const description = data.description;
  const slug = data.slug;
  const createdAt = new Date(data.created_at);
  const updatedAt = data.updated_at ? new Date(data.updated_at) : createdAt;
  const tags = data.tags ?? [];
  const draft = data.draft ?? false;

  const body = (assets: Map<string, Asset>) => articleBody(content, assets);

  return { dir: fullDir, title, description, slug, createdAt, updatedAt, tags, draft, body };
}

export async function getArticles(): Promise<Article[]> {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const baseDir = path.resolve(dirname, '../articles');
  const files = await fs.readdir(baseDir);

  let articles = await Promise.all(files.map(f => makeArticle(path.join(baseDir, f))));
  if (!CONFIG.dev) {
    articles = articles.filter(a => !a.draft);
  }
  articles = articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return articles;
}
