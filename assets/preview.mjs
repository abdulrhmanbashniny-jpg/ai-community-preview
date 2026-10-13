// Local empty-index feedback only. No network, storage, authentication or publishing.
const filters=document.querySelector('[data-local-filters]');
if(filters){
 const status=document.querySelector('[data-filter-status]');
 const apply=()=>{status.textContent=document.documentElement.lang==='ar'?'الفهرس فارغ: 0 منتجات. طُبّقت الفلاتر محليًا فقط؛ لم يُرسل أو يُحفظ شيء.':'The index is empty: 0 products. Filters applied locally only; nothing was sent or saved.';};
 filters.querySelector('[data-filter-apply]').addEventListener('click',apply);
 filters.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();apply();}});
}
