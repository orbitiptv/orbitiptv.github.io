(() => {
  'use strict';
  const root = new URL('.', document.currentScript.src);
  const names = {en:'English',sl:'Slovenščina',de:'Deutsch',it:'Italiano',hr:'Hrvatski',bs:'Bosanski',sr:'Српски',fr:'Français',sq:'Shqip',mk:'Македонски'};
  let language = new URLSearchParams(location.search).get('lang');
  if (!language) { try { language = localStorage.getItem('orbit-language'); } catch {} }
  if (!names[language]) language = 'en';
  window.orbitLanguage = language;
  try { localStorage.setItem('orbit-language',language); localStorage.setItem('orbitLang','en'); } catch {}
  // Retire cookies from the old externally loaded page translator.
  document.cookie = 'googtrans=;Path=/;Max-Age=0;SameSite=Lax';
  let english = {}, dictionary = {};
  const clean = text => text.trim().replace(/\s+/g,' ');
  const translate = text => {
    const key = clean(text), source = english[key] || key;
    if (/^[€$£\d\s.,+%-]+(?:EUR|USD|GBP)?$/.test(key) || /^(?:https?:|www\.|@)/.test(key)) return key;
    if (dictionary[source]) return dictionary[source];
    if (/^[\d.,\s]+ matching sports channels$/.test(source)) return source.replace('matching sports channels',dictionary['matching sports channels']||'matching sports channels');
    for(const prefix of ['Copied:','Select and copy:'])if(source.startsWith(prefix))return source.replace(prefix,dictionary[prefix]||prefix);
    if (/^\d[\d.,\s]* entries$/.test(source)) return source.replace(/entries$/, dictionary.entries || 'entries');
    if (source.startsWith('Searching:')) return source.replace('Searching:',dictionary['Searching:'] || 'Searching:');
    if (source.includes(' · ')) return source.split(' · ').map(part=>dictionary[part]||part).join(' · ');
    return source;
  };
  window.orbitText = translate;
   const iso={AFG:'AF',AL:'AL',AM:'AM',AT:'AT',AU:'AU',BAN:'BD',BE:'BE',BG:'BG',BH:'BH',BR:'BR',BY:'BY',CAN:'CA',CH:'CH',CN:'CN',CY:'CY',CZ:'CZ',DE:'DE',DK:'DK',ESP:'ES',EST:'EE',FI:'FI',FR:'FR',GE:'GE',GR:'GR',HK:'HK',HR:'HR',HU:'HU',ID:'ID',IN:'IN',IR:'IR',IS:'IS',ISR:'IL',IT:'IT',JP:'JP',LT:'LT',LV:'LV',MK:'MK',MT:'MT',MY:'MY',NL:'NL',NO:'NO',NP:'NP',NZ:'NZ',PH:'PH',PK:'PK',PL:'PL',PT:'PT',RO:'RO',RS:'RS',RU:'RU',SE:'SE',SG:'SG',SK:'SK',SL:'SI',TAI:'TW',TH:'TH',TR:'TR',UK:'GB',UKR:'UA',USA:'US',VT:'VN'};
 const special={EXYU:'Balkan / EXYU',AFRICAN:'Africa',ARA:'Arab countries',AS:'Asia',GLOBAL:'International',EN:'English / international',MULTI:'Multiple languages',SCAN:'Scandinavia',OTHER:'Other',QC:'Québec'};
 const regionNames=new Intl.DisplayNames([language==='sr'?'sr-Latn':language],{type:'region'});
 window.orbitCountryLabel=code=>special[code]?translate(special[code]):iso[code]?regionNames.of(iso[code]):code;

  const ignored = 'script,style,noscript,code,pre,.notranslate,[translate="no"],.orbit-site-language,.channel-row,#sports-results,#sports-country,#groupSelect option:not(:first-child),.poster-card figcaption,.customer,input,textarea';
  function apply(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest(ignored)) return;
      const raw=node.textContent, key=clean(raw);if (!key) return;
      const value=translate(key); if(value!==key) node.textContent=raw.replace(raw.trim(),value);
      return;
    }
    if (node.nodeType!==Node.ELEMENT_NODE || node.closest(ignored)) return;
    for (const attr of ['placeholder','aria-label','title','alt']) if(node.hasAttribute(attr)) {
      const raw=node.getAttribute(attr), value=translate(raw);if(raw!==value)node.setAttribute(attr,value);
    }
    // Placeholders and accessible names are safe to translate; entered values never are.
    for(const input of node.querySelectorAll('input[placeholder],input[aria-label],textarea[placeholder]')) {
      for(const attr of ['placeholder','aria-label'])if(input.hasAttribute(attr))input.setAttribute(attr,translate(input.getAttribute(attr)));
    }
    for (const child of [...node.childNodes]) apply(child);
  }
  function selectors() {
    let selects=[...document.querySelectorAll('#site-language,#language,#guideLanguage,#premiumLanguage,#lang')];
    if(!selects.length){const select=document.createElement('select');select.id='site-language';const host=document.querySelector('body>header .nav,body>header .container.nav,body>.site-header .nav-shell,body>header,body>.nav .navin,body>.nav,header');(host||document.body).append(select);selects=[select];}
    for(const select of selects){select.classList.add('orbit-site-language','notranslate');select.setAttribute('translate','no');select.setAttribute('aria-label',translate('Choose language'));select.replaceChildren();for(const [code,label]of Object.entries(names)){const option=document.createElement('option');option.value=code;option.lang=code;option.textContent=label;select.append(option)}select.value=language;}
  }
  document.addEventListener('change',event=>{
    if(!event.target.matches('.orbit-site-language'))return;
    event.stopImmediatePropagation();const code=event.target.value;if(!names[code])return;
    try{localStorage.setItem('orbit-language',code)}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',code);location.assign(url.href);
  },true);
  // The language remains shareable and survives navigation even if storage is blocked.
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href]');if(!anchor||anchor.hasAttribute('download')||anchor.getAttribute('href').startsWith('#'))return;
    const url=new URL(anchor.href);if(url.origin!==location.origin||/\.(?:apk|exe|zip|dmg|mp4|pdf|png|webp)$/i.test(url.pathname))return;
    url.searchParams.set('lang',language);anchor.href=url.href;
  },true);
  async function init(){
    selectors();
    try{
      const responses=await Promise.all([fetch(new URL('site-english.json?v=20260926',root)),language==='en'?null:fetch(new URL('locales/'+language+'.json?v=20260926',root))]);
      if(!responses[0].ok||responses[1]&&!responses[1].ok)throw Error('Translation unavailable');
      english=await responses[0].json();dictionary=responses[1]?await responses[1].json():{};
      apply(document.body);document.title=translate(document.title);document.documentElement.lang=language;selectors();
      const observer=new MutationObserver(records=>{observer.disconnect();for(const record of records){if(record.type==='characterData')apply(record.target);else for(const node of record.addedNodes)apply(node)}observe()});
      const observe=()=>observer.observe(document.body,{childList:true,subtree:true,characterData:true});observe();
      window.dispatchEvent(new CustomEvent('orbit:language-ready',{detail:{language}}));
    }catch(error){document.documentElement.lang='en';const note=document.createElement('p');note.className='orbit-language-status';note.setAttribute('role','status');note.textContent='Translation could not load. The original page remains available. Please refresh to try again.';document.body.prepend(note);console.error(error);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
