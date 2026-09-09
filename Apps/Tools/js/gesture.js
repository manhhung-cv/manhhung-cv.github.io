
import { TOOLS } from './config.js';

// 1. ĐỒNG HỒ HỆ THỐNG
function updateSystemTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('os-clock').textContent = timeStr;
    const bigTime = document.getElementById('widget-clock-large');
    const bigDate = document.getElementById('widget-date-large');
    if (bigTime) bigTime.textContent = timeStr;
    if (bigDate) bigDate.innerHTML = `<i class="fas fa-sparkles text-amber-300"></i> ${dateStr}`;
}
setInterval(updateSystemTime, 1000);
updateSystemTime();

// 2. KHỞI TẠO DANH SÁCH ỨNG DỤNG MÀN HÌNH CHÍNH
const deckP1 = document.getElementById('deck-page-1');
const deckP2 = document.getElementById('deck-page-2');

const appGradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-indigo-700',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-600',
    'from-emerald-400 to-teal-600',
    'from-cyan-400 to-blue-600',
    'from-fuchsia-500 to-purple-600'
];

function buildHomescreenDeck() {
    if (!deckP1 || !deckP2) return;
    deckP1.innerHTML = '';
    deckP2.innerHTML = '';

    TOOLS.forEach((tool, index) => {
        const grad = appGradients[index % appGradients.length];
        const cardHtml = `
                    <div class="ios-app-card flex flex-col items-center cursor-pointer" onclick="openAppSession('${tool.id}', '${tool.name}')">
                        <div class="ios-app-icon w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr ${grad} text-white flex items-center justify-center text-2xl">
                            <i class="${tool.icon}"></i>
                        </div>
                        <span class="text-[11px] sm:text-xs font-semibold text-white/90 drop-shadow-sm mt-1.5 text-center line-clamp-1 w-full px-0.5 tracking-tight">
                            ${tool.name}
                        </span>
                    </div>
                `;
        if (index < 16) {
            deckP1.innerHTML += cardHtml;
        } else {
            deckP2.innerHTML += cardHtml;
        }
    });
}
buildHomescreenDeck();

// 3. ĐIỀU KHIỂN PHIÊN ỨNG DỤNG (LAUNCH & DISMISS)
const appWindow = document.getElementById('app-window');
const appTitle = document.getElementById('app-window-title');
const islandTask = document.getElementById('island-task-label');

window.openAppSession = (toolId, toolName) => {
    if (toolId === 'home') {
        dismissAppToHome();
        return;
    }
    if (window.openToolGlobal) {
        window.openToolGlobal(toolId);
    }
    appTitle.textContent = toolName || 'Ứng dụng';
    if (islandTask) islandTask.textContent = `Đang chạy: ${toolName}`;

    appWindow.classList.remove('app-closed');
    toggleSpatialSwitcher(false);
};

window.dismissAppToHome = () => {
    appWindow.classList.add('app-closed');
    toggleSpatialSwitcher(false);
};

// 4. TRÌNH ĐA NHIỆM iOS CAROUSEL (HIỂN THỊ TOÀN BỘ CỬA SỔ ĐANG MỞ)
const switcher = document.getElementById('app-switcher');
const cardsWrapper = document.getElementById('switcher-cards-wrapper');
const switcherCount = document.getElementById('switcher-count-badge');

window.toggleSpatialSwitcher = (show) => {
    if (show) {
        renderSpatialCards();
        switcher.classList.remove('pointer-events-none');
        switcher.classList.replace('opacity-0', 'opacity-100');
    } else {
        switcher.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => switcher.classList.add('pointer-events-none'), 300);
    }
};

