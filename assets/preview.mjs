import {readPublic,BASE,safeHTTPS,validSlug} from './discovery.mjs';
const lang=document.documentElement.lang==='en'?'en':'ar';
const t=(ar,en)=>lang==='ar'?ar:en;
const status=document.querySelector('[data-public-status]');
const results=document.querySelector('[data-public-results]');
const form=document.querySelector('[data-public-filters]');
const retry=document.querySelector('[data-public-retry]');
const detail=Boolean(document.querySelector('[data-public-detail]'));
const slug=new URL(location.href).searchParams.get('slug');
let revision=0;
const localized=(p,f)=>p[f+'_'+lang]||p[f+'_ar']||p[f+'_en']||'';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;}
function price(p){return ({free:t('مجاني','Free'),freemium:t('مجاني جزئيًا','Freemium'),paid:t('مدفوع','Paid')})[p]||t('السعر غير محدد','Pricing not supplied');}
function row(p,i){
 const article=el('article',undefined,'project-row');article.append(el('span',String(i+1).padStart(2,'0')+' /','ordinal'));
 const name=el('div',undefined,'project-name');name.append(el('small',p.category||''));const h=el('h3');const link=el('a',localized(p,'name'));link.href=BASE+lang+'/product/?slug='+encodeURIComponent(p.slug);h.append(link);name.append(h);article.append(name,el('p',localized(p,'summary')),el('span',price(p.pricing),'badge'));return article;
}
function showDetail(p){
 const header=el('header',undefined,'product-header');const story=el('div');story.append(el('h2',localized(p,'name')),el('p',localized(p,'summary'),'lead'),el('span',price(p.pricing),'badge'),el('p',p.category||''));header.append(story);
 const aside=el('aside',undefined,'launch-panel');const url=safeHTTPS(p.demo_url);if(url){const a=el('a',t('جرّب المنتج ↗','Try the product ↗'),'button primary');a.href=url;a.target='_blank';a.rel='noopener noreferrer';aside.append(a);}else aside.append(el('p',t('لم يضف الناشر رابط تجربة آمنًا.','The publisher has not supplied a safe demo URL.')));
 aside.append(el('p',t('يفتح الموقع الخارجي للناشر؛ السعر ليس رسمًا للمنصة.','Opens the external publisher website; pricing is not a platform fee.')));header.append(aside);
 results.append(header,el('h2',t('ماذا يقدم هذا المنتج؟','What does this product do?')),el('p',localized(p,'description'),'prose'));
 // Do not load publisher covers: external image requests can send cookies even without a referrer.
 document.title=String(localized(p,'name'))+' | '+t('مجتمع الذكاء الصناعي','AI Community');
}
if(detail&&validSlug(slug)){
 for(const a of document.querySelectorAll('a[hreflang]'))a.href+= '?slug='+encodeURIComponent(slug);
 const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href+='?slug='+encodeURIComponent(slug);
 for(const a of document.querySelectorAll('link[rel="alternate"]'))a.href+='?slug='+encodeURIComponent(slug);
}
if(form){
 const params=new URL(location.href).searchParams;
 for(const key of ['search','category','pricing']){const field=form.elements.namedItem(key);const value=(params.get(key)||'').trim().slice(0,200);if(key==='category'&&value){field.append(new Option(value,value));}field.value=value;}
 form.addEventListener('submit',e=>{e.preventDefault();load();});
}
async function load(){
 const current=++revision;results.replaceChildren();retry.hidden=true;status.textContent=t('جارٍ طلب البيانات العامة…','Requesting public data…');status.dataset.state='loading';
 const filters=form?Object.fromEntries(new FormData(form)):{};
 try{
  if(detail&&!validSlug(slug))throw Error('INVALID_SLUG');
  const data=await readPublic(filters,detail?slug:null);if(current!==revision)return;
  if(detail)showDetail(data.item);
  else{
   data.items.forEach((p,i)=>results.append(row(p,i)));
   if(!data.items.length)results.append(el('p',t('لا توجد منتجات مطابقة. لا نضيف نتائج وهمية.','No matching products. No invented results are added.'),'empty'));
   const categories=form.elements.namedItem('category');for(const p of data.items){const c=p.category;if(typeof c==='string'&&c.length<=200&&![...categories.options].some(o=>o.value===c))categories.append(new Option(c,c));}
  }
  status.dataset.state='connected';status.textContent=t('تم جلب البيانات العامة من Hostinger.','Public data retrieved from Hostinger.')+(detail?'':t(' عدد النتائج المسترجعة: ',' Retrieved results: ')+data.items.length+t(' (الحد الأقصى 100).',' (maximum 100).'));
 }catch(error){if(current!==revision)return;status.dataset.state='error';const code=/^(HTTP_\d{3}|INVALID_SLUG|INVALID_RESPONSE)$/.test(error.message)?error.message:'NETWORK_TLS_CORS';status.textContent= t('تعذر جلب البيانات العامة؛ لم يتأكد الاتصال. تحقق من الخدمة وشهادة HTTPS وCORS ثم أعد المحاولة. ','Public data could not be retrieved; connection not confirmed. Check the service, HTTPS certificate and CORS, then retry. ')+code;retry.hidden=false;}
}
if(status&&results){retry.addEventListener('click',load);load();}
