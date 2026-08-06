import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .btn-premium { transition: transform 0.1s, opacity 0.15s, background-color 0.2s; cursor: pointer; }
            .btn-premium:active { transform: scale(0.9); }
            
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            /* VS Code Tree Styles */
            .vs-tree ul { padding-left: 16px; margin-left: 6px; border-left: 1px solid transparent; transition: border-color 0.2s; }
            .vs-tree ul.open-folder { border-left-color: #e4e4e7; }
            .dark .vs-tree ul.open-folder { border-left-color: #27272a; }
            .vs-tree-root { padding-left: 0 !important; margin-left: 0 !important; border-left: none !important; }
            
            .vs-row { position: relative; border: 1px solid transparent; transition: all 0.1s; }
            .vs-row:hover, .vs-row:focus-within { background-color: #f4f4f5; }
            .dark .vs-row:hover, .dark .vs-row:focus-within { background-color: #18181b; }
            
            /* DND Indicators */
            .drop-above { border-top: 2px solid #10b981 !important; z-index: 10; }
            .drop-below { border-bottom: 2px solid #10b981 !important; z-index: 10; }
            .drop-inside { background-color: #ecfdf5 !important; }
            .dark .drop-inside { background-color: rgba(16, 185, 129, 0.1) !important; }
            .is-dragging { opacity: 0.4; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1200px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-6 px-2 ui-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Folder Tree Generator</h2>
                    <p class="text-[13px] text-zinc-500 font-medium">Kéo thả lồng ghép linh hoạt như VS Code.</p>
                </div>
                <div class="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <i class="fas fa-shield-alt"></i> 100% Client-Side
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Input Block -->
                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 md:p-6 flex flex-col min-h-[500px]">
                    
                    <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-4" id="input-tabs">
                        <button class="tab-btn active btn-premium px-5 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-target="tab-visual"><i class="fas fa-code-branch mr-1.5"></i> VS Code Editor</button>
                        <button class="tab-btn btn-premium px-5 py-2 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white" data-target="tab-text"><i class="fas fa-align-left mr-1.5"></i> Văn bản</button>
                        <button class="tab-btn btn-premium px-5 py-2 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white" data-target="tab-upload"><i class="fas fa-folder-open mr-1.5"></i> Tải lên</button>
                    </div>

                    <!-- Pane 1: VS Code Visual Editor -->
                    <div class="input-pane flex-1 flex flex-col animate-in fade-in" id="tab-visual">
                        <div class="flex-1 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-y-auto custom-scrollbar relative p-2">
                            
                            <!-- Root Tree -->
                            <ul id="vs-tree-root" class="vs-tree vs-tree-root flex flex-col w-full pb-20 select-none">
                                <!-- Nodes Rendered Here -->
                            </ul>

                            <!-- Nút thao tác Root -->
                            <div class="absolute bottom-4 right-4 flex gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-lg border border-zinc-100 dark:border-zinc-800">
                                <button id="btn-add-root-file" class="btn-premium w-9 h-9 bg-zinc-50 dark:bg-zinc-800 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700" title="Thêm File gốc">
                                    <i class="fas fa-file-medical"></i>
                                </button>
                                <button id="btn-add-root-folder" class="btn-premium w-9 h-9 bg-zinc-50 dark:bg-zinc-800 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700" title="Thêm Folder gốc">
                                    <i class="fas fa-folder-plus"></i>
                                </button>
                            </div>
                        </div>
                        <button id="btn-gen-visual" class="btn-premium w-full mt-4 py-3.5 rounded-2xl bg-emerald-500 dark:bg-emerald-400 text-white dark:text-zinc-900 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm">
                            <i class="fas fa-magic"></i> Khởi tạo cấu trúc
                        </button>
                    </div>
                    
                    <!-- Pane 2: Văn Bản -->
                    <div class="input-pane hidden flex-1 flex flex-col animate-in fade-in" id="tab-text">
                        <textarea id="tree-input" class="w-full flex-1 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-none custom-scrollbar placeholder-zinc-400" spellcheck="false" placeholder="Nhập đường dẫn (VD: src/js/app.js) hoặc văn bản thụt lề bằng Tab..."></textarea>
                        <button id="btn-gen-text" class="btn-premium w-full mt-4 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                            <i class="fas fa-sitemap"></i> Tạo từ văn bản
                        </button>
                    </div>

                    <!-- Pane 3: Upload Folder -->
                    <div class="input-pane hidden flex-1 flex flex-col animate-in fade-in" id="tab-upload">
                        <label class="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/30 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div class="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <i class="fas fa-cloud-upload-alt text-xl text-zinc-400"></i>
                            </div>
                            <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 text-center">Chạm để chọn thư mục</span>
                            <span class="text-[10px] font-medium text-zinc-500 text-center">Xử lý cục bộ trên trình duyệt.</span>
                            <input type="file" id="folder-upload" webkitdirectory directory multiple class="hidden">
                        </label>
                        <div id="upload-status" class="mt-4 text-center text-xs font-bold text-zinc-500 hidden">
                            Đã đọc: <span id="file-count" class="text-zinc-900 dark:text-white">0</span> files
                        </div>
                    </div>
                </div>

                <!-- Output Block -->
                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 md:p-6 flex flex-col min-h-[500px]">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Kết quả</h3>
                        <div class="flex gap-2">
                            <button id="btn-clear" class="btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:text-red-500" title="Làm mới toàn bộ"><i class="fas fa-redo-alt text-xs"></i></button>
                            <button id="btn-copy" class="btn-premium w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center" title="Copy kết quả"><i class="far fa-copy text-xs"></i></button>
                        </div>
                    </div>
                    
                    <textarea id="tree-output" class="w-full flex-1 bg-zinc-50 dark:bg-[#121214]/50 border border-transparent rounded-2xl p-5 outline-none text-[13px] font-mono text-zinc-900 dark:text-zinc-300 resize-none custom-scrollbar placeholder-zinc-400/50 leading-relaxed whitespace-pre" placeholder="Cây thư mục sẽ hiển thị ở đây..." readonly></textarea>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const outputEl = document.getElementById('tree-output');

    // --- Tab Logic ---[cite: 1]
    const tabs = document.querySelectorAll('#input-tabs .tab-btn');
    const panes = document.querySelectorAll('.input-pane');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            });
            panes.forEach(p => { p.classList.replace('flex', 'hidden'); });
            
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.remove('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            
            document.getElementById(tab.getAttribute('data-target')).classList.replace('hidden', 'flex');
        });
    });

    // --- Algorithm ---
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
            if (paths.length === 0) return outputEl.value = '';
            outputEl.value = rootName + drawASCII(buildTreeObject(paths));
            UI.showAlert('Thành công', 'Đã khởi tạo cây thư mục.', 'success');
        } catch (error) {
            UI.showAlert('Lỗi', 'Lỗi xử lý dữ liệu.', 'error');
        }
    };

    // ==========================================
    // MODULE: VS CODE VISUAL EDITOR (NESTED DOM)
    // ==========================================
    const treeRoot = document.getElementById('vs-tree-root');
    let draggedNode = null;

    // Hàm tạo Node (File/Folder)
    const createNode = (type, name = '', isOpen = true) => {
        const li = document.createElement('li');
        li.className = 'tree-item list-none';
        li.draggable = true;
        li.dataset.type = type;

        const isFolder = type === 'folder';
        const iconColor = isFolder ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400';
        const iconClass = isFolder ? 'fa-folder' : 'fa-file-code';

        li.innerHTML = `
            <div class="vs-row group flex items-center gap-1.5 px-1 py-1.5 rounded-lg cursor-pointer">
                <!-- Chevron (Chỉ hiện cho Folder) -->
                <div class="w-4 h-4 flex items-center justify-center shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 btn-toggle">
                    ${isFolder ? `<i class="fas fa-chevron-down text-[9px] transition-transform ${isOpen ? '' : '-rotate-90'}"></i>` : ''}
                </div>
                
                <!-- Icon -->
                <div class="w-4 flex items-center justify-center shrink-0">
                    <i class="fas ${iconClass} ${iconColor} text-[11px]"></i>
                </div>
                
                <!-- Input Tên -->
                <input type="text" class="node-input flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-zinc-700 dark:text-zinc-300 focus:text-zinc-900 dark:focus:text-white placeholder-zinc-300 dark:placeholder-zinc-700 py-0.5 min-w-[50px]" value="${name}" placeholder="${isFolder ? 'Tên thư mục...' : 'Tên file...'}">
                
                <!-- Thanh công cụ VS Code -->
                <div class="actions flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    ${isFolder ? `
                    <button class="btn-add-file btn-premium w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-zinc-200 dark:hover:bg-zinc-700" title="New File"><i class="fas fa-file-medical text-[10px]"></i></button>
                    <button class="btn-add-folder btn-premium w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-zinc-200 dark:hover:bg-zinc-700" title="New Folder"><i class="fas fa-folder-plus text-[10px]"></i></button>
                    ` : ''}
                    <button class="btn-delete btn-premium w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-700" title="Delete"><i class="fas fa-trash-alt text-[10px]"></i></button>
                </div>
            </div>
            ${isFolder ? `<ul class="children-container ${isOpen ? 'open-folder' : 'hidden'}"></ul>` : ''}
        `;

        // Sự kiện Đổi tên tự động nhận diện file extension
        const input = li.querySelector('.node-input');
        input.addEventListener('input', (e) => {
            if(type === 'file') {
                const icon = li.querySelector('.fa-file-code, .fa-file-alt');
                // Fake logic icon đơn giản
                if(e.target.value.includes('.js')) icon.className = 'fas fa-file-code text-yellow-400 text-[11px]';
                else if(e.target.value.includes('.css')) icon.className = 'fab fa-css3-alt text-blue-500 text-[11px]';
                else if(e.target.value.includes('.html')) icon.className = 'fab fa-html5 text-orange-500 text-[11px]';
                else icon.className = 'fas fa-file-alt text-zinc-400 text-[11px]';
            }
        });

        // Sự kiện Toggle (Đóng/Mở folder)
        if (isFolder) {
            const toggleFolder = (e) => {
                if (e.target.tagName === 'INPUT' || e.target.closest('.actions')) return;
                const ul = li.querySelector('ul');
                const chevron = li.querySelector('.fa-chevron-down');
                const folderIcon = li.querySelector('.fa-folder, .fa-folder-open');
                
                const isNowOpen = ul.classList.toggle('hidden');
                ul.classList.toggle('open-folder', !isNowOpen);
                chevron.classList.toggle('-rotate-90', isNowOpen);
                
                if(isNowOpen) {
                    folderIcon.classList.replace('fa-folder-open', 'fa-folder');
                } else {
                    folderIcon.classList.replace('fa-folder', 'fa-folder-open');
                }
            };
            li.querySelector('.vs-row').addEventListener('click', toggleFolder);
        }

        // Sự kiện Nút Action
        if (isFolder) {
            li.querySelector('.btn-add-file').addEventListener('click', (e) => {
                e.stopPropagation();
                const ul = li.querySelector('ul');
                ul.classList.remove('hidden'); ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down').classList.remove('-rotate-90');
                const newNode = createNode('file', '');
                ul.appendChild(newNode);
                newNode.querySelector('input').focus();
            });
            li.querySelector('.btn-add-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                const ul = li.querySelector('ul');
                ul.classList.remove('hidden'); ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down').classList.remove('-rotate-90');
                const newNode = createNode('folder', '');
                ul.appendChild(newNode);
                newNode.querySelector('input').focus();
            });
        }
        li.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            li.remove();
        });

        // --- Drag & Drop Logic (VS Code Style) ---
        li.addEventListener('dragstart', (e) => {
            draggedNode = li;
            e.dataTransfer.effectAllowed = 'move';
            // Không truyền dữ liệu text vì ta di chuyển node DOM
            setTimeout(() => li.classList.add('is-dragging'), 0);
            e.stopPropagation();
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedNode === li || li.contains(draggedNode)) return; // Tránh drop vào chính nó hoặc con của nó

            const row = li.querySelector('.vs-row');
            row.classList.remove('drop-above', 'drop-below', 'drop-inside');

            const rect = row.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            
            // Chia vùng drop làm 3 phần
            if (relY < rect.height * 0.25) {
                row.classList.add('drop-above');
            } else if (relY > rect.height * 0.75) {
                row.classList.add('drop-below');
            } else if (type === 'folder') {
                row.classList.add('drop-inside');
            } else {
                row.classList.add('drop-below'); // Nếu là file thì rớt xuống dưới
            }
        });

        li.addEventListener('dragleave', (e) => {
            li.querySelector('.vs-row').classList.remove('drop-above', 'drop-below', 'drop-inside');
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const row = li.querySelector('.vs-row');
            const dropClass = row.className;
            row.classList.remove('drop-above', 'drop-below', 'drop-inside');
            
            if (!draggedNode || draggedNode === li || li.contains(draggedNode)) return;

            if (dropClass.includes('drop-above')) {
                li.parentNode.insertBefore(draggedNode, li);
            } else if (dropClass.includes('drop-below')) {
                li.parentNode.insertBefore(draggedNode, li.nextSibling);
            } else if (dropClass.includes('drop-inside') && type === 'folder') {
                const ul = li.querySelector('ul');
                ul.appendChild(draggedNode);
                ul.classList.remove('hidden'); ul.classList.add('open-folder');
                li.querySelector('.fa-chevron-down').classList.remove('-rotate-90');
            }
            draggedNode.classList.remove('is-dragging');
        });

        li.addEventListener('dragend', () => {
            if (draggedNode) draggedNode.classList.remove('is-dragging');
            draggedNode = null;
            // Xóa tất cả highlight bị dính
            document.querySelectorAll('.vs-row').forEach(el => el.classList.remove('drop-above', 'drop-below', 'drop-inside'));
        });

        return li;
    };

    // Duyệt cây DOM để lấy danh sách đường dẫn
    const extractPathsFromDOM = (ulElement, currentPath = '') => {
        let paths = [];
        Array.from(ulElement.children).forEach(li => {
            const name = li.querySelector('.node-input').value.trim() || 'unnamed';
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            
            if (li.dataset.type === 'folder') {
                const childUl = li.querySelector('ul');
                if (childUl.children.length === 0) {
                    paths.push(fullPath + '/'); // Đánh dấu thư mục rỗng
                } else {
                    paths = paths.concat(extractPathsFromDOM(childUl, fullPath));
                }
            } else {
                paths.push(fullPath);
            }
        });
        return paths;
    };

    // Khởi tạo Demo ban đầu
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

    // Nút Thêm Gốc
    document.getElementById('btn-add-root-file').addEventListener('click', () => {
        const node = createNode('file', '');
        treeRoot.appendChild(node);
        node.querySelector('input').focus();
    });
    
    document.getElementById('btn-add-root-folder').addEventListener('click', () => {
        const node = createNode('folder', '');
        treeRoot.appendChild(node);
        node.querySelector('input').focus();
    });

    // Tạo Cây từ DOM
    document.getElementById('btn-gen-visual').addEventListener('click', () => {
        const paths = extractPathsFromDOM(treeRoot);
        renderTree(paths);
    });

    // ==========================================
    // MODULE: TEXT & UPLOAD
    // ==========================================
    document.getElementById('btn-gen-text').addEventListener('click', () => {
        const text = document.getElementById('tree-input').value;
        if (!text.trim()) return UI.showAlert('Cảnh báo', 'Vui lòng nhập văn bản.', 'error');

        let currentDataPaths = [];
        if (!text.includes('/') && !text.includes('\\')) {
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            const stack = [];
            lines.forEach(line => {
                const match = line.match(/^([ \t]*)(.*)/);
                const indent = match[1];
                const name = match[2].trim();
                if (!name) return;

                let depth = 0; let spaceCount = 0;
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
    });

    const fileInput = document.getElementById('folder-upload');
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const paths = files.map(f => f.webkitRelativePath).filter(p => p);
        document.getElementById('upload-status').classList.remove('hidden');
        document.getElementById('file-count').textContent = files.length;
        
        const rootFolder = paths[0].split('/')[0]; 
        const cleanedPaths = paths.map(p => p.substring(p.indexOf('/') + 1));
        
        renderTree(cleanedPaths, rootFolder);
    });

    // ==========================================
    // ACTIONS CHUNG
    // ==========================================
    document.getElementById('btn-copy').addEventListener('click', async () => {
        if (!outputEl.value) return UI.showAlert('Cảnh báo', 'Không có dữ liệu.', 'error');
        try {
            await navigator.clipboard.writeText(outputEl.value);
            UI.showAlert('Đã chép', 'Cây thư mục đã lưu vào Clipboard.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ.', 'error');
        }
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        outputEl.value = '';
        document.getElementById('tree-input').value = '';
        fileInput.value = '';
        document.getElementById('upload-status').classList.add('hidden');
        initDemoData(); // Reset lại bảng Visual
        UI.showAlert('Đã dọn dẹp', 'Tất cả dữ liệu đã được làm mới.', 'success');
    });
}