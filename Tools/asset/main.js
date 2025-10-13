// Global function for toast notifications, accessible by other scripts
function showToast(type = 'info', title, body) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

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

// --- REUSABLE CONFIRMATION MODAL FUNCTION (FIXED) ---
// Moved to global scope to be accessible by all scripts
function showConfirmationModal(title, message, onConfirm) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const modalTitle = modalContainer.querySelector('.modal-title');
    const modalBody = modalContainer.querySelector('.modal-body');
    const confirmBtn = modalContainer.querySelector('.modal-footer .btn-primary');
    
    if (!modalTitle || !modalBody || !confirmBtn) {
        console.error('Modal structure is incorrect. Cannot find title, body, or primary button.');
        return;
    }

    // Update modal content
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${message}</p>`;

    // Style the confirm button for a "danger" action
    confirmBtn.textContent = 'Xác nhận';
    confirmBtn.style.backgroundColor = 'var(--danger-bg)';
    confirmBtn.style.borderColor = 'var(--danger-bg)';
    confirmBtn.style.color = 'var(--danger-text)';

    // Clone the button to remove any previous event listeners, preventing multiple triggers
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add a single-use event listener for the confirmation action
    newConfirmBtn.addEventListener('click', function handleConfirm() {
        onConfirm(); // Execute the callback action
        modalContainer.classList.remove('show');
        
        // Reset button style after a short delay to its original state
        setTimeout(() => {
            newConfirmBtn.textContent = 'Lưu'; // Original text
            newConfirmBtn.style.backgroundColor = '';
            newConfirmBtn.style.borderColor = '';
            newConfirmBtn.style.color = '';
        }, 300);
    }, { once: true });

    // Show the modal
    modalContainer.classList.add('show');
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

        // Close menu on mobile after switching tab
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            toggleMenu();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            window.location.hash = targetId;
            switchTab(targetId);
        });
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        switchTab(initialHash);
    } else if (navLinks.length > 0) {
        switchTab(navLinks[0].getAttribute('href').substring(1));
    }
    
    // --- Menu Modal Logic ---
    function toggleMenu() {
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('show');

        if (isOpen) {
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

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
        
        // Apply to all theme switchers (desktop and mobile)
        document.querySelectorAll('.theme-switcher').forEach(switcher => {
            switcher.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.themeValue === activeMode)
            });
        });
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

    document.querySelectorAll('#qr-code, #ui-tabs-example, #random').forEach(container => {
        if(container) initializeTabs(container);
    });

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleMenu();
        }
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleMenu();
        }
        if (e.key === 'Escape' && modalContainer.classList.contains('show')) {
            modalContainer.classList.remove('show');
        }
    });
});