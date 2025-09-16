import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash';
import { renderHtml } from '../html';
import { PageIndex } from '../../components/PageIndex';
import { Article } from '../articles';
import { CONFIG } from '../config';

export async function buildBlogIndex(builder: Builder, articles: Article[], pageData: PageData): Promise<OutputFile> {
  pageData = cloneDeep(pageData);
  const canonicalUrl = CONFIG.baseUrl;
  pageData.canonicalUrl = canonicalUrl;
  pageData.meta.push({ property: 'og:title', content: CONFIG.siteName });
  pageData.meta.push({ property: 'og:type', content: 'website' });
  pageData.meta.push({ property: 'og:url', content: canonicalUrl });
  pageData.meta.push({ name: 'description', content: CONFIG.siteDescription });
  pageData.meta.push({ name: 'twitter:title', content: CONFIG.siteName });
  pageData.meta.push({ name: 'twitter:description', content: CONFIG.siteDescription });
  pageData.meta.push({ property: 'profile:first_name', content: 'Maxime' });
  pageData.meta.push({ property: 'profile:last_name', content: 'Bacoux' });
  pageData.meta.push({ property: 'profile:username', content: 'Nax' });
  pageData.meta.push({ property: 'profile:gender', content: 'male' });

  const data = renderHtml(PageIndex, { articles }, pageData);
  return builder.emit({ name: 'index.html', content: data, mimeType: 'text/html' });
}
