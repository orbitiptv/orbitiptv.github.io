'use strict';
document.addEventListener('click', async event => {
 const button=event.target.closest('#copy-code,.copy-player-code');
 if(!button)return;
 const original=button.id==='copy-code';
 const scope=original?button.closest('.download-card'):button.closest('.catalog-code');
 const codeElement=original?document.getElementById('downloader-code'):scope.querySelector('strong');
 const code=codeElement.textContent.trim();
 const status=original?document.getElementById('copy-status'):scope.querySelector('.catalog-copy-status');
 try {
  await navigator.clipboard.writeText(code);
  status.textContent='Copied: '+code;
 } catch {
  const selection=window.getSelection(), range=document.createRange();
  range.selectNodeContents(codeElement);selection.removeAllRanges();selection.addRange(range);
  status.textContent='Select and copy: '+code;
 }
});
