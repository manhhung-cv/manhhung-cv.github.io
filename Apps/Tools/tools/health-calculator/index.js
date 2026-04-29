import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-end mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Chỉ số Sức khỏe</h2>
                    <p class="text-sm text-zinc-500 mt-1">Tính toán TDEE, lượng nước, Macros và theo dõi BMI trực quan.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col p-5 space-y-5">
                    
                    <div class="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
                        <button class="hc-gender-btn active flex-1 py-2 text-sm font-bold rounded-xl text-blue-600 bg-white dark:bg-zinc-700 shadow-sm transition-all flex items-center justify-center gap-2" data-gender="male">
                            <i class="fas fa-mars"></i> Nam
                        </button>
                        <button class="hc-gender-btn flex-1 py-2 text-sm font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2" data-gender="female">
                            <i class="fas fa-venus"></i> Nữ
                        </button>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Tuổi</label>
                            <input type="number" inputmode="numeric" id="hc-age" class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-bold text-zinc-900 dark:text-white text-center" value="24" min="15" max="100">
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Nặng (kg)</label>
                            <input type="number" inputmode="decimal" id="hc-weight" class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-bold text-zinc-900 dark:text-white text-center" value="65" min="30" max="200">
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Cao (cm)</label>
                            <input type="number" inputmode="numeric" id="hc-height" class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-bold text-zinc-900 dark:text-white text-center" value="170" min="100" max="250">
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Mức độ vận động</label>
                        <div class="relative">
                            <select id="hc-activity" class="appearance-none w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer">
                                <option value="1.2">Không vận động (Ngồi nhiều)</option>
                                <option value="1.375">Nhẹ nhàng (1-3 ngày/tuần)</option>
                                <option value="1.55" selected>Vừa phải (3-5 ngày/tuần)</option>
                                <option value="1.725">Năng động (6-7 ngày/tuần)</option>
                                <option value="1.9">Rất năng động (Vận động viên)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500"><i class="fas fa-chevron-down text-[10px]"></i></div>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Mục tiêu cá nhân</label>
                        <div class="flex gap-2">
                            <button class="hc-goal-btn flex-1 py-2 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all flex flex-col items-center gap-1 hover:border-orange-400" data-goal="cut">
                                <i class="fas fa-fire text-orange-500 text-[13px]"></i>
                                <span>Giảm mỡ</span>
                            </button>
                            <button class="hc-goal-btn active flex-1 py-2 text-[11px] font-bold rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-all flex flex-col items-center gap-1" data-goal="maintain">
                                <i class="fas fa-equals text-emerald-500 text-[13px]"></i>
                                <span>Duy trì</span>
                            </button>
                            <button class="hc-goal-btn flex-1 py-2 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 transition-all flex flex-col items-center gap-1 hover:border-blue-400" data-goal="bulk">
                                <i class="fas fa-dumbbell text-blue-500 text-[13px]"></i>
                                <span>Tăng cân</span>
                            </button>
                        </div>
                    </div>

                    <div id="hc-bulk-options" class="hidden p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                        <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider ml-1">Chọn lộ trình tăng cân</p>
                        <div class="flex flex-col gap-2">
                            <button class="hc-bulk-sub-btn flex justify-between items-center p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-blue-400 transition-all" data-mode="slow">
                                <span class="text-xs font-bold">Chậm <span class="font-medium opacity-60 text-[10px] ml-1">(Clean Bulk)</span></span>
                                <span class="text-[10px] font-bold text-blue-500">+250 kcal <span class="font-medium opacity-60 ml-1">~0.25kg/tuần</span></span>
                            </button>
                            <button class="hc-bulk-sub-btn active flex justify-between items-center p-3 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all" data-mode="optimal">
                                <span class="text-xs font-bold">Tối ưu <span class="font-medium opacity-60 text-[10px] ml-1">(Standard)</span></span>
                                <span class="text-[10px] font-bold">+500 kcal <span class="font-medium opacity-60 ml-1">~0.5kg/tuần</span></span>
                            </button>
                            <button class="hc-bulk-sub-btn flex justify-between items-center p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-purple-400 transition-all group" data-mode="fast">
                                <span class="text-xs font-bold group-hover:text-purple-500 transition-colors">Nhanh <span class="font-medium opacity-60 text-[10px] ml-1">(Dirty Bulk)</span></span>
                                <span class="text-[10px] font-bold group-hover:text-purple-500 transition-colors">+1000 kcal <span class="font-medium opacity-60 ml-1">~1.0kg/tuần</span></span>
                            </button>
                        </div>
                    </div>

                    <button id="btn-hc-calc" class="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[13px] transition-all hover:opacity-90 active:scale-95 shadow-sm mt-2">
                        TÍNH TOÁN NGAY
                    </button>
                </div>

                <div class="lg:col-span-7 flex flex-col gap-5">
                    
                    <div id="res-hero-card" class="premium-card bg-zinc-900 dark:bg-zinc-800 rounded-[28px] p-6 shadow-md relative overflow-hidden text-white flex items-center justify-between border border-zinc-800 dark:border-zinc-700 transition-colors duration-500">
                        <div id="res-hero-glow" class="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500"></div>
                        
                        <div class="relative z-10">
                            <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1" id="res-goal-text">MỤC TIÊU: DUY TRÌ</p>
                            <h3 class="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline gap-2">
                                <span id="res-target-calo">0</span>
                                <span class="text-lg font-medium text-zinc-400 mb-1">kcal</span>
                            </h3>
                            <p class="text-xs text-zinc-400 mt-1" id="res-tdee-info">TDEE (Năng lượng tiêu hao): 0 kcal</p>
                        </div>

                        <div id="res-hero-icon" class="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                            <i class="fas fa-equals text-2xl text-emerald-400"></i>
                        </div>
                    </div>

                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div class="flex justify-between items-end mb-3">
                            <h3 class="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <i class="fas fa-weight text-indigo-500"></i> Chỉ số BMI
                            </h3>
                            <div class="text-right">
                                <span id="res-bmi" class="text-2xl font-black text-zinc-900 dark:text-white leading-none">0.0</span>
                                <span id="res-bmi-status" class="text-xs font-bold text-emerald-500 ml-1">Bình thường</span>
                            </div>
                        </div>
                        
                        <div class="relative pt-2 pb-1">
                            <div class="h-3 w-full rounded-full flex overflow-hidden">
                                <div class="h-full bg-amber-400" style="width: 25%;" title="Thiếu cân (< 18.5)"></div>
                                <div class="h-full bg-emerald-400" style="width: 25%;" title="Bình thường (18.5 - 24.9)"></div>
                                <div class="h-full bg-orange-400" style="width: 25%;" title="Thừa cân (25 - 29.9)"></div>
                                <div class="h-full bg-rose-500" style="width: 25%;" title="Béo phì (>= 30)"></div>
                            </div>
                            <div id="res-bmi-indicator" class="absolute top-1 w-4 h-5 bg-zinc-900 dark:bg-white border-2 border-white dark:border-zinc-900 rounded shadow-md transform -translate-x-1/2 transition-all duration-700 ease-out" style="left: 0%;"></div>
                        </div>
                        <div class="flex justify-between text-[9px] font-bold text-zinc-400 mt-1 px-1">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white dark:bg-zinc-900 rounded-[20px] p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 text-lg"><i class="fas fa-heartbeat"></i></div>
                            <div>
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">BMR (Nền tảng)</p>
                                <h4 class="text-lg font-black text-zinc-900 dark:text-white leading-tight"><span id="res-bmr">0</span> <span class="text-xs font-medium text-zinc-400 font-sans">kcal</span></h4>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-zinc-900 rounded-[20px] p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 text-lg"><i class="fas fa-tint"></i></div>
                            <div>
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Lượng Nước</p>
                                <h4 class="text-lg font-black text-zinc-900 dark:text-white leading-tight"><span id="res-water">0.0</span> <span class="text-xs font-medium text-zinc-400 font-sans">Lít</span></h4>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <i class="fas fa-chart-pie"></i> Phân bổ đa lượng chất (Macros)
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-[13px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-rose-500"></div> Protein</span>
                                    <div class="text-right">
                                        <span class="text-sm font-black text-rose-500" id="res-p-val">0g</span>
                                        <span class="text-[10px] font-bold text-zinc-400 ml-1" id="res-p-pct">30%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-p-bar" class="bg-rose-500 h-1.5 rounded-full transition-all duration-1000 w-0"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-[13px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Carbs</span>
                                    <div class="text-right">
                                        <span class="text-sm font-black text-blue-500" id="res-c-val">0g</span>
                                        <span class="text-[10px] font-bold text-zinc-400 ml-1" id="res-c-pct">40%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-c-bar" class="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 w-0"></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-[13px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-500"></div> Fat</span>
                                    <div class="text-right">
                                        <span class="text-sm font-black text-amber-500" id="res-f-val">0g</span>
                                        <span class="text-[10px] font-bold text-zinc-400 ml-1" id="res-f-pct">30%</span>
                                    </div>
                                </div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div id="res-f-bar" class="bg-amber-500 h-1.5 rounded-full transition-all duration-1000 w-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- STATE ---
    let state = {
        gender: 'male',
        age: 24,
        weight: 65,
        height: 170,
        activity: 1.55,
        goal: 'maintain', // cut, maintain, bulk
        bulkMode: 'optimal' // slow, optimal, fast
    };

    // --- DOM Elements ---
    const inputs = {
        age: document.getElementById('hc-age'),
        weight: document.getElementById('hc-weight'),
        height: document.getElementById('hc-height'),
        activity: document.getElementById('hc-activity')
    };
    
    const btns = {
        gender: document.querySelectorAll('.hc-gender-btn'),
        goal: document.querySelectorAll('.hc-goal-btn'),
        bulkSub: document.querySelectorAll('.hc-bulk-sub-btn'),
        calc: document.getElementById('btn-hc-calc')
    };
    
    const bulkOptionsMenu = document.getElementById('hc-bulk-options');

    const results = {
        heroCard: document.getElementById('res-hero-card'),
        heroGlow: document.getElementById('res-hero-glow'),
        heroIcon: document.getElementById('res-hero-icon'),
        goalText: document.getElementById('res-goal-text'),
        targetCalo: document.getElementById('res-target-calo'),
        tdeeInfo: document.getElementById('res-tdee-info'),
        
        bmi: document.getElementById('res-bmi'),
        bmiStatus: document.getElementById('res-bmi-status'),
        bmiIndicator: document.getElementById('res-bmi-indicator'),
        
        bmr: document.getElementById('res-bmr'),
        water: document.getElementById('res-water'),
        
        pVal: document.getElementById('res-p-val'), pPct: document.getElementById('res-p-pct'), pBar: document.getElementById('res-p-bar'),
        cVal: document.getElementById('res-c-val'), cPct: document.getElementById('res-c-pct'), cBar: document.getElementById('res-c-bar'),
        fVal: document.getElementById('res-f-val'), fPct: document.getElementById('res-f-pct'), fBar: document.getElementById('res-f-bar')
    };

    // --- LOGIC UI CHỌN NÚT ---
    btns.gender.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.gender.forEach(b => {
                b.classList.remove('active', 'text-blue-600', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm', 'text-pink-600');
                b.classList.add('text-zinc-500', 'font-medium');
                b.classList.remove('font-bold');
            });
            
            const g = btn.dataset.gender;
            btn.classList.remove('text-zinc-500', 'font-medium');
            btn.classList.add('active', 'font-bold', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm');
            
            if (g === 'male') btn.classList.add('text-blue-600');
            else btn.classList.add('text-pink-600');
            
            state.gender = g;
            calculateHealth();
        });
    });

    btns.goal.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.goal.forEach(b => {
                b.classList.remove('active', 'border-2', 'border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-900/20', 'text-emerald-600', 'dark:text-emerald-400', 'border-orange-500', 'bg-orange-50', 'dark:bg-orange-900/20', 'text-orange-600', 'dark:text-orange-400', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
                b.classList.add('border', 'border-zinc-200', 'dark:border-zinc-800', 'bg-white', 'dark:bg-zinc-950', 'text-zinc-500');
            });
            
            const g = btn.dataset.goal;
            btn.classList.remove('border', 'border-zinc-200', 'dark:border-zinc-800', 'bg-white', 'dark:bg-zinc-950', 'text-zinc-500');
            btn.classList.add('active', 'border-2');
            
            if (g === 'cut') btn.classList.add('border-orange-500', 'bg-orange-50', 'dark:bg-orange-900/20', 'text-orange-600', 'dark:text-orange-400');
            else if (g === 'maintain') btn.classList.add('border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-900/20', 'text-emerald-600', 'dark:text-emerald-400');
            else btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
            
            state.goal = g;
            
            // Xử lý Ẩn/Hiện Menu tốc độ Tăng cân
            if (g === 'bulk') {
                bulkOptionsMenu.classList.remove('hidden');
            } else {
                bulkOptionsMenu.classList.add('hidden');
            }
            
            calculateHealth();
        });
    });

    btns.bulkSub.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.bulkSub.forEach(b => {
                b.classList.remove('active', 'border-2', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-500/10', 'text-blue-600', 'dark:text-blue-400', 'border-purple-500', 'bg-purple-50', 'dark:bg-purple-500/10', 'text-purple-600', 'dark:text-purple-400');
                b.classList.add('border', 'border-blue-200', 'dark:border-blue-800/50', 'bg-white', 'dark:bg-zinc-900', 'text-zinc-600', 'dark:text-zinc-300');
            });
            
            const mode = btn.dataset.mode;
            btn.classList.remove('border', 'border-blue-200', 'dark:border-blue-800/50', 'bg-white', 'dark:bg-zinc-900', 'text-zinc-600', 'dark:text-zinc-300');
            btn.classList.add('active', 'border-2');
            
            if (mode === 'fast') {
                btn.classList.add('border-purple-500', 'bg-purple-50', 'dark:bg-purple-500/10', 'text-purple-600', 'dark:text-purple-400');
            } else {
                btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-500/10', 'text-blue-600', 'dark:text-blue-400');
            }
            
            state.bulkMode = mode;
            calculateHealth();
        });
    });

    // --- LOGIC TÍNH TOÁN ---
    const getBMIStatus = (bmi) => {
        if (bmi < 18.5) return { text: 'Thiếu cân', color: 'text-amber-500' };
        if (bmi >= 18.5 && bmi <= 24.9) return { text: 'Bình thường', color: 'text-emerald-500' };
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

        results.bmiIndicator.style.left = `${percent}%`;
    };

    const calculateHealth = () => {
        state.age = parseFloat(inputs.age.value) || 0;
        state.weight = parseFloat(inputs.weight.value) || 0;
        state.height = parseFloat(inputs.height.value) || 0;
        state.activity = parseFloat(inputs.activity.value) || 1.2;

        if (!state.age || !state.weight || !state.height) return;

        // 1. BMI & BMI Bar
        const heightM = state.height / 100;
        const bmi = state.weight / (heightM * heightM);
        results.bmi.textContent = bmi.toFixed(1);
        
        const bmiStatus = getBMIStatus(bmi);
        results.bmiStatus.textContent = bmiStatus.text;
        results.bmiStatus.className = `text-xs font-bold ml-1 ${bmiStatus.color}`;
        
        updateBMIBar(bmi);

        // 2. BMR
        let bmr = (10 * state.weight) + (6.25 * state.height) - (5 * state.age);
        bmr = state.gender === 'male' ? bmr + 5 : bmr - 161;
        results.bmr.textContent = Math.round(bmr).toLocaleString();

        // 3. TDEE & Target Calo (Hero Card Theming)
        const tdee = Math.round(bmr * state.activity);
        results.tdeeInfo.textContent = `TDEE (Tiêu hao): ${tdee.toLocaleString()} kcal`;

        let targetCalo = tdee;
        let pPct = 30, cPct = 40, fPct = 30; // Mặc định Duy trì

        if (state.goal === 'cut') {
            targetCalo -= 500;
            pPct = 40; cPct = 30; fPct = 30;
            results.goalText.textContent = 'MỤC TIÊU: GIẢM MỠ';
            results.heroGlow.className = 'absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500';
            results.heroIcon.innerHTML = '<i class="fas fa-fire text-2xl text-orange-400"></i>';
            
        } else if (state.goal === 'bulk') {
            results.heroIcon.innerHTML = '<i class="fas fa-dumbbell text-2xl text-blue-400"></i>';
            
            if (state.bulkMode === 'slow') {
                targetCalo += 250;
                pPct = 30; cPct = 45; fPct = 25;
                results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN CHẬM (CLEAN BULK)';
                results.heroGlow.className = 'absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500';
            } 
            else if (state.bulkMode === 'optimal') {
                targetCalo += 500;
                pPct = 25; cPct = 50; fPct = 25;
                results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN TỐI ƯU (STANDARD)';
                results.heroGlow.className = 'absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500';
            } 
            else if (state.bulkMode === 'fast') {
                targetCalo += 1000;
                pPct = 20; cPct = 55; fPct = 25;
                results.goalText.textContent = 'MỤC TIÊU: TĂNG CÂN NHANH (DIRTY BULK)';
                results.heroGlow.className = 'absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500';
                results.heroIcon.innerHTML = '<i class="fas fa-rocket text-2xl text-purple-400"></i>';
            }
            
        } else {
            // Maintain
            results.goalText.textContent = 'MỤC TIÊU: DUY TRÌ';
            results.heroGlow.className = 'absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 transition-colors duration-500';
            results.heroIcon.innerHTML = '<i class="fas fa-equals text-2xl text-emerald-400"></i>';
        }
        
        results.targetCalo.textContent = targetCalo.toLocaleString();

        // 4. Lượng nước
        results.water.textContent = (state.weight * 0.035).toFixed(1);

        // 5. Macros Render
        results.pPct.textContent = `${pPct}%`;
        results.cPct.textContent = `${cPct}%`;
        results.fPct.textContent = `${fPct}%`;

        results.pVal.textContent = `${Math.round((targetCalo * (pPct / 100)) / 4)}g`;
        results.cVal.textContent = `${Math.round((targetCalo * (cPct / 100)) / 4)}g`;
        results.fVal.textContent = `${Math.round((targetCalo * (fPct / 100)) / 9)}g`;

        setTimeout(() => {
            results.pBar.style.width = `${pPct}%`;
            results.cBar.style.width = `${cPct}%`;
            results.fBar.style.width = `${fPct}%`;
        }, 50);
    };

    // --- LẮNG NGHE SỰ KIỆN ---
    for (let key in inputs) inputs[key].addEventListener('input', calculateHealth);
    
    btns.calc.addEventListener('click', () => {
        calculateHealth();
        UI.showAlert('Hoàn tất', 'Các chỉ số đã được tính toán.', 'success');
        if (window.innerWidth <= 1024) document.querySelector('.lg\\:col-span-7').scrollIntoView({ behavior: 'smooth' });
    });

    calculateHealth();
}