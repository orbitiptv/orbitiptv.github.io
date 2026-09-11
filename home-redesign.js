'use strict';
const menu=document.getElementById('menu'),nav=document.getElementById('navigation');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav?.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')});
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{if(a.href.includes('?'))return;a.href+='?text='+encodeURIComponent('Pozdrav, želim više informacija o OrbitTV usluzi.')});

