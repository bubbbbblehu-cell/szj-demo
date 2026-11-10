import * as THREE from 'three';
import { pixelTexture } from './textures';
export const PLANET_FRAME_COUNT=32;
export const PLANET_ROTATION_SECONDS=16;
/** Sample the supplied atlas without smoothing, recoloring, trimming or crossfades. */
export class PlanetSpriteStrip {
 readonly texture:THREE.Texture;
 private masks:ImageData[]=[];
 private elapsed=0;
 private frame=0;
 constructor(private sprite:THREE.Sprite,image:HTMLImageElement,diameter:number){
  if(image.width!==4096||image.height!==128)throw new Error('Invalid planet sprite strip dimensions');
  this.texture=pixelTexture(image);this.texture.repeat.set(1/PLANET_FRAME_COUNT,1);
  this.sprite.material.map=this.texture;this.sprite.scale.set(diameter,diameter,1);
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const context=canvas.getContext('2d')!;context.imageSmoothingEnabled=false;
  for(let frame=0;frame<PLANET_FRAME_COUNT;frame++){
   context.clearRect(0,0,128,128);context.drawImage(image,frame*128,0,128,128,0,0,128,128);
   this.masks.push(context.getImageData(0,0,128,128));
  }
  this.sprite.userData.alpha=this.masks[0];
 }
 update(delta:number):number{
  this.elapsed=(this.elapsed+delta)%PLANET_ROTATION_SECONDS;
  const frame=Math.floor(this.elapsed/PLANET_ROTATION_SECONDS*PLANET_FRAME_COUNT);
  if(frame!==this.frame){this.frame=frame;this.texture.offset.x=frame/PLANET_FRAME_COUNT;this.sprite.userData.alpha=this.masks[frame];}
  return frame;
 }
}
