(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const labels = {EXYU:'Balkan / EXYU', AFG:'Afghanistan', AFRICAN:'Africa', AL:'Albania', AM:'Armenia', ARA:'Arab countries', AS:'Asia', AT:'Austria', AU:'Australia', BAN:'Bangladesh', BE:'Belgium', BG:'Bulgaria', BH:'Bahrain', BR:'Brazil', BY:'Belarus', CAN:'Canada', CG:'CG', CH:'Switzerland', CY:'Cyprus', CZ:'Czechia', DE:'Germany'};
  let countries=[], active=null, channels=[], page=1, request=0;
  const cache=new Map(), perPage=50;
  const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function message(text) { $('channelsList').replaceChildren(); const p=document.createElement('p'); p.className='hint'; p.textContent=text; $('channelsList').append(p); $('channelPages').replaceChildren(); }
  function renderCountries() {
    const q=normalize($('categorySearch').value.trim());
    $('categoryList').replaceChildren();
    countries.filter(c=>normalize((labels[c.code]||c.code)+' '+c.code).includes(q)).forEach(c=>{
      const b=document.createElement('button'); b.type='button'; b.className='category-item'+(active===c?' active':''); b.setAttribute('aria-pressed',String(active===c));
      const title=document.createElement('span'); title.textContent=(labels[c.code]||c.code)+' · '+c.code;
      const count=document.createElement('small'); count.textContent=c.count.toLocaleString(); b.append(title,count); b.onclick=()=>select(c); $('categoryList').append(b);
    });
    if(!$('categoryList').children.length) $('categoryList').textContent='No matching countries or regions.';
  }
  function renderChannels() {
    if(!active) return message('Choose a country or region to see its channels.');
    const q=normalize($('channelQuery').value.trim()), filtered=channels.filter(n=>normalize(n).includes(q));
    const pages=Math.max(1,Math.ceil(filtered.length/perPage)); page=Math.min(page,pages);
    $('selectedCategory').hidden=false;
    $('selectedCategory').textContent=(labels[active.code]||active.code)+' · '+filtered.length.toLocaleString()+' matching channels'+(active.complete?'':' · Partial list');
    if(!filtered.length) return message('No channels found.');
    $('channelsList').replaceChildren();
    filtered.slice((page-1)*perPage,page*perPage).forEach(n=>{const row=document.createElement('div'); row.className='channel-row'; const name=document.createElement('b'); name.textContent=n; row.append(name); $('channelsList').append(row);});
    $('channelPages').replaceChildren();
    const button=(text,target,disabled=false)=>{const b=document.createElement('button'); b.type='button'; b.textContent=text; b.disabled=disabled; b.onclick=()=>{page=target;renderChannels();}; $('channelPages').append(b);};
    button('First',1,page===1); button('Previous',page-1,page===1);
    const info=document.createElement('span'); info.textContent=page+' / '+pages; $('channelPages').append(info);
    button('Next',page+1,page===pages); button('Last',pages,page===pages);
  }
  async function select(c) {
    active=c; channels=[]; page=1; const token=++request; renderCountries();
    $('selectedCategory').hidden=false; $('selectedCategory').textContent=labels[c.code]||c.code; message('Loading channels…');
    try {
      if(!cache.has(c.code)) { const r=await fetch(c.file+'?v=20260912-country1'); if(!r.ok) throw Error('Fetch failed'); const names=await r.json(); if(!Array.isArray(names)||names.length!==c.count||!names.every(n=>typeof n==='string')) throw Error('Invalid catalog'); cache.set(c.code,names); }
      if(token!==request) return; channels=cache.get(c.code); renderChannels();
    } catch(e) { if(token!==request) return; message('Unable to load channels.'); const b=document.createElement('button'); b.type='button'; b.textContent='Retry'; b.onclick=()=>select(c); $('channelsList').append(b); }
  }
  $('menu')?.addEventListener('click',()=>{$('nav').classList.toggle('open'); $('menu').setAttribute('aria-expanded',String($('nav').classList.contains('open')));});
  $('categorySearch').addEventListener('input',renderCountries);
  $('channelQuery').addEventListener('input',()=>{page=1;renderChannels();});
  $('categoryForm').addEventListener('submit',e=>{e.preventDefault();renderCountries();});
  $('channelForm').addEventListener('submit',e=>{e.preventDefault();page=1;renderChannels();});
  $('showAll').addEventListener('click',()=>$('browser').scrollIntoView({behavior:'smooth'}));
  async function init() {
    $('categoryList').textContent='Loading countries and regions…';
    try { const r=await fetch('data/catalog.json?v=20260912-country1'); if(!r.ok) throw Error('Fetch failed'); const data=await r.json(); countries=data.countries;
      if(!Array.isArray(countries)||!countries.length||countries.reduce((n,c)=>n+c.count,0)!==data.total) throw Error('Invalid manifest');
      $('liveCount').textContent=data.total.toLocaleString(); $('categoryCountTop').textContent=countries.length; $('countryCount').textContent=countries.length;
      $('catalogStatus').textContent=data.complete?'':'Partial catalog: additional countries and channels will be added when the full list is available.';
      renderCountries(); message('Choose a country or region to see its channels.');
    } catch(e) { $('categoryList').textContent='Unable to load the catalog.'; const b=document.createElement('button'); b.textContent='Retry'; b.onclick=init; $('categoryList').append(b); }
  }
  init();
})();
