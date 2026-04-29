import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* THIẾT LẬP BIẾN CSS TOÀN CỤC CHO APP */
            #led-app {
                --led-color: #00ffcc;
                --led-bg: #09090b;
                --led-font: 'Inter', sans-serif;
                --led-size: 4rem;
                --led-speed: 30s;
                --led-glow: 0px;
                --led-space: 0px;
            }

            /* SCROLLBAR & CHUNG */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            /* BENTO UI ELEMENTS */
            .bento-card { 
                background: #ffffff; 
                border-radius: 24px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
                border: 1px solid #f4f4f5; 
                padding: 1.5rem; 
            }
            .dark .bento-card { 
                background: #121214; 
                box-shadow: none; 
                border-color: #27272a; 
            }

            /* PILL RADIO BUTTONS (Style Toggle) */
            .radio-pill-group { display: flex; gap: 0.5rem; background: #f4f4f5; padding: 0.35rem; border-radius: 16px; }
            .dark .radio-pill-group { background: #18181b; }
            .radio-pill-label { flex: 1; text-align: center; font-size: 0.75rem; font-weight: 700; color: #71717a; padding: 0.6rem 0; cursor: pointer; border-radius: 12px; transition: all 0.2s ease; }
            .radio-pill-input { display: none; }
            .radio-pill-input:checked + .radio-pill-label { background: #ffffff; color: #09090b; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .dark .radio-pill-input:checked + .radio-pill-label { background: #27272a; color: #ffffff; box-shadow: none; }

            /* PREMIUM RANGE SLIDER */
            .premium-range { -webkit-appearance: none; appearance: none; width: 100%; background: transparent; outline: none; height: 24px; cursor: pointer; }
            .premium-range::-webkit-slider-runnable-track { height: 6px; background: #e4e4e7; border-radius: 6px; transition: 0.2s; }
            .dark .premium-range::-webkit-slider-runnable-track { background: #27272a; }
            .premium-range::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #ffffff; border: 2px solid #18181b; margin-top: -7px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: transform 0.1s; }
            .dark .premium-range::-webkit-slider-thumb { background: #18181b; border-color: #ffffff; }
            .premium-range:active::-webkit-slider-thumb { transform: scale(0.9); }

            /* PREMIUM TOGGLE */
            .premium-toggle { appearance: none; width: 44px; height: 24px; background: #e4e4e7; border-radius: 12px; position: relative; cursor: pointer; outline: none; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .dark .premium-toggle { background: #27272a; }
            .premium-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .premium-toggle:checked { background: #18181b; }
            .dark .premium-toggle:checked { background: #ffffff; }
            .premium-toggle:checked::after { transform: translateX(20px); background: #ffffff; }
            .dark .premium-toggle:checked::after { background: #18181b; }

            /* BIG BUTTON */
            .btn-start { background: #18181b; color: #fff; border-radius: 20px; font-weight: 800; letter-spacing: 0.1em; transition: all 0.2s; user-select: none; }
            .dark .btn-start { background: #ffffff; color: #18181b; }
            .btn-start:active { transform: scale(0.97); }

            /* CORE MARQUEE ENGINE (SEAMLESS LOOP) */
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
                padding-right: 3rem; 
            }

            .marquee-text {
                white-space: nowrap;
                font-family: var(--led-font);
                font-size: var(--led-size);
                color: var(--led-color);
                letter-spacing: var(--led-space);
                text-shadow: 0 0 var(--led-glow) var(--led-color);
                font-weight: 900;
                line-height: 1;
            }

            /* HƯỚNG CHẠY */
            .dir-normal { animation-direction: normal; }
            .dir-reverse { animation-direction: reverse; }

            @keyframes scroll-seamless {
                from { transform: translate3d(0, 0, 0); }
                to { transform: translate3d(-100%, 0, 0); } 
            }

            /* EFFECTS MASK */
            .fx-led { mask-image: radial-gradient(circle, black 40%, transparent 50%); mask-size: 8px 8px; }
            
            /* FULLSCREEN CONTAINER */
            #led-fs-container.fs-rotated { transform: rotate(90deg); width: 100vh; height: 100vw; }
            #led-fs-container.fs-normal { transform: none; width: 100vw; height: 100vh; }
        </style>

        <div id="led-app" class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[500px]">
            <div class="mb-8 px-2 text-center md:text-left">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight mb-2">LED Board</h2>
                <p class="text-sm text-zinc-500 font-medium">Bảng điều khiển Minimal Premium.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-7 space-y-6">
                    
                    <div class="bento-card space-y-5">
                        <div>
                            <input type="text" id="led-input" placeholder="Nhập nội dung..." value="HELLO CONCERT 🔥" class="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white outline-none text-2xl font-black text-zinc-900 dark:text-white py-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700">
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2 px-1">Hiệu ứng</label>
                                <div class="radio-pill-group">
                                    <input type="radio" name="fx" id="fx-solid" value="solid" class="radio-pill-input" checked>
                                    <label for="fx-solid" class="radio-pill-label">Cổ điển</label>
                                    
                                    <input type="radio" name="fx" id="fx-led" value="led" class="radio-pill-input">
                                    <label for="fx-led" class="radio-pill-label">Bóng LED</label>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2 px-1">Màu sắc</label>
                                <div class="flex items-center gap-2">
                                    <div class="relative w-1/2 h-[42px] rounded-xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
                                        <input type="color" id="color-text" value="#00ffcc" class="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer">
                                        <span class="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-black text-black/50 mix-blend-overlay">TEXT</span>
                                    </div>
                                    <div class="relative w-1/2 h-[42px] rounded-xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
                                        <input type="color" id="color-bg" value="#000000" class="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer">
                                        <span class="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-black text-white/50 mix-blend-overlay">NỀN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bento-card space-y-6">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2 px-1">Chuyển động & Kích thước</label>
                        
                        <div class="space-y-5">
                            <div class="flex flex-col gap-2">
                                <div class="flex justify-between px-1"><span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Tốc độ</span><span class="text-xs font-bold" id="lbl-speed">Vừa phải</span></div>
                                <input type="range" id="range-speed" min="1" max="100" value="40" class="premium-range">
                            </div>
                            
                            <div class="flex flex-col gap-2">
                                <div class="flex justify-between px-1"><span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Độ Toả Sáng (Neon)</span><span class="text-xs font-bold" id="lbl-glow">0px</span></div>
                                <input type="range" id="range-glow" min="0" max="50" value="0" class="premium-range">
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                            <div class="flex items-center gap-3 w-full sm:w-auto">
                                <input type="checkbox" id="toggle-dir" class="premium-toggle">
                                <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Chạy ngược</span>
                            </div>
                            <div class="flex items-center gap-3 w-full sm:w-auto">
                                <input type="checkbox" id="toggle-rotate" class="premium-toggle">
                                <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Xoay ngang khi phát</span>
                            </div>
                        </div>
                    </div>

                    <button id="btn-start" class="btn-start w-full py-5 text-sm uppercase flex justify-center items-center gap-3">
                        <i class="fas fa-expand"></i> BẮT ĐẦU PHÁT TOÀN MÀN HÌNH
                    </button>
                </div>

                <div class="lg:col-span-5 sticky top-6">
                    <div class="bento-card p-2 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
                        <div class="bg-zinc-100 dark:bg-[#18181b] rounded-[18px] py-2 px-4 mb-2 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Preview</span>
                            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        
                        <div class="w-full aspect-[16/9] rounded-[20px] overflow-hidden relative">
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
        </div>

        <div id="fs-overlay" class="fixed inset-0 z-[10000] hidden bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none">
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
            <div id="fs-hint" class="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white/70 text-[11px] font-bold uppercase tracking-widest opacity-0 transition-opacity duration-1000 pointer-events-none border border-white/5">Chạm để thoát</div>
        </div>
    `;
}

export function init() {
    const app = document.getElementById('led-app');
    
    // Inputs
    const inputStr = document.getElementById('led-input');
    const colorText = document.getElementById('color-text');
    const colorBg = document.getElementById('color-bg');
    const rangeSpeed = document.getElementById('range-speed');
    const rangeGlow = document.getElementById('range-glow');
    const toggleDir = document.getElementById('toggle-dir');
    const toggleRotate = document.getElementById('toggle-rotate');
    const radiosFx = document.querySelectorAll('input[name="fx"]');
    
    // Labels
    const lblSpeed = document.getElementById('lbl-speed');
    const lblGlow = document.getElementById('lbl-glow');

    // DOM Elements
    const pTexts = document.querySelectorAll('.preview-text');
    const pTracks = document.querySelectorAll('.preview-track');
    const fsOverlay = document.getElementById('fs-overlay');
    const fsContainer = document.getElementById('led-fs-container');
    const fsTexts = document.querySelectorAll('.fs-text');
    const fsTracks = document.querySelectorAll('.fs-track');
    const fsHint = document.getElementById('fs-hint');
    const btnStart = document.getElementById('btn-start');

    const updateCSSVariables = () => {
        app.style.setProperty('--led-color', colorText.value);
        app.style.setProperty('--led-bg', colorBg.value);
        
        // Tinh chỉnh công thức tốc độ chậm rãi hơn
        // speedVal = 1 -> duration = 59.45s (Rất chậm)
        // speedVal = 100 -> duration = 5s (Nhanh)
        const speedVal = parseInt(rangeSpeed.value);
        const duration = 60 - (speedVal * 0.55); 
        app.style.setProperty('--led-speed', `${duration}s`);
        
        // Cập nhật nhãn
        if(speedVal < 30) lblSpeed.textContent = "Chậm";
        else if(speedVal < 70) lblSpeed.textContent = "Vừa phải";
        else lblSpeed.textContent = "Nhanh";

        const glowVal = rangeGlow.value;
        app.style.setProperty('--led-glow', `${glowVal}px`);
        lblGlow.textContent = `${glowVal}px`;
    };

    const renderText = () => {
        const rawText = inputStr.value || "HELLO";
        const repeatedString = (rawText + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0").repeat(8);
        
        pTexts.forEach(el => el.textContent = repeatedString);
        fsTexts.forEach(el => el.textContent = repeatedString);
    };

    const updateStyleAndDirection = () => {
        const dirClass = toggleDir.checked ? 'dir-reverse' : 'dir-normal';
        const tracks = [...pTracks, ...fsTracks];
        tracks.forEach(track => {
            track.classList.remove('dir-normal', 'dir-reverse');
            track.classList.add(dirClass);
        });

        const selectedFx = document.querySelector('input[name="fx"]:checked').value;
        const texts = [...pTexts, ...fsTexts];
        texts.forEach(text => {
            if(selectedFx === 'led') text.classList.add('fx-led');
            else text.classList.remove('fx-led');
        });
    };

    const syncAll = () => {
        updateCSSVariables();
        renderText();
        updateStyleAndDirection();
    };

    [inputStr, colorText, colorBg, rangeSpeed, rangeGlow, toggleDir].forEach(el => {
        el.addEventListener('input', syncAll);
    });
    radiosFx.forEach(el => el.addEventListener('change', syncAll));

    // BẮT ĐẦU FULLSCREEN
    btnStart.addEventListener('click', () => {
        if (!inputStr.value.trim()) return UI.showAlert('Thông báo', 'Vui lòng nhập nội dung.', 'warning');

        fsOverlay.style.setProperty('--led-color', colorText.value);
        fsOverlay.style.setProperty('--led-bg', colorBg.value);
        
        // Lấy thời gian gốc của bản xem trước
        const baseDuration = parseFloat(app.style.getPropertyValue('--led-speed'));

        // Xử lý Xoay & Tỉ lệ tốc độ
        if (toggleRotate.checked) {
            fsContainer.className = 'fs-rotated flex items-center justify-center transition-transform duration-300';
            fsOverlay.style.setProperty('--led-size', '65vw');
            
            // Vì màn hình ngang (vw) có quãng đường cực dài so với xem trước, nhân duration lên 8 lần
            fsOverlay.style.setProperty('--led-speed', `${baseDuration * 8}s`);
        } else {
            fsContainer.className = 'fs-normal flex items-center justify-center transition-transform duration-300';
            fsOverlay.style.setProperty('--led-size', '65vh');
            
            // Màn hình dọc (vh) quãng đường ngắn hơn một chút, nhân duration lên 5 lần
            fsOverlay.style.setProperty('--led-speed', `${baseDuration * 5}s`);
        }

        fsOverlay.style.setProperty('--led-glow', `${parseInt(rangeGlow.value) * 3}px`);

        fsOverlay.classList.remove('hidden');
        if (fsOverlay.requestFullscreen) fsOverlay.requestFullscreen().catch(() => {});
        
        fsHint.style.opacity = '1';
        setTimeout(() => fsHint.style.opacity = '0', 3000);
    });

    fsOverlay.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        fsOverlay.classList.add('hidden');
    });

    syncAll();
    app.style.setProperty('--led-size', '5rem');
}