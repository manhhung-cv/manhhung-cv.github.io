// =========================================================
// HÀM TEAM BUILDER - GIAO DIỆN SOLID PREMIUM (SIÊU MƯỢT)
// =========================================================

async function loadBuilderData() {
    const gridContainer = document.getElementById('grid-builder');
    if (!gridContainer) return;

    try {
        const RECAPTCHA_SITE_KEY = "6Lfq0YQsAAAAAGwargZMaws6m9oLYXAR6BHF50O2";

        const [champsData, rawItemsData, traitsData, rawPlannerData] = await Promise.all([
            window.fetchCached('./asset/data/champions.json'),
            window.fetchCached('./asset/data/items.json'),
            window.fetchCached('./asset/data/traits.json'),
            window.fetchCached('./asset/data/tft_planner.json').catch(() => null)
        ]);

        if (!champsData || !rawItemsData || !traitsData) throw new Error('Lỗi tải dữ liệu hệ thống.');

        window._tftHexMapping = {};
        let plannerData = rawPlannerData ? (rawPlannerData["TFTSet17"] || []) : [];

        if (plannerData.length > 0) {
            plannerData.forEach(c => {
                const plannerCode = c.team_planner_code;
                if (plannerCode !== undefined && plannerCode !== null) {
                    let pureName = c.character_id && c.character_id.includes('_') ? c.character_id.split('_')[1] : c.display_name;
                    if (pureName) {
                        pureName = pureName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
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

        window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
        window._builderActiveTool = null;
        window._builderActiveTab = 'champ';
        window._builderSearchQuery = '';
        window._builderActiveTraits = new Set();
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
                let style = 'bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-premium-border';
                let isActive = false;
                if (traitData?.levels) {
                    const sortedLevels = [...traitData.levels].sort((a, b) => parseInt(b.milestone) - parseInt(a.milestone));
                    for (let i = 0; i < sortedLevels.length; i++) {
                        if (count >= parseInt(sortedLevels[i].milestone)) {
                            isActive = true;
                            if (i === 0 && sortedLevels.length > 2) style = 'bg-premium-gold text-black border-premium-gold';
                            else if (i === 0 || i === 1) style = 'bg-blue-500 text-white border-blue-500';
                            else style = 'bg-emerald-500 text-white border-emerald-500';
                            break;
                        }
                    }
                } else if (count >= 1) {
                    isActive = true;
                    style = 'bg-premium-gold text-black border-premium-gold';
                }
                activeTraitsArray.push({ name, count, style, isActive });
            }
            return activeTraitsArray.sort((a, b) => (a.isActive === b.isActive) ? b.count - a.count : (a.isActive ? -1 : 1));
        };

        window.openVisualSelector = (type) => {
            const isChamp = type === 'champ';
            const max = isChamp ? 5 : 10;
            const targetKey = isChamp ? 'early' : 'carousel';
            let selectedSet = new Set(window._manualData[targetKey]);

            window._vsSearchQuery = '';
            window._vsActiveFilter = 'all';

            window._toggleSelection = (id) => {
                if (selectedSet.has(id)) {
                    selectedSet.delete(id);
                } else {
                    if (selectedSet.size >= max) return uiAlert('GIỚI HẠN', `Chỉ được chọn tối đa ${max} mục!`, 'info');
                    selectedSet.add(id);
                }
                window._renderVisualSelectorGrid();
            };

            window._setVsFilter = (val) => {
                window._vsActiveFilter = val;
                document.querySelectorAll('.vs-filter-btn').forEach(btn => {
                    if (btn.dataset.val === val) {
                        btn.className = "vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-black rounded-full border border-premium-gold bg-premium-gold text-black uppercase outline-none transition-colors";
                    } else {
                        btn.className = "vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-bold rounded-full border bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 hover:bg-zinc-200 dark:hover:bg-[#27272a] transition-colors uppercase outline-none";
                    }
                });
                window._renderVisualSelectorGrid();
            };

            window._renderVisualSelectorGrid = () => {
                const container = document.getElementById('vs-grid-container');
                const countText = document.getElementById('vs-count-text');
                if (!container) return;

                let items = [];
                if (isChamp) {
                    items = Object.values(window._builderMasterChamps).sort((a, b) => a.cost - b.cost);
                    if (window._vsActiveFilter !== 'all') items = items.filter(c => c.cost === parseInt(window._vsActiveFilter));
                } else {
                    items = Object.values(window._builderMasterItems).filter(i => i.category !== 'emblem' && i.category !== 'consumable');
                    if (window._vsActiveFilter !== 'all') items = items.filter(i => i.category === window._vsActiveFilter);
                }

                if (window._vsSearchQuery) {
                    const q = window._vsSearchQuery.toLowerCase();
                    items = items.filter(i => i.name.toLowerCase().includes(q));
                }

                if (items.length === 0) {
                    container.innerHTML = '<p class="col-span-full text-center text-xs text-zinc-500 py-10 uppercase tracking-widest font-bold">KHÔNG CÓ KẾT QUẢ</p>';
                } else {
                    container.innerHTML = items.map(i => {
                        const isSel = selectedSet.has(i.name);
                        const borderStyle = isSel ? 'border-premium-gold' : 'border-zinc-300 dark:border-premium-border hover:border-premium-gold/50';
                        const checkIcon = isSel ? `<div class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-premium-gold flex items-center justify-center border-2 border-white dark:border-[#1c1c1e] z-20"><i class="fa-solid fa-check text-[10px] text-black font-black"></i></div>` : '';

                        return `
                            <div class="flex flex-col items-center relative gap-1.5 cursor-pointer group transition-transform hover:scale-105" onclick="window._toggleSelection('${escapeJS(i.name)}')">
                                <div class="relative w-full aspect-square bg-black rounded-2xl border-[1.5px] ${borderStyle} transition-colors overflow-hidden">
                                    <img src="${i.image}" class="w-full h-full object-cover object-[80%] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">
                                </div>
                                ${checkIcon}
                                <span class="text-[9px] font-bold ${isSel ? 'text-premium-gold' : 'text-zinc-600 dark:text-zinc-400'} truncate w-full text-center uppercase tracking-wider">${i.name}</span>
                            </div>
                        `;
                    }).join('');
                }
                if (countText) countText.innerHTML = `ĐÃ CHỌN: <span class="text-premium-gold ml-1 font-black">${selectedSet.size} / ${max}</span>`;
            };

            const filtersHTML = isChamp
                ? `<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-3">
                     <button onclick="window._setVsFilter('all')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-black rounded-full border border-premium-gold bg-premium-gold text-black uppercase outline-none transition-colors" data-val="all">TẤT CẢ</button>
                     ${[1, 2, 3, 4, 5].map(c => `<button onclick="window._setVsFilter('${c}')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-bold rounded-full border bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 hover:bg-zinc-200 dark:hover:bg-[#27272a] transition-colors uppercase outline-none" data-val="${c}">${c}$</button>`).join('')}
                   </div>`
                : `<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-3">
                     <button onclick="window._setVsFilter('all')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-black rounded-full border border-premium-gold bg-premium-gold text-black uppercase outline-none transition-colors" data-val="all">TẤT CẢ</button>
                     <button onclick="window._setVsFilter('normal')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-bold rounded-full border bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 transition-colors uppercase outline-none" data-val="normal">CƠ BẢN</button>
                     <button onclick="window._setVsFilter('artifact')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-bold rounded-full border bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 transition-colors uppercase outline-none" data-val="artifact">TẠO TÁC</button>
                     <button onclick="window._setVsFilter('radiant')" class="vs-filter-btn shrink-0 px-4 py-2 text-[10px] font-bold rounded-full border bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 transition-colors uppercase outline-none" data-val="radiant">ÁNH SÁNG</button>
                   </div>`;

            const html = `
                <div class="flex flex-col text-left">
                    <div class="flex items-center justify-between mb-4">
                        <span id="vs-count-text" class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ĐÃ CHỌN: <span class="text-premium-gold ml-1 font-black">0 / ${max}</span></span>
                    </div>
                    <div class="relative w-full mb-2">
                        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"></i>
                        <input type="text" placeholder="TÌM KIẾM..." oninput="window._vsSearchQuery = this.value; window._renderVisualSelectorGrid()" class="w-full bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-full py-3 pl-10 pr-4 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold uppercase tracking-wider transition-colors">
                    </div>
                    ${filtersHTML}
                    <div id="vs-grid-container" class="grid grid-cols-5 sm:grid-cols-6 gap-x-3 gap-y-4 max-h-[350px] overflow-y-auto no-scrollbar pt-2 pb-4 pr-1"></div>
                </div>
            `;

            uiConfirm(isChamp ? 'CHỌN TƯỚNG' : 'CHỌN TRANG BỊ', html, () => {
                window._manualData[targetKey] = Array.from(selectedSet);
                window.renderManualSelections();
            });

            setTimeout(() => { window._renderVisualSelectorGrid(); }, 50);
        };

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
                            <div class="flex flex-col items-center w-[44px] shrink-0 relative group cursor-pointer transition-transform hover:scale-105" onclick="window._manualData['${type}'] = window._manualData['${type}'].filter(x => x !== '${escapeJS(name)}'); window.renderManualSelections();" title="Bỏ chọn ${name}">
                                <div class="w-full aspect-square rounded-xl border-[1.5px] border-zinc-300 dark:border-premium-border bg-black overflow-hidden relative transition-colors group-hover:border-red-500">
                                    <img src="${img}" class="w-full h-full object-cover object-[80%] transition-opacity group-hover:opacity-30">
                                    <i class="fa-solid fa-xmark absolute inset-0 m-auto text-red-500 text-base opacity-0 group-hover:opacity-100 flex justify-center items-center font-black"></i>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    container.innerHTML = '<span class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">TỰ ĐỘNG</span>';
                }
            });
        };

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
                <button class="builder-filter-trait-btn shrink-0 px-4 py-2 rounded-full border text-[10px] font-bold transition-colors outline-none flex items-center gap-1.5 uppercase ${window._builderActiveTraits.has(trait) ? 'bg-premium-gold text-black border-premium-gold' : 'bg-zinc-100 dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-200 dark:hover:bg-[#27272a]'}" data-trait="${trait}">
                    <div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${getTraitIconName(trait)}.svg'); mask-image: url('./asset/traits/${getTraitIconName(trait)}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>
                    ${trait}
                </button>
            `).join('');

            gridContainer.className = "flex flex-col gap-6 w-full pb-24";
            
            gridContainer.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between px-2 mb-2 mt-2 gap-4 sm:gap-2">
                    <h3 class="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <i class="fa-solid fa-chess-board text-premium-gold text-lg"></i> BÀN CỜ
                    </h3>
                    
                    <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div class="flex items-center bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-full h-10 px-4 gap-2 flex-1 min-w-0 sm:max-w-[220px]">
                            <i class="fa-solid fa-barcode text-xs text-zinc-500 shrink-0"></i>
                            <input type="text" id="live-tft-code" readonly value="" placeholder="0 tướng..." 
                                class="flex-1 bg-transparent text-[11px] font-mono font-bold text-zinc-700 dark:text-premium-gold outline-none truncate w-full min-w-0">
                            <button onclick="window.copyLiveCode()" id="btn-copy-live" class="text-zinc-500 hover:text-premium-gold transition-colors text-sm outline-none shrink-0" title="Copy mã">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <button onclick="document.getElementById('manual-config-wrapper').classList.toggle('hidden')" class="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold hover:text-premium-gold transition-colors outline-none" title="Cấu hình nâng cao">
                                <i class="fa-solid fa-sliders text-sm"></i>
                            </button>
                            <button onclick="window.openLoadMenu()" class="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold hover:text-premium-gold transition-colors outline-none" title="Mở kho Đội hình">
                                <i class="fa-solid fa-folder-open text-sm"></i>
                            </button>
                            <button onclick="window.saveLocalBoard()" class="w-10 h-10 rounded-full flex items-center justify-center bg-premium-gold border border-premium-gold text-black hover:bg-yellow-400 transition-colors outline-none" title="Lưu">
                                <i class="fa-solid fa-floppy-disk text-sm"></i>
                            </button>
                            <button onclick="window.clearBuilderBoard()" class="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-colors outline-none" title="Xóa">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="builder-trait-tracker" class="flex flex-wrap items-center gap-2 px-2 min-h-[32px]"></div>
                
                <div class="relative w-full max-w-[500px] mx-auto aspect-[2/1] overflow-visible" id="builder-board-container"></div>
                
                <div id="builder-status-bar" class="min-h-[28px] mt-2"></div>

                <div id="manual-config-wrapper" class="hidden mt-4 bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                    <h4 class="text-xs font-black text-premium-gold uppercase tracking-widest border-b border-zinc-200 dark:border-premium-border pb-3">THÔNG SỐ ĐỘI HÌNH</h4>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <label class="flex-1 flex flex-col gap-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tên Đội Hình</span>
                            <input type="text" id="builder-manual-title" placeholder="Tự động..." class="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold transition-colors">
                        </label>
                        <label class="flex-1 flex flex-col gap-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nhãn (Fast 8...)</span>
                            <input type="text" id="builder-manual-tags" placeholder="Cách nhau dấu phẩy..." class="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold transition-colors">
                        </label>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between items-center px-1">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ĐI CHỢ (MAX 10)</span>
                                <button onclick="window.openVisualSelector('carousel')" class="text-[10px] text-premium-gold uppercase font-black hover:underline tracking-wider">CHỌN <i class="fa-solid fa-arrow-right text-[9px] ml-0.5"></i></button>
                            </div>
                            <div id="manual-carousel-container" class="flex flex-wrap gap-2.5 min-h-[48px] p-3 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-2xl items-center">
                                <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">TỰ ĐỘNG</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between items-center px-1">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ĐẦU GAME (MAX 5)</span>
                                <button onclick="window.openVisualSelector('champ')" class="text-[10px] text-premium-gold uppercase font-black hover:underline tracking-wider">CHỌN <i class="fa-solid fa-arrow-right text-[9px] ml-0.5"></i></button>
                            </div>
                            <div id="manual-early-container" class="flex flex-wrap gap-2.5 min-h-[48px] p-3 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-2xl items-center">
                                <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">TỰ ĐỘNG</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4 border-t border-zinc-200 dark:border-premium-border pt-5">
                        <div class="flex flex-wrap justify-between items-center gap-3 mb-2 px-1">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LÊN CẤP</span>
                            <div class="flex gap-2">
                                <button onclick="window.setPresetLeveling('fast8')" class="text-[9px] font-black uppercase text-zinc-500 hover:text-premium-gold px-3 py-1.5 bg-zinc-100 dark:bg-premium-surface rounded-full border border-zinc-200 dark:border-premium-border">Fast 8</button>
                                <button onclick="window.setPresetLeveling('reroll1')" class="text-[9px] font-black uppercase text-zinc-500 hover:text-premium-gold px-3 py-1.5 bg-zinc-100 dark:bg-premium-surface rounded-full border border-zinc-200 dark:border-premium-border">RR 1$</button>
                                <button onclick="window.setPresetLeveling('reroll2')" class="text-[9px] font-black uppercase text-zinc-500 hover:text-premium-gold px-3 py-1.5 bg-zinc-100 dark:bg-premium-surface rounded-full border border-zinc-200 dark:border-premium-border">RR 2$</button>
                                <button onclick="window.setPresetLeveling('reroll3')" class="text-[9px] font-black uppercase text-zinc-500 hover:text-premium-gold px-3 py-1.5 bg-zinc-100 dark:bg-premium-surface rounded-full border border-zinc-200 dark:border-premium-border">RR 3$</button>
                                <button onclick="window.setPresetLeveling('clear')" class="text-[10px] text-red-500 ml-1 hover:bg-red-500/10 px-2 py-1.5 rounded-full transition-colors"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            ${[4, 5, 6, 7, 8, 9].map(lvl => `
                                <div class="flex flex-col border border-zinc-200 dark:border-premium-border rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#0a0a0a]">
                                    <span class="bg-zinc-100 dark:bg-premium-surface text-[9px] text-center font-black text-zinc-500 py-1.5 uppercase border-b border-zinc-200 dark:border-premium-border tracking-widest">LV ${lvl}</span>
                                    <input type="text" id="lvl-${lvl}" placeholder="-" class="w-full text-center bg-transparent text-xs text-premium-gold font-black py-2.5 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors focus:bg-white dark:focus:bg-[#121212]">
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="flex flex-wrap sm:flex-nowrap justify-end gap-3 mt-4 pt-5 border-t border-zinc-200 dark:border-premium-border">
                            <button onclick="window.openImportModal()" class="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-premium-surface text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border text-[11px] font-black uppercase tracking-widest hover:border-premium-gold transition-colors"><i class="fa-solid fa-file-import mr-1.5 text-zinc-500"></i> NHẬP MÃ</button>
                            <button onclick="window.downloadBoardJSON()" class="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-premium-surface text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border text-[11px] font-black uppercase tracking-widest hover:border-premium-gold transition-colors"><i class="fa-solid fa-download mr-1.5 text-zinc-500"></i> TẢI JSON</button>
                            <button onclick="window.shareToFirebase()" class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-premium-gold text-black text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"><i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> ĐĂNG CLOUD</button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border mt-6 rounded-3xl overflow-hidden">
                    <div class="flex flex-col sm:flex-row gap-4 p-4 border-b border-zinc-200 dark:border-premium-border bg-zinc-50 dark:bg-[#0a0a0a]">
                        <div class="flex items-center gap-2 shrink-0 px-1">
                            <button onclick="window.setBuilderTab('champ')" class="px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors outline-none ${window._builderActiveTab === 'champ' ? 'bg-premium-gold text-black' : 'bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-premium-surface'}">TƯỚNG</button>
                            <button onclick="window.setBuilderTab('item')" class="px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors outline-none ${window._builderActiveTab === 'item' ? 'bg-premium-gold text-black' : 'bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-premium-surface'}">TRANG BỊ</button>
                        </div>
                        <div class="relative w-full flex-1">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"></i>
                            <input type="text" id="builder-search-input" value="${window._builderSearchQuery}" placeholder="TÌM KIẾM..." oninput="window.updateBuilderSearch(this.value)" class="w-full bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-premium-border rounded-full py-2.5 pl-10 pr-4 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold uppercase tracking-wider transition-colors">
                        </div>
                    </div>
                    <div id="builder-trait-filters" class="flex items-center gap-2 overflow-x-auto no-scrollbar p-3 border-b border-zinc-100 dark:border-premium-border bg-zinc-50 dark:bg-premium-card ${window._builderActiveTab === 'champ' ? '' : 'hidden'}">
                        ${traitButtonsHTML}
                    </div>
                    <div class="p-4 bg-transparent">
                        <div class="flex flex-col gap-6 max-h-[380px] overflow-y-auto no-scrollbar relative pr-1" id="builder-pool-container"></div>
                    </div>
                </div>
            `;

            window.renderManualSelections();
            renderBoard();
            renderPool();
            attachFilterEvents();
        };

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
            if (!code) return uiAlert('LỖI', 'Bàn cờ đang trống!', 'error');
            navigator.clipboard.writeText(code);
            uiAlert('THÀNH CÔNG', 'Đã chép mã TFT', 'info');
        };

        const renderBoard = () => {
            const boardContainer = document.getElementById('builder-board-container');
            const statusBar = document.getElementById('builder-status-bar');
            const tracker = document.getElementById('builder-trait-tracker');
            const liveInput = document.getElementById('live-tft-code');
            
            if (!boardContainer) return;
            boardContainer.innerHTML = '';

            const activeTraits = calculateActiveTraits();
            tracker.innerHTML = activeTraits.length > 0 ? activeTraits.map(t => {
                const iconName = getTraitIconName(t.name);
                return `<div class="flex items-center gap-1.5 px-3 py-1.5 border rounded-full ${t.style} uppercase font-black tracking-widest text-[9px] transition-transform hover:scale-105 cursor-default"><div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${iconName}.svg'); mask-image: url('./asset/traits/${iconName}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div><span>${t.name}</span><div class="px-1.5 py-0.5 bg-black/20 text-current rounded-full ml-0.5 border border-white/10"><span class="text-[9px]">${t.count}</span></div></div>`;
            }).join('') : '<span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">CHƯA KÍCH HỆ</span>';

            if (window._builderActiveTool) {
                const toolName = window._builderActiveTool.id;
                const isMove = window._builderActiveTool.type === 'move';
                const isItem = window._builderActiveTool.type === 'item';
                let actionText = isMove ? `ĐANG DI CHUYỂN: ${toolName}` : isItem ? `ĐANG GHÉP ĐỒ: ${toolName}` : `ĐANG CHỌN: ${toolName}`;
                statusBar.innerHTML = `<div class="mx-auto mt-1 px-5 py-2 rounded-full bg-premium-gold text-black text-[10px] font-black uppercase tracking-widest text-center w-max max-w-full animate-pulse">${actionText}</div>`;
            } else {
                statusBar.innerHTML = '<p class="text-center text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border w-max mx-auto">CHỌN TƯỚNG/ĐỒ ĐỂ XẾP</p>';
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
                    
                    const moveHighlight = isSelected ? 'z-30 opacity-100 scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'opacity-100 hover:scale-105';

                    if (cellState) {
                        const cData = window._builderMasterChamps[cellState.champ];
                        let bgBorder = 'bg-zinc-400 dark:bg-zinc-600';
                        if (cData?.cost === 2) bgBorder = 'bg-emerald-500';
                        if (cData?.cost === 3) bgBorder = 'bg-blue-500';
                        if (cData?.cost === 4) bgBorder = 'bg-purple-500';
                        if (cData?.cost === 5) bgBorder = 'bg-premium-gold';

                        const itemsHTML = `<div class="absolute -bottom-2 left-0 w-full flex justify-center gap-[1px] z-20 pointer-events-none">${cellState.items.map(itemName => `<img src="${window._builderMasterItems[itemName]?.image}" class="w-[18px] h-[18px] border-[1.5px] border-black rounded-full bg-black object-cover" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">`).join('')}</div>`;

                        boardHTML += `
                            <div class="absolute z-20 transition-transform cursor-pointer ${moveHighlight}" style="width: 13.333%; height: 30.769%; left: ${left}%; top: ${top}%;" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'move', '${escapeJS(cellState.champ)}', ${r}, ${c})" onclick="window.handleHexClick(${r}, ${c})" ondragover="event.preventDefault(); this.classList.add('opacity-70');" ondragleave="this.classList.remove('opacity-70');" ondrop="window.handleBuilderDrop(event, ${r}, ${c}); this.classList.remove('opacity-70');">
                                <div class="absolute inset-0 ${bgBorder}" style="${hexClip}"></div>
                                <img src="${cData?.image}" class="absolute w-[94%] h-[94%] left-[3%] top-[3%] object-cover object-[80%] bg-black pointer-events-none" style="${hexClip}" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" style="${hexClip}"></div>
                                ${itemsHTML}
                                <div class="absolute -top-1.5 -right-1 z-40 cursor-pointer transition-transform hover:scale-125" onclick="event.stopPropagation(); window.removeBuilderEntity(${r}, ${c})"><div class="w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded-full border-2 border-[#1c1c1e]"><i class="fa-solid fa-xmark text-[10px] font-black"></i></div></div>
                            </div>`;
                    } else {
                        boardHTML += `<div class="absolute z-10 cursor-pointer group" style="width: 13.333%; height: 30.769%; left: ${left}%; top: ${top}%;" onclick="window.handleHexClick(${r}, ${c})" ondragover="event.preventDefault(); this.classList.add('opacity-100');" ondragleave="this.classList.remove('opacity-100');" ondrop="window.handleBuilderDrop(event, ${r}, ${c}); this.classList.remove('opacity-100');">
                            <div class="absolute inset-0 bg-zinc-200 dark:bg-premium-surface opacity-50 group-hover:opacity-100 group-hover:bg-premium-gold/80 transition-colors" style="${hexClip}"></div>
                            <div class="absolute w-[96%] h-[96%] left-[2%] top-[2%] bg-zinc-50 dark:bg-[#0a0a0a]" style="${hexClip}"></div>
                        </div>`;
                    }
                }
            }
            boardContainer.innerHTML = boardHTML;
            if (liveInput) liveInput.value = window.generateRiotCode();
        };

        const renderPool = () => {
            const pool = document.getElementById('builder-pool-container');
            if (!pool) return;
            const query = window._builderSearchQuery.toLowerCase();
            const gridClass = "grid grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3";
            let poolHTML = '';

            if (window._builderActiveTab === 'champ') {
                const filtered = champsData.filter(c => c.name.toLowerCase().includes(query) && (window._builderActiveTraits.size === 0 || [...window._builderActiveTraits].every(st => c.traits.some(t => t.name === st))));
                [1, 2, 3, 4, 5].forEach(tier => {
                    const champsInTier = filtered.filter(c => c.cost === tier);
                    if (champsInTier.length === 0) return;
                    
                    let tierColor = 'text-zinc-500 dark:text-zinc-400'; 
                    let borderActive = 'border-premium-gold';
                    if (tier === 2) tierColor = 'text-emerald-500'; 
                    if (tier === 3) tierColor = 'text-blue-500'; 
                    if (tier === 4) tierColor = 'text-purple-500'; 
                    if (tier === 5) tierColor = 'text-premium-gold';
                    
                    poolHTML += `
                    <div class="flex flex-col gap-3">
                        <div class="flex items-center gap-2 sticky top-0 bg-white dark:bg-premium-card z-20 py-2 border-b border-zinc-200 dark:border-premium-border px-1">
                            <h4 class="text-[11px] font-black ${tierColor} uppercase tracking-widest">${tier} VÀNG</h4>
                        </div>
                        <div class="${gridClass}">
                            ${champsInTier.map(champ => `
                                <div class="relative w-full aspect-square bg-black rounded-2xl border-[1.5px] transition-transform cursor-pointer overflow-hidden ${window._builderActiveTool?.id === champ.name ? borderActive + ' scale-105' : 'border-zinc-300 dark:border-premium-border hover:border-premium-gold/50 hover:scale-105'}" onclick="window.selectBuilderTool('champ', '${escapeJS(champ.name)}')" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'champ', '${escapeJS(champ.name)}')">
                                    <img src="${champ.image}" class="w-full h-full object-cover object-[80%] pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-3 pb-1.5 text-center pointer-events-none">
                                        <span class="block text-[8px] font-black text-white uppercase tracking-widest">${window.escapeHTML(champ.name)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                });
            } else {
                const categories = [{ key: 'normal', name: 'CƠ BẢN' }, { key: 'emblem', name: 'ẤN TỘC HỆ' }, { key: 'radiant', name: 'ÁNH SÁNG' }, { key: 'artifact', name: 'TẠO TÁC' }, { key: 'support', name: 'HỖ TRỢ' }];
                categories.forEach(cat => {
                    const itemsInCat = itemsList.filter(i => i.name.toLowerCase().includes(query) && (i.category?.toLowerCase() || 'normal') === cat.key);
                    if (itemsInCat.length === 0) return;
                    
                    poolHTML += `
                    <div class="flex flex-col gap-3">
                        <div class="flex items-center gap-2 sticky top-0 bg-white dark:bg-premium-card z-20 py-2 border-b border-zinc-200 dark:border-premium-border px-1">
                            <h4 class="text-[11px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">${cat.name}</h4>
                        </div>
                        <div class="${gridClass}">
                            ${itemsInCat.map(item => `
                                <div class="relative w-full aspect-square bg-black rounded-xl border-[1.5px] transition-transform cursor-pointer overflow-hidden ${window._builderActiveTool?.id === item.name ? 'border-premium-gold scale-105' : 'border-zinc-300 dark:border-premium-border hover:border-premium-gold/50 hover:scale-105'}" onclick="window.selectBuilderTool('item', '${escapeJS(item.name)}')" draggable="true" ondragstart="window.handleBuilderDragStart(event, 'item', '${escapeJS(item.name)}')">
                                    <img src="${item.image}" class="w-full h-full object-cover pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                });
            }
            pool.innerHTML = poolHTML || '<p class="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest py-10">KHÔNG TÌM THẤY</p>';
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
                        else uiAlert('ĐẦY ĐỒ', 'Tướng chỉ mang tối đa 3 trang bị.', 'info');
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
            const parsed = data ? JSON.parse(data) : { auto: null, manual: [], shared: [] };
            if (!parsed.shared) parsed.shared = [];
            return parsed;
        };

        window.copyShareCode = (text, btnId) => {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = 'ĐÃ CHÉP';
                    btn.classList.add('bg-premium-gold', 'text-black', 'border-premium-gold');
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.classList.remove('bg-premium-gold', 'text-black', 'border-premium-gold');
                    }, 1500);
                }
            }).catch(() => uiAlert('LỖI', 'Không thể copy!', 'error'));
        };

        window.autoSaveBoard = () => {
            const data = window.getAllSavedData();
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}`;
            data.auto = {
                name: `Tự động (${timeString})`,
                board: window._builderBoardState
            };
            localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));
        };

        window.saveLocalBoard = () => {
            const data = window.getAllSavedData();
            if (data.manual.length >= 5) {
                uiAlert('BỘ NHỚ ĐẦY', 'Tối đa 5 bản lưu. Hãy xóa bớt!', 'error');
                return;
            }

            const inputHTML = `
                <div class="mt-4 mb-2">
                    <input type="text" id="custom-save-name" placeholder="TÊN ĐỘI HÌNH..." 
                        class="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold transition-colors">
                </div>
            `;

            uiConfirm('LƯU ĐỘI HÌNH', inputHTML, () => {
                const nameInput = document.getElementById('custom-save-name');
                const saveName = nameInput ? nameInput.value.trim() : '';

                if (!saveName) {
                    setTimeout(() => uiAlert('LỖI', 'Tên không được để trống!', 'error'), 100);
                    return;
                }

                data.manual.push({
                    id: Date.now(),
                    name: saveName,
                    board: JSON.parse(JSON.stringify(window._builderBoardState))
                });
                localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));
                setTimeout(() => uiAlert('THÀNH CÔNG', `Đã lưu: <span class="text-premium-gold font-black">${saveName}</span>`, 'info'), 100);
            });
        };

        window.loadSpecificBoard = (type, id) => {
            const data = window.getAllSavedData();
            if (type === 'auto' && data.auto) window._builderBoardState = data.auto.board;
            else if (type === 'manual') {
                const found = data.manual.find(x => x.id === id);
                if (found) window._builderBoardState = found.board;
            }
            renderBoard(); renderPool(); closeModal();
        };

        window.deleteSpecificBoard = (id) => {
            const data = window.getAllSavedData();
            data.manual = data.manual.filter(x => x.id !== id);
            localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));
            window.openLoadMenu();
        };

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

            const manualTitle = document.getElementById('builder-manual-title')?.value.trim();
            const finalTitle = manualTitle || "ĐỘI HÌNH TỰ TẠO";

            const manualTagsStr = document.getElementById('builder-manual-tags')?.value.trim();
            const compTags = manualTagsStr ? manualTagsStr.split(',').map(s => s.trim()).filter(Boolean) : (hasHighCost ? ["FAST 9"] : ["FAST 8"]);

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

            let carouselPrio = [];
            if (window._manualData.carousel.length > 0) {
                carouselPrio = window._manualData.carousel.map(i => ({ item: i, count: "x1" }));
            } else {
                carouselPrio = Object.entries(componentCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ item: name, count: `x${count}` }));
            }

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

            let codeChunks = Array(10).fill('000'); 
            const uniqueTeamChamps = [...new Set(boardPos.map(pos => pos.champion))];
            const maxChampsToEncode = Math.min(uniqueTeamChamps.length, 10);

            for (let i = 0; i < maxChampsToEncode; i++) {
                const champName = uniqueTeamChamps[i];
                const normalizedChampName = champName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                if (window._tftHexMapping && window._tftHexMapping[normalizedChampName]) {
                    codeChunks[i] = window._tftHexMapping[normalizedChampName];
                }
            }

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

        window.clearBuilderBoard = () => uiConfirm('LÀM SẠCH', 'Bạn có chắc muốn xóa toàn bộ bàn cờ?', () => {
            window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
            window._builderActiveTool = null;
            window.autoSaveBoard();
            renderBoard(); renderPool();
        });

        window.downloadBoardJSON = () => { 
            const out = generateJSONPayload(); 
            if (!out) { uiAlert('LỖI', 'Bàn cờ đang trống!', 'error'); return; }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify([out], null, 4)); 
            const link = document.createElement('a'); 
            link.setAttribute("href", dataStr); 
            link.setAttribute("download", "tft_comp_premium.json"); 
            link.click(); 
        };

        window.shareToFirebase = () => {
            if (!generateJSONPayload()) { uiAlert('LỖI', 'Bàn cờ đang trống!', 'error'); return; }
            uiAlert('CHIA SẺ CLOUD', `
                <div class="flex flex-col gap-4 mt-3">
                    <input type="text" id="share-author-name" placeholder="TÊN TÁC GIẢ..." class="w-full bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-white focus:outline-none focus:border-premium-gold transition-colors">
                    <div class="flex justify-center p-2 min-h-[78px] bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl border border-zinc-200 dark:border-premium-border"><div id="recaptcha-container"></div></div>
                    <button id="btn-upload-fs" onclick="window.processFS()" class="w-full py-3 bg-premium-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors outline-none mt-1">TẢI LÊN CLOUD</button>
                </div>
            `);
            setTimeout(() => { if (window.grecaptcha) grecaptcha.render('recaptcha-container', { 'sitekey': RECAPTCHA_SITE_KEY, 'theme': 'dark' }); }, 100);
        };

       window.processFS = async () => {
            if (!grecaptcha.getResponse()) return uiAlert('LỖI', 'Vui lòng xác nhận Captcha!', 'error');
            const btn = document.getElementById('btn-upload-fs');
            const authorInput = document.getElementById('share-author-name');
            const authorName = (authorInput && authorInput.value.trim() !== '') ? authorInput.value.trim() : 'ẨN DANH';

            btn.disabled = true;
            btn.innerHTML = 'ĐANG TẢI...';
            
            const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase().padStart(7, '0');
            const shareCode = 'TFTH-' + randomStr;
            
            try {
                const payload = generateJSONPayload();
                const riotCode = payload.CopyTeamCode || ""; 

                await window._fsSetDoc(window._fsDoc(window._db, "shared_comps", shareCode), { 
                    ...payload, 
                    shareCode: shareCode, 
                    author: authorName, 
                    createdAt: new Date().toISOString() 
                });
                
                const data = window.getAllSavedData();
                data.shared.push({
                    id: shareCode,
                    name: payload.CompTitle || "ĐỘI HÌNH TỰ TẠO",
                    author: authorName,
                    time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                });
                if (data.shared.length > 15) data.shared.shift();
                localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(data));

                closeModal();
                
                uiAlert('TẢI LÊN THÀNH CÔNG', `
                    <div class="flex flex-col gap-4 mt-3">
                        <div class="flex flex-col gap-1.5">
                            <p class="text-[10px] text-zinc-500 uppercase font-black tracking-widest pl-1">MÃ CỘNG ĐỒNG</p>
                            <div class="flex bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-xl overflow-hidden p-1">
                                <input type="text" readonly value="${shareCode}" class="w-full bg-transparent p-2 text-xs font-mono font-bold text-premium-gold outline-none text-center">
                                <button id="btn-cp-web" onclick="window.copyShareCode('${shareCode}', 'btn-cp-web')" class="px-5 rounded-lg bg-premium-gold text-black font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors outline-none">COPY</button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <p class="text-[10px] text-zinc-500 uppercase font-black tracking-widest pl-1">MÃ CLIENT GAME</p>
                            <div class="flex bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-xl overflow-hidden p-1">
                                <input type="text" readonly value="${riotCode}" class="w-full bg-transparent p-2 text-xs font-mono font-bold text-premium-gold outline-none text-center">
                                <button id="btn-cp-riot" onclick="window.copyShareCode('${riotCode}', 'btn-cp-riot')" class="px-5 rounded-lg bg-premium-gold text-black font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors outline-none">COPY</button>
                            </div>
                        </div>
                    </div>
                `, 'info');
            } catch (e) {
                uiAlert('LỖI', 'Không thể kết nối đến Máy Chủ Cloud.', 'error');
                btn.disabled = false;
                btn.innerText = 'THỬ LẠI';
            }
        };

        window.openImportModal = () => {
            uiAlert('NHẬP ĐỘI HÌNH', `
                <div class="flex flex-col gap-5 mt-4">
                    <div class="flex flex-col gap-2">
                        <span class="text-[10px] font-black text-premium-gold uppercase tracking-widest pl-1">MÃ CỘNG ĐỒNG (TFTH-...)</span>
                        <div class="flex p-1 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl">
                            <input type="text" id="imp-cloud-code" class="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-zinc-800 dark:text-white outline-none">
                            <button id="btn-imp-cloud" onclick="window.doImpCloud()" class="px-5 rounded-lg bg-premium-gold text-black font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors outline-none">TẢI</button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-[10px] font-black text-premium-gold uppercase tracking-widest pl-1">MÃ GAME (02...)</span>
                        <div class="flex p-1 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl">
                            <input type="text" id="imp-tft-code" class="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-zinc-800 dark:text-white outline-none">
                            <button onclick="window.doImpCode()" class="px-5 rounded-lg bg-premium-gold text-black font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors outline-none">NHẬP</button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-[10px] font-black text-premium-gold uppercase tracking-widest pl-1 border-t border-zinc-200 dark:border-premium-border pt-4">TỪ FILE JSON</span>
                        <input type="file" id="fs-file" accept=".json" class="hidden" onchange="const r=new FileReader(); r.onload=e=>document.getElementById('imp-area').value=e.target.result; r.readAsText(this.files[0])">
                        <button onclick="document.getElementById('fs-file').click()" class="w-full py-2.5 bg-white dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-premium-gold transition-colors outline-none"><i class="fa-solid fa-folder-open mr-1.5"></i> CHỌN FILE</button>
                        <textarea id="imp-area" class="w-full h-20 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border rounded-xl p-3 text-[10px] font-mono outline-none focus:border-premium-gold mt-1 text-zinc-600 dark:text-zinc-400"></textarea>
                        <button onclick="window.doImpJSON()" class="w-full py-3 bg-premium-gold text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors mt-1 outline-none">XỬ LÝ JSON</button>
                    </div>
                </div>
            `);
        };

        window.doImpCode = () => {
            const val = document.getElementById('imp-tft-code').value.trim();
            if (!val || !val.startsWith('02') || !val.includes('TFTSet')) return uiAlert('LỖI', 'Mã Game không hợp lệ!', 'error');

            try {
                const core = val.substring(2, val.indexOf('TFTSet'));
                const champsFound = [];
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

                for (let i = 0; i < core.length; i += 3) {
                    const hex = core.substring(i, i + 3);
                    if (hex !== '000' && reverseMap[hex]) champsFound.push(reverseMap[hex]);
                }

                window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
                let placed = 0;
                for (let r = 3; r >= 0; r--) {
                    for (let c = 0; c < 7; c++) {
                        if (placed < champsFound.length) {
                            window._builderBoardState[r][c] = { champ: champsFound[placed], items: [] };
                            placed++;
                        }
                    }
                }
                window.autoSaveBoard(); closeModal(); renderBoard(); renderPool();
                uiAlert('THÀNH CÔNG', `Đã xếp <span class="text-premium-gold font-black">${champsFound.length}</span> tướng lên bàn cờ!`, 'info');
            } catch (e) { uiAlert('LỖI', 'Phân tích mã Game thất bại.', 'error'); }
        };

        window.doImpJSON = () => {
            const val = document.getElementById('imp-area').value.trim();
            if (!val) return uiAlert('LỖI', 'Chưa có nội dung JSON!', 'error');
            try {
                const data = JSON.parse(val);
                const parsed = Array.isArray(data) ? data[0] : data;
                window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
                const itemMap = {};
                
                if (parsed.UnitsContainer) parsed.UnitsContainer.forEach((u, i) => { 
                    itemMap[u.champion + '_' + i] = u.items || []; 
                    itemMap[u.champion] = u.items || []; 
                });
                
                let count = {};
                parsed.BoardPositions.forEach(p => {
                    const r = p.coordinates.row, c = p.coordinates.col;
                    if (r < 4 && c < 7) {
                        count[p.champion] = (count[p.champion] || 0);
                        window._builderBoardState[r][c] = { champ: p.champion, items: [...(itemMap[p.champion + '_' + count[p.champion]] || itemMap[p.champion] || [])] };
                        count[p.champion]++;
                    }
                });

                if (parsed.CompEarlyOptions && parsed.CompEarlyOptions.length > 0) window._manualData.early = parsed.CompEarlyOptions[0].team_comp || [];
                if (parsed.CompQuickStart && parsed.CompQuickStart.carousel) window._manualData.carousel = parsed.CompQuickStart.carousel.map(x => x.item);

                window.autoSaveBoard(); closeModal(); window.renderManualSelections(); renderBoard(); renderPool();
                uiAlert('THÀNH CÔNG', 'Đã tải Đội Hình từ tệp JSON!', 'info');
            } catch (e) { uiAlert('LỖI', 'Cấu trúc JSON không hợp lệ.', 'error'); }
        };

        window.doImpCloud = async () => {
            const codeInput = document.getElementById('imp-cloud-code');
            const val = codeInput ? codeInput.value.trim().toUpperCase() : '';
            if (!val || !val.startsWith('TFTH-')) return uiAlert('LỖI', 'Mã Cloud không hợp lệ (Phải bắt đầu bằng TFTH-)!', 'error');

            const btn = document.getElementById('btn-imp-cloud');
            const oldText = btn.innerHTML;
            btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const docRef = window._fsDoc(window._db, "shared_comps", val);
                const docSnap = await window._fsGetDoc(docRef);

                if (!docSnap.exists()) {
                    btn.disabled = false; btn.innerHTML = oldText;
                    return uiAlert('LỖI', 'Không tìm thấy đội hình với mã này trên Cloud!', 'error');
                }

                const parsed = docSnap.data();
                window._builderBoardState = Array(4).fill(null).map(() => Array(7).fill(null));
                
                const itemMap = {};
                if (parsed.UnitsContainer) {
                    parsed.UnitsContainer.forEach((u, i) => { 
                        itemMap[u.champion + '_' + i] = u.items || []; 
                        itemMap[u.champion] = u.items || []; 
                    });
                }
                
                let count = {};
                if (parsed.BoardPositions) {
                    parsed.BoardPositions.forEach(p => {
                        const r = p.coordinates.row, c = p.coordinates.col;
                        if (r < 4 && c < 7) {
                            count[p.champion] = (count[p.champion] || 0);
                            window._builderBoardState[r][c] = { champ: p.champion, items: [...(itemMap[p.champion + '_' + count[p.champion]] || itemMap[p.champion] || [])] };
                            count[p.champion]++;
                        }
                    });
                }

                window._manualData.early = (parsed.CompEarlyOptions && parsed.CompEarlyOptions.length > 0) ? (parsed.CompEarlyOptions[0].team_comp || []) : [];
                window._manualData.carousel = (parsed.CompQuickStart && parsed.CompQuickStart.carousel) ? parsed.CompQuickStart.carousel.map(x => x.item) : [];

                const titleInput = document.getElementById('builder-manual-title');
                if (titleInput) titleInput.value = parsed.CompTitle || "";
                
                const tagsInput = document.getElementById('builder-manual-tags');
                if (tagsInput) tagsInput.value = (parsed.CompRowTags && Array.isArray(parsed.CompRowTags)) ? parsed.CompRowTags.join(', ') : "";

                if (parsed.CompQuickStart && parsed.CompQuickStart.leveling) {
                    [4, 5, 6, 7, 8, 9].forEach(lvl => {
                        const el = document.getElementById(`lvl-${lvl}`);
                        if (el) el.value = ""; 
                    });
                    parsed.CompQuickStart.leveling.forEach(l => {
                        const lvlNum = l.level.replace(/\D/g, ''); 
                        const el = document.getElementById(`lvl-${lvlNum}`);
                        if (el) el.value = l.stage || "";
                    });
                }

                window.autoSaveBoard(); closeModal(); window.renderManualSelections(); renderBoard(); renderPool();
                uiAlert('THÀNH CÔNG', `Tải đội hình từ tác giả:<br><span class="text-premium-gold text-[15px] font-black uppercase tracking-widest mt-3 block">${parsed.author || 'ẨN DANH'}</span>`, 'info');

            } catch (e) {
                btn.disabled = false; btn.innerHTML = oldText;
                uiAlert('LỖI', 'Mất kết nối Máy chủ.', 'error');
            }
        };

        window.openLoadMenu = () => {
            const data = window.getAllSavedData();
            let listHTML = '';

            if (data.auto) {
                listHTML += `
                    <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-2xl mb-5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-[#0a0a0a] flex items-center justify-center border border-zinc-300 dark:border-premium-border">
                                <i class="fa-solid fa-robot text-zinc-500"></i>
                            </div>
                            <span class="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider">${data.auto.name}</span>
                        </div>
                        <button onclick="window.loadSpecificBoard('auto', null)" class="px-5 py-2 bg-white dark:bg-premium-card text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border hover:border-premium-gold text-[10px] font-black uppercase rounded-full transition-colors outline-none tracking-widest">TẢI MỚI</button>
                    </div>
                `;
            }

            if (data.manual && data.manual.length > 0) {
                listHTML += `<span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block border-b border-zinc-200 dark:border-premium-border pb-1.5 pl-1">CÁ NHÂN</span>`;
                data.manual.forEach(item => {
                    listHTML += `
                        <div class="flex items-center justify-between p-4 bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-2xl mb-3 group hover:border-premium-gold/50 transition-colors">
                            <div class="flex items-center gap-3 truncate pr-3">
                                <div class="w-8 h-8 rounded-full bg-premium-gold/10 flex items-center justify-center border border-premium-gold/20 shrink-0">
                                    <i class="fa-solid fa-bookmark text-premium-gold text-[11px]"></i>
                                </div>
                                <span class="text-[11px] font-black text-zinc-800 dark:text-white uppercase truncate tracking-wide">${window.escapeHTML(item.name)}</span>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <button onclick="window.loadSpecificBoard('manual', ${item.id})" class="px-5 py-2 bg-zinc-100 dark:bg-premium-surface text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border hover:border-premium-gold text-[10px] font-black uppercase rounded-full transition-colors outline-none tracking-widest">TẢI</button>
                                <button onclick="window.deleteSpecificBoard(${item.id})" class="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-premium-surface text-red-500 border border-zinc-200 dark:border-premium-border hover:border-red-500 hover:bg-red-500/10 transition-colors outline-none"><i class="fa-solid fa-trash-can text-[11px]"></i></button>
                            </div>
                        </div>
                    `;
                });
            }

            if (data.shared && data.shared.length > 0) {
                listHTML += `<span class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-3 mt-6 block border-b border-zinc-200 dark:border-premium-border pb-1.5 pl-1">ĐÃ ĐĂNG TẢI LÊN CLOUD</span>`;
                [...data.shared].reverse().forEach(item => {
                    listHTML += `
                        <div class="flex items-center justify-between p-4 bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-2xl mb-3 hover:border-premium-gold/50 transition-colors">
                            <div class="flex flex-col gap-1.5 truncate pr-3">
                                <span class="text-[11px] font-black text-premium-gold uppercase truncate tracking-wide">${window.escapeHTML(item.name)}</span>
                                <div class="flex items-center gap-2 text-[10px] text-zinc-500 font-mono font-bold">
                                    <span class="bg-zinc-100 dark:bg-[#0a0a0a] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-premium-border">${item.id}</span>
                                </div>
                            </div>
                            <button onclick="window.copyShareCode('${item.id}', 'btn-hist-${item.id}')" id="btn-hist-${item.id}" class="px-4 py-2 bg-zinc-100 dark:bg-premium-surface text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border hover:border-premium-gold text-[10px] font-black uppercase rounded-full transition-colors shrink-0 outline-none tracking-widest">COPY MÃ</button>
                        </div>
                    `;
                });
            }

            if (!data.auto && data.manual.length === 0 && (!data.shared || data.shared.length === 0)) {
                listHTML += `<div class="flex flex-col items-center justify-center py-10 gap-3"><i class="fa-solid fa-box-open text-3xl text-zinc-400 dark:text-zinc-600"></i><p class="text-center text-xs font-black text-zinc-500 uppercase tracking-widest">KHO LƯU TRỮ TRỐNG</p></div>`;
            }

            uiAlert('KHO ĐỘI HÌNH', `<div class="flex flex-col mt-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">${listHTML}</div>`);
        };
        
        renderBuilderInterface();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-5 text-center text-red-500 text-xs font-bold uppercase tracking-widest bg-[#121212] border border-red-900/50 rounded-2xl">Lỗi Builder: ${error.message}</div>`;
    }
}