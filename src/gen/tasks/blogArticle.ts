import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash';
import { renderHtml } from '../html';
import { Article } from '../articles';
import { CONFIG } from '../config';
import { PageArticle } from '../../components/PageArticle';

export async function buildBlogArticle(builder: Builder, article: Article, pageData: PageData): Promise<OutputFile> {
  pageData = cloneDeep(pageData);
  pageData.canonicalUrl = CONFIG.baseUrl + '/' + article.slug;
  pageData.title = article.title + ' - ' + pageData.title;
  const data = renderHtml(PageArticle, { article }, pageData);
  return builder.emit({ name: `${article.slug}/index.html`, content: data, mimeType: 'text/html' });
}
