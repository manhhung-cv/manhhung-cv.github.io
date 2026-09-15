export default {
  name: "Truyện Mơ",

  match(cleanUrl) {
    if (!/truyenmo\./i.test(cleanUrl)) return null;
    const storyUrl = cleanUrl.replace(/\/chuong-[\w\d-]+\.html$/i, '.html');
    return { originalUrl: storyUrl };
  },

  // 1. Trích xuất bảng ánh xạ từ CSS :before của Truyện Mơ
  extractCssFontMap(doc) {
    const fontMap = {};
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(style => {
      const css = style.innerHTML || "";
      const regex = /\.([a-zA-Z0-9_-]+):before\s*\{\s*content:\s*["']([^"']+)["'];?\s*\}/g;
      let m;
      while ((m = regex.exec(css)) !== null) {
        fontMap[m[1]] = m[2];
      }
    });
    return fontMap;
  },

  // 2. Giải mã các thẻ span ẩn font
  decodeFontElements(rootEl, fontMap) {
    if (!rootEl) return;
    rootEl.querySelectorAll('span').forEach(span => {
      for (const cls of span.classList) {
        if (fontMap[cls]) {
          span.replaceWith(document.createTextNode(fontMap[cls]));
          break;
        }
      }
    });
  },

  // ==================== PHA 1: TRA CỨU NHANH ====================
  async inspect(info, { fetchProxy, parseDom }) {
    const storyUrl = info.originalUrl;
    const urlObj = new URL(storyUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Chỉ tải 1 request duy nhất vào trang bìa
    const html = await fetchProxy(storyUrl, false);
    const doc = parseDom(html);

    const title = doc.querySelector('h2.card-title, h1')?.innerText.trim() || "Truyện Mơ Story";

    const authorEl = doc.querySelector('dd a[href*="/nhom-dich/"], dd b');
    const author = authorEl ? authorEl.innerText.trim() : "Truyện Mơ";

    const genresList = Array.from(doc.querySelectorAll('dd a.cate-item, a[itemprop="genre"]'))
                            .map(a => a.innerText.trim())
                            .filter(Boolean);
    const genres = genresList.length > 0 ? genresList.join(", ") : "Chưa phân loại";

    // Bóc tách mô tả và phục hồi chữ bị ẩn
    const fontMap = this.extractCssFontMap(doc);
    const descEl = doc.querySelector('.story-description .inner, [itemprop="description"]');
    let description = "";

    if (descEl) {
      const cloneDesc = descEl.cloneNode(true);
      this.decodeFontElements(cloneDesc, fontMap);
      description = cloneDesc.innerText.replace(/\u00a0/g, ' ').trim();
    }

    // Bóc tách danh mục chương từ khối .list-chapters
    const rawLinks = Array.from(doc.querySelectorAll('.list-chapters .item .episode-title a'));
    const chaptersList = [];

    rawLinks.forEach(a => {
      const href = a.getAttribute('href');
      const chapTitle = a.innerText.trim();
      if (href && chapTitle) {
        chaptersList.push({
          title: chapTitle,
          fetchUrl: href.startsWith('http') ? href : `${baseUrl}${href}`
        });
      }
    });

    // Sắp xếp lại từ Chương 1 đến Chương 300
    chaptersList.sort((a, b) => {
      const numA = (a.fetchUrl.match(/chuong-(\d+)/i) || a.title.match(/(\d+)/) || [0, 0])[1];
      const numB = (b.fetchUrl.match(/chuong-(\d+)/i) || b.title.match(/(\d+)/) || [0, 0])[1];
      return parseInt(numA, 10) - parseInt(numB, 10);
    });

    const totalCount = chaptersList.length;
    const latestChapName = totalCount > 0 ? chaptersList[totalCount - 1].title : "";

    return {
      sourceName: this.name,
      title,
      author,
      genres,
      description,
      storyUrl,
      expectedTotal: totalCount,
      totalChaptersCount: totalCount,
      latestChapName,
      chaptersList
    };
  },

  // ==================== PHA 2: BÓC TÁCH NỘI DUNG VƯỢT QUẢNG CÁO ====================
  async fetchChapterContent(chapterItem, { fetchProxy, parseDom, signal }) {
    const chapHtml = await fetchProxy(chapterItem.fetchUrl, false, signal);
    const chapDoc = parseDom(chapHtml);

    // Lấy bảng giải mã font CSS của trang hiện tại
    const fontMap = this.extractCssFontMap(chapDoc);

    // ƯU TIÊN 1: Lấy trực tiếp từ vùng .affActive (vùng chứa nội dung thật đã ẩn)
    let contentContainer = chapDoc.querySelector('.affActive');

    // ƯU TIÊN 2: Nếu chương không có khóa quảng cáo (như Chap 1), lấy từ .content-container
    if (!contentContainer || contentContainer.innerText.trim().length < 50) {
      contentContainer = chapDoc.querySelector('#chapter-content-render, .chapter-content, .content-container');
    }

    if (contentContainer) {
      const clone = contentContainer.cloneNode(true);

      // Xóa bỏ hoàn toàn lớp khóa quảng cáo Shopee nếu còn sót
      clone.querySelectorAll('.affClick, #affLink, .signature, script, style, iframe, ins, .ads').forEach(n => n.remove());

      // Thay thế tất cả các thẻ span bị giấu chữ bằng ký tự thực tế
      this.decodeFontElements(clone, fontMap);

      let cleanHtml = clone.innerHTML.trim();

      // Dọn dẹp các thẻ Doctype hoặc rác thừa nếu có
      cleanHtml = cleanHtml.replace(/<!DOCTYPE[^>]*>/gi, '').trim();

      return cleanHtml;
    }

    return "<p>[Nội dung chương trống hoặc không thể tải]</p>";
  }
};