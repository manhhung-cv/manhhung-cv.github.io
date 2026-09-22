// js/app-manager.js
import { TOOLS } from './config.js';

const contentsContainer = document.getElementById('tab-contents-container');
const singleAppHost = document.getElementById('single-app-host');
const appSwitcher = document.getElementById('app-switcher');
const switcherCardsWrapper = document.getElementById('switcher-cards-wrapper');

// 1. KHỞI TẠO VÀ LƯU TRỮ PHIÊN LÀM VIỆC ĐA NHIỆM (SESSION RESTORE)
const STORAGE_KEY_APP_STATE = 'hunqos_multitask_state';

function loadPersistedState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_APP_STATE));
        if (saved && Array.isArray(saved.tabs)) {
            return {
                tabs: saved.tabs,
                activeTabId: saved.activeTabId || 'home',
                recentRunningTools: saved.recentRunningTools || []
            };
        }
    } catch (e) {}
    return {
        tabs: [{ tabId: 'tab-1', toolId: 'home' }],
        activeTabId: 'tab-1',
        recentRunningTools: []
    };
}

export const appState = loadPersistedState();

function persistAppState() {
    try {
        localStorage.setItem(STORAGE_KEY_APP_STATE, JSON.stringify({
            tabs: appState.tabs,
            activeTabId: appState.activeTabId,
            recentRunningTools: appState.recentRunningTools
        }));
    } catch (e) {}
}

const MAX_RECENTS = 8;

export function getRecentToolIds() {
    try {
        return JSON.parse(localStorage.getItem('hunqos_recent_tools') || '[]');
    } catch (e) {
        return [];
    }
}

export function pushRecentTool(toolId) {
    if (!toolId || toolId === 'home') return;
    let recents = getRecentToolIds();
    recents = [toolId, ...recents.filter(id => id !== toolId)].slice(0, MAX_RECENTS);
    localStorage.setItem('hunqos_recent_tools', JSON.stringify(recents));
}

export function getToolData(toolId) {
    if (toolId === 'home') return { id: 'home', name: 'Trang chủ', icon: 'fas fa-home', desc: 'Màn hình chính' };
    return TOOLS.find(t => t.id === toolId) || { id: toolId, name: toolId, icon: 'fas fa-cube', desc: 'Ứng dụng' };
}

// Cập nhật danh sách tối đa 3 Tool mở gần nhất (LRU: 3 items)
function pushRecentRunningTool(toolId) {
    if (!toolId || toolId === 'home') return;
    appState.recentRunningTools = [
        toolId,
        ...appState.recentRunningTools.filter(id => id !== toolId)
    ].slice(0, 3);
    persistAppState();
}

