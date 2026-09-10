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
    <div id="rx-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #rx-root-container {
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

            .rx-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            /* Highlight Flat Badges */
            .rx-mark-1 {
                background-color: color-mix(in srgb, var(--kit-accent) 22%, transparent);
                color: var(--kit-accent);
                border-radius: 6px;
                padding: 1px 4px;
                font-weight: 700;
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--kit-accent) 30%, transparent);
            }
            .rx-mark-2 {
                background-color: rgba(59, 130, 246, 0.18);
                color: #2563eb;
                border-radius: 6px;
                padding: 1px 4px;
                font-weight: 700;
                box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
            }
            .dark .rx-mark-2 {
                background-color: rgba(59, 130, 246, 0.25);
                color: #60a5fa;
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
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Regex Tester</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Kiểm thử biểu thức chính quy thời gian thực, bóc tách capture groups và thay thế chuỗi.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-rx-clear" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-trash-can text-rose-500 text-xs"></i> Đặt lại
                    </button>
                </div>
            </div>

            <!-- PATTERN & FLAGS INPUT CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm space-y-2">
                <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden focus-within:border-accent-theme transition-all">
                    <span class="px-3.5 py-3 text-zinc-400 font-mono text-lg font-black select-none">/</span>
                    <input type="text" id="rx-pattern" 
                        class="rx-input-zen flex-1 bg-transparent border-none outline-none py-3 text-zinc-900 dark:text-white font-mono text-sm sm:text-base font-bold placeholder-zinc-400" 
                        placeholder="Nhập biểu thức... (VD: \\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b)" 
                        value="\\d+">
                    <span class="px-2.5 py-3 text-zinc-400 font-mono text-lg font-black select-none">/</span>
                    <input type="text" id="rx-flags" 
                        class="rx-input-zen w-16 sm:w-20 bg-black/5 dark:bg-white/5 border-none outline-none py-3 text-accent-theme font-mono font-black text-center text-sm tracking-widest placeholder-zinc-400" 
                        placeholder="gmi" 
                        value="gm" 
                        title="Flags: g (global), m (multiline), i (ignore case)">
                </div>

                <div id="rx-error-msg" class="hidden px-2 pt-1 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                    <i class="fas fa-triangle-exclamation text-xs"></i> 
                    <span id="rx-error-text">Cú pháp biểu thức không hợp lệ.</span>
                </div>
            </div>

            <!-- CHEATSHEET CHIPS -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">Mẫu nhanh:</span>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b" data-flag="g">
                        <span class="text-accent-theme font-mono font-bold">@</span> Email
                    </button>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="(84|0[35789])([0-9]{8})\\b" data-flag="g">
                        <span class="text-accent-theme font-mono font-bold">#</span> SĐT VN
                    </button>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="\\d+" data-flag="g">
                        <span class="text-accent-theme font-mono font-bold">123</span> Chữ số
                    </button>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="[A-Z][a-z]+" data-flag="g">
                        <span class="text-accent-theme font-mono font-bold">Aa</span> Viết hoa
                    </button>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="<[^>]+>" data-flag="g">
                        <span class="text-accent-theme font-mono font-bold">&lt;&gt;</span> Thẻ HTML
                    </button>
                    <button class="rx-tag h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0 active:scale-95 transition-all flex items-center gap-1.5" data-pattern="https?:\\/\\/\\S+" data-flag="gi">
                        <span class="text-accent-theme font-mono font-bold">http</span> URL Link
                    </button>
                </div>
            </div>

            <!-- WORKSPACE SPLIT GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- INPUT RAW TEXT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Văn bản kiểm tra (Source)</h3>
                        <span class="text-[10px] text-zinc-400 font-mono">Plain Text</span>
                    </div>

                    <div class="flex-1 flex flex-col min-h-[260px]">
                        <textarea id="rx-text" 
                            class="rx-input-zen flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs sm:text-sm font-mono leading-relaxed text-zinc-900 dark:text-white resize-y custom-scrollbar placeholder-zinc-400 focus:border-accent-theme transition-all" 
                            spellcheck="false" 
                            placeholder="Dán nội dung cần kiểm thử vào đây...">Tôi sinh năm 1995.
Email liên hệ là admin@hunqos.workspace và dev@example.vn.
Số điện thoại: 0901234567.
Mức giá thanh toán là 250,000 VNĐ.</textarea>
                    </div>

                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span id="rx-source-len">0 ký tự</span>
                        <span class="font-mono text-[10px]">UTF-8 Ready</span>
                    </div>
                </div>

                <!-- OUTPUT RESULTS CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-3">
                    
                    <!-- Segmented View Tabs -->
                    <div class="flex items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[12px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-64" id="rx-result-tabs">
                            <button class="tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-1.5" data-target="pane-highlight">
                                Highlight (<span id="rx-count" class="text-accent-theme font-mono font-bold">0</span>)
                            </button>
                            <button class="tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5" data-target="pane-replace">
                                Thay thế
                            </button>
                        </div>

                        <button id="btn-copy-output" class="h-8 px-3 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all">
                            <i class="far fa-copy text-xs"></i> <span>Chép</span>
                        </button>
                    </div>

                    <!-- Highlight Pane -->
                    <div id="pane-highlight" class="rx-pane block flex-1 overflow-y-auto custom-scrollbar p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] font-mono text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words min-h-[220px]"></div>

                    <!-- Replace Pane -->
                    <div id="pane-replace" class="rx-pane hidden flex-1 flex-col space-y-2.5 min-h-[220px]">
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-1 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                            <i class="fas fa-rotate text-zinc-400 ml-3 text-xs"></i>
                            <input type="text" id="rx-replace-str" 
                                class="rx-input-zen w-full bg-transparent border-none outline-none px-2.5 py-1.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" 
                                placeholder="Chuỗi thay thế (Hỗ trợ $1, $2...)">
                        </div>

                        <div id="rx-replace-out" class="flex-1 overflow-y-auto custom-scrollbar p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] font-mono text-xs sm:text-sm leading-relaxed text-zinc-900 dark:text-white whitespace-pre-wrap break-words"></div>
                    </div>

                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span id="rx-status-note">Đồng bộ Highlight thời gian thực</span>
                        <span class="font-mono text-[10px]">Real-time DOM</span>
                    </div>
                </div>

            </div>

            <!-- MATCH & GROUPS EXTRACT CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Danh sách trích xuất chi tiết (Matches & Capture Groups)</h3>
                    <span class="text-[10px] text-zinc-400 font-mono" id="rx-extract-badge">0 kết quả</span>
                </div>

                <div id="rx-details" class="p-1 max-h-[260px] overflow-y-auto custom-scrollbar space-y-1.5">
                    <div class="text-center text-xs font-medium text-zinc-400 py-10">Không có kết quả trùng khớp.</div>
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
    const rootContainer = hostElement.querySelector('#rx-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query Elements
    const inPattern = hostElement.querySelector('#rx-pattern');
    const inFlags = hostElement.querySelector('#rx-flags');
    const inText = hostElement.querySelector('#rx-text');
    const inReplace = hostElement.querySelector('#rx-replace-str');
    
    const outHighlight = hostElement.querySelector('#pane-highlight');
    const outReplace = hostElement.querySelector('#rx-replace-out');
    
    const matchCount = hostElement.querySelector('#rx-count');
    const detailsBox = hostElement.querySelector('#rx-details');
    const rxExtractBadge = hostElement.querySelector('#rx-extract-badge');
    const rxSourceLen = hostElement.querySelector('#rx-source-len');
    
    const errorContainer = hostElement.querySelector('#rx-error-msg');
    const errorText = hostElement.querySelector('#rx-error-text');
    const btnClear = hostElement.querySelector('#btn-rx-clear');
    const btnCopyOutput = hostElement.querySelector('#btn-copy-output');
    
    const tabBtns = hostElement.querySelectorAll('#rx-result-tabs .tab-btn');
    const panes = hostElement.querySelectorAll('.rx-pane');
    const insertTags = hostElement.querySelectorAll('.rx-tag');

    let currentResultTab = 'pane-highlight';

    // HTML Sanitizer
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    };

    // Segmented Tabs
    const activeClass = 'tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-1.5';
    const inactiveClass = 'tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5';

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => { b.className = inactiveClass; });
            btn.className = activeClass;

            currentResultTab = btn.dataset.target;
            panes.forEach(p => {
                p.classList.remove('block', 'flex');
                p.classList.add('hidden');
            });

            const target = hostElement.querySelector(`#${currentResultTab}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add(currentResultTab === 'pane-replace' ? 'flex' : 'block');
            }
        });
    });

    // Core Evaluate
    const evaluateRegex = () => {
        const pattern = inPattern.value;
        const flags = inFlags.value;
        const text = inText.value;
        const replaceStr = inReplace.value;

        rxSourceLen.textContent = `${text.length.toLocaleString()} ký tự`;
        errorContainer.classList.add('hidden');

        if (!pattern) {
            outHighlight.innerHTML = escapeHTML(text);
            outReplace.innerHTML = escapeHTML(text);
            matchCount.textContent = '0';
            rxExtractBadge.textContent = '0 kết quả';
            detailsBox.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-10">Vui lòng nhập biểu thức chính quy.</div>';
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            errorText.textContent = e.message;
            errorContainer.classList.remove('hidden');
            
            outHighlight.innerHTML = escapeHTML(text);
            outReplace.innerHTML = escapeHTML(text);
            matchCount.textContent = 'Lỗi';
            rxExtractBadge.textContent = 'Cú pháp sai';
            detailsBox.innerHTML = '<div class="text-center text-xs font-semibold text-rose-500 py-10">Cú pháp biểu thức không hợp lệ.</div>';
            return;
        }

        // Replace
        try {
            outReplace.innerHTML = escapeHTML(text.replace(regex, replaceStr));
        } catch (e) {
            outReplace.innerHTML = 'Lỗi khi thay thế chuỗi.';
        }

        // Highlight & Match details
        let match;
        let resultHTML = "";
        let detailsHTML = "";
        let count = 0;
        let lastCursor = 0;

        const isGlobal = regex.global;
        regex.lastIndex = 0;
        const MAX_MATCHES = 1500;

        while ((match = regex.exec(text)) !== null) {
            count++;
            
            const markClass = count % 2 === 0 ? 'rx-mark-2' : 'rx-mark-1';
            resultHTML += escapeHTML(text.substring(lastCursor, match.index));
            resultHTML += `<span class="${markClass}">${escapeHTML(match[0])}</span>`;
            
            lastCursor = regex.lastIndex;

            if (count <= 100) { 
                let groupsHtml = '';
                if (match.length > 1) {
                    for (let i = 1; i < match.length; i++) {
                        if (match[i] !== undefined) {
                            groupsHtml += `
                                <div class="text-[11px] text-zinc-500 font-mono mt-1 ml-6 flex items-center gap-1.5">
                                    <span class="text-accent-theme font-bold">Group ${i}:</span> 
                                    <span class="text-zinc-800 dark:text-zinc-200">"${escapeHTML(match[i])}"</span>
                                </div>`;
                        }
                    }
                }
                detailsHTML += `
                    <div class="p-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] cursor-pointer hover:border-black/[0.12] dark:hover:border-white/[0.15] active:scale-[0.99] transition-all group match-item" data-val="${escapeHTML(match[0])}">
                        <div class="flex items-center gap-2.5">
                            <span class="px-2 py-0.5 bg-accent-theme-alpha text-accent-theme rounded-[8px] text-[10px] font-mono font-bold shrink-0">#${count}</span>
                            <div class="text-xs font-mono font-bold text-zinc-900 dark:text-white truncate flex-1">"${escapeHTML(match[0])}"</div>
                            <i class="far fa-copy text-zinc-400 group-hover:text-accent-theme text-xs shrink-0 transition-colors"></i>
                        </div>
                        ${groupsHtml}
                    </div>`;
            }

            if (!isGlobal) break;
            if (regex.lastIndex === match.index) regex.lastIndex++;
            if (count > MAX_MATCHES) {
                detailsHTML += `<div class="text-center text-xs font-medium text-zinc-400 py-3">Đã đạt giới hạn tối đa ${MAX_MATCHES} kết quả.</div>`;
                break; 
            }
        }

        resultHTML += escapeHTML(text.substring(lastCursor));

        outHighlight.innerHTML = resultHTML || escapeHTML(text);
        matchCount.textContent = count;
        rxExtractBadge.textContent = `${count} kết quả`;

        if (count === 0) {
            detailsBox.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-10">Không có kết quả trùng khớp.</div>';
        } else {
            detailsBox.innerHTML = detailsHTML;
            detailsBox.querySelectorAll('.match-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const val = item.dataset.val;
                    try {
                        const rawVal = val.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                        await navigator.clipboard.writeText(rawVal);
                        IslandKit.notify('Đã sao chép', `"${rawVal}" đã lưu vào bộ nhớ tạm.`, 'success', 1200);
                    } catch (e) {}
                });
            });
        }
    };

    // Listeners
    inPattern?.addEventListener('input', evaluateRegex);
    inFlags?.addEventListener('input', evaluateRegex);
    inText?.addEventListener('input', evaluateRegex);
    inReplace?.addEventListener('input', evaluateRegex);

    // Sync scroll
    inText?.addEventListener('scroll', () => {
        const percentage = inText.scrollTop / (inText.scrollHeight - inText.clientHeight);
        if (outHighlight.scrollHeight > outHighlight.clientHeight) {
            outHighlight.scrollTop = percentage * (outHighlight.scrollHeight - outHighlight.clientHeight);
        }
    });

    btnClear?.addEventListener('click', () => {
        inPattern.value = '';
        inText.value = '';
        inReplace.value = '';
        inText.focus();
        evaluateRegex();
        IslandKit.notify('Đã đặt lại', 'Đã xóa trắng các trường nhập liệu.', 'info');
    });

    btnCopyOutput?.addEventListener('click', async () => {
        const isReplace = currentResultTab === 'pane-replace';
        const targetText = isReplace ? outReplace.textContent : outHighlight.textContent;
        
        if (!targetText) return;
        try {
            await navigator.clipboard.writeText(targetText);
            IslandKit.notify('Đã sao chép', `Đã lưu kết quả ${isReplace ? 'thay thế' : 'văn bản'} vào bộ nhớ tạm.`, 'success');
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    });

    // Preset Tags
    insertTags.forEach(tag => {
        tag.addEventListener('click', () => {
            inPattern.value = tag.dataset.pattern;
            inFlags.value = tag.dataset.flag;
            evaluateRegex();
            IslandKit.notify('Đã nạp mẫu', 'Biểu thức mẫu đã được áp dụng.', 'info');
        });
    });

    evaluateRegex();
}