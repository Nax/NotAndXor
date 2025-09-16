import { Article } from '../articles';
import { Builder } from '../builder';
import { CONFIG } from '../config';
import { OutputFile } from '../types';
import { JSDOM } from 'jsdom';
import strftime from 'strftime';

function dateRfc822(date: Date): string {
  return strftime('%a, %d %b %Y %H:%M:%S %z', date);
}

export async function buildRss(builder: Builder, articles: Article[]): Promise<OutputFile> {
  const recentArticles = articles.slice(0, 15);

  /* Use JSDom to create the XML */
  const { document } = (new JSDOM("<root/>", { contentType: "application/xml" })).window;
  const root = document.documentElement;
  const rss = document.createElement('rss');
  const channel = document.createElement('channel');
  rss.setAttribute('version', '2.0');
  rss.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:atom', 'http://www.w3.org/2005/Atom');
  rss.appendChild(channel);

  const title = document.createElement('title');
  title.appendChild(document.createTextNode('Not And Xor'));
  channel.appendChild(title);

  const description = document.createElement('description');
  description.appendChild(document.createTextNode(CONFIG.siteDescription));
  channel.appendChild(description);

  const link = document.createElement('link');
  link.appendChild(document.createTextNode(CONFIG.baseUrl));
  channel.appendChild(link);

  const atomLink = document.createElementNS('http://www.w3.org/2005/Atom', 'link');
  atomLink.setAttribute('href', `${CONFIG.baseUrl}/rss.xml`);
  atomLink.setAttribute('rel', 'self');
  atomLink.setAttribute('type', 'application/rss+xml');
  channel.appendChild(atomLink);

  const language = document.createElement('language');
  language.appendChild(document.createTextNode('en-us'));
  channel.appendChild(language);

  const lastBuildDate = document.createElement('lastBuildDate');
  lastBuildDate.appendChild(document.createTextNode(dateRfc822(recentArticles[0].date)));
  channel.appendChild(lastBuildDate);

  for (const article of recentArticles) {
    const item = document.createElement('item');

    const itemTitle = document.createElement('title');
    itemTitle.appendChild(document.createTextNode(article.title));
    item.appendChild(itemTitle);

    const itemLink = document.createElement('link');
    itemLink.appendChild(document.createTextNode(`${CONFIG.baseUrl}/${article.slug}`));
    item.appendChild(itemLink);

    const guid = document.createElement('guid');
    guid.setAttribute('isPermaLink', 'true');
    guid.appendChild(document.createTextNode(`${CONFIG.baseUrl}/${article.slug}`));
    item.appendChild(guid);

    const pubDate = document.createElement('pubDate');
    pubDate.appendChild(document.createTextNode(dateRfc822(article.date)));
    item.appendChild(pubDate);

    const itemDescription = document.createElement('description');
    itemDescription.appendChild(document.createTextNode(article.description));
    item.appendChild(itemDescription);

    channel.appendChild(item);
  }
  root.appendChild(rss);

  const xml = '<?xml version="1.0" encoding="UTF-8"?>' + root.innerHTML;
  return builder.emit({ name: 'rss.xml', content: xml, mimeType: 'application/rss+xml' });
}
