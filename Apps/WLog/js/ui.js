// js/ui.js
import { formatNumToVN } from './utils.js';

// --- DANH SÁCH GIAO DIỆN HIỆN CÓ ---
export const themeList = [
    { id: 'system', label: 'Theo hệ thống' },
    { id: 'light', label: 'Sáng (Light)' },
    { id: 'dark', label: 'Tối (Dark)' },
    { id: 'oled', label: 'Tối sâu (OLED)' },
    { id: 'premium', label: '✨ Premium Gold' },
    { id: 'pink', label: '🌸 Cute Pink' }
];

// --- CUSTOM MODAL ---
let customModalResolve = null;

export const openCustomModal = ({ type, title, message, defaultValue = '' }) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('customModalOverlay');
        const box = document.getElementById('customModalBox');
        const inputEl = document.getElementById('customModalInput');
        const cancelBtn = document.getElementById('customModalCancel');
        
        document.getElementById('customModalTitle').textContent = title;
        document.getElementById('customModalMessage').textContent = message;
        inputEl.classList.add('hidden'); cancelBtn.classList.add('hidden'); inputEl.value = '';

        if (type === 'prompt') { inputEl.classList.remove('hidden'); cancelBtn.classList.remove('hidden'); inputEl.value = defaultValue; } 
        else if (type === 'confirm') { cancelBtn.classList.remove('hidden'); }

        overlay.classList.remove('hidden', 'opacity-0'); box.classList.remove('scale-95');
        if (type === 'prompt') setTimeout(() => inputEl.focus(), 300);
        customModalResolve = resolve;

        const closeModal = (result) => {
            overlay.classList.add('opacity-0'); box.classList.add('scale-95');
            setTimeout(() => {
                overlay.classList.add('hidden');
                if (customModalResolve) { customModalResolve(result); customModalResolve = null; }
            }, 300);
        };

        cancelBtn.onclick = () => closeModal(null);
        document.getElementById('customModalOK').onclick = () => closeModal(type === 'prompt' ? inputEl.value : true);
        inputEl.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('customModalOK').click(); };
    });
};

export const customAlert = (message, title = 'Thông báo') => openCustomModal({ type: 'alert', title, message });
export const customConfirm = (message, title = 'Xác nhận') => openCustomModal({ type: 'confirm', title, message });
export const customPrompt = (message, defaultValue = '', title = 'Nhập liệu') => openCustomModal({ type: 'prompt', title, message, defaultValue });

// --- THEME & GIAO DIỆN ---

// Hàm vẽ các nút Theme ra HTML
export const renderThemeButtons = () => {
    const container = document.getElementById('themeButtonsContainer');
    if (!container) return;

    // Vẽ toàn bộ nút dựa trên themeList
    container.innerHTML = themeList.map(theme => `
        <button type="button" data-theme-id="${theme.id}" 
            class="theme-btn py-2.5 text-xs rounded-xl transition-all" 
            onclick="setThemeType('${theme.id}')">
            ${theme.label}
        </button>
    `).join('');

    // Lấy theme đang lưu để làm sáng nút tương ứng
    const currentTheme = localStorage.getItem('themePref') || 'system';
    updateThemeButtonsUI(currentTheme);
};

export const applyTheme = (theme) => {
    const html = document.documentElement;
    html.classList.remove('dark', 'oled');
    html.removeAttribute('data-theme');

    if (theme === 'dark') html.classList.add('dark');
    else if (theme === 'oled') html.classList.add('dark', 'oled');
    else if (theme === 'premium') html.setAttribute('data-theme', 'premium');
    else if (theme === 'pink') html.setAttribute('data-theme', 'pink');
    else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
    }
};

export const setThemeType = (val) => {
    const select = document.getElementById('themeSelect');
    if (select) select.value = val;
    
    updateThemeButtonsUI(val);
    localStorage.setItem('themePref', val);
    applyTheme(val);
};

const updateThemeButtonsUI = (activeTheme) => {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        const id = btn.getAttribute('data-theme-id');
        const isActive = id === activeTheme;

        // Cấu trúc class cơ bản
        let baseClass = "theme-btn py-2.5 text-xs rounded-xl transition-all ";

        // Tô màu tùy theo từng loại theme
        if (id === 'premium') {
            baseClass += isActive 
                ? "font-bold border border-amber-400 bg-amber-100/50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400 shadow-md transform scale-[1.03] ring-2 ring-amber-400/50 ring-offset-1 dark:ring-offset-gray-900 opacity-100" 
                : "font-medium border border-amber-200/50 bg-amber-50/20 text-amber-600 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-500 opacity-70";
        } else if (id === 'pink') {
            baseClass += isActive 
                ? "font-bold border border-pink-400 bg-pink-100/50 text-pink-700 dark:border-pink-500 dark:bg-pink-900/30 dark:text-pink-400 shadow-md transform scale-[1.03] ring-2 ring-pink-400/50 ring-offset-1 dark:ring-offset-gray-900 opacity-100" 
                : "font-medium border border-pink-200/50 bg-pink-50/20 text-pink-500 dark:border-pink-900/50 dark:bg-pink-900/10 dark:text-pink-400 opacity-70";
        } else {
            // Các theme cơ bản (Hệ thống, Sáng, Tối, OLED)
            baseClass += isActive 
                ? "font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm transform scale-[1.03] opacity-100" 
                : "font-medium text-gray-500 bg-gray-100 dark:bg-gray-800/60 opacity-80 hover:bg-gray-200 dark:hover:bg-gray-700";
        }

        btn.className = baseClass;
    });
};

// --- TABS CHUYỂN TRANG ---
export const switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
        b.classList.add('text-gray-500');
    });
    btnElement.classList.remove('text-gray-500');
    btnElement.classList.add('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
};

export const switchSetTab = (tabId, btnEl) => {
    document.querySelectorAll('.set-tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.set-tab-btn').forEach(btn => btn.className = "set-tab-btn px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold shrink-0 transition");
    btnEl.className = "set-tab-btn px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold shrink-0 transition";
};