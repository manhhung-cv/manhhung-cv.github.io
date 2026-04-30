import { UI } from '../../js/ui.js';

// =====================================================================
// 1. NGÔN NGỮ HỌC (LINGUISTIC ENGINE)
// =====================================================================
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

// =====================================================================
// 2. TEMPLATE GIAO DIỆN CHUẨN UI.JS
// =====================================================================
export function template() {
    return `
        <style>
            /* Kế thừa UI Kit Scrollbar & Animations */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            
            .ui-block { position: relative; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <!-- Header Chuẩn -->
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Trạm Ngôn Từ</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Thuật toán xử lý ngôn ngữ tinh gọn. Nhanh và chuẩn xác.</p>
            </div>

            <!-- Block Điều khiển -->
            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 mb-6 ui-fade-in" style="animation-delay: 100ms;">
                <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Thiết lập thuật toán</h3>
                
                <!-- Tabs Chuẩn ui.js -->
                <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-5" id="tnt-tabs">
                    <button class="tnt-tab-btn active btn-premium px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-tab="van-xuoi">
                        <i class="fas fa-microphone mr-1.5"></i> Gieo Vần
                    </button>
                    <button class="tnt-tab-btn btn-premium px-5 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800" data-tab="van-dao">
                        <i class="fas fa-sync-alt mr-1.5"></i> Vần Đảo
                    </button>
                    <button class="tnt-tab-btn btn-premium px-5 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800" data-tab="noi-lai">
                        <i class="fas fa-exchange-alt mr-1.5"></i> Nói Lái
                    </button>
                </div>

                <!-- Group Input Chuẩn ui.js -->
                <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow">
                    <i class="fas fa-keyboard text-zinc-400 ml-4 text-sm"></i>
                    <input type="text" id="tnt-wordInput" class="w-full bg-transparent border-none outline-none px-3 py-3 text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Nhập từ để gieo vần (VD: cun cút...)">
                    <button id="tnt-clearBtn" class="btn-premium w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center opacity-0 transition-opacity"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <!-- Block Kết quả -->
            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 ui-fade-in flex-1" style="animation-delay: 200ms;">
                <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Kết quả xuất ra</h3>
                
                <div id="tnt-resultsContainer" class="min-h-[200px] flex flex-col justify-center">
                    <!-- Trạng thái trống chuẩn ui.js -->
                    <div id="tnt-emptyState" class="flex flex-col items-center justify-center py-10 opacity-50">
                        <i class="fas fa-terminal text-3xl text-zinc-400 dark:text-zinc-600 mb-3"></i>
                        <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Đang đợi dữ liệu đầu vào...</span>
                    </div>
                    
                    <div id="tnt-dynamicContent" class="hidden w-full"></div>
                </div>
            </div>

        </div>
    `;
}

