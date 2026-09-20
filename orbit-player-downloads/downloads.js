'use strict';
const copyButton = document.getElementById('copy-code');
copyButton.addEventListener('click', async () => {
  const code = document.getElementById('downloader-code').textContent.trim();
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(code);
    status.textContent = 'Code copied: ' + code;
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('downloader-code'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Select and copy this code: ' + code;
  }
});
