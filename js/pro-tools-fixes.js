/* Compatibility fixes and final production bootstrap for QR Studio. */
(function () {
  'use strict';

  function protectHistoryRefresh() {
    var clear = document.getElementById('studio-clear-history');
    if (!clear || clear.__proProtected) return;
    clear.__proProtected = true;
    clear.addEventListener('click', function (event) {
      if (!event.isTrusted) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function loadProductionTools() {
    if (document.querySelector('script[data-production-tools]')) return;
    var script = document.createElement('script');
    script.src = 'js/production-tools.js';
    script.setAttribute('data-production-tools', 'true');
    document.head.appendChild(script);
  }

  function init() {
    protectHistoryRefresh();
    var host = document.getElementById('studio-tools');
    if (host) new MutationObserver(protectHistoryRefresh).observe(host, { childList: true, subtree: true });
    loadProductionTools();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
