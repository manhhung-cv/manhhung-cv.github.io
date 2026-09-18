importScripts('src/shared.js');

const tabBlockCounts = new Map();
const popunderQuarantine = new Map(); // [openerTabId, expirationTimestamp]

function updateBadge(tabId) {
  const count = tabBlockCounts.get(tabId) || 0;
  chrome.action.setBadgeText({ tabId, text: count > 0 ? String(Math.min(count, 99)) : '' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#0071e3' });
}

// Lưu trữ thống kê vĩnh viễn vào chrome.storage.local
async function recordGlobalStats(domain, type) {
  const { STORAGE_KEYS } = globalThis.NoPPShared;
  const data = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  const stats = data[STORAGE_KEYS.STATS] || {
    totalBlocked: 0,
    byType: {},
    byDomain: {}
  };

  stats.totalBlocked = (stats.totalBlocked || 0) + 1;
  if (type) stats.byType[type] = (stats.byType[type] || 0) + 1;
  if (domain) stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;

  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'NOPP_RECORD_EVENT') {
    const tabId = sender.tab?.id;
    const item = msg.event || {};
    const domain = globalThis.NoPPShared.getRegistrableDomain(new URL(sender.tab?.url || 'http://unknown').hostname);

    if (Number.isInteger(tabId)) {
      const current = tabBlockCounts.get(tabId) || 0;
      tabBlockCounts.set(tabId, current + 1);
      updateBadge(tabId);

      // Kích hoạt cửa sổ kiểm dịch 1.5s nếu click-overlay kích hoạt bẫy mở tab con ngầm
      if (item.type === 'click-overlay') {
        popunderQuarantine.set(tabId, Date.now() + 1500);
      }
    }

    recordGlobalStats(domain, item.type);
    sendResponse({ ok: true });
  }

  if (msg.type === 'NOPP_GET_STATS') {
    (async () => {
      const { STORAGE_KEYS } = globalThis.NoPPShared;
      const data = await chrome.storage.local.get(STORAGE_KEYS.STATS);
      const tabId = msg.tabId;
      const tabCount = tabBlockCounts.get(tabId) || 0;

      sendResponse({
        tabCount,
        globalStats: data[STORAGE_KEYS.STATS] || { totalBlocked: 0, byType: {}, byDomain: {} }
      });
    })();
    return true;
  }
  return true;
});

// Tiêu diệt tab con sinh ra bất ngờ trong cửa sổ kiểm dịch
chrome.tabs.onCreated.addListener((tab) => {
  const openerId = tab.openerTabId;
  if (!openerId) return;

  const validUntil = popunderQuarantine.get(openerId) || 0;
  if (Date.now() < validUntil) {
    chrome.tabs.remove(tab.id).catch(() => {});
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabBlockCounts.delete(tabId);
  popunderQuarantine.delete(tabId);
});