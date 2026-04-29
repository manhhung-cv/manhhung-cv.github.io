import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-end mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">JSON Formatter</h2>
                    <p class="text-sm text-zinc-500 mt-1">Làm đẹp, nén, xác thực và sắp xếp dữ liệu JSON chuẩn IDE.</p>
                </div>
                <div class="flex gap-2">
                    <input type="file" id="jf-file-upload" class="hidden" accept=".json, application/json">
                    <button id="btn-jf-upload" class="h-10 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm active:scale-95">
                        <i class="fas fa-folder-open"></i> <span class="hidden sm:inline">Mở File</span>
                    </button>
                    <button id="btn-jf-clear" class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center shadow-sm active:scale-95" title="Xóa tất cả">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col p-5 space-y-4">
                    
                    <div class="flex justify-between items-center px-1">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Chuỗi JSON Đầu Vào</label>
                        <button id="btn-jf-paste" class="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Dán từ Clipboard</button>
                    </div>

                    <div class="relative flex-1 min-h-[300px] lg:min-h-[450px]">
                        <textarea id="jf-input" class="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px] font-mono text-zinc-900 dark:text-zinc-300 resize-none custom-scrollbar" placeholder='Dán mã JSON của bạn vào đây...\n\nVí dụ:\n{"name": "Hùng", "job": "Engineer", "active": true}' spellcheck="false"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2">
                        <button class="jf-action-btn active px-3 py-2.5 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center gap-2" data-action="beautify-2">
                            <i class="fas fa-indent"></i> Format (2 spaces)
                        </button>
                        <button class="jf-action-btn px-3 py-2.5 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center gap-2" data-action="beautify-4">
                            <i class="fas fa-align-left"></i> Format (4 spaces)
                        </button>
                        <button class="jf-action-btn px-3 py-2.5 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center gap-2" data-action="minify">
                            <i class="fas fa-compress-alt"></i> Minify (Nén)
                        </button>
                        <button class="jf-action-btn px-3 py-2.5 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center gap-2" data-action="sort">
                            <i class="fas fa-sort-alpha-down"></i> Sắp xếp Keys
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-7 flex flex-col h-[500px] lg:h-full">
                    
                    <div class="premium-card bg-[#0d1117] dark:bg-zinc-950 rounded-[28px] shadow-xl overflow-hidden flex flex-col h-full border border-zinc-800/50">
                        
                        <div class="flex justify-between items-center px-5 py-3.5 bg-[#161b22] dark:bg-zinc-900 border-b border-white/10">
                            <div class="flex items-center gap-3">
                                <div class="flex gap-1.5">
                                    <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <span class="text-xs font-mono text-zinc-400 ml-2">result.json</span>
                            </div>
                            
                            <div class="flex gap-2">
                                <button id="btn-jf-copy" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="far fa-copy"></i> Copy
                                </button>
                                <button id="btn-jf-download" class="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="fas fa-download"></i> Save
                                </button>
                            </div>
                        </div>

                        <div class="flex-1 overflow-auto p-5 custom-scrollbar relative bg-[#0d1117]">
                            <pre><code id="jf-output" class="text-[13px] font-mono leading-relaxed text-[#c9d1d9] break-all"></code></pre>
                        </div>
                        
                        <div id="jf-status-bar" class="px-5 py-2 text-[11px] font-mono text-zinc-500 flex justify-between border-t border-white/5 transition-colors duration-300 bg-[#161b22] dark:bg-zinc-900">
                            <span id="jf-status-msg" class="flex items-center gap-2"><i class="fas fa-info-circle"></i> Đang chờ dữ liệu...</span>
                            <span id="jf-status-size">0 Bytes</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
        
        <style>
            /* Colors cho Syntax Highlight (GitHub Dark Theme) */
            .jh-key { color: #79c0ff; font-weight: 600; }
            .jh-string { color: #a5d6ff; }
            .jh-number { color: #ff7b72; }
            .jh-boolean { color: #d2a8ff; font-weight: 600; }
            .jh-null { color: #8b949e; font-style: italic; }
        </style>
    `;
}

export function init() {
    // --- STATE ---
    let state = {
        action: 'beautify-2', // beautify-2, beautify-4, minify, sort
        rawInput: '',
        outputStr: '',
        isValid: true
    };

    // --- DOM Elements ---
    const inputArea = document.getElementById('jf-input');
    const outputArea = document.getElementById('jf-output');
    const actionBtns = document.querySelectorAll('.jf-action-btn');
    
    const btnPaste = document.getElementById('btn-jf-paste');
    const btnClear = document.getElementById('btn-jf-clear');
    const btnCopy = document.getElementById('btn-jf-copy');
    const btnDownload = document.getElementById('btn-jf-download');
    
    const fileUpload = document.getElementById('jf-file-upload');
    const btnUpload = document.getElementById('btn-jf-upload');

    const statusBar = document.getElementById('jf-status-bar');
    const statusMsg = document.getElementById('jf-status-msg');
    const statusSize = document.getElementById('jf-status-size');

    // --- LOGIC XỬ LÝ JSON ---
    // Hàm sắp xếp Object Key theo bảng chữ cái đệ quy
    const sortJSON = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sortJSON);
        
        return Object.keys(obj).sort().reduce((result, key) => {
            result[key] = sortJSON(obj[key]);
            return result;
        }, {});
    };

    // Thuật toán Syntax Highlight cực nhẹ
    const syntaxHighlight = (jsonStr) => {
        let json = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'jh-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'jh-key'; // Là Key
                } else {
                    cls = 'jh-string'; // Là String Value
                }
            } else if (/true|false/.test(match)) {
                cls = 'jh-boolean';
            } else if (/null/.test(match)) {
                cls = 'jh-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processJSON = () => {
        state.rawInput = inputArea.value.trim();
        
        if (!state.rawInput) {
            outputArea.innerHTML = '';
            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-zinc-500 flex justify-between border-t border-white/5 transition-colors duration-300 bg-[#161b22] dark:bg-zinc-900';
            statusMsg.innerHTML = '<i class="fas fa-info-circle"></i> Đang chờ dữ liệu...';
            statusSize.textContent = '0 Bytes';
            state.outputStr = '';
            state.isValid = false;
            return;
        }

        try {
            // Cố gắng Parse JSON
            let parsed = JSON.parse(state.rawInput);
            state.isValid = true;

            // Áp dụng hành động
            if (state.action === 'sort') {
                parsed = sortJSON(parsed);
            }

            // Sinh chuỗi kết quả
            let space = state.action === 'beautify-4' ? 4 : (state.action === 'minify' ? 0 : 2);
            state.outputStr = JSON.stringify(parsed, null, space);

            // Highlight & Trình bày
            outputArea.innerHTML = syntaxHighlight(state.outputStr);

            // Cập nhật Status Bar (Xanh lá - Hợp lệ)
            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-white flex justify-between border-t border-white/5 transition-colors duration-300 bg-emerald-600/20';
            statusMsg.innerHTML = '<i class="fas fa-check-circle text-emerald-500"></i> JSON Hợp lệ';
            
            const bytes = new Blob([state.outputStr]).size;
            statusSize.textContent = formatBytes(bytes);

        } catch (error) {
            state.isValid = false;
            state.outputStr = state.rawInput;
            
            // Xử lý báo lỗi
            outputArea.innerHTML = `<span class="text-rose-400">${state.rawInput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
            
            // Cập nhật Status Bar (Đỏ - Lỗi)
            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-white flex justify-between border-t border-white/5 transition-colors duration-300 bg-rose-600/20';
            statusMsg.innerHTML = `<i class="fas fa-exclamation-triangle text-rose-500"></i> Lỗi cú pháp: ${error.message}`;
            statusSize.textContent = 'ERROR';
        }
    };

    // --- EVENT LISTENERS ---
    inputArea.addEventListener('input', processJSON);

    // Chuyển đổi Hành động (Action Tabs)
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            actionBtns.forEach(b => {
                b.classList.remove('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
                b.classList.add('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            });
            
            btn.classList.remove('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            btn.classList.add('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
            
            state.action = btn.dataset.action;
            processJSON();
        });
    });

    // Các nút chức năng phụ
    btnClear.onclick = () => {
        inputArea.value = '';
        processJSON();
    };

    btnPaste.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            inputArea.value = text;
            processJSON();
        } catch (e) {
            UI.showAlert('Lỗi', 'Trình duyệt từ chối quyền dán tự động. Vui lòng bấm Ctrl+V.', 'error');
        }
    };

    btnCopy.onclick = async () => {
        if (!state.outputStr) return;
        try {
            await navigator.clipboard.writeText(state.outputStr);
            UI.showAlert('Đã chép', 'Dữ liệu JSON đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể copy.', 'error');
        }
    };

    btnDownload.onclick = () => {
        if (!state.outputStr || !state.isValid) {
            return UI.showAlert('Cảnh báo', 'Vui lòng cung cấp chuỗi JSON hợp lệ trước khi tải.', 'warning');
        }
        const blob = new Blob([state.outputStr], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const nameType = state.action === 'minify' ? 'min' : 'formatted';
        link.download = `data_${nameType}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // Đọc file JSON từ máy
    btnUpload.onclick = () => fileUpload.click();
    
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            inputArea.value = event.target.result;
            processJSON();
        };
        reader.readAsText(file);
        // Reset input để có thể up lại file trùng tên
        e.target.value = '';
    });

    // Khởi chạy lần đầu (nếu có cache hoặc placeholder)
    processJSON();
}