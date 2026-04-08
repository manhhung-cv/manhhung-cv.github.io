// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ gods.json
// ---------------------------------------------------------
async function loadGodsData() {
    const gridContainer = document.getElementById('grid-gods');
    if (!gridContainer) return;

    try {
        const response = await fetch('./asset/data/gods.json');
        if (!response.ok) throw new Error('Không tìm thấy file gods.json');

        const godsData = await response.json();

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
        gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16 w-full";

        const onErrorFallback = `onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='";`;

        let godsHTML = '';
        godsData.forEach(god => {
            let tagsHTML = '';
            if (god.tags && Array.isArray(god.tags) && god.tags.length > 0) {
                tagsHTML = god.tags.map(tag =>
                    `<span class="px-2 py-[3px] rounded-md border border-premium-accent/50 bg-premium-accent/20 text-premium-accent text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                                ${tag}
                            </span>`
                ).join('');
            }

            let bestForHTML = '';
            if (god.best_for) {
                bestForHTML = `
                            <div class="mb-4 p-3 rounded-xl bg-sky-900/20 border border-sky-500/20 flex items-start gap-2.5 shadow-inner">
                                <i class="fa-solid fa-lightbulb text-sky-400 text-[13px] mt-0.5 drop-shadow-md"></i>
                                <p class="text-[11px] text-sky-100/90 leading-relaxed">
                                    <span class="text-sky-300 font-bold uppercase text-[9.5px] tracking-widest mr-1">Lời khuyên:</span>
                                    ${god.best_for}
                                </p>
                            </div>
                        `;
            }

            let stagesHTML = '';
            if (god.stages && Array.isArray(god.stages)) {
                stagesHTML = god.stages.map(stage => {
                    const isFinalStage = stage.stage_label.includes('4-7');

                    let perksHTML = '';
                    if (stage.perks && Array.isArray(stage.perks)) {
                        perksHTML = stage.perks.map(perk => `
                                    <div class="bg-slate-100 dark:bg-black/40 p-2.5 rounded-lg border ${isFinalStage ? 'border-yellow-500/20' : 'border-white/5'} shadow-inner mb-2 last:mb-0">
                                        <h4 class="text-[11px] font-bold ${isFinalStage ? 'text-yellow-600 dark:text-yellow-400' : 'text-yellow-700 dark:text-premium-gold'} drop-shadow-sm">${perk.title}</h4>
                                        ${perk.description ? `<p class="text-[10.5px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">${perk.description.replace(/\n/g, '<br>')}</p>` : ''}
                                    </div>
                                `).join('');
                    }

                    if (isFinalStage) {
                        return `
                                    <div class="mt-3 p-3 bg-gradient-to-r from-premium-gold/15 to-transparent border-l-2 border-premium-gold rounded-r-xl shadow-sm">
                                        <div class="text-[10px] font-black text-premium-gold uppercase mb-2 flex items-center gap-1.5 drop-shadow-md">
                                            <i class="fa-solid fa-bolt text-yellow-400"></i> ${stage.stage_label}
                                        </div>
                                        ${perksHTML}
                                    </div>
                                `;
                    } else {
                        return `
                                    <div class="bg-slate-100 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-300 dark:border-white/5 mb-3 last:mb-0 shadow-sm">
                                        <div class="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
                                            <i class="fa-solid fa-play text-[8px] text-slate-500"></i> ${stage.stage_label}
                                        </div>
                                        <div class="flex flex-col">
                                            ${perksHTML}
                                        </div>
                                    </div>
                                `;
                    }
                }).join('');
            }

            const cardHTML = `
                        <div class="bg-white dark:bg-premium-card rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200 dark:ring-white/10 hover:ring-premium-gold/30 transition-all duration-300 flex flex-col group">
                            <div class="relative h-[180px] w-full overflow-hidden shrink-0">
                                <img src="${god.avatar}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="${window.escapeHTML(god.name)}" loading="lazy" ${onErrorFallback}>
                                <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-16"></div>
                                <div class="absolute bottom-0 w-full bg-gradient-to-t from-[#090d14] via-[#090d14]/90 to-transparent h-[130px]"></div>
                                <div class="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-premium-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                <div class="absolute top-3 left-3 z-10 pointer-events-none">
                                    <span class="text-[9.5px] font-black text-premium-gold uppercase tracking-widest drop-shadow-md bg-black/60 px-2.5 py-1.5 rounded-lg border border-premium-gold/30 backdrop-blur-sm">
                                        <i class="fa-solid fa-crown mr-1"></i> ${god.sub_title}
                                    </span>
                                </div>

                                <div class="absolute bottom-3 left-4 flex flex-col gap-1.5 z-10 pointer-events-none pr-12">
                                    <h3 class="text-[28px] font-black text-white drop-shadow-lg tracking-tight group-hover:text-premium-gold transition-colors duration-300 leading-none">${window.escapeHTML(god.name)}</h3>
                                    ${tagsHTML ? `<div class="flex flex-wrap gap-1.5 mt-0.5">${tagsHTML}</div>` : ''}
                                </div>

                                <div class="absolute bottom-3 right-4 z-20 cursor-pointer outline-none" onclick="window.toggleGodCard(this.closest('.group'))">
                                    <div class="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-premium-gold/30 hover:border-premium-gold/80 transition-colors shadow-lg">
                                        <i class="fa-solid fa-chevron-down expand-chevron text-slate-300 text-sm drop-shadow transition-transform duration-300"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="god-details hidden bg-slate-50 dark:bg-[#090d14] border-t border-slate-200 dark:border-white/5 transition-colors">
                                <div class="p-4 flex flex-col">
                                    ${bestForHTML}
                                    ${stagesHTML ? stagesHTML : '<p class="text-[11px] text-slate-500 text-center italic">Không có dữ liệu giai đoạn.</p>'}
                                </div>
                            </div>
                        </div>
                    `;
            godsHTML += cardHTML;
        });

        gridContainer.innerHTML = godsHTML;

    } catch (error) {
        gridContainer.innerHTML = `<div class="col-span-full text-center py-8 text-red-400 text-sm border border-red-900/50 bg-red-900/10 rounded-xl">Lỗi tải dữ liệu Thần: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ origin.json
// ---------------------------------------------------------
async function loadOriginData() {
    const gridContainer = document.getElementById('grid-origin-synergies');
    if (!gridContainer) return;

    try {
        const response = await fetch('./asset/data/origin.json');
        if (!response.ok) throw new Error('Không tìm thấy file origin.json');

        const origins = await response.json();
        gridContainer.innerHTML = '';
        gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start w-full";

        let originsHTML = '';
        origins.forEach(origin => {
            const validChampions = origin.champions ? origin.champions.filter(champ => champ.name !== origin.traitName) : [];
            let championsHTML = '';

            if (validChampions.length > 0) {
                championsHTML = validChampions.map(champ => {
                    return `
                                <div class="flex flex-col items-center w-[46px] flex-shrink-0 cursor-pointer group" 
                                     onclick="event.stopPropagation(); uiAlert('Thông tin Tướng', '<span class=\\'text-premium-gold font-bold\\'>${window.escapeJS(champ.name)}</span>')">
                                    <img src="${champ.icon}" alt="${window.escapeHTML(champ.name)}" 
                                         class="w-10 h-10 rounded-[10px] border border-slate-300 dark:border-slate-600 object-cover bg-black shadow-sm group-hover:scale-105 group-hover:border-slate-400 transition-all">
                                    <span class="text-[8.5px] text-slate-500 dark:text-slate-400 font-medium text-center w-full truncate mt-1 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                                        ${window.escapeHTML(champ.name)}
                                    </span>
                                </div>
                            `;
                }).join('');
            }

            let statsHTML = '';
            if (origin.stats && origin.stats.length > 0) {
                statsHTML = origin.stats.map(stat => {
                    return `
                                <div class="flex items-start gap-2">
                                    <span class="shrink-0 min-w-[20px] px-1 py-0.5 rounded bg-premium-gold/10 border border-premium-gold/30 text-premium-gold text-[9px] font-bold text-center mt-0.5">
                                        ${stat.count}
                                    </span>
                                    <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">${stat.effect}</p>
                                </div>
                            `;
                }).join('');
            }

            const cardHTML = `
                        <div class="bg-white dark:bg-premium-card border border-slate-200 dark:border-premium-border rounded-xl overflow-hidden block h-full shadow-lg transition-colors hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
                             onclick="toggleCard(this)">
                            
                            <div class="p-3.5 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-gradient-to-r dark:from-white/[0.03] dark:to-transparent transition-colors">
                                <div class="w-10 h-10 flex items-center justify-center shrink-0">
                                    <div class="w-full h-full bg-premium-gold" 
                                         style="-webkit-mask-image: url('${origin.traitIcon}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('${origin.traitIcon}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center;">
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-base font-bold text-slate-800 dark:text-white leading-tight transition-colors">${origin.traitName}</h3>
                                    <p class="text-[9px] font-semibold text-premium-accent uppercase tracking-wider">Origin</p>
                                </div>
                                <i class="fa-solid fa-chevron-down expand-chevron text-slate-400 dark:text-slate-600 text-sm p-1"></i>
                            </div>
                            
                            <div class="card-expandable-body p-3.5 flex flex-col gap-3 bg-white dark:bg-transparent">
                                ${origin.description ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">"${origin.description}"</p>` : ''}
                                ${statsHTML ? `<div class="flex flex-col gap-2 pt-1">${statsHTML}</div>` : ''}
                            </div>

                            <div class="p-3 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/5 transition-colors" onclick="event.stopPropagation();">
                                <div class="flex flex-wrap items-start justify-between gap-y-3">
                                    ${championsHTML}
                                    <div class="w-[46px] h-0"></div><div class="w-[46px] h-0"></div><div class="w-[46px] h-0"></div><div class="w-[46px] h-0"></div><div class="w-[46px] h-0"></div>
                                </div>
                            </div>
                        </div>
                    `;
            originsHTML += cardHTML;
        });
        gridContainer.innerHTML = originsHTML;

    } catch (error) {
        gridContainer.innerHTML = `<div class="col-span-full text-center py-8 text-red-400 text-sm">Lỗi tải dữ liệu Origin. ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ traits.json (TÍCH HỢP MODAL TƯỚNG FULL CHI TIẾT)
// ---------------------------------------------------------
async function loadTraitsData() {
    const gridContainer = document.getElementById('grid-traits');
    if (!gridContainer) return;

    try {
        // 1. TẢI FULL 4 FILE DỮ LIỆU ĐỂ HỖ TRỢ MODAL TƯỚNG
        const [resTraits, resChamps, resItems, resBuilds] = await Promise.all([
            fetch('./asset/data/traits.json'),
            fetch('./asset/data/champions.json'),
            fetch('./asset/data/items.json'),
            fetch('./asset/data/champion_builds.json').catch(() => null)
        ]);

        if (!resTraits.ok || !resChamps.ok || !resItems.ok) {
            throw new Error('Không tìm thấy file dữ liệu Tộc Hệ, Tướng hoặc Trang bị.');
        }

        const traitsData = await resTraits.json();
        const champsData = await resChamps.json();
        const itemsData = await resItems.json();
        const buildsData = resBuilds && resBuilds.ok ? await resBuilds.json() : [];

        // 2. MAP DỮ LIỆU TƯỚNG & TRANG BỊ
        const masterChamps = {};
        champsData.forEach(champ => {
            masterChamps[champ.name.toLowerCase().trim()] = champ;
        });

        const masterItems = {};
        for (const itemArray of Object.values(itemsData)) {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => { masterItems[item.name.toLowerCase().trim()] = item; });
            }
        }

        // THÊM HÀM CHUẨN HÓA TÊN (Xóa dấu nháy, khoảng trắng, ký tự đặc biệt)
        const normalizeBuildName = (name) => {
            if (!name) return '';
            return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        };

        window._masterBuilds = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const validBuilds = b.builds.filter(build => build.items && build.items.length > 0);
                if (validBuilds.length > 0) {
                    // Ép tên trong file builds (Kaisa, TwistedFate) về dạng chuẩn (kaisa, twistedfate)
                    window._masterBuilds[normalizeBuildName(b.unit)] = validBuilds;
                }
            });
        }

        const cleanName = (rawName) => rawName ? rawName.replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
        const onErrorFallback = `onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='";`;

        const getTraitIconName = (name) => {
            if (!name) return '';
            let str = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            str = str.replace(/[^a-zA-Z0-9\s]/g, "");
            return str.split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join('');
        };

        window.toggleTraitDetails = (headerElement) => {
            const card = headerElement.closest('.group');
            const detailsWrapper = card.querySelector('.trait-details');
            const chevronIcon = card.querySelector('.expand-icon');

            if (detailsWrapper.classList.contains('hidden')) {
                detailsWrapper.classList.remove('hidden');
                chevronIcon.classList.add('rotate-180');
                card.classList.add('border-premium-gold/50');
            } else {
                detailsWrapper.classList.add('hidden');
                chevronIcon.classList.remove('rotate-180');
                card.classList.remove('border-premium-gold/50');
            }
        };

        // --- 3. HÀM MODAL TƯỚNG (GIỐNG TAB ĐỘI HÌNH) ---
        window.renderBuildTabInTrait = (champName, styleIndex) => {
            const builds = window._masterBuildsForTraits[champName];
            if (!builds || builds.length === 0) return '<p class="text-[10px] text-slate-500 text-center py-4 italic">Chưa có dữ liệu gợi ý.</p>';

            const currentBuild = builds[styleIndex];

            const itemsHTML = currentBuild.items.map(rawItemName => {
                const itemName = cleanName(rawItemName);
                const itemData = masterItems[itemName];

                if (!itemData) {
                    return `<div class="flex flex-col items-center flex-1 min-w-0 opacity-50"><div class="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1"><i class="fa-solid fa-question text-slate-400 dark:text-slate-500 text-xs"></i></div><span class="text-[8px] text-slate-500 dark:text-slate-400 font-medium truncate w-full text-center px-0.5">${rawItemName}</span></div>`;
                }

                let recipeHTML = '<div class="h-4 mt-1"></div>';
                if (itemData.recipe && itemData.recipe.length === 2) {
                    recipeHTML = `
                                <div class="flex items-center gap-[2px] mt-1 justify-center bg-slate-100 dark:bg-black/40 rounded px-1 py-0.5 border border-slate-200 dark:border-white/5">
                                    <img src="${itemData.recipe[0].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                    <i class="fa-solid fa-plus text-[5px] text-slate-400 dark:text-slate-500"></i>
                                    <img src="${itemData.recipe[1].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                </div>
                            `;
                }

                const isRadiant = itemData.name.toLowerCase().includes('ánh sáng');
                const imgBorder = isRadiant ? 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'border-slate-300 dark:border-slate-600';

                return `<div class="flex flex-col items-center flex-1 min-w-0"><img src="${itemData.image}" class="w-10 h-10 rounded-lg border-[1.5px] ${imgBorder} object-cover bg-black shadow-md mb-1" ${onErrorFallback}><span class="text-[8px] md:text-[9.5px] ${isRadiant ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300'} font-bold truncate w-full text-center px-0.5">${itemData.name}</span>${recipeHTML}</div>`;
            }).join('');

            const tabsHTML = builds.map((b, idx) => `
                        <button onclick="document.getElementById('build-content-trait').innerHTML = window.renderBuildTabInTrait('${window.escapeJS(champName)}', ${idx})" 
                                class="px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all whitespace-nowrap shadow-sm border outline-none ${idx === styleIndex ? 'bg-premium-gold text-black border-transparent shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}">
                            Cách ${idx + 1}
                        </button>
                    `).join('');

            const statsHTML = `
                        <div class="flex items-center justify-center gap-3 mb-3 px-1">
                            <span class="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-trophy"></i> Top TB: ${currentBuild.avg_place}
                            </span>
                            <span class="text-[9.5px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-chart-line"></i> Thắng: ${currentBuild.win_rate}
                            </span>
                        </div>
                    `;

            return `
                        <div class="flex flex-col gap-2.5">
                            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/5 snap-x">${tabsHTML}</div>
                            ${statsHTML}
                            <div class="flex gap-2 justify-between items-start bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">${itemsHTML}</div>
                        </div>
                    `;
        };

        window.openChampModalFromTrait = (champNameRaw) => {
            const champ = masterChamps[cleanName(champNameRaw)];
            if (!champ) return;

            let borderColor = 'border-slate-400'; let textColor = 'text-slate-500 dark:text-slate-300';
            if (champ.cost === 2) { borderColor = 'border-emerald-500'; textColor = 'text-emerald-600 dark:text-emerald-400'; }
            if (champ.cost === 3) { borderColor = 'border-blue-500'; textColor = 'text-blue-600 dark:text-blue-400'; }
            if (champ.cost === 4) { borderColor = 'border-purple-500'; textColor = 'text-purple-600 dark:text-purple-400'; }
            if (champ.cost === 5) { borderColor = 'border-yellow-500 dark:border-yellow-400'; textColor = 'text-yellow-600 dark:text-yellow-400'; }

            const titleHTML = `
                        <div class="flex items-center justify-between w-full pr-4">
                            <span class="text-slate-800 dark:text-white font-black drop-shadow-md text-[19px] tracking-tight">${window.escapeHTML(champ.name)}</span>
                            <span class="text-xs font-black ${textColor} bg-slate-100 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-1">
                                ${champ.cost} <i class="fa-solid fa-coins text-[10px]"></i>
                            </span>
                        </div>
                    `;

            const traitPills = champ.traits.map(t => {
                const iconFilename = getTraitIconName(t.name);
                return `
                            <span class="flex items-center gap-1 px-2 py-0.5 rounded border border-premium-accent/30 bg-premium-accent/10 text-premium-accent text-[9.5px] md:text-[10.5px] font-bold uppercase tracking-wider drop-shadow-md backdrop-blur-md">
                                <div class="w-3.5 h-3.5 bg-current shrink-0" 
                                     style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
                                </div>
                                ${t.name}
                            </span>
                        `;
            }).join('');

            const buildsSectionHTML = `
                        <div class="mt-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-3 shadow-lg relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premium-gold via-transparent to-transparent opacity-50"></div>
                            <div class="text-[10px] md:text-[11px] font-black text-premium-gold uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-md">
                                <i class="fa-solid fa-chart-pie"></i> Thống kê lên đồ
                            </div>
                            <div id="build-content-trait">${window.renderBuildTabInTrait(champ.name, 0)}</div>
                        </div>
                    `;

            const contentHTML = `
                        <div class="flex flex-col gap-3 mt-2 text-left">
                            <div class="w-full h-[100px] md:h-[120px] rounded-xl overflow-hidden border-2 ${borderColor} relative shadow-md">
                                <img src="${champ.image}" class="w-full h-full object-cover object-[80%]" alt="${window.escapeHTML(champ.name)}" ${onErrorFallback}>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-2 left-2 flex flex-wrap gap-1.5">${traitPills}</div>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-user-shield text-premium-accent text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vai trò</span>
                                    <span class="text-[11px] md:text-[12px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">${champ.role}</span>
                                </div>
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-crosshairs text-rose-500 dark:text-rose-400 text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tầm đánh</span>
                                    <span class="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-200">${champ.range} ô</span>
                                </div>
                            </div>
                            ${buildsSectionHTML}
                        </div>
                    `;
            uiAlert(titleHTML, contentHTML);
        };

        // --- GIAO DIỆN CHÍNH (Đưa thanh search xuống bottom) ---
        gridContainer.innerHTML = `
                    <div class="flex flex-col relative pb-32 min-h-screen w-full">
                        
                        <div id="trait-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start w-full pt-4"></div>

                        <div class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col gap-2.5 pointer-events-none">
                            <div class="w-full group bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200 dark:border-white/20 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden flex items-center pl-4 pr-2 py-2 pointer-events-auto hover:border-premium-gold/40 transition-colors relative">
                                <i class="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-premium-gold text-[13px] transition-colors drop-shadow"></i>
                                <input type="text" id="search-trait" placeholder="Tìm tộc/hệ (VD: Can Trường)..." 
                                    class="w-full bg-transparent border-none text-slate-800 dark:text-white text-[13px] ml-2.5 pr-8 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500">
                                
                                <button id="clear-search-trait" class="absolute right-4 hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex items-center justify-center outline-none">
                                    <i class="fa-solid fa-circle-xmark text-[14px]"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                `;

        const renderTraits = (searchQuery = '') => {
            const listContainer = document.getElementById('trait-list-container');
            listContainer.innerHTML = '';

            const filteredTraits = traitsData.filter(t =>
                t.trait_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (filteredTraits.length === 0) {
                listContainer.innerHTML = `
                            <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-500">
                                <i class="fa-solid fa-ghost text-4xl mb-3 opacity-20"></i>
                                <span class="text-[12px] font-medium">Không tìm thấy Tộc/Hệ phù hợp.</span>
                            </div>`;
                return;
            }

            listContainer.innerHTML = filteredTraits.map(trait => {

                let levelsHTML = '';
                if (trait.levels && trait.levels.length > 0) {
                    levelsHTML = trait.levels.map(lvl => `
                                <div class="flex items-start gap-2.5">
                                    <span class="bg-slate-200 dark:bg-black/60 text-premium-gold font-black text-[10px] min-w-[22px] text-center py-[3px] rounded border border-slate-300 dark:border-white/10 shrink-0 mt-0.5 shadow-sm">${lvl.milestone}</span>
                                    <p class="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">${lvl.description.replace(/\n/g, '<br>')}</p>
                                </div>
                            `).join('');
                }

                let heroesHTML = '';
                if (trait.heroes && trait.heroes.length > 0) {
                    let mappedHeroes = trait.heroes.map(heroObj => {
                        return masterChamps[heroObj.name.toLowerCase()];
                    }).filter(champData => champData !== undefined);

                    mappedHeroes.sort((a, b) => a.cost - b.cost);

                    heroesHTML = mappedHeroes.map(hero => {
                        let borderColor = 'border-slate-400 dark:border-slate-500'; let badgeBg = 'bg-slate-500 dark:bg-slate-700 text-white';
                        if (hero.cost === 2) { borderColor = 'border-emerald-500'; badgeBg = 'bg-emerald-500 dark:bg-emerald-600 text-white'; }
                        if (hero.cost === 3) { borderColor = 'border-blue-500'; badgeBg = 'bg-blue-500 dark:bg-blue-600 text-white'; }
                        if (hero.cost === 4) { borderColor = 'border-purple-500'; badgeBg = 'bg-purple-500 dark:bg-purple-600 text-white'; }
                        if (hero.cost === 5) { borderColor = 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'; badgeBg = 'bg-yellow-400 dark:bg-yellow-500 text-black'; }

                        return `
                                    <div class="flex flex-col items-center w-10 sm:w-11 shrink-0 cursor-pointer group/hero hover:-translate-y-1 transition-transform" 
                                         onclick="event.stopPropagation(); window.openChampModalFromTrait('${window.escapeJS(hero.name)}')" title="${hero.name}">
                                         
                                        <div class="relative w-full aspect-square rounded-lg border-[1.5px] ${borderColor} overflow-hidden shadow-md bg-black">
                                            <img src="${hero.image}" class="w-full h-full object-cover object-[80%]" loading="lazy" ${onErrorFallback}>
                                            <div class="absolute bottom-0 right-0 ${badgeBg} text-[8.5px] font-black px-1.5 py-[1px] leading-none rounded-tl-md border-t border-l border-white/20">
                                                ${hero.cost}
                                            </div>
                                        </div>

                                        <span class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate w-full text-center mt-1 group-hover/hero:text-premium-gold transition-colors drop-shadow-sm">
                                            ${hero.name}
                                        </span>
                                    </div>
                                `;
                    }).join('');
                }

                const traitIconHTML = trait.icon_file
                    ? `<div class="w-5 h-5 bg-premium-gold  group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style="-webkit-mask-image: url('${trait.icon_file}'); mask-image: url('${trait.icon_file}'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;"></div>`
                    : `<i class="fa-solid fa-shapes text-[16px] bg-current opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"></i>`;

                return `
                            <div class="bg-white dark:bg-premium-card border border-slate-200 dark:border-white/10 hover:border-premium-gold/50 dark:hover:border-premium-gold/30 rounded-2xl p-4 block transition-all duration-300 shadow-lg group relative overflow-hidden">
                                <div class="absolute -inset-10 bg-premium-gold/5 blur-3xl z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="relative flex items-center justify-between cursor-pointer z-10 outline-none" onclick="window.toggleTraitDetails(this)">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:bg-premium-gold/20 group-hover:border-premium-gold/50 transition-colors shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-premium-gold text-premium-gold">
                                            ${traitIconHTML}
                                        </div>
                                        <h3 class="text-[16px] font-black text-slate-800 dark:text-premium-gold tracking-wide drop-shadow-md uppercase">${window.escapeHTML(trait.trait_name)}</h3>
                                    </div>
                                    
                                    <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-premium-gold/20 transition-colors shadow-sm shrink-0">
                                        <i class="fa-solid fa-chevron-down text-slate-400 dark:text-slate-400 text-sm expand-icon transition-transform duration-300 group-hover:text-premium-gold"></i>
                                    </div>
                                </div>
                                
                                ${heroesHTML ? `
                                    <div class="relative mt-3 z-10">
                                        <div class="flex flex-wrap gap-2">
                                            ${heroesHTML}
                                        </div>
                                    </div>
                                ` : ''}

                                <div class="trait-details hidden relative z-10">
                                    <div class="flex flex-col gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                                        ${trait.description ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">${trait.description.replace(/\n/g, '<br>')}</p>` : ''}
                                        
                                        ${levelsHTML ? `
                                            <div class="flex flex-col gap-2 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
                                                ${levelsHTML}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
            }).join('');
        };

        const searchInput = document.getElementById('search-trait');
        const clearBtn = document.getElementById('clear-search-trait');

        searchInput.addEventListener('input', window.debounce((e) => {
            const val = e.target.value;
            clearBtn.classList.toggle('hidden', val.length === 0);
            renderTraits(val);
        }, 300));

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            searchInput.focus();
            renderTraits('');
        });

        renderTraits();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-4 text-center text-red-400 text-sm border border-red-900/50 bg-red-900/10 rounded-xl">Lỗi tải dữ liệu Tộc Hệ: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ champions.json 
// ---------------------------------------------------------
async function loadChampionsData() {
    const gridContainer = document.getElementById('grid-champions');
    if (!gridContainer) return;
    // HIỂN THỊ SKELETON LOADINGs
    gridContainer.innerHTML = `
                <div class="flex flex-col relative pb-40 min-h-screen w-full pt-4">
                    ${window.renderSkeletonGrid(16)}
                </div>
            `;
    try {
        const [resChamps, resItems, resBuilds] = await Promise.all([
            fetch('./asset/data/champions.json'),
            fetch('./asset/data/items.json'),
            fetch('./asset/data/champion_builds.json')
        ]);

        if (!resChamps.ok || !resItems.ok || !resBuilds.ok) {
            throw new Error('Không thể tải đầy đủ dữ liệu (Champions, Items, hoặc Builds).');
        }

        const champions = await resChamps.json();
        const itemsData = await resItems.json();
        const buildsData = await resBuilds.json();

        window._masterItems = {};
        for (const itemArray of Object.values(itemsData)) {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => {
                    window._masterItems[item.name] = item;
                });
            }
        }

        // ĐƯA HÀM CHUẨN HÓA LÊN WINDOW ĐỂ GỌI TỪ MỌI NƠI
        window._normalizeBuildName = (name) => {
            if (!name) return '';
            return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        };

        window._masterBuilds = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const validBuilds = b.builds.filter(build => build.items && build.items.length > 0);
                if (validBuilds.length > 0) {
                    // Gọi hàm qua window._normalizeBuildName
                    window._masterBuilds[window._normalizeBuildName(b.unit)] = validBuilds;
                }
            });
        }

        const cleanItemName = (rawName) => {
            if (!rawName) return '';
            return rawName.replace(/<[^>]+>/g, '').trim();
        };

        const getTraitIconName = (name) => {
            if (!name) return '';
            let str = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            str = str.replace(/[^a-zA-Z0-9\s]/g, "");
            return str.split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join('');
        };

        let activeCosts = new Set();
        let activeTraits = new Set();
        let searchQuery = '';
        let isDetailedView = false;

        window._currentFilteredChampsForPopup = [];

        const allTraits = [...new Set(champions.flatMap(c => c.traits.map(t => t.name)))].sort();

        const costButtonsHTML = [1, 2, 3, 4, 5].map(cost => `
                    <button class="filter-cost-btn shrink-0 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10.5px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-1 outline-none" data-cost="${cost}">
                        ${cost} <i class="fa-solid fa-coins text-[8px] opacity-70"></i>
                    </button>
                `).join('');

        const traitButtonsHTML = allTraits.map(trait => `
                    <button class="filter-trait-btn shrink-0 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10.5px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm outline-none" data-trait="${trait}">
                        ${trait}
                    </button>
                `).join('');

        // --- GIAO DIỆN CHÍNH CỦA TAB TƯỚNG KÈM POPUP BỘ LỌC ---
        gridContainer.innerHTML = `
                    <div class="flex flex-col relative pb-40 min-h-screen w-full">
                        <div id="champ-list-container" class="w-full flex flex-col gap-8 pt-4"></div>

                        <div class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                            
                            <div id="champ-filters-wrapper" class="w-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-3 left-0">
                                <div class="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent"></div>

                                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-1">
                                        <span class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md">
                                            <i class="fa-solid fa-filter text-premium-gold"></i> Tùy chỉnh Bộ lọc
                                        </span>
                                        <button id="close-filter-champ-btn" class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors pointer-events-auto outline-none">
                                            <i class="fa-solid fa-xmark text-sm"></i>
                                        </button>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lọc theo giá vàng:</span>
                                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full pb-1">
                                            ${costButtonsHTML}
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lọc theo Tộc/Hệ:</span>
                                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full pb-1">
                                            ${traitButtonsHTML}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="w-full group bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200 dark:border-white/20 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden flex items-center pl-4 pr-2 py-2 pointer-events-auto hover:border-premium-gold/40 transition-colors relative">
                                <i class="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-premium-gold text-[13px] transition-colors drop-shadow"></i>
                                <input type="text" id="search-champ" placeholder="Tìm tướng..." class="w-full bg-transparent border-none text-slate-800 dark:text-white text-[13px] ml-2.5 pr-8 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500">
                                
                                <button id="clear-search-champ" class="absolute right-[88px] hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex items-center justify-center outline-none">
                                    <i class="fa-solid fa-circle-xmark text-[14px]"></i>
                                </button>
                                
                                <div class="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                
                                <button id="toggle-view-champ" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:bg-slate-200 dark:hover:bg-white/10 outline-none mx-1 relative">
                                    <i class="fa-solid fa-list" id="view-icon-champ"></i>
                                </button>

                                <div class="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                
                                <button id="toggle-filter-champ-btn" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:bg-premium-gold hover:text-black outline-none relative">
                                    <i class="fa-solid fa-sliders text-[12px]"></i>
                                    <span id="champ-filter-indicator" class="absolute top-0 right-0 w-[9px] h-[9px] bg-rose-500 rounded-full border-[1.5px] border-white dark:border-slate-800 hidden shadow-sm"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

        // Logic ẩn hiện bộ lọc
        const toggleFilterBtn = document.getElementById('toggle-filter-champ-btn');
        const closeFilterBtn = document.getElementById('close-filter-champ-btn');
        const filtersWrapper = document.getElementById('champ-filters-wrapper');
        let isFilterMenuOpen = false;

        const toggleFilterMenu = () => {
            isFilterMenuOpen = !isFilterMenuOpen;
            if (isFilterMenuOpen) {
                filtersWrapper.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.add('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.remove('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.remove('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.add('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
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

        window.renderBuildTab = (champName, styleIndex) => {
            const builds = window._masterBuilds[window._normalizeBuildName(champName)];
            if (!builds || builds.length === 0) return '<p class="text-[10px] text-slate-500 text-center py-4 italic">Chưa có dữ liệu gợi ý.</p>';

            const currentBuild = builds[styleIndex];
            const onErrorFallback = `onerror="this.onerror=null; this.src='/Asset/logo/logo.png';"`;

            const itemsHTML = currentBuild.items.map(rawItemName => {
                const itemName = cleanItemName(rawItemName);
                const itemData = window._masterItems[itemName];

                if (!itemData) {
                    return `<div class="flex flex-col items-center flex-1 min-w-0 opacity-50"><div class="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1"><i class="fa-solid fa-question text-slate-400 dark:text-slate-500 text-xs"></i></div><span class="text-[8px] text-slate-500 dark:text-slate-400 font-medium truncate w-full text-center px-0.5">${itemName}</span></div>`;
                }

                let recipeHTML = '<div class="h-4 mt-1"></div>';
                if (itemData.recipe && itemData.recipe.length === 2) {
                    recipeHTML = `
                                <div class="flex items-center gap-[2px] mt-1 justify-center bg-slate-100 dark:bg-black/40 rounded px-1 py-0.5 border border-slate-200 dark:border-white/5">
                                    <img src="${itemData.recipe[0].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                    <i class="fa-solid fa-plus text-[5px] text-slate-400 dark:text-slate-500"></i>
                                    <img src="${itemData.recipe[1].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                </div>
                            `;
                }

                const isRadiant = itemData.name.toLowerCase().includes('ánh sáng');
                const imgBorder = isRadiant ? 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'border-slate-300 dark:border-slate-600';
                const textCol = isRadiant ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300';

                return `<div class="flex flex-col items-center flex-1 min-w-0"><img src="${itemData.image}" class="w-10 h-10 rounded-lg border-[1.5px] ${imgBorder} object-cover bg-black shadow-md mb-1" ${onErrorFallback}><span class="text-[8px] md:text-[9.5px] ${textCol} font-bold truncate w-full text-center px-0.5">${itemData.name}</span>${recipeHTML}</div>`;
            }).join('');

            const tabsHTML = builds.map((b, idx) => `
                        <button onclick="document.getElementById('build-content').innerHTML = window.renderBuildTab('${window.escapeJS(champName)}', ${idx})" 
                                class="px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all whitespace-nowrap shadow-sm border outline-none ${idx === styleIndex ? 'bg-premium-gold text-black border-transparent shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}">
                            Cách ${idx + 1}
                        </button>
                    `).join('');

            const statsHTML = `
                        <div class="flex items-center justify-center gap-3 mb-3 px-1">
                            <span class="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-trophy"></i> Top TB: ${currentBuild.avg_place}
                            </span>
                            <span class="text-[9.5px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-chart-line"></i> Thắng: ${currentBuild.win_rate}
                            </span>
                        </div>
                    `;

            return `
                        <div class="flex flex-col gap-2.5">
                            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/5 snap-x">${tabsHTML}</div>
                            ${statsHTML}
                            <div class="flex gap-2 justify-between items-start bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">${itemsHTML}</div>
                        </div>
                    `;
        };

        window.openChampModal = (index) => {
            const champ = window._currentFilteredChampsForPopup[index];
            if (!champ) return;

            let borderColor = 'border-slate-400'; let textColor = 'text-slate-500 dark:text-slate-300';
            if (champ.cost === 2) { borderColor = 'border-emerald-500'; textColor = 'text-emerald-600 dark:text-emerald-400'; }
            if (champ.cost === 3) { borderColor = 'border-blue-500'; textColor = 'text-blue-600 dark:text-blue-400'; }
            if (champ.cost === 4) { borderColor = 'border-purple-500'; textColor = 'text-purple-600 dark:text-purple-400'; }
            if (champ.cost === 5) { borderColor = 'border-yellow-500 dark:border-yellow-400'; textColor = 'text-yellow-600 dark:text-yellow-400'; }

            const titleHTML = `
                        <div class="flex items-center justify-between w-full pr-4">
                            <span class="text-slate-800 dark:text-white font-black drop-shadow-md text-[19px] tracking-tight">${window.escapeHTML(champ.name)}</span>
                            <span class="text-xs font-black ${textColor} bg-slate-100 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-1">
                                ${champ.cost} <i class="fa-solid fa-coins text-[10px]"></i>
                            </span>
                        </div>
                    `;

            const traitPills = champ.traits.map(t => {
                const iconFilename = getTraitIconName(t.name);
                return `
                            <span class="flex items-center gap-1 px-2 py-0.5 rounded border border-premium-accent/30 bg-premium-accent/10 text-premium-accent text-[9.5px] md:text-[10.5px] font-bold uppercase tracking-wider drop-shadow-md backdrop-blur-md">
                                <div class="w-3.5 h-3.5 bg-current shrink-0" 
                                     style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
                                </div>
                                ${t.name}
                            </span>
                        `;
            }).join('');

            const buildsSectionHTML = `
                        <div class="mt-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-3 shadow-lg relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premium-gold via-transparent to-transparent opacity-50"></div>
                            <div class="text-[10px] md:text-[11px] font-black text-premium-gold uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-md">
                                <i class="fa-solid fa-chart-pie"></i> Thống kê lên đồ
                            </div>
                            <div id="build-content">${window.renderBuildTab(champ.name, 0)}</div>
                        </div>
                    `;

            const contentHTML = `
                        <div class="flex flex-col gap-3 mt-2 text-left">
                            <div class="w-full h-[100px] md:h-[120px] rounded-xl overflow-hidden border-2 ${borderColor} relative shadow-md">
                                <img src="${champ.image}" class="w-full h-full object-cover object-[80%]" alt="${window.escapeHTML(champ.name)}" onerror="this.onerror=null; this.src='/Asset/logo/logo.png';">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-2 left-2 flex flex-wrap gap-1.5">${traitPills}</div>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-user-shield text-premium-accent text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vai trò</span>
                                    <span class="text-[11px] md:text-[12px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">${champ.role}</span>
                                </div>
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-crosshairs text-rose-500 dark:text-rose-400 text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tầm đánh</span>
                                    <span class="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-200">${champ.range} ô</span>
                                </div>
                            </div>
                            ${buildsSectionHTML}
                        </div>
                    `;
            uiAlert(titleHTML, contentHTML);
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
                listContainer.innerHTML = `<div class="py-20 flex flex-col items-center justify-center text-slate-500"><i class="fa-solid fa-ghost text-4xl mb-3 opacity-20"></i><span class="text-[11.5px] font-medium">Không tìm thấy tướng phù hợp.</span></div>`;
                return;
            }

            viewIcon.className = isDetailedView ? "fa-solid fa-border-all" : "fa-solid fa-list";

            const costTiers = [1, 2, 3, 4, 5];
            costTiers.forEach(tier => {
                const champsInTier = filteredChamps.filter(c => c.cost === tier);
                if (champsInTier.length === 0) return;

                champsInTier.forEach(c => window._currentFilteredChampsForPopup.push(c));

                let tierColor = 'text-slate-500 dark:text-slate-300'; let tierBg = 'bg-slate-400';
                if (tier === 2) { tierColor = 'text-emerald-600 dark:text-emerald-400'; tierBg = 'bg-emerald-500'; }
                if (tier === 3) { tierColor = 'text-blue-600 dark:text-blue-400'; tierBg = 'bg-blue-500'; }
                if (tier === 4) { tierColor = 'text-purple-600 dark:text-purple-400'; tierBg = 'bg-purple-500'; }
                if (tier === 5) { tierColor = 'text-yellow-600 dark:text-yellow-400'; tierBg = 'bg-yellow-500'; }

                let tierHTML = `
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-1 h-5 rounded-full ${tierBg} shadow-[0_0_8px_currentColor]"></div>
                                    <h2 class="text-base font-black ${tierColor} uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md">${tier} VÀNG</h2>
                                    <div class="flex-1 h-[1px] bg-gradient-to-r from-slate-300 dark:from-white/10 to-transparent"></div>
                                </div>
                                <div class="${isDetailedView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start' : 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3 md:gap-4 items-start'}">
                        `;

                const onErrorFallback = `onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='";`;

                const champsHTML = champsInTier.map(champ => {
                    const currentIndex = globalIndex++;

                    let theme = { ring: 'ring-slate-300 dark:ring-white/20', text: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-400 dark:bg-slate-300', gradient: 'from-slate-200 dark:from-slate-500/20', border: 'border-slate-300 dark:border-slate-500 hover:border-slate-400' };
                    if (champ.cost === 2) theme = { ring: 'ring-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', gradient: 'from-emerald-100 dark:from-emerald-500/20', border: 'border-emerald-400 dark:border-emerald-500 hover:border-emerald-500 dark:hover:border-emerald-400' };
                    if (champ.cost === 3) theme = { ring: 'ring-blue-500/40', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500', gradient: 'from-blue-100 dark:from-blue-500/20', border: 'border-blue-400 dark:border-blue-500 hover:border-blue-500 dark:hover:border-blue-400' };
                    if (champ.cost === 4) theme = { ring: 'ring-purple-500/40', text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-500', gradient: 'from-purple-100 dark:from-purple-500/20', border: 'border-purple-400 dark:border-purple-500 hover:border-purple-500 dark:hover:border-purple-400' };
                    if (champ.cost === 5) theme = { ring: 'ring-yellow-500/40', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500', gradient: 'from-yellow-100 dark:from-yellow-500/20', border: 'border-yellow-400 dark:border-yellow-500 hover:border-yellow-500 dark:hover:border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)] dark:shadow-[0_0_8px_rgba(234,179,8,0.3)]' };

                    let recommendedItemsArray = [];
                    const buildsForChamp = window._masterBuilds[window._normalizeBuildName(champ.name)];
                    if (buildsForChamp && buildsForChamp.length > 0) {
                        const firstBuildItems = buildsForChamp[0].items;
                        firstBuildItems.forEach(rawItemName => {
                            const cleanName = cleanItemName(rawItemName);
                            const itemData = window._masterItems[cleanName];
                            if (itemData) recommendedItemsArray.push(itemData.image);
                        });
                    }

                    if (isDetailedView) {
                        const rangeDots = Array.from({ length: 5 }).map((_, i) => i < champ.range ? `<div class="w-1 h-1 rounded-full bg-premium-gold shadow-[0_0_4px_rgba(212,175,55,0.8)]"></div>` : `<div class="w-1 h-1 rounded-full bg-white/30"></div>`).join('');

                        const traitList = champ.traits.map(t => {
                            const iconFilename = getTraitIconName(t.name);
                            return `
                                        <div class="flex items-center gap-1.5 text-white/90">
                                            <div class="w-3.5 h-3.5 bg-current shrink-0" 
                                                 style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
                                            </div>
                                            <span class="text-[11px] font-medium drop-shadow-md">${t.name}</span>
                                        </div>
                                    `;
                        }).join('');

                        let buildIconsHTML = '';
                        if (recommendedItemsArray.length > 0) {
                            buildIconsHTML = `
                                        <div class="flex gap-1.5 mt-1">
                                            ${recommendedItemsArray.map(img => `<img src="${img}" class="w-6 h-6 rounded border border-white/20 shadow-md bg-black" ${onErrorFallback}>`).join('')}
                                        </div>
                                    `;
                        }

                        return `
                                    <div class="relative h-[180px] rounded-2xl overflow-hidden bg-black ring-1 ${theme.ring} shadow-lg transition-all duration-500 hover:-translate-y-1.5 group cursor-pointer" onclick="window.openChampModal(${currentIndex})">
                                        <img src="${champ.image}" class="absolute inset-0 w-full h-full object-cover object-[80%] transition-transform duration-700 group-hover:scale-110" alt="${champ.name}" loading="lazy" ${onErrorFallback}>
                                        
                                        <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent h-16"></div>
                                        <div class="absolute bottom-0 w-full bg-gradient-to-t from-[#05080f] via-[#05080f]/90 to-transparent h-[120px]"></div>
                                        
                                        <div class="absolute bottom-0 w-full h-1/2 bg-gradient-to-t ${theme.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>

                                        <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10 pointer-events-none">
                                        <div class="flex flex-col"> 
                                                <h3 class="text-2xl font-black text-white drop-shadow-lg tracking-tight group-hover:text-premium-gold transition-colors duration-300 leading-none mb-2">${champ.name}</h3>
                                                <div class="flex flex-col gap-1.5 mb-2">
                                                    <div class="inline-flex items-center w-max bg-white/10 px-1.5 py-[3px] rounded border border-white/20 backdrop-blur-md shadow-sm">
                                                        <span class="text-[8.5px] font-black text-white uppercase tracking-widest">${champ.role}</span>
                                                    </div>
                                                    
                                                    <div class="inline-flex items-center w-max gap-1 bg-white/10 px-1.5 py-[3px] rounded border border-white/20 backdrop-blur-md shadow-sm">
                                                        <i class="fa-solid fa-crosshairs text-white/80 text-[8.5px]"></i>
                                                        <div class="flex gap-[2px] ml-0.5">${rangeDots}</div>
                                                    </div>
                                                </div>

                                                <div class="flex flex-col gap-0.5 mb-1.5">${traitList}</div>
                                                
                                                ${buildIconsHTML}
                                            </div>
                                            
                                            <div class="flex items-center justify-center w-9 h-9 rounded-full bg-white/95 dark:bg-[#090d14]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 ring-1 ${theme.ring} shadow-lg group-hover:rotate-12 transition-transform duration-500 mb-1">
                                                <span class="text-base font-black ${theme.text} drop-shadow-md">${champ.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                    } else {
                        let buildGridHTML = '<div class="h-4"></div>';
                        if (recommendedItemsArray.length > 0) {
                            buildGridHTML = `
                                        <div class="grid grid-cols-3 gap-[2px] w-full mt-[3px] md:mt-1">
                                            ${recommendedItemsArray.map(img => `<img src="${img}" class="w-full aspect-square rounded-[3px] border border-slate-300 dark:border-slate-600/50 object-cover opacity-90 shadow-inner bg-black" loading="lazy" ${onErrorFallback}>`).join('')}
                                        </div>
                                    `;
                        }

                        let thickBorder = 'border-slate-300 dark:border-slate-500';
                        let nameColor = 'text-slate-700 dark:text-slate-300';

                        if (champ.cost === 2) { thickBorder = 'border-emerald-400 dark:border-emerald-500'; nameColor = 'text-emerald-600 dark:text-emerald-400'; }
                        if (champ.cost === 3) { thickBorder = 'border-blue-400 dark:border-blue-500'; nameColor = 'text-blue-600 dark:text-blue-400'; }
                        if (champ.cost === 4) { thickBorder = 'border-purple-400 dark:border-purple-500'; nameColor = 'text-purple-600 dark:text-purple-400'; }
                        if (champ.cost === 5) { thickBorder = 'border-yellow-400 dark:border-yellow-500 shadow-[0_0_5px_rgba(250,204,21,0.3)]'; nameColor = 'text-yellow-600 dark:text-yellow-400'; }

                        return `
                                    <div class="flex flex-col p-1.5 md:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151b2b] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-${theme.border.split('-')[1]}-400 active:scale-95 shadow-sm group" 
                                         onclick="window.openChampModal(${currentIndex})">
                                         
                                        <div class="relative w-full aspect-square rounded-[8px] border-2 ${thickBorder} overflow-hidden bg-slate-900">
                                            <img src="${champ.image}" alt="${champ.name}" class="w-full h-full object-cover object-[80%] transition-transform duration-500 group-hover:scale-105" loading="lazy" ${onErrorFallback}>
                                        </div>
                                        
                                        ${buildGridHTML}
                                        
                                        <span class="text-[10px] md:text-[11px] font-bold text-slate-800 dark:text-slate-300 group-hover:${nameColor} w-full text-center mt-1.5 truncate tracking-wide transition-colors">
                                            ${champ.name}
                                        </span>
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

        searchInp.addEventListener('input', window.debounce((e) => {
            searchQuery = e.target.value;
            clearBtn.classList.toggle('hidden', searchQuery.length === 0);
            renderChampions();
        }, 300));

        clearBtn.addEventListener('click', () => {
            searchInp.value = '';
            searchQuery = '';
            clearBtn.classList.add('hidden');
            searchInp.focus();
            renderChampions();
        });

        document.getElementById('toggle-view-champ').addEventListener('click', () => {
            isDetailedView = !isDetailedView;
            renderChampions();
        });

        document.querySelectorAll('.filter-cost-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cost = parseInt(e.currentTarget.dataset.cost);
                if (activeCosts.has(cost)) {
                    activeCosts.delete(cost);
                    e.currentTarget.classList.remove('bg-premium-gold', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(212,175,55,0.6)]');
                    e.currentTarget.classList.add('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                } else {
                    activeCosts.add(cost);
                    e.currentTarget.classList.remove('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                    e.currentTarget.classList.add('bg-premium-gold', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(212,175,55,0.6)]');
                }
                updateFilterIndicator();
                renderChampions();
            });
        });

        document.querySelectorAll('.filter-trait-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trait = e.currentTarget.dataset.trait;
                if (activeTraits.has(trait)) {
                    activeTraits.delete(trait);
                    e.currentTarget.classList.remove('bg-premium-accent', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(56,189,248,0.6)]');
                    e.currentTarget.classList.add('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                } else {
                    activeTraits.add(trait);
                    e.currentTarget.classList.remove('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                    e.currentTarget.classList.add('bg-premium-accent', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(56,189,248,0.6)]');
                }
                updateFilterIndicator();
                renderChampions();
            });
        });

        renderChampions();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-4 text-center text-red-400 text-sm border border-red-900/50 bg-red-900/10 rounded-xl">Lỗi tải dữ liệu Tướng: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ items.json 
// ---------------------------------------------------------
async function loadItemsData() {
    const gridContainer = document.getElementById('grid-items');
    if (!gridContainer) return;

    try {
        const response = await fetch('./asset/data/items.json');
        if (!response.ok) throw new Error('Không tìm thấy file items.json');

        const rawItemsData = await response.json();

        const categoryMap = {
            'normal': 'Cơ Bản',
            'emblem': 'Ấn Hệ Tộc',
            'radiant': 'Ánh Sáng',
            'artifact': 'Tạo Tác',
            'support': 'Hỗ Trợ',
            'consumable': 'Tiêu Thụ'
        };

        let items = [];
        let filterButtonsHTML = `<button class="filter-item-btn shrink-0 px-3.5 py-1.5 rounded-full bg-premium-gold text-black font-bold text-[10.5px] shadow-[0_0_8px_rgba(212,175,55,0.5)] border border-transparent transition-all outline-none" data-cat="all">Tất cả</button>`;

        for (const [category, itemArray] of Object.entries(rawItemsData)) {
            if (Array.isArray(itemArray) && itemArray.length > 0) {
                const catKey = category.toLowerCase();
                const displayName = categoryMap[catKey] || (category.charAt(0).toUpperCase() + category.slice(1));

                filterButtonsHTML += `
                            <button class="filter-item-btn shrink-0 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10.5px] hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-md outline-none" data-cat="${catKey}">
                                ${displayName}
                            </button>
                        `;

                itemArray.forEach(item => {
                    item.category = catKey;
                    items.push(item);
                });
            }
        }

        let searchQuery = '';
        let activeCategory = 'all';
        let isDetailedView = false;

        window._currentFilteredItemsForPopup = [];

        // --- GIAO DIỆN CHÍNH CỦA TAB TRANG BỊ KÈM POPUP BỘ LỌC ---
        gridContainer.innerHTML = `
                    <div class="flex flex-col relative pb-40 min-h-screen w-full">
                        <div id="item-list-container" class="flex flex-col gap-8 pt-4"></div>

                        <div class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                            
                            <div id="item-filters-wrapper" class="w-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-3 left-0">
                                <div class="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent"></div>

                                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-1">
                                        <span class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md">
                                            <i class="fa-solid fa-filter text-premium-gold"></i> Tùy chỉnh Bộ lọc
                                        </span>
                                        <button id="close-filter-item-btn" class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors pointer-events-auto outline-none">
                                            <i class="fa-solid fa-xmark text-sm"></i>
                                        </button>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loại trang bị:</span>
                                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full pb-1">
                                            ${filterButtonsHTML}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="w-full group bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200 dark:border-white/20 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden flex items-center pl-4 pr-2 py-2 pointer-events-auto hover:border-premium-gold/40 transition-colors relative">
                                <i class="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-premium-gold text-[13px] transition-colors drop-shadow"></i>
                                <input type="text" id="search-item" placeholder="Tìm trang bị..." 
                                    class="w-full bg-transparent border-none text-slate-800 dark:text-white text-[13px] ml-2.5 pr-8 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500">
                                
                                <button id="clear-search-btn" class="absolute right-24 hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex items-center justify-center outline-none">
                                    <i class="fa-solid fa-circle-xmark text-[14px]"></i>
                                </button>

                                <div class="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>

                                <button id="toggle-view-btn" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:bg-slate-200 dark:hover:bg-white/10 outline-none mx-1 relative">
                                    <i class="fa-solid fa-list" id="view-icon"></i>
                                </button>

                                <div class="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>

                                <button id="toggle-filter-item-btn" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:bg-premium-gold hover:text-black outline-none relative">
                                    <i class="fa-solid fa-sliders text-[12px]"></i>
                                    <span id="item-filter-indicator" class="absolute top-0 right-0 w-[9px] h-[9px] bg-rose-500 rounded-full border-[1.5px] border-white dark:border-slate-800 hidden shadow-sm"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

        // Logic ẩn hiện bộ lọc
        const toggleFilterBtn = document.getElementById('toggle-filter-item-btn');
        const closeFilterBtn = document.getElementById('close-filter-item-btn');
        const filtersWrapper = document.getElementById('item-filters-wrapper');
        let isFilterMenuOpen = false;

        const toggleFilterMenu = () => {
            isFilterMenuOpen = !isFilterMenuOpen;
            if (isFilterMenuOpen) {
                filtersWrapper.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.add('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.remove('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.remove('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.add('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
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
            return stats.map(stat => `
                        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-[2px] text-[9px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                            <img src="${stat.icon}" class="w-[11px] h-[11px] object-contain opacity-80" alt="${stat.name}" onerror="this.style.display='none'"> 
                            ${stat.value}
                        </div>
                    `).join('');
        };

        const createRecipeHTMLForDetail = (recipe) => {
            if (!recipe || recipe.length !== 2) return '';
            return `
                        <div class="flex items-center gap-1 bg-slate-50 dark:bg-black/50 rounded p-1 shadow-inner border border-slate-200 dark:border-white/5">
                            <img src="${recipe[0].image}" class="w-4 h-4 rounded-sm object-cover" alt="${recipe[0].name}" onerror="this.src='/Asset/logo/logo.png'; this.onerror=null;">
                            <i class="fa-solid fa-plus text-[7px] text-slate-400"></i>
                            <img src="${recipe[1].image}" class="w-4 h-4 rounded-sm object-cover" alt="${recipe[1].name}" onerror="this.src='/Asset/logo/logo.png'; this.onerror=null;">
                        </div>
                    `;
        };

        window.openItemModal = (index) => {
            const item = window._currentFilteredItemsForPopup[index];
            if (!item) return;

            const isRadiant = item.category === 'radiant' || item.name.toLowerCase().includes('ánh sáng');
            const titleColor = isRadiant ? 'text-yellow-500 dark:text-yellow-400' : 'text-premium-gold';
            const desc = item.description || item.info || '';

            const htmlContent = `
                        <div class="flex flex-col gap-3 mt-2 text-left">
                            <div class="flex justify-between items-start gap-3">
                                ${createRecipeHTMLForDetail(item.recipe)}
                            </div>
                            <div class="flex flex-wrap gap-1.5">
                                ${createBadgesHTML(item.stats)}
                            </div>
                            <div class="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-black/30 p-3 rounded-lg border border-slate-200 dark:border-white/5 mt-1">
                                ${desc.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
            uiAlert(`<span class="${titleColor} font-black drop-shadow-md">${window.escapeHTML(item.name)}</span>`, htmlContent);
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
                    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        desc.toLowerCase().includes(searchQuery.toLowerCase());
                });

                if (filteredItemsInCategory.length === 0) continue;
                filteredItemsInCategory.forEach(item => window._currentFilteredItemsForPopup.push(item));

                const categoryTitle = categoryMap[categoryKey] || (key.charAt(0).toUpperCase() + key.slice(1));

                let categoryHTML = `
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-1 h-5 rounded-full bg-premium-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                                    <h2 class="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">${categoryTitle}</h2>
                                    <div class="flex-1 h-[1px] bg-gradient-to-r from-slate-300 dark:from-white/10 to-transparent"></div>
                                </div>
                                <div class="${isDetailedView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start' : 'grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 items-start'}">
                        `;

                const onErrorFallback = `onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='";`;

                const itemsHTML = filteredItemsInCategory.map((item) => {
                    const isRadiant = item.category === 'radiant' || item.name.toLowerCase().includes('ánh sáng');
                    const currentIndex = globalIndex++;

                    if (isDetailedView) {
                        const borderClass = isRadiant ? 'border-yellow-400/40 shadow-lg' : 'border-slate-200 dark:border-white/5';
                        return `
                                    <div class="bg-white dark:bg-premium-card border ${borderClass} rounded-xl p-3 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 group">
                                        <div class="shrink-0"><img src="${item.image}" class="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-900" ${onErrorFallback}></div>
                                        <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div class="flex justify-between items-start gap-2">
                                                <h3 class="text-[13px] font-bold ${isRadiant ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-800 dark:text-white'} truncate">${window.escapeHTML(item.name)}</h3>
                                                ${createRecipeHTMLForDetail(item.recipe)}
                                            </div>
                                            <div class="flex flex-wrap gap-1">${createBadgesHTML(item.stats)}</div>
                                            <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">${(item.description || item.info || '').replace(/\n/g, '<br>')}</p>
                                        </div>
                                    </div>`;
                    } else {
                        const borderClass = isRadiant ? 'border-yellow-400 dark:border-yellow-500/60 shadow-[0_0_10px_rgba(250,204,21,0.2)] bg-yellow-50 dark:bg-yellow-900/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-premium-gold/50';

                        let recipeSection = '';
                        if (item.recipe && item.recipe.length === 2) {
                            recipeSection = `
                                        <div class="grid grid-cols-2 gap-1 w-full mt-1">
                                            <img src="${item.recipe[0].image}" class="w-full aspect-square rounded-[4px] border border-slate-300 dark:border-slate-600/50 object-cover opacity-90 bg-slate-100 dark:bg-slate-900" loading="lazy" alt="${item.recipe[0].name}" ${onErrorFallback}>
                                            <img src="${item.recipe[1].image}" class="w-full aspect-square rounded-[4px] border border-slate-300 dark:border-slate-600/50 object-cover opacity-90 bg-slate-100 dark:bg-slate-900" loading="lazy" alt="${item.recipe[1].name}" ${onErrorFallback}>
                                        </div>
                                    `;
                        }

                        return `
                                    <div class="flex flex-col p-1 rounded-[10px] border ${borderClass} cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-95" 
                                         onclick="window.openItemModal(${currentIndex})">
                                        <img src="${item.image}" alt="${window.escapeHTML(item.name)}" class="w-full aspect-square rounded-md object-cover bg-black" loading="lazy" ${onErrorFallback}>
                                        ${recipeSection}
                                    </div>
                                `;
                    }
                }).join('');

                categoryHTML += itemsHTML + `</div></div>`;
                listContainer.innerHTML += categoryHTML;
            }

            viewIcon.className = isDetailedView ? "fa-solid fa-border-all" : "fa-solid fa-list";
        };

        const searchInp = document.getElementById('search-item');
        const clearBtn = document.getElementById('clear-search-btn');

        searchInp.addEventListener('input', window.debounce((e) => {
            searchQuery = e.target.value;
            clearBtn.classList.toggle('hidden', searchQuery.length === 0);
            renderItems();
        }, 300));

        clearBtn.addEventListener('click', () => {
            searchInp.value = '';
            searchQuery = '';
            clearBtn.classList.add('hidden');
            searchInp.focus();
            renderItems();
        });

        document.getElementById('toggle-view-btn').addEventListener('click', () => {
            isDetailedView = !isDetailedView;
            renderItems();
        });

        document.querySelectorAll('.filter-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedCat = e.currentTarget.dataset.cat;
                if (activeCategory === clickedCat && clickedCat !== 'all') {
                    activeCategory = 'all';
                } else {
                    activeCategory = clickedCat;
                }

                document.querySelectorAll('.filter-item-btn').forEach(b => {
                    const isCurrentActive = b.dataset.cat === activeCategory;
                    if (isCurrentActive) {
                        b.classList.remove('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                        b.classList.add('bg-premium-gold', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                    } else {
                        b.classList.add('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-white/10', 'text-slate-600', 'dark:text-slate-300');
                        b.classList.remove('bg-premium-gold', 'text-black', 'border-transparent', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                    }
                });

                updateFilterIndicator();
                renderItems();
            });
        });

        renderItems();

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-4 text-center text-red-400 text-sm border border-red-900/50 bg-red-900/10 rounded-xl">Lỗi tải dữ liệu Trang Bị: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM FETCH VÀ RENDER DỮ LIỆU TỪ comps.json & FIREBASE (FULL ĐỒNG BỘ ICON TỘC HỆ)
// ---------------------------------------------------------
async function loadCompsData() {
    const gridContainer = document.getElementById('grid-comps');
    if (!gridContainer) return;

    try {
        // 1. Thêm nguồn Firestore vào danh sách
        const compSources = [
            { id: 'source1', name: 'TFT 1', file: './asset/data/comps.json' },
            { id: 'source2', name: 'TFT 2', file: './asset/data/compsS2.json' },
            { id: 'source_fb', name: 'Cộng Đồng', file: 'firestore' } // Nguồn Firebase
        ];

        let activeSourceUrl = compSources[0].file;
        let compsData = [];
        let champsData = [];
        let itemsData = {};
        let buildsData = [];

        const [resChamps, resItems, resBuilds] = await Promise.all([
            fetch('./asset/data/champions.json'),
            fetch('./asset/data/items.json'),
            fetch('./asset/data/champion_builds.json').catch(() => null)
        ]);

        if (!resChamps.ok || !resItems.ok) {
            throw new Error('Không thể tải dữ liệu Tướng hoặc Trang Bị nền tảng.');
        }

        champsData = await resChamps.json();
        itemsData = await resItems.json();
        if (resBuilds && resBuilds.ok) buildsData = await resBuilds.json();

        const masterChamps = {};
        champsData.forEach(champ => { masterChamps[champ.name.toLowerCase().trim()] = champ; });

        const masterItems = {};
        for (const itemArray of Object.values(itemsData)) {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => { masterItems[item.name.toLowerCase().trim()] = item; });
            }
        }

        // Đảm bảo hàm chuẩn hóa luôn tồn tại
        window._normalizeBuildName = window._normalizeBuildName || ((name) => {
            if (!name) return '';
            return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        });

        window._masterBuildsForComps = {};
        if (Array.isArray(buildsData)) {
            buildsData.forEach(b => {
                const validBuilds = b.builds.filter(build => build.items && build.items.length > 0);
                if (validBuilds.length > 0) {
                    // Ép tên về dạng chuẩn trước khi lưu
                    window._masterBuildsForComps[window._normalizeBuildName(b.unit)] = validBuilds;
                }
            });
        }

        const cleanName = (rawName) => rawName ? rawName.replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
        const onErrorFallback = `onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='";`;

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
                card.classList.add('border-premium-gold/40');
            } else {
                detailsWrapper.classList.add('hidden');
                chevronIcon.classList.remove('rotate-180');
                card.classList.remove('border-premium-gold/40');
            }
        };

        window.renderBuildTabInComp = (champName, styleIndex) => {
            const builds = window._masterBuildsForComps[window._normalizeBuildName(champName)];
            if (!builds || builds.length === 0) return '<p class="text-[10px] text-slate-500 text-center py-4 italic">Chưa có dữ liệu gợi ý.</p>';

            const currentBuild = builds[styleIndex];

            const itemsHTML = currentBuild.items.map(rawItemName => {
                const itemName = cleanName(rawItemName);
                const itemData = masterItems[itemName];

                if (!itemData) {
                    return `<div class="flex flex-col items-center flex-1 min-w-0 opacity-50"><div class="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1"><i class="fa-solid fa-question text-slate-400 dark:text-slate-500 text-xs"></i></div><span class="text-[8px] text-slate-500 dark:text-slate-400 font-medium truncate w-full text-center px-0.5">${rawItemName}</span></div>`;
                }

                let recipeHTML = '<div class="h-4 mt-1"></div>';
                if (itemData.recipe && itemData.recipe.length === 2) {
                    recipeHTML = `
                                <div class="flex items-center gap-[2px] mt-1 justify-center bg-slate-100 dark:bg-black/40 rounded px-1 py-0.5 border border-slate-200 dark:border-white/5">
                                    <img src="${itemData.recipe[0].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                    <i class="fa-solid fa-plus text-[5px] text-slate-400 dark:text-slate-500"></i>
                                    <img src="${itemData.recipe[1].image}" class="w-3.5 h-3.5 rounded-sm object-cover opacity-80" ${onErrorFallback}>
                                </div>
                            `;
                }

                const isRadiant = itemData.name.toLowerCase().includes('ánh sáng');
                const imgBorder = isRadiant ? 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'border-slate-300 dark:border-slate-600';

                return `<div class="flex flex-col items-center flex-1 min-w-0"><img src="${itemData.image}" class="w-10 h-10 rounded-lg border-[1.5px] ${imgBorder} object-cover bg-black shadow-md mb-1" ${onErrorFallback}><span class="text-[8px] md:text-[9.5px] ${isRadiant ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300'} font-bold truncate w-full text-center px-0.5">${itemData.name}</span>${recipeHTML}</div>`;
            }).join('');

            const tabsHTML = builds.map((b, idx) => `
                        <button onclick="document.getElementById('build-content-comp').innerHTML = window.renderBuildTabInComp('${window.escapeJS(champName)}', ${idx})" 
                                class="px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all whitespace-nowrap shadow-sm border outline-none ${idx === styleIndex ? 'bg-premium-gold text-black border-transparent shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}">
                            Cách ${idx + 1}
                        </button>
                    `).join('');

            const statsHTML = `
                        <div class="flex items-center justify-center gap-3 mb-3 px-1">
                            <span class="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-trophy"></i> Top TB: ${currentBuild.avg_place}
                            </span>
                            <span class="text-[9.5px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                                <i class="fa-solid fa-chart-line"></i> Thắng: ${currentBuild.win_rate}
                            </span>
                        </div>
                    `;

            return `
                        <div class="flex flex-col gap-2.5">
                            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/5 snap-x">${tabsHTML}</div>
                            ${statsHTML}
                            <div class="flex gap-2 justify-between items-start bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">${itemsHTML}</div>
                        </div>
                    `;
        };

        window.openChampModalFromComp = (champNameRaw) => {
            const champ = masterChamps[cleanName(champNameRaw)];
            if (!champ) return;

            let borderColor = 'border-slate-400'; let textColor = 'text-slate-500 dark:text-slate-300';
            if (champ.cost === 2) { borderColor = 'border-emerald-500'; textColor = 'text-emerald-600 dark:text-emerald-400'; }
            if (champ.cost === 3) { borderColor = 'border-blue-500'; textColor = 'text-blue-600 dark:text-blue-400'; }
            if (champ.cost === 4) { borderColor = 'border-purple-500'; textColor = 'text-purple-600 dark:text-purple-400'; }
            if (champ.cost === 5) { borderColor = 'border-yellow-500 dark:border-yellow-400'; textColor = 'text-yellow-600 dark:text-yellow-400'; }

            const titleHTML = `
                        <div class="flex items-center justify-between w-full pr-4">
                            <span class="text-slate-800 dark:text-white font-black drop-shadow-md text-[19px] tracking-tight">${window.escapeHTML(champ.name)}</span>
                            <span class="text-xs font-black ${textColor} bg-slate-100 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-1">
                                ${champ.cost} <i class="fa-solid fa-coins text-[10px]"></i>
                            </span>
                        </div>
                    `;

            const traitPills = champ.traits.map(t => {
                const iconFilename = getTraitIconName(t.name);
                return `
                            <span class="flex items-center gap-1 px-2 py-0.5 rounded border border-premium-accent/30 bg-premium-accent/10 text-premium-accent text-[9.5px] md:text-[10.5px] font-bold uppercase tracking-wider drop-shadow-md backdrop-blur-md">
                                <div class="w-3.5 h-3.5 bg-current shrink-0" 
                                     style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
                                </div>
                                ${t.name}
                            </span>
                        `;
            }).join('');

            const buildsSectionHTML = `
                        <div class="mt-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-3 shadow-lg relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premium-gold via-transparent to-transparent opacity-50"></div>
                            <div class="text-[10px] md:text-[11px] font-black text-premium-gold uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-md">
                                <i class="fa-solid fa-chart-pie"></i> Thống kê lên đồ
                            </div>
                            <div id="build-content-comp">${window.renderBuildTabInComp(champ.name, 0)}</div>
                        </div>
                    `;

            const contentHTML = `
                        <div class="flex flex-col gap-3 mt-2 text-left">
                            <div class="w-full h-[100px] md:h-[120px] rounded-xl overflow-hidden border-2 ${borderColor} relative shadow-md">
                                <img src="${champ.image}" class="w-full h-full object-cover object-[80%]" alt="${window.escapeHTML(champ.name)}" ${onErrorFallback}>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-2 left-2 flex flex-wrap gap-1.5">${traitPills}</div>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-user-shield text-premium-accent text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vai trò</span>
                                    <span class="text-[11px] md:text-[12px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">${champ.role}</span>
                                </div>
                                <div class="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <i class="fa-solid fa-crosshairs text-rose-500 dark:text-rose-400 text-sm md:text-base drop-shadow-md"></i>
                                    <span class="text-[8.5px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tầm đánh</span>
                                    <span class="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-200">${champ.range} ô</span>
                                </div>
                            </div>
                            ${buildsSectionHTML}
                        </div>
                    `;
            uiAlert(titleHTML, contentHTML);
        };

        const sourceButtonsHTML = compSources.map(src => `
                    <button class="filter-source-btn shrink-0 px-3.5 py-1.5 rounded-full border text-[10.5px] font-bold transition-all shadow-sm flex items-center gap-1.5 outline-none
                        ${src.file === activeSourceUrl ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}" 
                        data-url="${src.file}">
                        <i class="fa-solid ${src.file === 'firestore' ? 'fa-cloud' : 'fa-database'} text-[10px] opacity-80"></i> ${src.name}
                    </button>
                `).join('');

        gridContainer.className = "flex flex-col relative pb-20 min-h-screen w-full";
        gridContainer.innerHTML = `
                    <div class="flex flex-col relative pb-40 min-h-screen w-full">
                        <div id="comp-list-container" class="flex flex-col gap-4 w-full pt-4"></div>
                        <div class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-50 flex flex-col items-center pointer-events-none">
                            
                            <div id="comp-filters-wrapper" class="w-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-0 translate-y-4 pointer-events-none absolute bottom-full mb-3 left-0">
                                <div class="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent"></div>

                                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-1">
                                        <span class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md">
                                            <i class="fa-solid fa-filter text-premium-gold"></i> Tùy chỉnh Bộ lọc
                                        </span>
                                        <button id="close-filter-comp-btn" class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors pointer-events-auto outline-none">
                                            <i class="fa-solid fa-xmark text-sm"></i>
                                        </button>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nguồn dữ liệu:</span>
                                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full pb-1">
                                            ${sourceButtonsHTML}
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lọc theo Nhãn Đội Hình:</span>
                                        <div id="dynamic-tags-container" class="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full pb-1">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="w-full group bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200 dark:border-white/20 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden flex items-center pl-4 pr-2 py-2 pointer-events-auto hover:border-premium-gold/40 transition-colors relative">
                                <i class="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-premium-gold text-[13px] transition-colors drop-shadow"></i>
                                <input type="text" id="search-comp" placeholder="Tìm đội hình..." class="w-full bg-transparent border-none text-slate-800 dark:text-white text-[13px] ml-2.5 pr-8 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500">
                                <button id="clear-search-comp" class="absolute right-12 hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex items-center justify-center outline-none">
                                    <i class="fa-solid fa-circle-xmark text-[14px]"></i>
                                </button>
                                <div class="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                <button id="toggle-filter-comp-btn" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:bg-premium-gold hover:text-black outline-none relative">
                                    <i class="fa-solid fa-sliders text-[12px]"></i>
                                    <span id="comp-filter-indicator" class="absolute top-0 right-0 w-[9px] h-[9px] bg-rose-500 rounded-full border-[1.5px] border-white dark:border-slate-800 hidden shadow-sm"></span>
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
                toggleFilterBtn.classList.add('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.remove('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
            } else {
                filtersWrapper.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
                filtersWrapper.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                toggleFilterBtn.classList.remove('bg-premium-gold', 'text-black', 'shadow-[0_0_8px_rgba(212,175,55,0.5)]');
                toggleFilterBtn.classList.add('bg-slate-100', 'dark:bg-white/5', 'text-slate-600', 'dark:text-slate-300');
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
                tagsContainer.innerHTML = '<span class="text-[10px] text-slate-500 italic">Không có nhãn phân loại.</span>';
                return;
            }

            tagsContainer.innerHTML = allCompTags.map(tag => `
                        <button class="filter-dynamic-tag-btn shrink-0 px-3.5 py-1.5 rounded-full font-bold text-[10.5px] transition-all shadow-sm outline-none ${activeTags.has(tag) ? 'bg-premium-gold text-black border-transparent shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}" data-tag="${tag}">
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

        const fetchAndRenderComps = async (url) => {
            const listContainer = document.getElementById('comp-list-container');
            listContainer.innerHTML = `<div class="py-16 flex flex-col items-center justify-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-3xl mb-4"></i><span class="text-[12px] font-medium">Đang tải dữ liệu...</span></div>`;

            try {
                if (url === 'firestore') {
                    if (!window._db) throw new Error("Kết nối Firebase chưa sẵn sàng.");
                    const q = window._fsQuery(window._fsCol(window._db, "shared_comps"), window._fsOrderBy("createdAt", "desc"));
                    const querySnapshot = await window._fsGetDocs(q);
                    compsData = [];
                    querySnapshot.forEach((doc) => {
                        compsData.push(doc.data());
                    });
                    if (compsData.length === 0) throw new Error('Chưa có đội hình cộng đồng nào được chia sẻ.');
                } else {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Chưa có dữ liệu cho Mùa này.');
                    compsData = await res.json();
                }

                activeTags.clear();
                updateFilterIndicator();
                renderDynamicTagsFilter();
                renderComps();
            } catch (error) {
                compsData = [];
                renderDynamicTagsFilter();
                listContainer.innerHTML = `
                            <div class="py-16 flex flex-col items-center justify-center text-slate-500">
                                <i class="fa-solid fa-file-circle-xmark text-4xl mb-3 opacity-30"></i>
                                <span class="text-[12px] font-medium text-rose-500 dark:text-rose-400/80">${error.message}</span>
                            </div>`;
            }
        };

        const renderComps = () => {
            const listContainer = document.getElementById('comp-list-container');
            listContainer.innerHTML = '';

            const filteredComps = compsData.filter(comp => {
                const matchSearch = comp.CompTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (comp.UnitsContainer && comp.UnitsContainer.some(u => u.champion.toLowerCase().includes(searchQuery.toLowerCase())));

                const compTags = comp.CompRowTags || [];
                const matchTag = activeTags.size === 0 || [...activeTags].every(tag => compTags.includes(tag));

                return matchSearch && matchTag;
            });

            if (filteredComps.length === 0) {
                listContainer.innerHTML = `
                            <div class="py-16 flex flex-col items-center justify-center text-slate-500">
                                <i class="fa-solid fa-ghost text-4xl mb-3 opacity-20"></i>
                                <span class="text-[12px] font-medium">Không tìm thấy Đội Hình phù hợp.</span>
                            </div>`;
                return;
            }

            let emptyHexesHTML = '';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 7; c++) {
                    const isOddRow = r % 2 !== 0;
                    const left = c * 13.33 + (isOddRow ? 6.66 : 0);
                    const top = r * 23.07;
                    emptyHexesHTML += `
                                <div class="absolute w-[13.33%] h-[30.76%] bg-slate-200/50 dark:bg-[#112233]/80 scale-[0.92] transition-colors" 
                                     style="left: ${left}%; top: ${top}%; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                                </div>
                            `;
                }
            }

            listContainer.innerHTML = filteredComps.map((comp, compIndex) => {

                let tagsHTML = '';
                if (comp.CompRowTags && comp.CompRowTags.length > 0) {
                    tagsHTML = comp.CompRowTags.map(tag =>
                        `<span class="px-2 py-[1px] rounded bg-premium-gold/10 border border-premium-gold/30 dark:border-premium-gold/20 text-premium-gold text-[9px] font-bold uppercase tracking-wider">${window.escapeHTML(tag)}</span>`
                    ).join('');
                }

                let unitsHTML = '';
                let traitCounts = {};

                if (comp.UnitsContainer && comp.UnitsContainer.length > 0) {
                    const sortedUnits = [...comp.UnitsContainer].sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));

                    unitsHTML = sortedUnits.map(unit => {
                        const cName = cleanName(unit.champion);
                        const champData = masterChamps[cName];
                        const champImage = champData ? champData.image : '/Asset/logo/logo.png';
                        const champCost = champData ? champData.cost : 1;

                        if (champData && champData.traits) {
                            champData.traits.forEach(t => { traitCounts[t.name] = (traitCounts[t.name] || 0) + 1; });
                        }

                        let borderColor = 'border-slate-400 dark:border-slate-600';
                        if (champCost === 2) borderColor = 'border-emerald-500';
                        if (champCost === 3) borderColor = 'border-blue-500';
                        if (champCost === 4) borderColor = 'border-purple-500';
                        if (champCost === 5) borderColor = 'border-yellow-400';

                        const items = unit.items || [];
                        let itemsHTML = '';
                        if (items.length > 0) {
                            itemsHTML = items.map(itemName => {
                                const iData = masterItems[cleanName(itemName)];
                                const img = iData ? iData.image : '/Asset/logo/logo.png';
                                const iName = iData ? iData.name : itemName; // Lấy tên trang bị

                                return `
                                <div class="relative group/tooltip cursor-pointer">
                                    <img src="${img}" class="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] rounded-[3px] border border-slate-300 dark:border-slate-800 object-cover shadow-sm bg-black hover:scale-110 transition-transform" ${onErrorFallback}>
                                    
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] px-2.5 py-1.5 bg-slate-900 dark:bg-black text-white rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[100] pointer-events-none border border-slate-700 dark:border-white/10 scale-95 group-hover/tooltip:scale-100 origin-bottom">
                                        <span class="text-[9px] font-bold text-premium-gold block text-center truncate">${window.escapeHTML(iName)}</span>
                                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900 dark:border-t-black"></div>
                                    </div>
                                </div>
                                `;
                            }).join('');
                        }

                        return `
                                    <div class="flex flex-col items-center w-12 sm:w-[50px] shrink-0 group/unit cursor-pointer mb-1" onclick="window.openChampModalFromComp('${window.escapeJS(unit.champion)}')">
                                        <div class="relative w-full mb-1.5 transition-transform duration-300 group-hover/unit:-translate-y-1">
                                            <div class="w-full h-12 sm:h-[50px] aspect-square rounded-[6px] border-2 ${borderColor} overflow-hidden bg-black shadow-md">
                                                <img src="${champImage}" class="w-full h-full object-cover object-[80%]" title="${window.escapeHTML(unit.champion)}" ${onErrorFallback}>
                                            </div>
                                            <div class="absolute -bottom-2 left-0 w-full flex justify-center gap-[1.5px] z-10">
                                                ${itemsHTML}
                                            </div>
                                        </div>
                                        <span class="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-200 font-bold truncate w-full text-center mt-1 group-hover/unit:text-premium-gold transition-colors drop-shadow-sm">${window.escapeHTML(unit.champion)}</span>
                                    </div>
                                `;
                    }).join('');
                }

                const sortedTraits = Object.entries(traitCounts).sort((a, b) => b[1] - a[1]);
                let traitsHTML = sortedTraits.map(([tName, tCount]) => {
                    const iconFilename = getTraitIconName(tName);
                    return `
                                <div class="flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-full shadow-sm text-slate-700 dark:text-slate-200">
                                    <div class="w-3.5 h-3.5 bg-current shrink-0" 
                                         style="-webkit-mask-image: url('./asset/traits/${iconFilename}.svg'); mask-image: url('./asset/traits/${iconFilename}.svg'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
                                    </div>
                                    <span class="text-[10px] font-semibold">${tName}</span>
                                    <div class="w-4 h-4 rounded-full bg-premium-gold flex items-center justify-center shadow-inner border border-yellow-400 dark:border-yellow-300 ml-0.5">
                                        <span class="text-[9px] font-black text-black leading-none">${tCount}</span>
                                    </div>
                                </div>
                            `;
                }).join('');
                if (!traitsHTML) traitsHTML = '<span class="text-[10px] text-slate-500 italic">Không có dữ liệu Tộc Hệ.</span>';

                let carouselHTML = '<span class="text-[10px] text-slate-500 italic">Không có dữ liệu.</span>';
                if (comp.CompQuickStart?.carousel?.length > 0) {
                    carouselHTML = `<div class="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">` +
                        comp.CompQuickStart.carousel.slice(0, 5).map((cItem, index) => {
                            const iData = masterItems[cleanName(cItem.item)];
                            const img = iData ? iData.image : '/Asset/logo/logo.png';
                            return `
                                    <div class="flex items-center">
                                        <img src="${img}" class="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 bg-black object-cover shadow-sm" ${onErrorFallback}>
                                        ${index < Math.min(4, comp.CompQuickStart.carousel.length - 1) ? `<i class="fa-solid fa-angle-right text-[8px] text-slate-400 dark:text-slate-600 mx-1"></i>` : ''}
                                    </div>
                                `;
                        }).join('') + `</div>`;
                }

                let earlyCompHTML = '<span class="text-[10px] text-slate-500 italic">Không có dữ liệu.</span>';
                if (comp.CompEarlyOptions?.length > 0) {
                    earlyCompHTML = comp.CompEarlyOptions.slice(0, 2).map(opt => {
                        const teamHTML = opt.team_comp.map(c => {
                            const cData = masterChamps[cleanName(c)];
                            const img = cData ? cData.image : '/Asset/logo/logo.png';
                            let borderColor = 'border-slate-400 dark:border-slate-600';
                            if (cData) {
                                if (cData.cost === 2) borderColor = 'border-emerald-500';
                                if (cData.cost === 3) borderColor = 'border-blue-500';
                                if (cData.cost === 4) borderColor = 'border-purple-500';
                                if (cData.cost === 5) borderColor = 'border-yellow-400';
                            }
                            return `
                                        <div class="flex flex-col items-center w-9 sm:w-10 shrink-0 cursor-pointer group/early" onclick="window.openChampModalFromComp('${window.escapeJS(c)}')">
                                        <div class="w-full h-9 sm:h-10 aspect-square rounded-[4px] border-[1.5px] ${borderColor} overflow-hidden bg-black shadow-md transition-transform group-hover/early:-translate-y-1">
                                                    <img src="${img}" class="w-full h-full object-cover object-[80%]" ${onErrorFallback}>
                                            </div>
                                            <span class="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate w-full text-center mt-1 group-hover/early:text-premium-gold transition-colors">${c}</span>
                                        </div>
                                    `;
                        }).join('');

                        return `
                                    <div class="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] p-2 rounded-lg border border-slate-200 dark:border-white/5">
                                        <div class="flex gap-2 items-start flex-nowrap overflow-x-auto no-scrollbar pb-1 pt-1">${teamHTML}</div>
                                        <div class="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20 shrink-0 ml-3 self-center">
                                            <i class="fa-solid fa-trophy text-[8px] text-emerald-600 dark:text-emerald-400"></i>
                                            <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 leading-none">${opt.win_rate}</span>
                                        </div>
                                    </div>
                                `;
                    }).join('');
                    earlyCompHTML = `<div class="flex flex-col gap-2">${earlyCompHTML}</div>`;
                }

                let boardHTML = '<p class="text-[10px] text-slate-500 italic flex items-center justify-center h-full">Không có dữ liệu xếp cờ.</p>';
                if (comp.BoardPositions && comp.BoardPositions.length > 0) {
                    const champHexesHTML = comp.BoardPositions.map(pos => {
                        const cData = masterChamps[cleanName(pos.champion)];
                        const img = cData ? cData.image : '/Asset/logo/logo.png';
                        let bgBorder = 'bg-slate-400 dark:bg-slate-600';
                        if (cData) {
                            if (cData.cost === 2) bgBorder = 'bg-emerald-500';
                            if (cData.cost === 3) bgBorder = 'bg-blue-500';
                            if (cData.cost === 4) bgBorder = 'bg-purple-500';
                            if (cData.cost === 5) bgBorder = 'bg-yellow-400';
                        }
                        const isOddRow = pos.coordinates.row % 2 !== 0;
                        const left = pos.coordinates.col * 13.33 + (isOddRow ? 6.66 : 0);
                        const top = pos.coordinates.row * 23.07;

                        return `
                                    <div class="absolute w-[13.33%] h-[30.76%] z-10 transition-transform hover:scale-110 scale-[0.92] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] cursor-pointer" 
                                         style="left: ${left}%; top: ${top}%;" title="${pos.champion}" onclick="window.openChampModalFromComp('${window.escapeJS(pos.champion)}')">
                                        <div class="w-full h-full p-[2px] ${bgBorder}" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                                            <img src="${img}" class="w-full h-full object-cover object-[80%] bg-slate-900" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);" ${onErrorFallback}>
                                        </div>
                                    </div>
                                `;
                    }).join('');

                    boardHTML = `
                                <div class="relative w-full max-w-[340px] mx-auto aspect-[2/1] bg-slate-100 dark:bg-[#0B101A] rounded-xl overflow-hidden shadow-inner p-1.5 border border-slate-300 dark:border-white/5">
                                    ${emptyHexesHTML}
                                    ${champHexesHTML}
                                </div>
                            `;
                }

                let levelingHTML = '<span class="text-[10px] text-slate-500 italic">Không có dữ liệu.</span>';
                if (comp.CompQuickStart?.leveling?.length > 0) {
                    levelingHTML = `<div class="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">` +
                        comp.CompQuickStart.leveling.map((lvl, index) => `
                                <div class="flex items-center">
                                    <div class="flex flex-col items-center bg-slate-100 dark:bg-black/40 px-1.5 py-0.5 rounded shadow-inner border border-slate-200 dark:border-white/5">
                                        <span class="text-[8.5px] font-bold text-slate-800 dark:text-slate-300 leading-tight">${lvl.level}</span>
                                        <span class="text-[9px] text-premium-gold font-black leading-tight">${lvl.stage}</span>
                                    </div>
                                    ${index < comp.CompQuickStart.leveling.length - 1 ? `<div class="w-2 h-[1px] bg-slate-300 dark:bg-slate-700 mx-1"></div>` : ''}
                                </div>
                            `).join('') + `</div>`;
                }

                let copyCodeHTML = '';
                const codeToCopy = comp.CopyTeamCode || comp.shareCode;
                if (codeToCopy) {
                    const btnId = `copy-btn-${compIndex}`;
                    copyCodeHTML = `
                                <div class="flex items-center gap-2 copy-btn-container shrink-0 lg:ml-auto z-20">
                                    ${comp.shareCode ? `<span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5 shadow-inner hidden sm:block">ID: ${window.escapeHTML(comp.shareCode)}</span>` : ''}
                                    <button id="${btnId}" onclick="window.copyToClipboard('${window.escapeJS(window.escapeHTML(codeToCopy))}', '${btnId}')" 
                                        class="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-premium-gold dark:hover:bg-premium-gold hover:text-slate-800 dark:hover:text-black text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all shadow-sm outline-none">
                                        <i class="fa-regular fa-clone"></i> Sao chép
                                    </button>
                                </div>
                            `;
                }

                return `
                            <div class="comp-card bg-white dark:bg-[#0e1420]/95 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-premium-gold/50 dark:hover:border-premium-gold/40 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
                                <div class="absolute -inset-10 bg-premium-gold/5 blur-3xl z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="flex flex-col xl:flex-row gap-2 xl:gap-5 p-3.5 relative z-10">
                                    
                                    <div class="flex flex-col gap-1 xl:w-[180px] shrink-0 justify-center">
                                        <div class="flex gap-1.5 flex-wrap">${tagsHTML}</div>
                                        <h3 class="text-[15px] font-black text-slate-800 dark:text-white transition-colors leading-tight tracking-wide drop-shadow-sm">${window.escapeHTML(comp.CompTitle)}</h3>
                                    </div>
                                    
                                    <div class="flex flex-wrap items-start content-start gap-2 sm:gap-2.5 w-full xl:w-auto xl:flex-1 min-w-0 pt-1  xl:pb-0">
                                        ${unitsHTML}
                                    </div>
                                    
                                    <div class="flex items-center gap-2 shrink-0 ml-auto border-t xl:border-t-0 border-slate-100 dark:border-white/5 pt-2 xl:pt-0 w-full xl:w-auto justify-between xl:justify-end">
                                       ${copyCodeHTML}
                                       <button onclick="window.toggleCompDetails(this)" class="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-colors hover:bg-premium-gold/20 outline-none">
                                            <i class="fa-solid fa-chevron-down text-slate-500 dark:text-slate-400 text-[11px] expand-icon transition-transform duration-300 hover:text-premium-gold"></i>
                                       </button>
                                    </div>
                                </div>
                                
                                <div class="comp-details hidden border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#05080d]/60 p-4 relative z-10 transition-colors">
                                    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
                                        
                                        <div class="xl:col-span-7 flex flex-col gap-5">
                                            <div>
                                                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i class="fa-solid fa-shapes"></i> Kích hoạt Tộc Hệ</div>
                                                <div class="flex flex-wrap gap-1.5">${traitsHTML}</div>
                                            </div>
                                            
                                            <div>
                                                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i class="fa-solid fa-ring"></i> Đi Chợ</div>
                                                ${carouselHTML}
                                            </div>

                                            <div>
                                                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i class="fa-solid fa-chess-board"></i> Đội Hình Đầu Game</div>
                                                ${earlyCompHTML}
                                            </div>
                                        </div>

                                        <div class="xl:col-span-5 flex flex-col gap-5">
                                            
                                            <div class="flex flex-col gap-2">
                                                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 xl:justify-center mb-1">
                                                    <i class="fa-solid fa-map-location-dot"></i> Xếp Vị Trí
                                                </div>
                                                <div class="flex-1 flex items-start justify-center">
                                                    ${boardHTML}
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
                                                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 xl:justify-center">
                                                    <i class="fa-solid fa-arrow-up-right-dots"></i> Nhịp Lên Cấp
                                                </div>
                                                <div class="xl:flex xl:justify-center">
                                                    ${levelingHTML}
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        `;
            }).join('');
        };

        window.copyToClipboard = (text, btnId) => {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    const originalHTML = btn.innerHTML;
                    const originalClass = btn.className;
                    btn.className = "flex items-center justify-center gap-1.5 bg-emerald-500 text-white border border-emerald-400 px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)] z-20 relative";
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Đã chép`;
                    setTimeout(() => {
                        btn.className = originalClass;
                        btn.innerHTML = originalHTML;
                    }, 1500);
                }
            }).catch(err => console.error('Lỗi Copy: ', err));
        };

        const searchInput = document.getElementById('search-comp');
        const clearBtn = document.getElementById('clear-search-comp');

        searchInput.addEventListener('input', window.debounce((e) => {
            const val = e.target.value;
            searchQuery = val;
            clearBtn.classList.toggle('hidden', val.length === 0);
            renderComps();
        }, 300));

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearBtn.classList.add('hidden');
            searchInput.focus();
            renderComps();
        });

        document.querySelectorAll('.filter-source-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                if (activeSourceUrl === url) return;

                activeSourceUrl = url;
                document.querySelectorAll('.filter-source-btn').forEach(b => {
                    b.className = "filter-source-btn shrink-0 px-3.5 py-1.5 rounded-full border text-[10.5px] font-bold transition-all shadow-sm flex items-center gap-1.5 outline-none bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10";
                });
                e.currentTarget.className = "filter-source-btn shrink-0 px-3.5 py-1.5 rounded-full border text-[10.5px] font-bold transition-all shadow-sm flex items-center gap-1.5 outline-none bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]";

                fetchAndRenderComps(url);
            });
        });

        fetchAndRenderComps(activeSourceUrl);

    } catch (error) {
        gridContainer.innerHTML = `<div class="p-4 text-center text-red-400 text-sm border border-red-900/50 bg-red-900/10 rounded-xl">Lỗi tải dữ liệu Đội Hình: ${error.message}</div>`;
    }
}

