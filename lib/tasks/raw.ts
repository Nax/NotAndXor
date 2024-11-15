import { Builder } from '../builder';

export type RawSet = {[k: string]: string | Buffer};
export const rawTask = (builder: Builder, dir: string) => {
  const files = builder.files(dir, '**/*');
  return builder.task({ files }, ({ files }, next: (v: Promise<RawSet>) => void) => {
    if (!files) return;
    for (const file of Object.values(files)) {
      if (!file) continue;
      const promise = (async () => {
        const raw = await file.read();
        return { [file.path]: raw };
      })();
      next(promise);
    }
  });
};
