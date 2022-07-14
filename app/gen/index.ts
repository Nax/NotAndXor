const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

import { Builder } from './build';

import staticFiles from './tasks/static';
import assets from './tasks/assets';
import css from './tasks/css';
import favicon from './tasks/favicon';
import javascript from './tasks/javascript';
import layouts from './tasks/layouts';
import posts from './tasks/posts';

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
  null, "app/src/*.ts",
  javascript({ entry: './app/src/index.ts', filename: dev ? 'app.[ext]' : 'app.[hash].min.[ext]' })
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
