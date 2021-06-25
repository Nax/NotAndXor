'use strict';

const parsePost = require('../parser');
const { dev } = require('../config');

const LIVERELOAD_SCRIPT = "document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js??snipver=1\"></' + 'script>');";
const BASE_URL = dev ? 'http://localhost:8080' : 'https://nax.io';

const ld = (type, props) => ({
  "@type": type,
  ...props
});

const jsonld = (type, props) => JSON.stringify({
  "@context": "https://schema.org",
  ...ld(type, props)
});

const ldBlog = (post) => {
  return jsonld('Blog', {
    name: "Not And Xor",
    description: "A blog about computer science and software.",
    url: "https://nax.io",
    author: ld('Person', {
      givenName: "Maxime",
      familyName: "Bacoux",
      gender: "Male",
      jobTitle: "Computer Scientist",
      nationality: "fr"
    })
  });
};

const commonTemplateArgs = (builder, url) => {
  const args = {
    canonicalUrl: BASE_URL + (url === "/" ? "" : url),
    stylesheets: builder.data.css,
    javascript: builder.data.javascript,
    favicon: builder.data.favicon,
  };
  if (builder.devServer) {
    args.scriptsInline = [LIVERELOAD_SCRIPT];
  }
  return args;
};

module.exports = {};

module.exports.post = (builder, deps) => builder.taskAny(deps, "app/posts", "**.md", async (m) => {
  builder.data.posts ||= {};

  const layout = builder.data.layouts['post'];
  const post = await parsePost(await m.read());

  builder.data.posts[post.slug] = post;

  const args = { ...commonTemplateArgs(builder, `/${post.slug}`), ld: [ldBlog(post)], post };
  return { filename: `${post.slug}/index.html`, data: layout(args) };
});

module.exports.postIndex = (builder, deps) => builder.task(deps, null, null, async () => {
  const layout = builder.data.layouts['post-index'];
  const posts = Object.values(builder.data.posts).sort((a, b) => a.date >= b.date);

  const args = { ...commonTemplateArgs(builder, '/'), ld: [ldBlog(null)], posts };
  return { filename: 'index.html', data: layout(args) };
});
