import { t as translateUI } from '../i18n';
import { MovementInput, keyDirection, flightKeyDirection, type Direction } from '../input/MovementInput';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PortfolioPlanet } from '../game/planets';
import { SOLAR_PROJECTS } from './projects';
import { SOLAR_BODIES, ORBIT_LANES, DOCK_PADDING, orbitPosition3D, quadratic3D, makeFlight, makePointFlight } from './orbits';
import { fitOverview, worldHeightForPixels, SKY_FRACTION } from './framing';
import { loadImage, pixelTexture } from './textures';
import { PlanetSpriteStrip } from './PlanetSpriteStrip';
import { OrbitDecorations } from './OrbitDecorations';

type Body = { spec: typeof SOLAR_BODIES[number]; mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | THREE.Sprite | THREE.Group; armed: boolean; strip: PlanetSpriteStrip };
type Events = {
  ready: () => void;
  progress?: (completed: number, total: number) => void;
  dog?: (point: {x:number;y:number}) => void;
  status: (message: string) => void;
  arrive: (project: PortfolioPlanet) => void;
  error: (message: string) => void;
  labels: (labels: { id: string; x: number; y: number; visible: boolean; active: boolean }[]) => void;
};
type Flight = { from: THREE.Vector3; end: THREE.Vector3; control: THREE.Vector3; elapsed: number; duration: number; target?: Body; direction: THREE.Vector3; autoCamera: boolean };
const BASE = import.meta.env.BASE_URL;
function opaquePlanetHit(hit:THREE.Intersection):boolean {
 const mask=hit.object.userData.alpha as ImageData|undefined;if(!mask||!hit.uv)return true;
 const x=Math.min(mask.width-1,Math.max(0,Math.floor(hit.uv.x*mask.width)));
 const y=Math.min(mask.height-1,Math.max(0,Math.floor((1-hit.uv.y)*mask.height)));
 return mask.data[(y*mask.width+x)*4+3]>20;
}



export class SolarSystem {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(44, 1, 0.1, 300);
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private bodies: Body[] = [];
  private pickables: THREE.Object3D[] = [];
  private textures: THREE.Texture[] = [];
  private dog!: THREE.Sprite;
  private dogMaterial!: THREE.SpriteMaterial;
  private dogTextures!: { front: THREE.Texture; left: THREE.Texture; right: THREE.Texture };
  private dogPosition = new THREE.Vector3(0, 4, 3);
  private velocity = new THREE.Vector3();
  private facing: 'left' | 'right' = 'right';
  private pose = '';
  private stars!: THREE.Points;
  private decorations!: OrbitDecorations;
  private waypoint!: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private selected?: string;
  private hovered?: string;
  private flight?: Flight;
  private resting = true;
  private idleSeconds = 0;
  private modalOpen = false;
  private paused = false;
  private elapsed = 0;
  private clock = 0;
  private certificationTime = 0;
  private lastTime = 0;
  private frame = 0;
  private disposed = false;
  private input = new MovementInput();
  private abort = new AbortController();
  private resizeObserver: ResizeObserver;
  private motionEnabled = true;
  private get reducedMotion():boolean{return this.motion.matches||!this.motionEnabled;}
  setMotionEnabled(enabled:boolean):void{this.motionEnabled=enabled;}
  celebrate():void{if(!this.reducedMotion)this.certificationTime=2.4;}
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private focus?: { position: THREE.Vector3; target: THREE.Vector3 };
  private pointerStart?: { x: number; y: number; id: number; multi: boolean; dragged: boolean };
  private pointers = new Set<number>();
  private raycaster = new THREE.Raycaster();

