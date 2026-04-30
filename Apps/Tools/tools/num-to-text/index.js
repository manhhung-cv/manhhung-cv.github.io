import { UI } from '../../js/ui.js';

// =====================================================================
// 1. CORE LOGIC: THUẬT TOÁN ĐỌC SỐ
// =====================================================================
const VI_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function readVietnamese(number) {
    if (number === 0) return 'không đồng';
    let str = number.toString(); let result = '';
    const readGroup = (n, full) => {
        let res = ''; let tram = Math.floor(n / 100); let chuc = Math.floor((n % 100) / 10); let donvi = n % 10;
        if (full || tram > 0) res += VI_WORDS[tram] + ' trăm ';
        if (chuc === 0 && donvi > 0 && (full || tram > 0)) res += 'lẻ ';
        if (chuc === 1) res += 'mười ';
        if (chuc > 1) res += VI_WORDS[chuc] + ' mươi ';
        if (donvi === 1 && chuc > 1) res += 'mốt ';
        else if (donvi === 5 && chuc > 0) res += 'lăm ';
        else if (donvi > 0 && !(chuc === 1 && donvi === 1)) res += VI_WORDS[donvi] + ' ';
        return res.trim();
    };
    let scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    let groups = [];
    while (str.length > 0) { groups.push(str.slice(-3)); str = str.slice(0, -3); }
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = parseInt(groups[i], 10);
        if (g > 0) { let full = (i < groups.length - 1); result += readGroup(g, full) + ' ' + scales[i] + ' '; }
    }
    return result.trim().replace(/\s+/g, ' ') + ' đồng';
}

const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function readEnglish(num) {
    if (num === 0) return 'zero';
    if (num < 20) return EN_ONES[num];
    if (num < 100) return EN_TENS[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + EN_ONES[num % 10] : '');
    if (num < 1000) return EN_ONES[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + readEnglish(num % 100) : '');
    const scales = ['', 'thousand', 'million', 'billion', 'trillion'];
    let str = num.toString(); let groups = [];
    while (str.length > 0) { groups.push(str.slice(-3)); str = str.slice(0, -3); }
    let res = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = parseInt(groups[i], 10);
        if (g > 0) res += readEnglish(g) + ' ' + scales[i] + ' ';
    }
    return res.trim();
}

function readCJK(num, lang) {
    if (num === 0) return lang === 'ja' ? 'ゼロ' : (lang === 'zh' ? '零' : '영');
    const numMap = { 'ja': ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'], 'zh': ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'], 'ko': ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'] };
    const unitMap = { 'ja': ['', '十', '百', '千'], 'zh': ['', '十', '百', '千'], 'ko': ['', '십', '백', '천'] };
    const scaleMap = { 'ja': ['', '万', '億', '兆'], 'zh': ['', '万', '亿', '兆'], 'ko': ['', '만', '억', '조'] };
    let str = num.toString(); let groups = [];
    while (str.length > 0) { groups.push(str.slice(-4)); str = str.slice(0, -4); }
    let result = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = groups[i]; let gNum = parseInt(g, 10);
        if (gNum === 0) continue;
        let gStr = '';
        for (let j = 0; j < g.length; j++) {
            let digit = parseInt(g[j], 10); let pos = g.length - 1 - j;
            if (digit > 0) {
                if (digit === 1 && pos > 0 && (lang === 'ja' || lang === 'ko')) gStr += unitMap[lang][pos];
                else gStr += numMap[lang][digit] + unitMap[lang][pos];
            } else if (lang === 'zh' && j < g.length - 1 && parseInt(g[j+1], 10) > 0) gStr += '零';
        }
        result += gStr + scaleMap[lang][i];
    }
    if (lang === 'ja') return result + '円'; 
    if (lang === 'zh') return result + '元';
    if (lang === 'ko') return result + '원';
    return result;
}