// ---------------------------------------------------------
// HÀM QUẢN LÝ (ADMIN) - FIREBASE AUTH & XÓA ĐỘI HÌNH
// ---------------------------------------------------------
async function loadAdminData() {
    const container = document.getElementById('grid-admin');
    if (!container) return;

    // Xây dựng giao diện: 1 form đăng nhập (ẩn khi đã login), 1 danh sách đội hình (hiện khi đã login)
    container.innerHTML = `
                <div class="flex flex-col relative min-h-[60vh] w-full">
                    
                    <div id="admin-auth-section" class="w-full max-w-sm mx-auto mt-10 bg-white dark:bg-premium-card p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 hidden transition-all">
                        <div class="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <i class="fa-solid fa-lock text-xl"></i>
                        </div>
                        <h2 class="text-lg font-black text-slate-800 dark:text-white mb-5 text-center uppercase tracking-wider">Xác thực Quản trị</h2>
                        
                        <div class="flex flex-col gap-3">
                            <input type="email" id="admin-email" placeholder="Email Admin" class="w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-premium-gold dark:focus:border-premium-gold text-[13px] text-slate-800 dark:text-white shadow-inner transition-colors">
                            <input type="password" id="admin-pw" placeholder="Mật khẩu" class="w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-premium-gold dark:focus:border-premium-gold text-[13px] text-slate-800 dark:text-white shadow-inner transition-colors">
                            <button onclick="window.adminLogin()" id="btn-admin-login" class="w-full py-3 mt-2 bg-premium-gold text-black text-[13px] font-bold rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none">
                                Đăng Nhập
                            </button>
                        </div>
                    </div>

                    <div id="admin-dashboard-section" class="w-full hidden flex-col gap-4">
                        <div class="flex justify-between items-center bg-white dark:bg-premium-card p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-shield-halved text-emerald-500 text-lg"></i>
                                <span class="font-black text-[13px] sm:text-sm text-slate-800 dark:text-white uppercase tracking-wide">Quản lý Cộng Đồng</span>
                            </div>
                            <button onclick="window.adminLogout()" class="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:hover:bg-rose-500 border border-slate-200 dark:border-white/10 rounded-lg text-[10.5px] font-bold transition-colors outline-none shadow-sm">
                                Đăng Xuất <i class="fa-solid fa-right-from-bracket ml-1"></i>
                            </button>
                        </div>

                        <div class="bg-white dark:bg-premium-card rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-1">
                            <div class="grid grid-cols-12 gap-2 p-3 border-b border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <div class="col-span-6 sm:col-span-5">Đội Hình</div>
                                <div class="col-span-4 sm:col-span-3 text-center">ID / Mã code</div>
                                <div class="hidden sm:block sm:col-span-3 text-right">Ngày Tạo</div>
                                <div class="col-span-2 sm:col-span-1 text-center">Hành động</div>
                            </div>
                            <div id="admin-comps-list" class="flex flex-col max-h-[60vh] overflow-y-auto no-scrollbar"></div>
                        </div>
                    </div>

                </div>
            `;

    const authSection = document.getElementById('admin-auth-section');
    const dashSection = document.getElementById('admin-dashboard-section');
    const compsList = document.getElementById('admin-comps-list');

    // Lắng nghe trạng thái đăng nhập
    window._onAuthStateChanged(window._auth, (user) => {
        if (user) {
            authSection.classList.add('hidden');
            dashSection.classList.remove('hidden');
            dashSection.classList.add('flex');
            window.fetchAdminComps();
        } else {
            authSection.classList.remove('hidden');
            dashSection.classList.add('hidden');
            dashSection.classList.remove('flex');
            compsList.innerHTML = '';
        }
    });

    // Logic Đăng Nhập
    window.adminLogin = async () => {
        const email = document.getElementById('admin-email').value;
        const pw = document.getElementById('admin-pw').value;
        const btn = document.getElementById('btn-admin-login');
        if (!email || !pw) return uiAlert('Lỗi', 'Vui lòng nhập Email và Mật khẩu!', 'error');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang kết nối...';
        try {
            await window._signIn(window._auth, email, pw);
            uiAlert('Thành công', 'Truy cập quyền Quản Trị Viên thành công!', 'info');
            document.getElementById('admin-pw').value = '';
        } catch (e) {
            uiAlert('Lỗi Đăng Nhập', 'Sai tài khoản hoặc mật khẩu. Hoặc tài khoản chưa được tạo.', 'error');
        }
        btn.disabled = false;
        btn.innerText = 'Đăng Nhập';
    };

    // Logic Đăng Xuất
    window.adminLogout = async () => {
        uiConfirm('Đăng Xuất', 'Bạn có chắc chắn muốn thoát quyền quản trị?', async () => {
            await window._signOut(window._auth);
        });
    };

    // Lấy danh sách đội hình
    window.fetchAdminComps = async () => {
        compsList.innerHTML = '<div class="py-10 flex flex-col items-center justify-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><span class="text-[11px]">Đang lấy dữ liệu...</span></div>';
        try {
            const q = window._fsQuery(window._fsCol(window._db, "shared_comps"), window._fsOrderBy("createdAt", "desc"));
            const snap = await window._fsGetDocs(q);
            let html = '';

            snap.forEach(doc => {
                const data = doc.data();
                const date = new Date(data.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const title = data.CompTitle || 'Đội Hình Tự Tạo';
                const code = data.shareCode || 'Unknown';

                html += `
                            <div class="grid grid-cols-12 gap-2 items-center p-3 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <div class="col-span-6 sm:col-span-5 flex flex-col min-w-0 pr-2">
                                    <span class="text-[12px] font-bold text-slate-800 dark:text-white truncate">${window.escapeHTML(title)}</span>
                                    <span class="text-[9px] text-slate-400 sm:hidden block mt-0.5">${date}</span>
                                </div>
                                <div class="col-span-4 sm:col-span-3 text-center">
                                    <span class="bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 px-2 py-1 rounded text-premium-gold font-mono text-[9px] select-all">${window.escapeHTML(code)}</span>
                                </div>
                                <div class="hidden sm:block sm:col-span-3 text-right">
                                    <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${date}</span>
                                </div>
                                <div class="col-span-2 sm:col-span-1 flex justify-center">
                                    <button onclick="window.deleteAdminComp('${doc.id}', '${window.escapeJS(title)}')" class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors outline-none shadow-sm group-hover:border-rose-500/30" title="Xóa">
                                        <i class="fa-solid fa-trash-can text-[11px]"></i>
                                    </button>
                                </div>
                            </div>
                        `;
            });

            if (!html) html = '<div class="py-10 text-center"><i class="fa-solid fa-folder-open text-3xl text-slate-300 dark:text-slate-600 mb-2 block"></i><span class="text-[11px] text-slate-500">Chưa có đội hình nào.</span></div>';
            compsList.innerHTML = html;

        } catch (e) {
            compsList.innerHTML = '<div class="py-10 flex flex-col items-center justify-center text-rose-500"><i class="fa-solid fa-circle-xmark text-2xl mb-2"></i><span class="text-[11px]">Lỗi kết nối hoặc không có quyền đọc Firestore!</span></div>';
        }
    };

    // Logic Xóa 1 Đội hình
    window.deleteAdminComp = (docId, title) => {
        uiConfirm('Xóa Đội Hình', `Xóa vĩnh viễn đội hình <b class="text-rose-500">${title}</b> khỏi cơ sở dữ liệu cộng đồng?`, async () => {
            try {
                await window._fsDeleteDoc(window._fsDoc(window._db, "shared_comps", docId));
                uiAlert('Thành công', 'Đã xóa đội hình!', 'info');
                window.fetchAdminComps(); // Load lại bảng
            } catch (e) {
                uiAlert('Lỗi', 'Không thể xóa. Vui lòng kiểm tra Security Rules trên Firebase.', 'error');
            }
        });
    };
}

// ---------------------------------------------------------
// HÀM ỦNG HỘ (DONATE) - QR, MOMO, PAYPAL
// ---------------------------------------------------------
function loadDonateData() {
    const container = document.getElementById('grid-donate');
    if (!container) return;

    // DỮ LIỆU CỦA BẠN (Hãy thay đổi thông tin ở đây)
    const donateInfo = {
        momo: {
            name: "BVBank",
            number: "99MM24030M09540726",
            owner: "MOMO_DINH MANH HUNG",
            qr: "./Asset/QR/QR-VietQR-BVBank.png", // Đường dẫn ảnh QR của bạn
            color: "bg-[#A50064]"
        },
        // bank: {
        //     name: "Ngân hàng (MB Bank)",
        //     number: "123456789",
        //     owner: "ĐINH MẠNH HÙNG",
        //     qr: "./Asset/QR/bank_qr.png",
        //     color: "bg-[#004A9C]"
        // },
        // paypal: {
        //     name: "PayPal",
        //     number: "your-email@gmail.com",
        //     link: "https://paypal.me/yourid",
        //     color: "bg-[#003087]"
        // }
    };

    container.innerHTML = `
                <div class="max-w-4xl mx-auto py-6 px-2 flex flex-col gap-8">
                    <div class="text-center space-y-3">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mb-2">
                            <i class="fa-solid fa-heart text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Ủng hộ dự án</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed italic">
                            Sự đóng góp của bạn giúp mình có thêm động lực để duy trì server và cập nhật dữ liệu TFT Wiki mỗi mùa. Cảm ơn các bạn rất nhiều!
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div class="bg-white dark:bg-premium-card rounded-3xl border border-slate-200 dark:border-white/5 p-5 shadow-xl flex flex-col items-center text-center group">
                            <div class="w-12 h-12 ${donateInfo.momo.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                                <i class="fa-solid fa-mobile-screen-button text-xl"></i>
                            </div>
                            <h3 class="font-black text-slate-800 dark:text-white mb-1">${donateInfo.momo.name}</h3>
                            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-4">${donateInfo.momo.owner}</p>
                            
                            <img src="${donateInfo.momo.qr}" class="w-40 h-40 rounded-xl mb-4 border-4 border-slate-100 dark:border-white/5 bg-white p-1" alt="Momo QR">
                            
                            <button onclick="window.copyDonateText('${donateInfo.momo.number}', 'btn-momo')" id="btn-momo" class="w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black border border-slate-200 dark:border-white/10 hover:bg-rose-500 hover:text-white transition-all outline-none">
                                ${donateInfo.momo.number} <i class="fa-regular fa-copy ml-1"></i>
                            </button>
                        </div>


                        

                    </div>

                    <p class="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">
                        Thank you for your support!
                    </p>
                </div>
            `;

    // Hàm copy chuyên dụng cho Donate
    window.copyDonateText = (text, btnId) => {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById(btnId);
            const oldHTML = btn.innerHTML;
            btn.classList.add('!bg-emerald-500', '!text-white', '!border-emerald-500');
            btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> ĐÃ SAO CHÉP';
            setTimeout(() => {
                btn.classList.remove('!bg-emerald-500', '!text-white', '!border-emerald-500');
                btn.innerHTML = oldHTML;
            }, 2000);
        });
    };
}
