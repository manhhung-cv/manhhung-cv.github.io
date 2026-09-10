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
// 2. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="pg-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #pg-root-container {
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

            .switch-pill {
                width: 44px;
                height: 24px;
                background-color: rgba(0, 0, 0, 0.12) !important;
                border-radius: 9999px;
                position: relative;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                padding: 2px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
            }
            .dark .switch-pill {
                background-color: rgba(255, 255, 255, 0.16) !important;
                border-color: rgba(255, 255, 255, 0.12);
            }
            .switch-pill .switch-thumb {
                width: 18px;
                height: 18px;
                background-color: #ffffff;
                border-radius: 9999px;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
            }
            .switch-pill.active {
                background-color: var(--kit-accent) !important;
                border-color: transparent !important;
            }
            .switch-pill.active .switch-thumb {
                transform: translateX(20px);
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Security</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Password Generator</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tạo chuỗi ngẫu nhiên bảo mật cao hoặc phát âm dễ đọc, định dạng phân đoạn thông minh.</p>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- SEGMENTED MODE TABS -->
                    <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-72" id="pg-mode-tabs">
                        <button class="tab-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5" data-mode="random">
                            <i class="fas fa-dice text-[11px]"></i> Ngẫu nhiên
                        </button>
                        <button class="tab-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-mode="pronounceable">
                            <i class="fas fa-comment-dots text-[11px]"></i> Dễ đọc (Phát âm)
                        </button>
                    </div>

                    <!-- RECENT HISTORY TOGGLE -->
                    <div class="flex items-center justify-between sm:justify-end gap-2">
                        <button id="btn-pg-history" class="h-10 px-4 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 active:scale-95 transition-all">
                            <i class="fas fa-clock-rotate-left text-accent-theme text-xs"></i> Lịch sử đã tạo
                        </button>
                    </div>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- OUTPUT & STRENGTH CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Mật khẩu khởi tạo</h3>
                            <span id="st-text" class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">--</span>
                        </div>

                        <!-- Main Output Area -->
                        <div class="flex-1 flex flex-col min-h-[170px] justify-center space-y-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-4 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3 focus-within:border-accent-theme transition-all">
                                <input type="text" id="pg-output" readonly 
                                    class="w-full bg-transparent border-none outline-none font-mono text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-wider truncate selection:bg-accent-theme selection:text-white" 
                                    placeholder="Đang tạo...">
                                <button id="btn-pg-copy" class="h-10 w-10 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-sm" title="Sao chép">
                                    <i class="far fa-copy text-sm"></i>
                                </button>
                            </div>

                            <!-- Mode Description Banner -->
                            <div id="pg-mode-desc" class="hidden px-3 py-2 rounded-[14px] bg-accent-theme-alpha border border-accent-theme/20 text-accent-theme text-xs font-medium items-center gap-2">
                                <i class="fas fa-circle-info text-xs shrink-0"></i>
                                <span>Chế độ <b>Dễ đọc</b>: Đan xen phụ âm & nguyên âm thành từ ngữ tự nhiên, thêm số cuối để đạt chuẩn bảo mật.</span>
                            </div>

                            <!-- Entropy Bars -->
                            <div class="space-y-1.5 px-1">
                                <div class="flex gap-1.5 h-2">
                                    <div class="flex-1 rounded-full bg-black/10 dark:bg-white/10 transition-colors" id="st-1"></div>
                                    <div class="flex-1 rounded-full bg-black/10 dark:bg-white/10 transition-colors" id="st-2"></div>
                                    <div class="flex-1 rounded-full bg-black/10 dark:bg-white/10 transition-colors" id="st-3"></div>
                                    <div class="flex-1 rounded-full bg-black/10 dark:bg-white/10 transition-colors" id="st-4"></div>
                                </div>
                                <div class="flex items-center justify-between text-[11px] text-zinc-400">
                                    <span>Độ bảo mật ước lượng</span>
                                    <span id="entropy-bits" class="font-mono text-[10px]">0 bits</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Generate Action -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button id="btn-pg-generate" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                            <i class="fas fa-arrows-rotate text-xs"></i> <span>Tạo mật khẩu mới</span>
                        </button>
                    </div>
                </div>

                <!-- CONFIGURATION CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-4 flex-1 flex flex-col">
                        <div class="flex justify-between items-center">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Quy chuẩn cấu hình</h3>
                            <span class="text-[10px] text-zinc-400 font-mono" id="config-badge">Custom Rules</span>
                        </div>

                        <!-- Length Range -->
                        <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <div class="flex justify-between items-center text-xs">
                                <span class="font-medium text-zinc-800 dark:text-zinc-200">Độ dài ký tự</span>
                                <span class="font-mono font-bold text-accent-theme text-sm" id="pg-val-len">16</span>
                            </div>
                            <input type="range" id="pg-range-len" min="4" max="64" value="16" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer">
                        </div>

                        <!-- Delimiter Option -->
                        <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <div class="flex justify-between items-center text-xs">
                                <span class="font-medium text-zinc-800 dark:text-zinc-200">Thêm gạch ngang phân đoạn</span>
                                <span class="text-[10px] text-zinc-400 font-mono">Ví dụ: abcd-efgh</span>
                            </div>
                            <div class="grid grid-cols-5 gap-1 p-1 rounded-[12px] bg-black/[0.04] dark:bg-black/60 border border-black/[0.04] dark:border-white/[0.06]" id="pg-delimiter-chips">
                                <button class="delim-btn active py-1.5 rounded-[9px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all" data-delim="0">Tắt</button>
                                <button class="delim-btn py-1.5 rounded-[9px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-delim="3">Mỗi 3</button>
                                <button class="delim-btn py-1.5 rounded-[9px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-delim="4">Mỗi 4</button>
                                <button class="delim-btn py-1.5 rounded-[9px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-delim="5">Mỗi 5</button>
                                <button class="delim-btn py-1.5 rounded-[9px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-delim="6">Mỗi 6</button>
                            </div>
                        </div>

                        <!-- Detailed Character Toggles -->
                        <div id="pg-options" class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2.5 transition-all">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Chữ hoa (A-Z)</span>
                                <button id="switch-upper" class="switch-pill active" type="button"><div class="switch-thumb"></div></button>
                            </div>
                            <div class="w-full h-px bg-black/[0.05] dark:bg-white/[0.08]"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Chữ thường (a-z)</span>
                                <button id="switch-lower" class="switch-pill active" type="button"><div class="switch-thumb"></div></button>
                            </div>
                            <div class="w-full h-px bg-black/[0.05] dark:bg-white/[0.08]"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Chữ số (0-9)</span>
                                <button id="switch-number" class="switch-pill active" type="button"><div class="switch-thumb"></div></button>
                            </div>
                            <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Ký tự đặc biệt (!@#$)</span>
                                <button id="switch-symbol" class="switch-pill active" type="button"><div class="switch-thumb"></div></button>
                            </div>
                            <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex flex-col">
                                    Loại bỏ ký tự dễ nhầm lẫn
                                    <span class="text-[10px] text-zinc-400 font-mono mt-0.5">Bỏ qua: i, l, 1, L, o, 0, O</span>
                                </span>
                                <button id="switch-exclude" class="switch-pill" type="button"><div class="switch-thumb"></div></button>
                            </div>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Bộ mã ngẫu nhiên chuẩn hóa</span>
                        <span class="font-mono text-[10px]">WebCrypto Safe</span>
                    </div>
                </div>

            </div>

        </main>

        <!-- HISTORY BOTTOM SHEET OVERLAY -->
        <div id="pg-hist-panel" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0 pointer-events-none flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
            <div id="pg-hist-card" class="w-full max-w-xl bg-white dark:bg-[#161618] rounded-t-[28px] sm:rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] max-h-[80vh] flex flex-col shadow-2xl transition-transform duration-300 translate-y-8 sm:translate-y-0">
                <div class="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.08] flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock-rotate-left text-accent-theme text-xs"></i>
                        <span class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Mật khẩu đã tạo gần đây</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button id="btn-pg-hist-clear" class="h-8 px-3 rounded-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold active:scale-95 transition-all">
                            Xóa hết
                        </button>
                        <button id="btn-pg-hist-close" class="w-8 h-8 rounded-[10px] bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
                <div id="pg-history-list" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2"></div>
            </div>
        </div>

    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#pg-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // App State
    let state = {
        mode: 'random', // 'random' | 'pronounceable'
        length: 16,
        upper: true,
        lower: true,
        number: true,
        symbol: true,
        exclude: false,
        delimiterStep: 0
    };

    const HISTORY_KEY = 'aio_pwd_history';
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    const CHARS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        number: '0123456789',
        symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    const CONFUSING = /[ilLI|`oO0]/g;

    const PRONOUNCE = {
        vowels: 'aeiou',
        consonants: 'bcdfghjklmnpqrstvwxyz'
    };

    // Query Elements
    const elOut = hostElement.querySelector('#pg-output');
    const btnCopy = hostElement.querySelector('#btn-pg-copy');
    const btnGen = hostElement.querySelector('#btn-pg-generate');

    const rangeLen = hostElement.querySelector('#pg-range-len');
    const valLen = hostElement.querySelector('#pg-val-len');

    const modeContainer = hostElement.querySelector('#pg-mode-tabs');
    const optsBox = hostElement.querySelector('#pg-options');
    const modeDesc = hostElement.querySelector('#pg-mode-desc');
    const configBadge = hostElement.querySelector('#config-badge');
    const delimiterContainer = hostElement.querySelector('#pg-delimiter-chips');

    const switchUpper = hostElement.querySelector('#switch-upper');
    const switchLower = hostElement.querySelector('#switch-lower');
    const switchNumber = hostElement.querySelector('#switch-number');
    const switchSymbol = hostElement.querySelector('#switch-symbol');
    const switchExclude = hostElement.querySelector('#switch-exclude');

    const st1 = hostElement.querySelector('#st-1');
    const st2 = hostElement.querySelector('#st-2');
    const st3 = hostElement.querySelector('#st-3');
    const st4 = hostElement.querySelector('#st-4');
    const stText = hostElement.querySelector('#st-text');
    const entropyBits = hostElement.querySelector('#entropy-bits');

    const histPanel = hostElement.querySelector('#pg-hist-panel');
    const btnHistOpen = hostElement.querySelector('#btn-pg-history');
    const btnHistClose = hostElement.querySelector('#btn-pg-hist-close');
    const btnHistClear = hostElement.querySelector('#btn-pg-hist-clear');
    const histList = hostElement.querySelector('#pg-history-list');

    // Cryptographic Random Engine
    const getRandomInt = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    };

    const calculateEntropy = (rawPwd) => {
        let poolSize = 0;
        if (/[a-z]/.test(rawPwd)) poolSize += 26;
        if (/[A-Z]/.test(rawPwd)) poolSize += 26;
        if (/[0-9]/.test(rawPwd)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(rawPwd)) poolSize += 32;

        if (poolSize === 0) return 0;
        return rawPwd.length * Math.log2(poolSize);
    };

    const updateStrengthMeter = (rawPwd) => {
        const entropy = calculateEntropy(rawPwd);
        entropyBits.textContent = `${Math.round(entropy)} bits`;

        const resetClass = 'flex-1 rounded-full bg-black/10 dark:bg-white/10 transition-colors';
        [st1, st2, st3, st4].forEach(el => { el.className = resetClass; });

        if (entropy < 28) {
            st1.className = 'flex-1 rounded-full bg-rose-500 transition-colors';
            stText.textContent = 'YẾU';
            stText.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400';
        } else if (entropy < 50) {
            st1.className = 'flex-1 rounded-full bg-amber-500 transition-colors';
            st2.className = 'flex-1 rounded-full bg-amber-500 transition-colors';
            stText.textContent = 'VỪA';
            stText.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400';
        } else if (entropy < 70) {
            st1.className = 'flex-1 rounded-full bg-blue-500 transition-colors';
            st2.className = 'flex-1 rounded-full bg-blue-500 transition-colors';
            st3.className = 'flex-1 rounded-full bg-blue-500 transition-colors';
            stText.textContent = 'TỐT';
            stText.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400';
        } else {
            st1.className = 'flex-1 rounded-full bg-accent-theme transition-colors';
            st2.className = 'flex-1 rounded-full bg-accent-theme transition-colors';
            st3.className = 'flex-1 rounded-full bg-accent-theme transition-colors';
            st4.className = 'flex-1 rounded-full bg-accent-theme transition-colors';
            stText.textContent = 'MẠNH';
            stText.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-theme-alpha text-accent-theme';
        }
    };

    // Format Hyphen Clumping
    const applyDelimiter = (str, step) => {
        if (!step || step <= 0) return str;
        const chunks = [];
        for (let i = 0; i < str.length; i += step) {
            chunks.push(str.substring(i, i + step));
        }
        return chunks.join('-');
    };

    const generatePassword = () => {
        let rawPwd = '';

        if (state.mode === 'pronounceable') {
            let isConsonant = true;
            for (let i = 0; i < state.length; i++) {
                if (isConsonant) {
                    rawPwd += PRONOUNCE.consonants[getRandomInt(PRONOUNCE.consonants.length)];
                } else {
                    rawPwd += PRONOUNCE.vowels[getRandomInt(PRONOUNCE.vowels.length)];
                }
                isConsonant = !isConsonant;
            }
            if (state.length > 0) {
                rawPwd = rawPwd.charAt(0).toUpperCase() + rawPwd.slice(1);
            }
            if (state.length >= 4) {
                rawPwd = rawPwd.slice(0, -2) + getRandomInt(10) + getRandomInt(10);
            }
        } else {
            if (!state.upper && !state.lower && !state.number && !state.symbol) {
                state.lower = true;
                switchLower?.classList.add('active');
            }

            let pool = '';
            if (state.upper) pool += CHARS.upper;
            if (state.lower) pool += CHARS.lower;
            if (state.number) pool += CHARS.number;
            if (state.symbol) pool += CHARS.symbol;

            if (state.exclude) {
                pool = pool.replace(CONFUSING, '');
            }

            const mandatory = [];
            if (state.upper) mandatory.push(state.exclude ? CHARS.upper.replace(CONFUSING, '')[0] : CHARS.upper[0]);
            if (state.lower) mandatory.push(state.exclude ? CHARS.lower.replace(CONFUSING, '')[0] : CHARS.lower[0]);
            if (state.number) mandatory.push(state.exclude ? CHARS.number.replace(CONFUSING, '')[0] : CHARS.number[0]);
            if (state.symbol) mandatory.push(CHARS.symbol[0]);

            for (let i = 0; i < state.length; i++) {
                if (i < mandatory.length) {
                    rawPwd += mandatory[i];
                } else {
                    rawPwd += pool[getRandomInt(pool.length)];
                }
            }

            rawPwd = rawPwd.split('').sort(() => 0.5 - Math.random()).join('');
        }

        updateStrengthMeter(rawPwd);
        const finalPwd = applyDelimiter(rawPwd, state.delimiterStep);
        elOut.value = finalPwd;
    };

    const saveHistory = (pwd) => {
        if (!pwd || history[0] === pwd) return;
        history.unshift(pwd);
        if (history.length > 25) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    };

    const renderHistory = () => {
        if (history.length === 0) {
            histList.innerHTML = '<div class="text-zinc-400 text-center text-xs font-semibold py-12 opacity-60">Chưa có bản ghi mật khẩu nào.</div>';
            return;
        }

        histList.innerHTML = history.map(item => `
            <div class="hist-item flex items-center justify-between p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] active:scale-[0.98] transition-all cursor-pointer group" data-val="${item}">
                <div class="font-mono text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate pr-3 select-all">${item}</div>
                <button class="h-8 w-8 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-zinc-500 group-hover:text-accent-theme shrink-0 transition-colors">
                    <i class="far fa-copy text-xs"></i>
                </button>
            </div>
        `).join('');

        histList.querySelectorAll('.hist-item').forEach(el => {
            el.addEventListener('click', async () => {
                const val = el.dataset.val;
                try {
                    await navigator.clipboard.writeText(val);
                    IslandKit.notify('Đã sao chép', 'Mật khẩu đã được lưu vào bộ nhớ tạm.', 'success');
                } catch(e) {}
            });
        });
    };

    // Mode segmented tabs
    const activeTabClass = 'tab-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveTabClass = 'tab-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    modeContainer?.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modeContainer.querySelectorAll('.tab-btn').forEach(b => { b.className = inactiveTabClass; });
            btn.className = activeTabClass;
            state.mode = btn.dataset.mode;

            if (state.mode === 'pronounceable') {
                optsBox?.classList.add('opacity-30', 'pointer-events-none');
                modeDesc?.classList.remove('hidden');
                modeDesc?.classList.add('flex');
                if (configBadge) configBadge.textContent = 'Phát âm tự nhiên';
                IslandKit.notify('Chế độ', 'Đã chuyển sang Dễ đọc (Pronounceable).', 'info');
            } else {
                optsBox?.classList.remove('opacity-30', 'pointer-events-none');
                modeDesc?.classList.add('hidden');
                modeDesc?.classList.remove('flex');
                if (configBadge) configBadge.textContent = 'Custom Rules';
                IslandKit.notify('Chế độ', 'Đã chuyển sang Ngẫu nhiên (Random).', 'info');
            }
            generatePassword();
        });
    });

    // Delimiter Segmented Chips
    const activeDelimClass = 'delim-btn active py-1.5 rounded-[9px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all';
    const inactiveDelimClass = 'delim-btn py-1.5 rounded-[9px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all';

    delimiterContainer?.querySelectorAll('.delim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            delimiterContainer.querySelectorAll('.delim-btn').forEach(b => { b.className = inactiveDelimClass; });
            btn.className = activeDelimClass;
            state.delimiterStep = parseInt(btn.dataset.delim, 10);
            generatePassword();
        });
    });

    // Slider
    rangeLen?.addEventListener('input', (e) => {
        state.length = parseInt(e.target.value, 10);
        valLen.textContent = state.length;
        generatePassword();
    });

    // Switch Pills Logic
    const bindSwitch = (el, key) => {
        el?.addEventListener('click', () => {
            el.classList.toggle('active');
            state[key] = el.classList.contains('active');
            generatePassword();
        });
    };

    bindSwitch(switchUpper, 'upper');
    bindSwitch(switchLower, 'lower');
    bindSwitch(switchNumber, 'number');
    bindSwitch(switchSymbol, 'symbol');
    bindSwitch(switchExclude, 'exclude');

    btnGen?.addEventListener('click', () => {
        generatePassword();
        IslandKit.notify('Mới', 'Đã tạo mật khẩu bảo mật mới.', 'info');
    });

    // Copy Action
    btnCopy?.addEventListener('click', async () => {
        const val = elOut.value;
        if (!val) return;
        try {
            await navigator.clipboard.writeText(val);
            saveHistory(val);
            IslandKit.notify('Thành công', 'Mật khẩu đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    });

    // History Bottom Sheet
    btnHistOpen?.addEventListener('click', () => {
        renderHistory();
        histPanel?.classList.remove('opacity-0', 'pointer-events-none');
    });

    const closeHistory = () => {
        histPanel?.classList.add('opacity-0', 'pointer-events-none');
    };

    btnHistClose?.addEventListener('click', closeHistory);
    histPanel?.addEventListener('click', (e) => {
        if (e.target === histPanel) closeHistory();
    });

    btnHistClear?.addEventListener('click', () => {
        if (history.length === 0) return;
        UI.showConfirm('Xóa lịch sử?', 'Toàn bộ mật khẩu đã lưu sẽ bị dọn dẹp khỏi thiết bị.', () => {
            history = [];
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
            IslandKit.notify('Đã xóa', 'Lịch sử đã được dọn sạch.', 'info');
        });
    });

    // First Generate
    generatePassword();
}