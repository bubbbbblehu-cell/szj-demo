import { t as translateUI, createLanguageSwitch } from '../i18n';
import { HomeTour } from '../ui/HomeTour';
import { decorateBoneButton } from '../ui/PixelBoneButton';
import { mountAboutDialog } from '../ui/AboutDialog';
import type { PortfolioPlanet } from '../game/planets';
import type { GameAction } from '../ui/VirtualGamepad';
import { worlds, milestoneDialogues } from './config';
import { ExplorationState } from './ExplorationState';
import { DogChatter } from './DogChatter';
import { SpaceAudio } from './SpaceAudio';
import { loadPreferences, savePreferences } from './Preferences';
import { confirmDialog } from '../input/dialogAction';
import { dialogHeader } from '../ui/dialogHeader';
import { SOLAR_PROJECTS } from '../solar/projects';
import { caseCover, imageVariant } from '../ui/caseImages';
import type { ReaderContext, ReaderEntry } from '../ui/caseNavigation';
type Options={ openCategory:(planet:string,trigger:HTMLElement)=>void; roam:()=>void; celebrate:()=>void; };
export class PortfolioExperience {
  private tour=new HomeTour();
  private state:ExplorationState;
  private audio=new SpaceAudio();
  private chatter=new DogChatter();
  private preferences=loadPreferences();
  private soundButton=document.createElement('button');
  private badgeButton=document.createElement('button');
  private reward=document.createElement('section');
  private settingsDialog=document.createElement('dialog');
  private aboutDialog=document.createElement('dialog');
  private rewardTimer?:number;
  private clickSound=(event:Event)=>{if(event.target instanceof Element&&event.target.closest('button'))this.audio.effect('click');};
  private bar=document.createElement('div');
  private summary=document.createElement('button');
  private cells=document.createElement('span');
  private label=document.createElement('span');
  private percent=document.createElement('span');
  private log=document.createElement('dialog');
  private logTitle=document.createElement('h2');
  private logSummary=document.createElement('p');
  private logGrid=document.createElement('div');
  private toast=document.createElement('div');
  private toastTimer?:number;
  private restore?:HTMLElement;
  private ready=false;
  private unsubscribeAudio?:()=>void;
  private showAbout=()=>{};
  private welcome=document.createElement('dialog');
  private welcomeFinished=false;
  private worldReward=document.createElement('dialog');
  constructor(private options:Options){
    let storage:Storage|undefined;try{storage=window.localStorage;}catch{/* private browsing fallback */}this.state=new ExplorationState(storage);
    this.bar.className='exploration-bar';this.summary.className='pixel-button exploration-summary';this.summary.type='button';
    this.cells.className='pixel-progress';this.cells.setAttribute('role','progressbar');this.cells.setAttribute('aria-label',translateUI('六类作品探索进度'));this.cells.setAttribute('aria-valuemin','0');this.cells.setAttribute('aria-valuemax','6');
    this.percent.className='exploration-percent';this.summary.append(this.label,this.cells,this.percent);this.summary.addEventListener('click',()=>this.openLog());
    this.summary.dataset.panel='exploration-panel';this.bar.append(this.makeAbout(),this.summary);document.querySelector('#experience-dock')!.append(this.bar);
    this.log.id='exploration-panel';this.log.className='pixel-dialog cv-dialog exploration-dialog';this.logTitle.id='exploration-title';this.log.setAttribute('aria-labelledby','exploration-title');
    const header=dialogHeader(translateUI('探索日志'),'exploration-title','SIX WORLDS',()=>this.log.close());header.querySelector('h2')!.replaceWith(this.logTitle);
    this.logGrid.className='passport-grid';this.logSummary.className='log-summary';
    const reset=this.button(translateUI('重置探索记录'),()=>{this.state.resetVisits();this.reward.hidden=true;this.update();this.notify(translateUI('探索记录已重置 · 作品内容保留'));});reset.className+=' pixel-button-secondary';
    const note=document.createElement('p');note.className='log-note';note.textContent=translateUI('六颗星球代表六类作品，可任选顺序浏览。重置仅清除浏览进度。');
    const footer=document.createElement('footer');footer.className='cv-footer log-actions';footer.append(reset);this.log.append(header,this.logSummary,this.logGrid,note,footer);document.body.append(this.log);
    this.log.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))this.restore?.focus({preventScroll:true});this.maybeReward();});
    this.toast.className='pixel-toast';this.toast.hidden=true;this.toast.setAttribute('role','status');this.toast.setAttribute('aria-live','polite');this.toast.setAttribute('popover','manual');document.body.append(this.toast);
    this.makePreferences();this.makeReward();this.makeWelcome();this.makeWorldReward();
    document.addEventListener('click',this.clickSound);
    this.bar.querySelectorAll<HTMLButtonElement>('button').forEach(decorateBoneButton);this.update();this.enable(false);
  }
  private button(label:string,action:()=>void):HTMLButtonElement{const button=document.createElement('button');button.type='button';button.className='pixel-button';button.textContent=label;button.addEventListener('click',action);return button;}
  private enable(value:boolean):void{this.summary.disabled=!value;}
  onReady():void{if(this.ready)return;this.ready=true;this.enable(true);}
  opened(planet:string):void{
    this.chatter.setPanel(true);this.reward.hidden=true;
    const world=worlds.find(world=>world.planet===planet);
    if(world)this.chatter.queueRandom();
  }
  closed(showReward=true):void{this.chatter.setPanel(false);if(showReward)this.maybeReward();}
  get gamepadEnabled():boolean{return this.preferences.gamepad;}
  action(action:GameAction):boolean{
    const dialogs=document.querySelectorAll<HTMLDialogElement>('dialog[open]'),dialog=dialogs[dialogs.length-1];
    if(dialog){if(action==='back'){const cancel=dialog.querySelector<HTMLButtonElement>('[data-gamepad-cancel]');if(cancel)cancel.click();else dialog.close();}else confirmDialog(dialog);return true;}
    if(!this.reward.hidden){this.reward.hidden=true;return true;}return false;
  }
  dogPosition(x:number,y:number):void{this.chatter.anchor(x,y);}
  openAbout():void{this.showAbout();}
  readerContext(project:PortfolioPlanet):ReaderContext{
    return {entries:(project.cases??[project]).map(item=>({item,category:project.category??project.subtitle,planetId:SOLAR_PROJECTS.find(group=>(group.cases??[group]).some(caseItem=>caseItem.id===item.id))?.id})),initialCaseId:project.cases?.[0]?.id??project.id,directoryLabel:translateUI('探索'),onDirectory:()=>this.openLog(),onCaseChanged:entry=>this.opened(entry.planetId??project.id),onCaseRead:entry=>this.readCase(entry),progress:entry=>{const group=SOLAR_PROJECTS.find(group=>group.id===entry.planetId),ids=(group?.cases??[]).map(item=>item.id),world=worlds.find(world=>world.planet===entry.planetId);return {explored:!!world&&this.state.visited(world.id),read:this.state.readCount(entry.planetId??'',ids),total:ids.length,caseRead:this.state.readCount(entry.planetId??'',[entry.item.id])>0};}};
  }
  private readCase(entry:ReaderEntry):void{
    const project=SOLAR_PROJECTS.find(project=>project.id===entry.planetId);if(!project)return;
    const complete=this.state.completeCase(project.id,entry.item.id,(project.cases??[project]).map(item=>item.id));this.update();
    if(complete){const world=worlds.find(world=>world.planet===project.id)!;this.worldReward.querySelector('h2')!.textContent=translateUI(`${world.title} 探索完成！`);this.worldReward.querySelector('.world-completion-stamp')!.textContent=world.stamp;this.worldReward.querySelector('.world-completion-count')!.textContent=`${this.state.count} / 6`;this.audio.effect('complete');this.worldReward.showModal();if(milestoneDialogues[this.state.count])this.chatter.queueRandom();}
  }
  private openLog():void{if(!this.ready)return;this.restore=this.summary;this.logTitle.textContent=translateUI('星际护照 · 探索日志');this.updateLog();this.log.showModal();this.logGrid.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});}
  private updateLog():void{
    this.logSummary.textContent=`EXPLORATION LOG · ${this.state.count} / 6 · ${this.state.percent}%`;
    this.logGrid.replaceChildren(...worlds.map(world=>{const visited=this.state.visited(world.id);const button=this.button('',()=>{this.log.close();this.options.openCategory(world.planet,this.summary);});button.className='passport-world work-case-card';button.dataset.gamepadConfirm='';button.dataset.visited=String(visited);const group=SOLAR_PROJECTS.find(group=>group.id===world.planet),cover=group&&caseCover(group.cases?.[0]??group);if(cover){const image=document.createElement('img');image.src=imageVariant(cover,'thumbnail');image.alt='';image.width=320;image.height=200;image.decoding='async';button.append(image);}const title=document.createElement('strong');title.textContent=world.title;const status=document.createElement('small');status.textContent=visited?translateUI('✓ 已探索'):`${translateUI('未探索')} · ${translateUI(`已阅 ${this.state.readCount(world.planet,group?.cases?.map(item=>item.id)??[])}/${group?.cases?.length??0}`)}`;button.append(title,status);return button;}));
  }
  private update():void{
    this.summary.dataset.mobileCount=`${this.state.count}/6`;this.label.textContent=translateUI(`探索 ${this.state.count}/6`);this.percent.textContent=`${this.state.percent}%`;
    this.cells.setAttribute('aria-valuenow',String(this.state.count));this.cells.setAttribute('aria-valuetext',`${this.state.count} / 6，${this.state.percent}%`);
    if(!this.cells.childElementCount)this.cells.replaceChildren(...worlds.map(()=>document.createElement('i')));
    worlds.forEach((world,index)=>this.cells.children[index].classList.toggle('filled',this.state.visited(world.id)));
    this.summary.setAttribute('aria-label',translateUI(`探索日志，已探索 ${this.state.count} / 6 类作品，${this.state.percent}%`));
    worlds.forEach((world,index)=>{const visited=this.state.visited(world.id);const nav=document.querySelectorAll<HTMLButtonElement>('.planet-nav-item')[index];const label=document.querySelectorAll<HTMLButtonElement>('.solar-planet-label')[index];if(nav){nav.dataset.visited=String(visited);let badge=nav.querySelector('.visit-stamp');if(!badge){badge=document.createElement('span');badge.className='visit-stamp';nav.append(badge);}badge.textContent=visited?translateUI('✓ 已探索'):translateUI('未探索');}label?.classList.toggle('is-visited',visited);});this.updateLog();if(this.badgeButton)this.badgeButton.hidden=this.state.count<6;
  }
  private notify(message:string):void{clearTimeout(this.toastTimer);this.toast.textContent=message;this.toast.hidden=false;try{this.toast.showPopover();}catch{/* ARIA status remains available without popover support */}this.toastTimer=window.setTimeout(()=>{try{this.toast.hidePopover();}catch{/* optional API */}this.toast.hidden=true;},2500);}
  private makeAbout():HTMLButtonElement{
    const dialog=this.aboutDialog,open=mountAboutDialog(dialog);this.showAbout=open;
    const trigger=this.button(translateUI('关于'),open);trigger.setAttribute('aria-haspopup','dialog');trigger.dataset.panel='about-panel';
    dialog.addEventListener('close',()=>trigger.focus({preventScroll:true}));document.body.append(dialog);return trigger;
  }
  private makePreferences():void{
    const tools=document.createElement('div');tools.className='experience-tools';
    this.soundButton=this.button(translateUI('暂停音乐'),()=>{
      this.audio.armAutoplay(false);
      void this.audio.toggle().then(()=>{this.preferences.muted=!this.audio.enabled;this.preferences.musicEnabled=this.audio.enabled;savePreferences(this.preferences);});
    });
    this.soundButton.className='settings-action music-play';
    const settings=this.settingsDialog;settings.id='settings-panel';settings.className='pixel-dialog cv-dialog desk-settings';settings.setAttribute('aria-labelledby','settings-title');
    const settingsButton=this.button(translateUI('设置'),()=>settings.showModal());settingsButton.setAttribute('aria-label',translateUI('宇宙设置'));settingsButton.dataset.panel='settings-panel';
    settings.addEventListener('close',()=>settingsButton.focus({preventScroll:true}));settings.append(dialogHeader(translateUI('宇宙设置'),'settings-title','PREFERENCES',()=>settings.close()));
    const content=document.createElement('div');content.className='settings-content';
    const musicRow=document.createElement('div');musicRow.className='settings-action-row';const musicLabel=document.createElement('span');musicLabel.textContent=translateUI('背景音乐');musicRow.append(musicLabel,this.soundButton);content.append(musicRow);
    const volumeLabel=document.createElement('label');volumeLabel.className='desk-volume';const volumeText=document.createElement('span');volumeText.textContent=translateUI('音乐音量');const output=document.createElement('output');const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='100';volume.setAttribute('aria-label',translateUI('音乐音量'));volume.addEventListener('input',()=>{this.preferences.volume=Number(volume.value)/100;this.applyPreferences();});volumeLabel.append(volumeText,output,volume);content.append(volumeLabel);
    for(const [key,label] of [['effects',translateUI('按钮与提示音')],['chatter',translateUI('宇航狗碎碎念')],['motion',translateUI('环境与角色动效')],['gamepad',translateUI('显示虚拟手柄')]] as const){const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=this.preferences[key];input.addEventListener('change',()=>{this.preferences[key]=input.checked;this.applyPreferences();});row.append(input,document.createTextNode(label));content.append(row);}
    const languageRow=document.createElement('div');languageRow.className='settings-action-row';const languageLabel=document.createElement('span');languageLabel.textContent=translateUI('语言');const languageSwitch=createLanguageSwitch();languageSwitch.className='settings-action';languageRow.append(languageLabel,languageSwitch);content.prepend(languageRow);
    const footer=document.createElement('footer');footer.className='cv-footer';const back=this.button(translateUI('返回宇宙'),()=>settings.close());back.dataset.gamepadConfirm='';back.className='cv-return';footer.append(back);settings.append(content,footer);document.body.append(settings);tools.append(settingsButton);this.bar.append(tools);
    const updateAudio=()=>{this.soundButton.textContent=this.audio.enabled?translateUI('暂停音乐'):translateUI('播放音乐');this.soundButton.setAttribute('aria-pressed',String(this.audio.playing));this.soundButton.setAttribute('aria-label',translateUI(`音乐设置，${this.audio.playing?'播放中':'未播放'}`));volume.value=String(Math.round(this.audio.level*100));output.textContent=`${volume.value}%`;};
    this.unsubscribeAudio=this.audio.subscribe(updateAudio);this.applyPreferences();this.audio.armAutoplay(!this.preferences.muted);updateAudio();
  }
  private applyPreferences():void{savePreferences(this.preferences);this.audio.configure(this.preferences.volume,this.preferences.effects);this.chatter.configure(this.preferences.chatter);document.body.dataset.motion=this.preferences.motion?'on':'off';window.dispatchEvent(new CustomEvent('pixel:gamepad',{detail:{enabled:this.preferences.gamepad}}));window.dispatchEvent(new CustomEvent('pixel:motion',{detail:{enabled:this.preferences.motion}}));}
  private makeReward():void{
    this.reward.className='completion-card';this.reward.hidden=true;this.reward.setAttribute('role','region');this.reward.setAttribute('aria-label',translateUI('宇宙漫游认证'));
    const star=document.createElement('div');star.className='completion-seal';star.textContent='★';
    const emblems=document.createElement('div');emblems.className='completion-emblems';const paw=document.createElement('img');paw.className='completion-paw';paw.src=`${import.meta.env.BASE_URL}assets/ui/pixel-paw-user-cursor.svg`;paw.alt='';paw.width=paw.height=48;paw.setAttribute('aria-hidden','true');emblems.append(star,paw);
    const title=document.createElement('h2');title.textContent=translateUI('宇宙漫游认证');const code=document.createElement('p');code.textContent='6 OF 6 WORLDS DISCOVERED';
    const quote=document.createElement('p');quote.textContent=milestoneDialogues[6];
    const actions=document.createElement('div');actions.append(this.button(translateUI('继续漫游'),()=>{this.reward.hidden=true;document.querySelector<HTMLElement>('#game')?.focus({preventScroll:true});}),this.button(translateUI('回到首页'),()=>{this.reward.hidden=true;this.options.roam();}));
    this.reward.append(emblems,title,code,quote,actions);document.body.append(this.reward);
    this.badgeButton=this.button(translateUI('查看漫游徽章'),()=>{this.log.close();this.reward.hidden=false;});this.log.querySelector('.log-actions')!.append(this.badgeButton);
  }
  startTour():void{this.tour.start();}
  onBootReady():void{this.welcomeFinished=false;if(!this.welcome.open)this.welcome.showModal();}
  private finishWelcome():void{if(this.welcomeFinished)return;this.welcomeFinished=true;this.state.finishIntro();this.welcome.close();}
  private welcomeClosed():void{this.finishWelcome();this.tour.start();}
  private makeWelcome():void{
    this.welcome.className='pixel-dialog cv-dialog exploration-welcome';this.welcome.setAttribute('aria-labelledby','welcome-title');
    const header=dialogHeader(translateUI('欢迎来到我的创意星系'),'welcome-title','SONGZHIJIE SPACE',()=>this.finishWelcome());
    const image=document.createElement('img');image.src='/assets/optimized/portrait-open-ring-transparent.webp';image.alt=translateUI('宇航狗导览员');
    const intro=document.createElement('p');intro.textContent=translateUI('我是宋志杰，专注游戏品牌视觉、KV 创意、交互体验与美术指导。');
    const tip=document.createElement('p');tip.className='welcome-guide';tip.textContent=translateUI('点星球打开作品；项目内上下阅读，左右切换项目。看完一颗星球的全部项目，即可获得探索印章。');
    const start=this.button(translateUI('开始探索 →'),()=>this.finishWelcome());start.dataset.gamepadConfirm='';this.welcome.append(header,image,intro,tip,start);document.body.append(this.welcome);
    this.welcome.addEventListener('close',()=>this.welcomeClosed());
  }
  private makeWorldReward():void{
    this.worldReward.className='pixel-dialog world-completion';this.worldReward.setAttribute('aria-labelledby','world-completion-title');
    const stamp=document.createElement('div');stamp.className='world-completion-stamp';stamp.hidden=true;stamp.setAttribute('aria-hidden','true');
    const title=document.createElement('h2');title.id='world-completion-title';const count=document.createElement('p');count.className='world-completion-count';
    const image=document.createElement('img');image.src='/assets/optimized/portrait-open-ring-transparent.webp';image.alt='';
    const note=document.createElement('p');note.textContent=translateUI('本星球全部项目已阅 · 探索印章已收集');
    const back=this.button(translateUI('继续阅读 →'),()=>this.worldReward.close());back.dataset.gamepadConfirm='';const art=document.createElement('div');art.className='world-completion-art';art.setAttribute('aria-hidden','true');art.innerHTML='<svg class="reward-trophy" viewBox="0 0 80 88" fill="none"><path d="M22 10h36v24c0 15-8 23-18 23S22 49 22 34V10Z" fill="#f5c85e" stroke="#805a54" stroke-width="3"/><path d="M22 17H9v12c0 12 8 17 18 17M58 17h13v12c0 12-8 17-18 17" stroke="#a1776c" stroke-width="5"/><path d="M40 57v15M25 78h30" stroke="#805a54" stroke-width="5"/><path d="m40 22 4 8 9 1-6 7 1 9-8-4-8 4 1-9-6-7 9-1Z" fill="#fff4cf"/><path d="M28 15v20" stroke="#fff4cf" stroke-width="3"/></svg>';art.append(image);this.worldReward.append(stamp,title,art,count,note,back);document.body.append(this.worldReward);
    this.worldReward.addEventListener('close',()=>{const reader=document.querySelector<HTMLDialogElement>('.project-reader[open]');this.chatter.setPanel(!!reader);if(reader)reader.querySelector<HTMLElement>('.project-scroll')?.focus({preventScroll:true});else{this.maybeReward();document.querySelector<HTMLElement>('#game')?.focus({preventScroll:true});}});
  }
  private maybeReward():void{
    if(document.querySelector('dialog[open]')||!this.state.claimReward())return;
    this.reward.hidden=false;this.audio.effect('complete');this.options.celebrate();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&this.preferences.motion){const scene=document.querySelector('.scene-frame')!;scene.classList.add('is-certified');const meteor=document.createElement('i');meteor.className='celebration-meteor';scene.append(meteor);clearTimeout(this.rewardTimer);this.rewardTimer=window.setTimeout(()=>{scene.classList.remove('is-certified');meteor.remove();},2400);}
  }
  destroy():void{this.tour.destroy();clearTimeout(this.toastTimer);clearTimeout(this.rewardTimer);this.unsubscribeAudio?.();this.audio.destroy();this.chatter.destroy();document.removeEventListener('click',this.clickSound);document.querySelector('.celebration-meteor')?.remove();document.querySelector('.is-certified')?.classList.remove('is-certified');this.worldReward.remove();this.welcome.remove();this.reward.remove();this.settingsDialog.remove();this.aboutDialog.remove();this.bar.remove();this.log.remove();this.toast.remove();}
}
