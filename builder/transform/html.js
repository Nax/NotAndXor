const { JSDOM } = require('jsdom');
const hljs = require('highlight.js');
const stripIndent = require('strip-indent');

const prepend = (parent, child) => {
  parent.insertBefore(child, parent.childNodes[0]);
}

const simple = (target) => (document, node, parent, ctx) => {
  const el = document.createElement(target);
  parent.appendChild(el);
  transformChildren(document, node, el, ctx);
};

const simpleClass = (klass) => (document, node, parent, ctx) => {
  const el = document.createElement('span');
  el.classList.add(klass);
  parent.appendChild(el);
  transformChildren(document, node, el, ctx);
};

const htmlTransform = {
  _: (document, node, parent) => {
    parent.appendChild(document.createTextNode(node.textContent || ''));
  },
  header: simple('div'),
  br: simple('br'),
  p: (document, node, parent, ctx) => {
    const paragraph = document.createElement('p');
    parent.appendChild(paragraph);
    transformChildren(document, node, paragraph, ctx);
    for (const note of ctx.notes) {
      paragraph.parentNode.insertBefore(note, paragraph);
    }
    ctx.notes = [];
  },
  sc: simpleClass('small-caps'),
  note: (document, node, parent, ctx) => {
    if (ctx.preview) return;

    const noteNum = ++ctx.noteCount;
    const ref = document.createElement('sup');
    const link = document.createElement('a');
    const note = document.createElement('aside');
    transformChildren(document, node, note, ctx);
    prepend(note, document.createTextNode(`${noteNum}. `));

    ref.appendChild(document.createTextNode('['));
    ref.appendChild(link);
    ref.appendChild(document.createTextNode(']'));
    ref.classList.add('note-ref');

    link.setAttribute('href', `#${noteNum}`);
    link.appendChild(document.createTextNode(String(noteNum)));

    note.setAttribute('id', String(noteNum));

    ctx.notes.push(note);
    parent.appendChild(ref);
  },
  code: (document, node, parent) => {
    const lang = node.getAttribute('lang');
    const pre = document.createElement('pre');
    const code = document.createElement('code');

    let text = stripIndent(node.textContent || '');

    if (text[0] === '\n') {
      text = text.substr(1);
    }

    code.innerHTML = hljs.highlight(lang || '', text, true).value;
    pre.setAttribute('class', 'hljs');
    pre.appendChild(code);
    parent.appendChild(pre);
  },
 };

const transform = (document, node, parent, ctx) => {
  const type = node.tagName || '_';
  htmlTransform[type](document, node, parent, ctx);
};

const transformChildren = (document, node, parent, ctx) => {
  for (const item of Array.from(node.childNodes)) {
    transform(document, item, parent, ctx);
  }
}

const transformHTML = (xml, preview) => {
  const { document } = (new JSDOM('<!doctype html><html><body></body></html>')).window;
  const domPost = document.body;

  let body = xml.querySelector('body');
  if (preview) {
    const header = body.getElementsByTagName('header')[0];
    if (header) {
      body = header;
    }
  }

  transformChildren(document, body, domPost, { preview, noteCount:0, notes:[] });

  return domPost.innerHTML;
};

module.exports = transformHTML;
