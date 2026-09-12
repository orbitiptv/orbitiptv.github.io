'use strict';
const menu=document.getElementById('menu'),nav=document.getElementById('navigation');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav?.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')});
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{a.target='_blank';a.rel='noopener';if(!a.href.includes('?'))a.href+='?text='+encodeURIComponent('Hello, I would like more information about OrbitTV.')});
const language=document.getElementById('site-language');if(language){language.value=localStorage.getItem('orbit-language')||'en';language.addEventListener('change',()=>{localStorage.setItem('orbit-language',language.value);document.documentElement.lang=language.value;if(language.value!=='en'){const map={bs:'bs',hr:'hr',sr:'sr',sl:'sl',mk:'mk',sq:'sq',de:'de',it:'it'};location.href='https://translate.google.com/translate?sl=en&tl='+map[language.value]+'&u='+encodeURIComponent(location.href)}})}

