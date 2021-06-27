'use strict';

const rmrf = require('rmfr');

const Task = require('./task');
const { emitFile } = require('./util');
const devServer = require('./dev-server');

class Builder {
  constructor(opts) {
    opts ||= {};

    this.data = {};
    this.tasks = [];
    this.watch = opts.watch || false;
    this.devServer = opts.devServer || false;
    this.dev = opts.dev || false;
    this.clean = opts.clean || false;
  }

  task(deps, prefix, pattern, func) {
    if (!func) {
      func = pattern;
      pattern = prefix;
      prefix = null;
    }

    if (!func) {
      aFunc = pattern;
      pattern = null;
    }

    const t = new Task(this, deps, prefix, pattern, func);
    this.tasks.push(t);
    return t;
  }

  emit(files) {
    /* Allow a single file to be passed */
    if (!Array.isArray(files)) {
      files = [files];
    }
    files = files.flat();

    /* Remove null/undefined entries */
    files = files.filter(x => !!x);

    /* Emit every file, and resolve upon completion */
    return Promise.all(files.map(x => emitFile("./dist", x)));
  }

  async run() {
    if (this.clean) {
      console.log("Cleaning ./dist");
      await rmrf("./dist/*", { glob: true });
    }

    await Promise.all(this.tasks.map(x => x.run()));
    if (this.watch) {
      this.tasks.forEach(x => x.watch());
      console.log("Watching files for changes");
    }
    if (this.devServer) {
      devServer();
    }
  }
};

module.exports = Builder;
