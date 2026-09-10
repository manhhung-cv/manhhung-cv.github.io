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
    <div id="fake-data-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #fake-data-root {
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

            /* Mini Switch cho danh sách Fields */
            .fd-mini-switch {
                width: 32px;
                height: 18px;
                background-color: rgba(0, 0, 0, 0.14);
                border-radius: 9999px;
                position: relative;
                transition: background-color 0.2s ease;
                padding: 2px;
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
            }
            .dark .fd-mini-switch {
                background-color: rgba(255, 255, 255, 0.16);
            }
            .fd-mini-switch.active {
                background-color: var(--kit-accent) !important;
            }
            .fd-mini-switch .fd-mini-thumb {
                width: 14px;
                height: 14px;
                background-color: #ffffff;
                border-radius: 9999px;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
            .fd-mini-switch.active .fd-mini-thumb {
                transform: translateX(14px);
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Mock Engine</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Tạo Dữ liệu Mẫu</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Sinh dữ liệu ngẫu nhiên đa ngôn ngữ phục vụ kiểm thử giao diện, API hoặc Database.</p>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: ĐIỀU KHIỂN & CẤU HÌNH TRƯỜNG (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    
                    <!-- ĐỊNH DẠNG & NGÔN NGỮ -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Định dạng</label>
                            <div class="relative">
                                <select id="fd-format" class="appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all cursor-pointer">
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                    <option value="sql">SQL (Insert)</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400"><i class="fas fa-chevron-down text-[10px]"></i></div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ngôn ngữ</label>
                            <div class="relative">
                                <select id="fd-locale" class="appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all cursor-pointer">
                                    <option value="vi">🇻🇳 Tiếng Việt</option>
                                    <option value="en">🇺🇸 Tiếng Anh</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400"><i class="fas fa-chevron-down text-[10px]"></i></div>
                            </div>
                        </div>
                    </div>

                    <!-- SỐ LƯỢNG BẢN GHI (PRESET SEGMENTS) -->
                    <div class="space-y-1.5 pt-1">
                        <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Số lượng bản ghi</label>
                        <div class="grid grid-cols-4 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="fd-row-pills">
                            <button class="fd-row-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-val="10">10</button>
                            <button class="fd-row-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-val="50">50</button>
                            <button class="fd-row-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-val="100">100</button>
                            <input type="number" id="fd-custom-rows" class="w-full bg-transparent border-none text-xs font-mono font-semibold text-center text-zinc-900 dark:text-white placeholder-zinc-400 outline-none" placeholder="Tùy...">
                        </div>
                    </div>

                    <!-- DANH SÁCH CÁC TRƯỜNG DỮ LIỆU (FIELDS) -->
                    <div class="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <div class="flex items-center justify-between">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Trường dữ liệu</label>
                            <span class="text-[9px] font-mono text-zinc-400">Chọn tối thiểu 1</span>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="fd-fields-container"></div>
                    </div>

                    <!-- NÚT TẠO DỮ LIỆU -->
                    <div class="pt-2">
                        <button id="btn-fd-generate" class="w-full h-11 bg-accent-theme text-white rounded-[14px] font-bold text-xs active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-bolt text-xs"></i> Sinh dữ liệu ngẫu nhiên
                        </button>
                    </div>

                </div>

                <!-- CỘT PHẢI: XEM TRƯỚC MÃ NGUỒN (7 COLS) -->
                <div class="lg:col-span-7 space-y-4 lg:sticky lg:top-6">
                    
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col h-[520px]">
                        
                        <!-- HUNQOS CODE CANVAS HEADER -->
                        <div class="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#161618]">
                            <div class="flex items-center gap-2.5">
                                <div class="w-6 h-6 rounded-[8px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-code text-[11px]"></i>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span id="fd-preview-title" class="text-xs font-mono font-bold text-zinc-900 dark:text-white tracking-tight">data.json</span>
                                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-semibold">Generated</span>
                                </div>
                            </div>

                            <div class="flex items-center gap-1.5">
                                <button id="btn-fd-copy" class="px-2.5 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all">
                                    <i class="far fa-copy text-[11px]"></i> Chép
                                </button>
                                <button id="btn-fd-download" class="px-2.5 py-1.5 rounded-[10px] bg-accent-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                    <i class="fas fa-download text-[11px]"></i> Tải
                                </button>
                            </div>
                        </div>

                        <!-- CODE AREA -->
                        <div class="flex-1 overflow-auto p-4 no-scrollbar bg-[#f2f2f7]/50 dark:bg-black/40 selection:bg-accent-theme-alpha">
                            <pre><code id="fd-preview-code" class="text-xs font-mono leading-relaxed text-zinc-800 dark:text-zinc-200 break-all"></code></pre>
                        </div>

                        <!-- STATUS FOOTER -->
                        <div class="px-4 py-2 bg-white dark:bg-[#161618] border-t border-black/[0.05] dark:border-white/[0.08] text-[10px] font-mono text-zinc-400 flex justify-between items-center">
                            <span id="fd-status-count">10 bản ghi</span>
                            <span id="fd-status-size">UTF-8 Ready</span>
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
    const rootContainer = hostElement.querySelector('#fake-data-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

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

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const elFormat = _('#fd-format');
    const elLocale = _('#fd-locale');
    const rowBtns = $$('.fd-row-btn');
    const customRowInput = _('#fd-custom-rows');
    const fieldsContainer = _('#fd-fields-container');
    const btnGenerate = _('#btn-fd-generate');
    
    const previewTitle = _('#fd-preview-title');
    const previewCode = _('#fd-preview-code');
    const statusCount = _('#fd-status-count');
    const btnCopy = _('#btn-fd-copy');
    const btnDownload = _('#btn-fd-download');

    // CƠ SỞ DỮ LIỆU FAKER[cite: 6]
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

    const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
    const getRandNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const generateUUID = () => {
        if (crypto && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
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

    const FIELD_DEFS = [
        { id: 'id', label: 'ID (UUID)', icon: 'fas fa-fingerprint' },
        { id: 'fullName', label: 'Họ & Tên', icon: 'fas fa-user' },
        { id: 'email', label: 'Email', icon: 'fas fa-envelope' },
        { id: 'phone', label: 'Điện thoại', icon: 'fas fa-phone' },
        { id: 'address', label: 'Địa chỉ', icon: 'fas fa-location-dot' },
        { id: 'company', label: 'Công ty', icon: 'fas fa-building' },
        { id: 'jobTitle', label: 'Chức vụ', icon: 'fas fa-briefcase' },
        { id: 'creditCard', label: 'Thẻ tín dụng', icon: 'fas fa-credit-card' }
    ];

    const renderFields = () => {
        fieldsContainer.innerHTML = FIELD_DEFS.map(f => {
            const isChecked = state.fields[f.id];
            return `
                <div class="flex items-center justify-between p-2.5 rounded-[14px] border transition-colors cursor-pointer group ${
                    isChecked
                    ? 'bg-accent-theme-alpha border-accent-theme'
                    : 'bg-[#f2f2f7] dark:bg-black/40 border-black/[0.04] dark:border-white/[0.06] hover:bg-black/5 dark:hover:bg-white/5'
                }" data-field-trigger="${f.id}">
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="${f.icon} ${isChecked ? 'text-accent-theme' : 'text-zinc-400'} text-xs w-4 text-center"></i>
                        <span class="text-xs font-semibold truncate ${isChecked ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}">${f.label}</span>
                    </div>
                    
                    <div class="fd-mini-switch ${isChecked ? 'active' : ''}">
                        <div class="fd-mini-thumb"></div>
                    </div>
                </div>
            `;
        }).join('');

        fieldsContainer.querySelectorAll('[data-field-trigger]').forEach(item => {
            item.onclick = () => {
                const key = item.dataset.fieldTrigger;
                state.fields[key] = !state.fields[key];
                renderFields();
                runGenerate(false);
            };
        });
    };

    const runGenerate = (notify = false) => {
        const hasField = Object.values(state.fields).some(v => v);
        if (!hasField) {
            previewCode.innerHTML = `<span class="text-rose-500 font-mono">// Vui lòng chọn ít nhất 1 trường dữ liệu ở cột bên trái</span>`;
            return;
        }

        const records = [];
        const maxRows = Math.min(state.rows, 5000); 
        for (let i = 0; i < maxRows; i++) records.push(generateFakeRecord());

        generatedDataStr = generateDataStr(records);

        let displayHtml = generatedDataStr
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/(".*?"|'.*?')/g, '<span style="color: var(--kit-accent);">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="text-indigo-500">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="text-amber-500">$1</span>');

        if (state.format === 'sql') {
            displayHtml = displayHtml.replace(/\b(INSERT INTO|VALUES)\b/g, '<span class="text-rose-500 font-bold">$1</span>');
        }

        previewCode.innerHTML = displayHtml;

        const ext = state.format === 'sql' ? 'sql' : (state.format === 'csv' ? 'csv' : 'json');
        previewTitle.textContent = `mock_data.${ext}`;
        statusCount.textContent = `${maxRows} bản ghi`;

        if (notify) {
            IslandKit.notify('Hoàn tất', `Đã tạo ${maxRows} bản ghi ngẫu nhiên.`, 'success');
        }
    };

    // Format & Locale Select
    elFormat?.addEventListener('change', (e) => { 
        state.format = e.target.value; 
        runGenerate(false); 
    });
    elLocale?.addEventListener('change', (e) => { 
        state.locale = e.target.value; 
        runGenerate(false); 
    });

    // Preset Buttons
    const activeRowClass = 'fd-row-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center';
    const inactiveRowClass = 'fd-row-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center';

    rowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rowBtns.forEach(b => b.className = inactiveRowClass);
            btn.className = activeRowClass;
            
            if (customRowInput) customRowInput.value = '';
            state.rows = parseInt(btn.dataset.val);
            runGenerate(false);
        });
    });

    customRowInput?.addEventListener('input', (e) => {
        rowBtns.forEach(b => b.className = inactiveRowClass);
        const val = parseInt(e.target.value);
        if (val > 0) {
            state.rows = val;
            runGenerate(false);
        }
    });

    btnGenerate?.addEventListener('click', () => runGenerate(true));

    // Copy to Clipboard
    btnCopy?.addEventListener('click', async () => {
        if (!generatedDataStr) return;
        try {
            await navigator.clipboard.writeText(generatedDataStr);
            IslandKit.notify('Đã sao chép', 'Dữ liệu mẫu đã lưu vào clipboard.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    // Download File
    btnDownload?.addEventListener('click', () => {
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
    runGenerate(false);
}