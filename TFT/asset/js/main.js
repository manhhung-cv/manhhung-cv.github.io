// ==========================================
// HỆ THỐNG QUẢN LÝ GIAO DIỆN & TABS (main.js)
// Giao diện: Solid Premium (Hiệu năng cao)
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
            if(themeIcon) themeIcon.className = 'fa-solid fa-display text-[14px]';
        } else if (theme === 'dark') {
            isDark = true;
            if(themeIcon) themeIcon.className = 'fa-solid fa-moon text-[14px]';
        } else {
            isDark = false;
            if(themeIcon) themeIcon.className = 'fa-solid fa-sun text-[14px]';
        }

        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }

        localStorage.setItem('tft_theme_pref', theme);

        themeOptions.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('text-premium-gold', 'bg-zinc-100', 'dark:bg-premium-card');
                btn.classList.remove('text-zinc-600', 'dark:text-zinc-300');
            } else {
                btn.classList.remove('text-premium-gold', 'bg-zinc-100', 'dark:bg-premium-card');
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
        
        // Base class: Solid, không bóng đổ nặng, bo tròn hoàn toàn
        let baseClass = `shrink-0 px-5 py-2.5 text-[11px] font-black tracking-widest uppercase rounded-full transition-colors duration-200 flex items-center gap-2 border outline-none snap-center active:scale-95 `;

        if (tab.id === currentTabId) {
            btn.className = baseClass + `bg-premium-gold text-black border-premium-gold`;
        } else {
            btn.className = baseClass + `bg-zinc-100 dark:bg-premium-card text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-premium-gold border-zinc-200 dark:border-premium-border hover:bg-zinc-200 dark:hover:bg-premium-surface`;
        }

        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i> ${tab.name}`;
        btn.onclick = () => switchTab(tab.id);
        navContainer.appendChild(btn);

        const contentDiv = document.createElement('div');
        contentDiv.id = `content-${tab.id}`;
        // Loại bỏ transition-opacity phức tạp để render nhanh nhất
        contentDiv.className = `tab-content ${tab.id === currentTabId ? 'active block' : 'hidden'}`;

        contentDiv.innerHTML = `
            <div class="flex items-center gap-4 mb-6 px-2 border-b border-zinc-200 dark:border-premium-border pb-4">
                <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-premium-card border border-zinc-200 dark:border-premium-border flex items-center justify-center text-premium-gold">
                    <i class="fa-solid ${tab.icon} text-[18px]"></i>
                </div>
                <div>
                    <h2 class="text-xl font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-widest">${tab.name}</h2>
                </div>
            </div>
            <div id="grid-${tab.id}">
                <div class="col-span-full text-center py-16 text-zinc-500 text-xs tracking-widest uppercase font-bold">Đang tải dữ liệu...</div>
            </div>
        `;
        contentContainer.appendChild(contentDiv);
    });

    // Kích hoạt load dữ liệu
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

        let baseClass = `shrink-0 px-5 py-2.5 text-[11px] font-black tracking-widest uppercase rounded-full transition-colors duration-200 flex items-center gap-2 border outline-none snap-center active:scale-95 `;

        if (tab.id === tabId) {
            btn.className = baseClass + `bg-premium-gold text-black border-premium-gold`;
            content.classList.remove('hidden');
            content.classList.add('block', 'active');
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            btn.className = baseClass + `bg-zinc-100 dark:bg-premium-card text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-premium-gold border-zinc-200 dark:border-premium-border hover:bg-zinc-200 dark:hover:bg-premium-surface`;
            content.classList.remove('block', 'active');
            content.classList.add('hidden');
        }
    });
}

// ==========================================
// MODAL LOGIC (SOLID PREMIUM MODAL)
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
    const icon = type === 'error' ? '<i class="fa-solid fa-square-xmark text-red-500 text-xl"></i>' : '<i class="fa-solid fa-square-info text-premium-gold text-xl"></i>';
    modalTitle.innerHTML = `${icon} <span class="uppercase tracking-widest">${title}</span>`;
    modalMsg.innerHTML = message;
    
    // Nút đóng: Solid color, hover mượt
    modalActions.innerHTML = `<button onclick="closeModal()" class="px-7 py-3 bg-zinc-100 dark:bg-premium-card border border-zinc-200 dark:border-premium-border hover:bg-zinc-200 dark:hover:bg-premium-surface hover:border-premium-gold text-zinc-900 dark:text-white text-[11px] font-black rounded-full transition-colors uppercase tracking-widest outline-none">Đóng</button>`;
    openModalBase();
}

window.uiConfirm = function(title, message, onConfirm) {
    const { modalTitle, modalMsg, modalActions } = getModalElements();
    if(!modalTitle) return;
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-question text-premium-gold text-xl"></i> <span class="uppercase tracking-widest">${title}</span>`;
    modalMsg.innerHTML = message;
    modalActions.innerHTML = '';

    const btnCancel = document.createElement('button');
    btnCancel.className = "px-6 py-3 bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-black transition-colors uppercase border border-transparent rounded-full tracking-widest outline-none";
    btnCancel.innerText = "Huỷ";
    btnCancel.onclick = closeModal;

    const btnAccept = document.createElement('button');
    btnAccept.className = "px-7 py-3 bg-premium-gold text-black hover:bg-yellow-400 text-[11px] font-black rounded-full transition-colors uppercase border border-premium-gold tracking-widest outline-none";
    btnAccept.innerText = "Xác nhận";
    btnAccept.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };

    modalActions.appendChild(btnCancel);
    modalActions.appendChild(btnAccept);
    openModalBase();
}

// Khởi tạo Wiki khi tải xong DOM
document.addEventListener('DOMContentLoaded', initWiki);

// Đóng các dropdown khi click ra ngoài (Nếu có)
document.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-load-menu') && !e.target.closest('[onclick*="dropdown-load-menu"]')) {
        document.getElementById('dropdown-load-menu')?.classList.add('hidden');
    }
    if (!e.target.closest('#dropdown-save-menu') && !e.target.closest('[onclick*="dropdown-save-menu"]')) {
        document.getElementById('dropdown-save-menu')?.classList.add('hidden');
    }
});

// Fallback ảnh lỗi
window.onErrorFallback = function(imgElement) {
    imgElement.src = '/Asset/logo/logo.png'; 
    imgElement.onerror = null; 
};