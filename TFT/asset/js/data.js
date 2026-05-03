// ==========================================
// HỆ THỐNG DATA TỔNG HỢP (COMPS, TƯỚNG, TRANG BỊ...)
// Giao Diện: Solid Premium (Tối ưu hiệu năng 60FPS)
// ==========================================
window.cleanItemName = (rawName) => rawName ? String(rawName).replace(/<[^>]+>/g, '').trim() : '';

// ---------------------------------------------------------
// KHO ĐỘI HÌNH
// ---------------------------------------------------------
async function loadCompsData() {
    const gridContainer = document.getElementById('grid-comps');
    if (!gridContainer) return;

    try {
        const compSources = [
            { id: 'source1', name: 'TFT 1', file: './asset/data/comps.json' },
            { id: 'source2', name: 'TFT 2', file: './asset/data/compsS2.json' },
            { id: 'source_fb', name: 'CỘNG ĐỒNG', file: 'firestore' }
        ];

        let activeSourceUrl = compSources[0].file;
        let compsData = [];
        let champsData = [];
        let itemsData = {};
        let buildsData = [];
        let currentMetaData = null;

        const [champsDataRaw, itemsDataRaw, buildsDataRaw] = await Promise.all([
            window.fetchCached('./asset/data/champions.json'),
            window.fetchCached('./asset/data/items.json'),
            window.fetchCached('./asset/data/champion_builds.json').catch(() => null)
        ]);

        if (!champsDataRaw || !itemsDataRaw) throw new Error('Không thể tải dữ liệu Tướng hoặc Trang Bị.');

        champsData = champsDataRaw;
        itemsData = itemsDataRaw;
        buildsData = buildsDataRaw || [];

        const masterChamps = {};
        champsData.forEach(champ => { masterChamps[champ.name.toLowerCase().trim()] = champ; });

        const masterItems = {};
        for (const itemArray of Object.values(itemsData)) {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => { masterItems[item.name.toLowerCase().trim()] = item; });
            }
        }

        window._normalizeBuildName = window._normalizeBuildName || ((name) => {
            if (!name) return '';
            return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        });

        window._masterBuildsForComps = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const combinedBuilds = [...(b.bestBuilds || []), ...(b.builds || [])];
                const validBuilds = combinedBuilds.filter(build => build.items && build.items.length > 0).slice(0, 5);
                if (validBuilds.length > 0) window._masterBuildsForComps[window._normalizeBuildName(b.unit)] = validBuilds;
            });
        }

        const cleanName = (rawName) => rawName ? rawName.replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
        const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

        const getTraitIconName = (name) => {
            if (!name) return '';
            let str = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            str = str.replace(/[^a-zA-Z0-9\s]/g, "");
            return str.split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join('');
        };

        let activeTags = new Set();
        let searchQuery = '';

        window.toggleCompDetails = (btnElement) => {
            const card = btnElement.closest('.comp-card');
            const detailsWrapper = card.querySelector('.comp-details');
            const chevronIcon = btnElement.querySelector('.expand-icon');

            if (detailsWrapper.classList.contains('hidden')) {
                detailsWrapper.classList.remove('hidden');
                chevronIcon.classList.add('rotate-180');
                card.classList.add('border-premium-gold');
            } else {
                detailsWrapper.classList.add('hidden');
                chevronIcon.classList.remove('rotate-180');
                card.classList.remove('border-premium-gold');
            }
        };

        window.updateChampBuildFilter = (champName, category, btnElement) => {
            const wrapper = btnElement.closest('.flex');
            wrapper.querySelectorAll('.champ-build-filter-btn').forEach(btn => {
                btn.className = "champ-build-filter-btn shrink-0 px-4 py-2 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-500 flex items-center gap-1.5 transition-colors outline-none hover:border-premium-gold/50";
            });
            btnElement.className = "champ-build-filter-btn shrink-0 px-4 py-2 rounded-full text-[10px] font-black border border-premium-gold bg-premium-gold text-black flex items-center gap-1.5 outline-none";
            document.getElementById('champ-modal-builds-list').innerHTML = window.renderFilteredBuilds(champName, category);
        };

        window.renderFilteredBuilds = (champName, filterCategory) => {
            const builds = window._masterBuilds[window._normalizeBuildName(champName)];
            if (!builds || builds.length === 0) return '<p class="text-[10px] text-zinc-500 text-center py-6 font-bold uppercase tracking-widest">CHƯA CÓ LỐI CHƠI</p>';

            const filteredBuilds = builds.filter(build => {
                if (filterCategory === 'all') return true;
                return build.items.some(rawItemName => {
                    const itemData = window._masterItems[window.cleanItemName(rawItemName)];
                    return itemData && itemData.category === filterCategory;
                });
            });

            if (filteredBuilds.length === 0) return '<p class="text-[10px] text-zinc-500 text-center py-6 font-bold uppercase tracking-widest">KHÔNG TÌM THẤY TRANG BỊ PHÙ HỢP</p>';

            return filteredBuilds.map((currentBuild, idx) => {
                const itemsHTML = currentBuild.items.map(rawItemName => {
                    const itemName = window.cleanItemName(rawItemName);
                    const itemData = window._masterItems[itemName];

                    if (!itemData) return `<div class="flex flex-col items-center flex-1 min-w-0 opacity-50"><div class="w-10 h-10 rounded-xl border border-zinc-200 dark:border-premium-border bg-zinc-100 dark:bg-[#0a0a0a] mb-1"></div><span class="text-[8px] text-zinc-500 font-bold uppercase truncate w-full text-center">${itemName}</span></div>`;

                    const isRadiant = itemData.category === 'radiant' || itemData.name.toLowerCase().includes('ánh sáng');
                    const imgBorder = isRadiant ? 'border-premium-gold' : 'border-zinc-300 dark:border-zinc-700';

                    return `<div class="flex flex-col items-center flex-1 min-w-0"><img src="${itemData.image}" class="w-10 h-10 rounded-xl border-[1.5px] ${imgBorder} object-cover bg-black mb-1.5" loading="lazy" ${onErrorFallback}><span class="text-[8px] md:text-[9.5px] ${isRadiant ? 'text-premium-gold' : 'text-zinc-700 dark:text-zinc-300'} font-bold uppercase truncate w-full text-center tracking-wide">${itemData.name}</span></div>`;
                }).join('');

                const tierBadge = currentBuild.tier ? `<span class="ml-2 text-premium-gold bg-premium-gold/10 border border-premium-gold/20 px-2 py-0.5 rounded-full">HẠNG ${currentBuild.tier}</span>` : '';

                return `
                    <div class="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-2xl mb-3 last:mb-0 hover:border-premium-gold/30 transition-colors">
                        <div class="flex justify-between items-center border-b border-zinc-200 dark:border-premium-border pb-2">
                            <span class="text-[10px] font-black text-zinc-800 dark:text-white uppercase tracking-widest flex items-center">CÁCH ${idx + 1} ${tierBadge}</span>
                            <div class="flex gap-2">
                                <span class="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold bg-white dark:bg-[#0a0a0a] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-premium-border uppercase">TOP: <span class="text-premium-gold ml-0.5">${currentBuild.avg_place}</span></span>
                                <span class="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold bg-white dark:bg-[#0a0a0a] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-premium-border uppercase">THẮNG: <span class="text-premium-gold ml-0.5">${currentBuild.win_rate}</span></span>
                            </div>
                        </div>
                        <div class="flex gap-3 justify-between items-start">${itemsHTML}</div>
                    </div>
                `;
            }).join('');
        };

        window.renderBuildTabInComp = (champName, styleIndex) => {
            const builds = window._masterBuildsForComps[window._normalizeBuildName(champName)];
            if (!builds || builds.length === 0) return '<p class="text-[10px] text-zinc-500 text-center py-6 uppercase font-bold tracking-widest">CHƯA CÓ DỮ LIỆU GỢI Ý</p>';

            const currentBuild = builds[styleIndex];

            const itemsHTML = currentBuild.items.map(rawItemName => {
                const itemName = window.cleanItemName ? window.cleanItemName(rawItemName).toLowerCase() : rawItemName.replace(/<[^>]+>/g, '').trim().toLowerCase();
                const itemData = masterItems[itemName];

                if (!itemData) {
                    return `<div class="flex flex-col items-center flex-1 min-w-0 opacity-50"><div class="w-10 h-10 rounded-xl border border-zinc-200 dark:border-premium-border bg-zinc-100 dark:bg-[#0a0a0a] flex items-center justify-center mb-1.5"><i class="fa-solid fa-question text-zinc-400 dark:text-zinc-600 text-xs"></i></div><span class="text-[8px] text-zinc-500 font-bold uppercase truncate w-full text-center">${itemName}</span></div>`;
                }

                let recipeHTML = '<div class="h-5 mt-1.5"></div>';
                if (itemData.recipe && itemData.recipe.length === 2) {
                    recipeHTML = `
                        <div class="flex items-center gap-1 mt-1.5 justify-center bg-zinc-100 dark:bg-[#0a0a0a] rounded-full px-1.5 py-0.5 border border-zinc-200 dark:border-premium-border">
                            <img src="${itemData.recipe[0].image}" class="w-3.5 h-3.5 object-cover rounded-full" ${onErrorFallback}>
                            <i class="fa-solid fa-plus text-[5px] text-zinc-400"></i>
                            <img src="${itemData.recipe[1].image}" class="w-3.5 h-3.5 object-cover rounded-full" ${onErrorFallback}>
                        </div>
                    `;
                }

                const isRadiant = itemData.name.toLowerCase().includes('ánh sáng');
                const imgBorder = isRadiant ? 'border-premium-gold' : 'border-zinc-300 dark:border-zinc-700';

                return `<div class="flex flex-col items-center flex-1 min-w-0"><img src="${itemData.image}" class="w-10 h-10 rounded-xl border-[1.5px] ${imgBorder} object-cover bg-black mb-1.5" ${onErrorFallback}><span class="text-[8px] md:text-[9.5px] ${isRadiant ? 'text-premium-gold' : 'text-zinc-700 dark:text-zinc-300'} font-bold uppercase truncate w-full text-center tracking-wide">${itemData.name}</span>${recipeHTML}</div>`;
            }).join('');

            const tabsHTML = builds.map((b, idx) => `
                <button onclick="document.getElementById('build-content-comp').innerHTML = window.renderBuildTabInComp('${window.escapeJS(champName)}', ${idx})" 
                        class="px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors border outline-none ${idx === styleIndex ? 'bg-premium-gold text-black border-premium-gold' : 'bg-zinc-100 dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-500 hover:border-premium-gold/50'}">
                    CÁCH ${idx + 1}
                </button>
            `).join('');

            return `
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-zinc-200 dark:border-premium-border">${tabsHTML}</div>
                    <div class="flex items-center justify-center gap-3">
                        <span class="text-[9px] text-zinc-800 dark:text-white font-bold bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border px-3 py-1.5 rounded-full uppercase">TOP TB: <span class="text-premium-gold ml-1">${currentBuild.avg_place}</span></span>
                        <span class="text-[9px] text-zinc-800 dark:text-white font-bold bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border px-3 py-1.5 rounded-full uppercase">THẮNG: <span class="text-premium-gold ml-1">${currentBuild.win_rate}</span></span>
                    </div>
                    <div class="flex gap-3 justify-between items-start bg-zinc-50 dark:bg-[#0a0a0a] p-4 rounded-2xl border border-zinc-200 dark:border-premium-border">${itemsHTML}</div>
                </div>
            `;
        };

        window.openChampModalFromComp = (champNameRaw) => {
            const champ = masterChamps[cleanName(champNameRaw)];
            if (!champ) return;

            let borderColor = 'border-zinc-400 dark:border-zinc-600';
            if (champ.cost === 2) borderColor = 'border-emerald-500';
            if (champ.cost === 3) borderColor = 'border-blue-500';
            if (champ.cost === 4) borderColor = 'border-purple-500';
            if (champ.cost === 5) borderColor = 'border-premium-gold';

            const titleHTML = `
                <div class="flex items-center justify-between w-full pr-4">
                    <span class="text-zinc-900 dark:text-white font-black uppercase text-xl tracking-wider">${window.escapeHTML(champ.name)}</span>
                    <span class="text-xs font-black text-premium-gold bg-premium-gold/10 px-3 py-1.5 rounded-full border border-premium-gold/20 flex items-center gap-1">
                        ${champ.cost} <i class="fa-solid fa-coins text-[10px]"></i>
                    </span>
                </div>
            `;

            const traitPills = champ.traits.map(t => {
                const iconFilename = getTraitIconName(t.name);
                return `
                    <span class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-zinc-200 dark:border-premium-border bg-zinc-100 dark:bg-premium-surface text-zinc-700 dark:text-zinc-300 text-[9px] font-black uppercase tracking-widest">
                        <div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>
                        ${t.name}
                    </span>
                `;
            }).join('');

            const contentHTML = `
                <div class="flex flex-col gap-4 mt-4 text-left">
                    <div class="w-full h-[140px] rounded-2xl overflow-hidden border-[1.5px] ${borderColor} relative bg-black">
                        <img src="${champ.image}" class="w-full h-full object-cover object-[80%] opacity-70" alt="${window.escapeHTML(champ.name)}" ${onErrorFallback}>
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        <div class="absolute bottom-3 left-3 flex flex-wrap gap-2">${traitPills}</div>
                    </div>
                    <div class="flex gap-3">
                        <div class="flex-1 bg-zinc-50 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5">
                            <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-black">VAI TRÒ</span>
                            <span class="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wide">${champ.role}</span>
                        </div>
                        <div class="flex-1 bg-zinc-50 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5">
                            <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-black">TẦM ĐÁNH</span>
                            <span class="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wide">${champ.range} Ô</span>
                        </div>
                    </div>
                    <div class="mt-2 bg-white dark:bg-premium-card rounded-2xl border border-zinc-200 dark:border-premium-border p-5">
                        <div class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-premium-border pb-2">
                            <i class="fa-solid fa-chart-pie"></i> THỐNG KÊ LÊN ĐỒ
                        </div>
                        <div id="build-content-comp">${window.renderBuildTabInComp(champ.name, 0)}</div>
                    </div>
                </div>
            `;
            uiAlert(titleHTML, contentHTML);
        };

        const sourceButtonsHTML = compSources.map(src => `
            <button class="filter-source-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors uppercase outline-none
                ${src.file === activeSourceUrl ? 'bg-premium-gold border-premium-gold text-black' : 'bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card'}" 
                data-url="${src.file}">
                <i class="fa-solid ${src.file === 'firestore' ? 'fa-cloud' : 'fa-database'} text-[10px] mr-1.5"></i> ${src.name}
            </button>
        `).join('');

        gridContainer.className = "flex flex-col relative pb-24 min-h-screen w-full";
        gridContainer.innerHTML = `
            <div class="flex flex-col relative min-h-screen w-full">
                <div id="comp-list-container" class="flex flex-col gap-5 w-full"></div>
                
                <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                    <div id="comp-filters-wrapper" class="w-full transition-all duration-300 opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-4 left-0">
                        <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl p-5 flex flex-col gap-5 relative shadow-xl">
                            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-premium-border pb-3">
                                <span class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <i class="fa-solid fa-filter text-premium-gold"></i> TÙY CHỈNH LỌC
                                </span>
                                <button id="close-filter-comp-btn" class="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-500 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">NGUỒN DỮ LIỆU:</span>
                                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">${sourceButtonsHTML}</div>
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">LỌC NHÃN ĐỘI HÌNH:</span>
                                <div id="dynamic-tags-container" class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1"></div>
                            </div>
                        </div>
                    </div>

                    <div class="w-full bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-full flex items-center px-5 py-2.5 pointer-events-auto hover:border-premium-gold/50 transition-colors relative shadow-lg">
                        <i class="fa-solid fa-magnifying-glass text-zinc-400 text-sm"></i>
                        <input type="text" id="search-comp" placeholder="TÌM ĐỘI HÌNH..." class="w-full bg-transparent border-none text-zinc-800 dark:text-white text-[13px] font-bold ml-3 focus:outline-none uppercase tracking-wider placeholder:text-zinc-500">
                        <button id="clear-search-comp" class="hidden text-zinc-400 hover:text-premium-gold px-2 outline-none"><i class="fa-solid fa-xmark text-lg"></i></button>
                        <div class="w-[1px] h-6 bg-zinc-200 dark:bg-premium-border mx-3"></div>
                        <button id="toggle-filter-comp-btn" class="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none relative">
                            <i class="fa-solid fa-sliders text-sm"></i>
                            <span id="comp-filter-indicator" class="absolute top-1 right-1 w-2.5 h-2.5 bg-premium-gold rounded-full border-2 border-white dark:border-premium-card hidden"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const toggleFilterBtn = document.getElementById('toggle-filter-comp-btn');
        const closeFilterBtn = document.getElementById('close-filter-comp-btn');
        const filtersWrapper = document.getElementById('comp-filters-wrapper');
        let isFilterMenuOpen = false;

        const toggleFilterMenu = () => {
            isFilterMenuOpen = !isFilterMenuOpen;
            if (isFilterMenuOpen) {
                filtersWrapper.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.add('text-premium-gold');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.remove('text-premium-gold');
            }
        };

        toggleFilterBtn.addEventListener('click', toggleFilterMenu);
        closeFilterBtn.addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });
        document.getElementById('comp-list-container').addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });

        const updateFilterIndicator = () => {
            const indicator = document.getElementById('comp-filter-indicator');
            if (activeTags.size > 0) indicator.classList.remove('hidden');
            else indicator.classList.add('hidden');
        };

        const renderDynamicTagsFilter = () => {
            const tagsContainer = document.getElementById('dynamic-tags-container');
            if (!tagsContainer) return;
            const allCompTags = [...new Set(compsData.flatMap(comp => comp.CompRowTags || []))].sort();

            if (allCompTags.length === 0) {
                tagsContainer.innerHTML = '<span class="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">TRỐNG</span>';
                return;
            }

            tagsContainer.innerHTML = allCompTags.map(tag => `
                <button class="filter-dynamic-tag-btn shrink-0 px-4 py-2 rounded-full font-bold text-[10px] transition-colors outline-none uppercase border ${activeTags.has(tag) ? 'bg-premium-gold text-black border-premium-gold' : 'bg-zinc-100 dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-200 dark:hover:bg-premium-card'}" data-tag="${tag}">
                    ${tag}
                </button>
            `).join('');

            document.querySelectorAll('.filter-dynamic-tag-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tag = e.currentTarget.dataset.tag;
                    if (activeTags.has(tag)) activeTags.delete(tag);
                    else activeTags.add(tag);
                    updateFilterIndicator();
                    renderDynamicTagsFilter();
                    renderComps();
                });
            });
        };

        window.getRelativeTimeVn = (timeStr) => {
            if (!timeStr) return 'KHÔNG RÕ';
            try {
                const parts = timeStr.split(' ');
                if (parts.length !== 2) return timeStr;
                const timeParts = parts[0].split(':');
                const dateParts = parts[1].split('/');
                const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
                const now = new Date();
                const diffInSeconds = Math.floor((now - date) / 1000);
                if (diffInSeconds < 60) return `VỪA XONG`;
                if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} PHÚT TRƯỚC`;
                if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} GIỜ TRƯỚC`;
                if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} NGÀY TRƯỚC`;
                return parts[1];
            } catch (e) { return timeStr; }
        };

        const fetchAndRenderComps = async (url) => {
            const listContainer = document.getElementById('comp-list-container');
            listContainer.innerHTML = `<div class="py-16 text-center text-zinc-500 text-xs font-bold tracking-widest uppercase">ĐANG TẢI...</div>`;

            try {
                if (url === 'firestore') {
                    if (!window._db) throw new Error("Firebase chưa sẵn sàng.");
                    const q = window._fsQuery(window._fsCol(window._db, "shared_comps"), window._fsOrderBy("createdAt", "desc"));
                    const querySnapshot = await window._fsGetDocs(q);
                    compsData = [];
                    querySnapshot.forEach((doc) => { compsData.push(doc.data()); });
                    if (compsData.length === 0) throw new Error('CHƯA CÓ ĐỘI HÌNH CỘNG ĐỒNG.');
                } else {
                    const rawData = await window.fetchCached(url, 15);
                    if (rawData && rawData.Data && Array.isArray(rawData.Data)) {
                        compsData = rawData.Data; currentMetaData = rawData.MetaData;
                    } else if (Array.isArray(rawData)) {
                        compsData = rawData; currentMetaData = null;
                    } else throw new Error('DỮ LIỆU LỖI.');
                }

                activeTags.clear(); updateFilterIndicator(); renderDynamicTagsFilter(); renderComps();
            } catch (error) {
                compsData = []; renderDynamicTagsFilter();
                listContainer.innerHTML = `<div class="py-16 text-center text-red-500 text-xs font-bold tracking-widest uppercase">${error.message}</div>`;
            }
        };

        const renderComps = () => {
            const listContainer = document.getElementById('comp-list-container');
            let updateTimeText = currentMetaData && currentMetaData.ScrapeTime ? window.getRelativeTimeVn(currentMetaData.ScrapeTime) : 'ĐANG CẬP NHẬT';

            const sourceButtonsHTML_Main = compSources.map(src => `
                <button class="filter-source-btn-main shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors uppercase outline-none ${src.file === activeSourceUrl ? 'bg-premium-gold border-premium-gold text-black' : 'bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card'}" data-url="${src.file}">
                    ${src.name}
                </button>
            `).join('');

            const headerHTML = `
                <div class="flex flex-col gap-4 px-2 mb-3 mt-2">
                    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-premium-border pb-3">
                        <p class="text-xs text-zinc-800 dark:text-white font-black uppercase tracking-widest">KHO ĐỘI HÌNH</p>
                        <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">CẬP NHẬT: <span class="text-premium-gold ml-1">${updateTimeText}</span></span>
                    </div>
                    <div class="flex items-center gap-2.5 overflow-x-auto no-scrollbar w-full pb-1">${sourceButtonsHTML_Main}</div>
                </div>
            `;

            const filteredComps = compsData.filter(comp => {
                const matchSearch = comp.CompTitle.toLowerCase().includes(searchQuery.toLowerCase()) || (comp.UnitsContainer && comp.UnitsContainer.some(u => u.champion.toLowerCase().includes(searchQuery.toLowerCase())));
                const compTags = comp.CompRowTags || [];
                const matchTag = activeTags.size === 0 || [...activeTags].every(tag => compTags.includes(tag));
                return matchSearch && matchTag;
            });

            if (filteredComps.length === 0) {
                listContainer.innerHTML = headerHTML + `<div class="py-16 text-center text-zinc-500 text-xs font-bold tracking-widest uppercase">KHÔNG TÌM THẤY ĐỘI HÌNH.</div>`;
                return;
            }

            let emptyHexesHTML = '';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    const isOddRow = r % 2 !== 0;
                    const left = c * 13.33 + (isOddRow ? 6.66 : 0);
                    const top = r * 23.07;
                    emptyHexesHTML += `<div class="absolute w-[13.33%] h-[30.76%] bg-zinc-200 dark:bg-premium-surface opacity-30" style="left: ${left}%; top: ${top}%; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>`;
                }
            }

            const compsHTML = filteredComps.map((comp, compIndex) => {
                let tagsHTML = comp.CompRowTags ? comp.CompRowTags.map(tag => `<span class="px-3 py-1 bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-700 dark:text-zinc-300 rounded-full text-[9px] font-bold uppercase tracking-widest">${window.escapeHTML(tag)}</span>`).join('') : '';

                let unitsHTML = '';
                let traitCounts = {};

                if (comp.UnitsContainer && comp.UnitsContainer.length > 0) {
                    const sortedUnits = [...comp.UnitsContainer].sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));
                    unitsHTML = sortedUnits.map(unit => {
                        const cName = cleanName(unit.champion);
                        const champData = masterChamps[cName];
                        const champImage = champData ? champData.image : '/Asset/logo/logo.png';
                        const champCost = champData ? champData.cost : 1;

                        if (champData && champData.traits) champData.traits.forEach(t => { traitCounts[t.name] = (traitCounts[t.name] || 0) + 1; });

                        let borderColor = 'border-zinc-400 dark:border-zinc-600';
                        if (champCost === 2) borderColor = 'border-emerald-500';
                        if (champCost === 3) borderColor = 'border-blue-500';
                        if (champCost === 4) borderColor = 'border-purple-500';
                        if (champCost === 5) borderColor = 'border-premium-gold';

                        const items = unit.items || [];
                        let itemsHTML = items.length > 0 ? items.map(itemName => {
                            const translatedName = window.translateItemToVi(itemName);
                            const iData = masterItems[cleanName(translatedName)] || masterItems[cleanName(itemName)];
                            const img = iData ? iData.image : '/Asset/logo/logo.png';
                            return `<img src="${img}" class="w-[18px] h-[18px] border-[1px] border-black bg-black object-cover rounded-md" ${onErrorFallback}>`;
                        }).join('') : '';

                        return `
                        <div class="flex flex-col gap-2 items-center w-[56px] shrink-0 cursor-pointer mb-0 group/unit" onclick="window.openChampModalFromComp('${window.escapeJS(unit.champion)}')">
                            <!-- Wrapper giữ relative và hiệu ứng hover -->
                            <div class="relative w-full aspect-square transition-transform group-hover/unit:scale-105">
                                <!-- Box chứa ảnh có overflow-hidden để bo góc -->
                                <div class="w-full h-full border-[1.5px] ${borderColor} bg-black rounded-xl overflow-hidden">
                                    <img src="${champImage}" class="w-full h-full object-cover object-[80%] opacity-90 hover:opacity-100 transition-opacity" title="${window.escapeHTML(unit.champion)}" ${onErrorFallback}>
                                </div>
                                <div class="absolute -bottom-2 left-0 w-full flex justify-center z-50">${itemsHTML}</div>
                            </div>
                            <span class="text-[8px] text-zinc-700 dark:text-zinc-300 font-bold uppercase truncate w-full text-center mt-1 tracking-wider">${window.escapeHTML(unit.champion)}</span>
                        </div>
                    `;
                    }).join('');
                }

                const sortedTraits = Object.entries(traitCounts).sort((a, b) => b[1] - a[1]);
                let traitsHTML = sortedTraits.map(([tName, tCount]) => {
                    const iconFilename = getTraitIconName(tName);
                    return `
                        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-700 dark:text-zinc-300 rounded-xl">
                            <div class="w-3.5 h-3.5 bg-current shrink-0" style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>
                            <span class="text-[9px] font-black uppercase tracking-widest">${tName} <span class="text-premium-gold ml-0.5">${tCount}</span></span>
                        </div>
                    `;
                }).join('') || '<span class="text-[10px] text-zinc-500 font-bold uppercase">TRỐNG</span>';

                let carouselHTML = '<span class="text-[10px] text-zinc-500 font-bold uppercase">TRỐNG</span>';
                if (comp.CompQuickStart?.carousel?.length > 0) {
                    carouselHTML = `<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">` +
                        comp.CompQuickStart.carousel.slice(0, 5).map((cItem) => {
                            const translatedName = window.translateItemToVi(cItem.item);
                            const iData = masterItems[cleanName(translatedName)] || masterItems[cleanName(cItem.item)];
                            const img = iData ? iData.image : '/Asset/logo/logo.png';
                            return `<img src="${img}" class="w-8 h-8 border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-black object-cover rounded-xl" ${onErrorFallback}>`;
                        }).join('') + `</div>`;
                }

                let earlyCompHTML = '<span class="text-[10px] text-zinc-500 font-bold uppercase">TRỐNG</span>';
                if (comp.CompEarlyOptions?.length > 0) {
                    earlyCompHTML = comp.CompEarlyOptions.slice(0, 2).map(opt => {
                        const teamHTML = opt.team_comp.map(c => {
                            const cData = masterChamps[cleanName(c)];
                            const img = cData ? cData.image : '/Asset/logo/logo.png';
                            let borderColor = 'border-zinc-400 dark:border-zinc-600';
                            if (cData) {
                                if (cData.cost === 2) borderColor = 'border-emerald-500';
                                if (cData.cost === 3) borderColor = 'border-blue-500';
                                if (cData.cost === 4) borderColor = 'border-purple-500';
                                if (cData.cost === 5) borderColor = 'border-premium-gold';
                            }
                            return `
                                <div class="flex flex-col items-center w-11 shrink-0 cursor-pointer transition-transform hover:scale-105" onclick="window.openChampModalFromComp('${window.escapeJS(c)}')">
                                    <div class="w-9 h-9 aspect-square border-[1.5px] ${borderColor} bg-black mb-1.5 rounded-xl overflow-hidden"><img src="${img}" class="w-full h-full object-cover object-[80%]" ${onErrorFallback}></div>
                                    <span class="text-[8.5px] text-zinc-600 dark:text-zinc-400 font-bold uppercase truncate w-full text-center tracking-wider">${window.escapeHTML(c)}</span>
                                </div>
                            `;
                        }).join('');
                        return `<div class="flex items-center justify-between bg-zinc-50 dark:bg-premium-surface p-3 border border-zinc-200 dark:border-premium-border rounded-xl"><div class="flex gap-2.5 overflow-x-auto no-scrollbar">${teamHTML}</div></div>`;
                    }).join('');
                    earlyCompHTML = `<div class="flex flex-col gap-3">${earlyCompHTML}</div>`;
                }

                let boardHTML = '<p class="text-[10px] text-zinc-500 font-bold uppercase flex items-center justify-center h-full">TRỐNG</p>';
                if (comp.BoardPositions && comp.BoardPositions.length > 0) {
                    const champHexesHTML = comp.BoardPositions.map(pos => {
                        const cData = masterChamps[cleanName(pos.champion)];
                        const img = cData ? cData.image : '/Asset/logo/logo.png';
                        let bgBorder = 'bg-zinc-400 dark:bg-zinc-600';
                        if (cData) {
                            if (cData.cost === 2) bgBorder = 'bg-emerald-500';
                            if (cData.cost === 3) bgBorder = 'bg-blue-500';
                            if (cData.cost === 4) bgBorder = 'bg-purple-500';
                            if (cData.cost === 5) bgBorder = 'bg-premium-gold';
                        }
                        const left = pos.coordinates.col * 13.33 + ((pos.coordinates.row % 2 !== 0) ? 6.66 : 0);
                        const top = pos.coordinates.row * 23.07;
                        return `
                        <div class="absolute w-[13.33%] h-[30.76%] z-10 cursor-pointer transition-transform hover:scale-110 hover:z-30" style="left: ${left}%; top: ${top}%;" onclick="window.openChampModalFromComp('${window.escapeJS(pos.champion)}')">
                            <div class="relative w-full h-full p-[1.5px] sm:p-[2px] ${bgBorder}" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                                <img src="${img}" class="w-full h-full object-cover object-[80%] bg-black" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);" ${onErrorFallback}>
                                <div class="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>
                                <div class="absolute bottom-[25%] left-0 w-full text-center pointer-events-none px-0.5 z-20">
                                    <span class="text-[5.5px] sm:text-[6.5px] text-white font-black uppercase tracking-wider truncate block leading-none">
                                        ${window.escapeHTML(pos.champion)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                    }).join('');
                    boardHTML = `<div class="relative w-full max-w-[340px] mx-auto aspect-[2/1] bg-zinc-100 dark:bg-[#0a0a0a] overflow-hidden border border-zinc-300 dark:border-premium-border rounded-2xl">${emptyHexesHTML}${champHexesHTML}</div>`;
                }

                let levelingHTML = '<span class="text-[10px] text-zinc-500 font-bold uppercase">TRỐNG</span>';
                if (comp.CompQuickStart?.leveling?.length > 0) {
                    levelingHTML = `<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">` +
                        comp.CompQuickStart.leveling.map((lvl) => `
                            <div class="flex flex-col items-center bg-zinc-100 dark:bg-premium-surface px-3 py-1.5 border border-zinc-200 dark:border-premium-border rounded-xl">
                                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">${lvl.level}</span>
                                <span class="text-[10px] text-premium-gold font-black uppercase">${lvl.stage}</span>
                            </div>
                        `).join('') + `</div>`;
                }

                let copyCodeHTML = '';
                const codeToCopy = comp.CopyTeamCode || comp.shareCode;
                if (codeToCopy) {
                    const btnId = `copy-btn-${compIndex}`;
                    copyCodeHTML = `
                        <div class="flex items-center gap-2.5">
                            ${comp.shareCode ? `<span class="text-[10px] font-black text-zinc-500 bg-zinc-100 dark:bg-premium-surface px-3 py-2 border border-zinc-200 dark:border-premium-border rounded-xl uppercase tracking-widest hidden sm:block">ID: ${window.escapeHTML(comp.shareCode)}</span>` : ''}
                            <button id="${btnId}" onclick="window.copyToClipboard('${window.escapeJS(window.escapeHTML(codeToCopy))}', '${btnId}')" 
                                class="flex items-center gap-2 bg-zinc-100 dark:bg-premium-surface hover:border-premium-gold text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors outline-none">
                                <i class="fa-regular fa-copy"></i> Sao chép
                            </button>
                        </div>
                    `;
                }

                return `
                    <div class="comp-card bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 rounded-3xl transition-colors duration-300 relative overflow-hidden group mb-2">
                        <div class="flex flex-col xl:flex-row gap-2 p-4 relative z-10">
                            <div class="flex flex-col gap-2 xl:w-[220px] shrink-0 justify-center">
                                <div class="flex gap-2.5 flex-wrap">${tagsHTML}</div>
                                <h3 class="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wider leading-tight">${window.escapeHTML(comp.CompTitle)}</h3>
                            </div>
                            <div class="flex flex-wrap gap-2 w-full xl:w-auto xl:flex-1 pt-2 xl:pt-0">${unitsHTML}</div>
                            <div class="flex items-center gap-2 shrink-0 ml-auto border-t xl:border-t-0 border-zinc-100 dark:border-premium-border pt-2 xl:pt-0 w-full xl:w-auto justify-between xl:justify-end">
                               ${copyCodeHTML}
                               <button onclick="window.toggleCompDetails(this)" class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border flex items-center justify-center hover:border-premium-gold hover:text-premium-gold transition-colors outline-none">
                                    <i class="fa-solid fa-chevron-down text-zinc-500 text-sm expand-icon transition-transform duration-300"></i>
                               </button>
                            </div>
                        </div>
                        
                        <div class="comp-details hidden border-t border-zinc-200 dark:border-premium-border bg-zinc-50 dark:bg-[#0a0a0a] p-6 relative z-10">
                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
                                <div class="flex flex-col gap-8">
                                   <div>
    <div onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" 
         class="cursor-pointer text-[10px] font-black text-premium-gold uppercase tracking-widest mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-premium-border pb-2 group">
        <span>TỘC HỆ</span>
        <div class="w-6 h-6 rounded-full bg-zinc-100 dark:bg-premium-surface flex items-center justify-center border border-zinc-200 dark:border-premium-border group-hover:border-premium-gold transition-colors">
            <i class="fa-solid fa-chevron-down text-zinc-500 group-hover:text-premium-gold transition-transform duration-300"></i>
        </div>
    </div>
    <div class="hidden">
        <div class="flex flex-wrap gap-2.5">${traitsHTML}</div>
    </div>
</div>
                                    <div class="grid grid-cols-2 gap-8">
                                        <div>
                                            <div class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-premium-border pb-2">ĐI CHỢ</div>
                                            ${carouselHTML}
                                        </div>
                                        <div>
                                            <div class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-premium-border pb-2">LÊN CẤP</div>
                                            ${levelingHTML}
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-premium-border pb-2">ĐẦU GAME</div>
                                        ${earlyCompHTML}
                                    </div>
                                </div>
                                <div class="flex flex-col gap-5">
                                    <div class="text-[10px] font-black text-premium-gold uppercase tracking-widest mb-1 flex items-center gap-2 border-b border-zinc-200 dark:border-premium-border pb-2 xl:justify-center">XẾP VỊ TRÍ</div>
                                    <div class="flex-1 flex items-start justify-center">${boardHTML}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            listContainer.innerHTML = headerHTML + compsHTML;
        };

        document.getElementById('comp-list-container').addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-source-btn-main');
            if (!btn) return;
            const url = btn.dataset.url;
            if (activeSourceUrl === url) return;
            activeSourceUrl = url;
            fetchAndRenderComps(url);
        });

        window.copyToClipboard = (text, btnId) => {
            const showSuccessState = () => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `ĐÃ CHÉP`;
                    btn.classList.add('bg-premium-gold', 'text-black', 'border-premium-gold');
                    setTimeout(() => {
                        btn.classList.remove('bg-premium-gold', 'text-black', 'border-premium-gold');
                        btn.innerHTML = originalHTML;
                    }, 1500);
                }
            };
            const fallbackCopyTextToClipboard = (textToCopy) => {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.top = "0"; textArea.style.left = "0"; textArea.style.position = "fixed"; textArea.style.opacity = "0";
                textArea.setAttribute('readonly', '');
                document.body.appendChild(textArea);
                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    textArea.contentEditable = true; textArea.readOnly = false;
                    const range = document.createRange(); range.selectNodeContents(textArea);
                    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                } else { textArea.focus(); textArea.select(); }
                try { if (document.execCommand('copy')) showSuccessState(); } catch (err) { }
                document.body.removeChild(textArea);
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(showSuccessState).catch(() => fallbackCopyTextToClipboard(text));
            } else fallbackCopyTextToClipboard(text);
        };

        const searchInput = document.getElementById('search-comp');
        const clearBtn = document.getElementById('clear-search-comp');
        searchInput.addEventListener('input', window.debounce((e) => { searchQuery = e.target.value; clearBtn.classList.toggle('hidden', searchQuery.length === 0); renderComps(); }, 300));
        clearBtn.addEventListener('click', () => { searchInput.value = ''; searchQuery = ''; clearBtn.classList.add('hidden'); searchInput.focus(); renderComps(); });

        document.querySelectorAll('.filter-source-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                if (activeSourceUrl === url) return;
                activeSourceUrl = url;
                document.querySelectorAll('.filter-source-btn').forEach(b => {
                    b.className = "filter-source-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors uppercase outline-none bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card";
                });
                e.currentTarget.className = "filter-source-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors uppercase outline-none bg-premium-gold border-premium-gold text-black";
                fetchAndRenderComps(url);
            });
        });

        fetchAndRenderComps(activeSourceUrl);
    } catch (error) {
        gridContainer.innerHTML = `<div class="p-5 text-center text-red-500 text-xs font-bold uppercase tracking-widest border border-red-900 bg-[#121212] rounded-2xl">LỖI ĐỘI HÌNH: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// THẦN
// ---------------------------------------------------------
async function loadGodsData() {
    const gridContainer = document.getElementById('grid-gods');
    if (!gridContainer) return;

    try {
        const godsData = await window.fetchCached('./asset/data/gods.json');

        window.toggleGodCard = (cardElement) => {
            const detailsWrapper = cardElement.querySelector('.god-details');
            const chevronIcon = cardElement.querySelector('.expand-chevron');
            if (detailsWrapper.classList.contains('hidden')) {
                detailsWrapper.classList.remove('hidden');
                chevronIcon.classList.add('rotate-180');
                cardElement.classList.add('border-premium-gold/50');
            } else {
                detailsWrapper.classList.add('hidden');
                chevronIcon.classList.remove('rotate-180');
                cardElement.classList.remove('border-premium-gold/50');
            }
        };

        gridContainer.innerHTML = '';
        gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 w-full pt-2";
        const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

        let godsHTML = godsData.map(god => {
            let tagsHTML = (god.tags || []).map(tag => `<span class="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-premium-border bg-zinc-100 dark:bg-premium-surface text-zinc-700 dark:text-zinc-300 text-[9px] font-black uppercase tracking-widest">${tag}</span>`).join('');

            let bestForHTML = god.best_for ? `
                <div class="mb-5 p-4 rounded-2xl bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border flex items-start gap-3">
                    <i class="fa-solid fa-lightbulb text-premium-gold text-base mt-0.5"></i>
                    <p class="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed uppercase tracking-wide"><span class="font-black mr-1">LỜI KHUYÊN:</span>${god.best_for}</p>
                </div>` : '';

            let stagesHTML = (god.stages || []).map(stage => {
                const isFinalStage = stage.stage_label.includes('4-7');
                const perksHTML = (stage.perks || []).map(perk => `
                    <div class="bg-white dark:bg-premium-surface p-4 rounded-xl border ${isFinalStage ? 'border-premium-gold' : 'border-zinc-200 dark:border-premium-border'} mb-3 last:mb-0">
                        <h4 class="text-[11px] font-black ${isFinalStage ? 'text-premium-gold' : 'text-zinc-800 dark:text-white'} uppercase tracking-widest mb-1.5">${perk.title}</h4>
                        ${perk.description ? `<p class="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed tracking-wide">${perk.description.replace(/\n/g, '<br>')}</p>` : ''}
                    </div>
                `).join('');

                return `
                    <div class="${isFinalStage ? 'mt-5 border-t border-premium-gold/30 pt-4' : 'mb-5 border-b border-zinc-200 dark:border-premium-border pb-4'}">
                        <div class="text-[10px] font-black text-premium-gold uppercase mb-4 tracking-widest flex items-center gap-2.5"><i class="fa-solid ${isFinalStage ? 'fa-bolt text-lg' : 'fa-play'}"></i> VÒNG ${stage.stage_label}</div>
                        ${perksHTML}
                    </div>
                `;
            }).join('') || '<p class="text-xs text-zinc-500 text-center font-bold uppercase tracking-widest">TRỐNG</p>';

            return `
                <div class="bg-white dark:bg-premium-card rounded-3xl border border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 transition-colors duration-300 flex flex-col group relative overflow-hidden">
                    <div class="relative h-[220px] w-full overflow-hidden bg-black shrink-0">
                        <img src="${god.avatar}" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" alt="${window.escapeHTML(god.name)}" loading="lazy" ${onErrorFallback}>
                        <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none"></div>
                        <div class="absolute top-4 left-4 z-10 pointer-events-none bg-[#0a0a0a] border border-premium-gold px-3 py-1.5 rounded-full"><span class="text-[9px] font-black text-premium-gold uppercase tracking-widest"><i class="fa-solid fa-crown mr-1.5"></i> ${god.sub_title}</span></div>
                        <div class="absolute bottom-5 left-5 flex flex-col gap-2.5 z-10 pointer-events-none pr-14">
                            <h3 class="text-3xl font-black text-white uppercase tracking-wider leading-none">${window.escapeHTML(god.name)}</h3>
                            ${tagsHTML ? `<div class="flex flex-wrap gap-2">${tagsHTML}</div>` : ''}
                        </div>
                        <div class="absolute bottom-5 right-5 z-20 cursor-pointer outline-none bg-zinc-800 border border-zinc-600 p-3 rounded-full hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-colors" onclick="window.toggleGodCard(this.closest('.group'))">
                            <i class="fa-solid fa-chevron-down expand-chevron text-white text-sm transition-transform duration-300"></i>
                        </div>
                    </div>
                    <div class="god-details hidden bg-zinc-50 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-premium-border p-5">
                        ${bestForHTML}${stagesHTML}
                    </div>
                </div>
            `;
        }).join('');

        gridContainer.innerHTML = godsHTML;
    } catch (error) {
        gridContainer.innerHTML = `<div class="col-span-full text-center py-10 text-red-500 text-xs font-bold uppercase tracking-widest bg-black rounded-2xl border border-red-900/50">LỖI THẦN: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// TƯỚNG
// ---------------------------------------------------------
async function loadChampionsData() {
    const gridContainer = document.getElementById('grid-champions');
    if (!gridContainer) return;
    gridContainer.innerHTML = `<div class="flex flex-col relative pb-40 min-h-screen w-full pt-4">${window.renderSkeletonGrid(16)}</div>`;
    try {
        const [champions, itemsData, buildsDataRaw] = await Promise.all([
            window.fetchCached('./asset/data/champions.json'),
            window.fetchCached('./asset/data/items.json'),
            window.fetchCached('./asset/data/champion_builds.json').catch(() => null)
        ]);

        const buildsData = buildsDataRaw || [];

        window._masterItems = {};
        for (const [category, itemArray] of Object.entries(itemsData)) {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => {
                    item.category = category.trim();
                    window._masterItems[item.name] = item;
                });
            }
        }

        window._normalizeBuildName = (name) => name ? name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : '';

        window._masterBuilds = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const combinedBuilds = [...(b.bestBuilds || []), ...(b.builds || [])];
                const validBuilds = combinedBuilds.filter(build => build.items && build.items.length > 0);
                if (validBuilds.length > 0) window._masterBuilds[window._normalizeBuildName(b.unit)] = validBuilds;
            });
        }

        const cleanItemName = (rawName) => rawName ? rawName.replace(/<[^>]+>/g, '').trim() : '';
        const getTraitIconName = (name) => name ? name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join('') : '';

        let activeCosts = new Set(); let activeTraits = new Set(); let searchQuery = ''; let isDetailedView = false;
        window._currentFilteredChampsForPopup = [];

        const allTraits = [...new Set(champions.flatMap(c => c.traits.map(t => t.name)))].sort();

        const costButtonsHTML = [1, 2, 3, 4, 5].map(cost => `
            <button class="filter-cost-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card" data-cost="${cost}">
                ${cost} VÀNG
            </button>
        `).join('');

        const traitButtonsHTML = allTraits.map(trait => `
            <button class="filter-trait-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card" data-trait="${trait}">
                ${trait}
            </button>
        `).join('');

        gridContainer.innerHTML = `
            <div class="flex flex-col relative pb-40 min-h-screen w-full">
                <div id="champ-list-container" class="w-full flex flex-col gap-6 pt-4"></div>
                <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                    <div id="champ-filters-wrapper" class="w-full transition-all duration-300 opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-4 left-0">
                        <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl p-5 flex flex-col gap-5 relative shadow-xl">
                            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-premium-border pb-3">
                                <span class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-filter text-premium-gold"></i> TÙY CHỈNH LỌC</span>
                                <button id="close-filter-champ-btn" class="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-500 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                            <div class="flex flex-col gap-2.5"><span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">GIÁ VÀNG:</span><div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">${costButtonsHTML}</div></div>
                            <div class="flex flex-col gap-2.5"><span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">TỘC/HỆ:</span><div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">${traitButtonsHTML}</div></div>
                        </div>
                    </div>
                    <div class="w-full bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-full flex items-center px-5 py-2.5 pointer-events-auto hover:border-premium-gold/50 transition-colors relative shadow-lg">
                        <i class="fa-solid fa-magnifying-glass text-zinc-400 text-sm"></i>
                        <input type="text" id="search-champ" placeholder="TÌM TƯỚNG..." class="w-full bg-transparent border-none text-zinc-800 dark:text-white text-[13px] font-bold ml-3 focus:outline-none uppercase tracking-wider placeholder:text-zinc-500">
                        <button id="clear-search-champ" class="absolute right-[100px] hidden text-zinc-400 hover:text-premium-gold px-2 outline-none"><i class="fa-solid fa-xmark text-lg"></i></button>
                        <div class="w-[1px] h-6 bg-zinc-200 dark:bg-premium-border mx-3"></div>
                        <button id="toggle-view-champ" class="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none mx-1 relative"><i class="fa-solid fa-list" id="view-icon-champ"></i></button>
                        <div class="w-[1px] h-6 bg-zinc-200 dark:bg-premium-border mx-3"></div>
                        <button id="toggle-filter-champ-btn" class="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none relative"><i class="fa-solid fa-sliders text-sm"></i><span id="champ-filter-indicator" class="absolute top-1 right-1 w-2.5 h-2.5 bg-premium-gold rounded-full border-2 border-white dark:border-premium-card hidden"></span></button>
                    </div>
                </div>
            </div>
        `;

        const toggleFilterBtn = document.getElementById('toggle-filter-champ-btn');
        const closeFilterBtn = document.getElementById('close-filter-champ-btn');
        const filtersWrapper = document.getElementById('champ-filters-wrapper');
        let isFilterMenuOpen = false;

        const toggleFilterMenu = () => {
            isFilterMenuOpen = !isFilterMenuOpen;
            if (isFilterMenuOpen) {
                filtersWrapper.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.add('opacity-100', 'translate-y-0');
                toggleFilterBtn.classList.add('text-premium-gold');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0');
                toggleFilterBtn.classList.remove('text-premium-gold');
            }
        };

        toggleFilterBtn.addEventListener('click', toggleFilterMenu);
        closeFilterBtn.addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });
        document.getElementById('champ-list-container').addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });

        const updateFilterIndicator = () => {
            const indicator = document.getElementById('champ-filter-indicator');
            if (activeCosts.size > 0 || activeTraits.size > 0) indicator.classList.remove('hidden');
            else indicator.classList.add('hidden');
        };

        window.openChampModal = (index) => {
            const champ = window._currentFilteredChampsForPopup[index];
            if (!champ) return;

            const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;
            const safeCleanName = (rawName) => rawName ? String(rawName).replace(/<[^>]+>/g, '').trim() : '';
            const champKey = window._normalizeBuildName(champ.name);
            const allBuilds = window._masterBuilds[champKey] || [];

            const bestBuilds = allBuilds.slice(0, 5);
            const otherBuilds = allBuilds.slice(5);

            const availableCategories = new Set();
            otherBuilds.forEach(b => {
                b.items.forEach(rawItem => {
                    const itemData = window._masterItems[safeCleanName(rawItem)];
                    if (itemData && itemData.category) availableCategories.add(itemData.category);
                });
            });

            const categoryConfig = {
                'Tạo tác': { name: 'TẠO TÁC', icon: 'fa-hammer' },
                'Ánh sáng': { name: 'ÁNH SÁNG', icon: 'fa-sun' },
                'Ấn': { name: 'ẤN TỘC', icon: 'fa-medal' },
                'Hỗ trợ': { name: 'HỖ TRỢ', icon: 'fa-hand-holding-heart' },
                'Trang bị': { name: 'CƠ BẢN', icon: 'fa-box' }
            };

            const renderBuildCard = (b, idx, labelPrefix = "CÁCH") => {
                const itemsHTML = b.items.map(rawItem => {
                    const itemData = window._masterItems[safeCleanName(rawItem)];
                    if (!itemData) return `<div class="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700"></div>`;

                    const isPremium = ['Ánh sáng', 'Tạo tác'].includes(itemData.category);
                    const borderStyle = isPremium ? 'border-premium-gold' : 'border-zinc-300 dark:border-zinc-700';

                    return `<img src="${itemData.image}" class="w-9 h-9 rounded-md border-[1.5px] ${borderStyle} object-cover bg-black" title="${itemData.name}" loading="lazy" ${onErrorFallback}>`;
                }).join('');

                return `
            <div class="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-2xl mb-3 last:mb-0 hover:border-premium-gold/50 transition-colors">
                <div class="flex flex-col gap-2">
                    <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">${labelPrefix} ${idx + 1} ${b.tier ? `• <span class="text-premium-gold">HẠNG ${b.tier}</span>` : ''}</span>
                    <div class="flex gap-1.5">${itemsHTML}</div>
                </div>
                <div class="flex flex-col items-end gap-1.5 text-right">
                    <span class="text-[10px] font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase"><i class="fa-solid fa-trophy text-[9px]"></i> ${b.avg_place}</span>
                    <span class="text-[10px] font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase"><i class="fa-solid fa-crown text-[9px]"></i> ${b.win_rate}</span>
                </div>
            </div>`;
            };

            window.switchChampTab = (tabName) => {
                ['best', 'others'].forEach(t => {
                    const btn = document.getElementById(`tab-btn-${t}`);
                    const content = document.getElementById(`tab-content-${t}`);
                    if (t === tabName) {
                        btn.className = "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors border border-transparent bg-premium-gold text-black";
                        content.classList.remove('hidden');
                    } else {
                        btn.className = "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors border border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-premium-surface";
                        content.classList.add('hidden');
                    }
                });
            };

            window.filterOtherBuilds = (filterType, value, btnElement = null) => {
                const container = document.getElementById('others-list-container');

                if (btnElement) {
                    btnElement.parentElement.querySelectorAll('button').forEach(b => {
                        b.className = "shrink-0 px-4 py-2 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-500 flex items-center gap-1.5 transition-colors uppercase outline-none";
                    });
                    btnElement.className = "shrink-0 px-4 py-2 rounded-full text-[9px] font-black border border-premium-gold bg-premium-gold text-black flex items-center gap-1.5 uppercase outline-none";
                }

                const filtered = otherBuilds.filter(build => {
                    if (filterType === 'search') return build.items.some(i => i.toLowerCase().includes(value.toLowerCase().trim()));
                    if (filterType === 'cat') {
                        if (value === 'all') return true;
                        return build.items.some(rawItem => {
                            const itemData = window._masterItems[safeCleanName(rawItem)];
                            return itemData && itemData.category === value;
                        });
                    }
                    return true;
                });

                container.innerHTML = filtered.length === 0
                    ? `<p class="text-[10px] text-zinc-500 text-center py-10 uppercase font-bold tracking-widest">KHÔNG CÓ KẾT QUẢ PHÙ HỢP</p>`
                    : filtered.map((b, i) => renderBuildCard(b, i, "KQ")).join('');
            };

            let filterButtonsHTML = `<button onclick="window.filterOtherBuilds('cat', 'all', this)" class="shrink-0 px-4 py-2 rounded-full text-[9px] font-black border border-premium-gold bg-premium-gold text-black uppercase outline-none">TẤT CẢ</button>`;
            Object.keys(categoryConfig).forEach(catKey => {
                if (availableCategories.has(catKey)) {
                    filterButtonsHTML += `
                <button onclick="window.filterOtherBuilds('cat', '${catKey}', this)" class="shrink-0 px-4 py-2 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-500 flex items-center gap-1.5 transition-colors uppercase outline-none">
                    <i class="fa-solid ${categoryConfig[catKey].icon} text-[10px]"></i> ${categoryConfig[catKey].name}
                </button>`;
                }
            });

            let borderColor = 'border-zinc-500';
            if (champ.cost === 2) borderColor = 'border-emerald-500';
            if (champ.cost === 3) borderColor = 'border-blue-500';
            if (champ.cost === 4) borderColor = 'border-purple-500';
            if (champ.cost === 5) borderColor = 'border-premium-gold';

            const traitPills = champ.traits.map(t => {
                const iconFilename = getTraitIconName(t.name);
                return `<span class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121212] border border-premium-border text-white text-[9px] font-black uppercase"><div class="w-3.5 h-3.5 bg-premium-gold shrink-0" style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat;"></div>${t.name}</span>`;
            }).join('');

            const contentHTML = `
        <div class="-mt-10 -mx-6 -mb-6 flex flex-col bg-white dark:bg-premium-card overflow-hidden rounded-3xl">
            <!-- HERO BANNER -->
            <div class="relative w-full h-[160px] bg-black border-b-[3px] ${borderColor} shrink-0">
                <img src="${champ.image}" class="absolute inset-0 w-full h-full object-cover object-[50%_20%] opacity-60" ${onErrorFallback}>
                <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                <div class="absolute top-4 right-4 bg-[#0a0a0a] border border-premium-gold px-3 py-1.5 rounded-full"><span class="text-premium-gold font-black text-[9px] tracking-widest">${champ.cost} VÀNG</span></div>
                <div class="absolute bottom-4 left-5 right-5">
                    <h2 class="text-3xl font-black text-white uppercase tracking-tighter mb-2">${window.escapeHTML(champ.name)}</h2>
                    <div class="flex flex-wrap gap-1.5">${traitPills}</div>
                </div>
            </div>

            <!-- TAB NAVIGATION -->
            <div class="flex gap-2 p-3 shrink-0 bg-zinc-50 dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-premium-border">
                <button id="tab-btn-best" onclick="window.switchChampTab('best')" class="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors border border-transparent bg-premium-gold text-black outline-none">TOP 5 META</button>
                <button id="tab-btn-others" onclick="window.switchChampTab('others')" class="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors border border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-premium-surface outline-none">MỞ RỘNG</button>
            </div>

            <!-- TAB CONTENT -->
            <div class="flex-1 p-4 overflow-hidden">
                <div id="tab-content-best" class="flex flex-col max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                    ${bestBuilds.length > 0 ? bestBuilds.map((b, i) => renderBuildCard(b, i)).join('') : '<p class="text-center py-10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">CHƯA CÓ DỮ LIỆU GỢI Ý</p>'}
                </div>

                <div id="tab-content-others" class="hidden flex flex-col h-full">
                    <div class="flex flex-col gap-3 mb-4 shrink-0">
                        <div class="relative">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[12px]"></i>
                            <input type="text" oninput="window.filterOtherBuilds('search', this.value)" placeholder="TÌM TÊN TRANG BỊ..." class="w-full bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-full py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-wider focus:border-premium-gold outline-none text-zinc-800 dark:text-white">
                        </div>
                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            ${filterButtonsHTML}
                        </div>
                    </div>
                    <div id="others-list-container" class="flex flex-col max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                        ${otherBuilds.length > 0 ? otherBuilds.map((b, i) => renderBuildCard(b, i, "LỐI CHƠI")).join('') : '<p class="text-center py-10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">KHÔNG CÓ DỮ LIỆU KHÁC</p>'}
                    </div>
                </div>
            </div>

            <!-- FOOTER INFO -->
            <div class="p-4 bg-zinc-50 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-premium-border flex justify-between items-center shrink-0 >
                <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">${champ.role}</span>
                <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest"><i class="fa-solid fa-arrows-up-down mr-1"></i> CUỘN XEM</span>
            </div>
        </div>
    `;
            uiAlert('', contentHTML);
        };

        const renderChampions = () => {
            const listContainer = document.getElementById('champ-list-container');
            const viewIcon = document.getElementById('view-icon-champ');
            listContainer.innerHTML = '';
            window._currentFilteredChampsForPopup = [];
            let globalIndex = 0;

            const filteredChamps = champions.filter(champ => {
                const matchSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchCost = activeCosts.size === 0 || activeCosts.has(champ.cost);
                const matchTraits = activeTraits.size === 0 || [...activeTraits].every(st => champ.traits.some(t => t.name === st));
                return matchSearch && matchCost && matchTraits;
            });

            if (filteredChamps.length === 0) {
                listContainer.innerHTML = `<div class="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">TRỐNG</div>`;
                return;
            }

            viewIcon.className = isDetailedView ? "fa-solid fa-border-all" : "fa-solid fa-list";
            const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

            [1, 2, 3, 4, 5].forEach(tier => {
                const champsInTier = filteredChamps.filter(c => c.cost === tier);
                if (champsInTier.length === 0) return;

                champsInTier.forEach(c => window._currentFilteredChampsForPopup.push(c));
                let tierColor = 'text-zinc-500 dark:text-zinc-400';
                if (tier === 2) tierColor = 'text-emerald-500';
                if (tier === 3) tierColor = 'text-blue-500';
                if (tier === 4) tierColor = 'text-purple-500';
                if (tier === 5) tierColor = 'text-premium-gold';

                let tierHTML = `
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-3 border-b border-zinc-200 dark:border-premium-border pb-3 px-2">
                            <h2 class="text-sm font-black ${tierColor} uppercase tracking-widest">${tier} VÀNG</h2>
                        </div>
                        <div class="${isDetailedView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4'}">
                `;

                const champsHTML = champsInTier.map(champ => {
                    const currentIndex = globalIndex++;
                    let thickBorder = 'border-zinc-300 dark:border-zinc-700 hover:border-premium-gold/50';
                    if (champ.cost === 2) thickBorder = 'border-emerald-500/80 hover:border-emerald-400';
                    if (champ.cost === 3) thickBorder = 'border-blue-500/80 hover:border-blue-400';
                    if (champ.cost === 4) thickBorder = 'border-purple-500/80 hover:border-purple-400';
                    if (champ.cost === 5) thickBorder = 'border-premium-gold hover:border-yellow-400';

                    let recommendedItemsArray = [];
                    const buildsForChamp = window._masterBuilds[window._normalizeBuildName(champ.name)];
                    if (buildsForChamp && buildsForChamp.length > 0) {
                        buildsForChamp[0].items.forEach(rawItemName => {
                            const cleanName = cleanItemName(rawItemName);
                            const itemData = window._masterItems[cleanName];
                            if (itemData) recommendedItemsArray.push(itemData.image);
                        });
                    }

                    if (isDetailedView) {
                        const traitList = champ.traits.map(t => `<span class="text-[10px] font-bold text-zinc-300 uppercase">${t.name}</span>`).join(' • ');
                        let buildIconsHTML = recommendedItemsArray.length > 0 ? `<div class="flex gap-2 mt-3">${recommendedItemsArray.map(img => `<img src="${img}" class="w-8 h-8 rounded-lg border border-zinc-600 bg-black" ${onErrorFallback}>`).join('')}</div>` : '';

                        return `
                            <div class="relative h-[200px] bg-black border-[1.5px] ${thickBorder} transition-transform cursor-pointer group rounded-2xl overflow-hidden hover:scale-[1.02]" onclick="window.openChampModal(${currentIndex})">
                                <img src="${champ.image}" class="absolute inset-0 w-full h-full object-cover object-[80%] opacity-60 group-hover:opacity-90 transition-opacity duration-300" ${onErrorFallback}>
                                <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none"></div>
                                <div class="absolute bottom-4 left-4 right-4 flex flex-col justify-end z-10 pointer-events-none">
                                    <h3 class="text-2xl font-black text-white uppercase tracking-wider leading-none mb-1.5">${champ.name}</h3>
                                    <div class="flex flex-col gap-0.5">${traitList}</div>
                                    ${buildIconsHTML}
                                </div>
                                <div class="absolute top-3 right-3 bg-[#0a0a0a] border border-premium-gold px-2.5 py-1 rounded-full"><span class="text-[10px] font-black text-premium-gold">${champ.cost}</span></div>
                            </div>
                        `;
                    } else {
                        let buildGridHTML = recommendedItemsArray.length > 0 ? `<div class="grid grid-cols-3 gap-1 w-full mt-2">${recommendedItemsArray.map(img => `<img src="${img}" class="w-full aspect-square rounded-lg border border-zinc-600 object-cover bg-black" ${onErrorFallback}>`).join('')}</div>` : '<div class="h-4"></div>';
                        return `
                            <div class="flex flex-col p-1 bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border cursor-pointer transition-colors hover:border-premium-gold/50 group rounded-2xl" onclick="window.openChampModal(${currentIndex})">
                                <div class="relative w-full aspect-square border-[1.5px] ${thickBorder} bg-black overflow-hidden rounded-xl"><img src="${champ.image}" alt="${champ.name}" class="w-full h-full object-cover object-[80%] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-300" ${onErrorFallback}></div>
                                ${buildGridHTML}
                                <span class="text-[10px] font-black text-zinc-800 dark:text-white uppercase w-full text-center mt-2 mb-1 truncate tracking-wider group-hover:text-premium-gold transition-colors">${champ.name}</span>
                            </div>
                        `;
                    }
                }).join('');

                tierHTML += champsHTML + `</div></div>`;
                listContainer.innerHTML += tierHTML;
            });
        };

        const searchInp = document.getElementById('search-champ');
        const clearBtn = document.getElementById('clear-search-champ');
        searchInp.addEventListener('input', window.debounce((e) => { searchQuery = e.target.value; clearBtn.classList.toggle('hidden', searchQuery.length === 0); renderChampions(); }, 300));
        clearBtn.addEventListener('click', () => { searchInp.value = ''; searchQuery = ''; clearBtn.classList.add('hidden'); searchInp.focus(); renderChampions(); });
        document.getElementById('toggle-view-champ').addEventListener('click', () => { isDetailedView = !isDetailedView; renderChampions(); });

        document.querySelectorAll('.filter-cost-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cost = parseInt(e.currentTarget.dataset.cost);
                if (activeCosts.has(cost)) {
                    activeCosts.delete(cost);
                    e.currentTarget.className = "filter-cost-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card";
                } else {
                    activeCosts.add(cost);
                    e.currentTarget.className = "filter-cost-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-premium-gold text-black border-premium-gold";
                }
                updateFilterIndicator(); renderChampions();
            });
        });

        document.querySelectorAll('.filter-trait-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trait = e.currentTarget.dataset.trait;
                if (activeTraits.has(trait)) {
                    activeTraits.delete(trait);
                    e.currentTarget.className = "filter-trait-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-white dark:bg-premium-surface border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card";
                } else {
                    activeTraits.add(trait);
                    e.currentTarget.className = "filter-trait-btn shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-bold transition-colors duration-300 uppercase outline-none bg-premium-gold text-black border-premium-gold";
                }
                updateFilterIndicator(); renderChampions();
            });
        });
        renderChampions();
    } catch (error) {
        gridContainer.innerHTML = `<div class="p-5 text-center text-red-500 text-xs font-bold uppercase tracking-widest border border-red-900 bg-[#121212] rounded-2xl">LỖI TƯỚNG: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// TRANG BỊ
// ---------------------------------------------------------
async function loadItemsData() {
    const gridContainer = document.getElementById('grid-items');
    if (!gridContainer) return;

    try {
        const rawItemsData = await window.fetchCached('./asset/data/items.json');

        const categoryMap = { 'normal': 'CƠ BẢN', 'emblem': 'ẤN HỆ TỘC', 'radiant': 'ÁNH SÁNG', 'artifact': 'TẠO TÁC', 'support': 'HỖ TRỢ', 'consumable': 'TIÊU THỤ' };
        let items = [];
        let filterButtonsHTML = `<button class="filter-item-btn shrink-0 px-5 py-2.5 rounded-full bg-premium-gold border border-premium-gold text-black font-black text-[10px] uppercase transition-colors outline-none" data-cat="all">TẤT CẢ</button>`;

        for (const [category, itemArray] of Object.entries(rawItemsData)) {
            if (Array.isArray(itemArray) && itemArray.length > 0) {
                const catKey = category.toLowerCase();
                const displayName = categoryMap[catKey] || (category.charAt(0).toUpperCase() + category.slice(1));
                filterButtonsHTML += `<button class="filter-item-btn shrink-0 px-5 py-2.5 rounded-full bg-white dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card transition-colors outline-none" data-cat="${catKey}">${displayName}</button>`;
                itemArray.forEach(item => { item.category = catKey; items.push(item); });
            }
        }

        let searchQuery = ''; let activeCategory = 'all'; let isDetailedView = false;
        window._currentFilteredItemsForPopup = [];

        gridContainer.innerHTML = `
            <div class="flex flex-col relative pb-40 min-h-screen w-full">
                <div id="item-list-container" class="flex flex-col gap-6 pt-4"></div>
                <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                    <div id="item-filters-wrapper" class="w-full transition-all duration-300 opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-4 left-0">
                        <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl p-5 flex flex-col gap-5 relative shadow-xl">
                            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-premium-border pb-3">
                                <span class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-filter text-premium-gold"></i> TÙY CHỈNH LỌC</span>
                                <button id="close-filter-item-btn" class="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-500 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">PHÂN LOẠI:</span>
                                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">${filterButtonsHTML}</div>
                            </div>
                        </div>
                    </div>
                    <div class="w-full bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-full flex items-center px-5 py-2.5 pointer-events-auto hover:border-premium-gold/50 transition-colors relative shadow-lg">
                        <i class="fa-solid fa-magnifying-glass text-zinc-400 text-sm"></i>
                        <input type="text" id="search-item" placeholder="TÌM TRANG BỊ..." class="w-full bg-transparent border-none text-zinc-800 dark:text-white text-[13px] font-bold ml-3 focus:outline-none uppercase tracking-wider placeholder:text-zinc-500">
                        <button id="clear-search-btn" class="absolute right-[100px] hidden text-zinc-400 hover:text-premium-gold px-2 outline-none"><i class="fa-solid fa-xmark text-lg"></i></button>
                        <div class="w-[1px] h-6 bg-zinc-200 dark:bg-premium-border mx-3"></div>
                        <button id="toggle-view-btn" class="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none mx-1 relative"><i class="fa-solid fa-list" id="view-icon"></i></button>
                        <div class="w-[1px] h-6 bg-zinc-200 dark:bg-premium-border mx-3"></div>
                        <button id="toggle-filter-item-btn" class="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-premium-surface text-zinc-600 dark:text-zinc-400 hover:text-premium-gold hover:bg-zinc-200 transition-colors outline-none relative"><i class="fa-solid fa-sliders text-sm"></i><span id="item-filter-indicator" class="absolute top-1 right-1 w-2.5 h-2.5 bg-premium-gold rounded-full border-2 border-white dark:border-premium-card hidden"></span></button>
                    </div>
                </div>
            </div>
        `;

        const toggleFilterBtn = document.getElementById('toggle-filter-item-btn');
        const closeFilterBtn = document.getElementById('close-filter-item-btn');
        const filtersWrapper = document.getElementById('item-filters-wrapper');
        let isFilterMenuOpen = false;

        const toggleFilterMenu = () => {
            isFilterMenuOpen = !isFilterMenuOpen;
            if (isFilterMenuOpen) {
                filtersWrapper.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.add('opacity-100', 'translate-y-0');
                toggleFilterBtn.classList.add('text-premium-gold');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0');
                toggleFilterBtn.classList.remove('text-premium-gold');
            }
        };

        toggleFilterBtn.addEventListener('click', toggleFilterMenu);
        closeFilterBtn.addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });
        document.getElementById('item-list-container').addEventListener('click', () => { if (isFilterMenuOpen) toggleFilterMenu(); });

        const updateFilterIndicator = () => {
            const indicator = document.getElementById('item-filter-indicator');
            if (activeCategory !== 'all') indicator.classList.remove('hidden');
            else indicator.classList.add('hidden');
        };

        const createBadgesHTML = (stats) => {
            if (!stats || !Array.isArray(stats)) return '';
            return stats.map(stat => `<div class="flex items-center gap-1.5 bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border rounded-full px-3 py-1 text-[9px] font-black text-zinc-700 dark:text-zinc-300 uppercase"><img src="${stat.icon}" class="w-3 h-3 object-contain" onerror="this.style.display='none'"> ${stat.value}</div>`).join('');
        };

        const createRecipeHTMLForDetail = (recipe) => {
            if (!recipe || recipe.length !== 2) return '';
            return `<div class="flex items-center gap-1.5 bg-zinc-100 dark:bg-premium-surface rounded-full p-1.5 border border-zinc-200 dark:border-premium-border"><img src="${recipe[0].image}" class="w-6 h-6 rounded-full object-cover" onerror="this.src='/Asset/logo/logo.png'; this.onerror=null;"><i class="fa-solid fa-plus text-[10px] text-zinc-500 mx-0.5"></i><img src="${recipe[1].image}" class="w-6 h-6 rounded-full object-cover" onerror="this.src='/Asset/logo/logo.png'; this.onerror=null;"></div>`;
        };

        window.openItemModal = (index) => {
            const item = window._currentFilteredItemsForPopup[index];
            if (!item) return;
            const isRadiant = item.category === 'radiant' || item.name.toLowerCase().includes('ánh sáng');
            const titleColor = isRadiant ? 'text-premium-gold' : 'text-zinc-900 dark:text-white';
            const htmlContent = `
                <div class="flex flex-col gap-5 mt-4 text-left">
                    <div class="flex justify-between items-start gap-4">${createRecipeHTMLForDetail(item.recipe)}</div>
                    <div class="flex flex-wrap gap-2">${createBadgesHTML(item.stats)}</div>
                    <div class="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-[#0a0a0a] p-5 rounded-2xl border border-zinc-200 dark:border-premium-border uppercase tracking-wide font-medium">
                        ${(item.description || item.info || '').replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
            uiAlert(`<span class="${titleColor} font-black text-xl uppercase tracking-wider">${window.escapeHTML(item.name)}</span>`, htmlContent);
        };

        const renderItems = () => {
            const listContainer = document.getElementById('item-list-container');
            const viewIcon = document.getElementById('view-icon');
            listContainer.innerHTML = '';
            let globalIndex = 0;
            window._currentFilteredItemsForPopup = [];

            for (const [key, itemArray] of Object.entries(rawItemsData)) {
                const categoryKey = key.toLowerCase();
                if (activeCategory !== 'all' && activeCategory !== categoryKey) continue;
                if (!Array.isArray(itemArray)) continue;

                const filteredItemsInCategory = itemArray.filter(item => {
                    const desc = item.description || item.info || '';
                    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || desc.toLowerCase().includes(searchQuery.toLowerCase());
                });

                if (filteredItemsInCategory.length === 0) continue;
                filteredItemsInCategory.forEach(item => window._currentFilteredItemsForPopup.push(item));

                const categoryTitle = categoryMap[categoryKey] || (key.charAt(0).toUpperCase() + key.slice(1));

                let categoryHTML = `
                    <div class="flex flex-col gap-4 px-2">
                        <div class="flex items-center gap-3 border-b border-zinc-200 dark:border-premium-border pb-3">
                            <h2 class="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-widest">${categoryTitle}</h2>
                        </div>
                        <div class="${isDetailedView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3'}">
                `;

                const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

                const itemsHTML = filteredItemsInCategory.map((item) => {
                    const isRadiant = item.category === 'radiant' || item.name.toLowerCase().includes('ánh sáng');
                    const currentIndex = globalIndex++;

                    if (isDetailedView) {
                        const borderClass = isRadiant ? 'border-premium-gold' : 'border-zinc-200 dark:border-premium-border';
                        return `
                            <div class="bg-white dark:bg-premium-card border ${borderClass} rounded-2xl p-4 flex gap-4 transition-colors hover:border-premium-gold/50 cursor-pointer group" onclick="window.openItemModal(${currentIndex})">
                                <div class="shrink-0"><img src="${item.image}" class="w-16 h-16 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-black group-hover:scale-105 transition-transform" ${onErrorFallback}></div>
                                <div class="flex-1 min-w-0 flex flex-col gap-2.5">
                                    <div class="flex justify-between items-start gap-2">
                                        <h3 class="text-sm font-black ${isRadiant ? 'text-premium-gold' : 'text-zinc-800 dark:text-white'} uppercase tracking-wider truncate">${window.escapeHTML(item.name)}</h3>
                                        ${createRecipeHTMLForDetail(item.recipe)}
                                    </div>
                                    <div class="flex flex-wrap gap-1.5">${createBadgesHTML(item.stats)}</div>
                                    <p class="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase truncate font-medium">${(item.description || item.info || '').replace(/\n/g, ' ')}</p>
                                </div>
                            </div>`;
                    } else {
                        const borderClass = isRadiant ? 'border-premium-gold' : 'border-zinc-300 dark:border-premium-border';
                        let recipeSection = '';
                        if (item.recipe && item.recipe.length === 2) {
                            recipeSection = `
                                <div class="grid grid-cols-2 gap-1 w-full mt-2">
                                    <img src="${item.recipe[0].image}" class="w-full aspect-square rounded-lg border border-zinc-600 object-cover bg-black" loading="lazy" ${onErrorFallback}>
                                    <img src="${item.recipe[1].image}" class="w-full aspect-square rounded-lg border border-zinc-600 object-cover bg-black" loading="lazy" ${onErrorFallback}>
                                </div>
                            `;
                        }
                        return `
                            <div class="flex flex-col p-2 bg-white dark:bg-premium-card border-[1.5px] ${borderClass} cursor-pointer transition-transform hover:scale-105 rounded-2xl group" onclick="window.openItemModal(${currentIndex})">
                                <img src="${item.image}" alt="${window.escapeHTML(item.name)}" class="w-full aspect-square object-cover bg-black rounded-xl" loading="lazy" ${onErrorFallback}>
                                ${recipeSection}
                            </div>
                        `;
                    }
                }).join('');

                categoryHTML += itemsHTML + `</div></div>`;
                listContainer.innerHTML += categoryHTML;
            }

            viewIcon.className = isDetailedView ? "fa-solid fa-border-all" : "fa-solid fa-list";
            if (listContainer.innerHTML === '') listContainer.innerHTML = '<div class="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">TRỐNG</div>';
        };

        const searchInp = document.getElementById('search-item');
        const clearBtn = document.getElementById('clear-search-btn');
        searchInp.addEventListener('input', window.debounce((e) => { searchQuery = e.target.value; clearBtn.classList.toggle('hidden', searchQuery.length === 0); renderItems(); }, 300));
        clearBtn.addEventListener('click', () => { searchInp.value = ''; searchQuery = ''; clearBtn.classList.add('hidden'); searchInp.focus(); renderItems(); });
        document.getElementById('toggle-view-btn').addEventListener('click', () => { isDetailedView = !isDetailedView; renderItems(); });

        document.querySelectorAll('.filter-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedCat = e.currentTarget.dataset.cat;
                activeCategory = (activeCategory === clickedCat && clickedCat !== 'all') ? 'all' : clickedCat;
                document.querySelectorAll('.filter-item-btn').forEach(b => {
                    if (b.dataset.cat === activeCategory) {
                        b.className = "filter-item-btn shrink-0 px-5 py-2.5 rounded-full bg-premium-gold border border-premium-gold text-black font-black text-[10px] uppercase transition-colors outline-none";
                    } else {
                        b.className = "filter-item-btn shrink-0 px-5 py-2.5 rounded-full bg-white dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase hover:border-premium-gold/50 hover:bg-zinc-100 dark:hover:bg-premium-card transition-colors outline-none";
                    }
                });
                updateFilterIndicator(); renderItems();
            });
        });

        renderItems();
    } catch (error) {
        gridContainer.innerHTML = `<div class="p-5 text-center text-red-500 text-xs font-bold uppercase tracking-widest border border-red-900 bg-[#121212] rounded-2xl">LỖI TRANG BỊ: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// TỘC HỆ (ORIGIN & TRAITS)
// ---------------------------------------------------------
async function loadOriginData() {
    const gridContainer = document.getElementById('grid-origin-synergies');
    if (!gridContainer) return;
    try {
        const origins = await window.fetchCached('./asset/data/origin.json');
        gridContainer.innerHTML = '';
        gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full";

        let originsHTML = origins.map(origin => {
            const validChampions = origin.champions ? origin.champions.filter(champ => champ.name !== origin.traitName) : [];
            let championsHTML = validChampions.map(champ => `
                <div class="flex flex-col items-center w-[48px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onclick="event.stopPropagation(); uiAlert('TƯỚNG', '<span class=\\'text-premium-gold font-black text-xl uppercase tracking-wider\\'>${window.escapeJS(champ.name)}</span>')">
                    <img src="${champ.icon}" class="w-12 h-12 rounded-xl border-[1.5px] border-zinc-300 dark:border-zinc-700 object-cover bg-black" onerror="this.src='/Asset/logo/logo.png'">
                    <span class="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold uppercase text-center w-full truncate mt-2 tracking-wider">${window.escapeHTML(champ.name)}</span>
                </div>
            `).join('');

            let statsHTML = origin.stats ? origin.stats.map(stat => `
                <div class="flex items-start gap-3">
                    <span class="shrink-0 min-w-[24px] px-1.5 py-1 bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border text-premium-gold text-[10px] font-black text-center mt-0.5 rounded-full">${stat.count}</span>
                    <p class="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed uppercase tracking-wide font-medium">${stat.effect}</p>
                </div>
            `).join('') : '';

            return `
                <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl block h-full transition-colors hover:border-premium-gold/50 cursor-pointer overflow-hidden group" onclick="toggleCard(this)">
                    <div class="p-5 flex items-center gap-4 border-b border-zinc-200 dark:border-premium-border bg-zinc-50 dark:bg-[#0a0a0a] transition-colors">
                        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border flex items-center justify-center shrink-0 transition-colors">
                            <div class="w-6 h-6 bg-premium-gold" style="-webkit-mask-image: url('${origin.traitIcon}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('${origin.traitIcon}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center;"></div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider leading-tight">${origin.traitName}</h3>
                            <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">ORIGIN</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-premium-surface flex items-center justify-center border border-zinc-200 dark:border-premium-border group-hover:bg-premium-gold group-hover:text-black group-hover:border-premium-gold transition-colors">
                            <i class="fa-solid fa-chevron-down expand-chevron text-zinc-500 group-hover:text-black text-xs transition-transform duration-300"></i>
                        </div>
                    </div>
                    <div class="card-expandable-body p-6 flex flex-col gap-5 bg-transparent">
                        ${origin.description ? `<p class="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wide leading-relaxed">${origin.description}</p>` : ''}
                        ${statsHTML ? `<div class="flex flex-col gap-4 pt-4 border-t border-zinc-200 dark:border-premium-border">${statsHTML}</div>` : ''}
                    </div>
                    <div class="p-5 bg-zinc-50 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-premium-border" onclick="event.stopPropagation();">
                        <div class="flex flex-wrap items-start justify-between gap-y-4">${championsHTML}<div class="w-[48px] h-0"></div><div class="w-[48px] h-0"></div><div class="w-[48px] h-0"></div></div>
                    </div>
                </div>
            `;
        }).join('');
        gridContainer.innerHTML = originsHTML;
    } catch (error) {
        gridContainer.innerHTML = `<div class="col-span-full text-center py-10 text-red-500 text-xs font-bold uppercase tracking-widest bg-[#121212] rounded-2xl border border-red-900">Lỗi Origin: ${error.message}</div>`;
    }
}

async function loadTraitsData() {
    const gridContainer = document.getElementById('grid-traits');
    if (!gridContainer) return;

    try {
        const [traitsData, champsData, itemsData, buildsDataRaw] = await Promise.all([
            window.fetchCached('./asset/data/traits.json'),
            window.fetchCached('./asset/data/champions.json'),
            window.fetchCached('./asset/data/items.json'),
            window.fetchCached('./asset/data/champion_builds.json').catch(() => null)
        ]);

        const buildsData = buildsDataRaw || [];

        const masterChamps = {}; champsData.forEach(champ => { masterChamps[champ.name.toLowerCase().trim()] = champ; });
        const masterItems = {}; for (const itemArray of Object.values(itemsData)) { if (Array.isArray(itemArray)) itemArray.forEach(item => { masterItems[item.name.toLowerCase().trim()] = item; }); }

        const normalizeBuildName = (name) => name ? name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : '';
        window._masterBuildsForTraits = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const combinedBuilds = [...(b.bestBuilds || []), ...(b.builds || [])];
                const validBuilds = combinedBuilds.filter(build => build.items && build.items.length > 0).slice(0, 5);
                if (validBuilds.length > 0) window._masterBuildsForTraits[normalizeBuildName(b.unit)] = validBuilds;
            });
        }

        const cleanName = (rawName) => rawName ? rawName.replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
        const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

        window.toggleTraitDetails = (headerElement) => {
            const card = headerElement.closest('.group');
            const detailsWrapper = card.querySelector('.trait-details');
            const chevronIcon = card.querySelector('.expand-icon');
            if (detailsWrapper.classList.contains('hidden')) {
                detailsWrapper.classList.remove('hidden'); chevronIcon.classList.add('rotate-180'); card.classList.add('border-premium-gold/50');
            } else {
                detailsWrapper.classList.add('hidden'); chevronIcon.classList.remove('rotate-180'); card.classList.remove('border-premium-gold/50');
            }
        };

        gridContainer.innerHTML = `
            <div class="flex flex-col relative pb-32 min-h-screen w-full">
                <div id="trait-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-4"></div>
                <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col gap-2.5 pointer-events-none">
                    <div class="w-full bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-full flex items-center px-5 py-3 pointer-events-auto hover:border-premium-gold/50 transition-colors relative shadow-lg">
                        <i class="fa-solid fa-magnifying-glass text-zinc-400 text-sm"></i>
                        <input type="text" id="search-trait" placeholder="TÌM TỘC/HỆ..." class="w-full bg-transparent border-none text-zinc-800 dark:text-white text-[13px] font-bold ml-3 focus:outline-none uppercase tracking-wider placeholder:text-zinc-500">
                        <button id="clear-search-trait" class="absolute right-5 hidden text-zinc-400 hover:text-premium-gold outline-none"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>
                </div>
            </div>
        `;

        const renderTraits = (searchQuery = '') => {
            const listContainer = document.getElementById('trait-list-container');
            listContainer.innerHTML = '';

            const filteredTraits = traitsData.filter(t =>
                t.trait_name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (filteredTraits.length === 0) {
                listContainer.innerHTML = `<div class="col-span-full py-20 text-center text-zinc-500 text-xs font-bold tracking-widest uppercase">KHÔNG TÌM THẤY TỘC/HỆ.</div>`;
                return;
            }

            listContainer.innerHTML = filteredTraits.map(trait => {
                let levelsHTML = trait.levels ? trait.levels.map(lvl => `
                    <div class="flex items-start gap-3">
                        <span class="bg-zinc-100 dark:bg-premium-surface text-premium-gold font-black text-[11px] min-w-[26px] text-center py-1.5 rounded-full border border-zinc-200 dark:border-premium-border mt-0.5">${lvl.milestone}</span>
                        <p class="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold uppercase leading-relaxed tracking-wide">${lvl.description.replace(/\n/g, '<br>')}</p>
                    </div>
                `).join('') : '';

                let heroesHTML = trait.heroes ? trait.heroes.map(heroObj => masterChamps[heroObj.name.toLowerCase()]).filter(c => c).sort((a, b) => a.cost - b.cost).map(hero => {
                    let borderColor = 'border-zinc-400 dark:border-zinc-600'; let badgeBg = 'bg-zinc-500 dark:bg-zinc-700 text-white';
                    if (hero.cost === 2) { borderColor = 'border-emerald-500'; badgeBg = 'bg-emerald-500 dark:bg-emerald-600 text-white'; }
                    if (hero.cost === 3) { borderColor = 'border-blue-500'; badgeBg = 'bg-blue-500 dark:bg-blue-600 text-white'; }
                    if (hero.cost === 4) { borderColor = 'border-purple-500'; badgeBg = 'bg-purple-500 dark:bg-purple-600 text-white'; }
                    if (hero.cost === 5) { borderColor = 'border-premium-gold'; badgeBg = 'bg-premium-gold text-black'; }
                    return `
                        <div class="flex flex-col items-center w-12 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onclick="event.stopPropagation(); window.openChampModalFromComp('${window.escapeJS(hero.name)}')">
                            <div class="relative w-full aspect-square border-[1.5px] ${borderColor} bg-black rounded-xl overflow-hidden">
                                <img src="${hero.image}" class="w-full h-full object-cover object-[80%]" loading="lazy" ${onErrorFallback}>
                                <div class="absolute bottom-0 right-0 ${badgeBg} text-[9px] font-black px-1.5 py-0.5 leading-none rounded-tl-xl">${hero.cost}</div>
                            </div>
                            <span class="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold uppercase truncate w-full text-center mt-1.5 tracking-wider">${hero.name}</span>
                        </div>
                    `;
                }).join('') : '';

                const traitIconHTML = trait.icon_file ? `<div class="w-6 h-6 bg-premium-gold" style="-webkit-mask-image: url('${trait.icon_file}'); mask-image: url('${trait.icon_file}'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>` : `<i class="fa-solid fa-shapes text-premium-gold text-lg"></i>`;

                return `
                    <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border hover:border-premium-gold/50 rounded-3xl p-5 flex flex-col gap-3 transition-colors duration-300 group relative w-full">                                
                        <div class="relative flex items-center justify-between cursor-pointer outline-none" onclick="window.toggleTraitDetails(this)">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-zinc-100 dark:bg-premium-surface border border-zinc-200 dark:border-premium-border flex items-center justify-center shrink-0 rounded-2xl group-hover:border-premium-gold/50 transition-colors">
                                    ${traitIconHTML}
                                </div>
                                <h3 class="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">${window.escapeHTML(trait.trait_name)}</h3>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-premium-surface flex items-center justify-center border border-zinc-200 dark:border-premium-border group-hover:bg-premium-gold group-hover:text-black group-hover:border-premium-gold transition-colors">
                                <i class="fa-solid fa-chevron-down text-zinc-500 group-hover:text-black text-sm expand-icon transition-transform duration-300"></i>
                            </div>
                        </div>
                        
                        ${heroesHTML ? `<div class="mt-4 w-full"><div class="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2.5">${heroesHTML}</div></div>` : ''}

                        <div class="trait-details hidden w-full mt-5 pt-5 border-t border-zinc-200 dark:border-premium-border">
                            ${trait.description ? `<p class="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wide leading-relaxed mb-5">${trait.description.replace(/\n/g, '<br>')}</p>` : ''}
                            ${levelsHTML ? `<div class="flex flex-col gap-4 bg-zinc-50 dark:bg-[#0a0a0a] p-5 border border-zinc-200 dark:border-premium-border rounded-2xl">${levelsHTML}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        };

        const searchInput = document.getElementById('search-trait');
        const clearBtn = document.getElementById('clear-search-trait');
        searchInput.addEventListener('input', window.debounce((e) => { clearBtn.classList.toggle('hidden', e.target.value.length === 0); renderTraits(e.target.value); }, 300));
        clearBtn.addEventListener('click', () => { searchInput.value = ''; clearBtn.classList.add('hidden'); searchInput.focus(); renderTraits(''); });
        renderTraits();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-5 text-center text-red-500 text-xs font-bold uppercase tracking-widest border border-red-900 bg-[#121212] rounded-2xl">LỖI TỘC HỆ: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// QUẢN LÝ (ADMIN)
// ---------------------------------------------------------
async function loadAdminData() {
    const container = document.getElementById('grid-admin');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col relative min-h-[60vh] w-full pt-6">
            <div id="admin-auth-section" class="w-full max-w-sm mx-auto bg-white dark:bg-premium-card p-8 border border-zinc-200 dark:border-premium-border hidden flex-col gap-6 rounded-3xl">
                <h2 class="text-base font-black text-premium-gold text-center uppercase tracking-widest border-b border-zinc-200 dark:border-premium-border pb-4">XÁC THỰC QUẢN TRỊ</h2>
                <input type="email" id="admin-email" placeholder="EMAIL..." class="w-full px-5 py-3.5 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-white outline-none focus:border-premium-gold rounded-xl transition-colors">
                <input type="password" id="admin-pw" placeholder="MẬT KHẨU..." class="w-full px-5 py-3.5 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-white outline-none focus:border-premium-gold rounded-xl transition-colors">
                <button onclick="window.adminLogin()" id="btn-admin-login" class="w-full py-4 bg-premium-gold text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors outline-none mt-2">ĐĂNG NHẬP</button>
            </div>

            <div id="admin-dashboard-section" class="w-full hidden flex-col gap-5 max-w-5xl mx-auto">
                <div class="flex justify-between items-center bg-white dark:bg-premium-card p-5 border border-zinc-200 dark:border-premium-border rounded-2xl">
                    <span class="font-black text-base text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3"><i class="fa-solid fa-shield-halved text-premium-gold text-xl"></i> QUẢN LÝ CỘNG ĐỒNG</span>
                    <button onclick="window.adminLogout()" class="px-5 py-2.5 bg-zinc-100 dark:bg-premium-surface text-red-500 hover:border-red-500 hover:bg-red-500/10 border border-zinc-200 dark:border-premium-border rounded-full text-[11px] font-black uppercase transition-colors outline-none">THOÁT</button>
                </div>
                <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-3xl p-2 overflow-hidden">
                    <div class="grid grid-cols-12 gap-3 p-4 border-b border-zinc-200 dark:border-premium-border text-[10px] font-black text-premium-gold uppercase tracking-widest bg-zinc-50 dark:bg-[#0a0a0a] rounded-t-2xl">
                        <div class="col-span-6 sm:col-span-5">ĐỘI HÌNH</div>
                        <div class="col-span-4 sm:col-span-3 text-center">MÃ CLOUD</div>
                        <div class="hidden sm:block sm:col-span-3 text-right">NGÀY TẠO</div>
                        <div class="col-span-2 sm:col-span-1 text-center">XÓA</div>
                    </div>
                    <div id="admin-comps-list" class="flex flex-col max-h-[65vh] overflow-y-auto no-scrollbar pb-2"></div>
                </div>
            </div>
        </div>
    `;

    const authSection = document.getElementById('admin-auth-section');
    const dashSection = document.getElementById('admin-dashboard-section');
    const compsList = document.getElementById('admin-comps-list');

    window._onAuthStateChanged(window._auth, (user) => {
        if (user) {
            authSection.classList.replace('flex', 'hidden');
            dashSection.classList.replace('hidden', 'flex');
            window.fetchAdminComps();
        } else {
            authSection.classList.replace('hidden', 'flex');
            dashSection.classList.replace('flex', 'hidden');
            compsList.innerHTML = '';
        }
    });

    window.adminLogin = async () => {
        const email = document.getElementById('admin-email').value;
        const pw = document.getElementById('admin-pw').value;
        const btn = document.getElementById('btn-admin-login');
        if (!email || !pw) return uiAlert('LỖI', 'Vui lòng nhập đủ thông tin!', 'error');

        btn.disabled = true; btn.innerHTML = 'ĐANG XỬ LÝ...';
        try {
            await window._signIn(window._auth, email, pw);
            document.getElementById('admin-pw').value = '';
        } catch (e) { uiAlert('LỖI', 'Sai tài khoản hoặc mật khẩu.', 'error'); }
        btn.disabled = false; btn.innerText = 'ĐĂNG NHẬP';
    };

    window.adminLogout = async () => uiConfirm('ĐĂNG XUẤT', 'Thoát quyền quản trị?', async () => { await window._signOut(window._auth); });

    window.fetchAdminComps = async () => {
        compsList.innerHTML = '<div class="py-16 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest">ĐANG LẤY DỮ LIỆU...</div>';
        try {
            const q = window._fsQuery(window._fsCol(window._db, "shared_comps"), window._fsOrderBy("createdAt", "desc"));
            const snap = await window._fsGetDocs(q);
            let html = '';

            snap.forEach(doc => {
                const data = doc.data();
                const date = new Date(data.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const title = data.CompTitle || 'TỰ TẠO';
                const code = data.shareCode || 'Unknown';

                html += `
                    <div class="grid grid-cols-12 gap-3 items-center p-4 border-b border-zinc-100 dark:border-premium-border hover:bg-zinc-50 dark:hover:bg-premium-surface transition-colors">
                        <div class="col-span-6 sm:col-span-5 flex flex-col min-w-0 pr-3">
                            <span class="text-[13px] font-black text-zinc-800 dark:text-white truncate uppercase tracking-wide">${window.escapeHTML(title)}</span>
                            <span class="text-[10px] text-zinc-500 sm:hidden block mt-1 font-mono font-bold">${date}</span>
                        </div>
                        <div class="col-span-4 sm:col-span-3 text-center">
                            <span class="bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border px-3 py-1.5 rounded-full text-premium-gold font-mono font-bold text-[10px] select-all uppercase block truncate">${window.escapeHTML(code)}</span>
                        </div>
                        <div class="hidden sm:block sm:col-span-3 text-right">
                            <span class="text-[11px] text-zinc-500 font-mono font-bold">${date}</span>
                        </div>
                        <div class="col-span-2 sm:col-span-1 flex justify-center">
                            <button onclick="window.deleteAdminComp('${doc.id}', '${window.escapeJS(title)}')" class="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-premium-surface text-red-500 border border-zinc-200 dark:border-premium-border hover:border-red-500 hover:bg-red-500/10 transition-colors outline-none"><i class="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                `;
            });
            compsList.innerHTML = html || '<div class="py-16 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest">TRỐNG</div>';
        } catch (e) { compsList.innerHTML = '<div class="py-16 text-center text-red-500 font-bold uppercase text-xs tracking-widest">LỖI KẾT NỐI!</div>'; }
    };

    window.deleteAdminComp = (docId, title) => {
        uiConfirm('XÓA', `Xóa đội hình: <span class="text-red-500">${title}</span>?`, async () => {
            try {
                await window._fsDeleteDoc(window._fsDoc(window._db, "shared_comps", docId));
                window.fetchAdminComps();
            } catch (e) { uiAlert('LỖI', 'Không thể xóa.', 'error'); }
        });
    };
}

// ---------------------------------------------------------
// ỦNG HỘ (DONATE)
// ---------------------------------------------------------
function loadDonateData() {
    const container = document.getElementById('grid-donate');
    if (!container) return;

    const donateConfig = {
        cash: [
            { id: 'momo', name: 'MOMO', owner: 'ĐINH MẠNH HÙNG', number: '99MM24030M09540726', qr: './Asset/QR/QR-VietQR-BVBank.png', color: 'border-premium-gold', icon: 'fa-qrcode' }
        ],
        love: [
            { id: 'facebook', name: 'FACEBOOK', owner: 'Đinh Mạnh Hùng', number: 'fb.com/hung.dinh', qr: './Asset/QR/fb_qr.png', color: 'border-blue-500', icon: 'fa-facebook-f', isLink: true, link: 'https://www.facebook.com/mhung.site/' }
        ]
    };

    const renderSection = (title, data) => {
        const itemsHTML = data.map(item => {
            const actionAttr = item.isLink ? `onclick="window.open('${item.link}', '_blank')"` : `onclick="window.copyDonateText('${item.number}', 'btn-${item.id}')"`;
            return `
                <div class="bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border p-8 flex flex-col items-center text-center transition-colors duration-300 hover:border-premium-gold/50 rounded-3xl w-full group relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-premium-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <h3 class="font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-1.5 text-base relative z-10">${item.name}</h3>
                    <p class="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-6 relative z-10">${item.owner}</p>
                    <div class="w-56 h-56 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-premium-border p-3 rounded-2xl mb-8 relative z-10 transition-transform group-hover:scale-105 duration-300">
                        <img src="${item.qr}" class="w-full h-full object-contain rounded-xl bg-white" alt="QR" onerror="this.src='/Asset/logo/logo.png'">
                    </div>
                    <button id="btn-${item.id}" ${actionAttr} class="w-full max-w-[240px] py-3.5 bg-zinc-100 dark:bg-premium-surface text-zinc-800 dark:text-white border border-zinc-200 dark:border-premium-border text-[11px] font-black uppercase tracking-widest hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-colors outline-none rounded-full relative z-10">
                        ${item.isLink ? 'THEO DÕI' : item.number}
                    </button>
                </div>
            `;
        }).join('');
        return `<div class="flex flex-col gap-5"><h2 class="text-[13px] font-black text-premium-gold uppercase tracking-widest border-b border-zinc-200 dark:border-premium-border pb-3 pl-2">${title}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${itemsHTML}</div></div>`;
    };

    container.innerHTML = `
        <div class="max-w-4xl mx-auto py-8 px-2 flex flex-col gap-12">
            <div class="text-center space-y-5 border-b border-zinc-200 dark:border-premium-border pb-10">
                <div class="w-20 h-20 mx-auto bg-premium-gold/10 border border-premium-gold/20 rounded-full flex items-center justify-center mb-4">
                    <i class="fa-solid fa-heart text-4xl text-premium-gold"></i>
                </div>
                <h2 class="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-widest">CẢM ƠN SỰ ĐỒNG HÀNH CỦA BẠN</h2>
                <p class="text-xs md:text-sm text-zinc-500 uppercase font-bold tracking-wider max-w-lg mx-auto leading-relaxed">MỌI SỰ ỦNG HỘ DÙ LÀ HIỆN KIM HAY TÌNH CẢM ĐỀU LÀ ĐỘNG LỰC TO LỚN ĐỂ PHÁT TRIỂN DỰ ÁN.</p>
            </div>
            ${renderSection('HIỆN KIM', donateConfig.cash)}
            ${renderSection('TÌNH CẢM', donateConfig.love)}
        </div>
    `;
}

window.copyDonateText = (text, btnId) => {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(btnId);
        const oldHTML = btn.innerHTML;
        btn.classList.add('bg-premium-gold', 'border-premium-gold', 'text-black');
        btn.innerHTML = 'ĐÃ SAO CHÉP';
        setTimeout(() => {
            btn.classList.remove('bg-premium-gold', 'border-premium-gold', 'text-black');
            btn.innerHTML = oldHTML;
        }, 2000);
    });
};