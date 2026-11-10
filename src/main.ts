import { mountDialogMotion } from './ui/DialogMotion';
import { mountHomeLayout } from './ui/HomeLayout';
import { mountPawCursor } from './ui/PawCursor';
import { t as translateUI, translateDocument } from './i18n';
import { VirtualGamepad } from './ui/VirtualGamepad';
import { SolarSystem } from './solar/SolarSystem';
import { SOLAR_BODIES } from './solar/orbits';
import { PortfolioModal } from './ui/PortfolioModal';
import { PortfolioExperience } from './experience/PortfolioExperience';
import { mountOuterStarfield } from './background/OuterStarfield';
import { LoadingScreen } from './ui/LoadingScreen';
import { loadImage } from './solar/textures';
import './style.css';
import './ui/spaceDesk.css';
import './ui/controlsV03.css';
import './ui/aboutDialog.css';
import './ui/workCases.css';
import './ui/handheld.css';
import './ui/reader.css';
import './i18n/style.css';
import './ui/cursor.css';
import './ui/mobile.css';
import './ui/revision.css';
import './ui/refresh.css';

translateDocument();
const destroyHomeLayout=mountHomeLayout();
const destroyPawCursor=mountPawCursor();
const boot = new LoadingScreen();
let sceneFraction=0,shellCompleted=0;
const updateBoot=()=>boot.setProgress(.05+.75*sceneFraction+.2*shellCompleted/5);
updateBoot(); // The application module has loaded; scene assets are next.
let resolveScene!:()=>void;
const sceneReady=new Promise<void>(resolve=>{resolveScene=resolve;});
const shellReady=Promise.all([
  document.fonts.load('12px "Fusion Pixel"'),
  ...['optimized/dog-cabin-v2-user.webp','optimized/sleep-open-ring.webp','optimized/universe-reference-e55177f834b2.webp','optimized/handheld-shell-user.webp'].map(file=>loadImage(`${import.meta.env.BASE_URL}assets/${file}`)),
].map(promise=>promise.then(()=>{shellCompleted++;updateBoot();})));
void shellReady.catch(()=>boot.fail(translateUI('页面素材加载失败，请重新加载。')));
void Promise.all([sceneReady,shellReady]).then(async()=>{await boot.finish();if(document.body.dataset.boot==='ready'){region.focus({preventScroll:true});experience?.onBootReady();}}).catch(()=>boot.fail(translateUI('页面素材加载失败，请重新加载。')));

const destroyOuterStarfield = mountOuterStarfield();

const region = document.querySelector<HTMLDivElement>('#game')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const status = document.querySelector<HTMLElement>('#flight-status')!;
const labelLayer = document.querySelector<HTMLElement>('#planet-controls')!;
const labels = new Map<string, HTMLButtonElement>();
const navButtons: HTMLButtonElement[] = [];
let returnFocus: HTMLElement = region;
function select(id: string, trigger?: HTMLElement): void { returnFocus = trigger ?? region; solar?.select(id); }
let solar: SolarSystem | undefined;
let experience: PortfolioExperience | undefined;
const modal = new PortfolioModal(returningToDirectory => { solar?.resume(); returnFocus = region; experience?.closed(!returningToDirectory); });

