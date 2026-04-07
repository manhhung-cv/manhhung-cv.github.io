chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startScraping") {
        startScraping();
    }
});

async function startScraping() {
    try {
        console.log("Bắt đầu tiến trình cào dữ liệu...");
        
        // 1. Mở 1 tab ẩn tới trang tổng hợp tướng để lấy danh sách
        const tab = await chrome.tabs.create({ url: 'https://www.metatft.com/units?set=TFTSet17', active: false });

        // Đợi 5 giây để trang load toàn bộ các tướng
        await new Promise(r => setTimeout(r, 5000));

        // 2. Thực thi script cào TÊN các tướng đang có trên trang
        const [unitResponse] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Tìm tất cả các thẻ <a> có link dẫn vào trang chi tiết tướng
                const links = Array.from(document.querySelectorAll('a[href^="/units/"]'));
                const unitNames = links.map(a => {
                    const href = a.getAttribute('href');
                    // Tách tên từ link, VD: "/units/Shen?set=TFTSet17" -> "Shen"
                    return href.split('/')[2].split('?')[0]; 
                });
                // Loại bỏ các tên bị trùng lặp
                return [...new Set(unitNames)];
            }
        });

        let units = unitResponse.result || [];
        
        if (units.length === 0) {
            console.error("Không tìm thấy danh sách tướng. Web có thể đã đổi cấu trúc!");
            chrome.tabs.remove(tab.id);
            return;
        }

        console.log(`Đã tìm thấy ${units.length} tướng: `, units);
        const results = [];

        // 3. Vòng lặp cào từng tướng một
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            console.log(`Đang cào (${i + 1}/${units.length}): ${unit}`);
            
            // Điều hướng tab tới trang của tướng đó
            await chrome.tabs.update(tab.id, { url: `https://www.metatft.com/units/${unit}?set=TFTSet17` });

            // Đợi 5 giây để trang load
            await new Promise(r => setTimeout(r, 5000));

            // Thực thi script cào dữ liệu đồ (giữ nguyên logic của bạn)
            const [response] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const rows = document.querySelectorAll('.ItemHolderRow');
                    return Array.from(rows).map(row => ({
                        items: Array.from(row.querySelectorAll('.BuildImg img')).map(img => img.alt),
                        avg_place: row.querySelector('.ItemHolderStatAvgPlace .ItemHolderStatNum')?.innerText,
                        win_rate: row.querySelector('.ItemHolderStatNumPercent')?.innerText
                    }));
                }
            });

            results.push({ unit, builds: response?.result || [] });
        }

        // 4. Lưu file. Service Worker không dùng được Blob URL nên ta chuyển thành Data URI base64
        const jsonString = JSON.stringify(results, null, 2);
        // Mã hóa chuẩn để không lỗi font
        const base64 = btoa(unescape(encodeURIComponent(jsonString))); 
        const dataUrl = `data:application/json;base64,${base64}`;

        await chrome.downloads.download({
            url: dataUrl,
            filename: 'TFT_Full_Data.json',
            saveAs: false
        });

        // 5. Đóng tab thu thập sau khi xong
        chrome.tabs.remove(tab.id);
        console.log("Hoàn thành! File đã tự động tải về.");

    } catch (error) {
        console.error("Lỗi trong quá trình cào dữ liệu:", error);
    }
}