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
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER (TIẾT CHẾ THÔNG BÁO)
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        return Boolean(isEnabled && wrapper);
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive() && typeof window.triggerIslandNotification === 'function') {
            window.triggerIslandNotification(title, desc, type, duration);
        } else if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. NGÔN NGỮ HỌC (LINGUISTIC ENGINE)
// =============================================================================
const PRODUCTIVE_CONS = ['h', 'v', 'm', 'l', 'b', 't', 'ch', 'ng', 'n', 'ph', 'r', 's', 'th', 'tr', 'đ', 'd', 'x', 'k', 'c', 'g', 'nh', 'kh'];

const TONE_MAP = [
    ['a', 'à', 'á', 'ả', 'ã', 'ạ'], ['ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ'], ['â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ'],
    ['e', 'è', 'é', 'ẻ', 'ẽ', 'ẹ'], ['ê', 'ề', 'ế', 'ể', 'ễ', 'ệ'], ['i', 'ì', 'í', 'ỉ', 'ĩ', 'ị'],
    ['o', 'ò', 'ó', 'ỏ', 'õ', 'ọ'], ['ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ'], ['ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ'],
    ['u', 'ù', 'ú', 'ủ', 'ũ', 'ụ'], ['ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự'], ['y', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ']
];

const CHAR_TO_BASE_TONE = {};
TONE_MAP.forEach(row => {
    const base = row[0];
    row.forEach((char, index) => { CHAR_TO_BASE_TONE[char] = { base, tone: index }; });
});

const parseSyllable = (word) => {
    let text = word.toLowerCase().trim();
    if (!text) return null;
    let initial = '';
    const ALL_CONS_DESC = ['ngh', 'tr', 'th', 'ph', 'ng', 'nh', 'kh', 'gh', 'ch', 'qu', 'gi', 'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'];
    for (let c of ALL_CONS_DESC) {
        if (text.startsWith(c)) {
            initial = c; text = text.substring(c.length); break;
        }
    }
    let baseRhyme = '', toneIndex = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const mapInfo = CHAR_TO_BASE_TONE[char];
        if (mapInfo) {
            baseRhyme += mapInfo.base;
            if (mapInfo.tone !== 0) toneIndex = mapInfo.tone;
        } else {
            baseRhyme += char;
        }
    }
    return { initial, baseRhyme, toneIndex, original: word };
};

const applyTone = (baseRhyme, toneIndex) => {
    if (toneIndex === 0) return baseRhyme;
    let chars = baseRhyme.split('');
    let vowels = [];
    const bases = 'aăâeêioôơuưy';
    for (let i = 0; i < chars.length; i++) {
        if (bases.includes(chars[i])) vowels.push(i);
    }
    if (vowels.length === 0) return baseRhyme;

    let targetIndex = vowels[0];
    if (vowels.length === 2) {
        const endsWithCons = !bases.includes(chars[chars.length - 1]);
        if (endsWithCons) targetIndex = vowels[1];
        else {
            const v1 = chars[vowels[0]], v2 = chars[vowels[1]];
            if ((v1 === 'u' && v2 === 'y') || (v1 === 'o' && v2 === 'a') || (v1 === 'o' && v2 === 'e')) targetIndex = vowels[1];
            else targetIndex = vowels[0];
        }
    } else if (vowels.length === 3) targetIndex = vowels[1];

    const baseChar = chars[targetIndex];
    let accentedChar = baseChar;
    const row = TONE_MAP.find(r => r[0] === baseChar);
    if (row) accentedChar = row[toneIndex];
    chars[targetIndex] = accentedChar;
    return chars.join('');
};

const constructWord = (initial, baseRhyme, toneIndex) => {
    if (!baseRhyme) return '';
    let firstVowel = baseRhyme.charAt(0);
    let isFront = ['i', 'e', 'ê', 'y'].includes(firstVowel);
    let finalInit = initial;

    if (isFront) {
        if (initial === 'c') finalInit = 'k';
        if (initial === 'g') finalInit = 'gh';
        if (initial === 'ng') finalInit = 'ngh';
    } else {
        if (initial === 'k') finalInit = 'c';
        if (initial === 'gh') finalInit = 'g';
        if (initial === 'ngh') finalInit = 'ng';
    }

    let finalRhyme = baseRhyme;
    if (finalInit === 'gi' && firstVowel === 'i') {
        if (baseRhyme === 'i') return 'g' + applyTone('i', toneIndex);
        finalRhyme = baseRhyme.substring(1);
    }
    if (finalInit === 'qu' && firstVowel === 'u') {
        if (baseRhyme === 'u') return 'c' + applyTone('u', toneIndex);
        finalRhyme = baseRhyme.substring(1);
    }

    if (['k', 'gh', 'ngh'].includes(finalInit) && !isFront) return null;

    return finalInit + applyTone(finalRhyme, toneIndex);
};

