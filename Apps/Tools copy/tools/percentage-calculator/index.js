import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .perc-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 24px; }
            @media (min-width: 768px) { .perc-grid { grid-template-columns: 1fr 1fr; } }
            
            .perc-card { 
                padding: 24px; display: flex; flex-direction: column; 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: var(--radius); transition: all 0.2s;
            }
            .perc-card:hover { border-color: var(--text-mut); }
            
            .perc-title { font-weight: 600; color: var(--text-main); font-size: 1.05rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .perc-title i { color: #3b82f6; }
            
            .perc-input-group { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
            .perc-input-group span { font-weight: 500; color: var(--text-mut); white-space: nowrap; }
            .perc-input-group .input { flex: 1; min-width: 80px; font-size: 1.05rem; }
            
            .perc-result-box { 
                background: var(--bg-sec); padding: 16px; border-radius: var(--radius); 
                border: 1px dashed var(--border); text-align: center; margin-top: auto;
                display: flex; flex-direction: column; justify-content: center; min-height: 90px;
                position: relative;
            }
            .perc-val { font-size: 2rem; font-weight: 600; color: #3b82f6; word-break: break-all; line-height: 1.2; }
            .perc-val.error { color: #ef4444; font-size: 1.2rem; }
            .perc-val.success { color: #10b981; }
            
            .btn-copy-res {
                position: absolute; top: 8px; right: 8px;
                background: transparent; border: none; color: var(--text-mut);
                cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;
            }
            .btn-copy-res:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Máy Tính Phần Trăm</h1>
                <p class="text-mut">Tự động tính toán các bài toán phần trăm thông dụng nhất.</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-perc-clear" style="color: #ef4444;">
                <i class="fas fa-trash-alt"></i> Xóa tất cả
            </button>
        </div>

        <div class="perc-grid">
            
            <div class="card perc-card">
                <div class="perc-title"><i class="fas fa-percentage"></i> 1. Tính X% của Y</div>
                <div class="perc-input-group">
                    <input type="number" class="input c1-input" id="c1-x" placeholder="X" style="flex: 0.5;">
                    <span>% của</span>
                    <input type="number" class="input c1-input" id="c1-y" placeholder="Y">
                </div>
                <div class="perc-result-box">
                    <button class="btn-copy-res" data-target="c1-res" title="Sao chép"><i class="fas fa-copy"></i></button>
                    <div class="text-mut" style="font-size: 0.85rem; margin-bottom: 4px;">Kết quả là:</div>
                    <div class="perc-val" id="c1-res">0</div>
                </div>
            </div>

            <div class="card perc-card">
                <div class="perc-title"><i class="fas fa-balance-scale"></i> 2. X là bao nhiêu % của Y</div>
                <div class="perc-input-group">
                    <input type="number" class="input c2-input" id="c2-x" placeholder="X">
                    <span>là</span>
                    <div class="text-mut" style="font-weight: 500; min-width: 40px; text-align: center;" id="c2-preview">...%</div>
                    <span>của</span>
                    <input type="number" class="input c2-input" id="c2-y" placeholder="Y">
                </div>
                <div class="perc-result-box">
                    <button class="btn-copy-res" data-target="c2-res" title="Sao chép"><i class="fas fa-copy"></i></button>
                    <div class="text-mut" style="font-size: 0.85rem; margin-bottom: 4px;">Chiếm tỷ lệ:</div>
                    <div class="perc-val" id="c2-res">0%</div>
                </div>
            </div>

            <div class="card perc-card">
                <div class="perc-title"><i class="fas fa-search-dollar"></i> 3. X là Y% của số nào</div>
                <div class="perc-input-group">
                    <input type="number" class="input c3-input" id="c3-x" placeholder="X">
                    <span>là</span>
                    <input type="number" class="input c3-input" id="c3-y" placeholder="Y" style="flex: 0.5;">
                    <span>% của số:</span>
                </div>
                <div class="perc-result-box">
                    <button class="btn-copy-res" data-target="c3-res" title="Sao chép"><i class="fas fa-copy"></i></button>
                    <div class="text-mut" style="font-size: 0.85rem; margin-bottom: 4px;">Số gốc là:</div>
                    <div class="perc-val" id="c3-res">0</div>
                </div>
            </div>

            <div class="card perc-card">
                <div class="perc-title"><i class="fas fa-chart-line"></i> 4. Phần trăm Tăng / Giảm</div>
                <div class="perc-input-group">
                    <span>Từ</span>
                    <input type="number" class="input c4-input" id="c4-x" placeholder="Số cũ">
                    <span>thành</span>
                    <input type="number" class="input c4-input" id="c4-y" placeholder="Số mới">
                </div>
                <div class="perc-result-box">
                    <button class="btn-copy-res" data-target="c4-res" title="Sao chép"><i class="fas fa-copy"></i></button>
                    <div class="text-mut" style="font-size: 0.85rem; margin-bottom: 4px;">Tỷ lệ thay đổi:</div>
                    <div class="perc-val" id="c4-res">0%</div>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- UTILS ---
    const formatNumber = (val) => {
        if (!isFinite(val) || isNaN(val)) return 'Lỗi';
        // Xử lý float error (VD: 0.1 + 0.2 = 0.30000000000000004) bằng cách làm tròn 6 chữ số thập phân
        let rounded = Math.round(val * 1000000) / 1000000;
        let parts = String(rounded).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join('.');
    };

    const getVal = (id) => {
        const val = document.getElementById(id).value;
        return val === '' ? NaN : parseFloat(val);
    };

    const setRes = (id, html, isError = false, isSuccess = false) => {
        const el = document.getElementById(id);
        el.innerHTML = html;
        el.className = 'perc-val'; // Reset class
        if (isError) el.classList.add('error');
        if (isSuccess) el.classList.add('success');
    };

    // --- LOGIC TÍNH TOÁN ---

    // 1. X% của Y (Result = (X / 100) * Y)
    const calc1 = () => {
        const x = getVal('c1-x');
        const y = getVal('c1-y');
        if (isNaN(x) || isNaN(y)) return setRes('c1-res', '0');
        
        const result = (x / 100) * y;
        setRes('c1-res', formatNumber(result));
    };

    // 2. X là bao nhiêu % của Y (Result = (X / Y) * 100)
    const calc2 = () => {
        const x = getVal('c2-x');
        const y = getVal('c2-y');
        const preview = document.getElementById('c2-preview');
        
        if (isNaN(x) || isNaN(y)) {
            preview.textContent = '...%';
            return setRes('c2-res', '0%');
        }
        if (y === 0) {
            preview.textContent = 'Lỗi';
            return setRes('c2-res', 'Không thể chia cho 0', true);
        }

        const result = (x / y) * 100;
        const formatted = formatNumber(result) + '%';
        preview.textContent = formatted;
        setRes('c2-res', formatted);
    };

    // 3. X là Y% của số nào (Result = X / (Y / 100))
    const calc3 = () => {
        const x = getVal('c3-x');
        const y = getVal('c3-y');
        if (isNaN(x) || isNaN(y)) return setRes('c3-res', '0');
        if (y === 0) return setRes('c3-res', 'Không thể chia cho 0%', true);

        const result = (x * 100) / y;
        setRes('c3-res', formatNumber(result));
    };

    // 4. Tăng / Giảm phần trăm (Result = ((Y - X) / |X|) * 100)
    const calc4 = () => {
        const x = getVal('c4-x'); // Cũ
        const y = getVal('c4-y'); // Mới
        if (isNaN(x) || isNaN(y)) return setRes('c4-res', '0%');
        if (x === 0) return setRes('c4-res', 'Số gốc phải khác 0', true);

        const diff = y - x;
        const result = (diff / Math.abs(x)) * 100;
        const formatted = formatNumber(Math.abs(result)) + '%';

        if (diff > 0) {
            setRes('c4-res', `<i class="fas fa-arrow-up" style="font-size: 1.2rem; margin-right: 4px;"></i> Tăng ${formatted}`, false, true); // Success color
        } else if (diff < 0) {
            setRes('c4-res', `<i class="fas fa-arrow-down" style="font-size: 1.2rem; margin-right: 4px;"></i> Giảm ${formatted}`, true, false); // Error color
        } else {
            setRes('c4-res', `Không thay đổi (0%)`);
        }
    };

    // --- GẮN SỰ KIỆN LẮNG NGHE ---
    document.querySelectorAll('.c1-input').forEach(el => el.addEventListener('input', calc1));
    document.querySelectorAll('.c2-input').forEach(el => el.addEventListener('input', calc2));
    document.querySelectorAll('.c3-input').forEach(el => el.addEventListener('input', calc3));
    document.querySelectorAll('.c4-input').forEach(el => el.addEventListener('input', calc4));

    // Nút Copy
    document.querySelectorAll('.btn-copy-res').forEach(btn => {
        btn.onclick = async () => {
            const targetId = btn.dataset.target;
            const textToCopy = document.getElementById(targetId).textContent.trim();
            if (textToCopy === '0' || textToCopy === '0%' || textToCopy.includes('Lỗi') || textToCopy.includes('Không thể')) {
                return UI.showAlert('Lỗi', 'Không có dữ liệu hợp lệ để chép.', 'warning');
            }
            try {
                await navigator.clipboard.writeText(textToCopy);
                UI.showAlert('Đã chép', `Đã sao chép: ${textToCopy}`, 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ chép dữ liệu.', 'error');
            }
        };
    });

    // Nút Xóa tất cả
    document.getElementById('btn-perc-clear').onclick = () => {
        document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
        calc1(); calc2(); calc3(); calc4(); // Kích hoạt lại hàm để reset kết quả về 0
    };
}