import { t as translateUI } from '../i18n';
import { chatterConfig, idleDialogues } from './config';
export class ChatterGate {
  private seen=new Set<string>(); private previous?:string; private last=-Infinity; private blockedUntil=0;
  pending?:string;
  block(now:number):void{this.blockedUntil=now+chatterConfig.returnDelay;}
  queue(text:string):void{if(!this.seen.has(text))this.pending=text;}
  take(now:number):string|undefined{if(!this.pending||now<this.blockedUntil||now-this.last<chatterConfig.cooldown)return;const text=this.pending;this.pending=undefined;this.seen.add(text);this.previous=text;this.last=now;return text;}
  unused():string[]{
    let lines=idleDialogues.filter(text=>!this.seen.has(text));
    if(!lines.length){idleDialogues.forEach(text=>this.seen.delete(text));lines=idleDialogues.filter(text=>text!==this.previous);}
    return lines;
  }
}
export class DogChatter {
  private compact=window.matchMedia('(max-width:720px), (max-width:960px) and (max-height:500px) and (pointer:coarse)');
  private gate=new ChatterGate();private bubble=document.createElement('button');private tick:number;private hideTimer?:number;
  private enabled=true;private panel=false;private idleAt=Date.now();private lastCheck=Date.now();
  private nextIdle=chatterConfig.idleMin+Math.random()*(chatterConfig.idleMax-chatterConfig.idleMin);
  private lastInput=()=>{this.idleAt=Date.now();};
  constructor(){this.bubble.type='button';this.bubble.className='dog-bubble';this.bubble.hidden=true;this.bubble.setAttribute('aria-label',translateUI('关闭宇航狗的气泡'));this.bubble.setAttribute('aria-live','polite');this.bubble.addEventListener('click',()=>this.hide());document.querySelector('.scene-frame')!.append(this.bubble);window.addEventListener('pointerdown',this.lastInput,{passive:true});window.addEventListener('keydown',this.lastInput);this.tick=window.setInterval(()=>this.check(),1000);}
  configure(enabled:boolean):void{this.enabled=enabled;if(!enabled){this.hide();this.gate.pending=undefined;}}
  setPanel(open:boolean):void{this.panel=open;this.hide();if(!open)this.gate.block(Date.now());}
  queueRandom():void{const lines=this.gate.unused();if(lines.length)this.gate.queue(lines[Math.floor(Math.random()*lines.length)]);}
  anchor(x:number,y:number):void{const frame=this.bubble.parentElement!;const width=frame.clientWidth,height=frame.clientHeight;const compact=this.compact.matches&&!this.bubble.hidden;const actualWidth=compact?this.bubble.offsetWidth:0;const half=(actualWidth||Math.min(280,width-16))/2;const left=Math.max(half+8,Math.min(width-half-8,x*width));this.bubble.style.left=`${left}px`;this.bubble.style.top=`${Math.max(compact?this.bubble.offsetHeight+8:70,y*height-34)}px`;this.bubble.style.setProperty('--tail-x',`${Math.max(12,Math.min(half*2-12,x*width-left+half))}px`);}
  private check():void{const now=Date.now();if(now-this.lastCheck>5000)this.gate.block(now);this.lastCheck=now;if(!this.enabled||this.panel||document.hidden||document.querySelector('dialog[open]'))return;if(now-this.idleAt>this.nextIdle){this.idleAt=now;this.nextIdle=chatterConfig.idleMin+Math.random()*(chatterConfig.idleMax-chatterConfig.idleMin);if(Math.random()<chatterConfig.idleChance){const lines=this.gate.unused();if(lines.length)this.gate.queue(lines[Math.floor(Math.random()*lines.length)]);}}const text=this.gate.take(now);if(text){this.bubble.textContent=text;this.bubble.setAttribute('aria-label',translateUI(`${text}，点击关闭气泡`));this.bubble.hidden=false;clearTimeout(this.hideTimer);this.hideTimer=window.setTimeout(()=>this.hide(),chatterConfig.visibleDuration);}}
  private hide():void{this.bubble.hidden=true;clearTimeout(this.hideTimer);}
  destroy():void{clearInterval(this.tick);this.hide();this.bubble.remove();window.removeEventListener('pointerdown',this.lastInput);window.removeEventListener('keydown',this.lastInput);}
}
