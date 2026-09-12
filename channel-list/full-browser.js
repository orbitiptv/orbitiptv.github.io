(() => {
 'use strict';
 const $=id=>document.getElementById(id), base='data/full-v1/', PAGE_SIZE=50;
 const titles={live:'Live channels',movies:'Movies',series:'Series / episodes'};
 const labels={EXYU:'Balkan / EXYU',USA:'SAD',US:'SAD',UK:'Velika Britanija',EN:'Engleski / međunarodno',AFG:'Afganistan',AFRICAN:'Afrika',AL:'Albanija',AM:'Armenija',ARA:'Arapske države',AS:'Azija',AT:'Austrija',AU:'Australija',BAN:'Bangladeš',BE:'Belgija',BG:'Bugarska',BH:'Bahrein',BR:'Brazil',BY:'Bjelorusija',CAN:'Kanada',CG:'CG',CH:'Švicarska',CY:'Kipar',CZ:'Češka',DE:'Njemačka',DK:'Danska',ESP:'Španija',FI:'Finska',FR:'Francuska',GLOBAL:'Međunarodno',GR:'Grčka',HU:'Mađarska',IN:'Indija',IR:'Iran',IS:'Island',IT:'Italija',JP:'Japan',KR:'Koreja',LT:'Litvanija',LV:'Latvija',MULTI:'Više jezika',NL:'Nizozemska',NO:'Norveška',NZ:'Novi Zeland',PH:'Filipini',PK:'Pakistan',PL:'Poljska',PT:'Portugal',QC:'Québec',RO:'Rumunija',RU:'Rusija',SCAN:'Skandinavija',SE:'Švedska',SL:'Slovenija',SK:'Slovačka',TAI:'Tajvan',TH:'Tajland',TR:'Turska',UA:'Ukrajina',VT:'Vijetnam',OTHER:'Ostalo'};
 const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 let manifest,kind='live',country=null,category='',page=1,revision=0,results=null,searchTimer;
 const cache=new Map(), inflight=new Map();
 const label=c=>window.orbitCountryLabel(c.code)+' · '+c.code;
 function setMessage(text){$('channelsList').replaceChildren(); const p=document.createElement('p');p.className='hint';p.textContent=text;$('channelsList').append(p);}
 function status(text){$('catalogStatus').textContent=text;}
 async function getPack(file){
  if(cache.has(file)){const v=cache.get(file);cache.delete(file);cache.set(file,v);return v;}
  if(inflight.has(file))return inflight.get(file);
  const promise=(async()=>{const r=await fetch(base+file);if(!r.ok)throw Error('Download failed');
   const encoded=(await r.text()).trim(),bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   const unpacked=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
   const data=JSON.parse(await new Response(unpacked).text());cache.set(file,data);while(cache.size>6)cache.delete(cache.keys().next().value);return data;
  })(); inflight.set(file,promise);try{return await promise;}finally{inflight.delete(file);}
 }
 async function getNames(part){const data=await getPack(part.pack),names=data[part.key];if(!Array.isArray(names)||names.length!==part.count)throw Error('Incomplete data');return names;}
 function selectedCategories(){return !country?[]:country.categories.filter(c=>!category||c.id===category);}
 function count(){return selectedCategories().reduce((n,c)=>n+c.count,0);}
 function parts(){return selectedCategories().flatMap(c=>c.parts.map(p=>({...p,category:c.name})));}
 function renderCountries(){
  $('categoryList').replaceChildren();if(!manifest)return;
  const q=norm($('categorySearch').value.trim());
  const filtered=manifest.types[kind].countries.filter(c=>norm(label(c)+' '+c.categories.map(x=>x.name).join(' ')).includes(q));
  for(const c of filtered){const b=document.createElement('button');b.type='button';b.className='category-item'+(country===c?' active':'');b.setAttribute('aria-pressed',String(country===c));
   const text=document.createElement('span');text.textContent=label(c);const small=document.createElement('small');small.textContent=c.count.toLocaleString();b.append(text,small);b.onclick=()=>selectCountry(c);$('categoryList').append(b);
  }if(!filtered.length)$('categoryList').textContent='No matching country or category.';
 }
 function renderCategories(){
  $('groupSelect').replaceChildren();const all=document.createElement('option');all.value='';all.textContent='All categories';$('groupSelect').append(all);
  if(country)for(const c of country.categories){const o=document.createElement('option');o.value=c.id;o.textContent=c.name+' ('+c.count.toLocaleString()+')';$('groupSelect').append(o);}
  $('groupSelect').disabled=!country;$('groupSelect').value=category;
 }
 function selectCountry(c){country=c;category='';page=1;results=null;$('channelQuery').value='';renderCountries();renderCategories();refresh();}
 function pager(total){
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));$('channelPages').replaceChildren();
  const button=(text,target,disabled)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=disabled;b.onclick=()=>{page=target;renderPage();};$('channelPages').append(b);};
  button('First',1,page<=1);button('Previous',page-1,page<=1);
  const info=document.createElement('span');info.textContent=page+' / '+pages;$('channelPages').append(info);
  button('Next',page+1,page>=pages);button('Last',pages,page>=pages);
 }
 function renderRows(rows){$('channelsList').replaceChildren();if(!rows.length)return setMessage('No results.');for(const item of rows){const row=document.createElement('div');row.className='channel-row';const n=document.createElement('b');n.textContent=item.name;const cat=document.createElement('small');cat.textContent=item.category;row.append(n,cat);$('channelsList').append(row);}}
 async function renderPage(){
  const token=++revision; if(!country){$('selectedCategory').hidden=true;$('channelPages').replaceChildren();return setMessage('Select a country or region on the left.');}
  const total=results===null?count():results.length,pages=Math.max(1,Math.ceil(total/PAGE_SIZE));page=Math.min(page,pages);
  $('selectedCategory').hidden=false;$('selectedCategory').textContent=label(country)+' · '+titles[kind]+' · '+total.toLocaleString()+' entries';pager(total);setMessage('Loading…');$('channelsList').setAttribute('aria-busy','true');
  try{
   let rows=[];const start=(page-1)*PAGE_SIZE,end=Math.min(start+PAGE_SIZE,total);
   if(results!==null)rows=results.slice(start,end);
   else {let offset=0;for(const part of parts()){const next=offset+part.count;if(next>start&&offset<end){const names=await getNames(part);if(token!==revision)return;rows.push(...names.slice(Math.max(0,start-offset),Math.min(part.count,end-offset)).map(name=>({name,category:part.category})));}offset=next;if(offset>=end)break;}}
   if(token!==revision)return;renderRows(rows);status('Complete catalog · '+manifest.total.toLocaleString()+' entries');
  }catch(e){if(token!==revision)return;setMessage('Loading failed. Please try again.');const b=document.createElement('button');b.textContent='Try again';b.onclick=renderPage;$('channelsList').append(b);}
  finally{if(token===revision)$('channelsList').setAttribute('aria-busy','false');}
 }
 async function refresh(){
  const q=norm($('channelQuery').value.trim());page=1;results=null;
  if(!q||!country)return renderPage();
  const token=++revision,list=parts(),found=[];$('channelPages').replaceChildren();setMessage('Searching all entries in the selected country…');$('channelsList').setAttribute('aria-busy','true');
  try{for(let i=0;i<list.length;i++){if(token!==revision)return;const p=list[i],names=await getNames(p);if(token!==revision)return;for(const name of names)if(norm(name).includes(q))found.push({name,category:p.category});status('Searching: '+Math.round((i+1)/list.length*100)+'%');}if(token!==revision)return;results=found;renderPage();}
  catch(e){if(token!==revision)return;setMessage('Search failed. Please try again.');const b=document.createElement('button');b.textContent='Retry search';b.onclick=refresh;$('channelsList').append(b);status('');}
  finally{if(token===revision)$('channelsList').setAttribute('aria-busy','false');}
 }
 function changeKind(value){kind=value;country=null;category='';results=null;page=1;++revision;clearTimeout(searchTimer);$('channelQuery').value='';for(const b of $('contentTabs').children)b.setAttribute('aria-pressed',String(b.dataset.kind===kind));$('contentTitle').textContent=titles[kind];renderCountries();renderCategories();renderPage();}
 $('menu')?.addEventListener('click',()=>{$('nav').classList.toggle('open');});
 $('categorySearch').addEventListener('input',renderCountries);$('categoryForm').addEventListener('submit',e=>{e.preventDefault();renderCountries();});
 $('channelQuery').addEventListener('input',()=>{++revision;clearTimeout(searchTimer);searchTimer=setTimeout(refresh,350);});
 $('channelForm').addEventListener('submit',e=>{e.preventDefault();clearTimeout(searchTimer);refresh();});
 $('groupSelect').addEventListener('change',()=>{category=$('groupSelect').value;results=null;refresh();});
 for(const b of $('contentTabs').children)b.addEventListener('click',()=>changeKind(b.dataset.kind));
 $('showAll').addEventListener('click',()=>$('browser').scrollIntoView({behavior:'smooth'}));
 async function init(){
  try{const r=await fetch(base+'manifest.json');if(!r.ok)throw Error('Manifest unavailable');manifest=await r.json();if(!manifest.complete)throw Error('Incomplete catalog');
   $('liveCount').textContent=manifest.types.live.count.toLocaleString();$('movieCount').textContent=manifest.types.movies.count.toLocaleString();$('seriesCount').textContent=manifest.types.series.count.toLocaleString();
   $('categoryCountTop').textContent=manifest.categories.toLocaleString();$('countryCount').textContent=new Set(Object.values(manifest.types).flatMap(t=>t.countries.map(c=>c.code))).size;
   status('Complete catalog · '+manifest.total.toLocaleString()+' entries');changeKind('live');
  }catch(e){$('categoryList').textContent='The catalog could not be loaded.';setMessage('Refresh the page or try again.');const b=document.createElement('button');b.textContent='Try again';b.onclick=init;$('categoryList').append(b);}
 }
 init();
})();
