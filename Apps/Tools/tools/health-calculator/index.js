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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="health-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #health-root-container {
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
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Health Core</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Chỉ số Sức khỏe</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tính toán nhu cầu calo TDEE, phân bổ đa lượng chất (Macros), BMI và cân nặng lý tưởng (IBW).</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: THAM SỐ ĐẦU VÀO (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    
                    <!-- GIỚI TÍNH: SEGMENTED TABS TƯƠNG PHẢN CAO -->
                    <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="hc-gender-tabs">
                        <button class="hc-gender-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-2" data-gender="male">
                            <i class="fas fa-mars text-blue-500 text-[11px]"></i> Nam
                        </button>
                        <button class="hc-gender-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-2" data-gender="female">
                            <i class="fas fa-venus text-rose-500 text-[11px]"></i> Nữ
                        </button>
                    </div>

                    <!-- THÔNG SỐ CƠ BẢN -->
                    <div class="grid grid-cols-3 gap-2.5">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5 text-center">Tuổi</label>
                            <input type="number" inputmode="numeric" id="hc-age" class="w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white text-center p-0" value="24" min="15" max="100">
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5 text-center">Nặng (kg)</label>
                            <input type="number" inputmode="decimal" id="hc-weight" class="w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white text-center p-0" value="65" min="30" max="200">
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5 text-center">Cao (cm)</label>
                            <input type="number" inputmode="numeric" id="hc-height" class="w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white text-center p-0" value="170" min="100" max="250">
                        </div>
                    </div>

                    <!-- MỨC ĐỘ VẬN ĐỘNG -->
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Mức độ vận động</label>
                        <div class="relative">
                            <select id="hc-activity" class="appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all cursor-pointer">
                                <option value="1.2">Không vận động (Ngồi nhiều)</option>
                                <option value="1.375">Nhẹ nhàng (1-3 ngày/tuần)</option>
                                <option value="1.55" selected>Vừa phải (3-5 ngày/tuần)</option>
                                <option value="1.725">Năng động (6-7 ngày/tuần)</option>
                                <option value="1.9">Rất năng động (Cường độ cao)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400"><i class="fas fa-chevron-down text-[10px]"></i></div>
                        </div>
                    </div>

                    <!-- MỤC TIÊU CÁ NHÂN -->
                    <div class="space-y-1.5 pt-1">
                        <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Mục tiêu cân nặng</label>
                        <div class="grid grid-cols-3 gap-1.5" id="hc-goal-group">
                            <button class="hc-goal-btn py-2 px-1 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] bg-[#f2f2f7]/60 dark:bg-black/30 text-zinc-500 transition-all flex flex-col items-center gap-1" data-goal="cut">
                                <i class="fas fa-fire text-amber-500 text-xs"></i>
                                <span class="text-[11px] font-bold">Giảm mỡ</span>
                            </button>
                            <button class="hc-goal-btn active py-2 px-1 rounded-[14px] border border-accent-theme bg-accent-theme-alpha text-accent-theme transition-all flex flex-col items-center gap-1" data-goal="maintain">
                                <i class="fas fa-equals text-xs"></i>
                                <span class="text-[11px] font-bold">Duy trì</span>
                            </button>
                            <button class="hc-goal-btn py-2 px-1 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] bg-[#f2f2f7]/60 dark:bg-black/30 text-zinc-500 transition-all flex flex-col items-center gap-1" data-goal="bulk">
                                <i class="fas fa-dumbbell text-blue-500 text-xs"></i>
                                <span class="text-[11px] font-bold">Tăng cân</span>
                            </button>
                        </div>
                    </div>

                    <!-- TÙY CHỌN TĂNG CÂN -->
                    <div id="hc-bulk-options" class="hidden p-3 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Lộ trình thặng dư calo</span>
                        <div class="flex flex-col gap-1.5">
                            <button class="hc-bulk-sub-btn flex justify-between items-center px-3 py-2 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] text-zinc-600 dark:text-zinc-300 transition-all" data-mode="slow">
                                <span class="text-xs font-semibold">Chậm <span class="font-normal text-[10px] text-zinc-400">(Clean Bulk)</span></span>
                                <span class="text-[11px] font-bold font-mono text-blue-500">+250 kcal</span>
                            </button>
                            <button class="hc-bulk-sub-btn active flex justify-between items-center px-3 py-2 rounded-[12px] border border-accent-theme bg-accent-theme-alpha text-accent-theme transition-all" data-mode="optimal">
                                <span class="text-xs font-semibold">Tối ưu <span class="font-normal text-[10px] opacity-70">(Standard)</span></span>
                                <span class="text-[11px] font-bold font-mono">+500 kcal</span>
                            </button>
                            <button class="hc-bulk-sub-btn flex justify-between items-center px-3 py-2 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] text-zinc-600 dark:text-zinc-300 transition-all" data-mode="fast">
                                <span class="text-xs font-semibold">Nhanh <span class="font-normal text-[10px] text-zinc-400">(Dirty Bulk)</span></span>
                                <span class="text-[11px] font-bold font-mono text-purple-500">+1000 kcal</span>
                            </button>
                        </div>
                    </div>

                    <button id="btn-hc-calc" class="w-full h-11 bg-accent-theme text-white rounded-[14px] font-bold text-xs active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 pt-1">
                        <i class="fas fa-calculator text-xs"></i> Tính toán lại
                    </button>
                </div>

                <!-- CỘT PHẢI: BẢNG KẾT QUẢ VÀ TRỰC QUAN (7 COLS) -->
                <div id="hc-results-col" class="lg:col-span-7 flex flex-col gap-4">
                    
                    <!-- HERO SUMMARY CARD -->
                    <div id="res-hero-card" class="rounded-[24px] p-5 sm:p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-[#121214] dark:to-black text-white border border-white/5 shadow-sm relative overflow-hidden flex items-center justify-between">
                        <div id="res-hero-glow" class="absolute top-0 right-0 w-48 h-48 bg-accent-theme-alpha rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                        
                        <div class="relative z-10 space-y-1">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block" id="res-goal-text">MỤC TIÊU: DUY TRÌ</span>
                            <div class="text-3xl sm:text-4xl font-black font-mono tracking-tight flex items-baseline gap-2">
                                <span id="res-target-calo" class="text-accent-theme">0</span>
                                <span class="text-sm font-medium text-zinc-400 font-sans">kcal / ngày</span>
                            </div>
                            <p class="text-[11px] text-zinc-400 font-mono pt-1" id="res-tdee-info">TDEE tiêu thụ: 0 kcal</p>
                        </div>

                        <div id="res-hero-icon" class="relative z-10 w-14 h-14 rounded-[18px] bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/15 text-accent-theme text-xl">
                            <i class="fas fa-equals"></i>
                        </div>
                    </div>

                    <!-- BMI & PROGRESS BAR -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                        <div class="flex justify-between items-baseline">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-weight-scale text-accent-theme"></i> Chỉ số BMI
                            </h3>
                            <div class="flex items-baseline gap-1.5">
                                <span id="res-bmi" class="text-xl font-black font-mono text-zinc-900 dark:text-white">0.0</span>
                                <span id="res-bmi-status" class="text-xs font-bold text-accent-theme">Bình thường</span>
                            </div>
                        </div>

                        <div class="relative pt-1 pb-1">
                            <div class="h-2.5 w-full rounded-full flex overflow-hidden">
                                <div class="h-full bg-amber-400" style="width: 25%;" title="Thiếu cân (< 18.5)"></div>
                                <div class="h-full bg-emerald-500" style="width: 25%;" title="Bình thường (18.5 - 24.9)"></div>
                                <div class="h-full bg-orange-400" style="width: 25%;" title="Thừa cân (25 - 29.9)"></div>
                                <div class="h-full bg-rose-500" style="width: 25%;" title="Béo phì (>= 30)"></div>
                            </div>
                            <div id="res-bmi-indicator" class="absolute top-0 w-3.5 h-4.5 bg-zinc-900 dark:bg-white border-2 border-white dark:border-black rounded-[4px] shadow-sm transform -translate-x-1/2 transition-all duration-500" style="left: 0%;"></div>
                        </div>

                        <div class="flex justify-between text-[9px] font-mono text-zinc-400 px-0.5">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                        </div>
                    </div>

                    <!-- BMR & WATER -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 shadow-sm flex items-center gap-3">
                            <div class="w-9 h-9 rounded-[12px] bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 text-sm">
                                <i class="fas fa-heart-pulse"></i>
                            </div>
                            <div class="min-w-0">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block truncate">BMR Cơ bản</span>
                                <span class="text-base font-black font-mono text-zinc-900 dark:text-white"><span id="res-bmr">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kcal</span></span>
                            </div>
                        </div>

                        <div class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 shadow-sm flex items-center gap-3">
                            <div class="w-9 h-9 rounded-[12px] bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 text-sm">
                                <i class="fas fa-droplet"></i>
                            </div>
                            <div class="min-w-0">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block truncate">Lượng nước</span>
                                <span class="text-base font-black font-mono text-zinc-900 dark:text-white"><span id="res-water">0.0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">lít</span></span>
                            </div>
                        </div>
                    </div>

                    <!-- MACROS -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3.5">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-chart-pie text-accent-theme"></i> Phân bổ đa lượng chất (Macros)
                        </h3>

                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between items-center text-xs mb-1">
                                    <span class="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <span class="w-2 h-2 rounded-full bg-rose-500"></span> Protein (Đạm)
                                    </span>
                                    <div class="font-mono text-xs">
                                        <span class="font-bold text-rose-500" id="res-p-val">0g</span>
                                        <span class="text-[10px] text-zinc-400 ml-1" id="res-p-pct">30%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-[#f2f2f7] dark:bg-black/40 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-p-bar" class="bg-rose-500 h-full rounded-full transition-all duration-700 w-0"></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-center text-xs mb-1">
                                    <span class="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> Carbs (Tinh bột)
                                    </span>
                                    <div class="font-mono text-xs">
                                        <span class="font-bold text-blue-500" id="res-c-val">0g</span>
                                        <span class="text-[10px] text-zinc-400 ml-1" id="res-c-pct">40%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-[#f2f2f7] dark:bg-black/40 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-c-bar" class="bg-blue-500 h-full rounded-full transition-all duration-700 w-0"></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-center text-xs mb-1">
                                    <span class="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <span class="w-2 h-2 rounded-full bg-amber-500"></span> Fat (Chất béo)
                                    </span>
                                    <div class="font-mono text-xs">
                                        <span class="font-bold text-amber-500" id="res-f-val">0g</span>
                                        <span class="text-[10px] text-zinc-400 ml-1" id="res-f-pct">30%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-[#f2f2f7] dark:bg-black/40 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-f-bar" class="bg-amber-500 h-full rounded-full transition-all duration-700 w-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CÂN NẶNG LÝ TƯỞNG (IBW) -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between pb-1 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-scale-balanced text-accent-theme"></i> Cân nặng lý tưởng (IBW)
                            </h3>
                            <span class="text-[9px] font-mono text-zinc-400">Tham chiếu lâm sàng</span>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-2.5 border border-black/[0.03] dark:border-white/[0.05]">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Peterson</span>
                                <span class="text-sm font-black font-mono text-zinc-900 dark:text-white"><span id="res-ibw-peterson">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kg</span></span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-2.5 border border-black/[0.03] dark:border-white/[0.05]">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Devine</span>
                                <span class="text-sm font-black font-mono text-zinc-900 dark:text-white"><span id="res-ibw-devine">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kg</span></span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-2.5 border border-black/[0.03] dark:border-white/[0.05]">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Robinson</span>
                                <span class="text-sm font-black font-mono text-zinc-900 dark:text-white"><span id="res-ibw-robinson">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kg</span></span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-2.5 border border-black/[0.03] dark:border-white/[0.05]">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Miller</span>
                                <span class="text-sm font-black font-mono text-zinc-900 dark:text-white"><span id="res-ibw-miller">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kg</span></span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] p-2.5 border border-black/[0.03] dark:border-white/[0.05]">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Hamwi</span>
                                <span class="text-sm font-black font-mono text-zinc-900 dark:text-white"><span id="res-ibw-hamwi">0</span> <span class="text-[10px] font-normal text-zinc-400 font-sans">kg</span></span>
                            </div>
                            <div class="bg-accent-theme-alpha rounded-[14px] p-2.5 border border-accent-theme">
                                <span class="text-[9px] font-bold text-accent-theme uppercase tracking-wider block">WHO Standard</span>
                                <span class="text-sm font-black font-mono text-accent-theme"><span id="res-ibw-who">0 - 0</span> <span class="text-[10px] font-normal text-accent-theme font-sans">kg</span></span>
                            </div>
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
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#health-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let state = {
        gender: 'male',
        age: 24,
        weight: 65,
        height: 170,
        activity: 1.55,
        goal: 'maintain',
        bulkMode: 'optimal'
    };

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const inputs = {
        age: _('#hc-age'),
        weight: _('#hc-weight'),
        height: _('#hc-height'),
        activity: _('#hc-activity')
    };

    const btns = {
        gender: $$('.hc-gender-btn'),
        goal: $$('.hc-goal-btn'),
        bulkSub: $$('.hc-bulk-sub-btn'),
        calc: _('#btn-hc-calc')
    };

    const bulkOptionsMenu = _('#hc-bulk-options');

    const results = {
        heroGlow: _('#res-hero-glow'),
        heroIcon: _('#res-hero-icon'),
        goalText: _('#res-goal-text'),
        targetCalo: _('#res-target-calo'),
        tdeeInfo: _('#res-tdee-info'),

        bmi: _('#res-bmi'),
        bmiStatus: _('#res-bmi-status'),
        bmiIndicator: _('#res-bmi-indicator'),

        ibwPeterson: _('#res-ibw-peterson'),
        ibwDevine: _('#res-ibw-devine'),
        ibwRobinson: _('#res-ibw-robinson'),
        ibwMiller: _('#res-ibw-miller'),
        ibwHamwi: _('#res-ibw-hamwi'),
        ibwWho: _('#res-ibw-who'),

        bmr: _('#res-bmr'),
        water: _('#res-water'),

        pVal: _('#res-p-val'), pPct: _('#res-p-pct'), pBar: _('#res-p-bar'),
        cVal: _('#res-c-val'), cPct: _('#res-c-pct'), cBar: _('#res-c-bar'),
        fVal: _('#res-f-val'), fPct: _('#res-f-pct'), fBar: _('#res-f-bar')
    };

    // Chuyển giới tính
    const activeGenderClass = 'hc-gender-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-2';
    const inactiveGenderClass = 'hc-gender-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-2';

    btns.gender.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.gender.forEach(b => b.className = inactiveGenderClass);
            btn.className = activeGenderClass;
            state.gender = btn.dataset.gender;
            calculateHealth();
        });
    });

    // Chuyển mục tiêu
    const activeGoalClass = 'hc-goal-btn active py-2 px-1 rounded-[14px] border border-accent-theme bg-accent-theme-alpha text-accent-theme transition-all flex flex-col items-center gap-1';
    const inactiveGoalClass = 'hc-goal-btn py-2 px-1 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] bg-[#f2f2f7]/60 dark:bg-black/30 text-zinc-500 transition-all flex flex-col items-center gap-1';

    btns.goal.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.goal.forEach(b => b.className = inactiveGoalClass);
            btn.className = activeGoalClass;

            const g = btn.dataset.goal;
            state.goal = g;

            if (g === 'bulk') {
                bulkOptionsMenu?.classList.remove('hidden');
            } else {
                bulkOptionsMenu?.classList.add('hidden');
            }

            calculateHealth();
        });
    });

    // Lộ trình tăng cân
    const activeBulkClass = 'hc-bulk-sub-btn active flex justify-between items-center px-3 py-2 rounded-[12px] border border-accent-theme bg-accent-theme-alpha text-accent-theme transition-all';
    const inactiveBulkClass = 'hc-bulk-sub-btn flex justify-between items-center px-3 py-2 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] text-zinc-600 dark:text-zinc-300 transition-all';

    btns.bulkSub.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.bulkSub.forEach(b => b.className = inactiveBulkClass);
            btn.className = activeBulkClass;
            state.bulkMode = btn.dataset.mode;
            calculateHealth();
        });
    });

    const getBMIStatus = (bmi) => {
        if (bmi < 18.5) return { text: 'Thiếu cân', color: 'text-amber-500' };
        if (bmi >= 18.5 && bmi <= 24.9) return { text: 'Bình thường', color: 'text-accent-theme' };
        if (bmi >= 25 && bmi <= 29.9) return { text: 'Thừa cân', color: 'text-orange-500' };
        return { text: 'Béo phì', color: 'text-rose-500' };
    };

    const updateBMIBar = (bmi) => {
        let percent = 0;
        if (bmi <= 15) percent = 0;
        else if (bmi > 15 && bmi <= 18.5) percent = ((bmi - 15) / 3.5) * 25;
        else if (bmi > 18.5 && bmi <= 25) percent = 25 + ((bmi - 18.5) / 6.5) * 25;
        else if (bmi > 25 && bmi <= 30) percent = 50 + ((bmi - 25) / 5) * 25;
        else if (bmi > 30 && bmi <= 40) percent = 75 + ((bmi - 30) / 10) * 25;
        else percent = 100;

        if (results.bmiIndicator) results.bmiIndicator.style.left = `${percent}%`;
    };

    const calculateHealth = () => {
        state.age = parseFloat(inputs.age?.value) || 0;
        state.weight = parseFloat(inputs.weight?.value) || 0;
        state.height = parseFloat(inputs.height?.value) || 0;
        state.activity = parseFloat(inputs.activity?.value) || 1.2;

        if (!state.age || !state.weight || !state.height) return;

        // 1. BMI
        const heightM = state.height / 100;
        const bmi = state.weight / (heightM * heightM);
        if (results.bmi) results.bmi.textContent = bmi.toFixed(1);

        const bmiStatus = getBMIStatus(bmi);
        if (results.bmiStatus) {
            results.bmiStatus.textContent = bmiStatus.text;
            results.bmiStatus.className = `text-xs font-bold ${bmiStatus.color}`;
        }
        updateBMIBar(bmi);

        // 2. IBW
        const heightInches = state.height / 2.54;
        const inchesOver5Ft = heightInches - 60;
        const isMale = state.gender === 'male';

        const devine = isMale ? 50.0 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft;
        const robinson = isMale ? 52.0 + 1.9 * inchesOver5Ft : 49.0 + 1.7 * inchesOver5Ft;
        const miller = isMale ? 56.2 + 1.41 * inchesOver5Ft : 53.1 + 1.36 * inchesOver5Ft;
        const hamwi = isMale ? 48.0 + 2.7 * inchesOver5Ft : 45.5 + 2.2 * inchesOver5Ft;

        const targetBmi = 22;
        const peterson = (2.2 * targetBmi) + (3.5 * targetBmi * (heightM - 1.5));

        const bmiLow = 18.5 * (heightM * heightM);
        const bmiHigh = 24.9 * (heightM * heightM);

        if (results.ibwPeterson) results.ibwPeterson.textContent = peterson.toFixed(1);
        if (results.ibwDevine) results.ibwDevine.textContent = devine.toFixed(1);
        if (results.ibwRobinson) results.ibwRobinson.textContent = robinson.toFixed(1);
        if (results.ibwMiller) results.ibwMiller.textContent = miller.toFixed(1);
        if (results.ibwHamwi) results.ibwHamwi.textContent = hamwi.toFixed(1);
        if (results.ibwWho) results.ibwWho.textContent = `${bmiLow.toFixed(1)} - ${bmiHigh.toFixed(1)}`;

        // 3. BMR
        let bmr = (10 * state.weight) + (6.25 * state.height) - (5 * state.age);
        bmr = isMale ? bmr + 5 : bmr - 161;
        if (results.bmr) results.bmr.textContent = Math.round(bmr).toLocaleString();

        // 4. TDEE & Target Calo
        const tdee = Math.round(bmr * state.activity);
        if (results.tdeeInfo) results.tdeeInfo.textContent = `TDEE tiêu thụ: ${tdee.toLocaleString()} kcal`;

        let targetCalo = tdee;
        let pPct = 30, cPct = 40, fPct = 30;

        if (state.goal === 'cut') {
            targetCalo -= 500;
            pPct = 40; cPct = 30; fPct = 30;
            if (results.goalText) results.goalText.textContent = 'MỤC TIÊU: GIẢM MỠ';
            if (results.heroIcon) results.heroIcon.innerHTML = '<i class="fas fa-fire text-amber-500"></i>';
        } else if (state.goal === 'bulk') {
            if (results.heroIcon) results.heroIcon.innerHTML = '<i class="fas fa-dumbbell text-blue-500"></i>';

            if (state.bulkMode === 'slow') {
                targetCalo += 250;
                pPct = 30; cPct = 45; fPct = 25;
                if (results.goalText) results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN CHẬM (CLEAN BULK)';
            } else if (state.bulkMode === 'optimal') {
                targetCalo += 500;
                pPct = 25; cPct = 50; fPct = 25;
                if (results.goalText) results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN TỐI ƯU (STANDARD)';
            } else if (state.bulkMode === 'fast') {
                targetCalo += 1000;
                pPct = 20; cPct = 55; fPct = 25;
                if (results.goalText) results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN NHANH (DIRTY BULK)';
                if (results.heroIcon) results.heroIcon.innerHTML = '<i class="fas fa-rocket text-purple-500"></i>';
            }
        } else {
            if (results.goalText) results.goalText.textContent = 'MỤC TIÊU: DUY TRÌ';
            if (results.heroIcon) results.heroIcon.innerHTML = '<i class="fas fa-equals text-accent-theme"></i>';
        }

        if (results.targetCalo) results.targetCalo.textContent = targetCalo.toLocaleString();

        // 5. Nước
        if (results.water) results.water.textContent = (state.weight * 0.035).toFixed(1);

        // 6. Macros
        if (results.pPct) results.pPct.textContent = `${pPct}%`;
        if (results.cPct) results.cPct.textContent = `${cPct}%`;
        if (results.fPct) results.fPct.textContent = `${fPct}%`;

        if (results.pVal) results.pVal.textContent = `${Math.round((targetCalo * (pPct / 100)) / 4)}g`;
        if (results.cVal) results.cVal.textContent = `${Math.round((targetCalo * (cPct / 100)) / 4)}g`;
        if (results.fVal) results.fVal.textContent = `${Math.round((targetCalo * (fPct / 100)) / 9)}g`;

        if (results.pBar) results.pBar.style.width = `${pPct}%`;
        if (results.cBar) results.cBar.style.width = `${cPct}%`;
        if (results.fBar) results.fBar.style.width = `${fPct}%`;
    };

    for (let key in inputs) inputs[key]?.addEventListener('input', calculateHealth);

    btns.calc?.addEventListener('click', () => {
        calculateHealth();
        IslandKit.notify('Hoàn tất', 'Các chỉ số thể trạng đã được tính toán.', 'success');
        const resultsCol = _('#hc-results-col');
        if (window.innerWidth <= 1024 && resultsCol) {
            resultsCol.scrollIntoView({ behavior: 'smooth' });
        }
    });

    calculateHealth();
}