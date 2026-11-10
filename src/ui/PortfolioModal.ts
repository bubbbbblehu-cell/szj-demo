import { mediaKey } from '../media';
import { t as translateUI } from '../i18n';
import type { PortfolioCase, PortfolioPlanet } from '../game/planets';
import { imageVariant } from './caseImages';
import { imageVariants } from './imageVariants';
import type { ReaderContext, ReaderEntry } from './caseNavigation';
import { projectMediaGroups, adjacentProject, type ProjectImage } from './projectLayout';
import { dialogHeader } from './dialogHeader';

/** One project per page; vertical reading and horizontal project navigation. */
export class PortfolioModal {
 private dialog=document.createElement('dialog');private panel=document.createElement('article');
 private title=document.createElement('h1');private category=document.createElement('p');
 private stage=document.createElement('div');private sidebar=document.createElement('aside');
 private counter=document.createElement('span');private status=document.createElement('span');private progress=document.createElement('span');private endNote=document.createElement('p');private resize:ResizeObserver;
 private back:HTMLButtonElement;private prev:HTMLButtonElement;private next:HTMLButtonElement;private link=document.createElement('a');
 private returnFocus?:HTMLElement;private context?:ReaderContext;private entries:ReaderEntry[]=[];private caseIndex=0;
 private images:HTMLImageElement[]=[];private videos:HTMLVideoElement[]=[];private seenVideos=new Set<HTMLVideoElement>();private seen=new Set<HTMLImageElement>();private reported=false;
 private touch?:{id:number;x:number;y:number};private revision=0;private observer?:IntersectionObserver;
 constructor(onClose:(returningToDirectory:boolean)=>void){
  this.dialog.className='portfolio-modal cv-dialog project-reader';this.dialog.setAttribute('aria-labelledby','project-title');
  this.panel.className='portfolio-panel';this.title.id='project-title';
  const header=dialogHeader(translateUI('作品档案'),'project-reader-heading','PROJECT VIEWER',()=>this.close());
  header.querySelector('h2')!.replaceWith(this.title);this.category.className='cv-eyebrow';header.querySelector('.cv-eyebrow')!.replaceWith(this.category);
  const toolbar=document.createElement('nav');toolbar.className='project-toolbar';toolbar.setAttribute('aria-label',translateUI('切换案例'));
  this.prev=this.button(translateUI('← 上个项目'),()=>this.changeCase(-1));this.next=this.button(translateUI('下个项目 →'),()=>this.changeCase(1));
  this.link.className='project-external';const linkLabel=document.createElement('span'),linkArrow=document.createElement('span');linkLabel.textContent=translateUI('体验原项目');linkArrow.className='project-external-arrow';linkArrow.textContent='↗';linkArrow.setAttribute('aria-hidden','true');this.link.append(linkLabel,linkArrow);this.link.target='_blank';this.link.rel='noopener noreferrer';
  this.progress.className='reader-progress';this.progress.setAttribute('aria-live','polite');toolbar.append(this.prev,this.counter,this.next,this.progress,this.link);
  const body=document.createElement('div');body.className='project-reader-body';this.stage.className='project-scroll';this.stage.tabIndex=0;this.stage.setAttribute('aria-label',translateUI('上下滚动浏览当前项目'));this.sidebar.className='project-description';body.append(this.stage,this.sidebar);
  const footer=document.createElement('footer');footer.className='cv-footer project-reader-footer';this.status.setAttribute('role','status');
  this.back=this.button(translateUI('返回星系 · Esc'),()=>this.close(!!this.context&&this.context.directoryLabel===translateUI('工作案例')));this.back.dataset.gamepadCancel='';footer.append(this.status,this.back);
  this.panel.append(header,toolbar,body,footer);this.dialog.append(this.panel);document.body.append(this.dialog);this.resize=new ResizeObserver(()=>{this.fitImages();this.checkRead();});this.resize.observe(this.stage);
  this.dialog.addEventListener('click',event=>{if(event.target!==this.dialog)return;const rect=this.dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)this.close();});
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  this.dialog.addEventListener('keydown',event=>{
   if(event.altKey||event.ctrlKey||event.metaKey||(event.target instanceof Element&&event.target.matches('input,textarea,select,[contenteditable=true]')))return;
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();this.changeCase(event.key==='ArrowRight'?1:-1);}
   if(event.key==='Backspace'){event.preventDefault();this.close();}
  });
  this.stage.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&event.isPrimary)this.touch={id:event.pointerId,x:event.clientX,y:event.clientY};},{passive:true});
  this.stage.addEventListener('pointerup',event=>{if(!this.touch||this.touch.id!==event.pointerId)return;const dx=event.clientX-this.touch.x,dy=event.clientY-this.touch.y;this.touch=undefined;if(Math.abs(dx)>72&&Math.abs(dy)<40)this.changeCase(dx<0?1:-1);});
  this.stage.addEventListener('pointercancel',()=>{this.touch=undefined;});this.stage.addEventListener('scroll',()=>this.checkRead(),{passive:true});
  this.dialog.addEventListener('close',()=>{this.revision++;this.observer?.disconnect();this.videos.forEach(video=>video.pause());this.touch=undefined;this.stage.replaceChildren();const directory=this.dialog.returnValue==='archive';onClose(directory);if(directory)this.context?.onDirectory();else this.returnFocus?.focus({preventScroll:true});});
 }
 private button(text:string,action:()=>void):HTMLButtonElement{const button=document.createElement('button');button.type='button';button.textContent=text;button.addEventListener('click',action);return button;}
 private close(directory=false):void{this.videos.forEach(video=>video.pause());this.dialog.close(directory?'archive':'universe');}
 open(planet:PortfolioPlanet,returnFocus:HTMLElement,context?:ReaderContext):void{
  this.context=context;this.returnFocus=returnFocus;this.entries=context?.entries??(planet.cases??[planet]).map(item=>({item,category:planet.category??planet.subtitle,planetId:planet.id}));
  this.caseIndex=Math.max(0,this.entries.findIndex(entry=>entry.item.id===context?.initialCaseId));this.dialog.showModal();this.renderCase();this.stage.focus({preventScroll:true});
 }
 private changeCase(delta:number):void{const next=adjacentProject(this.caseIndex,delta,this.entries.length);if(next===this.caseIndex)return;this.caseIndex=next;this.renderCase();this.stage.focus({preventScroll:true});}
 private renderCase():void{
  const revision=++this.revision,entry=this.entries[this.caseIndex];this.observer?.disconnect();this.videos.forEach(video=>video.pause());this.videos=[];this.seenVideos.clear();this.images=[];this.seen.clear();this.reported=false;
  this.back.textContent=this.context?.directoryLabel===translateUI('工作案例')?translateUI('返回工作案例'):translateUI('返回星系 · Esc');
  this.title.textContent=entry.item.title;this.category.textContent=entry.item.categorySuffix?`${entry.category} · ${entry.item.categorySuffix}`:entry.category;this.counter.textContent=`${this.caseIndex+1} / ${this.entries.length}`;
  this.prev.disabled=this.caseIndex===0;this.next.disabled=this.caseIndex===this.entries.length-1;this.next.toggleAttribute('data-gamepad-confirm',!this.next.disabled);
  this.link.hidden=!entry.item.href;if(entry.item.href)this.link.href=entry.item.href;else this.link.removeAttribute('href');
  this.stage.replaceChildren();this.sidebar.replaceChildren();this.stage.scrollTop=0;this.sidebar.scrollTop=0;
  const heading=document.createElement('h2');heading.textContent=entry.item.descriptionLabel??translateUI('项目说明');const intro=document.createElement('p');intro.textContent=entry.item.description;this.sidebar.append(heading,intro);
  for(const section of entry.item.sections??[]){const title=document.createElement('h3'),copy=document.createElement('p');title.textContent=section.title;copy.textContent=section.body;if(section.title)this.sidebar.append(title);this.sidebar.append(copy);}
  const mobile=document.createElement('section');mobile.className='project-description-mobile';const summary=document.createElement('p');summary.textContent=entry.item.description;const mobileHeading=heading.cloneNode(true);mobile.append(mobileHeading,summary);if((entry.item.sections??[]).length){const more=document.createElement('details'),toggle=document.createElement('summary');toggle.textContent=translateUI('查看创意与执行说明');more.append(toggle);[...this.sidebar.children].slice(2).forEach(node=>more.append(node.cloneNode(true)));mobile.append(more);}this.stage.append(mobile);
  if(entry.item.videoPlacement==='before-images')for(const video of entry.item.videos??[])this.stage.append(this.movie(video,revision));
  for(const group of projectMediaGroups(entry.item)){
   const block=document.createElement('section');block.className=`project-media-group media-${group.kind}`;
   group.images.forEach(image=>block.append(this.figure(image,revision,this.images.length)));this.stage.append(block);
  }
  if(entry.item.videoPlacement!=='before-images')for(const video of entry.item.videos??[])this.stage.append(this.movie(video,revision));
  const end=document.createElement('div');end.className='project-end';end.append(this.endNote);
  if(!this.next.disabled)end.append(this.button(translateUI('下个项目 →'),()=>this.changeCase(1)));this.stage.append(end);
  this.context?.onCaseChanged?.(entry);this.fitImages();this.updateLoading();this.updateProgress();
  if(typeof IntersectionObserver!=='undefined'){
   this.observer=new IntersectionObserver(()=>this.checkRead(),{root:this.stage,threshold:[0,1]});[...this.images,...this.videos].forEach(media=>this.observer!.observe(media));
  }
  requestAnimationFrame(()=>{if(revision===this.revision)this.checkRead();});
 }
 private fitImages():void{
  const padding=getComputedStyle(this.stage),height=Math.max(16,this.stage.clientHeight-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom)-16);
  // Size the desktop paper around a full 16:9 frame, instead of leaving wide gutters.
  if(window.matchMedia('(min-width:961px)').matches){
   const panel=getComputedStyle(this.panel),body=getComputedStyle(this.stage.parentElement!),dialog=getComputedStyle(this.dialog);
   const mediaWidth=height*16/9+parseFloat(padding.paddingLeft)+parseFloat(padding.paddingRight)+(this.stage.offsetWidth-this.stage.clientWidth);
   const chromeWidth=this.sidebar.getBoundingClientRect().width+parseFloat(body.columnGap)+parseFloat(panel.paddingLeft)+parseFloat(panel.paddingRight)+parseFloat(dialog.borderLeftWidth)+parseFloat(dialog.borderRightWidth);
   this.dialog.style.setProperty('--reader-dialog-width',`${Math.ceil(mediaWidth+chromeWidth)}px`);
  }else this.dialog.style.removeProperty('--reader-dialog-width');
  this.stage.querySelectorAll<HTMLElement>('.project-media-frame').forEach(frame=>{const ratio=Number(frame.dataset.aspect)||1,width=Math.min(frame.parentElement!.clientWidth,height*ratio);frame.style.width=`${Math.max(1,width)}px`;frame.style.height=`${Math.max(1,width/ratio)}px`;});
 }
 private updateProgress():void{
  const entry=this.entries[this.caseIndex],state=this.context?.progress?.(entry);this.progress.hidden=!state;
  if(state){this.progress.textContent=`${translateUI(state.explored?'✓ 已探索':'未探索')} · ${translateUI('已阅 ')}${state.read}/${state.total}`;this.progress.dataset.explored=String(state.explored);}
  if(this.reported||state?.caseRead)this.status.textContent=translateUI('✓ 本项目已阅');
 }
 private updateLoading():void{
  const loaded=this.images.filter(image=>image.dataset.ready==='true').length,complete=loaded===this.images.length;
  this.stage.setAttribute('aria-busy',String(!complete));
  this.endNote.textContent=complete?translateUI('本项目已到底 · 左右切换下一个项目'):`${translateUI('正在加载清晰图片…')} ${loaded}/${this.images.length}`;
  if(!this.reported)this.status.textContent=complete?translateUI('上下阅读项目 · 左右切换项目'):`${translateUI('正在加载清晰图片…')} ${loaded}/${this.images.length}`;
  this.updateProgress();
 }
 private figure(page:ProjectImage,revision:number,index:number):HTMLElement{
  const figure=document.createElement('figure'),link=document.createElement('a'),image=document.createElement('img'),placeholder=document.createElement('span'),preview=document.createElement('span'),label=document.createElement('span');const variant=imageVariants[mediaKey(page.src)];
  const width=page.width??variant?.width??1440,height=page.height??variant?.height??810;
  figure.dataset.loadState='loading';link.className='project-media-frame project-image-link';link.dataset.aspect=String(width/height);link.style.aspectRatio=`${width} / ${height}`;link.style.width='100%';
  placeholder.className='project-image-placeholder';preview.className='project-image-thumbnail';label.className='project-image-loading';label.textContent=translateUI('正在加载清晰图片…');
  const thumbnail=imageVariant(page.src,'thumbnail');preview.style.backgroundImage=`url("${thumbnail}")`;placeholder.append(preview,label);
  image.alt=page.alt;image.decoding='async';image.loading=index<2?'eager':'lazy';image.fetchPriority=index===0?'high':'auto';image.width=width;image.height=height;
  const retry=this.button(translateUI('图片加载失败 · 点击重试'),()=>{figure.dataset.loadState='loading';label.textContent=translateUI('正在加载清晰图片…');retry.hidden=true;image.src=page.src;void image.decode().then(ready).catch(()=>{});});retry.className='project-image-retry';retry.hidden=true;
  const ready=()=>{if(revision!==this.revision||!image.complete||!image.naturalWidth||image.dataset.ready==='true')return;image.dataset.ready='true';figure.dataset.loadState='ready';placeholder.hidden=true;retry.hidden=true;this.fitImages();this.updateLoading();this.checkRead();};image.addEventListener('load',ready);
  image.addEventListener('error',()=>{if(revision!==this.revision)return;image.dataset.ready='false';figure.dataset.loadState='error';placeholder.hidden=false;label.textContent=translateUI('图片加载失败，可重试或打开原图。');retry.hidden=false;this.updateLoading();});
  // Preview loading never depends on an image's intrinsic size; originals remain opt-in.
  image.src=imageVariant(page.src,'preview');void image.decode().then(ready).catch(()=>{});
  link.href=page.src;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',translateUI('查看清晰原图'));link.append(placeholder,image);figure.append(link,retry);this.images.push(image);return figure;
 }
 private movie(page:NonNullable<PortfolioCase['videos']>[number],revision:number):HTMLElement{
  const figure=document.createElement('figure'),frame=document.createElement('div'),video=document.createElement('video'),status=document.createElement('p'),open=document.createElement('a');figure.className='project-video';frame.className='project-media-frame project-video-frame';frame.dataset.aspect=String(page.width/page.height);frame.style.aspectRatio=`${page.width} / ${page.height}`;frame.style.width='100%';
  video.controls=true;video.playsInline=true;video.preload='none';video.width=page.width;video.height=page.height;video.src=page.src;if(page.poster)video.poster=page.poster;video.setAttribute('aria-label',page.title);
  status.className='project-video-error';status.hidden=true;status.append(document.createTextNode(translateUI('视频暂时无法播放，请打开视频重试。')));open.href=page.src;open.target='_blank';open.rel='noopener noreferrer';open.textContent=translateUI('打开视频');status.append(open);
  video.addEventListener('error',()=>{if(revision===this.revision)status.hidden=false;});frame.append(video);figure.append(frame,status);this.videos.push(video);return figure;
 }
 private checkRead():void{
  if(!this.dialog.open||this.reported||!this.images.length)return;
  // Fit-to-window images count once fully visible and loaded; the footer is not artwork.
  const bounds=this.stage.getBoundingClientRect();for(const image of this.images){const rect=image.getBoundingClientRect();if(image.dataset.ready==='true'&&rect.width>0&&rect.height>0&&rect.top>=bounds.top-1&&rect.bottom<=bounds.bottom+1)this.seen.add(image);}
  for(const video of this.videos){const rect=video.getBoundingClientRect();if(rect.width>0&&rect.height>0&&rect.top>=bounds.top-1&&rect.bottom<=bounds.bottom+1)this.seenVideos.add(video);}
  if(!this.images.every(image=>this.seen.has(image)&&image.dataset.ready==='true'))return;
  if(!this.videos.every(video=>this.seenVideos.has(video)))return;
  this.reported=true;this.status.textContent=translateUI('✓ 本项目已阅');
  this.context?.onCaseRead?.(this.entries[this.caseIndex]);this.updateProgress();
 }
 destroy():void{this.revision++;this.videos.forEach(video=>video.pause());this.resize.disconnect();this.observer?.disconnect();this.dialog.remove();}
}
