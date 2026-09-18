(() => {
  'use strict';

  const S = globalThis.NoPPShared;
  if (!S || !S.STORAGE_KEYS || typeof S.getRegistrableDomain !== 'function') return;

  const { STORAGE_KEYS, getRegistrableDomain } = S;
  const currentDomain = getRegistrableDomain(location.hostname);

  async function syncConfiguration() {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEYS.WHITELIST);
      const whitelist = Array.isArray(data[STORAGE_KEYS.WHITELIST]) ? data[STORAGE_KEYS.WHITELIST] : [];
      const shouldEnable = !whitelist.includes(currentDomain);

      window.dispatchEvent(new CustomEvent('__nopp_sync_config__', {
        detail: JSON.stringify({ enabled: shouldEnable })
      }));
    } catch (_) {}
  }

  // Lắng nghe sự kiện chặn từ MAIN World và gửi về Background
  window.addEventListener('__nopp_blocked__', (e) => {
    let payload = e.detail;
    if (!payload) return;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (_) { return; }
    }

    try {
      chrome.runtime.sendMessage({
        type: 'NOPP_RECORD_EVENT',
        event: payload
      }).catch(() => {});
    } catch (_) {}
  });

  if (chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[STORAGE_KEYS.WHITELIST]) {
        syncConfiguration();
      }
    });
  }

  syncConfiguration();
})();