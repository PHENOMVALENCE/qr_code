/* Compatibility fixes for QR Studio pro enhancements. */
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

  function init() {
    protectHistoryRefresh();
    var host = document.getElementById('studio-tools');
    if (host) new MutationObserver(protectHistoryRefresh).observe(host, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
