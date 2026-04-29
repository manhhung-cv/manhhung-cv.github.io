import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .fd-widget { max-width: 800px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Khu vực Cài đặt (Settings) */
            .fd-card { background: var(--bg-main); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
            .fd-card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .fd-card-title i { color: #3b82f6; }

            /* Nút gạt Toggle (Chọn trường dữ liệu) */
            .fd-options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
            .fd-toggle-row { 
                display: flex; justify-content: space-between; align-items: center; 
                padding: 12px 16px; background: var(--bg-sec); border: 1px solid var(--border); 
                border-radius: 12px; cursor: pointer; user-select: none; transition: border-color 0.2s;
            }
            .fd-toggle-row:hover { border-color: var(--text-mut); }
            .fd-toggle-label { font-weight: 500; color: var(--text-main); font-size: 0.95rem; }
            
            .fd-switch { position: relative; width: 44px; height: 24px; background: var(--border); border-radius: 12px; transition: 0.3s; }
            .fd-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
            input:checked + .fd-switch { background: #3b82f6; }
            input:checked + .fd-switch::after { transform: translateX(20px); }

            /* Khu vực Format Tabs */
            .fd-format-tabs { display: flex; background: var(--bg-sec); border-radius: 12px; padding: 4px; border: 1px solid var(--border); }
            .fd-format-btn { 
                flex: 1; text-align: center; padding: 10px; border-radius: 8px; 
                border: none; background: transparent; color: var(--text-mut); 
                font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Courier New', monospace; font-size: 1rem;
            }
            .fd-format-btn.active { background: var(--bg-main); color: #3b82f6; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }

            /* Khu vực Preview (Output) */
            .fd-preview-wrapper { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #1e1e1e; }
            .fd-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #2d2d2d; border-bottom: 1px solid #444; }
            .fd-preview-title { color: #aaa; font-size: 0.85rem; font-family: var(--font); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
            .fd-preview-actions { display: flex; gap: 8px; }
            
            .fd-preview-content { 
                padding: 16px; margin: 0; color: #d4d4d4; font-family: 'Courier New', Courier, monospace; 
                font-size: 0.9rem; line-height: 1.5; overflow-y: auto; max-height: 400px; white-space: pre-wrap; word-break: break-all;
            }
            .fd-preview-content::-webkit-scrollbar { width: 8px; height: 8px; }
            .fd-preview-content::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
            .fd-preview-content::-webkit-scrollbar-track { background: #1e1e1e; }

            .btn-dark { background: #444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: background 0.2s; display: flex; align-items: center; gap: 6px; font-weight: 500; }
            .btn-dark:hover { background: #555; }
            .btn-dark.primary { background: #3b82f6; }
            .btn-dark.primary:hover { background: #2563eb; }

            /* Nút Generate bự */
            .btn-gen-huge { width: 100%; padding: 16px; font-size: 1.2rem; font-weight: 700; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-bottom: 20px; }

        </style>

        <div class="fd-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Tạo Dữ Liệu Giả (Mock Data)</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Sinh dữ liệu ngẫu nhiên chuẩn Việt Nam cho testing.</p>
                </div>
            </div>

            <div class="fd-card shadow-sm">
                <div class="grid-2">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Số lượng dòng (Rows)</label>
                        <input type="number" class="input" id="fd-count" value="10" min="1" max="100000" style="font-size: 1.2rem; font-weight: 600;">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Định dạng xuất (Format)</label>
                        <div class="fd-format-tabs" id="fd-format-tabs">
                            <button class="fd-format-btn active" data-format="json">JSON</button>
                            <button class="fd-format-btn" data-format="csv">CSV</button>
                            <button class="fd-format-btn" data-format="sql">SQL</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fd-card shadow-sm">
                <div class="fd-card-title"><i class="fas fa-list-ul"></i> Chọn Trường Dữ Liệu (Fields)</div>
                <div class="fd-options-grid">
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">ID (UUID / Số)</span>
                        <input type="checkbox" id="chk-id" class="fd-chk" style="display:none;" checked>
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Họ và Tên (Full Name)</span>
                        <input type="checkbox" id="chk-name" class="fd-chk" style="display:none;" checked>
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Email</span>
                        <input type="checkbox" id="chk-email" class="fd-chk" style="display:none;" checked>
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Số điện thoại (VN)</span>
                        <input type="checkbox" id="chk-phone" class="fd-chk" style="display:none;" checked>
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Địa chỉ (Tỉnh/Thành)</span>
                        <input type="checkbox" id="chk-address" class="fd-chk" style="display:none;">
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Nghề nghiệp (Job)</span>
                        <input type="checkbox" id="chk-job" class="fd-chk" style="display:none;">
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Ngày sinh (DOB)</span>
                        <input type="checkbox" id="chk-dob" class="fd-chk" style="display:none;">
                        <div class="fd-switch"></div>
                    </label>
                    <label class="fd-toggle-row">
                        <span class="fd-toggle-label">Số tài khoản NH</span>
                        <input type="checkbox" id="chk-bank" class="fd-chk" style="display:none;">
                        <div class="fd-switch"></div>
                    </label>
                </div>
            </div>

            <button class="btn btn-primary btn-gen-huge" id="btn-fd-generate">
                <i class="fas fa-bolt"></i> TẠO DỮ LIỆU
            </button>

            <div class="fd-preview-wrapper shadow-sm">
                <div class="fd-preview-header">
                    <div class="fd-preview-title" id="fd-preview-title">Xem trước (Hiển thị tối đa 50 dòng)</div>
                    <div class="fd-preview-actions">
                        <button class="btn-dark" id="btn-fd-copy" title="Sao chép toàn bộ"><i class="fas fa-copy"></i> Copy</button>
                        <button class="btn-dark primary" id="btn-fd-download" title="Tải xuống File"><i class="fas fa-download"></i> Download</button>
                    </div>
                </div>
                <pre class="fd-preview-content" id="fd-output">// Nhấn TẠO DỮ LIỆU để bắt đầu...</pre>
            </div>

        </div>
    `;
}

export function init() {
    // --- DICTIONARIES (DỮ LIỆU THUẦN VIỆT) ---
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
    const middleNames = ['Văn', 'Thị', 'Ngọc', 'Hoàng', 'Minh', 'Xuân', 'Hữu', 'Đức', 'Hải', 'Thái', 'Gia', 'Thanh', 'Quang', 'Hồng', 'Bảo', 'Kim', 'Anh'];
    const firstNames = ['Anh', 'Tuấn', 'Dũng', 'Linh', 'Trang', 'Hoa', 'Lan', 'Phương', 'Thảo', 'Nam', 'Phong', 'Long', 'Huy', 'Khang', 'Bảo', 'Ngọc', 'Nhi', 'Hùng', 'Cường', 'Quân', 'Thành', 'Đạt', 'Vy', 'Mai', 'Yến', 'My'];
    
    const phonePrefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '099', '032', '033', '034', '035', '036', '037', '038', '039', '081', '082', '083', '084', '085', '086', '088', '089', '070', '079', '077', '076', '078'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.vn'];
    
    const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Đà Lạt', 'Hạ Long', 'Vinh', 'Quy Nhơn'];
    const streets = ['Lê Lợi', 'Trần Hưng Đạo', 'Nguyễn Huệ', 'Hai Bà Trưng', 'Lê Duẩn', 'Phạm Văn Đồng', 'Điện Biên Phủ', 'Quang Trung', 'Nguyễn Trãi', 'Lý Thường Kiệt'];
    
    const jobs = ['Lập trình viên', 'Kế toán', 'Nhân viên Kinh doanh', 'Giáo viên', 'Bác sĩ', 'Kỹ sư', 'Thiết kế Đồ họa', 'Marketing', 'Quản lý Dự án', 'Nhân sự', 'Chuyên viên IT', 'Kiến trúc sư'];

    // --- HELPER FUNCTIONS ---
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

    const generateRow = (idIndex, fields) => {
        let row = {};
        
        // Sinh tên trước để dùng chung cho Email
        let lastName = rnd(lastNames);
        let midName = rnd(middleNames);
        let firstName = rnd(firstNames);
        let fullName = `${lastName} ${midName} ${firstName}`;

        if (fields.id) row.id = idIndex;
        if (fields.name) row.name = fullName;
        if (fields.email) {
            let emailBase = removeAccents(firstName).toLowerCase() + '.' + removeAccents(lastName).toLowerCase();
            row.email = `${emailBase}${rndNum(10, 99)}@${rnd(domains)}`;
        }
        if (fields.phone) {
            row.phone = rnd(phonePrefixes) + rndNum(1000000, 9999999).toString();
        }
        if (fields.address) {
            row.address = `Số ${rndNum(1, 999)} ${rnd(streets)}, ${rnd(cities)}`;
        }
        if (fields.job) row.job = rnd(jobs);
        if (fields.dob) {
            // Random ngày sinh từ năm 1970 đến 2005
            let year = rndNum(1970, 2005);
            let month = format2(rndNum(1, 12));
            let day = format2(rndNum(1, 28));
            row.dob = `${year}-${month}-${day}`;
        }
        if (fields.bank) {
            row.bank_account = rndNum(1000000000, 9999999999).toString();
        }

        return row;
    };

    const format2 = (num) => num.toString().padStart(2, '0');

    // --- DOM ELEMENTS ---
    const inCount = document.getElementById('fd-count');
    const formatBtns = document.querySelectorAll('.fd-format-btn');
    const btnGenerate = document.getElementById('btn-fd-generate');
    const btnCopy = document.getElementById('btn-fd-copy');
    const btnDownload = document.getElementById('btn-fd-download');
    const outputBox = document.getElementById('fd-output');
    
    // Checkboxes
    const chkId = document.getElementById('chk-id');
    const chkName = document.getElementById('chk-name');
    const chkEmail = document.getElementById('chk-email');
    const chkPhone = document.getElementById('chk-phone');
    const chkAddress = document.getElementById('chk-address');
    const chkJob = document.getElementById('chk-job');
    const chkDob = document.getElementById('chk-dob');
    const chkBank = document.getElementById('chk-bank');

    let currentFormat = 'json';
    let fullDataString = ''; // Lưu toàn bộ data để copy/download, bất kể preview

    // --- CHUYỂN FORMAT TABS ---
    formatBtns.forEach(btn => {
        btn.onclick = () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormat = btn.dataset.format;
            if (fullDataString !== '') {
                // Nếu đã có dữ liệu, format lại ngay
                generateData(); 
            }
        };
    });

    // --- LOGIC TẠO & FORMAT DỮ LIỆU ---
    const generateData = () => {
        const count = parseInt(inCount.value);
        if (isNaN(count) || count < 1 || count > 100000) {
            return UI.showAlert('Lỗi', 'Số lượng dòng phải từ 1 đến 100,000.', 'error');
        }

        const fields = {
            id: chkId.checked, name: chkName.checked, email: chkEmail.checked,
            phone: chkPhone.checked, address: chkAddress.checked, job: chkJob.checked,
            dob: chkDob.checked, bank: chkBank.checked
        };

        // Kiểm tra xem có chọn trường nào không
        if (!Object.values(fields).some(v => v)) {
            return UI.showAlert('Lỗi', 'Vui lòng chọn ít nhất 1 trường dữ liệu.', 'warning');
        }

        btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
        btnGenerate.style.pointerEvents = 'none';

        // Dùng setTimeout để nhường luồng cho UI cập nhật nút Quay
        setTimeout(() => {
            let dataArr = [];
            for (let i = 1; i <= count; i++) {
                dataArr.push(generateRow(i, fields));
            }

            // --- FORMAT JSON ---
            if (currentFormat === 'json') {
                fullDataString = JSON.stringify(dataArr, null, 2);
            } 
            // --- FORMAT CSV ---
            else if (currentFormat === 'csv') {
                const keys = Object.keys(dataArr[0]);
                let csv = keys.join(',') + '\n';
                dataArr.forEach(row => {
                    // Cần bọc giá trị bằng ngoặc kép nếu có chứa dấu phẩy (như địa chỉ)
                    let values = keys.map(k => `"${String(row[k]).replace(/"/g, '""')}"`);
                    csv += values.join(',') + '\n';
                });
                fullDataString = csv;
            } 
            // --- FORMAT SQL ---
            else if (currentFormat === 'sql') {
                const tableName = 'mock_data';
                const keys = Object.keys(dataArr[0]);
                let sql = `CREATE TABLE ${tableName} (${keys.join(', ')});\n`;
                
                // Group các giá trị thành lô (batch insert) để tối ưu
                const batchSize = 100;
                for (let i = 0; i < dataArr.length; i += batchSize) {
                    let batch = dataArr.slice(i, i + batchSize);
                    let valuesStrings = batch.map(row => {
                        let vals = keys.map(k => {
                            if (typeof row[k] === 'number') return row[k];
                            // Escape single quotes in SQL
                            return `'${String(row[k]).replace(/'/g, "''")}'`;
                        });
                        return `(${vals.join(', ')})`;
                    });
                    sql += `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES\n${valuesStrings.join(',\n')};\n`;
                }
                fullDataString = sql;
            }

            // --- Xử lý Preview (Giới hạn hiển thị để tránh treo máy) ---
            const previewLines = fullDataString.split('\n');
            const MAX_PREVIEW_LINES = 150; // Giới hạn số dòng hiển thị
            
            if (previewLines.length > MAX_PREVIEW_LINES) {
                outputBox.textContent = previewLines.slice(0, MAX_PREVIEW_LINES).join('\n') + `\n\n... (Và ${count} dòng nữa. Nhấn Download hoặc Copy để lấy toàn bộ dữ liệu)`;
            } else {
                outputBox.textContent = fullDataString;
            }

            // Reset nút
            btnGenerate.innerHTML = '<i class="fas fa-bolt"></i> TẠO DỮ LIỆU';
            btnGenerate.style.pointerEvents = 'auto';

        }, 50); // Delay 50ms
    };

    // --- SỰ KIỆN CLICK NÚT ---
    btnGenerate.onclick = generateData;

    btnCopy.onclick = async () => {
        if (!fullDataString) return UI.showAlert('Thông báo', 'Vui lòng tạo dữ liệu trước.', 'warning');
        try {
            await navigator.clipboard.writeText(fullDataString);
            UI.showAlert('Đã chép', `Đã sao chép toàn bộ ${inCount.value} dòng dữ liệu.`, 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể sao chép. File có thể quá lớn.', 'error');
        }
    };

    btnDownload.onclick = () => {
        if (!fullDataString) return UI.showAlert('Thông báo', 'Vui lòng tạo dữ liệu trước.', 'warning');
        
        let ext = currentFormat; // json, csv, sql
        let mimeType = 'text/plain';
        if (ext === 'json') mimeType = 'application/json';
        if (ext === 'csv') mimeType = 'text/csv';

        const blob = new Blob([fullDataString], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mock_data_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        
        // Dọn dẹp
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    };

    // --- AUTO RUN ---
    // Khởi chạy sinh 10 dòng đầu tiên khi vào tool
    setTimeout(generateData, 100);
}