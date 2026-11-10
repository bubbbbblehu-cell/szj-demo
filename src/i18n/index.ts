import translations from './en.json';

export type Language = 'zh' | 'en';
function selectedLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'en' || requested === 'zh') return requested;
  try { return localStorage.getItem('pixel-universe-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; }
}
export const language = selectedLanguage();
const dictionary: Record<string, string> = translations;
const pattern = new RegExp(Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'g');
/** Translate once, including literal portions of interpolated labels and HTML. */
export function t(text: string): string {
  if (language === 'zh') return text;
  return text.replace(pattern, key=>dictionary[key]).replace(/，/g, ', ').replace(/：/g, ': ');
}
export function translateDocument(): void {
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  if (language !== 'en') return;
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.parentElement?.closest('script,style')) nodes.push(node);
  }
  nodes.forEach(node=>{node.data=t(node.data);});
  document.querySelectorAll<HTMLElement>('[aria-label],[title],[alt],meta[name="description"]').forEach(element=>{
    for (const name of ['aria-label','title','alt','content']) {
      const value=element.getAttribute(name); if(value) element.setAttribute(name,t(value));
    }
  });
}
export function createLanguageSwitch(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type='button'; button.className='pixel-button language-switch';
  button.textContent=language==='en'?'中文':'EN';
  button.lang=language==='en'?'zh-CN':'en';
  button.setAttribute('aria-label',language==='en'?'切换到中文版':'Switch to English');
  button.addEventListener('click',()=>{
    const next=language==='en'?'zh':'en';
    try {localStorage.setItem('pixel-universe-language',next);} catch { /* URL remains sufficient. */ }
    const url=new URL(window.location.href);url.searchParams.set('lang',next);window.location.assign(url.href);
  });
  return button;
}
