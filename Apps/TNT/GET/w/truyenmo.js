const TruyenMoScraper = {
  name: "Truyện Mơ",

  // 1. Nhận diện URL: chuyển về link truyện gốc có đuôi .html
  match(cleanUrl) {
    if (!/truyenmo\./i.test(cleanUrl)) return null;

    let targetUrl = cleanUrl.trim().split('?')[0];

    // Nếu người dùng dán link chương (ví dụ: .../chuong-1-tu-tai-luc-liem.html)
    // Cắt bỏ phần /chuong-... để trở về link truyện chính
    if (/\/chuong-[\w\d-]+\.html$/i.test(targetUrl)) {
      targetUrl = targetUrl.replace(/\/chuong-[\w\d-]+\.html$/i, '.html');
    }

    // Đảm bảo URL luôn có đuôi .html hợp lệ của TruyenMo
    if (!targetUrl.endsWith('.html')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '.html';
    }

    return { originalUrl: targetUrl };
  },

  // 2. Trích xuất bảng font CSS (:before) giải mã chữ ẩn
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

  // 3. Giải mã thẻ span mang class font
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

  // ==================== PHA 1: TRA CỨU THÔNG TIN & LẤY COVER ====================
  async inspect(info, context) {
    const { fetchProxy, parseDom, signal } = context;
    const storyUrl = info.originalUrl;

    const htmlText = await fetchProxy(storyUrl, false, signal);
    if (!htmlText) {
      throw new Error("Không thể kết nối đến trang Truyện Mơ.");
    }

    const doc = parseDom(htmlText);

    // Tiêu đề
    let title = doc.querySelector('h2.card-title[itemprop="name"]')?.innerText?.trim() ||
                doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
                doc.querySelector('title')?.innerText?.split('-')[0]?.trim() ||
                "Truyện Mơ";

    // Tác giả & Nhóm dịch
    let author = doc.querySelector('a[href*="/tac-gia/"]')?.innerText?.trim() || "Chưa xác định";
    const teamEl = doc.querySelector('a[href*="/nhom-dich/"]');
    const teamName = teamEl ? teamEl.innerText.trim() : "";

    // BÓC TÁCH ẢNH BÌA (COVER):
    let coverUrl = "";

    // Ưu tiên 1: Lấy trực tiếp từ thẻ img có chứa đường dẫn /images/story/
    const imgEl = doc.querySelector('img[src*="/images/story/"]') ||
                  doc.querySelector('.card img.img-fluid') ||
                  doc.querySelector('img.img-fluid');
    if (imgEl) {
      coverUrl = imgEl.getAttribute('src') || "";
    }

    // Ưu tiên 2: Lấy từ thẻ meta og:image hoặc twitter:image
    if (!coverUrl) {
      coverUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                 doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || "";
    }

    // Ưu tiên 3: Schema JSON-LD
    if (!coverUrl) {
      try {
        const ldTags = doc.querySelectorAll('script[type="application/ld+json"]');
        ldTags.forEach(tag => {
          const data = JSON.parse(tag.textContent);
          if (data.image) {
            coverUrl = typeof data.image === 'string' ? data.image : (data.image.url || coverUrl);
          }
        });
      } catch (e) {}
    }

    // Chuẩn hóa thành URL tuyệt đối
    if (coverUrl) {
      coverUrl = coverUrl.trim();
      if (coverUrl.startsWith('//')) {
        coverUrl = 'https:' + coverUrl;
      } else if (coverUrl.startsWith('/')) {
        coverUrl = 'https://truyenmo.xyz' + coverUrl;
      }
    }

    // Thể loại
    const genres = [];
    doc.querySelectorAll('a.cate-item[itemprop="genre"]').forEach(el => {
      const g = el.innerText.trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    // Phần mô tả truyện
    const fontMap = this.extractCssFontMap(doc);
    const descContainer = doc.querySelector('.story-description .ql-editor');
    let description = "";
    if (descContainer) {
      const cloneDesc = descContainer.cloneNode(true);
      this.decodeFontElements(cloneDesc, fontMap);
      description = cloneDesc.innerText.trim();
    }

    // Bóc tách danh mục chương
    const rawChapters = [];
    const chapterLinks = doc.querySelectorAll('.list-chapters .item .episode-title a');

    chapterLinks.forEach((a) => {
      const href = a.getAttribute('href');
      const text = a.innerText.trim();
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://truyenmo.xyz${href.startsWith('/') ? '' : '/'}${href}`;
        rawChapters.push({
          title: text,
          url: fullUrl,
          fetchUrl: fullUrl
        });
      }
    });

    // Danh sách trên web hiển thị từ mới về cũ, đảo ngược lại để đọc từ Chương 1
    const chaptersList = rawChapters.reverse().map((c, idx) => ({
      index: idx + 1,
      title: c.title || `Chương ${idx + 1}`,
      url: c.url,
      fetchUrl: c.fetchUrl
    }));

    return {
      id: storyUrl,
      title: title,
      author: teamName ? `${author} (Team: ${teamName})` : author,
      sourceName: this.name,
      cover: coverUrl, // URL: https://truyenmo.xyz/images/story/2026/09/01/1788221726-lech-nhip-ten-goc-hoang-khang-tau-ban.jpg
      genres: genres.join(', ') || "Cổ Đại, Nữ Cường, HE",
      description: description,
      expectedTotal: chaptersList.length,
      chaptersList: chaptersList
    };
  },

  // ==================== PHA 2: BÓC TÁCH NỘI DUNG CHƯƠNG ====================
  async fetchChapterContent(chapterItem, context) {
    const { fetchProxy, parseDom, signal } = context;
    const chapHtml = await fetchProxy(chapterItem.fetchUrl, false, signal);
    if (!chapHtml) return "<p>[Không thể tải nội dung chương]</p>";

    const chapDoc = parseDom(chapHtml);
    const fontMap = this.extractCssFontMap(chapDoc);

    // Tìm container chứa nội dung thực tế
    let contentContainer = chapDoc.querySelector('.affActive') ||
                           chapDoc.querySelector('#chapter-content-render, .chapter-content, .content-container, .ql-editor');

    if (contentContainer) {
      const clone = contentContainer.cloneNode(true);
      // Gỡ bỏ script, style và các lớp che quảng cáo
      clone.querySelectorAll('.affClick, #affLink, #affLayer, #affLayer2, .signature, script, style, iframe, ins, .ads').forEach(n => n.remove());
      // Giải mã ký tự font CSS
      this.decodeFontElements(clone, fontMap);
      return clone.innerHTML.trim();
    }

    return "<p>[Nội dung chương trống]</p>";
  }
};

export default TruyenMoScraper;