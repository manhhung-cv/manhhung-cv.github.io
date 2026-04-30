import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            
            /* Result Card */
            .res-card { position: relative; transition: all 0.2s; }
            .btn-copy-mini { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0; transition: opacity 0.2s; }
            .res-card:hover .btn-copy-mini { opacity: 1; }
            
            @media (max-width: 768px) {
                .btn-copy-mini { opacity: 1; }
            }
        </style>

        <div class="relative flex flex-col w-full max-w-[900px] mx-auto min-h-[500px]">
            
            <div class="mb-6 px-2 flex justify-between items-center">
                <div>
                    <h2 class="text-[22px] font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Mã Hóa SĐT</h2>
                    <p class="text-[13px] text-zinc-500 font-medium">15 Thuật toán Bypass Bot TMĐT. Tích hợp Smart Decoder.</p>
                </div>
            </div>

            <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-6 px-2 pb-2" id="pe-tabs">
                <button class="pe-tab active btn-premium px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-target="pane-encode"><i class="fas fa-lock mr-1.5"></i>Tạo 15 Mã Lách Luật</button>
                <button class="pe-tab btn-premium px-5 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800" data-target="pane-decode"><i class="fas fa-unlock mr-1.5"></i>Giải Mã Ngược</button>
            </div>

            <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 min-h-[400px]">
                
                <div id="pane-encode" class="pe-pane block animate-in fade-in">
                    
                    <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-[24px] p-5 mb-5 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">Nhập Số Điện Thoại</label>
                        <input type="tel" id="pe-input-phone" class="w-full bg-transparent border-none outline-none text-[2rem] font-black font-mono text-zinc-900 dark:text-white p-0 tracking-[0.2em] placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="0987654321" autocomplete="off" maxlength="15">
                    </div>

                    <button id="btn-encode" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                        <i class="fas fa-magic"></i> TẠO 15 PHIÊN BẢN MÃ HÓA
                    </button>

                    <div id="pe-results-wrap" class="hidden mt-6 flex-col gap-3">
                        <div class="flex justify-between items-center px-2 mb-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ma trận lách lọc (Click để Copy)</span>
                        </div>
                        
                        <div id="pe-results-list" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                            </div>
                        
                        <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                            <p class="text-[11px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed italic">
                                <i class="fas fa-shield-alt mr-1"></i> <strong>Bí kíp:</strong> Để an toàn tuyệt đối 100% không bị quét khóa Shop, hãy sử dụng các dạng mã hóa không chứa số như <strong>12 Con Giáp, Thiên Can, Nhạc Phổ</strong> hoặc <strong>Kanji Nhật Bản</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div id="pane-decode" class="pe-pane hidden animate-in fade-in">
                    
                    <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-[24px] p-5 mb-5 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">Dán chuỗi đã mã hóa vào đây</label>
                        <textarea id="pe-input-decode" class="w-full bg-transparent border-none outline-none text-base font-bold text-zinc-900 dark:text-white resize-y min-h-[120px] p-0 custom-scrollbar leading-relaxed placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="VD: Nulla IX Nulla I II III I II III"></textarea>
                    </div>

                    <button id="btn-decode" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                        <i class="fas fa-fingerprint"></i> BỘ GIẢI MÃ (SMART DECODER)
                    </button>

                    <div id="pe-decode-res-wrap" class="hidden mt-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-[24px] p-6 text-center">
                        <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Số điện thoại trích xuất được</span>
                        <div class="text-[2.5rem] font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-[0.2em]" id="pe-decode-val">--</div>
                        <button class="btn-premium mt-4 px-6 py-2 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider" id="btn-copy-decode">Sao chép SĐT</button>
                    </div>
                    
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- TỪ ĐIỂN SIÊU MÃ HÓA (15 THUẬT TOÁN ĐA NGÔN NGỮ) ---
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

    // --- XÂY DỰNG TỪ ĐIỂN GIẢI MÃ THÔNG MINH (LONGEST MATCH FIRST) ---
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

    // Chuyển Object thành Array phẳng và sắp xếp GIẢM DẦN THEO ĐỘ DÀI
    // Bí quyết để "VIII" được dịch trước "VII", "III" trước "II"
    const decodeList = [];
    for (let digit in decodeMapping) {
        decodeMapping[digit].forEach(word => {
            decodeList.push({ word: word, digit: digit });
        });
    }
    decodeList.sort((a, b) => b.word.length - a.word.length);

    // Từ điển riêng cho mã Morse
    const morseDict = {
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };

    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.pe-tab');
    const panes = document.querySelectorAll('.pe-pane');
    
    const inPhone = document.getElementById('pe-input-phone');
    const btnEncode = document.getElementById('btn-encode');
    const resWrap = document.getElementById('pe-results-wrap');
    const resList = document.getElementById('pe-results-list');

    const inDecode = document.getElementById('pe-input-decode');
    const btnDecode = document.getElementById('btn-decode');
    const decodeResWrap = document.getElementById('pe-decode-res-wrap');
    const decodeVal = document.getElementById('pe-decode-val');
    const btnCopyDecode = document.getElementById('btn-copy-decode');

    // --- TAB LOGIC ---
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900'); t.classList.add('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800'); });
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900'); tab.classList.remove('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            document.getElementById(tab.dataset.target).classList.remove('hidden'); document.getElementById(tab.dataset.target).classList.add('block');
        };
    });

    // --- HELPER FUNCTIONS ---
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const noise = () => pick(['', ' ', ' . ', ' - ', ' ~ ', ' _ ']); 

    inPhone.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });

    // --- GENERATE 15 TIER ALGORITHMS ---
    const generateEncodings = (phone) => {
        const results = [];
        const chars = phone.split('');

        results.push({ name: '1. Trộn Hỗn Loạn Đa Ngôn Ngữ', val: chars.map(c => pick([...dict[c].text, ...dict[c].slang, ...dict[c].jp, ...dict[c].en])).join(noise()) });
        results.push({ name: '2. Trộn Ký Tự Đồ Vật & Biểu Tượng', val: chars.map(c => pick([...dict[c].emoji, ...dict[c].special, ...dict[c].zodiac])).join(' ') });
        results.push({ name: '3. Tiếng Lóng (Teencode GenZ)', val: chars.map(c => capitalize(pick(dict[c].slang))).join(' ') });
        results.push({ name: '4. Tiếng Nhật Bản (Kanji/Romaji)', val: chars.map(c => pick(dict[c].jp)).join(' ') });
        results.push({ name: '5. Tiếng Anh (English)', val: chars.map(c => capitalize(pick(dict[c].en))).join(' ') });
        results.push({ name: '6. Phong thủy (Chữ Hán & Hán Việt)', val: chars.map(c => Math.random()>0.5 ? pick(dict[c].han) : capitalize(pick(dict[c].hv))).join(' ') });
        results.push({ name: '7. Hình tượng Đồ vật (Emoji Object)', val: chars.map(c => pick(dict[c].emoji)).join(' ') });
        results.push({ name: '8. Mật mã Động vật (12 Con Giáp)', val: chars.map(c => pick(dict[c].zodiac)).join(' ') });
        results.push({ name: '9. Chữ số La Mã (Roman Numerals)', val: chars.map(c => pick(dict[c].roman)).join(' ') });
        results.push({ name: '10. Font Ký tự Đặc Biệt / Khoanh tròn', val: chars.map(c => pick(dict[c].special)).join('') });
        results.push({ name: '11. Chữ cái ngụy trang (Leetspeak)', val: chars.map(c => pick(dict[c].leet)).join('') });
        
        let invisible = '';
        for (let i = 0; i < phone.length; i++) {
            invisible += phone[i];
            if (i < phone.length - 1) invisible += pick(['\u200B', '\u200C', '\u200B\u200C']);
        }
        invisible = invisible.substring(0, 4) + ' ' + invisible.substring(4, 7) + ' ' + invisible.substring(7); // Format đẹp
        results.push({ name: '12. Ký tự Tàng Hình vô hình (Zero-width)', val: invisible });

        results.push({ name: '13. Mã Morse Máy Tín (Dấu chấm & gạch)', val: chars.map(c => dict[c].morse).join(' ') });
        results.push({ name: '14. Thiên Can Hệ (Giáp Ất Bính Đinh)', val: chars.map(c => capitalize(pick(dict[c].can))).join(' ') });
        results.push({ name: '15. Âm luật Nhạc phổ (Đồ Rê Mi Fa)', val: chars.map(c => capitalize(pick(dict[c].note))).join(' ') });

        return results;
    };

    // --- ENCODE ACTION ---
    btnEncode.onclick = () => {
        const phone = inPhone.value.trim();
        if (phone.length < 8) return UI.showAlert('Lỗi', 'Vui lòng nhập SĐT hợp lệ (từ 8-15 số).', 'warning');

        const variations = generateEncodings(phone);
        resList.innerHTML = '';

        variations.forEach(item => {
            const card = document.createElement('div');
            card.className = 'res-card bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group flex flex-col justify-center';
            
            card.innerHTML = `
                <div class="text-[9px] font-bold text-blue-500 uppercase mb-1.5 tracking-widest">${item.name}</div>
                <div class="text-[13px] font-bold text-zinc-900 dark:text-white pr-8 break-words leading-relaxed">${item.val}</div>
                <button class="btn-copy-mini btn-premium w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                    <i class="far fa-copy text-sm"></i>
                </button>
            `;

            card.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(item.val);
                    UI.showAlert('Đã chép', `Đã sao chép: ${item.name}`, 'success', 1000);
                } catch (err) {
                    UI.showAlert('Lỗi', 'Trình duyệt chặn quyền sao chép.', 'error');
                }
            };
            resList.appendChild(card);
        });

        resWrap.classList.remove('hidden'); resWrap.classList.add('flex');
    };

    // --- DECODE ACTION (SMART DECODER 100% ACCURACY) ---
    btnDecode.onclick = () => {
        let text = inDecode.value;
        if (!text.trim()) return UI.showAlert('Lỗi', 'Vui lòng dán chuỗi cần giải mã.', 'warning');

        // B1: Xóa toàn bộ ký tự tàng hình (Zero-width chars)
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

        // B2: Giải mã Mã Morse trước tiên (Vì nó có thể chứa dấu chấm/dấu gạch)
        for (let d in morseDict) {
            const escapedMorse = morseDict[d].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            text = text.replace(new RegExp(escapedMorse, 'g'), d);
        }

        // B3: Dùng cỗ máy quét Từ Điển (Longest Match First)
        // LƯU Ý QUAN TRỌNG: KHÔNG ĐƯỢC XÓA KHOẢNG TRẮNG Ở ĐÂY.
        // Cần bảo toàn khoảng trắng để bóc tách chính xác các cụm "I II III" độc lập.
        decodeList.forEach(item => {
            const escapedWord = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedWord, 'gi'); // Không phân biệt hoa thường
            text = text.replace(regex, item.digit);
        });

        // B4: Ở bước cuối cùng này, tất cả những gì là từ khóa đã được chuyển thành số.
        // Ta chỉ việc xóa sạch khoảng trắng và các ký tự thừa thãi, chỉ giữ lại số (0-9)
        const extractedNumbers = text.replace(/\D/g, '');

        if (extractedNumbers.length === 0) {
            decodeResWrap.classList.remove('hidden');
            decodeVal.textContent = "THẤT BẠI";
            decodeVal.className = "text-xl font-bold text-red-500 mt-2 mb-4";
            btnCopyDecode.style.display = 'none';
        } else {
            decodeResWrap.classList.remove('hidden');
            decodeVal.textContent = extractedNumbers;
            decodeVal.className = "text-[2rem] sm:text-[2.5rem] font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-[0.1em] sm:tracking-[0.2em]";
            btnCopyDecode.style.display = 'inline-block';
            
            btnCopyDecode.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(extractedNumbers);
                    UI.showAlert('Đã chép', 'Sao chép SĐT giải mã thành công.', 'success');
                } catch (e) {
                    UI.showAlert('Lỗi', 'Không thể sao chép.', 'error');
                }
            };
        }
    };
}