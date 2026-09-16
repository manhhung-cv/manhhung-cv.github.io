const WattpadScraper = {
  name: "Wattpad",

  // 1. Nhận diện URL dạng tác phẩm hoặc chương của Wattpad
  match(url) {
    const storyRegex = /wattpad\.com\/story\/(\d+)/i;
    const partRegex = /wattpad\.com\/(\d+)(?:-[^/?#]+)?/i;

    const storyMatch = url.match(storyRegex);
    if (storyMatch) {
      return { type: 'story', id: storyMatch[1], originalUrl: url };
    }

    const partMatch = url.match(partRegex);
    if (partMatch) {
      return { type: 'part', id: partMatch[1], originalUrl: url };
    }

    return null;
  },

  // 2. Tra cứu metadata và lấy ảnh bìa từ HTML thực tế
  async inspect(info, context) {
    const { fetchProxy, parseDom, signal } = context;
    let storyId = info.id;

    // Nếu người dùng dán link chapter lẻ, lấy storyId qua part API
    if (info.type === 'part') {
      try {
        const partApiUrl = `https://www.wattpad.com/v4/parts/${info.id}?fields=id,groupId`;
        const partData = await fetchProxy(partApiUrl, true, signal);
        if (partData && partData.groupId) {
          storyId = partData.groupId;
        }
      } catch (e) {
        console.warn("Không lấy được groupId từ part API:", e);
      }
    }

    // Tải mã nguồn HTML của trang tác phẩm
    const storyUrl = `https://www.wattpad.com/story/${storyId}`;
    const htmlText = await fetchProxy(storyUrl, false, signal);

    if (!htmlText) {
      throw new Error("Không thể tải mã nguồn trang tác phẩm từ Wattpad.");
    }

    let title = "";
    let author = "";
    let coverUrl = "";
    let description = "";
    let genres = "Wattpad";
    let chapters = [];

    // Cách 1: Bóc tách từ thẻ JSON-LD schema
    try {
      const ldMatch = htmlText.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (ldMatch && ldMatch[1]) {
        const ld = JSON.parse(ldMatch[1]);
        title = ld.headline || ld.name || "";
        if (ld.author) author = ld.author.name || "";
        coverUrl = ld.image || ld.thumbnailUrl || "";
        description = ld.description || "";
        if (ld.about) genres = ld.about;
      }
    } catch (e) {
      console.warn("Lỗi đọc JSON-LD:", e);
    }

    // Cách 2: Bóc tách từ window.__remixContext (chứa đầy đủ 10 chương và dữ liệu chi tiết)
    try {
      const remixMatch = htmlText.match(/window\.__remixContext\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i);
      if (remixMatch && remixMatch[1]) {
        const remix = JSON.parse(remixMatch[1]);
        const storyObj = remix?.state?.loaderData?.['routes/story.$storyid']?.story;

        if (storyObj) {
          if (!title) title = storyObj.title || "";
          if (!author && storyObj.user) author = storyObj.user.name || "";
          if (!coverUrl && storyObj.cover) coverUrl = storyObj.cover || "";
          if (!description && storyObj.description) description = storyObj.description || "";
          
          if (Array.isArray(storyObj.parts) && storyObj.parts.length > 0) {
            chapters = storyObj.parts.map((p, idx) => ({
              index: idx + 1,
              id: p.id,
              title: p.title || `Chương ${idx + 1}`,
              url: p.url || `https://www.wattpad.com/${p.id}`,
              fetchUrl: `https://www.wattpad.com/apiv2/storytext?id=${p.id}`
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Lỗi đọc __remixContext:", e);
    }

    // Cách 3: Fallback qua DOM Parser nếu thiếu thông tin
    const doc = parseDom(htmlText);
    if (!title) {
      title = doc.querySelector('h1[data-testid="title"]')?.innerText?.trim() ||
              doc.querySelector('title')?.innerText?.split('-')[0]?.trim() ||
              "Tác phẩm Wattpad";
    }
    if (!author) {
      author = doc.querySelector('.Sz3nA .fn6OH')?.innerText?.trim() ||
               doc.querySelector('.author-info a')?.innerText?.trim() ||
               "Tác giả";
    }
    if (!coverUrl) {
      const imgEl = doc.querySelector('img.cover__BlyZa') || doc.querySelector('[data-testid="cover"] img');
      if (imgEl && imgEl.src) coverUrl = imgEl.src;
    }

    // Nâng độ phân giải ảnh bìa nếu có bản 512px
    if (coverUrl) {
      coverUrl = coverUrl.trim();
      if (coverUrl.includes('-256-')) {
        coverUrl = coverUrl.replace('-256-', '-512-');
      }
    }

    // Nếu không lấy được danh sách chương qua Remix Context, fallback lấy qua DOM hoặc API v4
    if (chapters.length === 0) {
      try {
        const v4Data = await fetchProxy(`https://api.wattpad.com/v4/stories/${storyId}?fields=parts(id,title,url)`, true, signal);
        if (v4Data && Array.isArray(v4Data.parts)) {
          chapters = v4Data.parts.map((p, idx) => ({
            index: idx + 1,
            id: p.id,
            title: p.title || `Chương ${idx + 1}`,
            url: p.url || `https://www.wattpad.com/${p.id}`,
            fetchUrl: `https://www.wattpad.com/apiv2/storytext?id=${p.id}`
          }));
        }
      } catch (err) {
        console.warn("Lỗi fetch API v4 parts:", err);
      }
    }

    return {
      id: storyId,
      title: title,
      author: author,
      sourceName: "Wattpad",
      cover: coverUrl,
      genres: genres,
      description: description,
      expectedTotal: chapters.length,
      chaptersList: chapters
    };
  },

  // 3. Fallback lấy nội dung chương đơn lẻ
  async fetchChapterContent(chapterItem, context) {
    const { fetchProxy, signal } = context;
    const rawText = await fetchProxy(chapterItem.fetchUrl, false, signal);
    if (!rawText) return "<p>[Nội dung chương trống]</p>";
    return rawText;
  }
};

export default WattpadScraper;