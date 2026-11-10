/** Fit the actual console + navigation into the remaining home viewport. */
export function mountHomeLayout():()=>void {
 const shell=document.querySelector<HTMLElement>('.universe-shell')!;
 const console=document.querySelector<HTMLElement>('.retro-console')!;
 const nav=document.querySelector<HTMLElement>('.planet-nav')!;
 let frame=0,disposed=false;
 const fit=()=>{
  frame=0;if(disposed)return;
  const compact=window.matchMedia('(max-width:720px)').matches;
  const style=getComputedStyle(shell),navigation=getComputedStyle(nav);
  const availableHeight=shell.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
  const availableWidth=shell.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  const landscape=window.innerHeight<540&&window.innerWidth>window.innerHeight;
  const extra=nav.offsetHeight+parseFloat(navigation.marginTop)+10;
  const ratio=compact?1076/776:1320/776;
  const width=landscape
   ?Math.max(1,Math.min(availableWidth-(compact?0:128),(availableHeight-38)*ratio+196))
   :Math.max(1,Math.min(1320,availableWidth-(compact?0:208),(availableHeight-extra)*ratio));
  console.style.setProperty('--home-console-width',`${Math.floor(width)}px`);
 };
 const schedule=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(fit);};
 const observer=new ResizeObserver(schedule);observer.observe(shell);observer.observe(nav);
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 void document.fonts.ready.then(schedule);schedule();
 return()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);};
}
