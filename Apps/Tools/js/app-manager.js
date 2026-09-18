// js/app-manager.js
import { TOOLS } from './config.js';
import { isPureMinimal } from './settings.js';

const contentsContainer = document.getElementById('tab-contents-container');
const singleAppHost = document.getElementById('single-app-host');
const appSwitcher = document.getElementById('app-switcher');
const switcherCardsWrapper = document.getElementById('switcher-cards-wrapper');

export const appState = {
    tabs: [{ tabId: 'tab-1', toolId: 'home' }],
    activeTabId: 'tab-1'
};

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
    if (toolId === 'home') return { id: 'home', name: 'Bàn làm việc', icon: 'fas fa-home', desc: 'Màn hình chính' };
    return TOOLS.find(t => t.id === toolId) || { id: toolId, name: toolId, icon: 'fas fa-cube', desc: 'Ứng dụng' };
}

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
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher && !isPureMinimal) {
        homescreenLauncher.classList.remove('hidden');
        homescreenLauncher.style.display = 'flex';
    }
    updateStatusbarBackground();
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
    updateStatusbarBackground();
}

export function renderDesktopTabs() {
    const desktopTabStrip = document.getElementById('desktop-menubar-tabs');
    if (!desktopTabStrip) return;

    desktopTabStrip.innerHTML = appState.tabs.map(tab => {
        const isActive = appState.activeTabId === tab.tabId;
        const tool = getToolData(tab.toolId);
        return `
            <div class="px-2.5 py-0.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}" 
                 onclick="window.openToolGlobal('${tab.toolId}')">
                <i class="${tool.icon} text-[10px]"></i>
                <span class="truncate max-w-[90px] text-[11px]">${tool.name}</span>
            </div>
        `;
    }).join('');
}

export async function openTool(toolId) {
    if (toolId === 'home') {
        window.goHome();
        return;
    }

    pushRecentTool(toolId);
    hideHomescreen();

    let pane = document.getElementById(`pane-${toolId}`);
    if (!pane) {
        pane = document.createElement('div');
        pane.id = `pane-${toolId}`;
        pane.className = 'view-pane w-full h-full no-scrollbar';
        singleAppHost?.appendChild(pane);

        try {
            const module = await import(`./tools/${toolId}/index.js`).catch(() => import(`../tools/${toolId}/index.js`));
            if (module.template) pane.innerHTML = module.template();
            if (module.init) module.init(pane);
        } catch (e) {
            pane.innerHTML = `<div class="p-6 text-center text-rose-400 text-xs">Không thể khởi tạo: ${e.message}</div>`;
        }
    }

    document.querySelectorAll('#single-app-host .view-pane').forEach(p => p.classList.remove('active'));
    pane.classList.add('active');
    singleAppHost?.classList.remove('hidden');
    appState.activeTabId = toolId;

    if (!appState.tabs.some(t => t.toolId === toolId)) {
        appState.tabs.push({ tabId: toolId, toolId: toolId });
    }
    renderDesktopTabs();
}

export function initAppManager(callbacks = {}) {
    window.openToolGlobal = openTool;

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
                    <div class="text-[11px] text-zinc-500 text-center">Bấm để mở lại</div>
                    <div class="text-center text-[10px] text-white/40 py-1 bg-white/5 rounded-lg border border-white/5">
                        Đang chạy
                    </div>
                </div>
            `;
        }).join('') : `<div class="text-zinc-500 m-auto text-xs">Không có ứng dụng nào đang mở</div>`;

        appSwitcher?.classList.remove('pointer-events-none', 'opacity-0');
        appSwitcher?.classList.add('opacity-100');
    };

    window.closeMultitasking = () => {
        appSwitcher?.classList.add('pointer-events-none', 'opacity-0');
        appSwitcher?.classList.remove('opacity-100');
    };

    document.getElementById('close-switcher-btn')?.addEventListener('click', window.closeMultitasking);

    window.closeAllTabs = () => {
        appState.tabs = [{ tabId: 'tab-1', toolId: 'home' }];
        appState.activeTabId = 'tab-1';
        if (singleAppHost) singleAppHost.innerHTML = '';
        showHomescreen();
        window.closeMultitasking();
        renderDesktopTabs();
    };

    window.goHome = () => {
        window.closeMultitasking();
        const homescreenLauncher = document.getElementById('homescreen-launcher');
        const isHomeVisible = homescreenLauncher && !homescreenLauncher.classList.contains('hidden') && homescreenLauncher.style.display !== 'none';

        if (isHomeVisible) {
            if (typeof callbacks.onGoHomePage === 'function') {
                callbacks.onGoHomePage();
            }
            return;
        }

        appState.activeTabId = 'tab-1';
        showHomescreen();
    };
}