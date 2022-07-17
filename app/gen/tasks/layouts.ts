import path from 'path';

import { Builder } from '../builder';

export type LayoutSet = {[k: string]: () => JSX.Element};
export const layoutsTask = (builder: Builder, dir: string) => {
  const files = builder.files(dir, '**/*.tsx');
  return builder.task({ files }, ({ files }, next: (v: LayoutSet) => void) => {
    if (!files) return;
    const entries = Object.entries(files).map(([k, v]) => {
      const basename = path.basename(k, '.tsx');
      if (!v) return [basename, null];
      const modulePath = require.resolve(path.resolve(dir, k));
      delete require.cache[modulePath];
      const module = require(modulePath);
      return [basename, module.default];
    });
    next(Object.fromEntries(entries));
  });
};
