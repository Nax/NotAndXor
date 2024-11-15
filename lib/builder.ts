import fs from 'fs';
import { glob } from 'glob';
import { Observable, Subject, merge, lastValueFrom } from 'rxjs';
import { map, mergeMap, share } from 'rxjs/operators';
import chokidar from 'chokidar';

import { SourceFile, SourceFileSet, OutputFile } from './file';
import { emitFile } from './util';
import { devServer } from './dev-server';

type TaskState<T> = {[K in keyof T]: Observable<T[K]>};
type TaskCallback<TInput, TOutput> = (v: Partial<TInput>, next: (v: TOutput | Promise<TOutput>) => void) => void;

const defaultOpts = {
  clean: false,
  devServer: false,
  watch: false,
  dev: false,
};
type BuilderOpts = typeof defaultOpts;
export class Builder {
  public opts = defaultOpts;

  private _tasks: Observable<any>[] = [];
  private _runCallbacks: (() => void)[] = [];

  constructor(opts: Partial<BuilderOpts> = {}) {
    this.opts = { ...this.opts, ...opts };
  }

  task<TOutput, TInput>(sources: TaskState<TInput>, callback: TaskCallback<TInput, TOutput>) {
    const streams: Observable<Partial<TInput>>[] = [];
    for (const k in sources) {
      streams.push(sources[k].pipe(
        map((v) => ({ [k]: v } as any))
      ));
    }
    const mergedSources = merge(...streams);
    const obs = new Observable<TOutput | Promise<TOutput>>((subscriber) => {
      const next = (v: TOutput | Promise<TOutput>) => subscriber.next(v);
      mergedSources.subscribe({
        next: (v) => {
          callback(v, next);
        }, error: (err) => {
          subscriber.error(err);
        }, complete: () => {
          subscriber.complete();
        }
      });
    }).pipe(
      mergeMap(x => Promise.resolve(x)),
      share(),
    );
    this._tasks.push(obs);
    return obs;
  }

  files(prefixOrPath: string, path?: string): Observable<SourceFileSet> {
    const aPrefix = path ? prefixOrPath : null;
    const aPath = path || prefixOrPath;
    const fullpath = [aPrefix, aPath].filter((x) => x).join('/');
    const subject = new Subject<SourceFileSet>();
    this._runCallbacks.push(async () => {
      const files = (await glob(fullpath)).filter(x => fs.statSync(x).isFile());
      const sourceFiles = files.map(x => new SourceFile(aPrefix, x));
      const set = Object.fromEntries(sourceFiles.map(x => [x.path, x] as const));
      subject.next(set);
      if (this.opts.watch) {
        const watcher = chokidar.watch(fullpath, { ignoreInitial: true });
        const onChange = (path: string) => {
          const file = new SourceFile(aPrefix, path);
          subject.next({ [file.path]: file });
        };
        const onDelete = (path: string) => {
          const file = new SourceFile(aPrefix, path);
          subject.next({ [file.path]: null });
        };
        watcher.on('add', onChange);
        watcher.on('change', onChange);
        watcher.on('unlink', onDelete);
      } else {
        subject.complete();
      }
    });
    return subject;
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
      await fs.promises.rm("./dist/", { recursive: true, force: true });
      await fs.promises.mkdir("./dist/", { recursive: true });
    }

    if (this.opts.devServer) {
      devServer();
    }
    for (const cb of this._runCallbacks) {
      cb();
    }
    return lastValueFrom(merge(...this._tasks)).then(_ => null);
  }
};
