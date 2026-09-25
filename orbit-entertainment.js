'use strict';
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-carousel]').forEach(button => {
    const observedTrack = document.getElementById(button.dataset.carousel);
    if (observedTrack) new ResizeObserver(() => { button.disabled = observedTrack.scrollWidth <= observedTrack.clientWidth + 2; }).observe(observedTrack);
    button.addEventListener('click', () => {
      const track = document.getElementById(button.dataset.carousel);
      if (!track) return;
      const direction = Number(button.dataset.direction);
      const max = track.scrollWidth - track.clientWidth;
      const atEnd = track.scrollLeft >= max - 3;
      const atStart = track.scrollLeft <= 3;
      const target = direction > 0 && atEnd ? 0 : direction < 0 && atStart ? max : track.scrollLeft + direction * track.clientWidth * .8;
      track.scrollTo({ left: target, behavior: reduced.matches ? 'instant' : 'smooth' });
    });
  });
  const choices = [...document.querySelectorAll('.channel-choice')];
  const select = button => {
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    const title = button.dataset.channel;
    document.getElementById('selected-channel').textContent = title;
    const link = document.getElementById('selected-channel-link');
    link.textContent = 'Find ' + title + ' in the channel list ↗';
  };
  choices.forEach((button, index) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus({preventScroll:true});
      choices[next].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest',inline:'nearest'});
      select(choices[next]);
    });
  });
})();

