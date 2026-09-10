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
        return Boolean(isEnabled && wrapper);
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive() && typeof window.triggerIslandNotification === 'function') {
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
    <div id="uc-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #uc-root-container {
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

            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

            .uc-input-zen {
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
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Converter</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Chuyển Đổi Đơn Vị</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Quy đổi hai chiều thời gian thực với độ chính xác cao cho các hệ đo lường thông dụng.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-uc-clear" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-trash-can text-xs"></i> <span>Xóa trắng</span>
                    </button>
                </div>
            </div>

            <!-- CATEGORIES SCROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="uc-tabs">
                    <button class="uc-cat-btn active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-cat="length">
                        <i class="fas fa-ruler text-[11px]"></i> Chiều dài
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="weight">
                        <i class="fas fa-weight-hanging text-[11px]"></i> Khối lượng
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="temperature">
                        <i class="fas fa-temperature-half text-[11px]"></i> Nhiệt độ
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="area">
                        <i class="fas fa-vector-square text-[11px]"></i> Diện tích
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="volume">
                        <i class="fas fa-cube text-[11px]"></i> Thể tích
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="data">
                        <i class="fas fa-database text-[11px]"></i> Dung lượng
                    </button>
                    <button class="uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-cat="speed">
                        <i class="fas fa-gauge-high text-[11px]"></i> Tốc độ
                    </button>
                </div>
            </div>

            <!-- CONVERSION WORKSPACE CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                
                <div class="relative flex flex-col space-y-2">
                    
                    <!-- INPUT 1 -->
                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[20px] p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Từ đơn vị nguồn</span>
                            <button class="btn-copy-mini h-7 px-2 rounded-[8px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:text-accent-theme text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm" data-target="uc-in-1" title="Sao chép">
                                <i class="far fa-copy text-[11px]"></i>
                            </button>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input type="number" id="uc-in-1" class="uc-input-zen flex-1 bg-transparent border-none outline-none text-3xl sm:text-4xl font-black font-mono text-zinc-900 dark:text-white p-0 w-full tracking-tight placeholder-zinc-400" placeholder="0" step="any">
                            <div class="relative w-full sm:w-auto shrink-0">
                                <select id="uc-sel-1" class="zen-select w-full sm:w-auto min-w-[170px] h-11 bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] rounded-[14px] px-3.5 pr-8 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer shadow-sm"></select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <!-- SWAP BUTTON -->
                    <div class="flex justify-center -my-2 z-10">
                        <button id="btn-uc-swap" class="w-10 h-10 rounded-full bg-accent-theme text-white flex items-center justify-center border-4 border-white dark:border-[#161618] active:scale-90 transition-transform shadow-md" title="Đảo chiều quy đổi">
                            <i class="fas fa-arrows-up-down sm:rotate-90 text-xs"></i>
                        </button>
                    </div>

                    <!-- INPUT 2 -->
                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[20px] p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sang đơn vị đích</span>
                            <button class="btn-copy-mini h-7 px-2 rounded-[8px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:text-accent-theme text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm" data-target="uc-in-2" title="Sao chép">
                                <i class="far fa-copy text-[11px]"></i>
                            </button>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input type="number" id="uc-in-2" class="uc-input-zen flex-1 bg-transparent border-none outline-none text-3xl sm:text-4xl font-black font-mono text-accent-theme p-0 w-full tracking-tight placeholder-zinc-400" placeholder="0" step="any">
                            <div class="relative w-full sm:w-auto shrink-0">
                                <select id="uc-sel-2" class="zen-select w-full sm:w-auto min-w-[170px] h-11 bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] rounded-[14px] px-3.5 pr-8 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer shadow-sm"></select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- FORMULA FOOTER -->
                <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3.5 text-center">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tỷ lệ quy đổi tham chiếu</span>
                    <div id="uc-formula" class="text-xs sm:text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">1 Mét = 100 Centimét</div>
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
    const rootContainer = hostElement.querySelector('#uc-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Dữ liệu đơn vị đo lường
    const UNIT_DATA = {
        length: {
            units: {
                'm': { name: 'Mét (m)', factor: 1 },
                'km': { name: 'Kilômét (km)', factor: 1000 },
                'cm': { name: 'Centimét (cm)', factor: 0.01 },
                'mm': { name: 'Milimét (mm)', factor: 0.001 },
                'mi': { name: 'Dặm (mi)', factor: 1609.344 },
                'yd': { name: 'Yard (yd)', factor: 0.9144 },
                'ft': { name: 'Feet (ft)', factor: 0.3048 },
                'in': { name: 'Inch (in)', factor: 0.0254 },
                'nmi': { name: 'Hải lý (nmi)', factor: 1852 }
            },
            default1: 'm', default2: 'cm'
        },
        weight: {
            units: {
                'kg': { name: 'Kilôgam (kg)', factor: 1 },
                'g': { name: 'Gram (g)', factor: 0.001 },
                'mg': { name: 'Miligram (mg)', factor: 0.000001 },
                't': { name: 'Tấn (t)', factor: 1000 },
                'lb': { name: 'Pound (lb)', factor: 0.45359237 },
                'oz': { name: 'Ounce (oz)', factor: 0.02834952 },
                'jin': { name: 'Cân Trung Quốc (Jin)', factor: 0.5 },    
                'liang': { name: 'Lạng Trung Quốc (Liang)', factor: 0.05 } 
            },
            default1: 'kg', default2: 'g'
        },
        temperature: {
            isSpecial: true,
            units: {
                'c': { name: 'Độ C (°C)' },
                'f': { name: 'Độ F (°F)' },
                'k': { name: 'Kelvin (K)' }
            },
            default1: 'c', default2: 'f'
        },
        area: {
            units: {
                'm2': { name: 'Mét vuông (m²)', factor: 1 },
                'km2': { name: 'Kilômét vuông (km²)', factor: 1000000 },
                'cm2': { name: 'Centimét vuông (cm²)', factor: 0.0001 },
                'ha': { name: 'Hecta (ha)', factor: 10000 },
                'acre': { name: 'Mẫu Anh (acre)', factor: 4046.85642 },
                'sqft': { name: 'Feet vuông (sq ft)', factor: 0.09290304 },
                'sqin': { name: 'Inch vuông (sq in)', factor: 0.00064516 }
            },
            default1: 'm2', default2: 'ha'
        },
        volume: {
            units: {
                'l': { name: 'Lít (L)', factor: 1 },
                'ml': { name: 'Mililít (mL)', factor: 0.001 },
                'm3': { name: 'Mét khối (m³)', factor: 1000 },
                'cm3': { name: 'Centimét khối (cm³)', factor: 0.001 },
                'gal': { name: 'Gallon Mỹ (gal)', factor: 3.78541178 },
                'qt': { name: 'Quart Mỹ (qt)', factor: 0.946352946 },
                'pt': { name: 'Pint Mỹ (pt)', factor: 0.473176473 },
                'fl_oz': { name: 'Ounce lỏng Mỹ (fl oz)', factor: 0.02957353 }
            },
            default1: 'l', default2: 'ml'
        },
        data: {
            units: {
                'b': { name: 'Byte (B)', factor: 1 },
                'kb': { name: 'Kilobyte (KB)', factor: 1024 },
                'mb': { name: 'Megabyte (MB)', factor: 1048576 },
                'gb': { name: 'Gigabyte (GB)', factor: 1073741824 },
                'tb': { name: 'Terabyte (TB)', factor: 1099511627776 },
                'pb': { name: 'Petabyte (PB)', factor: 1125899906842624 }
            },
            default1: 'gb', default2: 'mb'
        },
        speed: {
            units: {
                'm/s': { name: 'Mét / giây (m/s)', factor: 1 },
                'km/h': { name: 'Kilômét / giờ (km/h)', factor: 0.2777777778 },
                'mph': { name: 'Dặm / giờ (mph)', factor: 0.44704 },
                'ft/s': { name: 'Feet / giây (ft/s)', factor: 0.3048 },
                'knot': { name: 'Hải lý / giờ (knot)', factor: 0.514444444 }
            },
            default1: 'km/h', default2: 'm/s'
        }
    };

    // Query Elements
    const catBtns = hostElement.querySelectorAll('.uc-cat-btn');
    const in1 = hostElement.querySelector('#uc-in-1');
    const in2 = hostElement.querySelector('#uc-in-2');
    const sel1 = hostElement.querySelector('#uc-sel-1');
    const sel2 = hostElement.querySelector('#uc-sel-2');
    const btnSwap = hostElement.querySelector('#btn-uc-swap');
    const formulaText = hostElement.querySelector('#uc-formula');
    const btnClear = hostElement.querySelector('#btn-uc-clear');
    
    let currentCat = 'length';
    let lastEdited = 1; 

    // Logic Nhiệt độ
    const tempToC = (val, unit) => {
        if (unit === 'c') return val;
        if (unit === 'f') return (val - 32) * 5 / 9;
        if (unit === 'k') return val - 273.15;
        return val;
    };
    
    const tempFromC = (val, unit) => {
        if (unit === 'c') return val;
        if (unit === 'f') return (val * 9 / 5) + 32;
        if (unit === 'k') return val + 273.15;
        return val;
    };

    // Format số chính xác
    const formatNum = (num) => {
        if (num === 0) return '0';
        if (isNaN(num) || !isFinite(num)) return '';
        
        let formatted = parseFloat(num.toPrecision(10));
        if (Math.abs(formatted) > 1e10 || (Math.abs(formatted) < 1e-6 && formatted !== 0)) {
            return formatted.toExponential(4).replace('e+', 'e');
        }
        return formatted.toString();
    };

    const populateSelects = () => {
        const catData = UNIT_DATA[currentCat];
        sel1.innerHTML = '';
        sel2.innerHTML = '';
        
        Object.entries(catData.units).forEach(([key, val]) => {
            sel1.add(new Option(val.name, key));
            sel2.add(new Option(val.name, key));
        });

        sel1.value = catData.default1;
        sel2.value = catData.default2;
    };

    const doConvert = (source) => {
        const catData = UNIT_DATA[currentCat];
        const u1 = sel1.value;
        const u2 = sel2.value;

        if (source === 1) {
            const val1 = parseFloat(in1.value);
            if (isNaN(val1)) { 
                in2.value = ''; 
                updateFormula(); 
                return; 
            }
            
            let res;
            if (catData.isSpecial) {
                const inC = tempToC(val1, u1);
                res = tempFromC(inC, u2);
            } else {
                const inBase = val1 * catData.units[u1].factor;
                res = inBase / catData.units[u2].factor;
            }
            in2.value = formatNum(res);

        } else {
            const val2 = parseFloat(in2.value);
            if (isNaN(val2)) { 
                in1.value = ''; 
                updateFormula(); 
                return; 
            }
            
            let res;
            if (catData.isSpecial) {
                const inC = tempToC(val2, u2);
                res = tempFromC(inC, u1);
            } else {
                const inBase = val2 * catData.units[u2].factor;
                res = inBase / catData.units[u1].factor;
            }
            in1.value = formatNum(res);
        }
        updateFormula();
    };

    const updateFormula = () => {
        const catData = UNIT_DATA[currentCat];
        const u1 = sel1.value;
        const u2 = sel2.value;
        
        let res;
        if (catData.isSpecial) {
            if (u1 === u2) res = 1;
            else {
                const inC = tempToC(1, u1);
                res = tempFromC(inC, u2);
            }
        } else {
            const inBase = 1 * catData.units[u1].factor;
            res = inBase / catData.units[u2].factor;
        }
        
        const name1 = catData.units[u1].name.split(' (')[0];
        const name2 = catData.units[u2].name.split(' (')[0];
        
        formulaText.innerHTML = `1 ${name1} = <span class="text-accent-theme">${formatNum(res)}</span> ${name2}`;
    };

    // Tab Classes
    const activeClass = 'uc-cat-btn active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveClass = 'uc-cat-btn h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    // Event Handlers
    in1.addEventListener('input', () => { lastEdited = 1; doConvert(1); });
    in2.addEventListener('input', () => { lastEdited = 2; doConvert(2); });

    sel1.addEventListener('change', () => { doConvert(lastEdited); });
    sel2.addEventListener('change', () => { doConvert(lastEdited); });

    btnSwap.addEventListener('click', () => {
        const tempSel = sel1.value;
        sel1.value = sel2.value;
        sel2.value = tempSel;

        lastEdited = 1; 
        doConvert(1);
    });

    catBtns.forEach(btn => {
        btn.onclick = () => {
            catBtns.forEach(t => { t.className = inactiveClass; });
            btn.className = activeClass;
            
            currentCat = btn.dataset.cat;
            populateSelects();
            in1.value = '1'; 
            lastEdited = 1;
            doConvert(1);
        };
    });

    btnClear.onclick = () => {
        in1.value = '';
        in2.value = '';
        updateFormula();
        in1.focus();
    };

    hostElement.querySelectorAll('.btn-copy-mini').forEach(btn => {
        btn.onclick = async () => {
            const targetInput = hostElement.querySelector(`#${btn.dataset.target}`);
            const val = targetInput?.value;
            if (!val) return;
            
            try {
                await navigator.clipboard.writeText(val);
                IslandKit.notify('Đã sao chép', `Giá trị: ${val}`, 'success', 1000);
            } catch (err) {
                IslandKit.notify('Lỗi', 'Không thể sao chép giá trị.', 'error');
            }
        };
    });

    // Khởi chạy
    populateSelects();
    in1.value = '1';
    doConvert(1);
}