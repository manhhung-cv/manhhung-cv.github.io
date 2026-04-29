import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Tạo Dữ liệu Mẫu (Fake Data)</h2>
                    <p class="text-sm text-zinc-500 mt-1">Sinh dữ liệu ngẫu nhiên để Test, thiết kế API hoặc Database.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col overflow-hidden">
                    
                    <div class="p-6 space-y-6">
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Định dạng xuất</label>
                                <div class="relative">
                                    <select id="fd-format" class="appearance-none w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer">
                                        <option value="json">JSON</option>
                                        <option value="csv">CSV</option>
                                        <option value="sql">SQL (Insert)</option>
                                    </select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500"><i class="fas fa-chevron-down text-xs"></i></div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Ngôn ngữ</label>
                                <div class="relative">
                                    <select id="fd-locale" class="appearance-none w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer">
                                        <option value="vi">🇻🇳 Việt Nam</option>
                                        <option value="en">🇺🇸 English</option>
                                    </select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500"><i class="fas fa-chevron-down text-xs"></i></div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Số lượng bản ghi (Rows)</label>
                            <div class="flex gap-2">
                                <button class="fd-row-btn active flex-1 py-2 text-xs font-bold rounded-xl border-2 border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all" data-val="10">10</button>
                                <button class="fd-row-btn flex-1 py-2 text-xs font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all" data-val="50">50</button>
                                <button class="fd-row-btn flex-1 py-2 text-xs font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all" data-val="100">100</button>
                                <div class="relative flex-1">
                                    <input type="number" id="fd-custom-rows" class="w-full h-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-2 outline-none focus:border-zinc-900 dark:focus:border-white transition-all text-xs font-bold text-center text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Tùy...">
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Các trường dữ liệu (Fields)</label>
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="fd-fields-container">
                                </div>
                        </div>

                        <button id="btn-fd-generate" class="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-sm flex items-center justify-center gap-2 mt-4">
                            <i class="fas fa-bolt"></i> TẠO DỮ LIỆU MỚI
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-7 space-y-4">
                    
                    <div class="premium-card bg-[#0d1117] dark:bg-zinc-950 rounded-[32px] shadow-xl overflow-hidden flex flex-col h-[550px] border border-zinc-800/50">
                        
                        <div class="flex justify-between items-center px-4 py-3 bg-[#161b22] dark:bg-zinc-900 border-b border-white/10">
                            <div class="flex items-center gap-3">
                                <div class="flex gap-1.5">
                                    <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <span id="fd-preview-title" class="text-xs font-mono text-zinc-400">data.json</span>
                            </div>
                            
                            <div class="flex gap-2">
                                <button id="btn-fd-copy" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="far fa-copy"></i> Copy
                                </button>
                                <button id="btn-fd-download" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="fas fa-download"></i> Tải file
                                </button>
                            </div>
                        </div>

                        <div class="flex-1 overflow-auto p-4 custom-scrollbar relative">
                            <pre><code id="fd-preview-code" class="text-[13px] font-mono leading-relaxed text-[#c9d1d9] break-all"></code></pre>
                        </div>
                        
                        <div class="bg-[#161b22] dark:bg-zinc-900 px-4 py-1.5 text-[10px] font-mono text-zinc-500 flex justify-between border-t border-white/5">
                            <span id="fd-status-count">10 rows</span>
                            <span id="fd-status-size">UTF-8</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- STATE ---
    let state = {
        format: 'json', 
        locale: 'vi', 
        rows: 10,
        fields: {
            id: true, fullName: true, email: true, phone: true, address: true,
            company: false, jobTitle: false, creditCard: false
        }
    };

    let generatedDataStr = "";

    // --- DOM Elements ---
    const elFormat = document.getElementById('fd-format');
    const elLocale = document.getElementById('fd-locale');
    const rowBtns = document.querySelectorAll('.fd-row-btn');
    const customRowInput = document.getElementById('fd-custom-rows');
    const fieldsContainer = document.getElementById('fd-fields-container');
    const btnGenerate = document.getElementById('btn-fd-generate');
    
    const previewTitle = document.getElementById('fd-preview-title');
    const previewCode = document.getElementById('fd-preview-code');
    const statusCount = document.getElementById('fd-status-count');
    const btnCopy = document.getElementById('btn-fd-copy');
    const btnDownload = document.getElementById('btn-fd-download');

    // --- MINI FAKER ENGINE ---
    const DB = {
        vi: {
            firstNames: ['Hùng', 'Dũng', 'Linh', 'Trang', 'Hải', 'Lan', 'Nam', 'Minh', 'Khoa', 'Mai', 'Thảo', 'Hoàng', 'Huy', 'Tùng', 'Cường', 'Quỳnh', 'Nga'],
            lastNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'],
            middleNames: ['Văn', 'Thị', 'Đức', 'Hữu', 'Ngọc', 'Thanh', 'Mạnh', 'Xuân', 'Thu', 'Minh', 'Đình'],
            cities: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương', 'Vũng Tàu', 'Nha Trang', 'Huế'],
            streets: ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Phan Đình Phùng', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Cách Mạng Tháng Tám', 'Quang Trung', 'Điện Biên Phủ'],
            jobTitles: ['Lập trình viên', 'Chuyên viên Marketing', 'Quản lý dự án', 'Nhân viên kinh doanh', 'Kế toán viên', 'Kỹ sư hệ thống', 'Giám đốc nhân sự', 'Trưởng phòng IT'],
            companies: ['Công ty CP Công Nghệ', 'Tập đoàn', 'Công ty TNHH', 'Tổng công ty']
        },
        en: {
            firstNames: ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Isabella', 'James', 'Olivia', 'Robert', 'Ava', 'David', 'Mia', 'Joseph', 'Charlotte', 'Thomas', 'Amelia'],
            lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'],
            cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'],
            streets: ['Main St', 'Oak St', 'Pine St', 'Maple Ave', 'Cedar Ln', 'Elm St', 'Washington Blvd', 'Lake St', 'Hill Rd', 'Park Ave'],
            jobTitles: ['Software Engineer', 'Marketing Specialist', 'Project Manager', 'Sales Representative', 'Accountant', 'Systems Engineer', 'HR Director', 'IT Manager'],
            companies: ['Inc.', 'LLC', 'Group', 'Corporation', 'Enterprises']
        },
        domains: ['gmail.com', 'yahoo.com', 'hunq.online', 'outlook.com', 'example.com']
    };

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const generateUUID = () => {
        if (crypto && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const generateFakeRecord = () => {
        const d = DB[state.locale];
        const record = {};
        
        const fName = getRandom(d.firstNames);
        const lName = getRandom(d.lastNames);
        let fullName = state.locale === 'vi' ? `${lName} ${getRandom(d.middleNames)} ${fName}` : `${fName} ${lName}`;
        const emailSafeName = fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.') + getRandNum(1, 999);

        if (state.fields.id) record.id = generateUUID();
        if (state.fields.fullName) record.fullName = fullName;
        if (state.fields.email) record.email = `${emailSafeName}@${getRandom(DB.domains)}`;
        if (state.fields.phone) record.phone = state.locale === 'vi' ? `0${getRandNum(8,9)}${getRandNum(10000000, 99999999)}` : `+1-${getRandNum(200,999)}-${getRandNum(200,999)}-${getRandNum(1000,9999)}`;
        if (state.fields.address) record.address = `${getRandNum(1, 999)} ${getRandom(d.streets)}, ${getRandom(d.cities)}`;
        if (state.fields.company) record.company = state.locale === 'vi' ? `${getRandom(d.companies)} ${fName} ${lName}` : `${lName} ${getRandom(d.companies)}`;
        if (state.fields.jobTitle) record.jobTitle = getRandom(d.jobTitles);
        if (state.fields.creditCard) record.creditCard = `${getRandNum(4000,4999)}-${getRandNum(1000,9999)}-${getRandNum(1000,9999)}-${getRandNum(1000,9999)}`;

        return record;
    };

    const generateDataStr = (records) => {
        if (records.length === 0) return "";
        const keys = Object.keys(records[0]);

        if (state.format === 'json') {
            return JSON.stringify(records, null, 2);
        } else if (state.format === 'csv') {
            const header = keys.join(',');
            const rows = records.map(r => keys.map(k => {
                let val = r[k] ? r[k].toString() : '';
                if (val.includes(',') || val.includes('"')) val = `"${val.replace(/"/g, '""')}"`;
                return val;
            }).join(','));
            return [header, ...rows].join('\n');
        } else if (state.format === 'sql') {
            const table = 'users';
            const cols = keys.join(', ');
            let sql = `INSERT INTO ${table} (${cols}) VALUES\n`;
            const rows = records.map((r, i) => {
                const vals = keys.map(k => {
                    let val = r[k];
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    if (val === null || val === undefined) return 'NULL';
                    return val;
                }).join(', ');
                return `(${vals})${i === records.length - 1 ? ';' : ','}`;
            });
            return sql + rows.join('\n');
        }
    };

    // --- RENDER GIAO DIỆN CỘT TRÁI (STYLE TRẮNG/ĐEN) ---
    const FIELD_DEFS = [
        { id: 'id', label: 'ID (UUID)', icon: 'fas fa-fingerprint' },
        { id: 'fullName', label: 'Họ & Tên', icon: 'fas fa-user' },
        { id: 'email', label: 'Email', icon: 'fas fa-envelope' },
        { id: 'phone', label: 'Số điện thoại', icon: 'fas fa-phone' },
        { id: 'address', label: 'Địa chỉ', icon: 'fas fa-map-marker-alt' },
        { id: 'company', label: 'Công ty', icon: 'fas fa-building' },
        { id: 'jobTitle', label: 'Chức vụ', icon: 'fas fa-briefcase' },
        { id: 'creditCard', label: 'Credit Card', icon: 'fas fa-credit-card' }
    ];

    const renderFields = () => {
        fieldsContainer.innerHTML = FIELD_DEFS.map(f => `
            <label class="flex items-center justify-between p-2.5 rounded-xl border ${state.fields[f.id] ? 'border-zinc-900 dark:border-white bg-zinc-100/50 dark:bg-zinc-800/50' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50'} cursor-pointer transition-colors group">
                <div class="flex items-center gap-2.5">
                    <i class="${f.icon} ${state.fields[f.id] ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'} transition-colors w-4 text-center text-xs"></i>
                    <span class="text-xs font-semibold ${state.fields[f.id] ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}">${f.label}</span>
                </div>
                <div class="relative flex items-center">
                    <input type="checkbox" class="sr-only fd-field-cb" data-field="${f.id}" ${state.fields[f.id] ? 'checked' : ''}>
                    <div class="w-7 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full transition-colors relative ${state.fields[f.id] ? '!bg-zinc-900 dark:!bg-white' : ''}">
                        <div class="w-3 h-3 ${state.fields[f.id] ? 'bg-white dark:bg-zinc-900' : 'bg-white'} rounded-full absolute top-[2px] left-[2px] transition-transform ${state.fields[f.id] ? 'translate-x-3' : ''} shadow-sm"></div>
                    </div>
                </div>
            </label>
        `).join('');

        document.querySelectorAll('.fd-field-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                state.fields[e.target.dataset.field] = e.target.checked;
                renderFields(); 
                runGenerate();
            });
        });
    };

    const runGenerate = () => {
        const hasField = Object.values(state.fields).some(v => v);
        if (!hasField) {
            previewCode.innerHTML = `<span class="text-red-400">/* Vui lòng chọn ít nhất 1 trường dữ liệu ở bên trái */</span>`;
            return;
        }

        const records = [];
        const maxRows = Math.min(state.rows, 5000); 
        for (let i = 0; i < maxRows; i++) records.push(generateFakeRecord());

        generatedDataStr = generateDataStr(records);
        
        let displayHtml = generatedDataStr
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/(".*?"|'.*?')/g, '<span style="color: #a5d6ff;">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span style="color: #79c0ff;">$1</span>')
            .replace(/\b(\d+)\b/g, '<span style="color: #79c0ff;">$1</span>');
            
        if (state.format === 'sql') displayHtml = displayHtml.replace(/\b(INSERT INTO|VALUES)\b/g, '<span style="color: #ff7b72;">$1</span>');

        previewCode.innerHTML = displayHtml;

        const ext = state.format === 'sql' ? 'sql' : (state.format === 'csv' ? 'csv' : 'json');
        previewTitle.textContent = `mock_data.${ext}`;
        statusCount.textContent = `${maxRows} rows`;
    };

    // --- SỰ KIỆN LẮNG NGHE ---
    elFormat.addEventListener('change', (e) => { state.format = e.target.value; runGenerate(); });
    elLocale.addEventListener('change', (e) => { state.locale = e.target.value; runGenerate(); });

    rowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rowBtns.forEach(b => {
                b.classList.remove('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white');
                b.classList.add('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            });
            btn.classList.remove('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            btn.classList.add('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white');
            
            customRowInput.value = '';
            state.rows = parseInt(btn.dataset.val);
            runGenerate();
        });
    });

    customRowInput.addEventListener('input', (e) => {
        rowBtns.forEach(b => {
            b.classList.remove('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white');
            b.classList.add('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
        });
        const val = parseInt(e.target.value);
        if (val > 0) {
            state.rows = val;
            runGenerate();
        }
    });

    btnGenerate.addEventListener('click', runGenerate);

    btnCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(generatedDataStr);
            UI.showAlert('Đã copy', 'Dữ liệu đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Không thể copy', 'error');
        }
    });

    btnDownload.addEventListener('click', () => {
        if (!generatedDataStr) return;
        const blob = new Blob([generatedDataStr], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const ext = state.format === 'sql' ? 'sql' : (state.format === 'csv' ? 'csv' : 'json');
        link.download = `mock_data_${Date.now()}.${ext}`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    renderFields();
    runGenerate();
}