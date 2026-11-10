import { t as translateUI } from '../i18n';
export function dialogHeader(title:string,id:string,eyebrow:string,onClose:()=>void):HTMLElement {
  const header=document.createElement('header');header.className='cv-header';
  const mark=document.createElement('span');mark.className='cv-mark';mark.setAttribute('aria-hidden','true');
  mark.append(...Array.from({length:3},()=>document.createElement('i')));
  const copy=document.createElement('div'),label=document.createElement('span'),heading=document.createElement('h2');
  label.className='cv-eyebrow';label.textContent=eyebrow;heading.id=id;heading.textContent=title;copy.append(label,heading);
  const close=document.createElement('button');close.type='button';close.className='cv-close';close.textContent='×';close.setAttribute('aria-label',translateUI(`关闭${title}`));close.addEventListener('click',onClose);
  header.append(mark,copy,close);return header;
}
