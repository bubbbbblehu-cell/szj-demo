import type { PortfolioCase } from '../game/planets';
export type ProjectImage={src:string;alt:string;width?:number;height?:number};
export type MediaGroup={kind:'full'|'applications'|'badges'|'pair'|'portraits'|'guide';images:ProjectImage[]};
export function projectImages(item:PortfolioCase):ProjectImage[]{return [...(item.image?[{src:item.image,alt:item.title,...item.imageSize}]:[]),...(item.gallery??[])];}
export function projectMediaGroups(item:PortfolioCase):MediaGroup[]{
 const images=projectImages(item);
 if(item.id==='vi-myhero25'||item.id==='vi-myhero26')return [{kind:'guide',images}];
 if(item.id==='flat-as'){const portraits=images.filter(image=>/image(?:116|120)\.webp$/.test(image.src));return [{kind:'portraits',images:portraits},...images.filter(image=>!portraits.includes(image)).map(image=>({kind:'full' as const,images:[image]}))];}
 if(item.id==='vi-friend')return [{kind:'full',images}];
 if(item.id==='vi-as')return [{kind:'full',images}];
 if(item.id==='flat-anniversary')return [{kind:'badges',images:images.slice(0,23)},...images.slice(23).map(image=>({kind:'full' as const,images:[image]}))];
 return [{kind:'full',images}];
}
export function adjacentProject(index:number,delta:number,total:number):number{return Math.max(0,Math.min(total-1,index+delta));}
