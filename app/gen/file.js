'use strict';

const fs = require('fs');

class File {
  constructor(prefix, path) {
    this.prefix = prefix;
    this.path = path;
  }

  get fullpath() {
    return [this.prefix, this.path].filter(x => !!x).join('/');
  }

  get mtime() {
    return fs.statSync(this.fullpath).mtime;;
  }

  read() {
    return fs.promises.readFile(this.fullpath);
  }
};

module.exports = File;
