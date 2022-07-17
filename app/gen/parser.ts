import { JSDOM } from 'jsdom';
import matter from 'gray-matter';
import { marked } from 'marked';

export type Post = {
  title: string;
  slug: string;
  date: Date;
  tags: string[];
  html: string;
  htmlPreview: string;
};

const findParentParagraph = (node: Element): Element | null => {
  if (node.tagName === 'p' || node.tagName === 'P')
    return node;
  const parent = node.parentElement;
  if (!parent) return null;
  return findParentParagraph(parent);
}

const transformSmallCaps = (document: Document) => {
  const sc = document.getElementsByTagName('sc');
  for (let i = 0; i < sc.length; ++i) {
    const e = sc.item(i)!;
    const n = document.createElement('span');
    n.classList.add('small-caps');
    n.innerHTML = e.innerHTML;
    const parent = e.parentElement;
    if (parent) {
      parent.replaceChild(n, e);
    }
  }
};

const transformNotes = (document: Document, preview: boolean) => {
  const notes = document.getElementsByTagName('note');

  if (preview) {
    for (let i = 0; i < notes.length; ++i) {
      const n = notes.item(i)!;
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
      const parentP = findParentParagraph(note);
      if (parentP) {
        parentP.prepend(aside);
      }
      const parent = note.parentElement;
      if (parent) {
        parent.replaceChild(ref, note);
      }
    }
  }
};

const transform = (data: string, preview: boolean) => {
  const { document } = (new JSDOM(data)).window;

  transformSmallCaps(document);
  transformNotes(document, preview);

  return document.body.innerHTML;
};

export const parsePost = async (post: string | Buffer): Promise<Post> => {
  const meta = matter(post);
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

