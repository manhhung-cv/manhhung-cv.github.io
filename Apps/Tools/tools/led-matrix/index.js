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
    <div id="led-app-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #led-app-root {
                --kit-accent: #10b981;
                --led-color: #00ffcc;
                --led-bg: #000000;
                --led-font: 'Inter', system-ui, -apple-system, sans-serif;
                --led-size: 4rem;
                --led-speed: 30s;
                --led-glow: 0px;
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

            /* Range Slider */
            .led-range {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                background: transparent;
                outline: none;
                height: 20px;
                cursor: pointer;
            }
            .led-range::-webkit-slider-runnable-track {
                height: 6px;
                background: rgba(0, 0, 0, 0.08);
                border-radius: 9999px;
            }
            .dark .led-range::-webkit-slider-runnable-track {
                background: rgba(255, 255, 255, 0.12);
            }
            .led-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 18px;
                width: 18px;
                border-radius: 50%;
                background: #ffffff;
                border: 2px solid var(--kit-accent);
                margin-top: -6px;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.1s ease;
            }
            .led-range:active::-webkit-slider-thumb {
                transform: scale(1.15);
            }

            /* Switch Pill độ tương phản cao */
            .switch-pill {
                width: 44px;
                height: 24px;
                background-color: rgba(0, 0, 0, 0.12) !important;
                border-radius: 9999px;
                position: relative;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                padding: 2px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
            }
            .dark .switch-pill {
                background-color: rgba(255, 255, 255, 0.16) !important;
                border-color: rgba(255, 255, 255, 0.12);
            }
            .switch-pill .switch-thumb {
                width: 18px;
                height: 18px;
                background-color: #ffffff;
                border-radius: 9999px;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
            }
            .switch-pill.active {
                background-color: var(--kit-accent) !important;
                border-color: transparent !important;
            }
            .switch-pill.active .switch-thumb {
                transform: translateX(20px);
            }

            /* Core Marquee Engine */
            .marquee-engine {
                display: flex;
                width: 100%;
                overflow: hidden;
                background-color: var(--led-bg);
                will-change: transform;
            }
            
            .marquee-track {
                display: flex;
                flex-shrink: 0;
                align-items: center;
                animation: scroll-seamless var(--led-speed) linear infinite;
                padding-right: 2rem; 
            }

            .marquee-text {
                white-space: nowrap;
                font-family: var(--led-font);
                font-size: var(--led-size);
                color: var(--led-color);
                text-shadow: 0 0 var(--led-glow) var(--led-color);
                font-weight: 900;
                line-height: 1;
            }

            .dir-normal { animation-direction: normal; }
            .dir-reverse { animation-direction: reverse; }

            .fx-led { 
                mask-image: radial-gradient(circle, black 40%, transparent 50%); 
                mask-size: 8px 8px; 
            }
            
            @keyframes rainbow-hue { to { filter: hue-rotate(360deg); } }
            .fx-rainbow { animation: rainbow-hue 3s linear infinite; }

            @keyframes strobe-flash { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
            .fx-strobe .marquee-text { animation: strobe-flash 0.15s infinite; }

            @keyframes scroll-seamless {
                from { transform: translate3d(0, 0, 0); }
                to { transform: translate3d(-100%, 0, 0); } 
            }
            
            /* Fullscreen Overlay */
            #fs-overlay {
                position: fixed; 
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 99999;
                touch-action: none;
            }
            #led-fs-container.fs-rotated { transform: rotate(90deg); width: 100vh; height: 100vw; }
            #led-fs-container.fs-normal { transform: none; width: 100vw; height: 100vh; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1 select-none">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Stage Display</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Bảng LED Chữ Chạy</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Bảng điện tử LED ma trận và Neon phát toàn màn hình tối ưu cho Concert, sự kiện và đón người thân.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: ĐIỀU KHIỂN & CÀI ĐẶT (7 COLS) -->
                <div class="lg:col-span-7 space-y-4">
                    
                    <!-- BENTO 1: NỘI DUNG & MÀU SẮC -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block select-none">Nội dung hiển thị</label>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all cursor-text">
                                <input type="text" id="led-input" 
                                    class="w-full bg-transparent border-none outline-none text-base sm:text-lg font-black font-mono text-zinc-900 dark:text-white placeholder-zinc-400 select-text cursor-text pointer-events-auto" 
                                    placeholder="Nhập chữ cần chạy..." 
                                    value="HELLO CONCERT 🔥"
                                    autocomplete="off" spellcheck="false">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <!-- KẾT CẤU CHỮ: SEGMENTED TABS -->
                            <div class="space-y-1.5 select-none">
                                <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Kết cấu nét chữ</span>
                                <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="led-style-tabs">
                                    <button type="button" class="led-style-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-fx="solid">
                                        Nét phẳng
                                    </button>
                                    <button type="button" class="led-style-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-fx="led">
                                        Ma trận LED
                                    </button>
                                </div>
                            </div>

                            <!-- MÀU SẮC CHỮ & NỀN -->
                            <div class="space-y-1.5 select-none">
                                <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Phối màu LED</span>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative h-[38px] rounded-[12px] overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-[#f2f2f7] dark:bg-black/40 flex items-center justify-center">
                                        <input type="color" id="color-text" value="#00ffcc" class="absolute -inset-2 w-[140%] h-[140%] cursor-pointer border-none bg-transparent">
                                        <span class="pointer-events-none text-[10px] font-bold text-black/70 dark:text-white/70 mix-blend-difference font-mono uppercase">MÀU CHỮ</span>
                                    </div>
                                    <div class="relative h-[38px] rounded-[12px] overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-[#f2f2f7] dark:bg-black/40 flex items-center justify-center">
                                        <input type="color" id="color-bg" value="#000000" class="absolute -inset-2 w-[140%] h-[140%] cursor-pointer border-none bg-transparent">
                                        <span class="pointer-events-none text-[10px] font-bold text-white/70 mix-blend-difference font-mono uppercase">MÀU NỀN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BENTO 2: TỐC ĐỘ, ĐỘ TỎA SÁNG & HIỆU ỨNG -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4 select-none">
                        <div class="space-y-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <!-- TỐC ĐỘ -->
                            <div class="space-y-1">
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-zinc-600 dark:text-zinc-400">Tốc độ cuộn chữ</span>
                                    <span class="font-mono font-bold text-accent-theme" id="lbl-speed">Vừa phải</span>
                                </div>
                                <input type="range" id="range-speed" min="1" max="100" value="40" class="led-range">
                            </div>

                            <!-- ĐỘ TỎA SÁNG -->
                            <div class="space-y-1 pt-1">
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-zinc-600 dark:text-zinc-400">Độ tỏa sáng (Neon Glow)</span>
                                    <span class="font-mono font-bold text-accent-theme" id="lbl-glow">0px</span>
                                </div>
                                <input type="range" id="range-glow" min="0" max="50" value="0" class="led-range">
                            </div>
                        </div>

                        <!-- 4 TÙY CHỌN BẬT/TẮT DẠNG SWITCH PILL -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex items-center justify-between p-2.5 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Đổi màu RGB (Rainbow)</span>
                                <button type="button" id="toggle-rainbow" class="switch-pill" aria-label="Toggle Rainbow"><div class="switch-thumb"></div></button>
                            </div>

                            <div class="flex items-center justify-between p-2.5 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-rose-500">Chớp nháy (Strobe)</span>
                                <button type="button" id="toggle-strobe" class="switch-pill" aria-label="Toggle Strobe"><div class="switch-thumb"></div></button>
                            </div>

                            <div class="flex items-center justify-between p-2.5 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Chạy ngược chiều</span>
                                <button type="button" id="toggle-dir" class="switch-pill" aria-label="Toggle Reverse Direction"><div class="switch-thumb"></div></button>
                            </div>

                            <div class="flex items-center justify-between p-2.5 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Xoay ngang màn</span>
                                <button type="button" id="toggle-rotate" class="switch-pill" aria-label="Toggle Rotate"><div class="switch-thumb"></div></button>
                            </div>
                        </div>
                    </div>

                    <!-- NÚT PHÁT TOÀN MÀN HÌNH -->
                    <button id="btn-start" class="w-full h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm select-none">
                        <i class="fas fa-expand text-xs"></i> Bắt đầu phát toàn màn hình
                    </button>
                    <p class="text-[11px] text-center text-zinc-400 select-none">Trên iOS / Safari, bảng LED sẽ mở ở chế độ lớp phủ toàn màn hình tự động.</p>
                </div>

                <!-- CỘT PHẢI: XEM TRƯỚC TRỰC TIẾP (5 COLS) -->
                <div class="lg:col-span-5 lg:sticky lg:top-6 select-none">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                        <div class="flex justify-between items-center pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-tv text-accent-theme"></i> Bản xem trước (Live Preview)
                            </h3>
                            <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                        </div>
                        
                        <div class="w-full aspect-[16/9] rounded-[18px] overflow-hidden relative border border-black/[0.08] dark:border-white/[0.1] shadow-inner">
                            <div id="preview-engine" class="marquee-engine h-full items-center">
                                <div class="marquee-track preview-track">
                                    <div class="marquee-text preview-text"></div>
                                </div>
                                <div class="marquee-track preview-track">
                                    <div class="marquee-text preview-text"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </main>

        <!-- FULLSCREEN OVERLAY -->
        <div id="fs-overlay" class="hidden bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none">
            <div id="led-fs-container" class="fs-normal flex items-center justify-center transition-transform duration-300">
                <div id="fs-engine" class="marquee-engine h-full items-center">
                    <div class="marquee-track fs-track">
                        <div class="marquee-text fs-text"></div>
                    </div>
                    <div class="marquee-track fs-track">
                        <div class="marquee-text fs-text"></div>
                    </div>
                </div>
            </div>
            <div id="fs-hint" class="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md text-white/80 text-xs font-mono font-bold uppercase tracking-widest opacity-0 transition-opacity duration-700 pointer-events-none border border-white/10">
                Chạm màn hình để thoát
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

    const rootContainer = hostElement.querySelector('#led-app-root') || hostElement;

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

    // Inputs
    const inputStr = _('#led-input');
    const colorText = _('#color-text');
    const colorBg = _('#color-bg');
    const rangeSpeed = _('#range-speed');
    const rangeGlow = _('#range-glow');

    // Toggles
    const toggleDir = _('#toggle-dir');
    const toggleRotate = _('#toggle-rotate');
    const toggleRainbow = _('#toggle-rainbow');
    const toggleStrobe = _('#toggle-strobe');

    // Labels
    const lblSpeed = _('#lbl-speed');
    const lblGlow = _('#lbl-glow');

    // Engines & Views
    const pEngine = _('#preview-engine');
    const pTexts = $$('.preview-text');
    const pTracks = $$('.preview-track');

    const fsOverlay = _('#fs-overlay');
    const fsContainer = _('#led-fs-container');
    const fsEngine = _('#fs-engine');
    const fsTexts = $$('.fs-text');
    const fsTracks = $$('.fs-track');

    const fsHint = _('#fs-hint');
    const btnStart = _('#btn-start');

    let currentFx = 'solid';

    const updateCSSVariables = () => {
        const cText = colorText?.value || '#00ffcc';
        const cBg = colorBg?.value || '#000000';
        rootContainer.style.setProperty('--led-color', cText);
        rootContainer.style.setProperty('--led-bg', cBg);

        const speedVal = parseInt(rangeSpeed?.value || '40', 10);
        const duration = 60 - (speedVal * 0.55);
        rootContainer.style.setProperty('--led-speed', `${duration}s`);

        if (lblSpeed) {
            if (speedVal < 30) lblSpeed.textContent = "Chậm";
            else if (speedVal < 70) lblSpeed.textContent = "Vừa phải";
            else lblSpeed.textContent = "Nhanh";
        }

        const glowVal = rangeGlow?.value || '0';
        rootContainer.style.setProperty('--led-glow', `${glowVal}px`);
        if (lblGlow) lblGlow.textContent = `${glowVal}px`;
    };

    const renderText = () => {
        const rawText = inputStr?.value || "HELLO";
        const repeatedString = (rawText + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0").repeat(8);
        pTexts.forEach(el => el.textContent = repeatedString);
        fsTexts.forEach(el => el.textContent = repeatedString);
    };

    const updateStyleAndDirection = () => {
        const isReverse = toggleDir?.classList.contains('active');
        const dirClass = isReverse ? 'dir-reverse' : 'dir-normal';
        const tracks = [...pTracks, ...fsTracks];
        tracks.forEach(track => {
            track.classList.remove('dir-normal', 'dir-reverse');
            track.classList.add(dirClass);
        });

        const texts = [...pTexts, ...fsTexts];
        texts.forEach(text => {
            if (currentFx === 'led') text.classList.add('fx-led');
            else text.classList.remove('fx-led');
        });

        const isRainbow = toggleRainbow?.classList.contains('active');
        const isStrobe = toggleStrobe?.classList.contains('active');

        const engines = [pEngine, fsEngine];
        engines.forEach(eng => {
            if (!eng) return;
            if (isRainbow) eng.classList.add('fx-rainbow');
            else eng.classList.remove('fx-rainbow');

            if (isStrobe) eng.classList.add('fx-strobe');
            else eng.classList.remove('fx-strobe');
        });
    };

    const syncAll = () => {
        updateCSSVariables();
        renderText();
        updateStyleAndDirection();
    };

    // Listeners cho input
    [inputStr, colorText, colorBg, rangeSpeed, rangeGlow].forEach(el => {
        el?.addEventListener('input', syncAll);
    });

    // Segmented Tabs Kết cấu chữ
    const activeTabClass = 'led-style-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center';
    const inactiveTabClass = 'led-style-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center';

    $$('.led-style-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.led-style-tab').forEach(b => b.className = inactiveTabClass);
            btn.className = activeTabClass;
            currentFx = btn.dataset.fx;
            syncAll();
        });
    });

    // Toggle switch logic
    const bindToggle = (el) => {
        el?.addEventListener('click', () => {
            el.classList.toggle('active');
            syncAll();
        });
    };

    bindToggle(toggleRainbow);
    bindToggle(toggleStrobe);
    bindToggle(toggleDir);
    bindToggle(toggleRotate);

    // Bắt đầu Fullscreen
    btnStart?.addEventListener('click', () => {
        if (!inputStr?.value.trim()) {
            IslandKit.notify('Cảnh báo', 'Vui lòng nhập nội dung trước khi phát.', 'warning');
            return;
        }

        const cText = colorText?.value || '#00ffcc';
        const cBg = colorBg?.value || '#000000';
        fsOverlay?.style.setProperty('--led-color', cText);
        fsOverlay?.style.setProperty('--led-bg', cBg);

        const baseDuration = parseFloat(rootContainer.style.getPropertyValue('--led-speed')) || 30;
        const isRotated = toggleRotate?.classList.contains('active');

        if (isRotated) {
            if (fsContainer) fsContainer.className = 'fs-rotated flex items-center justify-center transition-transform duration-300';
            fsOverlay?.style.setProperty('--led-size', '65vw');
            fsOverlay?.style.setProperty('--led-speed', `${baseDuration * 8}s`);
        } else {
            if (fsContainer) fsContainer.className = 'fs-normal flex items-center justify-center transition-transform duration-300';
            fsOverlay?.style.setProperty('--led-size', '65vh');
            fsOverlay?.style.setProperty('--led-speed', `${baseDuration * 5}s`);
        }

        const glowVal = parseInt(rangeGlow?.value || '0', 10);
        fsOverlay?.style.setProperty('--led-glow', `${glowVal * 3}px`);

        fsOverlay?.classList.remove('hidden');

        if (fsOverlay?.requestFullscreen) {
            fsOverlay.requestFullscreen().catch(() => {});
        } else if (fsOverlay?.webkitRequestFullscreen) {
            fsOverlay.webkitRequestFullscreen().catch(() => {});
        }

        if (fsHint) {
            fsHint.style.opacity = '1';
            setTimeout(() => { if (fsHint) fsHint.style.opacity = '0'; }, 2600);
        }
    });

    fsOverlay?.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen().catch(() => {});
        }
        fsOverlay.classList.add('hidden');
    });

    syncAll();
    rootContainer.style.setProperty('--led-size', '4.5rem');
}