if (typeof window.scraperProReady === 'undefined') {
    window.scraperProReady = true;
    window.cancelScrapePro = false;

    // TỪ ĐIỂN TƯỚNG & TRANG BỊ (Nhớ paste full từ điển bạn đang dùng vào đây)
 const itemDict = {
        // ==========================================
        // 1. THÀNH PHẦN (BASE ITEMS)
        // ==========================================
        "B.F. Sword": "Kiếm B.F.",
        "Recurve Bow": "Cung Gỗ",
        "Needlessly Large Rod": "Gậy Quá Khổ",
        "Tear of the Goddess": "Nước Mắt Nữ Thần",
        "Chain Vest": "Giáp Lưới",
        "Negatron Cloak": "Áo Choàng Bạc",
        "Giant's Belt": "Đai Khổng Lồ",
        "Sparring Gloves": "Găng Đấu Tập",
        "Spatula": "Siêu Xẻng",
        "Golden Pan": "Chảo Vàng",
        "Frying Pan": "Chảo Vàng", // Thêm dự phòng

        // ==========================================
        // 2. TRANG BỊ THƯỜNG (CRAFTED ITEMS)
        // ==========================================
        "Deathblade": "Kiếm Tử Thần",
        "Giant Slayer": "Diệt Khổng Lồ",
        "Hextech Gunblade": "Kiếm Súng Hextech",
        "Spear of Shojin": "Ngọn Giáo Shojin",
        "Edge of Night": "Áo Choàng Bóng Tối",
        "Bloodthirster": "Huyết Kiếm",
        "Sterak's Gage": "Móng Vuốt Sterak",
        "Infinity Edge": "Vô Cực Kiếm",
        "Red Buff": "Bùa Đỏ",
        "Guinsoo's Rageblade": "Cuồng Đao Guinsoo",
        "Void Staff": "Trượng Hư Vô", // Dựa theo file JSON của bạn
        "Titan's Resolve": "Quyền Năng Khổng Lồ",
        "Kraken's Fury": "Thịnh Nộ Thủy Quái", // Dựa theo file JSON của bạn
        "Runaan's Hurricane": "Thịnh Nộ Thủy Quái", // Dự phòng nếu web dùng Runaan
        "Nashor's Tooth": "Nanh Nashor",
        "Last Whisper": "Cung Xanh",
        "Rabadon's Deathcap": "Mũ Phù Thủy Rabadon",
        "Archangel's Staff": "Quyền Trượng Thiên Thần",
        "Crownguard": "Vương Miện Hoàng Gia",
        "Ionic Spark": "Nỏ Sét",
        "Morellonomicon": "Quỷ Thư Morello",
        "Jeweled Gauntlet": "Găng Bảo Thạch",
        "Blue Buff": "Bùa Xanh",
        "Protector's Vow": "Lời Thề Hộ Vệ",
        "Adaptive Helm": "Mũ Thích Nghi",
        "Spirit Visage": "Giáp Tâm Linh",
        "Redemption": "Giáp Tâm Linh", // Dự phòng nếu web dùng Redemption
        "Hand of Justice": "Bàn Tay Công Lý",
        "Bramble Vest": "Áo Choàng Gai",
        "Gargoyle Stoneplate": "Thú Tượng Thạch Giáp",
        "Sunfire Cape": "Áo Choàng Lửa",
        "Steadfast Heart": "Trái Tim Kiên Định",
        "Dragon's Claw": "Vuốt Rồng",
        "Evenshroud": "Giáp Vai Nguyệt Thần",
        "Quicksilver": "Áo Choàng Thủy Ngân",
        "Warmog's Armor": "Giáp Máu Warmog",
        "Striker's Flail": "Chùy Đoản Côn",
        "Thief's Gloves": "Găng Đạo Tặc",
        "Tactician's Crown": "Vương Miện Chiến Thuật",
        "Tactician's Shield": "Lá Chắn Chiến Thuật",
        "Tactician's Cape": "Áo Choàng Chiến Thuật",

        // ==========================================
        // 3. HUY HIỆU (EMBLEMS)
        // ==========================================
        "Challenger Emblem": "Ấn Thách Đấu",
        "Chrono Emblem": "Ấn Thời Không",
        "Expedition Emblem": "Ấn Viễn Chinh",
        "Dark Star Emblem": "Ấn Hắc Tinh",
        "Judgement Emblem": "Ấn Thần Phán",
        "Bruiser Emblem": "Ấn Đấu Sĩ",
        "Rogue Emblem": "Ấn Vô Pháp",
        "Elder Emblem": "Ấn Tộc Thượng Cổ",
        "Vanguard Emblem": "Ấn Tiên Phong",
        "Bastion Emblem": "Ấn Can Trường",
        "Diviner Emblem": "Ấn Chiêm Tinh",
        "Stargazer Emblem": "Ấn Chiêm Tinh", // Dự phòng
        "Anima Squad Emblem": "Ấn Siêu Thú",
        "Cybernetic Emblem": "Ấn Siêu Linh",
        "Sniper Emblem": "Ấn Bắn Tỉa",
        // Một số Ấn có thể web đặt tên khác, bạn hãy bổ sung nếu thấy thiếu lúc cào.

        // ==========================================
        // 4. THẦN KHÍ ORNN (ARTIFACTS)
        // ==========================================
        "Evelynn's Intuition": "Trực Giác Của Evelynn",
        "Yasuo's Bladework": "Kiếm Thuật Của Yasuo",
        "Varus's Haunting": "Ám Ảnh Của Varus",
        "Soraka's Miracle": "Phép Màu Của Soraka",
        "Kayle's Ascension": "Thăng Hoa Của Kayle",
        "Thresh's Lantern": "Lồng Đèn Của Thresh",
        "Ahri's Aura": "Hào Quang Của Ahri",
        "Ekko's Patience": "Kiên Nhẫn Của Ekko",
        "Darkin Bow": "Cung Darkin",
        "Darkin Scythe": "Lưỡi Liềm Darkin",
        "Darkin Shield": "Khiên Darkin",
        "Darkin Staff": "Trượng Darkin",
        "Void Gauntlet": "Găng Hư Không",
        "Dawnbringer's Shield": "Khiên Hừng Đông",
        "Dawn Shield": "Khiên Hừng Đông", // Dự phòng
        "Infernal Axe": "Rìu Hỏa Ngục",
        "Dusk Shield": "Khiên Hoàng Hôn",
        "Cappa Juice": "Nước Cappa",
        "Eternal Pact": "Khế Ước Vĩnh Hằng",
        "Dawn Core": "Lõi Bình Minh",
        "Blitzblade": "Đao Chớp",
        "Titanic Hydra": "Rìu Đại Mãng Xà",
        "Unstoppable Force": "Bất Khuất",
        "Death's Dance": "Vũ Khúc Tử Thần",
        "Trinity Force": "Tam Luyện Kiếm",
        "The Collector": "Đại Bác Hải Tặc",
        "Zhonya's Paradox": "Lưỡng Cực Zhonya",
        "Hullcrusher": "Thần Búa Tiến Công",
        "Sniper's Focus": "Kính Nhắm Thiện Xạ",
        "Mogul's Mail": "Giáp Đại Hãn",
        "Gambler's Blade": "Kiếm của Tay Bạc",
        "Talisman of Ascension": "Bùa Thăng Hoa",
        "Fishbones": "Pháo Xương Cá",
        "Horizon Focus": "Kính Nhắm Ma Pháp",
        "Mittens": "Găng Đấu Sĩ",
        "Rapid Firecannon": "Đại Bác Liên Thanh",
        "Silvermere Dawn": "Chùy Bạch Ngân",
        "Prowler's Claw": "Móng Vuốt Ám Muội",
        "Black Cleaver": "Đá Hắc Hóa",
        "Wit's End": "Đao Tím",
        "Lich Bane": "Kiếm Tai Ương",
        "Lightshield Crest": "Huy Hiệu Lightshield",
        "Seeker's Armguard": "Giáp Tay Seeker",
        "Luden's Tempest": "Bão Tố Luden",

        // ==========================================
        // 5. VŨ KHÍ HÀO QUANG (RADIANT ITEMS)
        // ==========================================
        "Luminous Deathblade": "Kiếm Tử Thần Ánh Sáng",
        "Demonslayer": "Diệt Khổng Lồ Ánh Sáng",
        "Hextech Lifeblade": "Kiếm Súng Hextech Ánh Sáng",
        "Spear of Hirana": "Ngọn Giáo Shojin Ánh Sáng",
        "Brink of Dawn": "Áo Choàng Bóng Tối Ánh Sáng",
        "Blessed Bloodthirster": "Huyết Kiếm Ánh Sáng",
        "Luminescent Bloodthirster": "Huyết Kiếm Ánh Sáng", // Dự phòng
        "Sterak's Megashield": "Móng Vuốt Sterak Ánh Sáng",
        "Zenith Edge": "Vô Cực Kiếm Ánh Sáng",
        "Crest of Cinders": "Bùa Đỏ Ánh Sáng",
        "Guinsoo's Reckoning": "Cuồng Đao Guinsoo Ánh Sáng",
        "Covalent Spark": "Nỏ Sét Ánh Sáng",
        "More Morellonomicon": "Quỷ Thư Morello Ánh Sáng",
        "Glamorous Gauntlet": "Găng Bảo Thạch Ánh Sáng",
        "Blue Blessing": "Bùa Xanh Ánh Sáng",
        "Bulwark's Oath": "Lời Thề Hộ Vệ Ánh Sáng",
        "Jak'sho the Protean": "Mũ Thích Nghi Ánh Sáng",
        "Absolution": "Giáp Tâm Linh Ánh Sáng",
        "Fist of Fairness": "Bàn Tay Công Lý Ánh Sáng",
        "Rosethorn Vest": "Áo Choàng Gai Ánh Sáng",
        "Dvarapala Stoneplate": "Thú Tượng Thạch Giáp Ánh Sáng",
        "Sunlight Cape": "Áo Choàng Lửa Ánh Sáng",
        "Legacy of the Colossus": "Trái Tim Kiên Định Ánh Sáng",
        "Dragon's Will": "Vuốt Rồng Ánh Sáng",
        "Equinox": "Giáp Vai Nguyệt Thần Ánh Sáng",
        "Quickestsilver": "Áo Choàng Thủy Ngân Ánh Sáng",
        "Warmog's Pride": "Giáp Máu Warmog Ánh Sáng",
        "Willbreaker": "Chùy Đoản Côn Ánh Sáng",
        "Rascal's Gloves": "Găng Đạo Tặc Ánh Sáng",
        "Statikk's Favor": "Trượng Hư Vô Ánh Sáng",
        "Eternal Whisper": "Cung Xanh Ánh Sáng",
        "Rabadon's Ascended Deathcap": "Mũ Phù Thủy Rabadon Ánh Sáng",
        "Urf-Angel's Staff": "Quyền Trượng Thiên Thần Ánh Sáng",
        "Royal Crownshield": "Vương Miện Hoàng Gia Ánh Sáng",
        "Target Lock Optics": "Kính Khóa Mục Tiêu"
    };
        const translateItem = (name) => { if (!name) return name; return itemDict[name.trim()] || name.trim(); };

const champDict = {
        "Kaisa": "Kai'Sa",
        "RekSai": "Rek'Sai",
        "Chogath": "Cho'Gath",
        "KhaZix": "Kha'Zix",
        "Velkoz": "Vel'Koz",
        "Belveth": "Bel'Veth",
        "Kogmaw": "Kog'Maw",
        "Ksante": "K'Sante",
        "JarvanIV": "Jarvan IV",
        "DrMundo": "Dr. Mundo",
        "Dr Mundo": "Dr. Mundo",
        "AurelionSol": "Aurelion Sol",
        "TwistedFate": "Twisted Fate",
        "MissFortune": "Miss Fortune",
        "LeeSin": "Lee Sin",
        "MasterYi": "Master Yi",
        "XinZhao": "Xin Zhao",
        "TahmKench": "Tahm Kench",
        "RenataGlasc": "Renata Glasc",
        "The Mighty Mech": "Robot",
       

        // Thêm các tướng bị sai tên khác vào đây theo cú pháp: "Tên_Lỗi_Của_Web": "Tên_Chuẩn"
    };    const translateChamp = (name) => { if (!name) return name; return champDict[name.trim()] || name.trim(); };

    chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
        if (req.action === "start_PRO") {
            window.cancelScrapePro = false;
            runScraperPRO(req.limit, req.options, req.customNote);
            sendResp({status: "started"});
        }
    });

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function runScraperPRO(limitStr, options, customNote) {
        let limit = parseInt(limitStr);
        const wrappers = document.querySelectorAll('.team-portrait');
        if (wrappers.length === 0) { alert("❌ Lỗi: Không tìm thấy class .team-portrait (Sai web PRO?)"); return; }
        
        const totalToScrape = (isNaN(limit) || limit <= 0) ? wrappers.length : Math.min(limit, wrappers.length);
        const allCompsData = [];

        const statusPanel = createStatusPanel('PRO', totalToScrape, () => { window.cancelScrapePro = true; });

        for (let i = 0; i < totalToScrape; i++) {
            if (window.cancelScrapePro) break;
            updateProgress(i + 1, totalToScrape);

            const root = wrappers[i];
            try {
                root.scrollIntoView({ behavior: 'auto', block: 'center' });
                await sleep(400);

                const expandBtn = root.querySelector('.team-more');
                if (expandBtn) { expandBtn.click(); await sleep(1000); }

                let compData = {};

                if (options.title) compData.CompTitle = root.querySelector('.team-name-elipsis')?.childNodes[0]?.textContent.trim() || "N/A";
                if (options.tags) compData.CompRowTags = Array.from(root.querySelectorAll('.team-rank, .team-playstyle')).map(t => t.textContent.trim());
                if (options.augments) compData.Augments = Array.from(root.querySelectorAll('.team-augments img, .augments-list img')).map(img => translateItem(img.getAttribute('alt'))).filter(n => n);

                if (options.code) {
                    let teamCode = "N/A";
                    const copyBtn = root.querySelector('.team-copy');
                    if (copyBtn) {
                        copyBtn.click(); await sleep(400);
                        try { teamCode = await navigator.clipboard.readText(); } catch (e) {}
                    }
                    compData.CopyTeamCode = teamCode;
                }

                if (options.units) {
                    const unitsContainer = [];
                    root.querySelectorAll('.team-characters > a.characters-item[href*="/champions/"]').forEach(charLink => {
                        let rawName = charLink.querySelector('.team-character-name')?.textContent || charLink.querySelector('img.character-icon')?.getAttribute('alt');
                        const name = translateChamp(rawName); 
                        if (name) {
                            const items = Array.from(charLink.querySelectorAll('.character-items img')).map(img => translateItem(img.getAttribute('alt'))).filter(n => n);
                            unitsContainer.push({ champion: name, items: items });
                        }
                    });
                    compData.UnitsContainer = unitsContainer;
                }

                if (options.early) {
                    const compEarlyOptions = [];
                    const earlyList = document.querySelector('.team-expanded-list');
                    if (earlyList) {
                        const earlyChamps = Array.from(earlyList.querySelectorAll('a.characters-item[href*="/champions/"] img.character-icon')).map(img => translateChamp(img.getAttribute('alt'))).filter(n => n);
                        if (earlyChamps.length > 0) compEarlyOptions.push({ win_rate: "N/A", team_comp: earlyChamps });
                    }
                    compData.CompEarlyOptions = compEarlyOptions;
                }

                if (options.quick) compData.CompQuickStart = { leveling: [], carousel: [] };

                if (options.board) {
                    const boardPositions = [];
                    const hexGrid = document.querySelector('#hexGrid');
                    if (hexGrid) {
                        hexGrid.querySelectorAll('li.hex').forEach((hex, index) => {
                            const img = hex.querySelector('a[href*="/champions/"] img.character-icon');
                            if (img) {
                                const champName = translateChamp(img.getAttribute('alt'));
                                boardPositions.push({ champion: champName, hex_id: index, coordinates: { row: Math.floor(index / 7), col: index % 7 } });
                            }
                        });
                    }
                    compData.BoardPositions = boardPositions;
                }

                allCompsData.push(compData);
            } catch (err) { console.error(`Lỗi đội hình ${i+1}:`, err); }
        }
        
        statusPanel.remove();

        // GOM DỮ LIỆU CHUNG
        const finalJsonData = {
            MetaData: {
                ScrapeTime: new Date().toLocaleString('vi-VN'),
                CustomNote: customNote || "",
                TotalComps: allCompsData.length
            },
            Data: allCompsData
        };

        renderResult(finalJsonData, 'PRO', window.cancelScrapePro);
    }

    function createStatusPanel(version, total, onStopCb) {
        const p = document.createElement('div');
        p.id = "tftScraperPanel";
        Object.assign(p.style, { position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999999', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' });
        p.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:#1e293b; font-size:14px;">⚡ Đang cào ${version}</div>
                <div id="scrapeProgress" style="color:#8b5cf6; font-size:14px; font-weight:bold;">0/${total}</div>
            </div>
            <div style="width:100%; background:#f1f5f9; border-radius:4px; height:6px; overflow:hidden;">
                <div id="scrapeProgressBar" style="width:0%; height:100%; background:#8b5cf6; transition:width 0.3s ease;"></div>
            </div>
            <button id="stopScrapeBtn" style="padding:10px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:4px; transition:0.2s;">🛑 DỪNG & LẤY DỮ LIỆU</button>
        `;
        document.body.appendChild(p);
        document.getElementById('stopScrapeBtn').onclick = () => { onStopCb(); document.getElementById('stopScrapeBtn').innerText = "⏳ Đang kết thúc..."; document.getElementById('stopScrapeBtn').style.background = "#94a3b8"; };
        return p;
    }

    function updateProgress(current, total) {
        const pt = document.getElementById('scrapeProgress'); const pb = document.getElementById('scrapeProgressBar');
        if (pt) pt.innerText = `${current}/${total}`; if (pb) pb.style.width = `${(current / total) * 100}%`;
    }

    function renderResult(finalData, versionLabel, isStopped) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' });
        
        const count = finalData.MetaData.TotalComps;
        const titleText = isStopped ? `⚠️ Đã dừng (${count} đội hình)` : `✅ Hoàn tất (${count} đội hình)`;
        const titleColor = isStopped ? '#f59e0b' : '#10b981';

        overlay.innerHTML = `
            <div style="background:#1e293b; width:80%; max-width:900px; height:85%; padding:24px; display:flex; flex-direction:column; border-radius:16px; border:1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;"><h2 style="margin:0; color:${titleColor}; font-size:20px;">${titleText} - Bản ${versionLabel}</h2></div>
                <textarea id="jsonOut" style="flex:1; background:#0f172a; color:#a5b4fc; font-family:monospace; font-size:13px; padding:16px; border:1px solid #334155; border-radius:8px; resize:none;" readonly>${JSON.stringify(finalData, null, 2)}</textarea>
                <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
                    <button id="btnDownload" style="padding:12px 24px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">⬇️ TẢI JSON</button>
                    <button id="btnCp" style="padding:12px 24px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">📋 COPY DỮ LIỆU</button>
                    <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding:12px 24px; background:#475569; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">ĐÓNG</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btnCp').onclick = function() { document.getElementById('jsonOut').select(); document.execCommand('copy'); this.innerHTML = "✅ ĐÃ COPY!"; setTimeout(() => this.innerHTML = "📋 COPY DỮ LIỆU", 2000); };
        document.getElementById('btnDownload').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(finalData, null, 2)], { type: "application/json" })); a.download = `TFT_${versionLabel}_${count}Comps.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
    }
}