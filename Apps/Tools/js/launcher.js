// js/launcher.js
import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';
import { getGridColumns } from './device.js';
import { getRecentToolIds, getToolData } from './app-manager.js';
import { isPureMinimal } from './settings.js';

let isCompactGridMode = localStorage.getItem('hunqos_compact_grid') === 'true';
let minimalSelectedCategory = 'all';
let currentPageIndex = 0;
let totalPages = 1;

function resolveColorCss(colorValue, isBackground = true) {
    if (!colorValue || typeof colorValue !== 'string') return '';
    const trimmed = colorValue.trim();
    const isGrad = trimmed.includes('gradient(');
    if (isBackground) return isGrad ? `background-image: ${trimmed};` : `background-color: ${trimmed};`;
    return isGrad ? `background-image: ${trimmed};` : `color: ${trimmed};`;
}

export function computeIconStyles(tool) {
    const rawColor = tool.bgColor || tool.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
    const bgStyle = resolveColorCss(rawColor, true);
    const iconStyle = `color: ${tool.iconColor || '#ffffff'};`;
    return { bgStyle, iconStyle, iconClass: '' };
}

function createLayoutFromCategories() {
    const layout = {};
    let pageIdx = 0;

    CONFIG_CATEGORIES.forEach(cat => {
        const catTools = TOOLS.filter(t => t.catId === cat.id).map(t => t.id);
        if (catTools.length > 0) {
            for (let i = 0; i < catTools.length; i += 16) {
                const subPart = catTools.length > 16 ? ` (${Math.floor(i / 16) + 1})` : '';
                layout[pageIdx] = {
                    catId: cat.id,
                    title: `${cat.name}${subPart}`,
                    icon: cat.icon || 'fas fa-cube',
                    tools: catTools.slice(i, i + 16)
                };
                pageIdx++;
            }
        }
    });

    const assignedIds = new Set(Object.values(layout).flatMap(p => p.tools));
    const remainingTools = TOOLS.filter(t => !assignedIds.has(t.id)).map(t => t.id);
    if (remainingTools.length > 0) {
        layout[pageIdx] = { catId: 'other', title: 'Khác', icon: 'fas fa-th-large', tools: remainingTools };
    }
    return layout;
}

function getStoredPageLayout() {
    const raw = localStorage.getItem('hunqos_page_layout_v22');
    if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
    }
    return createLayoutFromCategories();
}

let pageLayout = getStoredPageLayout();
let selectedOrganizerPage = 0;
let selectedToolsForBatch = new Set();

function savePageLayout() {
    localStorage.setItem('hunqos_page_layout_v22', JSON.stringify(pageLayout));
}

function getPageCount() {
    if (isCompactGridMode) return 1;
    const keys = Object.keys(pageLayout).map(Number);
    return Math.max(1, keys.length > 0 ? Math.max(...keys) + 1 : 1);
}

