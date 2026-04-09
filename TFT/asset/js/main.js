// ==========================================
// HỆ THỐNG QUẢN LÝ GIAO DIỆN (DARK MODE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-current-icon');
    const themeMenu = document.getElementById('theme-menu-container'); 
    const htmlElement = document.documentElement;
    const themeOptions = document.querySelectorAll('.theme-option');

    // Hàm thay đổi giao diện và icon
    function applyTheme(theme) {
        let isDark = false;

        if (theme === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeIcon.className = 'fa-solid fa-display text-[13px]';
        } else if (theme === 'dark') {
            isDark = true;
            themeIcon.className = 'fa-solid fa-moon text-[13px]';
        } else {
            isDark = false;
            themeIcon.className = 'fa-solid fa-sun text-[13px]';
        }

        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }

        localStorage.setItem('tft_theme_pref', theme);

        themeOptions.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('text-premium-gold', 'dark:text-premium-gold', 'bg-premium-gold/10');
                btn.classList.remove('text-slate-600', 'dark:text-slate-300');
            } else {
                btn.classList.remove('text-premium-gold', 'dark:text-premium-gold', 'bg-premium-gold/10');
                btn.classList.add('text-slate-600', 'dark:text-slate-300');
            }
        });
    }

    const savedTheme = localStorage.getItem('tft_theme_pref') || 'dark';
    applyTheme(savedTheme);

    // ==========================================
    // LOGIC ĐÓNG/MỞ MENU CÓ HIỆU ỨNG (TAILWIND)
    // ==========================================
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
        // Click vào nút để bật/tắt menu
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const isHidden = themeMenu.classList.contains('opacity-0');
            toggleMenu(isHidden); // Mở nếu đang ẩn, ẩn nếu đang mở
        });

        // Click ra ngoài để đóng menu
        document.addEventListener('click', (e) => {
            if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
                toggleMenu(false);
            }
        });
    }

    // Đóng menu sau khi chọn 1 option
    themeOptions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.dataset.theme;
            applyTheme(selectedTheme);
            toggleMenu(false); // Ẩn menu đi sau khi chọn
        });
    });

    // Lắng nghe thay đổi theme từ hệ thống
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('tft_theme_pref') === 'system') {
            applyTheme('system');
        }
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

    Tabs.forEach((tab) => {
        const btn = document.createElement('button');
        btn.id = `btn-${tab.id}`;
        // Thêm snap-center để khi vuốt, thẻ tự hút vào giữa màn hình. Thêm active:scale-95 để bấm sướng tay hơn.
        btn.className = `shrink-0 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 `;

        if (tab.id === currentTabId) {
            // Chuyển sang style màu đặc, bỏ shadow để tối ưu FPS
            btn.className += `bg-premium-gold text-black border-transparent shadow-md`;
        } else {
            btn.className += `bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white shadow-sm`;
        }

        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i> ${tab.name}`;
        btn.onclick = () => switchTab(tab.id);
        navContainer.appendChild(btn);

        const contentDiv = document.createElement('div');
        contentDiv.id = `content-${tab.id}`;
        contentDiv.className = `tab-content ${tab.id === currentTabId ? 'active' : ''}`;

        contentDiv.innerHTML = `
                    <div class="flex items-center gap-3 mb-5 px-1">
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-premium-card flex items-center justify-center border border-slate-300 dark:border-premium-border text-premium-accent shadow-sm">
                            <i class="fa-solid ${tab.icon} text-lg"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-slate-800 dark:text-white leading-tight transition-colors">${tab.name}</h2>
                            <p class="text-xs text-slate-500">Dữ liệu ${tab.name.toLowerCase()}</p>
                        </div>
                    </div>
                    
                    <div id="grid-${tab.id}">
                        <div class="col-span-full text-center py-10 text-slate-500 text-sm">Đang tải dữ liệu...</div>
                    </div>
                `;
        contentContainer.appendChild(contentDiv);
    });

    loadGodsData();
    loadOriginData();
    loadTraitsData();
    loadChampionsData();
    loadItemsData();
    loadCompsData();
    loadBuilderData();
    loadAdminData();
    loadDonateData();
}

// Hàm xử lý đóng/mở Card khi được nhấn
function toggleCard(cardElement) {
    // Chỉ đơn giản là toggle class 'is-expanded' trên thẻ Card được nhấn
    // CSS sẽ tự xử lý phần còn lại (xoay icon, trượt nội dung)
    cardElement.classList.toggle('is-expanded');
}

// Logic Chuyển Tab (Cập nhật cho kiểu dáng Pill)
function switchTab(tabId) {
    currentTabId = tabId;
    Tabs.forEach(tab => {
        const btn = document.getElementById(`btn-${tab.id}`);
        const content = document.getElementById(`content-${tab.id}`);

        if (tab.id === tabId) {
            // Cập nhật class chuẩn Mobile
            btn.className = `shrink-0 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 bg-premium-gold text-black border-transparent shadow-md`;
            content.classList.add('active');

            // Cuộn menu sao cho tab active ở giữa màn hình (rất tiện cho mobile)
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            // Set inactive classes
            btn.className = `shrink-0 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 border outline-none snap-center active:scale-95 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white shadow-sm`;
            content.classList.remove('active');
        }
    });
}

// Modal Logic
const modalEl = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-message');
const modalActions = document.getElementById('modal-actions');

function closeModal() { modalEl.classList.remove('show'); }

// Bấm ra ngoài để đóng Modal
modalEl.addEventListener('click', (e) => {
    // e.target là phần tử thực sự bị click. 
    // Nếu nó chính xác là lớp nền đen (modalEl) chứ không phải hộp nội dung bên trong, thì mới đóng.
    if (e.target === modalEl) {
        closeModal();
    }
});

function uiAlert(title, message, type = 'info') {
    const icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation text-red-500"></i>' : '<i class="fa-solid fa-circle-info text-premium-accent"></i>';
    modalTitle.innerHTML = `${icon} ${title}`;
    modalMsg.innerHTML = message;
    modalActions.innerHTML = `<button onclick="closeModal()" class="px-5 py-2 bg-premium-card border border-premium-border hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">Đóng</button>`;
    modalEl.classList.add('show');
}

function uiConfirm(title, message, onConfirm) {
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-question text-premium-gold"></i> ${title}`;
    modalMsg.innerHTML = message;
    modalActions.innerHTML = '';

    const btnCancel = document.createElement('button');
    btnCancel.className = "px-4 py-2 bg-transparent text-slate-400 hover:text-white text-sm font-medium rounded-xl transition-colors";
    btnCancel.innerText = "Huỷ";
    btnCancel.onclick = closeModal;

    const btnAccept = document.createElement('button');
    btnAccept.className = "px-4 py-2 bg-premium-gold text-black hover:bg-yellow-400 text-sm font-bold rounded-xl transition-colors";
    btnAccept.innerText = "Xác nhận";
    btnAccept.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };

    modalActions.appendChild(btnCancel);
    modalActions.appendChild(btnAccept);
    modalEl.classList.add('show');
}

function testConfirm() {
    uiConfirm('Cài đặt', 'Bạn có muốn làm mới dữ liệu trang Wiki không?', () => {
        setTimeout(() => uiAlert('Thành công', 'Dữ liệu đã được làm mới!'), 300);
    });
}

document.addEventListener('DOMContentLoaded', initWiki);
