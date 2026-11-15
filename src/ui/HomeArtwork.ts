import nebulaPreview from './artwork/nebula-preview.webp?inline';
import scenePreview from './artwork/scene-preview.webp?inline';
import shellPreview from './artwork/shell-preview.webp?inline';
import { loadImage } from '../solar/textures';

/** Keep the original artwork visible even when full-size image requests fail. */
export function mountHomeArtwork() {
  const style = document.body.style;
  const shellImages = document.querySelectorAll<SVGImageElement>('.handheld-art image[data-full-src]');
  const artwork = [
    { property: '--home-nebula-image', preview: nebulaPreview, file: 'display-space-nebula-462a3d6692.webp' },
    { property: '--home-scene-image', preview: scenePreview, file: 'display-universe-reference-e55177f834b2-93b9417869.webp' },
    { property: '--home-shell-image', preview: shellPreview, file: 'display-handheld-shell-user-6449ca2f55.webp' },
  ];
  let disposed = false;

  for (const asset of artwork) {
    style.setProperty(asset.property, `url("${asset.preview}")`);
  }
  shellImages.forEach(image => image.setAttribute('href', shellPreview));

  return {
    async loadFullSize(): Promise<void> {
      await Promise.allSettled(artwork.map(async asset => {
        const url = `${import.meta.env.BASE_URL}assets/optimized/${asset.file}`;
        await loadImage(url);
        if (disposed) return;
        style.setProperty(asset.property, `url("${url}")`);
        if (asset.file === 'display-handheld-shell-user-6449ca2f55.webp') {
          shellImages.forEach(image => image.setAttribute('href', url));
        }
      }));
    },
    destroy(): void {
      disposed = true;
      artwork.forEach(asset => style.removeProperty(asset.property));
    },
  };
}
