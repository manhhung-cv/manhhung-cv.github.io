// ==========================================
// HỆ THỐNG QUẢN LÝ GIAO DIỆN & TABS (main.js)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-current-icon');
    const themeMenu = document.getElementById('theme-menu-container'); 
    const htmlElement = document.documentElement;
    const themeOptions = document.querySelectorAll('.theme-option');

    function applyTheme(theme) {
        let isDark = false;
        if (theme === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if(themeIcon) themeIcon.className = 'fa-solid fa-display text-[13px]';
        } else if (theme === 'dark') {
            isDark = true;
            if(themeIcon) themeIcon.className = 'fa-solid fa-moon text-[13px]';
        } else {
            isDark = false;
            if(themeIcon) themeIcon.className = 'fa-solid fa-sun text-[13px]';
        }

        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }

        localStorage.setItem('tft_theme_pref', theme);

        themeOptions.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('text-premium-gold', 'bg-black');
                btn.classList.remove('text-zinc-600', 'dark:text-zinc-300');
            } else {
                btn.classList.remove('text-premium-gold', 'bg-black');
                btn.classList.add('text-zinc-600', 'dark:text-zinc-300');
            }
        });
    }

    const savedTheme = localStorage.getItem('tft_theme_pref') || 'dark';
    applyTheme(savedTheme);

    function toggleMenu(show) {
        if (!themeMenu) return;
        if (show) {
            themeMenu.classList.remove('opacity-0', 'invisible', 'scale-95');
            themeMenu.classList.add('opacity-100', 'visible', 'scale-100');
        } else {
            themeMenu.classList.remove('opacity-100', 'visible', 'scale-100');
            themeMenu.classList.add('opacity-0', 'invisible', 'scale-95');
        }
    }

    if (themeBtn && themeMenu) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const isHidden = themeMenu.classList.contains('opacity-0');
            toggleMenu(isHidden);
        });

        document.addEventListener('click', (e) => {
            if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) toggleMenu(false);
        });
    }

    themeOptions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            applyTheme(e.currentTarget.dataset.theme);
            toggleMenu(false); 
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('tft_theme_pref') === 'system') applyTheme('system');
    });
});

const Tabs = [
    { id: 'comps', name: 'Đội Hình', icon: 'fa-users' },
    { id: 'builder', name: 'Tạo Đội Hình', icon: 'fa-hammer' },
    { id: 'gods', name: 'Thần', icon: 'fa-bolt' },
    { id: 'champions', name: 'Tướng', icon: 'fa-user-ninja' },
    { id: 'items', name: 'Trang bị', icon: 'fa-khanda' },
    { id: 'traits', name: 'Tộc hệ', icon: 'fa-shapes' },
    { id: 'donate', name: 'Ủng Hộ', icon: 'fa-heart' },
    { id: 'admin', name: 'Quản lý', icon: 'fa-shield-halved' }
];

let currentTabId = Tabs[0].id;

