import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER
// =============================================================================
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') || 
               localStorage.getItem('hunqos_icon_custom_bg') || 
               DEFAULT_EMERALD;
    },
    applyAccent: (container) => {
        if (!container) return;
        const accent = ThemeKit.getAccentColor();
        container.style.setProperty('--kit-accent', accent);
    }
};

// =============================================================================
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="notepro-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #notepro-root-container {
                --kit-accent: #10b981;
            }
            .bg-accent-theme {
                background-color: var(--kit-accent) !important;
            }
            .text-accent-theme {
                color: var(--kit-accent) !important;
            }
            .border-accent-theme {
                border-color: var(--kit-accent) !important;
            }
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .switch-pill {
                width: 44px;
                height: 24px;
                background-color: rgba(0, 0, 0, 0.12) !important;
                border-radius: 9999px;
                position: relative;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                padding: 2px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
            }
            .dark .switch-pill {
                background-color: rgba(255, 255, 255, 0.16) !important;
                border-color: rgba(255, 255, 255, 0.12);
            }
            .switch-pill .switch-thumb {
                width: 18px;
                height: 18px;
                background-color: #ffffff;
                border-radius: 9999px;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
            }
            .switch-pill.active {
                background-color: var(--kit-accent) !important;
                border-color: transparent !important;
            }
            .switch-pill.active .switch-thumb {
                transform: translateX(20px);
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .folder-chip { flex-shrink: 0; transition: all 0.2s ease; }
            .folder-chip.active {
                background-color: var(--kit-accent) !important;
                color: #ffffff !important;
                border-color: transparent !important;
            }

            .note-card.active {
                border-color: var(--kit-accent) !important;
                background-color: color-mix(in srgb, var(--kit-accent) 8%, transparent) !important;
            }

            [contenteditable]:empty:before { content: attr(placeholder); color: #a1a1aa; pointer-events: none; display: block; }
            .dark [contenteditable]:empty:before { color: #52525b; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Security</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">NotePRO Vault</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Sổ ghi chép an toàn, mã hóa đầu cuối (E2E) và quản lý phân vùng độc lập.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-add-folder" class="h-11 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-folder-plus text-accent-theme text-xs"></i> Thư mục
                    </button>
                    <button id="btn-new-note" class="h-11 px-4 rounded-[14px] bg-accent-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-pen-to-square text-xs"></i> Bản ghi mới
                    </button>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- FOLDER HORIZONTAL CHIPS -->
                    <div id="np-folder-chips" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:max-w-[65%]"></div>

                    <!-- AUTO-LOCK TOGGLE SWITCH & ACTIONS -->
                    <div class="flex items-center justify-between sm:justify-end gap-3">
                        <div class="flex items-center gap-2.5 bg-[#f2f2f7] dark:bg-black/40 px-3.5 py-1.5 rounded-[14px] border border-black/[0.04] dark:border-white/[0.06]">
                            <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <i class="fas fa-shield-halved text-accent-theme text-xs"></i> Auto-Lock
                            </span>
                            <button id="auto-lock-switch" class="switch-pill active" type="button" aria-label="Toggle Auto-Lock">
                                <div class="switch-thumb"></div>
                            </button>
                        </div>

                        <div class="flex items-center gap-1.5">
                            <button id="btn-import-json" class="h-9 w-9 rounded-[12px] bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-xs active:scale-95 transition-all" title="Nhập dữ liệu">
                                <i class="fas fa-file-import text-[11px]"></i>
                            </button>
                            <button id="btn-export-json" class="h-9 w-9 rounded-[12px] bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-xs active:scale-95 transition-all" title="Xuất dữ liệu">
                                <i class="fas fa-file-export text-[11px]"></i>
                            </button>
                            <input type="file" id="np-import-file" class="hidden" accept=".json">
                        </div>
                    </div>
                </div>

                <!-- SEARCH BAR -->
                <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                    <i class="fas fa-search text-zinc-400 text-xs mr-2.5"></i>
                    <input type="text" id="np-search" class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Tìm kiếm tiêu đề hoặc nội dung...">
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- REPOSITORY / LIST CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Danh mục bản ghi</h3>
                            <span id="notes-count" class="text-[10px] text-zinc-400 font-mono">0 mục</span>
                        </div>

                        <!-- Notes List Scroller -->
                        <div id="np-list" class="flex-1 custom-scrollbar overflow-y-auto space-y-2 min-h-[300px] max-h-[520px] pr-1"></div>
                    </div>

                    <!-- Bottom Status Indicator -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span class="flex items-center gap-1.5 font-medium">
                            <i class="fas fa-lock text-accent-theme text-[10px]"></i> Bộ nhớ cục bộ
                        </span>
                        <span class="font-mono text-[10px]">AES/XOR Safe</span>
                    </div>
                </div>

                <!-- EDITOR & CRYPTO CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4 relative">
                    
                    <!-- EMPTY STATE OVERLAY -->
                    <div id="np-empty-state" class="absolute inset-0 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md rounded-[24px] z-20 flex flex-col items-center justify-center p-6 text-center transition-opacity">
                        <div class="w-14 h-14 rounded-[18px] bg-accent-theme-alpha flex items-center justify-center mb-3 text-accent-theme">
                            <i class="fas fa-fingerprint text-2xl"></i>
                        </div>
                        <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Chọn hoặc tạo một bản ghi</p>
                        <p class="text-[11px] text-zinc-400">Dữ liệu được bảo vệ an toàn trên thiết bị của bạn.</p>
                    </div>

                    <div class="space-y-3 flex-1 flex flex-col z-10">
                        <!-- Card Header Actions -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span id="np-status-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                                    Ready
                                </span>
                            </div>

                            <div class="flex items-center gap-1">
                                <button id="btn-delete-note" class="px-2.5 py-1 rounded-[8px] hover:bg-rose-500/10 text-rose-500 text-[11px] font-medium transition-colors flex items-center gap-1" title="Xóa bản ghi">
                                    <i class="far fa-trash-can"></i> Xóa
                                </button>
                                <button id="btn-save-note" class="px-3 py-1 rounded-[8px] bg-accent-theme text-white text-[11px] font-semibold active:scale-95 transition-all flex items-center gap-1">
                                    <i class="fas fa-cloud-arrow-up text-[10px]"></i> Lưu
                                </button>
                            </div>
                        </div>

                        <!-- Note Title -->
                        <input type="text" id="np-title" class="w-full bg-transparent border-none outline-none text-base sm:text-lg font-black text-zinc-900 dark:text-white placeholder-zinc-400 p-0" placeholder="Tiêu đề tài liệu...">

                        <!-- Rich Toolbar -->
                        <div id="np-editor-toolbar" class="flex items-center gap-1 bg-[#f2f2f7] dark:bg-black/40 p-1 rounded-[14px] border border-black/[0.04] dark:border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
                            <button class="editor-cmd h-8 w-8 shrink-0 rounded-[10px] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#27272a] text-xs flex items-center justify-center active:scale-95 transition-all" data-cmd="bold"><i class="fas fa-bold"></i></button>
                            <button class="editor-cmd h-8 w-8 shrink-0 rounded-[10px] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#27272a] text-xs flex items-center justify-center active:scale-95 transition-all" data-cmd="italic"><i class="fas fa-italic"></i></button>
                            <button class="editor-cmd h-8 w-8 shrink-0 rounded-[10px] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#27272a] text-xs flex items-center justify-center active:scale-95 transition-all" data-cmd="underline"><i class="fas fa-underline"></i></button>
                            <div class="w-px h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-1 self-center shrink-0"></div>
                            <button class="editor-cmd h-8 w-8 shrink-0 rounded-[10px] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#27272a] text-xs flex items-center justify-center active:scale-95 transition-all" data-cmd="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                            <button class="editor-cmd h-8 w-8 shrink-0 rounded-[10px] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#27272a] text-xs flex items-center justify-center active:scale-95 transition-all" data-cmd="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                        </div>

                        <!-- Content Area -->
                        <div id="np-content" contenteditable="true" class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 custom-scrollbar overflow-y-auto min-h-[170px] max-h-[320px] focus:border-accent-theme transition-all whitespace-pre-wrap" placeholder="Nhập nội dung ghi chú..."></div>
                    </div>

                    <!-- Bottom Crypto Control Strip -->
                    <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] z-10 space-y-2">
                        <!-- Locked / Unlocked Form Controller -->
                        <div id="crypto-action-bar" class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                            <i class="fas fa-key text-zinc-400 ml-3 text-xs"></i>
                            <input type="password" id="np-password" class="w-full bg-transparent border-none outline-none px-2.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Nhập mật mã để khóa/mở...">
                            <button id="btn-toggle-crypto" class="h-9 px-4 rounded-[12px] bg-accent-theme text-white text-xs font-bold active:scale-95 transition-all shadow-sm whitespace-nowrap flex items-center gap-1.5">
                                <i class="fas fa-lock text-[11px]"></i> Khóa mã
                            </button>
                        </div>

                        <div id="unlocked-action-bar" class="hidden items-center justify-between gap-2 bg-accent-theme-alpha border border-accent-theme/20 p-2 rounded-[16px]">
                            <span class="text-xs font-bold text-accent-theme flex items-center gap-1.5 pl-1.5">
                                <i class="fas fa-lock-open text-xs"></i> Đang mở khóa bộ nhớ tạm
                            </span>
                            <div class="flex items-center gap-1.5">
                                <button id="btn-remove-crypto" class="h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 active:scale-95 transition-all">
                                    Hủy mã hóa
                                </button>
                                <button id="btn-lock-now" class="h-8 px-3.5 rounded-[10px] bg-accent-theme text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm">
                                    Khóa ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#notepro-root-container') || hostElement;

    // Theme hook
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Storage Models
    let folders = JSON.parse(localStorage.getItem('notepro_folders')) || [
        { id: 'all', name: 'Tất cả' },
        { id: 'uncategorized', name: 'Nháp Cục Bộ' }
    ];
    let notes = JSON.parse(localStorage.getItem('notepro_notes')) || [];
    let activeFolderId = 'all';
    let activeNoteId = null;

    let isCurrentlyUnlocked = false;
    let sessionPwd = null;
    let idleTime = 0;
    let autoLockEnabled = true;

    // DOM Elements
    const folderChipsContainer = hostElement.querySelector('#np-folder-chips');
    const listContainer = hostElement.querySelector('#np-list');
    const notesCount = hostElement.querySelector('#notes-count');
    const searchInput = hostElement.querySelector('#np-search');
    const emptyState = hostElement.querySelector('#np-empty-state');

    const inputTitle = hostElement.querySelector('#np-title');
    const inputContent = hostElement.querySelector('#np-content');
    const inputPassword = hostElement.querySelector('#np-password');
    const statusBadge = hostElement.querySelector('#np-status-badge');

    const btnToggleCrypto = hostElement.querySelector('#btn-toggle-crypto');
    const cryptoActionBar = hostElement.querySelector('#crypto-action-bar');
    const unlockedActionBar = hostElement.querySelector('#unlocked-action-bar');
    const btnLockNow = hostElement.querySelector('#btn-lock-now');
    const btnRemoveCrypto = hostElement.querySelector('#btn-remove-crypto');

    const btnSaveNote = hostElement.querySelector('#btn-save-note');
    const btnDeleteNote = hostElement.querySelector('#btn-delete-note');
    const btnNewNote = hostElement.querySelector('#btn-new-note');
    const btnAddFolder = hostElement.querySelector('#btn-add-folder');

    const switchAutoLock = hostElement.querySelector('#auto-lock-switch');
    const editorToolbar = hostElement.querySelector('#np-editor-toolbar');

    // Switch Auto-Lock
    switchAutoLock?.addEventListener('click', () => {
        switchAutoLock.classList.toggle('active');
        autoLockEnabled = switchAutoLock.classList.contains('active');
        IslandKit.notify('Auto-Lock', autoLockEnabled ? 'Đã bật tự động khóa.' : 'Đã tắt bảo vệ tự động.', 'info');
    });

    // Cipher Engine
    const encryptPayload = (titleText, contentHtml, password) => {
        try {
            const dataObj = JSON.stringify({ title: titleText, content: contentHtml });
            const bytesStr = unescape(encodeURIComponent(dataObj));
            let xored = '';
            for (let i = 0; i < bytesStr.length; i++) {
                xored += String.fromCharCode(bytesStr.charCodeAt(i) ^ (password.charCodeAt(i % password.length) & 255));
            }
            return btoa(xored);
        } catch (e) {
            return null;
        }
    };

    const decryptPayload = (b64Str, password) => {
        try {
            const xored = atob(b64Str);
            let bytesStr = '';
            for (let i = 0; i < xored.length; i++) {
                bytesStr += String.fromCharCode(xored.charCodeAt(i) ^ (password.charCodeAt(i % password.length) & 255));
            }
            const dataStr = decodeURIComponent(escape(bytesStr));
            return JSON.parse(dataStr);
        } catch (e) {
            return null;
        }
    };

    const sanitizeText = (str) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/html');
        return doc.body.textContent || '';
    };

    const saveToStorage = () => {
        localStorage.setItem('notepro_folders', JSON.stringify(folders));
        localStorage.setItem('notepro_notes', JSON.stringify(notes));
    };

    // Render Folders (Segmented Chips)
    const renderFolders = () => {
        if (!folderChipsContainer) return;
        folderChipsContainer.innerHTML = '';

        folders.forEach(folder => {
            const isActive = folder.id === activeFolderId;
            const chip = document.createElement('button');
            chip.className = `folder-chip h-8 px-3 rounded-[10px] text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                isActive 
                    ? 'active shadow-sm' 
                    : 'bg-[#f2f2f7] dark:bg-black/40 border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`;
            chip.innerHTML = `<i class="fas ${folder.id === 'all' ? 'fa-layer-group' : 'fa-folder'} text-[10px]"></i> ${folder.name}`;

            chip.addEventListener('click', () => {
                activeFolderId = folder.id;
                renderFolders();
                renderNotesList(searchInput.value);
            });

            folderChipsContainer.appendChild(chip);
        });
    };

    // Render Notes List
    const renderNotesList = (filterText = '') => {
        if (!listContainer) return;
        listContainer.innerHTML = '';

        let filtered = notes;
        if (activeFolderId !== 'all') {
            if (activeFolderId === 'uncategorized') filtered = filtered.filter(n => !n.folderId || n.folderId === 'uncategorized');
            else filtered = filtered.filter(n => n.folderId === activeFolderId);
        }

        if (filterText.trim()) {
            filtered = filtered.filter(n => n.title.toLowerCase().includes(filterText.toLowerCase()));
        }

        notesCount.textContent = `${filtered.length} mục`;

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-black/[0.06] dark:border-white/[0.08] rounded-[16px]">
                    <i class="fas fa-folder-open text-2xl text-zinc-300 dark:text-zinc-700 mb-2"></i>
                    <span class="text-xs text-zinc-400 font-medium">Không có bản ghi phù hợp</span>
                </div>`;
            return;
        }

        filtered.forEach(note => {
            const date = new Date(note.timestamp);
            const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            const isLocked = note.isEncrypted;
            const isActive = note.id === activeNoteId;

            let preview = 'Bản ghi trống...';
            if (isLocked) preview = 'Tài liệu đã được khóa mã hóa E2E';
            else if (note.content) preview = sanitizeText(note.content).substring(0, 45) + '...';

            const card = document.createElement('div');
            card.className = `note-card p-3 rounded-[16px] border border-black/[0.05] dark:border-white/[0.08] bg-[#f2f2f7]/60 dark:bg-black/30 hover:bg-[#f2f2f7] dark:hover:bg-black/50 cursor-pointer transition-all active:scale-[0.99] flex items-start justify-between gap-2.5 ${isActive ? 'active shadow-sm' : ''}`;

            card.innerHTML = `
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-1">
                        ${isLocked ? '<i class="fas fa-lock text-[10px] text-rose-500 shrink-0"></i>' : ''}
                        <h4 class="text-xs font-bold truncate text-zinc-900 dark:text-white">${note.title}</h4>
                    </div>
                    <p class="text-[11px] truncate text-zinc-500 dark:text-zinc-400 font-normal">${preview}</p>
                </div>
                <div class="shrink-0 text-[9px] text-zinc-400 font-mono text-right pt-0.5">
                    <div>${timeStr}</div>
                    <div>${dateStr}</div>
                </div>
            `;

            card.onclick = () => loadNoteData(note.id);
            listContainer.appendChild(card);
        });
    };

    // Load Note
    const loadNoteData = (id) => {
        if (activeNoteId && activeNoteId !== id && isCurrentlyUnlocked) {
            lockActiveNote(false);
        }

        activeNoteId = id;
        const note = notes.find(n => n.id === id);
        if (!note) return;

        if (note.isEncrypted && !isCurrentlyUnlocked) {
            isCurrentlyUnlocked = false;
            sessionPwd = null;
        }

        renderNotesList(searchInput.value);
        if (emptyState) emptyState.classList.add('hidden');

        inputPassword.value = '';

        if (note.isEncrypted && !isCurrentlyUnlocked) {
            inputTitle.value = '';
            inputTitle.disabled = true;
            inputTitle.placeholder = 'Tài liệu đang bị khóa...';

            inputContent.innerHTML = '<div class="text-rose-500 font-semibold flex flex-col items-center justify-center h-32 opacity-75 select-none"><i class="fas fa-shield-halved text-3xl mb-2"></i><p class="text-xs">Bản ghi mã hóa an toàn. Vui lòng nhập khóa bảo vệ.</p></div>';
            inputContent.contentEditable = 'false';
            editorToolbar.style.opacity = '0.3';
            editorToolbar.style.pointerEvents = 'none';

            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
            statusBadge.innerHTML = '<i class="fas fa-lock mr-1"></i> E2E Locked';

            cryptoActionBar.classList.remove('hidden');
            cryptoActionBar.classList.add('flex');
            unlockedActionBar.classList.add('hidden');
            unlockedActionBar.classList.remove('flex');

            inputPassword.placeholder = 'Nhập mật mã để mở khóa...';
            btnToggleCrypto.innerHTML = '<i class="fas fa-lock-open text-[11px]"></i> Mở khóa';
        } else {
            inputTitle.disabled = false;
            inputTitle.placeholder = 'Tiêu đề tài liệu...';
            inputContent.contentEditable = 'true';
            editorToolbar.style.opacity = '1';
            editorToolbar.style.pointerEvents = 'auto';

            if (note.isEncrypted && isCurrentlyUnlocked) {
                statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-accent-theme-alpha text-accent-theme border border-accent-theme/30';
                statusBadge.innerHTML = '<i class="fas fa-lock-open mr-1"></i> E2E Unlocked';

                cryptoActionBar.classList.add('hidden');
                cryptoActionBar.classList.remove('flex');
                unlockedActionBar.classList.remove('hidden');
                unlockedActionBar.classList.add('flex');
            } else {
                inputTitle.value = note.title === '*** Bản ghi bảo mật ***' ? '' : note.title;
                inputContent.innerHTML = note.content;

                statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300';
                statusBadge.innerHTML = '<i class="fas fa-file-lines mr-1"></i> Plain Draft';

                cryptoActionBar.classList.remove('hidden');
                cryptoActionBar.classList.add('flex');
                unlockedActionBar.classList.add('hidden');
                unlockedActionBar.classList.remove('flex');

                inputPassword.placeholder = 'Nhập mật mã để mã hóa bản ghi...';
                btnToggleCrypto.innerHTML = '<i class="fas fa-lock text-[11px]"></i> Khóa mã';
            }
        }
    };

    const clearEditor = () => {
        activeNoteId = null;
        isCurrentlyUnlocked = false;
        sessionPwd = null;

        inputTitle.value = '';
        inputContent.innerHTML = '';
        inputPassword.value = '';
        inputTitle.disabled = false;
        inputContent.contentEditable = 'true';

        if (emptyState) emptyState.classList.remove('hidden');
        renderFolders();
        renderNotesList();
    };

    // Save
    const saveCurrentNote = () => {
        if (!activeNoteId) return;
        const note = notes.find(n => n.id === activeNoteId);
        if (!note) return;

        note.timestamp = Date.now();

        if (note.isEncrypted) {
            if (isCurrentlyUnlocked && sessionPwd) {
                const titleText = inputTitle.value.trim() || 'Không tiêu đề';
                const contentHtml = inputContent.innerHTML;
                const encryptedPayload = encryptPayload(titleText, contentHtml, sessionPwd);

                if (encryptedPayload) {
                    note.content = encryptedPayload;
                    note.title = '*** Bản ghi bảo mật ***';
                }
            }
        } else {
            note.title = inputTitle.value.trim() || 'Bản ghi không tên';
            note.content = inputContent.innerHTML;
        }

        saveToStorage();
        renderNotesList(searchInput.value);
    };

    btnSaveNote?.addEventListener('click', () => {
        saveCurrentNote();
        IslandKit.notify('Thành công', 'Đã lưu và đồng bộ bản ghi.', 'success');
    });

    btnNewNote?.addEventListener('click', () => {
        const defaultFolder = (activeFolderId === 'all') ? 'uncategorized' : activeFolderId;
        const newNote = {
            id: 'note_' + Date.now(),
            title: 'Bản ghi mới',
            content: '',
            folderId: defaultFolder,
            isEncrypted: false,
            timestamp: Date.now()
        };
        notes.unshift(newNote);
        saveToStorage();
        loadNoteData(newNote.id);
        inputTitle.focus();
        IslandKit.notify('Tạo mới', 'Đã khởi tạo bản ghi mới.', 'info');
    });

    btnDeleteNote?.addEventListener('click', () => {
        if (!activeNoteId) return;
        UI.showConfirm('Xác nhận xóa?', 'Bản ghi này sẽ bị xóa hoàn toàn khỏi bộ nhớ thiết bị.', () => {
            notes = notes.filter(n => n.id !== activeNoteId);
            saveToStorage();
            clearEditor();
            IslandKit.notify('Đã xóa', 'Bản ghi đã được loại bỏ.', 'info');
        });
    });

    // Crypto Dispatch
    btnToggleCrypto?.addEventListener('click', () => {
        if (!activeNoteId) return;
        const note = notes.find(n => n.id === activeNoteId);
        const pwd = inputPassword.value;

        if (!pwd) {
            return IslandKit.notify('Thiếu mật mã', 'Vui lòng nhập mật mã bảo vệ.', 'warning');
        }

        if (note.isEncrypted && !isCurrentlyUnlocked) {
            const decryptedObj = decryptPayload(note.content, pwd);
            if (!decryptedObj) {
                IslandKit.notify('Mật khẩu sai', 'Không thể giải mã dữ liệu bản ghi.', 'error');
            } else {
                isCurrentlyUnlocked = true;
                sessionPwd = pwd;
                inputTitle.value = decryptedObj.title;
                inputTitle.disabled = false;
                inputContent.innerHTML = decryptedObj.content;
                loadNoteData(note.id);
                idleTime = 0;
                IslandKit.notify('Mở khóa', 'Nội dung bản ghi đã sẵn sàng chỉnh sửa.', 'success');
            }
        } else if (!note.isEncrypted) {
            const titleText = inputTitle.value.trim() || 'Không tiêu đề';
            const contentHtml = inputContent.innerHTML;
            const encryptedPayload = encryptPayload(titleText, contentHtml, pwd);

            if (encryptedPayload) {
                note.content = encryptedPayload;
                note.title = '*** Bản ghi bảo mật ***';
                note.isEncrypted = true;
                isCurrentlyUnlocked = true;
                sessionPwd = pwd;
                saveToStorage();
                loadNoteData(note.id);
                IslandKit.notify('Đã bảo vệ', 'Bản ghi đã được mã hóa an toàn.', 'success');
            } else {
                IslandKit.notify('Lỗi mã hóa', 'Không thể mã hóa dữ liệu lúc này.', 'error');
            }
        }
    });

    const lockActiveNote = (isAuto = false) => {
        if (!activeNoteId || !isCurrentlyUnlocked || !sessionPwd) return;
        saveCurrentNote();
        isCurrentlyUnlocked = false;
        sessionPwd = null;
        loadNoteData(activeNoteId);
        if (isAuto) {
            IslandKit.notify('Auto-Lock', 'Đã tự động niêm phong bản ghi do không hoạt động.', 'warning');
        }
    };

    btnLockNow?.addEventListener('click', () => {
        lockActiveNote(false);
        IslandKit.notify('Đã khóa', 'Bản ghi đã được niêm phong an toàn.', 'info');
    });

    btnRemoveCrypto?.addEventListener('click', () => {
        UI.showConfirm('Gỡ mã hóa?', 'Chuyển văn bản này về dạng thô thông thường không cần mật mã?', () => {
            const note = notes.find(n => n.id === activeNoteId);
            if (!note) return;
            note.title = inputTitle.value.trim() || 'Bản ghi không tên';
            note.content = inputContent.innerHTML;
            note.isEncrypted = false;
            isCurrentlyUnlocked = false;
            sessionPwd = null;
            saveToStorage();
            loadNoteData(note.id);
            IslandKit.notify('Gỡ bảo vệ', 'Đã chuyển thành bản nháp thông thường.', 'info');
        });
    });

    // Idle & Security Hooks
    const resetIdle = () => { idleTime = 0; };
    const userEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    userEvents.forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));

    const idleTimer = setInterval(() => {
        if (autoLockEnabled && activeNoteId && isCurrentlyUnlocked) {
            idleTime++;
            if (idleTime >= 60) lockActiveNote(true);
        }
    }, 1000);

    const handleVisibility = () => {
        if (document.hidden && autoLockEnabled) {
            if (activeNoteId && isCurrentlyUnlocked) lockActiveNote(false);
            clearEditor();
        }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Folders & Actions
    btnAddFolder?.addEventListener('click', () => {
        const name = prompt('Tên thư mục mới:');
        if (!name || !name.trim()) return;
        folders.push({ id: 'folder_' + Date.now(), name: name.trim() });
        saveToStorage();
        renderFolders();
        IslandKit.notify('Thư mục', `Đã thêm thư mục "${name.trim()}".`, 'success');
    });

    hostElement.querySelectorAll('.editor-cmd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.execCommand(btn.dataset.cmd, false, null);
            inputContent.focus();
        });
    });

    searchInput?.addEventListener('input', (e) => renderNotesList(e.target.value));

    // Backup & Restore
    hostElement.querySelector('#btn-export-json')?.addEventListener('click', () => {
        const payload = JSON.stringify({ folders, notes }, null, 2);
        const anchor = document.createElement('a');
        anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(payload);
        anchor.download = `NotePRO_Vault_${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        IslandKit.notify('Sao lưu', 'Đã xuất dữ liệu JSON an toàn.', 'success');
    });

    const fileInput = hostElement.querySelector('#np-import-file');
    hostElement.querySelector('#btn-import-json')?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.folders && data.notes) {
                    data.folders.forEach(fd => {
                        if (!folders.some(f => f.id === fd.id)) folders.push(fd);
                    });
                    data.notes.forEach(nt => {
                        if (!notes.some(n => n.id === nt.id)) notes.push(nt);
                    });
                    saveToStorage();
                    clearEditor();
                    IslandKit.notify('Khôi phục', 'Đã nạp dữ liệu ghi chú thành công.', 'success');
                } else {
                    throw new Error();
                }
            } catch (err) {
                IslandKit.notify('Lỗi tệp', 'Tệp tin JSON không hợp lệ.', 'error');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    });

    // Initial Render
    renderFolders();
    renderNotesList();

    // Cleanup Hook
    return () => {
        clearInterval(idleTimer);
        document.removeEventListener('visibilitychange', handleVisibility);
        userEvents.forEach(evt => document.removeEventListener(evt, resetIdle));
    };
}