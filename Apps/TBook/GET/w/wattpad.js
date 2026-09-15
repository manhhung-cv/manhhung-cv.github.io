export default {
  name: "Wattpad",

  match(cleanUrl) {
    if (!/wattpad\.com/i.test(cleanUrl)) return null;

    // 1. Link trang bìa: wattpad.com/story/123456789...
    const storyMatch = cleanUrl.match(/wattpad\.com\/story\/(\d+)/i);
    if (storyMatch) {
      return { type: 'story', id: storyMatch[1], originalUrl: cleanUrl };
    }

    // 2. Link chương: wattpad.com/1617603187...
    const partMatch = cleanUrl.match(/wattpad\.com\/(\d+)/i);
    if (partMatch) {
      return { type: 'part', id: partMatch[1], originalUrl: cleanUrl };
    }

    return null;
  },

  async resolveStoryIdFromPart(partId, originalUrl, fetchProxy) {
    const targetUrl = originalUrl || `https://www.wattpad.com/${partId}`;
    
    // Tải mã nguồn HTML của chương
    const html = await fetchProxy(targetUrl, false);

    // BƯỚC 1: Quét thẻ window.prefetched chứa toàn bộ State của Wattpad
    const prefetchedMatch = html.match(/window\.prefetched\s*=\s*(\{[\s\S]*?\});<\/script>/i) ||
                            html.match(/window\.prefetched\s*=\s*(\{[\s\S]*?\});/i);
    
    if (prefetchedMatch && prefetchedMatch[1]) {
      try {
        const prefetchedData = JSON.parse(prefetchedMatch[1]);
        // Tìm key chứa thông tin chương hoặc story
        for (const key of Object.keys(prefetchedData)) {
          const item = prefetchedData[key];
          if (item && item.data) {
            // Trường hợp dữ liệu là part
            if (item.data.groupId) return String(item.data.groupId);
            if (item.data.storyId) return String(item.data.storyId);
            // Trường hợp dữ liệu là story
            if (item.data.id && item.data.parts) return String(item.data.id);
          }
          if (item && item.groupId) return String(item.groupId);
        }
      } catch (e) {
        console.warn("Lỗi parse window.prefetched, chuyển sang regex regex dự phòng:", e);
      }
    }

    // BƯỚC 2: Quét Regex chuỗi JSON trực tiếp trong HTML
    const patterns = [
      /"groupId":\s*"?(\d+)"?/i,
      /"group_id":\s*"?(\d+)"?/i,
      /"storyId":\s*"?(\d+)"?/i,
      /data-group-id=["'](\d+)["']/i,
      /wattpad\.com\/story\/(\d+)/i,
      /\/story\/(\d+)/i
    ];

    for (const reg of patterns) {
      const match = html.match(reg);
      if (match && match[1]) {
        return match[1];
      }
    }

    // BƯỚC 3: Quét qua API v3 Parts (dự phòng trường hợp endpoint mở lại)
    try {
      const partData = await fetchProxy(`https://www.wattpad.com/api/v3/parts/${partId}?fields=id,groupId`, true);
      if (partData && (partData.groupId || partData.group_id)) {
        return String(partData.groupId || partData.group_id);
      }
    } catch {
      // Bỏ qua lỗi nếu API v3 bị 403/404
    }

    throw new Error(`Không thể tìm thấy bộ truyện gốc từ chương ID (${partId}). Hãy thử kiểm tra lại liên kết.`);
  },

  async inspect(info, { fetchProxy }) {
    let storyId = info.id;
    if (info.type === 'part') {
      storyId = await this.resolveStoryIdFromPart(info.id, info.originalUrl, fetchProxy);
    }

    const storyData = await fetchProxy(`https://www.wattpad.com/api/v3/stories/${storyId}`);
    if (!storyData || !storyData.title) {
      throw new Error("Không thể tải thông tin truyện.");
    }

    const parts = storyData.parts || [];
    if (parts.length === 0) throw new Error("Truyện không có chương khả dụng nào.");

    const chaptersList = parts.map(p => ({
      title: p.title,
      fetchUrl: `https://www.wattpad.com/apiv2/storytext?id=${p.id}`
    }));

    // Bóc tách tags/thể loại từ Wattpad
    const genres = (storyData.tags || []).join(", ") || storyData.categories?.join(", ") || "Đang cập nhật";

    return {
      sourceName: this.name,
      title: storyData.title || "Wattpad Story",
      author: storyData.user ? (storyData.user.name || storyData.user.username) : "Wattpad",
      genres,
      description: storyData.description || "",
      chaptersList
    };
  },

  async fetchChapterContent(chapterItem, { fetchProxy, signal }) {
    return await fetchProxy(chapterItem.fetchUrl, false, signal);
  }
};