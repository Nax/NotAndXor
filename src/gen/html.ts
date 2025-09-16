import { h, ComponentType } from 'preact';
import { PageData } from './types';
import { Layout } from '../components/Layout';
import { renderToStaticMarkup } from 'preact-render-to-string';

export function renderHtml<T>(component: ComponentType<T>, componentProps: T, pageData: PageData): string {
  const tree = h(Layout, { data: pageData }, h(component, componentProps!, null));
  return '<!doctype html>' + renderToStaticMarkup(tree);
}
