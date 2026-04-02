import { useAsset } from './ArticleContext';

type ImageProps = {
  src: string;
  alt?: string;
};
export function Image({ src, alt }: ImageProps) {
  const asset = useAsset(src + '.png');
  const assetWebp = useAsset(src + '.webp');
  const assetAvif = useAsset(src + '.avif');

  let width: number | undefined;
  let height: number | undefined;
  let resolvedSrc = src;

  if (asset && asset.type === 'image') {
    width = asset.width;
    height = asset.height;
    resolvedSrc = asset.path;
  }

  return (
    <picture>
      {assetAvif && assetAvif.type === 'image' && <source srcSet={assetAvif.path} type="image/avif"/>}
      {assetWebp && assetWebp.type === 'image' && <source srcSet={assetWebp.path} type="image/webp"/>}
      <img src={resolvedSrc} width={width} height={height} alt={alt}/>
    </picture>
  );
}

