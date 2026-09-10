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
    <div id="morse-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #morse-root-container {
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

            @keyframes scanline {
                0% { top: 0%; opacity: 0.8; }
                50% { opacity: 0.3; }
                100% { top: 100%; opacity: 0.8; }
            }
            .animate-scanline {
                position: absolute;
                animation: scanline 2.5s linear infinite;
            }

            .morse-range {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                background: transparent;
                outline: none;
                height: 20px;
                cursor: pointer;
            }
            .morse-range::-webkit-slider-runnable-track {
                height: 6px;
                background: rgba(0, 0, 0, 0.08);
                border-radius: 9999px;
            }
            .dark .morse-range::-webkit-slider-runnable-track {
                background: rgba(255, 255, 255, 0.12);
            }
            .morse-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 18px;
                width: 18px;
                border-radius: 50%;
                background: #ffffff;
                border: 2px solid var(--kit-accent);
                margin-top: -6px;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
                transition: transform 0.1s ease;
            }
            .morse-range:active::-webkit-slider-thumb {
                transform: scale(1.15);
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1 select-none">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Signal Core</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Morse AI Pro</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Bộ dịch thuật mã Morse hai chiều, truyền phát quang học OLED & âm thanh WebAudio tần số cao.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: DỊCH THUẬT HAI CHIỀU (7 COLS) -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                        
                        <!-- CHUYỂN HƯỚNG DỊCH (SEGMENTED TABS) -->
                        <div class="flex items-center justify-between gap-2 select-none">
                            <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] flex-1 max-w-xs" id="mc-direction-tabs">
                                <button type="button" class="mc-dir-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-mode="text2morse">
                                    Văn bản ➔ Morse
                                </button>
                                <button type="button" class="mc-dir-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-mode="morse2text">
                                    Morse ➔ Văn bản
                                </button>
                            </div>

                            <button type="button" id="btn-mc-swap" class="w-9 h-9 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center active:scale-90 transition-all shadow-sm" title="Đảo chiều dịch">
                                <i class="fas fa-arrow-right-arrow-left text-xs"></i>
                            </button>
                        </div>

                        <!-- KHU VỰC NHẬP & KẾT QUẢ -->
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <div class="flex items-center justify-between select-none">
                                    <label for="mc-input" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5" id="lbl-mc-input">Văn bản nguồn</label>
                                    <button type="button" id="btn-mc-clear" class="text-[10px] font-bold text-rose-500 hover:opacity-80 transition-opacity">Xóa</button>
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3 focus-within:border-accent-theme transition-all cursor-text">
                                    <textarea id="mc-input" class="w-full bg-transparent border-none outline-none text-sm font-mono text-zinc-900 dark:text-white resize-none min-h-[120px] no-scrollbar placeholder-zinc-400 select-text" placeholder="Nhập văn bản cần mã hóa hoặc mã Morse..."></textarea>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <div class="flex items-center justify-between select-none">
                                    <label for="mc-output" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5" id="lbl-mc-output">Tín hiệu đầu ra</label>
                                    <button type="button" id="btn-mc-copy" class="text-[10px] font-bold text-accent-theme hover:underline flex items-center gap-1">
                                        <i class="far fa-copy text-[10px]"></i> Chép kết quả
                                    </button>
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3 transition-all">
                                    <textarea id="mc-output" readonly class="w-full bg-transparent border-none outline-none text-sm font-mono text-zinc-800 dark:text-zinc-200 resize-none min-h-[120px] no-scrollbar placeholder-zinc-400 select-all" placeholder="Kết quả dịch hiển thị tại đây..."></textarea>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- CỘT PHẢI: PHÁT TÍN HIỆU & ĐIỀU KHIỂN (5 COLS) -->
                <div class="lg:col-span-5 flex flex-col gap-4 select-none">
                    
                    <!-- MONITOR PHÁT SÁNG & ÂM THANH -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm text-center relative overflow-hidden space-y-5">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Signal Monitor</span>
                            <button type="button" id="btn-mc-fullscreen" class="w-8 h-8 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center active:scale-95 transition-all" title="Phát toàn màn hình OLED">
                                <i class="fas fa-expand text-xs"></i>
                            </button>
                        </div>

                        <div class="flex flex-col items-center justify-center py-3">
                            <div id="mc-visual-light" class="w-20 h-20 rounded-full bg-[#f2f2f7] dark:bg-black/40 border-2 border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center transition-all duration-75 shadow-inner">
                                <i class="fas fa-lightbulb text-2xl text-zinc-400 dark:text-zinc-600 transition-colors" id="mc-visual-icon"></i>
                            </div>
                            <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-3" id="mc-status-label">Trực quan / Âm thanh</span>
                        </div>

                        <div class="flex gap-2 pt-1">
                            <button type="button" id="btn-mc-play" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                                <i class="fas fa-play text-[11px]"></i> Phát tín hiệu
                            </button>
                            <button type="button" id="btn-mc-stop" class="w-12 h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-400 flex items-center justify-center opacity-40 cursor-not-allowed transition-all" disabled title="Dừng phát">
                                <i class="fas fa-stop text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- CÀI ĐẶT TỐC ĐỘ WPM -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                        <div class="flex justify-between items-center text-xs">
                            <span class="font-bold text-zinc-700 dark:text-zinc-300">Tốc độ phát (WPM)</span>
                            <span id="mc-val-wpm" class="font-mono font-bold text-accent-theme text-sm">20 WPM</span>
                        </div>
                        <input type="range" id="mc-range-wpm" min="5" max="50" value="20" class="morse-range">
                        <div class="flex justify-between text-[9px] font-mono text-zinc-400 px-0.5">
                            <span>5 (Chậm)</span>
                            <span>20 (Tiêu chuẩn)</span>
                            <span>50 (Cao tốc)</span>
                        </div>
                    </div>

                </div>

            </div>
        </main>

        <!-- FULLSCREEN OLED & CAMERA SCANNER OVERLAY -->
        <div id="mc-fs-container" class="fixed inset-0 z-[10000] bg-black flex flex-col hidden opacity-0 transition-opacity duration-300 overflow-hidden select-none">
            
            <!-- VÙNG PHÁT SÁNG TOÀN MÀN HÌNH -->
            <div id="mc-fs-visualizer" class="h-[75%] md:h-[80%] w-full bg-black transition-colors duration-75 relative flex items-center justify-center">
                <button type="button" id="btn-mc-fs-close" class="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md z-50 border border-white/10 transition-all active:scale-90" title="Thoát toàn màn hình">
                    <i class="fas fa-compress text-xs"></i>
                </button>
                
                <!-- CAMERA SCANNER PREVIEW -->
                <div id="mc-camera-box" class="absolute top-5 left-5 w-44 h-32 md:w-60 md:h-44 rounded-[18px] overflow-hidden border border-white/15 bg-zinc-950 hidden shadow-2xl z-40">
                    <video id="mc-video" class="w-full h-full object-cover scale-x-[-1]" autoplay playsinline></video>
                    <div class="absolute inset-0 border-2 border-emerald-500/40 pointer-events-none rounded-[18px]"></div>
                    <div class="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-scanline"></div>
                    <div class="absolute bottom-1.5 left-2 right-2 text-center text-[9px] font-mono text-emerald-300/80 bg-black/60 px-1 py-0.5 rounded backdrop-blur-sm">Quét tâm điểm sáng</div>
                </div>

                <div class="text-center text-white/15 pointer-events-none" id="mc-fs-info">
                    <i class="fas fa-wave-square text-7xl mb-3"></i>
                    <p class="text-base font-black font-mono tracking-[0.4em] uppercase">OLED Fullscreen Mode</p>
                </div>
            </div>

            <!-- THANH ĐIỀU KHIỂN DƯỚI ĐÁY TRONG FULLSCREEN -->
            <div class="h-[25%] md:h-[20%] w-full bg-[#09090b] border-t border-white/10 p-3 md:px-6 flex items-center justify-center">
                <div class="w-full max-w-screen-xl flex flex-col md:flex-row gap-2.5 items-stretch md:items-center h-full">
                    
                    <div class="flex gap-2 shrink-0">
                        <button type="button" id="btn-mc-camera" class="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center justify-center" title="Bật/Tắt Camera Decoder">
                            <i class="fas fa-camera text-sm"></i>
                        </button>
                        <button type="button" id="btn-mc-fs-clear" class="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-white/10 transition-all flex items-center justify-center" title="Xóa nội dung">
                            <i class="far fa-trash-can text-sm"></i>
                        </button>
                    </div>
                    
                    <div class="flex-1 min-w-0 h-full">
                        <textarea id="mc-fs-input" class="w-full h-full bg-black/40 border border-white/10 rounded-[14px] px-3.5 py-2 outline-none focus:border-accent-theme transition-all text-white placeholder-zinc-600 text-xs sm:text-sm font-mono resize-none no-scrollbar select-text" placeholder="Nhập văn bản hoặc mã Morse để phát..."></textarea>
                    </div>
                    
                    <div class="flex gap-2 shrink-0">
                        <button type="button" id="btn-mc-fs-play" class="flex-1 md:w-28 h-11 md:h-12 bg-accent-theme text-white rounded-[14px] font-bold text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase">
                            <i class="fas fa-play text-[10px]"></i> Phát
                        </button>
                        <button type="button" id="btn-mc-fs-stop" class="w-11 h-11 md:w-14 md:h-12 bg-white/10 text-zinc-400 border border-white/10 rounded-[14px] font-bold text-xs opacity-40 cursor-not-allowed flex items-center justify-center transition-all" disabled>
                            <i class="fas fa-stop text-[10px]"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <canvas id="mc-canvas" class="hidden"></canvas>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#morse-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const MORSE_DICT = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 
        'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', 
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
        '9': '----.', '0': '-----', ' ': '/'
    };
    const REVERSE_DICT = Object.fromEntries(Object.entries(MORSE_DICT).map(([k, v]) => [v, k]));

    let state = { 
        mode: 'text2morse', 
        wpm: 20, 
        isPlaying: false, 
        isCameraOn: false 
    };

    let audioCtx = null;
    let oscillator = null;
    let playTimeouts = [];
    let stream = null;
    let decodeInterval = null;

    // DOM Elements
    const elInput = _('#mc-input');
    const elOutput = _('#mc-output');
    const fsContainer = _('#mc-fs-container');
    const fsVisualizer = _('#mc-fs-visualizer');
    const fsInput = _('#mc-fs-input');

    const btnPlay = _('#btn-mc-play');
    const btnStop = _('#btn-mc-stop');
    const btnFsPlay = _('#btn-mc-fs-play');
    const btnFsStop = _('#btn-mc-fs-stop');

    const visualLight = _('#mc-visual-light');
    const visualIcon = _('#mc-visual-icon');
    const statusLabel = _('#mc-status-label');

    const video = _('#mc-video');
    const canvas = _('#mc-canvas');
    const cameraBox = _('#mc-camera-box');
    const rangeWpm = _('#mc-range-wpm');
    const valWpm = _('#mc-val-wpm');

    const lblInput = _('#lbl-mc-input');
    const lblOutput = _('#lbl-mc-output');

    // Dịch thuật thời gian thực
    const translate = () => {
        const val = elInput?.value || '';
        if (fsInput && fsInput.value !== val) fsInput.value = val;

        if (!val.trim()) {
            if (elOutput) elOutput.value = '';
            return;
        }

        if (state.mode === 'text2morse') {
            const upper = val.toUpperCase();
            if (elOutput) {
                elOutput.value = upper.split('').map(c => MORSE_DICT[c] || c).join(' ');
            }
        } else {
            if (elOutput) {
                elOutput.value = val.trim().split(/\s+/).map(c => REVERSE_DICT[c] || c).join('');
            }
        }
    };

    // Điều khiển đèn trực quan
    const light = (on) => {
        const accent = ThemeKit.getAccentColor();
        if (fsVisualizer) {
            fsVisualizer.style.backgroundColor = on ? '#ffffff' : '#000000';
        }
        if (visualLight) {
            visualLight.style.backgroundColor = on ? accent : '';
            visualLight.style.borderColor = on ? accent : '';
            visualLight.style.boxShadow = on ? `0 0 20px ${accent}` : '';
        }
        if (visualIcon) {
            visualIcon.style.color = on ? '#ffffff' : '';
        }
    };

    // Dừng phát tín hiệu
    const stopAudio = () => {
        state.isPlaying = false;
        playTimeouts.forEach(clearTimeout);
        playTimeouts = [];

        if (oscillator) {
            try { 
                oscillator.stop(); 
                oscillator.disconnect();
            } catch (e) {}
            oscillator = null;
        }

        light(false);

        if (btnStop) {
            btnStop.disabled = true;
            btnStop.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if (btnFsStop) {
            btnFsStop.disabled = true;
            btnFsStop.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if (statusLabel) statusLabel.textContent = 'Trực quan / Âm thanh';
    };

    // Phát tín hiệu Morse qua WebAudio & Màn hình
    const playMorse = () => {
        if (state.isPlaying) {
            stopAudio();
            return;
        }

        const code = state.mode === 'text2morse' ? (elOutput?.value || '') : (elInput?.value || '');
        if (!code.trim()) {
            IslandKit.notify('Cảnh báo', 'Vui lòng nhập nội dung cần phát tín hiệu.', 'warning');
            return;
        }

        stopAudio();
        state.isPlaying = true;

        if (btnStop) {
            btnStop.disabled = false;
            btnStop.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if (btnFsStop) {
            btnFsStop.disabled = false;
            btnFsStop.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if (statusLabel) statusLabel.textContent = 'Đang phát tín hiệu...';

        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (err) {
            console.warn('AudioContext failed:', err);
        }

        const unit = 1200 / state.wpm;
        let time = 0;

        code.split('').forEach(char => {
            let duration = 0;
            if (char === '.') duration = unit;
            else if (char === '-') duration = unit * 3;
            else if (char === ' ') duration = unit * 2;
            else if (char === '/') duration = unit * 4;

            if (duration > 0 && (char === '.' || char === '-')) {
                playTimeouts.push(setTimeout(() => {
                    if (!state.isPlaying || !audioCtx) return;
                    try {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.frequency.value = 650;
                        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

                        osc.start();
                        light(true);

                        setTimeout(() => {
                            try { 
                                osc.stop(); 
                                osc.disconnect();
                            } catch (e) {}
                            light(false);
                        }, duration);
                    } catch (e) {}
                }, time));
            }
            time += duration + unit;
        });

        playTimeouts.push(setTimeout(stopAudio, time));
    };

    // Camera Decoder
    const toggleCamera = async () => {
        if (state.isCameraOn) {
            if (stream) stream.getTracks().forEach(t => t.stop());
            clearInterval(decodeInterval);
            state.isCameraOn = false;
            cameraBox?.classList.add('hidden');
            IslandKit.notify('Camera', 'Đã tắt chế độ quét tín hiệu quang.', 'info');
        } else {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                if (video) video.srcObject = stream;
                state.isCameraOn = true;
                cameraBox?.classList.remove('hidden');
                startDecoding();
                IslandKit.notify('Camera', 'Đang quét cảm biến ánh sáng...', 'success');
            } catch (e) { 
                IslandKit.notify('Lỗi Camera', 'Không thể cấp quyền truy cập Camera.', 'error'); 
            }
        }
    };

    let lastState = false;
    let lastTime = Date.now();
    let buffer = "";

    const startDecoding = () => {
        if (!canvas || !video) return;
        const ctx = canvas.getContext('2d', { alpha: false });

        decodeInterval = setInterval(() => {
            if (video.paused || video.ended || !ctx) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(canvas.width / 2 - 5, canvas.height / 2 - 5, 10, 10).data;
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            const avg = brightness / (data.length / 4);
            const isOn = avg > 195;

            if (isOn !== lastState) {
                const now = Date.now();
                const diff = now - lastTime;
                const unit = 1200 / state.wpm;

                if (!isOn) { 
                    if (diff < unit * 2) buffer += ".";
                    else buffer += "-";
                } else { 
                    if (diff > unit * 3) {
                        const char = REVERSE_DICT[buffer] || "";
                        if (char) {
                            if (fsInput) fsInput.value += char;
                            if (elInput) elInput.value = fsInput.value;
                            translate();
                        }
                        buffer = "";
                    }
                }
                lastState = isOn;
                lastTime = now;
            }
        }, 50);
    };

    // Segmented Tabs chuyển chiều dịch
    const activeTabClass = 'mc-dir-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center';
    const inactiveTabClass = 'mc-dir-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center';

    const syncDirection = (mode) => {
        state.mode = mode;
        $$('.mc-dir-tab').forEach(b => {
            b.className = (b.dataset.mode === mode) ? activeTabClass : inactiveTabClass;
        });

        if (mode === 'text2morse') {
            if (lblInput) lblInput.textContent = 'Văn bản nguồn';
            if (lblOutput) lblOutput.textContent = 'Tín hiệu Morse';
            if (elInput) elInput.placeholder = 'Nhập văn bản cần chuyển sang Morse...';
        } else {
            if (lblInput) lblInput.textContent = 'Mã Morse nguồn';
            if (lblOutput) lblOutput.textContent = 'Văn bản giải mã';
            if (elInput) elInput.placeholder = 'Nhập mã Morse (Dùng dấu cách giữa các ký tự)...';
        }

        translate();
    };

    $$('.mc-dir-tab').forEach(btn => {
        btn.addEventListener('click', () => syncDirection(btn.dataset.mode));
    });

    _('#btn-mc-swap')?.addEventListener('click', () => {
        const nextMode = state.mode === 'text2morse' ? 'morse2text' : 'text2morse';
        const currentOutput = elOutput?.value || '';
        if (elInput && currentOutput) {
            elInput.value = currentOutput;
        }
        syncDirection(nextMode);
    });

    // Inputs
    elInput?.addEventListener('input', translate);
    fsInput?.addEventListener('input', () => {
        if (elInput) elInput.value = fsInput.value;
        translate();
    });

    // Play & Stop buttons
    btnPlay?.addEventListener('click', playMorse);
    btnStop?.addEventListener('click', stopAudio);
    btnFsPlay?.addEventListener('click', playMorse);
    btnFsStop?.addEventListener('click', stopAudio);

    // Range WPM
    rangeWpm?.addEventListener('input', (e) => {
        state.wpm = parseInt(e.target.value, 10);
        if (valWpm) valWpm.textContent = `${state.wpm} WPM`;
    });

    // Copy & Clear
    _('#btn-mc-copy')?.addEventListener('click', async () => {
        const text = elOutput?.value || '';
        if (!text) {
            IslandKit.notify('Trống', 'Chưa có dữ liệu để sao chép.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            IslandKit.notify('Đã sao chép', 'Kết quả dịch đã lưu vào clipboard.', 'success');
        } catch (e) {
            IslandKit.notify('Lỗi sao chép', 'Trình duyệt chặn quyền clipboard.', 'error');
        }
    });

    const clearAll = () => {
        if (elInput) elInput.value = '';
        if (elOutput) elOutput.value = '';
        if (fsInput) fsInput.value = '';
        stopAudio();
    };

    _('#btn-mc-clear')?.addEventListener('click', clearAll);
    _('#btn-mc-fs-clear')?.addEventListener('click', clearAll);

    // Fullscreen Overlay
    _('#btn-mc-fullscreen')?.addEventListener('click', () => {
        if (fsContainer) {
            fsContainer.classList.remove('hidden');
            setTimeout(() => fsContainer.classList.replace('opacity-0', 'opacity-100'), 10);
            if (fsContainer.requestFullscreen) fsContainer.requestFullscreen().catch(() => {});
        }
    });

    _('#btn-mc-fs-close')?.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        if (fsContainer) {
            fsContainer.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => fsContainer.classList.add('hidden'), 250);
        }
        stopAudio();
        if (state.isCameraOn) toggleCamera();
    });

    _('#btn-mc-camera')?.addEventListener('click', toggleCamera);
}