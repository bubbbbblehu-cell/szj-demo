import { audioConfig } from './config';
export type SoundEvent='click'|'dialogue'|'discover'|'complete';
export type MusicState='idle'|'loading'|'playing'|'paused'|'suspended'|'error';
export class SpaceAudio {
  private context?:AudioContext;private music?:GainNode;private effects?:GainNode;private source?:AudioBufferSourceNode;
  private active=false;private effectOn=true;private volume=audioConfig.volume;private building?:Promise<AudioBuffer>;private disposed=false;
  private preparing=false;private failed=false;private operation=0;private listeners=new Set<()=>void>();private lastEffect=0;
  private visibility=()=>{
    if(!this.context)return;
    const change=document.hidden||!document.hasFocus()?this.context.suspend():this.active?this.context.resume():undefined;
    void change?.then(()=>this.notify()).catch(()=>this.notify());
  };
  constructor(){window.addEventListener('blur',this.visibility);window.addEventListener('focus',this.visibility);document.addEventListener('visibilitychange',this.visibility);}
  private autoplayArmed=false;
  private autoplayGesture=(event:Event)=>{
    if(event.type==='keydown'){
      const key=event as KeyboardEvent;
      if(key.repeat||key.metaKey||key.ctrlKey||key.altKey||['Shift','Control','Alt','Meta','Tab','Escape'].includes(key.key))return;
    }
    this.armAutoplay(false);
    // The player's own play button already starts music from this gesture.
    if((event.target as Element|null)?.closest?.('.music-play'))return;
    if(!this.active)void this.toggle();
  };
  armAutoplay(enabled:boolean):void{
    if(this.disposed||enabled===this.autoplayArmed)return;
    this.autoplayArmed=enabled;
    for(const type of ['pointerdown','keydown']){
      if(enabled)window.addEventListener(type,this.autoplayGesture,{capture:true});
      else window.removeEventListener(type,this.autoplayGesture,{capture:true});
    }
  }
  get enabled():boolean{return this.active;}
  get playing():boolean{return this.active&&!!this.source&&this.context?.state==='running';}
  get level():number{return this.volume;}
  get state():MusicState{
    if(this.failed)return 'error';if(this.preparing&&this.active)return 'loading';if(this.playing)return 'playing';
    if(this.active)return 'suspended';return this.context?'paused':'idle';
  }
  subscribe(listener:()=>void):()=>void{this.listeners.add(listener);return ()=>this.listeners.delete(listener);}
  private notify():void{if(!this.disposed)this.listeners.forEach(listener=>listener());}
  configure(volume:number,effects:boolean):void{
    this.volume=Math.max(0,Math.min(1,volume));this.effectOn=effects;
    if(this.context&&this.music)this.music.gain.setTargetAtTime(this.active?this.volume:0,this.context.currentTime,.08);
    if(this.context&&this.effects)this.effects.gain.setTargetAtTime(effects?audioConfig.effectVolume:0,this.context.currentTime,.03);
    this.notify();
  }
  async toggle():Promise<boolean>{
    const operation=++this.operation;this.failed=false;
    if(this.active){this.active=false;this.preparing=false;this.configure(this.volume,this.effectOn);return false;}
    this.active=true;this.preparing=!this.source;this.notify();
    try{
      if(!this.context){
        this.context=new AudioContext();this.context.onstatechange=()=>this.notify();
        this.music=this.context.createGain();this.music.gain.value=0;this.music.connect(this.context.destination);
        this.effects=this.context.createGain();this.effects.gain.value=this.effectOn?audioConfig.effectVolume:0;this.effects.connect(this.context.destination);
      }
      // Called directly from the play-button gesture, before awaiting composition.
      await this.context.resume();
      if(operation!==this.operation||this.disposed)return this.playing;
      this.configure(this.volume,this.effectOn);
      if(!this.source){
        this.building??=this.compose();const buffer=await this.building;
        if(operation!==this.operation||this.disposed||!this.active)return this.playing;
        const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(this.music!);source.start();this.source=source;
      }
      this.preparing=false;this.notify();return this.playing;
    }catch{
      if(operation!==this.operation||this.disposed)return false;
      this.active=false;this.preparing=false;this.failed=true;this.building=undefined;this.configure(this.volume,this.effectOn);return false;
    }
  }
  effect(event:SoundEvent):void{if(!this.playing||!this.effectOn||!this.context||!this.effects||document.hidden)return;const now=this.context.currentTime;if(now-this.lastEffect<.07)return;this.lastEffect=now;const notes:Record<SoundEvent,number[]>={click:[440],dialogue:[660],discover:[523.25,659.25,783.99],complete:[523.25,659.25,783.99,1046.5]};notes[event].forEach((frequency,index)=>{const osc=this.context!.createOscillator(),gain=this.context!.createGain(),start=now+index*.11;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(event==='click'?.10:.16,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.18);osc.connect(gain).connect(this.effects!);osc.start(start);osc.stop(start+.2);});}
  private async compose():Promise<AudioBuffer>{
    const duration=audioConfig.duration,rate=22050,total=duration+.5,bars=duration/6;
    const ctx=new OfflineAudioContext(2,rate*total,rate),master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination);
    const chords=[[130.813,164.814,195.998,246.942],[110,130.813,164.814,195.998],[87.307,110,130.813,164.814],[97.999,123.471,146.832,195.998]];
    for(let bar=-1;bar<=bars;bar++){
      const start=bar*6,chord=chords[((bar%4)+4)%4];
      chord.forEach((frequency,index)=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=frequency;
        gain.gain.setValueAtTime(0,Math.max(0,start));gain.gain.linearRampToValueAtTime(.07,Math.max(.01,start+1.8));gain.gain.linearRampToValueAtTime(.0001,Math.max(.02,start+7.8));
        const pan=ctx.createStereoPanner();pan.pan.value=(index-1.5)*.3;osc.connect(gain).connect(pan).connect(master);osc.start(Math.max(0,start));osc.stop(Math.min(total+.1,Math.max(.1,start+8)));
      });
      if(bar>=0&&bar<bars)for(const [index,offset] of [1.5,4.5].entries()){
        const osc=ctx.createOscillator(),gain=ctx.createGain(),at=start+offset;osc.type='sine';osc.frequency.value=chord[(bar+index)%4]*4;
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.065,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+1.3);osc.connect(gain).connect(master);osc.start(at);osc.stop(at+1.4);
      }
    }
    const rendered=await ctx.startRendering(),buffer=ctx.createBuffer(2,rate*duration,rate),overlap=Math.floor(rate*.5);
    for(let channel=0;channel<2;channel++){
      const source=rendered.getChannelData(channel),data=buffer.getChannelData(channel);data.set(source.subarray(0,data.length));
      for(let i=0;i<overlap;i++){const t=i/overlap;data[i]=source[data.length+i]*(1-t)+source[i]*t;}
    }
    return buffer;
  }
  destroy():void{this.armAutoplay(false);this.disposed=true;this.operation++;this.active=false;this.listeners.clear();this.source?.stop();if(this.context){this.context.onstatechange=null;void this.context.close();}window.removeEventListener('blur',this.visibility);window.removeEventListener('focus',this.visibility);document.removeEventListener('visibilitychange',this.visibility);}
}
