'use strict';

const { minify } = require('html-minifier');
const parsePost = require('../parser');

const LIVERELOAD_SCRIPT = "document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js??snipver=1\"></' + 'script>');";

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

const html = (builder, layoutName, args) => {
  const layout = builder.data.layouts[layoutName];
  let data = layout(args);
  if (!builder.dev) {
    data = minify(data, {
      html5: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      decodeEntities: true,
      sortAttributes: true,
      sortClassName: true
    });
  }
  return data;
}

const commonTemplateArgs = (builder, url) => {
  const baseUrl = builder.dev ? 'http://localhost:8080' : 'https://nax.io';;
  const args = {
    canonicalUrl: baseUrl + (url === "/" ? "" : url),
    stylesheets: builder.data.css,
    javascript: builder.data.javascript,
    favicon: builder.data.favicon,
  };
  if (builder.devServer) {
    args.scriptsInline = [LIVERELOAD_SCRIPT];
  }
  return args;
};

const postIndex = (builder) => {
  const posts = Object.values(builder.data.posts).sort((a, b) => a.date >= b.date);

  const args = { ...commonTemplateArgs(builder, '/'), ld: [ldBlog(null)], posts };
  return { filename: 'index.html', data: html(builder, 'post-index', args) };
};

const post = (builder, slug) => {
  const post = builder.data.posts[slug];

  const args = { ...commonTemplateArgs(builder, `/${slug}`), ld: [ldBlog(post)], post };
  return { filename: `${slug}/index.html`, data: html(builder, 'post', args) };
};

const postTag = (builder, tag) => {
  const posts = Object.values(builder.data.posts)
    .filter(p => p.tags.includes(tag))
    .sort((a, b) => a.date >= b.date);

  const args = { ...commonTemplateArgs(builder, '/'), ld: [ldBlog(null)], posts };
  return { filename: `tag/${tag}/index.html`, data: html(builder, 'post-index', args) };
};

module.exports = () => async (files, builder) => {
  builder.data.posts ||= {};
  const touchedPosts = new Set();
  const touchedTags = new Set();

  /* Parse the posts */
  await Promise.all(files.map(async file => {
    const post = await parsePost(await file.read());
    builder.data.posts[post.slug] = post;
    touchedPosts.add(post.slug);
    for (const t of post.tags) {
      touchedTags.add(t);
    }
  }));

  /* Generate the index */
  return [
    postIndex(builder),
    ...Array.from(touchedPosts).map(x => post(builder, x)),
    ...Array.from(touchedTags).map(x => postTag(builder, x)),
  ];
};