function initWiki() {
    const navContainer = document.getElementById('tab-nav');
    const contentContainer = document.getElementById('tab-containers');
    if(!navContainer || !contentContainer) return;

    Tabs.forEach((tab) => {
        const btn = document.createElement('button');
        btn.id = `btn-${tab.id}`;
        btn.className = `shrink-0 px-4 py-2 text-[12px] font-bold rounded-sm transition-colors duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 `;

        if (tab.id === currentTabId) {
            btn.className += `bg-premium-gold text-black border-transparent`;
        } else {
            btn.className += `bg-zinc-100 dark:bg-premium-card text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-premium-gold border-zinc-200 dark:border-premium-border hover:border-premium-gold`;
        }

        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i> ${tab.name}`;
        btn.onclick = () => switchTab(tab.id);
        navContainer.appendChild(btn);

        const contentDiv = document.createElement('div');
        contentDiv.id = `content-${tab.id}`;
        contentDiv.className = `tab-content ${tab.id === currentTabId ? 'active block' : 'hidden'}`;

        contentDiv.innerHTML = `
            <div class="flex items-center gap-3 mb-5 px-1 border-b border-zinc-200 dark:border-premium-border pb-3">
                <div class="w-8 h-8 rounded-sm bg-premium-gold flex items-center justify-center text-black">
                    <i class="fa-solid ${tab.icon} text-[15px]"></i>
                </div>
                <div>
                    <h2 class="text-[17px] font-bold text-zinc-900 dark:text-white leading-tight uppercase tracking-wider">${tab.name}</h2>
                </div>
            </div>
            <div id="grid-${tab.id}">
                <div class="col-span-full text-center py-10 text-zinc-500 text-sm font-medium">Đang tải dữ liệu...</div>
            </div>
        `;
        contentContainer.appendChild(contentDiv);
    });

    if (typeof loadGodsData === 'function') loadGodsData();
    if (typeof loadOriginData === 'function') loadOriginData();
    if (typeof loadTraitsData === 'function') loadTraitsData();
    if (typeof loadChampionsData === 'function') loadChampionsData();
    if (typeof loadItemsData === 'function') loadItemsData();
    if (typeof loadCompsData === 'function') loadCompsData();
    if (typeof loadBuilderData === 'function') loadBuilderData();
    if (typeof loadAdminData === 'function') loadAdminData();
    if (typeof loadDonateData === 'function') loadDonateData();
}

function toggleCard(cardElement) {
    if(cardElement) cardElement.classList.toggle('is-expanded');
}

function switchTab(tabId) {
    currentTabId = tabId;
    Tabs.forEach(tab => {
        const btn = document.getElementById(`btn-${tab.id}`);
        const content = document.getElementById(`content-${tab.id}`);
        if(!btn || !content) return;

        if (tab.id === tabId) {
            btn.className = `shrink-0 px-4 py-2 text-[12px] font-bold rounded-sm transition-colors duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 bg-premium-gold text-black border-transparent`;
            content.classList.remove('hidden');
            content.classList.add('block', 'active');
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            btn.className = `shrink-0 px-4 py-2 text-[12px] font-bold rounded-sm transition-colors duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 bg-zinc-100 dark:bg-premium-card text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-premium-gold border-zinc-200 dark:border-premium-border hover:border-premium-gold`;
            content.classList.remove('block', 'active');
            content.classList.add('hidden');
        }
    });
}

// ==========================================
// MODAL LOGIC 
// ==========================================
function getModalElements() {
    return {
        modalEl: document.getElementById('custom-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMsg: document.getElementById('modal-message'),
        modalActions: document.getElementById('modal-actions')
    };
}

function closeModal() { 
    const { modalEl } = getModalElements();
    if(!modalEl) return;
    modalEl.classList.remove('opacity-100', 'visible', 'show');
    modalEl.classList.add('opacity-0', 'invisible');
    const modalBox = modalEl.querySelector('.modal-box');
    if(modalBox) setTimeout(() => { modalBox.classList.remove('scale-100'); }, 10);
}

function openModalBase() {
    const { modalEl } = getModalElements();
    if(!modalEl) return;
    modalEl.classList.remove('opacity-0', 'invisible');
    modalEl.classList.add('opacity-100', 'visible', 'show');
    const modalBox = modalEl.querySelector('.modal-box');
    if(modalBox) modalBox.classList.add('scale-100');
}

document.addEventListener('click', (e) => {
    const modalEl = document.getElementById('custom-modal');
    if (modalEl && e.target === modalEl) closeModal();
});

window.uiAlert = function(title, message, type = 'info') {
    const { modalTitle, modalMsg, modalActions } = getModalElements();
    if(!modalTitle) return;
    const icon = type === 'error' ? '<i class="fa-solid fa-square-xmark text-red-500"></i>' : '<i class="fa-solid fa-square-info text-premium-gold"></i>';
    modalTitle.innerHTML = `${icon} <span class="uppercase tracking-wide">${title}</span>`;
    modalMsg.innerHTML = message;
    modalActions.innerHTML = `<button onclick="closeModal()" class="px-5 py-2 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-premium-border hover:text-premium-gold text-zinc-900 dark:text-white text-xs font-bold rounded-sm transition-colors uppercase">Đóng</button>`;
    openModalBase();
}

window.uiConfirm = function(title, message, onConfirm) {
    const { modalTitle, modalMsg, modalActions } = getModalElements();
    if(!modalTitle) return;
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-question text-premium-gold"></i> <span class="uppercase tracking-wide">${title}</span>`;
    modalMsg.innerHTML = message;
    modalActions.innerHTML = '';

    const btnCancel = document.createElement('button');
    btnCancel.className = "px-4 py-2 bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold transition-colors uppercase border border-transparent";
    btnCancel.innerText = "Huỷ";
    btnCancel.onclick = closeModal;

    const btnAccept = document.createElement('button');
    btnAccept.className = "px-4 py-2 bg-premium-gold text-black hover:bg-yellow-500 text-xs font-bold rounded-sm transition-colors uppercase border border-transparent";
    btnAccept.innerText = "Xác nhận";
    btnAccept.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };

    modalActions.appendChild(btnCancel);
    modalActions.appendChild(btnAccept);
    openModalBase();
}

document.addEventListener('DOMContentLoaded', initWiki);

document.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-load-menu') && !e.target.closest('[onclick*="dropdown-load-menu"]')) {
        document.getElementById('dropdown-load-menu')?.classList.add('hidden');
    }
    if (!e.target.closest('#dropdown-save-menu') && !e.target.closest('[onclick*="dropdown-save-menu"]')) {
        document.getElementById('dropdown-save-menu')?.classList.add('hidden');
    }
});