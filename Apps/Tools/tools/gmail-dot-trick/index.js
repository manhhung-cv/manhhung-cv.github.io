import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .gdt-layout { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
            
            .email-input-wrapper {
                display: flex; align-items: center; 
                background: var(--bg-main);
                border: 2px solid var(--border);
                border-radius: var(--radius);
                padding: 4px 16px;
                transition: border-color 0.2s;
            }
            .email-input-wrapper:focus-within { border-color: #3b82f6; }
            .email-input-wrapper input {
                border: none; background: transparent; flex: 1;
                font-size: 1.2rem; font-weight: 500; color: var(--text-main);
                padding: 12px 0; outline: none;
            }

            /* Bảng danh sách email */
            .email-row {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 16px; border-bottom: 1px solid var(--border);
                transition: background 0.2s;
            }
            .email-row:hover { background: var(--bg-main); }
            
            .email-row.is-used .email-text { color: #10b981; font-weight: 600; }
            
            .email-text {
                font-family: monospace; font-size: 1rem; color: var(--text-main);
                word-break: break-all; padding-right: 12px; transition: color 0.2s;
            }

            /* Nút lọc */
            .filter-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px; }
            .filter-btn {
                background: var(--bg-sec); border: 1px solid var(--border);
                color: var(--text-mut); padding: 6px 16px; border-radius: 20px;
                font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap;
            }
            .filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
            
            /* Lịch sử Mail gốc */
            .history-chip {
                padding: 4px 12px; font-size: 0.8rem; border: 1px solid var(--border); 
                border-radius: 12px; background: var(--bg-sec); color: var(--text-mut);
                cursor: pointer; transition: 0.2s;
            }
            .history-chip:hover { background: var(--bg-main); color: var(--text-main); border-color: #3b82f6; }

            /* Phân trang */
            .pagination { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-sec); }
            .page-input {
                width: 50px; text-align: center; border: 1px solid var(--border);
                background: var(--bg-main); color: var(--text-main);
                border-radius: 4px; padding: 2px 4px; font-size: 0.9rem;
                outline: none; -moz-appearance: textfield; font-weight: 600;
            }
            .page-input::-webkit-outer-spin-button,
            .page-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .page-input:focus { border-color: #3b82f6; }

            @media(min-width: 768px) {
                .gdt-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Gmail Dot Trick</h1>
                <p class="text-mut">Tạo hàng ngàn bí danh, đánh dấu sao và tự động đổi màu xanh các email đã sử dụng.</p>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-clear-data" style="color: #ef4444; border-color: #ef444420;">
                <i class="fas fa-trash-alt"></i> Xóa lịch sử
            </button>
        </div>

        <div class="gdt-layout">
            
            <div class="card" style="padding: 20px;">
                <label class="text-mut" style="font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; display: block;">Địa chỉ Gmail gốc</label>
                <div class="email-input-wrapper">
                    <i class="fas fa-envelope text-mut" style="margin-right: 12px; font-size: 1.2rem;"></i>
                    <input type="text" id="gdt-input" placeholder="nhapemail" autocomplete="off" spellcheck="false">
                    <span class="text-mut" style="font-size: 1.1rem; margin-left: 8px; font-weight: 500;" id="gdt-domain">@gmail.com</span>
                </div>
                
                <div id="gdt-history-list" class="flex-row" style="gap: 8px; flex-wrap: wrap; margin-top: 12px;"></div>
                
                <div class="flex-between" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                    <div style="font-size: 0.9rem; color: var(--text-mut);">
                        Sẽ tạo ra: <strong id="gdt-estimate" style="color: #10b981; font-size: 1.1rem;">0</strong> biến thể.
                    </div>
                    <button class="btn btn-primary" id="btn-gdt-generate"><i class="fas fa-magic"></i> Tạo ngay</button>
                </div>
            </div>

            <div class="card" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; border-color: #10b98140;">
                
                <div style="padding: 16px 16px 0 16px; background: var(--bg-main); border-bottom: 1px solid var(--border);">
                    <div class="filter-tabs" id="gdt-filters">
                        <button class="filter-btn active" data-filter="all">Tất cả (<span id="count-all">0</span>)</button>
                        <button class="filter-btn" data-filter="starred"><i class="fas fa-star" style="color: #eab308;"></i> Đã lưu (<span id="count-starred">0</span>)</button>
                        <button class="filter-btn" data-filter="used"><i class="fas fa-check" style="color: #10b981;"></i> Đã dùng (<span id="count-used">0</span>)</button>
                    </div>
                    
                    <div class="flex-between" style="padding-bottom: 12px;">
                        <span class="text-mut" style="font-size: 0.85rem; font-weight: 500;" id="list-status-text">Hiển thị tất cả email</span>
                        <button class="btn btn-ghost btn-sm" id="btn-copy-all" title="Sao chép toàn bộ danh sách đang hiển thị">
                            <i class="fas fa-copy"></i> Sao chép toàn bộ
                        </button>
                    </div>
                </div>

                <div id="gdt-list-container" style="min-height: 300px; max-height: 500px; overflow-y: auto; background: var(--bg-sec);">
                    <div style="padding: 40px 20px; text-align: center; color: var(--text-mut);">Nhập email và bấm "Tạo ngay" để bắt đầu...</div>
                </div>

                <div class="pagination">
                    <button class="btn btn-outline btn-sm" id="btn-page-prev" disabled><i class="fas fa-chevron-left"></i> Trước</button>
                    <div class="text-mut" style="font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                        Trang <input type="number" id="page-input" class="page-input" value="0" min="1" disabled title="Nhập số trang và nhấn Enter"> / <span id="total-pages">0</span>
                    </div>
                    <button class="btn btn-outline btn-sm" id="btn-page-next" disabled>Sau <i class="fas fa-chevron-right"></i></button>
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
        let html = '<span class="text-mut" style="font-size: 0.8rem; margin-right: 4px;">Tái sử dụng:</span>';
        historyRoots.forEach(root => {
            html += `<button class="history-chip" data-root="${root}">${root}</button>`;
        });
        historyContainer.innerHTML = html;
    };
    renderHistory(); // Chạy lần đầu

    // Tách bỏ các ký tự thừa
    const cleanUsername = (raw) => {
        return raw.toLowerCase().replace(/\s/g, '').replace(/\./g, '');
    };

    // ==========================================
    // AUTO-STRIP: Xử lý Tách Domain ngay lúc nhập
    // ==========================================
    input.addEventListener('input', (e) => {
        let val = e.target.value;
        
        // Cắt Domain thông minh nếu có chữ @
        if (val.includes('@')) {
            const parts = val.split('@');
            input.value = parts[0].replace(/\s/g, ''); // Cập nhật lại vào ô input chỉ còn username
            domainSpan.textContent = parts[1] ? '@' + parts[1].replace(/\s/g, '') : '@gmail.com';
        }

        // Tính toán số lượng ước tính
        const username = cleanUsername(input.value);
        const len = username.length;
        if (len < 2) {
            estCount.textContent = '0'; estCount.style.color = 'var(--text-mut)';
        } else {
            const combos = Math.pow(2, len - 1);
            estCount.textContent = combos.toLocaleString('vi-VN');
            if (len > 16) {
                estCount.textContent = combos.toLocaleString('vi-VN') + ' (Quá tải)';
                estCount.style.color = '#ef4444';
            } else { estCount.style.color = '#10b981'; }
        }
    });

    // ==========================================
    // SỰ KIỆN: CHỌN LỊCH SỬ ĐỂ ĐIỀN NHANH
    // ==========================================
    historyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('history-chip')) {
            const root = e.target.getAttribute('data-root');
            const parts = root.split('@');
            input.value = parts[0];
            domainSpan.textContent = '@' + (parts[1] || 'gmail.com');
            // Kích hoạt sự kiện input để tính toán lại số lượng
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

        // LƯU LỊCH SỬ MAIL GỐC
        const fullRoot = input.value.trim() + domain;
        if (!historyRoots.includes(fullRoot)) {
            historyRoots.unshift(fullRoot); // Đẩy lên đầu
            if (historyRoots.length > 5) historyRoots.pop(); // Giữ tối đa 5 cái gần nhất
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
        
        if (window.innerWidth <= 768) {
            setTimeout(() => { document.getElementById('gdt-list-container').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }
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
            listContainer.innerHTML = `<div style="padding: 40px 20px; text-align: center; color: var(--text-mut);">Không có dữ liệu phù hợp.</div>`;
            btnPrev.disabled = true; btnNext.disabled = true; 
            pageInput.value = 0; pageInput.disabled = true; totalPagesEl.textContent = "0";
            return;
        }

        const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filteredEmails.slice(startIndex, startIndex + itemsPerPage);

        let html = '';
        paginated.forEach((email, index) => {
            const isUsed = usedSet.has(email);
            const isStarred = starredSet.has(email);
            
            html += `
                <div class="email-row ${isUsed ? 'is-used' : ''}">
                    <div class="email-text" title="${email}">
                        <span style="opacity: 0.4; font-size: 0.8rem; margin-right: 8px; font-weight: normal;">#${startIndex + index + 1}</span>
                        ${email}
                    </div>
                    <div class="flex-row" style="gap: 6px;">
                        <button class="btn btn-ghost btn-sm action-star" data-email="${email}" title="${isStarred ? 'Bỏ lưu' : 'Lưu lại'}">
                            <i class="fa-star ${isStarred ? 'fas' : 'far'}" style="color: ${isStarred ? '#eab308' : 'var(--text-mut)'}; font-size: 1.1rem;"></i>
                        </button>
                        <button class="btn btn-outline btn-sm action-copy" data-email="${email}" title="Copy và đánh dấu Đã dùng" style="${isUsed ? 'border-color: #10b981; color: #10b981;' : ''}">
                            <i class="fas ${isUsed ? 'fa-check' : 'fa-copy'}"></i> ${isUsed ? 'Đã sao chép' : 'Copy'}
                        </button>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
        
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

    // ==========================================
    // SỰ KIỆN: NEXT / PREV PAGE
    // ==========================================
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
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            applyFilter();
        };
    });

    listContainer.addEventListener('click', async (e) => {
        const btnCopy = e.target.closest('.action-copy');
        const btnStar = e.target.closest('.action-star');

        if (btnCopy) {
            const email = btnCopy.getAttribute('data-email');
            try {
                await navigator.clipboard.writeText(email);
                usedSet.add(email); 
                saveDB();
                
                btnCopy.innerHTML = `<i class="fas fa-check"></i> Đã sao chép`;
                btnCopy.style.borderColor = '#10b981'; btnCopy.style.color = '#10b981';
                btnCopy.closest('.email-row').classList.add('is-used');
                
                UI.showAlert('Thành công', `Đã chép: ${email}`, 'success');
            } catch (err) { UI.showAlert('Lỗi', 'Không thể sao chép!', 'error'); }
        }

        if (btnStar) {
            const email = btnStar.getAttribute('data-email');
            if (starredSet.has(email)) {
                starredSet.delete(email); 
                btnStar.innerHTML = `<i class="far fa-star" style="color: var(--text-mut); font-size: 1.1rem;"></i>`;
            } else {
                starredSet.add(email); 
                btnStar.innerHTML = `<i class="fas fa-star" style="color: #eab308; font-size: 1.1rem;"></i>`;
            }
            saveDB();
            if (currentFilter === 'starred') applyFilter(); 
        }
    });

    // ==========================================
    // NÚT XÓA DATA & COPY TẤT CẢ
    // ==========================================
    document.getElementById('btn-copy-all').onclick = async () => {
        if (filteredEmails.length === 0) return UI.showAlert('Trống', 'Chưa có kết quả.', 'warning');
        try {
            await navigator.clipboard.writeText(filteredEmails.join('\n'));
            UI.showAlert('Đã chép', `Đã lưu ${filteredEmails.length} email.`, 'success');
        } catch (e) { UI.showAlert('Lỗi', 'Trình duyệt chặn copy số lượng lớn.', 'error'); }
    };

    document.getElementById('btn-clear-data').onclick = () => {
        UI.showConfirm('Xóa dữ liệu?', 'Toàn bộ lịch sử (Mail gốc, Đã dùng, Đánh dấu) sẽ bị xóa.', () => {
            usedSet.clear(); starredSet.clear(); historyRoots = [];
            saveDB(); renderHistory(); applyFilter();
            UI.showAlert('Thành công', 'Đã làm sạch dữ liệu.', 'success');
        });
    };

    updateCounters(); applyFilter();
}