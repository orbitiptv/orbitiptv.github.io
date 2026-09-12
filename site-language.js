(function(){
 'use strict';
 const names={en:'English',bs:'Bosanski',hr:'Hrvatski',sr:'Srpski',sl:'Slovenščina',mk:'Македонски',sq:'Shqip',de:'Deutsch',it:'Italiano'};
 const assetRoot=new URL('.',document.currentScript.src), query=new URLSearchParams(location.search).get('lang');
 let language='en';try{language=query||localStorage.getItem('orbit-language')||'en';}catch{}if(!names[language])language='en';
 window.orbitLanguage=language;
 const rows=`Live channels|Kanali uživo|Kanali v živo|Live-Kanäle|Canali in diretta|Kanale drejtpërdrejt|Канали во живо
Movies|Filmovi|Filmi|Filme|Film|Filma|Филмови
Series|Serije|Serije|Serien|Serie|Seriale|Серии
Series / episodes|Serije / epizode|Serije / epizode|Serien / Episoden|Serie / episodi|Seriale / episode|Серии / епизоди
Countries / regions|Države / regije|Države / regije|Länder / Regionen|Paesi / regioni|Shtete / rajone|Држави / региони
Category|Kategorija|Kategorija|Kategorie|Categoria|Kategori|Категорија
All categories|Sve kategorije|Vse kategorije|Alle Kategorien|Tutte le categorie|Të gjitha kategoritë|Сите категории
Search|Traži|Išči|Suchen|Cerca|Kërko|Пребарај
Search country, region or category...|Traži državu, regiju ili kategoriju...|Išči državo, regijo ali kategorijo...|Land, Region oder Kategorie suchen...|Cerca paese, regione o categoria...|Kërko shtet, rajon ose kategori...|Пребарај држава, регион или категорија...
Search titles in the selected country...|Traži naziv u izabranoj državi...|Išči naslov v izbrani državi...|Titel im ausgewählten Land suchen...|Cerca titoli nel paese selezionato...|Kërko tituj në shtetin e zgjedhur...|Пребарај наслови во избраната држава...
Select a country or region on the left.|Izaberite državu ili regiju lijevo.|Izberite državo ali regijo na levi.|Wählen Sie links ein Land oder eine Region.|Seleziona un paese o una regione a sinistra.|Zgjidh një shtet ose rajon në të majtë.|Изберете држава или регион лево.
No matching country or category.|Nema rezultata za ovu državu ili kategoriju.|Ni ustrezne države ali kategorije.|Kein passendes Land oder keine Kategorie.|Nessun paese o categoria corrispondente.|Nuk ka shtet ose kategori që përputhet.|Нема соодветна држава или категорија.
No results.|Nema rezultata.|Ni rezultatov.|Keine Ergebnisse.|Nessun risultato.|Nuk ka rezultate.|Нема резултати.
Loading…|Učitavanje…|Nalaganje…|Wird geladen…|Caricamento…|Duke ngarkuar…|Се вчитува…
First|Prva|Prva|Erste|Prima|E para|Прва
Previous|Prethodna|Prejšnja|Zurück|Precedente|E mëparshme|Претходна
Next|Sljedeća|Naslednja|Weiter|Successiva|Tjetra|Следна
Last|Zadnja|Zadnja|Letzte|Ultima|E fundit|Последна
Loading failed. Please try again.|Učitavanje nije uspjelo. Pokušajte ponovo.|Nalaganje ni uspelo. Poskusite znova.|Laden fehlgeschlagen. Bitte erneut versuchen.|Caricamento non riuscito. Riprova.|Ngarkimi dështoi. Provo përsëri.|Вчитувањето не успеа. Обидете се повторно.
Try again|Pokušaj ponovo|Poskusi znova|Erneut versuchen|Riprova|Provo përsëri|Обиди се повторно
Searching all entries in the selected country…|Pretraživanje svih stavki izabrane države…|Iskanje vseh vnosov v izbrani državi…|Alle Einträge im ausgewählten Land werden durchsucht…|Ricerca di tutte le voci nel paese selezionato…|Duke kërkuar të gjitha hyrjet në shtetin e zgjedhur…|Се пребаруваат сите ставки во избраната држава…
Search failed. Please try again.|Pretraga nije završena. Pokušajte ponovo.|Iskanje ni uspelo. Poskusite znova.|Suche fehlgeschlagen. Bitte erneut versuchen.|Ricerca non riuscita. Riprova.|Kërkimi dështoi. Provo përsëri.|Пребарувањето не успеа. Обидете се повторно.
Retry search|Ponovi pretragu|Ponovi iskanje|Suche wiederholen|Ripeti la ricerca|Përsërit kërkimin|Повтори пребарување
The catalog could not be loaded.|Katalog nije učitan.|Kataloga ni bilo mogoče naložiti.|Der Katalog konnte nicht geladen werden.|Impossibile caricare il catalogo.|Katalogu nuk mund të ngarkohej.|Каталогот не можеше да се вчита.
Refresh the page or try again.|Osvježite stranicu ili pokušajte ponovo.|Osvežite stran ali poskusite znova.|Seite aktualisieren oder erneut versuchen.|Aggiorna la pagina o riprova.|Rifresko faqen ose provo përsëri.|Освежете ја страницата или обидете се повторно.
Complete catalog|Kompletan katalog|Celoten katalog|Vollständiger Katalog|Catalogo completo|Katalogu i plotë|Целосен каталог
entries|stavki|vnosov|Einträge|voci|hyrje|ставки
Searching:|Pretraživanje:|Iskanje:|Suche:|Ricerca:|Duke kërkuar:|Пребарување:
Balkan / EXYU|Balkan / EXYU|Balkan / EXYU|Balkan / EXYU|Balcani / EXYU|Ballkani / EXYU|Балкан / EXYU
Africa|Afrika|Afrika|Afrika|Africa|Afrika|Африка
Arab countries|Arapske države|Arabske države|Arabische Länder|Paesi arabi|Shtete arabe|Арапски држави
Asia|Azija|Azija|Asien|Asia|Azia|Азија
International|Međunarodno|Mednarodno|International|Internazionale|Ndërkombëtare|Меѓународно
English / international|Engleski / međunarodno|Angleško / mednarodno|Englisch / international|Inglese / internazionale|Anglisht / ndërkombëtare|Англиски / меѓународно
Multiple languages|Više jezika|Več jezikov|Mehrere Sprachen|Più lingue|Shumë gjuhë|Повеќе јазици
Scandinavia|Skandinavija|Skandinavija|Skandinavien|Scandinavia|Skandinavia|Скандинавија
Other|Ostalo|Drugo|Andere|Altro|Të tjera|Друго`;
 const dictionaries={};for(const l of Object.keys(names))dictionaries[l]={};
 for(const row of rows.split('\n')){const v=row.split('|');const codes=['en','bs','sl','de','it','sq','mk'];codes.forEach((l,i)=>dictionaries[l][v[0]]=v[i]);dictionaries.hr[v[0]]=v[1];dictionaries.sr[v[0]]=v[1];}
 dictionaries.hr.Next='Sljedeća';dictionaries.sr.Next='Sledeća';dictionaries.sr['Select a country or region on the left.']='Izaberite državu ili regiju levo.';
 const translate=text=>dictionaries[language][text]||text;
 window.orbitText=translate;
 const iso={AFG:'AF',AL:'AL',AM:'AM',AT:'AT',AU:'AU',BAN:'BD',BE:'BE',BG:'BG',BH:'BH',BR:'BR',BY:'BY',CAN:'CA',CH:'CH',CN:'CN',CY:'CY',CZ:'CZ',DE:'DE',DK:'DK',ESP:'ES',EST:'EE',FI:'FI',FR:'FR',GE:'GE',GR:'GR',HK:'HK',HR:'HR',HU:'HU',ID:'ID',IN:'IN',IR:'IR',IS:'IS',ISR:'IL',IT:'IT',JP:'JP',LT:'LT',LV:'LV',MK:'MK',MT:'MT',MY:'MY',NL:'NL',NO:'NO',NP:'NP',NZ:'NZ',PH:'PH',PK:'PK',PL:'PL',PT:'PT',RO:'RO',RS:'RS',RU:'RU',SE:'SE',SG:'SG',SK:'SK',SL:'SI',TAI:'TW',TH:'TH',TR:'TR',UK:'GB',UKR:'UA',USA:'US',VT:'VN'};
 const special={EXYU:'Balkan / EXYU',AFRICAN:'Africa',ARA:'Arab countries',AS:'Asia',GLOBAL:'International',EN:'English / international',MULTI:'Multiple languages',SCAN:'Scandinavia',OTHER:'Other',QC:'Québec'};
 const regionNames=new Intl.DisplayNames([language==='sr'?'sr-Latn':language],{type:'region'});
 window.orbitCountryLabel=code=>special[code]?translate(special[code]):iso[code]?regionNames.of(iso[code]):code;
 function store(code){try{localStorage.setItem('orbit-language',code);localStorage.setItem('orbitLang',code);}catch{}}
 function cookie(code){document.cookie='googtrans=/en/'+code+';Path=/;SameSite=Lax;Max-Age=31536000';}
 store(language);cookie(language);
 function choose(code){if(!names[code])return;store(code);cookie(code);const u=new URL(location.href);u.searchParams.delete('lang');location.href=u.href;}
 document.addEventListener('change',e=>{if(e.target.matches('.orbit-site-language')){e.stopImmediatePropagation();choose(e.target.value);}},true);
 const originals=new WeakMap();let observer;
 function nativeText(text){
  if(dictionaries[language][text])return translate(text);
  return text.split(' · ').map(part=>{if(dictionaries[language][part])return translate(part);if(/^\d[\d.,\s]* entries$/.test(part))return part.replace(/entries$/,translate('entries'));if(part.startsWith('Searching:'))return part.replace('Searching:',translate('Searching:'));return part;}).join(' · ');
 }
 function native(){
  observer?.disconnect();
  for(const root of document.querySelectorAll('#browser,#contentTabs,#catalogStatus')){const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const node=walk.currentNode;if(node.parentElement.closest('.channel-row,#groupSelect option:not(:first-child),.orbit-site-language'))continue;const raw=node.textContent.trim();if(!raw)continue;let source=originals.get(node);if(!source||raw!==nativeText(source)){source=raw;originals.set(node,source);}const localized=nativeText(source);if(localized!==raw)node.textContent=node.textContent.replace(raw,localized);}}
  for(const input of document.querySelectorAll('#browser input[placeholder]')){const source=input.dataset.orbitPlaceholder||input.placeholder;input.dataset.orbitPlaceholder=source;input.placeholder=translate(source);}
  for(const root of document.querySelectorAll('#browser,#contentTabs,#catalogStatus'))observer?.observe(root,{subtree:true,childList:true,characterData:true});
 }
 function selectors(){
  let selects=[...document.querySelectorAll('#site-language,#language,#guideLanguage,#premiumLanguage,#lang')];
  if(!selects.length){const select=document.createElement('select');select.id='site-language';const host=document.querySelector('.site-header,.navlinks,.navin,header,nav');(host||document.body).append(select);selects=[select];}
  for(const select of selects){select.classList.add('orbit-site-language','notranslate');select.setAttribute('translate','no');select.setAttribute('aria-label','Language');select.replaceChildren();for(const [code,name]of Object.entries(names)){const o=document.createElement('option');o.value=code;o.textContent=name;select.append(o);}select.value=language;}
 }
 async function init(){
  // All pages share an English source before full-page translation begins.
  try{const r=await fetch(new URL('site-english.json',assetRoot));if(!r.ok)throw Error('English source unavailable');const map=await r.json();const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement.closest('script,style,.channel-row,#groupSelect option:not(:first-child)'))continue;const raw=n.textContent.trim();if(map[raw])n.textContent=n.textContent.replace(raw,map[raw]);}}catch(e){console.error(e);}
  selectors();document.documentElement.lang=language;
  for(const root of document.querySelectorAll('#browser,#contentTabs,#catalogStatus')){root.classList.add('notranslate');root.setAttribute('translate','no');}
  observer=new MutationObserver(native);native();
  const style=document.createElement('style');style.textContent='.orbit-site-language{font:inherit;font-size:14px;max-width:150px;padding:9px 11px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#222}.orbit-language-engine{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.goog-te-banner-frame,.skiptranslate iframe{display:none!important}body{top:0!important}';document.head.append(style);
  if(language==='en')return;
  const engine=document.createElement('div');engine.id='orbit-language-engine';engine.className='orbit-language-engine';document.body.append(engine);
  window.orbitGoogleTranslateReady=function(){new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:Object.keys(names).filter(c=>c!=='en').join(','),autoDisplay:false},engine.id);};
  const script=document.createElement('script');script.src='https://translate.google.com/translate_a/element.js?cb=orbitGoogleTranslateReady';script.onerror=()=>{const note=document.createElement('p');note.textContent='Page translation could not load. Please refresh or choose English.';note.setAttribute('role','status');document.body.prepend(note);};document.head.append(script);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
