if (typeof window.scraperV1Ready === 'undefined') {
    window.scraperV1Ready = true;
    window.cancelScrapeV1 = false;

    // --- TỪ ĐIỂN DỊCH THUẬT ---
    const itemDict = {
        "B.F. Sword": "Kiếm B.F.", "Recurve Bow": "Cung Gỗ", "Needlessly Large Rod": "Gậy Quá Khổ",
        "Tear of the Goddess": "Nước Mắt Nữ Thần", "Chain Vest": "Giáp Lưới", "Negatron Cloak": "Áo Choàng Bạc",
        "Giant's Belt": "Đai Khổng Lồ", "Sparring Gloves": "Găng Đấu Tập", "Spatula": "Siêu Xẻng", "Golden Pan": "Chảo Vàng"
    };
    const translateItem = (name) => { if (!name) return name; return itemDict[name.trim()] || name.trim(); };

    // --- HÀM ĐỢI DỮ LIỆU THÔNG MINH ---
    // Kiểm tra xem selector có tồn tại và có nội dung thực sự bên trong không
    const smartWait = async (selector, parent, timeout = 5000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = parent.querySelector(selector);
            // Điều kiện: Element tồn tại VÀ (có text hoặc có con bên trong)
            if (el && (el.textContent.trim().length > 0 || el.children.length > 0)) {
                return true;
            }
            await new Promise(r => setTimeout(r, 250)); // Check mỗi 250ms
        }
        return false;
    };

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
        if (req.action === "start_V1") {
            window.cancelScrapeV1 = false;
            runScraperV1(req.limit, req.options, req.customNote);
            sendResp({status: "started"});
        }
    });

    async function runScraperV1(limitStr, options, customNote) {
        let limit = parseInt(limitStr);
        const wrappers = document.querySelectorAll('.CompRowWrapper');
        if (wrappers.length === 0) { 
            alert("❌ Lỗi: Không tìm thấy class .CompRowWrapper. Có thể bạn đang ở sai trang."); 
            return; 
        }
        
        const totalToScrape = (isNaN(limit) || limit <= 0) ? wrappers.length : Math.min(limit, wrappers.length);
        const allCompsData = [];
        const statusPanel = createStatusPanel('V1', totalToScrape, () => { window.cancelScrapeV1 = true; });

        for (let i = 0; i < totalToScrape; i++) {
            if (window.cancelScrapeV1) break;
            updateProgress(i + 1, totalToScrape);

            const root = wrappers[i];
            try {
                root.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(500);

                const expandBtn = root.querySelector('.ExpandImageContainer');
                if (expandBtn) { 
                    expandBtn.click(); 
                    // Đợi container chính hiện ra trước khi làm bất cứ việc gì khác
                    const mainLoad = await smartWait('.CompUnitStatsContainer', root, 5000);
                    if (!mainLoad) {
                        const retry = confirm(`⚠️ Đội hình ${i+1} tải quá chậm. Bạn có muốn đợi thêm không?`);
                        if (retry) await sleep(5000);
                    }
                }

                let compData = {};

                if (options.title) compData.CompTitle = root.querySelector('.Comp_Title')?.textContent.trim() || "N/A";
                if (options.tags) compData.CompRowTags = Array.from(root.querySelectorAll('.CompRowTags .CompRowTag')).map(t => t.textContent.trim());

                // --- CÀO COPY CODE ---
                if (options.code) {
                    let teamCode = "N/A";
                    const copyBtnEl = root.querySelector('.CopyTeamCode');
                    if (copyBtnEl) {
                        copyBtnEl.click(); 
                        await sleep(800); 
                        try { teamCode = await navigator.clipboard.readText(); } catch (e) { teamCode = "Clipboard Error"; }
                    }
                    compData.CopyTeamCode = teamCode;
                }

                // --- CÀO UNITS ---
                if (options.units) {
                    await smartWait('.Unit_Wrapper', root, 3000);
                    const unitsContainer = [];
                    root.querySelectorAll('.CompUnitStatsContainer .Unit_Wrapper').forEach(w => {
                        const name = w.querySelector('.UnitNames')?.textContent.trim();
                        if (name) {
                            const items = Array.from(w.querySelectorAll('.ItemsContainer_Inline img')).map(img => translateItem(img.alt || img.getAttribute('alt'))).filter(a => a);
                            unitsContainer.push({ champion: name, items: items });
                        }
                    });
                    compData.UnitsContainer = unitsContainer;
                }

                // --- CÀO EARLY OPTIONS (CHỐNG MẢNG RỖNG) ---
                if (options.early) {
                    const loaded = await smartWait('.CompEarlyOptions .CompOptionRow', root, 4000);
                    const compEarlyOptions = [];
                    if (loaded) {
                        root.querySelectorAll('.CompEarlyOptions .CompOptionRow').forEach(row => {
                            const winRate = row.querySelector('.CompOptionStatNumber')?.textContent.trim() || "N/A";
                            const champs = Array.from(row.querySelectorAll('.UnitNames')).map(el => el.textContent.trim()).filter(n => n);
                            if (champs.length > 0) compEarlyOptions.push({ win_rate: winRate, team_comp: champs });
                        });
                    }
                    compData.CompEarlyOptions = compEarlyOptions;
                }

                // --- CÀO QUICK START (LEVELING & CAROUSEL) ---
                if (options.quick) {
                    await smartWait('.levelcontainer', root, 4000);
                    const compQuickStart = { leveling: [], carousel: [] };
                    root.querySelectorAll('.levelcontainer').forEach(c => {
                        const stage = c.querySelector('.stage')?.textContent.trim();
                        const level = c.querySelector('.level')?.textContent.trim();
                        if (stage && level) compQuickStart.leveling.push({ level: stage, stage: level });
                    });
                    root.querySelectorAll('.carouselcontainer').forEach(c => {
                        const img = c.querySelector('img');
                        const num = c.querySelector('.OccurrenceNumber')?.textContent.trim() || "x1";
                        if (img && img.alt) compQuickStart.carousel.push({ item: translateItem(img.alt), count: num });
                    });
                    compData.CompQuickStart = compQuickStart;
                }

                // --- CÀO BOARD POSITIONS (VỊ TRÍ BÀN CỜ) ---
                if (options.board) {
                    const loaded = await smartWait('.team-builder svg g, .team-builder-container svg g', root, 5000);
                    const boardPositions = [];
                    if (loaded) {
                        root.querySelectorAll('.team-builder svg g, .team-builder-container svg g').forEach(g => {
                            const polygon = g.querySelector('polygon[id^="Hex_"]');
                            const textEl = g.querySelector('text.HexBoardText');
                            if (polygon && textEl) {
                                const hexId = parseInt(polygon.getAttribute('id').replace('Hex_', ''), 10);
                                boardPositions.push({ champion: textEl.textContent.trim(), hex_id: hexId, coordinates: { row: Math.floor(hexId / 7), col: hexId % 7 } });
                            }
                        });
                    }
                    compData.BoardPositions = boardPositions;
                }

                allCompsData.push(compData);
            } catch (err) { 
                console.error(`Lỗi tại đội hình ${i+1}:`, err);
            }
        }
        
        statusPanel.remove();
        const finalJsonData = {
            MetaData: {
                ScrapeTime: new Date().toLocaleString('vi-VN'),
                CustomNote: customNote || "",
                TotalComps: allCompsData.length
            },
            Data: allCompsData
        };
        renderResult(finalJsonData, 'V1', window.cancelScrapeV1);
    }

    // --- CÁC HÀM UI ---
    function createStatusPanel(version, total, onStopCb) {
        const p = document.createElement('div');
        p.id = "tftScraperPanel";
        Object.assign(p.style, { position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999999', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' });
        p.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:#1e293b; font-size:14px;">⚡ Đang cào ${version}</div>
                <div id="scrapeProgress" style="color:#E91E63; font-size:14px; font-weight:bold;">0/${total}</div>
            </div>
            <div style="width:100%; background:#f1f5f9; border-radius:4px; height:6px; overflow:hidden;">
                <div id="scrapeProgressBar" style="width:0%; height:100%; background:#E91E63; transition:width 0.3s ease;"></div>
            </div>
            <button id="stopScrapeBtn" style="padding:10px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">🛑 DỪNG & LẤY DỮ LIỆU</button>
        `;
        document.body.appendChild(p);
        document.getElementById('stopScrapeBtn').onclick = () => { onStopCb(); document.getElementById('stopScrapeBtn').innerText = "⏳ Đang dừng..."; };
        return p;
    }

    function updateProgress(current, total) {
        const pt = document.getElementById('scrapeProgress'); 
        const pb = document.getElementById('scrapeProgressBar');
        if (pt) pt.innerText = `${current}/${total}`; 
        if (pb) pb.style.width = `${(current / total) * 100}%`;
    }

    function renderResult(finalData, versionLabel, isStopped) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: '2000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' });
        overlay.innerHTML = `
            <div style="background:#1e293b; width:85%; max-width:1000px; height:80%; padding:24px; display:flex; flex-direction:column; border-radius:16px;">
                <h2 style="color:#fff; margin-bottom:15px;">Dữ liệu đã cào (${finalData.Data.length} comps)</h2>
                <textarea id="jsonOut" style="flex:1; background:#0f172a; color:#a5b4fc; font-family:monospace; padding:16px; border-radius:8px; resize:none;" readonly>${JSON.stringify(finalData, null, 2)}</textarea>
                <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
                    <button id="btnDownload" style="padding:12px 24px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">⬇️ TẢI JSON</button>
                    <button id="btnCp" style="padding:12px 24px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer;">📋 COPY</button>
                    <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding:12px 24px; background:#475569; color:white; border:none; border-radius:8px; cursor:pointer;">ĐÓNG</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('btnCp').onclick = function() { document.getElementById('jsonOut').select(); document.execCommand('copy'); this.innerText = "✅ OK!"; setTimeout(() => this.innerText = "📋 COPY", 2000); };
        document.getElementById('btnDownload').onclick = () => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(finalData, null, 2)], { type: "application/json" }));
            a.download = `TFT_Export_${new Date().getTime()}.json`;
            a.click();
        };
    }
}