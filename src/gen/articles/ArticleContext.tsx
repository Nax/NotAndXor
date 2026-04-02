import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

import { Asset } from '../types';

type ArticleContextType = {
  assets: Asset[];
};
const ArticleContext = createContext<ArticleContextType>({
  assets: [],
});

export function ArticleProvider({ assets, children }: { assets: Asset[], children: ComponentChildren }) {
  return (
    <ArticleContext.Provider value={{ assets }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useAssets() {
  return useContext(ArticleContext).assets;
}

export function useAsset(path: string) {
  const assets = useAssets();
  return assets.find(a => a.source === path);
}

export function useAssetExt(path: string, exts: string[]) {
  const assets = useAssets();
  for (const ext of exts) {
    const p = `${path}.${ext}`;
    const asset = assets.find(a => a.source === p);
    if (asset) return asset;
  }
}