// 2. RENDER CÁC TAB ĐÃ MỞ (TRỰC TIẾP TRÊN HEADER CỦA TOOL & MENUBAR HUNQOS)
export function renderDesktopTabs() {
    const hunqTabStrip = document.getElementById('desktop-menubar-tabs');
    const runningTabs = appState.tabs.filter(t => t.toolId !== 'home');

    const generateTabsHtml = (variant = 'header') => {
        if (runningTabs.length === 0) return '';

        return runningTabs.map(tab => {
            const isActive = appState.activeTabId === tab.toolId;
            const tool = getToolData(tab.toolId);

            const activeClasses = isActive
                ? 'min-accent-bg text-white shadow-sm font-semibold scale-[1.02]'
                : (variant === 'tool-navbar'
                    ? 'bg-black/5 dark:bg-white/5 min-text-muted hover:min-text-main hover:bg-black/10 dark:hover:bg-white/10 border min-border-color' 
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15');

            return `
                <div class="group relative px-2.5 py-1 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 select-none ${activeClasses}"
                     onclick="window.openToolGlobal('${tab.toolId}')"
                     title="${tool.name}">
                    <i class="${tool.icon} text-[10px] ${isActive ? 'text-white' : 'opacity-80'}"></i>
                    <span class="truncate max-w-[100px] sm:max-w-[120px] text-[11px]">${tool.name}</span>
                    <button onclick="window.closeTabById('${tab.toolId}', event)" 
                            class="w-3.5 h-3.5 ml-0.5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/20 dark:hover:bg-white/20 transition-all text-[9px]" 
                            title="Đóng tab">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    };

    // A. Render lên Header bên trong Tool đang mở
    const activeToolNavStrip = document.getElementById(`web-nav-tabs-${appState.activeTabId}`);
    if (activeToolNavStrip) {
        activeToolNavStrip.innerHTML = generateTabsHtml('tool-navbar');
    }

    // B. Render lên Menubar của HunqOS Desktop
    if (hunqTabStrip) {
        hunqTabStrip.innerHTML = generateTabsHtml('hunqos-menubar');
    }
}

// 3. RENDER RECENT TABS TRÊN THANH ĐIỀU HƯỚNG DƯỚI ĐÁY
export function renderSmartRecentTabs() {
    const container = document.getElementById('smart-recent-tabs');
    const runningBadge = document.getElementById('smart-running-badge');
    if (!container) return;

    const runningTabs = appState.tabs.filter(t => t.toolId !== 'home');
    const totalRunning = runningTabs.length;

    if (runningBadge) {
        if (totalRunning > 0) {
            runningBadge.textContent = totalRunning > 9 ? '9+' : totalRunning;
            runningBadge.classList.remove('hidden');
        } else {
            runningBadge.classList.add('hidden');
        }
    }

    if (!appState.recentRunningTools || appState.recentRunningTools.length === 0) {
        container.innerHTML = `
            <div class="smart-empty-badge">
                <i class="fas fa-terminal text-[9px]"></i>
                <span>Portal</span>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.recentRunningTools.slice(0, 3).map(toolId => {
        const tool = getToolData(toolId);
        const isActive = appState.activeTabId === toolId;
        const rawBg = tool.bgColor || tool.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
        const isGrad = rawBg.includes('gradient(');
        const bgStyle = isGrad ? `background-image: ${rawBg};` : `background-color: ${rawBg};`;

        return `
            <button onclick="window.openToolGlobal('${tool.id}')"
                class="smart-tab-app-btn ${isActive ? 'active' : ''}" 
                style="${bgStyle}" 
                aria-label="${tool.name}"
                title="${tool.name}">
                <i class="${tool.icon}"></i>
            </button>
        `;
    }).join('');
}

// 4. ĐÓNG TAB RIÊNG LẺ
export function closeTabById(toolId, event) {
    if (event) event.stopPropagation();
    if (!toolId || toolId === 'home') return;

    appState.tabs = appState.tabs.filter(t => t.toolId !== toolId);
    appState.recentRunningTools = (appState.recentRunningTools || []).filter(id => id !== toolId);

    const pane = document.getElementById(`pane-${toolId}`);
    if (pane) pane.remove();

    persistAppState();

    if (appState.activeTabId === toolId) {
        const remainingRunning = appState.tabs.filter(t => t.toolId !== 'home');
        if (remainingRunning.length > 0) {
            window.openToolGlobal(remainingRunning[remainingRunning.length - 1].toolId);
        } else {
            window.goHome();
        }
    } else {
        renderDesktopTabs();
        renderSmartRecentTabs();
    }
}
window.closeTabById = closeTabById;

export function updateStatusbarBackground() {
    const topBar = document.getElementById('top-system-bar');
    const isHome = !contentsContainer || contentsContainer.classList.contains('hidden') || contentsContainer.style.display === 'none';
    const isDark = document.documentElement.classList.contains('dark');

    if (topBar) {
        topBar.classList.remove('statusbar-home', 'statusbar-app-dark', 'statusbar-app-light');
        topBar.classList.add(isHome ? 'statusbar-home' : (isDark ? 'statusbar-app-dark' : 'statusbar-app-light'));
    }
}

export function showHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.add('hidden');
        contentsContainer.style.display = 'none';
    }

    if (singleAppHost) {
        Array.from(singleAppHost.children).forEach(child => {
            child.classList.remove('active');
            child.style.display = 'none';
        });
    }

    const isMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    const minimalViewport = document.getElementById('minimal-pure-viewport');

    if (isMinimal) {
        if (homescreenLauncher) {
            homescreenLauncher.classList.add('hidden');
            homescreenLauncher.style.display = 'none';
        }
        if (minimalViewport) {
            minimalViewport.classList.remove('hidden');
            minimalViewport.style.display = 'flex';
        }
    } else {
        if (minimalViewport) {
            minimalViewport.classList.add('hidden');
            minimalViewport.style.display = 'none';
        }
        if (homescreenLauncher) {
            homescreenLauncher.classList.remove('hidden');
            homescreenLauncher.style.display = 'flex';
        }
    }

    appState.activeTabId = 'home';
    persistAppState();
    updateStatusbarBackground();
    renderDesktopTabs();
    renderSmartRecentTabs();
    document.getElementById('smart-nav-btn-home')?.classList.add('active');
}

export function hideHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.remove('hidden');
        contentsContainer.style.display = 'flex';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher) {
        homescreenLauncher.classList.add('hidden');
        homescreenLauncher.style.display = 'none';
    }
    const minimalViewport = document.getElementById('minimal-pure-viewport');
    if (minimalViewport) {
        minimalViewport.classList.add('hidden');
        minimalViewport.style.display = 'none';
    }
    document.getElementById('smart-nav-btn-home')?.classList.remove('active');
    updateStatusbarBackground();
}

