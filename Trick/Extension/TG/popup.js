const PROXY_BASE = "https://bold-night.year-tucking-0v.workers.dev/?url=";
const SMILES_API_TARGET = "https://url-api-smiles-cua-ban.com/rate";
const STANDARD_API_TARGET = "https://api.exchangerate-api.com/v4/latest/USD";

let ratesStandard = {};
let rateSmiles = 165;
let currentSource = "smiles";
let lastEdited = 1;
let currentHostname = "";

// Elements
const globalEnableToggle = document.getElementById("globalEnableToggle");
const siteEnableToggle = document.getElementById("siteEnableToggle");
const currentSiteDomain = document.getElementById("currentSiteDomain");
const siteControlRow = document.getElementById("siteControlRow");
const sourceSelect = document.getElementById("sourceSelect");
const val1 = document.getElementById("val1");
const val2 = document.getElementById("val2");
const cur1 = document.getElementById("cur1");
const cur2 = document.getElementById("cur2");
const swapBtn = document.getElementById("swapBtn");
const rateSummary = document.getElementById("rateSummary");
const lastUpdated = document.getElementById("lastUpdated");
const smilesWarning = document.getElementById("smilesWarning");

function parseNum(val) {
  return parseFloat(String(val).replace(/,/g, "")) || 0;
}

function formatNum(val) {
  return Number(val).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Xử lý bật/tắt Toggle
async function initToggleStates() {
  const store = await chrome.storage.local.get(["globalEnabled", "disabledDomains"]);
  const globalEnabled = store.globalEnabled !== false; // Mặc định là true
  const disabledDomains = store.disabledDomains || [];

  globalEnableToggle.checked = globalEnabled;

  // Lấy domain của tab hiện tại
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.startsWith("http")) {
    const url = new URL(tab.url);
    currentHostname = url.hostname;
    currentSiteDomain.textContent = currentHostname;
    siteEnableToggle.checked = !disabledDomains.includes(currentHostname);
  } else {
    siteControlRow.style.display = "none";
  }

  // Sự kiện Toggle toàn bộ
  globalEnableToggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ globalEnabled: globalEnableToggle.checked });
  });

  // Sự kiện Toggle trên từng trang
  siteEnableToggle.addEventListener("change", async () => {
    if (!currentHostname) return;
    const currentStore = await chrome.storage.local.get("disabledDomains");
    let domains = currentStore.disabledDomains || [];

    if (siteEnableToggle.checked) {
      domains = domains.filter(d => d !== currentHostname);
    } else {
      if (!domains.includes(currentHostname)) domains.push(currentHostname);
    }
    await chrome.storage.local.set({ disabledDomains: domains });
  });
}

async function fetchSmiles() {
  try {
    const res = await fetch(`${PROXY_BASE}${encodeURIComponent(SMILES_API_TARGET)}`);
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        rateSmiles = parseFloat(data.Rate || data.rate || 165);
      } else {
        const text = await res.text();
        const match = text.match(/(?:Rate|rate|tỷ giá|JPY\/VND)[^\d]*([\d,]+(?:\.\d+)?)/i);
        if (match && match[1]) rateSmiles = parseFloat(match[1].replace(/,/g, ""));
      }
    }
  } catch (e) {
    rateSmiles = 165.5;
  }
  await chrome.storage.local.set({ rateSmiles, currentSource, lastUpdated: Date.now() });
}

async function fetchStandard() {
  try {
    const res = await fetch(`${PROXY_BASE}${encodeURIComponent(STANDARD_API_TARGET)}`);
    const data = await res.json();
    if (data && data.rates) {
      ratesStandard = data.rates;
      await chrome.storage.local.set({ rates: data.rates, currentSource, lastUpdated: Date.now() });
    }
  } catch (e) {
    console.warn("Lỗi Standard API:", e);
  }
}

function calculate() {
  const c1 = cur1.value;
  const c2 = cur2.value;
  let unitRate = 0;

  if (currentSource === "smiles") {
    if (c1 === "JPY" && c2 === "VND") unitRate = rateSmiles;
    else if (c1 === "VND" && c2 === "JPY") unitRate = 1 / rateSmiles;
    else unitRate = 1;
  } else {
    const r1 = ratesStandard[c1] || 1;
    const r2 = ratesStandard[c2] || 1;
    unitRate = r2 / r1;
  }

  rateSummary.innerHTML = `1 ${c1} ≈ <b>${formatNum(unitRate)}</b> ${c2}`;

  if (lastEdited === 1) {
    val2.value = formatNum(parseNum(val1.value) * unitRate);
  } else {
    val1.value = formatNum(parseNum(val2.value) / unitRate);
  }
}

sourceSelect.addEventListener("change", async (e) => {
  currentSource = e.target.value;
  if (currentSource === "smiles") {
    cur1.value = "JPY";
    cur2.value = "VND";
    smilesWarning.style.display = "block";
    await fetchSmiles();
  } else {
    smilesWarning.style.display = "none";
    if (Object.keys(ratesStandard).length === 0) await fetchStandard();
  }
  await chrome.storage.local.set({ currentSource });
  calculate();
});

[cur1, cur2].forEach((sel) => {
  sel.addEventListener("change", () => {
    if (currentSource === "smiles") {
      if (cur1.value !== "JPY" && cur1.value !== "VND") cur1.value = "JPY";
      if (cur2.value !== "JPY" && cur2.value !== "VND") cur2.value = "VND";
    }
    calculate();
  });
});

val1.addEventListener("input", () => { lastEdited = 1; calculate(); });
val2.addEventListener("input", () => { lastEdited = 2; calculate(); });

swapBtn.addEventListener("click", () => {
  const tmp = cur1.value;
  cur1.value = cur2.value;
  cur2.value = tmp;
  calculate();
});

document.addEventListener("DOMContentLoaded", async () => {
  await initToggleStates();

  const store = await chrome.storage.local.get(["rates", "rateSmiles", "currentSource", "lastUpdated"]);
  if (store.currentSource) {
    currentSource = store.currentSource;
    sourceSelect.value = currentSource;
  }
  if (store.rateSmiles) rateSmiles = store.rateSmiles;
  if (store.rates) ratesStandard = store.rates;

  if (currentSource === "smiles") {
    smilesWarning.style.display = "block";
    await fetchSmiles();
  } else {
    smilesWarning.style.display = "none";
    await fetchStandard();
  }

  lastUpdated.innerText = `Cập nhật: ${new Date().toLocaleTimeString()}`;
  calculate();
});