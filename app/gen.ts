const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

import { Builder } from './gen/build';

import staticFiles from './gen/tasks/static';
import assets from './gen/tasks/assets';
import css from './gen/tasks/css';
import favicon from './gen/tasks/favicon';
import javascript from './gen/tasks/javascript';
import layouts from './gen/tasks/layouts';
import posts from './gen/tasks/posts';

const builder = new Builder({
  dev: dev,
  watch: dev,
  devServer: dev,
  clean: !dev,
});

const assetsTask = builder.task(
  [],
  "app/assets", "**/*.svg",
  assets({ filename: dev ? '_assets/[path]/[name].[ext]' : '_assets/[hash].[ext]' })
);

const javascriptTask = builder.task(
  [],
  null, "app/**/*.js",
  javascript({ entry: './app/index.js', filename: dev ? 'app.[ext]' : 'app.[hash].min.[ext]' })
);

const faviconTask = builder.task(
  [],
  null, "app/favicon.png",
  favicon()
);

const cssTask = builder.task(
  [],
  null, "app/**/*.css",
  css({ entry: './app/index.css', filename: dev ? 'app.css' : 'app.[hash].min.css' })
);

const layoutsTask = builder.task(
  [],
  null, "app/layouts/*.hbs",
  layouts()
);

builder.task(
  [assetsTask, javascriptTask, faviconTask, cssTask, layoutsTask],
  null, "app/posts/*.md",
  posts()
);

builder.task(
  [],
  "app/static", "**.*",
  staticFiles()
);

builder.run();
