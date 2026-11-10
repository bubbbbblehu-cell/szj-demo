import { mediaAsset, mediaKey } from '../media';
import type { PortfolioCase } from '../game/planets';
import { imageVariants } from './imageVariants';

export function imageVariant(src:string,kind:'thumbnail'|'preview'):string {
  return mediaAsset(imageVariants[mediaKey(src)]?.[kind] ?? src);
}
export function caseCover(item:PortfolioCase):string|undefined {
  const images=[...(item.image?[{src:item.image,...item.imageSize}]:[]),...(item.gallery??[])];
  return (images.find(image=>image.width&&image.height&&image.height/image.width>.4)??images[0])?.src;
}
function load(src:string,priority:'high'|'low',signal:AbortSignal):Promise<HTMLImageElement> {
  return new Promise((resolve,reject)=>{
    const image=new Image();image.decoding='async';image.fetchPriority=priority;
    const cleanup=()=>{signal.removeEventListener('abort',abort);image.onload=null;image.onerror=null;};
    const fail=()=>{cleanup();reject(new Error('Image unavailable'));};
    const abort=()=>{cleanup();image.src='';reject(new Error('Image cancelled'));};
    signal.addEventListener('abort',abort,{once:true});
    image.onload=()=>{void image.decode().then(()=>{cleanup();if(!signal.aborted)resolve(image);},fail);};
    image.onerror=fail;
    image.src=src;
  });
}
/** Retains only a few decoded images; HTTP caching handles older pages. */
export class DecodedImageCache {
  private entries=new Map<string,{promise:Promise<HTMLImageElement>;abort:AbortController}>();
  constructor(private limit=6,private loader=load){}
  get(src:string,priority:'high'|'low'='high'):Promise<HTMLImageElement>{
    const cached=this.entries.get(src);
    if(cached){this.entries.delete(src);this.entries.set(src,cached);return cached.promise;}
    const abort=new AbortController(),promise=this.loader(src,priority,abort.signal),entry={promise,abort};this.entries.set(src,entry);
    void promise.catch(()=>{if(this.entries.get(src)===entry)this.entries.delete(src);});
    while(this.entries.size>this.limit){const oldest=this.entries.keys().next().value!;this.entries.get(oldest)!.abort.abort();this.entries.delete(oldest);}
    return promise;
  }
  clear():void{this.entries.forEach(entry=>entry.abort.abort());this.entries.clear();}
}
