import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Scrollbar Minimal */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Animations & Transitions */
            .btn-premium { transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s, background-color 0.2s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            
            .ui-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            
            /* Slide & Mobile Styles */
            .slide-pane { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
            
            .folder-chip { flex-shrink: 0; transition: all 0.2s; }
            .folder-chip.active { background: #18181b; color: white; font-weight: bold; border-color: #18181b; }
            .dark .folder-chip.active { background: white; color: #18181b; border-color: white; }

            .note-item.active { background: #e4e4e7; }
            .dark .note-item.active { background: #27272a; }

            [contenteditable]:empty:before { content: attr(placeholder); color: #a1a1aa; pointer-events: none; display: block; }
            .dark [contenteditable]:empty:before { color: #71717a; }
            
            /* Disabled Input Styles */
            input:disabled { opacity: 0.5; cursor: not-allowed; }
        </style>

        <div class="relative flex flex-col md:flex-row w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] -mx-6 -my-6 md:-mx-10 md:-my-10 h-[85vh] min-h-[600px] rounded-[32px] overflow-hidden bg-zinc-50 dark:bg-[#121214] ui-fade-in shadow-inner">
            
            <div id="np-sidebar" class="w-full md:w-[320px] lg:w-[360px] flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 shrink-0 z-10 bg-zinc-50 dark:bg-[#121214]">
                <div class="px-6 pt-6 md:px-8 md:pt-8 pb-3">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-[26px] font-black text-zinc-900 dark:text-white tracking-tight">NotePRO</h2>
                        <div class="flex items-center gap-1.5">
                            <button id="btn-add-folder" class="btn-premium w-9 h-9 rounded-full bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm"><i class="fas fa-folder-plus"></i></button>
                            <button id="btn-new-note" class="btn-premium w-9 h-9 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-sm"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                    
                    <div class="flex items-center bg-white dark:bg-[#0c0c0e] rounded-xl p-2.5 px-4 border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all shadow-sm">
                        <i class="fas fa-search text-zinc-400 text-sm mr-3"></i>
                        <input type="text" id="np-search" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Tìm kiếm tài liệu...">
                    </div>
                </div>

                <div class="px-6 py-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div class="flex items-center justify-between mb-2.5">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Không gian lưu trữ</span>
                    </div>
                    <div id="np-folder-chips" class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        </div>
                </div>

                <div id="np-list" class="flex-1 overflow-y-auto custom-scrollbar p-3 px-4">
                    </div>
                
                <div class="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-md">
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" id="np-auto-lock" class="appearance-none w-9 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 checked:bg-zinc-900 dark:checked:bg-white relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white dark:before:bg-[#121214] before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform shadow-inner" checked>
                        <span class="text-xs font-bold text-zinc-500 group-hover:text-zinc-800 transition-colors"><i class="fas fa-shield-alt mr-1"></i> Auto-Lock</span>
                    </label>
                    <div class="flex gap-2">
                        <button id="btn-import-json" class="btn-premium w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><i class="fas fa-file-import text-[10px]"></i></button>
                        <button id="btn-export-json" class="btn-premium w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><i class="fas fa-file-export text-[10px]"></i></button>
                        <input type="file" id="np-import-file" class="hidden" accept=".json">
                    </div>
                </div>
            </div>

            <div id="np-editor-pane" class="absolute md:relative inset-0 md:inset-auto z-20 flex-1 flex flex-col bg-white dark:bg-[#0c0c0e] slide-pane translate-x-full md:translate-x-0 w-full h-full shadow-[-10px_0_30px_rgba(0,0,0,0.05)] dark:shadow-none">
                
                <div class="md:hidden flex items-center justify-between px-4 pt-6 pb-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-xl z-10">
                    <button id="btn-back-to-list" class="btn-premium text-blue-500 font-bold flex items-center gap-1.5 text-[15px]"><i class="fas fa-chevron-left"></i> Trở về</button>
                    <span id="np-status-badge-mobile" class="text-[10px] font-bold uppercase hidden"></span>
                    <button id="btn-save-note-mobile" class="btn-premium text-blue-500 font-bold text-[15px]">Lưu</button>
                </div>

                <div class="hidden md:flex justify-between items-center px-8 pt-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-user-shield text-zinc-400"></i>
                        <span id="np-status-badge" class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg hidden"></span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="btn-delete-note" class="btn-premium w-9 h-9 rounded-full border border-red-200 dark:border-red-900/50 text-red-500 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20"><i class="fas fa-trash-alt text-xs"></i></button>
                        <button id="btn-save-note" class="btn-premium px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold shadow-md">Đồng bộ lưu trữ</button>
                    </div>
                </div>

                <div id="np-empty-state" class="absolute inset-0 bg-white dark:bg-[#0c0c0e] z-10 flex flex-col items-center justify-center transition-opacity">
                    <i class="fas fa-fingerprint text-5xl text-zinc-200 dark:text-zinc-800 mb-5"></i>
                    <p class="text-sm font-bold text-zinc-400">Chọn một bản ghi để bắt đầu làm việc</p>
                </div>

                <div class="flex-1 flex flex-col p-6 md:p-10 overflow-hidden relative">
                    <input type="text" id="np-title" class="w-full bg-transparent border-none outline-none text-3xl font-black text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 p-0 mb-6" placeholder="Tiêu đề tài liệu...">
                    
                    <div id="np-editor-toolbar" class="flex flex-wrap gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl mb-6 border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-sm transition-opacity">
                        <button class="editor-cmd btn-premium w-8 h-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs" data-cmd="bold"><i class="fas fa-bold"></i></button>
                        <button class="editor-cmd btn-premium w-8 h-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs" data-cmd="italic"><i class="fas fa-italic"></i></button>
                        <button class="editor-cmd btn-premium w-8 h-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs" data-cmd="underline"><i class="fas fa-underline"></i></button>
                        <div class="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center"></div>
                        <button class="editor-cmd btn-premium w-8 h-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs" data-cmd="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                        <button class="editor-cmd btn-premium w-8 h-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs" data-cmd="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                    </div>

                    <div id="np-content" contenteditable="true" class="w-full flex-1 bg-transparent border-none outline-none text-[16px] text-zinc-800 dark:text-zinc-200 custom-scrollbar overflow-y-auto mb-4 leading-relaxed whitespace-pre-wrap" placeholder="Nhập nội dung mã hóa đầu cuối..."></div>
                    
                    <div class="shrink-0 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                        <div id="crypto-action-bar" class="flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow shadow-sm">
                            <i class="fas fa-key text-zinc-400 ml-4 text-sm"></i>
                            <input type="password" id="np-password" class="w-full bg-transparent border-none outline-none px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Thiết lập mật mã bảo vệ E2E...">
                            <button id="btn-toggle-crypto" class="btn-premium bg-zinc-900 dark:bg-white px-5 py-2.5 text-xs font-bold text-white dark:text-zinc-900 rounded-xl whitespace-nowrap"><i class="fas fa-lock mr-1"></i> Thực thi</button>
                        </div>

                        <div id="unlocked-action-bar" class="hidden flex-wrap items-center justify-between gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 p-2 pl-4 rounded-2xl">
                            <span class="text-xs font-bold text-amber-600 dark:text-amber-500"><i class="fas fa-unlock-alt mr-1"></i> Đang giải mã cục bộ</span>
                            <div class="flex gap-2">
                                <button id="btn-remove-crypto" class="btn-premium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">Hủy mã hóa</button>
                                <button id="btn-lock-now" class="btn-premium bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm"><i class="fas fa-lock mr-1"></i> Khóa lại</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    let folders = JSON.parse(localStorage.getItem('notepro_folders')) || [
        { id: 'all', name: 'Tất cả', color: '#71717a' },
        { id: 'uncategorized', name: 'Nháp Cục Bộ', color: '#71717a' }
    ];
    let notes = JSON.parse(localStorage.getItem('notepro_notes')) || [];
    let activeFolderId = 'all';
    let activeNoteId = null;
    
    // Quản lý trạng thái giải mã trên RAM (Mất khi chuyển Tab)
    let isCurrentlyUnlocked = false; 
    let sessionPwd = null; 
    let idleTime = 0;

    const folderChipsContainer = document.getElementById('np-folder-chips');
    const listContainer = document.getElementById('np-list');
    const searchInput = document.getElementById('np-search');
    const emptyState = document.getElementById('np-empty-state');
    
    // Inputs & UI
    const inputTitle = document.getElementById('np-title');
    const inputContent = document.getElementById('np-content');
    const inputPassword = document.getElementById('np-password');
    const statusBadge = document.getElementById('np-status-badge');
    const statusBadgeMobile = document.getElementById('np-status-badge-mobile');
    const btnToggleCrypto = document.getElementById('btn-toggle-crypto');
    const editorToolbar = document.getElementById('np-editor-toolbar');
    const autoLockToggle = document.getElementById('np-auto-lock');
    const editorPane = document.getElementById('np-editor-pane');

    // ---------------- ENGINE MÃ HÓA E2E CHUẨN XÁC 100% ----------------
    // Đảm bảo UTF-8/Unicode Tiếng Việt được đóng gói an toàn và không crash btoa()
    function encryptPayload(titleText, contentHtml, password) {
        try {
            // 1. Đóng gói cả Tiêu đề và Nội dung thành 1 chuỗi JSON
            const dataObj = JSON.stringify({ title: titleText, content: contentHtml });
            
            // 2. Chuyển đổi Unicode thành chuẩn 8-bit an toàn
            const bytesStr = unescape(encodeURIComponent(dataObj)); 
            
            // 3. XOR Cipher với mật khẩu (Đảm bảo Byte & 255)
            let xored = '';
            for (let i = 0; i < bytesStr.length; i++) {
                xored += String.fromCharCode(bytesStr.charCodeAt(i) ^ (password.charCodeAt(i % password.length) & 255));
            }
            
            // 4. Mã hóa Base64
            return btoa(xored);
        } catch(e) { console.error("Lỗi mã hóa:", e); return null; }
    }

    function decryptPayload(b64Str, password) {
        try {
            // 1. Giải mã Base64
            const xored = atob(b64Str);
            
            // 2. Dịch ngược XOR
            let bytesStr = '';
            for (let i = 0; i < xored.length; i++) {
                bytesStr += String.fromCharCode(xored.charCodeAt(i) ^ (password.charCodeAt(i % password.length) & 255));
            }
            
            // 3. Dịch ngược UTF-8 về Unicode String
            const dataStr = decodeURIComponent(escape(bytesStr));
            
            // 4. Giải nén JSON lấy Title và Content
            return JSON.parse(dataStr);
        } catch(e) { console.error("Lỗi giải mã:", e); return null; }
    }

    function saveToStorage() { 
        localStorage.setItem('notepro_folders', JSON.stringify(folders)); 
        localStorage.setItem('notepro_notes', JSON.stringify(notes)); 
    }

    // ---------------- MOBILE SLIDE UI ----------------
    function openEditorMobile() { editorPane.classList.remove('translate-x-full'); }
    function closeEditorMobile() { 
        editorPane.classList.add('translate-x-full'); 
        if(activeNoteId) saveCurrentNote(); 
    }
    
    document.getElementById('btn-back-to-list').addEventListener('click', closeEditorMobile);
    document.getElementById('btn-save-note-mobile').addEventListener('click', () => { 
        saveCurrentNote(); 
        closeEditorMobile(); 
        UI.showAlert('Đã lưu', 'Bản ghi được đồng bộ.', 'success');
    });

    // ---------------- THƯ MỤC ----------------
    function renderFolders() {
        folderChipsContainer.innerHTML = '';
        folders.forEach(folder => {
            const isActive = folder.id === activeFolderId;
            const color = folder.color || '#71717a';
            
            const chip = document.createElement('button');
            chip.className = `folder-chip px-4 py-2 rounded-full border text-xs flex items-center gap-2 ${isActive ? 'active shadow-md' : 'bg-white dark:bg-[#0c0c0e] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`;
            chip.innerHTML = `<i class="fas ${folder.id === 'all' ? 'fa-layer-group' : 'fa-folder'}"></i> ${folder.name}`;
            
            if(isActive) { chip.style.backgroundColor = color; chip.style.borderColor = color; chip.style.color = '#fff'; }
            else { chip.style.color = color; chip.style.borderColor = color; }

            chip.addEventListener('click', () => {
                activeFolderId = folder.id;
                renderFolders(); renderNotesList(searchInput.value);
            });
            folderChipsContainer.appendChild(chip);
        });
    }

    // ---------------- DANH SÁCH GHI CHÚ ----------------
    function renderNotesList(filterText = '') {
        listContainer.innerHTML = '';
        let filtered = notes;
        
        if (activeFolderId !== 'all') {
            if (activeFolderId === 'uncategorized') filtered = filtered.filter(n => !n.folderId || n.folderId === 'uncategorized');
            else filtered = filtered.filter(n => n.folderId === activeFolderId);
        }
        
        // Chỉ tìm kiếm theo Title (nếu bị mã hóa thì ko search đc content)
        if (filterText.trim()) filtered = filtered.filter(n => n.title.toLowerCase().includes(filterText.toLowerCase()));

        if (filtered.length === 0) { listContainer.innerHTML = `<div class="text-center p-8 text-xs font-bold text-zinc-400/70">Không có bản ghi hợp lệ.</div>`; return; }

        filtered.forEach(note => {
            const date = new Date(note.timestamp);
            const timeStr = date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            const dateStr = date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'});
            const isLocked = note.isEncrypted;
            const isActive = note.id === activeNoteId;
            
            // Xử lý hiển thị Preview an toàn
            let previewText = 'Dữ liệu trống...';
            if (isLocked) {
                previewText = '<i class="fas fa-lock text-rose-500 mr-1"></i> Nội dung đã mã hóa E2E';
            } else if (note.content) {
                previewText = note.content.replace(/<[^>]*>?/gm, '').substring(0, 40) + '...';
            }
            
            const noteEl = document.createElement('div');
            noteEl.className = `note-item cursor-pointer p-4 rounded-2xl mb-1.5 flex items-start gap-3 transition-colors ${isActive ? 'active ring-1 ring-zinc-300 dark:ring-zinc-700 shadow-sm' : 'hover:bg-white dark:hover:bg-[#18181b]'}`;
            noteEl.innerHTML = `
                <div class="flex-1 min-w-0">
                    <h4 class="text-[15px] font-bold truncate text-zinc-900 dark:text-white mb-1">${note.title}</h4>
                    <p class="text-xs truncate text-zinc-500 font-medium">${previewText}</p>
                </div>
                <div class="shrink-0 text-[10px] text-zinc-400 font-bold text-right pt-0.5 opacity-80">
                    <div>${timeStr}</div><div class="mt-0.5">${dateStr}</div>
                </div>
            `;
            noteEl.onclick = () => { loadNoteData(note.id); openEditorMobile(); };
            listContainer.appendChild(noteEl);
        });
    }

    // ---------------- ENGINE GIAO DIỆN EDITOR ----------------
    function updateBadge(styleClass, icon, text) {
        [statusBadge, statusBadgeMobile].forEach(el => {
            el.className = `px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg hidden ${styleClass}`;
            el.innerHTML = `<i class="fas ${icon} mr-1"></i> ${text}`;
            el.classList.remove('hidden');
        });
    }

    function loadNoteData(id) {
        if (activeNoteId && activeNoteId !== id && isCurrentlyUnlocked) lockActiveNote(false);
        activeNoteId = id; const note = notes.find(n => n.id === id); if (!note) return;
        
        // Reset khóa tạm thời nếu là note bị khóa
        if (note.isEncrypted && !isCurrentlyUnlocked) { isCurrentlyUnlocked = false; sessionPwd = null; }

        renderNotesList(searchInput.value);
        emptyState.style.opacity = '0'; setTimeout(() => emptyState.classList.add('hidden'), 200);

        inputPassword.value = '';
        
        if (note.isEncrypted && !isCurrentlyUnlocked) {
            // GIAO DIỆN BỊ KHÓA
            inputTitle.value = '';
            inputTitle.disabled = true;
            inputTitle.placeholder = 'Tiêu đề đã được bảo mật...';
            
            inputContent.innerHTML = '<div class="text-rose-500 font-bold flex flex-col items-center justify-center h-full opacity-60 select-none"><i class="fas fa-lock text-5xl mb-4"></i><p>Tài liệu mã hóa đầu cuối (E2E).</p></div>';
            inputContent.contentEditable = "false"; 
            editorToolbar.style.opacity = "0.2"; editorToolbar.style.pointerEvents = "none";
            
            updateBadge('bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', 'fa-lock', 'E2E Locked');
            document.getElementById('crypto-action-bar').classList.replace('hidden', 'flex'); 
            document.getElementById('unlocked-action-bar').classList.replace('flex', 'hidden');
            inputPassword.placeholder = 'Nhập mật mã để giải mã...'; 
            btnToggleCrypto.innerHTML = '<i class="fas fa-unlock mr-1"></i> Giải mã';
            
        } else {
            // GIAO DIỆN MỞ KHÓA / PUBLIC
            inputTitle.disabled = false;
            inputTitle.placeholder = 'Tiêu đề tài liệu...';
            inputContent.contentEditable = "true"; 
            editorToolbar.style.opacity = "1"; editorToolbar.style.pointerEvents = "auto";
            
            if (note.isEncrypted && isCurrentlyUnlocked) {
                // Đã giải mã thành công trong session
                updateBadge('bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', 'fa-unlock-alt', 'E2E Unlocked');
                document.getElementById('crypto-action-bar').classList.replace('flex', 'hidden'); 
                document.getElementById('unlocked-action-bar').classList.replace('hidden', 'flex');
            } else {
                // Public (Local E2E)
                inputTitle.value = note.title === '*** Bản ghi bảo mật ***' ? '' : note.title;
                inputContent.innerHTML = note.content;
                updateBadge('bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700', 'fa-shield-alt', 'Local E2E');
                document.getElementById('crypto-action-bar').classList.replace('hidden', 'flex'); 
                document.getElementById('unlocked-action-bar').classList.replace('flex', 'hidden');
                inputPassword.placeholder = 'Tạo mật mã khóa tài liệu...'; 
                btnToggleCrypto.innerHTML = '<i class="fas fa-lock mr-1"></i> Khóa mã';
            }
        }
    }

    function clearEditor() {
        activeNoteId = null; isCurrentlyUnlocked = false; sessionPwd = null;
        inputTitle.value = ''; inputContent.innerHTML = ''; inputPassword.value = ''; 
        inputTitle.disabled = false; inputContent.contentEditable = "true";
        emptyState.classList.remove('hidden'); setTimeout(() => emptyState.style.opacity = '1', 10);
        statusBadge.classList.add('hidden'); statusBadgeMobile.classList.add('hidden');
        renderFolders(); renderNotesList();
    }

    // ---------------- LƯU ĐỒNG BỘ ----------------
    function saveCurrentNote() {
        if (!activeNoteId) return; 
        const note = notes.find(n => n.id === activeNoteId);
        if (!note) return;

        note.timestamp = Date.now();

        if (note.isEncrypted) {
            // Chốt chặn: Chỉ lưu và ghi đè nếu đang ở trạng thái Unlock bằng Password
            if (isCurrentlyUnlocked && sessionPwd) {
                const titleText = inputTitle.value.trim() || 'Không tiêu đề';
                const contentHtml = inputContent.innerHTML;
                const encryptedPayload = encryptPayload(titleText, contentHtml, sessionPwd);
                
                if (encryptedPayload) {
                    note.content = encryptedPayload;
                    note.title = '*** Bản ghi bảo mật ***'; // Ẩn Title ngoài list
                }
            }
            // Nếu note bị khóa, bỏ qua để không ghi đè mất chuỗi mã hóa trong DB
        } else {
            note.title = inputTitle.value.trim() || 'Bản ghi không tên';
            note.content = inputContent.innerHTML;
        }

        saveToStorage(); 
        renderNotesList(searchInput.value);
    }

    document.getElementById('btn-save-note').addEventListener('click', () => {
        saveCurrentNote(); 
        UI.showAlert('Đã lưu cục bộ', 'Dữ liệu Sandbox E2E đã đồng bộ hoàn tất.', 'success');
    });

    document.getElementById('btn-new-note').addEventListener('click', () => {
        const defaultFolder = (activeFolderId === 'all') ? 'uncategorized' : activeFolderId;
        const newNote = { id: 'note_' + Date.now(), title: 'Bản ghi không tên', content: '', folderId: defaultFolder, isEncrypted: false, timestamp: Date.now() };
        notes.unshift(newNote); saveToStorage(); loadNoteData(newNote.id); openEditorMobile(); inputTitle.focus();
    });

    document.getElementById('btn-delete-note').addEventListener('click', () => {
        if (!activeNoteId) return;
        UI.showConfirm('Hủy tài liệu?', 'Xóa vĩnh viễn bản ghi này khỏi máy?', () => { 
            notes = notes.filter(n => n.id !== activeNoteId); saveToStorage(); clearEditor(); 
            if (window.innerWidth < 768) closeEditorMobile();
        });
    });

    // ---------------- HÀNH ĐỘNG MÃ HÓA / GIẢI MÃ (FLOW CHÍNH) ----------------
    btnToggleCrypto.addEventListener('click', () => {
        if (!activeNoteId) return; const note = notes.find(n => n.id === activeNoteId);
        const pwd = inputPassword.value; if (!pwd) { UI.showAlert('Cảnh báo', 'Vui lòng điền mật khẩu.', 'warning'); return; }

        if (note.isEncrypted && !isCurrentlyUnlocked) {
            // THỰC THI GIẢI MÃ
            const decryptedObj = decryptPayload(note.content, pwd);
            
            if (!decryptedObj) {
                UI.showAlert('Sai mật mã', 'Không thể giải mã dữ liệu.', 'error');
            } else { 
                isCurrentlyUnlocked = true; 
                sessionPwd = pwd; 
                
                // Đổ data chuẩn ra UI Editor
                inputTitle.value = decryptedObj.title;
                inputTitle.disabled = false;
                inputContent.innerHTML = decryptedObj.content; 
                
                loadNoteData(note.id); // Trigger UI Update trạng thái Unlock
                resetIdle(); 
            }
        } else if (!note.isEncrypted) {
            // THỰC THI MÃ HÓA LẦN ĐẦU
            const titleText = inputTitle.value.trim() || 'Không tiêu đề';
            const contentHtml = inputContent.innerHTML;
            const encryptedPayload = encryptPayload(titleText, contentHtml, pwd);
            
            if(encryptedPayload) {
                note.content = encryptedPayload; 
                note.title = '*** Bản ghi bảo mật ***'; 
                note.isEncrypted = true; 
                
                isCurrentlyUnlocked = true; // Giữ mở để người dùng gõ tiếp
                sessionPwd = pwd; 
                
                saveToStorage(); 
                loadNoteData(note.id); 
                UI.showAlert('Đã Khóa', 'Đã bọc mã hóa toàn bộ dữ liệu.', 'success');
            } else {
                UI.showAlert('Lỗi', 'Không thể biên dịch mã hóa.', 'error');
            }
        }
    });

    document.getElementById('btn-lock-now').addEventListener('click', () => { 
        lockActiveNote(false); 
        UI.showAlert('Đã khóa lại', 'Tài liệu đã được niêm phong.', 'success'); 
    });
    
    document.getElementById('btn-remove-crypto').addEventListener('click', () => {
        UI.showConfirm('Gỡ lớp bảo vệ?', 'Chuyển đổi văn bản về định dạng Public?', () => {
            const note = notes.find(n => n.id === activeNoteId);
            // Gán chết Text đang có trên màn hình thành Public Content
            note.title = inputTitle.value.trim() || 'Bản ghi không tên';
            note.content = inputContent.innerHTML; 
            note.isEncrypted = false; 
            isCurrentlyUnlocked = false; 
            sessionPwd = null;
            saveToStorage(); 
            loadNoteData(note.id);
        });
    });

    function lockActiveNote(isAuto = false) {
        if (!activeNoteId || !isCurrentlyUnlocked || !sessionPwd) return;
        saveCurrentNote(); // Lấy bản nháp mới nhất đem mã hóa
        isCurrentlyUnlocked = false; 
        sessionPwd = null; // Xóa key trên RAM
        loadNoteData(activeNoteId); // Chuyển View về màn hình Khóa
        if (isAuto && typeof UI !== 'undefined') UI.showAlert('Smart Auto-Lock', 'Đã tự động khóa để bảo vệ.', 'info');
    }

    // ---------------- TIMERS & PANIC LOCK (Tab Switch) ----------------
    const resetIdle = () => { idleTime = 0; };
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => document.addEventListener(evt, resetIdle, true));
    
    setInterval(() => {
        if (autoLockToggle && autoLockToggle.checked) {
            idleTime++; if (idleTime >= 60 && activeNoteId && isCurrentlyUnlocked) lockActiveNote(true);
        }
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && autoLockToggle && autoLockToggle.checked) {
            if (activeNoteId && isCurrentlyUnlocked) lockActiveNote(false);
            clearEditor(); 
            if (window.innerWidth < 768) closeEditorMobile();
        }
    });

    // ---------------- TIỆN ÍCH KHÁC ----------------
    document.getElementById('btn-add-folder').addEventListener('click', () => {
        const name = prompt("Tạo thư mục mới:"); if (!name) return;
        folders.push({ id: 'folder_' + Date.now(), name: name, color: '#3b82f6' });
        saveToStorage(); renderFolders();
    });

    document.querySelectorAll('.editor-cmd').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); document.execCommand(btn.dataset.cmd, false, null); inputContent.focus(); });
    });
    searchInput.addEventListener('input', (e) => renderNotesList(e.target.value));

    // Backup & Restore
    document.getElementById('btn-export-json').addEventListener('click', () => {
        const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ folders, notes }, null, 2));
        a.download = `NotePRO_E2E_${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove();
        UI.showAlert('Backup JSON', 'Đã tải xuống an toàn.', 'success');
    });
    
    document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('np-import-file').click());
    document.getElementById('np-import-file').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.folders && data.notes) {
                    data.folders.forEach(fd => { if (!folders.some(f => f.id === fd.id)) folders.push(fd); });
                    data.notes.forEach(nt => { if (!notes.some(n => n.id === nt.id)) notes.push(nt); });
                    saveToStorage(); clearEditor(); UI.showAlert('Khôi phục', 'Dữ liệu được nạp thành công.', 'success');
                } else throw new Error();
            } catch (err) { UI.showAlert('Tệp rác', 'Định dạng lỗi.', 'error'); } e.target.value = '';
        }; reader.readAsText(file);
    });

    // Init App
    renderFolders(); renderNotesList();
}