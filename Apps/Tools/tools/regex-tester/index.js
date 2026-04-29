import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            /* Highlight Flat Style */
            .rx-mark-1 { background-color: rgba(59, 130, 246, 0.15); color: #2563eb; border-radius: 4px; padding: 0 2px; font-weight: 600; }
            .dark .rx-mark-1 { background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; }
            
            .rx-mark-2 { background-color: rgba(16, 185, 129, 0.15); color: #059669; border-radius: 4px; padding: 0 2px; font-weight: 600; }
            .dark .rx-mark-2 { background-color: rgba(16, 185, 129, 0.2); color: #34d399; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[500px]">
            
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Regex Tester</h2>
                    <p class="text-xs text-zinc-500 mt-1 font-medium">Kiểm tra và thay thế Biểu thức chính quy (Real-time).</p>
                </div>
                <button class="h-9 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform" id="btn-rx-clear">
                    <i class="fas fa-trash-alt"></i> Xóa
                </button>
            </div>

            <div class="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-[20px] flex items-stretch overflow-hidden mb-1 focus-within:border-zinc-900 dark:focus-within:border-white transition-colors">
                <div class="px-4 py-4 bg-zinc-50 dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 font-mono text-xl font-bold select-none">/</div>
                <input type="text" id="rx-pattern" class="flex-1 bg-transparent border-none outline-none px-4 py-4 text-zinc-900 dark:text-white font-mono text-base md:text-lg placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="Nhập biểu thức (VD: \\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b)" value="\\d+">
                <div class="px-3 py-4 bg-zinc-50 dark:bg-[#121214] border-l border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 font-mono text-xl font-bold select-none">/</div>
                <input type="text" id="rx-flags" class="w-16 md:w-20 bg-zinc-50 dark:bg-[#121214] border-none outline-none px-2 py-4 text-emerald-500 dark:text-emerald-400 font-mono font-bold text-center text-base tracking-widest placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="gmi" value="gm" title="Flags (g: global, m: multiline, i: ignore case)">
            </div>
            
            <div id="rx-error-msg" class="hidden px-2 mb-4 text-xs font-bold text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i> <span id="rx-error-text">Lỗi cú pháp</span></div>
            <div class="mb-5"></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden h-[300px] md:h-[400px]">
                    <div class="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] flex justify-between items-center">
                        <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Văn bản kiểm tra</span>
                    </div>
                    <textarea id="rx-text" class="flex-1 w-full bg-transparent border-none outline-none p-5 text-sm font-mono leading-relaxed text-zinc-900 dark:text-white resize-none custom-scrollbar" spellcheck="false" placeholder="Dán văn bản cần kiểm thử vào đây...">Tôi sinh năm 1995.
Email của tôi là admin@example.com và contact@company.vn.
Số điện thoại: 0901234567.
Giá sản phẩm là 250,000 VNĐ.</textarea>
                </div>

                <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden h-[300px] md:h-[400px]">
                    
                    <div class="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
                        <button class="rx-tab-btn active flex-1 py-3 px-4 text-[11px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-target="pane-highlight">Highlight (<span id="rx-count" class="text-blue-500">0</span>)</button>
                        <button class="rx-tab-btn flex-1 py-3 px-4 text-[11px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-target="pane-replace">Thay thế (Replace)</button>
                    </div>

                    <div id="pane-highlight" class="rx-pane block flex-1 overflow-y-auto custom-scrollbar p-5 font-mono text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap word-wrap break-word">
                        </div>

                    <div id="pane-replace" class="rx-pane hidden flex-1 flex flex-col">
                        <div class="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
                            <input type="text" id="rx-replace-str" class="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-mono text-zinc-900 dark:text-white transition-colors" placeholder="Nhập chuỗi thay thế (Hỗ trợ $1, $2...)">
                        </div>
                        <div id="rx-replace-out" class="flex-1 overflow-y-auto custom-scrollbar p-5 font-mono text-sm leading-relaxed text-zinc-900 dark:text-white whitespace-pre-wrap word-wrap break-word">
                            </div>
                    </div>
                </div>

            </div>

            <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden mb-4">
                <div class="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
                    <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Danh sách trích xuất (Match & Groups)</span>
                </div>
                <div id="rx-details" class="p-2 max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    <div class="text-center text-[11px] font-medium text-zinc-400 py-10 opacity-50">Không có kết quả.</div>
                </div>
            </div>

            <div class="bg-zinc-50 dark:bg-[#121214] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5">
                <div class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3"><i class="fas fa-bolt text-yellow-500 mr-1"></i> Chèn nhanh (Cheatsheet)</div>
                <div class="flex flex-wrap gap-2">
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" data-flag="g"><span class="font-mono font-bold text-red-500">Email</span></button>
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="(84|0[3|5|7|8|9])+([0-9]{8})\\b" data-flag="g"><span class="font-mono font-bold text-red-500">Phone VN</span></button>
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="\\d+" data-flag="g"><span class="font-mono font-bold text-red-500">\\d+</span> Số</button>
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="[A-Z][a-z]+" data-flag="g"><span class="font-mono font-bold text-red-500">[A-Z]</span> Viết hoa</button>
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="<[^>]+>" data-flag="g"><span class="font-mono font-bold text-red-500">&lt;.*&gt;</span> Thẻ HTML</button>
                    <button class="rx-tag px-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors flex items-center gap-2" data-pattern="\\b(https?:\\/\\/\\S+)" data-flag="gi"><span class="font-mono font-bold text-red-500">URL</span> Link</button>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- DOM ELEMENTS ---
    const inPattern = document.getElementById('rx-pattern');
    const inFlags = document.getElementById('rx-flags');
    const inText = document.getElementById('rx-text');
    const inReplace = document.getElementById('rx-replace-str');
    
    const outHighlight = document.getElementById('pane-highlight');
    const outReplace = document.getElementById('rx-replace-out');
    
    const matchCount = document.getElementById('rx-count');
    const detailsBox = document.getElementById('rx-details');
    
    const errorContainer = document.getElementById('rx-error-msg');
    const errorText = document.getElementById('rx-error-text');
    const btnClear = document.getElementById('btn-rx-clear');
    
    const tabBtns = document.querySelectorAll('.rx-tab-btn');
    const panes = document.querySelectorAll('.rx-pane');
    const insertTags = document.querySelectorAll('.rx-tag');

    // --- UTILS ---
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    };

    // --- LOGIC TABS ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
                b.classList.add('text-zinc-400', 'border-transparent');
            });
            btn.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
            btn.classList.remove('text-zinc-400', 'border-transparent');

            const targetId = btn.dataset.target;
            panes.forEach(p => {
                p.classList.remove('block'); p.classList.add('hidden');
            });
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // --- CORE LOGIC ---
    const evaluateRegex = () => {
        const pattern = inPattern.value;
        const flags = inFlags.value;
        const text = inText.value;
        const replaceStr = inReplace.value;

        // Reset trạng thái lỗi
        errorContainer.classList.add('hidden');
        inPattern.parentElement.classList.remove('border-red-500');
        
        if (!pattern) {
            outHighlight.innerHTML = escapeHTML(text);
            outReplace.innerHTML = escapeHTML(text);
            matchCount.textContent = '0';
            detailsBox.innerHTML = '<div class="text-center text-[11px] font-medium text-zinc-400 py-10 opacity-50">Vui lòng nhập biểu thức.</div>';
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            inPattern.parentElement.classList.add('border-red-500');
            errorText.textContent = e.message;
            errorContainer.classList.remove('hidden');
            
            outHighlight.innerHTML = escapeHTML(text);
            outReplace.innerHTML = escapeHTML(text);
            matchCount.textContent = 'Lỗi';
            detailsBox.innerHTML = '';
            return;
        }

        // Xử lý Thay thế (Replace)
        try {
            outReplace.innerHTML = escapeHTML(text.replace(regex, replaceStr));
        } catch (e) {
            outReplace.innerHTML = 'Lỗi khi thay thế.';
        }

        // Xử lý Highlight và Trích xuất
        let match;
        let resultHTML = "";
        let detailsHTML = "";
        let count = 0;
        let lastCursor = 0;

        const isGlobal = regex.global;
        regex.lastIndex = 0; 
        const MAX_MATCHES = 2000;

        while ((match = regex.exec(text)) !== null) {
            count++;
            
            // Xử lý Highlight (Dùng class chẵn/lẻ để phân biệt 2 match sát nhau)
            const markClass = count % 2 === 0 ? 'rx-mark-2' : 'rx-mark-1';
            resultHTML += escapeHTML(text.substring(lastCursor, match.index));
            resultHTML += `<span class="${markClass}">${escapeHTML(match[0])}</span>`;
            
            lastCursor = regex.lastIndex;

            // Xử lý List trích xuất chi tiết
            if (count <= 100) { 
                let groupsHtml = '';
                if (match.length > 1) {
                    for(let i = 1; i < match.length; i++) {
                        if(match[i] !== undefined) {
                            groupsHtml += `<div class="text-[11px] text-zinc-500 mt-0.5 ml-8"><span class="font-bold text-emerald-500">Group ${i}:</span> "${escapeHTML(match[i])}"</div>`;
                        }
                    }
                }
                detailsHTML += `
                    <div class="p-3 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer active:bg-zinc-50 dark:active:bg-[#121214] transition-colors group match-item" data-val="${escapeHTML(match[0])}">
                        <div class="flex items-center gap-3">
                            <div class="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold shrink-0">#${count}</div>
                            <div class="text-sm font-mono font-bold text-zinc-900 dark:text-white truncate flex-1">"${escapeHTML(match[0])}"</div>
                            <i class="far fa-copy text-zinc-300 dark:text-zinc-700 group-active:text-zinc-600 dark:group-active:text-zinc-400 text-xs shrink-0"></i>
                        </div>
                        ${groupsHtml}
                    </div>`;
            }

            if (!isGlobal) break;
            if (regex.lastIndex === match.index) regex.lastIndex++;
            if (count > MAX_MATCHES) {
                detailsHTML += `<div class="text-center text-[11px] font-medium text-zinc-400 py-4 opacity-50">Đã đạt giới hạn hiển thị ${MAX_MATCHES} kết quả.</div>`;
                break; 
            }
        }

        resultHTML += escapeHTML(text.substring(lastCursor));

        // Cập nhật DOM
        outHighlight.innerHTML = resultHTML || escapeHTML(text);
        matchCount.textContent = count;
        matchCount.className = count > 0 ? 'text-blue-500' : 'text-zinc-400';
        
        if (count === 0) {
            detailsBox.innerHTML = '<div class="text-center text-[11px] font-medium text-zinc-400 py-10 opacity-50">Không có kết quả trùng khớp.</div>';
        } else {
            detailsBox.innerHTML = detailsHTML;
            // Gắn sự kiện copy cho từng item
            detailsBox.querySelectorAll('.match-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const val = item.dataset.val;
                    try {
                        // Un-escape để copy bản gốc
                        const rawVal = val.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                        await navigator.clipboard.writeText(rawVal);
                        UI.showAlert('Đã chép', `Đã sao chép: "${rawVal}"`, 'success', 1000);
                    } catch(e){}
                });
            });
        }
    };

    // --- EVENT LISTENERS ---
    
    // Auto-calculate khi gõ
    inPattern.addEventListener('input', evaluateRegex);
    inFlags.addEventListener('input', evaluateRegex);
    inText.addEventListener('input', evaluateRegex);
    inReplace.addEventListener('input', evaluateRegex);

    // Đồng bộ cuộn (Sync Scroll)
    inText.addEventListener('scroll', () => {
        const percentage = inText.scrollTop / (inText.scrollHeight - inText.clientHeight);
        // Sync to Highlight
        if(outHighlight.scrollHeight > outHighlight.clientHeight) {
            outHighlight.scrollTop = percentage * (outHighlight.scrollHeight - outHighlight.clientHeight);
        }
    });

    // Nút Clear
    btnClear.addEventListener('click', () => {
        inPattern.value = '';
        inText.value = '';
        inReplace.value = '';
        inText.focus();
        evaluateRegex();
    });

    // Cheatsheet
    insertTags.forEach(tag => {
        tag.addEventListener('click', () => {
            inPattern.value = tag.dataset.pattern;
            inFlags.value = tag.dataset.flag;
            evaluateRegex();
        });
    });

    // Khởi chạy lần đầu
    evaluateRegex();
}