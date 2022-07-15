import { promisify } from 'util';
import { glob } from 'glob';

import { Task, TaskCallback, TaskEntry } from './task';
import { SourceFile, SourceFileSet } from './file';

const globPromise = promisify(glob);

type BuilderFileSource = {
  prefix: string | null;
  path: string;
  task: TaskEntry<SourceFileSet>;
}

export class Builder {
  private _tasks: Task<any, any>[] = [];
  private _fileSources: BuilderFileSource[] = [];

  task<TInput, TOutput>(subscription: {[K in keyof TInput]: (Task<any, TInput[K]> | TaskEntry<TInput[K]>)}, callback: TaskCallback<TInput, TOutput>) {
    const t = new Task(subscription, callback);
    this._tasks.push(t);
    return t;
  }

  files(prefixOrPath: string, path?: string) {
    const task = new TaskEntry<SourceFileSet>();
    const aPath = path || prefixOrPath;
    const aPrefix = path ? prefixOrPath : null;
    this._fileSources.push({ prefix: aPrefix, path: aPath, task });
    return task;
  }

  async run() {
    for (const source of this._fileSources) {
      const pattern = [source.prefix, source.path].filter(x => !!x).join('/');
      const files = await globPromise(pattern);
      const sourceFiles = files.map(file => new SourceFile(source.prefix, file));
      const data: SourceFileSet = {};
      for (const f of sourceFiles) {
        data[f.path] = f;
      }
      source.task.publish(data);
    }
    await Promise.all(this._tasks.map(x => x.promise()));
  }
};
