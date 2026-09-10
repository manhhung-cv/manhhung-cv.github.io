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
    <div id="pe-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #pe-root-container {
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

            .pe-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }
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
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Mã Hóa SĐT</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">15 Thuật toán Bypass Bot TMĐT. Tích hợp giải mã thông minh đa ngôn ngữ.</p>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- SEGMENTED TABS -->
                    <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-80" id="pe-tabs">
                        <button id="tab-encode" class="tab-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5" data-target="pane-encode">
                            <i class="fas fa-lock text-[11px]"></i> Tạo 15 mã lách luật
                        </button>
                        <button id="tab-decode" class="tab-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-target="pane-decode">
                            <i class="fas fa-unlock text-[11px]"></i> Giải mã ngược
                        </button>
                    </div>

                    <!-- SHORT INFO BADGE -->
                    <div class="flex items-center justify-between sm:justify-end gap-2 text-zinc-400 text-[11px]">
                        <span class="flex items-center gap-1.5 font-medium">
                            <i class="fas fa-shield-halved text-accent-theme text-xs"></i> Lọc Bot An Toàn
                        </span>
                    </div>
                </div>
            </div>

            <!-- WORKSPACE PANES -->
            <div id="pane-encode" class="pe-pane block space-y-4">
                
                <!-- INPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Đầu vào số điện thoại</h3>
                        <span class="text-[10px] text-zinc-400 font-mono">8 - 15 chữ số</span>
                    </div>

                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-[14px] bg-white dark:bg-[#27272a] flex items-center justify-center text-accent-theme shadow-sm shrink-0 border border-black/[0.04] dark:border-white/[0.06]">
                                <i class="fas fa-phone text-sm"></i>
                            </div>
                            <input type="tel" id="pe-input-phone" 
                                class="pe-input-zen w-full bg-transparent border-none outline-none text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-white tracking-[0.15em] placeholder-zinc-300 dark:placeholder-zinc-700" 
                                placeholder="0987654321" autocomplete="off" maxlength="15">
                            <button id="btn-clear-phone" class="w-9 h-9 rounded-[12px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center opacity-0 transition-opacity active:scale-90 shrink-0">
                                <i class="fas fa-times-circle text-base"></i>
                            </button>
                        </div>
                    </div>

                    <button id="btn-encode" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-wand-magic-sparkles text-xs"></i> <span>Tạo 15 phiên bản mã hóa</span>
                    </button>
                </div>

                <!-- RESULTS SECTION -->
                <div id="pe-results-wrap" class="hidden flex-col space-y-4">
                    <div class="flex justify-between items-center px-1">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ma trận biến thể (Chạm để chép)</span>
                        <span class="text-[10px] text-zinc-400 font-mono">15 Thuật toán</span>
                    </div>

                    <div id="pe-results-list" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1"></div>

                    <div class="rounded-[18px] bg-accent-theme-alpha border border-accent-theme/20 p-4">
                        <p class="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                            <i class="fas fa-shield-halved text-accent-theme mr-1"></i>
                            <strong>Mẹo an toàn:</strong> Sử dụng các định dạng không chứa ký tự chữ số như <strong>12 Con Giáp, Thiên Can, Nhạc Phổ</strong> hoặc <strong>Kanji</strong> để ngăn ngừa triệt để các bộ lọc biểu thức chính quy (Regex) của nền tảng TMĐT.
                        </p>
                    </div>
                </div>

            </div>

            <!-- DECODE PANE -->
            <div id="pane-decode" class="pe-pane hidden space-y-4">
                
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Chuỗi ký tự cần trích xuất</h3>
                        <span class="text-[10px] text-zinc-400 font-mono">Smart Decoder</span>
                    </div>

                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                        <textarea id="pe-input-decode" 
                            class="pe-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white resize-y min-h-[120px] p-0 custom-scrollbar leading-relaxed placeholder-zinc-400" 
                            placeholder="Dán văn bản bất kỳ chứa mã ngụy trang SĐT... Ví dụ: Nulla IX Nulla I II III I II III"></textarea>
                    </div>

                    <button id="btn-decode" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-fingerprint text-xs"></i> <span>Giải mã số điện thoại</span>
                    </button>
                </div>

                <!-- DECODE RESULT CARD -->
                <div id="pe-decode-res-wrap" class="hidden rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-6 shadow-sm flex-col items-center text-center space-y-3">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Số điện thoại trích xuất thành công</span>
                    <div class="text-3xl sm:text-4xl font-black font-mono tracking-[0.15em] sm:tracking-[0.2em] text-accent-theme" id="pe-decode-val">--</div>
                    <button class="h-10 px-6 rounded-[12px] bg-accent-theme text-white text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center gap-2" id="btn-copy-decode">
                        <i class="far fa-copy text-xs"></i> Sao chép SĐT
                    </button>
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
    const rootContainer = hostElement.querySelector('#pe-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Từ điển mã hóa (15 định dạng)
    const dict = {
        '0': { 
            text: ['không'], slang: ['khum', 'khôm', 'zéro'], en: ['zero'], 
            jp: ['零', 'ゼロ', 'zero', 'maru'], hv: ['vô'], han: ['〇'], 
            roman: ['Nulla', 'O'], leet: ['O', 'o', 'Q', '()'], 
            emoji: ['0️⃣', '🥚', '🍩', '⚽', '🎱', '🌚'], special: ['⓪', '⓿', '０', '🄀'],
            morse: '-----', zodiac: ['🐀', '🐁'], note: ['đồ', 'do'], can: ['giáp']
        },
        '1': { 
            text: ['một'], slang: ['mọt', 'mộc', 'mụt', '1st'], en: ['one'], 
            jp: ['一', 'いち', 'ichi'], hv: ['nhất'], han: ['壹'], 
            roman: ['I'], leet: ['I', 'l', '|', 'L'], 
            emoji: ['1️⃣', '🦯', '🥇', '☝️', '🌭', '🕯️'], special: ['①', '❶', '１', '🄁'],
            morse: '.----', zodiac: ['🐂', '🐄'], note: ['rê', 're'], can: ['ất']
        },
        '2': { 
            text: ['hai'], slang: ['haii', 'h2'], en: ['two'], 
            jp: ['二', 'に', 'ni'], hv: ['nhị'], han: ['贰', '两'], 
            roman: ['II'], leet: ['Z', 'z'], 
            emoji: ['2️⃣', '🦆', '🥈', '✌️', '🦢', '🚲'], special: ['②', '❷', '２', '🄂'],
            morse: '..---', zodiac: ['🐅', '🐯'], note: ['mi'], can: ['bính']
        },
        '3': { 
            text: ['ba'], slang: ['baa', 'b3'], en: ['three'], 
            jp: ['三', 'さん', 'san'], hv: ['tam'], han: ['叁'], 
            roman: ['III'], leet: ['E', 'e'], 
            emoji: ['3️⃣', '💋', '🥉', '🤟', '☘️'], special: ['③', '❸', '３', '🄃'],
            morse: '...--', zodiac: ['🐇', '🐰', '🐈'], note: ['fa'], can: ['đinh']
        },
        '4': { 
            text: ['bốn'], slang: ['bủn', 'bỏn'], en: ['four'], 
            jp: ['四', 'よん', 'し', 'yon', 'shi'], hv: ['tứ'], han: ['肆'], 
            roman: ['IV'], leet: ['A', 'a', '@'], 
            emoji: ['4️⃣', '🪑', '🍀', '🐾'], special: ['④', '❹', '４', '🄄'],
            morse: '....-', zodiac: ['🐉', '🐲'], note: ['son', 'sol'], can: ['mậu']
        },
        '5': { 
            text: ['năm'], slang: ['nămm'], en: ['five'], 
            jp: ['五', 'ご', 'go'], hv: ['ngũ'], han: ['伍'], 
            roman: ['V'], leet: ['S', 's', '$'], 
            emoji: ['5️⃣', '🪝', '🖐️', '🌟'], special: ['⑤', '❺', '５', '🄅'],
            morse: '.....', zodiac: ['🐍'], note: ['la'], can: ['kỷ']
        },
        '6': { 
            text: ['sáu'], slang: ['sáuu', 'xáu'], en: ['six'], 
            jp: ['六', 'ろく', 'roku'], hv: ['lục'], han: ['陆'], 
            roman: ['VI'], leet: ['G', 'g', 'b'], 
            emoji: ['6️⃣', '🐌', '🤙', '🐞'], special: ['⑥', '❻', '６', '🄆'],
            morse: '-....', zodiac: ['🐎', '🐴'], note: ['si'], can: ['canh']
        },
        '7': { 
            text: ['bảy'], slang: ['bẻy', 'bẩy'], en: ['seven'], 
            jp: ['七', 'なな', 'しち', 'nana', 'shichi'], hv: ['thất'], han: ['柒'], 
            roman: ['VII'], leet: ['T', 't'], 
            emoji: ['7️⃣', '🪓', '🌈', '⚡'], special: ['⑦', '❼', '７', '🄇'],
            morse: '--...', zodiac: ['🐐', '🐑', '🐏'], note: ['đố', 'do2'], can: ['tân']
        },
        '8': { 
            text: ['tám'], slang: ['támm'], en: ['eight'], 
            jp: ['八', 'はち', 'hachi'], hv: ['bát'], han: ['捌'], 
            roman: ['VIII'], leet: ['B'], 
            emoji: ['8️⃣', '⛄', '🎱', '🕷️', '♾️'], special: ['⑧', '❽', '８', '🄈'],
            morse: '---..', zodiac: ['🐒', '🐵'], note: ['rế', 're2'], can: ['nhâm']
        },
        '9': { 
            text: ['chín'], slang: ['chínn', 'chím'], en: ['nine'], 
            jp: ['九', 'きゅう', 'く', 'kyuu', 'ku'], hv: ['cửu'], han: ['玖'], 
            roman: ['IX'], leet: ['q', 'P'], 
            emoji: ['9️⃣', '🎈', '☁️', '💯'], special: ['⑨', '❾', '９', '🄉'],
            morse: '----.', zodiac: ['🐓', '🐔'], note: ['mí', 'mi2'], can: ['quý']
        }
    };

    // Chuẩn bị danh sách giải mã ưu tiên độ dài (Longest Match First)
    const decodeMapping = {
        '0': ['không', 'khong', 'khum', 'khôm', 'khôg', 'zero', 'zêrô', 'zéro', 'maru', 'vô', 'nulla', 'giáp', 'giap', 'đồ', 'do', '零', '〇', 'ゼロ', '0️⃣', '🥚', '🍩', '⚽', '🎱', '🌚', '⓪', '⓿', '０', '🄀', '🐀', '🐁', 'O', 'o', 'Q', '()'],
        '1': ['một', 'mot', 'mọt', 'mộc', 'mụt', '1st', 'nhất', 'nhat', 'one', 'ichi', 'ất', 'at', 'rê', 're', '一', '壹', 'いち', '1️⃣', '🦯', '🥇', '☝️', '🌭', '🕯️', '①', '❶', '１', '🄁', '🐂', '🐄', 'I', 'l', '|', 'L'],
        '2': ['hai', 'haii', 'hi', 'nhị', 'nhi', 'two', 'ni', 'bính', 'binh', 'mi', '二', '贰', '两', 'に', '2️⃣', '🦆', '🥈', '✌️', '🦢', '🚲', '②', '❷', '２', '🄂', '🐅', '🐯', 'II', 'Z', 'z'],
        '3': ['ba', 'baa', 'b3', 'tam', 'three', 'san', 'đinh', 'dinh', 'fa', '三', '叁', 'さん', '3️⃣', '💋', '🥉', '🤟', '☘️', '③', '❸', '３', '🄃', '🐇', '🐰', '🐈', 'III', 'E', 'e'],
        '4': ['bốn', 'bon', 'bỏn', 'bủn', 'b0n', 'tứ', 'tu', 'four', 'yon', 'shi', 'mậu', 'mau', 'son', 'sol', '四', '肆', 'よん', 'し', '4️⃣', '🪑', '🍀', '🐾', '④', '❹', '４', '🄄', '🐉', '🐲', 'IV', 'A', 'a', '@'],
        '5': ['năm', 'nam', 'nămm', 'ngũ', 'ngu', 'five', 'go', 'kỷ', 'ky', 'la', '五', '伍', 'ご', '5️⃣', '🪝', '🖐️', '🌟', '⑤', '❺', '５', '🄅', '🐍', 'V', 'S', 's', '$'],
        '6': ['sáu', 'sau', 'sáuu', 'xáu', 'lục', 'luc', 'six', 'roku', 'canh', 'si', '六', '陆', 'ろく', '6️⃣', '🐌', '🤙', '🐞', '⑥', '❻', '６', '🄆', '🐎', '🐴', 'VI', 'G', 'g', 'b'],
        '7': ['bảy', 'bay', 'bẩy', 'bẻy', 'thất', 'that', 'seven', 'nana', 'shichi', 'tân', 'tan', 'đố', 'do2', '七', '柒', 'なな', 'しち', '7️⃣', '🪓', '🌈', '⚡', '⑦', '❼', '７', '🄇', '🐐', '🐑', '🐏', 'VII', 'T', 't'],
        '8': ['tám', 'tam', 'támm', 'bát', 'bat', 'eight', 'hachi', 'nhâm', 'nham', 'rế', 're2', '八', '捌', 'はち', '8️⃣', '⛄', '🎱', '🕷️', '♾️', '⑧', '❽', '８', '🄈', '🐒', '🐵', 'VIII', 'B'],
        '9': ['chín', 'chin', 'chínn', 'chím', 'cửu', 'cuu', 'nine', 'kyuu', 'ku', 'quý', 'quy', 'mí', 'mi2', '九', '玖', 'きゅう', 'く', '9️⃣', '🎈', '☁️', '💯', '⑨', '❾', '９', '🄉', '🐓', '🐔', 'IX', 'q', 'P']
    };

    const decodeList = [];
    for (let digit in decodeMapping) {
        decodeMapping[digit].forEach(word => {
            decodeList.push({ word, digit });
        });
    }
    decodeList.sort((a, b) => b.word.length - a.word.length);

    const morseDict = {
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };

    // Query DOM Elements
    const tabBtns = hostElement.querySelectorAll('#pe-tabs .tab-btn');
    const panes = hostElement.querySelectorAll('.pe-pane');
    
    const inPhone = hostElement.querySelector('#pe-input-phone');
    const btnClearPhone = hostElement.querySelector('#btn-clear-phone');
    const btnEncode = hostElement.querySelector('#btn-encode');
    const resWrap = hostElement.querySelector('#pe-results-wrap');
    const resList = hostElement.querySelector('#pe-results-list');

    const inDecode = hostElement.querySelector('#pe-input-decode');
    const btnDecode = hostElement.querySelector('#btn-decode');
    const decodeResWrap = hostElement.querySelector('#pe-decode-res-wrap');
    const decodeVal = hostElement.querySelector('#pe-decode-val');
    const btnCopyDecode = hostElement.querySelector('#btn-copy-decode');

    // Segmented Tabs
    const activeClass = 'tab-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveClass = 'tab-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    tabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            tabBtns.forEach(t => { t.className = inactiveClass; });
            tab.className = activeClass;

            panes.forEach(p => { 
                p.classList.remove('block'); 
                p.classList.add('hidden'); 
            });

            const target = hostElement.querySelector(`#${tab.getAttribute('data-target')}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('block');
            }
        });
    });

    // Input Sanitizer
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const noise = () => pick(['', ' ', ' . ', ' - ', ' ~ ', ' _ ']);

    inPhone?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        btnClearPhone.style.opacity = e.target.value ? '1' : '0';
    });

    btnClearPhone?.addEventListener('click', () => {
        inPhone.value = '';
        btnClearPhone.style.opacity = '0';
        inPhone.focus();
    });

    // Thuật toán 15 dạng ngụy trang
    const generateEncodings = (phone) => {
        const results = [];
        const chars = phone.split('');

        results.push({ name: '1. Trộn Hỗn Loạn Đa Ngôn Ngữ', val: chars.map(c => pick([...dict[c].text, ...dict[c].slang, ...dict[c].jp, ...dict[c].en])).join(noise()) });
        results.push({ name: '2. Trộn Ký Tự Đồ Vật & Biểu Tượng', val: chars.map(c => pick([...dict[c].emoji, ...dict[c].special, ...dict[c].zodiac])).join(' ') });
        results.push({ name: '3. Tiếng Lóng (Teencode GenZ)', val: chars.map(c => capitalize(pick(dict[c].slang))).join(' ') });
        results.push({ name: '4. Tiếng Nhật Bản (Kanji / Romaji)', val: chars.map(c => pick(dict[c].jp)).join(' ') });
        results.push({ name: '5. Tiếng Anh (English)', val: chars.map(c => capitalize(pick(dict[c].en))).join(' ') });
        results.push({ name: '6. Phong Thủy (Chữ Hán & Hán Việt)', val: chars.map(c => Math.random() > 0.5 ? pick(dict[c].han) : capitalize(pick(dict[c].hv))).join(' ') });
        results.push({ name: '7. Hình Tượng Đồ Vật (Emoji Object)', val: chars.map(c => pick(dict[c].emoji)).join(' ') });
        results.push({ name: '8. Mật Mã Động Vật (12 Con Giáp)', val: chars.map(c => pick(dict[c].zodiac)).join(' ') });
        results.push({ name: '9. Chữ Số La Mã (Roman Numerals)', val: chars.map(c => pick(dict[c].roman)).join(' ') });
        results.push({ name: '10. Ký Tự Đặc Biệt / Số Khoanh Tròn', val: chars.map(c => pick(dict[c].special)).join('') });
        results.push({ name: '11. Ký Tự Ngụy Trang (Leetspeak)', val: chars.map(c => pick(dict[c].leet)).join('') });
        
        let invisible = '';
        for (let i = 0; i < phone.length; i++) {
            invisible += phone[i];
            if (i < phone.length - 1) invisible += pick(['\u200B', '\u200C', '\u200B\u200C']);
        }
        if (invisible.length >= 7) {
            invisible = invisible.substring(0, 4) + ' ' + invisible.substring(4, 7) + ' ' + invisible.substring(7);
        }
        results.push({ name: '12. Ký Tự Tàng Hình (Zero-width Space)', val: invisible });

        results.push({ name: '13. Mã Morse Máy Tín', val: chars.map(c => dict[c].morse).join(' ') });
        results.push({ name: '14. Thiên Can Ngũ Hành (Giáp Ất Bính Đinh)', val: chars.map(c => capitalize(pick(dict[c].can))).join(' ') });
        results.push({ name: '15. Âm Luật Nhạc Phổ (Đồ Rê Mi Fa)', val: chars.map(c => capitalize(pick(dict[c].note))).join(' ') });

        return results;
    };

    // Encode Action
    btnEncode?.addEventListener('click', () => {
        const phone = inPhone.value.trim();
        if (phone.length < 8) {
            return IslandKit.notify('Cảnh báo', 'Vui lòng nhập SĐT hợp lệ (từ 8 - 15 chữ số).', 'warning');
        }

        const variations = generateEncodings(phone);
        resList.innerHTML = '';

        variations.forEach(item => {
            const card = document.createElement('div');
            card.className = 'res-card p-3.5 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] cursor-pointer hover:border-black/[0.12] dark:hover:border-white/[0.15] transition-all flex items-center justify-between gap-3 active:scale-[0.99] group';
            card.innerHTML = `
                <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-bold text-accent-theme uppercase tracking-wider block mb-1">${item.name}</span>
                    <div class="text-xs sm:text-[13px] font-mono font-bold text-zinc-900 dark:text-white break-words leading-relaxed">${item.val}</div>
                </div>
                <button class="h-8 w-8 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-zinc-500 group-hover:text-accent-theme flex items-center justify-center shrink-0 transition-colors shadow-sm" title="Sao chép">
                    <i class="far fa-copy text-xs"></i>
                </button>
            `;

            card.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(item.val);
                    IslandKit.notify('Đã sao chép', `Đã lưu biến thể: ${item.name}`, 'success', 1200);
                } catch (err) {
                    IslandKit.notify('Lỗi', 'Không thể truy cập bộ nhớ tạm.', 'error');
                }
            });

            resList.appendChild(card);
        });

        resWrap.classList.remove('hidden');
        resWrap.classList.add('flex');
        IslandKit.notify('Thành công', 'Đã tạo xong 15 biến thể mã hóa.', 'success');
    });

    // Decode Action (Smart Decoder)
    btnDecode?.addEventListener('click', () => {
        let text = inDecode.value;
        if (!text.trim()) {
            return IslandKit.notify('Thiếu dữ liệu', 'Vui lòng dán chuỗi ký tự cần giải mã.', 'warning');
        }

        // B1: Lọc bỏ toàn bộ Zero-width characters
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

        // B2: Giải mã Morse trước để tránh nuốt dấu
        for (let d in morseDict) {
            const escapedMorse = morseDict[d].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            text = text.replace(new RegExp(escapedMorse, 'g'), d);
        }

        // B3: Longest Match First Dictionary Scan
        decodeList.forEach(item => {
            const escapedWord = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedWord, 'gi');
            text = text.replace(regex, item.digit);
        });

        // B4: Lọc chỉ giữ lại số
        const extractedNumbers = text.replace(/\D/g, '');

        if (extractedNumbers.length === 0) {
            decodeResWrap.classList.remove('hidden');
            decodeResWrap.classList.add('flex');
            decodeVal.textContent = "KHÔNG TÌM THẤY";
            decodeVal.className = "text-base font-bold text-rose-500 py-2";
            btnCopyDecode.classList.add('hidden');
            IslandKit.notify('Thất bại', 'Không thể nhận diện số điện thoại trong chuỗi.', 'error');
        } else {
            decodeResWrap.classList.remove('hidden');
            decodeResWrap.classList.add('flex');
            decodeVal.textContent = extractedNumbers;
            decodeVal.className = "text-3xl sm:text-4xl font-black font-mono tracking-[0.15em] sm:tracking-[0.2em] text-accent-theme";
            btnCopyDecode.classList.remove('hidden');
            IslandKit.notify('Thành công', `Đã trích xuất: ${extractedNumbers}`, 'success');

            btnCopyDecode.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(extractedNumbers);
                    IslandKit.notify('Đã sao chép', 'Số điện thoại đã được lưu vào clipboard.', 'success');
                } catch (e) {
                    IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
                }
            };
        }
    });
}