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
    <div id="json-studio-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #json-studio-root {
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

            /* Syntax Highlighting */
            .jh-key { color: #79c0ff; font-weight: 600; }
            .jh-string { color: #a5d6ff; }
            .jh-number { color: #ff7b72; }
            .jh-boolean { color: #d2a8ff; font-weight: 600; }
            .jh-null { color: #8b949e; font-style: italic; }

            /* Tree Viewer Details */
            .tree-node details > summary { list-style: none; cursor: pointer; user-select: none; margin-left: -14px; padding-left: 14px; }
            .tree-node details > summary::-webkit-details-marker { display: none; }
            .tree-node details > summary::before {
                content: '▶'; font-size: 8px; display: inline-block;
                margin-left: -14px; width: 14px;
                transition: transform 0.2s ease; color: #8b949e; transform: translateY(-1px);
            }
            .tree-node details[open] > summary::before { transform: rotate(90deg) translateY(-1px); }
            .tree-node .tree-children { margin-left: 6px; padding-left: 12px; border-left: 1px dashed rgba(255, 255, 255, 0.12); }
            
            .tree-node .tree-key { color: #79c0ff; font-weight: 600; }
            .tree-node .tree-value-string { color: #a5d6ff; }
            .tree-node .tree-value-number { color: #ff7b72; }
            .tree-node .tree-value-boolean { color: #d2a8ff; font-weight: 600; }
            .tree-node .tree-value-null { color: #8b949e; font-style: italic; }
            .tree-node .tree-bracket { color: #8b949e; }

            /* Editable in Tree */
            [contenteditable="true"] {
                outline: none;
                cursor: text;
                border-radius: 4px;
                padding: 0 4px;
                margin: 0 -4px;
                transition: all 0.15s ease;
            }
            [contenteditable="true"]:hover { background-color: rgba(255, 255, 255, 0.08); }
            [contenteditable="true"]:focus {
                background-color: rgba(255, 255, 255, 0.14);
                box-shadow: 0 0 0 1px var(--kit-accent);
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Dev Suite</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">JSON Studio</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Định dạng, kiểm tra cú pháp, chỉnh sửa trực tiếp dạng cây và chuyển đổi JSON.</p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <input type="file" id="jf-file-upload" class="hidden" accept=".json, application/json, text/plain">
                    <button id="btn-jf-upload" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="far fa-folder-open text-[11px]"></i> Mở tệp
                    </button>
                    <button id="btn-jf-clear" class="w-10 h-10 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Xóa nội dung">
                        <i class="far fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: VÙNG NHẬP LIỆU & THAO TÁC ĐỊNH DẠNG (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex justify-between items-center">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Chuỗi JSON nguồn</h3>
                            <button id="btn-jf-paste" class="text-[10px] font-bold text-accent-theme hover:underline uppercase tracking-wider">Dán Clipboard</button>
                        </div>

                        <div class="relative flex-1 min-h-[320px] lg:min-h-[460px]">
                            <textarea id="jf-input" class="absolute inset-0 w-full h-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 outline-none focus:border-accent-theme transition-all text-xs font-mono text-zinc-900 dark:text-zinc-200 resize-none placeholder-zinc-400 leading-relaxed" placeholder='Dán mã JSON vào đây...

{
  "project": "HunqOS",
  "status": "ready",
  "modules": ["IslandKit", "ThemeKit"]
}' spellcheck="false"></textarea>
                        </div>
                    </div>

                    <!-- LƯỚI NÚT FORMAT NHANH -->
                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button class="jf-action-btn active h-10 px-2 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5" data-action="beautify-2">
                            <i class="fas fa-indent text-[10px] text-accent-theme"></i> Format (2 spaces)
                        </button>
                        <button class="jf-action-btn h-10 px-2 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-action="beautify-4">
                            <i class="fas fa-align-left text-[10px]"></i> Format (4 spaces)
                        </button>
                        <button class="jf-action-btn h-10 px-2 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-action="minify">
                            <i class="fas fa-compress text-[10px]"></i> Minify (Nén)
                        </button>
                        <button class="jf-action-btn h-10 px-2 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-action="sort">
                            <i class="fas fa-arrow-down-a-z text-[10px]"></i> Sắp xếp Keys
                        </button>
                    </div>
                </div>

                <!-- CỘT PHẢI: TRÌNH HIỂN THỊ, TREE & CHUYỂN ĐỔI (7 COLS) -->
                <div class="lg:col-span-7 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col h-[520px] lg:h-[620px] overflow-hidden">
                    
                    <!-- TOP BAR: SEGMENTED TABS & ACTIONS -->
                    <div class="p-3 sm:p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 bg-white dark:bg-[#161618]">
                        
                        <!-- SEGMENTED TABS CHUYỂN VIEW -->
                        <div class="grid grid-cols-4 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-auto" id="jf-view-tabs">
                            <button class="jf-tab-btn active py-1.5 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all whitespace-nowrap text-center" data-view="code">
                                <i class="fas fa-code text-[10px] mr-1"></i> Code
                            </button>
                            <button class="jf-tab-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap text-center" data-view="tree">
                                <i class="fas fa-diagram-project text-[10px] mr-1"></i> Tree View
                            </button>
                            <button class="jf-tab-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap text-center" data-view="js">
                                <i class="fab fa-js text-[10px] mr-1"></i> to JS
                            </button>
                            <button class="jf-tab-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap text-center" data-view="xml">
                                <i class="fas fa-file-code text-[10px] mr-1"></i> to XML
                            </button>
                        </div>

                        <!-- COPY & SAVE -->
                        <div class="flex items-center gap-1.5 self-end sm:self-auto">
                            <button id="btn-jf-copy" class="h-8 px-2.5 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all">
                                <i class="far fa-copy text-[11px]"></i> Chép
                            </button>
                            <button id="btn-jf-download" class="h-8 px-2.5 rounded-[10px] bg-accent-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                <i class="fas fa-download text-[11px]"></i> Lưu
                            </button>
                        </div>
                    </div>

                    <!-- CODE / TREE RENDER AREA -->
                    <div class="flex-1 overflow-auto p-4 no-scrollbar bg-[#0d1117] selection:bg-accent-theme-alpha" id="jf-render-area">
                        <pre><code id="jf-output" class="text-xs font-mono leading-relaxed text-[#c9d1d9] break-all block"></code></pre>
                        <div id="jf-tree-output" class="hidden text-xs font-mono text-[#c9d1d9] space-y-1"></div>
                    </div>
                    
                    <!-- STATUS FOOTER -->
                    <div id="jf-status-bar" class="px-4 py-2 text-[10px] font-mono text-zinc-400 flex justify-between items-center border-t border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#161618] transition-colors duration-200">
                        <span id="jf-status-msg" class="flex items-center gap-1.5 truncate pr-2">
                            <i class="fas fa-circle-info text-[9px]"></i> Đang chờ dữ liệu...
                        </span>
                        <span id="jf-status-size" class="shrink-0 font-semibold">0 Bytes</span>
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
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#json-studio-root') || hostElement;

    // Khởi tạo ThemeKit[cite: 1]
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let state = {
        action: 'beautify-2',
        view: 'code',
        rawInput: '',
        outputStr: '',
        parsedData: null,
        isValid: false,
        isEditingTree: false
    };

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const inputArea = _('#jf-input');
    const outputArea = _('#jf-output');
    const treeArea = _('#jf-tree-output');
    const actionBtns = $$('.jf-action-btn');
    const tabBtns = $$('.jf-tab-btn');

    const btnPaste = _('#btn-jf-paste');
    const btnClear = _('#btn-jf-clear');
    const btnCopy = _('#btn-jf-copy');
    const btnDownload = _('#btn-jf-download');
    const fileUpload = _('#jf-file-upload');
    const btnUpload = _('#btn-jf-upload');

    const statusBar = _('#jf-status-bar');
    const statusMsg = _('#jf-status-msg');
    const statusSize = _('#jf-status-size');

    // --- UTILITIES ---
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

    const updateDeepValue = (obj, path, value) => {
        if (path.length === 0) return;
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    };

    const renameDeepKey = (obj, path, oldKey, newKey) => {
        let target = path.length === 0 ? obj : path.reduce((acc, key) => acc[key], obj);
        if (target && target.hasOwnProperty(oldKey)) {
            const newObj = {};
            for (let k in target) {
                if (k === oldKey) newObj[newKey] = target[oldKey];
                else newObj[k] = target[k];
            }
            for (let k in target) delete target[k];
            for (let k in newObj) target[k] = newObj[k];
        }
    };

    // --- RENDER TREE & CONVERTERS ---
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

        let html = `<div class="tree-node"><details open><summary><span class="tree-bracket">${openBracket}</span> <span class="text-[11px] text-zinc-500 italic hover:text-zinc-400 transition-colors">${keys.length} items</span></summary><div class="tree-children">`;
        
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
        let jsonStr = JSON.stringify(jsonObj, null, 2);
        let jsStr = jsonStr.replace(/"([^(")"]+)":/g, "$1:"); 
        return `export const data = ${jsStr};`;
    };

    const convertToXML = (obj, rootName = 'root') => {
        let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<${rootName}>\n`;
        const buildXML = (data, indent) => {
            let str = '';
            for (let prop in data) {
                let val = data[prop];
                let tag = isNaN(prop) ? prop.replace(/[^a-zA-Z0-9_]/g, '_') : 'item';
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

    const updateRenderView = (restoreTree = false) => {
        if (!state.isValid) return;

        outputArea?.classList.add('hidden');
        treeArea?.classList.add('hidden');

        let openStates = [];
        if (restoreTree && state.view === 'tree' && treeArea) {
            const details = treeArea.querySelectorAll('details');
            details.forEach(d => openStates.push(d.open));
        }

        if (state.view === 'code') {
            outputArea?.classList.remove('hidden');
            let space = state.action === 'beautify-4' ? 4 : (state.action === 'minify' ? 0 : 2);
            state.outputStr = JSON.stringify(state.parsedData, null, space);
            if (outputArea) outputArea.innerHTML = syntaxHighlight(state.outputStr);
        } 
        else if (state.view === 'tree') {
            treeArea?.classList.remove('hidden');
            state.outputStr = JSON.stringify(state.parsedData, null, 2);
            if (treeArea) treeArea.innerHTML = renderTree(state.parsedData);
            
            if (restoreTree && treeArea) {
                const newDetails = treeArea.querySelectorAll('details');
                newDetails.forEach((d, i) => { if (openStates[i] !== undefined) d.open = openStates[i]; });
            }
        }
        else if (state.view === 'js') {
            outputArea?.classList.remove('hidden');
            state.outputStr = convertToJS(state.parsedData);
            if (outputArea) outputArea.innerHTML = syntaxHighlight(state.outputStr);
        }
        else if (state.view === 'xml') {
            outputArea?.classList.remove('hidden');
            state.outputStr = convertToXML(state.parsedData);
            if (outputArea) outputArea.innerHTML = `<span class="jh-string">${state.outputStr.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        }

        const bytes = new Blob([state.outputStr]).size;
        if (statusSize) statusSize.textContent = formatBytes(bytes);
    };

    const processJSON = () => {
        if (state.isEditingTree) return;
        
        state.rawInput = inputArea?.value.trim() || '';
        
        if (!state.rawInput) {
            if (outputArea) outputArea.innerHTML = '';
            if (treeArea) treeArea.innerHTML = '';
            outputArea?.classList.remove('hidden');
            treeArea?.classList.add('hidden');

            if (statusBar) {
                statusBar.className = 'px-4 py-2 text-[10px] font-mono text-zinc-400 flex justify-between items-center border-t border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#161618] transition-colors duration-200';
            }
            if (statusMsg) statusMsg.innerHTML = '<i class="fas fa-circle-info text-[9px]"></i> Đang chờ dữ liệu...';
            if (statusSize) statusSize.textContent = '0 Bytes';
            state.outputStr = ''; 
            state.parsedData = null; 
            state.isValid = false;
            return;
        }

        try {
            state.parsedData = JSON.parse(state.rawInput);
            state.isValid = true;

            if (state.action === 'sort') state.parsedData = sortJSON(state.parsedData);

            if (statusBar) {
                statusBar.className = 'px-4 py-2 text-[10px] font-mono text-accent-theme flex justify-between items-center border-t border-black/[0.05] dark:border-white/[0.08] bg-accent-theme-alpha transition-colors duration-200';
            }
            if (statusMsg) statusMsg.innerHTML = '<i class="fas fa-circle-check text-[10px]"></i> Cú pháp hợp lệ';
            
            updateRenderView();
        } catch (error) {
            state.isValid = false; 
            state.parsedData = null; 
            state.outputStr = state.rawInput;
            
            outputArea?.classList.remove('hidden');
            treeArea?.classList.add('hidden');
            if (outputArea) outputArea.innerHTML = `<span class="text-rose-400 font-mono">${state.rawInput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
            
            if (statusBar) {
                statusBar.className = 'px-4 py-2 text-[10px] font-mono text-rose-500 flex justify-between items-center border-t border-black/[0.05] dark:border-white/[0.08] bg-rose-500/10 transition-colors duration-200';
            }
            if (statusMsg) statusMsg.innerHTML = `<i class="fas fa-triangle-exclamation text-[10px]"></i> Lỗi: ${error.message}`;
            if (statusSize) statusSize.textContent = 'ERROR';
        }
    };

    // --- TREE INLINE EDITING ---
    treeArea?.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    treeArea?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur(); 
        }
    });

    treeArea?.addEventListener('focusout', (e) => {
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
                if (isNaN(finalValue)) {
                    IslandKit.notify('Lỗi giá trị', 'Giá trị phải là số hợp lệ.', 'warning');
                    return;
                }
            } else if (type === 'boolean') {
                if (text === 'true') finalValue = true;
                else if (text === 'false') finalValue = false;
                else {
                    IslandKit.notify('Lỗi boolean', 'Giá trị chỉ nhận true hoặc false.', 'warning');
                    return;
                }
            } else if (type === 'null') {
                if (text === 'null') finalValue = null;
                else {
                    IslandKit.notify('Lỗi giá trị', 'Giá trị chỉ nhận null.', 'warning');
                    return;
                }
            }
            updateDeepValue(state.parsedData, path, finalValue);
            
        } else if (isKey) {
            const oldKey = e.target.dataset.oldKey;
            const newKey = text.trim();
            
            if (newKey === '') {
                e.target.textContent = oldKey;
                IslandKit.notify('Cảnh báo', 'Tên khóa không được để trống.', 'warning');
                return;
            }
            if (oldKey !== newKey) {
                let targetObj = path.length === 0 ? state.parsedData : path.reduce((acc, k) => acc[k], state.parsedData);
                if (targetObj.hasOwnProperty(newKey)) {
                    e.target.textContent = oldKey;
                    IslandKit.notify('Trùng lặp', 'Khóa này đã tồn tại trong Object.', 'warning');
                    return;
                }
                renameDeepKey(state.parsedData, path, oldKey, newKey);
                needsReRender = true;
            }
        }

        state.isEditingTree = true;
        let space = state.action === 'beautify-4' ? 4 : (state.action === 'minify' ? 0 : 2);
        if (inputArea) inputArea.value = JSON.stringify(state.parsedData, null, space);
        state.isEditingTree = false;

        if (needsReRender) {
            updateRenderView(true);
        }
    });

    // --- EVENT LISTENERS ---
    inputArea?.addEventListener('input', processJSON);

    // Format action buttons
    const activeActionClass = 'jf-action-btn active h-10 px-2 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveActionClass = 'jf-action-btn h-10 px-2 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            actionBtns.forEach(b => {
                b.className = inactiveActionClass;
                b.querySelector('i')?.classList.remove('text-accent-theme');
            });

            btn.className = activeActionClass;
            btn.querySelector('i')?.classList.add('text-accent-theme');
            
            state.action = btn.dataset.action;
            if (state.view !== 'code') {
                const codeTab = _('.jf-tab-btn[data-view="code"]');
                codeTab?.click();
            } else {
                processJSON();
            }
        });
    });

    // Segmented Tabs chuyển đổi View (Code / Tree / JS / XML)
    const activeTabClass = 'jf-tab-btn active py-1.5 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all whitespace-nowrap text-center';
    const inactiveTabClass = 'jf-tab-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap text-center';

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.className = inactiveTabClass);
            btn.className = activeTabClass;
            
            state.view = btn.dataset.view;
            updateRenderView();
        });
    });

    // Actions
    btnClear?.addEventListener('click', () => {
        if (inputArea) inputArea.value = '';
        processJSON();
        IslandKit.notify('Đã dọn dẹp', 'Đã xóa toàn bộ dữ liệu JSON.', 'info');
    });

    btnPaste?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (inputArea) inputArea.value = text;
            processJSON();
            IslandKit.notify('Đã dán', 'Dữ liệu JSON đã được nạp từ bộ nhớ tạm.', 'info');
        } catch (e) {
            IslandKit.notify('Quyền truy cập', 'Nhấn Ctrl + V để dán trực tiếp.', 'warning');
        }
    });

    btnCopy?.addEventListener('click', async () => {
        if (!state.outputStr) {
            IslandKit.notify('Trống', 'Chưa có nội dung để sao chép.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(state.outputStr);
            IslandKit.notify('Đã sao chép', `Đã lưu kết quả [${state.view.toUpperCase()}] vào clipboard.`, 'success');
        } catch (e) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    btnDownload?.addEventListener('click', () => {
        if (!state.outputStr || !state.isValid) {
            IslandKit.notify('Cảnh báo', 'Cần chuỗi JSON hợp lệ để lưu tệp.', 'warning');
            return;
        }
        const ext = state.view === 'js' ? 'js' : state.view === 'xml' ? 'xml' : 'json';
        const blob = new Blob([state.outputStr], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `data_${state.view}_${Date.now()}.${ext}`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    btnUpload?.addEventListener('click', () => fileUpload?.click());

    fileUpload?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (inputArea) inputArea.value = event.target.result;
            processJSON();
            IslandKit.notify('Tệp đã nạp', `Đã đọc: ${file.name}`, 'info');
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    processJSON();
}