import { STORAGE_KEY, worlds, type WorldId } from './config';
type RecordV2={version:2;visited:WorldId[];readCases:Record<string,string[]>;introSeen:boolean;rewardClaimed:boolean};
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
export function readRecord(raw:string|null):RecordV2{
 const empty:RecordV2={version:2,visited:[],readCases:{},introSeen:false,rewardClaimed:false};
 try{const value=JSON.parse(raw??'null');if(!value)return empty;
  // Earlier visits meant entering a planet, not finishing its work. Keep intro state only.
  if(value.version===1)return {...empty,introSeen:value.introSeen===true};
  if(value.version!==2)return empty;
  const readCases:Record<string,string[]>={};
  for(const world of worlds){const ids=value.readCases?.[world.planet];if(Array.isArray(ids))readCases[world.planet]=[...new Set(ids.filter((id:unknown):id is string=>typeof id==='string'))] as string[];}
  return {version:2,visited:worlds.filter(world=>Array.isArray(value.visited)&&value.visited.includes(world.id)).map(world=>world.id),readCases,introSeen:value.introSeen===true,rewardClaimed:value.rewardClaimed===true};
 }catch{return empty;}
}
export class ExplorationState {
 private record:RecordV2;
 constructor(private storage?:StorageLike){let raw=null;try{raw=storage?.getItem(STORAGE_KEY)??null;}catch{/* memory fallback */}this.record=readRecord(raw);}
 get count():number{return this.record.visited.length;}
 get percent():number{return Math.round(this.count/worlds.length*100);}
 get introSeen():boolean{return this.record.introSeen;}
 visited(id:WorldId):boolean{return this.record.visited.includes(id);}
 readCount(planet:string,allowed:string[]):number{return allowed.filter(id=>this.record.readCases[planet]?.includes(id)).length;}
 openPlanet(planet:string):boolean{return worlds.some(world=>world.planet===planet);}
 completeCase(planet:string,caseId:string,allowed:string[]):boolean{
  const world=worlds.find(world=>world.planet===planet);if(!world||!allowed.length||!allowed.includes(caseId))return false;
  const read=this.record.readCases[planet]??=[];if(!read.includes(caseId))read.push(caseId);
  const completed=!this.visited(world.id)&&allowed.every(id=>read.includes(id));
  if(completed)this.record.visited.push(world.id);this.save();return completed;
 }
 finishIntro():void{this.record.introSeen=true;this.save();}
 claimReward():boolean{if(this.count!==worlds.length||this.record.rewardClaimed)return false;this.record.rewardClaimed=true;this.save();return true;}
 resetVisits():void{this.record.visited=[];this.record.readCases={};this.record.rewardClaimed=false;this.save();}
 private save():void{try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(this.record));}catch{/* session remains usable */}}
}