  constructor(private element: HTMLElement, private events: Events) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x0d1426, 0);
    this.renderer.domElement.setAttribute('aria-label', translateUI('可环绕、缩放与聚焦的三维像素星系'));
    element.append(this.renderer.domElement);
    this.camera.position.copy(this.overviewPosition());
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 120;
    this.controls.minPolarAngle = 0.18;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.zoomSpeed = 0.7;
    this.controls.rotateSpeed = 0.6;
    this.controls.addEventListener('start', () => { this.focus = undefined; if (this.flight) this.flight.autoCamera = false; });
    this.scene.add(new THREE.AmbientLight(0xcac2f0, 1.85));
    const light = new THREE.DirectionalLight(0xffefcf, 2.4);
    light.position.set(-12, 14, 10); this.scene.add(light);
    const fill = new THREE.PointLight(0x639dfd, 22, 35);
    fill.position.set(0, 3, 0); this.scene.add(fill);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(element);
    this.bindInput();
    void this.load().catch(() => this.events.error(translateUI('3D 素材加载失败，请刷新重试。')));
  }

  private async load(): Promise<void> {
    const files = [...SOLAR_BODIES.map(body => `solar/${body.strip}`), 'optimized/portrait-open-ring-transparent.webp', 'optimized/flight-open-ring.webp'];
    let completed=0;
    const report=()=>{completed++;if(!this.disposed)this.events.progress?.(completed,files.length+1);};
    const images = await Promise.all(files.map(file => loadImage(`${BASE}assets/${file}`).then(image=>{report();return image;})));
    if (this.disposed) return;
    SOLAR_BODIES.forEach((spec, index) => {
      const mesh=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,alphaTest:.08,depthWrite:false}));
      // One shared pixel scale preserves the supplied set's consistent pixel density.
      const strip=new PlanetSpriteStrip(mesh,images[index],9);
      this.textures.push(strip.texture);mesh.userData.planetId=spec.id;
      this.scene.add(mesh);this.pickables.push(mesh);
      this.bodies.push({spec,mesh,armed:true,strip});
    });
    for (const spec of ORBIT_LANES) {
      const points = Array.from({ length: 241 }, (_, i) => {
        const point = orbitPosition3D({ ...spec, phase: i / 240 * Math.PI * 2, speed: 0 }, 0);
        return new THREE.Vector3(point.x, point.y, point.z);
      });
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({ color: 0xb2a9d3, transparent: true, opacity: 0.48, dashSize: 0.18, gapSize: 0.16, depthWrite: false }));
      orbit.computeLineDistances(); this.scene.add(orbit);
    }
    this.decorations = new OrbitDecorations(this.scene);
    const offset = SOLAR_BODIES.length;
    this.dogTextures = { front: pixelTexture(images[offset]), left: pixelTexture(images[offset + 1]), right: pixelTexture(images[offset + 1]) };
    this.dogTextures.left.wrapS=THREE.RepeatWrapping;this.dogTextures.left.repeat.x=-1;this.dogTextures.left.offset.x=1;
    this.textures.push(...Object.values(this.dogTextures));
    this.dogMaterial = new THREE.SpriteMaterial({ map: this.dogTextures.front, transparent: true, alphaTest: 0.1, depthWrite: false, depthTest: false });
    this.dog = new THREE.Sprite(this.dogMaterial); this.dog.renderOrder = 20; this.scene.add(this.dog);
    this.waypoint = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 16), new THREE.MeshBasicMaterial({ color: 0xe4ebbc, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthTest: false }));
    this.waypoint.visible = false; this.scene.add(this.waypoint);
    this.makeStars(); this.moveBodies(0); this.resize();
    this.renderer.render(this.scene,this.camera); report();
    this.events.ready(); this.frame = requestAnimationFrame(this.tick);
  }

  private makeStars(): void {
    const positions: number[] = [], colors: number[] = [];
    let seed = 20261103;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 1400; i++) {
      const angle = random() * Math.PI * 2, y = random() * 2 - 1, r = 85 + random() * 50;
      positions.push(Math.sqrt(1 - y * y) * Math.cos(angle) * r, y * r, Math.sqrt(1 - y * y) * Math.sin(angle) * r);
      const light = 0.35 + random() * 0.6; colors.push(light * 0.7, light * 0.84, light);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false }));
    this.scene.add(this.stars);
  }

  private resize(): void {
    const width = this.element.clientWidth, height = this.element.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 500 ? 1.25 : 1.5));
    const oldFit = this.overviewPosition().length();
    // Fit the same scene to the wider handheld, retaining a lower resting area.
    this.camera.setViewOffset(width, height * SKY_FRACTION, 0, 0, width, height);
    this.camera.updateProjectionMatrix();
    if (!this.selected) {
      const offset = this.camera.position.clone().sub(this.controls.target).multiplyScalar(this.overviewPosition().length() / oldFit);
      this.camera.position.copy(this.controls.target).add(offset);
      if (this.focus) this.focus.position.copy(this.overviewPosition());
    }
  }

  private bindInput(): void {
    const canvas = this.renderer.domElement, signal = this.abort.signal;
    canvas.addEventListener('pointerdown', event => {
      this.element.focus({ preventScroll: true });
      this.pointers.add(event.pointerId);
      if (this.pointers.size === 1) this.pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId, multi: false, dragged: false };
      else if (this.pointerStart) this.pointerStart.multi = true;
    }, { signal });
    canvas.addEventListener('pointerup', event => {
      const start = this.pointerStart;
      this.pointers.delete(event.pointerId);
      if (!this.pointers.size) this.pointerStart = undefined;
      if (event.button || this.modalOpen || !start || start.id !== event.pointerId || start.multi || start.dragged || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
      const object = this.hit(event.clientX, event.clientY, event.pointerType === 'touch');
      if (object?.userData.planetId) this.select(object.userData.planetId as string);
      else this.flyToPointer(event.clientX, event.clientY);
    }, { signal });
    canvas.addEventListener('pointercancel', event => { this.pointers.delete(event.pointerId); this.pointerStart = undefined; }, { signal });
    canvas.addEventListener('pointermove', event => {
      if (this.pointerStart?.id === event.pointerId && Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 10) this.pointerStart.dragged = true;
      if (event.buttons || this.modalOpen) return;
      this.hovered = this.hit(event.clientX, event.clientY)?.userData.planetId as string | undefined;
      canvas.style.cursor = this.hovered ? 'pointer' : 'grab';
    }, { signal });
    canvas.addEventListener('pointerleave', () => { this.hovered = undefined; }, { signal });
    canvas.addEventListener('dblclick', event => { if (!this.modalOpen && !this.hit(event.clientX, event.clientY)?.userData.planetId) { this.flight = undefined; this.resetView(); } }, { signal });
    window.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      const editing=event.target instanceof Element&&!!event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"]');
      const direction=flightKeyDirection(event,editing,!!document.querySelector('dialog[open]'));
      if(!direction)return;
      event.preventDefault();this.setMovement(`keyboard:${key}`,direction,true);
    }, { signal });
    window.addEventListener('keyup', event => {const key=event.key.toLowerCase();if(keyDirection[key])this.setMovement(`keyboard:${key}`,keyDirection[key],false);}, { signal });
    window.addEventListener('blur', () => { this.input.clear(); this.velocity.set(0, 0, 0); }, { signal });
  }

  private hit(x: number, y: number, touchSlop = false): THREE.Object3D | undefined {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1), this.camera);
    const direct = this.raycaster.intersectObjects(this.pickables, false).find(opaquePlanetHit)?.object;
    if (direct || !touchSlop) return direct;
    let closest: THREE.Object3D | undefined, best = 28;
    for (const body of this.bodies) {
      const position = body.mesh.position.clone().project(this.camera);
      if (position.z < -1 || position.z > 1) continue;
      const distance = Math.hypot(bounds.left + (position.x + 1) * bounds.width / 2 - x, bounds.top + (1 - position.y) * bounds.height / 2 - y);
      if (distance >= best) continue;
      this.raycaster.setFromCamera(new THREE.Vector2(position.x, position.y), this.camera);
      if (this.raycaster.intersectObjects(this.pickables, false).find(opaquePlanetHit)?.object.userData.planetId !== body.spec.id) continue;
      closest = body.mesh; best = distance;
    }
    return closest;
  }

  hover(id?: string): void { this.hovered = id; }
  private overviewPosition(): THREE.Vector3 { return fitOverview(this.camera.aspect); }
  togglePause(): boolean { this.paused = !this.paused; return this.paused; }
  zoom(factor: number): void {
    this.focus = undefined;
    if (this.flight) this.flight.autoCamera = false;
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, 6, 120));
    this.camera.position.copy(this.controls.target).add(offset);
  }
  resetView(): void {
    if (this.flight) this.flight.autoCamera = false;
    this.focus = { position: this.overviewPosition(), target: new THREE.Vector3() };
    this.selected = undefined;
    this.events.status(translateUI('星系总览 · 拖动环绕，滚轮探索'));
  }

  setMovement(source:string,direction:Direction,pressed:boolean):void{
    if(pressed&&(this.modalOpen||document.querySelector('dialog[open]')))return;
    const wasActive=this.input.active;this.input.set(source,direction,pressed);
    if(pressed){this.flight=undefined;this.resting=false;this.idleSeconds=0;this.focus=undefined;this.selected=undefined;if(!wasActive)this.events.status(translateUI('自由飞行 · 靠近星球即可发现作品'));}
    if(!this.input.active)this.velocity.set(0,0,0);
  }
  interact():void{
    if(this.modalOpen||document.querySelector('dialog[open]'))return;
    const nearby=this.bodies.find(body=>this.dogPosition.distanceTo(body.mesh.position)<=body.spec.size+DOCK_PADDING+1.2);
    if(nearby){this.arrive(nearby);return;}
    const target=this.hovered??this.selected;
    if(target){this.openPortfolio(target);return;}
    this.events.status(translateUI('先选择一颗星球，再按 A 打开作品；B 返回主页。'));
  }
  cancelInteraction():void{
    if(this.modalOpen)return;
    if(this.flight||this.selected||this.focus||!this.resting)this.goHome();
    else this.resetView();
    this.events.status(translateUI('已返回宇宙主页 · 可继续选择星球。'));
  }

  select(id: string): void {
    const body = this.bodies.find(body => body.spec.id === id);
    if (!body || this.modalOpen) return;
    this.input.clear(); this.velocity.set(0, 0, 0); this.resting = false; this.idleSeconds = 0;
    const obstacles = this.bodies.map(item => ({ position: item.mesh.position, radius: item.spec.size * (item.spec.sample ? 1.24 : 1) }));
    const path = makeFlight(this.dogPosition, body.mesh.position, body.spec.size, obstacles);
    if (!path) { this.events.status(translateUI('先离开当前星球一点，再选择新的目的地。')); return; }
    this.selected = id;
    body.armed = true;
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    this.flight = { from: this.dogPosition.clone(), end: new THREE.Vector3(path.end.x, path.end.y, path.end.z), control: new THREE.Vector3(path.control.x, path.control.y, path.control.z), elapsed: 0, duration: this.reducedMotion ? 0.35 : 2.2, target: body, direction, autoCamera: true };
    this.focus = { target: body.mesh.position.clone(), position: body.mesh.position.clone().addScaledVector(direction, body.spec.size * 5 + 9) };
    this.events.status(translateUI(`正在飞往 ${body.spec.name} · 镜头聚焦中…`));
  }

  private flyToPointer(x: number, y: number): void {
    if (!this.dog || this.modalOpen) return;
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1), this.camera);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(new THREE.Vector3()), this.dogPosition);
    const end = this.raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (!end) return;
    end.clampLength(0, 45);
    const nearby = this.bodies.find(body => end.distanceTo(body.mesh.position) < body.spec.size + DOCK_PADDING);
    if (nearby) { this.select(nearby.spec.id); return; }
    if (end.distanceTo(this.dogPosition) < 0.2) return;
    const path = makePointFlight(this.dogPosition, end, this.bodies.map(body => ({ position: body.mesh.position, radius: body.spec.size * (body.spec.sample ? 1.24 : 1) })));
    if (!path) { this.events.status(translateUI('这里太靠近星球，换一个位置试试。')); return; }
    this.input.clear(); this.velocity.set(0, 0, 0); this.resting = false; this.idleSeconds = 0; this.selected = undefined; this.focus = undefined;
    this.flight = { from: this.dogPosition.clone(), end, control: new THREE.Vector3(path.control.x, path.control.y, path.control.z), elapsed: 0, duration: this.reducedMotion ? 0.3 : THREE.MathUtils.clamp(this.dogPosition.distanceTo(end) / 11, 0.45, 1.7), autoCamera: false, direction: new THREE.Vector3() };
    this.events.status(translateUI('正在飞向你点的位置…'));
  }

  goHome(): void {
    if (this.modalOpen) return;
    this.flight = undefined; this.input.clear(); this.velocity.set(0, 0, 0);
    this.resting = true; this.idleSeconds = 0;
    this.resetView();
    this.events.status(translateUI('小狗在窝里休息 · 点星球叫它出发'));
  }

  openPortfolio(id: string): void {
    if (this.modalOpen) return;
    const body = this.bodies.find(body => body.spec.id === id);
    if (!body) return;
    this.flight = undefined; this.focus = undefined;
    this.arrive(body);
  }

  openCollection(project: PortfolioPlanet): void {
    if (this.modalOpen) return;
    this.flight = undefined; this.focus = undefined; this.input.clear(); this.velocity.set(0, 0, 0);
    this.modalOpen = true; this.controls.enabled = false;
    this.events.arrive(project);
  }

  resume(): void {
    this.modalOpen = false; this.controls.enabled = true; this.goHome();
  }
  private arrive(body: Body): void {
    if (this.flight?.autoCamera) this.focus = { target: body.mesh.position.clone(), position: body.mesh.position.clone().addScaledVector(this.flight.direction, body.spec.size * 5 + 9) };
    this.flight = undefined; this.input.clear(); this.velocity.set(0, 0, 0);
    this.resting = false; this.idleSeconds = 0;
    body.armed = false; this.modalOpen = true; this.controls.enabled = false;
    const project = SOLAR_PROJECTS.find(planet => planet.id === body.spec.id)!;
    this.events.status(translateUI(`已抵达 ${body.spec.name}`));
    this.events.arrive(project);
  }

  private moveBodies(dt: number): void {
    const glow=this.reducedMotion?0:Math.sin(Math.PI*Math.max(0,this.certificationTime)/2.4);
    for (const body of this.bodies) {
      const point = orbitPosition3D(body.spec, this.elapsed);
      body.mesh.position.set(point.x, point.y, point.z);
      if (body.mesh instanceof THREE.Sprite) {
        const active = this.hovered === body.spec.id || this.selected === body.spec.id;
        body.mesh.material.color.set(active ? 0xfff2e5 : 0xffffff);
        body.mesh.material.color.multiplyScalar(1+glow*.22);
      } else {
        body.mesh.rotation.y += dt * body.spec.spin;
        if(body.mesh instanceof THREE.Group){body.mesh.traverse(child=>{if(child instanceof THREE.Mesh&&child.material instanceof THREE.MeshStandardMaterial)child.material.emissiveIntensity=glow*.24;});}else body.mesh.material.emissiveIntensity = (this.hovered === body.spec.id || this.selected === body.spec.id ? 0.24 : 0.06)+glow*.24;
      }
    }
  }

  private tick = (time: number): void => {
    this.frame = requestAnimationFrame(this.tick);
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.05) : 0;
    this.lastTime = time;
    if (document.hidden || this.modalOpen) return;
    if(document.querySelector('dialog[open]')){this.input.clear();this.velocity.set(0,0,0);return;}
    this.clock += dt;
    this.certificationTime=Math.max(0,this.certificationTime-dt);
    const animate = !this.paused && !this.reducedMotion && !this.modalOpen && !this.flight;
    if (animate) this.elapsed += dt;
    this.moveBodies(animate ? dt : 0);
    this.decorations.update(animate ? dt : 0);
    if(this.stars?.material instanceof THREE.PointsMaterial)this.stars.material.opacity=this.reducedMotion?.7:.64+Math.sin(this.clock*.8)*.12;
    const before = this.dogPosition.clone();
    if (this.flight) {
      const flight = this.flight;
      flight.elapsed += dt;
      const t = Math.min(1, flight.elapsed / flight.duration), ease = t * t * (3 - 2 * t);
      const point = quadratic3D(flight.from, flight.control, flight.end, ease);
      this.dogPosition.set(point.x, point.y, point.z);
      if (flight.autoCamera && flight.target) {
        const midpoint = this.dogPosition.clone().add(flight.target.mesh.position).multiplyScalar(0.5);
        const distance = Math.max(flight.target.spec.size * 5 + 9, this.dogPosition.distanceTo(flight.target.mesh.position) * 2 + 7);
        this.focus = { target: midpoint, position: midpoint.clone().addScaledVector(flight.direction, distance) };
      }
      if (t >= 1) {
        if (flight.target) this.arrive(flight.target);
        else { this.flight = undefined; this.events.status(translateUI('已到达 · 继续点星空飞行，或点星球探索')); }
      }
    } else if (!this.modalOpen) {
      const {x,y}=this.input.axes;
      const targetVelocity = new THREE.Vector3(x, y, 0).normalize().applyQuaternion(this.camera.quaternion).multiplyScalar(7);
      this.velocity.lerp(targetVelocity, 1 - Math.exp(-15 * dt));
      if (!this.resting) this.dogPosition.addScaledVector(this.velocity, dt).clampLength(0, 40);
      for (const body of this.bodies) {
        const distance = this.dogPosition.distanceTo(body.mesh.position);
        if (distance > body.spec.size + DOCK_PADDING + 1.2) body.armed = true;
        if (!this.resting && distance <= body.spec.size + DOCK_PADDING) {
          const offset = this.dogPosition.clone().sub(body.mesh.position).normalize().multiplyScalar(body.spec.size + DOCK_PADDING + 0.02);
          this.dogPosition.copy(body.mesh.position).add(offset);
          if (body.armed) { this.arrive(body); break; }
        }
      }
    }
    const moving = !!this.flight || this.velocity.lengthSq() > 0.02;
    if (!moving && !this.resting && !this.modalOpen) {
      this.idleSeconds += dt;
      if (this.idleSeconds > 7) this.goHome();
    } else if (moving) this.idleSeconds = 0;
    const oldScreen = before.clone().project(this.camera), newScreen = this.dogPosition.clone().project(this.camera);
    if (moving && Math.abs(newScreen.x - oldScreen.x) > 0.00005) this.facing = newScreen.x < oldScreen.x ? 'left' : 'right';
    const pose = moving ? this.facing : 'front';
    if (pose !== this.pose) {
      this.pose = pose; this.dogMaterial.map = this.dogTextures[pose]; this.dogMaterial.needsUpdate = true;
      if (moving) this.dog.center.set(pose === 'left' ? 0.31 : 0.72, 0.52);
      else this.dog.center.set(.5,.5);
    }
    this.dog.visible=!this.resting;
    this.dog.position.copy(this.dogPosition);
    this.waypoint.visible = !!this.flight && !this.flight.target;
    if (this.waypoint.visible && this.flight) { this.waypoint.position.copy(this.flight.end); this.waypoint.quaternion.copy(this.camera.quaternion); }
    if (this.focus) {
      const blend = this.reducedMotion ? 1 : 1 - Math.exp(-4 * dt);
      this.controls.target.lerp(this.focus.target, blend);
      this.camera.position.lerp(this.focus.position, blend);
      if (this.camera.position.distanceTo(this.focus.position) < 0.015) this.focus = undefined;
    }
    if (moving && !this.flight && !this.modalOpen) {
      const position = this.dogPosition.clone().project(this.camera);
      if (Math.abs(position.x) > 0.8 || Math.abs(position.y) > 0.8) {
        const shift = this.dogPosition.clone().sub(this.controls.target).multiplyScalar(dt * 0.7);
        this.controls.target.add(shift); this.camera.position.add(shift);
      }
    }
    this.controls.target.clampLength(0, 28); this.controls.update(); this.camera.updateMatrixWorld();
    if (this.resting) {
      // A camera-facing resting place stays on top of the landscape at every zoom.
      this.raycaster.setFromCamera(new THREE.Vector2(-0.38, -0.67), this.camera);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(new THREE.Vector3()), this.controls.target);
      this.raycaster.ray.intersectPlane(plane, this.dogPosition);
      this.dog.position.copy(this.dogPosition);
    }
    const depth = -this.dog.position.clone().applyMatrix4(this.camera.matrixWorldInverse).z;
    if(!this.resting&&!this.reducedMotion){
      const amplitude=moving?1.2:3.5;
      const offset=worldHeightForPixels(amplitude,depth,this.element.clientHeight,this.camera.fov)*Math.sin(this.clock*(moving?10:2.1));
      this.dog.position.add(new THREE.Vector3(0,offset,0).applyQuaternion(this.camera.quaternion));
    }
    const screenDog=this.dog.position.clone().project(this.camera);
    this.events.dog?.({x:(screenDog.x+1)/2,y:(1-screenDog.y)/2});
    const pixels = THREE.MathUtils.clamp(this.element.clientWidth * 0.16, 52, 66);
    const height = worldHeightForPixels(this.resting ? pixels * 0.72 : pixels, depth, this.element.clientHeight * SKY_FRACTION, this.camera.fov);
    this.dog.scale.set(height * (moving ? 2172 / 724 : 1), height, 1);
    this.element.closest('.scene-frame')?.classList.toggle('dog-is-home', this.resting);
    for(const body of this.bodies)body.strip.update(animate?dt:0);
    this.renderer.domElement.dataset.planetFrames='32';
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  };

  private updateLabels(): void {
    this.events.labels(this.bodies.map(body => {
      const point = body.mesh.position.clone().project(this.camera);
      this.raycaster.setFromCamera(new THREE.Vector2(point.x, point.y), this.camera);
      const front = this.raycaster.intersectObjects(this.pickables, false).find(opaquePlanetHit)?.object;
      const visible = point.z > -1 && point.z < 1 && Math.abs(point.x) < 1.15 && Math.abs(point.y) < 1.1 && front?.userData.planetId === body.spec.id;
      const up = new THREE.Vector3(0, body.spec.size * (body.spec.sample ? 1.24 : 1), 0).applyQuaternion(this.camera.quaternion);
      const edge = body.mesh.position.clone().add(up).project(this.camera);
      return { id: body.spec.id, x: (point.x + 1) * 50, y: Math.max(5, (1 - edge.y) * 50 - 1), visible, active: this.hovered === body.spec.id || this.selected === body.spec.id };

    }));
  }

  destroy(): void {
    this.disposed = true; cancelAnimationFrame(this.frame); this.abort.abort(); this.resizeObserver.disconnect(); this.controls.dispose();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      }
    });
    this.decorations?.destroy(); this.dogMaterial?.dispose(); this.textures.forEach(texture => texture.dispose());
    this.bodies.forEach(body => { if (body.mesh instanceof THREE.Sprite) body.mesh.material.dispose(); });
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
