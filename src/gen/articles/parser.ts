import type { Plugin } from 'unified';
import type { Root } from 'hast';

import type { Asset } from '../types';

import { VFile } from 'vfile';
import { evaluate as mdxEval } from '@mdx-js/mdx';
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime';
import remarkMath from 'remark-math';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMathJaxSvg from 'rehype-mathjax/svg';
import { visitParents } from 'unist-util-visit-parents';

import { Image } from './Image';
import { SmallCaps } from './SmallCaps';
import { Video } from './Video';
import { Note } from './Note';

const rehypeNotes: Plugin<[], Root> = () => (tree) => {
  let nextNoteId = 1;

  visitParents(tree, ['mdxJsxTextElement', 'mdxJsxFlowElement'], (node, ancestors) => {
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;
    if (node.name !== 'Note') return;

    const id = nextNoteId++;

    const paraIndex = ancestors.findLastIndex(a => (a.type === 'element' && a.tagName === 'p'));
    if (paraIndex === -1) return;
    const para = ancestors[paraIndex] as any as Element;
    const paraParent = ancestors[paraIndex - 1];
    if (!paraParent) return;
    const paraIndexInParent = (paraParent.children).indexOf(para as any);
    if (paraIndexInParent === -1) return;

    const children = node.children;

    node.name = 'Note.Ref';
    node.children = [];
    node.attributes = [{type: 'mdxJsxAttribute', name: 'noteId', value: id.toString()}];

    const content = {
      type: 'mdxJsxFlowElement',
      name: 'Note.Content',
      children,
      attributes: [{type: 'mdxJsxAttribute', name: 'noteId', value: id.toString()}]
    };

    paraParent.children.splice(paraIndexInParent, 0, content as any);
  });
};

export async function articleBody(content: string) {
  const data = await mdxEval(content, {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypePrettyCode, { defaultLang: 'plaintext', theme: 'dark-plus' }], rehypeMathJaxSvg, rehypeNotes],
    Fragment,
    jsx,
    jsxs,
  });

  const c = () => data.default({
    components: {
      SmallCaps,
      Image,
      Video,
      Note,
    }
  });

  return c();
};
