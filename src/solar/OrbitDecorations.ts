import * as THREE from 'three';
import { ORBIT_LANES, orbitPosition3D } from './orbits';

/** 小型像素图标，均不参与星球点击或导航。 */
export class OrbitDecorations {
  private clock = 0;
  private textures: THREE.CanvasTexture[] = [];
  private icons: { sprite: THREE.Sprite; radius: number; phase: number; speed: number }[] = [];

  constructor(scene: THREE.Scene) {
    const star = this.texture(false);
    for (const [index, phase] of [0.4, 2.5, 4.6].entries()) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: star, transparent: true, alphaTest: 0.15, opacity: 0.78, depthWrite: false }));
      sprite.scale.setScalar(index === 3 ? 1.05 : 0.52);
      scene.add(sprite);
      this.icons.push({ sprite, radius: index % 2 ? 10.1 : 16.6, phase, speed: index % 2 ? -0.022 : 0.018 });
    }
    this.update(0);
  }

  private texture(galaxy: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 24;
    const ctx = canvas.getContext('2d')!;
    if (galaxy) {
      for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 30; i++) {
        const angle = i * 0.16 + arm * Math.PI, radius = 1 + i * 0.27;
        ctx.fillStyle = i % 3 ? '#b1c4df' : '#bd9cc9';
        ctx.fillRect(Math.round(12 + Math.cos(angle) * radius), Math.round(12 + Math.sin(angle) * radius * 0.55), 2, 2);
      }
      ctx.fillStyle = '#f0d6d8'; ctx.fillRect(10, 10, 4, 4);
    } else {
      ctx.fillStyle = '#99c6cf'; ctx.fillRect(10, 2, 4, 20); ctx.fillRect(2, 10, 20, 4);
      ctx.fillStyle = '#e0e9bd'; ctx.fillRect(8, 8, 8, 8);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;
    this.textures.push(texture); return texture;
  }

  update(delta: number): void {
    this.clock += delta;
    for (const icon of this.icons) {
      const point = orbitPosition3D({ ...ORBIT_LANES[1], radius: icon.radius, phase: icon.phase, speed: icon.speed }, this.clock);
      icon.sprite.position.set(point.x, point.y, point.z);
    }
  }
  destroy(): void { this.icons.forEach(icon => icon.sprite.material.dispose()); this.textures.forEach(texture => texture.dispose()); }
}
