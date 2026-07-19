import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">JSON Studio</h2>
                    <p class="text-sm text-zinc-500 mt-1">Quản lý, chỉnh sửa trực tiếp dạng cây và chuyển đổi JSON.</p>
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
                
                <!-- CỘT TRÁI: INPUT & ACTIONS -->
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col p-5 space-y-4">
                    
                    <div class="flex justify-between items-center px-1">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Chuỗi JSON</label>
                        <button id="btn-jf-paste" class="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Dán Clipboard</button>
                    </div>

                    <div class="relative flex-1 min-h-[300px] lg:min-h-[500px]">
                        <textarea id="jf-input" class="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px] font-mono text-zinc-900 dark:text-zinc-300 resize-none custom-scrollbar" placeholder='Dán mã JSON của bạn vào đây...

Ví dụ:
{
  "name": "Dev",
  "skills": ["JS", "Tailwind"]
}' spellcheck="false"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2">
                        <button class="jf-action-btn active px-3 py-2.5 text-[11px] font-bold rounded-xl border border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-2" data-action="beautify-2">
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

                <!-- CỘT PHẢI: KẾT QUẢ & VIEWERS -->
                <div class="lg:col-span-7 flex flex-col h-[600px] lg:h-full">
                    
                    <div class="premium-card bg-[#0d1117] dark:bg-zinc-950 rounded-[28px] shadow-xl overflow-hidden flex flex-col h-full border border-zinc-800/50">
                        
                        <!-- Header & Tabs -->
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-[#161b22] dark:bg-zinc-900 border-b border-white/10 gap-3">
                            <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                                <button class="jf-tab-btn active px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-[12px] font-bold transition-all whitespace-nowrap" data-view="code">
                                    <i class="fas fa-code mr-1"></i> Code
                                </button>
                                <button class="jf-tab-btn px-3 py-1.5 rounded-lg bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-[12px] font-bold transition-all whitespace-nowrap" data-view="tree">
                                    <i class="fas fa-stream mr-1"></i> Tree View (Sửa trực tiếp)
                                </button>
                                <button class="jf-tab-btn px-3 py-1.5 rounded-lg bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-[12px] font-bold transition-all whitespace-nowrap" data-view="js">
                                    <i class="fab fa-js mr-1"></i> to JS
                                </button>
                                <button class="jf-tab-btn px-3 py-1.5 rounded-lg bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-[12px] font-bold transition-all whitespace-nowrap" data-view="xml">
                                    <i class="fas fa-file-code mr-1"></i> to XML
                                </button>
                            </div>
                            
                            <div class="flex gap-2 shrink-0">
                                <button id="btn-jf-copy" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="far fa-copy"></i> Copy
                                </button>
                                <button id="btn-jf-download" class="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                                    <i class="fas fa-download"></i> Save
                                </button>
                            </div>
                        </div>

                        <!-- Render Area -->
                        <div class="flex-1 overflow-auto p-5 custom-scrollbar relative bg-[#0d1117]" id="jf-render-area">
                            <pre><code id="jf-output" class="text-[13px] font-mono leading-relaxed text-[#c9d1d9] break-all block"></code></pre>
                            <div id="jf-tree-output" class="hidden text-[13px] font-mono text-[#c9d1d9]"></div>
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
            /* Colors cho Code Highlight */
            .jh-key { color: #79c0ff; font-weight: 600; }
            .jh-string { color: #a5d6ff; }
            .jh-number { color: #ff7b72; }
            .jh-boolean { color: #d2a8ff; font-weight: 600; }
            .jh-null { color: #8b949e; font-style: italic; }

            /* Styles cho Tree Viewer */
            .tree-node details > summary { list-style: none; cursor: pointer; user-select: none; margin-left: -14px; padding-left: 14px; }
            .tree-node details > summary::-webkit-details-marker { display: none; }
            .tree-node details > summary::before {
                content: '▶'; font-size: 8px; display: inline-block;
                margin-left: -14px; width: 14px;
                transition: transform 0.2s ease; color: #8b949e; transform: translateY(-1px);
            }
            .tree-node details[open] > summary::before { transform: rotate(90deg) translateY(-1px); }
            .tree-node .tree-children { margin-left: 6px; padding-left: 12px; border-left: 1px dashed #30363d; }
            
            .tree-node .tree-key { color: #79c0ff; font-weight: 600; }
            .tree-node .tree-value-string { color: #a5d6ff; }
            .tree-node .tree-value-number { color: #ff7b72; }
            .tree-node .tree-value-boolean { color: #d2a8ff; font-weight: 600; }
            .tree-node .tree-value-null { color: #8b949e; font-style: italic; }
            .tree-node .tree-bracket { color: #8b949e; }

            /* Styles cho Editable Elements */
            [contenteditable="true"] {
                outline: none;
                cursor: text;
                border-radius: 4px;
                padding: 0 4px;
                margin: 0 -4px;
                transition: all 0.2s;
            }
            [contenteditable="true"]:hover { background-color: rgba(255,255,255,0.08); }
            [contenteditable="true"]:focus {
                background-color: rgba(255,255,255,0.15);
                box-shadow: 0 0 0 1px rgba(121, 192, 255, 0.3);
            }
        </style>
    `;
}

export function init() {
    let state = {
        action: 'beautify-2',
        view: 'code',
        rawInput: '',
        outputStr: '',
        parsedData: null,
        isValid: false,
        isEditingTree: false // Cờ tránh cập nhật vòng lặp
    };

    const inputArea = document.getElementById('jf-input');
    const outputArea = document.getElementById('jf-output');
    const treeArea = document.getElementById('jf-tree-output');
    const actionBtns = document.querySelectorAll('.jf-action-btn');
    const tabBtns = document.querySelectorAll('.jf-tab-btn');
    
    const btnPaste = document.getElementById('btn-jf-paste');
    const btnClear = document.getElementById('btn-jf-clear');
    const btnCopy = document.getElementById('btn-jf-copy');
    const btnDownload = document.getElementById('btn-jf-download');
    const fileUpload = document.getElementById('jf-file-upload');
    const btnUpload = document.getElementById('btn-jf-upload');

    const statusBar = document.getElementById('jf-status-bar');
    const statusMsg = document.getElementById('jf-status-msg');
    const statusSize = document.getElementById('jf-status-size');

    // --- UTILS ---
    const sortJSON = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sortJSON);
        return Object.keys(obj).sort().reduce((result, key) => {
            result[key] = sortJSON(obj[key]);
            return result;
        }, {});
    };

    const syntaxHighlight = (jsonStr) => {
        let json = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'jh-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) { cls = 'jh-key'; } 
                else { cls = 'jh-string'; }
            } else if (/true|false/.test(match)) { cls = 'jh-boolean'; } 
            else if (/null/.test(match)) { cls = 'jh-null'; }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper: Deep Update Object Value
    const updateDeepValue = (obj, path, value) => {
        if (path.length === 0) return;
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    };

    // Helper: Deep Rename Object Key
    const renameDeepKey = (obj, path, oldKey, newKey) => {
        let target = path.length === 0 ? obj : path.reduce((acc, key) => acc[key], obj);
        if (target && target.hasOwnProperty(oldKey)) {
            // Tạo object mới để giữ nguyên vị trí (sơ bộ)
            const newObj = {};
            for (let k in target) {
                if (k === oldKey) newObj[newKey] = target[oldKey];
                else newObj[k] = target[k];
            }
            // Xóa key cũ, gán lại key mới
            for (let k in target) delete target[k];
            for (let k in newObj) target[k] = newObj[k];
        }
    };

    // --- RENDER & CONVERTERS ---
    const renderTree = (data, path = [], isLast = true) => {
        let safePath = JSON.stringify(path).replace(/"/g, '&quot;');
        
        if (typeof data !== 'object' || data === null) {
            let type = typeof data;
            let valClass = type === 'string' ? 'tree-value-string' : 
                           type === 'number' ? 'tree-value-number' : 
                           type === 'boolean' ? 'tree-value-boolean' : 'tree-value-null';
            let valStr = data === null ? 'null' : String(data);
            let safeVal = valStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            let html = '';
            if (type === 'string') {
                html = `<span class="tree-bracket">"</span><span class="${valClass} editable-value" contenteditable="true" spellcheck="false" data-path="${safePath}" data-type="string">${safeVal}</span><span class="tree-bracket">"</span>`;
            } else {
                html = `<span class="${valClass} editable-value" contenteditable="true" spellcheck="false" data-path="${safePath}" data-type="${data === null ? 'null' : type}">${safeVal}</span>`;
            }
            return html + (isLast ? '' : '<span class="tree-bracket">,</span>');
        }

        const isArray = Array.isArray(data);
        const openBracket = isArray ? '[' : '{';
        const closeBracket = isArray ? ']' : '}';
        const keys = Object.keys(data);
        
        if (keys.length === 0) return `<span class="tree-bracket">${openBracket}${closeBracket}</span>${isLast ? '' : '<span class="tree-bracket">,</span>'}`;

        let html = `<div class="tree-node"><details open><summary><span class="tree-bracket">${openBracket}</span> <span class="text-xs text-zinc-500 italic hover:text-zinc-400 transition-colors">${keys.length} items</span></summary><div class="tree-children">`;
        
        keys.forEach((key, index) => {
            const isLastItem = index === keys.length - 1;
            const currentPath = [...path, key];
            html += `<div class="py-[2px]">`;
            
            if (!isArray) {
                let safeKey = key.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += `<span class="tree-bracket">"</span><span class="tree-key editable-key" contenteditable="true" spellcheck="false" data-path="${safePath}" data-old-key="${safeKey}">${safeKey}</span><span class="tree-bracket">"</span><span class="tree-bracket"> : </span>`;
            }
            
            html += renderTree(data[key], currentPath, isLastItem);
            html += `</div>`;
        });

        html += `</div></details><span class="tree-bracket">${closeBracket}</span>${isLast ? '' : '<span class="tree-bracket">,</span>'}</div>`;
        return html;
    };

    const convertToJS = (jsonObj) => {
        let jsonStr = JSON.stringify(jsonObj, null, 4);
        let jsStr = jsonStr.replace(/"([^(")"]+)":/g, "$1:"); 
        return `const data = ${jsStr};`;
    };

    const convertToXML = (obj, rootName = 'root') => {
        let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<${rootName}>\n`;
        const buildXML = (data, indent) => {
            let str = '';
            for (let prop in data) {
                let val = data[prop];
                let tag = isNaN(prop) ? prop : 'item';
                if (Array.isArray(val)) {
                    val.forEach(item => { str += `${indent}<${tag}>\n${buildXML(item, indent + '  ')}${indent}</${tag}>\n`; });
                } else if (typeof val === 'object' && val !== null) {
                    str += `${indent}<${tag}>\n${buildXML(val, indent + '  ')}${indent}</${tag}>\n`;
                } else {
                    str += `${indent}<${tag}>${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>\n`;
                }
            }
            return str;
        };
        xml += buildXML(obj, '  ');
        xml += `</${rootName}>`;
        return xml;
    };

    // --- MAIN LOGIC ---
    const updateRenderView = (restoreTree = false) => {
        if (!state.isValid) return;

        outputArea.classList.add('hidden');
        treeArea.classList.add('hidden');

        // Lưu trạng thái đóng mở của Tree nếu được yêu cầu
        let openStates = [];
        if (restoreTree && state.view === 'tree') {
            const details = treeArea.querySelectorAll('details');
            details.forEach(d => openStates.push(d.open));
        }

        if (state.view === 'code') {
            outputArea.classList.remove('hidden');
            let space = state.action === 'beautify-4' ? 4 : (state.action === 'minify' ? 0 : 2);
            state.outputStr = JSON.stringify(state.parsedData, null, space);
            outputArea.innerHTML = syntaxHighlight(state.outputStr);
        } 
        else if (state.view === 'tree') {
            treeArea.classList.remove('hidden');
            state.outputStr = JSON.stringify(state.parsedData, null, 2);
            treeArea.innerHTML = renderTree(state.parsedData);
            
            // Phục hồi trạng thái đóng mở của thẻ details
            if (restoreTree) {
                const newDetails = treeArea.querySelectorAll('details');
                newDetails.forEach((d, i) => { if (openStates[i] !== undefined) d.open = openStates[i]; });
            }
        }
        else if (state.view === 'js') {
            outputArea.classList.remove('hidden');
            state.outputStr = convertToJS(state.parsedData);
            outputArea.innerHTML = syntaxHighlight(state.outputStr);
        }
        else if (state.view === 'xml') {
            outputArea.classList.remove('hidden');
            state.outputStr = convertToXML(state.parsedData);
            outputArea.innerHTML = `<span class="jh-string">${state.outputStr.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        }

        const bytes = new Blob([state.outputStr]).size;
        statusSize.textContent = formatBytes(bytes);
    };

    const processJSON = () => {
        if (state.isEditingTree) return; // Không process lại nếu đang gõ trên tree
        
        state.rawInput = inputArea.value.trim();
        
        if (!state.rawInput) {
            outputArea.innerHTML = ''; treeArea.innerHTML = '';
            outputArea.classList.remove('hidden'); treeArea.classList.add('hidden');
            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-zinc-500 flex justify-between border-t border-white/5 transition-colors duration-300 bg-[#161b22] dark:bg-zinc-900';
            statusMsg.innerHTML = '<i class="fas fa-info-circle"></i> Đang chờ dữ liệu...';
            statusSize.textContent = '0 Bytes';
            state.outputStr = ''; state.parsedData = null; state.isValid = false;
            return;
        }

        try {
            state.parsedData = JSON.parse(state.rawInput);
            state.isValid = true;

            if (state.action === 'sort') state.parsedData = sortJSON(state.parsedData);

            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-white flex justify-between border-t border-white/5 transition-colors duration-300 bg-emerald-600/20';
            statusMsg.innerHTML = '<i class="fas fa-check-circle text-emerald-500"></i> Dữ liệu Hợp lệ';
            
            updateRenderView();
        } catch (error) {
            state.isValid = false; state.parsedData = null; state.outputStr = state.rawInput;
            
            outputArea.classList.remove('hidden'); treeArea.classList.add('hidden');
            outputArea.innerHTML = `<span class="text-rose-400">${state.rawInput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
            
            statusBar.className = 'px-5 py-2 text-[11px] font-mono text-white flex justify-between border-t border-white/5 transition-colors duration-300 bg-rose-600/20';
            statusMsg.innerHTML = `<i class="fas fa-exclamation-triangle text-rose-500"></i> Lỗi cú pháp: ${error.message}`;
            statusSize.textContent = 'ERROR';
        }
    };

    // --- TREE INLINE EDITOR EVENTS ---
    
    // Ngăn paste HTML, chỉ nhận text thuần
    treeArea.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    // Enter để kết thúc edit
    treeArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur(); 
        }
    });

    // Xử lý lưu khi mất Focus (Blur)
    treeArea.addEventListener('focusout', (e) => {
        if (!state.isValid) return;

        const isValue = e.target.classList.contains('editable-value');
        const isKey = e.target.classList.contains('editable-key');
        if (!isValue && !isKey) return;

        const path = JSON.parse(e.target.dataset.path || '[]');
        const text = e.target.textContent;
        let needsReRender = false;

        if (isValue) {
            const type = e.target.dataset.type;
            let finalValue = text;
            
            if (type === 'number') {
                finalValue = Number(text);
                if (isNaN(finalValue)) return UI.showAlert('Lỗi', 'Giá trị phải là số hợp lệ.', 'error');
            } else if (type === 'boolean') {
                if (text === 'true') finalValue = true;
                else if (text === 'false') finalValue = false;
                else return UI.showAlert('Lỗi', 'Giá trị boolean phải là true hoặc false.', 'error');
            } else if (type === 'null') {
                if (text === 'null') finalValue = null;
                else return UI.showAlert('Lỗi', 'Giá trị phải là null.', 'error');
            }
            updateDeepValue(state.parsedData, path, finalValue);
            
        } else if (isKey) {
            const oldKey = e.target.dataset.oldKey;
            const newKey = text.trim();
            
            if (newKey === '') {
                e.target.textContent = oldKey; // Revert visually
                return UI.showAlert('Lỗi', 'Key không được để trống.', 'error');
            }
            if (oldKey !== newKey) {
                // Kiểm tra trùng lặp
                let targetObj = path.length === 0 ? state.parsedData : path.reduce((acc, k) => acc[k], state.parsedData);
                if (targetObj.hasOwnProperty(newKey)) {
                    e.target.textContent = oldKey; // Revert visually
                    return UI.showAlert('Lỗi', 'Key này đã tồn tại trong Object.', 'error');
                }
                renameDeepKey(state.parsedData, path, oldKey, newKey);
                needsReRender = true; // Cần vẽ lại cây để cập nhật lại data-path cho con cháu
            }
        }

        // Đồng bộ ngược lại Textarea
        state.isEditingTree = true; // Chặn event vòng lặp từ Textarea
        let space = state.action === 'beautify-4' ? 4 : (state.action === 'minify' ? 0 : 2);
        inputArea.value = JSON.stringify(state.parsedData, null, space);
        state.isEditingTree = false;

        // Nếu sửa Key, cần vẽ lại cây nhưng giữ nguyên trạng thái đóng mở
        if (needsReRender) {
            updateRenderView(true);
        }
    });


    // --- NORMAL EVENT LISTENERS ---
    inputArea.addEventListener('input', processJSON);

    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            actionBtns.forEach(b => {
                b.classList.remove('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
                b.classList.add('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            });
            btn.classList.remove('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-500');
            btn.classList.add('active', 'border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
            
            state.action = btn.dataset.action;
            if(state.view !== 'code') {
                document.querySelector('.jf-tab-btn[data-view="code"]').click();
            } else {
                processJSON();
            }
        });
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'bg-zinc-800', 'text-white');
                b.classList.add('bg-transparent', 'text-zinc-400');
            });
            btn.classList.remove('bg-transparent', 'text-zinc-400');
            btn.classList.add('active', 'bg-zinc-800', 'text-white');
            
            state.view = btn.dataset.view;
            updateRenderView();
        });
    });

    btnClear.onclick = () => { inputArea.value = ''; processJSON(); };
    btnPaste.onclick = async () => {
        try { inputArea.value = await navigator.clipboard.readText(); processJSON(); } 
        catch (e) { UI.showAlert('Lỗi', 'Bấm Ctrl+V để dán.', 'error'); }
    };
    btnCopy.onclick = async () => {
        if (!state.outputStr) return;
        try { await navigator.clipboard.writeText(state.outputStr); UI.showAlert('Thành công', 'Đã copy vào bộ nhớ đệm.', 'success'); } 
        catch (e) { UI.showAlert('Lỗi', 'Không thể copy.', 'error'); }
    };
    btnDownload.onclick = () => {
        if (!state.outputStr || !state.isValid) return UI.showAlert('Cảnh báo', 'Cần JSON hợp lệ để tải xuống.', 'warning');
        const ext = state.view === 'js' ? 'js' : state.view === 'xml' ? 'xml' : 'json';
        const blob = new Blob([state.outputStr], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `data_${state.view}.${ext}`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    btnUpload.onclick = () => fileUpload.click();
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => { inputArea.value = event.target.result; processJSON(); };
        reader.readAsText(file);
        e.target.value = '';
    });

    processJSON();
}