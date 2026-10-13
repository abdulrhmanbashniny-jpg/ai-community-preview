export const API='https://ai-community.srv1924474.hstgr.cloud/api/v1/projects';
export const BASE='/ai-community-preview/';
export const validSlug=s=>typeof s==='string'&&s.length<=200&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
export function safeHTTPS(value){
 if(typeof value!=='string'||!value.startsWith('https://')||/[\s\\\u0000-\u001f\u007f]/.test(value))return null;
 try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}
}
export async function readPublic(filters={},slug=null,transport=fetch){
 const url=new URL(API);
 if(slug!==null){if(!validSlug(slug))throw Error('INVALID_SLUG');url.pathname+='/'+encodeURIComponent(slug);}
 else {
  for(const key of ['search','category']){const v=String(filters[key]??'').trim().slice(0,200);if(v)url.searchParams.set(key,v);}
  if(['free','freemium','paid'].includes(filters.pricing))url.searchParams.set('pricing',filters.pricing);
 }
 const response=await transport(url.href,{method:'GET',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('HTTP_'+response.status);
 const data=await response.json();
 if(slug===null){if(!Array.isArray(data?.items)||data.items.length>100)throw Error('INVALID_RESPONSE');if(data.items.some(p=>!p||p.status!=='published'||!validSlug(p.slug)))throw Error('INVALID_RESPONSE');}
 else if(!data?.item||data.item.status!=='published'||data.item.slug!==slug)throw Error('INVALID_RESPONSE');
 return data;
}
