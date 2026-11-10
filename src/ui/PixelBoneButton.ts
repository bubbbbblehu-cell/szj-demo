export function decorateBoneButton(button:HTMLButtonElement):HTMLButtonElement{button.classList.add('pixel-bone');return button;}
export function PixelBoneButton(text:string,onClick:()=>void,options:{label?:string;selected?:boolean;disabled?:boolean}={}):HTMLButtonElement{
 const button=decorateBoneButton(document.createElement('button'));button.type='button';button.textContent=text;button.disabled=options.disabled??false;
 if(options.label)button.setAttribute('aria-label',options.label);if(options.selected!==undefined)button.setAttribute('aria-pressed',String(options.selected));button.addEventListener('click',onClick);return button;
}
