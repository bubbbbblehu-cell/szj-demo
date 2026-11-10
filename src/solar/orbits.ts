import { t as translateUI } from '../i18n';
export type Vec3 = { x: number; y: number; z: number };
export type OrbitSpec = { radius: number; eccentricity: number; inclination: number; node: number; phase: number; speed: number; elevation?: number; rhythm?: number };
export const DOCK_PADDING = 3.1;
// Three nested ellipses use a shared mean phase so neighbouring planets never catch up.
// A small periodic phase variation gives each lane a gentler, distinct movement rhythm.
export const ORBIT_LANES = [
  { radius: 12.368, eccentricity: 0.05, inclination: -0.05, node: -0.03, elevation: -0.6, speed: 0.024, rhythm: 0.3 },
  { radius: 15.156, eccentricity: 0.07, inclination: 0.10, node: 0, elevation: 0, speed: 0.024, rhythm: 1.1 },
  { radius: 18.188, eccentricity: 0.04, inclination: 0.18, node: 0.03, elevation: 0.6, speed: 0.024, rhythm: 2.0 },
];
export const SOLAR_BODIES = [
  { id: 'project-01', name: 'ISLAND', category: translateUI('品牌定调 / VI'), subtitle: translateUI('风车浮岛 · 品牌定调与 VI'), file: 'pixel-p2/island_still.png', strip: 'pixel-p2/island_strip_32f.png', size: 4.45, color: '#a7c49b', tint: '#ffffff', lane: 1, phase: 0.35, spin: 0.10, sample: true },
  { id: 'project-02', name: 'DUNE', category: translateUI('主视觉 / KV'), subtitle: translateUI('荒漠星 · 主视觉与 KV'), file: 'pixel-p2/desert_still.png', strip: 'pixel-p2/desert_strip_32f.png', size: 4.1, color: '#dca38a', tint: '#ffffff', lane: 0, phase: 0.35 + Math.PI / 3, spin: 0.08, sample: false },
  { id: 'project-03', name: 'FROST', category: translateUI('CG / 美术指导'), subtitle: translateUI('冰晶星 · CG 与美术指导'), file: 'pixel-p2/ice_still.png', strip: 'pixel-p2/ice_strip_32f.png', size: 4.25, color: '#b3bfdc', tint: '#ffffff', lane: 2, phase: 0.35 + Math.PI * 2 / 3, spin: 0.07, sample: false },
  { id: 'project-04', name: 'ARCADE', category: translateUI('H5 / 交互体验'), subtitle: translateUI('苹果手柄 · H5 与交互体验'), file: 'pixel-p2/apple_still.png', strip: 'pixel-p2/apple_strip_32f.png', size: 4.0, color: '#bcacdc', tint: '#cbaeee', lane: 1, phase: 0.35 + Math.PI, spin: 0.09, sample: false },
  { id: 'project-05', name: 'OCEAN', category: translateUI('平面 / 视觉延展'), subtitle: translateUI('海洋星 · 平面与视觉延展'), file: 'pixel-p2/ocean_still.png', strip: 'pixel-p2/ocean_strip_32f.png', size: 4.1, color: '#d8abc2', tint: '#eab6d1', lane: 0, phase: 0.35 + Math.PI * 4 / 3, spin: 0.08, sample: false },
  { id: 'project-06', name: 'PINK', category: translateUI('创意 / 赛事设计'), subtitle: translateUI('粉色星 · 创意与赛事设计'), file: 'pixel-p2/pink_still.png', strip: 'pixel-p2/pink_strip_32f.png', size: 4.0, color: '#a6cbc5', tint: '#b4d8d1', lane: 2, phase: 0.35 + Math.PI * 5 / 3, spin: 0.065, sample: false },
].map(body => ({ ...body, illustrated: body.file.startsWith('illustrated/'), ...ORBIT_LANES[body.lane], size: body.size * 1.03 }));
export function orbitPosition3D(orbit: OrbitSpec, seconds: number): Vec3 {
  const baseAngle = orbit.phase + seconds * orbit.speed;
  const angle = baseAngle + (orbit.rhythm === undefined ? 0 : 0.045 * Math.sin(baseAngle * 2 + orbit.rhythm));
  const x = orbit.radius * (Math.cos(angle) - orbit.eccentricity);
  const z = orbit.radius * Math.sqrt(1 - orbit.eccentricity ** 2) * Math.sin(angle);
  const tiltedZ = z * Math.cos(orbit.inclination);
  return { x: x * Math.cos(orbit.node) - tiltedZ * Math.sin(orbit.node), y: (orbit.elevation ?? 0) + z * Math.sin(orbit.inclination), z: x * Math.sin(orbit.node) + tiltedZ * Math.cos(orbit.node) };
}
export function quadratic3D(a: Vec3, c: Vec3, b: Vec3, t: number): Vec3 {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y, z: u * u * a.z + 2 * u * t * c.z + t * t * b.z };
}
export function distance3D(a: Vec3, b: Vec3): number { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }
type Obstacle = { position: Vec3; radius: number };
function curveControl(from: Vec3, end: Vec3, obstacles: Obstacle[]): Vec3 | undefined {
  // Try direct, lifted and lateral arcs. Layered orbits need lateral clearance too.
  const dx = end.x - from.x, dz = end.z - from.z, length = Math.hypot(dx, dz) || 1;
  for (const lift of [0, 4, 10, 20, -10, 34, -24]) for (const side of [0, 8, -8, 18, -18, 32, -32]) {
    const control = { x: (from.x + end.x) / 2 - dz / length * side, y: (from.y + end.y) / 2 + lift, z: (from.z + end.z) / 2 + dx / length * side };
    let safe = true;
    for (let i = 0; i <= 200 && safe; i++) {
      const point = quadratic3D(from, control, end, i / 200);
      safe = obstacles.every(obstacle => distance3D(point, obstacle.position) >= obstacle.radius + 0.76);
    }
    if (safe) return control;
  }
  return undefined;
}
export function makeFlight(from: Vec3, center: Vec3, radius: number, obstacles: Obstacle[]): { end: Vec3; control: Vec3 } | undefined {
  const preferred = { x: from.x - center.x, y: from.y - center.y + 1.4, z: from.z - center.z };
  const directions = [preferred, {x:0,y:1,z:0}, {x:0,y:-1,z:0}, {x:1,y:0,z:0}, {x:-1,y:0,z:0}, {x:0,y:0,z:1}, {x:0,y:0,z:-1}];
  for (const direction of directions) {
    const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
    const end = { x: center.x + direction.x / length * (radius + DOCK_PADDING), y: center.y + direction.y / length * (radius + DOCK_PADDING), z: center.z + direction.z / length * (radius + DOCK_PADDING) };
    const control = curveControl(from, end, obstacles);
    if (control) return { end, control };
  }
  return undefined;
}
export function makePointFlight(from: Vec3, end: Vec3, obstacles: Obstacle[]): { end: Vec3; control: Vec3 } | undefined {
  const control = curveControl(from, end, obstacles);
  return control ? { end, control } : undefined;
}
