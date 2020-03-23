const { JSDOM } = require('jsdom');
const transformHTML = require('./transform/html');

const collapseWhitespace = (node) => {
  for(let n = 0; n < node.childNodes.length; n ++) {
    const child = node.childNodes[n];
    if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue || ''))) {
      node.removeChild(child);
      n --;
    } else if (child.nodeType === 1) {
      collapseWhitespace(child);
    }
  }
}

const parsePost = async post => {
  const dom = new JSDOM(post, { contentType: 'application/xml' });
  const { document } = dom.window;

  const title = document.querySelector('title').textContent;
  const slug = document.querySelector('slug').textContent;
  const date = document.querySelector('date').textContent;
  const elTags = document.querySelector('tags');
  const tags = elTags ? elTags.textContent.split(' ') : [];
  const html = transformHTML(document, false);
  const htmlPreview = transformHTML(document, true);

  collapseWhitespace(document);

  return {
    title,
    slug,
    xml: dom.serialize(),
    html,
    htmlPreview,
    date,
    tags
  };
};

module.exports = parsePost;
