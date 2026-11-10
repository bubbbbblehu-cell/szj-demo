import { createStarfield } from './vendor/starfield.js';

/** Reuse the supplied backdrop outside the console, without touching the game scene. */
export function mountOuterStarfield(): () => void {
  const root = document.createElement('div');
  root.className = 'outer-starfield'; root.setAttribute('aria-hidden', 'true');
  const nebula = document.createElement('div'); nebula.className = 'space-nebula';
  const canvas = document.createElement('canvas'); canvas.className = 'space-stars';
  root.append(nebula, canvas); document.body.prepend(root);
  let frame = 0, x = 0, y = 0;
  let background: ReturnType<typeof createStarfield> | undefined;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    root.style.setProperty('--outer-x', '0px'); root.style.setProperty('--outer-y', '0px');
  };
  const move = (event: PointerEvent) => {
    if (document.body.dataset.motion==='off' || event.pointerType === 'touch' || motion.matches || !fine.matches || document.hidden) return;
    x = (event.clientX / innerWidth - 0.5) * 8;
    y = (event.clientY / innerHeight - 0.5) * 8;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0; root.style.setProperty('--outer-x', `${x.toFixed(1)}px`); root.style.setProperty('--outer-y', `${y.toFixed(1)}px`);
    });
  };
  const motionPreference=()=>{reset();background?.update({starCount:document.body.dataset.motion==='off'?0:36});};
  window.addEventListener('pixel:motion',motionPreference);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  document.documentElement.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset); fine.addEventListener('change', reset);
  try {
    background = createStarfield(root, {
      useOriginalStars: true, starCount: document.body.dataset.motion==='off'?0:36,
      minOpacity: 0.55, maxOpacity: 1,
      enableNebulaBreathing: true, enableParallax: false,
    });
    root.dataset.ready = 'true';
  } catch { root.dataset.ready = 'static'; }
  return () => {
    reset(); background?.destroy(); root.remove();
    window.removeEventListener('pixel:motion',motionPreference);
    window.removeEventListener('pointermove', move); window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', reset);
    document.documentElement.removeEventListener('pointerleave', reset);
    motion.removeEventListener('change', reset); fine.removeEventListener('change', reset);
  };
}
