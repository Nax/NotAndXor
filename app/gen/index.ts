const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

import { Builder } from './builder';
import { cssTask } from './tasks/css';
import { postsTask } from './tasks/posts';
import { staticTask } from './tasks/static';
import { layoutsTask } from './tasks/layouts';
import { blogTask } from './tasks/blog';
import { rawTask } from './tasks/raw';
import { faviconTask } from './tasks/favicon';
import { javascriptTask } from './tasks/javascript';

const builder = new Builder({
  dev: dev,
  watch: dev,
  devServer: dev,
  clean: !dev,
});

const css = cssTask(builder, 'app/styles', { entry: 'index.css', filename: dev ? 'app.css' : 'app.[hash].min.css' });
const posts = postsTask(builder, 'app/posts');
const staticFiles = staticTask(builder, 'app/static');
const layouts = layoutsTask(builder, 'app/layouts');
const raw = rawTask(builder, 'app/raw');
const favicon = faviconTask(builder, 'app/favicon.png');
const js = javascriptTask(builder, 'app/src', { entry: 'index.ts', filename: dev ? 'app.[ext]' : 'app.[hash].min.[ext]' });
const blog = blogTask(builder, { layouts, css, posts, raw, favicon, js });

builder.run().then(() => {
  console.log("Done.");
}).catch((err) => {
  console.error(err);
});
