'use strict';
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const tracks=[...document.querySelectorAll('.channel-track,.poster-track')];
 tracks.forEach(track=>{
  const controls=document.querySelector('[data-carousel="'+track.id+'"]')?.parentElement;
  if(!controls)return;
  const pause=document.createElement('button');
  pause.type='button';pause.className='carousel-pause';pause.textContent='Ⅱ';pause.setAttribute('aria-label','Pause automatic scrolling');pause.setAttribute('aria-pressed','false');controls.prepend(pause);
  let paused=reduce.matches,hover=false,focus=false,visible=false,last=0,position=track.scrollLeft,manualUntil=0;
  function status(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Start automatic scrolling':'Pause automatic scrolling');pause.setAttribute('aria-pressed',String(paused));}
  status();pause.onclick=()=>{paused=!paused;status();};
  reduce.addEventListener('change',()=>{paused=reduce.matches;status();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.1}).observe(track);
  track.addEventListener('pointerenter',()=>hover=true);track.addEventListener('pointerleave',()=>hover=false);
  track.addEventListener('focusin',()=>focus=true);track.addEventListener('focusout',()=>{focus=track.contains(document.activeElement);});
  ['touchstart','wheel','pointerdown'].forEach(type=>track.addEventListener(type,()=>{manualUntil=performance.now()+5000;},{passive:true}));
  function stepSize(){const first=track.firstElementChild;return first?first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||0):0;}
  function normalize(){
   const step=stepSize();
   if(step&&(track.scrollLeft>=step || track.scrollLeft>=track.scrollWidth-track.clientWidth-.75)){const old=track.scrollLeft;track.append(track.firstElementChild);track.scrollLeft=old-step;}
   position=track.scrollLeft;
  }
  controls.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>{
   manualUntil=performance.now()+5000;
   if(Number(button.dataset.direction)>0){track.append(track.firstElementChild);track.scrollLeft=0;}
   else{track.prepend(track.lastElementChild);track.scrollLeft=0;}
   position=track.scrollLeft;
  }));
  function frame(time){
   const dt=Math.min(time-last,50);last=time;
   if(visible&&!paused&&!hover&&!focus&&!document.hidden&&time> manualUntil&&track.scrollWidth>track.clientWidth+2){
    position+=dt*.024;track.scrollLeft=position;
    if(track.scrollLeft>=stepSize())normalize();
   }else position=track.scrollLeft;
   requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 });
 const choices=[...document.querySelectorAll('.channel-choice')];
 function select(button){
  choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
  document.getElementById('selected-channel').textContent=button.dataset.channel;
  document.getElementById('selected-channel-link').textContent='Find '+button.dataset.channel+' in the channel list ↗';
 }
 choices.forEach((button,index)=>{
  button.onclick=()=>select(button);
  button.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?choices.length-1:(index+(event.key==='ArrowRight'?1:-1)+choices.length)%choices.length;
   choices[next].focus({preventScroll:true});choices[next].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});select(choices[next]);
  });
 });
})();