function readSpanish(num) {
    if (num === 0) return 'cero';
    const ones = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve'];
    const tens = ['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
    const hundreds = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
    if (num < 20) return ones[num];
    if (num < 30) return num === 20 ? 'veinte' : 'veinti' + ones[num-20];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 !== 0 ? ' y ' + ones[num%10] : '');
    if (num < 1000) return num === 100 ? 'cien' : hundreds[Math.floor(num/100)] + (num%100 !== 0 ? ' ' + readSpanish(num%100) : '');
    if (num < 1000000) {
        let m = Math.floor(num/1000); let rem = num % 1000;
        let mStr = m === 1 ? 'mil' : readSpanish(m) + ' mil';
        return mStr + (rem !== 0 ? ' ' + readSpanish(rem) : '');
    }
    let m = Math.floor(num/1000000); let rem = num % 1000000;
    let mStr = m === 1 ? 'un millón' : readSpanish(m) + ' millones';
    return mStr + (rem !== 0 ? ' ' + readSpanish(rem) : '');
}

function readFrench(num) {
    if (num === 0) return 'zéro';
    const ones = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
    const tens = ['','dix','vingt','trente','quarante','cinquante','soixante'];
    if (num < 20) return ones[num];
    if (num < 70) {
        let t = Math.floor(num/10); let r = num%10;
        if (r === 0) return tens[t];
        if (r === 1) return tens[t] + ' et un';
        return tens[t] + '-' + ones[r];
    }
    if (num < 80) { let r = num - 60; return r === 11 ? 'soixante et onze' : 'soixante-' + ones[r]; }
    if (num < 100) { let r = num - 80; return r === 0 ? 'quatre-vingts' : 'quatre-vingt-' + ones[r]; }
    if (num < 1000) {
        let h = Math.floor(num/100); let r = num%100;
        let hStr = h === 1 ? 'cent' : ones[h] + (r===0?' cents':' cent');
        return hStr + (r !== 0 ? ' ' + readFrench(r) : '');
    }
    if (num < 1000000) {
        let m = Math.floor(num/1000); let r = num%1000;
        let mStr = m === 1 ? 'mille' : readFrench(m) + ' mille';
        return mStr + (r !== 0 ? ' ' + readFrench(r) : '');
    }
    let m = Math.floor(num/1000000); let r = num%1000000;
    let mStr = m === 1 ? 'un million' : readFrench(m) + ' millions';
    return mStr + (r !== 0 ? ' ' + readFrench(r) : '');
}

async function translateText(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0];
    } catch (error) { return "Lỗi kết nối API dịch thuật."; }
}


