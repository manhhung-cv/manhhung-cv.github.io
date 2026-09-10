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
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="size-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #size-root-container {
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

            .size-input-zen {
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
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Utility</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Đổi Cỡ Quần Áo & Giày</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Quy đổi chuẩn quốc tế đa hệ và trợ lý gợi ý số đo thông minh theo thể trạng.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-clear-all" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-arrows-rotate text-accent-theme text-xs"></i> Đặt lại
                    </button>
                </div>
            </div>

            <!-- TAB LỰA CHỌN PHÂN LOẠI SẢN PHẨM -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1.5 p-1" id="product-tabs"></div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- BẢNG ĐIỀU KHIỂN & NHẬP LIỆU -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-5">
                        
                        <!-- 1. MANUAL CONVERT PIPELINE -->
                        <div id="manual-steps" class="space-y-5 block">
                            <!-- CHỌN CHUẨN KÍCH CỠ -->
                            <div id="step-system" class="opacity-50 pointer-events-none transition-opacity duration-200 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">1. Chuẩn kích cỡ ban đầu</span>
                                    <span class="text-[10px] text-zinc-400 font-mono">Standard Type</span>
                                </div>
                                <div class="flex flex-wrap gap-1.5" id="system-container">
                                    <div class="text-xs font-medium text-zinc-400 py-1">Vui lòng chọn danh mục phía trên.</div>
                                </div>
                            </div>

                            <div class="h-px bg-black/[0.05] dark:border-white/[0.08] w-full"></div>

                            <!-- CHỌN HOẶC NHẬP SIZE -->
                            <div id="step-size" class="opacity-50 pointer-events-none transition-opacity duration-200 space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">2. Chọn hoặc gõ size cụ thể</span>
                                    <span class="text-[10px] text-zinc-400 font-mono">Size Matrix</span>
                                </div>
                                <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2" id="size-container"></div>
                                <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                    <i class="fas fa-keyboard text-zinc-400 text-xs mr-2.5"></i>
                                    <input type="text" id="custom-size-input" class="size-input-zen w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Hoặc nhập size lẻ (VD: 39.5, 41 1/3)...">
                                </div>
                            </div>
                        </div>

                        <!-- 2. AUTO SUGGEST PIPELINE -->
                        <div id="auto-suggest-steps" class="hidden space-y-4">
                            <div class="space-y-1.5">
                                <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Giới tính</span>
                                <div class="grid grid-cols-2 gap-2" id="sg-gender">
                                    <button class="sg-gender-btn active h-11 rounded-[14px] bg-accent-theme text-white text-xs font-bold transition-all shadow-sm" data-val="nam">Nam giới</button>
                                    <button class="sg-gender-btn h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all" data-val="nu">Nữ giới</button>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Chiều cao (cm)</label>
                                    <input type="number" id="sg-height" class="size-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="VD: 172">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Cân nặng (kg)</label>
                                    <input type="number" id="sg-weight" class="size-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="VD: 65">
                                </div>
                            </div>

                            <div class="rounded-[18px] bg-accent-theme-alpha border border-accent-theme/20 p-4 space-y-1">
                                <span class="text-xs font-bold text-accent-theme flex items-center gap-1.5">
                                    <i class="fas fa-wand-magic-sparkles text-xs"></i> Cơ chế gợi ý thông minh
                                </span>
                                <p class="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                                    Hệ thống tự động tính chỉ số thể trọng BMI kết hợp phom dáng người Á Đông để dự đoán chuẩn xác kích cỡ áo, quần và size giày tương ứng.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- BẢNG KẾT QUẢ VÀ DANH MỤC ĐÃ LƯU -->
                <div class="lg:col-span-5 flex flex-col h-full lg:sticky lg:top-6">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col h-[520px] justify-between space-y-3">
                        
                        <!-- TOP SEGMENTED RESULT TABS -->
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                            <div class="grid grid-cols-2 gap-1 p-1 rounded-[12px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-56" id="right-tabs">
                                <button class="right-tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-1.5" data-target="pane-results">
                                    <i class="fas fa-list-ol text-[11px]"></i> Kết quả
                                </button>
                                <button class="right-tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5" data-target="pane-saved">
                                    <i class="fas fa-bookmark text-[11px]"></i> Đã lưu
                                </button>
                            </div>
                            <span class="text-[10px] text-zinc-400 font-mono" id="right-badge">Real-time</span>
                        </div>

                        <!-- 1. PANE RESULTS -->
                        <div id="pane-results" class="right-pane block flex-1 overflow-hidden flex flex-col">
                            <div id="results-content" class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                                <div class="text-zinc-400 flex flex-col items-center justify-center text-center opacity-50 py-16" id="empty-result">
                                    <div class="w-14 h-14 rounded-[20px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-2xl mb-3 shadow-sm">
                                        <i class="fas fa-ruler-combined"></i>
                                    </div>
                                    <span class="text-xs font-semibold">Chưa có thông số quy đổi</span>
                                    <span class="text-[10px] text-zinc-400 mt-0.5">Chọn danh mục hoặc nhập số đo để xem</span>
                                </div>
                            </div>

                            <div id="results-actions" class="hidden gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                                <button id="btn-copy-res" class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                    <i class="far fa-copy text-xs"></i> <span>Sao chép</span>
                                </button>
                                <button id="btn-save-res" class="flex-1 h-10 rounded-[12px] bg-accent-theme text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                    <i class="fas fa-floppy-disk text-xs"></i> <span>Lưu kích cỡ</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. PANE SAVED -->
                        <div id="pane-saved" class="right-pane hidden flex-1 overflow-hidden flex flex-col">
                            <div id="saved-content" class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5"></div>
                        </div>

                        <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Bảng quy đổi tiêu chuẩn quốc tế</span>
                            <span class="font-mono text-[10px]">Matrix Ready</span>
                        </div>
                    </div>
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
    const rootContainer = hostElement.querySelector('#size-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Dữ liệu bảng quy đổi chuẩn quốc tế
    const sysDesc = { 
        "EU": "Châu Âu", "US (Nam)": "Mỹ (Nam)", "US (Nữ)": "Mỹ (Nữ)", "US (Trẻ em)": "Mỹ (Trẻ em)", 
        "UK": "Anh Quốc", "cm": "Chiều dài (cm)", "VN": "Việt Nam", "JP": "Nhật Bản", "KR (mm)": "Hàn Quốc", 
        "Quốc tế": "Size Chữ (S, M, L)", "US (Nam/Waist)": "Quần Nam US (inch)", "US (Nữ/Jean)": "Jean Nữ US", 
        "Nike (US)": "Nike US", "Adidas (US)": "Adidas US", "Converse (US)": "Converse US", "MLB (KR)": "MLB Hàn", 
        "EU (Nam)": "Âu (Nam)", "EU (Nữ)": "Âu (Nữ)", "Đường kính (mm)": "Đường kính lòng trong", 
        "Chu vi (mm)": "Chu vi ngón tay", "VN/China/Japan": "Châu Á", "US/Canada": "Mỹ/Canada", "UK/Australia": "Anh/Úc"
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
            icon: "fa-shirt",
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

    // Query Elements
    const productTabs = hostElement.querySelector('#product-tabs');
    const systemContainer = hostElement.querySelector('#system-container');
    const sizeContainer = hostElement.querySelector('#size-container');
    const customSizeInput = hostElement.querySelector('#custom-size-input');
    
    const manualSteps = hostElement.querySelector('#manual-steps');
    const autoSuggestSteps = hostElement.querySelector('#auto-suggest-steps');
    const stepSystem = hostElement.querySelector('#step-system');
    const stepSize = hostElement.querySelector('#step-size');
    
    const sgGenderBtns = hostElement.querySelectorAll('.sg-gender-btn');
    const sgHeight = hostElement.querySelector('#sg-height');
    const sgWeight = hostElement.querySelector('#sg-weight');

    const resultsContent = hostElement.querySelector('#results-content');
    const resultsActions = hostElement.querySelector('#results-actions');
    const savedContent = hostElement.querySelector('#saved-content');
    
    const rightTabs = hostElement.querySelectorAll('#right-tabs .right-tab-btn');
    const paneResults = hostElement.querySelector('#pane-results');
    const paneSaved = hostElement.querySelector('#pane-saved');
    const btnClearAll = hostElement.querySelector('#btn-clear-all');

    let selectedType = null;
    let selectedSystem = null;
    let selectedSize = null;
    
    let isSuggestMode = false;
    let suggestGender = 'nam';
    let currentResultData = null;
    let currentResultText = '';

    const STORAGE_KEY = 'aio_size_converter_v3';

    // Helper Escape
    const escapeHTML = (str) => String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));

    // Render Product Tabs
    const renderProductTabs = () => {
        productTabs.innerHTML = '';

        // Nút AI Gợi ý
        const btnSuggest = document.createElement('button');
        btnSuggest.className = 'h-9 px-3.5 rounded-[12px] text-xs font-bold text-accent-theme bg-accent-theme-alpha flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-sm';
        btnSuggest.innerHTML = `<i class="fas fa-wand-magic-sparkles text-xs"></i> <span>Trợ lý AI</span>`;
        btnSuggest.onclick = () => {
            productTabs.querySelectorAll('button').forEach(b => {
                b.className = 'h-9 px-3.5 rounded-[12px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all';
            });
            btnSuggest.className = 'h-9 px-3.5 rounded-[12px] text-xs font-bold text-white bg-accent-theme flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-sm';

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
            btn.className = 'h-9 px-3.5 rounded-[12px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all';
            btn.innerHTML = `<i class="fas ${sizeData[type].icon} text-xs"></i> <span>${type}</span>`;
            
            btn.onclick = () => {
                productTabs.querySelectorAll('button').forEach(b => {
                    b.className = 'h-9 px-3.5 rounded-[12px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all';
                });
                btnSuggest.className = 'h-9 px-3.5 rounded-[12px] text-xs font-bold text-accent-theme bg-accent-theme-alpha flex items-center gap-1.5 shrink-0 active:scale-95 transition-all';
                btn.className = 'h-9 px-3.5 rounded-[12px] text-xs font-bold text-white bg-accent-theme flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-sm';

                isSuggestMode = false;
                manualSteps.classList.remove('hidden');
                autoSuggestSteps.classList.add('hidden');

                selectedType = type;
                selectedSystem = null; 
                selectedSize = null;
                
                stepSystem.classList.remove('opacity-50', 'pointer-events-none');
                stepSize.classList.add('opacity-50', 'pointer-events-none');
                customSizeInput.value = '';
                
                renderSystems(); 
                resetResults();
            };
            productTabs.appendChild(btn);
        });
    };

    // Manual Pipeline Handlers
    const renderSystems = () => {
        systemContainer.innerHTML = '';
        if (!selectedType) return;
        const dataSet = sizeData[selectedType].default;
        const grouped = {}; 
        const valueMap = {};
        
        dataSet.standards.forEach((std, i) => {
            const colData = dataSet.data.map(row => row[i]).join('|');
            if (!grouped[colData]) grouped[colData] = [];
            grouped[colData].push(std);
        });

        Object.values(grouped).forEach(group => {
            const displayName = group.join(' / ');
            valueMap[displayName] = group[0]; 
            
            const chip = document.createElement('button');
            chip.className = 'h-8 px-3 rounded-[10px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] active:scale-95 transition-all';
            chip.textContent = displayName;
            chip.title = group.map(s => sysDesc[s] || s).join(' | ');
            
            chip.onclick = () => {
                systemContainer.querySelectorAll('button').forEach(c => {
                    c.className = 'h-8 px-3 rounded-[10px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] active:scale-95 transition-all';
                });
                chip.className = 'h-8 px-3 rounded-[10px] text-xs font-bold text-white bg-accent-theme shadow-sm active:scale-95 transition-all';
                
                selectedSystem = valueMap[displayName];
                stepSize.classList.remove('opacity-50', 'pointer-events-none');
                customSizeInput.value = '';
                renderSizes(); 
                resetResults();
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
            btn.className = 'h-10 rounded-[12px] text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] active:scale-95 transition-all';
            btn.textContent = sizeVal;
            
            btn.onclick = () => {
                sizeContainer.querySelectorAll('button').forEach(b => {
                    b.className = 'h-10 rounded-[12px] text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] active:scale-95 transition-all';
                });
                btn.className = 'h-10 rounded-[12px] text-xs font-mono font-bold text-white bg-accent-theme shadow-sm active:scale-95 transition-all';
                
                customSizeInput.value = ''; 
                selectedSize = sizeVal;
                processConversion(selectedSize);
            };
            sizeContainer.appendChild(btn);
        });
    };

    customSizeInput?.addEventListener('input', (e) => {
        sizeContainer.querySelectorAll('button').forEach(b => {
            b.className = 'h-10 rounded-[12px] text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] active:scale-95 transition-all';
        });
        selectedSize = e.target.value.trim();
        processConversion(selectedSize);
    });

    const parseNum = (str) => {
        if (!str) return NaN;
        const s = String(str).trim();
        if (s.includes('-')) { 
            const p = s.split('-').map(x => parseFloat(x)); 
            return (p[0] + p[1]) / 2; 
        }
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

        const numData = dataSet.data.map(row => ({ 
            original: row, 
            parsed: row.map(val => parseNum(val)) 
        })).filter(item => !isNaN(item.parsed[sysIndex]));
        
        if (numData.length < 2) return showNotFound(sizeStr);

        numData.sort((a, b) => a.parsed[sysIndex] - b.parsed[sysIndex]);

        let p1, p2;
        if (inputNum <= numData[0].parsed[sysIndex]) { 
            p1 = numData[0]; p2 = numData[1]; 
        } 
        else if (inputNum >= numData[numData.length - 1].parsed[sysIndex]) { 
            p1 = numData[numData.length - 2]; p2 = numData[numData.length - 1]; 
        } 
        else {
            for (let i = 0; i < numData.length - 1; i++) {
                if (inputNum >= numData[i].parsed[sysIndex] && inputNum <= numData[i + 1].parsed[sysIndex]) { 
                    p1 = numData[i]; p2 = numData[i + 1]; break; 
                }
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

    // Auto Suggest Handlers
    sgGenderBtns.forEach(btn => {
        btn.onclick = () => {
            sgGenderBtns.forEach(b => {
                b.className = 'sg-gender-btn h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all';
            });
            btn.className = 'sg-gender-btn active h-11 rounded-[14px] bg-accent-theme text-white text-xs font-bold transition-all shadow-sm';
            suggestGender = btn.dataset.val;
            calculateSuggest();
        };
    });

    [sgHeight, sgWeight].forEach(input => {
        input?.addEventListener('input', calculateSuggest);
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
            if (h < 160) shoe = 38;
            else if (h < 165) shoe = 39;
            else if (h < 170) shoe = 40;
            else if (h < 175) shoe = 41;
            else if (h < 180) shoe = 42;
            else if (h < 185) shoe = 43;
            else shoe = 44;
            if (bmi > 24.5) shoe += 1;

            let shirtH = 0, shirtW = 0;
            if (h < 160) shirtH = 0; else if (h < 167) shirtH = 1; else if (h < 174) shirtH = 2; else if (h < 180) shirtH = 3; else shirtH = 4;
            if (w < 55) shirtW = 0; else if (w < 62) shirtW = 1; else if (w < 70) shirtW = 2; else if (w < 79) shirtW = 3; else shirtW = 4;
            const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            shirt = shirtSizes[Math.max(shirtH, shirtW)];

            if (w < 55) pants = 'Size 28 (S)';
            else if (w < 60) pants = 'Size 29 (M)';
            else if (w < 65) pants = 'Size 30 (L)';
            else if (w < 70) pants = 'Size 31 (L)';
            else if (w < 75) pants = 'Size 32 (XL)';
            else if (w < 80) pants = 'Size 33 (XL)';
            else pants = 'Size 34 (XXL)';
        } else {
            if (h < 150) shoe = 35;
            else if (h < 155) shoe = 36;
            else if (h < 160) shoe = 37;
            else if (h < 165) shoe = 38;
            else if (h < 170) shoe = 39;
            else shoe = 40;
            if (bmi > 24) shoe += 1;

            let shirtH = 0, shirtW = 0;
            if (h < 150) shirtH = 0; else if (h < 155) shirtH = 1; else if (h < 160) shirtH = 2; else if (h < 165) shirtH = 3; else shirtH = 4;
            if (w < 45) shirtW = 0; else if (w < 49) shirtW = 1; else if (w < 54) shirtW = 2; else if (w < 60) shirtW = 3; else shirtW = 4;
            const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            shirt = shirtSizes[Math.max(shirtH, shirtW)];

            if (w < 45) pants = 'Size S (Jean 26)';
            else if (w < 50) pants = 'Size M (Jean 27)';
            else if (w < 55) pants = 'Size L (Jean 28)';
            else if (w < 60) pants = 'Size XL (Jean 29)';
            else pants = 'Size XXL (Jean 30)';
        }

        currentResultData = { suggest: true, shoe, shirt, pants, height: h, weight: w, gender: suggestGender };
        currentResultText = `Gợi ý Size (H:${h}cm, W:${w}kg, ${suggestGender.toUpperCase()}):\n- Giày: ${shoe} (EU)\n- Áo: ${shirt}\n- Quần: ${pants}`;
        
        let html = `
            <div class="space-y-2.5">
                <div class="bg-accent-theme-alpha border border-accent-theme/20 rounded-[16px] p-3 flex items-center justify-between">
                    <div>
                        <span class="text-[9px] font-bold text-accent-theme uppercase tracking-wider block">Thể trạng: ${suggestGender.toUpperCase()}</span>
                        <span class="text-xs font-bold text-zinc-900 dark:text-white">${h} cm - ${w} kg</span>
                    </div>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[8px] bg-white dark:bg-[#27272a] text-accent-theme shadow-sm border border-black/[0.04] dark:border-white/[0.06]">
                        BMI: ${bmi.toFixed(1)}
                    </span>
                </div>

                <div class="flex justify-between items-center p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <i class="fas fa-shoe-prints text-accent-theme text-xs"></i> Size Giày
                        </span>
                        <span class="text-[10px] text-zinc-400 font-medium">Tiêu chuẩn Châu Âu (EU)</span>
                    </div>
                    <span class="text-2xl font-black text-accent-theme font-mono">${shoe}</span>
                </div>

                <div class="flex justify-between items-center p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <i class="fas fa-shirt text-accent-theme text-xs"></i> Size Áo
                        </span>
                        <span class="text-[10px] text-zinc-400 font-medium">Chuẩn Quốc tế (Thun, Sơ mi)</span>
                    </div>
                    <span class="text-2xl font-black text-accent-theme font-mono">${shirt}</span>
                </div>

                <div class="flex justify-between items-center p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <i class="fas fa-user-tie text-accent-theme text-xs"></i> Size Quần
                        </span>
                        <span class="text-[10px] text-zinc-400 font-medium">Tham khảo Jean & Quần âu</span>
                    </div>
                    <span class="text-sm sm:text-base font-black text-accent-theme font-mono">${pants}</span>
                </div>
            </div>
        `;
        resultsContent.innerHTML = html;
        resultsActions.classList.remove('hidden'); 
        resultsActions.classList.add('flex');
    }

    const showNotFound = (size) => {
        resultsContent.innerHTML = `<div class="text-zinc-400 text-center py-16 text-xs font-medium">Không thể tính toán dữ liệu quy đổi cho kích cỡ <b class="text-rose-500">${size}</b>.</div>`;
        resultsActions.classList.add('hidden'); 
        resultsActions.classList.remove('flex');
        currentResultData = null;
    };

    const resetResults = () => {
        resultsContent.innerHTML = `
            <div class="text-zinc-400 flex flex-col items-center justify-center text-center opacity-50 py-16" id="empty-result">
                <div class="w-14 h-14 rounded-[20px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-2xl mb-3 shadow-sm">
                    <i class="fas fa-ruler-combined"></i>
                </div>
                <span class="text-xs font-semibold">Chưa có thông số quy đổi</span>
                <span class="text-[10px] text-zinc-400 mt-0.5">Chọn danh mục hoặc nhập số đo để xem</span>
            </div>
        `;
        resultsActions.classList.add('hidden'); 
        resultsActions.classList.remove('flex');
        currentResultData = null;
    };

    const displayResults = (resultRow, standards, isApproximate) => {
        currentResultData = { manual: true, standards, resultRow };
        
        let text = [];
        let html = '<div class="space-y-2">';
        
        if (isApproximate) {
            html += `
            <div class="bg-amber-500/10 border border-amber-500/20 rounded-[14px] p-2.5 mb-2">
                <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Kích cỡ gần đúng</span>
                <span class="text-[11px] text-zinc-700 dark:text-zinc-300 font-normal">Size nhập vào không có trong mốc cố định. Hệ thống đã nội suy xấp xỉ.</span>
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
                <div class="flex justify-between items-center p-3.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                    <div class="flex flex-col min-w-0 pr-2">
                        <span class="text-xs font-bold text-zinc-900 dark:text-white truncate">${stdNames}</span>
                        <span class="text-[10px] text-zinc-400 font-medium truncate mt-0.5">${stdSub}</span>
                    </div>
                    <span class="text-xl font-black text-accent-theme font-mono shrink-0">${val}</span>
                </div>
            `;
        });
        html += `</div>`;

        resultsContent.innerHTML = html;
        resultsActions.classList.remove('hidden'); 
        resultsActions.classList.add('flex');
    };

    // Right Tabs (Result vs Saved)
    const activeRightTab = 'right-tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-1.5';
    const inactiveRightTab = 'right-tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5';

    rightTabs.forEach(tab => {
        tab.onclick = () => {
            rightTabs.forEach(t => { t.className = inactiveRightTab; });
            tab.className = activeRightTab;
            
            const target = tab.dataset.target;
            hostElement.querySelectorAll('.right-pane').forEach(p => { 
                p.classList.remove('block'); 
                p.classList.add('hidden'); 
            });
            hostElement.querySelector(`#${target}`).classList.remove('hidden'); 
            hostElement.querySelector(`#${target}`).classList.add('block');
            
            if (target === 'pane-saved') renderSavedItems();
        };
    });

    const getSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const setSaved = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    hostElement.querySelector('#btn-copy-res').onclick = async () => {
        if (!currentResultData) return;
        try { 
            await navigator.clipboard.writeText(currentResultText); 
            IslandKit.notify('Đã sao chép', 'Các thông số kích cỡ đã lưu vào clipboard.', 'success'); 
        } catch (e) { 
            IslandKit.notify('Lỗi', 'Không thể sao chép dữ liệu.', 'error'); 
        }
    };

    hostElement.querySelector('#btn-save-res').onclick = () => {
        if (!currentResultData) return;
        
        let defName = '';
        if (currentResultData.suggest) {
            defName = `Gợi ý (${currentResultData.height}cm - ${currentResultData.weight}kg)`;
        } else {
            defName = `${selectedType} (${selectedSystem} ${selectedSize})`;
        }
        
        const name = prompt('Đặt tên gợi nhớ để lưu kích cỡ:', defName);
        if (!name || name.trim() === '') return;

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
        savedData.push({ 
            id: Date.now(), 
            name: name.trim(), 
            type: currentResultData.suggest ? 'Gợi ý' : selectedType, 
            items: dataToSave 
        });
        setSaved(savedData);
        
        IslandKit.notify('Đã lưu', `Đã lưu thông số "${name.trim()}".`, 'success');
        rightTabs[1].click(); 
    };

    const renderSavedItems = () => {
        const savedData = getSaved();
        if (savedData.length === 0) {
            savedContent.innerHTML = '<div class="text-zinc-400 text-center py-16 text-xs font-medium">Chưa có thông số kích cỡ nào được lưu.</div>';
            return;
        }

        let html = '<div class="space-y-2.5">';
        savedData.slice().reverse().forEach(entry => {
            const tags = entry.items.map(item => `
                <span class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] px-2 py-0.5 rounded-[8px] text-[10px] text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                    <strong class="text-zinc-900 dark:text-white font-bold">${item.std}:</strong> ${item.val}
                </span>`).join('');
            
            let icon = 'fa-bookmark';
            if (entry.type === 'Giày Dép') icon = 'fa-shoe-prints';
            else if (entry.type === 'Áo') icon = 'fa-shirt';
            else if (entry.type === 'Quần') icon = 'fa-user-tie';
            else if (entry.type === 'Nhẫn') icon = 'fa-ring';
            else if (entry.type === 'Gợi ý') icon = 'fa-wand-magic-sparkles';

            html += `
                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 flex flex-col space-y-2">
                    <div class="flex justify-between items-center">
                        <div class="font-bold text-xs text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                            <i class="fas ${icon} text-accent-theme text-xs"></i> 
                            <span class="truncate">${escapeHTML(entry.name)}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button class="w-7 h-7 rounded-[8px] bg-white dark:bg-[#27272a] text-zinc-500 hover:text-accent-theme flex items-center justify-center text-xs btn-copy-saved active:scale-90 transition-all shadow-sm" data-id="${entry.id}">
                                <i class="far fa-copy text-[10px]"></i>
                            </button>
                            <button class="w-7 h-7 rounded-[8px] bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center text-xs btn-del-saved active:scale-90 transition-all" data-id="${entry.id}">
                                <i class="far fa-trash-can text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1.5">${tags}</div>
                </div>
            `;
        });
        html += '</div>';
        savedContent.innerHTML = html;

        savedContent.querySelectorAll('.btn-del-saved').forEach(btn => {
            btn.onclick = () => {
                UI.showConfirm('Xác nhận xóa?', 'Thông số kích cỡ này sẽ bị gỡ vĩnh viễn khỏi thiết bị.', () => {
                    const idToDel = parseInt(btn.dataset.id);
                    setSaved(getSaved().filter(item => item.id !== idToDel));
                    renderSavedItems();
                    IslandKit.notify('Đã xóa', 'Đã gỡ mục khỏi danh sách lưu.', 'info');
                });
            };
        });

        savedContent.querySelectorAll('.btn-copy-saved').forEach(btn => {
            btn.onclick = async () => {
                const item = getSaved().find(i => i.id === parseInt(btn.dataset.id));
                if (item) {
                    const txt = `${item.name}\n` + item.items.map(i => `${i.std}: ${i.val}`).join('\n');
                    try { 
                        await navigator.clipboard.writeText(txt); 
                        IslandKit.notify('Đã sao chép', `Đã sao chép "${item.name}".`, 'success'); 
                    } catch (e) {}
                }
            };
        });
    };

    btnClearAll.onclick = () => {
        productTabs.querySelectorAll('button').forEach(b => {
            b.className = 'h-9 px-3.5 rounded-[12px] text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all';
        });
        
        isSuggestMode = false;
        selectedType = null; 
        selectedSystem = null; 
        selectedSize = null;
        sgGenderBtns[0].click(); 
        sgHeight.value = ''; 
        sgWeight.value = '';

        manualSteps.classList.remove('hidden');
        autoSuggestSteps.classList.add('hidden');

        stepSystem.classList.add('opacity-50', 'pointer-events-none');
        systemContainer.innerHTML = '<div class="text-xs font-medium text-zinc-400 py-1">Vui lòng chọn danh mục phía trên.</div>';
        
        stepSize.classList.add('opacity-50', 'pointer-events-none');
        sizeContainer.innerHTML = ''; 
        customSizeInput.value = '';
        
        resetResults(); 
        rightTabs[0].click();
        IslandKit.notify('Đặt lại', 'Đã làm mới toàn bộ trường quy đổi.', 'info');
    };

    // Initialize
    renderProductTabs();
}