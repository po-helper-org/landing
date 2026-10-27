// Счётчик Яндекс.Метрики: подключается только на страницах подсайта, отчёт читается фильтром «URL страницы начинается с /po-system/».
// Идентификатор (PUBLIC_METRIKA_ID) задаётся при сборке; пока его нет, счётчика на страницах нет.

/** Код счётчика для вставки в <head>; пустая строка, если идентификатор не задан. */
export function metrikaSnippet(id: string | undefined): string {
  if (!id) return '';
  if (!/^\d{5,10}$/.test(id)) throw new Error(`PUBLIC_METRIKA_ID должен быть числом из 5–10 цифр, получено «${id}»`);
  return `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`;
}
