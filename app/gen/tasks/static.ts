import { Builder } from '../builder';

type StaticFileSet = {[k: string]: string | Buffer};
export const staticTask = (builder: Builder, dir: string) => {
  const files = builder.files(dir, '**/*');
  return builder.task({ files }, ({ files }, next: (v: Promise<StaticFileSet>) => void) => {
    if (!files) return;
    for (const file of Object.values(files)) {
      if (!file) continue;
      const promise = (async () => {
        const raw = await file.read();
        await builder.emit({ filename: file.path, data: raw });
        return { [file.path]: raw };
      })();
      next(promise);
    }
  });
};
