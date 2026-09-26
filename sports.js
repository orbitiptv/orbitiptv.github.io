(() => {
 const $=id=>document.getElementById(id);let all=[],found=[],page=1;const size=48;
 const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function render(){
  const total=Math.max(1,Math.ceil(found.length/size));page=Math.min(page,total);
  $('sports-results').replaceChildren();
  found.slice((page-1)*size,page*size).forEach(row=>{const article=document.createElement('article');const h=document.createElement('h2');h.textContent=row.name;const p=document.createElement('p');p.textContent=row.country+' · '+row.category;article.append(h,p);$('sports-results').append(article);});
  $('sports-status').textContent=found.length.toLocaleString()+' matching sports channels';
  $('sports-page').textContent=page+' / '+total;$('sports-prev').disabled=page===1;$('sports-next').disabled=page===total;
 }
 function filter(){const q=norm($('sports-query').value.trim()),country=$('sports-country').value;found=all.filter(r=>(!country||r.country===country)&&norm(r.name+' '+r.category).includes(q));page=1;render();}
 $('sports-search').onsubmit=e=>{e.preventDefault();filter();};$('sports-query').oninput=filter;$('sports-country').onchange=filter;
 $('sports-prev').onclick=()=>{page--;render();};$('sports-next').onclick=()=>{page++;render();};
 async function load(){try{const r=await fetch('channel-list/data/sports.json');if(!r.ok)throw Error();all=await r.json();[...new Set(all.map(r=>r.country))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;$('sports-country').append(o);});$('sports-query').value=new URLSearchParams(location.search).get('q')||'';filter();}catch{$('sports-status').textContent='The sports catalog could not load. ';const b=document.createElement('button');b.textContent='Try again';b.onclick=load;$('sports-status').append(b);}}load();
})();
