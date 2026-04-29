import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Gmail Dot Trick</h2>
                    <p class="text-sm text-zinc-500 mt-1">Tạo hàng ngàn bí danh, đánh dấu sao và theo dõi các email đã sử dụng.</p>
                </div>
                <button id="btn-clear-data" class="h-10 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm" title="Xóa lịch sử">
                    <i class="fas fa-trash-alt"></i> <span class="hidden sm:inline">Xóa dữ liệu</span>
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col p-6 space-y-6">
                    
                    <div class="space-y-2">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Địa chỉ Gmail gốc</label>
                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all">
                            <i class="far fa-envelope text-zinc-400 text-lg mr-3"></i>
                            <input type="text" id="gdt-input" 
                                class="w-full bg-transparent border-none py-4 outline-none text-lg font-semibold text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700" 
                                placeholder="nhapemail" autocomplete="off" spellcheck="false">
                            <span class="text-zinc-500 font-medium text-base ml-2 shrink-0" id="gdt-domain">@gmail.com</span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div id="gdt-history-list" class="flex flex-wrap gap-2">
                            </div>
                    </div>
                    
                    <div class="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div class="text-sm font-medium text-zinc-500">
                            Sẽ tạo ra: <br>
                            <strong id="gdt-estimate" class="text-emerald-500 text-xl font-black">0</strong> biến thể.
                        </div>
                        <button id="btn-gdt-generate" class="px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i> TẠO NGAY
                        </button>
                    </div>

                </div>

                <div class="lg:col-span-7 premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col overflow-hidden h-[600px]">
                    
                    <div class="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-4 pb-0">
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-4" id="gdt-filters">
                            <button class="filter-btn active px-4 py-2 text-sm font-bold rounded-xl transition-all border bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shrink-0" data-filter="all">
                                Tất cả (<span id="count-all">0</span>)
                            </button>
                            <button class="filter-btn px-4 py-2 text-sm font-semibold rounded-xl transition-all border bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 shrink-0" data-filter="starred">
                                <i class="fas fa-star text-amber-500 mr-1"></i> Đã lưu (<span id="count-starred">0</span>)
                            </button>
                            <button class="filter-btn px-4 py-2 text-sm font-semibold rounded-xl transition-all border bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 shrink-0" data-filter="used">
                                <i class="fas fa-check text-emerald-500 mr-1"></i> Đã dùng (<span id="count-used">0</span>)
                            </button>
                        </div>
                        
                        <div class="flex justify-between items-center py-3 border-t border-zinc-200 dark:border-zinc-800">
                            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider" id="list-status-text">Hiển thị tất cả email</span>
                            <button id="btn-copy-all" class="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg active:scale-95">
                                <i class="fas fa-copy"></i> Copy trang này
                            </button>
                        </div>
                    </div>

                    <div id="gdt-list-container" class="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/30 relative">
                        <div class="absolute inset-0 flex items-center justify-center text-sm font-medium text-zinc-400 p-8 text-center" id="gdt-empty-state">
                            Nhập email và bấm "Tạo ngay" để bắt đầu...
                        </div>
                        <div id="gdt-table-body"></div>
                    </div>

                    <div class="bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center">
                        <button id="btn-page-prev" class="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all flex items-center gap-2" disabled>
                            <i class="fas fa-chevron-left text-xs"></i> Trước
                        </button>
                        <div class="text-sm font-medium text-zinc-500 flex items-center gap-2">
                            Trang 
                            <input type="number" id="page-input" class="w-14 h-8 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white font-bold outline-none focus:border-zinc-900 dark:focus:border-white transition-all disabled:opacity-50" value="0" min="1" disabled> 
                            / <span id="total-pages" class="font-bold">0</span>
                        </div>
                        <button id="btn-page-next" class="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all flex items-center gap-2" disabled>
                            Sau <i class="fas fa-chevron-right text-xs"></i>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    const input = document.getElementById('gdt-input');
    const domainSpan = document.getElementById('gdt-domain');
    const estCount = document.getElementById('gdt-estimate');
    const historyContainer = document.getElementById('gdt-history-list');
    
    const listContainer = document.getElementById('gdt-list-container');
    const tableBody = document.getElementById('gdt-table-body');
    const emptyState = document.getElementById('gdt-empty-state');
    
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');
    const pageInput = document.getElementById('page-input');
    const totalPagesEl = document.getElementById('total-pages');
    const listStatusText = document.getElementById('list-status-text');

    const countAll = document.getElementById('count-all');
    const countStarred = document.getElementById('count-starred');
    const countUsed = document.getElementById('count-used');

    let currentEmails = []; 
    let filteredEmails = []; 
    let currentPage = 1;
    const itemsPerPage = 50; 
    let currentFilter = 'all';

    // Khởi tạo Database
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
        countAll.textContent = currentEmails.length.toLocaleString('vi-VN');
        countStarred.textContent = starredSet.size.toLocaleString('vi-VN');
        countUsed.textContent = usedSet.size.toLocaleString('vi-VN');
    };

    // Render danh sách Mail gốc đã lưu
    const renderHistory = () => {
        if (historyRoots.length === 0) {
            historyContainer.innerHTML = ''; return;
        }
        let html = '<span class="text-[11px] font-bold text-zinc-400 uppercase mr-1 mt-1">Lịch sử:</span>';
        historyRoots.forEach(root => {
            html += `<button class="history-chip px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-700" data-root="${root}">${root}</button>`;
        });
        historyContainer.innerHTML = html;
    };
    renderHistory(); 

    // Tách bỏ các ký tự thừa
    const cleanUsername = (raw) => raw.toLowerCase().replace(/\s/g, '').replace(/\./g, '');

    // ==========================================
    // AUTO-STRIP: Xử lý Tách Domain ngay lúc nhập
    // ==========================================
    input.addEventListener('input', (e) => {
        let val = e.target.value;
        
        if (val.includes('@')) {
            const parts = val.split('@');
            input.value = parts[0].replace(/\s/g, ''); 
            domainSpan.textContent = parts[1] ? '@' + parts[1].replace(/\s/g, '') : '@gmail.com';
        }

        const username = cleanUsername(input.value);
        const len = username.length;
        if (len < 2) {
            estCount.textContent = '0'; estCount.className = 'text-zinc-400 text-xl font-black';
        } else {
            const combos = Math.pow(2, len - 1);
            if (len > 16) {
                estCount.textContent = combos.toLocaleString('vi-VN') + ' (Quá tải)';
                estCount.className = 'text-red-500 text-xl font-black';
            } else { 
                estCount.textContent = combos.toLocaleString('vi-VN');
                estCount.className = 'text-emerald-500 text-xl font-black'; 
            }
        }
    });

    historyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('history-chip')) {
            const root = e.target.getAttribute('data-root');
            const parts = root.split('@');
            input.value = parts[0];
            domainSpan.textContent = '@' + (parts[1] || 'gmail.com');
            input.dispatchEvent(new Event('input'));
        }
    });

    // ==========================================
    // LOGIC SINH EMAIL (GENERATOR)
    // ==========================================
    document.getElementById('btn-gdt-generate').onclick = () => {
        const username = cleanUsername(input.value);
        const domain = domainSpan.textContent;

        if (username.length < 2) return UI.showAlert('Lỗi', 'Username phải có ít nhất 2 ký tự.', 'warning');
        if (username.length > 16) return UI.showAlert('Giới hạn', 'Hệ thống giới hạn tối đa 16 ký tự để trình duyệt không bị treo.', 'error');

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
        UI.showAlert('Thành công', `Đã tạo ${numCombinations.toLocaleString('vi-VN')} bí danh.`, 'success');
    };

    // ==========================================
    // LOGIC LỌC VÀ RENDER DANH SÁCH (TABLE)
    // ==========================================
    const applyFilter = () => {
        if (currentFilter === 'all') {
            filteredEmails = currentEmails;
            listStatusText.textContent = "Hiển thị tất cả email";
        } else if (currentFilter === 'starred') {
            filteredEmails = Array.from(starredSet).reverse(); 
            listStatusText.textContent = "Các email đã đánh dấu sao";
        } else if (currentFilter === 'used') {
            filteredEmails = Array.from(usedSet).reverse();
            listStatusText.textContent = "Lịch sử email đã sử dụng";
        }
        
        currentPage = 1;
        updateCounters();
        renderTable();
    };

    const renderTable = () => {
        if (filteredEmails.length === 0) {
            emptyState.classList.remove('hidden');
            tableBody.innerHTML = '';
            btnPrev.disabled = true; btnNext.disabled = true; 
            pageInput.value = 0; pageInput.disabled = true; totalPagesEl.textContent = "0";
            return;
        }

        emptyState.classList.add('hidden');

        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filteredEmails.slice(startIndex, startIndex + itemsPerPage);

        let html = '';
        paginated.forEach((email, index) => {
            const isUsed = usedSet.has(email);
            const isStarred = starredSet.has(email);
            
            html += `
                <div class="flex justify-between items-center py-3.5 px-5 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors group">
                    <div class="font-mono text-[13px] md:text-sm truncate pr-4 ${isUsed ? 'text-emerald-500 font-bold' : 'text-zinc-700 dark:text-zinc-300'} transition-colors" title="${email}">
                        <span class="opacity-30 text-[10px] mr-3 font-sans w-6 inline-block text-right">#${startIndex + index + 1}</span>
                        ${email}
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button class="action-star w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${isStarred ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}" data-email="${email}" title="${isStarred ? 'Bỏ lưu' : 'Lưu lại'}">
                            <i class="fa-star ${isStarred ? 'fas' : 'far'}"></i>
                        </button>
                        <button class="action-copy px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${isUsed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'}" data-email="${email}" title="Copy và đánh dấu Đã dùng">
                            <i class="fas ${isUsed ? 'fa-check' : 'fa-copy'}"></i> ${isUsed ? 'Đã copy' : 'Copy'}
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

    // ==========================================
    // SỰ KIỆN: NHẬP SỐ TRANG THỦ CÔNG
    // ==========================================
    pageInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (isNaN(val) || val < 1) val = 1;
        if (val > totalPages) val = totalPages;
        currentPage = val;
        renderTable();
    });

    btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
    btnNext.onclick = () => { 
        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (currentPage < totalPages) { currentPage++; renderTable(); } 
    };

    // ==========================================
    // LỌC & COPY TỪ BẢNG
    // ==========================================
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-900', 'border-transparent');
                b.classList.add('bg-white', 'dark:bg-zinc-800', 'text-zinc-600', 'dark:text-zinc-400', 'border-zinc-200', 'dark:border-zinc-700');
            });
            
            const target = e.currentTarget;
            target.classList.remove('bg-white', 'dark:bg-zinc-800', 'text-zinc-600', 'dark:text-zinc-400', 'border-zinc-200', 'dark:border-zinc-700');
            target.classList.add('active', 'bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-900', 'border-transparent');
            
            currentFilter = target.getAttribute('data-filter');
            applyFilter();
        };
    });

    tableBody.addEventListener('click', async (e) => {
        const btnCopy = e.target.closest('.action-copy');
        const btnStar = e.target.closest('.action-star');

        if (btnCopy) {
            const email = btnCopy.getAttribute('data-email');
            try {
                await navigator.clipboard.writeText(email);
                usedSet.add(email); 
                saveDB();
                
                // Cập nhật giao diện nút copy nhanh (emerald color)
                btnCopy.className = 'action-copy px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
                btnCopy.innerHTML = `<i class="fas fa-check"></i> Đã copy`;
                
                // Thêm màu emerald cho text
                const textDiv = btnCopy.closest('.flex').querySelector('.font-mono');
                textDiv.classList.add('text-emerald-500', 'font-bold');
                textDiv.classList.remove('text-zinc-700', 'dark:text-zinc-300');
                
                UI.showAlert('Thành công', `Đã chép: ${email}`, 'success');
            } catch (err) { UI.showAlert('Lỗi', 'Không thể sao chép!', 'error'); }
        }

        if (btnStar) {
            const email = btnStar.getAttribute('data-email');
            if (starredSet.has(email)) {
                starredSet.delete(email); 
                btnStar.innerHTML = `<i class="far fa-star"></i>`;
                btnStar.classList.remove('text-amber-500');
                btnStar.classList.add('text-zinc-400', 'hover:text-amber-500');
            } else {
                starredSet.add(email); 
                btnStar.innerHTML = `<i class="fas fa-star"></i>`;
                btnStar.classList.remove('text-zinc-400', 'hover:text-amber-500');
                btnStar.classList.add('text-amber-500');
            }
            saveDB();
            if (currentFilter === 'starred') applyFilter(); 
        }
    });

    // ==========================================
    // NÚT XÓA DATA & COPY TRANG (Hiện tại)
    // ==========================================
    document.getElementById('btn-copy-all').onclick = async () => {
        // Chỉ copy những email đang được render trên trang hiện tại để tránh lag Clipboard
        const rows = tableBody.querySelectorAll('.action-copy');
        if (rows.length === 0) return UI.showAlert('Trống', 'Chưa có kết quả để copy.', 'warning');
        
        const emailsToCopy = Array.from(rows).map(btn => btn.getAttribute('data-email'));
        try {
            await navigator.clipboard.writeText(emailsToCopy.join('\n'));
            UI.showAlert('Đã chép', `Đã lưu ${emailsToCopy.length} email trên trang này.`, 'success');
            
            // Tự động đánh dấu đã dùng cho cả cục
            emailsToCopy.forEach(email => usedSet.add(email));
            saveDB();
            renderTable(); // Cập nhật lại UI xanh lá
        } catch (e) { UI.showAlert('Lỗi', 'Trình duyệt chặn copy.', 'error'); }
    };

    document.getElementById('btn-clear-data').onclick = () => {
        UI.showConfirm('Xóa dữ liệu?', 'Toàn bộ lịch sử (Mail gốc, Đã dùng, Đánh dấu) sẽ bị xóa.', () => {
            usedSet.clear(); starredSet.clear(); historyRoots = [];
            currentEmails = []; filteredEmails = [];
            input.value = '';
            input.dispatchEvent(new Event('input'));
            saveDB(); renderHistory(); applyFilter();
            UI.showAlert('Thành công', 'Đã làm sạch dữ liệu.', 'success');
        });
    };

    updateCounters(); applyFilter();
}