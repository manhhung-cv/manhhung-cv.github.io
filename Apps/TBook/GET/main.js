const WORKER_BASE = "https://bold-night.year-tucking-0v.workers.dev";
const PROXY_SINGLE = `${WORKER_BASE}/?url=`;
const PROXY_BATCH = `${WORKER_BASE}/batch`;

const LEGAL_NOTICE_TEXT = `[TUYÊN BỐ MIỄN TRÁCH NHIỆM & BẢN QUYỀN]
Toàn bộ nội dung tác phẩm này thuộc quyền sở hữu của tác giả gốc và các đơn vị phát hành. Tệp này được tạo ra hoàn toàn tự động bằng công cụ StoryDL phục vụ mục đích đọc cá nhân ngoại tuyến, không lưu trữ cố định trên máy chủ trung gian và phi thương mại. Người dùng tự chịu mọi trách nhiệm pháp lý nếu sử dụng tệp dữ liệu này để tái phân phối, kinh doanh hoặc xâm phạm bản quyền tác giả.`;

// Danh mục Scraper module độc lập trong thư mục ./w/
const SCRAPERS_REGISTRY = [
  { key: 'wattpad', path: './w/wattpad.js' },
  { key: 'truyenmo', path: './w/truyenmo.js' },
  { key: 'sstruyen', path: './w/sstruyen.js' }
];

// Cấu hình tốc độ & kích thước Batch thích ứng cho từng nguồn tránh lỗi 429
const SOURCE_PROFILES = {
  wattpad: {
    batchSize: 20,
    delayMs: 40
  },
  sstruyen: {
    batchSize: 6,       // Bó 6 chương/lần: tốc độ tối ưu dưới ngưỡng kiểm duyệt của WAF SSTruyen
    delayMs: 200       // Nhịp thở 200ms giữa các mẻ
  },
  default: {
    batchSize: 10,
    delayMs: 120
  }
};

let activeScraper = null;
let currentStoryMeta = null;
let abortController = null;
let pendingResolve = null;

// Hàm delay hỗ trợ ngắt tức thì khi người dùng bấm Hủy
const delay = (ms, signal = null) => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Đã hủy quá trình.", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException("Đã hủy quá trình.", "AbortError"));
    }, { once: true });
  });
};

function parseDom(htmlString) {
  return new DOMParser().parseFromString(htmlString, 'text/html');
}

