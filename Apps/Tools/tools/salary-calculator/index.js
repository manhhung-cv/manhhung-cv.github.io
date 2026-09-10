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
    <div id="salary-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #salary-root-container {
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

            .salary-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .region-content { font-size: 13px; line-height: 1.6; }
            .region-content b { display: block; font-size: 14px; margin-top: 16px; margin-bottom: 4px; color: #18181b; font-weight: 800; }
            .dark .region-content b { color: #ffffff; }
            .region-content .text-primary { font-size: 14px; margin-bottom: 12px; font-weight: 700; color: var(--kit-accent); }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Finance</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Gross/Net Calculator</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tính lương Gross sang Net và ngược lại, tự động trích nộp BHXH, BHYT, BHTN và Thuế TNCN.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-open-regions" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-circle-info text-accent-theme text-xs"></i> Tra cứu Vùng
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- BẢNG THÔNG SỐ NHẬP LIỆU -->
                <div class="lg:col-span-5 space-y-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Thông số tính toán</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Chuẩn 2026</span>
                        </div>

                        <!-- Thu nhập -->
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mức lương thỏa thuận</label>
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3.5 h-12 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                <input type="text" id="salary-input" class="salary-input-zen w-full bg-transparent border-none outline-none text-base sm:text-lg font-black font-mono text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="VD: 25,000,000">
                                <span class="text-xs font-bold text-zinc-400 font-mono ml-2">VNĐ</span>
                            </div>
                        </div>

                        <!-- Mức lương đóng bảo hiểm -->
                        <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mức lương đóng bảo hiểm</label>
                            
                            <div class="space-y-2">
                                <label class="flex items-center gap-2.5 cursor-pointer">
                                    <input type="radio" name="ins-type" value="official" class="accent-theme-tint w-4 h-4 cursor-pointer" checked>
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Trên mức lương chính thức</span>
                                </label>
                                <label class="flex items-center gap-2.5 cursor-pointer">
                                    <input type="radio" name="ins-type" value="custom" class="accent-theme-tint w-4 h-4 cursor-pointer">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Nhập mức tùy chọn</span>
                                </label>
                            </div>

                            <div id="custom-ins-wrapper" class="hidden pt-1">
                                <div class="flex items-center bg-white dark:bg-[#27272a] rounded-[12px] px-3 h-10 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                    <input type="text" id="custom-ins-input" class="salary-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Mức đóng BH tùy chọn...">
                                    <span class="text-[10px] font-bold text-zinc-400 font-mono ml-1.5">VNĐ</span>
                                </div>
                            </div>
                        </div>

                        <!-- Người phụ thuộc -->
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Số người phụ thuộc</label>
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                <input type="number" id="dependents-input" class="salary-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-white" min="0" value="0">
                                <span class="text-xs font-bold text-zinc-400 ml-2">Người</span>
                            </div>
                        </div>

                        <!-- Vùng -->
                        <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Khu vực áp dụng lương tối thiểu</label>
                            <div class="grid grid-cols-2 gap-2 pt-0.5">
                                <label class="flex items-center gap-2 p-2 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer">
                                    <input type="radio" name="region" value="1" class="accent-theme-tint cursor-pointer" checked>
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Vùng I</span>
                                </label>
                                <label class="flex items-center gap-2 p-2 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer">
                                    <input type="radio" name="region" value="2" class="accent-theme-tint cursor-pointer">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Vùng II</span>
                                </label>
                                <label class="flex items-center gap-2 p-2 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer">
                                    <input type="radio" name="region" value="3" class="accent-theme-tint cursor-pointer">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Vùng III</span>
                                </label>
                                <label class="flex items-center gap-2 p-2 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer">
                                    <input type="radio" name="region" value="4" class="accent-theme-tint cursor-pointer">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Vùng IV</span>
                                </label>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-2.5 pt-1">
                            <button id="btn-calc-net" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                Gross <i class="fas fa-arrow-right text-[10px]"></i> Net
                            </button>
                            <button id="btn-calc-gross" class="flex-1 h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                Net <i class="fas fa-arrow-right text-[10px]"></i> Gross
                            </button>
                        </div>
                    </div>
                </div>

                <!-- BẢNG KẾT QUẢ VÀ DIỄN GIẢI -->
                <div class="lg:col-span-7 space-y-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm min-h-[460px] flex flex-col justify-between space-y-4">
                        
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Chi tiết hạch toán</h3>
                            <span class="text-[10px] text-zinc-400 font-mono" id="res-mode-tag">Tự động tính</span>
                        </div>

                        <!-- Placeholder khi chưa tính -->
                        <div id="result-placeholder" class="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                            <div class="w-14 h-14 rounded-[20px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-2xl mb-3 shadow-sm">
                                <i class="fas fa-money-check-dollar"></i>
                            </div>
                            <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Chưa có kết quả tính toán</span>
                            <p class="text-[11px] text-zinc-400 mt-1">Nhập mức thu nhập và chọn chiều chuyển đổi để hiển thị bảng chi tiết.</p>
                        </div>

                        <!-- Nội dung kết quả -->
                        <div id="result-content" class="hidden flex-1 flex-col space-y-4">
                            <!-- Thẻ so sánh Gross / Net -->
                            <div class="grid grid-cols-2 gap-3 p-4 bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06]">
                                <div>
                                    <div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Lương Gross</div>
                                    <div id="res-gross" class="text-lg sm:text-xl font-black font-mono text-zinc-900 dark:text-white salary-input-zen">0</div>
                                </div>
                                <div class="text-right border-l border-black/[0.05] dark:border-white/[0.08] pl-3">
                                    <div class="text-[9px] font-bold text-accent-theme uppercase tracking-wider mb-0.5">Lương Net Thực Nhận</div>
                                    <div id="res-net" class="text-lg sm:text-xl font-black font-mono text-accent-theme salary-input-zen">0</div>
                                </div>
                            </div>

                            <!-- Bảng phân tích chi tiết -->
                            <div class="w-full overflow-x-auto custom-scrollbar border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                                <table class="w-full text-left border-collapse text-xs">
                                    <tbody class="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-zinc-700 dark:text-zinc-300">
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Bảo hiểm xã hội (BHXH - 8%)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono font-bold text-rose-500 salary-input-zen" id="res-bhxh">- 0</td>
                                        </tr>
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Bảo hiểm y tế (BHYT - 1.5%)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono font-bold text-rose-500 salary-input-zen" id="res-bhyt">- 0</td>
                                        </tr>
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Bảo hiểm thất nghiệp (BHTN - 1%)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono font-bold text-rose-500 salary-input-zen" id="res-bhtn">- 0</td>
                                        </tr>
                                        <tr class="bg-black/[0.02] dark:bg-white/[0.02] font-semibold text-zinc-900 dark:text-white">
                                            <td class="p-3 pl-3.5">Thu nhập trước thuế (TNTT)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono font-bold salary-input-zen" id="res-tntt">0</td>
                                        </tr>
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Giảm trừ gia cảnh (Bản thân)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono text-zinc-500 dark:text-zinc-400 salary-input-zen">- 11,000,000</td>
                                        </tr>
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Giảm trừ người phụ thuộc</td>
                                            <td class="p-3 pr-3.5 text-right font-mono text-zinc-500 dark:text-zinc-400 salary-input-zen" id="res-pt">- 0</td>
                                        </tr>
                                        <tr>
                                            <td class="p-3 pl-3.5 font-medium">Thuế thu nhập cá nhân (TNCN)</td>
                                            <td class="p-3 pr-3.5 text-right font-mono font-bold text-rose-500 salary-input-zen" id="res-tax">- 0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Biểu thuế suất lũy tiến 7 bậc</span>
                            <span class="font-mono text-[10px]">Luật Thuế TNCN</span>
                        </div>

                    </div>
                </div>

            </div>

        </main>

        <!-- MODAL TRA CỨU VÙNG -->
        <div id="modal-regions" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-200 opacity-0">
            <div class="relative w-full max-w-2xl bg-white dark:bg-[#161618] rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] flex flex-col max-h-[82vh] shadow-2xl transform scale-95 transition-transform duration-200">
                <div class="flex items-center justify-between p-5 border-b border-black/[0.05] dark:border-white/[0.08] shrink-0">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-map-location-dot text-accent-theme text-sm"></i>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-white">Tra cứu phân chia Vùng áp dụng (Nghị định 2026)</h3>
                    </div>
                    <button id="btn-close-regions" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-xs active:scale-95 transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-5 overflow-y-auto custom-scrollbar region-content text-zinc-600 dark:text-zinc-400 flex-1 space-y-2">
                    <p class="text-primary">Danh mục địa bàn áp dụng mức lương tối thiểu vùng:</p>
                    <b>1. Thành phố Hà Nội</b>
                    - Vùng I: Gồm các quận nội thành và các huyện Hoài Đức, Gia Lâm, Đông Anh, Thanh Trì, Đan Phượng, Thường Tín, Mê Linh, Sóc Sơn...<br>
                    - Vùng II: Các huyện, thị xã còn lại.<br>
                    <b>2. Thành phố Hồ Chí Minh</b>
                    - Vùng I: TP. Thủ Đức và các quận nội thành, huyện Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè.<br>
                    - Vùng II: Huyện Cần Giờ.<br>
                    <b>3. Thành phố Hải Phòng</b>
                    - Vùng I: Các quận nội thành và các huyện Thủy Nguyên, An Dương, An Lão, Vĩnh Bảo, Tiên Lãng, Kiến Thụy, Cát Hải.<br>
                    - Vùng II: Huyện đảo Bạch Long Vĩ.<br>
                    <b>4. Tỉnh Đồng Nai</b>
                    - Vùng I: TP. Biên Hòa, TP. Long Khánh và các huyện Nhơn Trạch, Long Thành, Vĩnh Cửu, Trảng Bom.<br>
                    - Vùng II: Huyện Định Quán, Xuân Lộc, Thống Nhất.<br>
                    - Vùng III: Huyện Tân Phú, Cẩm Mỹ.<br>
                    <b>5. Tỉnh Bình Dương (nay thuộc phân vùng công nghiệp)</b>
                    - Vùng I: TP. Thủ Dầu Một, Thuận An, Dĩ An, Tân Uyên, Bến Cát và các huyện Bàu Bàng, Bắc Tân Uyên, Dầu Tiếng, Phú Giáo.<br>
                    <b>6. Các tỉnh thành khác</b>
                    - Vui lòng đối chiếu chi tiết theo địa bàn quận/huyện nơi đơn vị sử dụng lao động đăng ký trụ sở hoặc đóng bảo hiểm.
                </div>
            </div>
        </div>

    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#salary-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Cấu hình hằng số (Chuẩn mức đóng bảo hiểm & giảm trừ 2026)
    const BASE_SALARY = 2340000; 
    const REGION_MIN = { 
        1: 4960000, 
        2: 4410000, 
        3: 3860000, 
        4: 3450000 
    };
    const PERSONAL_DEDUCTION = 11000000;
    const DEPENDENT_DEDUCTION = 4400000;

    // Elements
    const salaryInput = hostElement.querySelector('#salary-input');
    const dependentsInput = hostElement.querySelector('#dependents-input');
    const btnNet = hostElement.querySelector('#btn-calc-net');
    const btnGross = hostElement.querySelector('#btn-calc-gross');
    
    const insTypeRadios = hostElement.querySelectorAll('input[name="ins-type"]');
    const customInsWrapper = hostElement.querySelector('#custom-ins-wrapper');
    const customInsInput = hostElement.querySelector('#custom-ins-input');
    const resModeTag = hostElement.querySelector('#res-mode-tag');

    // Tùy chọn đóng bảo hiểm
    insTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInsWrapper.classList.remove('hidden');
                customInsInput.focus();
            } else {
                customInsWrapper.classList.add('hidden');
                customInsInput.value = '';
            }
        });
    });

    // Format tiền tệ số
    const handleMoneyInput = function() {
        let value = this.value.replace(/\D/g, '');
        if (value !== '') {
            this.value = parseInt(value, 10).toLocaleString('en-US');
        }
    };
    salaryInput.addEventListener('input', handleMoneyInput);
    customInsInput.addEventListener('input', handleMoneyInput);

    const formatVND = (num) => Math.round(num).toLocaleString('en-US');

    // Thuế TNCN lũy tiến 7 bậc
    const calculatePIT = (taxableIncome) => {
        if (taxableIncome <= 0) return 0;
        if (taxableIncome <= 5000000) return taxableIncome * 0.05;
        if (taxableIncome <= 10000000) return taxableIncome * 0.1 - 250000;
        if (taxableIncome <= 18000000) return taxableIncome * 0.15 - 750000;
        if (taxableIncome <= 32000000) return taxableIncome * 0.2 - 1650000;
        if (taxableIncome <= 52000000) return taxableIncome * 0.25 - 3250000;
        if (taxableIncome <= 80000000) return taxableIncome * 0.3 - 5850000;
        return taxableIncome * 0.35 - 9850000;
    };

    const getFormValues = () => {
        const salaryStr = salaryInput.value.replace(/\D/g, '');
        const salary = parseInt(salaryStr, 10) || 0;
        const dependents = parseInt(dependentsInput.value, 10) || 0;
        const region = parseInt(hostElement.querySelector('input[name="region"]:checked').value, 10);
        
        const insType = hostElement.querySelector('input[name="ins-type"]:checked').value;
        let customInsSalary = 0;
        if (insType === 'custom') {
            customInsSalary = parseInt(customInsInput.value.replace(/\D/g, ''), 10) || 0;
        }

        return { salary, dependents, region, insType, customInsSalary };
    };

    const renderResult = (data) => {
        hostElement.querySelector('#result-placeholder').classList.add('hidden');
        const content = hostElement.querySelector('#result-content');
        content.classList.remove('hidden');
        content.classList.add('flex');

        hostElement.querySelector('#res-gross').innerText = formatVND(data.gross);
        hostElement.querySelector('#res-net').innerText = formatVND(data.net);
        hostElement.querySelector('#res-bhxh').innerText = `- ${formatVND(data.bhxh)}`;
        hostElement.querySelector('#res-bhyt').innerText = `- ${formatVND(data.bhyt)}`;
        hostElement.querySelector('#res-bhtn').innerText = `- ${formatVND(data.bhtn)}`;
        hostElement.querySelector('#res-tntt').innerText = formatVND(data.tntt);
        hostElement.querySelector('#res-pt').innerText = `- ${formatVND(data.dependents * DEPENDENT_DEDUCTION)}`;
        hostElement.querySelector('#res-tax').innerText = `- ${formatVND(data.tax)}`;
    };

    // Gross -> Net
    const calcGrossToNet = () => {
        const { salary: gross, dependents, region, insType, customInsSalary } = getFormValues();
        if (gross === 0) {
            return IslandKit.notify('Thiếu thông tin', 'Vui lòng nhập mức lương hợp lệ.', 'warning');
        }

        let insSalaryForCalc = gross;
        if (insType === 'custom') {
            insSalaryForCalc = customInsSalary;
        }

        const maxInsurBase = BASE_SALARY * 20;
        const maxUnempBase = REGION_MIN[region] * 20;

        const bhxh = Math.min(insSalaryForCalc, maxInsurBase) * 0.08;
        const bhyt = Math.min(insSalaryForCalc, maxInsurBase) * 0.015;
        const bhtn = Math.min(insSalaryForCalc, maxUnempBase) * 0.01;
        const insuranceTotal = bhxh + bhyt + bhtn;

        const tntt = gross - insuranceTotal;
        const deductions = PERSONAL_DEDUCTION + (dependents * DEPENDENT_DEDUCTION);
        const taxableIncome = Math.max(0, tntt - deductions);
        const tax = calculatePIT(taxableIncome);
        const net = gross - insuranceTotal - tax;

        resModeTag.textContent = 'Quy đổi Gross → Net';
        renderResult({ gross, net, bhxh, bhyt, bhtn, tntt, dependents, tax });
        IslandKit.notify('Tính hoàn tất', `Lương Net: ${formatVND(net)} VNĐ`, 'success');
    };

    // Net -> Gross (Binary Search)
    const calcNetToGross = () => {
        const { salary: targetNet, dependents, region, insType, customInsSalary } = getFormValues();
        if (targetNet === 0) {
            return IslandKit.notify('Thiếu thông tin', 'Vui lòng nhập mức lương hợp lệ.', 'warning');
        }

        let minGross = targetNet;
        let maxGross = targetNet * 3; 
        let currentGross = 0;
        let diff = 0;
        let bestResult = null;

        for (let i = 0; i < 50; i++) {
            currentGross = (minGross + maxGross) / 2;
            
            let insSalaryForCalc = currentGross;
            if (insType === 'custom') {
                insSalaryForCalc = customInsSalary;
            }

            const maxInsurBase = BASE_SALARY * 20;
            const maxUnempBase = REGION_MIN[region] * 20;

            const bhxh = Math.min(insSalaryForCalc, maxInsurBase) * 0.08;
            const bhyt = Math.min(insSalaryForCalc, maxInsurBase) * 0.015;
            const bhtn = Math.min(insSalaryForCalc, maxUnempBase) * 0.01;
            const insuranceTotal = bhxh + bhyt + bhtn;

            const tntt = currentGross - insuranceTotal;
            const deductions = PERSONAL_DEDUCTION + (dependents * DEPENDENT_DEDUCTION);
            const taxableIncome = Math.max(0, tntt - deductions);
            const tax = calculatePIT(taxableIncome);
            const calculatedNet = currentGross - insuranceTotal - tax;

            diff = calculatedNet - targetNet;
            bestResult = { gross: currentGross, net: calculatedNet, bhxh, bhyt, bhtn, tntt, dependents, tax };

            if (Math.abs(diff) < 1) break; 
            
            if (diff > 0) {
                maxGross = currentGross;
            } else {
                minGross = currentGross;
            }
        }

        resModeTag.textContent = 'Quy đổi Net → Gross';
        renderResult(bestResult);
        IslandKit.notify('Tính hoàn tất', `Lương Gross: ${formatVND(bestResult.gross)} VNĐ`, 'success');
    };

    btnNet.addEventListener('click', calcGrossToNet);
    btnGross.addEventListener('click', calcNetToGross);

    // Modal Vùng
    const modalRegions = hostElement.querySelector('#modal-regions');
    const btnOpenRegions = hostElement.querySelector('#btn-open-regions');
    const btnCloseRegions = hostElement.querySelector('#btn-close-regions');

    const openModal = () => {
        modalRegions.classList.remove('hidden');
        modalRegions.classList.add('flex');
        setTimeout(() => {
            modalRegions.classList.remove('opacity-0');
            modalRegions.querySelector('div').classList.remove('scale-95');
            modalRegions.querySelector('div').classList.add('scale-100');
        }, 10);
    };

    const closeModal = () => {
        modalRegions.classList.add('opacity-0');
        modalRegions.querySelector('div').classList.remove('scale-100');
        modalRegions.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modalRegions.classList.add('hidden');
            modalRegions.classList.remove('flex');
        }, 200);
    };

    btnOpenRegions.addEventListener('click', openModal);
    btnCloseRegions.addEventListener('click', closeModal);
    modalRegions.addEventListener('click', (e) => {
        if (e.target === modalRegions) closeModal();
    });
}