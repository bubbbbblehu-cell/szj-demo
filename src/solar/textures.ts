import * as THREE from 'three';

const imageLoads=new Map<string,Promise<HTMLImageElement>>();
/** Share concurrent decodes for art used by HTML, the loader and the 3D scene. */
export function loadImage(url:string):Promise<HTMLImageElement>{
  const cached=imageLoads.get(url);if(cached)return cached;
  const pending=decodeImage(url);imageLoads.set(url,pending);
  void pending.catch(()=>imageLoads.delete(url));return pending;
}
async function decodeImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}
export function pixelTexture(image: HTMLImageElement): THREE.Texture {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/** 将用户的 48px 圆形星球像素采样为球面贴图；保留色板和斑块，不拉伸透明圆盘。 */
export function globeTexture(image: HTMLImageElement): THREE.CanvasTexture {
  const source = document.createElement('canvas');
  source.width = image.width; source.height = image.height;
  const ctx = source.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, source.width, source.height).data;
  const output = document.createElement('canvas');
  output.width = 96; output.height = 48;
  const target = output.getContext('2d')!;
  const data = target.createImageData(output.width, output.height);
  for (let y = 0; y < output.height; y++) for (let x = 0; x < output.width; x++) {
    const latitude = y / (output.height - 1) * Math.PI;
    const longitude = x / output.width * Math.PI * 2;
    const nx = Math.cos(longitude) * Math.sin(latitude), ny = -Math.cos(latitude);
    let sample = 0;
    for (const factor of [0.44, 0.38, 0.3, 0.15, 0]) {
      const sx = Math.max(0, Math.min(image.width - 1, Math.round((0.5 + nx * factor) * (image.width - 1))));
      const sy = Math.max(0, Math.min(image.height - 1, Math.round((0.5 + ny * factor) * (image.height - 1))));
      sample = (sy * image.width + sx) * 4;
      if (pixels[sample + 3] > 100) break;
    }
    const index = (y * output.width + x) * 4;
    data.data[index] = pixels[sample]; data.data[index + 1] = pixels[sample + 1]; data.data[index + 2] = pixels[sample + 2]; data.data[index + 3] = 255;
  }
  target.putImageData(data, 0, 0);
  const texture = new THREE.CanvasTexture(output);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/** Generated UV art is sampled on one coarse pixel lattice; original artwork stays untouched. */
export function forestTexture(image: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d')!; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping; texture.generateMipmaps = false;
  return texture;
}

/** Trim transparent margins for display; preserve every visible source pixel. */
export function illustratedTexture(image: HTMLImageElement): THREE.CanvasTexture {
  const source = document.createElement('canvas'); source.width = image.width; source.height = image.height;
  const ctx = source.getContext('2d')!; ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, source.width, source.height).data;
  let left=source.width, top=source.height, right=0, bottom=0;
  for(let y=0;y<source.height;y++) for(let x=0;x<source.width;x++) if(data[(y*source.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(left>right){left=top=0;right=source.width-1;bottom=source.height-1;}
  const canvas=document.createElement('canvas'); canvas.width=right-left+1;canvas.height=bottom-top+1;
  canvas.getContext('2d')!.drawImage(source,left,top,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;
  return texture;
}
