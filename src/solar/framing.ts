import * as THREE from 'three';
import { SOLAR_BODIES, orbitPosition3D } from './orbits';

const direction = new THREE.Vector3(15, 18, 22).normalize();
export const SKY_FRACTION = 0.8;
const samples = SOLAR_BODIES.flatMap(body => Array.from({ length: 80 }, (_, index) => {
  const point = orbitPosition3D({ ...body, phase: index / 80 * Math.PI * 2, speed: 0 }, 0);
  return { point: new THREE.Vector3(point.x, point.y, point.z), radius: body.size * 1.01 };
}));
const cache = new Map<number, THREE.Vector3>();

/** Exact perspective bounds of the current GLB spheres, with room for labels. */
export function fitOverview(aspect: number): THREE.Vector3 {
  const key = Math.round(aspect * 10000) / 10000;
  const cached = cache.get(key);
  if (cached) return cached.clone();
  const camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 300);
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  for (let distance = 24; distance <= 150; distance += 0.5) {
    camera.position.copy(direction).multiplyScalar(distance);
    camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    const fits = samples.every(({ point, radius: maxRadius }) => {
      const view = point.clone().applyMatrix4(camera.matrixWorldInverse), depth = -view.z;
      if (depth <= maxRadius) return false;
      const bounds = (axis:number, scale:number):[number,number] => {
        const spread=maxRadius*Math.sqrt(depth*depth+axis*axis-maxRadius*maxRadius);
        const denominator=(depth*depth-maxRadius*maxRadius)*scale;
        return [(axis*depth-spread)/denominator,(axis*depth+spread)/denominator];
      };
      const x=bounds(view.x,tangent*aspect),y=bounds(view.y,tangent);
      return x[0]>=-0.95&&x[1]<=0.95&&y[0]>=-0.92&&y[1]<=0.88;
    });
    if (fits) {
      if (cache.size > 32) cache.clear();
      cache.set(key, camera.position.clone()); return camera.position.clone();
    }
  }
  return direction.clone().multiplyScalar(150);
}

/** 把目标 CSS 像素高度换算成世界尺寸，使角色远近变化时保持同样可读。 */
export function worldHeightForPixels(pixels: number, depth: number, viewportHeight: number, fov = 44): number {
  return pixels * 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * Math.max(0.1, depth) / Math.max(1, viewportHeight);
}