function renderSpatialCards() {
    const savedState = JSON.parse(localStorage.getItem('app_workspace_state') || '{}');
    const tabs = (savedState.tabs || []).filter(t => t.toolId !== 'home');

    if (switcherCount) switcherCount.textContent = tabs.length;

    if (tabs.length === 0) {
        cardsWrapper.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-white/40 py-20 m-auto">
                        <i class="fas fa-layer-group text-5xl mb-3 opacity-40"></i>
                        <span class="text-sm font-semibold">Không có ứng dụng nào đang mở</span>
                    </div>
                `;
        return;
    }

    // Dàn toàn bộ các ứng dụng đang mở thành các thẻ bài iOS xếp song song
    cardsWrapper.innerHTML = tabs.map(tab => {
        const tool = TOOLS.find(t => t.id === tab.toolId) || { name: 'Công cụ', icon: 'fas fa-cube' };
        return `
                    <div class="ios-deck-card p-6 flex flex-col justify-between" 
                         id="card-${tab.tabId}"
                         onclick="openAppSession('${tab.toolId}', '${tool.name}')">
                        
                        <!-- Header thẻ: Icon & App Name -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white text-sm shadow-md">
                                    <i class="${tool.icon}"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-sm text-white truncate max-w-[130px] leading-tight">${tool.name}</h4>
                                    <span class="text-[10px] text-zinc-400 font-mono">HunqUI Session</span>
                                </div>
                            </div>
                            <button onclick="event.stopPropagation(); closeSpatialCard('${tab.tabId}')" 
                                    class="w-7 h-7 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center text-xs transition-colors" title="Tắt ứng dụng">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- Trung tâm thẻ: Preview ứng dụng lớn -->
                        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-white/30 my-4">
                            <div class="w-20 h-20 rounded-[26px] bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-white/80 shadow-inner">
                                <i class="${tool.icon}"></i>
                            </div>
                            <span class="text-xs font-medium text-white/60 tracking-wide">${tool.name}</span>
                        </div>

                        <!-- Footer thẻ -->
                        <div class="text-center text-[11px] font-semibold text-zinc-400 py-2 bg-white/5 rounded-2xl border border-white/5">
                            Vuốt lên để tắt • Chạm để mở
                        </div>
                    </div>
                `;
    }).join('');

    // Gán thao tác vuốt lên để Kill App
    attachCardSwipeGesture();
}

window.closeSpatialCard = (tabId) => {
    const cardEl = document.getElementById(`card-${tabId}`);
    if (cardEl) {
        cardEl.classList.add('swiped-up');
        setTimeout(() => {
            if (window.closeTab) window.closeTab(new Event('click'), tabId);
            renderSpatialCards();
        }, 280);
    }
};

function attachCardSwipeGesture() {
    document.querySelectorAll('.ios-deck-card').forEach(card => {
        let startY = 0;
        let startX = 0;
        card.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });

        card.addEventListener('touchend', e => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = Math.abs(startX - endX);

            // Vuốt lên dứt khoát theo trục dọc (> 75px)
            if (diffY > 75 && diffY > diffX) {
                const tabId = card.id.replace('card-', '');
                closeSpatialCard(tabId);
            }
        }, { passive: true });
    });
}

// 5. CỬ CHỈ HOME BAR THÔNG MINH (SWIPE UP: VỀ HOME | SWIPE UP & HOLD: MỞ ĐA NHIỆM)
const homeBarZone = document.getElementById('home-bar-zone');
let touchStartTime = 0;
let touchStartY = 0;
let holdTimer = null;
let didTriggerMultitask = false;

homeBarZone.addEventListener('touchstart', e => {
    touchStartTime = Date.now();
    touchStartY = e.touches[0].clientY;
    didTriggerMultitask = false;
    homeBarZone.classList.add('touch-active');

    // Đếm thời gian: Giữ tay sau khi chạm/vuốt > 280ms -> mở đa nhiệm
    holdTimer = setTimeout(() => {
        didTriggerMultitask = true;
        if (navigator.vibrate) navigator.vibrate(15);
        toggleSpatialSwitcher(true);
    }, 280);
}, { passive: true });

homeBarZone.addEventListener('touchmove', e => {
    const currentY = e.touches[0].clientY;
    const diffY = touchStartY - currentY;
    if (diffY < 15 && holdTimer) {
        clearTimeout(holdTimer);
    }
}, { passive: true });

homeBarZone.addEventListener('touchend', e => {
    homeBarZone.classList.remove('touch-active');
    if (holdTimer) clearTimeout(holdTimer);

    const touchEndTime = Date.now();
    const endY = e.changedTouches[0].clientY;
    const diffY = touchStartY - endY;
    const duration = touchEndTime - touchStartTime;

    if (!didTriggerMultitask) {
        if (diffY > 25) {
            if (duration >= 280) {
                toggleSpatialSwitcher(true);
            } else {
                dismissAppToHome();
            }
        } else {
            dismissAppToHome();
        }
    }
}, { passive: true });

homeBarZone.addEventListener('click', () => {
    dismissAppToHome();
});

// 6. VUỐT CHUYỂN TRANG MÀN HÌNH CHÍNH (HOMESCREEN PAGE SWIPE)
let currentDeckIndex = 0;
const pagesViewport = document.getElementById('pages-viewport');
const dots = document.querySelectorAll('.indicator-dot');

window.switchDeckPage = (index) => {
    currentDeckIndex = index;
    pagesViewport.style.transform = `translateX(-${currentDeckIndex * 100}%)`;
    dots.forEach((dot, i) => {
        dot.className = `indicator-dot w-2 h-2 rounded-full transition-all duration-300 ${i === currentDeckIndex ? 'bg-white w-5' : 'bg-white/30'}`;
    });
};

let touchPageStartX = 0;
document.getElementById('homescreen').addEventListener('touchstart', e => {
    touchPageStartX = e.changedTouches[0].clientX;
}, { passive: true });

document.getElementById('homescreen').addEventListener('touchend', e => {
    const touchPageEndX = e.changedTouches[0].clientX;
    const diffX = touchPageStartX - touchPageEndX;
    if (diffX > 50 && currentDeckIndex === 0) switchDeckPage(1);
    if (diffX < -50 && currentDeckIndex === 1) switchDeckPage(0);
}, { passive: true });

// 7. DYNAMIC ISLAND CONTROLS
const islandCapsule = document.getElementById('island-capsule');
const compactMode = document.getElementById('island-compact');
const expandedMode = document.getElementById('island-expanded');
const closeIslandBtn = document.getElementById('island-close-btn');
const toggleIslandBox = document.getElementById('toggle-island-checkbox');

islandCapsule.addEventListener('click', (e) => {
    if (e.target.closest('#island-close-btn') || e.target.closest('button')) return;
    islandCapsule.classList.add('expanded');
    compactMode.classList.add('hidden');
    expandedMode.classList.remove('hidden');
});

closeIslandBtn.addEventListener('click', () => {
    islandCapsule.classList.remove('expanded');
    expandedMode.classList.add('hidden');
    compactMode.classList.remove('hidden');
});

toggleIslandBox.addEventListener('change', (e) => {
    document.getElementById('island-container').style.display = e.target.checked ? 'flex' : 'none';
});