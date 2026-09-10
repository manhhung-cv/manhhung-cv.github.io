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
    <div id="table-converter-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #table-converter-root {
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

            .editor-cell:focus {
                outline: none;
                background-color: color-mix(in srgb, var(--kit-accent) 10%, transparent);
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE & TOP CONTROLS -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Data Suite</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Excel to File & Table Editor</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Chỉnh sửa bảng tính trực tiếp hoặc dán thô, xuất sang JSON, Markdown, HTML, CSV, XML, SQL, YAML.</p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <button id="btn-load-sample" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-wand-magic-sparkles text-[11px]"></i> Mẫu
                    </button>
                    <button id="btn-clear-all" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="far fa-trash-can text-[11px]"></i> Xóa
                    </button>
                </div>
            </div>

            <!-- MAIN WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: BẢNG CHỈNH SỬA / VÙNG DÁN (7 COLS) -->
                <div class="lg:col-span-7 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    
                    <!-- INPUT TABS & ROW/COL ACTIONS -->
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-72" id="input-mode-tabs">
                            <button class="mode-tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5" data-target="editor-mode-table">
                                <i class="fas fa-table-cells text-[11px]"></i> Bảng tính
                            </button>
                            <button class="mode-tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-target="editor-mode-raw">
                                <i class="fas fa-paste text-[11px]"></i> Dán thô Excel
                            </button>
                        </div>

                        <div id="table-action-bar" class="flex items-center gap-1.5">
                            <button id="btn-add-row" class="px-2.5 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold active:scale-95 transition-all">
                                <i class="fas fa-plus text-[9px] mr-1 text-accent-theme"></i> Hàng
                            </button>
                            <button id="btn-add-col" class="px-2.5 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold active:scale-95 transition-all">
                                <i class="fas fa-plus text-[9px] mr-1 text-accent-theme"></i> Cột
                            </button>
                        </div>
                    </div>

                    <!-- PANE 1: ONLINE TABLE EDITOR -->
                    <div class="input-pane block space-y-2" id="editor-mode-table">
                        <div class="w-full overflow-x-auto max-h-[440px] no-scrollbar border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                            <table id="main-interactive-table" class="w-full text-left border-collapse min-w-[480px]">
                                <thead id="table-head"></thead>
                                <tbody id="table-body" class="text-xs font-medium text-zinc-800 dark:text-zinc-200 divide-y divide-black/[0.04] dark:divide-white/[0.06]"></tbody>
                            </table>
                        </div>

                        <div class="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-1">
                            <span><i class="fas fa-pen text-[9px] mr-1"></i> Nhấp trực tiếp vào ô để sửa nội dung.</span>
                            <span id="table-matrix-info" class="font-mono font-medium">0 hàng x 0 cột</span>
                        </div>
                    </div>

                    <!-- PANE 2: RAW EXCEL / TSV / CSV TEXTAREA -->
                    <div class="input-pane hidden space-y-3" id="editor-mode-raw">
                        <textarea id="raw-input-textarea" class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 outline-none text-xs font-mono text-zinc-900 dark:text-white resize-y min-h-[300px] placeholder-zinc-400 focus:border-accent-theme transition-all" placeholder="Dán dữ liệu từ Excel, Google Sheets, CSV hoặc TSV vào đây..."></textarea>
                        
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                            <span class="text-[11px] text-zinc-400">Tự nhận diện dấu Tab (\t), phẩy (,) hoặc chấm phẩy (;).</span>
                            <button id="btn-parse-raw" class="h-10 px-4 rounded-[14px] bg-accent-theme text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                Nạp vào bảng <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>

                </div>

                <!-- CỘT PHẢI: KẾT QUẢ CHUYỂN ĐỔI (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4 flex flex-col min-h-[500px]">
                    
                    <!-- TARGET ACTIONS & LABEL -->
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Định dạng đích</span>
                        <div class="flex items-center gap-1.5">
                            <button id="btn-copy-output" class="px-2.5 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all" title="Sao chép">
                                <i class="far fa-copy text-[11px]"></i> Chép
                            </button>
                            <button id="btn-download-file" class="px-2.5 py-1.5 rounded-[10px] bg-accent-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Tải file">
                                <i class="fas fa-download text-[11px]"></i> Tải
                            </button>
                        </div>
                    </div>

                    <!-- SCROLLABLE FORMAT PILLS -->
                    <div class="flex overflow-x-auto no-scrollbar gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="target-format-tabs">
                        <button class="target-btn active py-1 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all whitespace-nowrap" data-format="json">JSON</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="markdown">Markdown</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="html">HTML</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="csv">CSV</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="xml">XML</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="sql">SQL</button>
                        <button class="target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap" data-format="yaml">YAML</button>
                    </div>

                    <!-- OUTPUT BOX -->
                    <div class="relative flex-1 flex flex-col min-h-[300px]">
                        <textarea id="output-result-box" readonly class="w-full flex-1 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 outline-none font-mono text-xs text-zinc-800 dark:text-zinc-200 resize-none select-all" placeholder="Kết quả sau khi chuyển đổi sẽ hiển thị tại đây..."></textarea>
                    </div>

                    <!-- STATS FOOTER -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span id="output-stats-counter">0 ký tự | 0 KB</span>
                        <span class="font-mono text-[10px] font-bold text-accent-theme" id="active-format-label">ĐỊNH DẠNG: JSON</span>
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
    const rootContainer = hostElement.querySelector('#table-converter-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let headers = ['ID', 'Tên sản phẩm', 'Danh mục', 'Giá bán (VNĐ)', 'Số lượng'];
    let rows = [
        ['SP001', 'MacBook Pro M3 Max', 'Laptop', '79990000', '15'],
        ['SP002', 'iPhone 15 Pro Max', 'Điện thoại', '34990000', '42'],
        ['SP003', 'iPad Pro M2 11 inch', 'Tablet', '21500000', '28'],
        ['SP004', 'AirPods Pro 2 USB-C', 'Phụ kiện', '5890000', '100'],
        ['SP005', 'Apple Watch Ultra 2', 'Smartwatch', '20990000', '18']
    ];
    let currentFormat = 'json';

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const tableHead = _('#table-head');
    const tableBody = _('#table-body');
    const tableMatrixInfo = _('#table-matrix-info');
    const rawInputTextarea = _('#raw-input-textarea');
    const outputResultBox = _('#output-result-box');
    const outputStatsCounter = _('#output-stats-counter');
    const activeFormatLabel = _('#active-format-label');
    const tableActionBar = _('#table-action-bar');

    // Engine chuyển đổi dữ liệu
    function convertTableData(format) {
        if (!headers.length && !rows.length) {
            outputResultBox.value = '';
            updateStats('');
            return;
        }

        let output = '';
        switch (format) {
            case 'json':
                const jsonData = rows.map(row => {
                    const obj = {};
                    headers.forEach((h, i) => {
                        const val = row[i] !== undefined ? row[i] : '';
                        obj[h || `col_${i + 1}`] = isNaN(val) || val.trim() === '' ? val : Number(val);
                    });
                    return obj;
                });
                output = JSON.stringify(jsonData, null, 2);
                break;

            case 'markdown':
                const cleanHeaders = headers.map(h => h || ' ');
                const headerLine = `| ${cleanHeaders.join(' | ')} |`;
                const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
                const rowLines = rows.map(r => {
                    const cleanRow = headers.map((_, i) => (r[i] !== undefined ? String(r[i]).replace(/\|/g, '\\|') : ''));
                    return `| ${cleanRow.join(' | ')} |`;
                });
                output = [headerLine, separatorLine, ...rowLines].join('\n');
                break;

            case 'html':
                output = `<table class="table-auto border-collapse border border-slate-300 w-full">\n`;
                output += `  <thead>\n    <tr class="bg-slate-100">\n`;
                headers.forEach(h => {
                    output += `      <th class="border border-slate-300 p-2 text-left">${escapeHtml(h)}</th>\n`;
                });
                output += `    </tr>\n  </thead>\n  <tbody>\n`;
                rows.forEach(r => {
                    output += `    <tr>\n`;
                    headers.forEach((_, i) => {
                        output += `      <td class="border border-slate-300 p-2">${escapeHtml(r[i] || '')}</td>\n`;
                    });
                    output += `    </tr>\n`;
                });
                output += `  </tbody>\n</table>`;
                break;

            case 'csv':
                const csvRows = [headers, ...rows];
                output = csvRows.map(r => 
                    r.map(val => {
                        const str = String(val || '');
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    }).join(',')
                ).join('\n');
                break;

            case 'xml':
                output = `<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n`;
                rows.forEach(row => {
                    output += `  <record>\n`;
                    headers.forEach((h, i) => {
                        const tag = (h || `col_${i + 1}`).replace(/[^a-zA-Z0-9_]/g, '_');
                        output += `    <${tag}>${escapeXml(row[i] || '')}</${tag}>\n`;
                    });
                    output += `  </record>\n`;
                });
                output += `</dataset>`;
                break;

            case 'sql':
                const tableName = 'converted_table';
                const cols = headers.map((h, i) => `\`${(h || `col_${i + 1}`).replace(/`/g, '')}\``).join(', ');
                const insertStatements = rows.map(r => {
                    const values = headers.map((_, i) => {
                        const val = r[i] !== undefined ? r[i] : '';
                        return isNaN(val) || val.trim() === '' ? `'${String(val).replace(/'/g, "''")}'` : val;
                    }).join(', ');
                    return `INSERT INTO \`${tableName}\` (${cols}) VALUES (${values});`;
                });
                output = insertStatements.join('\n');
                break;

            case 'yaml':
                output = rows.map(row => {
                    let y = `- `;
                    headers.forEach((h, i) => {
                        const val = row[i] !== undefined ? row[i] : '';
                        const key = h || `col_${i + 1}`;
                        const prefix = i === 0 ? '' : '  ';
                        y += `${prefix}${key}: ${isNaN(val) || val.trim() === '' ? `"${val}"` : val}\n`;
                    });
                    return y.trimEnd();
                }).join('\n');
                break;
        }

        outputResultBox.value = output;
        updateStats(output);
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    function escapeXml(str) {
        return String(str).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;' }[c]));
    }

    function updateStats(content) {
        const chars = content.length;
        const bytes = new Blob([content]).size;
        const kb = (bytes / 1024).toFixed(2);
        outputStatsCounter.textContent = `${chars.toLocaleString()} ký tự | ${kb} KB`;
        activeFormatLabel.textContent = `ĐỊNH DẠNG: ${currentFormat.toUpperCase()}`;
    }

    // Render bảng tương tác
    function renderTable() {
        let thHtml = `<tr class="bg-[#f2f2f7] dark:bg-black/40 border-b border-black/[0.06] dark:border-white/[0.08]">`;
        thHtml += `<th class="p-2 text-center text-zinc-400 text-[10px] uppercase font-mono font-bold w-10">#</th>`;
        headers.forEach((h, colIndex) => {
            thHtml += `
                <th class="p-1.5 border-r border-black/[0.04] dark:border-white/[0.06] relative group">
                    <div class="flex items-center justify-between gap-1">
                        <input type="text" data-col="${colIndex}" class="header-cell w-full bg-transparent outline-none text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider px-1.5 py-1 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/5" value="${escapeHtml(h)}">
                        <button data-del-col="${colIndex}" class="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 p-1 text-[10px] transition-opacity" title="Xóa cột"><i class="fas fa-times"></i></button>
                    </div>
                </th>
            `;
        });
        thHtml += `</tr>`;
        tableHead.innerHTML = thHtml;

        let trHtml = '';
        rows.forEach((row, rowIndex) => {
            trHtml += `<tr class="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">`;
            trHtml += `
                <td class="p-2 text-center text-[10px] font-mono font-bold text-zinc-400 w-10 select-none relative">
                    <span class="group-hover:hidden">${rowIndex + 1}</span>
                    <button data-del-row="${rowIndex}" class="hidden group-hover:inline-block text-rose-500 hover:scale-110 transition-transform" title="Xóa hàng"><i class="far fa-trash-can text-[10px]"></i></button>
                </td>
            `;
            headers.forEach((_, colIndex) => {
                const cellValue = row[colIndex] !== undefined ? row[colIndex] : '';
                trHtml += `
                    <td class="p-1 border-r border-black/[0.04] dark:border-white/[0.06]">
                        <input type="text" data-row="${rowIndex}" data-col="${colIndex}" class="editor-cell w-full bg-transparent px-2 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 rounded-[8px] outline-none" value="${escapeHtml(cellValue)}">
                    </td>
                `;
            });
            trHtml += `</tr>`;
        });
        tableBody.innerHTML = trHtml;

        tableMatrixInfo.textContent = `${rows.length} hàng x ${headers.length} cột`;
        bindCellEvents();
        convertTableData(currentFormat);
    }

    function bindCellEvents() {
        $$('.header-cell').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const colIdx = parseInt(e.target.dataset.col);
                headers[colIdx] = e.target.value;
                convertTableData(currentFormat);
            });
        });

        $$('.editor-cell').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const r = parseInt(e.target.dataset.row);
                const c = parseInt(e.target.dataset.col);
                rows[r][c] = e.target.value;
                convertTableData(currentFormat);
            });
        });

        $$('[data-del-col]').forEach(btn => {
            btn.onclick = () => {
                const colIdx = parseInt(btn.dataset.delCol);
                if (headers.length <= 1) {
                    IslandKit.notify('Cảnh báo', 'Bảng cần duy trì tối thiểu 1 cột.', 'warning');
                    return;
                }
                headers.splice(colIdx, 1);
                rows.forEach(r => r.splice(colIdx, 1));
                renderTable();
            };
        });

        $$('[data-del-row]').forEach(btn => {
            btn.onclick = () => {
                const rowIdx = parseInt(btn.dataset.delRow);
                rows.splice(rowIdx, 1);
                renderTable();
            };
        });
    }

    // Parser dữ liệu Raw
    function parseRawText(rawText) {
        if (!rawText.trim()) return;

        const firstLine = rawText.trim().split('\n')[0];
        let delimiter = '\t';
        if (!firstLine.includes('\t')) {
            if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
            else delimiter = ',';
        }

        const lines = rawText.trim().split(/\r?\n/);
        if (lines.length === 0) return;

        const parsedRows = lines.map(line => {
            if (delimiter === '\t' || delimiter === ';') {
                return line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
            }
            const row = [];
            let inQuotes = false;
            let currentStr = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' || char === "'") inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) {
                    row.push(currentStr.trim().replace(/^["']|["']$/g, ''));
                    currentStr = '';
                    continue;
                }
                currentStr += char;
            }
            row.push(currentStr.trim().replace(/^["']|["']$/g, ''));
            return row;
        });

        if (parsedRows.length > 0) {
            headers = parsedRows[0].map((h, i) => h || `Col_${i + 1}`);
            rows = parsedRows.slice(1);
            if (rows.length === 0) rows = [new Array(headers.length).fill('')];
            renderTable();
            IslandKit.notify('Đã nạp bảng', `Đã phân tích ${rows.length} hàng và ${headers.length} cột.`, 'success');
        }
    }

    // Segmented Tabs: Chế độ nhập (Table Editor vs Paste Raw)
    const modeTabs = $$('#input-mode-tabs .mode-tab-btn');
    const inputPanes = $$('.input-pane');

    const activeTabClass = 'mode-tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveTabClass = 'mode-tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.className = inactiveTabClass);
            inputPanes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });

            tab.className = activeTabClass;
            const targetPane = _(`#${tab.getAttribute('data-target')}`);
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('block');
            }

            if (tab.getAttribute('data-target') === 'editor-mode-table') {
                tableActionBar.classList.remove('hidden');
                renderTable();
            } else {
                tableActionBar.classList.add('hidden');
            }
        });
    });

    // Nút Nạp Raw vào bảng
    _('#btn-parse-raw')?.addEventListener('click', () => {
        const rawContent = rawInputTextarea.value;
        if (!rawContent.trim()) {
            IslandKit.notify('Trống', 'Vui lòng dán dữ liệu trước khi nạp.', 'info');
            return;
        }
        parseRawText(rawContent);
        modeTabs[0].click();
    });

    // Thêm Hàng & Cột
    _('#btn-add-row')?.addEventListener('click', () => {
        rows.push(new Array(headers.length).fill(''));
        renderTable();
    });

    _('#btn-add-col')?.addEventListener('click', () => {
        headers.push(`Col_${headers.length + 1}`);
        rows.forEach(r => r.push(''));
        renderTable();
    });

    // Segmented Tabs: Chọn định dạng xuất
    const formatTabs = $$('#target-format-tabs .target-btn');
    const activeFormatClass = 'target-btn active py-1 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all whitespace-nowrap';
    const inactiveFormatClass = 'target-btn py-1 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap';

    formatTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            formatTabs.forEach(b => b.className = inactiveFormatClass);
            btn.className = activeFormatClass;
            currentFormat = btn.dataset.format;
            convertTableData(currentFormat);
        });
    });

    // Copy Output
    _('#btn-copy-output')?.addEventListener('click', async () => {
        const text = outputResultBox.value;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            IslandKit.notify('Đã sao chép', `Dữ liệu [${currentFormat.toUpperCase()}] đã lưu vào clipboard.`, 'success');
        } catch (e) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    // Tải File về máy
    _('#btn-download-file')?.addEventListener('click', () => {
        const text = outputResultBox.value;
        if (!text) return;

        const mimeTypes = {
            json: 'application/json',
            markdown: 'text/markdown',
            html: 'text/html',
            csv: 'text/csv',
            xml: 'application/xml',
            sql: 'application/sql',
            yaml: 'text/yaml'
        };

        const extensions = {
            json: 'json',
            markdown: 'md',
            html: 'html',
            csv: 'csv',
            xml: 'xml',
            sql: 'sql',
            yaml: 'yaml'
        };

        const blob = new Blob([text], { type: mimeTypes[currentFormat] || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table_export_${Date.now()}.${extensions[currentFormat] || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Nạp dữ liệu mẫu
    _('#btn-load-sample')?.addEventListener('click', () => {
        headers = ['ID', 'Tên sản phẩm', 'Danh mục', 'Giá bán (VNĐ)', 'Số lượng'];
        rows = [
            ['SP001', 'MacBook Pro M3 Max', 'Laptop', '79990000', '15'],
            ['SP002', 'iPhone 15 Pro Max', 'Điện thoại', '34990000', '42'],
            ['SP003', 'iPad Pro M2 11 inch', 'Tablet', '21500000', '28'],
            ['SP004', 'AirPods Pro 2 USB-C', 'Phụ kiện', '5890000', '100'],
            ['SP005', 'Apple Watch Ultra 2', 'Smartwatch', '20990000', '18']
        ];
        renderTable();
        IslandKit.notify('Đã khôi phục', 'Bảng dữ liệu mẫu đã được nạp.', 'info');
    });

    // Xóa toàn bộ dữ liệu
    _('#btn-clear-all')?.addEventListener('click', () => {
        UI.showConfirm(
            'Xóa bảng dữ liệu?',
            'Toàn bộ các hàng và cột hiện tại sẽ bị xóa sạch. Bạn có muốn tiếp tục?',
            () => {
                headers = ['Cột 1', 'Cột 2'];
                rows = [['', '']];
                rawInputTextarea.value = '';
                renderTable();
                IslandKit.notify('Đã xóa', 'Bảng đã được làm mới hoàn toàn.', 'info');
            }
        );
    });

    renderTable();
}