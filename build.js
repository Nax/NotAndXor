const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const hbs = require('handlebars');
const rimraf = require('rimraf');
const chokidar = require('chokidar');

const parsePost = require('./builder/parser');
const buildCss = require('./builder/css');
const buildHtml = require('./builder/html');
const buildFavicon = require('./builder/favicon');
const buildStatic = require('./builder/static');
const buildJavascript = require('./builder/javascript');
const devServer = require('./builder/dev-server');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const DEST_DIR = './dist';
const LIVERELOAD_SCRIPT = "document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js??snipver=1\"></' + 'script>');";
const BASE_URL = dev ? 'http://localhost:8080' : 'https://nax.io';

const rmdir = promisify(rimraf);

const ld = (type, props) => ({
  "@type": type,
  ...props
});

const jsonld = (type, props) => JSON.stringify({
  "@context": "https://schema.org",
  ...ld(type, props)
});

class Builder {
  constructor() {
    this.templates = new Map();
    this.posts = new Map();
    this.stylesheet = null;
    this.javascript = { scripts: [], modules: [] };
    this.favicon = null;
  }

  async glob(dir, ext) {
    const dirFiles = await fs.promises.readdir(dir);
    const files = ext ? dirFiles.filter(x => x.endsWith('.' + ext)) : dirFiles;
    return files.map(x => path.resolve(`${dir}/${x}`));
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
    return post;
  }

  async buildCss() {
    this.stylesheet = await buildCss('./app/index.css', './dist', dev ? 'app.css' : 'app.[hash].min.css');
  }

  async buildStatic(p) {
    await buildStatic(p);
  }

  async buildJavascript() {
    this.javascript = await buildJavascript('./app/index.js', './dist', dev ? 'app.[ext]' : 'app.[hash].min.[ext]');
  }

  ldBlog(post) {
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
  }

  commonTemplateArgs(url) {
    const args = {
      stylesheets: [this.stylesheet],
      javascript: this.javascript,
      favicon: this.favicon,
      canonicalUrl: BASE_URL + url
    };
    if (dev) {
      args.scriptsInline = [LIVERELOAD_SCRIPT];
    }
    return args;
  }

  async buildPost(post) {
    const commonArgs = this.commonTemplateArgs(`/${post.slug}`);
    const args = { ...commonArgs, ld: [this.ldBlog(post)], post };
    await buildHtml(this.templates.get("post"), args, `./dist/${post.slug}/index.html`);
  }

  async buildPostIndex() {
    const commonArgs = this.commonTemplateArgs('/');
    const args = { ...commonArgs, ld: [this.ldBlog(null)], posts: Array.from(this.posts.values()) };
    await buildHtml(this.templates.get("post-index"), args, `./dist/index.html`);
  }

  async buildFavicon() {
    this.favicon = await buildFavicon('./app/favicon.png');
  }

  watch() {
    const watchers = [];

    /* Watch for CSS changes */
    watchers.push(chokidar.watch(['./app/index.css', './app/styles'], { ignoreInitial: true }).on('all', async (event, p) => {
      await this.buildCss();
    }));

    /* Watch for post changes */
    watchers.push(chokidar.watch(['./app/posts'], { ignoreInitial: true }).on('all', async (event, p) => {
      const post = await this.parsePost(p);
      await this.buildPost(post);
      await this.buildPostIndex();
    }));

    /* Watch for layout changes */
    watchers.push(chokidar.watch(['./app/layouts'], { ignoreInitial: true }).on('all', async (event, p) => {
      await this.parseTemplate(p);
      await Promise.all(Array.from(this.posts.values()).map(x => this.buildPost(x)));
      await this.buildPostIndex();
    }));
  }

  async run() {
    /* Clean the build dir */
    await rmdir(DEST_DIR);

    const templateFiles = await this.glob('./app/layouts', 'hbs');
    const postFiles = await this.glob('./app/posts', 'xml');
    const staticFiles = await this.glob('./app/static');

    await Promise.all(templateFiles.map(x => this.parseTemplate(x)));
    await Promise.all(postFiles.map(x => this.parsePost(x)));
    await this.buildCss();
    await this.buildJavascript();
    await this.buildFavicon();
    await Promise.all(Array.from(this.posts.values()).map(x => this.buildPost(x)));
    await this.buildPostIndex();
    await Promise.all(staticFiles.map(x => this.buildStatic(x)));
  }
};

const builder = new Builder;
builder.run().then(() => {
  if (dev) {
    builder.watch();
    devServer();
  }
});
