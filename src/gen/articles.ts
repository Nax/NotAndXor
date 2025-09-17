import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { articleHtml } from './parser';
import { CONFIG } from './config';

export type Article = {
  dir: string;
  title: string;
  description: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  draft: boolean;
  html: (assets: Map<string, string>) => Promise<string>;
};

async function makeArticle(dir: string): Promise<Article> {
  const fullDir = path.resolve(__dirname, '..', dir);
  const file = path.resolve(fullDir, 'article.md');
  const fileData = await fs.readFile(file, 'utf-8');
  const { data, content } = matter(fileData);

  const title = data.title;
  const description = data.description;
  const slug = data.slug;
  const createdAt = new Date(data.created_at);
  const updatedAt = data.updated_at ? new Date(data.updated_at) : createdAt;
  const tags = data.tags ?? [];
  const draft = data.draft ?? false;

  const html = (assets: Map<string, string>) => articleHtml(content, assets);

  return { dir: fullDir, title, description, slug, createdAt, updatedAt, tags, draft, html };
}

export async function getArticles(): Promise<Article[]> {
  const baseDir = path.resolve(__dirname, '../articles');
  const files = await fs.readdir(baseDir);

  let articles = await Promise.all(files.map(f => makeArticle(path.join(baseDir, f))));
  if (!CONFIG.dev) {
    articles = articles.filter(a => !a.draft);
  }
  articles = articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return articles;
}
