// Global function for toast notifications, accessible by other scripts
function showToast(type = 'info', title, body) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    // Clear any existing timer
    if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastBody = toast.querySelector('.toast-body');
    const toastDetails = {
        success: { icon: 'fa-check-circle', title: 'Thành công' },
        danger: { icon: 'fa-times-circle', title: 'Lỗi' },
        warning: { icon: 'fa-exclamation-triangle', title: 'Cảnh báo' },
        info: { icon: 'fa-info-circle', title: 'Thông tin' }
    };

    const details = toastDetails[type];
    toast.className = `toast show ${type}`;
    toastIcon.className = `toast-icon fa-solid ${details.icon}`;
    toastTitle.textContent = title || details.title;
    toastBody.textContent = body;

    toast.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}


document.addEventListener('DOMContentLoaded', function() {
    // --- Elements ---
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    const searchInput = document.getElementById('sidebar-search');
    const menuItems = document.querySelectorAll('#menu-list li');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const modalContainer = document.getElementById('modal-container');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtns = document.querySelectorAll('#modal-close-btn-x, #modal-close-btn-secondary');
    const toastCloseBtn = document.getElementById('toast-close-btn');

    // --- Tab Switching ---
    function switchTab(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));

        const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
        const activeTab = document.getElementById(targetId);

        if (activeLink) activeLink.classList.add('active');
        if (activeTab) activeTab.classList.add('active');

        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            toggleMenu();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            window.location.hash = targetId; // Update URL hash
            switchTab(targetId);
        });
    });

    // Handle initial tab based on URL hash or default to first
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        switchTab(initialHash);
    } else if (navLinks.length > 0) {
        switchTab(navLinks[0].getAttribute('href').substring(1));
    }
    
    // --- Mobile Menu ---
    function toggleMenu() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // --- Sidebar Search ---
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        menuItems.forEach(item => {
            const text = item.querySelector('a').textContent.toLowerCase();
            item.style.display = text.includes(filter) ? '' : 'none';
        });
    });

    // --- Theme Management ---
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
        const activeMode = localStorage.getItem('theme-mode') || 'system';
        themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.themeValue === activeMode));
    }
    function handleThemeSelection(value) {
        localStorage.setItem('theme-mode', value);
        if (value === 'system') {
            applyTheme(systemTheme.matches ? 'dark' : 'light');
        } else {
            applyTheme(value);
        }
    }
    themeButtons.forEach(button => button.addEventListener('click', () => handleThemeSelection(button.dataset.themeValue)));
    systemTheme.addEventListener('change', e => {
        if ((localStorage.getItem('theme-mode') || 'system') === 'system') {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    // Initial theme load
    handleThemeSelection(localStorage.getItem('theme-mode') || 'system');

    // --- Generic Modal ---
    if (openModalBtn) openModalBtn.addEventListener('click', () => modalContainer.classList.add('show'));
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => modalContainer.classList.remove('show')));
    if (modalContainer) modalContainer.addEventListener('click', function(e) {
        if (e.target === this) modalContainer.classList.remove('show');
    });

    // --- Toast Close Button ---
    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', () => {
            const toast = document.getElementById('toast-notification');
            toast.classList.remove('show');
            if (toast.toastTimeout) clearTimeout(toast.toastTimeout);
        });
    }

    // --- Demo UI Buttons ---
    document.getElementById('toast-success-btn')?.addEventListener('click', () => showToast('success', 'Thành công!', 'Hành động của bạn đã được ghi nhận.'));
    document.getElementById('toast-danger-btn')?.addEventListener('click', () => showToast('danger', 'Đã xảy ra lỗi!', 'Vui lòng thử lại sau.'));

    // --- Generic Tab Component Logic ---
    function initializeTabs(container) {
        const tabLinks = container.querySelectorAll('.tab-link');
        const tabPanels = container.querySelectorAll('.tab-panel');

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetId = link.getAttribute('data-tab');

                tabLinks.forEach(t => t.classList.remove('active'));
                link.classList.add('active');

                tabPanels.forEach(panel => {
                    panel.classList.toggle('active', panel.id === targetId);
                });
            });
        });
    }

    // Initialize all tab components on the page
    const qrCodeTool = document.getElementById('qr-code');
    const uiTabsExample = document.getElementById('ui-tabs-example');

    if (qrCodeTool) {
        initializeTabs(qrCodeTool);
    }
    if (uiTabsExample) {
        initializeTabs(uiTabsExample);
    }
});