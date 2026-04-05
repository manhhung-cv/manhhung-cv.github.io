(function() {
    // 1. Tạo nút điều khiển
    const startBtn = document.createElement('button');
    startBtn.innerText = '🚀 BẮT ĐẦU CÀO DỮ LIỆU CHI TIẾT';
    Object.assign(startBtn.style, {
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '1000000', padding: '15px 30px', fontSize: '18px',
        backgroundColor: '#E91E63', color: 'white', border: 'none',
        borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        fontWeight: 'bold'
    });
    document.body.appendChild(startBtn);

    startBtn.onclick = async () => {
        const userInput = prompt("Số lượng đội hình cần cào (trống = tất cả):", "");
        if (userInput === null) return;

        let limit = parseInt(userInput);
        const compWrappers = document.querySelectorAll('.CompRowWrapper');
        const totalToScrape = (isNaN(limit) || limit <= 0) ? compWrappers.length : Math.min(limit, compWrappers.length);

        startBtn.disabled = true;
        startBtn.innerText = '⌛ Đang khởi động...';

        try {
            await runScraper(totalToScrape, compWrappers);
        } catch (e) {
            alert("Lỗi: " + e.message);
        } finally {
            startBtn.remove();
        }
    };

    async function runScraper(limit, wrappers) {
        const allCompsData = [];
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < limit; i++) {
            const root = wrappers[i];
            startBtn.innerText = `⌛ Đang xử lý ${i + 1}/${limit}...`;

            // Cuộn vào khung nhìn
            root.scrollIntoView({ behavior: 'auto', block: 'center' });
            await sleep(300);

            // --- BƯỚC 1: MỞ RỘNG (BẮT BUỘC) ---
            const expandBtn = root.querySelector('.ExpandImageContainer');
            if (expandBtn) {
                expandBtn.click();
                // Tăng thời gian chờ lên 1.2s để trang web render SVG Board và Early Options
                await sleep(1200); 
            }

            // --- BƯỚC 2: LẤY TEAM CODE ---
            let teamCode = "N/A";
            const copyBtnEl = root.querySelector('.CopyTeamCode');
            if (copyBtnEl) {
                copyBtnEl.click();
                await sleep(400);
                try { teamCode = await navigator.clipboard.readText(); } catch (e) {}
            }

            // --- BƯỚC 3: TRÍCH XUẤT DỮ LIỆU ---
            
            // 1. Tags
            const compRowTags = Array.from(root.querySelectorAll('.CompRowTags .CompRowTag')).map(t => t.textContent.trim());

            // 2. Units Container (Chính)
            const unitsContainer = [];
            root.querySelectorAll('.CompUnitStatsContainer .Unit_Wrapper').forEach(wrapper => {
                const name = wrapper.querySelector('.UnitNames')?.textContent.trim();
                if (name) {
                    const items = Array.from(wrapper.querySelectorAll('.ItemsContainer_Inline img'))
                                       .map(img => img.alt || img.getAttribute('alt')).filter(a => a);
                    unitsContainer.push({ champion: name, items: items });
                }
            });

            // 3. Early Options (Thường nằm trong class .CompEarlyOptions)
            const compEarlyOptions = [];
            const earlyRows = root.querySelectorAll('.CompEarlyOptions .CompOptionRow');
            earlyRows.forEach(row => {
                const winRate = row.querySelector('.CompOptionStatNumber')?.textContent.trim() || "N/A";
                const champs = Array.from(row.querySelectorAll('.UnitNames'))
                                    .map(el => el.textContent.trim())
                                    .filter(n => n);
                if (champs.length > 0) compEarlyOptions.push({ win_rate: winRate, team_comp: champs });
            });

            // 4. Quick Start (Leveling & Carousel)
            const compQuickStart = { leveling: [], carousel: [] };
            root.querySelectorAll('.levelcontainer').forEach(c => {
                const stage = c.querySelector('.stage')?.textContent.trim();
                const level = c.querySelector('.level')?.textContent.trim();
                if (stage && level) compQuickStart.leveling.push({ level: stage, stage: level });
            });
            root.querySelectorAll('.carouselcontainer').forEach(c => {
                const img = c.querySelector('img');
                const num = c.querySelector('.OccurrenceNumber')?.textContent.trim() || "x1";
                if (img && img.alt) compQuickStart.carousel.push({ item: img.alt, count: num });
            });

            // 5. Board Positions (Lấy từ SVG của Team Builder)
            const boardPositions = [];
            // Tìm chính xác SVG bên trong wrapper hiện tại
            const svgGroups = root.querySelectorAll('.team-builder svg g, .team-builder-container svg g');
            svgGroups.forEach(g => {
                const polygon = g.querySelector('polygon[id^="Hex_"]');
                const textEl = g.querySelector('text.HexBoardText');
                if (polygon && textEl) {
                    const hexIdStr = polygon.getAttribute('id').replace('Hex_', '');
                    const hexId = parseInt(hexIdStr, 10);
                    boardPositions.push({
                        champion: textEl.textContent.trim(),
                        hex_id: hexId,
                        coordinates: { row: Math.floor(hexId / 7), col: hexId % 7 }
                    });
                }
            });

            allCompsData.push({
                CompTitle: root.querySelector('.Comp_Title')?.textContent.trim() || "N/A",
                CompRowTags: compRowTags,
                UnitsContainer: unitsContainer,
                CopyTeamCode: teamCode,
                CompEarlyOptions: compEarlyOptions,
                CompQuickStart: compQuickStart,
                BoardPositions: boardPositions
            });
        }

        renderResult(allCompsData);
    }

    function renderResult(data) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.95)', zIndex: '1000001', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        });

        overlay.innerHTML = `
            <div style="background: white; width: 90%; height: 90%; padding: 20px; display: flex; flex-direction: column; border-radius: 10px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Đã cào xong ${data.length} đội hình</h2>
                <p style="font-size: 12px; color: #666;">Nếu dữ liệu vẫn thiếu, hãy kiểm tra xem tab chi tiết đã kịp hiện ra chưa.</p>
                <textarea id="resultText" style="flex: 1; width: 100%; font-family: monospace; font-size: 12px; margin-bottom: 10px;">${JSON.stringify(data, null, 2)}</textarea>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="copyJson" style="padding: 10px 20px; background: #2196F3; color: white; border: none; cursor: pointer; border-radius: 4px;">Copy JSON</button>
                    <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 20px; background: #f44336; color: white; border: none; cursor: pointer; border-radius: 4px;">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('copyJson').onclick = () => {
            document.getElementById('resultText').select();
            document.execCommand('copy');
            alert('Đã Copy!');
        };
    }
})();