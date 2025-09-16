import { Builder } from '../builder';
import { OutputFile, PageData } from '../types';
import { cloneDeep } from 'lodash';
import { renderHtml } from '../html';
import { PageIndex } from '../../components/PageIndex';

export async function buildBlogIndex(builder: Builder, pageData: PageData): Promise<OutputFile> {
  pageData = cloneDeep(pageData);
  const data = renderHtml(PageIndex, {}, pageData);
  return builder.emit({ name: 'index.html', content: data, mimeType: 'text/html' });
}
