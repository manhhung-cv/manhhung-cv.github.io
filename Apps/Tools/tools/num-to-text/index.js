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
// 2. EDGE TTS SERVICE CLIENT
// =============================================================================
const EdgeTTS = {
    BASE_URL: 'https://hunq-tts.vercel.app/api',
    APP_KEY: 'TTS-Hunq',

    async fetchVoices() {
        const res = await fetch(`${this.BASE_URL}/voices`, {
            headers: { 'X-App-Key': this.APP_KEY }
        });
        if (!res.ok) throw new Error('Không thể nạp danh sách giọng đọc Edge TTS');
        return await res.json();
    },

    async synthesize(text, voice, rate = '0%') {
        const res = await fetch(`${this.BASE_URL}/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.APP_KEY
            },
            body: JSON.stringify({ text, voice, rate })
        });
        if (!res.ok) throw new Error('Yêu cầu tổng hợp giọng nói Edge TTS thất bại');
        return await res.blob();
    },

    convertSpeedToRate(speedVal) {
        const num = parseFloat(speedVal);
        if (num <= 0.6) return '-40%';
        if (num <= 0.8) return '-20%';
        if (num <= 1.1) return '0%';
        if (num <= 1.3) return '+20%';
        return '+40%';
    }
};

// =============================================================================
// 3. CORE LOGIC: THUẬT TOÁN ĐỌC SỐ
// =============================================================================
const VI_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function readVietnamese(number) {
    if (number === 0) return 'không đồng';
    let str = number.toString();
    let result = '';
    const readGroup = (n, full) => {
        let res = '';
        let tram = Math.floor(n / 100);
        let chuc = Math.floor((n % 100) / 10);
        let donvi = n % 10;
        if (full || tram > 0) res += VI_WORDS[tram] + ' trăm ';
        if (chuc === 0 && donvi > 0 && (full || tram > 0)) res += 'lẻ ';
        if (chuc === 1) res += 'mười ';
        if (chuc > 1) res += VI_WORDS[chuc] + ' mươi ';
        if (donvi === 1 && chuc > 1) res += 'mốt ';
        else if (donvi === 5 && chuc > 0) res += 'lăm ';
        else if (donvi > 0 && !(chuc === 1 && donvi === 1)) res += VI_WORDS[donvi] + ' ';
        return res.trim();
    };
    const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    const groups = [];
    while (str.length > 0) {
        groups.push(str.slice(-3));
        str = str.slice(0, -3);
    }
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = parseInt(groups[i], 10);
        if (g > 0) {
            let full = (i < groups.length - 1);
            result += readGroup(g, full) + ' ' + scales[i] + ' ';
        }
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
    let str = num.toString();
    const groups = [];
    while (str.length > 0) {
        groups.push(str.slice(-3));
        str = str.slice(0, -3);
    }
    let res = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = parseInt(groups[i], 10);
        if (g > 0) res += readEnglish(g) + ' ' + scales[i] + ' ';
    }
    return res.trim();
}

function readCJK(num, lang) {
    if (num === 0) return lang === 'ja' ? 'ゼロ' : (lang === 'zh' ? '零' : '영');
    const numMap = { 
        'ja': ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'], 
        'zh': ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'], 
        'ko': ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'] 
    };
    const unitMap = { 
        'ja': ['', '十', '百', '千'], 
        'zh': ['', '十', '百', '千'], 
        'ko': ['', '십', '백', '천'] 
    };
    const scaleMap = { 
        'ja': ['', '万', '億', '兆'], 
        'zh': ['', '万', '亿', '兆'], 
        'ko': ['', '만', '억', '조'] 
    };
    let str = num.toString();
    const groups = [];
    while (str.length > 0) {
        groups.push(str.slice(-4));
        str = str.slice(0, -4);
    }
    let result = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = groups[i];
        let gNum = parseInt(g, 10);
        if (gNum === 0) continue;
        let gStr = '';
        for (let j = 0; j < g.length; j++) {
            let digit = parseInt(g[j], 10);
            let pos = g.length - 1 - j;
            if (digit > 0) {
                if (digit === 1 && pos > 0 && (lang === 'ja' || lang === 'ko')) gStr += unitMap[lang][pos];
                else gStr += numMap[lang][digit] + unitMap[lang][pos];
            } else if (lang === 'zh' && j < g.length - 1 && parseInt(g[j + 1], 10) > 0) gStr += '零';
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
    const ones = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    if (num < 20) return ones[num];
    if (num < 30) return num === 20 ? 'veinte' : 'veinti' + ones[num - 20];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' y ' + ones[num % 10] : '');
    if (num < 1000) return num === 100 ? 'cien' : hundreds[Math.floor(num / 100)] + (num % 100 !== 0 ? ' ' + readSpanish(num % 100) : '');
    if (num < 1000000) {
        let m = Math.floor(num / 1000);
        let rem = num % 1000;
        let mStr = m === 1 ? 'mil' : readSpanish(m) + ' mil';
        return mStr + (rem !== 0 ? ' ' + readSpanish(rem) : '');
    }
    let m = Math.floor(num / 1000000);
    let rem = num % 1000000;
    let mStr = m === 1 ? 'un millón' : readSpanish(m) + ' millones';
    return mStr + (rem !== 0 ? ' ' + readSpanish(rem) : '');
}

function readFrench(num) {
    if (num === 0) return 'zéro';
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
    if (num < 20) return ones[num];
    if (num < 70) {
        let t = Math.floor(num / 10);
        let r = num % 10;
        if (r === 0) return tens[t];
        if (r === 1) return tens[t] + ' et un';
        return tens[t] + '-' + ones[r];
    }
    if (num < 80) {
        let r = num - 60;
        return r === 11 ? 'soixante et onze' : 'soixante-' + ones[r];
    }
    if (num < 100) {
        let r = num - 80;
        return r === 0 ? 'quatre-vingts' : 'quatre-vingt-' + ones[r];
    }
    if (num < 1000) {
        let h = Math.floor(num / 100);
        let r = num % 100;
        let hStr = h === 1 ? 'cent' : ones[h] + (r === 0 ? ' cents' : ' cent');
        return hStr + (r !== 0 ? ' ' + readFrench(r) : '');
    }
    if (num < 1000000) {
        let m = Math.floor(num / 1000);
        let r = num % 1000;
        let mStr = m === 1 ? 'mille' : readFrench(m) + ' mille';
        return mStr + (r !== 0 ? ' ' + readFrench(r) : '');
    }
    let m = Math.floor(num / 1000000);
    let r = num % 1000000;
    let mStr = m === 1 ? 'un million' : readFrench(m) + ' millions';
    return mStr + (r !== 0 ? ' ' + readFrench(r) : '');
}

async function translateText(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0];
    } catch (error) {
        return "Lỗi kết nối API dịch thuật.";
    }
}

// =============================================================================
// 4. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & BASE64 TOOL STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="numreader-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #numreader-root-container {
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

            .num-input-zen { font-variant-numeric: tabular-nums; -webkit-user-select: text !important; user-select: text !important; }
            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Utility</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Đọc Số Tiền</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Chuyển đổi số thành chữ đa ngôn ngữ chuẩn tài chính, phát âm Edge Neural cao cấp và xuất MP3.</p>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- SEGMENTED QUICK TABS -->
                    <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-80" id="lang-quick-chips">
                        <button class="tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5" data-lang="vi" data-code="vi-VN">
                            <span>🇻🇳</span> Việt
                        </button>
                        <button class="tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-lang="en" data-code="en-US">
                            <span>🇺🇸</span> Anh
                        </button>
                        <button class="tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5" data-lang="ja" data-code="ja-JP">
                            <span>🇯🇵</span> Nhật
                        </button>
                    </div>

                    <!-- SELECT DROPDOWN (ALL LANGUAGES) -->
                    <div class="relative flex-1 sm:max-w-xs">
                        <select id="lang-select-master" class="zen-select w-full h-11 px-3.5 pr-8 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer focus:border-accent-theme transition-all">
                            <option value="">Tất cả ngôn ngữ khác...</option>
                            <optgroup label="Tích hợp bản địa (E2E)">
                                <option value="zh" data-code="zh-CN">🇨🇳 Trung Quốc (中文)</option>
                                <option value="ko" data-code="ko-KR">🇰🇷 Hàn Quốc (한국어)</option>
                                <option value="es" data-code="es-ES">🇪🇸 Tây Ban Nha (Español)</option>
                                <option value="fr" data-code="fr-FR">🇫🇷 Pháp (Français)</option>
                            </optgroup>
                            <optgroup label="Dịch thuật Google Engine">
                                <option value="de" data-code="de-DE">🇩🇪 Đức (Deutsch)</option>
                                <option value="ru" data-code="ru-RU">🇷🇺 Nga (Русский)</option>
                                <option value="th" data-code="th-TH">🇹🇭 Thái Lan (ไทย)</option>
                                <option value="id" data-code="id-ID">🇮🇩 Indonesia</option>
                                <option value="hi" data-code="hi-IN">🇮🇳 Ấn Độ (हिन्दी)</option>
                                <option value="ar" data-code="ar-SA">🇸🇦 Ả Rập (العربية)</option>
                            </optgroup>
                        </select>
                        <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                    </div>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- INPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Đầu vào số tiền</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Format: 1,000s</span>
                        </div>

                        <!-- Numeric Input Wrapper -->
                        <div class="flex-1 flex flex-col min-h-[220px] justify-center">
                            <div class="relative flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-2 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                <div class="w-11 h-11 rounded-[14px] bg-white dark:bg-[#27272a] flex items-center justify-center text-accent-theme shadow-sm shrink-0 border border-black/[0.04] dark:border-white/[0.06]">
                                    <i class="fas fa-wallet text-sm"></i>
                                </div>
                                <input type="text" id="num-input" inputmode="numeric" 
                                    class="num-input-zen w-full bg-transparent border-none outline-none px-3.5 py-3 text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700" 
                                    placeholder="0">
                                <button id="num-clear" class="w-9 h-9 rounded-[12px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center opacity-0 transition-opacity active:scale-90 shrink-0">
                                    <i class="fas fa-times-circle text-base"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Voice Synthesis Toolbar -->
                    <div class="space-y-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <div class="flex items-center gap-2">
                            <div class="relative flex-1">
                                <select id="voice-select" class="zen-select w-full h-10 px-3 pr-7 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none truncate cursor-pointer transition-all">
                                    <option value="vi-VN-HoaiMyNeural">Hoài My (Nữ - Edge Neural)</option>
                                    <option value="vi-VN-NamMinhNeural">Nam Minh (Nam - Edge Neural)</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 pointer-events-none"></i>
                            </div>

                            <div class="flex items-center gap-2 bg-[#f2f2f7] dark:bg-black/40 px-3 h-10 rounded-[12px] border border-black/[0.04] dark:border-white/[0.06] shrink-0 w-36">
                                <i class="fas fa-gauge-simple-high text-zinc-400 text-[11px]"></i>
                                <input type="range" id="voice-speed" min="0.5" max="2" step="0.1" value="1" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer">
                                <span id="speed-display" class="text-[10px] font-mono font-bold text-zinc-500 w-6 text-right">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- OUTPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Văn bản đọc số</h3>
                                <span id="translating-indicator" class="hidden text-[9px] font-bold text-accent-theme uppercase tracking-wider animate-pulse">
                                    <i class="fas fa-circle-notch fa-spin mr-1"></i> API...
                                </span>
                            </div>

                            <div class="flex items-center gap-1">
                                <button id="btn-copy" class="px-2.5 py-1 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1">
                                    <i class="far fa-copy"></i> Chép
                                </button>
                                <button id="btn-download" class="px-2.5 py-1 rounded-[8px] bg-accent-theme-alpha hover-bg-accent-theme-alpha text-accent-theme text-[11px] font-semibold transition-colors flex items-center gap-1">
                                    <i class="fas fa-download"></i> Tải MP3
                                </button>
                            </div>
                        </div>

                        <!-- Result Display Box -->
                        <div class="relative flex-1 flex flex-col min-h-[220px]">
                            <div class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-4 flex items-center justify-center">
                                <p id="result-text" class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white capitalize leading-snug tracking-tight text-center transition-opacity duration-200">
                                    <span class="text-zinc-400 dark:text-zinc-600 font-medium italic text-sm">Đang đợi số liệu...</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Play Trigger Action -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex gap-2">
                        <button id="btn-play" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none">
                            <i class="fas fa-play text-xs"></i> <span>Phát âm thanh</span>
                        </button>
                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 5. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#numreader-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    const storageHandler = (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    };
    window.addEventListener('storage', storageHandler);

    // Query Elements
    const inputEl = hostElement.querySelector('#num-input');
    const clearBtn = hostElement.querySelector('#num-clear');
    const resultText = hostElement.querySelector('#result-text');
    const btnPlay = hostElement.querySelector('#btn-play');
    const btnCopy = hostElement.querySelector('#btn-copy');
    const btnDownload = hostElement.querySelector('#btn-download');
    const langSelectMaster = hostElement.querySelector('#lang-select-master');
    const translatingIndicator = hostElement.querySelector('#translating-indicator');
    
    const voiceSelect = hostElement.querySelector('#voice-select');
    const voiceSpeed = hostElement.querySelector('#voice-speed');
    const speedDisplay = hostElement.querySelector('#speed-display');
    const tabContainer = hostElement.querySelector('#lang-quick-chips');

    let currentLang = 'vi';
    let currentSpeechCode = 'vi-VN';
    let currentNumber = 0;
    let currentOutput = '';
    
    // Audio engine management
    let currentAudio = null;
    let currentAudioUrl = null;
    let edgeVoices = [];

    const clearActiveAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }
    };

    // Tab Classes
    const activeClass = 'tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveClass = 'tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    const formatNumber = (val) => {
        let numStr = val.replace(/\D/g, ''); 
        if (!numStr) return '';
        return parseInt(numStr, 10).toLocaleString('en-US');
    };

    const updateVoiceOptions = () => {
        if (!voiceSelect) return;
        voiceSelect.innerHTML = '';

        const currentLocalePrefix = currentSpeechCode.split('-')[0].toLowerCase();
        const matchedEdgeVoices = edgeVoices.filter(v => {
            const loc = (v.locale || '').toLowerCase();
            return loc.startsWith(currentLocalePrefix);
        });

        if (matchedEdgeVoices.length > 0) {
            matchedEdgeVoices.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.name;
                opt.dataset.type = 'edge';
                opt.textContent = `${v.friendlyName || v.name} (${v.gender || 'Neural'})`;
                voiceSelect.appendChild(opt);
            });
        } else if (currentLang === 'vi') {
            const fallbackEdge = [
                { name: 'vi-VN-HoaiMyNeural', label: 'Hoài My (Nữ - Edge Neural)' },
                { name: 'vi-VN-NamMinhNeural', label: 'Nam Minh (Nam - Edge Neural)' }
            ];
            fallbackEdge.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.name;
                opt.dataset.type = 'edge';
                opt.textContent = v.label;
                voiceSelect.appendChild(opt);
            });
        }

        // Web Speech API fallback options
        if ('speechSynthesis' in window) {
            const systemVoices = window.speechSynthesis.getVoices().filter(v => 
                v.lang.toLowerCase().startsWith(currentLocalePrefix)
            );
            if (systemVoices.length > 0) {
                const group = document.createElement('optgroup');
                group.label = 'Giọng trình duyệt (Offline)';
                systemVoices.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.voiceURI;
                    opt.dataset.type = 'native';
                    opt.textContent = `${v.name} (${v.lang})`;
                    group.appendChild(opt);
                });
                voiceSelect.appendChild(group);
            }
        }

        if (voiceSelect.children.length === 0) {
            voiceSelect.innerHTML = '<option value="default" data-type="native">Giọng mặc định hệ thống</option>';
        }
    };

    const initVoices = async () => {
        try {
            edgeVoices = await EdgeTTS.fetchVoices();
        } catch (e) {
            edgeVoices = [];
        }
        updateVoiceOptions();
    };

    initVoices();
    if ('speechSynthesis' in window && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoiceOptions;
    }

    const setControlsActive = (isActive) => {
        if (isActive) {
            btnPlay.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            btnPlay.classList.add('opacity-50', 'pointer-events-none');
        }
    };

    const updateResult = async () => {
        clearActiveAudio();

        if (currentNumber === 0 && inputEl.value === '') {
            resultText.innerHTML = '<span class="text-zinc-400 dark:text-zinc-600 font-medium italic text-sm">Đang đợi số liệu...</span>';
            setControlsActive(false);
            currentOutput = '';
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

    inputEl?.addEventListener('input', (e) => {
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

    clearBtn?.addEventListener('click', () => {
        inputEl.value = ''; 
        currentNumber = 0;
        clearBtn.style.opacity = '0';
        updateResult(); 
        inputEl.focus();
    });

    const changeLanguage = (lang, code) => {
        currentLang = lang; 
        currentSpeechCode = code;
        updateVoiceOptions();
        updateResult();
    };

    tabContainer?.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            langSelectMaster.value = '';
            tabContainer.querySelectorAll('.tab-btn').forEach(t => { t.className = inactiveClass; });
            btn.className = activeClass;
            changeLanguage(btn.getAttribute('data-lang'), btn.getAttribute('data-code'));
        });
    });

    langSelectMaster?.addEventListener('change', (e) => {
        if (!e.target.value) return;
        tabContainer?.querySelectorAll('.tab-btn').forEach(t => { t.className = inactiveClass; });
        const selectedOption = e.target.options[e.target.selectedIndex];
        changeLanguage(e.target.value, selectedOption.getAttribute('data-code'));
    });

    voiceSpeed?.addEventListener('input', (e) => {
        const rateLabel = EdgeTTS.convertSpeedToRate(e.target.value);
        speedDisplay.textContent = rateLabel;
    });

    // PLAY ACTION
    btnPlay?.addEventListener('click', async () => {
        if (!currentOutput) return;

        const originalHTML = btnPlay.innerHTML;
        btnPlay.innerHTML = `<i class="fas fa-circle-notch fa-spin text-xs"></i> <span>Đang kết nối âm thanh...</span>`;
        btnPlay.classList.add('pointer-events-none');

        const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
        const isEdge = selectedOption ? (selectedOption.dataset.type === 'edge') : true;
        const rateParam = EdgeTTS.convertSpeedToRate(voiceSpeed.value);

        if (isEdge && selectedOption?.value) {
            try {
                clearActiveAudio();
                const blob = await EdgeTTS.synthesize(currentOutput, selectedOption.value, rateParam);
                currentAudioUrl = URL.createObjectURL(blob);
                currentAudio = new Audio(currentAudioUrl);

                btnPlay.innerHTML = `<i class="fas fa-volume-high text-xs animate-pulse"></i> <span>Đang phát Edge TTS...</span>`;
                
                currentAudio.onended = () => {
                    btnPlay.innerHTML = originalHTML;
                    btnPlay.classList.remove('pointer-events-none');
                    clearActiveAudio();
                };
                currentAudio.onerror = () => {
                    throw new Error('Lỗi giải mã luồng audio');
                };

                await currentAudio.play();
                return;
            } catch (err) {
                clearActiveAudio();
                IslandKit.notify('Edge TTS lỗi', 'Tự động chuyển về bộ đọc trình duyệt.', 'warning');
            }
        }

        // Native SpeechSynthesis fallback
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentOutput);
            
            if (selectedOption?.dataset.type === 'native') {
                const systemVoices = window.speechSynthesis.getVoices();
                const exactVoice = systemVoices.find(v => v.voiceURI === selectedOption.value);
                if (exactVoice) utterance.voice = exactVoice;
            }
            
            utterance.lang = currentSpeechCode;
            utterance.rate = parseFloat(voiceSpeed.value);

            btnPlay.innerHTML = `<i class="fas fa-volume-high text-xs"></i> <span>Đang đọc...</span>`;

            utterance.onend = () => { 
                btnPlay.innerHTML = originalHTML; 
                btnPlay.classList.remove('pointer-events-none');
            };
            utterance.onerror = () => { 
                btnPlay.innerHTML = originalHTML; 
                btnPlay.classList.remove('pointer-events-none');
            };

            window.speechSynthesis.speak(utterance);
        } else {
            btnPlay.innerHTML = originalHTML;
            btnPlay.classList.remove('pointer-events-none');
            IslandKit.notify('Lỗi phát âm', 'Không tìm thấy bộ tổng hợp âm thanh khả dụng.', 'error');
        }
    });

    // DOWNLOAD MP3 ACTION
    btnDownload?.addEventListener('click', async () => {
        if (!currentOutput) {
            return IslandKit.notify('Thiếu dữ liệu', 'Vui lòng nhập số tiền để tải file phát âm.', 'warning');
        }
        
        const originalHTML = btnDownload.innerHTML;
        btnDownload.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Chờ...`;
        btnDownload.classList.add('pointer-events-none');

        const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
        const voiceName = selectedOption?.dataset.type === 'edge' ? selectedOption.value : (currentLang === 'vi' ? 'vi-VN-HoaiMyNeural' : null);
        const rateParam = EdgeTTS.convertSpeedToRate(voiceSpeed.value);

        let downloaded = false;

        // Ưu tiên tải audio Edge TTS từ backend
        if (voiceName) {
            try {
                const blobData = await EdgeTTS.synthesize(currentOutput, voiceName, rateParam);
                const blobUrl = URL.createObjectURL(blobData);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `DocSoTien_Edge_${currentLang}_${currentNumber}.mp3`;
                document.body.appendChild(a);
                a.click();
                
                setTimeout(() => { 
                    document.body.removeChild(a); 
                    URL.revokeObjectURL(blobUrl); 
                }, 100);

                IslandKit.notify('Hoàn tất', 'Đã tải MP3 chất lượng cao qua Edge TTS.', 'success');
                downloaded = true;
            } catch (e) {
                downloaded = false;
            }
        }

        // Fallback về proxy Google TTS nếu Edge TTS không khả dụng
        if (!downloaded) {
            try {
                const googleTtsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${currentLang}&q=${encodeURIComponent(currentOutput)}`;
                const encodedUrl = encodeURIComponent(googleTtsUrl);
                
                const proxyServers = [
                    `https://api.allorigins.win/raw?url=${encodedUrl}`,
                    `https://api.codetabs.com/v1/proxy?quest=${googleTtsUrl}`,
                    `https://corsproxy.io/?${encodedUrl}`
                ];
                
                let fallbackBlob = null;
                for (let i = 0; i < proxyServers.length; i++) {
                    try {
                        const response = await fetch(proxyServers[i]);
                        if (!response.ok) throw new Error();
                        fallbackBlob = await response.blob();
                        break; 
                    } catch (proxyErr) {
                        if (i === proxyServers.length - 1) throw new Error("Máy chủ dự phòng quá tải");
                    }
                }
                
                if (!fallbackBlob) throw new Error("Không thể tải file âm thanh");

                const blobUrl = URL.createObjectURL(fallbackBlob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `DocSoTien_${currentLang}_${currentNumber}.mp3`;
                document.body.appendChild(a);
                a.click();
                
                setTimeout(() => { 
                    document.body.removeChild(a); 
                    URL.revokeObjectURL(blobUrl); 
                }, 100);

                IslandKit.notify('Thành công', 'Đã tải xuống file âm thanh qua đường truyền dự phòng.', 'success');
            } catch (error) {
                IslandKit.notify('Lỗi tải tệp', 'Máy chủ âm thanh đang bận. Hãy thử lại sau.', 'error');
            }
        }

        btnDownload.innerHTML = originalHTML;
        btnDownload.classList.remove('pointer-events-none');
    });

    // COPY ACTION
    btnCopy?.addEventListener('click', async () => {
        if (!currentOutput) return;
        try {
            await navigator.clipboard.writeText(currentOutput);
            IslandKit.notify('Đã sao chép', 'Văn bản đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    });

    // Cleanup khi module unmount
    return () => {
        clearActiveAudio();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        window.removeEventListener('storage', storageHandler);
    };
}