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
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & BASE64 TOOL STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="tree-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #tree-root-container {
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
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }

            .tree-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            /* VS Code Tree Hierarchy */
            .vs-tree ul { 
                padding-left: 18px; 
                margin-left: 8px; 
                border-left: 1.5px solid transparent; 
                transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
            }
            .vs-tree ul.open-folder { 
                border-left-color: rgba(0, 0, 0, 0.08); 
            }
            .dark .vs-tree ul.open-folder { 
                border-left-color: rgba(255, 255, 255, 0.1); 
            }
            .vs-tree-root { 
                padding-left: 0 !important; 
                margin-left: 0 !important; 
                border-left: none !important; 
            }
            
            .vs-row { 
                position: relative; 
                border: 1.5px solid transparent; 
                border-radius: 12px;
                transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1); 
            }
            .vs-row:hover, .vs-row:focus-within { 
                background-color: rgba(0, 0, 0, 0.04); 
            }
            .dark .vs-row:hover, .dark .vs-row:focus-within { 
                background-color: rgba(255, 255, 255, 0.05); 
            }
            
            /* DND Indicators */
            .drop-above { 
                border-top: 2px solid var(--kit-accent) !important; 
                z-index: 10; 
            }
            .drop-below { 
                border-bottom: 2px solid var(--kit-accent) !important; 
                z-index: 10; 
            }
            .drop-inside { 
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important; 
                border-color: var(--kit-accent) !important;
            }
            .is-dragging { 
                opacity: 0.35; 
                transform: scale(0.98);
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Developer</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Folder Tree Generator</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Kéo thả lồng ghép trực quan chuẩn VS Code, xuất sơ đồ cây ASCII tự động.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-clear" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm" title="Làm mới toàn bộ">
                        <i class="fas fa-arrows-rotate text-xs"></i> <span>Đặt lại</span>
                    </button>
                </div>
            </div>

            <!-- TAB CONTROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="input-tabs">
                    <button class="tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-target="tab-visual">
                        <i class="fas fa-code-branch text-[11px]"></i> VS Code Editor
                    </button>
                    <button class="tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="tab-text">
                        <i class="fas fa-align-left text-[11px]"></i> Đường dẫn / Text
                    </button>
                    <button class="tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="tab-upload">
                        <i class="fas fa-folder-open text-[11px]"></i> Tải thư mục
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- INPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cấu trúc cây mục tiêu</h3>
                            <span class="text-[10px] text-zinc-400 font-mono" id="tree-mode-tag">Visual Drag & Drop</span>
                        </div>

                        <!-- Pane 1: Visual Drag & Drop Editor -->
                        <div class="input-pane flex-1 flex flex-col min-h-[340px]" id="tab-visual">
                            <div class="flex-1 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] overflow-y-auto custom-scrollbar relative p-3">
                                <ul id="vs-tree-root" class="vs-tree vs-tree-root flex flex-col w-full pb-16 space-y-0.5 select-none">
                                    <!-- Nodes Rendered Here -->
                                </ul>

                                <!-- Root Controls Dock -->
                                <div class="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-[#161618]/90 backdrop-blur-md p-1 rounded-[14px] shadow-lg border border-black/[0.05] dark:border-white/[0.08]">
                                    <button id="btn-add-root-file" class="w-8 h-8 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 text-blue-500 hover:text-blue-600 flex items-center justify-center text-xs active:scale-90 transition-transform" title="Thêm File tại gốc">
                                        <i class="fas fa-file-circle-plus"></i>
                                    </button>
                                    <button id="btn-add-root-folder" class="w-8 h-8 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 text-amber-500 hover:text-amber-600 flex items-center justify-center text-xs active:scale-90 transition-transform" title="Thêm Thư mục tại gốc">
                                        <i class="fas fa-folder-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Pane 2: Raw Text / Paths -->
                        <div class="input-pane hidden flex-1 flex flex-col min-h-[340px]" id="tab-text">
                            <textarea id="tree-input" 
                                class="tree-input-zen flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 outline-none text-xs sm:text-sm font-mono leading-relaxed text-zinc-900 dark:text-white resize-none custom-scrollbar placeholder-zinc-400 focus:border-accent-theme transition-all" 
                                spellcheck="false" 
                                placeholder="Nhập đường dẫn từng dòng (VD: src/js/app.js) hoặc thụt đầu dòng bằng phím Tab..."></textarea>
                        </div>

                        <!-- Pane 3: Folder Picker -->
                        <div class="input-pane hidden flex-1 flex flex-col min-h-[340px]" id="tab-upload">
                            <label class="flex-1 flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-black/40 border-2 border-dashed border-black/[0.08] dark:border-white/[0.12] rounded-[18px] p-6 cursor-pointer hover:border-accent-theme transition-colors group">
                                <div class="w-14 h-14 rounded-[18px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-cloud-arrow-up text-2xl"></i>
                                </div>
                                <span class="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 text-center">Chạm hoặc chọn thư mục từ máy</span>
                                <span class="text-[11px] text-zinc-400 text-center mt-1">Toàn bộ cấu trúc được bóc tách an toàn trên trình duyệt</span>
                                <input type="file" id="folder-upload" webkitdirectory directory multiple class="hidden">
                            </label>
                            <div id="upload-status" class="pt-2 text-center text-xs font-semibold text-zinc-500 hidden">
                                Đã quét: <span id="file-count" class="text-accent-theme font-mono font-bold">0</span> tệp tin
                            </div>
                        </div>
                    </div>

                    <!-- Action Trigger -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button id="btn-generate-tree" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                            <i class="fas fa-sitemap text-xs"></i> <span>Khởi tạo cây thư mục</span>
                        </button>
                    </div>
                </div>

                <!-- OUTPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cây ASCII Kết xuất</h3>
                            <button id="btn-copy" class="h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Sao chép kết quả">
                                <i class="far fa-copy text-xs"></i> <span>Chép</span>
                            </button>
                        </div>

                        <!-- Output ASCII Textarea -->
                        <div class="flex-1 flex flex-col min-h-[340px]">
                            <textarea id="tree-output" readonly 
                                class="tree-input-zen flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-4 outline-none text-xs font-mono text-zinc-800 dark:text-zinc-200 resize-none custom-scrollbar placeholder-zinc-400 leading-relaxed whitespace-pre" 
                                placeholder="Sơ đồ cây cấu trúc sẽ hiển thị tại đây..."></textarea>
                        </div>
                    </div>

                    <!-- Footer Info Note -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span id="tree-status-info">Chuẩn ký tự ASCII / Unicode</span>
                        <span class="font-mono text-[10px]">100% Client-Side</span>
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
    const rootContainer = hostElement.querySelector('#tree-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query Elements
    const outputEl = hostElement.querySelector('#tree-output');
    const tabs = hostElement.querySelectorAll('#input-tabs .tab-btn');
    const panes = hostElement.querySelectorAll('.input-pane');
    const treeModeTag = hostElement.querySelector('#tree-mode-tag');
    const treeStatusInfo = hostElement.querySelector('#tree-status-info');
    const treeInput = hostElement.querySelector('#tree-input');
    const fileInput = hostElement.querySelector('#folder-upload');
    const uploadStatus = hostElement.querySelector('#upload-status');
    const fileCount = hostElement.querySelector('#file-count');
    const btnGenerateTree = hostElement.querySelector('#btn-generate-tree');
    const btnCopy = hostElement.querySelector('#btn-copy');
    const btnClear = hostElement.querySelector('#btn-clear');

    let currentInputMode = 'tab-visual';

    // Segmented Tabs Standard
    const activeClass = 'tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveClass = 'tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.className = inactiveClass; });
            tab.className = activeClass;

            panes.forEach(p => { 
                p.classList.remove('flex'); 
                p.classList.add('hidden'); 
            });
            
            currentInputMode = tab.getAttribute('data-target');
            const targetPane = hostElement.querySelector(`#${currentInputMode}`);
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('flex');
            }

            if (currentInputMode === 'tab-visual') {
                treeModeTag.textContent = 'Visual Drag & Drop';
                btnGenerateTree.innerHTML = '<i class="fas fa-sitemap text-xs"></i> <span>Khởi tạo từ giao diện VS Code</span>';
            } else if (currentInputMode === 'tab-text') {
                treeModeTag.textContent = 'Text / Paths Parser';
                btnGenerateTree.innerHTML = '<i class="fas fa-sitemap text-xs"></i> <span>Khởi tạo từ văn bản</span>';
            } else if (currentInputMode === 'tab-upload') {
                treeModeTag.textContent = 'Directory Scanner';
                btnGenerateTree.innerHTML = '<i class="fas fa-sitemap text-xs"></i> <span>Khởi tạo từ thư mục đã tải</span>';
            }
        });
    });

    // Cây cấu trúc dữ liệu ASCII
    const buildTreeObject = (paths) => {
        const tree = {};
        paths.forEach(path => {
            const parts = path.split(/[/\\]/).map(p => p.trim()).filter(p => p);
            let current = tree;
            parts.forEach((part, index) => {
                if (!current[part]) current[part] = (index === parts.length - 1) ? null : {};
                else if (current[part] === null && index < parts.length - 1) current[part] = {};
                current = current[part];
            });
        });
        return tree;
    };

    const drawASCII = (node, prefix = '') => {
        let result = '';
        const keys = Object.keys(node).sort((a, b) => {
            const isFolderA = node[a] !== null;
            const isFolderB = node[b] !== null;
            if (isFolderA && !isFolderB) return -1;
            if (!isFolderA && isFolderB) return 1;
            return a.localeCompare(b);
        });
        keys.forEach((key, index) => {
            const isLast = index === keys.length - 1;
            result += '\n' + prefix + (isLast ? '└── ' : '├── ') + key;
            if (node[key] !== null && typeof node[key] === 'object') {
                result += drawASCII(node[key], prefix + (isLast ? '    ' : '│   '));
            }
        });
        return result;
    };

    const renderTree = (paths, rootName = '.') => {
        try {
            if (!paths || paths.length === 0) {
                outputEl.value = '';
                treeStatusInfo.textContent = 'Chưa có cấu trúc cây';
                return;
            }
            outputEl.value = rootName + drawASCII(buildTreeObject(paths));
            treeStatusInfo.textContent = `Đã xuất ${paths.length} đường dẫn`;
        } catch (error) {
        }
    };

    // =========================================================================
    // MODULE: VS CODE VISUAL EDITOR
    // =========================================================================
    const treeRoot = hostElement.querySelector('#vs-tree-root');
    let draggedNode = null;

    const createNode = (type, name = '', isOpen = true) => {
        const li = document.createElement('li');
        li.className = 'tree-item list-none';
        li.draggable = true;
        li.dataset.type = type;

        const isFolder = type === 'folder';
        const iconColor = isFolder ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400';
        const iconClass = isFolder ? 'fa-folder' : 'fa-file-code';

        li.innerHTML = `
            <div class="vs-row group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer">
                <div class="w-4 h-4 flex items-center justify-center shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 btn-toggle">
                    ${isFolder ? `<i class="fas fa-chevron-down text-[9px] transition-transform ${isOpen ? '' : '-rotate-90'}"></i>` : ''}
                </div>
                
                <div class="w-4 flex items-center justify-center shrink-0">
                    <i class="fas ${iconClass} ${iconColor} text-xs"></i>
                </div>
                
                <input type="text" class="node-input tree-input-zen flex-1 bg-transparent border-none outline-none text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:text-zinc-900 dark:focus:text-white placeholder-zinc-400 py-0.5 min-w-[50px]" value="${name}" placeholder="${isFolder ? 'Tên thư mục...' : 'Tên tệp...'}">
                
                <div class="actions flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    ${isFolder ? `
                    <button class="btn-add-file w-6 h-6 rounded-[8px] flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all" title="Tệp mới"><i class="fas fa-file-circle-plus text-[10px]"></i></button>
                    <button class="btn-add-folder w-6 h-6 rounded-[8px] flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all" title="Thư mục mới"><i class="fas fa-folder-plus text-[10px]"></i></button>
                    ` : ''}
                    <button class="btn-delete w-6 h-6 rounded-[8px] flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all" title="Xóa"><i class="fas fa-trash-can text-[10px]"></i></button>
                </div>
            </div>
            ${isFolder ? `<ul class="children-container ${isOpen ? 'open-folder' : 'hidden'}"></ul>` : ''}
        `;

        const input = li.querySelector('.node-input');
        input.addEventListener('input', (e) => {
            if (type === 'file') {
                const icon = li.querySelector('.fa-file-code, .fa-file-lines');
                if (icon) {
                    if (e.target.value.endsWith('.js') || e.target.value.endsWith('.ts')) icon.className = 'fas fa-file-code text-amber-400 text-xs';
                    else if (e.target.value.endsWith('.css')) icon.className = 'fab fa-css3-alt text-blue-500 text-xs';
                    else if (e.target.value.endsWith('.html')) icon.className = 'fab fa-html5 text-orange-500 text-xs';
                    else if (e.target.value.endsWith('.json')) icon.className = 'fas fa-brackets-curly text-emerald-500 text-xs';
                    else icon.className = 'fas fa-file-lines text-zinc-400 text-xs';
                }
            }
        });

        if (isFolder) {
            const toggleFolder = (e) => {
                if (e.target.tagName === 'INPUT' || e.target.closest('.actions')) return;
                const ul = li.querySelector('ul');
                const chevron = li.querySelector('.fa-chevron-down');
                const folderIcon = li.querySelector('.fa-folder, .fa-folder-open');
                
                const isNowOpen = ul.classList.toggle('hidden');
                ul.classList.toggle('open-folder', !isNowOpen);
                chevron?.classList.toggle('-rotate-90', isNowOpen);
                
                if (isNowOpen) {
                    folderIcon?.classList.replace('fa-folder-open', 'fa-folder');
                } else {
                    folderIcon?.classList.replace('fa-folder', 'fa-folder-open');
                }
            };
            li.querySelector('.vs-row').addEventListener('click', toggleFolder);
        }

        if (isFolder) {
            li.querySelector('.btn-add-file')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const ul = li.querySelector('ul');
                ul.classList.remove('hidden'); 
                ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down')?.classList.remove('-rotate-90');
                const newNode = createNode('file', '');
                ul.appendChild(newNode);
                newNode.querySelector('input')?.focus();
            });
            li.querySelector('.btn-add-folder')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const ul = li.querySelector('ul');
                ul.classList.remove('hidden'); 
                ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down')?.classList.remove('-rotate-90');
                const newNode = createNode('folder', '');
                ul.appendChild(newNode);
                newNode.querySelector('input')?.focus();
            });
        }
        li.querySelector('.btn-delete')?.addEventListener('click', (e) => {
            e.stopPropagation();
            li.remove();
        });

        // Drag and Drop
        li.addEventListener('dragstart', (e) => {
            draggedNode = li;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => li.classList.add('is-dragging'), 0);
            e.stopPropagation();
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedNode === li || li.contains(draggedNode)) return;

            const row = li.querySelector('.vs-row');
            row.classList.remove('drop-above', 'drop-below', 'drop-inside');

            const rect = row.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            
            if (relY < rect.height * 0.25) {
                row.classList.add('drop-above');
            } else if (relY > rect.height * 0.75) {
                row.classList.add('drop-below');
            } else if (type === 'folder') {
                row.classList.add('drop-inside');
            } else {
                row.classList.add('drop-below');
            }
        });

        li.addEventListener('dragleave', () => {
            li.querySelector('.vs-row')?.classList.remove('drop-above', 'drop-below', 'drop-inside');
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const row = li.querySelector('.vs-row');
            const dropClass = row ? row.className : '';
            row?.classList.remove('drop-above', 'drop-below', 'drop-inside');
            
            if (!draggedNode || draggedNode === li || li.contains(draggedNode)) return;

            if (dropClass.includes('drop-above')) {
                li.parentNode.insertBefore(draggedNode, li);
            } else if (dropClass.includes('drop-below')) {
                li.parentNode.insertBefore(draggedNode, li.nextSibling);
            } else if (dropClass.includes('drop-inside') && type === 'folder') {
                const ul = li.querySelector('ul');
                ul.appendChild(draggedNode);
                ul.classList.remove('hidden'); 
                ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down')?.classList.remove('-rotate-90');
            }
            draggedNode.classList.remove('is-dragging');
        });

        li.addEventListener('dragend', () => {
            if (draggedNode) draggedNode.classList.remove('is-dragging');
            draggedNode = null;
            hostElement.querySelectorAll('.vs-row').forEach(el => el.classList.remove('drop-above', 'drop-below', 'drop-inside'));
        });

        return li;
    };

    const extractPathsFromDOM = (ulElement, currentPath = '') => {
        let paths = [];
        Array.from(ulElement.children).forEach(li => {
            const name = li.querySelector('.node-input').value.trim() || 'unnamed';
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            
            if (li.dataset.type === 'folder') {
                const childUl = li.querySelector('ul');
                if (!childUl || childUl.children.length === 0) {
                    paths.push(fullPath + '/');
                } else {
                    paths = paths.concat(extractPathsFromDOM(childUl, fullPath));
                }
            } else {
                paths.push(fullPath);
            }
        });
        return paths;
    };

    const initDemoData = () => {
        treeRoot.innerHTML = '';
        const srcNode = createNode('folder', 'src');
        treeRoot.appendChild(srcNode);
        
        const srcUl = srcNode.querySelector('ul');
        srcUl.appendChild(createNode('file', 'index.js'));
        srcUl.appendChild(createNode('file', 'style.css'));
        
        const componentsNode = createNode('folder', 'components');
        srcUl.appendChild(componentsNode);
        componentsNode.querySelector('ul').appendChild(createNode('file', 'App.js'));
        
        treeRoot.appendChild(createNode('file', 'package.json'));
    };
    initDemoData();

    // Node Root Triggers
    hostElement.querySelector('#btn-add-root-file')?.addEventListener('click', () => {
        const node = createNode('file', '');
        treeRoot.appendChild(node);
        node.querySelector('input')?.focus();
    });
    
    hostElement.querySelector('#btn-add-root-folder')?.addEventListener('click', () => {
        const node = createNode('folder', '');
        treeRoot.appendChild(node);
        node.querySelector('input')?.focus();
    });

    // Universal Generate Button
    btnGenerateTree?.addEventListener('click', () => {
        if (currentInputMode === 'tab-visual') {
            const paths = extractPathsFromDOM(treeRoot);
            renderTree(paths);
        } else if (currentInputMode === 'tab-text') {
            const text = treeInput.value;
            if (!text.trim()) {
                return IslandKit.notify('Cảnh báo', 'Vui lòng nhập danh sách đường dẫn.', 'warning');
            }

            let currentDataPaths = [];
            if (!text.includes('/') && !text.includes('\\')) {
                const lines = text.split('\n').filter(l => l.trim().length > 0);
                const stack = [];
                lines.forEach(line => {
                    const match = line.match(/^([ \t]*)(.*)/);
                    const indent = match[1];
                    const name = match[2].trim();
                    if (!name) return;

                    let depth = 0; 
                    let spaceCount = 0;
                    for (let char of indent) {
                        if (char === '\t') depth++;
                        else if (char === ' ') spaceCount++;
                    }
                    depth += Math.floor(spaceCount / 2);

                    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) stack.pop();
                    stack.push({ name, depth });
                    currentDataPaths.push(stack.map(s => s.name).join('/'));
                });
            } else {
                currentDataPaths = text.split('\n').filter(line => line.trim() !== '');
            }
            renderTree(currentDataPaths);
        } else if (currentInputMode === 'tab-upload') {
            const files = Array.from(fileInput.files || []);
            if (files.length === 0) {
                return IslandKit.notify('Cảnh báo', 'Vui lòng chọn thư mục cần quét.', 'warning');
            }
            const paths = files.map(f => f.webkitRelativePath).filter(p => p);
            const rootFolder = paths[0].split('/')[0]; 
            const cleanedPaths = paths.map(p => p.substring(p.indexOf('/') + 1));
            renderTree(cleanedPaths, rootFolder);
        }
    });

    fileInput?.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const paths = files.map(f => f.webkitRelativePath).filter(p => p);
        uploadStatus.classList.remove('hidden');
        fileCount.textContent = files.length.toLocaleString();
        
        const rootFolder = paths[0].split('/')[0]; 
        const cleanedPaths = paths.map(p => p.substring(p.indexOf('/') + 1));
        
        renderTree(cleanedPaths, rootFolder);
    });

    // Copy Action
    btnCopy?.addEventListener('click', async () => {
        if (!outputEl.value) {
            return IslandKit.notify('Trống', 'Chưa có cấu trúc cây để sao chép.', 'warning');
        }
        try {
            await navigator.clipboard.writeText(outputEl.value);
            IslandKit.notify('Đã sao chép', 'Cây thư mục đã lưu vào clipboard.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    // Clear Action
    btnClear?.addEventListener('click', () => {
        UI.showConfirm('Đặt lại toàn bộ?', 'Nội dung cây thư mục sẽ được khôi phục về mặc định.', () => {
            outputEl.value = '';
            treeInput.value = '';
            fileInput.value = '';
            uploadStatus.classList.add('hidden');
            initDemoData();
            treeStatusInfo.textContent = 'Chuẩn ký tự ASCII / Unicode';
            IslandKit.notify('Đã dọn dẹp', 'Tất cả dữ liệu đã được làm mới.', 'info');
        });
    });

    // Render khởi tạo từ Demo ban đầu
    renderTree(extractPathsFromDOM(treeRoot));
}