import { spaceConfig } from './config.js';
import { extractStarMasks, coverTransform } from './source-stars.js';

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const number = (value, fallback, min, max) =>
  Number.isFinite(value) ? clamp(value, min, max) : fallback;

function normalize(options) {
  const c = { ...spaceConfig, ...options };
  c.useOriginalStars = c.useOriginalStars !== false;
  c.starCount = Math.round(number(c.starCount, 42, 0, 300));
  c.twinkleMinDuration = number(c.twinkleMinDuration, 2, 2, 60);
  c.twinkleMaxDuration = number(c.twinkleMaxDuration, 5, c.twinkleMinDuration, 60);
  c.minOpacity = number(c.minOpacity, spaceConfig.minOpacity, 0, 1);
  c.maxOpacity = number(c.maxOpacity, spaceConfig.maxOpacity, c.minOpacity, 1);
  c.starColors = Array.isArray(c.starColors)
    ? c.starColors.filter(color => typeof color === 'string' && CSS.supports('color', color))
    : [];
  if (!c.starColors.length) c.starColors = [...spaceConfig.starColors];
  c.enableNebulaBreathing = c.enableNebulaBreathing === true;
  c.nebulaBreathingDuration = number(c.nebulaBreathingDuration, 24, 15, 30);
  c.nebulaBreathingStrength = number(c.nebulaBreathingStrength, 0.018, 0, 0.035);
  c.enableParallax = c.enableParallax === true;
  c.parallaxMaxOffset = number(c.parallaxMaxOffset, 5, 0, 8);
  return c;
}

