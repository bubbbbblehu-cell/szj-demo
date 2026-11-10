/** Locate connected bright star pixels. Purple/blue nebula pixels stay below this threshold. */
export function extractStarMasks({ data, width, height }) {
  const bright = new Uint8Array(width * height);
  for (let p = 0; p < bright.length; p++) {
    const i = p * 4;
    const light = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    bright[p] = light > 100 && Math.max(data[i], data[i + 1], data[i + 2]) > 150 ? 1 : 0;
  }
  const stars = [];
  for (let seed = 0; seed < bright.length; seed++) {
    if (bright[seed] !== 1) continue;
    const pixels = [seed];
    bright[seed] = 2;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let head = 0; head < pixels.length; head++) {
      const p = pixels[head], x = p % width, y = Math.floor(p / width);
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (bright[next] === 1) { bright[next] = 2; pixels.push(next); }
      }
    }
    const w = maxX - minX + 1, h = maxY - minY + 1;
    // The mask contains only star pixels, never a rectangular patch of the nebula.
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (const p of pixels) {
      const i = p * 4;
      const light = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      const target = ((Math.floor(p / width) - minY) * w + p % width - minX) * 4;
      rgba[target + 3] = Math.round(Math.min(1, (light - 85) / 70) * 255);
    }
    stars.push({ x: minX, y: minY, width: w, height: h, area: pixels.length, rgba });
  }
  return stars.sort((a, b) => b.area - a.area || a.y - b.y || a.x - b.x);
}

/** Same geometry as CSS background-size: cover and percentage background-position. */
export function coverTransform(imageWidth, imageHeight, width, height, positionX = 0.5, positionY = 0.5) {
  const scale = Math.max(width / imageWidth, height / imageHeight);
  return { scale, x: (width - imageWidth * scale) * positionX, y: (height - imageHeight * scale) * positionY };
}
