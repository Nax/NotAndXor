import rmrf from 'rimraf';

import { Task, TaskFunc } from './task';
import { emitFile } from './util';
import { devServer } from './dev-server';
import { OutputFile } from './file';

const defaultOpts = {
  clean: false,
  devServer: false,
  watch: false,
  dev: false,
};
type BuilderOpts = typeof defaultOpts;

export class Builder {
  private tasks: Task[] = [];
  public opts = defaultOpts;
  public data: any = {};

  constructor(opts: Partial<BuilderOpts> = {}) {
    this.opts = { ...this.opts, ...opts };
  }

  task(deps: Task[], prefix: string | null, pattern: string | null, func: TaskFunc): Task {
    const t = new Task(this, deps, prefix, pattern, func);
    this.tasks.push(t);
    return t;
  }

  emit(files: OutputFile | OutputFile[]) {
    /* Allow a single file to be passed */
    if (!Array.isArray(files)) {
      files = [files];
    }
    files = files.flat();

    /* Remove null/undefined entries */
    files = files.filter(x => !!x);

    /* Emit every file, and resolve upon completion */
    return Promise.all(files.map(x => emitFile("./dist", x))).then(_ => null);
  }

  async run() {
    if (this.opts.clean) {
      console.log("Cleaning ./dist");
      await new Promise((resolve, reject) => {
        rmrf("./dist/*", (err) => {
          if (err) reject(err);
          resolve(null);
        });
      });
    }

    await Promise.all(this.tasks.map(x => x.run()));
    if (this.opts.watch) {
      this.tasks.forEach(x => x.watch());
      console.log("Watching files for changes");
    }
    if (this.opts.devServer) {
      devServer();
    }
  }
};
