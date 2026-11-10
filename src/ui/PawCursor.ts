/** A tiny pointer decoration; native mouse events still reach the page directly. */
export function mountPawCursor():()=>void {
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const cursor=document.createElement('div');cursor.className='paw-cursor';cursor.setAttribute('aria-hidden','true');cursor.setAttribute('popover','manual');
 const image=document.createElement('img');image.src=`${import.meta.env.BASE_URL}assets/ui/pixel-paw-user-cursor.svg`;image.alt='';image.width=image.height=32;cursor.append(image);document.body.append(cursor);
 const abort=new AbortController();let visible=false,animation:Animation|undefined;
 const hide=()=>{visible=false;delete document.body.dataset.pawCursor;cursor.hidden=true;try{cursor.hidePopover();}catch{/* No popover support. */}};
 const raise=()=>{if(!visible)return;try{cursor.hidePopover();cursor.showPopover();}catch{const dialogs=document.querySelectorAll('dialog[open]');(dialogs[dialogs.length-1]??document.body).append(cursor);}};
 const move=(event:PointerEvent)=>{
  if(!fine.matches||event.pointerType!=='mouse'){hide();return;}
  const target=event.target as Element|null;
  if(target?.closest('textarea,[contenteditable=true],input:not([type=range]):not([type=checkbox]):not([type=radio]),:disabled,[aria-disabled=true]')){hide();return;}
  cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;
  cursor.dataset.interactive=String(!!target?.closest('a[href],button,[role=button],summary,input[type=range]'));
  if(!visible){visible=true;cursor.hidden=false;raise();document.body.dataset.pawCursor='on';}
 };
 window.addEventListener('pointermove',move,{passive:true,signal:abort.signal});
 window.addEventListener('pointerdown',event=>{
  move(event);if(!visible||reduced.matches||document.body.dataset.motion==='off')return;
  animation?.cancel();animation=image.animate([{transform:'rotate(-8deg) scale(1)'},{transform:'rotate(3deg) scale(.78,.86)'},{transform:'rotate(-8deg) scale(1)'}],{duration:220,easing:'steps(3,end)'});
 },{passive:true,signal:abort.signal});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide();},{signal:abort.signal});
 window.addEventListener('blur',hide,{signal:abort.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();},{signal:abort.signal});
 fine.addEventListener('change',hide,{signal:abort.signal});
 const observer=new MutationObserver(raise);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});hide();
 return ()=>{hide();animation?.cancel();observer.disconnect();abort.abort();cursor.remove();};
}
