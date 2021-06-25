'use strict';

const Task = require('./task');
const { emitFile } = require('./util2');
const devServer = require('./dev-server');

class Builder {
  constructor(opts) {
    opts ||= {};

    this.data = {};
    this.tasks = [];
    this.watch = opts.watch || false;
    this.devServer = opts.devServer || false;
  }

  task(deps, prefix, pattern, cb) {
    const t = new Task(this, deps, prefix, pattern, cb);
    this.tasks.push(t);
    return t;
  }

  taskAny(deps, prefix, pattern, cb) {
    return this.task(deps, prefix, pattern, matches => Promise.all(matches.map(cb)));
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
