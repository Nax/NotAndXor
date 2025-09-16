import { Builder } from './builder';
import { buildBlogIndex } from './tasks/blogIndex';
import { buildCss } from './tasks/css';
import { CONFIG } from './config';
import { PageData } from './types';

export async function build(builder: Builder) {
  const css = await buildCss(builder);
  const pageData: PageData = { title: CONFIG.siteName, css: css.name };
  await buildBlogIndex(builder, pageData);
}
