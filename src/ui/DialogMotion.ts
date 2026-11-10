/** Keep native modal focus/inert behavior until its CRT closing animation finishes. */
export function mountDialogMotion():()=>void {
 type State={dialog:HTMLDialogElement;nativeClose:HTMLDialogElement['close'];animation?:Animation;closing:boolean;finish?:()=>void;};
 const states=new Map<HTMLDialogElement,State>();
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 const enabled=()=>!reduced.matches&&document.body.dataset.motion!=='off';
 const full={clipPath:'inset(0%)',filter:'brightness(1)',opacity:1};
 const line={clipPath:'inset(calc(50% - 1px) 0%)',filter:'brightness(.05)',opacity:1};
 const dot={clipPath:'inset(calc(50% - 1px) 50%)',filter:'brightness(.05)',opacity:0};
 const cancel=(state:State)=>{state.animation?.cancel();state.animation=undefined;};
 const attach=(dialog:HTMLDialogElement)=>{
  // The tour is a transparent control-positioning overlay, not a screen window.
  if(states.has(dialog)||dialog.classList.contains('home-tour'))return;
  const state:State={dialog,nativeClose:dialog.close,closing:false};states.set(dialog,state);dialog.classList.add('crt-dialog');
  dialog.close=(value?:string)=>{
   if(!dialog.open||state.closing)return;
   cancel(state);state.closing=true;dialog.dataset.crtClosing='true';
   const finish=()=>{
    if(!state.closing)return;
    state.closing=false;state.finish=undefined;cancel(state);delete dialog.dataset.crtClosing;
    state.nativeClose.call(dialog,value);
   };
   state.finish=finish;
   if(!enabled()||typeof dialog.animate!=='function'){finish();return;}
   state.animation=dialog.animate([{...full,offset:0},{...line,offset:.65},{...dot,offset:1}],{duration:260,easing:'ease-in',fill:'forwards'});
   state.animation.onfinish=finish;
  };
 };
 const opened=(state:State)=>{
  cancel(state);if(!enabled()||typeof state.dialog.animate!=='function')return;
  state.animation=state.dialog.animate([{...dot,filter:'brightness(2)',offset:0},{...line,filter:'brightness(2)',offset:.28},{...full,offset:1}],{duration:330,easing:'cubic-bezier(.16,1,.3,1)'});
  state.animation.onfinish=()=>cancel(state);
 };
 const observer=new MutationObserver(records=>{
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach(attach);
  for(const record of records){if(record.type!=='attributes'||record.attributeName!=='open')continue;const state=states.get(record.target as HTMLDialogElement);if(!state)continue;if(state.dialog.open&&!state.closing)opened(state);else if(!state.dialog.open)cancel(state);}
  for(const [dialog,state] of states)if(!dialog.isConnected){cancel(state);dialog.close=state.nativeClose;states.delete(dialog);}
 });
 document.querySelectorAll<HTMLDialogElement>('dialog').forEach(attach);
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
 const onCancel=(event:Event)=>{const dialog=event.target;if(dialog instanceof HTMLDialogElement&&states.has(dialog)){event.preventDefault();dialog.close();}};
 const onMotion=()=>{if(!enabled())for(const state of states.values()){if(state.closing)state.finish?.();else cancel(state);}};
 document.addEventListener('cancel',onCancel,true);window.addEventListener('pixel:motion',onMotion);reduced.addEventListener('change',onMotion);
 return()=>{observer.disconnect();document.removeEventListener('cancel',onCancel,true);window.removeEventListener('pixel:motion',onMotion);reduced.removeEventListener('change',onMotion);for(const state of states.values()){cancel(state);state.dialog.close=state.nativeClose;delete state.dialog.dataset.crtClosing;state.dialog.classList.remove('crt-dialog');}states.clear();};
}
