import * as THREE from 'three';
import { pixelTexture } from './textures';

export const PLANET_FRAME_COUNT = 32;
export const PLANET_ROTATION_SECONDS = 16;
const FRAME_SIZE = 128;

/** Start with the supplied still, then upgrade to its animation atlas. */
export class PlanetSpriteStrip {
  readonly texture: THREE.Texture;
  private masks: ImageData[] = [];
  private elapsed = 0;
  private frame = 0;

  constructor(private sprite: THREE.Sprite, image: HTMLImageElement, diameter: number) {
    this.texture = pixelTexture(image);
    this.sprite.material.map = this.texture;
    this.sprite.scale.set(diameter, diameter, 1);
    this.setImage(image);
  }

  setImage(image: HTMLImageElement): void {
    if ((image.width !== FRAME_SIZE * PLANET_FRAME_COUNT && image.width !== FRAME_SIZE) || image.height !== FRAME_SIZE) {
      throw new Error('Invalid planet sprite dimensions');
    }
    const frameCount = image.width / FRAME_SIZE;
    const masks: ImageData[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = FRAME_SIZE;
    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    for (let frame = 0; frame < frameCount; frame++) {
      context.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
      context.drawImage(image, frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, 0, 0, FRAME_SIZE, FRAME_SIZE);
      masks.push(context.getImageData(0, 0, FRAME_SIZE, FRAME_SIZE));
    }

    // Reallocate the GPU storage when switching from 128px to the 4096px atlas.
    this.texture.dispose();
    this.texture.image = image;
    this.texture.repeat.set(1 / frameCount, 1);
    this.texture.offset.x = 0;
    this.texture.needsUpdate = true;
    this.masks = masks;
    this.frame = 0;
    this.sprite.userData.alpha = this.masks[0];
  }

  update(delta: number): number {
    this.elapsed = (this.elapsed + delta) % PLANET_ROTATION_SECONDS;
    const frame = Math.floor(this.elapsed / PLANET_ROTATION_SECONDS * this.masks.length);
    if (frame !== this.frame) {
      this.frame = frame;
      this.texture.offset.x = frame / this.masks.length;
      this.sprite.userData.alpha = this.masks[frame];
    }
    return frame;
  }
}
