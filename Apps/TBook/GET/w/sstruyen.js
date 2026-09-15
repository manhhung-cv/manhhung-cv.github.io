export default {
  name: "SSTruyen",

  match(cleanUrl) {
    if (!/sstruyen\./i.test(cleanUrl)) return null;
    const storyUrl = cleanUrl.replace(/\/(?:chuong-\d+|page\/\d+).*$/i, '').replace(/\/+$/, '');
    return { originalUrl: storyUrl };
  },

  parseChaps(dom, baseUrl) {
    const items = [];
    const container = dom.querySelector('#list-chapter') || dom;
    const links = container.querySelectorAll('.list-chapter li a');
    links.forEach(a => {
      const href = a.getAttribute('href');
      const text = a.querySelector('.chapter-text')?.innerText.trim() || a.innerText.trim();
      if (href && text && !href.includes('#')) {
        items.push({
          title: text,
          fetchUrl: href.startsWith('http') ? href : `${baseUrl}${href}`
        });
      }
    });
    return items;
  },

  // ==================== PHA 1: TRA CỨU ====================
  async inspect(info, { fetchProxy, parseDom }) {
    const storyUrl = info.originalUrl;
    const urlObj = new URL(storyUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    const html = await fetchProxy(storyUrl, false);
    const doc = parseDom(html);

    const title = doc.querySelector('h1.story-title, h1.title, h1')?.innerText.trim() || "SSTruyen Story";
    const author = doc.querySelector('.info a[href*="/tac-gia/"] [itemprop="name"], .info a[href*="/tac-gia/"]')?.innerText.trim() || "Tác giả SSTruyen";

    const genresList = Array.from(doc.querySelectorAll('.info a[itemprop="genre"], .info a[href*="/the-loai/"]'))
                            .map(a => a.innerText.trim())
                            .filter(Boolean);
    const genres = genresList.length > 0 ? genresList.join(", ") : "Chưa phân loại";

    const descEl = doc.querySelector('#desc-content, .desc-text');
    let description = "";
    if (descEl) {
      const cloneDesc = descEl.cloneNode(true);
      cloneDesc.querySelectorAll('.short-content, script, style').forEach(el => el.remove());
      description = cloneDesc.innerText.trim();
    }

    // Xác định số trang cuối từ nút "Cuối"
    let lastPage = 1;
    const allPageLinks = Array.from(doc.querySelectorAll('#pagination a, .pagination-chap a'));
    const lastBtn = allPageLinks.find(a => /cuối/i.test(a.innerText.trim()));
    if (lastBtn) {
      const m = (lastBtn.getAttribute('href') || '').match(/\/page\/(\d+)/i);
      if (m) lastPage = parseInt(m[1], 10);
    }
    if (lastPage === 1) {
      allPageLinks.forEach(a => {
        const m = (a.getAttribute('href') || '').match(/\/page\/(\d+)/i);
        if (m && parseInt(m[1], 10) > lastPage) lastPage = parseInt(m[1], 10);
      });
    }

    // Đọc số chương từ #new-chapter hoặc meta
    let totalChaptersCount = 0;
    let latestChapName = "";
    const newChapLinks = doc.querySelectorAll('#new-chapter .list-chapter li a');
    if (newChapLinks.length > 0) {
      latestChapName = newChapLinks[0].querySelector('.chapter-text')?.innerText.trim() || newChapLinks[0].innerText.trim();
      const m = latestChapName.match(/chương\s+(\d+)/i) || latestChapName.match(/(\d+)/);
      if (m) totalChaptersCount = parseInt(m[1], 10);
    }
    if (!totalChaptersCount) {
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const m = metaDesc.match(/tổng\s+số\s+(\d+)\s+chương/i);
      if (m) totalChaptersCount = parseInt(m[1], 10);
    }
    if (!totalChaptersCount) totalChaptersCount = lastPage * 20;

    return {
      sourceName: this.name,
      title,
      author,
      genres,
      description,
      storyUrl,
      lastPage,
      expectedTotal: totalChaptersCount,
      latestChapName,
      firstPageDoc: doc
    };
  },

  // ==================== PHA 2: LẤY 100% URL THẬT TỪ CÁC TRANG ====================
  async loadAllChapters(meta, { fetchProxy, parseDom, delay, updateProgress, signal }) {
    const chaptersMap = new Map();
    const urlObj = new URL(meta.storyUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // 1. Nạp chương từ trang 1 đã có
    this.parseChaps(meta.firstPageDoc, baseUrl).forEach(c => {
      chaptersMap.set(c.fetchUrl, c);
    });

    // 2. Thu thập từ trang 2 đến trang lastPage (có giãn cách tránh 429)
    for (let p = 2; p <= meta.lastPage; p++) {
      if (signal?.aborted) throw new DOMException("Đã hủy", "AbortError");
      updateProgress(3, `Đang lấy danh mục chương: trang [${p}/${meta.lastPage}]...`);

      try {
        const pageHtml = await fetchProxy(`${meta.storyUrl}/page/${p}`, false, signal);
        if (pageHtml) {
          const pageDoc = parseDom(pageHtml);
          const chaps = this.parseChaps(pageDoc, baseUrl);
          chaps.forEach(c => chaptersMap.set(c.fetchUrl, c));
        }
      } catch (err) {
        console.warn(`Lỗi lấy mục lục trang ${p}:`, err);
      }
      await delay(250, signal);
    }

    // 3. Gom cả 4 chương mới nhất ở đầu trang 1 phòng khi trang 9 thiếu
    const newChapLinks = meta.firstPageDoc.querySelectorAll('#new-chapter .list-chapter li a');
    newChapLinks.forEach(a => {
      const href = a.getAttribute('href');
      const text = a.querySelector('.chapter-text')?.innerText.trim() || a.innerText.trim();
      const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
      if (!chaptersMap.has(fullUrl)) {
        chaptersMap.set(fullUrl, { title: text, fetchUrl: fullUrl });
      }
    });

    // Sắp xếp theo số chương chuẩn xác
    const list = Array.from(chaptersMap.values());
    list.sort((a, b) => {
      const numA = (a.fetchUrl.match(/chuong-(\d+)/i) || a.title.match(/(\d+)/) || [0, 0])[1];
      const numB = (b.fetchUrl.match(/chuong-(\d+)/i) || b.title.match(/(\d+)/) || [0, 0])[1];
      return parseInt(numA, 10) - parseInt(numB, 10);
    });

    return list;
  },

  async fetchChapterContent(chapterItem, { fetchProxy, parseDom, signal }) {
    const chapHtml = await fetchProxy(chapterItem.fetchUrl, false, signal);
    const chapDoc = parseDom(chapHtml);
    const contentEl = chapDoc.querySelector('.chapter-content, .content-container, #chapter-c');
    if (contentEl) {
      contentEl.querySelectorAll('div, script, ins, style, iframe, .ads').forEach(n => n.remove());
      return contentEl.innerHTML.trim();
    }
    return "<p>[Nội dung chương trống]</p>";
  }
};