// =====================================================================
// 3. LOGIC KHỞI TẠO ĐỒNG BỘ UI.JS
// =====================================================================
export function init() {
    let currentTab = 'van-xuoi';
    const inputEl = document.getElementById('tnt-wordInput');
    const clearBtn = document.getElementById('tnt-clearBtn');
    const emptyStateEl = document.getElementById('tnt-emptyState');
    const contentEl = document.getElementById('tnt-dynamicContent');

    if (!inputEl || !emptyStateEl || !contentEl) return;

    const placeholders = {
        'van-xuoi': 'Nhập từ để gieo vần (VD: cun cút...)',
        'van-dao': 'Nhập 2 từ để đảo vần (VD: bảo đảm)',
        'noi-lai': 'Nhập câu hoặc 2 từ để nói lái (VD: bí mật)'
    };

    // --- Xử lý Tabs theo logic ui.js ---
    const tabBtns = document.querySelectorAll('.tnt-tab-btn');
    tabBtns.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.currentTarget;
            currentTab = target.getAttribute('data-tab');
            
            inputEl.placeholder = placeholders[currentTab];
            inputEl.value = ''; 
            clearBtn.style.opacity = '0';
            
            // Xóa class active ở tất cả các tab
            tabBtns.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            });
            
            // Thêm class active cho tab được chọn
            target.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            target.classList.remove('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            
            renderResults();
            inputEl.focus();
        });
    });

    // --- Clear Button ---
    clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        clearBtn.style.opacity = '0';
        renderResults();
        inputEl.focus();
    });

    // --- Lắng nghe sự kiện Copy ---
    contentEl.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.tnt-copy-action');
        if (!copyBtn) return;

        const textToCopy = copyBtn.getAttribute('data-text');
        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Sử dụng UI.showAlert chuẩn
            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Đã sao chép', `Đã lưu "${textToCopy}" vào khay nhớ tạm.`, 'success');
            }
        } catch (err) {
            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
            }
        }
    });

    // --- Logic Render Kết Quả ---
    function renderResults() {
        const text = inputEl.value.trim();
        clearBtn.style.opacity = text ? '1' : '0';

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
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            ${uniqueRes.map(word => `
                                <button data-text="${word}" class="tnt-copy-action btn-premium py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                                    ${word} <i class="far fa-copy text-zinc-400 opacity-50 text-[10px]"></i>
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
                    <div class="mb-4">
                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <i class="fas fa-link"></i> Cấu trúc: ${p1.baseRhyme} · ${p2.baseRhyme}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${uniqueRes.map(phrase => `
                            <button data-text="${phrase}" class="tnt-copy-action btn-premium py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors capitalize flex items-center justify-center gap-2">
                                ${phrase}
                            </button>
                        `).join('')}
                    </div>
                `;
            } else {
                html = `<div class="text-[13px] font-medium text-zinc-500 text-center py-6">Vui lòng nhập tối đa 2 từ để gieo vần chính xác nhất.</div>`;
            }
        } 
        
        // TAB 2: VẦN ĐẢO
        else if (currentTab === 'van-dao') {
            if (words.length !== 2) {
                html = `<div class="text-[13px] font-medium text-zinc-500 text-center py-6">Tính năng này cần nhập chính xác 2 từ (VD: Bảo đảm)</div>`;
            } else {
                const p1 = parsedWords[0];
                const p2 = parsedWords[1];
                let results = new Set();

                let r1_w1 = constructWord(p1.initial, p2.baseRhyme, p2.toneIndex);
                let r1_w2 = constructWord(p2.initial, p1.baseRhyme, p1.toneIndex);
                if (r1_w1 && r1_w2) results.add(`${r1_w1} ${r1_w2}`);

                results.add(words.reverse().join(' '));
                let uniqueRes = [...results].filter(phrase => phrase.toLowerCase() !== text.toLowerCase());
                
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${uniqueRes.map(phrase => `
                            <button data-text="${phrase}" class="tnt-copy-action btn-premium p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center gap-2 transition-colors">
                                <span class="text-2xl font-black capitalize tracking-tight">${phrase}</span>
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><i class="far fa-copy"></i> Copy</span>
                            </button>
                        `).join('')}
                    </div>
                `;
            }
        } 
        
        // TAB 3: NÓI LÁI
        else if (currentTab === 'noi-lai') {
            if (words.length < 2) {
                html = `<div class="text-[13px] font-medium text-zinc-500 text-center py-6">Cần nhập ít nhất 2 từ.</div>`;
            } else {
                const generateForPair = (idx1, idx2, labelStr) => {
                    const w1 = parseSyllable(words[idx1]);
                    const w2 = parseSyllable(words[idx2]);
                    if (!w1 || !w2) return [];

                    const getPhrase = (newW1, newW2) => {
                        const newWords = [...words];
                        newWords[idx1] = newW1; newWords[idx2] = newW2;
                        return newWords.join(' ');
                    };

                    const res = [];
                    const t1_1 = constructWord(w2.initial, w1.baseRhyme, w1.toneIndex);
                    const t1_2 = constructWord(w1.initial, w2.baseRhyme, w2.toneIndex);
                    if(t1_1 && t1_2) res.push({ type: `Đổi Âm Đầu`, text: getPhrase(t1_1, t1_2) });

                    const t2_1 = constructWord(w1.initial, w2.baseRhyme, w2.toneIndex);
                    const t2_2 = constructWord(w2.initial, w1.baseRhyme, w1.toneIndex);
                    if(t2_1 && t2_2) res.push({ type: `Đổi Vần & Dấu`, text: getPhrase(t2_1, t2_2) });

                    const t3_1 = constructWord(w1.initial, w1.baseRhyme, w2.toneIndex);
                    const t3_2 = constructWord(w2.initial, w2.baseRhyme, w1.toneIndex);
                    if(t3_1 && t3_2) res.push({ type: `Chỉ đổi Dấu`, text: getPhrase(t3_1, t3_2) });

                    const t4_1 = constructWord(w1.initial, w2.baseRhyme, w1.toneIndex);
                    const t4_2 = constructWord(w2.initial, w1.baseRhyme, w2.toneIndex);
                    if(t4_1 && t4_2) res.push({ type: `Chỉ đổi Vần`, text: getPhrase(t4_1, t4_2) });
                    return res;
                };

                let results = words.length === 2 ? generateForPair(0, 1, "") : [
                    ...generateForPair(0, words.length - 1, ""),
                    ...generateForPair(words.length - 2, words.length - 1, "")
                ];

                const unique = [];
                const seen = new Set();
                results.forEach(r => {
                    const lower = r.text.toLowerCase();
                    if (!seen.has(lower) && lower !== text.toLowerCase()) {
                        seen.add(lower); unique.push(r);
                    }
                });

                html = unique.length === 0 
                    ? `<div class="text-[13px] font-medium text-zinc-500 text-center py-6">Không tìm thấy kết quả phù hợp.</div>`
                    : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${unique.map(item => `
                            <div class="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">${item.type}</span>
                                    <span class="text-base font-bold text-zinc-900 dark:text-white capitalize">${item.text}</span>
                                </div>
                                <button data-text="${item.text}" class="tnt-copy-action btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    Copy
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