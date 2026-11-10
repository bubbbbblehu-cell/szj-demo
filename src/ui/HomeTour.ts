import { t } from '../i18n';

const KEY='pixel-universe:home-tour:v1';
/** A short, replayable tour anchored to real controls on every screen size. */
export class HomeTour {
 private dialog=document.createElement('dialog');
 private highlight=document.createElement('div');
 private card=document.createElement('section');
 private arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');
 private title=document.createElement('h2');private copy=document.createElement('p');private count=document.createElement('span');
 private next=document.createElement('button');private previous=document.createElement('button');
 private step=0;private restore?:HTMLElement;private abort=new AbortController();
 private steps=[
  {target:'.handheld-screen',title:t('点一颗星球，打开作品'),copy:t('六颗星球对应六类作品。项目内上下滚动阅读，左右滑动或点击箭头切换项目。')},
  {target:'.dog-home',title:t('关于我'),copy:t('戳戳小狗窝，可以查看我的个人介绍、工作经历与联系方式。')},
  {target:'.exploration-summary',title:t('在这里查看探索进度'),copy:t('看完一颗星球的全部项目，即可收集印章。完成提醒关闭后，仍会留在刚才的阅读位置。')},
 ];
 constructor(){
  this.dialog.className='home-tour';this.dialog.setAttribute('aria-labelledby','home-tour-title');this.dialog.setAttribute('aria-describedby','home-tour-copy');
  this.highlight.className='home-tour-highlight';this.highlight.setAttribute('aria-hidden','true');this.arrow.classList.add('home-tour-arrow');this.arrow.setAttribute('aria-hidden','true');
  this.card.className='home-tour-card';this.title.id='home-tour-title';this.copy.id='home-tour-copy';this.count.className='home-tour-count';
  const skip=document.createElement('button');skip.type='button';skip.className='home-tour-skip';skip.textContent=t('跳过引导');skip.addEventListener('click',()=>this.dialog.close());
  const header=document.createElement('div');header.className='home-tour-top';header.append(this.count,skip);
  this.next.type=this.previous.type='button';this.previous.textContent=t('上一步');this.previous.addEventListener('click',()=>{this.step--;this.render();});
  this.next.addEventListener('click',()=>{if(this.step===this.steps.length-1)this.dialog.close();else{this.step++;this.render();}});this.next.dataset.gamepadConfirm='';
  const actions=document.createElement('div');actions.className='home-tour-actions';actions.append(this.previous,this.next);this.card.append(header,this.title,this.copy,actions);this.dialog.append(this.highlight,this.arrow,this.card);document.body.append(this.dialog);
  this.dialog.addEventListener('close',()=>{try{localStorage.setItem(KEY,'done');}catch{/* private browsing */}window.scrollTo({top:this.scrollY,behavior:'instant'});this.restore?.focus({preventScroll:true});});
  this.dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();(event.key==='ArrowRight'?this.next:this.previous).click();}});
  window.addEventListener('resize',()=>this.position(),{signal:this.abort.signal});window.addEventListener('scroll',()=>this.position(),{passive:true,signal:this.abort.signal});
 }
 private scrollY=0;
 get seen():boolean{try{return localStorage.getItem(KEY)==='done';}catch{return false;}}
 start():void{if(this.dialog.open||document.querySelector('dialog[open]'))return;this.restore=document.activeElement instanceof HTMLElement?document.activeElement:undefined;this.scrollY=window.scrollY;this.step=0;this.dialog.showModal();this.render();this.next.focus({preventScroll:true});}
 private render():void{const step=this.steps[this.step];this.title.textContent=step.title;this.copy.textContent=step.copy;this.count.textContent=`${this.step+1} / ${this.steps.length}`;this.previous.disabled=this.step===0;this.next.textContent=this.step===this.steps.length-1?t('开始探索 →'):t('下一步 →');document.querySelector<HTMLElement>(step.target)?.scrollIntoView({block:'center',behavior:'instant'});requestAnimationFrame(()=>this.position());}
 private position():void{
  if(!this.dialog.open)return;const target=document.querySelector<HTMLElement>(this.steps[this.step].target);if(!target)return;const r=target.getBoundingClientRect();
  Object.assign(this.highlight.style,{left:`${r.left-5}px`,top:`${r.top-5}px`,width:`${r.width+10}px`,height:`${r.height+10}px`});
  const width=Math.min(340,innerWidth-32),height=this.card.offsetHeight;const left=Math.max(16,Math.min(innerWidth-width-16,r.left+r.width/2-width/2));
  const below=r.bottom+30+height<innerHeight-12;const top=below?r.bottom+30:Math.max(12,r.top-height-30);
  Object.assign(this.card.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`});
  const x=Math.max(left+20,Math.min(left+width-20,r.left+r.width/2)),start=below?top-2:top+height+2,end=below?r.bottom+7:r.top-7;
  this.arrow.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);this.arrow.innerHTML=`<defs><marker id="tour-arrow-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#d9f0a9" stroke-width="2"/></marker></defs><path d="M${x},${start} L${x},${end}" fill="none" stroke="#d9f0a9" stroke-width="3" marker-end="url(#tour-arrow-head)"/>`;
 }
 destroy():void{this.abort.abort();this.dialog.remove();}
}