// =====================================================================
// 2. TEMPLATE GIAO DIỆN CHUẨN UI.JS (REDESIGNED PLAYER BLOCK)
// =====================================================================
export function template() {
    return `
        <style>
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            
            .num-input-zen { font-variant-numeric: tabular-nums; }
            
            /* Clean Select */
            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
            
            /* Custom Range Slider */
            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
            .flat-range::-webkit-slider-runnable-track { height: 4px; background: #e4e4e7; border-radius: 2px; transition: background 0.2s; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #18181b; margin-top: -5px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.1s; }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }
            .flat-range:active::-webkit-slider-thumb { transform: scale(1.2); }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-6 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Đọc Số Tiền</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Chuyển đổi số thành văn bản đa ngôn ngữ, hỗ trợ tinh chỉnh giọng bản địa và tải MP3.</p>
            </div>

            <!-- Block Nhập Liệu & Chọn Ngôn Ngữ -->
            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 sm:p-6 mb-6 ui-fade-in" style="animation-delay: 100ms;">
                
                <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-2 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow mb-4">
                    <i class="fas fa-wallet text-zinc-400 ml-4 text-xl"></i>
                    <input type="text" id="num-input" inputmode="numeric" class="num-input-zen w-full bg-transparent border-none outline-none px-4 py-3 sm:py-4 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="0">
                    <button id="num-clear" class="btn-premium w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center opacity-0 transition-opacity"><i class="fas fa-times-circle text-lg"></i></button>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <div class="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto" id="lang-quick-chips">
                        <button class="lang-btn active btn-premium px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[12px] font-bold whitespace-nowrap shrink-0 flex-1 sm:flex-none justify-center" data-lang="vi" data-code="vi-VN">🇻🇳 Việt</button>
                        <button class="lang-btn btn-premium px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 text-[12px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-700 flex-1 sm:flex-none justify-center" data-lang="en" data-code="en-US">🇺🇸 Anh</button>
                        <button class="lang-btn btn-premium px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 text-[12px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-700 flex-1 sm:flex-none justify-center" data-lang="ja" data-code="ja-JP">🇯🇵 Nhật</button>
                    </div>
                    
                    <select id="lang-select-master" class="btn-premium w-full sm:w-auto flex-1 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[12px] font-bold outline-none cursor-pointer">
                        <option value="">Tất cả ngôn ngữ...</option>
                        <optgroup label="E2E">
                            <option value="zh" data-code="zh-CN">🇨🇳 Trung Quốc (中文)</option>
                            <option value="ko" data-code="ko-KR">🇰🇷 Hàn Quốc (한국어)</option>
                            <option value="es" data-code="es-ES">🇪🇸 Tây Ban Nha (Español)</option>
                            <option value="fr" data-code="fr-FR">🇫🇷 Pháp (Français)</option>
                        </optgroup>
                        <optgroup label="Google API">
                            <option value="de" data-code="de-DE">🇩🇪 Đức (Deutsch)</option>
                            <option value="ru" data-code="ru-RU">🇷🇺 Nga (Русский)</option>
                            <option value="th" data-code="th-TH">🇹🇭 Thái Lan (ไทย)</option>
                            <option value="id" data-code="id-ID">🇮🇩 Indonesia</option>
                            <option value="hi" data-code="hi-IN">🇮🇳 Ấn Độ (हिन्दी)</option>
                            <option value="ar" data-code="ar-SA">🇸🇦 Ả Rập (العربية)</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <!-- Block Kết Quả & Trình Phát (REDESIGNED) -->
            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 sm:p-6 ui-fade-in flex-1 flex flex-col" style="animation-delay: 200ms;">
                
                <div class="relative flex-1 bg-zinc-50 dark:bg-[#121214]/50 rounded-[24px] p-2 flex flex-col justify-between mb-0 overflow-hidden group">
                    
                    <!-- Background Decoration -->
                    <div class="absolute -top-24 -right-24 w-48 h-48 bg-zinc-200/40 dark:bg-zinc-800/20 rounded-full blur-3xl"></div>

                    <!-- Chỉ báo đang dịch -->
                    <span id="translating-indicator" class="hidden absolute top-5 right-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse z-10">
                        <i class="fas fa-circle-notch fa-spin mr-1"></i> API...
                    </span>

                    <!-- Display Text Area -->
                    <div class="flex-1 flex items-center justify-center min-h-[160px] z-10">
                        <p id="result-text" class="text-2xl sm:text-4xl font-light text-zinc-900 dark:text-white capitalize leading-tight tracking-tight text-center transition-opacity duration-300">
                            <span class="text-zinc-300 dark:text-zinc-700 font-normal italic text-[18px]">Đang đợi số liệu...</span>
                        </p>
                    </div>
                    
                    <!-- Media Player Control Bar -->
                    <div class="w-full bg-white dark:bg-[#18181b] rounded-[20px] p-2.5 sm:p-3 border border-zinc-200 dark:border-zinc-700/50 flex flex-col sm:flex-row items-center gap-3 shadow-sm z-10">
                        
                        <!-- Play Button -->
                        <button id="btn-play" class="btn-premium shrink-0 w-full sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-[14px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center gap-2 opacity-50 pointer-events-none transition-all shadow-md">
                            <i class="fas fa-play sm:text-lg sm:ml-1"></i>
                            <span class="text-xs font-bold sm:hidden btn-text">Phát Âm Thanh</span>
                        </button>

                        <!-- Voice Info & Speed Controls -->
                        <div class="flex-1 w-full flex flex-col justify-center px-2 py-1">
                            <div class="relative w-full">
                                <select id="voice-select" class="zen-select w-full bg-transparent border-none outline-none text-[13px] font-bold text-zinc-800 dark:text-zinc-200 truncate cursor-pointer pr-5 mb-1.5 opacity-50 pointer-events-none">
                                    <option value="">Giọng mặc định</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-1 top-1 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                            <div class="flex items-center gap-2 w-full">
                                <i class="fas fa-walking text-[14px] text-zinc-400 w-3 text-center"></i>
                                <input type="range" id="voice-speed" min="0.5" max="2" step="0.1" value="1" class="flat-range w-full opacity-50 pointer-events-none">
                                <i class="fas fa-running text-[14px] text-zinc-400 w-3 text-center"></i>
                            </div>
                        </div>

                        <!-- Actions (Copy, Download) -->
                        <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0 pl-0 sm:pl-3">
                            <button id="btn-copy" class="btn-premium flex-1 sm:flex-none sm:w-12 h-10 sm:h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-all opacity-50 pointer-events-none" title="Sao chép">
                                <i class="far fa-copy text-[15px]"></i>
                                <span class="text-[11px] font-bold sm:hidden btn-text">Chép</span>
                            </button>
                            <button id="btn-download" class="btn-premium flex-1 sm:flex-none sm:w-12 h-10 sm:h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-all opacity-50 pointer-events-none" title="Tải MP3">
                                <i class="fas fa-download text-[14px]"></i>
                                <span class="text-[11px] font-bold sm:hidden btn-text">MP3</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    `;
}

