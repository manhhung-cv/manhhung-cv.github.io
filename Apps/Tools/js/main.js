import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';

// ==========================================
// 0. KHỞI TẠO DANH MỤC & DỮ LIỆU CƠ BẢN
// ==========================================
const CATEGORIES = [...CONFIG_CATEGORIES];
const existingCatIds = CATEGORIES.map(c => c.id);
TOOLS.forEach(tool => {
    if (!existingCatIds.includes(tool.catId)) {
        CATEGORIES.push({
            id: tool.catId, name: tool.catId.charAt(0).toUpperCase() + tool.catId.slice(1),
            icon: 'fas fa-folder', desc: 'Danh mục'
        });
        existingCatIds.push(tool.catId);
    }
});

function getToolData(toolId) {
    if (toolId === 'home') return { id: 'home', name: 'Trang chủ', icon: 'fas fa-home' };
    return TOOLS.find(t => t.id === toolId);
}

// ==========================================
// 1. STATE MANAGEMENT (HỆ THỐNG LƯU TRỮ LOCAL)
// ==========================================
const tabStrip = document.getElementById('tab-strip');
const contentsContainer = document.getElementById('tab-contents-container');
const tabCountBadge = document.getElementById('tab-count-badge');

const savedState = JSON.parse(localStorage.getItem('app_workspace_state'));

let tabCounter = savedState ? savedState.tabCounter : 1;
const state = {
    tabs: savedState ? savedState.tabs : [{ tabId: 'tab-1', toolId: 'home', pinned: false }],
    activeTabId: savedState ? savedState.activeTabId : 'tab-1',
    tabHistory: savedState ? savedState.tabHistory : ['tab-1']
};

function saveState() {
    localStorage.setItem('app_workspace_state', JSON.stringify({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabCounter: tabCounter,
        tabHistory: state.tabHistory
    }));
    if (tabCountBadge) tabCountBadge.textContent = state.tabs.length;
}

// ==========================================
// 2. LOGIC ĐIỀU HƯỚNG & QUẢN LÝ TAB
// ==========================================
async function openTool(toolId, openInNewTab = false) {
    const currentTab = state.tabs.find(t => t.tabId === state.activeTabId);
    let targetTabId;
    
    if (openInNewTab || currentTab.pinned) {
        tabCounter++;
        targetTabId = `tab-${tabCounter}`;
        state.tabs.push({ tabId: targetTabId, toolId: toolId, pinned: false });
    } else {
        targetTabId = state.activeTabId;
        currentTab.toolId = toolId; 
        const oldPane = document.getElementById(`pane-${targetTabId}`);
        if (oldPane) oldPane.remove();
    }

    await renderPane(targetTabId, toolId);
    switchTab(targetTabId);
}

async function renderPane(targetTabId, toolId) {
    let pane = document.getElementById(`pane-${targetTabId}`);
    if (!pane) {
        pane = document.createElement('div');
        pane.id = `pane-${targetTabId}`;
        pane.className = 'view-pane';
        contentsContainer.appendChild(pane);
    }

    const tool = getToolData(toolId);
    if (!tool) return;

    if (toolId === 'home') {
        renderHomeView(targetTabId);
        return;
    }

    const category = CATEGORIES.find(c => c.id === tool.catId) || { name: 'Khác' };
    const breadcrumbsHtml = `
        <nav class="flex items-center gap-2 text-[13px] font-medium text-zinc-500 mb-5 px-2">
            <button onclick="window.openToolGlobal('home')" class="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none">
                <i class="fas fa-home text-[11px]"></i> Trang chủ
            </button>
            <span class="opacity-40">/</span>
            <span class="text-zinc-600 dark:text-zinc-400">${category.name}</span>
            <span class="opacity-40">/</span>
            <span class="text-zinc-900 dark:text-zinc-100">${tool.name}</span>
        </nav>
    `;

    pane.innerHTML = `${breadcrumbsHtml}<div class="flex items-center gap-3 py-32 justify-center text-zinc-400"><i class="fas fa-circle-notch fa-spin text-xl"></i> Đang tải...</div>`;
    
    try {
        const module = await import(`../tools/${toolId}/index.js`);
        pane.innerHTML = `${breadcrumbsHtml}<div class="premium-card bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-6 md:p-10 shadow-sm">${module.template()}</div>`;
        if (module.init) module.init();
    } catch (e) {
        pane.innerHTML = `${breadcrumbsHtml}<div class="p-10 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900">Lỗi tải công cụ: ${e.message}</div>`;
    }
}

