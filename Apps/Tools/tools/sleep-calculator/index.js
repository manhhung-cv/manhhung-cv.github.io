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

            /* Flat Range */
            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
            .flat-range::-webkit-slider-runnable-track { height: 6px; background: #e4e4e7; border-radius: 3px; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #18181b; margin-top: -7px; border: 2px solid #fff; }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }
            
            /* Ẩn icon đồng hồ mặc định của input type="time" trên một số trình duyệt */
            input[type="time"]::-webkit-calendar-picker-indicator { display: none; }
        </style>

        <div class="relative flex flex-col w-full max-w-[960px] mx-auto min-h-[500px]">
            
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Máy Tính Giấc Ngủ</h2>
                    <p class="text-xs text-zinc-500 mt-1 font-medium">Tính toán chu kỳ 90 phút để thức dậy luôn tỉnh táo.</p>
                </div>
                <button class="flat-btn h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold text-[12px] flex items-center justify-center gap-1.5" id="btn-slp-reset">
                    <i class="fas fa-redo-alt"></i> Đặt lại
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                        
                        <div class="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] hide-scrollbar" id="slp-tabs">
                            <button class="tab-btn active flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap" data-mode="wake"><i class="fas fa-sun mr-1"></i> Giờ thức</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap" data-mode="bed"><i class="fas fa-moon mr-1"></i> Giờ ngủ</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap" data-mode="duration"><i class="fas fa-hourglass-half mr-1"></i> Thời lượng</button>
                        </div>

                        <div class="p-5 flex flex-col gap-6 min-h-[220px]">
                            
                            <div id="mode-wake" class="slp-pane block animate-in fade-in">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">Nếu tôi đi ngủ lúc...</label>
                                <div class="flex gap-2">
                                    <input type="time" id="in-sleep-time" class="flex-1 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-2xl font-black text-center text-zinc-900 dark:text-white font-mono tracking-widest transition-colors">
                                    <button class="flat-btn px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 btn-set-now" data-target="in-sleep-time" title="Bây giờ">
                                        <i class="fas fa-clock"></i>
                                    </button>
                                </div>
                            </div>

                            <div id="mode-bed" class="slp-pane hidden animate-in fade-in">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">Tôi muốn thức dậy lúc...</label>
                                <div class="flex gap-2">
                                    <input type="time" id="in-wake-time" value="06:00" class="flex-1 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-2xl font-black text-center text-zinc-900 dark:text-white font-mono tracking-widest transition-colors">
                                    <button class="flat-btn px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 btn-set-now" data-target="in-wake-time" title="Bây giờ">
                                        <i class="fas fa-clock"></i>
                                    </button>
                                </div>
                            </div>

                            <div id="mode-duration" class="slp-pane hidden animate-in fade-in space-y-4">
                                <div>
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Giờ lên giường</label>
                                    <div class="flex gap-2">
                                        <input type="time" id="in-dur-sleep" value="23:00" class="flex-1 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-xl font-black text-center text-zinc-900 dark:text-white font-mono tracking-widest transition-colors">
                                        <button class="flat-btn px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 btn-set-now" data-target="in-dur-sleep"><i class="fas fa-clock"></i></button>
                                    </div>
                                </div>
                                <div>
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Giờ thức dậy</label>
                                    <div class="flex gap-2">
                                        <input type="time" id="in-dur-wake" value="06:00" class="flex-1 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-xl font-black text-center text-zinc-900 dark:text-white font-mono tracking-widest transition-colors">
                                        <button class="flat-btn px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 btn-set-now" data-target="in-dur-wake"><i class="fas fa-clock"></i></button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div class="px-5 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
                            <div class="flex justify-between items-center mb-3">
                                <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider"><i class="fas fa-bed mr-1"></i> Chìm vào giấc ngủ</label>
                                <span class="text-xs font-black text-zinc-900 dark:text-white bg-white dark:bg-[#09090b] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700" id="val-fall-asleep">15 phút</span>
                            </div>
                            <input type="range" id="in-fall-asleep" min="0" max="60" step="5" value="15" class="flat-range">
                            <div class="flex justify-between text-[9px] font-bold text-zinc-400 mt-2">
                                <span>0p (Lập tức)</span>
                                <span>60p (Trằn trọc)</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden p-6 relative">
                        
                        <div id="res-cycles-box" class="block animate-in fade-in duration-300">
                            <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-1 pb-3 border-b border-zinc-100 dark:border-zinc-800" id="res-title">BẠN NÊN THỨC DẬY VÀO LÚC:</h3>
                            <p class="text-xs text-zinc-500 mb-5 mt-3 leading-relaxed" id="res-desc">Tính toán dựa trên các chu kỳ 90 phút. Hãy chọn các mốc có màu xanh để cơ thể phục hồi tốt nhất.</p>
                            
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="res-list">
                                </div>

                            <div id="res-nap-box" class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 hidden">
                                <h4 class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3"><i class="fas fa-bolt mr-1"></i> Gợi ý chợp mắt (Power Nap)</h4>
                                <div class="grid grid-cols-2 gap-3" id="res-nap-list">
                                    </div>
                            </div>
                        </div>

                        <div id="res-duration-box" class="hidden animate-in fade-in duration-300 h-full flex-col items-center justify-center text-center">
                            <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3 w-full text-left">ĐÁNH GIÁ THỜI LƯỢNG NGỦ</h3>
                            
                            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-8 w-full">
                                <div class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Thực ngủ (Đã trừ thời gian chìm)</div>
                                <div class="text-5xl font-black text-blue-500 font-mono tracking-tighter mb-2" id="dur-total">0g 0p</div>
                                <div class="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-6" id="dur-cycles-text">Tương đương 0 chu kỳ</div>
                                
                                <div class="h-px bg-zinc-200 dark:bg-zinc-800 w-full mb-6"></div>
                                
                                <div id="dur-eval" class="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed"></div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('#slp-tabs .tab-btn');
    const panes = {
        'wake': document.getElementById('mode-wake'),
        'bed': document.getElementById('mode-bed'),
        'duration': document.getElementById('mode-duration')
    };
    
    const inSleepTime = document.getElementById('in-sleep-time');
    const inWakeTime = document.getElementById('in-wake-time');
    const inDurSleep = document.getElementById('in-dur-sleep');
    const inDurWake = document.getElementById('in-dur-wake');
    
    const inFallAsleep = document.getElementById('in-fall-asleep');
    const valFallAsleep = document.getElementById('val-fall-asleep');
    
    const btnSetNows = document.querySelectorAll('.btn-set-now'); 

    const resCyclesBox = document.getElementById('res-cycles-box');
    const resDurBox = document.getElementById('res-duration-box');
    
    const resTitle = document.getElementById('res-title');
    const resDesc = document.getElementById('res-desc');
    const resList = document.getElementById('res-list');
    
    const resNapBox = document.getElementById('res-nap-box');
    const resNapList = document.getElementById('res-nap-list');
    
    const durTotal = document.getElementById('dur-total');
    const durCyclesText = document.getElementById('dur-cycles-text');
    const durEval = document.getElementById('dur-eval');

    let currentMode = 'wake';
    const CYCLE_MINS = 90;

    // --- UTILS ---
    const formatTime = (date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const getCycleClass = (cycles) => {
        if (cycles === 5 || cycles === 6) return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
        if (cycles === 4) return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400';
        if (cycles === 3) return 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400';
        return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400';
    };

    const getCycleLabel = (cycles) => {
        if (cycles === 6) return 'Ngủ 9 giờ';
        if (cycles === 5) return 'Ngủ 7.5 giờ';
        if (cycles === 4) return 'Ngủ 6 giờ';
        if (cycles === 3) return 'Ngủ 4.5 giờ';
        if (cycles === 2) return 'Ngủ 3 giờ';
        if (cycles === 1) return 'Ngủ 1.5 giờ';
        return '';
    };

    const parseTimeString = (timeStr) => {
        if (!timeStr) return new Date();
        const [h, m] = timeStr.split(':').map(Number);
        let d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    // --- RENDER HTML CARD ---
    const renderCard = (time, cycles, desc, colorClass) => {
        return `
            <div class="${colorClass} border rounded-xl p-3 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div class="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">${cycles} chu kỳ</div>
                <div class="text-3xl font-black font-mono tracking-tighter leading-none mb-1">${time}</div>
                <div class="text-xs font-bold opacity-90">${desc}</div>
            </div>
        `;
    };

    // --- CALCULATION LOGIC ---

    const calcWakeTimes = (sleepDate) => {
        const fallAsleep = parseInt(inFallAsleep.value) || 0;
        resList.innerHTML = '';
        resTitle.textContent = 'BẠN NÊN THỨC DẬY VÀO LÚC:';
        resDesc.innerHTML = `Đã cộng thêm <strong>${fallAsleep} phút</strong> chìm vào giấc ngủ.`;

        // 6 chu kỳ, ưu tiên hiển thị mốc xa nhất (tối ưu nhất) đầu tiên
        const cyclesToCalculate = [6, 5, 4, 3, 2, 1]; 

        cyclesToCalculate.forEach((cycle, idx) => {
            let wakeDate = new Date(sleepDate.getTime());
            wakeDate.setMinutes(wakeDate.getMinutes() + fallAsleep + (cycle * CYCLE_MINS));
            
            resList.innerHTML += renderCard(
                formatTime(wakeDate),
                cycle,
                getCycleLabel(cycle),
                getCycleClass(cycle)
            );
        });

        // Gợi ý Nap
        resNapBox.classList.remove('hidden');
        let nap20 = new Date(sleepDate.getTime()); nap20.setMinutes(nap20.getMinutes() + fallAsleep + 20);
        let nap90 = new Date(sleepDate.getTime()); nap90.setMinutes(nap90.getMinutes() + fallAsleep + 90);
        
        resNapList.innerHTML = `
            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-zinc-500 uppercase">Chợp mắt</span>
                    <span class="text-xs font-bold text-zinc-900 dark:text-white">20 phút</span>
                </div>
                <span class="text-xl font-black text-zinc-900 dark:text-white font-mono">${formatTime(nap20)}</span>
            </div>
            <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-zinc-500 uppercase">Ngủ sâu</span>
                    <span class="text-xs font-bold text-zinc-900 dark:text-white">1 chu kỳ (90p)</span>
                </div>
                <span class="text-xl font-black text-zinc-900 dark:text-white font-mono">${formatTime(nap90)}</span>
            </div>
        `;
    };

    const calcBedTimes = () => {
        if (!inWakeTime.value) return;
        const wakeDate = parseTimeString(inWakeTime.value);
        const fallAsleep = parseInt(inFallAsleep.value) || 0;

        resList.innerHTML = '';
        resTitle.textContent = 'BẠN NÊN ĐI NGỦ VÀO LÚC:';
        resDesc.innerHTML = `Để thức dậy tỉnh táo, hãy lên giường vào các giờ sau (đã trừ đi <strong>${fallAsleep} phút</strong> chìm vào giấc ngủ).`;
        resNapBox.classList.add('hidden');

        // 6 chu kỳ
        const cyclesToCalculate = [6, 5, 4, 3, 2, 1]; 

        cyclesToCalculate.forEach((cycle, idx) => {
            let bedDate = new Date(wakeDate.getTime());
            bedDate.setMinutes(bedDate.getMinutes() - fallAsleep - (cycle * CYCLE_MINS));

            resList.innerHTML += renderCard(
                formatTime(bedDate),
                cycle,
                getCycleLabel(cycle),
                getCycleClass(cycle)
            );
        });
    };

    const calcDuration = () => {
        if (!inDurSleep.value || !inDurWake.value) return;

        const fallAsleep = parseInt(inFallAsleep.value) || 0;
        const dSleep = parseTimeString(inDurSleep.value);
        let dWake = parseTimeString(inDurWake.value);

        if (dWake <= dSleep) {
            dWake.setDate(dWake.getDate() + 1);
        }

        let totalMins = Math.round((dWake - dSleep) / 60000);
        let realSleepMins = totalMins - fallAsleep;
        
        if (realSleepMins < 0) realSleepMins = 0; 

        const hours = Math.floor(realSleepMins / 60);
        const mins = realSleepMins % 60;
        const cycles = (realSleepMins / CYCLE_MINS).toFixed(1);

        durTotal.textContent = `${hours}g ${mins}p`;
        durCyclesText.textContent = `Tương đương ~${cycles} chu kỳ`;

        if (cycles >= 5 && cycles <= 6.5) {
            durEval.innerHTML = `<span class="text-emerald-500 font-bold"><i class="fas fa-check-circle"></i> Tuyệt vời!</span> Thời lượng ngủ lý tưởng cho sức khỏe thể chất và tinh thần.`;
            durTotal.className = 'text-5xl font-black text-emerald-500 font-mono tracking-tighter mb-2';
        } else if (cycles >= 4 && cycles < 5) {
            durEval.innerHTML = `<span class="text-blue-500 font-bold"><i class="fas fa-info-circle"></i> Tạm ổn.</span> Ngủ 6 tiếng đủ để hoạt động, nhưng hãy cố gắng thêm 1 chu kỳ nữa để phục hồi tốt hơn.`;
            durTotal.className = 'text-5xl font-black text-blue-500 font-mono tracking-tighter mb-2';
        } else if (cycles > 6.5) {
            durEval.innerHTML = `<span class="text-orange-500 font-bold"><i class="fas fa-exclamation-triangle"></i> Hơi nhiều!</span> Ngủ quá giấc (hơn 9 tiếng) đôi khi làm cơ thể bị "say ngủ" và mệt mỏi hơn.`;
            durTotal.className = 'text-5xl font-black text-orange-500 font-mono tracking-tighter mb-2';
        } else {
            durEval.innerHTML = `<span class="text-red-500 font-bold"><i class="fas fa-times-circle"></i> Thiếu ngủ nghiêm trọng!</span> Cơ thể không có đủ thời gian để dọn dẹp độc tố trong não và phục hồi cơ bắp.`;
            durTotal.className = 'text-5xl font-black text-red-500 font-mono tracking-tighter mb-2';
        }
    };

    // --- SỰ KIỆN LẮNG NGHE ---

    const triggerCalc = () => {
        if (currentMode === 'wake') {
            if (inSleepTime.value) calcWakeTimes(parseTimeString(inSleepTime.value));
        } else if (currentMode === 'bed') {
            calcBedTimes();
        } else if (currentMode === 'duration') {
            calcDuration();
        }
    };

    inFallAsleep.addEventListener('input', (e) => {
        valFallAsleep.textContent = `${e.target.value} phút`;
        triggerCalc();
    });

    btnSetNows.forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.value = formatTime(new Date()); 
                targetInput.dispatchEvent(new Event('input')); 
            }
        };
    });

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
                t.classList.add('text-zinc-400', 'border-transparent');
            });
            tab.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
            tab.classList.remove('text-zinc-400', 'border-transparent');
            
            currentMode = tab.dataset.mode;
            Object.values(panes).forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            panes[currentMode].classList.remove('hidden'); panes[currentMode].classList.add('block');

            if (currentMode === 'duration') {
                resCyclesBox.classList.remove('block'); resCyclesBox.classList.add('hidden');
                resDurBox.classList.remove('hidden'); resDurBox.classList.add('flex');
            } else {
                resCyclesBox.classList.remove('hidden'); resCyclesBox.classList.add('block');
                resDurBox.classList.remove('flex'); resDurBox.classList.add('hidden');
            }

            triggerCalc();
        };
    });

    inSleepTime.addEventListener('input', triggerCalc);
    inWakeTime.addEventListener('input', triggerCalc);
    inDurSleep.addEventListener('input', triggerCalc);
    inDurWake.addEventListener('input', triggerCalc);

    document.getElementById('btn-slp-reset').onclick = () => {
        tabs[0].click(); 
        
        inWakeTime.value = '06:00';
        inDurSleep.value = '23:00';
        inDurWake.value = '06:00';
        inFallAsleep.value = 15;
        valFallAsleep.textContent = '15 phút';
        
        inSleepTime.value = formatTime(new Date()); 
        triggerCalc();
    };

    // Khởi chạy mặc định
    inSleepTime.value = formatTime(new Date());
    inDurSleep.value = '23:00';
    inDurWake.value = '06:00';
    triggerCalc();
}