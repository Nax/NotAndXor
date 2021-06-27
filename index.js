const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const Builder = require('./src/build');

const static = require('./src/tasks/static');
const assets = require('./src/tasks/assets');
const css = require('./src/tasks/css');
const favicon = require('./src/tasks/favicon');
const javascript = require('./src/tasks/javascript');
const layouts = require('./src/tasks/layouts');
const posts = require('./src/tasks/posts');

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
  "app/**/*.js",
  javascript({ entry: './app/index.js', filename: dev ? 'app.[ext]' : 'app.[hash].min.[ext]' })
);

const faviconTask = builder.task(
  [],
  "app/favicon.png",
  favicon()
);

const cssTask = builder.task(
  [],
  "app/**/*.css",
  css({ entry: './app/index.css', filename: dev ? 'app.css' : 'app.[hash].min.css' })
);

const layoutsTask = builder.task(
  [],
  "app/layouts/*.hbs",
  layouts()
);

builder.task(
  [assetsTask, javascriptTask, faviconTask, cssTask, layoutsTask],
  "app/posts/*.md",
  posts()
);

builder.task(
  [],
  "app/static", "**.*",
  static()
);

builder.run();