function switchTab(tabId) {
    state.activeTabId = tabId;
    if (state.tabHistory[state.tabHistory.length - 1] !== tabId) state.tabHistory.push(tabId);
    
    renderTabs();
    document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) activePane.classList.add('active');
    
    saveState();
}

window.switchTab = switchTab;

window.togglePin = (e, tabId) => {
    e.stopPropagation();
    const tab = state.tabs.find(t => t.tabId === tabId);
    if (tab) {
        tab.pinned = !tab.pinned;
        renderTabs();
        saveState();
    }
};

window.closeTab = (e, tabId) => {
    e.stopPropagation();
    state.tabs = state.tabs.filter(t => t.tabId !== tabId);
    const pane = document.getElementById(`pane-${tabId}`);
    if (pane) pane.remove();

    if (state.tabs.length === 0) {
        openTool('home', true);
        return;
    }

    if (state.activeTabId === tabId) {
        state.tabHistory = state.tabHistory.filter(id => id !== tabId);
        let nextId = state.tabs[state.tabs.length - 1].tabId;
        switchTab(nextId);
    } else {
        renderTabs();
        saveState();
    }
};

window.toggleFavorite = (e, toolId) => {
    e.stopPropagation();
    e.preventDefault();
    let favs = JSON.parse(localStorage.getItem('favTools') || '[]');
    const isAdded = !favs.includes(toolId);

    if (isAdded) favs.push(toolId);
    else favs = favs.filter(id => id !== toolId);
    
    localStorage.setItem('favTools', JSON.stringify(favs));
    
    state.tabs.forEach(t => {
        if (t.toolId === 'home') renderHomeView(t.tabId);
    });

    const tool = getToolData(toolId);
    if (tool) UI.showAlert(isAdded ? 'Đã ghim' : 'Bỏ ghim', isAdded ? `Đã thêm ${tool.name} lên đầu.` : `Đã bỏ ghim ${tool.name}.`, isAdded ? 'success' : 'info');
};
// ==========================================
// 3. RENDERING UI GIAO DIỆN CHÍNH & CHẾ ĐỘ XEM
// ==========================================
let currentViewMode = localStorage.getItem('app_view_mode') || 'detailed'; // 'detailed', 'grid', 'list'

window.changeViewMode = (mode) => {
    currentViewMode = mode;
    localStorage.setItem('app_view_mode', mode);
    
    // Render lại tab hiện tại để áp dụng thay đổi
    const currentTab = state.tabs.find(t => t.tabId === state.activeTabId);
    if (currentTab) {
        if (currentTab.toolId === 'home') {
            renderHomeView(currentTab.tabId);
        } else {
            // Nếu đang ở màn hình category, render lại toàn bộ nội dung pane
            // Lưu ý: Cách an toàn nhất là switchTab lại
            switchTab(state.activeTabId); 
        }
    }
};

function getViewContainerClasses() {
    if (currentViewMode === 'list') return 'flex flex-col gap-2.5'; // Khoảng cách list khít hơn một chút
    // Chế độ Grid: Thu gọn kích thước card -> Tăng số lượng cột trên các màn hình để tối ưu diện tích
    if (currentViewMode === 'grid') return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3';
    // Chế độ Chi tiết (Hiện tại)
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'; 
}



function renderViewToggle() {
    return `
        <div class="flex items-center gap-1 pb-2">
            <button onclick="window.changeViewMode('detailed')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'detailed' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Chi tiết">
                <i class="fas fa-th-large text-[13px]"></i>
            </button>
            <button onclick="window.changeViewMode('grid')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'grid' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Lưới">
                <i class="fas fa-border-all text-[13px]"></i>
            </button>
            <button onclick="window.changeViewMode('list')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'list' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Danh sách">
                <i class="fas fa-list text-[13px]"></i>
            </button>
        </div>
    `;
}

