import { Feed } from 'feed';

import { Article } from '../articles';
import { Builder } from '../builder';
import { CONFIG } from '../config';

export async function buildFeed(builder: Builder, articles: Article[]): Promise<void> {
  const recentArticles = articles.slice(0, 15);
  const feed = new Feed({
    title: 'Not And Xor',
    description: CONFIG.siteDescription,
    id: CONFIG.baseUrl,
    link: CONFIG.baseUrl,
    language: 'en-us',
    updated: recentArticles[0].createdAt,
  });

  for (const article of recentArticles) {
    const url = `${CONFIG.baseUrl}/${article.slug}`;
    feed.addItem({
      title: article.title,
      id: url,
      link: url,
      description: article.description,
      date: article.createdAt,
    });
  }

  await Promise.all([
    builder.emit({ name: 'rss.xml', content: feed.rss2(), mimeType: 'application/rss+xml' }),
    builder.emit({ name: 'atom.xml', content: feed.atom1(), mimeType: 'application/atom+xml' }),
    builder.emit({ name: 'feed.json', content: feed.json1(), mimeType: 'application/json' }),
  ]);
}
