import { Builder } from '../builder';
import { SourceFileSet } from '../file';

export const layouts = (builder: Builder, path: string) => {
  const files = builder.files(path, '**/*.hbs');
  const task = builder.task({ files }, ({ files }) => {
    console.log(files);
    return null;
  });
  return task;
};
