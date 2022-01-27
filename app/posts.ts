import { JSDOM } from 'jsdom';
import matter from 'gray-matter';
import { marked } from 'marked';

const findParentParagraph = (node: Element): Element | null => {
  if (node.tagName === 'p' || node.tagName === 'P')
    return node;
  const parent = node.parentElement;
  if (!parent)
    return null;
  return findParentParagraph(parent);
};

const transformSmallCaps = (document: Document) => {
  for (const e of document.getElementsByTagName('sc')) {
    const n = document.createElement('span');
    n.classList.add('small-caps');
    n.innerHTML = e.innerHTML;
    const parent = e.parentElement;
    if (parent)
      parent.replaceChild(n, e);
  }
};

const transformNotes = (document: Document, preview: boolean) => {
  const notes = document.getElementsByTagName('note');

  if (preview) {
    for (const n of notes) {
      n.remove();
    }
  } else {
    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const num = i + 1;
      const name = note.attributes.getNamedItem('name')?.value || num.toString();
      const link = document.createElement('a');
      link.href = `#${name}`;
      link.text = name;
      link.setAttribute('data-turbolinks', 'false');
      const ref = document.createElement('sup');
      ref.append(document.createTextNode('['));
      ref.append(link);
      ref.append(document.createTextNode(']'));
      ref.classList.add('note-ref');
      const aside = document.createElement('aside');
      aside.innerHTML = note.innerHTML;
      aside.prepend(document.createTextNode(`${num}. `));
      aside.setAttribute('id', name);
      findParentParagraph(note)?.prepend(aside);
      note.parentElement?.replaceChild(ref, note);
    }
  }
};

const transform = (data: string, preview: boolean) => {
  const { document } = (new JSDOM(data)).window;

  transformSmallCaps(document);
  transformNotes(document, preview);

  return document.body.innerHTML;
};

export interface Post {
  title: string;
  slug: string;
  date: Date;
  tags: string[];
  html: string;
  htmlPreview: string;
};

const makePost = (rawPost: string): Post => {
  const meta = matter(rawPost);
  const data = marked(meta.content);
  const html = transform(data, false);
  const htmlPreview = transform(data, true);

  const { title, slug, date, tags } = meta.data;

  return {
    title,
    slug,
    date,
    tags,
    html,
    htmlPreview,
  };
};

const ctx = require.context("./posts", true, /\.md$/);
export const posts = ctx.keys().map(x => makePost(ctx(x)));
