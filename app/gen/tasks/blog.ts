import { Observable } from 'rxjs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { isEqual } from 'lodash';
import { minify } from 'html-minifier';

import { Builder } from '../builder';
import { LayoutSet } from './layouts';
import { CssSet } from './css';
import { PostSet } from './posts';
import { Post } from '../parser';
import { RawSet } from './raw';
import { JsSet } from './javascript';

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

type BlogInput = {
  layouts: Observable<LayoutSet>;
  css: Observable<CssSet>;
  posts: Observable<PostSet>;
  raw: Observable<RawSet>;
  favicon: Observable<string>;
  js: Observable<JsSet>;
};
export const blogTask = (builder: Builder, sources: BlogInput) => {
  let Layout: (() => JSX.Element) | null = null;
  let Post: (() => JSX.Element) | null = null;
  let stateCss: CssSet = {};
  let stateJs: JsSet = {};
  let statePosts: PostSet = {};
  let stateRaw: RawSet = {};
  let stateFavicon: string = '';
  let dirtyIndex = true;
  let dirtyPosts = new Set<string>;
  let dirtyTags = new Set<string>;

  const render = ({ posts, preview, filename, title, ld }: { posts: Post[], preview?: boolean, filename: string, title?: string, ld?: string[] }) => {
    const urlSuffix = filename === 'index.html' ? '' : filename.replace(/\/index.html$/, '').replace(/\.html$/, '');
    const canonical = ['https://nax.io', urlSuffix].filter(x => x).join('/');
    const sortedPosts = posts.sort((a, b) => a.date >= b.date ? -1 : 1);
    const postsElem = sortedPosts.map(post => React.createElement(Post!, { key: post.slug, preview, post }));
    const js = Object.values(stateJs).filter(x => /\.js$/.test(x));
    //const jsModules = Object.values(stateJs).filter(x => /\.mjs$/.test(x));
    const layoutsProps: any =  { title, raw: stateRaw, css: Object.values(stateCss), ld, js, favicon: stateFavicon, canonical };
    if (builder.opts.devServer) {
      layoutsProps.jsInline = [LIVERELOAD_SCRIPT];
    }
    const layout = React.createElement(Layout!, layoutsProps, postsElem);
    let data = '<!doctype html>' + ReactDOMServer.renderToString(layout).replaceAll(/<script><\/script>/g, '');
    if (!builder.opts.dev) {
      data = minify(data, {
        html5: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        decodeEntities: true,
        sortAttributes: true,
        sortClassName: true,
        removeComments: true,
      });
    }
    return builder.emit({ filename, data });
  };

  const makeBlogIndex = () => {
    return render({ posts: Object.values(statePosts), preview: true, filename: 'index.html', ld: [ldBlog(null)] });
  };

  const makeBlogTag = (tag: string) => {
    const posts = Object.values(statePosts).filter(p => p.tags.includes(tag));
    return render({ posts, preview: true, filename: `tag/${tag}.html`, ld: [ldBlog(null)] });
  };

  const makeBlogPost = (post: Post) => {
    return render({ posts: [post], filename: `${post.slug}.html`, title: post.title, ld: [ldBlog(post)] });
  };

  return builder.task(sources, ({ layouts, css, posts, raw, favicon, js }, next: (v: Promise<null>) => void) => {
    let dirtyGlobal = false;
    if (layouts) {
      if (layouts.Layout) {
        Layout = layouts.Layout;
        dirtyGlobal = true;
      }
      if (layouts.Post) {
        Post = layouts.Post;
        dirtyGlobal = true;
      }
    }

    if (css) {
      const stateCssNew = {...stateCss, ...css};
      if (!isEqual(stateCssNew, stateCss)) {
        stateCss = stateCssNew;
        dirtyGlobal = true;
      }
    }

    if (js) {
      const stateJsNew = {...stateJs, ...js};
      if (!isEqual(stateJsNew, stateJs)) {
        stateJs = stateJsNew;
        dirtyGlobal = true;
      }
    }

    if (posts) {
      const oldTags = Object.keys(posts).map(x => statePosts[x]?.tags || []).flat();
      const newTags = Object.values(posts).map(x => x.tags).flat();
      statePosts = {...statePosts, ...posts};
      dirtyIndex = true;
      for (const k in posts) {
        dirtyPosts.add(k);
      }
      for (const tag of [...oldTags, ...newTags]) {
        dirtyTags.add(tag);
      }
    }

    if (favicon) {
      stateFavicon = favicon;
      dirtyGlobal = true;
    }

    if (raw) {
      stateRaw = {...stateRaw, ...raw};
      dirtyGlobal = true;
    }

    if (dirtyGlobal) {
      dirtyIndex = true;
      for (const k in statePosts) {
        dirtyPosts.add(k);
      }
      for (const tag of Object.values(statePosts).map(x => x.tags).flat()) {
        dirtyTags.add(tag);
      }
    }

    const promises: Promise<any>[] = [];
    if (Layout && Post && Object.keys(stateCss).length && Object.keys(stateJs).length && Object.keys(statePosts).length && Object.keys(stateRaw).length && stateFavicon) {
      if (dirtyIndex) {
        promises.push(makeBlogIndex());
        dirtyIndex = false;
      }
      for (const k of dirtyPosts) {
        promises.push(makeBlogPost(statePosts[k]));
        dirtyPosts.delete(k);
      }
      for (const tag of dirtyTags) {
        promises.push(makeBlogTag(tag));
        dirtyTags.delete(tag);
      }
    }
    if (promises.length) {
      next(Promise.all(promises).then(_ => null));
    }
  });
};

