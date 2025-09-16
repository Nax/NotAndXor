import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash';
import { renderHtml } from '../html';
import { PageIndex } from '../../components/PageIndex';
import { Article } from '../articles';
import { CONFIG } from '../config';

export async function buildBlogIndex(builder: Builder, articles: Article[], pageData: PageData): Promise<OutputFile> {
  pageData = cloneDeep(pageData);
  pageData.canonicalUrl = CONFIG.baseUrl;
  const data = renderHtml(PageIndex, { articles }, pageData);
  return builder.emit({ name: 'index.html', content: data, mimeType: 'text/html' });
}
