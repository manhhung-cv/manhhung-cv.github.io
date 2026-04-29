import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .uc-widget { max-width: 480px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Thanh gạt chọn Danh mục (Segmented Control) */
            .uc-category-toggle { 
                display: flex; background: var(--bg-sec); border-radius: 30px; 
                padding: 4px; margin-bottom: 24px; border: 1px solid var(--border); 
                overflow-x: auto; scrollbar-width: none;
            }
            .uc-category-toggle::-webkit-scrollbar { display: none; }
            
            .uc-cat-btn { 
                flex: 1; text-align: center; padding: 10px 12px; border-radius: 26px; 
                border: none; background: transparent; color: var(--text-mut); 
                font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                font-size: 0.9rem; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 6px;
                white-space: nowrap; min-width: max-content;
            }
            .uc-cat-btn:hover { color: var(--text-main); }
            .uc-cat-btn.active { 
                background: var(--bg-main); color: #3b82f6; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
            }

            /* Khu vực nhập liệu chính */
            .uc-convert-area { position: relative; display: flex; flex-direction: column; gap: 4px; }
            
            .uc-input-group { 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: 16px; padding: 16px 20px; transition: all 0.2s; 
                display: flex; flex-direction: column; gap: 8px; z-index: 1;
            }
            .uc-input-group:focus-within { 
                border-color: #3b82f6; 
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
                z-index: 3; /* Nổi lên trên nút swap */
            }
            
            .uc-label { font-size: 0.85rem; color: var(--text-mut); font-weight: 500; }
            
            .uc-input-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
            
            .uc-input { 
                border: none; background: transparent; font-size: 2.2rem; 
                font-weight: 700; color: var(--text-main); width: 100%; 
                outline: none; padding: 0; font-family: var(--font);
            }
            .uc-input::placeholder { color: var(--text-mut); opacity: 0.3; }
            
            .uc-select { 
                border: none; background: var(--bg-sec); padding: 8px 12px 8px 16px; 
                border-radius: 20px; font-weight: 600; color: var(--text-main); 
                font-size: 1.05rem; cursor: pointer; outline: none; transition: background 0.2s; 
                appearance: none; -webkit-appearance: none; padding-right: 36px; 
                background-image: url('data:image/svg+xml;utf8,<svg fill="%23888" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); 
                background-repeat: no-repeat; background-position-x: calc(100% - 4px); background-position-y: center; 
            }
            .uc-select:hover { background-color: var(--border); }

            /* Nút Đảo Ngược (Swap) Floating */
            .uc-swap-btn { 
                position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); 
                width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; 
                color: white; border: 4px solid var(--bg-sec); display: flex; 
                align-items: center; justify-content: center; cursor: pointer; 
                transition: all 0.3s ease; z-index: 2; font-size: 1.1rem;
            }
            .uc-swap-btn:hover { 
                transform: translate(-50%, -50%) rotate(180deg); 
                background: #2563eb; 
            }

            /* Bảng thông tin công thức */
            .uc-formula-box { 
                margin-top: 16px; padding: 16px 20px; border-radius: 16px; 
                background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); 
                text-align: center; color: var(--text-main); font-size: 0.95rem;
            }
            
            /* Nút Copy mini */
            .btn-copy-mini { background: transparent; border: none; color: var(--text-mut); cursor: pointer; padding: 4px; transition: color 0.2s; }
            .btn-copy-mini:hover { color: #3b82f6; }
        </style>

        <div class="uc-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Chuyển đổi Đơn vị</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Hai chiều siêu tốc. Nhập là tính ngay.</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-uc-clear" title="Xóa trắng" style="padding: 8px; border-radius: 50%; height: 36px; width: 36px; display: flex; justify-content: center; align-items: center; color: #ef4444;">
                    <i class="fas fa-eraser"></i>
                </button>
            </div>

            <div class="uc-category-toggle">
                <button class="uc-cat-btn active" data-cat="length"><i class="fas fa-ruler"></i> Chiều dài</button>
                <button class="uc-cat-btn" data-cat="volume"><i class="fas fa-tint"></i> Thể tích</button>
                <button class="uc-cat-btn" data-cat="mass"><i class="fas fa-weight-hanging"></i> Khối lượng</button>
                <button class="uc-cat-btn" data-cat="speed"><i class="fas fa-tachometer-alt"></i> Tốc độ</button>
            </div>

            <div class="card" style="background: var(--bg-sec); padding: 8px; border: none; border-radius: 20px;">
                
                <div class="uc-convert-area">
                    <div class="uc-input-group">
                        <div class="flex-between">
                            <span class="uc-label">Từ đơn vị</span>
                            <button class="btn-copy-mini" data-target="uc-in-1" title="Sao chép"><i class="fas fa-copy"></i></button>
                        </div>
                        <div class="uc-input-row">
                            <input type="number" class="uc-input" id="uc-in-1" placeholder="0" step="any">
                            <select class="uc-select" id="uc-sel-1"></select>
                        </div>
                    </div>

                    <button class="uc-swap-btn" id="btn-uc-swap" title="Hoán đổi">
                        <i class="fas fa-exchange-alt"></i>
                    </button>

                    <div class="uc-input-group">
                        <div class="flex-between">
                            <span class="uc-label">Sang đơn vị</span>
                            <button class="btn-copy-mini" data-target="uc-in-2" title="Sao chép"><i class="fas fa-copy"></i></button>
                        </div>
                        <div class="uc-input-row">
                            <input type="number" class="uc-input" id="uc-in-2" placeholder="0" step="any">
                            <select class="uc-select" id="uc-sel-2"></select>
                        </div>
                    </div>
                </div>

                <div class="uc-formula-box" id="uc-formula">
                    1 Mét = 100 Centimét
                </div>

            </div>

        </div>
    `;
}

export function init() {
    // --- TỪ ĐIỂN ĐƠN VỊ ---
  const UNIT_DATA = {
        length: {
            base: 'm',
            units: {
                'm': { name: 'Mét (m)', factor: 1 },
                'km': { name: 'Kilômét (km)', factor: 1000 },
                'cm': { name: 'Centimét (cm)', factor: 0.01 },
                'mm': { name: 'Milimét (mm)', factor: 0.001 },
                'mi': { name: 'Dặm (mi)', factor: 1609.344 },
                'yd': { name: 'Yard (yd)', factor: 0.9144 },
                'ft': { name: 'Feet (ft)', factor: 0.3048 },
                'in': { name: 'Inch (in)', factor: 0.0254 }
            },
            default1: 'm', default2: 'cm'
        },
        volume: {
            base: 'l',
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
        mass: {
            base: 'kg',
            units: {
                'kg': { name: 'Kilôgam (kg)', factor: 1 },
                'g': { name: 'Gram (g)', factor: 0.001 },
                'mg': { name: 'Miligram (mg)', factor: 0.000001 },
                't': { name: 'Tấn (t)', factor: 1000 },
                'lb': { name: 'Pound (lb)', factor: 0.45359237 },
                'oz': { name: 'Ounce (oz)', factor: 0.02834952 },
                'jin': { name: 'Cân Trung Quốc (Jin/市斤)', factor: 0.5 },    // Đã thêm Cân Trung Quốc
                'liang': { name: 'Lạng Trung Quốc (Liang/市两)', factor: 0.05 } // Đã thêm Lạng Trung Quốc
            },
            default1: 'kg', default2: 'g'
        },
        speed: {
            base: 'm/s',
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

    // --- TIỆN ÍCH ---
    const formatNum = (num) => {
        if (num === 0) return '0';
        return Number(num.toPrecision(7)).toString();
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
            const inBase = val1 * catData.units[u1].factor;
            const res = inBase / catData.units[u2].factor;
            in2.value = formatNum(res);
        } else {
            const val2 = parseFloat(in2.value);
            if (isNaN(val2)) { in1.value = ''; updateFormula(); return; }
            const inBase = val2 * catData.units[u2].factor;
            const res = inBase / catData.units[u1].factor;
            in1.value = formatNum(res);
        }
        updateFormula();
    };

    const updateFormula = () => {
        const catData = UNIT_DATA[currentCat];
        const u1 = sel1.value;
        const u2 = sel2.value;
        
        const inBase = 1 * catData.units[u1].factor;
        const res = inBase / catData.units[u2].factor;
        
        const name1 = catData.units[u1].name.split(' (')[0];
        const name2 = catData.units[u2].name.split(' (')[0];
        
        formulaText.innerHTML = `1 ${name1} &nbsp;=&nbsp; <b style="color:#3b82f6;">${formatNum(res)}</b> ${name2}`;
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
            catBtns.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
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
                UI.showAlert('Đã chép', `Sao chép thành công: ${val}`, 'success');
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