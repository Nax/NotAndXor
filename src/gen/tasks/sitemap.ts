import { Article } from '../articles';
import { Builder } from '../builder';
import { CONFIG } from '../config';
import { OutputFile } from '../types';
import { JSDOM } from 'jsdom';
import strftime from 'strftime';

const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function dateW3C(date: Date): string {
  return strftime('%Y-%m-%d', date);
}

function addUrl(urlset: Element, loc: string, lastmod: Date, priority?: string) {
  const document = urlset.ownerDocument;
  const url = document.createElementNS(NS, 'url');
  const locEl = document.createElementNS(NS, 'loc');
  locEl.appendChild(document.createTextNode(loc));
  url.appendChild(locEl);
  const lastmodEl = document.createElementNS(NS, 'lastmod');
  lastmodEl.appendChild(document.createTextNode(dateW3C(lastmod)));
  url.appendChild(lastmodEl);
  if (priority) {
    const priorityEl = document.createElementNS(NS, 'priority');
    priorityEl.appendChild(document.createTextNode(priority));
    url.appendChild(priorityEl);
  }
  urlset.appendChild(url);
}

export async function buildSitemap(builder: Builder, articles: Article[]): Promise<OutputFile> {
  /* Use JSDom to create the XML */
  const { document } = (new JSDOM("<root/>", { contentType: "application/xml" })).window;
  const root = document.documentElement;

  const urlset = document.createElementNS(NS, 'urlset');
  root.appendChild(urlset);

  /* Index */
  addUrl(urlset, CONFIG.baseUrl, new Date(), '1.0');

  /* Articles */
  for (const article of articles) {
    addUrl(urlset, `${CONFIG.baseUrl}/${article.slug}`, article.updatedAt);
  }

  const xml = '<?xml version="1.0" encoding="UTF-8"?>' + root.innerHTML;

  return builder.emit({ name: 'sitemap.xml', content: xml, mimeType: 'application/xml' });
}
