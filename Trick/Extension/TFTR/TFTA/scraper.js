if (typeof window.hasTFTScraper === 'undefined') {
    window.hasTFTScraper = true;
    window.cancelScrape = false; // BIẾN TOÀN CỤC ĐỂ DỪNG CÀO

    // ==========================================
    // 1. TỪ ĐIỂN DỊCH THUẬT
    // ==========================================
    const itemDict = {
        "B.F. Sword": "Kiếm B.F.", "Recurve Bow": "Cung Gỗ", "Needlessly Large Rod": "Gậy Quá Khổ",
        "Tear of the Goddess": "Nước Mắt Nữ Thần", "Chain Vest": "Giáp Lưới", "Negatron Cloak": "Áo Choàng Bạc",
        "Giant's Belt": "Đai Khổng Lồ", "Sparring Gloves": "Găng Đấu Tập", "Spatula": "Siêu Xẻng",
        "Golden Pan": "Chảo Vàng", "Frying Pan": "Chảo Vàng", "Deathblade": "Kiếm Tử Thần",
        "Giant Slayer": "Diệt Khổng Lồ", "Hextech Gunblade": "Kiếm Súng Hextech", "Spear of Shojin": "Ngọn Giáo Shojin",
        "Edge of Night": "Áo Choàng Bóng Tối", "Bloodthirster": "Huyết Kiếm", "Sterak's Gage": "Móng Vuốt Sterak",
        "Infinity Edge": "Vô Cực Kiếm", "Red Buff": "Bùa Đỏ", "Guinsoo's Rageblade": "Cuồng Đao Guinsoo",
        "Statikk Shiv": "Trượng Hư Vô", "Titan's Resolve": "Quyền Năng Khổng Lồ", "Kraken Slayer": "Thịnh Nộ Thủy Quái",
        "Runaan's Hurricane": "Thịnh Nộ Thủy Quái", "Nashor's Tooth": "Nanh Nashor", "Last Whisper": "Cung Xanh",
        "Rabadon's Deathcap": "Mũ Phù Thủy Rabadon", "Archangel's Staff": "Quyền Trượng Thiên Thần",
        "Crownguard": "Vương Miện Hoàng Gia", "Ionic Spark": "Nỏ Sét", "Morellonomicon": "Quỷ Thư Morello",
        "Jeweled Gauntlet": "Găng Bảo Thạch", "Blue Buff": "Bùa Xanh", "Protector's Vow": "Lời Thề Hộ Vệ",
        "Adaptive Helm": "Mũ Thích Nghi", "Spirit Visage": "Giáp Tâm Linh", "Redemption": "Giáp Tâm Linh",
        "Hand of Justice": "Bàn Tay Công Lý", "Bramble Vest": "Áo Choàng Gai", "Gargoyle Stoneplate": "Thú Tượng Thạch Giáp",
        "Sunfire Cape": "Áo Choàng Lửa", "Steadfast Heart": "Trái Tim Kiên Định", "Dragon's Claw": "Vuốt Rồng",
        "Evenshroud": "Giáp Vai Nguyệt Thần", "Quicksilver": "Áo Choàng Thủy Ngân", "Warmog's Armor": "Giáp Máu Warmog",
        "Guardbreaker": "Chùy Đoản Côn", "Thief's Gloves": "Găng Đạo Tặc", "Tactician's Crown": "Vương Miện Chiến Thuật",
        "Tactician's Shield": "Lá Chắn Chiến Thuật", "Tactician's Cape": "Áo Choàng Chiến Thuật"
        // THÊM TỪ ĐIỂN VÀO ĐÂY SAU NÀY
    };

    const translateItem = (enName) => {
        if (!enName) return enName;
        const cleanName = enName.trim();
        return itemDict[cleanName] || cleanName;
    };

    // ==========================================
    // 2. LẮNG NGHE LỆNH TỪ POPUP
    // ==========================================
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "start") {
            window.cancelScrape = false; // Reset cờ dừng
            runScraperMain(request.version, request.limit);
            sendResponse({status: "started"});
        }
    });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function runScraperMain(version, limitStr) {
        let limit = parseInt(limitStr);
        const isV1 = version === 'V1';
        
        const wrapperSelector = isV1 ? '.CompRowWrapper' : '.team-portrait';
        const wrappers = document.querySelectorAll(wrapperSelector);

        if (wrappers.length === 0) {
            alert(`❌ Không tìm thấy dữ liệu đội hình cho bản ${version}.`);
            return;
        }

        const totalToScrape = (isNaN(limit) || limit <= 0) ? wrappers.length : Math.min(limit, wrappers.length);
        const allCompsData = [];

        // UI TRẠNG THÁI CÀO + NÚT STOP
        const statusPanel = document.createElement('div');
        Object.assign(statusPanel.style, {
            position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999999',
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '16px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif',
            display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px'
        });

        statusPanel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:#1e293b; font-size:14px;">⚡ Đang cào bản ${version}</div>
                <div id="scrapeProgress" style="color:#3b82f6; font-size:14px; font-weight:bold;">0/${totalToScrape}</div>
            </div>
            <div style="width:100%; background:#f1f5f9; border-radius:4px; height:6px; overflow:hidden;">
                <div id="scrapeProgressBar" style="width:0%; height:100%; background:#3b82f6; transition:width 0.3s ease;"></div>
            </div>
            <button id="stopScrapeBtn" style="padding:10px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:4px; transition:0.2s;">🛑 DỪNG & LẤY DỮ LIỆU</button>
        `;
        document.body.appendChild(statusPanel);

        // Sự kiện Dừng Cào
        document.getElementById('stopScrapeBtn').onclick = () => {
            window.cancelScrape = true;
            document.getElementById('stopScrapeBtn').innerText = "⏳ Đang dừng lại...";
            document.getElementById('stopScrapeBtn').style.background = "#94a3b8";
        };

        const progressText = document.getElementById('scrapeProgress');
        const progressBar = document.getElementById('scrapeProgressBar');

        for (let i = 0; i < totalToScrape; i++) {
            // KIỂM TRA NẾU BẤM STOP THÌ THOÁT VÒNG LẶP
            if (window.cancelScrape) {
                console.log("Đã hủy cào dữ liệu bởi người dùng.");
                break; 
            }

            progressText.innerText = `${i + 1}/${totalToScrape}`;
            progressBar.style.width = `${((i + 1) / totalToScrape) * 100}%`;
            
            const root = wrappers[i];
            try {
                root.scrollIntoView({ behavior: 'auto', block: 'center' });
                await sleep(400); 

                if (isV1) await scrapeV1(root, allCompsData);
                else await scrapePRO(root, allCompsData);

            } catch (err) {
                console.error(`Lỗi ở đội hình ${i+1}:`, err);
            }
        }
        
        statusPanel.remove();
        renderResult(allCompsData, version, window.cancelScrape);
    }

    // ==========================================
    // 3. LOGIC CÀO CHI TIẾT TỪNG BẢN
    // ==========================================
    async function scrapeV1(root, allCompsData) {
        const expandBtn = root.querySelector('.ExpandImageContainer');
        if (expandBtn) { expandBtn.click(); await sleep(1200); }

        let teamCode = "N/A";
        const copyBtnEl = root.querySelector('.CopyTeamCode');
        if (copyBtnEl) {
            copyBtnEl.click(); await sleep(400);
            try { teamCode = await navigator.clipboard.readText(); } catch (e) {}
        }

        const compRowTags = Array.from(root.querySelectorAll('.CompRowTags .CompRowTag')).map(t => t.textContent.trim());
        const unitsContainer = [];
        root.querySelectorAll('.CompUnitStatsContainer .Unit_Wrapper').forEach(wrapper => {
            const name = wrapper.querySelector('.UnitNames')?.textContent.trim();
            if (name) {
                const items = Array.from(wrapper.querySelectorAll('.ItemsContainer_Inline img'))
                                   .map(img => translateItem(img.alt || img.getAttribute('alt'))).filter(a => a);
                unitsContainer.push({ champion: name, items: items });
            }
        });

        const compEarlyOptions = [];
        root.querySelectorAll('.CompEarlyOptions .CompOptionRow').forEach(row => {
            const winRate = row.querySelector('.CompOptionStatNumber')?.textContent.trim() || "N/A";
            const champs = Array.from(row.querySelectorAll('.UnitNames')).map(el => el.textContent.trim()).filter(n => n);
            if (champs.length > 0) compEarlyOptions.push({ win_rate: winRate, team_comp: champs });
        });

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

        const boardPositions = [];
        root.querySelectorAll('.team-builder svg g, .team-builder-container svg g').forEach(g => {
            const polygon = g.querySelector('polygon[id^="Hex_"]');
            const textEl = g.querySelector('text.HexBoardText');
            if (polygon && textEl) {
                const hexId = parseInt(polygon.getAttribute('id').replace('Hex_', ''), 10);
                boardPositions.push({ champion: textEl.textContent.trim(), hex_id: hexId, coordinates: { row: Math.floor(hexId / 7), col: hexId % 7 } });
            }
        });

        allCompsData.push({
            CompTitle: root.querySelector('.Comp_Title')?.textContent.trim() || "N/A",
            CompRowTags: compRowTags, UnitsContainer: unitsContainer, CopyTeamCode: teamCode,
            CompEarlyOptions: compEarlyOptions, CompQuickStart: compQuickStart, BoardPositions: boardPositions
        });
    }

    async function scrapePRO(root, allCompsData) {
        const expandBtn = root.querySelector('.team-more');
        if (expandBtn) { expandBtn.click(); await sleep(1000); }

        let teamCode = "N/A";
        const copyBtn = root.querySelector('.team-copy');
        if (copyBtn) {
            copyBtn.click(); await sleep(400);
            try { teamCode = await navigator.clipboard.readText(); } catch (e) {}
        }

        const unitsContainer = [];
        root.querySelectorAll('.team-characters > a.characters-item[href*="/champions/"]').forEach(charLink => {
            const name = charLink.querySelector('.team-character-name')?.textContent.trim() || charLink.querySelector('img.character-icon')?.getAttribute('alt');
            if (name) {
                const items = Array.from(charLink.querySelectorAll('.character-items img'))
                                   .map(img => translateItem(img.getAttribute('alt'))).filter(n => n);
                unitsContainer.push({ champion: name, items: items });
            }
        });

        const compEarlyOptions = [];
        const earlyList = document.querySelector('.team-expanded-list');
        if (earlyList) {
            const earlyChamps = Array.from(earlyList.querySelectorAll('a.characters-item[href*="/champions/"] img.character-icon'))
                                     .map(img => img.getAttribute('alt')).filter(n => n);
            if (earlyChamps.length > 0) compEarlyOptions.push({ win_rate: "N/A", team_comp: earlyChamps });
        }

        const boardPositions = [];
        const hexGrid = document.querySelector('#hexGrid');
        if (hexGrid) {
            hexGrid.querySelectorAll('li.hex').forEach((hex, index) => {
                const img = hex.querySelector('a[href*="/champions/"] img.character-icon');
                if (img) boardPositions.push({ champion: img.getAttribute('alt'), hex_id: index, coordinates: { row: Math.floor(index / 7), col: index % 7 } });
            });
        }

        const title = root.querySelector('.team-name-elipsis')?.childNodes[0]?.textContent.trim() || "N/A";
        const tags = Array.from(root.querySelectorAll('.team-rank, .team-playstyle')).map(t => t.textContent.trim());
        const augments = Array.from(root.querySelectorAll('.team-augments img, .augments-list img')).map(img => img.getAttribute('alt')).filter(n => n);

        allCompsData.push({
            CompTitle: title, CompRowTags: tags, Augments: augments, UnitsContainer: unitsContainer,
            CopyTeamCode: teamCode, CompEarlyOptions: compEarlyOptions, CompQuickStart: { leveling: [], carousel: [] }, BoardPositions: boardPositions
        });
    }

    // ==========================================
    // 4. HIỂN THỊ KẾT QUẢ (MODAL DARK MODE XỊN XÒ)
    // ==========================================
    function renderResult(data, versionLabel, isStopped) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2000000', display: 'flex',
            alignItems: 'center', justifyItems: 'center', justifyContent: 'center', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial', backdropFilter: 'blur(5px)'
        });
        
        const jsonString = JSON.stringify(data, null, 2);
        const titleText = isStopped ? `⚠️ Đã dừng cào (${data.length} đội hình thu được)` : `✅ Hoàn tất cào dữ liệu (${data.length} đội hình)`;
        const titleColor = isStopped ? '#f59e0b' : '#10b981';

        overlay.innerHTML = `
            <div style="background:#1e293b; width:80%; max-width:900px; height:85%; padding:24px; display:flex; flex-direction:column; border-radius:16px; border:1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 style="margin:0; color:${titleColor}; font-size:20px;">${titleText} - Bản ${versionLabel}</h2>
                    <span style="color:#94a3b8; font-size:14px;">TFT Data Export</span>
                </div>
                
                <textarea id="jsonOut" style="flex:1; background:#0f172a; color:#a5b4fc; font-family:'Courier New', monospace; font-size:13px; padding:16px; border:1px solid #334155; border-radius:8px; resize:none; outline:none;" readonly>${jsonString}</textarea>
                
                <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
                    <button id="btnDownload" style="padding:12px 24px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.2s;">⬇️ TẢI FILE (.JSON)</button>
                    <button id="btnCp" style="padding:12px 24px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.2s;">📋 COPY DỮ LIỆU</button>
                    <button id="btnCloseModal" style="padding:12px 24px; background:#475569; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.2s;">ĐÓNG LẠI</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Hover effects for modal buttons
        const addHover = (id, color, hoverColor) => {
            const el = document.getElementById(id);
            el.onmouseover = () => el.style.background = hoverColor;
            el.onmouseout = () => el.style.background = color;
        };
        addHover('btnDownload', '#3b82f6', '#2563eb');
        addHover('btnCp', '#10b981', '#059669');
        addHover('btnCloseModal', '#475569', '#334155');

        document.getElementById('btnCloseModal').onclick = () => overlay.remove();
        document.getElementById('btnCp').onclick = () => { 
            const textarea = document.getElementById('jsonOut');
            textarea.select(); 
            document.execCommand('copy'); 
            
            const btn = document.getElementById('btnCp');
            const originalText = btn.innerHTML;
            btn.innerHTML = "✅ ĐÃ COPY!";
            setTimeout(() => btn.innerHTML = originalText, 2000);
        };

        document.getElementById('btnDownload').onclick = () => {
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `TFT_${versionLabel}_${data.length}_Comps_${new Date().getTime()}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        };
    }
}