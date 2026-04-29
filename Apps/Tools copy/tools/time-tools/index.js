import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .tt-widget { max-width: 800px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Thanh gạt Danh mục */
            .tt-category-toggle { 
                display: flex; background: var(--bg-sec); border-radius: 30px; 
                padding: 4px; margin-bottom: 24px; border: 1px solid var(--border); 
                overflow-x: auto; scrollbar-width: none;
            }
            .tt-category-toggle::-webkit-scrollbar { display: none; }
            
            .tt-cat-btn { 
                flex: 1; text-align: center; padding: 10px 16px; border-radius: 26px; 
                border: none; background: transparent; color: var(--text-mut); 
                font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                font-size: 0.9rem; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 6px;
                white-space: nowrap; min-width: max-content;
            }
            .tt-cat-btn:hover { color: var(--text-main); }
            .tt-cat-btn.active { background: var(--bg-main); color: #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

            .tt-pane { display: none; animation: fadeIn 0.3s ease; }
            .tt-pane.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

            /* Màn hình hiển thị số lớn */
            .tt-display-box { 
                background: var(--bg-sec); border: 1px solid var(--border); border-radius: var(--radius);
                padding: 30px 20px; text-align: center; margin-bottom: 20px;
            }
            .tt-large-text { font-family: 'Courier New', Courier, monospace; font-size: 3.5rem; font-weight: 700; color: #3b82f6; line-height: 1; margin: 0; letter-spacing: 2px; }
            @media (max-width: 576px) { .tt-large-text { font-size: 2.5rem; } }
            
            .tt-sub-text { font-size: 0.9rem; color: var(--text-mut); margin-top: 8px; font-weight: 500; }

            /* Grid & Input */
            .tt-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
            .tt-input-col { display: flex; flex-direction: column; align-items: center; }
            .tt-input-col input { font-size: 1.5rem; text-align: center; padding: 12px; border-radius: 12px; }

            /* Quick Tags (Cho đếm ngược ngày) */
            .tt-quick-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            .tt-quick-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-sec); color: var(--text-mut); cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-weight: 500; }
            .tt-quick-btn:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: #3b82f6; }

            /* Switch (Toggle bật/tắt Trừ giờ nghỉ) */
            .tt-toggle-row { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
            .tt-switch { position: relative; width: 44px; height: 24px; background: var(--border); border-radius: 12px; transition: 0.3s; }
            .tt-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
            input:checked + .tt-switch { background: #3b82f6; }
            input:checked + .tt-switch::after { transform: translateX(20px); }

            /* Grid Tính Tuổi Chi Tiết */
            .age-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 24px; border-top: 1px dashed var(--border); padding-top: 24px; }
            @media (max-width: 576px) { .age-stats-grid { grid-template-columns: repeat(2, 1fr); } }
            .age-stat { background: var(--bg-main); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; transition: all 0.2s; }
            .age-stat:hover { border-color: #3b82f6; }
            .age-stat span { font-size: 0.8rem; color: var(--text-mut); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .age-stat strong { font-size: 1.2rem; color: var(--text-main); font-family: 'Courier New', monospace; font-weight: 700; }

            /* Các CSS cũ tái sử dụng */
            .tt-week-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
            .tt-week-lbl { padding: 6px 12px; border: 1px solid var(--border); border-radius: 20px; font-size: 0.85rem; cursor: pointer; background: var(--bg-sec); color: var(--text-mut); transition: all 0.2s; user-select: none; }
            .tt-week-lbl:has(input:checked) { background: #ef4444; color: white; border-color: #ef4444; }
            .tt-week-lbl input { display: none; }

            .tt-radio-group { display: flex; gap: 8px; margin-bottom: 16px; }
            .tt-radio-btn { flex: 1; padding: 10px; text-align: center; border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; font-weight: 500; color: var(--text-mut); transition: all 0.2s; }
            .tt-radio-btn:has(input:checked) { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); color: #3b82f6; }
            .tt-radio-btn input { display: none; }

            .tt-lap-list { max-height: 200px; overflow-y: auto; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px; }
            .tt-lap-item { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px dashed var(--border); font-family: monospace; font-size: 1.1rem; }
            .tt-lap-item:last-child { border-bottom: none; }
            
            .tt-ringing { animation: pulseRed 1s infinite; }
            @keyframes pulseRed { 0% { color: #3b82f6; } 50% { color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.5); } 100% { color: #3b82f6; } }

        </style>

        <div class="tt-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Đồng hồ & Thời gian</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">7 tiện ích thời gian mạnh mẽ trong 1 công cụ.</p>
                </div>
            </div>

            <div class="tt-category-toggle" id="tt-tabs">
                <button class="tt-cat-btn active" data-target="pane-timer"><i class="fas fa-hourglass-start"></i> Đếm ngược</button>
                <button class="tt-cat-btn" data-target="pane-stopwatch"><i class="fas fa-stopwatch"></i> Bấm giờ</button>
                <button class="tt-cat-btn" data-target="pane-countday"><i class="fas fa-calendar-alt"></i> Đếm ngược Ngày</button>
                <button class="tt-cat-btn" data-target="pane-datecalc"><i class="fas fa-calculator"></i> Tính Ngày</button>
                <button class="tt-cat-btn" data-target="pane-timecalc"><i class="fas fa-clock"></i> Tính Giờ</button>
                <button class="tt-cat-btn" data-target="pane-week"><i class="fas fa-calendar-week"></i> Số Tuần</button>
                <button class="tt-cat-btn" data-target="pane-age"><i class="fas fa-birthday-cake"></i> Tính Tuổi</button>
            </div>

            <div class="card" style="padding: 24px;">
                
                <div id="pane-timer" class="tt-pane active">
                    <div class="tt-display-box">
                        <div class="tt-large-text" id="timer-display">00:00:00</div>
                        <div class="tt-sub-text" id="timer-status">Chưa bắt đầu</div>
                    </div>
                    
                    <div class="tt-grid-3">
                        <div class="tt-input-col"><label class="form-label">Giờ</label><input type="number" class="input" id="timer-h" value="0" min="0" max="99"></div>
                        <div class="tt-input-col"><label class="form-label">Phút</label><input type="number" class="input" id="timer-m" value="5" min="0" max="59"></div>
                        <div class="tt-input-col"><label class="form-label">Giây</label><input type="number" class="input" id="timer-s" value="0" min="0" max="59"></div>
                    </div>

                    <div class="flex-row" style="gap: 12px; margin-top: 24px;">
                        <button class="btn btn-outline" id="btn-timer-reset" style="flex: 1; justify-content: center;"><i class="fas fa-undo"></i> Đặt lại</button>
                        <button class="btn btn-primary" id="btn-timer-start" style="flex: 2; justify-content: center;"><i class="fas fa-play"></i> Bắt đầu</button>
                    </div>
                </div>

                <div id="pane-stopwatch" class="tt-pane">
                    <div class="tt-display-box">
                        <div class="tt-large-text" id="sw-display">00:00:00.<small>00</small></div>
                    </div>
                    
                    <div class="flex-row" style="gap: 12px;">
                        <button class="btn btn-outline" id="btn-sw-lap" style="flex: 1; justify-content: center;" disabled><i class="fas fa-flag"></i> Vòng (Lap)</button>
                        <button class="btn btn-primary" id="btn-sw-start" style="flex: 1; justify-content: center;"><i class="fas fa-play"></i> Bắt đầu</button>
                        <button class="btn btn-ghost" id="btn-sw-reset" style="flex: 1; justify-content: center; color: #ef4444;"><i class="fas fa-redo"></i> Đặt lại</button>
                    </div>

                    <div class="tt-lap-list" id="sw-laps"></div>
                </div>

                <div id="pane-countday" class="tt-pane">
                    <div class="form-group">
                        <label class="form-label">Chọn Ngày & Giờ đích</label>
                        <input type="datetime-local" class="input" id="cd-target" style="font-size: 1.1rem; padding: 12px;">
                        
                        <div class="tt-quick-tags">
                            <button class="tt-quick-btn cd-quick" data-type="newyear">🎉 Năm mới</button>
                            <button class="tt-quick-btn cd-quick" data-type="valentine">💖 Valentine</button>
                            <button class="tt-quick-btn cd-quick" data-type="halloween">🎃 Halloween</button>
                            <button class="tt-quick-btn cd-quick" data-type="christmas">🎄 Giáng sinh</button>
                        </div>
                    </div>
                    
                    <div class="tt-display-box" style="margin-top: 24px; padding: 40px 20px;">
                        <div class="tt-large-text" id="cd-display" style="font-size: 2.5rem;">0d 0h 0m 0s</div>
                        <div class="tt-sub-text" id="cd-status">Vui lòng chọn ngày trong tương lai</div>
                    </div>
                </div>

                <div id="pane-datecalc" class="tt-pane">
                    <div class="tt-radio-group">
                        <label class="tt-radio-btn"><input type="radio" name="dc-mode" value="diff" checked> Đếm số ngày giữa 2 mốc</label>
                        <label class="tt-radio-btn"><input type="radio" name="dc-mode" value="addsub"> Cộng / Trừ ngày</label>
                    </div>

                    <div id="dc-mode-diff">
                        <div class="grid-2">
                            <div class="form-group"><label class="form-label">Từ ngày</label><input type="date" class="input dc-trigger" id="dc-start"></div>
                            <div class="form-group"><label class="form-label">Đến ngày</label><input type="date" class="input dc-trigger" id="dc-end"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="dc-inc-last" class="dc-trigger" style="width:16px; height:16px; accent-color:#3b82f6;"> 
                                Bao gồm cả ngày cuối cùng (+1 ngày)
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Loại trừ các ngày trong tuần khỏi kết quả đếm:</label>
                            <div class="tt-week-group">
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="1"> Thứ 2</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="2"> Thứ 3</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="3"> Thứ 4</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="4"> Thứ 5</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="5"> Thứ 6</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="6"> Thứ 7</label>
                                <label class="tt-week-lbl"><input type="checkbox" class="dc-exclude dc-trigger" value="0"> Chủ Nhật</label>
                            </div>
                        </div>
                    </div>

                    <div id="dc-mode-addsub" style="display: none;">
                        <div class="form-group"><label class="form-label">Ngày bắt đầu</label><input type="date" class="input dc-trigger" id="dc-base"></div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Phép tính</label>
                                <select class="input dc-trigger" id="dc-op">
                                    <option value="add">Cộng (+) ngày</option>
                                    <option value="sub">Trừ (-) ngày</option>
                                </select>
                            </div>
                            <div class="form-group"><label class="form-label">Số ngày</label><input type="number" class="input dc-trigger" id="dc-days" value="30" min="0"></div>
                        </div>
                    </div>

                    <div class="tt-display-box" style="padding: 20px;">
                        <div class="tt-sub-text" style="margin-bottom: 8px; margin-top: 0;">Kết quả:</div>
                        <div class="tt-large-text" id="dc-result" style="font-size: 2rem;">--</div>
                    </div>
                </div>

                <div id="pane-timecalc" class="tt-pane">
                    <div class="tt-radio-group">
                        <label class="tt-radio-btn"><input type="radio" name="tc-mode" value="duration" checked> Khoảng thời lượng</label>
                        <label class="tt-radio-btn"><input type="radio" name="tc-mode" value="math"> Cộng / Trừ Giờ</label>
                    </div>

                    <div id="tc-mode-dur">
                        <div class="grid-2">
                            <div class="form-group"><label class="form-label">Giờ Bắt đầu</label><input type="time" class="input tc-trigger" id="tc-start" value="08:00"></div>
                            <div class="form-group"><label class="form-label">Giờ Kết thúc</label><input type="time" class="input tc-trigger" id="tc-end" value="17:30"></div>
                        </div>
                        <div class="form-group">
                            <label class="tt-toggle-row" style="margin-bottom: 8px;">
                                <input type="checkbox" id="tc-has-break" class="tc-trigger" style="display:none;" checked>
                                <div class="tt-switch"></div>
                                <span style="font-weight:500; font-size:0.9rem; color:var(--text-main);">Trừ đi thời gian nghỉ giữa giờ (Phút)</span>
                            </label>
                            <input type="number" class="input tc-trigger" id="tc-break" value="60" min="0" style="transition: opacity 0.3s;">
                        </div>
                    </div>

                    <div id="tc-mode-math" style="display: none;">
                        <div class="form-group"><label class="form-label">Giờ gốc</label><input type="time" class="input tc-trigger" id="tc-base" value="10:00"></div>
                        <div class="grid-2">
                            <div class="form-group"><label class="form-label">Thao tác</label><select class="input tc-trigger" id="tc-op"><option value="add">Cộng (+) thêm</option><option value="sub">Trừ (-) bớt</option></select></div>
                            <div class="form-group"><label class="form-label">Thời lượng (Giờ : Phút)</label>
                                <div style="display:flex; gap:8px;">
                                    <input type="number" class="input tc-trigger" id="tc-add-h" value="2" min="0" placeholder="Giờ">
                                    <input type="number" class="input tc-trigger" id="tc-add-m" value="30" min="0" max="59" placeholder="Phút">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tt-display-box" style="padding: 20px;">
                        <div class="tt-sub-text" style="margin-bottom: 8px; margin-top: 0;">Kết quả:</div>
                        <div class="tt-large-text" id="tc-result" style="font-size: 2.2rem;">--</div>
                        <div class="tt-sub-text" id="tc-decimal" style="display: none; color: #10b981;">(Tương đương: 0.00 giờ thập phân)</div>
                    </div>
                </div>

                <div id="pane-week" class="tt-pane">
                    <div class="form-group">
                        <label class="form-label">Kiểm tra số tuần của ngày:</label>
                        <input type="date" class="input" id="wk-date" style="font-size: 1.1rem; padding: 12px;">
                    </div>
                    
                    <div class="tt-display-box" style="margin-top: 24px; padding: 30px 20px;">
                        <div class="tt-sub-text" style="margin-bottom: 8px; margin-top: 0;">Ngày này thuộc:</div>
                        <div class="tt-large-text" id="wk-number" style="font-size: 3rem;">Tuần --</div>
                        <div class="tt-sub-text" id="wk-range" style="font-size: 1.1rem; margin-top: 16px; color: var(--text-main);">-- đến --</div>
                        <div class="tt-sub-text" id="wk-year">Năm ---- có tổng cộng -- tuần.</div>
                    </div>
                </div>

                <div id="pane-age" class="tt-pane">
                    <div class="grid-2">
                        <div class="form-group"><label class="form-label">Ngày sinh của bạn</label><input type="date" class="input age-trigger" id="age-dob"></div>
                        <div class="form-group"><label class="form-label">Tính đến ngày</label><input type="date" class="input age-trigger" id="age-target"></div>
                    </div>
                    
                    <div class="tt-display-box" style="padding: 20px; background: transparent; border: none;">
                        <div class="tt-sub-text" style="margin: 0; font-size: 1rem;">Bạn sinh vào: <strong id="age-weekday" style="color:var(--text-main); font-size: 1.2rem;">---</strong></div>
                        <div class="tt-large-text" id="age-main" style="font-size: 2rem; color: #10b981; margin: 16px 0;">-- Năm, -- Tháng, -- Ngày</div>
                        
                        <div class="age-stats-grid">
                            <div class="age-stat"><span>Tổng Tháng</span><strong id="age-m">--</strong></div>
                            <div class="age-stat"><span>Tổng Tuần</span><strong id="age-w">--</strong></div>
                            <div class="age-stat"><span>Tổng Ngày</span><strong id="age-d">--</strong></div>
                            <div class="age-stat"><span>Tổng Giờ</span><strong id="age-h">--</strong></div>
                            <div class="age-stat"><span>Tổng Phút</span><strong id="age-min">--</strong></div>
                            <div class="age-stat" style="border-color: #3b82f6; background: rgba(59,130,246,0.05);">
                                <span style="color:#3b82f6;">Tổng Giây (Live)</span>
                                <strong id="age-sec" style="color:#3b82f6;">--</strong>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;
}

export function init() {
    // --- Utils ---
    const format2 = (num) => num.toString().padStart(2, '0');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // --- Audio Beep Generator ---
    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { console.log('Audio không hỗ trợ'); }
    };

    // ==========================================
    // MODULE 1: TIMER (ĐẾM NGƯỢC)
    // ==========================================
    const Timer = {
        h: document.getElementById('timer-h'), m: document.getElementById('timer-m'), s: document.getElementById('timer-s'),
        disp: document.getElementById('timer-display'), stat: document.getElementById('timer-status'),
        btnStart: document.getElementById('btn-timer-start'), btnReset: document.getElementById('btn-timer-reset'),
        interval: null, totalSecs: 0, isRunning: false,
        
        init() {
            this.btnStart.onclick = () => { if (this.isRunning) this.pause(); else this.start(); };
            this.btnReset.onclick = () => this.reset();
        },
        start() {
            if (this.totalSecs <= 0) {
                this.totalSecs = (parseInt(this.h.value)||0)*3600 + (parseInt(this.m.value)||0)*60 + (parseInt(this.s.value)||0);
            }
            if (this.totalSecs <= 0) return UI.showAlert('Lỗi', 'Vui lòng đặt thời gian lớn hơn 0.', 'warning');
            
            this.isRunning = true;
            this.btnStart.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
            this.btnStart.classList.replace('btn-primary', 'btn-outline');
            this.stat.textContent = 'Đang chạy...';
            this.disp.classList.remove('tt-ringing');
            
            document.querySelector('.tt-grid-3').style.display = 'none';
            
            this.interval = setInterval(() => {
                this.totalSecs--;
                this.updateDisplay();
                if (this.totalSecs <= 0) this.finish();
            }, 1000);
        },
        pause() {
            this.isRunning = false;
            clearInterval(this.interval);
            this.btnStart.innerHTML = '<i class="fas fa-play"></i> Tiếp tục';
            this.btnStart.classList.replace('btn-outline', 'btn-primary');
            this.stat.textContent = 'Đã tạm dừng';
        },
        finish() {
            this.pause();
            this.btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt đầu lại';
            this.stat.textContent = 'HẾT GIỜ!';
            this.stat.style.color = '#ef4444';
            this.disp.classList.add('tt-ringing');
            playBeep(); setTimeout(playBeep, 800);
            document.querySelector('.tt-grid-3').style.display = 'grid';
        },
        reset() {
            this.pause();
            this.totalSecs = 0;
            this.h.value = '0'; this.m.value = '5'; this.s.value = '0';
            this.updateDisplay(0, 5, 0);
            this.stat.textContent = 'Chưa bắt đầu';
            this.stat.style.color = 'var(--text-mut)';
            this.btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt đầu';
            this.disp.classList.remove('tt-ringing');
            document.querySelector('.tt-grid-3').style.display = 'grid';
        },
        updateDisplay(th, tm, ts) {
            let h = th !== undefined ? th : Math.floor(this.totalSecs / 3600);
            let m = tm !== undefined ? tm : Math.floor((this.totalSecs % 3600) / 60);
            let s = ts !== undefined ? ts : this.totalSecs % 60;
            this.disp.textContent = `${format2(h)}:${format2(m)}:${format2(s)}`;
        }
    };
    Timer.init();

    // ==========================================
    // MODULE 2: STOPWATCH (BẤM GIỜ) - FIXED
    // ==========================================
    const Stopwatch = {
        disp: document.getElementById('sw-display'), lapsBox: document.getElementById('sw-laps'),
        btnStart: document.getElementById('btn-sw-start'), btnLap: document.getElementById('btn-sw-lap'), btnReset: document.getElementById('btn-sw-reset'),
        startTime: 0, elapsedTime: 0, isRunning: false, lapCount: 0,
        
        init() {
            this.btnStart.onclick = () => { if (this.isRunning) this.pause(); else this.start(); };
            this.btnReset.onclick = () => this.reset();
            this.btnLap.onclick = () => this.lap();
        },
        start() {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.btnStart.innerHTML = '<i class="fas fa-pause"></i> Dừng';
            this.btnStart.classList.replace('btn-primary', 'btn-outline');
            this.btnLap.disabled = false;
            
            const update = () => {
                this.elapsedTime = Date.now() - this.startTime;
                // FIX LỖI: Dùng innerHTML thay vì textContent để render thẻ <small>
                this.disp.innerHTML = this.format(this.elapsedTime);
                if (this.isRunning) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        },
        pause() {
            this.isRunning = false;
            this.btnStart.innerHTML = '<i class="fas fa-play"></i> Tiếp tục';
            this.btnStart.classList.replace('btn-outline', 'btn-primary');
            this.btnLap.disabled = true;
        },
        reset() {
            this.pause();
            this.elapsedTime = 0;
            this.lapCount = 0;
            this.disp.innerHTML = '00:00:00.<small>00</small>';
            this.lapsBox.innerHTML = '';
        },
        lap() {
            this.lapCount++;
            const div = document.createElement('div');
            div.className = 'tt-lap-item';
            div.innerHTML = `<span style="color:var(--text-mut);">Vòng ${this.lapCount}</span> <span>${this.format(this.elapsedTime)}</span>`;
            this.lapsBox.prepend(div);
        },
        format(ms) {
            let d = new Date(ms);
            let h = Math.floor(ms / 3600000);
            let m = d.getUTCMinutes();
            let s = d.getUTCSeconds();
            let mil = Math.floor(d.getUTCMilliseconds() / 10);
            return `${format2(h)}:${format2(m)}:${format2(s)}.<small>${format2(mil)}</small>`;
        }
    };
    Stopwatch.init();

    // ==========================================
    // MODULE 3: COUNTDOWN DATE (ĐẾM NGƯỢC NGÀY) - ADDED QUICK BUTTONS
    // ==========================================
    const CountDay = {
        input: document.getElementById('cd-target'), disp: document.getElementById('cd-display'), stat: document.getElementById('cd-status'),
        interval: null,
        
        init() {
            let tmr = new Date(); tmr.setDate(tmr.getDate() + 1); tmr.setHours(0,0,0,0);
            this.input.value = new Date(tmr.getTime() - tmr.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            
            this.input.addEventListener('change', () => this.start());
            
            // Xử lý nút bấm nhanh
            document.querySelectorAll('.cd-quick').forEach(btn => {
                btn.onclick = () => {
                    const now = new Date();
                    let y = now.getFullYear();
                    let target;
                    switch(btn.dataset.type) {
                        case 'newyear': target = new Date(y + 1, 0, 1, 0, 0); break;
                        case 'christmas': target = new Date(y, 11, 25, 0, 0); if (target < now) target.setFullYear(y + 1); break;
                        case 'valentine': target = new Date(y, 1, 14, 0, 0); if (target < now) target.setFullYear(y + 1); break;
                        case 'halloween': target = new Date(y, 9, 31, 0, 0); if (target < now) target.setFullYear(y + 1); break;
                    }
                    this.input.value = new Date(target.getTime() - target.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    this.start();
                };
            });

            this.start();
        },
        start() {
            clearInterval(this.interval);
            const target = new Date(this.input.value).getTime();
            
            const update = () => {
                const now = new Date().getTime();
                const diff = target - now;
                
                if (diff <= 0 || isNaN(diff)) {
                    this.disp.textContent = '0d 0h 0m 0s';
                    this.stat.textContent = 'Đã đến thời hạn!';
                    this.stat.style.color = '#ef4444';
                    clearInterval(this.interval);
                    return;
                }
                
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                
                this.disp.innerHTML = `${d}<small>d</small> ${h}<small>h</small> ${m}<small>m</small> ${s}<small>s</small>`;
                this.stat.textContent = 'Thời gian còn lại';
                this.stat.style.color = 'var(--text-mut)';
            };
            update();
            this.interval = setInterval(update, 1000);
        }
    };
    CountDay.init();

    // ==========================================
    // MODULE 4: DATE CALCULATOR (TÍNH NGÀY)
    // ==========================================
    const DateCalc = {
        modeRadios: document.querySelectorAll('input[name="dc-mode"]'),
        boxDiff: document.getElementById('dc-mode-diff'), boxAdd: document.getElementById('dc-mode-addsub'),
        dStart: document.getElementById('dc-start'), dEnd: document.getElementById('dc-end'),
        incLast: document.getElementById('dc-inc-last'), excludes: document.querySelectorAll('.dc-exclude'),
        dBase: document.getElementById('dc-base'), op: document.getElementById('dc-op'), days: document.getElementById('dc-days'),
        res: document.getElementById('dc-result'),
        
        init() {
            this.dStart.value = todayStr;
            let tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 30);
            this.dEnd.value = tomorrow.toISOString().split('T')[0];
            this.dBase.value = todayStr;

            this.modeRadios.forEach(r => r.addEventListener('change', () => {
                this.boxDiff.style.display = r.value === 'diff' ? 'block' : 'none';
                this.boxAdd.style.display = r.value === 'addsub' ? 'block' : 'none';
                this.calc();
            }));

            document.querySelectorAll('.dc-trigger').forEach(el => el.addEventListener('input', () => this.calc()));
            document.querySelectorAll('.dc-trigger').forEach(el => el.addEventListener('change', () => this.calc()));
            this.calc();
        },
        calc() {
            const mode = document.querySelector('input[name="dc-mode"]:checked').value;
            
            if (mode === 'diff') {
                if (!this.dStart.value || !this.dEnd.value) return this.res.textContent = '--';
                
                let start = new Date(this.dStart.value); start.setHours(0,0,0,0);
                let end = new Date(this.dEnd.value); end.setHours(0,0,0,0);
                if (start > end) [start, end] = [end, start];

                let excDays = Array.from(this.excludes).filter(cb => cb.checked).map(cb => parseInt(cb.value));
                let count = 0;
                let cur = new Date(start);
                
                while(cur < end) {
                    if (!excDays.includes(cur.getDay())) count++;
                    cur.setDate(cur.getDate() + 1);
                }
                
                if (this.incLast.checked && !excDays.includes(end.getDay())) count++;
                this.res.textContent = `${count} ngày`;
            } else {
                if (!this.dBase.value || !this.days.value) return this.res.textContent = '--';
                let base = new Date(this.dBase.value);
                let dNum = parseInt(this.days.value);
                if (this.op.value === 'sub') dNum = -dNum;
                
                base.setDate(base.getDate() + dNum);
                this.res.textContent = base.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                this.res.style.fontSize = '1.5rem';
            }
        }
    };
    DateCalc.init();

    // ==========================================
    // MODULE 5: TIME CALCULATOR (TÍNH GIỜ) - ADDED TOGGLE
    // ==========================================
    const TimeCalc = {
        modeRadios: document.querySelectorAll('input[name="tc-mode"]'),
        boxDur: document.getElementById('tc-mode-dur'), boxMath: document.getElementById('tc-mode-math'),
        start: document.getElementById('tc-start'), end: document.getElementById('tc-end'), 
        hasBreak: document.getElementById('tc-has-break'), brk: document.getElementById('tc-break'),
        base: document.getElementById('tc-base'), op: document.getElementById('tc-op'), addH: document.getElementById('tc-add-h'), addM: document.getElementById('tc-add-m'),
        res: document.getElementById('tc-result'), resDec: document.getElementById('tc-decimal'),
        
        init() {
            this.modeRadios.forEach(r => r.addEventListener('change', () => {
                this.boxDur.style.display = r.value === 'duration' ? 'block' : 'none';
                this.boxMath.style.display = r.value === 'math' ? 'block' : 'none';
                this.calc();
            }));

            // Bật/tắt ô nhập phút nghỉ
            this.hasBreak.addEventListener('change', () => {
                this.brk.disabled = !this.hasBreak.checked;
                this.brk.style.opacity = this.hasBreak.checked ? '1' : '0.4';
                this.calc();
            });

            document.querySelectorAll('.tc-trigger').forEach(el => el.addEventListener('input', () => this.calc()));
            this.calc();
        },
        calc() {
            const mode = document.querySelector('input[name="tc-mode"]:checked').value;
            
            if (mode === 'duration') {
                if (!this.start.value || !this.end.value) return;
                let [sH, sM] = this.start.value.split(':').map(Number);
                let [eH, eM] = this.end.value.split(':').map(Number);
                
                let bM = this.hasBreak.checked ? (parseInt(this.brk.value) || 0) : 0;
                
                let sMin = sH * 60 + sM;
                let eMin = eH * 60 + eM;
                if (eMin < sMin) eMin += 24 * 60; // Dậy qua ngày hôm sau
                
                let totalMin = eMin - sMin - bM;
                if (totalMin < 0) totalMin = 0;
                
                let rH = Math.floor(totalMin / 60);
                let rM = totalMin % 60;
                
                this.res.textContent = `${rH} giờ ${rM} phút`;
                
                let dec = (totalMin / 60).toFixed(2);
                this.resDec.textContent = `(Tương đương: ${dec} giờ làm việc)`;
                this.resDec.style.display = 'block';
            } else {
                this.resDec.style.display = 'none';
                if (!this.base.value) return;
                let [bH, bM] = this.base.value.split(':').map(Number);
                let aH = parseInt(this.addH.value) || 0;
                let aM = parseInt(this.addM.value) || 0;
                
                let totalMin = bH * 60 + bM;
                let addMin = aH * 60 + aM;
                
                if (this.op.value === 'add') totalMin += addMin;
                else totalMin -= addMin;
                
                totalMin = ((totalMin % 1440) + 1440) % 1440;
                
                let rH = Math.floor(totalMin / 60);
                let rM = totalMin % 60;
                this.res.textContent = `${format2(rH)}:${format2(rM)}`;
            }
        }
    };
    TimeCalc.init();

    // ==========================================
    // MODULE 6: WEEK NUMBER (SỐ TUẦN)
    // ==========================================
    const WeekCalc = {
        input: document.getElementById('wk-date'), resNum: document.getElementById('wk-number'),
        resRange: document.getElementById('wk-range'), resYear: document.getElementById('wk-year'),
        
        init() {
            this.input.value = todayStr;
            this.input.addEventListener('input', () => this.calc());
            this.calc();
        },
        getWeekInfo(d) {
            let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            let dayNum = date.getUTCDay() || 7;
            date.setUTCDate(date.getUTCDate() + 4 - dayNum);
            let yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
            let weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
            
            let dClone = new Date(d);
            let day = dClone.getDay(), diff = dClone.getDate() - day + (day === 0 ? -6 : 1); 
            let startWeek = new Date(dClone.setDate(diff));
            let endWeek = new Date(dClone.setDate(startWeek.getDate() + 6));
            
            return { weekNo, startWeek, endWeek, isoYear: date.getUTCFullYear() };
        },
        calc() {
            if (!this.input.value) return;
            const d = new Date(this.input.value);
            const info = this.getWeekInfo(d);
            
            this.resNum.textContent = `Tuần ${info.weekNo}`;
            const fmt = (dt) => dt.toLocaleDateString('vi-VN');
            this.resRange.textContent = `Từ ${fmt(info.startWeek)} đến ${fmt(info.endWeek)}`;
            
            const dec28 = new Date(info.isoYear, 11, 28);
            const maxWeek = this.getWeekInfo(dec28).weekNo;
            this.resYear.textContent = `Năm ISO ${info.isoYear} có tổng cộng ${maxWeek} tuần.`;
        }
    };
    WeekCalc.init();

    // ==========================================
    // MODULE 7: AGE CALCULATOR (TÍNH TUỔI) - MASSIVE UPGRADE
    // ==========================================
    const AgeCalc = {
        dob: document.getElementById('age-dob'), target: document.getElementById('age-target'),
        weekday: document.getElementById('age-weekday'), main: document.getElementById('age-main'),
        m: document.getElementById('age-m'), w: document.getElementById('age-w'), d: document.getElementById('age-d'),
        h: document.getElementById('age-h'), min: document.getElementById('age-min'), sec: document.getElementById('age-sec'),
        interval: null,
        
        init() {
            this.target.value = todayStr;
            this.dob.addEventListener('input', () => this.calc());
            this.target.addEventListener('input', () => this.calc());
        },
        calc() {
            clearInterval(this.interval);
            if (!this.dob.value || !this.target.value) return;
            
            let d1 = new Date(this.dob.value); // DOB (00:00:00)
            let d2 = new Date(this.target.value);
            
            if (d1 > d2) {
                this.main.textContent = 'Lỗi: Ngày sinh lớn hơn hiện tại.';
                return;
            }

            // 1. Tìm Thứ của Ngày sinh
            const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            this.weekday.textContent = daysOfWeek[d1.getDay()];

            // 2. Tính tuổi chính xác (Năm, Tháng, Ngày)
            let years = d2.getFullYear() - d1.getFullYear();
            let months = d2.getMonth() - d1.getMonth();
            let days = d2.getDate() - d1.getDate();

            if (days < 0) {
                months--;
                let prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
                days += prevMonth;
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            this.main.textContent = `${years} Năm, ${months} Tháng, ${days} Ngày`;

            // 3. Update Live Loop cho các thông số chi tiết
            const isTargetToday = (this.target.value === todayStr);

            const updateLive = () => {
                let targetTime = isTargetToday ? Date.now() : d2.getTime();
                let timeDiff = targetTime - d1.getTime();
                if (timeDiff < 0) timeDiff = 0;

                let tSecs = Math.floor(timeDiff / 1000);
                let tMins = Math.floor(tSecs / 60);
                let tHours = Math.floor(tMins / 60);
                let tDays = Math.floor(tHours / 24);
                let tWeeks = Math.floor(tDays / 7);
                
                // Tính tổng số tháng xấp xỉ chính xác
                let tMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
                if (d2.getDate() < d1.getDate()) tMonths--;
                if (tMonths < 0) tMonths = 0;

                this.m.textContent = tMonths.toLocaleString('vi-VN');
                this.w.textContent = tWeeks.toLocaleString('vi-VN');
                this.d.textContent = tDays.toLocaleString('vi-VN');
                this.h.textContent = tHours.toLocaleString('vi-VN');
                this.min.textContent = tMins.toLocaleString('vi-VN');
                this.sec.textContent = tSecs.toLocaleString('vi-VN');
            };

            updateLive(); // Gọi ngay 1 lần
            if (isTargetToday) {
                // Nếu đích là hôm nay, cho số giây nhảy liên tục mỗi giây
                this.interval = setInterval(updateLive, 1000);
            }
        }
    };
    AgeCalc.init();

    // ==========================================
    // LOGIC CHUYỂN TABS CHÍNH
    // ==========================================
    const catBtns = document.querySelectorAll('.tt-cat-btn');
    const panes = document.querySelectorAll('.tt-pane');
    
    catBtns.forEach(btn => {
        btn.onclick = () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            panes.forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');
            
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        };
    });
}