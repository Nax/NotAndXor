import { useAsset } from './ArticleContext';

type VideoProps = {
  src: string;
};
export function Video({ src }: VideoProps) {
  const assetWebm = useAsset(src + '.webm');
  const assetMp4 = useAsset(src + '.mp4');

  return (
    <video autoplay loop muted>
      {assetWebm && assetWebm.type === 'video' && <source src={assetWebm.path} type="video/webm"/>}
      {assetMp4 && assetMp4.type === 'video' && <source src={assetMp4.path} type="video/mp4"/>}
    </video>
  );
}