export function goToPage(index) {
    const viewport = document.getElementById('launcher-viewport');
    if (!viewport) return;
    currentPageIndex = Math.max(0, Math.min(index, totalPages - 1));
    viewport.scrollTo({
        left: currentPageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
    renderPageDots();
}

export function getTargetHomePageIndex() {
    return (!isCompactGridMode && totalPages > 1) ? 1 : 0;
}

const pageDotsWrapper = document.getElementById('page-dots-wrapper');
let dotsCollapseTimeout = null;

function expandPageDots() {
    if (!pageDotsWrapper) return;
    pageDotsWrapper.classList.add('expanded');
    clearTimeout(dotsCollapseTimeout);
    dotsCollapseTimeout = setTimeout(() => {
        pageDotsWrapper.classList.remove('expanded');
    }, 3500);
}

function renderPageDots() {
    const pageDotsContainer = document.getElementById('page-dots');
    if (!pageDotsContainer) return;
    pageDotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        const isActive = i === currentPageIndex;
        dot.className = `page-dot-btn ${isActive ? 'active' : 'inactive'}`;

        let iconClass = 'fas fa-house';
        let labelTitle = 'Gợi ý & Gần đây';

        if (isCompactGridMode) {
            iconClass = 'fas fa-border-all';
            labelTitle = 'Toàn bộ ứng dụng';
        } else if (i > 0) {
            const pageData = pageLayout[i - 1];
            iconClass = pageData?.icon || 'fas fa-cube';
            labelTitle = pageData?.title || `Trang ${i}`;
        }

        dot.title = labelTitle;
        dot.innerHTML = `<i class="${iconClass}"></i>`;
        dot.onclick = (e) => {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (isTouch && pageDotsWrapper && !pageDotsWrapper.classList.contains('expanded')) {
                e.stopPropagation();
                expandPageDots();
                return;
            }
            goToPage(i);
        };
        pageDotsContainer.appendChild(dot);
    }
}

export function initHomescreenPages() {
    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (!pagesSlider) return;
    const cols = getGridColumns();
    pagesSlider.innerHTML = '';

    if (isCompactGridMode) {
        totalPages = 1;
        const pageEl = document.createElement('div');
        pageEl.className = 'launcher-page no-scrollbar space-y-6';

        const recentIds = getRecentToolIds();
        const recentTools = recentIds.map(id => getToolData(id)).filter(Boolean);

        let html = '';
        if (recentTools.length > 0) {
            html += `
                <div class="w-full max-w-4xl">
                    <div class="suggestion-section-title">
                        <span><i class="fas fa-history mr-1 text-accent-theme"></i> Đã dùng gần đây</span>
                    </div>
                    <div class="grid-layer-container mb-4" style="grid-template-columns: repeat(${cols}, 1fr)">
                        ${recentTools.map(tool => {
                            const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                            return `
                                <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                                    <div class="app-icon-box" style="${bgStyle}">
                                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                                    </div>
                                    <span class="app-icon-label">${tool.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        CONFIG_CATEGORIES.forEach(cat => {
            const catTools = TOOLS.filter(t => t.catId === cat.id);
            if (catTools.length === 0) return;
            html += `
                <div class="w-full max-w-4xl">
                    <div class="page-category-header">
                        <div class="page-category-badge">
                            <i class="${cat.icon || 'fas fa-cube'}"></i>
                            <span>${cat.name}</span>
                        </div>
                        <span class="page-category-count">${catTools.length} ứng dụng</span>
                    </div>
                    <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
                        ${catTools.map(tool => {
                            const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                            return `
                                <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                                    <div class="app-icon-box" style="${bgStyle}">
                                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                                    </div>
                                    <span class="app-icon-label">${tool.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        pageEl.innerHTML = html;
        pagesSlider.appendChild(pageEl);
        renderPageDots();
        renderPageOrganizer();
        return;
    }

    const rawPageCount = getPageCount();
    totalPages = 1 + rawPageCount;

    // Trang 0: Gợi ý & gần đây
    const pageZeroEl = document.createElement('div');
    pageZeroEl.className = 'launcher-page no-scrollbar';

    const recentIds = getRecentToolIds();
    const recentTools = recentIds.map(id => getToolData(id)).filter(Boolean);
    const suggestedTools = TOOLS.slice(0, cols * 2);

    let p0Html = `
        <div class="page-category-header">
            <div class="page-category-badge">
                <i class="fas fa-house text-amber-400"></i>
                <span>Gợi ý & Gần đây</span>
            </div>
            <span class="page-category-count">${recentTools.length + suggestedTools.length} ứng dụng</span>
        </div>
    `;

    if (recentTools.length > 0) {
        p0Html += `
            <div class="suggestion-section-title">
                <span><i class="fas fa-history mr-1 text-accent-theme"></i> Đã dùng gần đây</span>
            </div>
            <div class="grid-layer-container mb-4" style="grid-template-columns: repeat(${cols}, 1fr)">
                ${recentTools.map(tool => {
                    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                    return `
                        <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                            <div class="app-icon-box" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                            </div>
                            <span class="app-icon-label">${tool.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    p0Html += `
        <div class="suggestion-section-title">
            <span><i class="fas fa-compass mr-1 text-blue-400"></i> Tiện ích đề xuất</span>
        </div>
        <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
            ${suggestedTools.map(tool => {
                const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                return `
                    <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                        <div class="app-icon-box" style="${bgStyle}">
                            <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                        </div>
                        <span class="app-icon-label">${tool.name}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    pageZeroEl.innerHTML = p0Html;
    pagesSlider.appendChild(pageZeroEl);

    // Trang 1 trở đi: Theo danh mục
    for (let p = 0; p < rawPageCount; p++) {
        const pageData = pageLayout[p] || { title: `Trang ${p + 1}`, icon: 'fas fa-cube', tools: [] };
        const pageEl = document.createElement('div');
        pageEl.className = 'launcher-page no-scrollbar';

        const toolIds = pageData.tools || [];
        pageEl.innerHTML = `
            <div class="page-category-header">
                <div class="page-category-badge">
                    <i class="${pageData.icon || 'fas fa-cube'}"></i>
                    <span>${pageData.title || `Trang ${p + 1}`}</span>
                </div>
                <span class="page-category-count">${toolIds.length} ứng dụng</span>
            </div>
            <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
                ${toolIds.map(toolId => {
                    const tool = getToolData(toolId);
                    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                    return `
                        <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                            <div class="app-icon-box" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                            </div>
                            <span class="app-icon-label">${tool.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        pagesSlider.appendChild(pageEl);
    }

    renderPageDots();
    renderPageOrganizer();
}

function renderPageOrganizer() {
    const tabsContainer = document.getElementById('page-organizer-tabs');
    const listContainer = document.getElementById('page-organizer-list');
    const targetPageSelect = document.getElementById('batch-target-page-select');
    const countBadge = document.getElementById('selected-count-badge');
    const selectAllBtnText = document.getElementById('btn-select-all-text');

    if (!tabsContainer || !listContainer) return;

    const numPages = getPageCount();
    if (selectedOrganizerPage >= numPages) selectedOrganizerPage = 0;

    tabsContainer.innerHTML = Array.from({ length: numPages }, (_, i) => {
        const isSelected = i === selectedOrganizerPage;
        const pageData = pageLayout[i] || { title: `Trang ${i + 1}`, tools: [] };
        return `
            <button onclick="window.selectOrganizerPage(${i})" 
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected ? 'bg-accent-theme text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'
                }">
                <i class="${pageData.icon || 'fas fa-folder'} text-[10px]"></i>
                <span>${pageData.title || `Trang ${i + 1}`}</span>
                <span class="text-[10px] opacity-70 px-1 rounded-full bg-black/30">${(pageData.tools || []).length}</span>
            </button>
        `;
    }).join('');

    if (targetPageSelect) {
        targetPageSelect.innerHTML = Array.from({ length: numPages }, (_, i) => {
            if (i === selectedOrganizerPage) return '';
            const pTitle = pageLayout[i]?.title || `Trang ${i + 1}`;
            return `<option value="${i}">Tới: ${pTitle}</option>`;
        }).join('');
    }

    const currentPageData = pageLayout[selectedOrganizerPage] || { title: `Trang ${selectedOrganizerPage + 1}`, tools: [] };
    const currentToolIds = currentPageData.tools || [];

    let headerHtml = `
        <div class="flex items-center gap-2 mb-2.5 p-2 bg-black/40 rounded-lg border border-white/5">
            <span class="text-xs text-white/50 shrink-0">Đổi tên trang:</span>
            <input type="text" value="${currentPageData.title || ''}" 
                   onchange="window.renamePageCategory(${selectedOrganizerPage}, this.value)"
                   placeholder="Nhập tên trang..." 
                   class="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-theme">
        </div>
    `;

    if (countBadge) countBadge.textContent = `Đã chọn ${selectedToolsForBatch.size} app`;

    if (selectAllBtnText) {
        const allSelected = currentToolIds.length > 0 && currentToolIds.every(id => selectedToolsForBatch.has(id));
        selectAllBtnText.textContent = allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
    }

    if (currentToolIds.length === 0) {
        listContainer.innerHTML = headerHtml + `
            <div class="py-8 text-center text-white/40 text-xs flex flex-col items-center justify-center gap-2">
                <i class="far fa-folder-open text-xl opacity-50"></i>
                <span>Trang này chưa có ứng dụng nào</span>
                ${numPages > 1 ? `
                    <button onclick="window.removeEmptyPage(${selectedOrganizerPage})" 
                        class="mt-1 px-3 py-1 rounded bg-red-500/20 text-red-400 text-[11px] hover:bg-red-500/30">
                        Xóa trang rỗng này
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    listContainer.innerHTML = headerHtml + `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${currentToolIds.map((id) => {
                const tool = getToolData(id);
                const isSelected = selectedToolsForBatch.has(id);
                const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);

                return `
                    <div onclick="window.toggleToolSelection('${id}')" 
                         class="organizer-item-card flex items-center justify-between p-2 rounded-xl bg-black/40 border ${isSelected ? 'selected' : 'border-white/5'} text-xs cursor-pointer select-none">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-accent-theme border-accent-theme text-white' : 'border-white/20 text-transparent'} text-[10px]">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass} text-xs" style="${iconStyle}"></i>
                            </div>
                            <span class="truncate font-medium text-white/90">${tool.name}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

export function renderDock() {
    const DEFAULT_DOCK = [
        { type: 'tool', id: 'home' },
        { type: 'action', action: 'spotlight', icon: 'fas fa-search', name: 'Tìm kiếm' },
        { type: 'action', action: 'multitask', icon: 'fas fa-layer-group', name: 'Cửa sổ' },
        { type: 'action', action: 'settings', icon: 'fas fa-cog', name: 'Cài đặt' }
    ];

    let dockList = JSON.parse(localStorage.getItem('hunqos_dock_items')) || DEFAULT_DOCK;
    const container = document.getElementById('dock-items-container');
    if (!container) return;

    container.innerHTML = dockList.map(item => {
        if (item.type === 'action') {
            let onclickAttr = item.action === 'spotlight' ? 'window.openSpotlight()' : (item.action === 'multitask' ? 'window.openMultitasking()' : 'window.openSettings()');
            let bgClass = item.action === 'multitask' ? 'bg-accent-theme text-white' : 'bg-zinc-800 text-white';
            return `
                <button onclick="${onclickAttr}" class="dock-item ${bgClass} flex items-center justify-center text-lg active:scale-95 transition-transform" title="${item.name}">
                    <i class="${item.icon}"></i>
                </button>
            `;
        }

        const tool = getToolData(item.id);
        if (item.id === 'home') {
            return `
                <button onclick="window.goHome()" class="dock-item bg-white text-zinc-900 flex items-center justify-center text-lg active:scale-95 transition-transform" title="${tool.name}">
                    <i class="${tool.icon}"></i>
                </button>
            `;
        }

        const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
        return `
            <button onclick="window.openToolGlobal('${item.id}')" class="dock-item flex items-center justify-center text-lg active:scale-95 transition-transform border border-white/20 shadow-md" style="${bgStyle}" title="${tool.name}">
                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
            </button>
        `;
    }).join('');
}

// Pure Minimal Functions
export function updatePureMinimalClock() {
    const clock = document.getElementById('minimal-clock');
    const date = document.getElementById('minimal-date');
    const now = new Date();
    if (clock) clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (date) {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        date.textContent = `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
    }
}

function renderPureMinimalCategories() {
    const tabContainer = document.getElementById('minimal-category-tabs');
    if (!tabContainer) return;
    const allCats = [{ id: 'all', name: 'Tất cả', icon: 'fas fa-border-all' }, ...CONFIG_CATEGORIES];

    tabContainer.innerHTML = allCats.map(cat => {
        const isActive = minimalSelectedCategory === cat.id;
        return `
            <button onclick="window.filterMinimalCategory('${cat.id}')" 
                    class="flat-category-chip ${isActive ? 'active' : ''}">
                <i class="${cat.icon || 'fas fa-folder'} mr-1.5 text-[11px]"></i>
                <span>${cat.name}</span>
            </button>
        `;
    }).join('');
}

function renderPureMinimalAppList(filterText = '') {
    const listEl = document.getElementById('minimal-app-list');
    const countBadge = document.getElementById('minimal-count-badge');
    const titleEl = document.getElementById('minimal-section-title');
    if (!listEl) return;

    const query = filterText.trim().toLowerCase();
    let filtered = TOOLS.filter(t => {
        const matchesQuery = !query || t.name.toLowerCase().includes(query) || (t.desc && t.desc.toLowerCase().includes(query));
        const matchesCategory = minimalSelectedCategory === 'all' || t.catId === minimalSelectedCategory;
        return matchesQuery && matchesCategory;
    });

    if (countBadge) countBadge.textContent = filtered.length;
    if (titleEl) {
        if (minimalSelectedCategory === 'all') {
            titleEl.textContent = query ? `Kết quả tìm kiếm ("${query}")` : 'Tất cả tiện ích';
        } else {
            const currentCat = CONFIG_CATEGORIES.find(c => c.id === minimalSelectedCategory);
            titleEl.textContent = currentCat ? currentCat.name : 'Danh mục tiện ích';
        }
    }

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full py-16 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                <i class="fas fa-inbox text-2xl opacity-40"></i>
                <span>Không tìm thấy tiện ích phù hợp</span>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(tool => {
        const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
        const catInfo = CONFIG_CATEGORIES.find(c => c.id === tool.catId);
        const catName = catInfo ? catInfo.name : 'Tiện ích';

        return `
            <div class="flat-tool-card" onclick="window.openToolGlobal('${tool.id}')">
                <div class="flat-tool-icon" style="${bgStyle}">
                    <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1.5 mb-1">
                        <div class="text-xs font-semibold text-zinc-100 truncate">${tool.name}</div>
                        <span class="flat-tool-badge">${catName}</span>
                    </div>
                    <div class="text-[11px] text-zinc-400 truncate leading-relaxed">${tool.desc || 'Mở công cụ'}</div>
                </div>
                <i class="fas fa-arrow-up-right-from-square text-[10px] text-zinc-600 shrink-0 ml-1"></i>
            </div>
        `;
    }).join('');
}

export function applyPureMinimalMode(enable) {
    document.body.classList.toggle('pure-minimal-mode', enable);
    const toggleBtn = document.getElementById('toggle-minimal-setting');
    toggleBtn?.classList.toggle('active', enable);
    if (enable) {
        renderPureMinimalCategories();
        renderPureMinimalAppList();
        updatePureMinimalClock();
    }
}

export function initLauncher() {
    window.filterMinimalCategory = (catId) => {
        minimalSelectedCategory = catId;
        renderPureMinimalCategories();
        const searchInput = document.getElementById('minimal-search-input');
        renderPureMinimalAppList(searchInput ? searchInput.value : '');
    };

    document.getElementById('minimal-search-input')?.addEventListener('input', (e) => {
        renderPureMinimalAppList(e.target.value);
    });

    document.getElementById('toggle-minimal-setting')?.addEventListener('click', () => {
        const newState = !(localStorage.getItem('hunqos_pure_minimal') === 'true');
        localStorage.setItem('hunqos_pure_minimal', newState);
        applyPureMinimalMode(newState);
        UI.showAlert('Pure Minimal', newState ? 'Đã bật chế độ Minimal Flat Utility.' : 'Đã trở lại giao diện chuẩn.', 'info');
    });

    const compactToggleBtn = document.getElementById('toggle-compact-setting');
    if (compactToggleBtn) {
        compactToggleBtn.classList.toggle('active', isCompactGridMode);
        compactToggleBtn.addEventListener('click', () => {
            isCompactGridMode = !isCompactGridMode;
            localStorage.setItem('hunqos_compact_grid', isCompactGridMode);
            compactToggleBtn.classList.toggle('active', isCompactGridMode);
            currentPageIndex = 0;
            initHomescreenPages();
            UI.showAlert('Bố cục Launcher', isCompactGridMode ? 'Đã bật chế độ gom gọn toàn bộ app.' : 'Đã phân trang riêng theo từng danh mục.', 'info');
        });
    }

    window.autoOrganizeByCategories = () => {
        pageLayout = createLayoutFromCategories();
        selectedOrganizerPage = 0;
        selectedToolsForBatch.clear();
        savePageLayout();
        initHomescreenPages();
        UI.showAlert('Bố cục', 'Đã tự động gom nhóm ứng dụng theo danh mục.', 'success');
    };

    window.toggleToolSelection = (toolId) => {
        if (selectedToolsForBatch.has(toolId)) selectedToolsForBatch.delete(toolId);
        else selectedToolsForBatch.add(toolId);
        renderPageOrganizer();
    };

    window.toggleSelectAllTools = () => {
        const currentToolIds = pageLayout[selectedOrganizerPage]?.tools || [];
        const allSelected = currentToolIds.length > 0 && currentToolIds.every(id => selectedToolsForBatch.has(id));
        if (allSelected) currentToolIds.forEach(id => selectedToolsForBatch.delete(id));
        else currentToolIds.forEach(id => selectedToolsForBatch.add(id));
        renderPageOrganizer();
    };

    window.applyBatchMove = () => {
        const targetSelect = document.getElementById('batch-target-page-select');
        if (!targetSelect || selectedToolsForBatch.size === 0) {
            UI.showAlert('Lưu ý', 'Hãy chọn ít nhất 1 ứng dụng.', 'warning');
            return;
        }
        const toPage = parseInt(targetSelect.value, 10);
        if (isNaN(toPage) || toPage === selectedOrganizerPage) return;

        if (!pageLayout[selectedOrganizerPage]) pageLayout[selectedOrganizerPage] = { title: `Trang ${selectedOrganizerPage + 1}`, tools: [] };
        if (!pageLayout[toPage]) pageLayout[toPage] = { title: `Trang ${toPage + 1}`, tools: [] };

        const movingIds = Array.from(selectedToolsForBatch);
        pageLayout[selectedOrganizerPage].tools = pageLayout[selectedOrganizerPage].tools.filter(id => !selectedToolsForBatch.has(id));
        pageLayout[toPage].tools.push(...movingIds);

        const movedCount = movingIds.length;
        selectedToolsForBatch.clear();
        savePageLayout();
        initHomescreenPages();
        UI.showAlert('Thành công', `Đã chuyển ${movedCount} app sang ${pageLayout[toPage].title}.`, 'success');
    };

    window.renamePageCategory = (pageIndex, newTitle) => {
        if (!pageLayout[pageIndex]) return;
        pageLayout[pageIndex].title = newTitle.trim() || `Trang ${pageIndex + 1}`;
        savePageLayout();
        initHomescreenPages();
    };

    window.selectOrganizerPage = (p) => {
        selectedOrganizerPage = p;
        selectedToolsForBatch.clear();
        renderPageOrganizer();
    };

    window.addNewPageSetting = () => {
        const nextPageIndex = getPageCount();
        pageLayout[nextPageIndex] = { title: `Trang ${nextPageIndex + 1}`, icon: 'fas fa-folder-plus', tools: [] };
        selectedOrganizerPage = nextPageIndex;
        selectedToolsForBatch.clear();
        savePageLayout();
        initHomescreenPages();
        UI.showAlert('Trang mới', 'Đã thêm trang mới.', 'info');
    };

    window.removeEmptyPage = (pageIndex) => {
        const numPages = getPageCount();
        if (numPages <= 1) return;
        const newLayout = {};
        let newIndex = 0;
        for (let p = 0; p < numPages; p++) {
            if (p !== pageIndex) {
                newLayout[newIndex] = pageLayout[p];
                newIndex++;
            }
        }
        pageLayout = newLayout;
        selectedOrganizerPage = Math.max(0, pageIndex - 1);
        selectedToolsForBatch.clear();
        savePageLayout();
        initHomescreenPages();
    };

    // Lắng nghe sự kiện scroll của launcher viewport
    const launcherViewport = document.getElementById('launcher-viewport');
    if (launcherViewport) {
        let scrollTimeout = null;
        launcherViewport.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const index = Math.round(launcherViewport.scrollLeft / launcherViewport.clientWidth);
                if (index !== currentPageIndex) {
                    currentPageIndex = index;
                    renderPageDots();
                }
            }, 50);
        }, { passive: true });
    }

    if (pageDotsWrapper) {
        pageDotsWrapper.addEventListener('touchstart', expandPageDots, { passive: true });
        document.addEventListener('touchstart', (e) => {
            if (!pageDotsWrapper.contains(e.target)) {
                pageDotsWrapper.classList.remove('expanded');
            }
        }, { passive: true });
    }
}