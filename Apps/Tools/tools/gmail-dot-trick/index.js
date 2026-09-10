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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="gdt-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #gdt-root-container {
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
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Mail Suite</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Gmail Dot Trick</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tạo hàng ngàn bí danh Gmail bằng quy tắc chấm dôi dư, đánh dấu sao và quản lý email đã dùng.</p>
                </div>

                <button id="btn-clear-data" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Xóa lịch sử">
                    <i class="far fa-trash-can text-xs"></i> <span class="hidden sm:inline">Dọn dẹp</span>
                </button>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: NHẬP LIỆU & TÙY CHỌN (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                    
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Địa chỉ Gmail gốc</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 focus-within:border-accent-theme transition-all">
                            <i class="far fa-envelope text-zinc-400 text-sm mr-2.5"></i>
                            <input type="text" id="gdt-input" 
                                class="w-full bg-transparent border-none py-3 outline-none text-sm font-bold font-mono text-zinc-900 dark:text-white placeholder-zinc-400" 
                                placeholder="tencuaban" autocomplete="off" spellcheck="false">
                            <span class="text-zinc-400 font-mono text-xs font-semibold shrink-0" id="gdt-domain">@gmail.com</span>
                        </div>
                    </div>

                    <!-- LỊCH SỬ ĐÃ TẠO GẦN ĐÂY -->
                    <div class="space-y-1.5">
                        <div id="gdt-history-list" class="flex flex-wrap gap-1.5"></div>
                    </div>
                    
                    <!-- SUMMARY & GENERATE BUTTON -->
                    <div class="pt-4 border-t border-black/[0.05] dark:border-white/[0.08] space-y-3">
                        <div class="flex items-center justify-between p-3.5 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                            <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Số lượng biến thể:</span>
                            <span id="gdt-estimate" class="text-lg font-black font-mono text-accent-theme">0</span>
                        </div>

                        <button id="btn-gdt-generate" class="w-full h-11 bg-accent-theme text-white rounded-[14px] font-bold text-xs active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-bolt text-xs"></i> Tạo danh sách bí danh
                        </button>
                    </div>

                </div>

                <!-- CỘT PHẢI: BẢNG DANH SÁCH & PHÂN TRANG (7 COLS) -->
                <div class="lg:col-span-7 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col overflow-hidden h-[580px]">
                    
                    <!-- HEADER BAR & SEGMENTED FILTER TABS -->
                    <div class="p-3.5 sm:p-4 border-b border-black/[0.05] dark:border-white/[0.08] space-y-3 bg-white dark:bg-[#161618]">
                        
                        <!-- FILTER TABS TƯƠNG PHẢN CAO -->
                        <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="gdt-filters">
                            <button class="filter-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate" data-filter="all">
                                Tất cả (<span id="count-all">0</span>)
                            </button>
                            <button class="filter-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-filter="starred">
                                <i class="fas fa-star text-amber-500 text-[10px] mr-1"></i> Đã lưu (<span id="count-starred">0</span>)
                            </button>
                            <button class="filter-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-filter="used">
                                <i class="fas fa-check text-accent-theme text-[10px] mr-1"></i> Đã dùng (<span id="count-used">0</span>)
                            </button>
                        </div>
                        
                        <div class="flex justify-between items-center px-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider" id="list-status-text">Tất cả email</span>
                            <button id="btn-copy-all" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme flex items-center gap-1.5 transition-colors bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-[8px] active:scale-95">
                                <i class="far fa-copy text-[11px]"></i> Chép trang này
                            </button>
                        </div>
                    </div>

                    <!-- LIST CONTENT -->
                    <div id="gdt-list-container" class="flex-1 overflow-y-auto no-scrollbar relative bg-[#f2f2f7]/30 dark:bg-black/20">
                        <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-400 p-8 text-center" id="gdt-empty-state">
                            Nhập tên hòm thư và nhấn "Tạo danh sách bí danh" để bắt đầu...
                        </div>
                        <div id="gdt-table-body" class="divide-y divide-black/[0.04] dark:divide-white/[0.06]"></div>
                    </div>

                    <!-- PAGINATION FOOTER -->
                    <div class="p-3 bg-white dark:bg-[#161618] border-t border-black/[0.05] dark:border-white/[0.08] flex justify-between items-center text-xs">
                        <button id="btn-page-prev" class="px-3 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-black/10 dark:hover:bg-white/15 transition-all flex items-center gap-1.5" disabled>
                            <i class="fas fa-chevron-left text-[10px]"></i> Trước
                        </button>
                        
                        <div class="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                            Trang 
                            <input type="number" id="page-input" class="w-10 h-7 text-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.05] dark:border-white/[0.08] rounded-[8px] text-zinc-900 dark:text-white font-bold outline-none disabled:opacity-40" value="0" min="1" disabled> 
                            / <span id="total-pages" class="font-bold">0</span>
                        </div>

                        <button id="btn-page-next" class="px-3 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-black/10 dark:hover:bg-white/15 transition-all flex items-center gap-1.5" disabled>
                            Sau <i class="fas fa-chevron-right text-[10px]"></i>
                        </button>
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
    const rootContainer = hostElement.querySelector('#gdt-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const input = _('#gdt-input');
    const domainSpan = _('#gdt-domain');
    const estCount = _('#gdt-estimate');
    const historyContainer = _('#gdt-history-list');
    
    const listContainer = _('#gdt-list-container');
    const tableBody = _('#gdt-table-body');
    const emptyState = _('#gdt-empty-state');
    
    const btnPrev = _('#btn-page-prev');
    const btnNext = _('#btn-page-next');
    const pageInput = _('#page-input');
    const totalPagesEl = _('#total-pages');
    const listStatusText = _('#list-status-text');

    const countAll = _('#count-all');
    const countStarred = _('#count-starred');
    const countUsed = _('#count-used');

    let currentEmails = []; 
    let filteredEmails = []; 
    let currentPage = 1;
    const itemsPerPage = 50; 
    let currentFilter = 'all';

    // Local Storage Data
    const STORAGE_KEY = 'aio_gdt_data';
    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"used":[], "starred":[], "roots":[]}');
    let usedSet = new Set(db.used || []);
    let starredSet = new Set(db.starred || []);
    let historyRoots = db.roots || [];

    const saveDB = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            used: Array.from(usedSet),
            starred: Array.from(starredSet),
            roots: historyRoots
        }));
        updateCounters();
    };

    const updateCounters = () => {
        if (countAll) countAll.textContent = currentEmails.length.toLocaleString('vi-VN');
        if (countStarred) countStarred.textContent = starredSet.size.toLocaleString('vi-VN');
        if (countUsed) countUsed.textContent = usedSet.size.toLocaleString('vi-VN');
    };

    // Render danh sách email gốc gần đây
    const renderHistory = () => {
        if (!historyContainer) return;
        if (historyRoots.length === 0) {
            historyContainer.innerHTML = ''; 
            return;
        }
        let html = '<span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1 mt-1 block w-full">Gần đây:</span>';
        historyRoots.forEach(root => {
            html += `<button class="history-chip px-2.5 py-1 bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 rounded-[8px] text-xs font-mono font-medium hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.04] dark:border-white/[0.06] transition-colors" data-root="${root}">${root}</button>`;
        });
        historyContainer.innerHTML = html;
    };
    renderHistory();

    const cleanUsername = (raw) => raw.toLowerCase().replace(/\s/g, '').replace(/\./g, '');

    // Nhận diện domain & ước tính số biến thể
    input?.addEventListener('input', (e) => {
        let val = e.target.value;
        
        if (val.includes('@')) {
            const parts = val.split('@');
            input.value = parts[0].replace(/\s/g, ''); 
            domainSpan.textContent = parts[1] ? '@' + parts[1].replace(/\s/g, '') : '@gmail.com';
        }

        const username = cleanUsername(input.value);
        const len = username.length;
        if (len < 2) {
            estCount.textContent = '0'; 
            estCount.className = 'text-lg font-black font-mono text-zinc-400';
        } else {
            const combos = Math.pow(2, len - 1);
            if (len > 16) {
                estCount.textContent = combos.toLocaleString('vi-VN') + ' (Quá tải)';
                estCount.className = 'text-lg font-black font-mono text-rose-500';
            } else { 
                estCount.textContent = combos.toLocaleString('vi-VN');
                estCount.className = 'text-lg font-black font-mono text-accent-theme'; 
            }
        }
    });

    historyContainer?.addEventListener('click', (e) => {
        const chip = e.target.closest('.history-chip');
        if (chip) {
            const root = chip.getAttribute('data-root');
            const parts = root.split('@');
            input.value = parts[0];
            domainSpan.textContent = '@' + (parts[1] || 'gmail.com');
            input.dispatchEvent(new Event('input'));
        }
    });

    // Sinh bí danh Dot Trick
    _('#btn-gdt-generate')?.addEventListener('click', () => {
        const username = cleanUsername(input.value);
        const domain = domainSpan.textContent;

        if (username.length < 2) {
            IslandKit.notify('Cảnh báo', 'Tên hòm thư cần có tối thiểu 2 ký tự.', 'warning');
            return;
        }
        if (username.length > 16) {
            IslandKit.notify('Quá tải', 'Hệ thống giới hạn tối đa 16 ký tự để tránh treo trình duyệt.', 'error');
            return;
        }

        const fullRoot = input.value.trim() + domain;
        if (!historyRoots.includes(fullRoot)) {
            historyRoots.unshift(fullRoot); 
            if (historyRoots.length > 5) historyRoots.pop(); 
            saveDB();
            renderHistory();
        }

        const len = username.length;
        const numCombinations = Math.pow(2, len - 1);
        currentEmails = []; 

        for (let i = 0; i < numCombinations; i++) {
            let currentAlias = username[0];
            for (let j = 0; j < len - 1; j++) {
                if ((i & (1 << j)) > 0) currentAlias += ".";
                currentAlias += username[j + 1];
            }
            currentEmails.push(currentAlias + domain);
        }

        currentPage = 1;
        applyFilter(); 
        IslandKit.notify('Thành công', `Đã tạo ${numCombinations.toLocaleString('vi-VN')} bí danh.`, 'success');
    });

    // Lọc dữ liệu
    const applyFilter = () => {
        if (currentFilter === 'all') {
            filteredEmails = currentEmails;
            listStatusText.textContent = "Tất cả bí danh";
        } else if (currentFilter === 'starred') {
            filteredEmails = Array.from(starredSet).reverse(); 
            listStatusText.textContent = "Bí danh đã lưu sao";
        } else if (currentFilter === 'used') {
            filteredEmails = Array.from(usedSet).reverse();
            listStatusText.textContent = "Lịch sử đã sao chép";
        }
        
        currentPage = 1;
        updateCounters();
        renderTable();
    };

    const renderTable = () => {
        if (filteredEmails.length === 0) {
            emptyState?.classList.remove('hidden');
            tableBody.innerHTML = '';
            btnPrev.disabled = true; 
            btnNext.disabled = true; 
            pageInput.value = 0; 
            pageInput.disabled = true; 
            totalPagesEl.textContent = "0";
            return;
        }

        emptyState?.classList.add('hidden');

        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filteredEmails.slice(startIndex, startIndex + itemsPerPage);

        let html = '';
        paginated.forEach((email, index) => {
            const isUsed = usedSet.has(email);
            const isStarred = starredSet.has(email);
            
            html += `
                <div class="flex justify-between items-center py-2.5 px-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                    <div class="font-mono text-xs truncate pr-3 ${isUsed ? 'text-accent-theme font-bold' : 'text-zinc-800 dark:text-zinc-200'}" title="${email}">
                        <span class="opacity-30 text-[10px] mr-2 w-5 inline-block text-right">#${startIndex + index + 1}</span>
                        ${email}
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button class="action-star w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isStarred ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}" data-email="${email}" title="${isStarred ? 'Bỏ lưu' : 'Lưu lại'}">
                            <i class="fa-star ${isStarred ? 'fas' : 'far'} text-xs"></i>
                        </button>
                        <button class="action-copy px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-colors flex items-center gap-1 active:scale-95 ${
                            isUsed 
                            ? 'bg-accent-theme-alpha text-accent-theme' 
                            : 'bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                        }" data-email="${email}">
                            <i class="fas ${isUsed ? 'fa-check' : 'fa-copy'} text-[10px]"></i> ${isUsed ? 'Đã chép' : 'Chép'}
                        </button>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = html;
        
        pageInput.disabled = false;
        pageInput.value = currentPage;
        pageInput.max = totalPages;
        totalPagesEl.textContent = totalPages;
        
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
        
        listContainer.scrollTop = 0; 
    };

    pageInput?.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (isNaN(val) || val < 1) val = 1;
        if (val > totalPages) val = totalPages;
        currentPage = val;
        renderTable();
    });

    btnPrev?.addEventListener('click', () => { 
        if (currentPage > 1) { 
            currentPage--; 
            renderTable(); 
        } 
    });

    btnNext?.addEventListener('click', () => { 
        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (currentPage < totalPages) { 
            currentPage++; 
            renderTable(); 
        } 
    });

    // Segmented Filter Tabs Switching
    const activeTabClass = 'filter-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate';
    const inactiveTabClass = 'filter-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate';

    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            $$('.filter-btn').forEach(b => b.className = inactiveTabClass);
            const target = e.currentTarget;
            target.className = activeTabClass;
            currentFilter = target.getAttribute('data-filter');
            applyFilter();
        });
    });

    // Click tương tác trong danh sách
    tableBody?.addEventListener('click', async (e) => {
        const btnCopy = e.target.closest('.action-copy');
        const btnStar = e.target.closest('.action-star');

        if (btnCopy) {
            const email = btnCopy.getAttribute('data-email');
            try {
                await navigator.clipboard.writeText(email);
                usedSet.add(email); 
                saveDB();
                
                btnCopy.className = 'action-copy px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-colors flex items-center gap-1 active:scale-95 bg-accent-theme-alpha text-accent-theme';
                btnCopy.innerHTML = `<i class="fas fa-check text-[10px]"></i> Đã chép`;
                
                const textDiv = btnCopy.closest('.flex').querySelector('.font-mono');
                textDiv?.classList.add('text-accent-theme', 'font-bold');
            } catch (err) { 
                IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error'); 
            }
        }

        if (btnStar) {
            const email = btnStar.getAttribute('data-email');
            if (starredSet.has(email)) {
                starredSet.delete(email); 
                btnStar.innerHTML = `<i class="far fa-star text-xs"></i>`;
                btnStar.classList.remove('text-amber-500');
                btnStar.classList.add('text-zinc-400');
            } else {
                starredSet.add(email); 
                btnStar.innerHTML = `<i class="fas fa-star text-xs"></i>`;
                btnStar.classList.remove('text-zinc-400');
                btnStar.classList.add('text-amber-500');
            }
            saveDB();
            if (currentFilter === 'starred') applyFilter(); 
        }
    });

    // Sao chép toàn bộ trang hiện tại
    _('#btn-copy-all')?.addEventListener('click', async () => {
        const rows = tableBody.querySelectorAll('.action-copy');
        if (rows.length === 0) return;
        
        const emailsToCopy = Array.from(rows).map(btn => btn.getAttribute('data-email'));
        try {
            await navigator.clipboard.writeText(emailsToCopy.join('\n'));
            emailsToCopy.forEach(email => usedSet.add(email));
            saveDB();
            renderTable();
            IslandKit.notify('Đã sao chép', `Đã lưu ${emailsToCopy.length} email trên trang này vào clipboard.`, 'success');
        } catch (e) { 
            IslandKit.notify('Lỗi sao chép', 'Trình duyệt chặn truy cập bộ nhớ tạm.', 'error'); 
        }
    });

    // Dọn dẹp dữ liệu
    _('#btn-clear-data')?.addEventListener('click', () => {
        UI.showConfirm(
            'Dọn dẹp dữ liệu?',
            'Toàn bộ lịch sử email đã dùng và đánh dấu sao sẽ bị xóa sạch.',
            () => {
                usedSet.clear(); 
                starredSet.clear(); 
                historyRoots = [];
                currentEmails = []; 
                filteredEmails = [];
                if (input) input.value = '';
                input?.dispatchEvent(new Event('input'));
                saveDB(); 
                renderHistory(); 
                applyFilter();
                IslandKit.notify('Đã làm sạch', 'Toàn bộ dữ liệu bí danh đã được đặt lại.', 'info');
            }
        );
    });

    updateCounters(); 
    applyFilter();
}