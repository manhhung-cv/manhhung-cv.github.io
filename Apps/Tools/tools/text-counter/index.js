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
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="tc-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #tc-root-container {
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

            .tc-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .vsc-opt-btn.active {
                background-color: var(--kit-accent) !important;
                color: #ffffff !important;
                border-color: transparent !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Workspace</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Phân Tích Văn Bản</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Đếm số lượng, định dạng chuyển đổi chuỗi và tìm kiếm thay thế chuẩn VS Code.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-tc-paste" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-paste text-xs"></i> <span>Dán</span>
                    </button>
                    <button id="btn-tc-clear" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-trash-can text-xs"></i> <span>Xóa</span>
                    </button>
                </div>
            </div>

            <!-- VS CODE STYLE SEARCH & REPLACE PANEL -->
            <div id="vsc-replace-panel" class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tìm kiếm & Thay thế (Ctrl + H)</h3>
                    <span id="vsc-match-count" class="text-[10px] font-mono font-bold text-accent-theme px-2 py-0.5 rounded-[8px] bg-accent-theme-alpha select-none">0/0</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <!-- Search Input Box -->
                    <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 h-11 focus-within:border-accent-theme transition-all">
                        <i class="fas fa-search text-zinc-400 text-xs mr-2"></i>
                        <input id="vsc-find-input" type="text" placeholder="Tìm kiếm từ khóa..." class="tc-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" />
                        <div class="flex items-center gap-1 shrink-0 ml-2 border-l border-black/[0.08] dark:border-white/[0.1] pl-2">
                            <button id="opt-case" class="vsc-opt-btn w-6 h-6 rounded-[6px] text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" title="Khớp hoa thường (Match Case)">Aa</button>
                            <button id="opt-word" class="vsc-opt-btn w-6 h-6 rounded-[6px] text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" title="Khớp nguyên từ (Whole Word)">\\b</button>
                            <button id="opt-regex" class="vsc-opt-btn w-6 h-6 rounded-[6px] text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" title="Biểu thức chính quy (Regex)">.*</button>
                        </div>
                    </div>

                    <!-- Replace Input Box -->
                    <div class="flex items-center gap-2">
                        <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 h-11 focus-within:border-accent-theme transition-all">
                            <i class="fas fa-pen text-zinc-400 text-xs mr-2"></i>
                            <input id="vsc-replace-input" type="text" placeholder="Thay thế bằng..." class="tc-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" />
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button id="btn-vsc-replace-one" class="h-11 px-3 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-semibold active:scale-95 transition-all" title="Thay thế từ đầu tiên">Thay thế</button>
                            <button id="btn-vsc-replace-all" class="h-11 px-3 rounded-[14px] bg-accent-theme text-white text-xs font-bold active:scale-95 transition-all shadow-sm" title="Thay thế toàn bộ">Thay tất cả</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- LEFT: TEXT AREA & TOOLBAR -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] flex flex-col overflow-hidden shadow-sm">
                        <textarea id="tc-input" class="tc-input-zen w-full h-[320px] lg:h-[420px] bg-transparent border-none outline-none p-5 text-xs sm:text-sm font-medium leading-relaxed text-zinc-900 dark:text-white resize-y custom-scrollbar placeholder-zinc-400" placeholder="Nhập hoặc dán văn bản cần phân tích và chuyển đổi vào đây..."></textarea>
                        
                        <!-- TOOLBAR ĐỊNH DẠNG -->
                        <div class="px-4 py-3 bg-[#f2f2f7] dark:bg-black/40 border-t border-black/[0.05] dark:border-white/[0.08] flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Định dạng & Chuyển đổi nhanh</span>
                                <span class="text-[10px] text-zinc-400 font-medium">Cuộn ngang để xem thêm</span>
                            </div>
                            <div class="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="trim">Gọn khoảng trắng</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="remove-lines">Xóa dòng trống</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="remove-vietnamese">Bỏ dấu tiếng Việt</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="upper">IN HOA</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="lower">in thường</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="capitalize">Hoa Từng Từ</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="camel">camelCase</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="kebab">kebab-case</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="snake">snake_case</button>
                                <button class="tc-action-btn h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme whitespace-nowrap active:scale-95 transition-all shadow-sm" data-action="reverse">Đảo ngược</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: STATS & FREQUENCY -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    
                    <!-- CHỈ SỐ CƠ BẢN -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Chỉ số số liệu</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Metrics</span>
                        </div>

                        <div class="grid grid-cols-2 gap-2.5">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex flex-col">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Số từ (Words)</span>
                                <span class="text-2xl sm:text-3xl font-black text-accent-theme font-mono tracking-tight" id="stat-words">0</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex flex-col">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Ký tự (Có khoảng trắng)</span>
                                <span class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tracking-tight" id="stat-chars">0</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-2">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Không cách</span>
                                <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="stat-chars-no-space">0</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Số câu</span>
                                <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="stat-sentences">0</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Đoạn văn</span>
                                <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="stat-paragraphs">0</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2 flex flex-col items-center text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Số dòng</span>
                                <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="stat-lines">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- THỜI GIAN ĐỌC & NÓI -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ước tính thời gian</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Pace Engine</span>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="flex items-center gap-2.5 p-2 bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] border border-black/[0.04] dark:border-white/[0.06]">
                                <div class="w-8 h-8 rounded-[10px] bg-white dark:bg-[#27272a] flex items-center justify-center text-accent-theme shrink-0 shadow-sm">
                                    <i class="fas fa-book-open text-xs"></i>
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Đọc thầm</span>
                                    <span class="text-xs font-bold text-zinc-900 dark:text-white truncate" id="stat-read-time">0p 0s</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2.5 p-2 bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] border border-black/[0.04] dark:border-white/[0.06]">
                                <div class="w-8 h-8 rounded-[10px] bg-white dark:bg-[#27272a] flex items-center justify-center text-accent-theme shrink-0 shadow-sm">
                                    <i class="fas fa-microphone text-xs"></i>
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Phát biểu</span>
                                    <span class="text-xs font-bold text-zinc-900 dark:text-white truncate" id="stat-speak-time">0p 0s</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TẦN SUẤT TỪ KHÓA NỔI BẬT -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col flex-1 min-h-[190px] space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Mật độ từ khóa phổ biến</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Top 5</span>
                        </div>

                        <div id="keyword-list" class="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                            <div class="text-center text-xs font-medium text-zinc-400 py-6">Nhập đoạn văn bản để bắt đầu phân tích mật độ từ khóa.</div>
                        </div>
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
    const rootContainer = hostElement.querySelector('#tc-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query DOM Elements
    const input = hostElement.querySelector('#tc-input');
    const btnClear = hostElement.querySelector('#btn-tc-clear');
    const btnPaste = hostElement.querySelector('#btn-tc-paste');
    const actionBtns = hostElement.querySelectorAll('.tc-action-btn');

    const sWords = hostElement.querySelector('#stat-words');
    const sChars = hostElement.querySelector('#stat-chars');
    const sCharsNoSpace = hostElement.querySelector('#stat-chars-no-space');
    const sSentences = hostElement.querySelector('#stat-sentences');
    const sParagraphs = hostElement.querySelector('#stat-paragraphs');
    const sLines = hostElement.querySelector('#stat-lines');
    const sReadTime = hostElement.querySelector('#stat-read-time');
    const sSpeakTime = hostElement.querySelector('#stat-speak-time');
    const kwList = hostElement.querySelector('#keyword-list');

    const findInput = hostElement.querySelector('#vsc-find-input');
    const replaceInput = hostElement.querySelector('#vsc-replace-input');
    const matchCountEl = hostElement.querySelector('#vsc-match-count');
    const optCase = hostElement.querySelector('#opt-case');
    const optWord = hostElement.querySelector('#opt-word');
    const optRegex = hostElement.querySelector('#opt-regex');
    const btnReplaceOne = hostElement.querySelector('#btn-vsc-replace-one');
    const btnReplaceAll = hostElement.querySelector('#btn-vsc-replace-all');

    const stopWords = new Set(['và', 'của', 'là', 'có', 'trong', 'để', 'với', 'cho', 'không', 'các', 'một', 'những', 'được', 'người', 'khi', 'này', 'đã', 'sẽ', 'như', 'tại', 'thì', 'cũng', 'bởi', 'vào', 'ra', 'lại', 'còn', 'đến', 'từ', 'rằng']);

    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const formatTime = (minutesFloat) => {
        if (minutesFloat === 0) return '0p 0s';
        const m = Math.floor(minutesFloat);
        const s = Math.round((minutesFloat - m) * 60);
        return `${m}p ${s}s`;
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
            sReadTime.textContent = '0p 0s';
            sSpeakTime.textContent = '0p 0s';
            kwList.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-6">Nhập đoạn văn bản để bắt đầu phân tích mật độ từ khóa.</div>';
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
            kwList.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-6">Chưa đủ dữ liệu từ vựng.</div>';
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
            kwList.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-6">Không tìm thấy từ khóa nổi bật.</div>';
            return;
        }

        let html = '';
        sortedKw.forEach(([word, count]) => {
            const percentage = ((count / totalWords) * 100).toFixed(1);
            html += `
                <div class="flex items-center justify-between bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] p-2.5">
                    <span class="text-xs font-bold text-zinc-900 dark:text-white truncate pr-2">"${word}"</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[11px] font-mono font-semibold text-zinc-500">${count} lần</span>
                        <span class="text-[10px] font-mono font-bold text-accent-theme bg-accent-theme-alpha px-1.5 py-0.5 rounded-[6px]">${percentage}%</span>
                    </div>
                </div>
            `;
        });

        kwList.innerHTML = html;
    };

    // Find & Replace Engine
    const buildRegex = (global = true) => {
        const query = findInput.value;
        if (!query) return null;

        const isCase = optCase.classList.contains('active');
        const isWord = optWord.classList.contains('active');
        const isRegex = optRegex.classList.contains('active');

        let pattern = query;
        if (!isRegex) {
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
        matchCountEl.textContent = `${count} khớp`;
    };

    const executeReplace = (all = false) => {
        const re = buildRegex(all);
        if (!re) {
            return IslandKit.notify('Cảnh báo', 'Vui lòng nhập chuỗi tìm kiếm hợp lệ.', 'warning');
        }

        const currentText = input.value;
        const replacement = replaceInput.value || '';
        
        if (all) {
            const matches = currentText.match(re);
            const count = matches ? matches.length : 0;
            input.value = currentText.replace(re, replacement);
            IslandKit.notify('Thay thế toàn bộ', `Đã cập nhật ${count} vị trí phù hợp.`, 'success');
        } else {
            input.value = currentText.replace(re, replacement);
            IslandKit.notify('Thay thế', 'Đã thay thế vị trí xuất hiện đầu tiên.', 'info');
        }

        analyzeText();
    };

    // Event Listeners
    input.addEventListener('input', analyzeText);

    btnClear.addEventListener('click', () => {
        if (!input.value) return;
        UI.showConfirm('Xóa toàn bộ?', 'Nội dung đang soạn thảo sẽ bị dọn sạch.', () => {
            input.value = '';
            analyzeText();
            input.focus();
            IslandKit.notify('Đã xóa', 'Văn bản đã được làm sạch.', 'info');
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
                IslandKit.notify('Đã dán', 'Dữ liệu clipboard đã được chèn vào văn bản.', 'success');
            }
        } catch (e) {
            IslandKit.notify('Không thể dán', 'Trình duyệt chặn truy cập bộ nhớ tạm. Hãy nhấn Ctrl+V.', 'warning');
        }
    });

    const keydownHandler = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            findInput.focus();
            findInput.select();
        }
    };
    window.addEventListener('keydown', keydownHandler);

    [optCase, optWord, optRegex].forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            updateMatchCount();
        });
    });

    findInput.addEventListener('input', updateMatchCount);
    btnReplaceOne.addEventListener('click', () => executeReplace(false));
    btnReplaceAll.addEventListener('click', () => executeReplace(true));

    // Text Transformation Actions
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
            IslandKit.notify('Đã chuyển đổi', `Thao tác [${btn.textContent.trim()}] hoàn tất.`, 'info');
        });
    });

    analyzeText();

    return () => {
        window.removeEventListener('keydown', keydownHandler);
    };
}