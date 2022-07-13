import fs from 'fs';

export class File {
  public prefix?: string;
  public path: string;

  constructor(prefixOrPath: string, path?: string) {
    if (path) {
      this.prefix = prefixOrPath;
      this.path = path;
    } else {
      this.path = prefixOrPath;
    }
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

export type OutputFile = {
  filename: string;
  data: string | Buffer;
};
