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
    <div id="display-analysis-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #display-analysis-root {
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

            /* Layer Fullscreen Test */
            #lcd-tester-fullscreen {
                display: none;
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: 99999;
                cursor: none;
                background-color: #000000;
            }
            #lcd-tester-fullscreen.active { 
                display: block; 
                cursor: default; 
            }
            
            .tester-guide, .btn-exit-fullscreen {
                opacity: 0;
                transition: opacity 0.25s ease;
                z-index: 20;
            }
            #lcd-tester-fullscreen.active:hover .tester-guide,
            #lcd-tester-fullscreen.active:hover .btn-exit-fullscreen,
            #lcd-tester-fullscreen.active:active .tester-guide,
            #lcd-tester-fullscreen.active:active .btn-exit-fullscreen { 
                opacity: 1; 
            }

            .btn-exit-fullscreen {
                position: absolute;
                top: 24px; right: 24px;
                background: rgba(22, 22, 24, 0.7);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #ffffff;
                padding: 8px 18px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .btn-exit-fullscreen:hover {
                background: rgba(255, 255, 255, 0.18);
            }

            #test-canvas {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                display: none;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Display Diagnostics</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Display Analysis Pro</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Đo đạc thông số phần cứng hiển thị, kiểm tra điểm chết, hở sáng, dải màu và tần số quét màn hình.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: THÔNG SỐ TẤM NỀN (4 COLS) -->
                <div class="md:col-span-4 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3.5">
                    <div class="flex items-center justify-between pb-1 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-desktop text-accent-theme"></i> Thông số phần cứng
                        </h3>
                        <span class="text-[9px] font-mono text-zinc-400">Live Hardware</span>
                    </div>

                    <div class="space-y-2.5">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 flex flex-col gap-0.5">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Độ phân giải vật lý</span>
                            <span id="screen-real-res" class="text-lg font-black font-mono text-zinc-900 dark:text-white tracking-tight">--</span>
                        </div>
                        
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex justify-between items-center text-xs">
                            <span class="font-medium text-zinc-500">Độ phân giải Logic</span>
                            <span id="screen-logic-res" class="font-mono font-bold text-zinc-800 dark:text-zinc-200">--</span>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3 flex flex-col items-center justify-center gap-0.5 text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tỷ lệ khung</span>
                                <span id="screen-ratio" class="text-sm font-black font-mono text-zinc-900 dark:text-white">--</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3 flex flex-col items-center justify-center gap-0.5 text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Độ sâu màu</span>
                                <span id="screen-color-depth" class="text-sm font-black font-mono text-accent-theme">--</span>
                            </div>
                        </div>

                        <div class="p-3 rounded-[14px] bg-accent-theme-alpha border border-black/[0.03] dark:border-white/[0.05] flex items-center gap-2 text-xs">
                            <i class="fas fa-circle-info text-accent-theme text-xs shrink-0"></i>
                            <span class="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Nhấn vào các bài test bên cạnh để mở chế độ phân tích toàn màn hình (Fullscreen).</span>
                        </div>
                    </div>
                </div>

                <!-- CỘT PHẢI: TEST SUITE (8 COLS) -->
                <div class="md:col-span-8 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3.5">
                    <div class="flex items-center justify-between pb-1 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-vial-virus text-accent-theme"></i> Bộ kịch bản kiểm thử
                        </h3>
                        <span class="text-[9px] font-mono text-zinc-400">6 Kịch bản</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        <!-- Test 1: Dead Pixel -->
                        <button class="test-trigger p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group active:scale-[0.98]" data-test="deadpixel">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-crosshairs"></i>
                                </div>
                                <span class="text-[10px] font-mono text-zinc-400">RGB / Solid</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Điểm chết (Dead Pixel)</h4>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">Kiểm tra điểm ảnh kẹt hoặc chết qua các màu đơn sắc Trắng, Đen, Đỏ, Xanh.</p>
                            </div>
                        </button>

                        <!-- Test 2: Uniformity -->
                        <button class="test-trigger p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group active:scale-[0.98]" data-test="uniformity">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-circle-half-stroke"></i>
                                </div>
                                <span class="text-[10px] font-mono text-zinc-400">Backlight</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Độ đồng nhất (Uniformity)</h4>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">Kiểm tra hiện tượng hở sáng cạnh viền và hiệu ứng bẩn màn hình (DSE).</p>
                            </div>
                        </button>

                        <!-- Test 3: Gradient -->
                        <button class="test-trigger p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group active:scale-[0.98]" data-test="gradient">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-palette"></i>
                                </div>
                                <span class="text-[10px] font-mono text-zinc-400">Color Banding</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Dải chuyển màu (Gradient)</h4>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">Phát hiện răng cưa hoặc đứt gãy dải màu 8-bit / 10-bit khi chuyển tông.</p>
                            </div>
                        </button>

                        <!-- Test 4: Pattern -->
                        <button class="test-trigger p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group active:scale-[0.98]" data-test="pattern">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-border-all"></i>
                                </div>
                                <span class="text-[10px] font-mono text-zinc-400">Geometry</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Lưới hình học (Pattern)</h4>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">Lưới Crosshatch kiểm tra độ méo hình học, độ hội tụ và độ sắc nét góc.</p>
                            </div>
                        </button>

                        <!-- Test 5: Gamma Calibration -->
                        <button class="test-trigger p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-accent-theme hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group active:scale-[0.98]" data-test="gamma">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-braille"></i>
                                </div>
                                <span class="text-[10px] font-mono text-zinc-400">Gamma 2.2</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Hiệu chuẩn Gamma</h4>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">So sánh dải sọc Scanlines và mảng đặc 50% kiểm tra đường cong tương phản.</p>
                            </div>
                        </button>

                        <!-- Test 6: FPS & Ghosting -->
                        <button class="test-trigger p-4 rounded-[18px] bg-accent-theme text-white transition-all text-left flex flex-col justify-between group shadow-sm active:scale-[0.98]" data-test="fps">
                            <div class="flex items-center justify-between w-full mb-3">
                                <div class="w-9 h-9 rounded-[12px] bg-white/20 flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <i class="fas fa-gauge-high text-white"></i>
                                </div>
                                <span class="text-[10px] font-mono opacity-80">Hz / Refresh</span>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-white mb-0.5">Tần số quét & Ghosting</h4>
                                <p class="text-[11px] text-white/80 line-clamp-2">Đo tốc độ làm tươi thực tế (Hz) và kiểm tra bóng ma của điểm ảnh chuyển động.</p>
                            </div>
                        </button>

                    </div>
                </div>

            </div>
        </main>

        <!-- FULLSCREEN TEST LAYER -->
        <div id="lcd-tester-fullscreen">
            <canvas id="test-canvas"></canvas>
            
            <button class="btn-exit-fullscreen" id="btn-exit-test">
                Thoát <i class="fas fa-xmark text-xs"></i>
            </button>

            <div class="tester-guide absolute bottom-8 left-0 w-full flex justify-center pointer-events-none">
                <span class="bg-black/60 backdrop-blur-md border border-white/15 text-white px-5 py-2.5 rounded-full text-xs font-mono font-medium drop-shadow-xl flex items-center gap-2" id="test-guide-text">
                    <i class="fas fa-hand-pointer text-xs"></i> Nhấn chuột hoặc dùng phím ⬅ ➡ để chuyển bước
                </span>
            </div>
        </div>

    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#display-analysis-root') || hostElement;

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

    // =========================================================================
    // 1. TÍNH TOÁN THÔNG SỐ TẤM NỀN
    // =========================================================================
    const updateScreenInfo = () => {
        const logicW = window.screen.width;
        const logicH = window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        
        const realW = Math.round(logicW * pixelRatio);
        const realH = Math.round(logicH * pixelRatio);
        const colorDepth = window.screen.colorDepth;

        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(realW, realH);
        let ratioW = Math.round(realW / divisor);
        let ratioH = Math.round(realH / divisor);

        const ratioDecimal = realW / realH;
        let ratioStr = `${ratioW}:${ratioH}`;
        if (Math.abs(ratioDecimal - 16/9) < 0.05) ratioStr = "16:9";
        else if (Math.abs(ratioDecimal - 16/10) < 0.05) ratioStr = "16:10";
        else if (Math.abs(ratioDecimal - 21/9) < 0.05) ratioStr = "21:9";
        else if (Math.abs(ratioDecimal - 4/3) < 0.05) ratioStr = "4:3";

        const realResEl = _('#screen-real-res');
        const logicResEl = _('#screen-logic-res');
        const ratioEl = _('#screen-ratio');
        const colorDepthEl = _('#screen-color-depth');

        if (realResEl) realResEl.textContent = `${realW} x ${realH}`;
        if (logicResEl) logicResEl.textContent = `${logicW} x ${logicH} (Scale x${pixelRatio})`;
        if (ratioEl) ratioEl.textContent = ratioStr;
        if (colorDepthEl) colorDepthEl.textContent = `${colorDepth}-bit`;
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);

    // =========================================================================
    // 2. LOGIC KIỂM THỬ MÀN HÌNH FULLSCREEN
    // =========================================================================
    const testLayer = _('#lcd-tester-fullscreen');
    const canvas = _('#test-canvas');
    const guideText = _('#test-guide-text');
    const btnExit = _('#btn-exit-test');
    const triggers = $$('.test-trigger');

    let ctx = null;
    if (canvas) ctx = canvas.getContext('2d');

    let currentMode = '';
    let stepIndex = 0;
    let animationId = null;

    const stepsData = {
        deadpixel: ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'],
        uniformity: ['#FFFFFF', '#808080', '#404040', '#1A1A1A', '#000000'],
        gradient: [
            'linear-gradient(to right, #000000, #FFFFFF)',
            'linear-gradient(to right, #000000, #FF0000)',
            'linear-gradient(to right, #000000, #00FF00)',
            'linear-gradient(to right, #000000, #0000FF)'
        ]
    };

    const resizeCanvas = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    };

    const clearTest = () => {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
        if (testLayer) testLayer.style.background = '#000000';
        if (canvas) {
            canvas.style.display = 'none';
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const renderTest = () => {
        clearTest();
        if (!testLayer || !guideText) return;
        
        if (currentMode === 'deadpixel' || currentMode === 'uniformity' || currentMode === 'gradient') {
            const arr = stepsData[currentMode];
            testLayer.style.background = arr[stepIndex];
            guideText.innerHTML = '<i class="fas fa-hand-pointer text-xs"></i> Chạm màn hình hoặc dùng ⬅ ➡ để đổi màu';
        }
        else if (currentMode === 'pattern') {
            if (!canvas || !ctx) return;
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-border-all text-xs"></i> Kiểm tra lưới hình học & độ hội tụ';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            const gridSize = 50 * (window.devicePixelRatio || 1);
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += gridSize) { 
                ctx.moveTo(x, 0); 
                ctx.lineTo(x, canvas.height); 
            }
            for (let y = 0; y <= canvas.height; y += gridSize) { 
                ctx.moveTo(0, y); 
                ctx.lineTo(canvas.width, y); 
            }
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, gridSize * 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (currentMode === 'gamma') {
            if (!canvas || !ctx) return;
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-eye text-xs"></i> Lùi xa màn hình: Ô vuông trung tâm phải hòa sắc với nền';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            for (let y = 0; y < canvas.height; y += 2) { 
                ctx.fillRect(0, y, canvas.width, 1); 
            }
            
            const boxSize = Math.min(canvas.width, canvas.height) * 0.4;
            const startX = (canvas.width - boxSize) / 2;
            const startY = (canvas.height - boxSize) / 2;
            ctx.fillStyle = '#808080';
            ctx.fillRect(startX, startY, boxSize, boxSize);
        }
        else if (currentMode === 'fps') {
            if (!canvas || !ctx) return;
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-gauge-high text-xs"></i> Đo tần số quét thực tế & bóng mờ chuyển động';
            
            let lastTime = performance.now();
            let frames = 0;
            let fps = 0;
            let x = 0;
            let speed = 8 * (window.devicePixelRatio || 1);

            const drawFPS = (time) => {
                frames++;
                if (time - lastTime >= 1000) { 
                    fps = frames; 
                    frames = 0; 
                    lastTime = time; 
                }

                ctx.fillStyle = '#161618';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#FFFFFF';
                const boxW = 100 * (window.devicePixelRatio || 1);
                const boxH = 100 * (window.devicePixelRatio || 1);
                const y = (canvas.height - boxH) / 2;
                ctx.fillRect(x, y, boxW, boxH);
                
                x += speed;
                if (x + boxW > canvas.width || x < 0) speed = -speed;

                ctx.fillStyle = ThemeKit.getAccentColor();
                ctx.font = `bold ${72 * (window.devicePixelRatio || 1)}px monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`${fps} FPS / Hz`, canvas.width / 2, canvas.height / 2 - 140 * (window.devicePixelRatio || 1));

                animationId = requestAnimationFrame(drawFPS);
            };
            animationId = requestAnimationFrame(drawFPS);
        }
    };

    const startTest = async (mode) => {
        currentMode = mode;
        stepIndex = 0;
        testLayer?.classList.add('active');
        renderTest();

        try {
            if (testLayer?.requestFullscreen) await testLayer.requestFullscreen();
            else if (testLayer?.webkitRequestFullscreen) await testLayer.webkitRequestFullscreen();
        } catch (err) {
            console.warn("Fullscreen bị hạn chế bởi trình duyệt.");
        }
    };

    const handleNextStep = () => {
        if (!currentMode || !stepsData[currentMode]) return;
        stepIndex++;
        if (stepIndex >= stepsData[currentMode].length) exitTest();
        else renderTest();
    };

    const handlePrevStep = () => {
        if (!currentMode || !stepsData[currentMode]) return;
        stepIndex--;
        if (stepIndex < 0) stepIndex = stepsData[currentMode].length - 1;
        renderTest();
    };

    const exitTest = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        clearTest();
        testLayer?.classList.remove('active');
        currentMode = '';
    };

    triggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-test');
            if (mode) startTest(mode);
        });
    });
    
    btnExit?.addEventListener('click', exitTest);

    testLayer?.addEventListener('click', (e) => {
        if (e.target.closest('#btn-exit-test')) return;
        
        const clickX = e.clientX;
        const screenW = window.innerWidth;
        if (clickX < screenW / 3) {
            handlePrevStep();
        } else {
            handleNextStep();
        }
    });

    const onKeyDown = (e) => {
        if (!currentMode) return;
        
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            handleNextStep();
        } else if (e.key === 'ArrowLeft') {
            handlePrevStep();
        } else if (e.key === 'Escape') {
            exitTest();
        }
    };

    const onFullscreenChange = () => {
        if (!document.fullscreenElement && currentMode) {
            exitTest();
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreenChange);
}