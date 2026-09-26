(() => {
 const script=document.currentScript;
 const root=new URL('.',script.src);
 const main=document.querySelector('main');
 if(main&&!document.querySelector('.skip,.skip-link')){
  main.id=main.id||'main-content';
  const skip=document.createElement('a');skip.className='orbit-skip';skip.href='#'+main.id;skip.textContent='Skip to content';document.body.prepend(skip);
 }
 const routes=[['Home',''],['TV & entertainment','#tv-entertainment'],['Channel catalog','channel-list/'],['Sports','sports.html'],['Player downloads','orbit-player-downloads/'],['Installation','Installation-Guide/'],['Smart TVs','Installation-Guide/smart-tvs/'],['VPN','vpn.html'],['Resellers','reseller.html'],['Support','#support']];
 const nav=document.createElement('nav');nav.className='orbit-route-nav';nav.setAttribute('aria-label','Explore OrbitTV');
 routes.forEach(([name,path])=>{const a=document.createElement('a');a.href=new URL(path||'./',root);a.textContent=name;if(!path.includes('#')&&new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');nav.append(a);});
 const header=document.querySelector('body > header,body > .nav,body > .site-header');
 if(header)header.after(nav);else if(main)main.before(nav);
 const menu=document.getElementById('menu'),menuNav=document.querySelector('#navigation,#nav');
 if(menu&&menuNav){
  menu.setAttribute('aria-controls',menuNav.id);menu.setAttribute('aria-expanded',String(menuNav.classList.contains('open')));
  if(!document.querySelector('script[src*="orbit-home-v2.js"],script[src*="full-browser.js"]'))menu.addEventListener('click',()=>menuNav.classList.toggle('open'));
  new MutationObserver(()=>menu.setAttribute('aria-expanded',String(menuNav.classList.contains('open')))).observe(menuNav,{attributes:true,attributeFilter:['class']});
  menuNav.addEventListener('click',e=>{if(e.target.closest('a'))menuNav.classList.remove('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuNav.classList.contains('open')){menuNav.classList.remove('open');menu.focus();}});
 }
 const top=document.createElement('button');top.type='button';top.className='orbit-top';top.textContent='↑';top.setAttribute('aria-label','Back to top');top.hidden=true;document.body.append(top);
 top.onclick=()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 window.addEventListener('scroll',()=>{top.hidden=scrollY<700;},{passive:true});
 document.querySelectorAll('input[type=search]').forEach(input=>{if(!input.labels?.length&&!input.hasAttribute('aria-label'))input.setAttribute('aria-label',input.placeholder||'Search');});
})();