// =====================================================================
// 3. LOGIC KHỞI TẠO ĐỒNG BỘ
// =====================================================================
export function init() {
    const inputEl = document.getElementById('num-input');
    const clearBtn = document.getElementById('num-clear');
    const resultText = document.getElementById('result-text');
    const btnPlay = document.getElementById('btn-play');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');
    const langBtns = document.querySelectorAll('.lang-btn');
    const langSelectMaster = document.getElementById('lang-select-master');
    const translatingIndicator = document.getElementById('translating-indicator');
    
    const voiceSelect = document.getElementById('voice-select');
    const voiceSpeed = document.getElementById('voice-speed');

    let currentLang = 'vi';
    let currentSpeechCode = 'vi-VN';
    let currentNumber = 0;
    let currentOutput = '';
    let availableVoices = [];

    const formatNumber = (val) => {
        let numStr = val.replace(/\D/g, ''); 
        if (!numStr) return '';
        return parseInt(numStr, 10).toLocaleString('en-US');
    };

    const populateVoices = () => {
        availableVoices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = ''; 
        
        const rootLang = currentSpeechCode.split('-')[0].toLowerCase();
        const filteredVoices = availableVoices.filter(voice => voice.lang.toLowerCase().startsWith(rootLang));
        
        if (filteredVoices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Giọng mặc định hệ thống</option>';
        } else {
            filteredVoices.forEach((voice) => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = voice.voiceURI;
                voiceSelect.appendChild(option);
            });
        }
    };

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    const setControlsActive = (isActive) => {
        const els = [btnPlay, btnCopy, btnDownload, voiceSelect, voiceSpeed];
        els.forEach(el => {
            if (isActive) el.classList.remove('opacity-50', 'pointer-events-none');
            else el.classList.add('opacity-50', 'pointer-events-none');
        });
    };

    const updateResult = async () => {
        if (currentNumber === 0 && inputEl.value === '') {
            resultText.innerHTML = '<span class="text-zinc-300 dark:text-zinc-700 font-normal italic text-[18px]">Đang đợi số liệu...</span>';
            setControlsActive(false);
            return;
        }

        setControlsActive(true);

        const nativeLangs = ['vi', 'en', 'ja', 'zh', 'ko', 'es', 'fr'];
        
        if (nativeLangs.includes(currentLang)) {
            if (currentLang === 'vi') currentOutput = readVietnamese(currentNumber);
            else if (currentLang === 'en') currentOutput = readEnglish(currentNumber) + ' dollars';
            else if (currentLang === 'es') currentOutput = readSpanish(currentNumber);
            else if (currentLang === 'fr') currentOutput = readFrench(currentNumber);
            else currentOutput = readCJK(currentNumber, currentLang);
            
            resultText.textContent = currentOutput;
        } else {
            translatingIndicator.classList.remove('hidden');
            resultText.classList.add('opacity-50');
            
            const viText = readVietnamese(currentNumber);
            currentOutput = await translateText(viText, currentLang);
            
            resultText.textContent = currentOutput;
            resultText.classList.remove('opacity-50');
            translatingIndicator.classList.add('hidden');
        }
    };

    inputEl.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const originalLength = e.target.value.length;
        
        const formatted = formatNumber(e.target.value);
        e.target.value = formatted;
        
        const newLength = e.target.value.length;
        e.target.selectionStart = e.target.selectionEnd = cursorPosition + (newLength - originalLength);

        currentNumber = formatted ? parseInt(formatted.replace(/,/g, ''), 10) : 0;
        clearBtn.style.opacity = formatted ? '1' : '0';
        updateResult();
    });

    clearBtn.addEventListener('click', () => {
        inputEl.value = ''; currentNumber = 0;
        clearBtn.style.opacity = '0';
        updateResult(); inputEl.focus();
    });

    const changeLanguage = (lang, code) => {
        currentLang = lang; currentSpeechCode = code;
        populateVoices(); updateResult();
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            langSelectMaster.value = ""; 
            langBtns.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-zinc-50', 'dark:bg-zinc-800/50', 'text-zinc-600', 'dark:text-zinc-300');
            });
            const target = e.currentTarget;
            target.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            target.classList.remove('bg-zinc-50', 'dark:bg-zinc-800/50', 'text-zinc-600', 'dark:text-zinc-300');
            changeLanguage(target.getAttribute('data-lang'), target.getAttribute('data-code'));
        });
    });

    langSelectMaster.addEventListener('change', (e) => {
        if (!e.target.value) return;
        langBtns.forEach(t => {
            t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            t.classList.add('bg-zinc-50', 'dark:bg-zinc-800/50', 'text-zinc-600', 'dark:text-zinc-300');
        });
        const selectedOption = e.target.options[e.target.selectedIndex];
        changeLanguage(e.target.value, selectedOption.getAttribute('data-code'));
    });

    // --- Action: PLAY Âm thanh ---
    btnPlay.addEventListener('click', () => {
        if (!currentOutput) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentOutput);
        
        if (voiceSelect.value) {
            const exactVoice = availableVoices.find(v => v.voiceURI === voiceSelect.value);
            if (exactVoice) utterance.voice = exactVoice;
        }
        
        utterance.lang = currentSpeechCode;
        utterance.rate = parseFloat(voiceSpeed.value); 
        
        const originalHTML = btnPlay.innerHTML;
        btnPlay.innerHTML = `<i class="fas fa-spinner fa-spin sm:text-lg sm:ml-1"></i> <span class="text-xs font-bold sm:hidden">Đang đọc...</span>`;
        
        utterance.onend = () => { btnPlay.innerHTML = originalHTML; };
        utterance.onerror = () => { btnPlay.innerHTML = originalHTML; };

        window.speechSynthesis.speak(utterance);
    });

    // --- Action: DOWNLOAD MP3 (3 Proxy Fallback) ---
    btnDownload.addEventListener('click', async () => {
        if (!currentOutput) return;
        
        const originalHTML = btnDownload.innerHTML;
        btnDownload.innerHTML = `<i class="fas fa-spinner fa-spin text-sm"></i> <span class="text-[11px] font-bold sm:hidden">Tải...</span>`;
        
        try {
            const googleTtsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${currentLang}&q=${encodeURIComponent(currentOutput)}`;
            const encodedUrl = encodeURIComponent(googleTtsUrl);
            
            const proxyServers = [
                `https://api.allorigins.win/raw?url=${encodedUrl}`,
                `https://api.codetabs.com/v1/proxy?quest=${googleTtsUrl}`,
                `https://corsproxy.io/?${encodedUrl}`
            ];
            
            let blobData = null;
            for (let i = 0; i < proxyServers.length; i++) {
                try {
                    const response = await fetch(proxyServers[i]);
                    if (!response.ok) throw new Error(`Proxy ${i + 1} fail`);
                    blobData = await response.blob();
                    break; 
                } catch (proxyError) {
                    if (i === proxyServers.length - 1) throw new Error("Máy chủ quá tải");
                }
            }
            
            if (!blobData) throw new Error("Lỗi tải âm thanh");

            const blobUrl = URL.createObjectURL(blobData);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `DocSoTien_${currentLang}_${currentNumber}.mp3`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(blobUrl); }, 100);

            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Thành công', 'Đã tải xong file MP3.', 'success');
            }
        } catch (error) {
            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Lỗi', 'Máy chủ tải xuống đang quá tải. Vui lòng thử lại sau.', 'error');
            }
        } finally {
            btnDownload.innerHTML = originalHTML;
        }
    });

    // --- Action: COPY ---
    btnCopy.addEventListener('click', async () => {
        if (!currentOutput) return;
        try {
            await navigator.clipboard.writeText(currentOutput);
            const originalHTML = btnCopy.innerHTML;
            btnCopy.innerHTML = `<i class="fas fa-check text-emerald-500 text-[15px]"></i> <span class="text-[11px] font-bold sm:hidden">Chép</span>`;
            
            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Thành công', `Đã sao chép văn bản.`, 'success');
            }
            setTimeout(() => { btnCopy.innerHTML = originalHTML; }, 1500);
        } catch (err) {
            if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
            }
        }
    });
}