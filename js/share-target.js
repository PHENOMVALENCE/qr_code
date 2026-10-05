/* PWA share-target intake */
(function () {
  'use strict';

  function dispatch(node) {
    if (!node) return;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function switchType(type) {
    var button = document.querySelector('.content-type-btn[data-type="' + type + '"]');
    if (button) button.click();
  }

  function isUrl(value) {
    try {
      var parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  function init() {
    var params = new URLSearchParams(location.search);
    if (params.get('share-target') !== '1') return;
    var sharedUrl = (params.get('url') || '').trim();
    var text = (params.get('text') || '').trim();
    var title = (params.get('title') || '').trim();
    var candidate = sharedUrl || text;
    if (!candidate) return;

    if (isUrl(candidate)) {
      switchType('url');
      var urlInput = document.getElementById('content-url');
      if (urlInput) { urlInput.value = candidate; dispatch(urlInput); }
    } else {
      switchType('text');
      var textInput = document.getElementById('content-text');
      if (textInput) { textInput.value = [title, text].filter(Boolean).join('\n\n').slice(0, 2000); dispatch(textInput); }
    }
    var generate = document.getElementById('generate-btn');
    if (generate) generate.click();
    history.replaceState({}, document.title, location.pathname);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
