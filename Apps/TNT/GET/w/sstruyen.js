const SSTruyenScraper = {
  name: "SSTruyen",

  // 1. Nhận diện URL dạng tác phẩm hoặc chương của SSTruyen
  match(url) {
    const isSST = /sstruyen\.(?:vn|net|com)/i.test(url);
    if (!isSST) return null;

    const chapMatch = url.match(/\/truyen\/([^/?#]+)\/chuong-(\d+)/i);
    if (chapMatch) {
      return { type: 'chapter', slug: chapMatch[1], chapNum: chapMatch[2], originalUrl: url };
    }

    const storyMatch = url.match(/\/truyen\/([^/?#]+)/i);
    if (storyMatch) {
      return { type: 'story', slug: storyMatch[1], originalUrl: url };
    }

    return null;
  },

  // 2. Tra cứu metadata, lấy ảnh bìa (Cover) và danh mục chương
  async inspect(info, context) {
    const { fetchProxy, parseDom, signal } = context;
    const cleanSlug = info.slug.replace(/\/page\/\d+$/, '');
    const storyUrl = `https://sstruyen.net/truyen/${cleanSlug}`;

    const htmlText = await fetchProxy(storyUrl, false, signal);
    if (!htmlText) {
      throw new Error("Không thể tải dữ liệu trang truyện từ SSTruyen.");
    }

    const doc = parseDom(htmlText);

    // Tiêu đề
    let title = doc.querySelector('h1.story-title')?.innerText?.trim() ||
                doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.split('-')[0]?.trim() ||
                "Truyện SSTruyen";

    // Tác giả
    let author = doc.querySelector('span[itemprop="author"] a')?.innerText?.trim() || "Khuyết danh";

    // Bóc tách ảnh bìa (Cover) chuẩn xác
    let coverUrl = "";

    // Ưu tiên 1: Lấy trực tiếp từ thẻ img[itemprop="image"]
    const coverImgEl = doc.querySelector('img[itemprop="image"]') || doc.querySelector('.book img');
    if (coverImgEl) {
      coverUrl = coverImgEl.getAttribute('src') || "";
      // Nếu src rỗng, lấy link 300w từ srcset
      if (!coverUrl && coverImgEl.getAttribute('srcset')) {
        const srcsetParts = coverImgEl.getAttribute('srcset').split(',');
        const lastSrc = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
        coverUrl = lastSrc;
      }
    }

    // Ưu tiên 2: Fallback qua thẻ meta og:image hoặc twitter:image
    if (!coverUrl) {
      coverUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                 doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || "";
    }

    // Ưu tiên 3: Schema JSON-LD
    if (!coverUrl) {
      try {
        const ldEl = doc.querySelector('script[type="application/ld+json"]');
        if (ldEl) {
          const ld = JSON.parse(ldEl.textContent);
          if (ld.image) coverUrl = ld.image;
        }
      } catch (e) {}
    }

    // Chuẩn hóa đường dẫn tuyệt đối cho ảnh bìa
    if (coverUrl) {
      coverUrl = coverUrl.trim();
      if (coverUrl.startsWith('//')) {
        coverUrl = 'https:' + coverUrl;
      } else if (coverUrl.startsWith('/')) {
        coverUrl = 'https://sstruyen.net' + coverUrl;
      }
      // Đảm bảo không lấy nhầm bản thumbnail nhỏ (-small.webp hoặc -medium.webp)
      coverUrl = coverUrl.replace(/-small\.webp/i, '.webp').replace(/-medium\.webp/i, '.webp');
    }

    // Thể loại
    const genres = [];
    doc.querySelectorAll('.info-chitiet a[itemprop="genre"]').forEach(el => {
      const g = el.innerText.trim();
      if (g) genres.push(g);
    });

    // Mô tả / Giới thiệu
    const descEl = doc.querySelector('#desc-content');
    let description = "";
    if (descEl) {
      const cloneDesc = descEl.cloneNode(true);
      cloneDesc.querySelector('.short-content')?.remove();
      description = cloneDesc.innerText.trim();
    }

    // Đếm tổng số trang chương từ khối phân trang
    let totalPages = 1;
    const pageLinks = doc.querySelectorAll('#pagination .pagination-chap a');
    pageLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const m = href.match(/\/page\/(\d+)/);
      if (m) {
        const p = parseInt(m[1], 10);
        if (p > totalPages) totalPages = p;
      }
    });

    // Lấy tên chương mới nhất
    const latestChapEl = doc.querySelector('#new-chapter .list-chapter li a');
    const latestChapName = latestChapEl ? latestChapEl.innerText.trim() : '';

    // Danh mục chương trang đầu tiên
    const firstPageChapters = [];
    doc.querySelectorAll('#list-chapter .list-chapter li a').forEach(a => {
      const href = a.getAttribute('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://sstruyen.net${href}`;
        firstPageChapters.push({
          title: a.querySelector('.chapter-text')?.innerText?.trim() || a.innerText.trim(),
          url: fullUrl,
          fetchUrl: fullUrl
        });
      }
    });

    return {
      id: cleanSlug,
      slug: cleanSlug,
      title: title,
      author: author,
      sourceName: "SSTruyen",
      cover: coverUrl, // URL: https://sstruyen.net/uploads/2026/04/21/he-thong-gian-lan-cua-phao-hoi.webp
      genres: genres.join(', ') || "Đam Mỹ, Hệ Thống",
      description: description,
      totalPages: totalPages,
      latestChapName: latestChapName,
      expectedTotal: totalPages * 20,
      chaptersList: firstPageChapters
    };
  },

  // 3. Nạp danh mục chương qua tất cả các trang
  async loadAllChapters(storyMeta, context) {
    const { fetchBatch, parseDom, signal, updateProgress } = context;
    const { slug, totalPages } = storyMeta;

    if (!totalPages || totalPages <= 1) {
      return storyMeta.chaptersList;
    }

    const pageUrls = [];
    for (let p = 1; p <= totalPages; p++) {
      pageUrls.push(p === 1 ? `https://sstruyen.net/truyen/${slug}` : `https://sstruyen.net/truyen/${slug}/page/${p}`);
    }

    const allChapters = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < pageUrls.length; i += BATCH_SIZE) {
      if (signal?.aborted) throw new DOMException("Đã hủy quá trình tải danh mục chương.", "AbortError");

      const chunk = pageUrls.slice(i, i + BATCH_SIZE);
      const results = await fetchBatch(chunk, signal);

      results.forEach(res => {
        if (res && res.content) {
          const doc = parseDom(res.content);
          doc.querySelectorAll('#list-chapter .list-chapter li a').forEach(a => {
            const href = a.getAttribute('href');
            if (href) {
              const fullUrl = href.startsWith('http') ? href : `https://sstruyen.net${href}`;
              allChapters.push({
                title: a.querySelector('.chapter-text')?.innerText?.trim() || a.innerText.trim(),
                url: fullUrl,
                fetchUrl: fullUrl
              });
            }
          });
        }
      });

      if (typeof updateProgress === 'function') {
        const pct = Math.min(5, Math.round(((i + chunk.length) / pageUrls.length) * 5));
        updateProgress(pct, `Đang quét danh mục chương: [${Math.min(i + BATCH_SIZE, pageUrls.length)}/${pageUrls.length}] trang...`);
      }
    }

    return allChapters.length > 0 ? allChapters : storyMeta.chaptersList;
  },

  // 4. Fallback cào nội dung chương đơn lẻ
  async fetchChapterContent(chapterItem, context) {
    const { fetchProxy, parseDom, signal } = context;
    const htmlText = await fetchProxy(chapterItem.fetchUrl, false, signal);
    if (!htmlText) return "<p>[Không thể tải nội dung chương]</p>";

    const doc = parseDom(htmlText);
    const contentEl = doc.querySelector('.chapter-content') || doc.querySelector('#chapter-c') || doc.querySelector('.content');

    if (contentEl) {
      contentEl.querySelectorAll('script, style, .ads, .ad-box, iframe').forEach(el => el.remove());
      return contentEl.innerHTML.trim();
    }

    return "<p>[Nội dung chương trống]</p>";
  }
};

export default SSTruyenScraper;