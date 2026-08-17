import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Nút bấm Premium */
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            /* Animation */
            .ui-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Table Editor Styling */
            .editor-cell:focus { outline: none; background-color: rgba(24, 24, 27, 0.05); }
            .dark .editor-cell:focus { background-color: rgba(255, 255, 255, 0.08); }
        </style>

        <div class="relative flex flex-col w-full max-w-[1280px] mx-auto min-h-[600px] pb-12 px-2 md:px-4">
            
            <!-- Header -->
            <div class="mb-6 ui-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 class="text-[26px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">
                        Excel to File & Table Editor
                    </h2>
                    <p class="text-[13px] text-zinc-500 font-medium">
                        Dán dữ liệu từ Excel/CSV/TSV, chỉnh sửa trực tiếp trên bảng và chuyển đổi sang JSON, Markdown, HTML, XML, SQL, YAML.
                    </p>
                </div>
                <!-- Action Controls -->
                <div class="flex items-center gap-2">
                    <button id="btn-load-sample" class="btn-premium px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold flex items-center gap-2">
                        <i class="fas fa-magic"></i> Dữ liệu mẫu
                    </button>
                    <button id="btn-clear-all" class="btn-premium px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-red-500 text-xs font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <i class="fas fa-trash-alt"></i> Xóa hết
                    </button>
                </div>
            </div>

            <!-- Main Layout Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <!-- Cột trái: Input & Online Table Editor (7 Cols) -->
                <div class="lg:col-span-7 space-y-6 ui-fade-in" style="animation-delay: 50ms;">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[28px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 md:p-6 shadow-sm">
                        
                        <!-- Input Mode Tabs & Toolbar -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div class="flex bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-2xl gap-1" id="input-mode-tabs">
                                <button class="mode-tab-btn active btn-premium px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold" data-target="editor-mode-table">
                                    <i class="fas fa-table mr-1.5"></i> Table Editor
                                </button>
                                <button class="mode-tab-btn btn-premium px-4 py-2 rounded-xl text-zinc-500 text-xs font-bold" data-target="editor-mode-raw">
                                    <i class="fas fa-paste mr-1.5"></i> Paste Raw Excel/TSV
                                </button>
                            </div>

                            <!-- Table Controls (Ẩn khi ở chế độ Raw text) -->
                            <div id="table-action-bar" class="flex items-center gap-1.5 flex-wrap">
                                <button id="btn-add-row" class="btn-premium px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold" title="Thêm hàng">
                                    <i class="fas fa-plus mr-1"></i> Hàng
                                </button>
                                <button id="btn-add-col" class="btn-premium px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold" title="Thêm cột">
                                    <i class="fas fa-plus mr-1"></i> Cột
                                </button>
                            </div>
                        </div>

                        <!-- Pane 1: Online Table Editor -->
                        <div class="input-pane block" id="editor-mode-table">
                            <div class="w-full overflow-x-auto max-h-[460px] custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <table id="main-interactive-table" class="w-full text-left border-collapse min-w-[500px]">
                                    <thead id="table-head">
                                        <!-- Header sinh động bởi JS -->
                                    </thead>
                                    <tbody id="table-body" class="text-xs font-medium text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-800">
                                        <!-- Rows sinh động bởi JS -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="flex items-center justify-between mt-3 text-[11px] text-zinc-400 font-medium px-1">
                                <span><i class="fas fa-info-circle mr-1"></i> Nhấp trực tiếp vào ô để sửa nội dung.</span>
                                <span id="table-matrix-info">0 hàng x 0 cột</span>
                            </div>
                        </div>

                        <!-- Pane 2: Raw Excel / TSV / CSV Paste Area -->
                        <div class="input-pane hidden" id="editor-mode-raw">
                            <textarea id="raw-input-textarea" class="w-full bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-xs font-mono text-zinc-900 dark:text-white resize-y min-h-[320px] custom-scrollbar placeholder-zinc-400 focus:ring-2 ring-zinc-900 dark:ring-white transition-all" placeholder="Dán nội dung từ Excel, Google Sheets, CSV hoặc TSV vào đây (Tab/Comma separated)..."></textarea>
                            <div class="flex items-center justify-between mt-3">
                                <span class="text-[11px] text-zinc-400">Tự động nhận diện dấu Tab, phẩy (,) hoặc chấm phẩy (;)</span>
                                <button id="btn-parse-raw" class="btn-premium px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold">
                                    Nạp vào Bảng <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Cột phải: Convert Output Generator (5 Cols) -->
                <div class="lg:col-span-5 space-y-6 ui-fade-in" style="animation-delay: 100ms;">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[28px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 md:p-6 shadow-sm flex flex-col min-h-[550px]">
                        
                        <!-- Format Tabs -->
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Định dạng đích</span>
                            <div class="flex items-center gap-2">
                                <button id="btn-copy-output" class="btn-premium px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold flex items-center gap-1.5" title="Copy Output">
                                    <i class="far fa-copy"></i> Sao chép
                                </button>
                                <button id="btn-download-file" class="btn-premium px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5" title="Download File">
                                    <i class="fas fa-download"></i> Tải về
                                </button>
                            </div>
                        </div>

                        <!-- Target Tabs Selection -->
                        <div class="flex overflow-x-auto custom-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl mb-4" id="target-format-tabs">
                            <button class="target-btn active btn-premium px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap" data-format="json">JSON</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="markdown">Markdown</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="html">HTML</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="csv">CSV</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="xml">XML</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="sql">SQL</button>
                            <button class="target-btn btn-premium px-3 py-1.5 rounded-xl text-zinc-500 text-[11px] font-bold whitespace-nowrap" data-format="yaml">YAML</button>
                        </div>

                        <!-- Output Content Pre -->
                        <div class="relative flex-1 flex flex-col">
                            <textarea id="output-result-box" readonly class="w-full flex-1 bg-zinc-50 dark:bg-[#121214]/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none font-mono text-xs text-zinc-900 dark:text-white resize-none custom-scrollbar min-h-[360px]" placeholder="Kết quả chuyển đổi sẽ hiển thị ở đây..."></textarea>
                        </div>

                        <!-- Format Options Bar -->
                        <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                            <span id="output-stats-counter">0 ký tự | 0 KB</span>
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest" id="active-format-label">ĐỊNH DẠNG: JSON</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // ----------------------------------------------------
    // STATE QUẢN LÝ DỮ LIỆU
    // ----------------------------------------------------
    let headers = ['ID', 'Tên sản phẩm', 'Danh mục', 'Giá bán (VNĐ)', 'Số lượng'];
    let rows = [
        ['SP001', 'MacBook Pro M3 Max', 'Laptop', '79990000', '15'],
        ['SP002', 'iPhone 15 Pro Max', 'Điện thoại', '34990000', '42'],
        ['SP003', 'iPad Pro M2 11 inch', 'Tablet', '21500000', '28'],
        ['SP004', 'AirPods Pro 2 USB-C', 'Phụ kiện', '5890000', '100'],
        ['SP005', 'Apple Watch Ultra 2', 'Smartwatch', '20990000', '18']
    ];
    let currentFormat = 'json';

    // ----------------------------------------------------
    // ELEMENT SELECTORS
    // ----------------------------------------------------
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const tableMatrixInfo = document.getElementById('table-matrix-info');
    const rawInputTextarea = document.getElementById('raw-input-textarea');
    const outputResultBox = document.getElementById('output-result-box');
    const outputStatsCounter = document.getElementById('output-stats-counter');
    const activeFormatLabel = document.getElementById('active-format-label');
    const tableActionBar = document.getElementById('table-action-bar');

    // ----------------------------------------------------
    // CONVERTERS ENGINE (Hỗ trợ 7 định dạng phổ biến)
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // RENDER INTERACTIVE TABLE
    // ----------------------------------------------------
    function renderTable() {
        // Render Header
        let thHtml = `<tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">`;
        thHtml += `<th class="p-2.5 text-center text-zinc-400 text-[10px] uppercase font-bold w-12">#</th>`;
        headers.forEach((h, colIndex) => {
            thHtml += `
                <th class="p-2 border-r border-zinc-200 dark:border-zinc-800 relative group">
                    <div class="flex items-center justify-between gap-1">
                        <input type="text" data-col="${colIndex}" class="header-cell w-full bg-transparent outline-none text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider p-1 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50" value="${escapeHtml(h)}">
                        <button data-del-col="${colIndex}" class="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-1 text-[10px] transition-opacity" title="Xóa cột"><i class="fas fa-times"></i></button>
                    </div>
                </th>
            `;
        });
        thHtml += `</tr>`;
        tableHead.innerHTML = thHtml;

        // Render Body Rows
        let trHtml = '';
        rows.forEach((row, rowIndex) => {
            trHtml += `<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">`;
            trHtml += `
                <td class="p-2 text-center text-[10px] font-bold text-zinc-400 w-12 select-none relative">
                    <span class="group-hover:hidden">${rowIndex + 1}</span>
                    <button data-del-row="${rowIndex}" class="hidden group-hover:inline-block text-red-500 hover:scale-110" title="Xóa hàng"><i class="fas fa-trash-alt text-[10px]"></i></button>
                </td>
            `;
            headers.forEach((_, colIndex) => {
                const cellValue = row[colIndex] !== undefined ? row[colIndex] : '';
                trHtml += `
                    <td class="p-1 border-r border-zinc-200/50 dark:border-zinc-800/50">
                        <input type="text" data-row="${rowIndex}" data-col="${colIndex}" class="editor-cell w-full bg-transparent px-2 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 rounded outline-none" value="${escapeHtml(cellValue)}">
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
        // Sửa Header
        document.querySelectorAll('.header-cell').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const colIdx = parseInt(e.target.dataset.col);
                headers[colIdx] = e.target.value;
                convertTableData(currentFormat);
            });
        });

        // Sửa nội dung ô
        document.querySelectorAll('.editor-cell').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const r = parseInt(e.target.dataset.row);
                const c = parseInt(e.target.dataset.col);
                rows[r][c] = e.target.value;
                convertTableData(currentFormat);
            });
        });

        // Xóa cột
        document.querySelectorAll('[data-del-col]').forEach(btn => {
            btn.onclick = () => {
                const colIdx = parseInt(btn.dataset.delCol);
                if (headers.length <= 1) {
                    UI.showAlert('Lỗi', 'Bảng phải có ít nhất 1 cột.', 'error');
                    return;
                }
                headers.splice(colIdx, 1);
                rows.forEach(r => r.splice(colIdx, 1));
                renderTable();
            };
        });

        // Xóa hàng
        document.querySelectorAll('[data-del-row]').forEach(btn => {
            btn.onclick = () => {
                const rowIdx = parseInt(btn.dataset.delRow);
                rows.splice(rowIdx, 1);
                renderTable();
            };
        });
    }

    // ----------------------------------------------------
    // PARSER CHO RAW EXCEL / TSV / CSV
    // ----------------------------------------------------
    function parseRawText(rawText) {
        if (!rawText.trim()) return;

        // Nhận diện delimiter: tab (\t), comma (,), semicolon (;)
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
            // Simple CSV Regex parser
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
            UI.showAlert('Thành công', `Đã nạp ${rows.length} hàng và ${headers.length} cột từ dữ liệu dán.`, 'success');
        }
    }

    // ----------------------------------------------------
    // EVENT LISTENERS
    // ----------------------------------------------------

    // Chuyển đổi Input Mode Tabs (Table Editor vs Paste Raw)
    const modeTabs = document.querySelectorAll('#input-mode-tabs .mode-tab-btn');
    const inputPanes = document.querySelectorAll('.input-pane');

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('text-zinc-500');
            });
            inputPanes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });

            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.remove('text-zinc-500');

            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('block');
            }

            // Ẩn/Hiện action bar tương ứng
            if (tab.getAttribute('data-target') === 'editor-mode-table') {
                tableActionBar.classList.remove('hidden');
                renderTable();
            } else {
                tableActionBar.classList.add('hidden');
            }
        });
    });

    // Nút Nạp Raw vào bảng
    const btnParseRaw = document.getElementById('btn-parse-raw');
    if (btnParseRaw) {
        btnParseRaw.addEventListener('click', () => {
            const rawContent = rawInputTextarea.value;
            if (!rawContent.trim()) {
                UI.showAlert('Cảnh báo', 'Vui lòng dán dữ liệu vào trước khi nạp.', 'info');
                return;
            }
            parseRawText(rawContent);
            // Tự động nhảy lại tab Table
            modeTabs[0].click();
        });
    }

    // Thêm Hàng
    document.getElementById('btn-add-row').addEventListener('click', () => {
        rows.push(new Array(headers.length).fill(''));
        renderTable();
    });

    // Thêm Cột
    document.getElementById('btn-add-col').addEventListener('click', () => {
        headers.push(`Col_${headers.length + 1}`);
        rows.forEach(r => r.push(''));
        renderTable();
    });

    // Chuyển đổi Output Format Tabs
    const formatTabs = document.querySelectorAll('#target-format-tabs .target-btn');
    formatTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            formatTabs.forEach(b => {
                b.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                b.classList.add('text-zinc-500');
            });
            btn.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            btn.classList.remove('text-zinc-500');

            currentFormat = btn.dataset.format;
            convertTableData(currentFormat);
        });
    });

    // Copy Output
    document.getElementById('btn-copy-output').addEventListener('click', async () => {
        const text = outputResultBox.value;
        if (!text) {
            UI.showAlert('Thông báo', 'Không có nội dung để sao chép.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            UI.showAlert('Đã sao chép', `Nội dung định dạng ${currentFormat.toUpperCase()} đã lưu vào Clipboard.`, 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể sao chép dữ liệu.', 'error');
        }
    });

    // Tải File về máy
    document.getElementById('btn-download-file').addEventListener('click', () => {
        const text = outputResultBox.value;
        if (!text) {
            UI.showAlert('Thông báo', 'Dữ liệu trống, không thể tải về.', 'info');
            return;
        }

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

        UI.showAlert('Tải thành công', `Đã tải xuống file .${extensions[currentFormat]}`, 'success');
    });

    // Nạp dữ liệu mẫu
    document.getElementById('btn-load-sample').addEventListener('click', () => {
        headers = ['ID', 'Tên sản phẩm', 'Danh mục', 'Giá bán (VNĐ)', 'Số lượng'];
        rows = [
            ['SP001', 'MacBook Pro M3 Max', 'Laptop', '79990000', '15'],
            ['SP002', 'iPhone 15 Pro Max', 'Điện thoại', '34990000', '42'],
            ['SP003', 'iPad Pro M2 11 inch', 'Tablet', '21500000', '28'],
            ['SP004', 'AirPods Pro 2 USB-C', 'Phụ kiện', '5890000', '100'],
            ['SP005', 'Apple Watch Ultra 2', 'Smartwatch', '20990000', '18']
        ];
        renderTable();
        UI.showAlert('Đã nạp mẫu', 'Dữ liệu bảng mẫu đã được khôi phục.', 'info');
    });

    // Xóa toàn bộ dữ liệu
    document.getElementById('btn-clear-all').addEventListener('click', () => {
        UI.showConfirm(
            'Xóa bảng dữ liệu?',
            'Toàn bộ các hàng và cột hiện tại sẽ bị xóa sạch. Bạn có chắc chắn muốn tiếp tục không?',
            () => {
                headers = ['Cột 1', 'Cột 2'];
                rows = [['', '']];
                rawInputTextarea.value = '';
                renderTable();
                UI.showAlert('Đã xóa', 'Bảng đã được làm mới hoàn toàn.', 'success');
            }
        );
    });

    // ----------------------------------------------------
    // KHỞI CHẠY LẦN ĐẦU
    // ----------------------------------------------------
    renderTable();
    console.log("Excel to File & Table Editor Loaded Successfully!");
}