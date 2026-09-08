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

            .flat-btn { transition: transform 0.1s; user-select: none; }
            .flat-btn:active { transform: scale(0.95); }

            .vsc-opt-btn.active {
                background-color: #3b82f6 !important;
                color: #ffffff !important;
                border-color: #3b82f6 !important;
            }
        </style>

        <div class="relative flex flex-col w-full max-w-[1080px] mx-auto min-h-[500px]">
            
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Phân Tích & Xử Lý Văn Bản</h2>
                    <p class="text-xs text-zinc-500 mt-1 font-medium">Đếm số liệu, định dạng nhanh và tìm kiếm thay thế hàng loạt chuẩn VS Code.</p>
                </div>
                <div class="flex gap-2">
                    <button class="flat-btn h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-tc-toggle-replace" title="Tìm & Thay thế (Ctrl+H)">
                        <i class="fas fa-exchange-alt"></i> <span class="hidden sm:inline">Tìm & Thay thế</span>
                    </button>
                    <button class="flat-btn h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-tc-paste" title="Dán văn bản">
                        <i class="fas fa-paste"></i> Dán
                    </button>
                    <button class="flat-btn h-9 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-tc-clear" title="Xóa nội dung">
                        <i class="fas fa-trash-alt"></i> Xóa
                    </button>
                </div>
            </div>

            <!-- VS CODE STYLE SEARCH & REPLACE PANEL -->
            <div id="vsc-replace-panel" class="mb-4 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    <!-- Search Input Box -->
                    <div class="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-blue-500">
                        <i class="fas fa-search text-zinc-400 text-xs"></i>
                        <input id="vsc-find-input" type="text" placeholder="Tìm kiếm..." class="w-full bg-transparent border-none outline-none text-xs font-mono text-zinc-900 dark:text-white" />
                        <span id="vsc-match-count" class="text-[10px] font-mono text-zinc-400 shrink-0 select-none">0/0</span>
                        <div class="flex items-center gap-1 shrink-0 ml-1 border-l border-zinc-200 dark:border-zinc-700 pl-2">
                            <button id="opt-case" class="vsc-opt-btn px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Khớp hoa thường (Match Case)">Aa</button>
                            <button id="opt-word" class="vsc-opt-btn px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Khớp nguyên từ (Whole Word)">\b</button>
                            <button id="opt-regex" class="vsc-opt-btn px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Biểu thức chính quy (Regex)">.*</button>
                        </div>
                    </div>

                    <!-- Replace Input Box -->
                    <div class="flex items-center gap-2">
                        <div class="flex-1 flex items-center gap-1.5 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-blue-500">
                            <i class="fas fa-pen text-zinc-400 text-xs"></i>
                            <input id="vsc-replace-input" type="text" placeholder="Thay thế bằng..." class="w-full bg-transparent border-none outline-none text-xs font-mono text-zinc-900 dark:text-white" />
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button id="btn-vsc-replace-one" class="flat-btn px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold" title="Thay thế từ đầu tiên">Thay thế</button>
                            <button id="btn-vsc-replace-all" class="flat-btn px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold" title="Thay thế toàn bộ">Thay tất cả</button>
                        </div>
                    </div>

                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-7 flex flex-col gap-4">
                    
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                        <textarea id="tc-input" class="w-full h-[350px] lg:h-[450px] bg-transparent border-none outline-none p-5 text-sm font-medium leading-relaxed text-zinc-900 dark:text-white resize-y custom-scrollbar" placeholder="Nhập hoặc dán văn bản cần xử lý vào đây..."></textarea>
                        
                        <!-- TOOLBAR ĐỊNH DẠNG MỞ RỘNG -->
                        <div class="px-4 py-3 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Định dạng & Chuyển đổi</span>
                                <span class="text-[10px] text-zinc-400 font-medium">Cuộn ngang xem thêm</span>
                            </div>
                            <div class="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="trim">Gọn khoảng trắng</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="remove-lines">Xóa dòng trống</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="remove-vietnamese">Bỏ dấu tiếng Việt</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="upper">IN HOA</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="lower">in thường</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="capitalize">Hoa Từng Từ</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="camel">camelCase</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="kebab">kebab-case</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="snake">snake_case</button>
                                <button class="tc-action-btn flat-btn px-2.5 py-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap" data-action="reverse">Đảo ngược</button>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="lg:col-span-5 flex flex-col gap-4">
                    
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5">
                        <h3 class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Chỉ số cơ bản</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Số từ (Words)</span>
                                <span class="text-3xl font-black text-blue-500 font-mono tracking-tighter" id="stat-words">0</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Ký tự (Có khoảng trắng)</span>
                                <span class="text-3xl font-black text-emerald-500 font-mono tracking-tighter" id="stat-chars">0</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-2 mt-3">
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Ký tự<br>(Bỏ trống)</span>
                                <span class="text-lg font-bold text-zinc-900 dark:text-white font-mono" id="stat-chars-no-space">0</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Số câu<br>(Sentences)</span>
                                <span class="text-lg font-bold text-zinc-900 dark:text-white font-mono" id="stat-sentences">0</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Đoạn văn<br>(Paragraphs)</span>
                                <span class="text-lg font-bold text-zinc-900 dark:text-white font-mono" id="stat-paragraphs">0</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Số dòng<br>(Lines)</span>
                                <span class="text-lg font-bold text-zinc-900 dark:text-white font-mono" id="stat-lines">0</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5">
                        <h3 class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Ước tính thời gian</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><i class="fas fa-book-open"></i></div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thời gian đọc</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="stat-read-time">0 phút 0 giây</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><i class="fas fa-microphone-alt"></i></div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thời gian nói</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="stat-speak-time">0 phút 0 giây</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col flex-1 min-h-[200px]">
                        <h3 class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">Top từ lặp lại (Mật độ từ khóa)</h3>
                        <div id="keyword-list" class="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                            <div class="text-center text-[11px] font-medium text-zinc-400 py-6 opacity-50">Vui lòng nhập văn bản dài hơn để phân tích.</div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- DOM ELEMENTS ---
    const input = document.getElementById('tc-input');
    const btnClear = document.getElementById('btn-tc-clear');
    const btnPaste = document.getElementById('btn-tc-paste');
    const actionBtns = document.querySelectorAll('.tc-action-btn');

    const sWords = document.getElementById('stat-words');
    const sChars = document.getElementById('stat-chars');
    const sCharsNoSpace = document.getElementById('stat-chars-no-space');
    const sSentences = document.getElementById('stat-sentences');
    const sParagraphs = document.getElementById('stat-paragraphs');
    const sLines = document.getElementById('stat-lines');
    const sReadTime = document.getElementById('stat-read-time');
    const sSpeakTime = document.getElementById('stat-speak-time');
    const kwList = document.getElementById('keyword-list');

    // --- FIND & REPLACE ELEMENTS ---
    const btnToggleReplace = document.getElementById('btn-tc-toggle-replace');
    const vscPanel = document.getElementById('vsc-replace-panel');
    const findInput = document.getElementById('vsc-find-input');
    const replaceInput = document.getElementById('vsc-replace-input');
    const matchCountEl = document.getElementById('vsc-match-count');
    const optCase = document.getElementById('opt-case');
    const optWord = document.getElementById('opt-word');
    const optRegex = document.getElementById('opt-regex');
    const btnReplaceOne = document.getElementById('btn-vsc-replace-one');
    const btnReplaceAll = document.getElementById('btn-vsc-replace-all');

    const stopWords = new Set(['và', 'của', 'là', 'có', 'trong', 'để', 'với', 'cho', 'không', 'các', 'một', 'những', 'được', 'người', 'khi', 'này', 'đã', 'sẽ', 'như', 'tại', 'thì', 'cũng', 'bởi', 'vào', 'ra', 'lại', 'còn', 'đến', 'từ', 'rằng']);

    // --- CORE LOGIC ---
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const formatTime = (minutesFloat) => {
        if (minutesFloat === 0) return '0 phút 0 giây';
        const m = Math.floor(minutesFloat);
        const s = Math.round((minutesFloat - m) * 60);
        return `${m} phút ${s} giây`;
    };

    const stripVietnamese = (str) => {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const analyzeText = () => {
        const text = input.value;
        const trimmed = text.trim();

        if (trimmed.length === 0) {
            sWords.textContent = '0';
            sChars.textContent = '0';
            sCharsNoSpace.textContent = '0';
            sSentences.textContent = '0';
            sParagraphs.textContent = '0';
            sLines.textContent = '0';
            sReadTime.textContent = '0 phút 0 giây';
            sSpeakTime.textContent = '0 phút 0 giây';
            kwList.innerHTML = '<div class="text-center text-[11px] font-medium text-zinc-400 py-6 opacity-50">Vui lòng nhập văn bản dài hơn để phân tích.</div>';
            updateMatchCount();
            return;
        }

        sChars.textContent = formatNumber(text.length);
        sCharsNoSpace.textContent = formatNumber(text.replace(/\s/g, '').length);
        sLines.textContent = formatNumber(text.split('\n').length);
        sParagraphs.textContent = formatNumber(text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length);
        sSentences.textContent = formatNumber(text.split(/[.!?]+/).filter(s => s.trim().length > 0).length);

        const wordsArr = trimmed.split(/\s+/).filter(w => w.length > 0);
        const wordCount = wordsArr.length;
        sWords.textContent = formatNumber(wordCount);

        sReadTime.textContent = formatTime(wordCount / 200);
        sSpeakTime.textContent = formatTime(wordCount / 130);

        calculateKeywords(wordsArr, wordCount);
        updateMatchCount();
    };

    const calculateKeywords = (wordsArr, totalWords) => {
        if (totalWords < 5) {
            kwList.innerHTML = '<div class="text-center text-[11px] font-medium text-zinc-400 py-6 opacity-50">Chưa đủ dữ liệu từ vựng.</div>';
            return;
        }

        const frequency = {};
        wordsArr.forEach(word => {
            let cleanWord = word.toLowerCase().replace(/[.,!?;:"()\[\]{}']/g, '');
            if (cleanWord.length > 1 && !stopWords.has(cleanWord)) {
                frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
            }
        });

        const sortedKw = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedKw.length === 0) {
            kwList.innerHTML = '<div class="text-center text-[11px] font-medium text-zinc-400 py-6 opacity-50">Không tìm thấy từ khóa nổi bật.</div>';
            return;
        }

        let html = '';
        sortedKw.forEach(([word, count]) => {
            const percentage = ((count / totalWords) * 100).toFixed(1);
            html += `
                <div class="flex items-center justify-between bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
                    <span class="text-xs font-bold text-zinc-900 dark:text-white truncate pr-2">"${word}"</span>
                    <div class="flex items-center gap-3 shrink-0">
                        <span class="text-[11px] font-mono text-zinc-500">${count} lần</span>
                        <span class="text-[10px] font-bold text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">${percentage}%</span>
                    </div>
                </div>
            `;
        });

        kwList.innerHTML = html;
    };

    // --- FIND & REPLACE LOGIC ---
    const buildRegex = (global = true) => {
        const query = findInput.value;
        if (!query) return null;

        const isCase = optCase.classList.contains('active');
        const isWord = optWord.classList.contains('active');
        const isRegex = optRegex.classList.contains('active');

        let pattern = query;
        if (!isRegex) {
            // Escape ký tự regex đặc biệt
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        if (isWord) {
            pattern = `\\b${pattern}\\b`;
        }

        let flags = isCase ? '' : 'i';
        if (global) flags += 'g';

        try {
            return new RegExp(pattern, flags);
        } catch (e) {
            return null;
        }
    };

    const updateMatchCount = () => {
        const re = buildRegex(true);
        if (!re || !input.value) {
            matchCountEl.textContent = '0/0';
            return;
        }
        const matches = input.value.match(re);
        const count = matches ? matches.length : 0;
        matchCountEl.textContent = `${count} kết quả`;
    };

    const executeReplace = (all = false) => {
        const re = buildRegex(all);
        if (!re) {
            UI.showAlert('Thông báo', 'Vui lòng nhập mẫu tìm kiếm hợp lệ.', 'warning');
            return;
        }

        const currentText = input.value;
        const replacement = replaceInput.value || '';
        
        if (all) {
            const matches = currentText.match(re);
            const count = matches ? matches.length : 0;
            input.value = currentText.replace(re, replacement);
            UI.showAlert('Hoàn tất', `Đã thay thế ${count} vị trí phù hợp.`, 'success');
        } else {
            input.value = currentText.replace(re, replacement);
        }

        analyzeText();
    };

    // --- EVENT LISTENERS ---
    input.addEventListener('input', analyzeText);

    btnClear.addEventListener('click', () => {
        if (!input.value) return;
        UI.showConfirm('Xóa sạch', 'Bạn có chắc chắn muốn xóa toàn bộ văn bản?', () => {
            input.value = '';
            analyzeText();
            input.focus();
        });
    });

    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                const start = input.selectionStart;
                const end = input.selectionEnd;
                input.value = input.value.substring(0, start) + text + input.value.substring(end);
                analyzeText();
            }
        } catch (e) {
            UI.showAlert('Lỗi', 'Trình duyệt chặn quyền dán. Hãy dùng phím tắt Ctrl+V.', 'error');
        }
    });

    btnToggleReplace.addEventListener('click', () => {
        findInput.focus();
        findInput.select();
    });

    // Shortcut Ctrl+H hoặc Cmd+H để mở tìm kiếm
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            findInput.focus();
            findInput.select();
        }
    });

    [optCase, optWord, optRegex].forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            updateMatchCount();
        });
    });

    findInput.addEventListener('input', updateMatchCount);
    btnReplaceOne.addEventListener('click', () => executeReplace(false));
    btnReplaceAll.addEventListener('click', () => executeReplace(true));

    // Toolbar Quick Formatting Actions
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            let text = input.value;
            if (!text) return;

            switch (action) {
                case 'trim':
                    text = text.replace(/[ \t]+/g, ' ').replace(/^\s*[\r\n]/gm, '').trim();
                    break;
                case 'remove-lines':
                    text = text.split('\n').filter(line => line.trim().length > 0).join('\n');
                    break;
                case 'remove-vietnamese':
                    text = stripVietnamese(text);
                    break;
                case 'upper':
                    text = text.toUpperCase();
                    break;
                case 'lower':
                    text = text.toLowerCase();
                    break;
                case 'capitalize':
                    text = text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
                    break;
                case 'camel':
                    text = stripVietnamese(text)
                        .replace(/[^a-zA-Z0-9 ]/g, ' ')
                        .trim()
                        .split(/\s+/)
                        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join('');
                    break;
                case 'kebab':
                    text = stripVietnamese(text)
                        .replace(/[^a-zA-Z0-9]/g, ' ')
                        .trim()
                        .split(/\s+/)
                        .join('-')
                        .toLowerCase();
                    break;
                case 'snake':
                    text = stripVietnamese(text)
                        .replace(/[^a-zA-Z0-9]/g, ' ')
                        .trim()
                        .split(/\s+/)
                        .join('_')
                        .toLowerCase();
                    break;
                case 'reverse':
                    text = text.split('').reverse().join('');
                    break;
            }

            input.value = text;
            analyzeText();
        });
    });

    analyzeText();
}