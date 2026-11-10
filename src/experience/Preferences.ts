import { PREFERENCES_KEY, audioConfig } from './config';
export type Preferences={volume:number;effects:boolean;chatter:boolean;motion:boolean;muted:boolean;musicEnabled:boolean;gamepad:boolean};
export function parsePreferences(raw:string|null):Preferences{let data:Partial<Preferences>={};try{data=JSON.parse(raw??'null')??{};}catch{/* defaults */}return{volume:typeof data.volume==='number'&&Number.isFinite(data.volume)?Math.max(0,Math.min(1,data.volume)):audioConfig.volume,effects:data.effects!==false,chatter:data.chatter!==false,motion:data.motion!==false,muted:data.musicEnabled===false,musicEnabled:data.musicEnabled!==false,gamepad:data.gamepad!==false};}
export function loadPreferences():Preferences{try{return parsePreferences(localStorage.getItem(PREFERENCES_KEY));}catch{return parsePreferences(null);}}
export function savePreferences(value:Preferences):void{try{localStorage.setItem(PREFERENCES_KEY,JSON.stringify(value));}catch{/* session remains usable */}}