for (const [index, body] of SOLAR_BODIES.entries()) {
  const label = document.createElement('button');
  label.type = 'button'; label.disabled = true; label.hidden = true;
  label.className = 'solar-planet-label';
  label.textContent = window.innerWidth <= 640 ? ['VI', 'KV', 'CG', 'H5', translateUI('平面'), translateUI('创意')][index] : body.category;
  label.setAttribute('aria-label', translateUI(`探索${body.category}，${body.subtitle}`));
  label.style.setProperty('--planet-color', body.color);
  label.addEventListener('click', () => select(body.id, label));
  label.addEventListener('pointerenter', () => solar?.hover(body.id));
  label.addEventListener('pointerleave', () => solar?.hover());
  label.addEventListener('focus', () => solar?.hover(body.id));
  label.addEventListener('blur', () => solar?.hover());
  window.matchMedia('(max-width: 640px)').addEventListener('change', event => { label.textContent = event.matches ? ['VI', 'KV', 'CG', 'H5', translateUI('平面'), translateUI('创意')][index] : body.category; });
  labels.set(body.id, label); labelLayer.append(label);
  const nav = document.createElement('button');
  nav.type = 'button'; nav.disabled = true; nav.className = 'planet-nav-item';
  nav.style.setProperty('--planet-color', body.color);
  nav.setAttribute('aria-label', translateUI(`前往第 ${index + 1} 颗星球，${body.subtitle}`));
  const image = document.createElement('img'); image.src = `${import.meta.env.BASE_URL}assets/solar/${body.file}`; image.alt = '';
  const name = document.createElement('span'); name.textContent = body.category;
  name.dataset.mobileLabel=['VI','KV','CG','H5',translateUI('平面'),translateUI('创意')][index];
  nav.append(image, name); nav.addEventListener('click', () => select(body.id, nav));
  document.querySelector('#planet-nav')!.append(nav); navButtons.push(nav);
}
experience = new PortfolioExperience({
  openCategory: (id, trigger) => { returnFocus = trigger; solar?.openPortfolio(id); },
  roam: () => { solar?.goHome(); region.focus({ preventScroll: true }); },
  celebrate: () => solar?.celebrate(),
});
const destroyDialogMotion=mountDialogMotion();
const compactTags:Record<string,string>={
 'about-panel':translateUI('我'),'exploration-panel':translateUI('探索'),'settings-panel':'⚙',
};
document.querySelectorAll<HTMLButtonElement>('.exploration-bar button').forEach(button=>{
 if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',button.textContent??'');
 button.dataset.mobileLabel=compactTags[button.dataset.panel??'']??button.textContent??'';
});
try {
  solar = new SolarSystem(region, {
    ready: () => { loading.hidden = true; [...labels.values(), ...navButtons].forEach(button => { button.disabled = false; }); experience?.onReady(); resolveScene(); },
    progress: (completed,total) => { sceneFraction=completed/total;updateBoot(); },
    status: message => { status.textContent = message; },
    arrive: project => { modal.open(project,returnFocus.isConnected&&!returnFocus.hidden?returnFocus:region,experience?.readerContext(project)); },
    error: message => { loading.hidden = false; loading.textContent = message; boot.fail(message); },
    dog: point => experience?.dogPosition(point.x,point.y),
    labels: points => points.forEach(point => {
      const label = labels.get(point.id)!;
      label.hidden = !point.visible;
      label.style.left = `${point.x}%`; label.style.top = `${point.y}%`;
      label.style.setProperty('--label-x', `${point.x}%`);
      label.style.setProperty('--label-y', `${point.y}%`);
      label.classList.toggle('is-active', point.active);
      navButtons[SOLAR_BODIES.findIndex(body=>body.id===point.id)]?.classList.toggle('is-active',point.active);
    }),
  });
} catch {
  loading.textContent = translateUI('无法创建 WebGL 3D 画布，请使用支持 WebGL 的桌面浏览器。');
  boot.fail(loading.textContent);
}
document.querySelector('#home-tour-replay')?.addEventListener('click',()=>experience?.startTour());
document.querySelector('.dog-home')?.addEventListener('click',()=>experience?.openAbout());
const gamepad=new VirtualGamepad({move:(source,direction,pressed)=>solar?.setMovement(source,direction,pressed),action:action=>{if(experience?.action(action))return;if(action==='confirm')solar?.interact();else solar?.cancelInteraction();}});
const gamepadPreference=(event:Event)=>gamepad.configure((event as CustomEvent<{enabled:boolean}>).detail.enabled);
window.addEventListener('pixel:gamepad',gamepadPreference);gamepad.configure(experience.gamepadEnabled);
const motionPreference = (event: Event) => solar?.setMotionEnabled((event as CustomEvent<{enabled:boolean}>).detail.enabled);
window.addEventListener('pixel:motion',motionPreference);
solar?.setMotionEnabled(document.body.dataset.motion!=='off');
region.addEventListener('pointerdown', () => { returnFocus = region; });
region.addEventListener('keydown', () => { returnFocus = region; });
document.querySelector('#dog-home-button')!.addEventListener('click', () => solar?.goHome());
document.querySelector('#zoom-in')!.addEventListener('click', () => solar?.zoom(0.82));
document.querySelector('#zoom-out')!.addEventListener('click', () => solar?.zoom(1.22));
document.querySelector('#reset-view')!.addEventListener('click', () => solar?.resetView());
const pause = document.querySelector<HTMLButtonElement>('#pause-orbits')!;
pause.addEventListener('click', () => {
  const paused = solar?.togglePause() ?? false;
  pause.setAttribute('aria-pressed', String(paused));
  pause.setAttribute('aria-label', paused ? translateUI('继续公转') : translateUI('暂停公转'));
  pause.textContent = paused ? '▷' : 'Ⅱ';
  document.querySelector('.retro-console')?.classList.toggle('is-paused', paused);
});
if (import.meta.hot) import.meta.hot.dispose(() => { destroyDialogMotion();destroyHomeLayout();destroyPawCursor();boot.destroy();gamepad.destroy();window.removeEventListener('pixel:gamepad',gamepadPreference);solar?.destroy(); modal.destroy(); experience?.destroy(); destroyOuterStarfield(); window.removeEventListener('pixel:motion',motionPreference); });
