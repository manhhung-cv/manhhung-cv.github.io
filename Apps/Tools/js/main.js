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
            id: tool.catId, 
            name: tool.catId.charAt(0).toUpperCase() + tool.catId.slice(1),
            icon: 'fas fa-folder', 
            desc: 'Danh mục'
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
const miniTabSwitch = document.getElementById('mini-tab-switch');

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
    
    if (openInNewTab || (currentTab && currentTab.pinned)) {
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
        pane.innerHTML = `${breadcrumbsHtml}<div class="premium-card bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">${module.template()}</div>`;
        if (module.init) module.init();
    } catch (e) {
        pane.innerHTML = `${breadcrumbsHtml}<div class="p-10 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900 shadow-sm">Lỗi tải công cụ: ${e.message}</div>`;
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

    // Tự động cuộn đến tab đang active (Apple UX)
    setTimeout(() => {
        const activeMobileTab = document.querySelector(`#tab-strip [onclick="switchTab('${tabId}')"]`);
        const activeDesktopTab = document.querySelector(`#desktop-tab-strip [onclick="switchTab('${tabId}')"]`);
        
        if(activeMobileTab) activeMobileTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        if(activeDesktopTab) activeDesktopTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
}
window.switchTab = switchTab;

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

window.closeAllTabs = () => {
    // Chỉ giữ lại tab đã ghim (nếu có), nếu không có thì reset về Home
    state.tabs = state.tabs.filter(t => t.pinned);
    if (state.tabs.length === 0) {
        tabCounter++;
        state.tabs = [{ tabId: `tab-${tabCounter}`, toolId: 'home', pinned: false }];
    }
    
    contentsContainer.innerHTML = '';
    state.activeTabId = state.tabs[0].tabId;
    state.tabHistory = [state.activeTabId];
    
    state.tabs.forEach(t => renderPane(t.tabId, t.toolId));
    switchTab(state.activeTabId);
    renderTabs();
    saveState();
};

window.toggleFavorite = (e, toolId) => {
    e.stopPropagation();
    e.preventDefault();
    let favs = JSON.parse(localStorage.getItem('favTools') || '[]');
    const isAdded = !favs.includes(toolId);

    if (isAdded) favs.push(toolId);
    else favs = favs.filter(id => id !== toolId);
    
    localStorage.setItem('favTools', JSON.stringify(favs));
    
    // Auto re-render Home để tab Yêu thích cập nhật tức thì
    const currentTab = state.tabs.find(t => t.tabId === state.activeTabId);
    if (currentTab && currentTab.toolId === 'home') {
        renderHomeView(currentTab.tabId);
    }

    const tool = getToolData(toolId);
    if (tool) UI.showAlert(isAdded ? 'Đã yêu thích' : 'Bỏ yêu thích', isAdded ? `Đã ghim ${tool.name} vào mục Yêu thích.` : `Đã bỏ ghim ${tool.name}.`, isAdded ? 'success' : 'info');
};

// ==========================================
// 3. RENDERING UI GIAO DIỆN CHÍNH
// ==========================================
let currentViewMode = localStorage.getItem('app_view_mode') || 'detailed';

window.changeViewMode = (mode) => {
    currentViewMode = mode;
    localStorage.setItem('app_view_mode', mode);
    
    const currentTab = state.tabs.find(t => t.tabId === state.activeTabId);
    if (currentTab) {
        if (currentTab.toolId === 'home') renderHomeView(currentTab.tabId);
        else switchTab(state.activeTabId); 
    }
};

function getViewContainerClasses() {
    if (currentViewMode === 'list') return 'flex flex-col gap-2.5'; 
    if (currentViewMode === 'grid') return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'; 
}

function renderViewToggle() {
    return `
        <div class="flex items-center gap-1 pb-2 shrink-0">
            <button onclick="window.changeViewMode('detailed')" class="w-8 h-8 flex items-center justify-center rounded-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'detailed' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Chi tiết">
                <i class="fas fa-th-large text-[13px]"></i>
            </button>
            <button onclick="window.changeViewMode('grid')" class="w-8 h-8 flex items-center justify-center rounded-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'grid' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Lưới">
                <i class="fas fa-border-all text-[13px]"></i>
            </button>
            <button onclick="window.changeViewMode('list')" class="w-8 h-8 flex items-center justify-center rounded-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentViewMode === 'list' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-zinc-400'}" title="Danh sách">
                <i class="fas fa-list text-[13px]"></i>
            </button>
        </div>
    `;
}

window.expandTabsForce = () => { tabsExpanded = true; updateTabExpansion(true); };

function renderTabs() {
    const desktopTabStrip = document.getElementById('desktop-tab-strip');

    const tabHtmlFull = state.tabs.map(tab => {
        const isActive = state.activeTabId === tab.tabId;
        const tool = getToolData(tab.toolId);
        const activeStyle = isActive 
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border-zinc-200/80 dark:border-zinc-600' 
            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border-transparent';

        return `
            <div class="group flex items-center justify-between px-2.5 h-8 md:h-[30px] rounded-[10px] md:rounded-[8px] text-[12px] font-medium transition-all cursor-pointer border shrink-0 min-w-[110px] max-w-[180px] md:min-w-[100px] ${activeStyle}" onclick="switchTab('${tab.tabId}')">
                <div class="flex items-center gap-2 overflow-hidden">
                    <i class="${tool.icon} text-[11px] shrink-0 ${isActive ? 'text-indigo-500 md:text-zinc-900 md:dark:text-white' : 'opacity-70'}"></i>
                    <span class="truncate whitespace-nowrap">${tool.name}</span>
                </div>
                <button class="w-5 h-5 ml-1.5 shrink-0 flex items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" onclick="closeTab(event, '${tab.tabId}')" title="Đóng tab">
                    <i class="fas fa-times text-[10px]"></i>
                </button>
            </div>
        `;
    }).join('');

    if (tabStrip) tabStrip.innerHTML = tabHtmlFull;
    if (desktopTabStrip) desktopTabStrip.innerHTML = tabHtmlFull;

    // Render Mini Tab Switch (Mobile Pill)
    if (miniTabSwitch) {
        if (state.tabs.length > 3) {
            // Nhóm gọn lại thành "Số lượng Tabs" nếu > 3 tabs
            miniTabSwitch.innerHTML = `
                <button onclick="window.expandTabsForce()" class="px-3 h-8 rounded-[12px] flex items-center justify-center gap-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm transition-all font-bold text-[12px]">
                    <i class="fas fa-clone text-[12px] opacity-70"></i> ${state.tabs.length} Tabs
                </button>
            `;
        } else {
            // Hiển thị bình thường nếu <= 3
            miniTabSwitch.innerHTML = state.tabs.map(tab => {
                const isActive = state.activeTabId === tab.tabId;
                const tool = getToolData(tab.toolId);
                const activeClass = isActive 
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white scale-105' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-600/50 scale-100';
                return `
                    <button onclick="switchTab('${tab.tabId}')" class="w-8 h-8 rounded-[12px] flex items-center justify-center transition-all duration-300 ${activeClass}" title="${tool.name}">
                        <i class="${tool.icon} text-[13px]"></i>
                    </button>
                `;
            }).join('');
        }
    }
}
function renderToolCard(tool, isFav) {
    // Bổ sung draggable="true" và cursor-grab cho hiệu ứng kéo thả mượt
    if (currentViewMode === 'list') {
        return `
        <div draggable="true" data-id="${tool.id}" class="premium-card p-2.5 pr-4 rounded-[18px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-900 group flex items-center gap-4" onclick="window.openToolGlobal('${tool.id}')">
            <div class="w-10 h-10 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 rounded-[14px] flex items-center justify-center text-zinc-900 dark:text-white text-base">
                <i class="${tool.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-zinc-900 dark:text-white text-[14px] mb-0.5 truncate">${tool.name}</h3>
                <p class="text-zinc-500 text-[12px] truncate">${tool.desc}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${isFav ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}" onclick="window.toggleFavorite(event, '${tool.id}')" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-star text-[13px]"></i>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" onclick="window.openToolGlobal('${tool.id}', true); event.stopPropagation();" title="Mở trong tab mới">
                    <i class="fas fa-external-link-alt text-[11px]"></i>
                </button>
            </div>
        </div>`;
    }

    if (currentViewMode === 'grid') {
        return `
        <div draggable="true" data-id="${tool.id}" class="premium-card p-3 rounded-[22px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-900 group flex flex-col items-center text-center relative" onclick="window.openToolGlobal('${tool.id}')">
            <div class="absolute top-1.5 right-1.5 flex flex-col gap-0.5 z-10">
                <button class="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all ${isFav ? 'text-amber-500 shadow-sm' : 'text-zinc-400 hover:text-amber-500'}" onclick="window.toggleFavorite(event, '${tool.id}')" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-star text-[10px]"></i>
                </button>
            </div>
            <div class="w-11 h-11 mb-2 mt-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-[14px] flex items-center justify-center text-zinc-900 dark:text-white text-[17px]">
                <i class="${tool.icon}"></i>
            </div>
            <h3 class="font-medium text-zinc-900 dark:text-white text-[11px] line-clamp-2 px-1 leading-tight">${tool.name}</h3>
        </div>`;
    }

    // Default Detailed
    return `
    <div draggable="true" data-id="${tool.id}" class="premium-card p-5 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing relative bg-white dark:bg-zinc-900 group shadow-sm hover:shadow-md" onclick="window.openToolGlobal('${tool.id}')">
        <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/60 rounded-[18px] flex items-center justify-center text-zinc-900 dark:text-white text-[20px]">
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
        <h3 class="font-bold text-[15px] text-zinc-900 dark:text-white mb-1.5">${tool.name}</h3>
        <p class="text-zinc-500 text-[13px] leading-relaxed line-clamp-2">${tool.desc}</p>
    </div>`;
}

function renderHomeView(tabId) {
    const pane = document.getElementById(`pane-${tabId}`);
    if (!pane) return;

    const favs = JSON.parse(localStorage.getItem('favTools') || '[]');
    const customOrder = JSON.parse(localStorage.getItem('customToolOrder') || '[]');

    let sortedTools = [...TOOLS];
    
    // Áp dụng thứ tự kéo thả cá nhân
    if (customOrder.length > 0) {
        sortedTools.sort((a, b) => {
            let indexA = customOrder.indexOf(a.id);
            let indexB = customOrder.indexOf(b.id);
            if (indexA === -1) indexA = 999;
            if (indexB === -1) indexB = 999;
            return indexA - indexB;
        });
    } else {
        sortedTools.sort((a, b) => (favs.includes(b.id) ? 1 : 0) - (favs.includes(a.id) ? 1 : 0));
    }

    const favToolsData = sortedTools.filter(t => favs.includes(t.id));

    pane.innerHTML = `
        <div class="mb-6 mt-0 px-2">
            <h1 class="text-[32px] font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white">Workspace</h1>
            <p class="text-zinc-500 text-[15px] font-medium">Trung tâm công cụ cá nhân hóa của bạn.</p>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 mb-6 px-2 gap-4">
            <div class="flex items-center gap-6 overflow-x-auto hide-scrollbar">
                <button class="home-tab-btn active pb-3 text-[15px] font-semibold border-b-[3px] border-zinc-900 dark:border-white text-zinc-900 dark:text-white whitespace-nowrap transition-all" data-target="all-tools-${tabId}">Tất cả công cụ</button>
                <button class="home-tab-btn pb-3 text-[15px] font-medium border-b-[3px] border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5" data-target="fav-tools-${tabId}">
                    Yêu thích
                    <span class="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 py-0.5 px-2 rounded-full text-[10px] font-bold">${favToolsData.length}</span>
                </button>
                <button class="home-tab-btn pb-3 text-[15px] font-medium border-b-[3px] border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white whitespace-nowrap transition-all" data-target="categories-${tabId}">Danh mục</button>
            </div>
            ${renderViewToggle()}
        </div>
        
        <div id="all-tools-${tabId}" class="home-tab-content block">
            <div class="${getViewContainerClasses()} tools-grid-container" id="grid-all-${tabId}">
                ${sortedTools.map(tool => renderToolCard(tool, favs.includes(tool.id))).join('')}
            </div>
        </div>

        <div id="fav-tools-${tabId}" class="home-tab-content hidden">
            ${favToolsData.length > 0 
                ? `<div class="${getViewContainerClasses()} tools-grid-container" id="grid-fav-${tabId}">
                     ${favToolsData.map(tool => renderToolCard(tool, true)).join('')}
                   </div>`
                : `<div class="py-16 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
                       <div class="w-16 h-16 bg-white dark:bg-zinc-800 rounded-[20px] flex items-center justify-center text-zinc-300 dark:text-zinc-600 text-3xl mb-5 shadow-sm"><i class="fas fa-star"></i></div>
                       <h3 class="text-zinc-900 dark:text-white font-semibold text-lg mb-2">Chưa có công cụ yêu thích</h3>
                       <p class="text-zinc-500 text-[14px] max-w-xs">Bấm biểu tượng ngôi sao trên thẻ công cụ để ghim chúng vào đây.</p>
                   </div>`
            }
        </div>

        <div id="categories-${tabId}" class="home-tab-content hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${CATEGORIES.map(cat => {
                    const count = TOOLS.filter(t => t.catId === cat.id).length;
                    return `
                    <div class="premium-card p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer bg-white dark:bg-zinc-900 group" onclick="window.renderCategoryViewGlobal('${tabId}', '${cat.id}')">
                        <div class="w-14 h-14 bg-zinc-50 dark:bg-zinc-800/80 rounded-[20px] flex items-center justify-center text-zinc-900 dark:text-white text-xl mb-5 group-hover:scale-110 transition-transform">
                            <i class="${cat.icon}"></i>
                        </div>
                        <h3 class="font-bold text-lg text-zinc-900 dark:text-white">${cat.name}</h3>
                        <p class="text-zinc-500 text-[13px] mt-1.5 mb-5">${cat.desc}</p>
                        <span class="inline-block px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold tracking-wide">${count} công cụ</span>
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

    // Kích hoạt Engine Kéo Thả SortableJS (Apple style)
    setTimeout(() => {
        const allContainer = pane.querySelector(`#grid-all-${tabId}`);
        if (allContainer && window.Sortable) {
            new Sortable(allContainer, {
                animation: 250, 
                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                delay: 150, 
                delayOnTouchOnly: true,
                onEnd: function () {
                    const items = allContainer.querySelectorAll('.premium-card');
                    const newOrder = Array.from(items).map(el => el.getAttribute('data-id'));
                    localStorage.setItem('customToolOrder', JSON.stringify(newOrder));
                    renderHomeView(tabId); 
                }
            });
        }
    }, 100);
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

        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 px-2 gap-4">
            <div>
                <h1 class="text-[32px] font-extrabold tracking-tight mb-2">${category.name}</h1>
                <p class="text-zinc-500 text-[15px]">${category.desc}</p>
            </div>
            ${renderViewToggle()}
        </div>
        
        <div class="${getViewContainerClasses()}">
            ${catTools.map(tool => renderToolCard(tool, favs.includes(tool.id))).join('')}
        </div>
    `;
};

// ==========================================
// 4. CAPSULE DOCK & CONTROLS UI
// ==========================================
window.openToolGlobal = (id, newTab = false) => openTool(id, newTab);

const newTabBtn = document.getElementById('new-tab-btn');
if(newTabBtn) newTabBtn.onclick = () => openTool('home', true);

const appViewport = document.getElementById('app-viewport');
const backToTopBtn = document.getElementById('back-to-top');
const logoBtn = document.getElementById('logo-btn');

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
if(backToTopBtn) backToTopBtn.onclick = scrollToTop;
if(logoBtn) logoBtn.onclick = scrollToTop;

// Gán sự kiện nút New Tab Desktop
const newTabDesktopBtn = document.getElementById('new-tab-desktop-btn');
if(newTabDesktopBtn) newTabDesktopBtn.onclick = () => openTool('home', true);

// ==========================================
// ĐIỀU KHIỂN CAPSULE DOCK (MOBILE & DESKTOP)
// ==========================================
const dock = document.getElementById('capsule-dock');
const dockInner = document.getElementById('capsule-inner');
const tabStripContainer = document.getElementById('tab-strip-container');
const toggleTabsBtn = document.getElementById('toggle-tabs');
const pillDivider = document.getElementById('pill-divider');

// 1. Quản lý Tab Expansion (Chỉ hoạt động trên Mobile)
let tabsExpanded = localStorage.getItem('tabs_expanded') === 'true';

function updateTabExpansion(expanded) {
    if(!tabStripContainer || !miniTabSwitch || !toggleTabsBtn) return;
    
    if (expanded) {
        tabStripContainer.classList.remove('grid-rows-[0fr]', 'opacity-0');
        tabStripContainer.classList.add('grid-rows-[1fr]', 'opacity-100');
        
        miniTabSwitch.classList.add('max-w-0', 'opacity-0', 'pointer-events-none', 'scale-90', 'pr-0');
        miniTabSwitch.classList.remove('max-w-[45vw]', 'opacity-100', 'scale-100', 'pr-1');
        
        if(pillDivider) {
            pillDivider.classList.add('w-0', 'opacity-0', 'mx-0');
            pillDivider.classList.remove('w-px', 'opacity-100', 'mx-0.5');
        }
        
        toggleTabsBtn.classList.add('bg-white', 'dark:bg-zinc-700', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
        toggleTabsBtn.classList.remove('bg-transparent', 'text-zinc-500');
    } else {
        tabStripContainer.classList.remove('grid-rows-[1fr]', 'opacity-100');
        tabStripContainer.classList.add('grid-rows-[0fr]', 'opacity-0');
        
        miniTabSwitch.classList.remove('max-w-0', 'opacity-0', 'pointer-events-none', 'scale-90', 'pr-0');
        miniTabSwitch.classList.add('max-w-[45vw]', 'opacity-100', 'scale-100', 'pr-1');
        
        if(pillDivider) {
            pillDivider.classList.remove('w-0', 'opacity-0', 'mx-0');
            pillDivider.classList.add('w-px', 'opacity-100', 'mx-0.5');
        }
        
        toggleTabsBtn.classList.remove('bg-white', 'dark:bg-zinc-700', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
        toggleTabsBtn.classList.add('bg-transparent', 'text-zinc-500');
    }
    localStorage.setItem('tabs_expanded', expanded);
}

if(toggleTabsBtn) {
    toggleTabsBtn.onclick = () => { tabsExpanded = !tabsExpanded; updateTabExpansion(tabsExpanded); };
}

// 2. Quản lý Vị trí Dock & Modal Cài đặt
let isDockBottom = localStorage.getItem('dock_position') === 'bottom';
const posSlider = document.getElementById('pos-slider');
const posTopBtn = document.getElementById('pos-top-btn');
const posBottomBtn = document.getElementById('pos-bottom-btn');

function updateDockPosition() {
    if(!dock || !appViewport) return;
    const backToTopBtn = document.getElementById('back-to-top'); // Gọi nút
    
    if (isDockBottom) {
        dock.classList.remove('top-4', 'flex-col');
        dock.classList.add('bottom-6', 'flex-col-reverse');
        dockInner.classList.remove('flex-col');
        dockInner.classList.add('flex-col-reverse');
        
        tabStripContainer.classList.remove('border-t');
        tabStripContainer.classList.add('border-b');

        appViewport.classList.remove('pt-24', 'pb-6');
        appViewport.classList.add('pb-40', 'pt-6');
        
        // Cập nhật vị trí nút Back to Top cao hơn Dock
        if(backToTopBtn) {
            backToTopBtn.classList.remove('bottom-6');
            backToTopBtn.classList.add('bottom-28');
        }
        
        // Cập nhật Modal
        if(posSlider) posSlider.classList.add('translate-x-[50px]');
        if(posTopBtn) { posTopBtn.classList.replace('text-zinc-900', 'text-zinc-500'); posTopBtn.classList.replace('dark:text-white', 'text-zinc-500'); }
        if(posBottomBtn) { posBottomBtn.classList.replace('text-zinc-500', 'text-zinc-900'); posBottomBtn.classList.add('dark:text-white'); }
    } else {
        dock.classList.remove('bottom-6', 'flex-col-reverse');
        dock.classList.add('top-4', 'flex-col');
        dockInner.classList.remove('flex-col-reverse');
        dockInner.classList.add('flex-col');
        
        tabStripContainer.classList.remove('border-b');
        tabStripContainer.classList.add('border-t');

        appViewport.classList.remove('pb-40', 'pt-6');
        appViewport.classList.add('pt-24', 'pb-6');
        
        // Hạ nút Back to Top xuống góc dưới cùng
        if(backToTopBtn) {
            backToTopBtn.classList.remove('bottom-28');
            backToTopBtn.classList.add('bottom-6');
        }
        
        // Cập nhật Modal
        if(posSlider) posSlider.classList.remove('translate-x-[50px]');
        if(posTopBtn) { posTopBtn.classList.replace('text-zinc-500', 'text-zinc-900'); posTopBtn.classList.add('dark:text-white'); }
        if(posBottomBtn) { posBottomBtn.classList.replace('text-zinc-900', 'text-zinc-500'); posBottomBtn.classList.replace('dark:text-white', 'text-zinc-500'); }
    }
}

if(posTopBtn) posTopBtn.onclick = () => { isDockBottom = false; localStorage.setItem('dock_position', 'top'); updateDockPosition(); };
if(posBottomBtn) posBottomBtn.onclick = () => { isDockBottom = true; localStorage.setItem('dock_position', 'bottom'); updateDockPosition(); };

// ==========================================
// XỬ LÝ MODAL CÀI ĐẶT
// ==========================================
const settingsModal = document.getElementById('settings-modal');
const settingsBackdrop = document.getElementById('settings-backdrop');
const settingsContent = document.getElementById('settings-content');
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const modalThemeToggle = document.getElementById('modal-theme-toggle');

function openSettings() {
    settingsModal.classList.remove('pointer-events-none');
    settingsModal.classList.replace('opacity-0', 'opacity-100');
    settingsContent.classList.replace('scale-95', 'scale-100');
}

function closeSettings() {
    settingsModal.classList.replace('opacity-100', 'opacity-0');
    settingsContent.classList.replace('scale-100', 'scale-95');
    setTimeout(() => settingsModal.classList.add('pointer-events-none'), 300);
}

if(openSettingsBtn) openSettingsBtn.onclick = openSettings;
if(closeSettingsBtn) closeSettingsBtn.onclick = closeSettings;
if(settingsBackdrop) settingsBackdrop.onclick = closeSettings;

if(modalThemeToggle) {
    modalThemeToggle.onclick = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
}

async function initApp() {
    for (const tab of state.tabs) {
        await renderPane(tab.tabId, tab.toolId);
    }
    switchTab(state.activeTabId);
    if (tabCountBadge) tabCountBadge.textContent = state.tabs.length;
    
    // Initial Sync for Dock & Tabs UI
    updateTabExpansion(tabsExpanded);
    updateDockPosition(); 
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
        cmdResults.innerHTML = `<li class="px-4 py-8 text-center text-zinc-500 text-[14px]">Không tìm thấy công cụ phù hợp!</li>`;
        return;
    }
    cmdResults.innerHTML = list.map(t => `
        <li class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer flex items-center gap-3 transition-colors" onclick="window.openToolGlobal('${t.id}'); window.closeSpotlight();">
            <div class="w-10 h-10 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-[15px]"><i class="${t.icon}"></i></div>
            <div class="flex-1">
                <span class="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 block">${t.name}</span>
                <span class="text-[12px] text-zinc-500 line-clamp-1">${t.desc}</span>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-[12px] hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-all" onclick="window.openToolGlobal('${t.id}', true); window.closeSpotlight(); event.stopPropagation();" title="Mở trong tab mới">
                <i class="fas fa-external-link-alt text-xs"></i>
            </button>
        </li>
    `).join('');
}

if(cmdInput) {
    cmdInput.oninput = (e) => {
        const val = e.target.value.toLowerCase();
        renderResults(TOOLS.filter(t => t.name.toLowerCase().includes(val) || t.desc.toLowerCase().includes(val)));
    };
}

const openCmdBtn = document.getElementById('open-cmd');
if(openCmdBtn) openCmdBtn.onclick = window.openSpotlight;

if(cmdPalette) {
    cmdPalette.onclick = (e) => { if (e.target === cmdPalette) window.closeSpotlight(); };
}

document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); 
        if (cmdPalette.classList.contains('hidden')) window.openSpotlight();
        else window.closeSpotlight();
    }
    if (e.key === 'Escape' && cmdPalette && !cmdPalette.classList.contains('hidden')) window.closeSpotlight();
});

// ==========================================
// 6. CHẾ ĐỘ NỀN THEME (SÁNG / TỐI)
// ==========================================
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && isDark));

const themeToggleBtn = document.getElementById('theme-toggle');
if(themeToggleBtn) {
    themeToggleBtn.onclick = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
}