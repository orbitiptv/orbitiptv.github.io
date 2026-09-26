(() => {
  const root = new URL('.', document.currentScript.src);
  const main = document.querySelector('main');
  if (main && !document.querySelector('.skip,.skip-link,.orbit-skip,.orbit-skip-link')) {
    main.id ||= 'main-content';
    const skip = document.createElement('a');
    skip.className = 'orbit-skip-link'; skip.href = '#' + main.id; skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }
  const menu = document.getElementById('menu'), navigation = document.getElementById('navigation');
  if (menu && navigation) document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus();
    }
  });
  const footer = document.querySelector('body > footer, body > .footer');
  if (footer) {
    const routes = [['Home',''],['Pricing','#pricing'],['Lion OTT','#lion-ott'],['Videos','#videos'],['Reseller','reseller.html'],['Channel List','channel-list/'],['Sports','sports.html'],['VPN','vpn.html'],['Player Downloads','orbit-player-downloads/'],['Installation','Installation-Guide/'],['Payment Center','Payment-Center/'],['FAQ','#faq'],['Support','#support']];
    const nav = document.createElement('nav'); nav.className = 'orbit-footer-links'; nav.setAttribute('aria-label','Explore OrbitTV');
    const existing = new Set([...footer.querySelectorAll('a')].map(a => a.href.replace(/index\.html(?=#|$)/,'')));
    for (const [label,path] of routes) { const href = new URL(path || './', root).href; if (existing.has(href)) continue; const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a); }
    if(nav.childElementCount) footer.append(nav);
  }
})();
