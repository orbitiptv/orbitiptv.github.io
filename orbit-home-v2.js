'use strict';
const menu=document.getElementById('menu'),nav=document.getElementById('navigation');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav?.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')});
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{a.target='_blank';a.rel='noopener';if(!a.href.includes('?'))a.href+='?text='+encodeURIComponent('Hello, I would like more information about OrbitTV.')});