function generateAccuratePairs(p1, p2) {
    let results = new Set();
    const tonePairs = [[p1.toneIndex, p2.toneIndex]];
    
    const shiftMap = {
        '0,2': [1, 5], '1,5': [0, 2], 
        '0,3': [1, 4], '1,4': [0, 3], 
        '0,0': [1, 1], '1,1': [0, 0]
    };
    const shifted = shiftMap[`${p1.toneIndex},${p2.toneIndex}`];
    if (shifted) tonePairs.push(shifted);

    tonePairs.forEach(tones => {
        const [t1, t2] = tones;
        PRODUCTIVE_CONS.forEach(c => {
            let w1 = constructWord(c, p1.baseRhyme, t1);
            let w2 = constructWord(c, p2.baseRhyme, t2);
            
            if (w1 && w2 && (c !== p1.initial || t1 !== p1.toneIndex)) {
                results.add(`${w1} ${w2}`);
            }
        });
    });
    return [...results].slice(0, 16);
}

// =============================================================================
// 3. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="tnt-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #tnt-root-container {
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

            .tnt-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Linguistics</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Trạm Ngôn Từ</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Thuật toán xử lý ngôn ngữ tiếng Việt: Gieo vần, vần đảo và nói lái tự động.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="tnt-clearBtn" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm opacity-0 pointer-events-none">
                        <i class="fas fa-trash-can text-xs"></i> <span>Xóa trắng</span>
                    </button>
                </div>
            </div>

            <!-- TAB CONTROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="tnt-tabs">
                    <button class="tnt-tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-tab="van-xuoi">
                        <i class="fas fa-microphone text-[11px]"></i> Gieo vần
                    </button>
                    <button class="tnt-tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-tab="van-dao">
                        <i class="fas fa-arrows-rotate text-[11px]"></i> Vần đảo
                    </button>
                    <button class="tnt-tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-tab="noi-lai">
                        <i class="fas fa-shuffle text-[11px]"></i> Nói lái
                    </button>
                </div>
            </div>

            <!-- WORKSPACE CONTAINER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
                
                <!-- INPUT BAR -->
                <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all flex items-center gap-3">
                    <div class="w-10 h-10 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-accent-theme shrink-0 shadow-sm">
                        <i class="fas fa-keyboard text-xs"></i>
                    </div>
                    <input type="text" id="tnt-wordInput" class="tnt-input-zen w-full bg-transparent border-none outline-none text-sm sm:text-base font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Nhập từ để gieo vần (VD: cun cút...)">
                </div>

                <!-- RESULTS CONTAINER -->
                <div id="tnt-resultsContainer" class="min-h-[220px] flex flex-col justify-center">
                    <!-- EMPTY STATE -->
                    <div id="tnt-emptyState" class="flex flex-col items-center justify-center py-14 text-center space-y-2.5">
                        <div class="w-12 h-12 rounded-[16px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xl shadow-sm">
                            <i class="fas fa-terminal"></i>
                        </div>
                        <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Đang đợi dữ liệu đầu vào</span>
                        <span class="text-[11px] text-zinc-400">Nhập từ khóa vào ô phía trên để bắt đầu phân tích vần điệu.</span>
                    </div>
                    
                    <div id="tnt-dynamicContent" class="hidden w-full"></div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING (TIẾT CHẾ THÔNG BÁO)
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#tnt-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let currentTab = 'van-xuoi';
    const inputEl = hostElement.querySelector('#tnt-wordInput');
    const clearBtn = hostElement.querySelector('#tnt-clearBtn');
    const emptyStateEl = hostElement.querySelector('#tnt-emptyState');
    const contentEl = hostElement.querySelector('#tnt-dynamicContent');

    if (!inputEl || !emptyStateEl || !contentEl) return;

    const placeholders = {
        'van-xuoi': 'Nhập từ để gieo vần (VD: cun cút...)',
        'van-dao': 'Nhập 2 từ để đảo vần (VD: bảo đảm)',
        'noi-lai': 'Nhập câu hoặc 2 từ để nói lái (VD: bí mật)'
    };

    // Tab Classes Standard
    const activeClass = 'tnt-tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveClass = 'tnt-tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    const tabBtns = hostElement.querySelectorAll('#tnt-tabs .tnt-tab-btn');
    tabBtns.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.currentTarget;
            currentTab = target.getAttribute('data-tab');
            
            inputEl.placeholder = placeholders[currentTab];
            inputEl.value = ''; 
            clearBtn.style.opacity = '0';
            clearBtn.classList.add('pointer-events-none');
            
            tabBtns.forEach(t => { t.className = inactiveClass; });
            target.className = activeClass;
            
            renderResults();
            inputEl.focus();
        });
    });

    // Clear Button
    clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        clearBtn.style.opacity = '0';
        clearBtn.classList.add('pointer-events-none');
        renderResults();
        inputEl.focus();
    });

    // Copy Action Delegation
    contentEl.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.tnt-copy-action');
        if (!copyBtn) return;

        const textToCopy = copyBtn.getAttribute('data-text');
        try {
            await navigator.clipboard.writeText(textToCopy);
            IslandKit.notify('Đã sao chép', `Đã lưu "${textToCopy}" vào bộ nhớ tạm.`, 'success', 1000);
        } catch (err) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    });

    // Render Kết Quả
    function renderResults() {
        const text = inputEl.value.trim();
        if (text) {
            clearBtn.style.opacity = '1';
            clearBtn.classList.remove('pointer-events-none');
        } else {
            clearBtn.style.opacity = '0';
            clearBtn.classList.add('pointer-events-none');
        }

        if (!text) {
            emptyStateEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            contentEl.innerHTML = '';
            return;
        }

        emptyStateEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
        contentEl.classList.remove('ui-fade-in');
        void contentEl.offsetWidth; 
        contentEl.classList.add('ui-fade-in');

        let html = '';
        const words = text.split(/\s+/);
        const parsedWords = words.map(parseSyllable).filter(Boolean);

        // TAB 1: GIEO VẦN
        if (currentTab === 'van-xuoi') {
            if (words.length === 1) {
                const parsed = parsedWords[0];
                if (parsed && parsed.baseRhyme) {
                    let results = new Set();
                    PRODUCTIVE_CONS.forEach(cons => {
                        const exactTone = constructWord(cons, parsed.baseRhyme, parsed.toneIndex);
                        if (exactTone && exactTone !== text.toLowerCase()) results.add(exactTone);
                    });
                    
                    const uniqueRes = [...results].slice(0, 16);
                    
                    html = `
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            ${uniqueRes.map(word => `
                                <button data-text="${word}" class="tnt-copy-action h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme text-zinc-900 dark:text-white font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <span>${word}</span> <i class="far fa-copy text-zinc-400 text-[10px]"></i>
                                </button>
                            `).join('')}
                        </div>
                    `;
                }
            } else if (words.length === 2) {
                const p1 = parsedWords[0];
                const p2 = parsedWords[1];
                let uniqueRes = generateAccuratePairs(p1, p2).filter(phrase => phrase !== text.toLowerCase());
                
                html = `
                    <div class="space-y-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-accent-theme-alpha text-[10px] font-mono font-bold text-accent-theme">
                            <i class="fas fa-link text-[9px]"></i> Cấu trúc vần: ${p1.baseRhyme} · ${p2.baseRhyme}
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            ${uniqueRes.map(phrase => `
                                <button data-text="${phrase}" class="tnt-copy-action h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme text-zinc-900 dark:text-white font-bold text-xs capitalize active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <span class="truncate">${phrase}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                html = `<div class="text-xs font-medium text-zinc-400 text-center py-10">Vui lòng nhập tối đa 2 từ để gieo vần chính xác nhất.</div>`;
            }
        } 
        
        // TAB 2: VẦN ĐẢO
        else if (currentTab === 'van-dao') {
            if (words.length !== 2) {
                html = `<div class="text-xs font-medium text-zinc-400 text-center py-10">Tính năng này cần nhập chính xác 2 từ (VD: Bảo đảm)</div>`;
            } else {
                const p1 = parsedWords[0];
                const p2 = parsedWords[1];
                let results = new Set();

                let r1_w1 = constructWord(p1.initial, p2.baseRhyme, p2.toneIndex);
                let r1_w2 = constructWord(p2.initial, p1.baseRhyme, p1.toneIndex);
                if (r1_w1 && r1_w2) results.add(`${r1_w1} ${r1_w2}`);

                results.add(words.slice().reverse().join(' '));
                let uniqueRes = [...results].filter(phrase => phrase.toLowerCase() !== text.toLowerCase());
                
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${uniqueRes.map(phrase => `
                            <button data-text="${phrase}" class="tnt-copy-action p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme text-zinc-900 dark:text-white active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm">
                                <span class="text-lg font-black capitalize tracking-tight">${phrase}</span>
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest"><i class="far fa-copy mr-1"></i> Sao chép</span>
                            </button>
                        `).join('')}
                    </div>
                `;
            }
        } 
        
        // TAB 3: NÓI LÁI
        else if (currentTab === 'noi-lai') {
            if (words.length < 2) {
                html = `<div class="text-xs font-medium text-zinc-400 text-center py-10">Cần nhập ít nhất 2 từ để nói lái.</div>`;
            } else {
                const generateForPair = (idx1, idx2) => {
                    const w1 = parseSyllable(words[idx1]);
                    const w2 = parseSyllable(words[idx2]);
                    if (!w1 || !w2) return [];

                    const getPhrase = (newW1, newW2) => {
                        const newWords = [...words];
                        newWords[idx1] = newW1; 
                        newWords[idx2] = newW2;
                        return newWords.join(' ');
                    };

                    const res = [];
                    const t1_1 = constructWord(w2.initial, w1.baseRhyme, w1.toneIndex);
                    const t1_2 = constructWord(w1.initial, w2.baseRhyme, w2.toneIndex);
                    if (t1_1 && t1_2) res.push({ type: `Đổi Âm Đầu`, text: getPhrase(t1_1, t1_2) });

                    const t2_1 = constructWord(w1.initial, w2.baseRhyme, w2.toneIndex);
                    const t2_2 = constructWord(w2.initial, w1.baseRhyme, w1.toneIndex);
                    if (t2_1 && t2_2) res.push({ type: `Đổi Vần & Dấu`, text: getPhrase(t2_1, t2_2) });

                    const t3_1 = constructWord(w1.initial, w1.baseRhyme, w2.toneIndex);
                    const t3_2 = constructWord(w2.initial, w2.baseRhyme, w1.toneIndex);
                    if (t3_1 && t3_2) res.push({ type: `Chỉ đổi Dấu`, text: getPhrase(t3_1, t3_2) });

                    const t4_1 = constructWord(w1.initial, w2.baseRhyme, w1.toneIndex);
                    const t4_2 = constructWord(w2.initial, w1.baseRhyme, w2.toneIndex);
                    if (t4_1 && t4_2) res.push({ type: `Chỉ đổi Vần`, text: getPhrase(t4_1, t4_2) });
                    return res;
                };

                let results = words.length === 2 ? generateForPair(0, 1) : [
                    ...generateForPair(0, words.length - 1),
                    ...generateForPair(words.length - 2, words.length - 1)
                ];

                const unique = [];
                const seen = new Set();
                results.forEach(r => {
                    const lower = r.text.toLowerCase();
                    if (!seen.has(lower) && lower !== text.toLowerCase()) {
                        seen.add(lower); 
                        unique.push(r);
                    }
                });

                html = unique.length === 0 
                    ? `<div class="text-xs font-medium text-zinc-400 text-center py-10">Không tìm thấy kết quả nói lái phù hợp.</div>`
                    : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        ${unique.map(item => `
                            <div class="flex items-center justify-between p-3.5 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <div class="flex flex-col min-w-0 pr-2">
                                    <span class="text-[9px] font-bold text-accent-theme uppercase tracking-wider mb-0.5">${item.type}</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white capitalize truncate">${item.text}</span>
                                </div>
                                <button data-text="${item.text}" class="tnt-copy-action h-8 px-3 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme active:scale-95 transition-all shadow-sm shrink-0">
                                    Sao chép
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        contentEl.innerHTML = html;
    }

    inputEl.addEventListener('input', renderResults);
}