// 5. CƠ CHẾ NẠP MODULE CÔNG CỤ ĐA ĐƯỜNG DẪN (KHẮC PHỤC TRIỆT ĐỂ LỖI 404)
async function importToolModule(toolId) {
    const candidatePaths = [
        `../tools/${toolId}/index.js`,
        `./tools/${toolId}/index.js`,
        `../../tools/${toolId}/index.js`,
        `/tools/${toolId}/index.js`
    ];

    for (const path of candidatePaths) {
        try {
            return await import(path);
        } catch (e) {
            const isPathError = e.message?.includes('Failed to fetch') || e.message?.includes('404');
            if (!isPathError) {
                throw e; // Ném tiếp nếu là lỗi cú pháp code bên trong tool
            }
        }
    }
    throw new Error(`Không tìm thấy thư mục/tệp [${toolId}/index.js]. Vui lòng kiểm tra lại cấu trúc thư mục tools.`);
}

// 6. MỞ CÔNG CỤ VÀ KHỞI TẠO PANE
export async function openTool(toolId) {
    if (toolId === 'home') {
        window.goHome();
        return;
    }

    pushRecentTool(toolId);
    pushRecentRunningTool(toolId);
    hideHomescreen();

    if (singleAppHost) {
        const allPanes = singleAppHost.querySelectorAll('.view-pane');
        allPanes.forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
    }

    let pane = document.getElementById(`pane-${toolId}`);
    const isMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';

    if (!pane) {
        pane = document.createElement('div');
        pane.id = `pane-${toolId}`;
        pane.className = 'view-pane w-full h-full no-scrollbar relative flex flex-col';

        const tool = getToolData(toolId);
        
        // Header tích hợp nút Quay lại, dải Tab đã mở và nhãn ứng dụng
        const navBar = document.createElement('div');
        navBar.id = `web-nav-${toolId}`;
        navBar.className = `w-full shrink-0 border-b px-3 sm:px-4 py-2 flex items-center justify-between gap-3 z-20 min-border-color ${isMinimal ? 'flex' : 'hidden'}`;
        navBar.style.backgroundColor = 'var(--min-header-bg)';
        navBar.innerHTML = `
            <button onclick="window.goHome()" class="flex items-center gap-1.5 text-xs font-semibold min-accent-text hover:opacity-80 transition-opacity shrink-0">
                <i class="fas fa-arrow-left text-[14px]"></i>
                <span class="hidden sm:inline">Quay lại</span>
            </button>
            <div id="web-nav-tabs-${toolId}" class="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-xl mx-auto px-1"></div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-semibold min-text-main hidden sm:inline">${tool.name}</span>
                <span class="text-[9px] min-badge-pill px-2 py-0.5 rounded-full font-mono">Web</span>
            </div>
        `;
        pane.appendChild(navBar);

        const appBody = document.createElement('div');
        appBody.className = 'flex-1 w-full h-full overflow-hidden no-scrollbar';

        try {
            const module = await importToolModule(toolId);
            if (module.template) appBody.innerHTML = module.template();
            pane.appendChild(appBody);
            if (module.init) module.init(appBody);
        } catch (e) {
            appBody.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center p-6 text-center">
                    <i class="fas fa-exclamation-triangle text-rose-500 text-3xl mb-3"></i>
                    <h3 class="text-sm font-semibold text-rose-400 mb-1">Không thể mở ứng dụng</h3>
                    <p class="text-xs text-zinc-400 max-w-md mb-4">${e.message}</p>
                    <button onclick="window.goHome()" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold">
                        Quay về màn hình chính
                    </button>
                </div>
            `;
            pane.appendChild(appBody);
        }
        singleAppHost?.appendChild(pane);
    } else {
        const navBar = document.getElementById(`web-nav-${toolId}`);
        if (navBar) {
            navBar.classList.toggle('hidden', !isMinimal);
            navBar.classList.toggle('flex', isMinimal);
            navBar.style.backgroundColor = 'var(--min-header-bg)';
        }
    }

    pane.classList.add('active');
    pane.style.display = 'flex';
    
    singleAppHost?.classList.remove('hidden');
    appState.activeTabId = toolId;

    if (!appState.tabs.some(t => t.toolId === toolId)) {
        appState.tabs.push({ tabId: toolId, toolId: toolId });
    }

    persistAppState();
    renderDesktopTabs();
    renderSmartRecentTabs();
}

export function initAppManager(callbacks = {}) {
    window.openToolGlobal = openTool;

    window.navSmartAction = (action) => {
        if (action === 'home') {
            window.goHome();
        } else if (action === 'multitask') {
            window.openMultitasking();
        } else if (action === 'spotlight') {
            window.openSpotlight();
        } else if (action === 'settings') {
            window.openSettings();
        }
    };

    window.openMultitasking = () => {
        if (!switcherCardsWrapper) return;
        const running = appState.tabs.filter(t => t.toolId !== 'home');

        switcherCardsWrapper.innerHTML = running.length ? running.map(tab => {
            const tool = getToolData(tab.toolId);
            return `
                <div class="w-[220px] h-[260px] rounded-2xl bg-zinc-900 border border-white/15 p-4 flex flex-col justify-between shrink-0 cursor-pointer active:scale-98 transition-transform"
                     onclick="window.openToolGlobal('${tab.toolId}'); window.closeMultitasking();">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 truncate">
                            <i class="${tool.icon} text-accent-theme text-xs"></i>
                            <span class="font-bold text-xs truncate">${tool.name}</span>
                        </div>
                    </div>
                    <div class="text-[11px] text-zinc-500 text-center">Chạm để mở lại</div>
                    <div class="text-center text-[10px] text-white/40 py-1 bg-white/5 rounded-lg border border-white/5">
                        Đang hoạt động
                    </div>
                </div>
            `;
        }).join('') : `<div class="text-zinc-500 m-auto text-xs">Không có ứng dụng nào đang mở</div>`;

        appSwitcher?.classList.remove('pointer-events-none', 'opacity-0');
        appSwitcher?.classList.add('opacity-100');
        document.getElementById('smart-nav-btn-multitask')?.classList.add('active');
    };

    window.closeMultitasking = () => {
        appSwitcher?.classList.add('pointer-events-none', 'opacity-0');
        appSwitcher?.classList.remove('opacity-100');
        document.getElementById('smart-nav-btn-multitask')?.classList.remove('active');
        renderSmartRecentTabs();
    };

    document.getElementById('close-switcher-btn')?.addEventListener('click', window.closeMultitasking);

    window.closeAllTabs = () => {
        appState.tabs = [{ tabId: 'tab-1', toolId: 'home' }];
        appState.activeTabId = 'tab-1';
        appState.recentRunningTools = [];
        if (singleAppHost) singleAppHost.innerHTML = '';
        persistAppState();
        showHomescreen();
        window.closeMultitasking();
        renderDesktopTabs();
        renderSmartRecentTabs();
    };

    window.goHome = () => {
        window.closeMultitasking();
        const homescreenLauncher = document.getElementById('homescreen-launcher');
        const minimalViewport = document.getElementById('minimal-pure-viewport');
        const isMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';

        const isHomeVisible = isMinimal
            ? (minimalViewport && !minimalViewport.classList.contains('hidden') && minimalViewport.style.display !== 'none')
            : (homescreenLauncher && !homescreenLauncher.classList.contains('hidden') && homescreenLauncher.style.display !== 'none');

        if (isHomeVisible) {
            if (typeof callbacks.onGoHomePage === 'function') {
                callbacks.onGoHomePage();
            }
            return;
        }

        appState.activeTabId = 'home';
        persistAppState();
        showHomescreen();
    };

    // 7. KHÔI PHỤC APP ĐANG CHẠY KHI F5
    if (appState.activeTabId && appState.activeTabId !== 'home' && appState.activeTabId !== 'tab-1') {
        openTool(appState.activeTabId);
    } else {
        renderSmartRecentTabs();
        renderDesktopTabs();
    }
}