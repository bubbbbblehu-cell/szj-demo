import { t as translateUI } from '../i18n';
import type { Direction } from '../input/MovementInput';
export type GameAction='confirm'|'back';
type Options={move:(source:string,direction:Direction,pressed:boolean)=>void;action:(action:GameAction)=>void;};
export class VirtualGamepad {
 private home=document.createElement('div');private dpad=document.createElement('div');private actions=document.createElement('div');
 private compact=window.matchMedia('(max-width:720px), (max-width:960px) and (max-height:500px) and (pointer:coarse)');
 private held=new Map<number,{button:HTMLButtonElement;direction:Direction}>();private observer:MutationObserver;private abort=new AbortController();private enabled=true;private parent?:Element;
 constructor(private options:Options){
  this.compact.addEventListener('change',()=>this.sync(),{signal:this.abort.signal});
  this.home.className='virtual-gamepad';this.dpad.className='gamepad-dpad';this.dpad.setAttribute('role','group');this.dpad.setAttribute('aria-label',translateUI('飞行方向键'));
  for(const [direction,glyph,label] of [['up','▲',translateUI('向上飞行')],['left','◀',translateUI('向左飞行')],['right','▶',translateUI('向右飞行')],['down','▼',translateUI('向下飞行')]] as const){
   const button=document.createElement('button');button.type='button';button.className=`dpad-key dpad-${direction}`;button.textContent=glyph;button.setAttribute('aria-label',label);
   button.addEventListener('pointerdown',event=>{if(button.disabled||event.button!==0)return;event.preventDefault();button.setPointerCapture(event.pointerId);this.held.set(event.pointerId,{button,direction});button.classList.add('is-held');this.options.move(`pointer:${event.pointerId}`,direction,true);},{signal:this.abort.signal});
   for(const type of ['pointerup','pointercancel','lostpointercapture'] as const)button.addEventListener(type,event=>this.release(event.pointerId),{signal:this.abort.signal});
   button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();if(event.repeat)return;this.options.move(`hud:${direction}`,direction,true);button.classList.add('is-held');}},{signal:this.abort.signal});
   button.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();this.options.move(`hud:${direction}`,direction,false);button.classList.remove('is-held');}},{signal:this.abort.signal});
   button.addEventListener('blur',()=>{this.options.move(`hud:${direction}`,direction,false);button.classList.remove('is-held');},{signal:this.abort.signal});this.dpad.append(button);
  }
  const center=document.createElement('i');center.className='dpad-center';center.setAttribute('aria-hidden','true');this.dpad.append(center);
  this.actions.className='gamepad-actions';this.actions.setAttribute('role','group');this.actions.setAttribute('aria-label',translateUI('确认与返回'));
  for(const [action,letter,label] of [['back','B',translateUI('B：返回或取消')],['confirm','A',translateUI('A：确认或交互')]] as const){const button=document.createElement('button');button.type='button';button.className=`gamepad-action action-${letter.toLowerCase()}`;button.textContent=letter;button.setAttribute('aria-label',label);button.addEventListener('pointerdown',event=>event.preventDefault(),{signal:this.abort.signal});button.addEventListener('click',()=>this.options.action(action),{signal:this.abort.signal});this.actions.append(button);}
  this.home.append(this.dpad,this.actions);document.querySelector('.retro-console')!.after(this.home);
  this.observer=new MutationObserver(()=>this.sync());this.observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('blur',()=>this.clear(),{signal:this.abort.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();},{signal:this.abort.signal});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.repeat&&!document.querySelector('dialog[open]'))this.options.action('back');},{signal:this.abort.signal});this.sync();
 }
 private release(pointer:number):void{const held=this.held.get(pointer);if(!held)return;this.held.delete(pointer);this.options.move(`pointer:${pointer}`,held.direction,false);if(![...this.held.values()].some(other=>other.button===held.button))held.button.classList.remove('is-held');}
 private clear():void{for(const pointer of [...this.held.keys()])this.release(pointer);for(const direction of ['up','down','left','right'] as const)this.options.move(`hud:${direction}`,direction,false);this.dpad.querySelectorAll('.is-held').forEach(button=>button.classList.remove('is-held'));}
 configure(enabled:boolean):void{this.enabled=enabled;this.home.hidden=!enabled;this.actions.hidden=!enabled;if(!enabled)this.clear();this.sync();}
 private sync():void{
  const visible=this.enabled&&!this.compact.matches;this.home.hidden=!visible;if(!visible)this.clear();
  const dialogs=document.querySelectorAll<HTMLDialogElement>('dialog[open]');const dialog=dialogs[dialogs.length-1];const parent=dialog??this.home;
  if(this.parent!==parent){this.clear();parent.append(this.actions);this.parent=parent;}
  this.dpad.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=!!dialog||!visible);
  if(dialog)this.clear();this.actions.hidden=!visible;
 }
 destroy():void{this.clear();this.observer.disconnect();this.abort.abort();this.actions.remove();this.home.remove();}
}
