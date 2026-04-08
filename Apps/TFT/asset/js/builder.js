// =========================================================
// HÀM TEAM BUILDER - FIRESTORE
// =========================================================

async function loadBuilderData() {
    const gridContainer = document.getElementById('grid-builder');
    if (!gridContainer) return;

    try {
        const RECAPTCHA_SITE_KEY = "6Lfq0YQsAAAAAGwargZMaws6m9oLYXAR6BHF50O2";

        const [resChamps, resItems, resTraits, resPlanner] = await Promise.all([
            fetch('./asset/data/champions.json'),
            fetch('./asset/data/items.json'),
            fetch('./asset/data/traits.json'),
            fetch('./asset/data/tft_planner.json').catch(() => null)
        ]);

        if (!resChamps.ok || !resItems.ok || !resTraits.ok) throw new Error('Lỗi tải dữ liệu hệ thống.');

        const champsData = await resChamps.json();
        const rawItemsData = await resItems.json();
        const traitsData = await resTraits.json();

        // KHỞI TẠO TỪ ĐIỂN MÃ HÓA TEAM PLANNER (ĐỌC CHUẨN TỪ RIOT)
        window._tftHexMapping = {};
        let plannerData = [];

        if (resPlanner && resPlanner.ok) {
            try {
                const rawData = await resPlanner.json();
                // Trích xuất đúng mảng dữ liệu của Mùa 17
                plannerData = rawData["TFTSet17"] || [];
            } catch (e) { }
        }

        if (plannerData.length > 0) {
            plannerData.forEach(c => {
                const plannerCode = c.team_planner_code;
                if (plannerCode !== undefined && plannerCode !== null) {
                    // Lấy tên tướng (VD: "TFT17_ChoGath" -> "chogath")
                    let pureName = c.character_id && c.character_id.includes('_') ? c.character_id.split('_')[1] : c.display_name;
                    if (pureName) {
                        pureName = pureName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                        // Đổi trực tiếp team_planner_code sang hệ Hex 3 ký tự (VD: 29 -> '01d')
                        window._tftHexMapping[pureName] = Number(plannerCode).toString(16).padStart(3, '0').toLowerCase();
                    }
                }
            });
        }


        window._builderMasterChamps = {};
        champsData.forEach(c => window._builderMasterChamps[c.name] = c);

        window._builderMasterTraits = {};
        traitsData.forEach(t => window._builderMasterTraits[t.trait_name.toLowerCase().trim()] = t);

        window._builderMasterItems = {};
        let itemsList = [];
        for (const arr of Object.values(rawItemsData)) {
            if (Array.isArray(arr)) {
                arr.forEach(i => {
                    window._builderMasterItems[i.name] = i;
                    itemsList.push(i);
                });
            }
        }

        // KHỞI TẠO STATE
        window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
        window._builderActiveTool = null;
        window._builderActiveTab = 'champ';
        window._builderSearchQuery = '';
        window._builderActiveTraits = new Set();

        // STATE CHO CẤU HÌNH THỦ CÔNG
        window._manualData = { early: [], carousel: [] };

        const getTraitIconName = (name) => {
            if (!name) return '';
            let str = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            str = str.replace(/[^a-zA-Z0-9\s]/g, "");
            return str.split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join('');
        };

        const calculateActiveTraits = () => {
            const uniqueChamps = new Set();
            const traitCounts = {};
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    const cell = window._builderBoardState[r][c];
                    if (cell) {
                        if (!uniqueChamps.has(cell.champ)) {
                            uniqueChamps.add(cell.champ);
                            const champData = window._builderMasterChamps[cell.champ];
                            if (champData?.traits) {
                                champData.traits.forEach(t => {
                                    const tName = t.name.trim();
                                    traitCounts[tName] = (traitCounts[tName] || 0) + 1;
                                });
                            }
                        }
                        cell.items.forEach(itemName => {
                            if (itemName.toLowerCase().startsWith('ấn ')) {
                                const traitName = itemName.substring(3).trim();
                                traitCounts[traitName] = (traitCounts[traitName] || 0) + 1;
                            }
                        });
                    }
                }
            }
            const activeTraitsArray = [];
            for (const [name, count] of Object.entries(traitCounts)) {
                const traitData = window._builderMasterTraits[name.toLowerCase()];
                let style = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
                let isActive = false;
                if (traitData?.levels) {
                    const sortedLevels = [...traitData.levels].sort((a, b) => parseInt(b.milestone) - parseInt(a.milestone));
                    for (let i = 0; i < sortedLevels.length; i++) {
                        if (count >= parseInt(sortedLevels[i].milestone)) {
                            isActive = true;
                            if (i === 0 && sortedLevels.length > 2) style = 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.5)]';
                            else if (i === 0 || i === 1) style = 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-400 shadow-sm';
                            else style = 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-sm';
                            break;
                        }
                    }
                } else if (count >= 1) isActive = true;
                activeTraitsArray.push({ name, count, style, isActive });
            }
            return activeTraitsArray.sort((a, b) => (a.isActive === b.isActive) ? b.count - a.count : (a.isActive ? -1 : 1));
        };

        // HÀM MỞ BẢNG CHỌN TRỰC QUAN (Tướng Đầu Game / Đi Chợ)
        // HÀM MỞ BẢNG CHỌN TRỰC QUAN (Tướng Đầu Game / Đi Chợ)
        window.openVisualSelector = (type) => {
            const isChamp = type === 'champ';
            const max = isChamp ? 5 : 10;
            const targetKey = isChamp ? 'early' : 'carousel'; // Fix lỗi không lưu được dữ liệu
            let selectedSet = new Set(window._manualData[targetKey]);

            window._vsSearchQuery = '';
            window._vsActiveFilter = 'all';

            // Xử lý chọn/bỏ chọn
            window._toggleSelection = (id) => {
                if (selectedSet.has(id)) {
                    selectedSet.delete(id);
                } else {
                    if (selectedSet.size >= max) return uiAlert('Giới hạn', `Chỉ được chọn tối đa ${max} mục!`, 'info');
                    selectedSet.add(id);
                }
                window._renderVisualSelectorGrid(); // Cập nhật lại giao diện ngay lập tức
            };

            // Xử lý bộ lọc
            window._setVsFilter = (val) => {
                window._vsActiveFilter = val;
                document.querySelectorAll('.vs-filter-btn').forEach(btn => {
                    if (btn.dataset.val === val) {
                        btn.classList.add('bg-premium-gold', 'text-black', 'border-transparent');
                        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                    } else {
                        btn.classList.remove('bg-premium-gold', 'text-black', 'border-transparent');
                        btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                    }
                });
                window._renderVisualSelectorGrid();
            };

            // Hàm render lại danh sách lưới bên trong Modal
            window._renderVisualSelectorGrid = () => {
                const container = document.getElementById('vs-grid-container');
                const countText = document.getElementById('vs-count-text');
                if (!container) return;

                let items = [];
                if (isChamp) {
                    items = Object.values(window._builderMasterChamps).sort((a, b) => a.cost - b.cost);
                    if (window._vsActiveFilter !== 'all') {
                        items = items.filter(c => c.cost === parseInt(window._vsActiveFilter));
                    }
                } else {
                    items = Object.values(window._builderMasterItems).filter(i => i.category !== 'emblem' && i.category !== 'consumable');
                    if (window._vsActiveFilter !== 'all') {
                        items = items.filter(i => i.category === window._vsActiveFilter);
                    }
                }

                if (window._vsSearchQuery) {
                    const q = window._vsSearchQuery.toLowerCase();
                    items = items.filter(i => i.name.toLowerCase().includes(q));
                }

                if (items.length === 0) {
                    container.innerHTML = '<p class="col-span-full text-center text-xs text-slate-500 py-6 italic">Không tìm thấy kết quả.</p>';
                } else {
                    container.innerHTML = items.map(i => {
                        const isSel = selectedSet.has(i.name);
                        const ring = isSel ? 'ring-[2px] ring-premium-gold opacity-100 scale-105 shadow-md' : 'ring-1 ring-slate-300 dark:ring-slate-600 opacity-60 hover:opacity-100';
                        const checkIcon = isSel ? `<div class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-premium-gold rounded-full flex items-center justify-center border border-black z-20 shadow-md"><i class="fa-solid fa-check text-[9px] text-black font-black"></i></div>` : '';

                        return `
                                    <div class="flex flex-col items-center relative gap-1 cursor-pointer transition-all" onclick="window._toggleSelection('${escapeJS(i.name)}')">
                                        <div class="relative w-full aspect-square rounded-[6px] border-[1.5px] border-transparent transition-all duration-200 ${ring} bg-black">
                                            <img src="${i.image}" class="w-full h-full object-cover object-[80%] rounded-[4px] pointer-events-none" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">
                                            ${checkIcon}
                                        </div>
                                        <span class="text-[8.5px] font-bold ${isSel ? 'text-premium-gold drop-shadow-sm' : 'text-slate-600 dark:text-slate-400'} truncate w-full text-center transition-colors">${i.name}</span>
                                    </div>
                                `;
                    }).join('');
                }
                if (countText) countText.innerHTML = `Đã chọn: <b class="text-premium-gold">${selectedSet.size} / ${max}</b>`;
            };

            const filtersHTML = isChamp
                ? `<div class="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-1">
                             <button onclick="window._setVsFilter('all')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border transition-colors bg-premium-gold text-black border-transparent outline-none" data-val="all">Tất cả</button>
                             ${[1, 2, 3, 4, 5].map(c => `<button onclick="window._setVsFilter('${c}')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 transition-colors outline-none" data-val="${c}">${c}$</button>`).join('')}
                           </div>`
                : `<div class="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-1">
                             <button onclick="window._setVsFilter('all')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border transition-colors bg-premium-gold text-black border-transparent outline-none" data-val="all">Tất cả</button>
                             <button onclick="window._setVsFilter('normal')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 transition-colors outline-none" data-val="normal">Cơ bản</button>
                             <button onclick="window._setVsFilter('artifact')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 transition-colors outline-none" data-val="artifact">Tạo Tác</button>
                             <button onclick="window._setVsFilter('radiant')" class="vs-filter-btn px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 transition-colors outline-none" data-val="radiant">Ánh Sáng</button>
                           </div>`;

            const html = `
                        <div class="flex flex-col text-left">
                            <div class="flex items-center justify-between mb-2 px-1">
                                <span id="vs-count-text" class="text-[11px] text-slate-500 font-semibold">Đã chọn: <b class="text-premium-gold">0 / ${max}</b></span>
                            </div>
                            <div class="relative w-full mb-2">
                                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"></i>
                                <input type="text" placeholder="Tìm kiếm..." oninput="window._vsSearchQuery = this.value; window._renderVisualSelectorGrid()" class="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-2 text-[11px] text-slate-700 dark:text-white focus:outline-none focus:border-premium-gold/50 shadow-inner">
                            </div>
                            ${filtersHTML}
                            <div id="vs-grid-container" class="grid grid-cols-5 sm:grid-cols-6 gap-x-2.5 gap-y-3 max-h-[300px] overflow-y-auto no-scrollbar p-1"></div>
                        </div>
                    `;

            uiConfirm(isChamp ? 'Chọn Tướng Đầu Game' : 'Chọn Trang Bị Đi Chợ', html, () => {
                window._manualData[targetKey] = Array.from(selectedSet);
                window.renderManualSelections();
            });

            setTimeout(() => { window._renderVisualSelectorGrid(); }, 50);
        };

        // HÀM RENDER LẠI CÁC MỤC ĐÃ CHỌN TRÊN GIAO DIỆN CHÍNH
        window.renderManualSelections = () => {
            ['early', 'carousel'].forEach(type => {
                const container = document.getElementById(`manual-${type}-container`);
                if (!container) return;

                if (window._manualData[type].length > 0) {
                    container.innerHTML = window._manualData[type].map(name => {
                        const isChamp = type === 'early';
                        const data = isChamp ? window._builderMasterChamps[name] : window._builderMasterItems[name];
                        const img = data?.image || '/Asset/logo/logo.png';
                        return `
                                    <div class="flex flex-col items-center w-[34px] shrink-0 relative group cursor-pointer" onclick="window._manualData['${type}'] = window._manualData['${type}'].filter(x => x !== '${escapeJS(name)}'); window.renderManualSelections();" title="Bỏ chọn ${name}">
                                        <div class="w-full aspect-square rounded-[5px] border-[1.5px] border-slate-300 dark:border-slate-600 bg-black overflow-hidden relative shadow-sm transition-colors group-hover:border-rose-500">
                                            <img src="${img}" class="w-full h-full object-cover group-hover:opacity-30 transition-opacity">
                                            <i class="fa-solid fa-xmark absolute inset-0 m-auto text-rose-500 text-[14px] opacity-0 group-hover:opacity-100 flex justify-center items-center font-black drop-shadow-md"></i>
                                        </div>
                                        <span class="text-[8px] font-bold text-slate-600 dark:text-slate-400 truncate w-full text-center mt-0.5 group-hover:text-rose-500 transition-colors">${name}</span>
                                    </div>
                                `;
                    }).join('');
                } else {
                    container.innerHTML = '<span class="text-[9.5px] text-slate-400 italic">Tự động tính từ Bàn Cờ...</span>';
                }
            });
        };
        // HÀM RENDER LẠI CÁC MỤC ĐÃ CHỌN TRÊN GIAO DIỆN CHÍNH
        window.renderManualSelections = () => {
            ['early', 'carousel'].forEach(type => {
                const container = document.getElementById(`manual-${type}-container`);
                if (!container) return;

                if (window._manualData[type].length > 0) {
                    container.innerHTML = window._manualData[type].map(name => {
                        // SỬA LỖI Ở ĐÂY: Nhận diện đúng Tướng (early) thay vì (champ)
                        const isChamp = type === 'early';
                        const data = isChamp ? window._builderMasterChamps[name] : window._builderMasterItems[name];
                        const img = data?.image || '/Asset/logo/logo.png';

                        return `
                                    <div class="flex flex-col items-center w-[34px] shrink-0 relative group cursor-pointer" onclick="window._manualData['${type}'] = window._manualData['${type}'].filter(x => x !== '${escapeJS(name)}'); window.renderManualSelections();" title="Bỏ chọn ${name}">
                                        <div class="w-full aspect-square rounded-[5px] border-[1.5px] border-slate-300 dark:border-slate-600 bg-black overflow-hidden relative shadow-sm transition-colors group-hover:border-rose-500">
                                            <img src="${img}" class="w-full h-full object-cover object-[80%] group-hover:opacity-30 transition-opacity">
                                            <i class="fa-solid fa-xmark absolute inset-0 m-auto text-rose-500 text-[14px] opacity-0 group-hover:opacity-100 flex justify-center items-center font-black drop-shadow-md"></i>
                                        </div>
                                        <span class="text-[8px] font-bold text-slate-600 dark:text-slate-400 truncate w-full text-center mt-0.5 group-hover:text-rose-500 transition-colors">${name}</span>
                                    </div>
                                `;
                    }).join('');
                } else {
                    container.innerHTML = '<span class="text-[9.5px] text-slate-400 italic">Tự động tính từ Bàn Cờ...</span>';
                }
            });
        };
        // HÀM SET PRESET NHỊP LÊN CẤP (QUICK FILL)
        window.setPresetLeveling = (preset) => {
            const presets = {
                'fast8': { 4: '2-1', 5: '2-5', 6: '3-2', 7: '3-5', 8: '4-2', 9: '5-1' },
                'reroll1': { 4: '3-1', 5: '3-5', 6: '4-1', 7: '4-5', 8: '5-1', 9: '' },
                'reroll2': { 4: '2-1', 5: '2-5', 6: '3-2', 7: '4-1', 8: '4-5', 9: '' },
                'reroll3': { 4: '2-1', 5: '2-5', 6: '3-2', 7: '3-5', 8: '4-5', 9: '5-5' },
                'clear': { 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' }
            };
            const p = presets[preset];
            if (p) {
                for (let i = 4; i <= 9; i++) {
                    const el = document.getElementById(`lvl-${i}`);
                    if (el) el.value = p[i];
                }
            }
        };

        const renderBuilderInterface = () => {
            const allTraits = [...new Set(champsData.flatMap(c => c.traits.map(t => t.name)))].sort();
            const traitButtonsHTML = allTraits.map(trait => `
                        <button class="builder-filter-trait-btn shrink-0 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10.5px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm outline-none flex items-center gap-1.5 ${window._builderActiveTraits.has(trait) ? 'bg-premium-gold !text-black border-transparent' : ''}" data-trait="${trait}">
                            <div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${getTraitIconName(trait)}.svg'); mask-image: url('./asset/traits/${getTraitIconName(trait)}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>
                            ${trait}
                        </button>
                    `).join('');

            gridContainer.className = "flex flex-col gap-5 w-full pb-20";
            gridContainer.innerHTML = `
                <div class="flex items-center justify-between px-1.5 mb-2 gap-2 h-9">
                    <h3 class="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                        <i class="fa-solid fa-chess-board text-premium-gold"></i> Bàn Cờ
                    </h3>
                    
                    <div class="flex items-center gap-2 flex-1 justify-end max-w-[70%] sm:max-w-[80%]">
                        <div class="flex items-center bg-slate-100 dark:bg-black/40 rounded-full border border-slate-200 dark:border-white/10 shadow-inner h-7 px-2.5 gap-1.5 flex-1 min-w-0 max-w-[320px]">
                            <i class="fa-solid fa-barcode text-[10px] text-slate-400 dark:text-slate-500 shrink-0"></i>
                            
                            <input type="text" id="live-tft-code" readonly value="" placeholder="0 tướng..." 
                                class="flex-1 bg-transparent text-[11px] font-mono font-bold text-slate-600 dark:text-premium-gold outline-none truncate shadow-none w-full min-w-0">
                            
                            <button onclick="window.copyLiveCode()" id="btn-copy-live" 
                                class="text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors text-xs shrink-0 outline-none p-0 bg-transparent border-none" title="Sao chép">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0">
                            <div class="relative group z-20">
                                <button class="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 outline-none transition-colors">
                                    <i class="fa-solid fa-cloud-arrow-down text-[11px]"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1.5 z-20">
                                    <button onclick="window.openLoadMenu()" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 outline-none transition-colors">
                                        <i class="fa-solid fa-clock-rotate-left w-3"></i> Tải từ Local
                                    </button>
                                    <div class="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    <button onclick="window.openImportModal()" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 outline-none transition-colors">
                                        <i class="fa-solid fa-file-code w-3"></i> Mã Code / JSON
                                    </button>
                                </div>
                            </div>

                           <div class="relative group z-20">
                                <button class="w-7 h-7 flex items-center justify-center rounded-full bg-premium-gold/10 text-premium-gold hover:bg-premium-gold hover:text-black border border-premium-gold/30 outline-none transition-colors">
                                    <i class="fa-solid fa-floppy-disk text-[11px]"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1.5 z-40">
                                    <button onclick="window.saveLocalBoard()" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 outline-none transition-colors"><i class="fa-solid fa-bookmark w-3"></i> Lưu Tạm (Cá Nhân)</button>
                                    <div class="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    
                                    <button onclick="window.shareToFirebase()" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 outline-none transition-colors"><i class="fa-solid fa-share-nodes w-3"></i> Chia sẻ (Cộng Đồng)</button>
                                    <div class="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    
                                    <button onclick="window.downloadBoardJSON()" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 outline-none transition-colors"><i class="fa-solid fa-file-arrow-down w-3"></i> Xuất File JSON</button>
                                </div>
                            </div>
                            
                            <button onclick="window.clearBuilderBoard()" class="w-7 h-7 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 outline-none transition-colors" title="Xóa bàn cờ">
                                <i class="fa-solid fa-trash-can text-[11px]"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="builder-trait-tracker" class="flex flex-wrap items-center gap-1.5 px-1 min-h-[28px]"></div>
                <div class="relative w-full max-w-[460px] mx-auto aspect-[2/1] overflow-visible" id="builder-board-container"></div>
                <div id="builder-status-bar" class="min-h-[24px]"></div>

                <div class="mt-2 bg-white dark:bg-premium-card rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-3">
                    <div class="flex justify-between items-center cursor-pointer select-none group" onclick="document.getElementById('manual-config-wrapper').classList.toggle('hidden')">
                        <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest group-hover:text-premium-gold transition-colors"><i class="fa-solid fa-sliders text-premium-gold mr-1"></i> Cấu Hình Nâng Cao (Tùy Chọn)</span>
                        <i class="fa-solid fa-chevron-down text-slate-400 text-[10px]"></i>
                    </div>
                    
                    <div id="manual-config-wrapper" class="hidden mt-3 flex flex-col gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
                        
                        <div class="flex gap-3">
                            <label class="flex-1 flex flex-col gap-1.5">
                                <span class="text-[10px] font-semibold text-slate-500 uppercase">Tên Đội Hình</span>
                                <input type="text" id="builder-manual-title" placeholder="Tự động..." autocomplete="off" class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-white focus:outline-none focus:border-premium-gold/50 shadow-inner">
                            </label>
                            <label class="flex-1 flex flex-col gap-1.5">
                                <span class="text-[10px] font-semibold text-slate-500 uppercase">Nhãn (Fast 8, Reroll...)</span>
                                <input type="text" id="builder-manual-tags" placeholder="Cách nhau dấu phẩy..." autocomplete="off" class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-white focus:outline-none focus:border-premium-gold/50 shadow-inner">
                            </label>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1.5">
                                <div class="flex justify-between items-center">
                                    <span class="text-[10px] font-semibold text-slate-500 uppercase">Đi Chợ (Tối đa 10)</span>
                                    <button onclick="window.openVisualSelector('carousel')" class="text-[9px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 hover:text-premium-gold dark:hover:text-premium-gold transition-colors outline-none"><i class="fa-solid fa-plus"></i> Chọn</button>
                                </div>
                                <div id="manual-carousel-container" class="flex flex-wrap gap-1.5 min-h-[34px] p-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg shadow-inner flex items-center">
                                    <span class="text-[9.5px] text-slate-400 italic">Tự động tính từ Bàn Cờ...</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <div class="flex justify-between items-center">
                                    <span class="text-[10px] font-semibold text-slate-500 uppercase">Đầu Game (Tối đa 5)</span>
                                    <button onclick="window.openVisualSelector('champ')" class="text-[9px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 hover:text-premium-gold dark:hover:text-premium-gold transition-colors outline-none"><i class="fa-solid fa-plus"></i> Chọn</button>
                                </div>
                                <div id="manual-early-container" class="flex flex-wrap gap-1.5 min-h-[34px] p-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg shadow-inner flex items-center">
                                    <span class="text-[9.5px] text-slate-400 italic">Tự động tính từ Bàn Cờ...</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1.5">
                            <div class="flex flex-wrap justify-between items-end gap-2 mb-1">
                                <span class="text-[10px] font-semibold text-slate-500 uppercase">Nhịp Lên Cấp (Điền Vòng đấu)</span>
                                <div class="flex gap-1.5">
                                    <button onclick="window.setPresetLeveling('fast8')" class="text-[8.5px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500 hover:text-white transition-colors outline-none">Fast 8/9</button>
                                    <button onclick="window.setPresetLeveling('reroll1')" class="text-[8.5px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-white transition-colors outline-none">RR 1$</button>
                                    <button onclick="window.setPresetLeveling('reroll2')" class="text-[8.5px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-white transition-colors outline-none">RR 2$</button>
                                    <button onclick="window.setPresetLeveling('reroll3')" class="text-[8.5px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-white transition-colors outline-none">RR 3$</button>
                                    <button onclick="window.setPresetLeveling('clear')" class="text-[8.5px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded hover:bg-rose-500 hover:text-white transition-colors outline-none"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                ${[4, 5, 6, 7, 8, 9].map(lvl => `
                                    <div class="flex flex-col border border-slate-200 dark:border-white/10 rounded overflow-hidden">
                                        <span class="bg-slate-100 dark:bg-white/5 text-[9px] text-center font-bold text-slate-600 dark:text-slate-400 py-0.5 border-b border-slate-200 dark:border-white/10">Cấp ${lvl}</span>
                                        <input type="text" id="lvl-${lvl}" placeholder="Trống" autocomplete="off" class="w-full text-center bg-transparent text-[11px] text-premium-gold font-bold py-1 focus:outline-none focus:bg-premium-gold/10 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600/50">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                    </div>
                </div>
                <div class="flex flex-col bg-white dark:bg-premium-card rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden mt-2">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                        <div class="flex items-center gap-4 shrink-0 px-2">
                            <button onclick="window.setBuilderTab('champ')" class="text-[12px] font-black transition-all outline-none pb-1 border-b-[2.5px] ${window._builderActiveTab === 'champ' ? 'text-premium-gold border-premium-gold drop-shadow-md' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800'}"><i class="fa-solid fa-users mr-1"></i> Tướng</button>
                            <button onclick="window.setBuilderTab('item')" class="text-[12px] font-black transition-all outline-none pb-1 border-b-[2.5px] ${window._builderActiveTab === 'item' ? 'text-rose-500 border-rose-500 drop-shadow-md' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800'}"><i class="fa-solid fa-khanda mr-1"></i> Trang Bị</button>
                        </div>
                        <div class="relative w-full flex-1">
                            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"></i>
                            <input type="text" id="builder-search-input" value="${window._builderSearchQuery}" placeholder="Tìm kiếm..." oninput="window.updateBuilderSearch(this.value)" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[11.5px] text-slate-800 dark:text-white focus:outline-none focus:border-premium-gold/50 shadow-inner">
                        </div>
                    </div>
                    <div id="builder-trait-filters" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 pt-3 pb-1 border-b border-slate-100 dark:border-white/5 ${window._builderActiveTab === 'champ' ? '' : 'hidden'}">
                        <span class="text-[9px] font-black text-premium-gold uppercase shrink-0 tracking-widest mr-1">Lọc Hệ:</span>
                        ${traitButtonsHTML}
                    </div>
                    <div class="p-3 bg-white dark:bg-premium-card">
                        <div class="flex flex-col gap-5 max-h-[300px] overflow-y-auto no-scrollbar relative" id="builder-pool-container"></div>
                    </div>
                </div>
            `;

            window.renderManualSelections();
            renderBoard();
            renderPool();
            attachFilterEvents();
        };
        // Tách riêng hàm sinh Code Riot để Live-update (Không cần xử lý Items/Level)
        window.generateRiotCode = () => {
            let codeChunks = Array(10).fill('000');
            const uniqueTeamChamps = new Set();
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    if (window._builderBoardState[r][c]) {
                        uniqueTeamChamps.add(window._builderBoardState[r][c].champ);
                    }
                }
            }

            const champsArray = [...uniqueTeamChamps].slice(0, 10);
            for (let i = 0; i < champsArray.length; i++) {
                const champName = champsArray[i];
                const normalizedChampName = champName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                const champData = window._builderMasterChamps[champName];

                if (champData && champData.plannerId) {
                    codeChunks[i] = Number(champData.plannerId).toString(16).padStart(3, '0').toLowerCase();
                } else if (window._tftHexMapping && window._tftHexMapping[normalizedChampName]) {
                    codeChunks[i] = window._tftHexMapping[normalizedChampName];
                }
            }

            return champsArray.length > 0 ? `02${codeChunks.join('')}TFTSet17` : '';
        };

        window.copyLiveCode = () => {
            const code = document.getElementById('live-tft-code')?.value;
            if (!code) return uiAlert('Lỗi', 'Bàn cờ đang trống, không có mã để sao chép!', 'info');
            window.copyToClipboard(code, 'btn-copy-live');
        };

        const renderBoard = () => {
            const boardContainer = document.getElementById('builder-board-container');
            const statusBar = document.getElementById('builder-status-bar');
            const tracker = document.getElementById('builder-trait-tracker');
            if (!boardContainer) return;
            boardContainer.innerHTML = '';

            const activeTraits = calculateActiveTraits();
            tracker.innerHTML = activeTraits.length > 0 ? activeTraits.map(t => {
                const iconName = getTraitIconName(t.name);
                return `<div class="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded border ${t.style} transition-colors cursor-help shadow-sm"><div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${iconName}.svg'); mask-image: url('./asset/traits/${iconName}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div><span class="text-[10px] font-bold tracking-wide">${t.name}</span><div class="w-4 h-4 rounded bg-black/20 flex items-center justify-center ml-0.5 shadow-inner border border-white/10"><span class="text-[9.5px] font-black leading-none">${t.count}</span></div></div>`;
            }).join('') : '<span class="text-[10.5px] font-medium text-slate-400 italic">Chưa có tộc hệ kích hoạt</span>';

            if (window._builderActiveTool) {
                const toolName = window._builderActiveTool.id;
                const isMove = window._builderActiveTool.type === 'move';
                const isItem = window._builderActiveTool.type === 'item';
                let actionText = isMove ? `Đang di chuyển: <b class="text-slate-800 dark:text-white">${toolName}</b>` : isItem ? `Đang ghép: <b class="text-slate-800 dark:text-white">${toolName}</b>` : `Đang chọn: <b class="text-slate-800 dark:text-white">${toolName}</b>`;
                statusBar.innerHTML = `<div class="mx-auto mt-1 px-3 py-1.5 bg-premium-gold/20 border border-premium-gold/50 rounded-lg text-yellow-600 dark:text-premium-gold text-[10.5px] font-medium shadow-sm flex items-center justify-center gap-2 animate-pulse w-max max-w-full truncate"><i class="fa-solid fa-crosshairs"></i> ${actionText}</div>`;
            } else {
                statusBar.innerHTML = '<p class="text-center text-[10.5px] text-slate-500 dark:text-slate-400 italic mt-1 flex items-center justify-center gap-1.5"><i class="fa-solid fa-lightbulb text-yellow-500"></i> Chạm Tướng/Đồ rồi chạm Bàn cờ để xếp.</p>';
            }

            const hexClip = "clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);";
            let boardHTML = '';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    const isOddRow = r % 2 !== 0;
                    const left = c * 13.333 + (isOddRow ? 6.666 : 0);
                    const top = r * 23.077;
                    const cellState = window._builderBoardState[r][c];
                    const isSelected = window._builderActiveTool?.type === 'move' && window._builderActiveTool.r === r && window._builderActiveTool.c === c;
                    const moveHighlight = isSelected ? 'brightness-125 scale-110 z-30 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'scale-[0.95] drop-shadow-md';

                    if (cellState) {
                        const cData = window._builderMasterChamps[cellState.champ];
                        let bgBorder = 'bg-slate-400 dark:bg-slate-500';
                        if (cData?.cost === 2) bgBorder = 'bg-emerald-500';
                        if (cData?.cost === 3) bgBorder = 'bg-blue-500';
                        if (cData?.cost === 4) bgBorder = 'bg-purple-500';
                        if (cData?.cost === 5) bgBorder = 'bg-yellow-400';

                        const itemsHTML = `<div class="absolute -bottom-2.5 left-0 w-full flex justify-center gap-[2px] z-20 pointer-events-none">${cellState.items.map(itemName => `<img src="${window._builderMasterItems[itemName]?.image}" class="w-[18px] h-[18px] rounded-[4px] border-[1.5px] border-white dark:border-[#0B101A] object-cover shadow-lg bg-black" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">`).join('')}</div>`;

                        boardHTML += `
                            <div class="absolute z-20 transition-all duration-300 cursor-pointer ${moveHighlight}" style="width: 13.333%; height: 30.769%; left: ${left}%; top: ${top}%;" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'move', '${escapeJS(cellState.champ)}', ${r}, ${c})" onclick="window.handleHexClick(${r}, ${c})" ondragover="event.preventDefault(); this.classList.add('brightness-150');" ondragleave="this.classList.remove('brightness-150');" ondrop="window.handleBuilderDrop(event, ${r}, ${c}); this.classList.remove('brightness-150');">
                                <div class="absolute inset-0 ${bgBorder}" style="${hexClip}"></div>
                                <img src="${cData?.image}" class="absolute w-[92%] h-[92%] left-[4%] top-[4%] object-cover object-[80%] bg-slate-900 pointer-events-none" style="${hexClip}" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">
                                ${itemsHTML}
                                <div class="absolute -top-1.5 -right-1 z-40 cursor-pointer transition-transform hover:scale-110 active:scale-90" onclick="event.stopPropagation(); window.removeBuilderEntity(${r}, ${c})"><div class="w-[18px] h-[18px] bg-rose-600 rounded-full flex items-center justify-center shadow-lg border border-white dark:border-slate-800"><i class="fa-solid fa-xmark text-white text-[10px]"></i></div></div>
                            </div>`;
                    } else {
                        boardHTML += `<div class="absolute z-10 transition-all duration-200 cursor-pointer scale-[0.95] group hover:scale-100 hover:z-20" style="width: 13.333%; height: 30.769%; left: ${left}%; top: ${top}%;" onclick="window.handleHexClick(${r}, ${c})" ondragover="event.preventDefault(); this.classList.add('scale-105', 'brightness-150');" ondragleave="this.classList.remove('scale-105', 'brightness-150');" ondrop="window.handleBuilderDrop(event, ${r}, ${c}); this.classList.remove('scale-105', 'brightness-150');"><div class="absolute inset-0 bg-slate-300 dark:bg-slate-700/60 opacity-60 group-hover:opacity-100 group-hover:bg-premium-gold/50 transition-colors" style="${hexClip}"></div><div class="absolute w-[94%] h-[94%] left-[3%] top-[3%] bg-slate-100 dark:bg-[#121a28] group-hover:bg-slate-200 transition-colors" style="${hexClip}"></div></div>`;
                    }
                }
            }
            boardContainer.innerHTML = boardHTML;

            const liveInput = document.getElementById('live-tft-code');
            if (liveInput) liveInput.value = window.generateRiotCode();
        };

        const renderPool = () => {
            const pool = document.getElementById('builder-pool-container');
            if (!pool) return;
            const query = window._builderSearchQuery.toLowerCase();
            const gridClass = "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 px-1";
            let poolHTML = '';

            if (window._builderActiveTab === 'champ') {
                const filtered = champsData.filter(c => c.name.toLowerCase().includes(query) && (window._builderActiveTraits.size === 0 || [...window._builderActiveTraits].every(st => c.traits.some(t => t.name === st))));
                [1, 2, 3, 4, 5].forEach(tier => {
                    const champsInTier = filtered.filter(c => c.cost === tier);
                    if (champsInTier.length === 0) return;
                    let tierColor = 'text-slate-600 dark:text-slate-400'; let tierBg = 'bg-slate-400';
                    if (tier === 2) tierColor = 'text-emerald-600'; if (tier === 3) tierColor = 'text-blue-600'; if (tier === 4) tierColor = 'text-purple-600'; if (tier === 5) tierColor = 'text-yellow-600';
                    poolHTML += `<div class="flex flex-col gap-3 mb-2"><div class="flex items-center gap-2 sticky top-0 bg-white/95 dark:bg-premium-card/95 backdrop-blur-md z-20 py-1.5"><div class="w-1.5 h-4 rounded-full ${tierBg}"></div><h4 class="text-[11px] font-black ${tierColor} uppercase tracking-wider">${tier} VÀNG</h4><div class="flex-1 h-[1px] bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent"></div></div><div class="${gridClass}">${champsInTier.map(champ => `<div class="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${window._builderActiveTool?.id === champ.name ? 'ring-[3px] ring-premium-gold scale-105 z-10' : 'ring-[1px] ring-slate-300 dark:ring-white/20'}" onclick="window.selectBuilderTool('champ', '${escapeJS(champ.name)}')" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'champ', '${escapeJS(champ.name)}')"><img src="${champ.image}" class="w-full h-full object-cover object-[80%] bg-black pointer-events-none"><div class="absolute top-1 left-1 flex flex-col gap-[3px] pointer-events-none z-10 opacity-95">${champ.traits.slice(0, 3).map(t => `<div class="w-3 h-3 bg-white" style="-webkit-mask-image: url('./asset/traits/${getTraitIconName(t.name)}.svg'); mask-image: url('./asset/traits/${getTraitIconName(t.name)}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>`).join('')}</div><div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 pt-5 pb-1 px-1 text-center pointer-events-none"><span class="block text-[10px] font-bold text-white truncate drop-shadow-md leading-none">${window.escapeHTML(champ.name)}</span></div></div>`).join('')}</div></div>`;
                });
            } else {
                const categories = [{ key: 'normal', name: 'Cơ Bản' }, { key: 'emblem', name: 'Ấn Hệ Tộc' }, { key: 'radiant', name: 'Ánh Sáng' }, { key: 'artifact', name: 'Tạo Tác' }, { key: 'support', name: 'Hỗ Trợ' }];
                categories.forEach(cat => {
                    const itemsInCat = itemsList.filter(i => i.name.toLowerCase().includes(query) && (i.category?.toLowerCase() || 'normal') === cat.key);
                    if (itemsInCat.length === 0) return;
                    poolHTML += `<div class="flex flex-col gap-3 mb-2"><div class="flex items-center gap-2 sticky top-0 bg-white/95 dark:bg-premium-card/95 backdrop-blur-md z-20 py-1.5"><div class="w-1.5 h-4 rounded-full bg-rose-500"></div><h4 class="text-[11px] font-black text-slate-600 uppercase tracking-wider">${cat.name}</h4><div class="flex-1 h-[1px] bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent"></div></div><div class="${gridClass}">${itemsInCat.map(item => `<div class="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${window._builderActiveTool?.id === item.name ? 'ring-[3px] ring-rose-400 scale-105 z-10' : 'ring-[1px] ring-slate-300 dark:ring-white/20'}" onclick="window.selectBuilderTool('item', '${escapeJS(item.name)}')" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'item', '${escapeJS(item.name)}')"><img src="${item.image}" class="w-full h-full object-cover bg-black pointer-events-none"><div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 pt-5 pb-1 px-1 text-center pointer-events-none"><span class="block text-[9px] font-bold text-white truncate drop-shadow-md leading-none">${window.escapeHTML(item.name)}</span></div></div>`).join('')}</div></div>`;
                });
            }
            pool.innerHTML = poolHTML || '<p class="text-center text-[11.5px] text-slate-500 py-6">Không tìm thấy kết quả.</p>';
        };

        const attachFilterEvents = () => {
            document.querySelectorAll('.builder-filter-trait-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const trait = e.currentTarget.dataset.trait;
                    if (window._builderActiveTraits.has(trait)) window._builderActiveTraits.delete(trait);
                    else window._builderActiveTraits.add(trait);
                    renderBuilderInterface();
                };
            });
        };

        window.setBuilderTab = (tab) => {
            window._builderActiveTab = tab;
            window._builderSearchQuery = '';
            window._builderActiveTool = null;
            renderBuilderInterface();
        };

        window.updateBuilderSearch = window.debounce((val) => { window._builderSearchQuery = val; renderPool(); }, 300);

        window.selectBuilderTool = (type, id) => {
            if (window._builderActiveTool?.id === id) window._builderActiveTool = null;
            else window._builderActiveTool = { type, id, r: -1, c: -1 };
            renderBoard(); renderPool();
        };

        window.handleHexClick = (r, c) => {
            const tool = window._builderActiveTool;
            const cell = window._builderBoardState[r][c];
            if (tool) {
                if (tool.type === 'champ') {
                    window._builderBoardState[r][c] = { champ: tool.id, items: [] };
                    window._builderActiveTool = null;
                } else if (tool.type === 'item') {
                    if (cell) {
                        if (cell.items.length < 3) cell.items.push(tool.id);
                        else uiAlert('Đầy đồ', 'Tướng chỉ mang tối đa 3 trang bị.', 'info');
                        window._builderActiveTool = null;
                    }
                } else if (tool.type === 'move') {
                    if (tool.r === r && tool.c === c) window._builderActiveTool = null;
                    else {
                        const temp = window._builderBoardState[r][c];
                        window._builderBoardState[r][c] = window._builderBoardState[tool.r][tool.c];
                        window._builderBoardState[tool.r][tool.c] = temp;
                        window._builderActiveTool = null;
                    }
                }
            } else if (cell) {
                window._builderActiveTool = { type: 'move', id: cell.champ, r, c };
            }
            renderBoard(); renderPool();
        };

        window.removeBuilderEntity = (r, c) => {
            window._builderBoardState[r][c] = null;
            window._builderActiveTool = null;
            renderBoard();
        };

        window.handleBuilderDragStart = (e, type, id, r = -1, c = -1) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ type, id, r, c }));
            window._builderActiveTool = { type, id, r, c }; renderBoard(); renderPool();
        };

        window.handleBuilderDrop = (e, r, c) => {
            e.preventDefault();
            try { window._builderActiveTool = JSON.parse(e.dataTransfer.getData('text/plain')); window.handleHexClick(r, c); } catch (err) { }
        };

        const BUILDER_STORAGE_KEY = 'tft_builder_saves_v2';

        window.getAllSavedData = () => {
            const data = localStorage.getItem(BUILDER_STORAGE_KEY);
            return data ? JSON.parse(data) : { auto: null, manual: [] };
        };

        window.autoSaveBoard = () => {
            const data = window.getAllSavedData();
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}`;
            data.auto = {
                name: `Bản lưu Tự động (${timeString})`,
                board: window._builderBoardState
            };
            localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));
        };

        window.saveLocalBoard = () => {
            const data = window.getAllSavedData();
            if (data.manual.length >= 5) {
                uiAlert('Lỗi đầy bộ nhớ', 'Bạn đã lưu tối đa 5 đội hình. Vui lòng mở Danh sách Đã lưu để xóa bớt!', 'error');
                return;
            }

            const inputHTML = `
                        <div class="flex flex-col gap-2 mt-1 text-left">
                            <p class="text-[11.5px] text-slate-500 dark:text-slate-400">Vui lòng đặt tên để dễ dàng quản lý (tối đa 5 bản lưu).</p>
                            <input type="text" id="custom-save-name" placeholder="VD: Đội hình Exodia..." 
                                class="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 dark:text-white focus:outline-none focus:border-premium-gold dark:focus:border-premium-gold transition-colors mt-1 shadow-inner" 
                                autocomplete="off">
                        </div>
                    `;

            uiConfirm('Lưu Đội Hình', inputHTML, () => {
                const nameInput = document.getElementById('custom-save-name');
                const saveName = nameInput ? nameInput.value.trim() : '';

                if (!saveName || saveName === "") {
                    setTimeout(() => uiAlert('Lỗi', 'Tên đội hình không được để trống!', 'error'), 100);
                    return;
                }

                data.manual.push({
                    id: Date.now(),
                    name: saveName,
                    board: JSON.parse(JSON.stringify(window._builderBoardState))
                });
                localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));

                setTimeout(() => uiAlert('Thành công', `Đã lưu đội hình: <b class="text-premium-gold">${saveName}</b>`, 'info'), 100);
            });

            setTimeout(() => {
                const inp = document.getElementById('custom-save-name');
                if (inp) {
                    inp.focus();
                    inp.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const confirmBtn = document.getElementById('modal-actions').querySelectorAll('button')[1];
                            if (confirmBtn) confirmBtn.click();
                        }
                    });
                }
            }, 100);
        };

        window.loadSpecificBoard = (type, id) => {
            const data = window.getAllSavedData();
            if (type === 'auto' && data.auto) window._builderBoardState = data.auto.board;
            else if (type === 'manual') {
                const found = data.manual.find(x => x.id === id);
                if (found) window._builderBoardState = found.board;
            }
            renderBoard();
            renderPool();
            closeModal();
            uiAlert('Thành công', 'Đội hình đã được tải lên bàn cờ!', 'info');
        };

        window.deleteSpecificBoard = (id) => {
            const data = window.getAllSavedData();
            data.manual = data.manual.filter(x => x.id !== id);
            localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));
            window.openLoadMenu();
        };

        // ===== HÀM ĐÓNG GÓI JSON XUẤT RA =====
        const generateJSONPayload = () => {
            const boardPos = [];
            const unitsList = [];
            let hasHighCost = false;
            const componentCounts = {};

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    const cell = window._builderBoardState[r][c];
                    if (cell) {
                        const champName = cell.champ;
                        boardPos.push({ champion: champName, hex_id: r * 7 + c, coordinates: { row: r, col: c } });
                        unitsList.push({ champion: champName, items: [...cell.items] });

                        const cData = window._builderMasterChamps[champName];
                        if (cData && cData.cost >= 4) hasHighCost = true;

                        cell.items.forEach(itemName => {
                            const iData = window._builderMasterItems[itemName];
                            if (iData) {
                                if (iData.recipe && iData.recipe.length === 2) {
                                    iData.recipe.forEach(comp => {
                                        if (comp.name) componentCounts[comp.name] = (componentCounts[comp.name] || 0) + 1;
                                    });
                                } else if (iData.category === 'normal') {
                                    componentCounts[iData.name] = (componentCounts[iData.name] || 0) + 1;
                                }
                            }
                        });
                    }
                }
            }

            if (boardPos.length === 0) return null;

            // --- ƯU TIÊN ĐỌC TỪ CẤU HÌNH THỦ CÔNG ---
            const manualTitle = document.getElementById('builder-manual-title')?.value.trim();
            const finalTitle = manualTitle || "Đội Hình Tự Tạo";

            const manualTagsStr = document.getElementById('builder-manual-tags')?.value.trim();
            const compTags = manualTagsStr ? manualTagsStr.split(',').map(s => s.trim()).filter(Boolean) : (hasHighCost ? ["Fast 9"] : ["Fast 8"]);

            // Đọc Nhịp Lên Cấp
            let levelingPacing = [];
            let hasManualLevel = false;
            [4, 5, 6, 7, 8, 9].forEach(lvl => {
                const val = document.getElementById(`lvl-${lvl}`)?.value.trim();
                if (val) {
                    levelingPacing.push({ level: `Cấp ${lvl}`, stage: val });
                    hasManualLevel = true;
                }
            });

            if (!hasManualLevel) {
                levelingPacing = hasHighCost ? [
                    { level: "Cấp 4", stage: "2-1" }, { level: "Cấp 5", stage: "2-5" },
                    { level: "Cấp 6", stage: "3-2" }, { level: "Cấp 7", stage: "3-5" },
                    { level: "Cấp 8", stage: "4-2" }, { level: "Cấp 9", stage: "5-1" }
                ] : [
                    { level: "Cấp 4", stage: "2-1" }, { level: "Cấp 5", stage: "2-5" },
                    { level: "Cấp 6", stage: "3-2" }, { level: "Cấp 7", stage: "3-5" },
                    { level: "Cấp 8", stage: "4-1" }
                ];
            }

            // Đọc Đi chợ (Carousel)
            let carouselPrio = [];
            if (window._manualData.carousel.length > 0) {
                carouselPrio = window._manualData.carousel.map(i => ({ item: i, count: "x1" }));
            } else {
                carouselPrio = Object.entries(componentCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ item: name, count: `x${count}` }));
            }

            // Đọc Đầu game (Early Comp)
            let earlyTeam = [];
            if (window._manualData.early.length > 0) {
                earlyTeam = window._manualData.early;
            } else {
                const activeTraits = calculateActiveTraits().filter(t => t.isActive).map(t => t.name);
                if (activeTraits.length > 0) {
                    earlyTeam = Object.values(window._builderMasterChamps)
                        .filter(c => c.cost <= 2 && c.traits.some(t => activeTraits.includes(t.name)))
                        .map(c => c.name)
                        .slice(0, 5);
                }
            }

            // 4. Sinh Mã Đội Hình Chuẩn Client Riot V2
            let codeChunks = Array(10).fill('000'); // Mùa 17 khoảng trống là 3 số 0 ('000')
            const uniqueTeamChamps = [...new Set(boardPos.map(pos => pos.champion))];
            const maxChampsToEncode = Math.min(uniqueTeamChamps.length, 10);

            for (let i = 0; i < maxChampsToEncode; i++) {
                const champName = uniqueTeamChamps[i];

                // Chuẩn hóa tên tướng được xếp trên bàn cờ ("Cho'Gath" -> "chogath")
                const normalizedChampName = champName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

                // Ghép mã Hex 3 ký tự vào chuỗi
                if (window._tftHexMapping && window._tftHexMapping[normalizedChampName]) {
                    codeChunks[i] = window._tftHexMapping[normalizedChampName];
                }
            }

            // Ghép mã hoàn chỉnh: Tiền tố '02' + 10 Slot + Hậu tố Mùa
            const realTeamCode = `02${codeChunks.join('')}TFTSet17`;

            return {
                "CompTitle": finalTitle,
                "CompRowTags": compTags,
                "UnitsContainer": unitsList,
                "CopyTeamCode": realTeamCode,
                "CompEarlyOptions": earlyTeam.length > 0 ? [{ "win_rate": "Auto", "team_comp": earlyTeam }] : [],
                "CompQuickStart": {
                    "leveling": levelingPacing,
                    "carousel": carouselPrio
                },
                "BoardPositions": boardPos
            };
        };

        window.clearBuilderBoard = () => uiConfirm('Làm sạch', 'Xóa toàn bộ đội hình hiện tại trên bàn cờ?', () => {
            window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
            window._builderActiveTool = null;
            window.autoSaveBoard();
            renderBoard();
            renderPool();
        });

        window.downloadBoardJSON = () => { const out = generateJSONPayload(); if (!out) return; const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify([out], null, 4)); const link = document.createElement('a'); link.setAttribute("href", dataStr); link.setAttribute("download", "tft_comp.json"); link.click(); };

        window.shareToFirebase = () => {
            if (!generateJSONPayload()) { uiAlert('Lỗi', 'Bàn cờ trống!', 'info'); return; }
            uiAlert('<span class="text-rose-500 font-black">Chia sẻ Cloud</span>', `
                        <div class="flex flex-col gap-3 text-left">
                            <p class="text-xs text-slate-500">Đội hình sẽ được lưu vào Firestore công khai.</p>
                            <div class="flex justify-center p-1 min-h-[78px]"><div id="recaptcha-container"></div></div>
                            <button id="btn-upload-fs" onclick="window.processFS()" class="w-full py-2 bg-rose-500 text-white font-bold rounded-lg shadow-md transition-colors hover:bg-rose-600 outline-none">Chia sẻ Đội Hình</button>
                        </div>
                    `);
            setTimeout(() => { if (window.grecaptcha) grecaptcha.render('recaptcha-container', { 'sitekey': RECAPTCHA_SITE_KEY, 'theme': 'dark' }); }, 100);
        };

        window.processFS = async () => {
            if (!grecaptcha.getResponse()) return uiAlert('Lỗi', 'Xác nhận Captcha!', 'error');
            const btn = document.getElementById('btn-upload-fs');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...';
            const shareCode = 'TFT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            try {
                const payload = generateJSONPayload();
                // Kẹp thêm shareCode và thời gian tạo vào JSON
                await window._fsSetDoc(window._fsDoc(window._db, "shared_comps", shareCode), { ...payload, shareCode, createdAt: new Date().toISOString() });
                closeModal();
                uiAlert('Thành công', `Đội hình đã được đăng tải lên Cộng Đồng!<br>Mã truy cập nhanh: <b class="text-lg text-premium-gold select-all mt-2 block">${shareCode}</b>`, 'info');
            } catch (e) {
                uiAlert('Lỗi', 'Không thể kết nối Firebase. Có thể do lỗi mạng hoặc cấu hình.', 'error');
                btn.disabled = false;
                btn.innerText = 'Thử lại';
            }
        };

        window.openImportModal = () => {
            uiAlert('<span class="text-blue-500 font-black">Nhập Đội Hình</span>', `
                        <div class="flex flex-col gap-3 text-left">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Từ Game (Mã chuẩn Client)</span>
                                <div class="flex gap-2">
                                    <input type="text" id="imp-tft-code" class="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-[11px] text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500 shadow-inner" placeholder="VD: 0201d...">
                                    <button onclick="window.doImpCode()" class="px-3 bg-blue-500 text-white font-bold rounded-lg text-[11px] whitespace-nowrap hover:bg-blue-600 outline-none">Nhập Mã</button>
                                </div>
                            </div>
                            
                            <div class="w-full h-[1px] bg-slate-200 dark:bg-white/10 my-0.5"></div>
                            
                            <div class="flex flex-col gap-1.5">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Từ Web (JSON Nâng Cao)</span>
                                <input type="file" id="fs-file" accept=".json" class="hidden" onchange="const r=new FileReader(); r.onload=e=>document.getElementById('imp-area').value=e.target.result; r.readAsText(this.files[0])">
                                <button onclick="document.getElementById('fs-file').click()" class="w-full py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded text-[10px] font-bold mb-1 hover:bg-slate-300 dark:hover:bg-slate-600 outline-none"><i class="fa-solid fa-folder-open"></i> Chọn File JSON Đã Tải</button>
                                <textarea id="imp-area" class="w-full h-16 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono outline-none shadow-inner" placeholder="Hoặc copy nội dung JSON dán vào đây..."></textarea>
                                <button onclick="window.doImpJSON()" class="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg text-[11px] mt-1 hover:bg-emerald-600 outline-none">Nhập JSON</button>
                            </div>
                        </div>
                    `);
        };

        // Dịch ngược Mã Code Riot thành Tướng trên Bàn Cờ
        window.doImpCode = () => {
            const val = document.getElementById('imp-tft-code').value.trim();
            if (!val) return uiAlert('Lỗi', 'Vui lòng dán mã TFT!', 'error');

            if (!val.startsWith('02') || !val.includes('TFTSet')) {
                return uiAlert('Lỗi', 'Mã TFT không hợp lệ! (Ví dụ chuẩn: 02...TFTSet17)', 'error');
            }

            try {
                const core = val.substring(2, val.indexOf('TFTSet'));
                const champsFound = [];

                // Tạo bảng tra ngược (Hex -> Tên Tướng)
                const reverseMap = {};
                Object.values(window._builderMasterChamps).forEach(c => {
                    if (c.plannerId) reverseMap[Number(c.plannerId).toString(16).padStart(3, '0').toLowerCase()] = c.name;
                });
                for (const [nameKey, hexCode] of Object.entries(window._tftHexMapping)) {
                    if (!reverseMap[hexCode]) {
                        const realC = Object.values(window._builderMasterChamps).find(c =>
                            c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === nameKey
                        );
                        if (realC) reverseMap[hexCode] = realC.name;
                    }
                }

                // Đọc từng 3 ký tự Hex
                for (let i = 0; i < core.length; i += 3) {
                    const hex = core.substring(i, i + 3);
                    if (hex !== '000' && reverseMap[hex]) {
                        champsFound.push(reverseMap[hex]);
                    }
                }

                window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));

                let placed = 0;
                // Tự động xếp tướng từ hàng dưới cùng lên
                for (let r = 3; r >= 0; r--) {
                    for (let c = 0; c < 7; c++) {
                        if (placed < champsFound.length) {
                            window._builderBoardState[r][c] = { champ: champsFound[placed], items: [] };
                            placed++;
                        }
                    }
                }

                window.autoSaveBoard();
                closeModal();
                renderBoard();
                renderPool();
                uiAlert('Thành công', `Đã nhập mã TFT. Đã xếp <b>${champsFound.length}</b> tướng lên bàn cờ!`, 'info');
            } catch (e) {
                uiAlert('Lỗi', 'Có lỗi khi phân tích mã.', 'error');
            }
        };

        window.doImpJSON = () => {
            const val = document.getElementById('imp-area').value.trim();
            if (!val) return uiAlert('Lỗi', 'Vui lòng chọn file JSON hoặc dán mã JSON!', 'error');
            try {
                const data = JSON.parse(val);
                const parsed = Array.isArray(data) ? data[0] : data;
                window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
                const itemMap = {};
                if (parsed.UnitsContainer) parsed.UnitsContainer.forEach((u, i) => { itemMap[u.champion + '_' + i] = u.items || []; itemMap[u.champion] = u.items || []; });
                let count = {};
                parsed.BoardPositions.forEach(p => {
                    const r = p.coordinates.row, c = p.coordinates.col;
                    if (r < 4 && c < 7) {
                        count[p.champion] = (count[p.champion] || 0);
                        window._builderBoardState[r][c] = { champ: p.champion, items: [...(itemMap[p.champion + '_' + count[p.champion]] || itemMap[p.champion] || [])] };
                        count[p.champion]++;
                    }
                });

                if (parsed.CompEarlyOptions && parsed.CompEarlyOptions.length > 0) {
                    window._manualData.early = parsed.CompEarlyOptions[0].team_comp || [];
                }
                if (parsed.CompQuickStart && parsed.CompQuickStart.carousel) {
                    window._manualData.carousel = parsed.CompQuickStart.carousel.map(x => x.item);
                }

                window.autoSaveBoard();
                closeModal();
                window.renderManualSelections();
                renderBoard();
                renderPool();
                uiAlert('Thành công', 'Đã tải Đội Hình đầy đủ (Trang bị & Vị trí) từ JSON!', 'info');
            } catch (e) { uiAlert('Lỗi', 'Dữ liệu JSON không hợp lệ.', 'error'); }
        };

        window.openLoadMenu = () => {
            const data = window.getAllSavedData();
            let listHTML = '';

            if (data.auto) {
                listHTML += `
                            <div class="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl mb-3 shadow-sm">
                                <div class="flex items-center gap-2.5">
                                    <i class="fa-solid fa-robot text-blue-500"></i>
                                    <span class="text-[12px] font-semibold text-slate-700 dark:text-slate-300">${data.auto.name}</span>
                                </div>
                                <button onclick="window.loadSpecificBoard('auto', null)" class="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow hover:bg-blue-600 transition-colors outline-none">Tải</button>
                            </div>
                        `;
            }

            if (data.manual.length > 0) {
                listHTML += `<div class="w-full h-[1px] bg-slate-200 dark:bg-white/10 my-3"></div>`;
                data.manual.forEach(item => {
                    listHTML += `
                                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl mb-2 shadow-sm group">
                                    <div class="flex items-center gap-2.5 truncate pr-2">
                                        <i class="fa-solid fa-bookmark text-premium-gold"></i>
                                        <span class="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate">${window.escapeHTML(item.name)}</span>
                                    </div>
                                    <div class="flex items-center gap-1.5 shrink-0">
                                        <button onclick="window.loadSpecificBoard('manual', ${item.id})" class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-[10px] font-bold rounded-lg hover:bg-premium-gold hover:text-black transition-colors outline-none">Tải</button>
                                        <button onclick="window.deleteSpecificBoard(${item.id})" class="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors outline-none">
                                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                });
            } else {
                listHTML += `<p class="text-center text-[11px] text-slate-500 py-3 italic">Chưa có đội hình nào được lưu thủ công.</p>`;
            }

            uiAlert('<span class="text-slate-800 dark:text-white font-black">Danh sách Đã Lưu</span>', `<div class="flex flex-col mt-2 max-h-[300px] overflow-y-auto no-scrollbar">${listHTML}</div>`);
        };

        renderBuilderInterface();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-4 text-center text-red-500 text-sm bg-red-100 rounded-xl">Lỗi Builder: ${error.message}</div>`;
    }
}
