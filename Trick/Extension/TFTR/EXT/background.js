chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanChampions") {
        scanChampions().then(sendResponse);
        return true; // Giữ kết nối để chờ hàm async trả về
    }
    if (message.action === "startScraping") {
        startScraping(message.units, message.config);
    }
});

// Hàm quét danh sách tướng
async function scanChampions() {
    try {
        console.log("Đang mở tab quét danh sách...");
        const tab = await chrome.tabs.create({ url: 'https://www.metatft.com/units?set=TFTSet17', active: false });
        
        // Đợi tải trang
        await new Promise(r => setTimeout(r, 5000));
        
        const [unitResponse] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const links = Array.from(document.querySelectorAll('a[href^="/units/"]'));
                const unitNames = links.map(a => {
                    const href = a.getAttribute('href');
                    return href.split('/')[2].split('?')[0];
                });
                return [...new Set(unitNames)];
            }
        });
        
        // Đóng tab sau khi lấy xong danh sách
        chrome.tabs.remove(tab.id);
        return { units: unitResponse.result || [] };
    } catch (error) {
        console.error("Lỗi khi quét danh sách:", error);
        return { units: [] };
    }
}

// Hàm chạy cào dữ liệu dựa trên config
async function startScraping(units, config) {
    try {
        console.log("Bắt đầu lấy dữ liệu chi tiết...", config);
        const tab = await chrome.tabs.create({ url: 'https://www.metatft.com/units?set=TFTSet17', active: false });
        const results = [];
        
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            await chrome.tabs.update(tab.id, { url: `https://www.metatft.com/units/${unit}?set=TFTSet17` });
            
            // Đợi trang tải khung cơ bản
            await new Promise(r => setTimeout(r, 4000));
            
            const [response] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [i + 1, units.length, unit, config],
                func: async (currentIdx, totalUnits, currentUnit, cfg) => {
                    
                    // Cập nhật UI Tiến trình trên trang
                    const percent = Math.round((currentIdx / totalUnits) * 100);
                    let overlay = document.getElementById('tft-scraper-progress');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'tft-scraper-progress';
                        Object.assign(overlay.style, {
                            position: 'fixed', bottom: '20px', right: '20px',
                            background: 'rgba(18, 18, 18, 0.95)', color: '#fff',
                            padding: '15px 20px', borderRadius: '12px', zIndex: '9999999',
                            fontFamily: '-apple-system, sans-serif', minWidth: '280px', 
                            border: '1px solid #2c2c2e', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        });
                        document.body.appendChild(overlay);
                    }
                    overlay.innerHTML = `
                        <div style="font-size: 14px; margin-bottom: 8px; font-weight: bold; color: #0a84ff;">
                            Tiến trình: ${currentIdx}/${totalUnits} (${percent}%)
                        </div>
                        <div style="font-size: 13px; color: #f5f5f7;">Đang xử lý: <b>${currentUnit}</b></div>
                    `;
                    document.title = `[${percent}%] ${currentUnit}...`;

                    // Kiểm tra dữ liệu sẵn sàng
                    const checkDataReady = () => {
                        const rows = document.querySelectorAll('#TableBuilds tbody tr[role="row"]');
                        if (rows.length === 0) return false;
                        return Array.from(rows).some(row => !row.querySelector('.TableSkeleton') && row.querySelector('.BuildImg img'));
                    };

                    // Cuộn trang để tải Lazy Load
                    for (let step = 0; step < 5; step++) {
                        window.scrollBy(0, 700);
                        await new Promise(r => setTimeout(r, 600));
                    }

                    // Chờ dữ liệu thật
                    let isReady = false;
                    let attempts = 0;
                    while (!isReady && attempts < 10) {
                        isReady = checkDataReady();
                        if (!isReady) {
                            window.scrollBy(0, 50);
                            await new Promise(r => setTimeout(r, 1000));
                            attempts++;
                        }
                    }

                    // 1. XỬ LÝ BEST BUILDS (Chỉ lấy mảng "items")
                    let bestBuildsOutput = [];
                    if (cfg.bestBuilds) {
                        const bestRows = document.querySelectorAll('.ItemHolderRow');
                        bestBuildsOutput = Array.from(bestRows).map(row => {
                            const items = Array.from(row.querySelectorAll('.BuildImg img')).map(img => img.alt).filter(Boolean);
                            return { items };
                        }).filter(b => b.items.length > 0);
                    }

                    // 2. XỬ LÝ BUILDS (Chỉ lấy mảng "items" và "tier")
                    let buildsOutput = [];
                    if (cfg.builds) {
                        const finalRows = document.querySelectorAll('#TableBuilds tbody tr[role="row"]');
                        finalRows.forEach(row => {
                            if (row.querySelector('.TableSkeleton')) return;
                            const cells = row.querySelectorAll('td[role="cell"]');
                            if (cells.length < 6) return;
                            
                            const items = Array.from(cells[0].querySelectorAll('.BuildImg img')).map(img => img.alt).filter(Boolean);
                            if (items.length === 0) return;
                            
                            buildsOutput.push({
                                items: items,
                                tier: cells[1].innerText.trim()
                            });
                        });

                        // Cắt giới hạn số lượng nếu người dùng có nhập dữ liệu
                        if (cfg.buildsCount && cfg.buildsCount !== "") {
                            const limit = parseInt(cfg.buildsCount, 10);
                            if (!isNaN(limit) && limit > 0) {
                                buildsOutput = buildsOutput.slice(0, limit);
                            }
                        }
                    }

                    return { bestBuilds: bestBuildsOutput, builds: buildsOutput };
                }
            });
            
            // Đẩy kết quả vào JSON tổng
            results.push({ 
                unit, 
                bestBuilds: response?.result?.bestBuilds || [],
                builds: response?.result?.builds || [] 
            });
        }
        
        // Xuất file JSON
        const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(results, null, 2))));
        await chrome.downloads.download({
            url: `data:application/json;base64,${base64}`,
            filename: 'TFT_Custom_Data.json',
            saveAs: false
        });
        
        // Dọn dẹp
        chrome.tabs.remove(tab.id);
        
    } catch (error) {
        console.error("Lỗi trong quá trình Scrape:", error);
    }
}