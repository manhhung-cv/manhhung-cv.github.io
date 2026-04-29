import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .lc-widget { max-width: 800px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Khu vực nhập liệu */
            .lc-input-card { background: var(--bg-main); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
            
            .lc-input-wrapper { position: relative; }
            .lc-input-suffix { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--text-mut); font-weight: 600; pointer-events: none; }
            .lc-input { padding-right: 50px; font-size: 1.2rem; font-weight: 600; font-family: 'Courier New', monospace; }

            /* Nút chọn Phương thức */
            .lc-radio-group { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
            .lc-radio-btn { 
                flex: 1; min-width: 200px; padding: 14px 16px; text-align: left; border: 1px solid var(--border); 
                border-radius: var(--radius); cursor: pointer; transition: all 0.2s; background: var(--bg-sec);
            }
            .lc-radio-btn:has(input:checked) { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
            .lc-radio-btn input { display: none; }
            .lc-radio-title { font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block; }
            .lc-radio-desc { font-size: 0.8rem; color: var(--text-mut); line-height: 1.4; display: block; }

            /* Khu vực Kết quả (Summary) */
            .lc-summary-card { 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                border-radius: 16px; padding: 24px; color: white; margin-bottom: 20px;
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            }
            .lc-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            @media (max-width: 576px) { .lc-summary-grid { grid-template-columns: 1fr; gap: 16px; } }
            
            .lc-sum-item { background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; }
            .lc-sum-label { font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .lc-sum-value { font-size: 1.7rem; font-weight: 700; font-family: 'Courier New', monospace; word-break: break-word; line-height: 1.2; }
            
            .lc-sum-main { grid-column: 1 / -1; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.2); }
            .lc-sum-main .lc-sum-value { font-size: 2.5rem; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }

            /* Bảng Lịch trả nợ */
            .lc-table-wrapper { 
                background: var(--bg-main); border: 1px solid var(--border); border-radius: 16px; 
                overflow: hidden; display: none; margin-top: 20px;
            }
            .lc-table-wrapper.show { display: block; animation: fadeIn 0.3s ease; }
            .lc-table-container { overflow-x: auto; max-height: 500px; }
            
            .lc-table { width: 100%; border-collapse: collapse; text-align: right; font-family: 'Courier New', monospace; font-size: 0.95rem; }
            .lc-table th { position: sticky; top: 0; background: var(--bg-sec); padding: 12px 16px; color: var(--text-main); font-family: var(--font); font-weight: 600; border-bottom: 2px solid var(--border); white-space: nowrap; z-index: 1; }
            .lc-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text-main); white-space: nowrap; }
            .lc-table tbody tr:hover { background: rgba(59, 130, 246, 0.05); }
            .lc-table th:first-child, .lc-table td:first-child { text-align: center; font-weight: 600; color: var(--text-mut); }
        </style>

        <div class="lc-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Tính Vay Trả Góp</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Ước tính lịch trả nợ chuẩn xác theo ngân hàng.</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-lc-reset" style="color: #ef4444;">
                    <i class="fas fa-undo"></i> Làm mới
                </button>
            </div>

            <div class="lc-input-card shadow-sm">
                <div class="form-group">
                    <label class="form-label">Số tiền cần vay</label>
                    <div class="lc-input-wrapper">
                        <input type="text" class="input lc-input" id="lc-amount" value="100,000,000" inputmode="numeric">
                        <span class="lc-input-suffix">VNĐ</span>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Thời hạn vay</label>
                        <div class="lc-input-wrapper">
                            <input type="number" class="input lc-input" id="lc-months" value="12" min="1" max="360">
                            <span class="lc-input-suffix">Tháng</span>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Lãi suất</label>
                        <div class="lc-input-wrapper">
                            <input type="number" class="input lc-input" id="lc-rate" value="10" min="0" step="0.1">
                            <span class="lc-input-suffix">%/Năm</span>
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 20px; margin-bottom: 0;">
                    <label class="form-label">Phương thức tính lãi</label>
                    <div class="lc-radio-group">
                        <label class="lc-radio-btn">
                            <input type="radio" name="lc-method" value="reducing" checked>
                            <span class="lc-radio-title"><i class="fas fa-chart-line" style="color:#3b82f6; margin-right:4px;"></i> Dư nợ giảm dần</span>
                            <span class="lc-radio-desc">Tiền lãi giảm dần theo số gốc còn lại. Trả nhiều ở tháng đầu và giảm dần về sau.</span>
                        </label>
                        <label class="lc-radio-btn">
                            <input type="radio" name="lc-method" value="emi">
                            <span class="lc-radio-title"><i class="fas fa-equals" style="color:#10b981; margin-right:4px;"></i> Trả góp đều (EMI)</span>
                            <span class="lc-radio-desc">Tổng số tiền trả mỗi tháng (Gốc + Lãi) được chia đều, bằng nhau trong suốt kỳ hạn.</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="lc-summary-card">
                <div class="lc-summary-grid">
                    <div class="lc-sum-item lc-sum-main">
                        <div class="lc-sum-label" id="lbl-first-month">Tiền trả tháng đầu tiên</div>
                        <div class="lc-sum-value" id="res-monthly">0 ₫</div>
                    </div>
                    <div class="lc-sum-item">
                        <div class="lc-sum-label">Tổng tiền lãi phải trả</div>
                        <div class="lc-sum-value" id="res-total-interest">0 ₫</div>
                    </div>
                    <div class="lc-sum-item">
                        <div class="lc-sum-label">Tổng tiền (Gốc + Lãi)</div>
                        <div class="lc-sum-value" id="res-total-payment">0 ₫</div>
                    </div>
                </div>
            </div>

            <button class="btn btn-outline" id="btn-toggle-table" style="width: 100%; justify-content: center; border-radius: 12px; padding: 14px;">
                <i class="fas fa-list-alt"></i> Xem Lịch Trả Nợ Chi Tiết
            </button>

            <div class="lc-table-wrapper" id="lc-table-wrapper">
                <div class="lc-table-container">
                    <table class="lc-table">
                        <thead>
                            <tr>
                                <th>Kỳ (Tháng)</th>
                                <th>Số gốc còn lại</th>
                                <th>Gốc phải trả</th>
                                <th>Lãi phải trả</th>
                                <th>Tổng trả tháng</th>
                            </tr>
                        </thead>
                        <tbody id="lc-table-body">
                            </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const inAmount = document.getElementById('lc-amount');
    const inMonths = document.getElementById('lc-months');
    const inRate = document.getElementById('lc-rate');
    const radiosMethod = document.querySelectorAll('input[name="lc-method"]');
    
    const resMonthly = document.getElementById('res-monthly');
    const resTotalInterest = document.getElementById('res-total-interest');
    const resTotalPayment = document.getElementById('res-total-payment');
    const lblFirstMonth = document.getElementById('lbl-first-month');
    
    const btnToggleTable = document.getElementById('btn-toggle-table');
    const tableWrapper = document.getElementById('lc-table-wrapper');
    const tableBody = document.getElementById('lc-table-body');
    const btnReset = document.getElementById('btn-lc-reset');

    // --- Utils ---
    const formatCurrency = (num) => Math.round(num).toLocaleString('en-US');
    const parseCurrency = (str) => parseFloat(str.replace(/,/g, '')) || 0;

    // Tự động thêm dấu phẩy khi gõ tiền
    inAmount.addEventListener('input', function(e) {
        // Lấy vị trí con trỏ hiện tại
        let cursorPosition = this.selectionStart;
        let oldLength = this.value.length;
        
        let val = this.value.replace(/[^0-9]/g, ''); // Chỉ giữ lại số
        if (val) {
            this.value = parseInt(val, 10).toLocaleString('en-US');
        } else {
            this.value = '';
        }

        // Khôi phục con trỏ mượt mà
        let newLength = this.value.length;
        cursorPosition += (newLength - oldLength);
        this.setSelectionRange(cursorPosition, cursorPosition);
        
        calculate();
    });

    // --- Core Logic ---
    const calculate = () => {
        const amount = parseCurrency(inAmount.value);
        const months = parseInt(inMonths.value) || 0;
        const ratePerYear = parseFloat(inRate.value) || 0;
        const method = document.querySelector('input[name="lc-method"]:checked').value;

        // Reset nếu input lỗi
        if (amount <= 0 || months <= 0) {
            resMonthly.textContent = '0 ₫';
            resTotalInterest.textContent = '0 ₫';
            resTotalPayment.textContent = '0 ₫';
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Vui lòng nhập đủ thông tin</td></tr>';
            return;
        }

        const ratePerMonth = ratePerYear / 12 / 100;
        let totalInterest = 0;
        let scheduleHtml = '';
        let firstMonthPayment = 0;

        if (method === 'reducing') {
            // DƯ NỢ GIẢM DẦN (Gốc chia đều, lãi tính trên số dư còn lại)
            lblFirstMonth.textContent = 'Tiền trả tháng đầu tiên (Giảm dần)';
            
            const principalPerMonth = amount / months;
            let remainingBalance = amount;

            for (let i = 1; i <= months; i++) {
                let interestForMonth = remainingBalance * ratePerMonth;
                let paymentForMonth = principalPerMonth + interestForMonth;
                
                if (i === 1) firstMonthPayment = paymentForMonth;
                totalInterest += interestForMonth;

                scheduleHtml += `
                    <tr>
                        <td>${i}</td>
                        <td>${formatCurrency(remainingBalance)}</td>
                        <td>${formatCurrency(principalPerMonth)}</td>
                        <td style="color:#ef4444;">${formatCurrency(interestForMonth)}</td>
                        <td style="color:#3b82f6; font-weight:700;">${formatCurrency(paymentForMonth)}</td>
                    </tr>
                `;
                remainingBalance -= principalPerMonth;
                // Xử lý sai số làm tròn cuối kỳ
                if (remainingBalance < 1) remainingBalance = 0;
            }

        } else if (method === 'emi') {
            // TRẢ GÓP ĐỀU (EMI Chuẩn - Gốc và lãi cộng lại chia đều)
            lblFirstMonth.textContent = 'Tiền trả mỗi tháng (Cố định)';
            
            let emi;
            if (ratePerMonth === 0) {
                emi = amount / months;
            } else {
                emi = amount * ratePerMonth * Math.pow(1 + ratePerMonth, months) / (Math.pow(1 + ratePerMonth, months) - 1);
            }
            
            firstMonthPayment = emi;
            let remainingBalance = amount;

            for (let i = 1; i <= months; i++) {
                let interestForMonth = remainingBalance * ratePerMonth;
                let principalForMonth = emi - interestForMonth;
                
                totalInterest += interestForMonth;

                scheduleHtml += `
                    <tr>
                        <td>${i}</td>
                        <td>${formatCurrency(remainingBalance)}</td>
                        <td>${formatCurrency(principalForMonth)}</td>
                        <td style="color:#ef4444;">${formatCurrency(interestForMonth)}</td>
                        <td style="color:#10b981; font-weight:700;">${formatCurrency(emi)}</td>
                    </tr>
                `;
                remainingBalance -= principalForMonth;
                if (remainingBalance < 1) remainingBalance = 0;
            }
        }

        // Cập nhật UI Tổng quan
        resMonthly.textContent = formatCurrency(firstMonthPayment) + ' ₫';
        resTotalInterest.textContent = formatCurrency(totalInterest) + ' ₫';
        resTotalPayment.textContent = formatCurrency(amount + totalInterest) + ' ₫';
        
        // Cập nhật Bảng
        tableBody.innerHTML = scheduleHtml;
    };

    // --- Sự kiện lắng nghe ---
    [inMonths, inRate].forEach(el => el.addEventListener('input', calculate));
    radiosMethod.forEach(el => el.addEventListener('change', calculate));

    // Toggle Bảng chi tiết
    let isTableVisible = false;
    btnToggleTable.addEventListener('click', () => {
        isTableVisible = !isTableVisible;
        if (isTableVisible) {
            tableWrapper.classList.add('show');
            btnToggleTable.innerHTML = '<i class="fas fa-chevron-up"></i> Ẩn Lịch Trả Nợ';
            // Scroll table into view smoothly
            setTimeout(() => tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        } else {
            tableWrapper.classList.remove('show');
            btnToggleTable.innerHTML = '<i class="fas fa-list-alt"></i> Xem Lịch Trả Nợ Chi Tiết';
        }
    });

    // Làm mới
    btnReset.addEventListener('click', () => {
        inAmount.value = '100,000,000';
        inMonths.value = '12';
        inRate.value = '10';
        radiosMethod[0].checked = true;
        if (isTableVisible) btnToggleTable.click(); // Đóng bảng nếu đang mở
        calculate();
        inAmount.focus();
    });

    // Chạy mặc định lần đầu
    calculate();
}