if (typeof window.scraperV1Ready === 'undefined') {
    window.scraperV1Ready = true;
    window.cancelScrapeV1 = false;

    // ==========================================
    // 1. TỪ ĐIỂN CHUẨN HÓA DỮ LIỆU
    // ==========================================
    const itemDict = {
        "B.F. Sword": "Kiếm B.F.", "Recurve Bow": "Cung Gỗ", "Needlessly Large Rod": "Gậy Quá Khổ",
        "Tear of the Goddess": "Nước Mắt Nữ Thần", "Chain Vest": "Giáp Lưới", "Negatron Cloak": "Áo Choàng Bạc",
        "Giant's Belt": "Đai Khổng Lồ", "Sparring Gloves": "Găng Đấu Tập", "Spatula": "Siêu Xẻng", "Golden Pan": "Chảo Vàng",
        "Frying Pan": "Chảo Vàng"
    };
    const translateItem = (name) => { if (!name) return name; return itemDict[name.trim()] || name.trim(); };

    const champDict = {
        "Nunu & Willump": "Nunu", "Nunu": "Nunu",
        "Kaisa": "Kai'Sa", "RekSai": "Rek'Sai", "Chogath": "Cho'Gath", "KhaZix": "Kha'Zix",
        "Velkoz": "Vel'Koz", "Belveth": "Bel'Veth", "Kogmaw": "Kog'Maw", "Ksante": "K'Sante",
        "JarvanIV": "Jarvan IV", "DrMundo": "Dr. Mundo", "Dr Mundo": "Dr. Mundo",
        "AurelionSol": "Aurelion Sol", "TwistedFate": "Twisted Fate", "MissFortune": "Miss Fortune",
        "LeeSin": "Lee Sin", "MasterYi": "Master Yi", "XinZhao": "Xin Zhao", "TahmKench": "Tahm Kench",
        "RenataGlasc": "Renata Glasc", "The Mighty Mech": "Robot"
    };    
    const translateChamp = (name) => { if (!name) return name; return champDict[name.trim()] || name.trim(); };

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // ==========================================
    // 2. LẮNG NGHE LỆNH TỪ POPUP
    // ==========================================
    chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
        if (req.action === "start_V1") {
            window.cancelScrapeV1 = false;
            runScraperV1(req.limit, req.options, req.customNote);
            sendResp({status: "started"});
        }
    });

    // ==========================================
    // 3. LUỒNG CHẠY CHÍNH (HYBRID SPEED)
    // ==========================================
    async function runScraperV1(limitStr, options, customNote) {
        
        // --- TIÊM MÃ TẮT TOÀN BỘ ALERT/PROMPT CỦA TRANG WEB ---
        const muteScript = document.createElement('script');
        muteScript.textContent = `
            window.prompt = function() { return null; };
            window.alert = function() { return null; };
        `;
        document.documentElement.appendChild(muteScript);
        // ------------------------------------------------------

        let limit = parseInt(limitStr);
        let wrappers = Array.from(document.querySelectorAll('.CompRowWrapper'));
        
        if (wrappers.length === 0) { 
            alert("❌ Lỗi: Không tìm thấy .CompRowWrapper. Chắc bạn đang ở sai trang rồi!"); 
            return; 
        }
        
        const totalToScrape = (isNaN(limit) || limit <= 0) ? wrappers.length : Math.min(limit, wrappers.length);
        wrappers = wrappers.slice(0, totalToScrape);

        const statusPanel = createStatusPanel('V1 (Chuyên Sâu)', totalToScrape, () => { window.cancelScrapeV1 = true; });

        // --- GIAI ĐOẠN 1: CUỘN VÀ CHỜ RENDER (Xử lý dứt điểm Lazy Load) ---
        document.getElementById('scrapeProgress').innerText = "Đang kích hoạt UI ẩn (Vui lòng không thao tác chuột)...";
        for (let i = 0; i < wrappers.length; i++) {
            if (window.cancelScrapeV1) break;
            
            const root = wrappers[i];
            
            // 1. Cuộn mượt để lọt vào tầm nhìn của trang web
            root.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 2. Chờ 200ms để trang web nhận diện bạn đang nhìn nó
            await sleep(200);

            // 3. Kiểm tra xem bàn cờ (svg) hoặc data ẩn đã load chưa, chưa thì bấm Expand
            const expandBtn = root.querySelector('.ExpandImageContainer');
            const isLoaded = root.querySelector('.team-builder svg, .CompEarlyOptions');
            if (expandBtn && !isLoaded) { 
                expandBtn.click(); 
            }
            
            // Xử lý lấy Team Code từ Clipboard
            if (options.code) {
                const copyBtnEl = root.querySelector('.CopyTeamCode');
                if (copyBtnEl) {
                    copyBtnEl.click();
                    try { 
                        root.dataset.scrapedCode = await navigator.clipboard.readText();
                    } catch (e) {
                        root.dataset.scrapedCode = "Clipboard Error";
                    }
                }
            }
            
            // 4. CHỐT HẠ: Đợi 400ms tại chỗ để web bung HTML ẩn và vẽ bàn cờ SVG
            await sleep(400); 
            updateProgress(i + 1, totalToScrape, "Đang mở khóa & render: ");
        }

        // --- GIAI ĐOẠN 2: CHỜ ĐỒNG BỘ CUỐI CÙNG ---
        if (!window.cancelScrapeV1) {
            document.getElementById('scrapeProgress').innerText = "Đang chốt dữ liệu...";
            await sleep(1000); 
        }

        // --- GIAI ĐOẠN 3: QUÉT ĐỒNG LOẠT (MAP) ---
        document.getElementById('scrapeProgress').innerText = "Đang trích xuất...";
        const allCompsData = [];
        
        wrappers.forEach((root, i) => {
            if (window.cancelScrapeV1) return;

            let compData = {};
            
            if (options.title) compData.CompTitle = root.querySelector('.Comp_Title')?.textContent.trim() || "N/A";
            if (options.tags) compData.CompRowTags = Array.from(root.querySelectorAll('.CompRowTags .CompRowTag')).map(t => t.textContent.trim());
            
            if (options.code) {
                compData.CopyTeamCode = root.dataset.scrapedCode || root.querySelector('.CopyTeamCode')?.getAttribute('data-code') || "N/A";
            }

            if (options.units) {
                compData.UnitsContainer = Array.from(root.querySelectorAll('.CompUnitStatsContainer .Unit_Wrapper')).map(w => {
                    const rawName = w.querySelector('.UnitNames')?.textContent.trim();
                    const name = translateChamp(rawName); // Lọc tên Tướng
                    const items = Array.from(w.querySelectorAll('.ItemsContainer_Inline img')).map(img => translateItem(img.alt || img.getAttribute('alt'))).filter(Boolean);
                    return name ? { champion: name, items: items } : null;
                }).filter(Boolean);
            }

            if (options.early) {
                compData.CompEarlyOptions = Array.from(root.querySelectorAll('.CompEarlyOptions .CompOptionRow')).map(row => {
                    const winRate = row.querySelector('.CompOptionStatNumber')?.textContent.trim() || "N/A";
                    const champs = Array.from(row.querySelectorAll('.UnitNames')).map(el => translateChamp(el.textContent.trim())).filter(Boolean); // Lọc tên Tướng Early
                    return champs.length > 0 ? { win_rate: winRate, team_comp: champs } : null;
                }).filter(Boolean);
            }

            if (options.quick) {
                compData.CompQuickStart = {
                    leveling: Array.from(root.querySelectorAll('.levelcontainer')).map(c => ({
                        level: c.querySelector('.stage')?.textContent.trim(),
                        stage: c.querySelector('.level')?.textContent.trim()
                    })).filter(x => x.level && x.stage),
                    carousel: Array.from(root.querySelectorAll('.carouselcontainer')).map(c => {
                        const imgAlt = c.querySelector('img')?.alt;
                        return imgAlt ? { item: translateItem(imgAlt), count: c.querySelector('.OccurrenceNumber')?.textContent.trim() || "x1" } : null;
                    }).filter(Boolean)
                };
            }

            if (options.board) {
                compData.BoardPositions = Array.from(root.querySelectorAll('.team-builder svg g, .team-builder-container svg g')).map(g => {
                    const polygonId = g.querySelector('polygon[id^="Hex_"]')?.id;
                    const rawChampName = g.querySelector('text.HexBoardText')?.textContent.trim();
                    const champName = translateChamp(rawChampName); // Lọc tên Tướng Bàn cờ
                    
                    if (polygonId && champName) {
                        const hexId = parseInt(polygonId.replace('Hex_', ''), 10);
                        return { champion: champName, hex_id: hexId, coordinates: { row: Math.floor(hexId / 7), col: hexId % 7 } };
                    }
                    return null;
                }).filter(Boolean);
            }

            allCompsData.push(compData);
        });

        // --- KẾT THÚC VÀ XUẤT DATA ---
        statusPanel.remove();
        const finalJsonData = {
            MetaData: {
                ScrapeTime: new Date().toLocaleString('vi-VN'),
                CustomNote: customNote || "",
                TotalComps: allCompsData.length,
                Mode: "Hybrid V1 Scraper"
            },
            Data: allCompsData
        };
        renderResult(finalJsonData, 'V1', window.cancelScrapeV1);
    }

    // ==========================================
    // 4. CÁC HÀM UI (GIAO DIỆN)
    // ==========================================
    function createStatusPanel(version, total, onStopCb) {
        const p = document.createElement('div');
        p.id = "tftScraperPanel";
        Object.assign(p.style, { position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999999', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' });
        p.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:#1e293b; font-size:14px;">⚡ Đang cào ${version}</div>
                <div id="scrapeProgressText" style="color:#E91E63; font-size:14px; font-weight:bold;">0/${total}</div>
            </div>
            <div id="scrapeProgress" style="font-size:12px; color:#64748b; margin-top:-6px;">Đang khởi tạo...</div>
            <div style="width:100%; background:#f1f5f9; border-radius:4px; height:6px; overflow:hidden;">
                <div id="scrapeProgressBar" style="width:0%; height:100%; background:#E91E63; transition:width 0.1s ease;"></div>
            </div>
            <button id="stopScrapeBtn" style="padding:10px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">🛑 DỪNG & LẤY DỮ LIỆU</button>
        `;
        document.body.appendChild(p);
        document.getElementById('stopScrapeBtn').onclick = () => { onStopCb(); document.getElementById('stopScrapeBtn').innerText = "⏳ Đang dừng..."; };
        return p;
    }

    function updateProgress(current, total, prefix = "") {
        const pt = document.getElementById('scrapeProgressText'); 
        const pb = document.getElementById('scrapeProgressBar');
        const desc = document.getElementById('scrapeProgress');
        if (pt) pt.innerText = `${current}/${total}`; 
        if (pb) pb.style.width = `${(current / total) * 100}%`;
        if (desc) desc.innerText = `${prefix}${current}/${total}`;
    }

    function renderResult(finalData, versionLabel, isStopped) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: '2000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' });
        overlay.innerHTML = `
            <div style="background:#1e293b; width:85%; max-width:1000px; height:80%; padding:24px; display:flex; flex-direction:column; border-radius:16px;">
                <h2 style="color:${isStopped ? '#f59e0b' : '#10b981'}; margin-top:0; margin-bottom:15px;">
                    ${isStopped ? '⚠️ Đã dừng cào' : '✅ Dữ liệu đã cào'} (${finalData.Data.length} comps)
                </h2>
                <textarea id="jsonOut" style="flex:1; background:#0f172a; color:#a5b4fc; font-family:monospace; padding:16px; border-radius:8px; border:1px solid #334155; resize:none;" readonly>${JSON.stringify(finalData, null, 2)}</textarea>
                <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
                    <button id="btnDownload" style="padding:12px 24px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">⬇️ TẢI JSON</button>
                    <button id="btnCp" style="padding:12px 24px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">📋 COPY DỮ LIỆU</button>
                    <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding:12px 24px; background:#475569; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">ĐÓNG</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        document.getElementById('btnCp').onclick = function() { 
            document.getElementById('jsonOut').select(); 
            document.execCommand('copy'); 
            const oldTxt = this.innerText;
            this.innerText = "✅ ĐÃ COPY!"; 
            setTimeout(() => this.innerText = oldTxt, 2000); 
        };
        
        document.getElementById('btnDownload').onclick = () => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(finalData, null, 2)], { type: "application/json" }));
            a.download = `TFT_Export_V1_${new Date().getTime()}.json`;
            a.click();
        };
    }
}