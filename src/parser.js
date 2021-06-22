const { JSDOM } = require('jsdom');
const matter = require('gray-matter');
const marked = require('marked');

const findParentParagraph = (node) => {
  if (node.tagName === 'p' || node.tagName === 'P')
    return node;
  return findParentParagraph(node.parentElement);
}

const transformSmallCaps = (document) => {
  for (const e of document.getElementsByTagName('sc')) {
    const n = document.createElement('span');
    n.classList.add('small-caps');
    n.innerHTML = e.innerHTML;
    e.parentElement.replaceChild(n, e);
  }
};

const transformNotes = (document, preview) => {
  const notes = document.getElementsByTagName('note');

  if (preview) {
    for (const n of notes) {
      n.remove();
    }
  } else {
    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const num = i + 1;
      const name = note.attributes["name"] || num.toString();
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
      findParentParagraph(note).prepend(aside);
      note.parentElement.replaceChild(ref, note);
    }
  }
};

const transform = (data, preview) => {
  const { document } = (new JSDOM(data)).window;

  transformSmallCaps(document);
  transformNotes(document, preview);

  return document.body.innerHTML;
};

const parsePost = async post => {
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

module.exports = parsePost;
