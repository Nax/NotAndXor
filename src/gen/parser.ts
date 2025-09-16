import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';

marked.use(markedKatex({}));

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

function transformCode(document: Document) {
  const codeBlocks = Array.from(document.getElementsByTagName('code')).filter(x => x.parentElement?.tagName === 'PRE');
  for (const el of codeBlocks) {
    hljs.highlightElement(el);
  }
}

const transformNotes = (document: Document) => {
  const notes = Array.from(document.getElementsByTagName('note'));

  for (let i = 0; i < notes.length; ++i) {
    const note = notes[i];
    const num = i + 1;
    const name = note.attributes.getNamedItem('name')?.value || num.toString();
    const link = document.createElement('a');
    link.href = `#${name}`;
    link.text = name;
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
      parentP.before(aside);
    }
    const parent = note.parentElement;
    if (parent) {
      parent.replaceChild(ref, note);
    }
  }
};

export async function articleHtml(content: string): Promise<string> {
  const parsed = await marked(content);
  const { document } = (new JSDOM(parsed)).window;

  transformSmallCaps(document);
  transformCode(document);
  transformNotes(document);

  return document.body.innerHTML;
};
