(() => {
  const closesAt = Date.parse('2026-12-07T20:15:00-05:00');
  function updatePromotion() {
    const open = Date.now() < closesAt;
    document.querySelector('[data-registration-promo]').hidden = !open;
    if (!open) {
      document.querySelector('[data-registration-message]').textContent = 'Registration for the December 3–7 slate has closed.';
      document.querySelectorAll('[data-week13-link]').forEach(link => {
        link.textContent = 'Week 13 registration details';
      });
    }
  }
  updatePromotion();
  window.setInterval(updatePromotion, 60000);
})();
