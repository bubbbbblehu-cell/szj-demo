const remote=(import.meta.env.VITE_MEDIA_BASE_URL??'').replace(/\/+$/,'');
export function mediaKey(src:string):string {
 if(remote&&src.startsWith(remote+'/'))return src.slice(remote.length+1);
 return src.replace(/^\/?media\//,'').replace(/^\//,'');
}
export function mediaAsset(src:string):string {
 if(/^https?:\/\//.test(src))return src;
 const key=mediaKey(src);return (remote?remote+'/':import.meta.env.BASE_URL+'media/')+key;
}
