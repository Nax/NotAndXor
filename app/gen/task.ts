import glob from 'glob-promise';
import chokidar from 'chokidar';
import { File, OutputFile } from './file';

import type { Builder } from './build';

export type TaskFunc = (f: File[], b: Builder) => OutputFile | OutputFile[] | Promise<OutputFile | OutputFile[]>;

export class Task {
  private next: Task[] = [];
  private promise: Promise<null> | null = null;
  private promiseDeps: Promise<OutputFile | OutputFile[]> | null = null;

  constructor(
    private builder: Builder,
    private deps: Task[],
    private prefix: string | null,
    private pattern: string | null,
    private cb: TaskFunc,
  ) {
    for (const d of deps) {
      d.next.push(this);
    }
  }

  run() {
    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.runFirstDeps()
          .then(x => this.builder.emit(x))
          .then(_ => resolve(null))
          .catch(e => reject(e));
      });
    }
    return this.promise;
  }

  toFile(m: string) {
    if (this.prefix) {
      const p = this.prefix ? m.substring(this.prefix.length + 1) : m;
      return new File(this.prefix, p);
    } else {
      return new File(m);
    }
  }

  /* Called after the initial run - watches */
  watch() {
    if (this.prefix || this.pattern) {
      const p = [this.prefix, this.pattern].filter(x => !!x).join('/');
      chokidar.watch([p], { ignoreInitial: true }).on('all', async (_, f) => {
        console.log("");
        await this.runWatch(f);
        await Promise.all(this.next.map(x => x.runWatchDep()));
      });
    }
  }

  /* Ran from being watched */
  private runWatch(f: string) {
    return new Promise((resolve, reject) => {
      const p = this.runRaw(Promise.resolve([f]));
      p.then(resolve);
      p.then(this.builder.emit)
        .catch(e => reject(e));
    });
  }

  /* Ran from a deb being watched */
  private async runWatchDep(): Promise<OutputFile | OutputFile[]> {
    const files = await this.runRawGlob();
    const p = (await Promise.all(this.next.map(x => x.runWatchDep()))).flat();
    this.builder.emit(p);
    return p;
  }

  /* First run - Ensure the deps are done and signal dep completion as well */
  private runFirstDeps() {
    if (!this.promiseDeps) {
      this.promiseDeps = new Promise<OutputFile | OutputFile[]>((resolve, reject) => {
        Promise.all(this.deps.map(x => x.runFirstDeps()))
          .then(_ => this.runRawGlob())
          .then(x => resolve(x))
          .catch(e => reject(e));
      });
    }
    return this.promiseDeps;
  }

  /* Runs the task from the given pattern */
  private runRawGlob() {
    if (!this.prefix && !this.pattern) {
      return this.runRaw(Promise.resolve([]));
    }

    const p = [this.prefix, this.pattern].filter(x => !!x).join('/');
    return this.runRaw(glob(p));
  }

  /* Runs the task */
  private runRaw(files: Promise<string[]>) {
    return files
      .then(x => x.map(y => this.toFile(y)))
      .then(f => this.cb(f, this.builder))
  }
};
