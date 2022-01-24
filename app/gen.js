const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const Builder = require('./gen/build');

const static = require('./gen/tasks/static');
const assets = require('./gen/tasks/assets');
const css = require('./gen/tasks/css');
const favicon = require('./gen/tasks/favicon');
const javascript = require('./gen/tasks/javascript');
const layouts = require('./gen/tasks/layouts');
const posts = require('./gen/tasks/posts');

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