function randomGenerator(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mount on a dedicated fixed backdrop containing .space-stars and .space-nebula. */
export function createStarfield(root, options = {}) {
  if (!root) throw new Error('SZJ Space: backdrop element is required.');
  const canvas = root.querySelector('.space-stars');
  const ctx = canvas?.getContext('2d', { alpha: true });
  // The source image remains visible when Canvas 2D is unavailable.
  if (!ctx) return { update() {}, destroy() {}, getState: () => ({ supported: false }) };

  let config = normalize(options);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, dpr = 1, stars = [];
  let sourceMasks = [], sourceWidth = 0, sourceHeight = 0, sourceError = null;
  let transform = { x: 0, y: 0, scale: 1 };
  let raf = 0, lastFrame = 0, lastTick = 0, elapsed = 0, destroyed = false;
  let targetX = 0, targetY = 0, offsetX = 0, offsetY = 0;
  let dprQuery;
  const cleanups = [];

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  }

  function generateStars() {
    const random = randomGenerator(0x535a4a);
    if (config.useOriginalStars) {
      stars = sourceMasks.slice(0, config.starCount).map(mask => ({
        ...mask,
        duration: config.twinkleMinDuration + random() * (config.twinkleMaxDuration - config.twinkleMinDuration),
        phase: random() * TAU,
        sharpness: 1.5 + random() * 1.5,
      }));
      return;
    }
    // starCount is the desktop ceiling. Scale density down on compact screens.
    const density = Math.sqrt((width * height) / (1440 * 900));
    const count = Math.round(config.starCount * clamp(density, 0.35, 1));
    stars = Array.from({ length: count }, () => {
      let x, y, attempts = 0;
      do {
        x = 0.025 + random() * 0.95;
        y = 0.025 + random() * 0.95;
        const center = ((x - 0.53) / 0.28) ** 2 + ((y - 0.51) / 0.29) ** 2 < 1;
        if (!center || random() < 0.12) break;
      } while (++attempts < 24);
      return {
        x, y,
        duration: config.twinkleMinDuration + random() *
          (config.twinkleMaxDuration - config.twinkleMinDuration),
        phase: random() * TAU,
        color: config.starColors[Math.floor(random() * config.starColors.length)],
        cross: random() < 0.32,
        unit: random() < 0.2 ? 3 : 2,
        // Most stars never reach the global maximum; a few can briefly brighten.
        peak: random() < 0.16 ? 0.85 + random() * 0.15 : 0.45 + random() * 0.3,
        sharpness: 1.8 + random() * 1.5,
      };
    });
  }

  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (config.useOriginalStars) {
      // In reduced-motion mode the untouched PNG is displayed in full.
      if (reducedMotion.matches) return;
      ctx.imageSmoothingEnabled = true;
      for (const star of stars) {
        const x = (transform.x + star.x * transform.scale) * dpr;
        const y = (transform.y + star.y * transform.scale) * dpr;
        const w = star.width * transform.scale * dpr;
        const h = star.height * transform.scale * dpr;
        if (x + w < 0 || y + h < 0 || x > canvas.width || y > canvas.height) continue;
        const wave = ((Math.sin(elapsed / star.duration * TAU + star.phase) + 1) / 2) ** star.sharpness;
        const brightness = config.minOpacity + (config.maxOpacity - config.minOpacity) * wave;
        ctx.globalAlpha = 1 - brightness;
        ctx.drawImage(star.sprite, x, y, w, h);
      }
      ctx.globalAlpha = 1;
      return;
    }
    ctx.imageSmoothingEnabled = false;
    for (const star of stars) {
      const wave = reducedMotion.matches ? 0.24 :
        ((Math.sin((elapsed / star.duration) * TAU + star.phase) + 1) / 2) ** star.sharpness;
      const alpha = config.minOpacity +
        (config.maxOpacity - config.minOpacity) * star.peak * wave;
      const x = Math.round((star.x * width + offsetX) * dpr);
      const y = Math.round((star.y * height + offsetY) * dpr);
      const unit = Math.max(1, Math.round(star.unit * dpr));
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, unit, unit);
      if (star.cross) {
        ctx.globalAlpha = alpha * 0.55;
        ctx.fillRect(x - unit, y, unit, unit);
        ctx.fillRect(x + unit, y, unit, unit);
        ctx.fillRect(x, y - unit, unit, unit);
        ctx.fillRect(x, y + unit, unit, unit);
      }
    }
    ctx.globalAlpha = 1;
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTick = 0;
    lastFrame = 0;
  }

  function tick(now) {
    raf = 0;
    if (destroyed || document.hidden || reducedMotion.matches || !stars.length) return;
    if (lastTick) elapsed += (now - lastTick) / 1000;
    lastTick = now;
    if (!lastFrame || now - lastFrame >= 1000 / 30) {
      const parallax = !config.useOriginalStars && config.enableParallax && finePointer.matches;
      offsetX += ((parallax ? targetX : 0) - offsetX) * 0.09;
      offsetY += ((parallax ? targetY : 0) - offsetY) * 0.09;
      paint();
      lastFrame = now;
    }
    raf = requestAnimationFrame(tick);
  }

  function syncMotion() {
    stop();
    const reduce = reducedMotion.matches;
    root.dataset.breathing = String(config.enableNebulaBreathing && !reduce && !document.hidden);
    root.style.setProperty('--nebula-duration', `${config.nebulaBreathingDuration}s`);
    root.style.setProperty('--nebula-brightness', String(1 + config.nebulaBreathingStrength));
    if (reduce || !config.enableParallax || !finePointer.matches) {
      targetX = targetY = offsetX = offsetY = 0;
    }
    paint();
    if (!document.hidden && !reduce && stars.length) raf = requestAnimationFrame(tick);
  }

  function resize() {
    if (destroyed) return;
    const bounds = root.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.imageSmoothingEnabled = false;
    if (sourceWidth) {
      const nebula = root.querySelector('.space-nebula');
      const position = getComputedStyle(nebula).backgroundPosition.split(' ').map(parseFloat);
      transform = coverTransform(sourceWidth, sourceHeight, width, height, position[0] / 100, position[1] / 100);
    }
    generateStars();
    syncMotion();
  }

  function watchDpr() {
    dprQuery?.removeEventListener('change', onDprChange);
    dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener('change', onDprChange);
  }
  function onDprChange() { resize(); watchDpr(); }

  listen(document, 'visibilitychange', syncMotion);
  listen(reducedMotion, 'change', syncMotion);
  listen(finePointer, 'change', syncMotion);
  listen(window, 'resize', resize, { passive: true });
  listen(window, 'pointermove', event => {
    if (config.useOriginalStars || !config.enableParallax || reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    const x = clamp(event.clientX / width, 0, 1) * 2 - 1;
    const y = clamp(event.clientY / height, 0, 1) * 2 - 1;
    const radius = Math.max(1, Math.hypot(x, y));
    targetX = x / radius * config.parallaxMaxOffset;
    targetY = y / radius * config.parallaxMaxOffset;
  }, { passive: true });
  listen(document.documentElement, 'pointerleave', () => { targetX = targetY = 0; });
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  watchDpr();
  resize();

  // Decode the actual supplied PNG once. No guessed coordinates or substitute stars.
  const sourceImage = new Image();
  sourceImage.onload = () => {
    if (destroyed) return;
    try {
      sourceWidth = sourceImage.naturalWidth;
      sourceHeight = sourceImage.naturalHeight;
      const sampler = document.createElement('canvas');
      sampler.width = sourceWidth; sampler.height = sourceHeight;
      const sampleCtx = sampler.getContext('2d', { willReadFrequently: true });
      sampleCtx.drawImage(sourceImage, 0, 0);
      sourceMasks = extractStarMasks(sampleCtx.getImageData(0, 0, sourceWidth, sourceHeight)).map(mask => {
        const sprite = document.createElement('canvas');
        sprite.width = mask.width; sprite.height = mask.height;
        sprite.getContext('2d').putImageData(new ImageData(mask.rgba, mask.width, mask.height), 0, 0);
        const { rgba, ...metadata } = mask;
        return { ...metadata, sprite };
      });
      resize();
    } catch (error) {
      sourceError = String(error);
      console.error('SZJ Space: original star masks could not be loaded.', error);
    }
  };
  sourceImage.onerror = () => { sourceError = 'Background image could not be decoded.'; };
  sourceImage.src = `${import.meta.env.BASE_URL}assets/optimized/space-nebula.webp`;

  return {
    update(changes = {}) {
      if (destroyed) return;
      config = normalize({ ...config, ...changes });
      generateStars();
      syncMotion();
    },
    getState() {
      return {
        supported: true, destroyed, running: Boolean(raf),
        reducedMotion: reducedMotion.matches, hidden: document.hidden,
        starCount: stars.length, width, height, dpr,
        sourceStarCount: sourceMasks.length, sourceError,
        mode: config.useOriginalStars ? 'original' : 'additional',
        config: { ...config, starColors: [...config.starColors] },
      };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      observer.disconnect();
      sourceImage.onload = sourceImage.onerror = null;
      sourceMasks = [];
      dprQuery?.removeEventListener('change', onDprChange);
      cleanups.forEach(cleanup => cleanup());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      delete root.dataset.breathing;
      root.style.removeProperty('--nebula-duration');
      root.style.removeProperty('--nebula-brightness');
    },
  };
}
