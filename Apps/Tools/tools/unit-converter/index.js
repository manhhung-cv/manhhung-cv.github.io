import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .flat-btn { transition: transform 0.1s; user-select: none; }
            .flat-btn:active { transform: scale(0.95); }

            /* Tùy chỉnh Select phẳng */
            .flat-select { 
                appearance: none; -webkit-appearance: none; 
                background-image: url('data:image/svg+xml;utf8,<svg fill="%23a1a1aa" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
                background-repeat: no-repeat; background-position: right 8px center;
                padding-right: 32px !important;
            }
        </style>

        <div class="relative flex flex-col w-full max-w-[640px] mx-auto min-h-[500px]">
            
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Chuyển đổi Đơn vị</h2>
                    <p class="text-xs text-zinc-500 mt-1 font-medium">Hai chiều siêu tốc. Nhập là tính ngay.</p>
                </div>
                <button class="flat-btn h-9 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-uc-clear">
                    <i class="fas fa-trash-alt"></i> Xóa
                </button>
            </div>

            <div class="flex overflow-x-auto hide-scrollbar gap-1.5 mb-5 px-1 border-b border-zinc-200 dark:border-zinc-800 pb-3" id="uc-tabs">
                <button class="uc-cat-btn active flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="length"><i class="fas fa-ruler mr-1.5"></i>Chiều dài</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="weight"><i class="fas fa-weight-hanging mr-1.5"></i>Khối lượng</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="temperature"><i class="fas fa-thermometer-half mr-1.5"></i>Nhiệt độ</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="area"><i class="fas fa-vector-square mr-1.5"></i>Diện tích</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="volume"><i class="fas fa-tint mr-1.5"></i>Thể tích</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="data"><i class="fas fa-database mr-1.5"></i>Dữ liệu</button>
                <button class="uc-cat-btn flat-btn px-4 py-2.5 rounded-xl border border-transparent bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0" data-cat="speed"><i class="fas fa-tachometer-alt mr-1.5"></i>Tốc độ</button>
            </div>

            <div class="bg-white dark:bg-[#09090b] rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-2 sm:p-4 flex flex-col">
                
                <div class="relative flex flex-col">
                    
                    <div class="bg-zinc-50 dark:bg-[#121214] rounded-[24px] p-5 pb-8 flex flex-col focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Từ đơn vị</span>
                            <button class="flat-btn btn-copy-mini text-zinc-400 active:text-zinc-900 dark:active:text-white" data-target="uc-in-1" title="Sao chép"><i class="far fa-copy"></i></button>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input type="number" id="uc-in-1" class="flex-1 bg-transparent border-none outline-none text-[2.5rem] font-black font-mono text-zinc-900 dark:text-white p-0 w-full tracking-tighter" placeholder="0" step="any">
                            <select id="uc-sel-1" class="flat-select w-full sm:w-auto bg-zinc-200/50 dark:bg-zinc-800/50 border-none outline-none rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"></select>
                        </div>
                    </div>

                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button id="btn-uc-swap" class="flat-btn w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center border-[6px] border-white dark:border-[#09090b]">
                            <i class="fas fa-exchange-alt rotate-90 sm:rotate-0"></i>
                        </button>
                    </div>

                    <div class="bg-zinc-50 dark:bg-[#121214] rounded-[24px] p-5 pt-8 flex flex-col focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all -mt-4">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                            <input type="number" id="uc-in-2" class="flex-1 bg-transparent border-none outline-none text-[2.5rem] font-black font-mono text-zinc-900 dark:text-white p-0 w-full tracking-tighter" placeholder="0" step="any">
                            <select id="uc-sel-2" class="flat-select w-full sm:w-auto bg-zinc-200/50 dark:bg-zinc-800/50 border-none outline-none rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"></select>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Sang đơn vị</span>
                            <button class="flat-btn btn-copy-mini text-zinc-400 active:text-zinc-900 dark:active:text-white" data-target="uc-in-2" title="Sao chép"><i class="far fa-copy"></i></button>
                        </div>
                    </div>

                </div>

                <div class="mt-4 p-4 rounded-[20px] border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] text-center">
                    <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Công thức quy đổi</span>
                    <div id="uc-formula" class="text-sm font-bold text-zinc-900 dark:text-white font-mono">1 Mét = 100 Centimét</div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- TỪ ĐIỂN ĐƠN VỊ CẤP CAO ---
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
                'jin': { name: 'Cân TQ (Jin)', factor: 0.5 },    
                'liang': { name: 'Lạng TQ (Liang)', factor: 0.05 } 
            },
            default1: 'kg', default2: 'g'
        },
        temperature: {
            isSpecial: true, // Đánh dấu cần logic riêng
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

    // --- DOM ELEMENTS ---
    const catBtns = document.querySelectorAll('.uc-cat-btn');
    const in1 = document.getElementById('uc-in-1');
    const in2 = document.getElementById('uc-in-2');
    const sel1 = document.getElementById('uc-sel-1');
    const sel2 = document.getElementById('uc-sel-2');
    const btnSwap = document.getElementById('btn-uc-swap');
    const formulaText = document.getElementById('uc-formula');
    
    let currentCat = 'length';
    let lastEdited = 1; 

    // --- LOGIC NHIỆT ĐỘ ĐẶC BIỆT ---
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

    // --- TIỆN ÍCH ---
    const formatNum = (num) => {
        if (num === 0) return '0';
        if (isNaN(num) || !isFinite(num)) return '';
        
        // Tránh lỗi 0.30000000000000004 của JS
        let formatted = parseFloat(num.toPrecision(12));
        
        // Nếu số quá lớn hoặc quá nhỏ, để dạng khoa học gọn gàng
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

    // Hàm thực hiện chuyển đổi
    const doConvert = (source) => {
        const catData = UNIT_DATA[currentCat];
        const u1 = sel1.value;
        const u2 = sel2.value;

        if (source === 1) {
            const val1 = parseFloat(in1.value);
            if (isNaN(val1)) { in2.value = ''; updateFormula(); return; }
            
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
            if (isNaN(val2)) { in1.value = ''; updateFormula(); return; }
            
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
            // Đối với nhiệt độ, in ra công thức tương đối
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
        
        formulaText.innerHTML = `1 ${name1} = <span class="text-blue-500">${formatNum(res)}</span> ${name2}`;
    };

    // --- SỰ KIỆN LẮNG NGHE ---
    
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
            catBtns.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900', 'border-transparent');
                t.classList.add('bg-transparent', 'text-zinc-500');
            });
            btn.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900', 'border-transparent');
            btn.classList.remove('bg-transparent', 'text-zinc-500');
            
            currentCat = btn.dataset.cat;
            
            populateSelects();
            in1.value = '1'; 
            lastEdited = 1;
            doConvert(1);
        };
    });

    document.getElementById('btn-uc-clear').onclick = () => {
        in1.value = '';
        in2.value = '';
        updateFormula();
        in1.focus();
    };

    document.querySelectorAll('.btn-copy-mini').forEach(btn => {
        btn.onclick = async () => {
            const targetInput = document.getElementById(btn.dataset.target);
            const val = targetInput.value;
            if (!val) return UI.showAlert('Thông báo', 'Không có giá trị để chép.', 'warning');
            
            try {
                await navigator.clipboard.writeText(val);
                UI.showAlert('Đã chép', `Sao chép thành công: ${val}`, 'success', 1000);
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
            }
        };
    });

    // --- KHỞI CHẠY LẦN ĐẦU ---
    populateSelects();
    in1.value = '1';
    doConvert(1);
}