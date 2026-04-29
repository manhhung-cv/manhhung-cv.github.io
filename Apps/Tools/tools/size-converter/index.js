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

            .flat-btn { transition: transform 0.1s, background-color 0.1s, color 0.1s; user-select: none; }
            .flat-btn:active { transform: scale(0.95); }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[500px]">
            
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Đổi Cỡ Quần Áo & Giày</h2>
                    <p class="text-xs text-zinc-500 mt-1 font-medium">Quy đổi chuẩn quốc tế và gợi ý size theo chiều cao, cân nặng.</p>
                </div>
                <button class="flat-btn h-9 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-clear-all">
                    <i class="fas fa-redo-alt"></i> Làm lại
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden p-5 space-y-6">
                        
                        <div>
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3"><span class="text-zinc-900 dark:text-white mr-1">1.</span> Chọn công cụ</label>
                            <div class="flex overflow-x-auto hide-scrollbar gap-2" id="product-tabs">
                                </div>
                        </div>

                        <div class="h-px bg-zinc-100 dark:bg-zinc-800/80 w-full"></div>

                        <div id="manual-steps" class="space-y-6 block">
                            <div id="step-system" class="opacity-50 pointer-events-none transition-opacity duration-300">
                                <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3"><span class="text-zinc-900 dark:text-white mr-1">2.</span> Chọn chuẩn kích cỡ ban đầu</label>
                                <div class="flex flex-wrap gap-2" id="system-container">
                                    <div class="text-[12px] font-medium text-zinc-400">Vui lòng chọn công cụ trước.</div>
                                </div>
                            </div>

                            <div class="h-px bg-zinc-100 dark:bg-zinc-800/80 w-full"></div>

                            <div id="step-size" class="opacity-50 pointer-events-none transition-opacity duration-300">
                                <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3"><span class="text-zinc-900 dark:text-white mr-1">3.</span> Chọn hoặc nhập size</label>
                                <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-3" id="size-container">
                                    </div>
                                <input type="text" id="custom-size-input" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white transition-colors" placeholder="Hoặc nhập size lẻ (VD: 39.5, 41 1/3)...">
                            </div>
                        </div>

                        <div id="auto-suggest-steps" class="hidden space-y-6 animate-in fade-in">
                            <div>
                                <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3"><span class="text-zinc-900 dark:text-white mr-1">2.</span> Giới tính</label>
                                <div class="flex gap-2" id="sg-gender">
                                    <button class="sg-gender-btn active flat-btn flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold border border-transparent transition-colors" data-val="nam">Nam</button>
                                    <button class="sg-gender-btn flat-btn flex-1 py-3 bg-zinc-50 dark:bg-[#121214] text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-800 transition-colors" data-val="nu">Nữ</button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Chiều cao (cm)</label>
                                    <input type="number" id="sg-height" class="sg-input w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white transition-colors" placeholder="VD: 170">
                                </div>
                                <div>
                                    <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Cân nặng (kg)</label>
                                    <input type="number" id="sg-weight" class="sg-input w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white transition-colors" placeholder="VD: 60">
                                </div>
                            </div>

                            <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                                <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1"><i class="fas fa-info-circle"></i> Trợ lý AI</div>
                                <div class="text-[12px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">Hệ thống tính toán kích cỡ dựa trên BMI và thể trạng trung bình của người Việt Nam. Tự động cộng thêm size giày nếu tỉ lệ mập/rộng chân lớn.</div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="lg:col-span-5 flex flex-col h-full min-h-[400px] sticky top-6">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
                        
                        <div class="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
                            <button class="right-tab-btn active flex-1 py-3 px-4 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap" data-target="pane-results"><i class="fas fa-list-ol mr-1"></i> Kết quả</button>
                            <button class="right-tab-btn flex-1 py-3 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap" data-target="pane-saved"><i class="fas fa-bookmark mr-1"></i> Đã lưu</button>
                        </div>

                        <div id="pane-results" class="right-pane block flex-1 flex flex-col p-5">
                            <div id="results-content" class="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                <div class="text-zinc-400 flex flex-col items-center gap-3 opacity-30 mt-10" id="empty-result">
                                    <i class="fas fa-ruler-combined text-5xl"></i>
                                    <span class="text-xs font-bold uppercase tracking-wider text-center">Nhập dữ liệu<br>để xem kết quả</span>
                                </div>
                            </div>
                            
                            <div id="results-actions" class="hidden gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                <button id="btn-copy-res" class="flat-btn flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700">
                                    <i class="far fa-copy"></i> Chép
                                </button>
                                <button id="btn-save-res" class="flat-btn flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5">
                                    <i class="fas fa-save"></i> Lưu
                                </button>
                            </div>
                        </div>

                        <div id="pane-saved" class="right-pane hidden flex-1 flex flex-col p-5">
                            <div id="saved-content" class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                                </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- DỮ LIỆU CỐ ĐỊNH ---
    const sysDesc = { 
        "EU": "Châu Âu", "US (Nam)": "Mỹ (Nam)", "US (Nữ)": "Mỹ (Nữ)", "US (Trẻ em)": "Mỹ (Trẻ em)", "UK": "Anh", "cm": "Chiều dài (cm)", "VN": "Việt Nam", "JP": "Nhật Bản", "KR (mm)": "Hàn Quốc", 
        "Quốc tế": "Size Chữ (S, M, L)", "US (Nam/Waist)": "Quần Nam US (inch eo)", "US (Nữ/Jean)": "Jean Nữ US", "Nike (US)": "Nike US", "Adidas (US)": "Adidas US", "Converse (US)": "Converse US", "MLB (KR)": "MLB Hàn", "EU (Nam)": "Âu (Nam)", "EU (Nữ)": "Âu (Nữ)",
        "Đường kính (mm)": "Đường kính lòng trong", "Chu vi (mm)": "Chu vi ngón tay", "VN/China/Japan": "Châu Á", "US/Canada": "Mỹ/Canada", "UK/Australia": "Anh/Úc"
    };

    const sizeData = {
        "Giày Dép": { 
            icon: "fa-shoe-prints",
            default: { 
                standards: ["EU", "US (Nam)", "US (Nữ)", "US (Trẻ em)", "UK", "cm", "VN", "JP", "Nike (US)", "Adidas (US)", "Converse (US)", "MLB (KR)"], 
                data: [
                    ["28",null,null,"10.5","10","17","28","17",null,null,null,null],
                    ["30",null,null,"12.5","12","18.5","30","18.5",null,null,null,null],
                    ["32",null,null,"1.5","1","20","32","20",null,null,null,null],
                    ["34",null,null,"3","2.5","21.5","34","21.5",null,null,null,null],
                    ["35","3.5","5",null,"2.5","22","35","22","5.5","5","3.5","220"],
                    ["36","4.5","6",null,"3.5","22.5","36","22.5","6","5.5","4","230"],
                    ["37","5","6.5",null,"4.5","23.5","37","23.5","6.5","6","4.5","235"],
                    ["38","6","7.5",null,"5.5","24","38","24","7","6.5","5.5","240"],
                    ["39","6.5","8",null,"6","24.5","39","24.5","7.5","7","6.5","250"],
                    ["40","7.5","9",null,"7","25.5","40","25.5","8","7.5","7.5",null],
                    ["41","8","9.5",null,"7.5","26","41","26","8.5","8","8","260"],
                    ["42","9","10.5",null,"8.5","27","42","27","9","8.5","9","265"],
                    ["43","10","11.5",null,"9.5","28","43","28","9.5","9.5","10","270"],
                    ["44","10.5","12",null,"10","28.5","44","28.5","10","10","10.5","280"],
                    ["45","11.5",null,null,"11","29.5","45","29.5","11","11","11.5","290"]
                ] 
            } 
        },
        "Áo": { 
            icon: "fa-tshirt",
            default: { 
                standards: ["Quốc tế", "EU (Nam)", "EU (Nữ)", "US (Nam)", "US (Nữ)", "VN"], 
                data: [
                    ["XS","44","34","34","2","S"],
                    ["S","46","36","36","4-6","M"],
                    ["M","48-50","38-40","38-40","8-10","L"],
                    ["L","52-54","42-44","42-44","12-14","XL"],
                    ["XL","56","46","46-48","16-18","XXL"],
                    ["XXL","58","48","50-52","20","XXXL"]
                ] 
            } 
        },
        "Quần": { 
            icon: "fa-user-tie",
            default: { 
                standards: ["US (Nam/Waist)", "US (Nữ/Jean)", "EU (Nam)", "EU (Nữ)", "VN"], 
                data: [
                    [null,"24-25",null,"32-34","S"],
                    [null,"26-27",null,"36-38","M"],
                    ["28-29",null,"44",null,"S/M"],
                    ["30-31","28-29","46","40","L"],
                    ["32-33","30-31","48","42","XL"],
                    ["34-36","32","50-52","44","XXL"],
                    ["38",null,"54",null,"XXXL"]
                ] 
            } 
        },
        "Nhẫn": {
            icon: "fa-ring",
            default: {
                standards: ["Đường kính (mm)", "Chu vi (mm)", "VN/China/Japan", "US/Canada", "UK/Australia"],
                data: [
                    ["14.1", "44.2", "4", "3", "F"],
                    ["14.5", "45.5", "5", "3.5", "G"],
                    ["14.9", "46.8", "6", "4", "H"],
                    ["15.3", "48.0", "7", "4.5", "I"],
                    ["15.7", "49.3", "8", "5", "J 1/2"],
                    ["16.1", "50.6", "9", "5.5", "L"],
                    ["16.5", "51.9", "10", "6", "M"],
                    ["16.9", "53.1", "11", "6.5", "N"],
                    ["17.3", "54.4", "12", "7", "O"],
                    ["17.7", "55.7", "13", "7.5", "P"],
                    ["18.1", "57.0", "14", "8", "Q"],
                    ["18.5", "58.3", "15", "8.5", "Q 1/2"],
                    ["19.0", "59.5", "16", "9", "R 1/2"],
                    ["19.4", "60.8", "17", "9.5", "S 1/2"],
                    ["19.8", "62.1", "18", "10", "T 1/2"],
                    ["20.2", "63.4", "19", "10.5", "V"],
                    ["20.6", "64.6", "20", "11", "W"],
                    ["21.0", "65.9", "21", "11.5", "X"],
                    ["21.4", "67.2", "22", "12", "Y"]
                ]
            }
        }
    };

    // --- DOM Elements ---
    const productTabs = document.getElementById('product-tabs');
    const systemContainer = document.getElementById('system-container');
    const sizeContainer = document.getElementById('size-container');
    const customSizeInput = document.getElementById('custom-size-input');
    
    const manualSteps = document.getElementById('manual-steps');
    const autoSuggestSteps = document.getElementById('auto-suggest-steps');
    const stepSystem = document.getElementById('step-system');
    const stepSize = document.getElementById('step-size');
    
    const sgGenderBtns = document.querySelectorAll('.sg-gender-btn');
    const sgHeight = document.getElementById('sg-height');
    const sgWeight = document.getElementById('sg-weight');

    const resultsContent = document.getElementById('results-content');
    const resultsActions = document.getElementById('results-actions');
    const savedContent = document.getElementById('saved-content');
    
    const rightTabs = document.querySelectorAll('.right-tab-btn');
    const paneResults = document.getElementById('pane-results');
    const paneSaved = document.getElementById('pane-saved');

    let selectedType = null;
    let selectedSystem = null;
    let selectedSize = null;
    
    let isSuggestMode = false;
    let suggestGender = 'nam';
    let currentResultData = null; // Dùng chung cho cả 2 mode để copy/save
    let currentResultText = '';

    const STORAGE_KEY = 'aio_size_converter_v3';

    // --- DIALOG ---
    const escapeHTML = (str) => String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));

    const showDialog = ({ type, title, message, defaultValue = '', okText = 'Đồng ý', cancelText = 'Hủy', onConfirm }) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-200 px-4';
        
        const box = document.createElement('div');
        box.className = 'bg-white dark:bg-[#09090b] w-full max-w-sm rounded-[24px] p-6 animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800';
        
        let inputHTML = type === 'prompt' ? `<input type="text" id="sc-dialog-input" value="${escapeHTML(defaultValue)}" class="w-full mt-4 mb-6 px-4 py-3 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 dark:focus:border-white transition-colors text-sm font-bold text-zinc-900 dark:text-white" autocomplete="off">` : `<div class="mb-6"></div>`;

        box.innerHTML = `
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">${title}</h3>
            <p class="text-[13px] text-zinc-500 leading-relaxed">${message}</p>
            ${inputHTML}
            <div class="flex justify-end gap-2">
                <button id="sc-dialog-cancel" class="flat-btn px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">${cancelText}</button>
                <button id="sc-dialog-ok" class="flat-btn px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">${okText}</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const btnCancel = box.querySelector('#sc-dialog-cancel');
        const btnOk = box.querySelector('#sc-dialog-ok');
        const inputEl = box.querySelector('#sc-dialog-input');

        const closeDialog = () => {
            overlay.classList.add('opacity-0');
            setTimeout(() => document.body.removeChild(overlay), 200);
        };

        btnCancel.onclick = closeDialog;
        overlay.onmousedown = (e) => { if(e.target === overlay) closeDialog(); };

        const confirmAction = () => {
            const val = type === 'prompt' ? inputEl.value : null;
            closeDialog();
            if (onConfirm) onConfirm(val);
        };

        btnOk.onclick = confirmAction;

        if (inputEl) {
            setTimeout(() => { inputEl.focus(); inputEl.select(); }, 50);
            inputEl.onkeydown = (e) => { if (e.key === 'Enter') confirmAction(); };
        }
    };


    // --- RENDER TABS ---
    const renderProductTabs = () => {
        productTabs.innerHTML = '';

        // Nút Gợi ý (Nổi bật)
        const btnSuggest = document.createElement('button');
        btnSuggest.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent text-[12px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 transition-colors whitespace-nowrap';
        btnSuggest.innerHTML = `<i class="fas fa-magic"></i> Gợi ý (AI)`;
        btnSuggest.onclick = () => {
            document.querySelectorAll('#product-tabs button').forEach(b => {
                b.classList.remove('bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900', 'bg-blue-600', 'text-white');
                if (b !== btnSuggest) b.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors whitespace-nowrap';
            });
            btnSuggest.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent text-[12px] font-bold text-white bg-blue-600 dark:bg-blue-500 transition-colors whitespace-nowrap';

            isSuggestMode = true;
            manualSteps.classList.add('hidden');
            autoSuggestSteps.classList.remove('hidden');
            resetResults();
            calculateSuggest();
        };
        productTabs.appendChild(btnSuggest);

        // Các nút thủ công
        Object.keys(sizeData).forEach((type) => {
            const btn = document.createElement('button');
            btn.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors whitespace-nowrap';
            btn.innerHTML = `<i class="fas ${sizeData[type].icon}"></i> ${type}`;
            
            btn.onclick = () => {
                document.querySelectorAll('#product-tabs button').forEach(b => {
                    b.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors whitespace-nowrap';
                });
                btnSuggest.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent text-[12px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 transition-colors whitespace-nowrap';
                btn.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent text-[12px] font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-white transition-colors whitespace-nowrap';

                isSuggestMode = false;
                manualSteps.classList.remove('hidden');
                autoSuggestSteps.classList.add('hidden');

                selectedType = type;
                selectedSystem = null; selectedSize = null;
                
                stepSystem.classList.remove('opacity-50', 'pointer-events-none');
                stepSize.classList.add('opacity-50', 'pointer-events-none');
                customSizeInput.value = '';
                
                renderSystems(); resetResults();
            };
            productTabs.appendChild(btn);
        });
    };

    // --- LOGIC MANUAL ---
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
            
            const chip = document.createElement('button');
            chip.className = 'flat-btn px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors';
            chip.textContent = displayName;
            chip.title = group.map(s => sysDesc[s] || s).join(' | ');
            
            chip.onclick = () => {
                document.querySelectorAll('#system-container button').forEach(c => {
                    c.className = 'flat-btn px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors';
                });
                chip.className = 'flat-btn px-4 py-2 border border-transparent rounded-full text-[12px] font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-white transition-colors';
                
                selectedSystem = valueMap[displayName];
                stepSize.classList.remove('opacity-50', 'pointer-events-none');
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
            const btn = document.createElement('button');
            btn.className = 'flat-btn py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-[#121214] transition-colors';
            btn.textContent = sizeVal;
            
            btn.onclick = () => {
                document.querySelectorAll('#size-container button').forEach(b => {
                    b.className = 'flat-btn py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-[#121214] transition-colors';
                });
                btn.className = 'flat-btn py-2.5 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 transition-colors';
                
                customSizeInput.value = ''; 
                selectedSize = sizeVal;
                processConversion(selectedSize);
            };
            sizeContainer.appendChild(btn);
        });
    };

    customSizeInput.addEventListener('input', (e) => {
        document.querySelectorAll('#size-container button').forEach(b => {
            b.className = 'flat-btn py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-[#121214] transition-colors';
        });
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

    // --- LOGIC AUTO SUGGEST ---
    sgGenderBtns.forEach(btn => {
        btn.onclick = () => {
            sgGenderBtns.forEach(b => {
                b.className = 'sg-gender-btn flat-btn flex-1 py-3 bg-zinc-50 dark:bg-[#121214] text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-800 transition-colors';
            });
            btn.className = 'sg-gender-btn active flat-btn flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold border border-transparent transition-colors';
            suggestGender = btn.dataset.val;
            calculateSuggest();
        };
    });

    [sgHeight, sgWeight].forEach(input => {
        input.addEventListener('input', calculateSuggest);
    });

    function calculateSuggest() {
        const h = parseFloat(sgHeight.value);
        const w = parseFloat(sgWeight.value);

        if (!h || !w || h <= 0 || w <= 0) {
            resetResults();
            return;
        }

        if (!rightTabs[0].classList.contains('active')) rightTabs[0].click();

        let shoe = 35;
        let shirt = 'S';
        let pants = 'S';

        const bmi = w / ((h/100) * (h/100));

        if (suggestGender === 'nam') {
            // Giày Nam
            if (h < 160) shoe = 38;
            else if (h < 165) shoe = 39;
            else if (h < 170) shoe = 40;
            else if (h < 175) shoe = 41;
            else if (h < 180) shoe = 42;
            else if (h < 185) shoe = 43;
            else shoe = 44;
            if (bmi > 24.5) shoe += 1;

            // Áo Nam
            let shirtH = 0, shirtW = 0;
            if (h < 160) shirtH = 0; else if (h < 167) shirtH = 1; else if (h < 174) shirtH = 2; else if (h < 180) shirtH = 3; else shirtH = 4;
            if (w < 55) shirtW = 0; else if (w < 62) shirtW = 1; else if (w < 70) shirtW = 2; else if (w < 79) shirtW = 3; else shirtW = 4;
            const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            shirt = shirtSizes[Math.max(shirtH, shirtW)];

            // Quần Nam
            if (w < 55) pants = 'Size 28 (S)';
            else if (w < 60) pants = 'Size 29 (M)';
            else if (w < 65) pants = 'Size 30 (L)';
            else if (w < 70) pants = 'Size 31 (L)';
            else if (w < 75) pants = 'Size 32 (XL)';
            else if (w < 80) pants = 'Size 33 (XL)';
            else pants = 'Size 34 (XXL)';
        } else {
            // Giày Nữ
            if (h < 150) shoe = 35;
            else if (h < 155) shoe = 36;
            else if (h < 160) shoe = 37;
            else if (h < 165) shoe = 38;
            else if (h < 170) shoe = 39;
            else shoe = 40;
            if (bmi > 24) shoe += 1;

            // Áo Nữ
            let shirtH = 0, shirtW = 0;
            if (h < 150) shirtH = 0; else if (h < 155) shirtH = 1; else if (h < 160) shirtH = 2; else if (h < 165) shirtH = 3; else shirtH = 4;
            if (w < 45) shirtW = 0; else if (w < 49) shirtW = 1; else if (w < 54) shirtW = 2; else if (w < 60) shirtW = 3; else shirtW = 4;
            const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            shirt = shirtSizes[Math.max(shirtH, shirtW)];

            // Quần Nữ
            if (w < 45) pants = 'Size S (Jean 26)';
            else if (w < 50) pants = 'Size M (Jean 27)';
            else if (w < 55) pants = 'Size L (Jean 28)';
            else if (w < 60) pants = 'Size XL (Jean 29)';
            else pants = 'Size XXL (Jean 30)';
        }

        // Cập nhật Result
        currentResultData = { suggest: true, shoe, shirt, pants, height: h, weight: w, gender: suggestGender };
        currentResultText = `Gợi ý Size (H:${h}cm, W:${w}kg, ${suggestGender.toUpperCase()}):\n- Giày: ${shoe} (EU)\n- Áo: ${shirt}\n- Quần: ${pants}`;
        
        let html = '<div class="space-y-3">';
        
        // Khối giới thiệu
        html += `
            <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3 mb-2 flex items-center justify-between">
                <div>
                    <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Thể trạng: ${suggestGender.toUpperCase()}</div>
                    <div class="text-[12px] text-blue-700 dark:text-blue-300 font-medium">${h} cm - ${w} kg</div>
                </div>
                <div class="bg-white dark:bg-[#09090b] text-[10px] font-bold px-2 py-1 rounded text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">BMI: ${bmi.toFixed(1)}</div>
            </div>
        `;

        // Card Giày
        html += `
            <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-zinc-900 dark:text-white"><i class="fas fa-shoe-prints text-zinc-400 mr-1.5"></i> Size Giày</span>
                    <span class="text-[10px] text-zinc-500 font-medium mt-0.5">Tiêu chuẩn Châu Âu (EU)</span>
                </div>
                <div class="text-2xl font-black text-blue-500 font-mono tracking-tighter">${shoe}</div>
            </div>
        `;

        // Card Áo
        html += `
            <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-zinc-900 dark:text-white"><i class="fas fa-tshirt text-zinc-400 mr-1.5"></i> Size Áo</span>
                    <span class="text-[10px] text-zinc-500 font-medium mt-0.5">Size Quốc tế (Thun, Sơ mi)</span>
                </div>
                <div class="text-2xl font-black text-blue-500 font-mono tracking-tighter">${shirt}</div>
            </div>
        `;

        // Card Quần
        html += `
            <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-zinc-900 dark:text-white"><i class="fas fa-user-tie text-zinc-400 mr-1.5"></i> Size Quần</span>
                    <span class="text-[10px] text-zinc-500 font-medium mt-0.5">Tham khảo Jean & Quần âu</span>
                </div>
                <div class="text-[16px] font-black text-blue-500 font-mono tracking-tighter text-right">${pants}</div>
            </div>
        `;

        html += `</div>`;
        resultsContent.innerHTML = html;
        resultsActions.classList.remove('hidden'); resultsActions.classList.add('flex');
    }

    // --- HIỂN THỊ LỖI / RESET ---
    const showNotFound = (size) => {
        resultsContent.innerHTML = `<div class="text-zinc-500 text-center py-10 text-[13px] font-medium">Không thể tính toán dữ liệu quy đổi cho size <b class="text-red-500">${size}</b>.</div>`;
        resultsActions.classList.add('hidden'); resultsActions.classList.remove('flex');
        currentResultData = null;
    };

    const resetResults = () => {
        resultsContent.innerHTML = `
            <div class="text-zinc-400 flex flex-col items-center gap-3 opacity-30 mt-10">
                <i class="fas fa-ruler-combined text-5xl"></i>
                <span class="text-xs font-bold uppercase tracking-wider text-center">Nhập dữ liệu<br>để xem kết quả</span>
            </div>
        `;
        resultsActions.classList.add('hidden'); resultsActions.classList.remove('flex');
        currentResultData = null;
    };

    const displayResults = (resultRow, standards, isApproximate) => {
        currentResultData = { manual: true, standards, resultRow };
        
        let text = [];
        let html = '<div class="space-y-2">';
        
        if (isApproximate) {
            html += `
            <div class="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-3 mb-4">
                <div class="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1"><i class="fas fa-magic"></i> Size tương đối</div>
                <div class="text-[12px] text-orange-700 dark:text-orange-300 font-medium leading-relaxed">Size bạn nhập không có trong bảng chuẩn cứng. Đã tự động nội suy số liệu gần đúng.</div>
            </div>`;
        }

        const grouped = {};
        resultRow.forEach((val, i) => {
            if (val == null || String(val).trim() === '') return;
            const strVal = String(val);
            if (!grouped[strVal]) grouped[strVal] = [];
            grouped[strVal].push(standards[i]);
            text.push(`${standards[i]}: ${strVal}`);
        });
        currentResultText = text.join('\n');

        Object.entries(grouped).forEach(([val, stds]) => {
            const stdNames = stds.join(' / ');
            const stdSub = stds.map(s => sysDesc[s] || s).join(', ');
            html += `
                <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-zinc-900 dark:text-white">${stdNames}</span>
                        <span class="text-[10px] text-zinc-500 font-medium mt-0.5">${stdSub}</span>
                    </div>
                    <div class="text-2xl font-black text-blue-500 font-mono tracking-tighter">${val}</div>
                </div>
            `;
        });
        html += `</div>`;

        resultsContent.innerHTML = html;
        resultsActions.classList.remove('hidden'); resultsActions.classList.add('flex');
    };

    // --- LOGIC RIGHT TABS & SAVE ---
    rightTabs.forEach(tab => {
        tab.onclick = () => {
            rightTabs.forEach(t => {
                t.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
                t.classList.add('text-zinc-400', 'border-transparent');
            });
            tab.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
            tab.classList.remove('text-zinc-400', 'border-transparent');
            
            const target = tab.dataset.target;
            document.querySelectorAll('.right-pane').forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            document.getElementById(target).classList.remove('hidden'); document.getElementById(target).classList.add('block');
            
            if (target === 'pane-saved') renderSavedItems();
        };
    });

    const getSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const setSaved = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    document.getElementById('btn-copy-res').onclick = async () => {
        if (!currentResultData) return;
        try { 
            await navigator.clipboard.writeText(currentResultText); 
            UI.showAlert('Đã chép', 'Kết quả đã được sao chép.', 'success', 1000); 
        } catch (e) { 
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ chép dữ liệu.', 'error'); 
        }
    };

    document.getElementById('btn-save-res').onclick = () => {
        if (!currentResultData) return;
        
        let defName = '';
        if (currentResultData.suggest) {
            defName = `Gợi ý (${currentResultData.height}cm - ${currentResultData.weight}kg)`;
        } else {
            defName = `${selectedType} (${selectedSystem} ${selectedSize})`;
        }
        
        showDialog({
            type: 'prompt',
            title: 'Lưu Kích Cỡ',
            message: 'Đặt tên gợi nhớ để dễ dàng xem lại sau.',
            defaultValue: defName,
            okText: 'Lưu lại',
            onConfirm: (name) => {
                if (!name || name.trim() === '') return UI.showAlert('Lỗi', 'Vui lòng nhập tên.', 'warning');

                let dataToSave = [];
                if (currentResultData.suggest) {
                    dataToSave = [
                        { std: 'Giày', val: currentResultData.shoe },
                        { std: 'Áo', val: currentResultData.shirt },
                        { std: 'Quần', val: currentResultData.pants }
                    ];
                } else {
                    dataToSave = currentResultData.resultRow.map((val, i) => {
                        if (val == null || String(val).trim() === '') return null;
                        return { std: currentResultData.standards[i], val: val };
                    }).filter(Boolean);
                }

                const savedData = getSaved();
                savedData.push({ id: Date.now(), name: name.trim(), type: currentResultData.suggest ? 'Gợi ý' : selectedType, items: dataToSave });
                setSaved(savedData);
                
                UI.showAlert('Đã lưu', 'Kích cỡ đã được lưu thành công.', 'success', 1000);
                rightTabs[1].click(); 
            }
        });
    };

    const renderSavedItems = () => {
        const savedData = getSaved();
        if (savedData.length === 0) {
            savedContent.innerHTML = '<div class="text-zinc-500 text-center py-10 text-[12px] font-medium opacity-50">Chưa có thông số nào được lưu.</div>';
            return;
        }

        let html = '<div class="space-y-3">';
        savedData.reverse().forEach(entry => {
            const tags = entry.items.map(item => `<span class="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-300 font-medium whitespace-nowrap"><strong class="text-zinc-900 dark:text-white">${item.std}:</strong> ${item.val}</span>`).join('');
            
            let icon = 'fa-bookmark';
            if (entry.type === 'Giày Dép') icon = 'fa-shoe-prints';
            else if (entry.type === 'Áo') icon = 'fa-tshirt';
            else if (entry.type === 'Quần') icon = 'fa-user-tie';
            else if (entry.type === 'Nhẫn') icon = 'fa-ring';
            else if (entry.type === 'Gợi ý') icon = 'fa-magic';

            html += `
                <div class="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col">
                    <div class="flex justify-between items-center mb-3">
                        <div class="font-bold text-sm text-zinc-900 dark:text-white truncate flex items-center gap-2">
                            <i class="fas ${icon} text-blue-500 w-4 text-center"></i> ${escapeHTML(entry.name)}
                        </div>
                        <div class="flex gap-1.5">
                            <button class="flat-btn w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 active:text-zinc-900 dark:active:text-white flex items-center justify-center btn-copy-saved" data-id="${entry.id}"><i class="far fa-copy text-[11px]"></i></button>
                            <button class="flat-btn w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 active:bg-red-100 dark:active:bg-red-500/20 flex items-center justify-center btn-del-saved" data-id="${entry.id}"><i class="fas fa-trash-alt text-[11px]"></i></button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2">${tags}</div>
                </div>
            `;
        });
        html += '</div>';
        savedContent.innerHTML = html;

        savedContent.querySelectorAll('.btn-del-saved').forEach(btn => {
            btn.onclick = () => {
                showDialog({
                    type: 'confirm',
                    title: 'Xóa mục này?',
                    message: 'Dữ liệu size đã lưu sẽ bị xóa vĩnh viễn.',
                    okText: 'Xóa',
                    onConfirm: () => {
                        const idToDel = parseInt(btn.dataset.id);
                        setSaved(getSaved().filter(item => item.id !== idToDel));
                        renderSavedItems();
                    }
                });
            };
        });

        savedContent.querySelectorAll('.btn-copy-saved').forEach(btn => {
            btn.onclick = async () => {
                const item = getSaved().find(i => i.id === parseInt(btn.dataset.id));
                if (item) {
                    const txt = `${item.name}\n` + item.items.map(i => `${i.std}: ${i.val}`).join('\n');
                    try { await navigator.clipboard.writeText(txt); UI.showAlert('Đã chép', 'Đã chép thông số.', 'success', 1000); } catch (e) {}
                }
            };
        });
    };

    document.getElementById('btn-clear-all').onclick = () => {
        document.querySelectorAll('#product-tabs button').forEach(b => {
            b.className = 'flat-btn flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#09090b] transition-colors whitespace-nowrap';
        });
        
        isSuggestMode = false;
        selectedType = null; selectedSystem = null; selectedSize = null;
        sgGenderBtns[0].click(); sgHeight.value = ''; sgWeight.value = '';

        manualSteps.classList.remove('hidden');
        autoSuggestSteps.classList.add('hidden');

        stepSystem.classList.add('opacity-50', 'pointer-events-none');
        systemContainer.innerHTML = '<div class="text-[12px] font-medium text-zinc-400">Vui lòng chọn công cụ trước.</div>';
        
        stepSize.classList.add('opacity-50', 'pointer-events-none');
        sizeContainer.innerHTML = ''; customSizeInput.value = '';
        
        resetResults(); rightTabs[0].click();
    };

    // Khởi chạy
    renderProductTabs();
}