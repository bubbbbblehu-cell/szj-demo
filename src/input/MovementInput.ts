export type Direction='up'|'down'|'left'|'right';
export const keyDirection:Record<string,Direction>={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
/** Page focus may be on any control after a dialog closes; only editing or a modal blocks flight. */
export function flightKeyDirection(event:Pick<KeyboardEvent,'key'|'altKey'|'ctrlKey'|'metaKey'|'isComposing'|'defaultPrevented'>,editing:boolean,modal:boolean):Direction|undefined{
  if(editing||modal||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
  return keyDirection[event.key.toLowerCase()];
}
/** Each physical key/pointer owns its contribution; releasing one cannot release another. */
export class MovementInput {
  private sources=new Map<string,Direction>();
  set(source:string,direction:Direction,pressed:boolean):void{if(pressed)this.sources.set(source,direction);else this.sources.delete(source);}
  clear():void{this.sources.clear();}
  get axes():{x:number;y:number}{const held=new Set(this.sources.values());return{x:Number(held.has('right'))-Number(held.has('left')),y:Number(held.has('up'))-Number(held.has('down'))};}
  get active():boolean{return this.sources.size>0;}
}
