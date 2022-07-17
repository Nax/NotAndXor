import fs from 'fs';

export class SourceFile {
  public prefix: string | null;
  public path: string;

  constructor(prefix: string | null, path: string) {
    if (prefix) {
      this.prefix = prefix;
      this.path = path.substring(prefix.length + 1);
    } else {
      this.prefix = null;
      this.path = path;
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

export type SourceFileSet = {[k: string]: SourceFile | null};
