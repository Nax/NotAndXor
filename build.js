const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const hbs = require('handlebars');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const parsePost = require('./builder/parser');
const buildCss = require('./builder/css');
const buildHtml = require('./builder/html');
const devServer = require('./builder/dev-server');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const DEST_DIR = './dist';

const rmdir = promisify(rimraf);

class Builder {
  constructor() {
    this.templates = new Map();
    this.posts = new Map();
    this.stylesheet = null;
  }

  async glob(dir, ext) {
    return (await fs.promises.readdir(dir)).filter(x => x.endsWith('.' + ext)).map(x => path.resolve(`${dir}/${x}`));
  }

  async parseTemplate(p) {
    let { name } = path.parse(p);

    const isPartial = (name[0] === '_');
    const data = await fs.promises.readFile(p);
    const template = hbs.compile(data.toString());

    if (isPartial) {
      name = name.substr(1);
      hbs.registerPartial(name, template);
    } else {
      this.templates.set(name, template);
    }
  }

  async parsePost(p) {
    const data = await fs.promises.readFile(p);
    const post = await parsePost(data);
    this.posts.set(post.slug, post);
  }

  async buildCss() {
    this.stylesheet = await buildCss('./app/index.css', './dist', dev ? 'app.css' : 'app.[hash].min.css');
  }

  async buildPost(post) {
    await buildHtml(this.templates.get("post"), { post, stylesheets: [this.stylesheet] }, `./dist/${post.slug}/index.html`);
  }

  async watch() {
    const watchers = [];
  }

  async run() {
    /* Clean the build dir */
    await rmdir(DEST_DIR);

    const templateFiles = await this.glob('./app/layouts', 'hbs');
    const postFiles = await this.glob('./app/posts', 'xml');

    await Promise.all(templateFiles.map(x => this.parseTemplate(x)));
    await Promise.all(postFiles.map(x => this.parsePost(x)));
    await this.buildCss();
    await Promise.all(Array.from(this.posts.values()).map(x => this.buildPost(x)));
  }
};

const builder = new Builder;
builder.run();

if (dev) {
  devServer();
}
