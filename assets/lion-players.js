(() => {
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-lion-copy]');
    if (!button) return;
    const code = button.dataset.lionCopy;
    const status = document.querySelector('.lion-copy-status');
    try {
      await navigator.clipboard.writeText(code);
      status.textContent = `${window.orbitText?.('Copied:') || 'Copied:'} ${code}`;
    } catch {
      status.textContent = `${window.orbitText?.('Select and copy:') || 'Select and copy:'} ${code}`;
    }
  });
})();
