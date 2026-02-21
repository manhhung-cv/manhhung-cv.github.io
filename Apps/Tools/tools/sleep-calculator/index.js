import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .slp-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            @media (min-width: 992px) { .slp-layout { display: grid; grid-template-columns: 1fr 1fr; align-items: start; } }
            
            .slp-sticky { position: sticky; top: 80px; }
            
            /* Tùy chỉnh danh sách kết quả dạng Lưới (Grid) */
            .cycle-list { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 12px; 
                margin-top: 20px; 
            }
            @media (min-width: 576px) {
                .cycle-list { grid-template-columns: repeat(3, 1fr); }
            }
            
            .cycle-card { 
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 16px 12px; border-radius: var(--radius); border: 1px solid var(--border);
                background: var(--bg-main); transition: all 0.2s; position: relative; overflow: hidden;
            }
            .cycle-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: transparent; }
            
            .cycle-badge { position: absolute; top: 0; left: 0; width: 100%; height: 4px; }
            
            .cycle-time { font-size: 1.7rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; line-height: 1; }
            .cycle-count { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; }
            .cycle-dur { font-size: 0.8rem; color: var(--text-mut); }
            
            /* Màu sắc đánh giá chu kỳ */
            .cycle-optimal { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); }
            .cycle-optimal .cycle-badge { background: #10b981; }
            .cycle-optimal .cycle-count { color: #10b981; }
            
            .cycle-warning { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2); }
            .cycle-warning .cycle-badge { background: #f59e0b; }
            .cycle-warning .cycle-count { color: #f59e0b; }
            
            .cycle-bad { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }
            .cycle-bad .cycle-badge { background: #ef4444; }
            .cycle-bad .cycle-count { color: #ef4444; }

            /* Result Box Mode 3 */
            .dur-result-box {
                background: var(--bg-main); border: 1px solid var(--border);
                border-radius: var(--radius); padding: 24px; text-align: center; margin-top: 16px;
            }
            .dur-val { font-size: 2.5rem; font-weight: 700; color: #3b82f6; line-height: 1.2; margin: 8px 0; }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Máy Tính Giấc Ngủ</h1>
                <p class="text-mut">Tính toán thời điểm ngủ/dậy tối ưu dựa trên chu kỳ giấc ngủ 90 phút.</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-slp-reset" style="color: #ef4444;">
                <i class="fas fa-redo"></i> Đặt lại
            </button>
        </div>

        <div class="slp-layout">
            
            <div class="card" style="padding: 20px;">
                <div class="tabs" id="slp-tabs">
                    <button class="tab-btn active" data-mode="wake"><i class="fas fa-sun"></i> Giờ thức dậy</button>
                    <button class="tab-btn" data-mode="bed"><i class="fas fa-moon"></i> Giờ đi ngủ</button>
                    <button class="tab-btn" data-mode="duration"><i class="fas fa-hourglass-half"></i> Thời lượng</button>
                </div>

                <div id="mode-wake" class="slp-pane">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Nếu tôi đi ngủ vào lúc...</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="time" class="input slp-input" id="in-sleep-time" style="flex: 1; font-size: 1.2rem; text-align: center; padding: 12px;">
                            <button class="btn btn-outline btn-set-now" data-target="in-sleep-time" title="Lấy giờ hiện tại">
                                <i class="fas fa-clock"></i> Bây giờ
                            </button>
                        </div>
                    </div>
                </div>

                <div id="mode-bed" class="slp-pane" style="display: none;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Tôi muốn thức dậy vào lúc...</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="time" class="input slp-input" id="in-wake-time" value="06:00" style="flex: 1; font-size: 1.2rem; text-align: center; padding: 12px;">
                            <button class="btn btn-outline btn-set-now" data-target="in-wake-time" title="Lấy giờ hiện tại">
                                <i class="fas fa-clock"></i> Hiện tại
                            </button>
                        </div>
                    </div>
                </div>

                <div id="mode-duration" class="slp-pane" style="display: none;">
                    <div class="grid-2">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Giờ đi ngủ</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="time" class="input slp-input" id="in-dur-sleep" value="23:00" style="flex: 1; font-size: 1.1rem; text-align: center;">
                                <button class="btn btn-outline btn-set-now" data-target="in-dur-sleep" title="Lấy giờ hiện tại" style="padding: 0 12px;">
                                    <i class="fas fa-clock"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Giờ thức dậy</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="time" class="input slp-input" id="in-dur-wake" value="06:00" style="flex: 1; font-size: 1.1rem; text-align: center;">
                                <button class="btn btn-outline btn-set-now" data-target="in-dur-wake" title="Lấy giờ hiện tại" style="padding: 0 12px;">
                                    <i class="fas fa-clock"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="slp-sticky">
                <div class="card" style="padding: 24px; background: var(--bg-sec); min-height: 300px;" id="res-container">
                    
                    <div id="res-cycles">
                        <h3 class="h3" id="res-title" style="margin-bottom: 8px;">Bạn nên thức dậy vào lúc:</h3>
                        <p class="text-mut" style="font-size: 0.9rem;" id="res-desc">
                            Máy tính đã cộng thêm trung bình <strong>15 phút</strong> để chìm vào giấc ngủ. Hãy chọn thức dậy vào cuối các chu kỳ sau:
                        </p>
                        
                        <div class="cycle-list" id="res-list">
                            </div>
                    </div>

                    <div id="res-duration-box" style="display: none;">
                        <h3 class="h3" style="margin-bottom: 8px; text-align: center;">Đánh giá thời lượng</h3>
                        <div class="dur-result-box">
                            <div class="text-mut">Tổng thời gian ngủ của bạn là:</div>
                            <div class="dur-val" id="dur-total">0g 0p</div>
                            <div id="dur-cycles-text" style="font-weight: 500; margin-bottom: 8px;">Tương đương 0 chu kỳ</div>
                            <div id="dur-eval" style="font-size: 0.9rem; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border);"></div>
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

    const btnSetNows = document.querySelectorAll('.btn-set-now'); 

    const resCyclesBox = document.getElementById('res-cycles');
    const resDurBox = document.getElementById('res-duration-box');
    const resTitle = document.getElementById('res-title');
    const resDesc = document.getElementById('res-desc');
    const resList = document.getElementById('res-list');
    
    const durTotal = document.getElementById('dur-total');
    const durCyclesText = document.getElementById('dur-cycles-text');
    const durEval = document.getElementById('dur-eval');

    let currentMode = 'wake';
    const FALL_ASLEEP_MINS = 15;
    const CYCLE_MINS = 90;

    // --- UTILS ---
    const formatTime = (date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const getCycleClass = (cycles) => {
        if (cycles === 5 || cycles === 6) return 'cycle-optimal';
        if (cycles === 4) return 'cycle-warning';
        return 'cycle-bad';
    };

    const getCycleLabel = (cycles) => {
        if (cycles === 6) return 'Ngủ 9 tiếng';
        if (cycles === 5) return 'Ngủ 7.5 tiếng';
        if (cycles === 4) return 'Ngủ 6 tiếng';
        if (cycles === 3) return 'Ngủ 4.5 tiếng';
        if (cycles === 2) return 'Ngủ 3 tiếng';
        if (cycles === 1) return 'Ngủ 1.5 tiếng';
        return '';
    };

    const parseTimeString = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        let d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    // --- CALCULATION LOGIC ---

    const calcWakeTimes = (sleepDate) => {
        resList.innerHTML = '';
        resTitle.textContent = 'Bạn nên thức dậy vào lúc:';
        resDesc.innerHTML = `Đã cộng thêm <strong>${FALL_ASLEEP_MINS} phút</strong> để nhắm mắt. Đặt báo thức vào 1 trong 6 mốc sau để không bị mệt mỏi:`;

        // Tính 6 chu kỳ, ưu tiên hiển thị mốc xa nhất (tối ưu nhất) đầu tiên
        const cyclesToCalculate = [6, 5, 4, 3, 2, 1]; 

        cyclesToCalculate.forEach(cycle => {
            let wakeDate = new Date(sleepDate.getTime());
            wakeDate.setMinutes(wakeDate.getMinutes() + FALL_ASLEEP_MINS + (cycle * CYCLE_MINS));

            const card = document.createElement('div');
            card.className = `cycle-card ${getCycleClass(cycle)}`;
            card.innerHTML = `
                <div class="cycle-badge"></div>
                <div class="cycle-time">${formatTime(wakeDate)}</div>
                <div class="cycle-count">${cycle} chu kỳ</div>
                <div class="cycle-dur">${getCycleLabel(cycle)}</div>
            `;
            resList.appendChild(card);
        });
    };

    const calcBedTimes = () => {
        if (!inWakeTime.value) return;
        const wakeDate = parseTimeString(inWakeTime.value);

        resList.innerHTML = '';
        resTitle.textContent = 'Bạn nên đi ngủ vào lúc:';
        resDesc.innerHTML = `Để thức dậy tỉnh táo lúc <b>${inWakeTime.value}</b>, hãy lên giường vào một trong các giờ sau (đã trừ hao 15p nhắm mắt):`;

        // Tính 6 chu kỳ
        const cyclesToCalculate = [6, 5, 4, 3, 2, 1]; 

        cyclesToCalculate.forEach(cycle => {
            let bedDate = new Date(wakeDate.getTime());
            bedDate.setMinutes(bedDate.getMinutes() - FALL_ASLEEP_MINS - (cycle * CYCLE_MINS));

            const card = document.createElement('div');
            card.className = `cycle-card ${getCycleClass(cycle)}`;
            card.innerHTML = `
                <div class="cycle-badge"></div>
                <div class="cycle-time">${formatTime(bedDate)}</div>
                <div class="cycle-count">${cycle} chu kỳ</div>
                <div class="cycle-dur">${getCycleLabel(cycle)}</div>
            `;
            resList.appendChild(card);
        });
    };

    const calcDuration = () => {
        if (!inDurSleep.value || !inDurWake.value) return;

        const dSleep = parseTimeString(inDurSleep.value);
        let dWake = parseTimeString(inDurWake.value);

        if (dWake <= dSleep) {
            dWake.setDate(dWake.getDate() + 1);
        }

        let totalMins = Math.round((dWake - dSleep) / 60000);
        let realSleepMins = totalMins - FALL_ASLEEP_MINS;
        
        if (realSleepMins < 0) realSleepMins = 0; 

        const hours = Math.floor(realSleepMins / 60);
        const mins = realSleepMins % 60;
        const cycles = (realSleepMins / CYCLE_MINS).toFixed(1);

        durTotal.textContent = `${hours}g ${mins}p`;
        durCyclesText.textContent = `Tương đương ~${cycles} chu kỳ`;

        if (cycles >= 5 && cycles <= 6.5) {
            durEval.innerHTML = `<span style="color:#10b981; font-weight:600;"><i class="fas fa-check-circle"></i> Tuyệt vời!</span> Thời lượng ngủ lý tưởng cho sức khỏe.`;
            durTotal.style.color = '#10b981';
        } else if (cycles >= 4 && cycles < 5) {
            durEval.innerHTML = `<span style="color:#f59e0b; font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Tạm ổn.</span> Nhưng hãy cố gắng ngủ thêm 1 chu kỳ nữa để phục hồi tốt hơn.`;
            durTotal.style.color = '#f59e0b';
        } else if (cycles > 6.5) {
            durEval.innerHTML = `<span style="color:#f59e0b; font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Ngủ hơi nhiều.</span> Ngủ quá giấc cũng có thể gây uể oải.`;
            durTotal.style.color = '#f59e0b';
        } else {
            durEval.innerHTML = `<span style="color:#ef4444; font-weight:600;"><i class="fas fa-times-circle"></i> Thiếu ngủ!</span> Cơ thể chưa có đủ thời gian để phục hồi.`;
            durTotal.style.color = '#ef4444';
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
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentMode = tab.dataset.mode;
            Object.values(panes).forEach(p => p.style.display = 'none');
            panes[currentMode].style.display = 'block';

            if (currentMode === 'duration') {
                resCyclesBox.style.display = 'none';
                resDurBox.style.display = 'block';
            } else {
                resCyclesBox.style.display = 'block';
                resDurBox.style.display = 'none';
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
        
        inSleepTime.value = formatTime(new Date()); 
        triggerCalc();
    };

    // Khởi chạy mặc định
    inSleepTime.value = formatTime(new Date());
    inDurSleep.value = formatTime(new Date());
    triggerCalc();
}