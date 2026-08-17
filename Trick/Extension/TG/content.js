let rates = { USD: 1, VND: 25400, JPY: 155, KRW: 1380, CNY: 7.25, EUR: 0.92, GBP: 0.79 };
let rateSmiles = 165;
let currentSource = "smiles";

let isGlobalEnabled = true;
let isSiteDisabled = false;

// Đọc cài đặt bật tắt và tỷ giá
function syncSettings() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["rates", "rateSmiles", "currentSource", "globalEnabled", "disabledDomains"], (res) => {
      if (res.rates) rates = res.rates;
      if (res.rateSmiles) rateSmiles = res.rateSmiles;
      if (res.currentSource) currentSource = res.currentSource;
      
      isGlobalEnabled = res.globalEnabled !== false;
      const disabledDomains = res.disabledDomains || [];
      isSiteDisabled = disabledDomains.includes(window.location.hostname);
    });
  }
}
syncSettings();

// Lắng nghe thay đổi từ Popup tức thì mà không cần load lại trang
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.globalEnabled) isGlobalEnabled = changes.globalEnabled.newValue;
    if (changes.disabledDomains) {
      const domains = changes.disabledDomains.newValue || [];
      isSiteDisabled = domains.includes(window.location.hostname);
    }
    if (changes.rates) rates = changes.rates.newValue;
    if (changes.rateSmiles) rateSmiles = changes.rateSmiles.newValue;
    if (changes.currentSource) currentSource = changes.currentSource.newValue;
  });
}

// Kiểm tra xem tiện ích có được phép chạy trên trang này không
function isEnabled() {
  return isGlobalEnabled && !isSiteDisabled;
}

let tooltipEl = null;
function getOrCreateTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "cur-pro-tooltip";
    document.documentElement.appendChild(tooltipEl);
  }
  return tooltipEl;
}

const STRICT_CURRENCY_PATTERNS = [
  { cur: "JPY", regex: /(?:[¥￥])\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:円|[¥￥]|JPY|jpy)/ },
  { cur: "USD", regex: /\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:\$|USD|usd)/ },
  { cur: "KRW", regex: /₩\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:원|₩|KRW|krw)/ },
  { cur: "EUR", regex: /€\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:€|EUR|eur)/ },
  { cur: "CNY", regex: /(?:CN¥|RMB)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:元|CNY|cny|RMB|rmb)/ },
  { cur: "GBP", regex: /£\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:£|GBP|gbp)/ }
];

function parsePrice(text, allowFallbackByDomain = false) {
  if (!text || typeof text !== "string") return null;
  const str = text.trim();

  for (const item of STRICT_CURRENCY_PATTERNS) {
    const match = str.match(item.regex);
    if (match) {
      const rawNum = match[1] || match[2];
      if (rawNum) {
        const cleanNum = parseFloat(rawNum.replace(/,/g, ""));
        if (!isNaN(cleanNum) && cleanNum > 0) {
          return { amount: cleanNum, currency: item.cur };
        }
      }
    }
  }

  if (allowFallbackByDomain) {
    const cleanNum = parseFloat(str.replace(/[^0-9.]/g, "").replace(/,/g, ""));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      let defaultCur = "USD";
      const host = window.location.hostname;
      if (host.includes("amazon.co.jp") || host.endsWith(".jp")) defaultCur = "JPY";
      else if (host.includes("amazon.de") || host.includes("amazon.fr")) defaultCur = "EUR";
      else if (host.includes("amazon.co.uk")) defaultCur = "GBP";

      return { amount: cleanNum, currency: defaultCur };
    }
  }

  return null;
}

function calculateVND(amount, currency) {
  if (currency === "JPY" && currentSource === "smiles" && rateSmiles > 0) {
    return Math.round(amount * rateSmiles);
  }
  const vndRate = rates["VND"] || 25400;
  const currRate = rates[currency] || 1;
  return Math.round((amount / currRate) * vndRate);
}

function showTooltip(x, y, originalText, convertedVnd) {
  const tip = getOrCreateTooltip();
  const sourceBadge = currentSource === "smiles" ? "Smiles" : "Standard";
  tip.innerHTML = `
    <div class="cur-header">
      <span class="cur-vnd">${convertedVnd.toLocaleString("vi-VN")} ₫</span>
      <span style="font-size: 9px; background: #27272a; padding: 2px 5px; border-radius: 4px; color: #a1a1aa;">${sourceBadge}</span>
    </div>
    <div class="cur-sub">${originalText}</div>
  `;
  tip.style.left = `${x + 10}px`;
  tip.style.top = `${y + 15}px`;
  tip.classList.add("cur-visible");
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove("cur-visible");
}

// 1. HOVER EVENT
document.addEventListener("mouseover", (e) => {
  if (!isEnabled()) return;

  const target = e.target;
  if (!target || target === tooltipEl || tooltipEl?.contains(target)) return;

  const priceContainer = target.closest(".a-price, [class*='price'], [class*='Price'], [id*='price'], [id*='Price']") 
    || target.parentElement 
    || target;

  const rawText = (priceContainer.innerText || priceContainer.textContent || "").trim();
  if (rawText.length > 50) return;

  const parsed = parsePrice(rawText, false);
  if (parsed) {
    const vnd = calculateVND(parsed.amount, parsed.currency);
    const rect = target.getBoundingClientRect();
    showTooltip(
      rect.left + window.scrollX,
      rect.bottom + window.scrollY,
      `${parsed.amount.toLocaleString("en-US")} ${parsed.currency}`,
      vnd
    );
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.relatedTarget && (e.relatedTarget === tooltipEl || tooltipEl?.contains(e.relatedTarget))) return;
  hideTooltip();
});

// 2. SELECTION EVENT
document.addEventListener("mouseup", (e) => {
  if (!isEnabled()) return;

  const selection = window.getSelection().toString().trim();
  if (selection.length > 0 && selection.length < 35) {
    const parsed = parsePrice(selection, true);
    if (parsed) {
      const vnd = calculateVND(parsed.amount, parsed.currency);
      showTooltip(
        e.pageX,
        e.pageY,
        `${parsed.amount.toLocaleString("en-US")} ${parsed.currency}`,
        vnd
      );
    }
  }
});

// 3. CONTEXT MENU (Menu chuột phải vẫn hoạt động bình thường khi người dùng chủ động click)
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "CONTEXT_CONVERT_TRIGGER") {
    const parsed = parsePrice(req.selectedText, true);
    if (parsed) {
      const vnd = calculateVND(parsed.amount, parsed.currency);
      showTooltip(
        window.scrollX + (window.innerWidth / 2) - 75,
        window.scrollY + 60,
        `Quy đổi: ${parsed.amount.toLocaleString("en-US")} ${parsed.currency}`,
        vnd
      );
      setTimeout(hideTooltip, 4500);
    }
  }
});