// 1. Fetch Proxy đơn lẻ có Exponential Backoff (dùng cho Inspect hoặc Fallback)
async function fetchProxy(targetUrl, isJson = true, signal = null) {
  let waitMs = 1500;
  while (true) {
    if (signal?.aborted) throw new DOMException("Đã hủy quá trình.", "AbortError");
    try {
      const res = await fetch(PROXY_SINGLE + encodeURIComponent(targetUrl), { signal });
      if (res.status === 429) {
        await delay(waitMs, signal);
        waitMs = Math.min(waitMs + 1000, 4000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return isJson ? await res.json() : await res.text();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      await delay(1000, signal);
    }
  }
}

// 2. Fetch Batch đa luồng trực tiếp tại Edge Cloudflare
async function fetchBatch(urls, signal = null) {
  let waitMs = 1500;
  while (true) {
    if (signal?.aborted) throw new DOMException("Đã hủy quá trình.", "AbortError");
    try {
      const res = await fetch(PROXY_BATCH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
        signal
      });

      if (res.status === 429) {
        await delay(waitMs, signal);
        waitMs = Math.min(waitMs + 1000, 4000);
        continue;
      }

      if (!res.ok) throw new Error(`Batch HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      await delay(1200, signal);
    }
  }
}

const scraperContext = {
  fetchProxy,
  fetchBatch,
  parseDom,
  delay
};

// ==================== ROUTER DYNAMIC ====================
async function resolveScraper(cleanUrl) {
  for (const item of SCRAPERS_REGISTRY) {
    try {
      const module = await import(item.path);
      const scraper = module.default;
      const matchedInfo = scraper.match(cleanUrl);
      if (matchedInfo) {
        scraper.key = item.key;
        return { scraper, info: matchedInfo };
      }
    } catch (e) {
      console.error(`Lỗi nạp scraper ${item.path}:`, e);
    }
  }
  return null;
}

async function loadScraperByKey(key, cleanUrl) {
  const target = SCRAPERS_REGISTRY.find(s => s.key === key);
  if (!target) return null;
  const module = await import(target.path);
  const scraper = module.default;
  scraper.key = key;
  return { scraper, info: { originalUrl: cleanUrl } };
}

// ==================== BƯỚC 1: TRA CỨU THÔNG TIN (INSPECT) ====================
window.inspectStoryUrl = async function() {
  const urlInput = document.getElementById('storyUrl').value.trim();
  const btnInspect = document.getElementById('btnInspect');

  if (!urlInput) {
    alert("Vui lòng dán liên kết truyện hoặc chương cần tải!");
    return;
  }

  const cleanUrl = urlInput.split('?')[0].replace(/\/+$/, '');
  let resolved = await resolveScraper(cleanUrl);

  if (!resolved) {
    const chosenKey = await askUserForSource();
    if (!chosenKey) return;
    resolved = await loadScraperByKey(chosenKey, cleanUrl);
  }

  if (!resolved || !resolved.scraper) {
    alert("Không tìm thấy bộ phân tích dữ liệu phù hợp!");
    return;
  }

  activeScraper = resolved.scraper;
  const info = resolved.info;

  btnInspect.disabled = true;
  btnInspect.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Đang tra cứu dữ liệu...</span>`;

  try {
    const metadata = await activeScraper.inspect(info, scraperContext);
    if (!metadata) throw new Error("Không lấy được dữ liệu tác phẩm.");

    currentStoryMeta = metadata;

    // Hiển thị thông tin an toàn
    document.getElementById('previewTitle').innerText = metadata.title;
    document.getElementById('previewSource').innerText = metadata.sourceName;
    document.getElementById('previewAuthor').innerText = metadata.author;
    
    const genresEl = document.getElementById('previewGenres');
    if (genresEl) {
      genresEl.innerText = metadata.genres || "Chưa phân loại";
    }

    const totalCount = metadata.expectedTotal || 
                       metadata.totalChaptersCount || 
                       (metadata.chaptersList ? metadata.chaptersList.length : 0);
                       
    const extraInfo = metadata.latestChapName ? ` (${metadata.latestChapName})` : '';
    document.getElementById('previewChapterCount').innerText = `${totalCount} chương${extraInfo}`;
    
    document.getElementById('previewDesc').innerText = metadata.description || "Tác phẩm không có phần tóm tắt.";

    document.getElementById('stepInput').classList.add('hidden');
    document.getElementById('stepPreview').classList.remove('hidden');

  } catch (err) {
    alert("Lỗi tra cứu: " + err.message);
    console.error(err);
  } finally {
    btnInspect.disabled = false;
    btnInspect.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><span>Tra cứu thông tin</span>`;
  }
  
};

// ==================== BƯỚC 2: TẢI BATCH & ĐÓNG GÓI TẬP TIN ====================
window.startExecutionDownload = async function() {
  if (!currentStoryMeta || !activeScraper) return;

  const format = document.querySelector('input[name="format"]:checked').value;
  abortController = new AbortController();

  document.getElementById('stepPreview').classList.add('hidden');
  document.getElementById('stepProgress').classList.remove('hidden');

  const { title, author, genres, description, sourceName } = currentStoryMeta;
  let chaptersList = currentStoryMeta.chaptersList;

  try {
    // 1. Nạp đầy đủ danh sách chương thật (qua hàm loadAllChapters nếu có)
    if (typeof activeScraper.loadAllChapters === 'function') {
      updateProgress(2, "Đang lấy danh mục chương thật...");
      chaptersList = await activeScraper.loadAllChapters(currentStoryMeta, {
        ...scraperContext,
        updateProgress,
        signal: abortController.signal
      });
      currentStoryMeta.chaptersList = chaptersList;
    }

    if (!chaptersList || chaptersList.length === 0) {
      throw new Error("Không tìm thấy chương nào để tải!");
    }

    const total = chaptersList.length;
    const downloadedParts = [];

    // Chọn profile tốc độ phù hợp theo từng nguồn
    const sourceKey = activeScraper.key || activeScraper.name?.toLowerCase() || 'default';
    const profile = SOURCE_PROFILES[sourceKey] || SOURCE_PROFILES.default;
    const BATCH_SIZE = profile.batchSize;

    // 2. Chạy tải Batch siêu tốc
    for (let i = 0; i < total; i += BATCH_SIZE) {
      if (abortController.signal.aborted) {
        throw new DOMException("Người dùng đã hủy quá trình tải.", "AbortError");
      }

      const chunk = chaptersList.slice(i, i + BATCH_SIZE);
      const toIndex = Math.min(i + BATCH_SIZE, total);
      const pct = 5 + Math.round((toIndex / total) * 85);
      updateProgress(pct, `Đang tải: [${toIndex}/${total}] chương...`);

      // Gửi danh sách URLs lên Edge Worker
      const batchResults = await fetchBatch(chunk.map(c => c.fetchUrl), abortController.signal);

      // Ghép kết quả trả về từ Edge
      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const res = batchResults[j];

        if (res && res.status === 200 && res.content) {
          downloadedParts.push({
            title: res.title || item.title,
            content: res.content
          });
        } else {
          // Chỉ fallback fetch đơn lẻ khi batch gặp trục trặc
          try {
            await delay(profile.delayMs, abortController.signal);
            const fallbackContent = await activeScraper.fetchChapterContent(item, {
              ...scraperContext,
              signal: abortController.signal
            });
            downloadedParts.push({ title: item.title, content: fallbackContent });
          } catch {
            downloadedParts.push({ title: item.title, content: "<p>[Không thể tải nội dung chương]</p>" });
          }
        }
      }

      // Khoảng nghỉ an toàn giữa các đợt batch
      await delay(profile.delayMs, abortController.signal);
    }

    // 3. Đóng gói tập tin theo định dạng
    updateProgress(95, `Đang đóng gói file ${format.toUpperCase()}...`);
    const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '_').trim();

    if (format === 'json') {
      const bookData = {
        title, author, genres: genres || "Chưa phân loại", source: sourceName,
        legalNotice: LEGAL_NOTICE_TEXT, description,
        totalChapters: downloadedParts.length, chapters: downloadedParts
      };
      downloadBlob(new Blob([JSON.stringify(bookData, null, 2)], { type: 'application/json' }), `${safeTitle}.json`);
    } else if (format === 'html') {
      const htmlDoc = generateHtmlDocument(title, author, genres, sourceName, description, downloadedParts);
      downloadBlob(new Blob([htmlDoc], { type: 'text/html;charset=utf-8' }), `${safeTitle}.html`);
    } else if (format === 'epub') {
      const epubBlob = await generateEpubBlob(title, author, genres, sourceName, description, downloadedParts);
      downloadBlob(epubBlob, `${safeTitle}.epub`);
    } else if (format === 'pdf') {
      await generatePdfDocument(title, author, genres, sourceName, description, downloadedParts, `${safeTitle}.pdf`);
    }

    updateProgress(100, "Đóng gói hoàn tất!");
    document.getElementById('stepProgress').classList.add('hidden');
    document.getElementById('stepSuccess').classList.remove('hidden');

  } catch (err) {
    if (err.name === 'AbortError') {
      alert("Đã hủy quá trình tải tác phẩm!");
    } else {
      alert("Đã xảy ra lỗi: " + err.message);
      console.error(err);
    }
    window.resetToSearch();
  } finally {
    abortController = null;
  }
};

// ==================== CÁC HÀM UI & MODAL ====================
function askUserForSource() {
  return new Promise((resolve) => {
    pendingResolve = resolve;
    const modal = document.getElementById('sourceModal');
    if (modal) modal.classList.remove('hidden');
  });
}

window.confirmManualSource = function(sourceKey) {
  const modal = document.getElementById('sourceModal');
  if (modal) modal.classList.add('hidden');
  if (pendingResolve) {
    pendingResolve(sourceKey);
    pendingResolve = null;
  }
};

window.closeSourceModal = function() {
  const modal = document.getElementById('sourceModal');
  if (modal) modal.classList.add('hidden');
  if (pendingResolve) {
    pendingResolve(null);
    pendingResolve = null;
  }
};

window.abortCurrentDownload = function() {
  if (abortController) abortController.abort();
};

window.resetToSearch = function() {
  document.getElementById('stepProgress').classList.add('hidden');
  document.getElementById('stepSuccess').classList.add('hidden');
  document.getElementById('stepPreview').classList.add('hidden');
  document.getElementById('stepInput').classList.remove('hidden');
  updateProgress(0, '');
};

window.resetAllForm = function() {
  currentStoryMeta = null;
  activeScraper = null;
  document.getElementById('storyUrl').value = '';
  window.resetToSearch();
};

window.handlePasteUrl = async function() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) document.getElementById('storyUrl').value = text.trim();
  } catch {
    const fallback = prompt("Dán đường link truyện vào đây:");
    if (fallback) document.getElementById('storyUrl').value = fallback.trim();
  }
};

window.handleClearUrl = function() {
  document.getElementById('storyUrl').value = '';
};

window.toggleLegalDetails = function() {
  const details = document.getElementById('legalDetails');
  const icon = document.getElementById('legalIcon');
  if (!details || !icon) return;
  const isHidden = details.classList.contains('hidden');
  details.classList.toggle('hidden', !isHidden);
  icon.classList.toggle('rotate-180', isHidden);
};

function updateProgress(percent, text) {
  const bar = document.getElementById('progressBar');
  const pText = document.getElementById('statusPercent');
  const sText = document.getElementById('statusText');

  if (bar) bar.style.width = Math.min(100, Math.max(0, percent)) + '%';
  if (pText) pText.innerText = Math.round(percent) + '%';
  if (sText && text) sText.innerText = text;
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== CHẾ ĐỘ DARK MODE ====================
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(isDark);
}

function applyTheme(isDark) {
  const icon = document.getElementById('themeIcon');
  if (isDark) {
    document.documentElement.classList.add('dark');
    if (icon) icon.className = 'fa-solid fa-sun';
  } else {
    document.documentElement.classList.remove('dark');
    if (icon) icon.className = 'fa-solid fa-moon';
  }
}

window.toggleDarkMode = function() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const nextState = !isCurrentlyDark;
  localStorage.setItem('theme', nextState ? 'dark' : 'light');
  applyTheme(nextState);
};

document.addEventListener('DOMContentLoaded', initDarkMode);

// ==================== BỘ XUẤT TẬP TIN (EXPORTERS) ====================
function generateHtmlDocument(title, author, genres, source, description, parts) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.8; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1e293b; background: #fff; }
    h1 { font-size: 2.2em; font-weight: 800; margin-bottom: 0.2em; color: #0f172a; }
    .meta { font-size: 0.95em; color: #64748b; margin-bottom: 1.5em; }
    .warning { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 0.85em; color: #92400e; margin-bottom: 2em; }
    .desc { background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; font-style: italic; color: #475569; margin-bottom: 3em; }
    .chapter-heading { margin-top: 3.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5em; font-size: 1.5em; color: #0f172a; page-break-before: always; }
    p { margin: 1.2em 0; text-align: justify; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    Tác giả: <strong>${author}</strong> &bull; 
    Thể loại: <strong>${genres || "Chưa phân loại"}</strong> &bull; 
    Nguồn: <strong>${source}</strong>
  </div>
  <div class="warning">${LEGAL_NOTICE_TEXT.replace(/\n/g, '<br/>')}</div>
  ${description ? `<div class="desc">${description}</div>` : ''}
  ${parts.map((p, idx) => `
    <h2 class="chapter-heading">${idx + 1}. ${p.title}</h2>
    <div>${p.content}</div>
  `).join('')}
</body>
</html>`;
}

async function generateEpubBlob(title, author, genres, source, description, parts) {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  
  zip.folder("META-INF").file("container.xml",
`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = zip.folder("OEBPS");
  
  const disclaimerXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Bản quyền</title><style>body{font-family:sans-serif;padding:5%;color:#444;}h2{color:#b45309;}</style></head>
<body>
  <h2>CẢNH BÁO BẢN QUYỀN</h2>
  <p><strong>Nguồn:</strong> ${source}</p>
  <p><strong>Thể loại:</strong> ${genres || "Chưa phân loại"}</p>
  <p>${LEGAL_NOTICE_TEXT.replace(/\n/g, '<br/>')}</p>
</body>
</html>`;
  oebps.file("disclaimer.xhtml", disclaimerXhtml);

  let manifestItems = [`<item id="disclaimer" href="disclaimer.xhtml" media-type="application/xhtml+xml"/>`];
  let spineItems = [`<itemref idref="disclaimer"/>`];

  parts.forEach((p, idx) => {
    const fileId = `chap_${idx + 1}`;
    const fileName = `${fileId}.xhtml`;
    manifestItems.push(`<item id="${fileId}" href="${fileName}" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${fileId}"/>`);

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${p.title}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.7; padding: 5%; }
    h2 { font-size: 1.4em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; margin-bottom: 1em; }
    p { margin: 1em 0; }
  </style>
</head>
<body>
  <h2>${p.title}</h2>
  <div>${p.content}</div>
</body>
</html>`;
    oebps.file(fileName, xhtml);
  });

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:subject>${genres || "Chưa phân loại"}</dc:subject>
    <dc:description>${description}</dc:description>
    <dc:identifier id="BookID">urn:uuid:${Date.now()}</dc:identifier>
    <dc:language>vi</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
  oebps.file("content.opf", opf);

  const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    <navPoint id="np_disc" playOrder="1">
      <navLabel><text>Bản quyền &amp; Giới hạn</text></navLabel>
      <content src="disclaimer.xhtml"/>
    </navPoint>
    ${parts.map((p, idx) => `
      <navPoint id="np_${idx + 2}" playOrder="${idx + 2}">
        <navLabel><text>${p.title}</text></navLabel>
        <content src="chap_${idx + 1}.xhtml"/>
      </navPoint>
    `).join('')}
  </navMap>
</ncx>`;
  oebps.file("toc.ncx", ncx);

  return await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

async function generatePdfDocument(title, author, genres, source, description, parts, filename) {
  const element = document.createElement('div');
  element.style.padding = '24px';
  element.style.fontFamily = 'Helvetica, Arial, sans-serif';
  element.style.color = '#1e293b';

  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px; page-break-after: always; padding-top: 60px;">
      <h1 style="font-size: 26px; font-weight: bold; margin-bottom: 10px;">${title}</h1>
      <p style="font-size: 14px; color: #64748b;">Tác giả: ${author} &bull; Nguồn: ${source}</p>
      <p style="font-size: 13px; color: #475569; margin-top: 4px;">Thể loại: ${genres || "Chưa phân loại"}</p>
      <div style="font-size: 11px; color: #92400e; background: #fffbeb; padding: 12px; margin: 30px auto; border-radius: 6px; text-align: left; max-width: 500px; line-height: 1.5;">
        ${LEGAL_NOTICE_TEXT.replace(/\n/g, '<br/>')}
      </div>
      ${description ? `<div style="text-align: left; font-size: 12px; line-height: 1.6; margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px;">${description}</div>` : ''}
    </div>
    ${parts.map((p, idx) => `
      <div style="page-break-before: always; margin-top: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px;">
          ${idx + 1}. ${p.title}
        </h2>
        <div style="font-size: 12px; line-height: 1.8; color: #334155;">
          ${p.content}
        </div>
      </div>
    `).join('')}
  `;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.7 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(element).save();
}