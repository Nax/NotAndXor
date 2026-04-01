import type { Root, Element } from 'hast';
import type { Plugin } from 'unified';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMathjax from 'rehype-mathjax/svg';
import { visit, SKIP } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';
import { Asset } from './types';

const rehypeSmallCaps: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'sc') {
      node.tagName = 'span';
      node.properties = { ...node.properties, className: ['small-caps'] };
    }
  });
};

const rehypeImages: Plugin<[], Root> = () => (tree, file) => {
  const assets = file.data.assets as Map<string, Asset>;
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'img') {
      const properties = node.properties || {};
      const src = properties.src as string;
      const asset = assets.get(src)!;
      if (asset.type !== 'image') return;
      properties.src = asset.path;
      properties.width = asset.width!;
      properties.height = asset.height!;
      node.tagName = 'picture';
      node.properties = {};
      const children: Element[] = [];
      const srcWebp = assets.get(src.replace(/\.[^.]+$/, '.webp'));
      const srcAvif = assets.get(src.replace(/\.[^.]+$/, '.avif'));
      if (srcAvif) {
        children.push({
          type: 'element',
          tagName: 'source',
          properties: { srcSet: srcAvif.path, type: 'image/avif' },
          children: [],
        });
      }
      if (srcWebp) {
        children.push({
          type: 'element',
          tagName: 'source',
          properties: { srcSet: srcWebp.path, type: 'image/webp' },
          children: [],
        });
      }
      children.push({
        type: 'element',
        tagName: 'img',
        properties,
        children: [],
      });
      node.children = children;
      return SKIP;
    }
  });
};

const rehypeVideos: Plugin<[], Root> = () => (tree, file) => {
  const assets = file.data.assets as Map<string, Asset>;
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'video') {
      const source = node.children.find(c => c.type === 'element' && (c as Element).tagName === 'source') as Element | undefined;
      if (!source) return;
      const src = source.properties?.src;
      if (typeof src === 'string') {
        const asset = assets.get(src)!;
        if (asset.type !== 'video') return;
        source.properties.src = asset.path;
      }
    }
  });
};

const rehypeNotes: Plugin<[], Root> = () => (tree) => {
  let nextNoteId = 1;

  visitParents(tree, 'element', (node: Element, ancestors) => {
    if (node.tagName !== 'note') return;

    const noteId = nextNoteId++;

    const aside: Element = {
      type: 'element',
      tagName: 'aside',
      properties: { id: `note-${noteId}`, className: ['note'] },
      children: [
        { type: 'text', value: `${noteId}. ` },
        ...node.children,
      ],
    };

    const a: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: `#note-${noteId}`, className: ['note-ref'] },
      children: [{ type: 'text', value: String(noteId) }],
    };

    node.tagName = 'sup';
    node.children = [
      { type: 'text', value: '[' },
      a,
      { type: 'text', value: ']' },
    ];

    const paraIndex = ancestors.findLastIndex(a => (a as Element).tagName === 'p');
    if (paraIndex === -1) return;
    const para = ancestors[paraIndex] as Element;
    const paraParent = ancestors[paraIndex - 1];
    if (!paraParent) return;
    const paraIndexInParent = (paraParent.children).indexOf(para);
    if (paraIndexInParent === -1) return;
    paraParent.children.splice(paraIndexInParent, 0, aside);
  });
};

const pipeline = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypePrettyCode, { defaultLang: 'plaintext', theme: 'dark-plus' })
  .use(rehypeMathjax)
  .use(rehypeSmallCaps)
  .use(rehypeImages)
  .use(rehypeVideos)
  .use(rehypeNotes)
  .use(rehypeStringify);

export async function articleHtml(content: string, assets: Map<string, Asset>): Promise<string> {
  const data = await pipeline.process({ value: content, data: { assets } });
  const html = String(data);
  return html;
};
