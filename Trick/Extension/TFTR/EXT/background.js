chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startScraping") {
        startScraping();
    }
});

async function startScraping() {
    try {
        console.log("Bắt đầu tiến trình cào...");
        const tab = await chrome.tabs.create({ url: 'https://www.metatft.com/units?set=TFTSet17', active: false });
        
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
        
        let units = unitResponse.result || [];
        if (units.length === 0) return;

        const results = [];
        
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            await chrome.tabs.update(tab.id, { url: `https://www.metatft.com/units/${unit}?set=TFTSet17` });
            
            // Đợi trang tải khung cơ bản
            await new Promise(r => setTimeout(r, 4000));
            
            const [response] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [i + 1, units.length, unit], 
                func: async (currentIdx, totalUnits, currentUnit) => {
                    
                    // 1. Cập nhật UI Tiến trình
                    const percent = Math.round((currentIdx / totalUnits) * 100);
                    let overlay = document.getElementById('tft-scraper-progress');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'tft-scraper-progress';
                        Object.assign(overlay.style, {
                            position: 'fixed', bottom: '20px', right: '20px',
                            background: 'rgba(15, 23, 42, 0.95)', color: '#fff',
                            padding: '15px 20px', borderRadius: '8px', zIndex: '9999999',
                            fontFamily: 'sans-serif', minWidth: '280px', border: '1px solid #334155'
                        });
                        document.body.appendChild(overlay);
                    }
                    overlay.innerHTML = `<div style="font-size: 14px; margin-bottom: 8px;">Tiến trình: ${currentIdx}/${totalUnits} (${percent}%)</div>
                                         <div style="font-size: 12px; color: #4ade80;">Đang xử lý: <b>${currentUnit}</b></div>`;
                    document.title = `[${percent}%] ${currentUnit}...`;

                    // 2. Lấy bestBuilds (Dữ liệu này thường có sẵn ngay)[cite: 1]
                    const bestRows = document.querySelectorAll('.ItemHolderRow');
                    const bestBuilds = Array.from(bestRows).map(row => ({
                        items: Array.from(row.querySelectorAll('.BuildImg img')).map(img => img.alt).filter(Boolean),
                        avg_place: row.querySelector('.ItemHolderStatAvgPlace .ItemHolderStatNum')?.innerText.trim() || null
                    })).filter(b => b.items.length > 0);

                    // 3. HÀM KIỂM TRA DỮ LIỆU THẬT (Anti-Empty)
                    const checkDataReady = () => {
                        const rows = document.querySelectorAll('#TableBuilds tbody tr[role="row"]');
                        if (rows.length === 0) return false;
                        // Kiểm tra xem có ít nhất một hàng KHÔNG chứa skeleton và CÓ chứa ảnh item
                        return Array.from(rows).some(row => !row.querySelector('.TableSkeleton') && row.querySelector('.BuildImg img'));
                    };

                    // 4. CUỘN VÀ ĐỢI CHO ĐẾN KHI CÓ DỮ LIỆU
                    let isReady = false;
                    let attempts = 0;
                    const maxAttempts = 10; // Đợi tối đa ~10 giây sau khi cuộn xong

                    // Cuộn từ từ xuống bảng[cite: 1]
                    for (let step = 0; step < 5; step++) {
                        window.scrollBy(0, 700);
                        await new Promise(r => setTimeout(r, 600));
                    }

                    // Vòng lặp kiểm tra dữ liệu
                    while (!isReady && attempts < maxAttempts) {
                        isReady = checkDataReady();
                        if (!isReady) {
                            console.log(`Đang đợi dữ liệu bảng cho ${currentUnit}... (Lần ${attempts + 1})`);
                            window.scrollBy(0, 50); // Nhích nhẹ để kích hoạt event load
                            await new Promise(r => setTimeout(r, 1000));
                            attempts++;
                        }
                    }

                    // 5. CÀO DỮ LIỆU BẢNG[cite: 1]
                    const builds = [];
                    const finalRows = document.querySelectorAll('#TableBuilds tbody tr[role="row"]');
                    finalRows.forEach(row => {
                        if (row.querySelector('.TableSkeleton')) return;
                        const cells = row.querySelectorAll('td[role="cell"]');
                        if (cells.length < 6) return;

                        const items = Array.from(cells[0].querySelectorAll('.BuildImg img')).map(img => img.alt).filter(Boolean);
                        if (items.length === 0) return;

                        builds.push({
                            items,
                            tier: cells[1].innerText.trim(),
                            avg_place: cells[2].innerText.trim(),
                            win_rate: cells[4].innerText.trim(),
                            frequency: cells[5].innerText.replace(/\s+/g, ' ').trim()
                        });
                    });

                    return { bestBuilds, builds };
                }
            });
            
            results.push({ 
                unit, 
                bestBuilds: response?.result?.bestBuilds || [],
                builds: response?.result?.builds || [] 
            });
        }
        
        // 6. Xuất file[cite: 1]
        const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(results, null, 2)))); 
        await chrome.downloads.download({
            url: `data:application/json;base64,${base64}`,
            filename: 'TFT_Full_Data_Final.json',
            saveAs: false
        });
        
        chrome.tabs.remove(tab.id);
    } catch (error) {
        console.error("Lỗi:", error);
    }
}