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

const transformAssets = (document: Document, assets: Map<string, string>) => {
  const imgs = document.getElementsByTagName('img');
  for (let i = 0; i < imgs.length; ++i) {
    const img = imgs.item(i)!;
    const src = img.attributes.getNamedItem('src')?.value;
    if (src && assets.has(src)) {
      img.src = assets.get(src)!;
    }
  }

  const sources = document.getElementsByTagName('source');
  for (let i = 0; i < sources.length; ++i) {
    const source = sources.item(i)!;
    const src = source.attributes.getNamedItem('src')?.value;
    if (src && assets.has(src)) {
      source.src = assets.get(src)!;
    }
  }
};

export async function articleHtml(content: string, assets: Map<string, string>): Promise<string> {
  const parsed = await marked(content);
  const { document } = (new JSDOM(parsed)).window;

  transformSmallCaps(document);
  transformCode(document);
  transformNotes(document);
  transformAssets(document, assets);

  return document.body.innerHTML;
};
