import { minify } from 'html-minifier';
import { Builder } from '../build';
import { parsePost, Post } from '../parser';
import { TaskFunc } from '../task';

const LIVERELOAD_SCRIPT = "document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js??snipver=1\"></' + 'script>');";

const ld = (type: string, props: {}) => ({
  "@type": type,
  ...props
});

const jsonld = (type: string, props: {}) => JSON.stringify({
  "@context": "https://schema.org",
  ...ld(type, props)
});

const ldBlog = (_post: Post | null) => {
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

const html = (builder: Builder, layoutName: string, args: {}) => {
  const layout = builder.data.layouts[layoutName] as Handlebars.TemplateDelegate;
  let data = layout(args);
  if (!builder.opts.dev) {
    data = minify(data, {
      html5: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      decodeEntities: true,
      sortAttributes: true,
      sortClassName: true
    });
  }
  return data;
}

const commonTemplateArgs = (builder: Builder, url: string) => {
  const baseUrl = builder.opts.dev ? 'http://localhost:8080' : 'https://nax.io';;
  const args = {
    canonicalUrl: baseUrl + (url === "/" ? "" : url),
    stylesheets: builder.data.css,
    javascript: builder.data.javascript,
    favicon: builder.data.favicon,
    scriptsInline: [] as string[],
  };
  if (builder.opts.devServer) {
    args.scriptsInline = [LIVERELOAD_SCRIPT];
  }
  return args;
};

const postIndex = (builder: Builder) => {
  const posts = Object.values(builder.data.posts as {[key: string]: Post}).sort((a, b) => a.date >= b.date ? 1 : -1);

  const args = { ...commonTemplateArgs(builder, '/'), ld: [ldBlog(null)], posts };
  return { filename: 'index.html', data: html(builder, 'post-index', args) };
};

const post = (builder: Builder, slug: string) => {
  const post = builder.data.posts[slug] as Post;

  const args = { ...commonTemplateArgs(builder, `/${slug}`), ld: [ldBlog(post)], post };
  return { filename: `${slug}/index.html`, data: html(builder, 'post', args) };
};

const postTag = (builder: Builder, tag: string) => {
  const posts = Object.values(builder.data.posts as {[key: string]: Post})
    .filter(p => p.tags.includes(tag))
    .sort((a, b) => a.date >= b.date ? 1 : -1);

  const args = { ...commonTemplateArgs(builder, '/'), ld: [ldBlog(null)], posts };
  return { filename: `tag/${tag}/index.html`, data: html(builder, 'post-index', args) };
};

export default (): TaskFunc => async (files, builder) => {
  builder.data.posts ||= {};
  const touchedPosts = new Set<string>();
  const touchedTags = new Set<string>();

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
