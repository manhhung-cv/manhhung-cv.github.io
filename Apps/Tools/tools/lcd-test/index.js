import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Layer Fullscreen Test */
            #lcd-tester-fullscreen {
                display: none;
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: 99999;
                cursor: none; /* Ẩn chuột mặc định khi không di chuyển */
                background-color: #000;
            }
            #lcd-tester-fullscreen.active { display: block; cursor: default; }
            
            /* Ẩn guide khi không tương tác để test màn hình sạch nhất */
            .tester-guide, .btn-exit-fullscreen {
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            }
            #lcd-tester-fullscreen.active:hover .tester-guide,
            #lcd-tester-fullscreen.active:hover .btn-exit-fullscreen,
            #lcd-tester-fullscreen.active:active .tester-guide,
            #lcd-tester-fullscreen.active:active .btn-exit-fullscreen { 
                opacity: 1; 
            }

            /* Nút thoát cao cấp chuẩn Minimal Premium */
            .btn-exit-fullscreen {
                position: absolute;
                top: 24px; right: 24px;
                background: rgba(24, 24, 27, 0.4);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                padding: 10px 20px;
                border-radius: 99px;
                font-size: 13px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .btn-exit-fullscreen:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            /* Test Canvas */
            #test-canvas {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                display: none;
            }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Display Analysis Pro</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Bộ công cụ đo đạc thông số và phân tích chất lượng tấm nền toàn diện.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <div class="md:col-span-1 ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 space-y-6">
                    <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-desktop"></i> Parameters
                    </h3>
                    
                    <div class="space-y-3">
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 flex flex-col gap-1">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Độ phân giải thực</span>
                            <span id="screen-real-res" class="text-lg font-black text-zinc-900 dark:text-white">...</span>
                        </div>
                        
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 flex justify-between items-center">
                            <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Logic</span>
                            <span id="screen-logic-res" class="text-sm font-bold text-zinc-700 dark:text-zinc-300">...</span>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tỉ lệ</span>
                                <span id="screen-ratio" class="text-sm font-black text-zinc-900 dark:text-white">...</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Màu</span>
                                <span id="screen-color-depth" class="text-sm font-black text-zinc-900 dark:text-white">...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2 ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 space-y-6">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="fas fa-vial"></i> Test Suite
                        </h3>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" data-test="deadpixel">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Dead Pixel</h4>
                                <p class="text-[11px] text-zinc-500 font-medium">Kiểm tra điểm ảnh chết bằng các dải màu cơ bản (Trắng, Đen, RGB).</p>
                            </div>
                        </button>

                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" data-test="uniformity">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white">
                                <i class="fas fa-adjust"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Uniformity</h4>
                                <p class="text-[11px] text-zinc-500 font-medium">Kiểm tra độ đồng nhất đèn nền (Hở sáng, Dirty Screen Effect).</p>
                            </div>
                        </button>

                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" data-test="gradient">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white" style="background: linear-gradient(135deg, #eee, #333);">
                                <i class="fas fa-palette text-white mix-blend-difference"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Color Gradients</h4>
                                <p class="text-[11px] text-zinc-500 font-medium">Kiểm tra hiện tượng Banding khi chuyển màu mượt mà.</p>
                            </div>
                        </button>

                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" data-test="pattern">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white">
                                <i class="fas fa-border-all"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Test Pattern</h4>
                                <p class="text-[11px] text-zinc-500 font-medium">Lưới Crosshatch kiểm tra độ sắc nét và tỷ lệ hình học.</p>
                            </div>
                        </button>

                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" data-test="gamma">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white">
                                <i class="fas fa-braille"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Gamma Calibration</h4>
                                <p class="text-[11px] text-zinc-500 font-medium">Kiểm tra khả năng hiển thị dải sáng (Scanlines vs Solid 50%).</p>
                            </div>
                        </button>

                        <button class="test-trigger btn-premium flex flex-col items-start gap-3 p-5 rounded-2xl bg-zinc-900 dark:bg-white border border-transparent text-white dark:text-zinc-900" data-test="fps">
                            <div class="w-10 h-10 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-bold mb-1">UFO / FPS Test</h4>
                                <p class="text-[11px] font-medium opacity-80">Đo tốc độ làm tươi thực tế (Hz) và kiểm tra Ghosting.</p>
                            </div>
                        </button>

                    </div>
                </div>

            </div>
        </div>

        <div id="lcd-tester-fullscreen">
            <canvas id="test-canvas"></canvas>
            
            <button class="btn-exit-fullscreen" id="btn-exit-test">
                Thoát <i class="fas fa-times"></i>
            </button>

            <div class="tester-guide absolute bottom-10 left-0 w-full flex justify-center pointer-events-none">
                <span class="bg-black/60 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full text-[13px] font-bold tracking-wider drop-shadow-xl flex items-center gap-2" id="test-guide-text">
                    <i class="fas fa-hand-point-left"></i> Chạm 2 bên hoặc dùng ⬅ ➡ để điều hướng
                </span>
            </div>
        </div>
    `;
}

export function init() {
    // ----------------------------------------------------
    // 1. TÍNH TOÁN THÔNG SỐ MÀN HÌNH
    // ----------------------------------------------------
    const updateScreenInfo = () => {
        const logicW = window.screen.width;
        const logicH = window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        
        const realW = Math.round(logicW * pixelRatio);
        const realH = Math.round(logicH * pixelRatio);
        const colorDepth = window.screen.colorDepth;

        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(realW, realH);
        let ratioW = realW / divisor;
        let ratioH = realH / divisor;

        const ratioDecimal = realW / realH;
        let ratioStr = `${ratioW}:${ratioH}`;
        if (Math.abs(ratioDecimal - 16/9) < 0.05) ratioStr = "16:9";
        else if (Math.abs(ratioDecimal - 16/10) < 0.05) ratioStr = "16:10";
        else if (Math.abs(ratioDecimal - 21/9) < 0.05) ratioStr = "21:9";

        document.getElementById('screen-real-res').textContent = `${realW} x ${realH}`;
        document.getElementById('screen-logic-res').textContent = `${logicW} x ${logicH} (x${pixelRatio})`;
        document.getElementById('screen-ratio').textContent = ratioStr;
        document.getElementById('screen-color-depth').textContent = `${colorDepth}-bit`;
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);

    // ----------------------------------------------------
    // 2. LOGIC TEST SUITE ENGINE
    // ----------------------------------------------------
    const testLayer = document.getElementById('lcd-tester-fullscreen');
    const canvas = document.getElementById('test-canvas');
    const ctx = canvas.getContext('2d');
    const guideText = document.getElementById('test-guide-text');
    const btnExit = document.getElementById('btn-exit-test');
    const triggers = document.querySelectorAll('.test-trigger');

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
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
    };

    const clearTest = () => {
        if (animationId) cancelAnimationFrame(animationId);
        testLayer.style.background = '#000';
        canvas.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const renderTest = () => {
        clearTest();
        
        if (currentMode === 'deadpixel' || currentMode === 'uniformity' || currentMode === 'gradient') {
            const arr = stepsData[currentMode];
            testLayer.style.background = arr[stepIndex];
            guideText.innerHTML = '<i class="fas fa-hand-point-left"></i> Chạm 2 bên hoặc dùng ⬅ ➡ để điều hướng';
        }
        else if (currentMode === 'pattern') {
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-border-all"></i> Kiểm tra lưới hình học';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            const gridSize = 50 * window.devicePixelRatio;
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
            for (let y = 0; y <= canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, gridSize*2, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (currentMode === 'gamma') {
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-eye"></i> Lùi ra xa: Hình vuông giữa phải tiệp màu nền';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            for (let y = 0; y < canvas.height; y += 2) { ctx.fillRect(0, y, canvas.width, 1); }
            
            const boxSize = Math.min(canvas.width, canvas.height) * 0.4;
            const startX = (canvas.width - boxSize) / 2;
            const startY = (canvas.height - boxSize) / 2;
            ctx.fillStyle = '#808080';
            ctx.fillRect(startX, startY, boxSize, boxSize);
        }
        else if (currentMode === 'fps') {
            canvas.style.display = 'block';
            resizeCanvas();
            guideText.innerHTML = '<i class="fas fa-tachometer-alt"></i> Kiểm tra Tần số quét & Ghosting';
            
            let lastTime = performance.now();
            let frames = 0;
            let fps = 0;
            let x = 0;
            let speed = 8 * window.devicePixelRatio;

            const drawFPS = (time) => {
                frames++;
                if (time - lastTime >= 1000) { fps = frames; frames = 0; lastTime = time; }

                ctx.fillStyle = '#18181b';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#FFFFFF';
                const boxW = 100 * window.devicePixelRatio;
                const boxH = 100 * window.devicePixelRatio;
                const y = (canvas.height - boxH) / 2;
                ctx.fillRect(x, y, boxW, boxH);
                
                x += speed;
                if (x + boxW > canvas.width || x < 0) speed = -speed;

                ctx.fillStyle = '#00FF00';
                ctx.font = `bold ${80 * window.devicePixelRatio}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`${fps} FPS / Hz`, canvas.width / 2, canvas.height / 2 - 150 * window.devicePixelRatio);

                animationId = requestAnimationFrame(drawFPS);
            };
            animationId = requestAnimationFrame(drawFPS);
        }
    };

    const startTest = async (mode) => {
        currentMode = mode;
        stepIndex = 0;
        testLayer.classList.add('active');
        renderTest();

        try {
            if (testLayer.requestFullscreen) await testLayer.requestFullscreen();
            else if (testLayer.webkitRequestFullscreen) await testLayer.webkitRequestFullscreen();
        } catch (err) {
            console.log("Trình duyệt không hỗ trợ tự động Fullscreen, vẫn hiển thị Layer.");
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
        if (stepIndex < 0) stepIndex = stepsData[currentMode].length - 1; // Vòng lặp lại
        renderTest();
    };

    const exitTest = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
        clearTest();
        testLayer.classList.remove('active');
        currentMode = '';
    };

    // Events Bắt đầu
    triggers.forEach(btn => {
        btn.addEventListener('click', () => startTest(btn.getAttribute('data-test')));
    });
    
    // Nút Thoát
    btnExit.addEventListener('click', exitTest);

    // Xử lý Click/Chạm để qua lại
    testLayer.addEventListener('click', (e) => {
        // Bỏ qua nếu bấm vào nút thoát
        if (e.target.closest('#btn-exit-test')) return;
        
        // Chia màn hình: 1/3 trái là Lùi, 2/3 phải là Tiến
        const clickX = e.clientX;
        const screenW = window.innerWidth;
        if (clickX < screenW / 3) {
            handlePrevStep();
        } else {
            handleNextStep();
        }
    });

    // Xử lý Bàn phím
    document.addEventListener('keydown', (e) => {
        if (!currentMode) return;
        
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            handleNextStep();
        } else if (e.key === 'ArrowLeft') {
            handlePrevStep();
        } else if (e.key === 'Escape') {
            exitTest();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && currentMode) {
            exitTest();
        }
    });
}