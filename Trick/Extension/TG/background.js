const PROXY_BASE = "https://bold-night.year-tucking-0v.workers.dev/?url=";
const SMILES_API_TARGET = "https://url-api-smiles-cua-ban.com/rate";
const STANDARD_API_TARGET = "https://api.exchangerate-api.com/v4/latest/USD";

const DEFAULT_RATES = {
  USD: 1,
  VND: 25400,
  JPY: 155,
  KRW: 1380,
  CNY: 7.25,
  EUR: 0.92,
  GBP: 0.79
};

async function syncAllRates() {
  // 1. Kéo Standard API
  try {
    const res = await fetch(`${PROXY_BASE}${encodeURIComponent(STANDARD_API_TARGET)}`);
    const data = await res.json();
    if (data && data.rates) {
      await chrome.storage.local.set({ rates: data.rates });
    }
  } catch (err) {
    console.warn("Lỗi fetch Standard API:", err);
  }

  // 2. Kéo Smiles API
  try {
    const res = await fetch(`${PROXY_BASE}${encodeURIComponent(SMILES_API_TARGET)}`);
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      let rateSmiles = 165;
      if (contentType.includes("application/json")) {
        const data = await res.json();
        rateSmiles = parseFloat(data.Rate || data.rate || 165);
      } else {
        const text = await res.text();
        const match = text.match(/(?:Rate|rate|tỷ giá|JPY\/VND)[^\d]*([\d,]+(?:\.\d+)?)/i);
        if (match && match[1]) rateSmiles = parseFloat(match[1].replace(/,/g, ""));
      }
      await chrome.storage.local.set({ rateSmiles });
    }
  } catch (err) {
    console.warn("Dùng fallback Smiles background:", err);
    await chrome.storage.local.set({ rateSmiles: 165.5 });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quick_convert_context",
    title: "Quy đổi \"%s\" sang VND",
    contexts: ["selection"]
  });
  syncAllRates();
});

chrome.runtime.onStartup.addListener(syncAllRates);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "quick_convert_context" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "CONTEXT_CONVERT_TRIGGER",
      selectedText: info.selectionText
    });
  }
});