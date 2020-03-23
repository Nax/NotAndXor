const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const hbs = require('handlebars');
const mkdirp = require('mkdirp');
const minifyHtml = require('html-minifier').minify;
const rimraf = require('rimraf');

const parsePost = require('./builder/parser');
const buildCss = require('./builder/css');
const devServer = require('./builder/dev-server');

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

const DEST_DIR = './dist';

const rmdir = promisify(rimraf);

class Builder {
  constructor() {
    this.templates = new Map();
    this.posts = new Map();
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

  async emit(p, data) {
    const { dir } = path.parse(p);
    await mkdirp(dir);
    await fs.promises.writeFile(p, data);
  }

  async run() {
    /* Clean the build dir */
    await rmdir(DEST_DIR);

    const templateFiles = await this.glob('./app/layouts', 'hbs');
    const postFiles = await this.glob('./app/posts', 'xml');

    await Promise.all(templateFiles.map(x => this.parseTemplate(x)));
    await Promise.all(postFiles.map(x => this.parsePost(x)));

    const stylesheet = await buildCss('./app/index.css', './dist', dev ? 'app.css' : 'app.[hash].min.css');

    for (let post of this.posts.values()) {
      const html = minifyHtml(
        this.templates.get('post')({ post, stylesheets: [stylesheet] }), {
          html5: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          decodeEntities: true,
          sortAttributes: true,
          sortClassName: true
        }
      );
      await this.emit(`./dist/${post.slug}/index.html`, html);
    }
  }
};

const builder = new Builder;
builder.run().then(() => console.log("Done"));

if (dev) {
  devServer();
}
