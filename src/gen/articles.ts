import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';

export type Article = {
  title: string;
  description: string;
  slug: string;
  date: Date;
  tags: string[];
};

async function makeArticle(dir: string): Promise<Article> {
  const file = path.resolve(__dirname, '..', dir, 'article.md');
  const fileData = await fs.readFile(file, 'utf-8');
  const { data } = matter(fileData);

  const title = data.title;
  const description = data.description;
  const slug = data.slug;
  const date = new Date(data.date);
  const tags = data.tags ?? [];

  return { title, description, slug, date, tags };
}

export async function getArticles(): Promise<Article[]> {
  const baseDir = path.resolve(__dirname, '../articles');
  const files = await fs.readdir(baseDir);
  const articles = await Promise.all(files.map(f => makeArticle(path.join(baseDir, f))));
  const articlesSorted = articles.sort((a, b) => b.date.getTime() - a.date.getTime());
  return articlesSorted;
}
