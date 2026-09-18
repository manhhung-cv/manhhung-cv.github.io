document.addEventListener('DOMContentLoaded', async () => {
  const { STORAGE_KEYS, getRegistrableDomain } = globalThis.NoPPShared;
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const domainNameEl = document.getElementById('domainName');
  const tabBlockCountEl = document.getElementById('tabBlockCount');
  const totalBlockCountEl = document.getElementById('totalBlockCount');
  const statPopupEl = document.getElementById('statPopup');
  const statOverlayEl = document.getElementById('statOverlay');
  const statRedirectEl = document.getElementById('statRedirect');
  const toggleBtn = document.getElementById('toggleBtn');

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.url || !activeTab.url.startsWith('http')) {
    domainNameEl.textContent = 'Trang hệ thống';
    toggleBtn.disabled = true;
    return;
  }

  const hostname = new URL(activeTab.url).hostname;
  const baseDomain = getRegistrableDomain(hostname);
  domainNameEl.textContent = baseDomain;

  // Lấy dữ liệu thống kê từ background
  chrome.runtime.sendMessage({ type: 'NOPP_GET_STATS', tabId: activeTab.id }, (res) => {
    if (!res) return;

    tabBlockCountEl.textContent = res.tabCount || 0;
    const stats = res.globalStats || {};
    totalBlockCountEl.textContent = stats.totalBlocked || 0;

    const types = stats.byType || {};
    statPopupEl.textContent = (types['window.open'] || 0) + (types['external-tab'] || 0);
    statOverlayEl.textContent = types['click-overlay'] || 0;
    statRedirectEl.textContent = types['programmatic-redirect'] || 0;
  });

  async function renderState() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.WHITELIST);
    const whitelist = Array.isArray(data[STORAGE_KEYS.WHITELIST]) ? data[STORAGE_KEYS.WHITELIST] : [];
    const isWhitelisted = whitelist.includes(baseDomain);

    if (isWhitelisted) {
      statusDot.className = 'status-dot off';
      statusText.textContent = 'Đã tắt';
      toggleBtn.textContent = 'Bật lại bảo vệ';
      toggleBtn.className = 'btn active';
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Đang bảo vệ';
      toggleBtn.textContent = 'Tắt bảo vệ trang này';
      toggleBtn.className = 'btn';
    }
  }

  toggleBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(STORAGE_KEYS.WHITELIST);
    let whitelist = Array.isArray(data[STORAGE_KEYS.WHITELIST]) ? data[STORAGE_KEYS.WHITELIST] : [];

    if (whitelist.includes(baseDomain)) {
      whitelist = whitelist.filter((d) => d !== baseDomain);
    } else {
      whitelist.push(baseDomain);
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.WHITELIST]: whitelist });
    await renderState();
    chrome.tabs.reload(activeTab.id);
  });

  renderState();
});