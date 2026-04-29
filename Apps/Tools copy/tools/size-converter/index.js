import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .sc-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            @media (min-width: 992px) { 
                .sc-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; align-items: start; } 
            }
            .sticky-pane { position: sticky; top: 80px; }
            
            .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
            .chip { 
                padding: 8px 16px; border: 1px solid var(--border); border-radius: 30px; 
                background: var(--bg-sec); cursor: pointer; color: var(--text-mut);
                transition: all 0.2s ease; font-size: 0.9rem; font-family: var(--font);
                display: inline-flex; align-items: center; justify-content: center;
                user-select: none; font-weight: 500;
            }
            .chip:hover { border-color: var(--text-main); color: var(--text-main); }
            .chip.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
            
            .size-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 8px; margin-bottom: 12px; }
            .size-btn {
                padding: 10px 0; text-align: center; border: 1px solid var(--border);
                border-radius: var(--radius); background: var(--bg-sec); cursor: pointer;
                transition: all 0.2s; font-weight: 600; color: var(--text-main);
                font-family: var(--font); font-size: 1rem;
            }
            .size-btn:hover { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
            .size-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
            
            .result-list { background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
            .result-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); }
            .result-item:last-child { border-bottom: none; }
            .result-std { color: var(--text-mut); font-size: 0.9rem; display: flex; flex-direction: column; }
            .result-std-sub { font-size: 0.75rem; opacity: 0.7; margin-top: 2px; }
            .result-val { font-size: 1.35rem; font-weight: 600; color: var(--text-main); }
            
            .warning-box { background: rgba(245, 158, 11, 0.1); color: #d97706; padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 0.85rem; line-height: 1.4; }

            .saved-list { display: flex; flex-direction: column; gap: 12px; }
            .saved-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; background: var(--bg-sec); transition: all 0.2s; }
            .saved-item:hover { border-color: var(--text-mut); }
            .saved-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .saved-title { font-weight: 600; color: var(--text-main); font-size: 1.05rem; }
            .saved-tags { display: flex; flex-wrap: wrap; gap: 6px; }
            .saved-tag { background: var(--bg-main); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; border: 1px solid var(--border); color: var(--text-mut); }
            .saved-tag strong { color: var(--text-main); font-weight: 600; }

            /* CSS CHO CUSTOM MODAL LƯU KẾT QUẢ */
            .sc-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 1000;
                display: none; align-items: center; justify-content: center;
                backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            }
            .sc-modal-overlay.show { display: flex; }
            .sc-modal-content {
                width: 90%; max-width: 400px; padding: 24px;
                animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Đổi cỡ Quần áo & Giày</h1>
                <p class="text-mut">Quy đổi nhanh chóng giữa US, UK, EU, VN. Hỗ trợ tự động nội suy size lẻ.</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-clear-all" style="color: #ef4444;">
                <i class="fas fa-redo"></i> Làm lại
            </button>
        </div>

        <div class="sc-layout">
            
            <div class="card" style="padding: 20px;">
                <div class="form-group">
                    <label class="form-label"><span class="text-mut" style="margin-right:4px;">1.</span> Loại sản phẩm</label>
                    <div class="tabs" id="product-tabs" style="margin-bottom: 0;"></div>
                </div>
                
                <div class="form-group" id="step-system" style="opacity: 0.5; pointer-events: none; transition: opacity 0.3s;">
                    <label class="form-label"><span class="text-mut" style="margin-right:4px;">2.</span> Chuẩn kích cỡ ban đầu</label>
                    <div class="chip-group" id="system-container">
                        <div class="text-mut" style="font-size: 0.9rem;">Vui lòng chọn Loại sản phẩm trước.</div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="form-group" id="step-size" style="opacity: 0.5; pointer-events: none; transition: opacity 0.3s; margin-bottom: 0;">
                    <label class="form-label"><span class="text-mut" style="margin-right:4px;">3.</span> Chọn hoặc Nhập size</label>
                    <div class="size-grid" id="size-container"></div>
                    <div style="margin-top: 12px;">
                        <input type="text" class="input" id="custom-size-input" placeholder="Hoặc nhập size tự do (VD: 39.5, 41 1/3)..." style="width: 100%;">
                    </div>
                </div>
            </div>

            <div class="sticky-pane">
                <div class="card" style="padding: 0; overflow: hidden; background: var(--bg-sec);">
                    <div class="tabs" style="border-bottom: 1px solid var(--border); padding: 8px 16px 0 16px; margin-bottom: 0;">
                        <button class="tab-btn active" data-target="pane-results"><i class="fas fa-list-ol"></i> Kết quả</button>
                        <button class="tab-btn" data-target="pane-saved"><i class="fas fa-bookmark"></i> Đã lưu</button>
                    </div>
                    
                    <div id="pane-results" style="padding: 20px;">
                        <div id="results-content">
                            <div class="text-mut" style="text-align:center; padding: 40px 0;">
                                <i class="fas fa-tshirt" style="font-size: 3rem; opacity: 0.2; margin-bottom: 16px; display:block;"></i>
                                <p>Kết quả quy đổi sẽ hiển thị tại đây</p>
                            </div>
                        </div>
                        <div class="flex-row" id="results-actions" style="gap: 12px; margin-top: 20px; display: none;">
                            <button class="btn btn-outline" id="btn-copy-res" style="flex: 1; justify-content: center;"><i class="fas fa-copy"></i> Chép</button>
                            <button class="btn btn-primary" id="btn-save-res" style="flex: 1; justify-content: center;"><i class="fas fa-save"></i> Lưu bộ Size</button>
                        </div>
                    </div>
                    
                    <div id="pane-saved" style="padding: 20px; display: none;">
                        <div id="saved-content"></div>
                    </div>
                </div>
            </div>

        </div>

        <div class="sc-modal-overlay" id="sc-save-modal">
            <div class="card sc-modal-content">
                <h3 class="h3" style="margin-bottom: 8px;">Lưu Kích Cỡ</h3>
                <p class="text-mut" style="margin-bottom: 16px; font-size: 0.9rem;">Đặt tên gợi nhớ để dễ dàng xem lại sau (VD: Giày anh hai, Áo của mẹ...).</p>
                <input type="text" class="input" id="sc-save-input" style="width: 100%; margin-bottom: 20px;" autocomplete="off">
                <div class="flex-row" style="justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-ghost" id="sc-btn-cancel">Hủy</button>
                    <button class="btn btn-primary" id="sc-btn-confirm">Lưu lại</button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const sysDesc = { "EU": "Châu Âu", "US (Nam)": "Mỹ (Nam)", "US (Nữ)": "Mỹ (Nữ)", "US (Trẻ em)": "Mỹ (Trẻ em)", "UK": "Anh", "cm": "Centimet", "VN": "Việt Nam", "JP": "Nhật Bản", "KR (mm)": "Hàn Quốc", "Quốc tế": "Size Chữ (S, M, L)", "US (Nam/Waist)": "Quần Nam US (inch eo)", "US (Nữ/Jean)": "Jean Nữ US", "Nike (US)": "Nike US", "Adidas (US)": "Adidas US", "Converse (US)": "Converse US", "MLB (KR)": "MLB Hàn", "EU (Nam)": "Âu (Nam)", "EU (Nữ)": "Âu (Nữ)" };
    const sizeData = {
        "Giày Dép": { default: { standards: ["EU", "US (Nam)", "US (Nữ)", "US (Trẻ em)", "UK", "cm", "VN", "JP", "Nike (US)", "Adidas (US)", "Converse (US)", "MLB (KR)"], data: [["28",null,null,"10.5","10","17","28","17",null,null,null,null],["30",null,null,"12.5","12","18.5","30","18.5",null,null,null,null],["32",null,null,"1.5","1","20","32","20",null,null,null,null],["34",null,null,"3","2.5","21.5","34","21.5",null,null,null,null],["35","3.5","5",null,"2.5","22","35","22","5.5","5","3.5","220"],["36","4.5","6",null,"3.5","22.5","36","22.5","6","5.5","4","230"],["37","5","6.5",null,"4.5","23.5","37","23.5","6.5","6","4.5","235"],["38","6","7.5",null,"5.5","24","38","24","7","6.5","5.5","240"],["39","6.5","8",null,"6","24.5","39","24.5","7.5","7","6.5","250"],["40","7.5","9",null,"7","25.5","40","25.5","8","7.5","7.5",null],["41","8","9.5",null,"7.5","26","41","26","8.5","8","8","260"],["42","9","10.5",null,"8.5","27","42","27","9","8.5","9","265"],["43","10","11.5",null,"9.5","28","43","28","9.5","9.5","10","270"],["44","10.5","12",null,"10","28.5","44","28.5","10","10","10.5","280"],["45","11.5",null,null,"11","29.5","45","29.5","11","11","11.5","290"]] } },
        "Áo": { default: { standards: ["Quốc tế", "EU (Nam)", "EU (Nữ)", "US (Nam)", "US (Nữ)", "VN"], data: [["XS","44","34","34","2","S"],["S","46","36","36","4-6","M"],["M","48-50","38-40","38-40","8-10","L"],["L","52-54","42-44","42-44","12-14","XL"],["XL","56","46","46-48","16-18","XXL"],["XXL","58","48","50-52","20","XXXL"]] } },
        "Quần": { default: { standards: ["US (Nam/Waist)", "US (Nữ/Jean)", "EU (Nam)", "EU (Nữ)", "VN"], data: [[null,"24-25",null,"32-34","S"],[null,"26-27",null,"36-38","M"],["28-29",null,"44",null,"S/M"],["30-31","28-29","46","40","L"],["32-33","30-31","48","42","XL"],["34-36","32","50-52","44","XXL"],["38",null,"54",null,"XXXL"]] } }
    };

    const productTabs = document.getElementById('product-tabs');
    const systemContainer = document.getElementById('system-container');
    const sizeContainer = document.getElementById('size-container');
    const customSizeInput = document.getElementById('custom-size-input');
    const stepSystem = document.getElementById('step-system');
    const stepSize = document.getElementById('step-size');
    const resultsContent = document.getElementById('results-content');
    const resultsActions = document.getElementById('results-actions');
    const savedContent = document.getElementById('saved-content');
    const rightTabs = document.querySelectorAll('.sticky-pane .tab-btn');
    const paneResults = document.getElementById('pane-results');
    const paneSaved = document.getElementById('pane-saved');

    // Các Element của Custom Modal
    const scModal = document.getElementById('sc-save-modal');
    const scInput = document.getElementById('sc-save-input');
    const btnCancelSave = document.getElementById('sc-btn-cancel');
    const btnConfirmSave = document.getElementById('sc-btn-confirm');

    let selectedType = null;
    let selectedSystem = null;
    let selectedSize = null;
    let currentResultData = null;
    const STORAGE_KEY = 'aio_size_converter_v1';

    const renderProductTabs = () => {
        productTabs.innerHTML = '';
        const icons = { 'Giày Dép': 'fa-shoe-prints', 'Áo': 'fa-tshirt', 'Quần': 'fa-user-tie' };
        Object.keys(sizeData).forEach((type) => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.innerHTML = `<i class="fas ${icons[type]}"></i> ${type}`;
            btn.onclick = () => {
                document.querySelectorAll('#product-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedType = type;
                selectedSystem = null; selectedSize = null;
                
                stepSystem.style.opacity = '1'; stepSystem.style.pointerEvents = 'auto';
                stepSize.style.opacity = '0.5'; stepSize.style.pointerEvents = 'none';
                customSizeInput.value = '';
                
                renderSystems(); resetResults();
            };
            productTabs.appendChild(btn);
        });
    };

    const renderSystems = () => {
        systemContainer.innerHTML = '';
        if (!selectedType) return;
        const dataSet = sizeData[selectedType].default;
        const grouped = {}; const valueMap = {};
        
        dataSet.standards.forEach((std, i) => {
            const colData = dataSet.data.map(row => row[i]).join('|');
            if (!grouped[colData]) grouped[colData] = [];
            grouped[colData].push(std);
        });

        Object.values(grouped).forEach(group => {
            const displayName = group.join(' / ');
            valueMap[displayName] = group[0]; 
            const chip = document.createElement('div');
            chip.className = 'chip'; chip.textContent = displayName;
            chip.title = group.map(s => sysDesc[s] || s).join(' | ');
            
            chip.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                selectedSystem = valueMap[displayName];
                stepSize.style.opacity = '1'; stepSize.style.pointerEvents = 'auto';
                customSizeInput.value = '';
                renderSizes(); resetResults();
            };
            systemContainer.appendChild(chip);
        });
    };

    const renderSizes = () => {
        sizeContainer.innerHTML = '';
        if (!selectedType || !selectedSystem) return;
        const dataSet = sizeData[selectedType].default;
        const sysIndex = dataSet.standards.indexOf(selectedSystem);
        const sizes = [...new Set(dataSet.data.map(r => r[sysIndex]).filter(s => s != null && String(s).trim() !== ''))];
        
        sizes.forEach(sizeVal => {
            const btn = document.createElement('div');
            btn.className = 'size-btn'; btn.textContent = sizeVal;
            btn.onclick = () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                customSizeInput.value = ''; 
                selectedSize = sizeVal;
                processConversion(selectedSize);
            };
            sizeContainer.appendChild(btn);
        });
    };

    customSizeInput.addEventListener('input', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        selectedSize = e.target.value.trim();
        processConversion(selectedSize);
    });

    const parseNum = (str) => {
        if (!str) return NaN;
        const s = String(str).trim();
        if (s.includes('-')) { const p = s.split('-').map(x => parseFloat(x)); return (p[0] + p[1]) / 2; }
        return parseFloat(s);
    };

    const processConversion = (sizeStr) => {
        if (!sizeStr || !selectedType || !selectedSystem) return resetResults();
        if (!rightTabs[0].classList.contains('active')) rightTabs[0].click();
        
        const dataSet = sizeData[selectedType].default;
        const sysIndex = dataSet.standards.indexOf(selectedSystem);
        const exactMatch = dataSet.data.find(row => String(row[sysIndex]).toLowerCase() === sizeStr.toLowerCase());
        
        if (exactMatch) return displayResults(exactMatch, dataSet.standards, false);

        const inputNum = parseNum(sizeStr);
        if (isNaN(inputNum)) return showNotFound(sizeStr);

        const numData = dataSet.data.map(row => ({ original: row, parsed: row.map(val => parseNum(val)) })).filter(item => !isNaN(item.parsed[sysIndex]));
        if (numData.length < 2) return showNotFound(sizeStr);

        numData.sort((a, b) => a.parsed[sysIndex] - b.parsed[sysIndex]);

        let p1, p2;
        if (inputNum <= numData[0].parsed[sysIndex]) { p1 = numData[0]; p2 = numData[1]; } 
        else if (inputNum >= numData[numData.length - 1].parsed[sysIndex]) { p1 = numData[numData.length - 2]; p2 = numData[numData.length - 1]; } 
        else {
            for (let i = 0; i < numData.length - 1; i++) {
                if (inputNum >= numData[i].parsed[sysIndex] && inputNum <= numData[i + 1].parsed[sysIndex]) { p1 = numData[i]; p2 = numData[i + 1]; break; }
            }
        }

        if (!p1 || !p2) return showNotFound(sizeStr);

        const x1 = p1.parsed[sysIndex], x2 = p2.parsed[sysIndex];
        if (x1 === x2) return displayResults(p1.original, dataSet.standards, false); 

        const ratio = (inputNum - x1) / (x2 - x1);
        const calcRow = dataSet.standards.map((_, i) => {
            const y1 = p1.parsed[i], y2 = p2.parsed[i];
            if (isNaN(y1) || isNaN(y2)) return ratio < 0.5 ? p1.original[i] : p2.original[i];
            const result = y1 + ratio * (y2 - y1);
            return `~${result.toFixed(1).replace('.0', '')}`; 
        });
        
        calcRow[sysIndex] = sizeStr; 
        displayResults(calcRow, dataSet.standards, true);
    };

    const showNotFound = (size) => {
        resultsContent.innerHTML = `<div class="text-mut" style="text-align:center; padding: 30px 0;">Không thể tính toán dữ liệu quy đổi cho size <b style="color:#ef4444">${size}</b>.</div>`;
        resultsActions.style.display = 'none'; currentResultData = null;
    };

    const resetResults = () => {
        resultsContent.innerHTML = `<div class="text-mut" style="text-align:center; padding: 40px 0;"><i class="fas fa-tshirt" style="font-size: 3rem; opacity: 0.2; margin-bottom: 16px; display:block;"></i><p>Kết quả quy đổi sẽ hiển thị tại đây</p></div>`;
        resultsActions.style.display = 'none'; currentResultData = null;
    };

    const displayResults = (resultRow, standards, isApproximate) => {
        currentResultData = { standards, resultRow };
        let html = '';
        if (isApproximate) html += `<div class="warning-box"><i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i> <b>Nội suy tương đối:</b> Size bạn nhập không có trong bảng chuẩn cứng. Tự động tính toán dựa trên dữ liệu gần nhất.</div>`;

        const grouped = {};
        resultRow.forEach((val, i) => {
            if (val == null || String(val).trim() === '') return;
            const strVal = String(val);
            if (!grouped[strVal]) grouped[strVal] = [];
            grouped[strVal].push(standards[i]);
        });

        html += `<div class="result-list">`;
        Object.entries(grouped).forEach(([val, stds]) => {
            const stdNames = stds.join(' / ');
            const stdSub = stds.map(s => sysDesc[s] || s).join(', ');
            html += `<div class="result-item"><div class="result-std"><span style="font-weight: 500; color: var(--text-main);">${stdNames}</span><span class="result-std-sub">${stdSub}</span></div><div class="result-val">${val}</div></div>`;
        });
        html += `</div>`;

        resultsContent.innerHTML = html;
        resultsActions.style.display = 'flex';
    };

    // --- Right Pane Tabs Logic ---
    rightTabs.forEach(tab => {
        tab.onclick = () => {
            rightTabs.forEach(t => t.classList.remove('active')); tab.classList.add('active');
            const target = tab.dataset.target;
            paneResults.style.display = target === 'pane-results' ? 'block' : 'none';
            paneSaved.style.display = target === 'pane-saved' ? 'block' : 'none';
            if (target === 'pane-saved') renderSavedItems();
        };
    });

    const getSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const setSaved = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    document.getElementById('btn-copy-res').onclick = async () => {
        if (!currentResultData) return;
        const txt = currentResultData.resultRow.map((val, i) => (val == null || String(val).trim() === '') ? null : `${currentResultData.standards[i]}: ${val}`).filter(Boolean).join('\n');
        try { await navigator.clipboard.writeText(txt); UI.showAlert('Đã chép', 'Đã chép vào bộ nhớ đệm.', 'success'); } catch (e) { UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ chép dữ liệu.', 'error'); }
    };

    // --- LOGIC CUSTOM MODAL LƯU TRỮ ---
    const closeSaveModal = () => {
        scModal.classList.remove('show');
        scInput.value = '';
    };

    document.getElementById('btn-save-res').onclick = () => {
        if (!currentResultData) return;
        const defName = `${selectedType} (${selectedSystem} ${selectedSize})`;
        scInput.value = defName;
        scModal.classList.add('show');
        
        // Timeout nhẹ để đảm bảo modal render xong mới focus được
        setTimeout(() => {
            scInput.focus();
            scInput.select();
        }, 50);
    };

    btnCancelSave.onclick = closeSaveModal;
    
    // Đóng khi click ra ngoài vùng Modal
    scModal.onclick = (e) => {
        if (e.target === scModal) closeSaveModal();
    };

    // Khi người dùng bấm Enter trong ô Input
    scInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') btnConfirmSave.click();
    });

    // Xác nhận Lưu
    btnConfirmSave.onclick = () => {
        const name = scInput.value.trim();
        if (!name) return UI.showAlert('Lỗi', 'Vui lòng nhập tên gợi nhớ.', 'warning');

        const dataToSave = currentResultData.resultRow.map((val, i) => {
            if (val == null || String(val).trim() === '') return null;
            return { std: currentResultData.standards[i], val: val };
        }).filter(Boolean);

        const savedData = getSaved();
        savedData.push({ id: Date.now(), name: name, type: selectedType, items: dataToSave });
        setSaved(savedData);
        
        closeSaveModal();
        UI.showAlert('Đã lưu', 'Kích cỡ đã được lưu thành công.', 'success');
        rightTabs[1].click(); // Chuyển sang tab Đã lưu
    };

    const renderSavedItems = () => {
        const savedData = getSaved();
        if (savedData.length === 0) return savedContent.innerHTML = '<div class="text-mut" style="text-align:center; padding: 20px 0;">Bạn chưa lưu thông số kích cỡ nào.</div>';

        let html = '<div class="saved-list">';
        savedData.reverse().forEach(entry => {
            const tags = entry.items.map(item => `<span class="saved-tag"><strong>${item.std}:</strong> ${item.val}</span>`).join('');
            html += `<div class="saved-item"><div class="saved-header"><div class="saved-title"><i class="fas fa-bookmark text-mut" style="font-size: 0.9rem; margin-right: 6px;"></i> ${entry.name}</div><div class="flex-row" style="gap: 4px;"><button class="btn btn-ghost btn-sm btn-copy-saved" data-id="${entry.id}" style="color: #10b981; padding: 4px 8px;"><i class="fas fa-copy"></i></button><button class="btn btn-ghost btn-sm btn-del-saved" data-id="${entry.id}" style="color: #ef4444; padding: 4px 8px;"><i class="fas fa-trash"></i></button></div></div><div class="saved-tags">${tags}</div></div>`;
        });
        html += '</div>';
        savedContent.innerHTML = html;

        savedContent.querySelectorAll('.btn-del-saved').forEach(btn => {
            btn.onclick = () => {
                UI.showConfirm('Xóa mục này?', 'Dữ liệu size đã lưu sẽ bị xóa vĩnh viễn.', () => {
                    const idToDel = parseInt(btn.dataset.id);
                    setSaved(getSaved().filter(item => item.id !== idToDel));
                    renderSavedItems();
                });
            };
        });

        savedContent.querySelectorAll('.btn-copy-saved').forEach(btn => {
            btn.onclick = async () => {
                const item = getSaved().find(i => i.id === parseInt(btn.dataset.id));
                if (item) {
                    const txt = `${item.name}\n` + item.items.map(i => `${i.std}: ${i.val}`).join('\n');
                    try { await navigator.clipboard.writeText(txt); UI.showAlert('Đã chép', 'Đã chép thông số đã lưu.', 'success'); } catch (e) {}
                }
            };
        });
    };

    document.getElementById('btn-clear-all').onclick = () => {
        document.querySelectorAll('#product-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        selectedType = null; selectedSystem = null; selectedSize = null;
        stepSystem.style.opacity = '0.5'; stepSystem.style.pointerEvents = 'none'; systemContainer.innerHTML = '<div class="text-mut" style="font-size: 0.9rem;">Vui lòng chọn Loại sản phẩm trước.</div>';
        stepSize.style.opacity = '0.5'; stepSize.style.pointerEvents = 'none'; sizeContainer.innerHTML = ''; customSizeInput.value = '';
        resetResults(); rightTabs[0].click();
    };

    renderProductTabs();
}