function renderTabs() {
    tabStrip.innerHTML = state.tabs.map(tab => {
        const isActive = state.activeTabId === tab.tabId;
        const tool = getToolData(tab.toolId);
        const activeStyle = isActive 
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border-zinc-200/60 dark:border-zinc-700/60' 
            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-transparent';

        if (tab.pinned) {
            return `
                <div class="group flex items-center justify-center w-11 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer border shrink-0 ${activeStyle} relative" onclick="switchTab('${tab.tabId}')" title="${tool.name} (Đã ghim)">
                    <i class="${tool.icon} text-[12px] ${isActive ? 'text-indigo-500' : 'opacity-70'}"></i>
                    <button class="absolute -right-1.5 -top-1.5 w-4 h-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-sm z-10" onclick="togglePin(event, '${tab.tabId}')">
                        <i class="fas fa-thumbtack text-[8px] rotate-45"></i>
                    </button>
                </div>
            `;
        }

        return `
            <div class="group flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg text-[13px] font-medium transition-all cursor-pointer border shrink-0 min-w-[120px] max-w-[220px] ${activeStyle}" onclick="switchTab('${tab.tabId}')">
                <i class="${tool.icon} text-[11px] ${isActive ? 'text-indigo-500' : 'opacity-60'}"></i>
                <span class="truncate flex-1">${tool.name}</span>
                <div class="flex items-center gap-0.5 ml-1">
                    <button class="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" onclick="togglePin(event, '${tab.tabId}')" title="Ghim tab">
                        <i class="fas fa-thumbtack text-[9px]"></i>
                    </button>
                    <button class="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors" onclick="closeTab(event, '${tab.tabId}')" title="Đóng tab">
                        <i class="fas fa-times text-[10px]"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderToolCard(tool, isFav) {
    // 1. CHẾ ĐỘ DANH SÁCH (LIST)
    if (currentViewMode === 'list') {
        return `
        <div class="premium-card p-2.5 pr-4 rounded-[16px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer bg-white dark:bg-zinc-900 group flex items-center gap-4" onclick="window.openToolGlobal('${tool.id}')">
            <div class="w-10 h-10 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white text-base">
                <i class="${tool.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-zinc-900 dark:text-white text-[13px] mb-0.5 truncate">${tool.name}</h3>
                <p class="text-zinc-500 text-[11px] truncate">${tool.desc}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${isFav ? 'text-amber-500 opacity-100' : 'text-zinc-400 hover:text-amber-500'}" onclick="window.toggleFavorite(event, '${tool.id}')" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-star text-[12px]"></i>
                </button>
                <button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all scale-95 hover:scale-100" onclick="window.openToolGlobal('${tool.id}', true); event.stopPropagation();" title="Mở trong tab mới">
                    <i class="fas fa-external-link-alt text-[10px]"></i>
                </button>
            </div>
        </div>`;
    }

    // 2. CHẾ ĐỘ LƯỚI GỌN (COMPACT GRID)
    if (currentViewMode === 'grid') {
        return `
        <div class="premium-card p-3 rounded-[18px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer bg-white dark:bg-zinc-900 group flex flex-col items-center text-center relative" onclick="window.openToolGlobal('${tool.id}')">
            <div class="absolute top-1.5 right-1.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button class="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all ${isFav ? 'text-amber-500 opacity-100 shadow-sm' : 'text-zinc-400 hover:text-amber-500'}" onclick="window.toggleFavorite(event, '${tool.id}')" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-star text-[10px]"></i>
                </button>
                <button class="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" onclick="window.openToolGlobal('${tool.id}', true); event.stopPropagation();" title="Mở trong tab mới">
                    <i class="fas fa-external-link-alt text-[9px]"></i>
                </button>
            </div>
            
            <div class="w-10 h-10 mb-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white text-base">
                <i class="${tool.icon}"></i>
            </div>
            <h3 class="font-medium text-zinc-900 dark:text-white text-xs line-clamp-2 px-1 leading-tight">${tool.name}</h3>
        </div>`;
    }

    // 3. CHẾ ĐỘ CHI TIẾT (DETAILED - DEFAULT)
    return `
    <div class="premium-card p-5 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer relative bg-white dark:bg-zinc-900 group" onclick="window.openToolGlobal('${tool.id}')">
        <div class="flex justify-between items-start mb-4">
            <div class="w-11 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white text-lg">
                <i class="${tool.icon}"></i>
            </div>
            
            <div class="flex items-center gap-1">
                <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${isFav ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}" onclick="window.toggleFavorite(event, '${tool.id}')" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-star text-[13px]"></i>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all scale-95 hover:scale-100" onclick="window.openToolGlobal('${tool.id}', true); event.stopPropagation();" title="Mở trong tab mới">
                    <i class="fas fa-external-link-alt text-[11px]"></i>
                </button>
            </div>
        </div>
        <h3 class="font-semibold text-zinc-900 dark:text-white mb-1">${tool.name}</h3>
        <p class="text-zinc-500 text-xs leading-relaxed line-clamp-2">${tool.desc}</p>
    </div>`;
}

function renderHomeView(tabId) {
    const pane = document.getElementById(`pane-${tabId}`);
    if (!pane) return;

    const favs = JSON.parse(localStorage.getItem('favTools') || '[]');
    const sortedTools = [...TOOLS].sort((a, b) => (favs.includes(b.id) ? 1 : 0) - (favs.includes(a.id) ? 1 : 0));

    pane.innerHTML = `
        <div class="mb-8 mt-2 px-2">
            <h1 class="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">Khám phá</h1>
            <p class="text-zinc-500 text-sm">Quản lý công cụ và danh mục của bạn tại đây.</p>
        </div>

        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 mb-6 px-2">
            <div class="flex items-center gap-6">
                <button class="home-tab-btn active pb-3 text-sm font-semibold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white" data-target="all-tools-${tabId}">Tất cả công cụ</button>
                <button class="home-tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all" data-target="categories-${tabId}">Danh mục</button>
            </div>
            ${renderViewToggle()}
        </div>
        
        <div id="all-tools-${tabId}" class="home-tab-content block">
            <div class="${getViewContainerClasses()}">
                ${sortedTools.map(tool => renderToolCard(tool, favs.includes(tool.id))).join('')}
            </div>
        </div>

        <div id="categories-${tabId}" class="home-tab-content hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${CATEGORIES.map(cat => {
                    const count = TOOLS.filter(t => t.catId === cat.id).length;
                    return `
                    <div class="premium-card p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer bg-white dark:bg-zinc-900 group" onclick="window.renderCategoryViewGlobal('${tabId}', '${cat.id}')">
                        <div class="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                            <i class="${cat.icon}"></i>
                        </div>
                        <h3 class="font-bold text-lg text-zinc-900 dark:text-white">${cat.name}</h3>
                        <p class="text-zinc-500 text-xs mt-1 mb-4">${cat.desc}</p>
                        <span class="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">${count} công cụ</span>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;

    pane.querySelectorAll('.home-tab-btn').forEach(btn => {
        btn.onclick = () => {
            pane.querySelectorAll('.home-tab-btn').forEach(b => {
                b.classList.remove('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'font-semibold');
                b.classList.add('border-transparent', 'text-zinc-500', 'font-medium');
            });
            pane.querySelectorAll('.home-tab-content').forEach(c => c.classList.replace('block', 'hidden'));

            btn.classList.remove('border-transparent', 'text-zinc-500', 'font-medium');
            btn.classList.add('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'font-semibold');
            document.getElementById(btn.dataset.target).classList.replace('hidden', 'block');
        };
    });
}

window.renderCategoryViewGlobal = (tabId, catId) => {
    const pane = document.getElementById(`pane-${tabId}`);
    const category = CATEGORIES.find(c => c.id === catId);
    const catTools = TOOLS.filter(t => t.catId === catId);
    const favs = JSON.parse(localStorage.getItem('favTools') || '[]');

    pane.innerHTML = `
        <nav class="flex items-center gap-2 text-[13px] font-medium text-zinc-500 mb-5 px-2">
            <button onclick="window.openToolGlobal('home')" class="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none">
                <i class="fas fa-home text-[11px]"></i> Trang chủ
            </button>
            <span class="opacity-40">/</span>
            <span class="text-zinc-900 dark:text-zinc-100">${category.name}</span>
        </nav>

        <div class="flex items-center justify-between mb-8 mt-2 px-2">
            <div>
                <h1 class="text-3xl font-bold tracking-tight mb-2">${category.name}</h1>
                <p class="text-zinc-500 text-sm">${category.desc}</p>
            </div>
            ${renderViewToggle()}
        </div>
        
        <div class="${getViewContainerClasses()}">
            ${catTools.map(tool => renderToolCard(tool, favs.includes(tool.id))).join('')}
        </div>
    `;
};
// ==========================================
// 4. KHỞI CHẠY & UI CONTROLS THÊM
// ==========================================
window.openToolGlobal = (id, newTab = false) => openTool(id, newTab);
document.getElementById('new-tab-btn').onclick = () => openTool('home', true);

const appViewport = document.getElementById('app-viewport');
const backToTopBtn = document.getElementById('back-to-top');
const tabStripContainer = document.getElementById('tab-strip-container');
const toggleTabsBtn = document.getElementById('toggle-tabs');
const logoBtn = document.getElementById('logo-btn');

// Cuộn Ontop
appViewport.addEventListener('scroll', () => {
    if (appViewport.scrollTop > 400) {
        backToTopBtn.classList.remove('translate-y-20', 'opacity-0');
        backToTopBtn.classList.add('translate-y-0', 'opacity-100');
    } else {
        backToTopBtn.classList.add('translate-y-20', 'opacity-0');
        backToTopBtn.classList.remove('translate-y-0', 'opacity-100');
    }
});

const scrollToTop = () => appViewport.scrollTo({ top: 0, behavior: 'smooth' });
backToTopBtn.onclick = scrollToTop;
logoBtn.onclick = scrollToTop;

// Ẩn/Hiện Tab
let tabsVisible = localStorage.getItem('tabs_visible') !== 'false';
const updateTabVisibility = (visible) => {
    if (visible) {
        tabStripContainer.classList.remove('hidden', 'scale-y-0', 'opacity-0');
        tabStripContainer.style.height = 'auto';
        toggleTabsBtn.classList.add('text-indigo-500');
    } else {
        tabStripContainer.classList.add('scale-y-0', 'opacity-0');
        setTimeout(() => { if (!tabsVisible) tabStripContainer.classList.add('hidden'); }, 300);
        tabStripContainer.style.height = '0px';
        toggleTabsBtn.classList.remove('text-indigo-500');
    }
    localStorage.setItem('tabs_visible', visible);
};
toggleTabsBtn.onclick = () => { tabsVisible = !tabsVisible; updateTabVisibility(tabsVisible); };
updateTabVisibility(tabsVisible);

async function initApp() {
    for (const tab of state.tabs) {
        await renderPane(tab.tabId, tab.toolId);
    }
    switchTab(state.activeTabId);
    if (tabCountBadge) tabCountBadge.textContent = state.tabs.length;
}
initApp();

// ==========================================
// 5. TÌM KIẾM SPOTLIGHT (⌘ K)
// ==========================================
const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');

window.openSpotlight = () => {
    cmdPalette.classList.remove('hidden');
    setTimeout(() => {
        cmdPalette.classList.replace('opacity-0', 'opacity-100');
        cmdPalette.firstElementChild.classList.replace('scale-95', 'scale-100');
    }, 10);
    cmdInput.value = ''; cmdInput.focus();
    renderResults(TOOLS);
};

window.closeSpotlight = () => {
    cmdPalette.classList.replace('opacity-100', 'opacity-0');
    cmdPalette.firstElementChild.classList.replace('scale-100', 'scale-95');
    setTimeout(() => cmdPalette.classList.add('hidden'), 300);
};

function renderResults(list) {
    if (list.length === 0) {
        cmdResults.innerHTML = `<li class="px-4 py-8 text-center text-zinc-500 text-sm">Không tìm thấy công cụ phù hợp!</li>`;
        return;
    }
    cmdResults.innerHTML = list.map(t => `
        <li class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer flex items-center gap-3 transition-colors" onclick="window.openToolGlobal('${t.id}'); window.closeSpotlight();">
            <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><i class="${t.icon}"></i></div>
            <div class="flex-1">
                <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">${t.name}</span>
                <span class="text-xs text-zinc-500 line-clamp-1">${t.desc}</span>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-all" onclick="window.openToolGlobal('${t.id}', true); window.closeSpotlight(); event.stopPropagation();" title="Mở trong tab mới">
                <i class="fas fa-external-link-alt text-xs"></i>
            </button>
        </li>
    `).join('');
}

cmdInput.oninput = (e) => {
    const val = e.target.value.toLowerCase();
    renderResults(TOOLS.filter(t => t.name.toLowerCase().includes(val) || t.desc.toLowerCase().includes(val)));
};

document.getElementById('open-cmd').onclick = window.openSpotlight;
cmdPalette.onclick = (e) => { if (e.target === cmdPalette) window.closeSpotlight(); };
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); 
        if (cmdPalette.classList.contains('hidden')) window.openSpotlight();
        else window.closeSpotlight();
    }
    if (e.key === 'Escape' && !cmdPalette.classList.contains('hidden')) window.closeSpotlight();
});

// ==========================================
// 6. CHẾ ĐỘ NỀN THEME
// ==========================================
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && isDark));

document.getElementById('theme-toggle').onclick = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};