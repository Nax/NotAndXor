'use strict';

const glob = require('glob-promise');
const chokidar = require('chokidar');
const File = require('./file');

class Task {
  constructor(builder, deps, prefix, pattern, cb) {
    this.builder = builder;
    this.deps = deps;
    this.prefix = prefix;
    this.pattern = pattern;
    this.cb = cb;

    this.next = [];
    this._promise = null;
    this._promiseDeps = null;

    deps.forEach((d) => {
      d.next.push(this);
    });
  }

  run() {
    if (!this._promise) {
      this._promise = new Promise((resolve, reject) => {
        this._runFirstDeps()
          .then(x => this.builder.emit(x))
          .then(x => resolve(x))
          .catch(e => reject(e));
      });
    }
    return this._promise;
  }

  toFile(m) {
    const p = this.prefix ? m.substring(this.prefix.length + 1) : m;
    return new File(this.prefix, p);
  }

  /* Called after the initial run - watches */
  watch() {
    if (this.prefix || this.pattern) {
      const p = [this.prefix, this.pattern].filter(x => !!x).join('/');
      chokidar.watch([p], { ignoreInitial: true }).on('all', async (_, f) => {
        console.log("");
        await this._runWatch(f);
        await Promise.all(this.next.map(x => x._runWatchDep()));
      });
    }
  }

  /* Ran from being watched */
  _runWatch(f) {
    return new Promise((resolve, reject) => {
      const p = this._runRaw(Promise.resolve([f]));
      p.then(resolve);
      p.then(this.builder.emit)
        .catch(e => reject(e));
    });
  }

  /* Ran from a deb being watched */
  async _runWatchDep() {
    return new Promise((resolve, reject) => {
      const p = this._runRawGlob().then(Promise.all(this.next.map(x => x._runWatchDep())));
      p.then(resolve);
      p.then(this.builder.emit)
        .catch(e => reject(e));
    });
  }

  /* First run - Ensure the deps are done and signal dep completion as well */
  _runFirstDeps() {
    if (!this._promiseDeps) {
      this._promiseDeps = new Promise((resolve, reject) => {
        Promise.all(this.deps.map(x => x._runFirstDeps()))
          .then(_ => this._runRawGlob())
          .then(x => resolve(x))
          .catch(e => reject(e));
      });
    }
    return this._promiseDeps;
  }

  /* Runs the task from the given pattern */
  _runRawGlob() {
    if (!this.prefix && !this.pattern) {
      return this._runRaw(Promise.resolve([]));
    }

    const p = [this.prefix, this.pattern].filter(x => !!x).join('/');
    return this._runRaw(glob(p));
  }

  /* Runs the task */
  _runRaw(files) {
    return files
      .then(x => x.map(y => this.toFile(y)))
      .then(f => this.cb(f, this.builder))
  }


};

module.exports = Task;
