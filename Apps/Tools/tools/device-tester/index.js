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
// 2. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="media-tester-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        <style>
            #media-tester-root {
                --kit-accent: #10b981;
            }
            .bg-accent-theme { background-color: var(--kit-accent) !important; }
            .text-accent-theme { color: var(--kit-accent) !important; }
            .border-accent-theme { border-color: var(--kit-accent) !important; }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }

            .media-card {
                background: #ffffff;
                border: 1px solid rgba(0, 0, 0, 0.06);
                border-radius: 20px;
                padding: 18px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            }
            .dark .media-card {
                background: #161618;
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
            }

            .media-ctrl-btn {
                height: 38px;
                padding: 0 14px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: transform 0.1s ease, background 0.15s ease, opacity 0.15s ease;
            }
            .media-ctrl-btn:active { transform: scale(0.96); }

            .mic-meter-track {
                height: 12px;
                border-radius: 9999px;
                background: rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            .dark .mic-meter-track {
                background: rgba(255, 255, 255, 0.08);
            }
            .mic-meter-fill {
                height: 100%;
                width: 0%;
                background: var(--kit-accent);
                border-radius: 9999px;
                transition: width 0.06s ease;
            }
        </style>

        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- HEADER -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Hardware Testing</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Kiểm Tra Webcam, Mic & Loa</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Xác thực độ phân giải camera, kiểm tra độ nhạy mic thu âm và kiểm tra kênh âm thanh Stereo thời gian thực.</p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <button id="media-stop-all-btn" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-power-off text-xs"></i> Dừng tất cả
                    </button>
                </div>
            </div>

            <!-- GRID TEST CONTAINERS -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                <!-- 1. WEBCAM TESTER -->
                <div class="media-card space-y-4 flex flex-col justify-between">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-video text-accent-theme text-sm"></i>
                                <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Kiểm tra Camera (Webcam)</h3>
                            </div>
                            <span id="cam-status-badge" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Chưa bật</span>
                        </div>

                        <!-- Video Viewport -->
                        <div class="relative w-full aspect-video rounded-2xl bg-black/10 dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] overflow-hidden flex items-center justify-center">
                            <video id="webcam-preview" autoplay playsinline muted class="w-full h-full object-cover hidden -scale-x-100"></video>
                            <div id="webcam-placeholder" class="flex flex-col items-center gap-2 text-zinc-400">
                                <i class="fas fa-camera text-3xl opacity-40"></i>
                                <span class="text-xs font-mono">Camera đang tắt</span>
                            </div>
                            <div id="cam-res-overlay" class="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-[10px] font-mono text-white hidden">
                                0 x 0
                            </div>
                        </div>

                        <!-- Camera Selection & Info -->
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Chọn thiết bị Camera</label>
                            <select id="camera-select" class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none">
                                <option value="">Mặc định hệ thống</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <button id="toggle-camera-btn" class="media-ctrl-btn bg-accent-theme text-white">
                            <i class="fas fa-play"></i> Bật Camera
                        </button>
                        <button id="snapshot-cam-btn" class="media-ctrl-btn bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 disabled:opacity-40" disabled>
                            <i class="fas fa-camera-retro"></i> Chụp ảnh thử
                        </button>
                    </div>
                </div>

                <!-- 2. MICROPHONE TESTER -->
                <div class="media-card space-y-4 flex flex-col justify-between">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-microphone text-accent-theme text-sm"></i>
                                <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Kiểm tra Micro (Microphone)</h3>
                            </div>
                            <span id="mic-status-badge" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Chưa bật</span>
                        </div>

                        <!-- Mic Spectrum Visualizer Canvas -->
                        <div class="w-full aspect-video rounded-2xl bg-black/10 dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] p-3 flex flex-col justify-between relative overflow-hidden">
                            <canvas id="mic-visualizer" class="w-full h-32"></canvas>
                            
                            <!-- Volume Progress Bar -->
                            <div class="space-y-1">
                                <div class="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                    <span>Độ nhạy thu âm (Cường độ)</span>
                                    <span id="mic-level-val">0%</span>
                                </div>
                                <div class="mic-meter-track">
                                    <div id="mic-meter-bar" class="mic-meter-fill"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Mic Device Selection -->
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Chọn thiết bị Micro</label>
                            <select id="mic-select" class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none">
                                <option value="">Mặc định hệ thống</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <button id="toggle-mic-btn" class="media-ctrl-btn bg-accent-theme text-white">
                            <i class="fas fa-microphone-lines"></i> Bật Micro
                        </button>
                    </div>
                </div>

                <!-- 3. SPEAKER & STEREO TESTER -->
                <div class="media-card space-y-4 lg:col-span-2">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-volume-high text-accent-theme text-sm"></i>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Kiểm tra Loa & Tai nghe (Speaker / Audio)</h3>
                        </div>
                        <span class="text-[10px] font-mono text-zinc-400">Tần số âm chuẩn 440Hz / Stereo</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button id="test-left-speaker" class="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-black/40 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-center space-y-1">
                            <i class="fas fa-arrow-left text-lg text-blue-500 mb-1"></i>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Loa Trái (Left)</div>
                            <div class="text-[10px] text-zinc-400">Kiểm tra kênh trái</div>
                        </button>

                        <button id="test-both-speaker" class="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-black/40 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-center space-y-1">
                            <i class="fas fa-arrows-left-right text-lg text-accent-theme mb-1"></i>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Cả 2 Loa (Both)</div>
                            <div class="text-[10px] text-zinc-400">Phát Stereo đồng bộ</div>
                        </button>

                        <button id="test-right-speaker" class="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-black/40 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-center space-y-1">
                            <i class="fas fa-arrow-right text-lg text-rose-500 mb-1"></i>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Loa Phải (Right)</div>
                            <div class="text-[10px] text-zinc-400">Kiểm tra kênh phải</div>
                        </button>
                    </div>
                </div>

            </div>
        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC CONTROLLER
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#media-tester-root') || hostElement;
    ThemeKit.applyAccent(rootContainer);

    const _ = sel => hostElement.querySelector(sel);

    // Camera Refs
    const videoEl = _('#webcam-preview');
    const placeholderEl = _('#webcam-placeholder');
    const toggleCamBtn = _('#toggle-camera-btn');
    const snapshotBtn = _('#snapshot-cam-btn');
    const cameraSelect = _('#camera-select');
    const camStatusBadge = _('#cam-status-badge');
    const camResOverlay = _('#cam-res-overlay');
    let videoStream = null;

    // Mic Refs
    const toggleMicBtn = _('#toggle-mic-btn');
    const micSelect = _('#mic-select');
    const micStatusBadge = _('#mic-status-badge');
    const micMeterBar = _('#mic-meter-bar');
    const micLevelVal = _('#mic-level-val');
    const canvas = _('#mic-visualizer');
    const canvasCtx = canvas ? canvas.getContext('2d') : null;
    let micStream = null;
    let audioCtx = null;
    let analyser = null;
    let micAnimId = null;

    // Speaker Tone AudioContext
    let toneAudioCtx = null;

    // =========================================================================
    // A. ENUMERATE DEVICES
    // =========================================================================
    async function loadDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            if (cameraSelect) {
                cameraSelect.innerHTML = '<option value="">Mặc định hệ thống</option>';
                devices.filter(d => d.kind === 'videoinput').forEach((d, idx) => {
                    cameraSelect.innerHTML += `<option value="${d.deviceId}">${d.label || `Camera ${idx + 1}`}</option>`;
                });
            }
            if (micSelect) {
                micSelect.innerHTML = '<option value="">Mặc định hệ thống</option>';
                devices.filter(d => d.kind === 'audioinput').forEach((d, idx) => {
                    micSelect.innerHTML += `<option value="${d.deviceId}">${d.label || `Microphone ${idx + 1}`}</option>`;
                });
            }
        } catch (e) {
            console.warn('Lỗi tải danh sách thiết bị:', e);
        }
    }
    loadDevices();

    // =========================================================================
    // B. WEBCAM CONTROLLER
    // =========================================================================
    async function startCamera() {
        stopCamera();
        const deviceId = cameraSelect ? cameraSelect.value : null;
        const constraints = {
            video: deviceId ? { deviceId: { exact: deviceId } } : true,
            audio: false
        };

        try {
            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoEl) {
                videoEl.srcObject = videoStream;
                videoEl.classList.remove('hidden');
            }
            placeholderEl?.classList.add('hidden');
            toggleCamBtn.innerHTML = '<i class="fas fa-stop"></i> Dừng Camera';
            toggleCamBtn.classList.replace('bg-accent-theme', 'bg-rose-500');
            snapshotBtn.disabled = false;
            
            camStatusBadge.textContent = 'Đang phát';
            camStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400';

            videoEl.onloadedmetadata = () => {
                if (camResOverlay) {
                    camResOverlay.textContent = `${videoEl.videoWidth} x ${videoEl.videoHeight}`;
                    camResOverlay.classList.remove('hidden');
                }
            };
            loadDevices();
            IslandKit.notify('Webcam', 'Camera đã kết nối thành công.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi Camera', err.message || 'Không thể mở Camera.', 'error');
            stopCamera();
        }
    }

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(t => t.stop());
            videoStream = null;
        }
        if (videoEl) {
            videoEl.srcObject = null;
            videoEl.classList.add('hidden');
        }
        placeholderEl?.classList.remove('hidden');
        camResOverlay?.classList.add('hidden');
        if (toggleCamBtn) {
            toggleCamBtn.innerHTML = '<i class="fas fa-play"></i> Bật Camera';
            toggleCamBtn.classList.replace('bg-rose-500', 'bg-accent-theme');
        }
        if (snapshotBtn) snapshotBtn.disabled = true;
        if (camStatusBadge) {
            camStatusBadge.textContent = 'Đã tắt';
            camStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500';
        }
    }

    toggleCamBtn?.addEventListener('click', () => {
        if (videoStream) stopCamera();
        else startCamera();
    });

    cameraSelect?.addEventListener('change', () => {
        if (videoStream) startCamera();
    });

    snapshotBtn?.addEventListener('click', () => {
        if (!videoEl || !videoStream) return;
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = videoEl.videoWidth || 640;
        snapCanvas.height = videoEl.videoHeight || 480;
        const ctx = snapCanvas.getContext('2d');
        ctx.translate(snapCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoEl, 0, 0, snapCanvas.width, snapCanvas.height);
        
        const link = document.createElement('a');
        link.download = `snapshot-${Date.now()}.png`;
        link.href = snapCanvas.toDataURL('image/png');
        link.click();
        IslandKit.notify('Chụp ảnh', 'Đã lưu ảnh chụp camera.', 'info');
    });

    // =========================================================================
    // C. MICROPHONE CONTROLLER
    // =========================================================================
    async function startMic() {
        stopMic();
        const deviceId = micSelect ? micSelect.value : null;
        const constraints = {
            audio: deviceId ? { deviceId: { exact: deviceId } } : true,
            video: false
        };

        try {
            micStream = await navigator.mediaDevices.getUserMedia(constraints);
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(micStream);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            toggleMicBtn.innerHTML = '<i class="fas fa-stop"></i> Dừng Micro';
            toggleMicBtn.classList.replace('bg-accent-theme', 'bg-rose-500');
            micStatusBadge.textContent = 'Đang thu';
            micStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400';

            drawMicLevel();
            loadDevices();
            IslandKit.notify('Microphone', 'Đã bắt đầu thu nhận âm thanh.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi Micro', err.message || 'Không thể mở Micro.', 'error');
            stopMic();
        }
    }

    function drawMicLevel() {
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const percent = Math.min(100, Math.round((avg / 128) * 100));

        if (micMeterBar) micMeterBar.style.width = `${percent}%`;
        if (micLevelVal) micLevelVal.textContent = `${percent}%`;

        // Canvas Visualizer Bars
        if (canvasCtx && canvas) {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                canvasCtx.fillStyle = '#10b981';
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 2;
            }
        }

        micAnimId = requestAnimationFrame(drawMicLevel);
    }

    function stopMic() {
        if (micAnimId) {
            cancelAnimationFrame(micAnimId);
            micAnimId = null;
        }
        if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
            micStream = null;
        }
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
        analyser = null;

        if (toggleMicBtn) {
            toggleMicBtn.innerHTML = '<i class="fas fa-microphone-lines"></i> Bật Micro';
            toggleMicBtn.classList.replace('bg-rose-500', 'bg-accent-theme');
        }
        if (micMeterBar) micMeterBar.style.width = '0%';
        if (micLevelVal) micLevelVal.textContent = '0%';
        if (micStatusBadge) {
            micStatusBadge.textContent = 'Đã tắt';
            micStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500';
        }
        if (canvasCtx && canvas) {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    toggleMicBtn?.addEventListener('click', () => {
        if (micStream) stopMic();
        else startMic();
    });

    micSelect?.addEventListener('change', () => {
        if (micStream) startMic();
    });

    // =========================================================================
    // D. SPEAKER / STEREO TESTER
    // =========================================================================
    function playTone(panDirection = 0) {
        try {
            if (toneAudioCtx) toneAudioCtx.close();
            toneAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

            const osc = toneAudioCtx.createOscillator();
            const gainNode = toneAudioCtx.createGain();
            const panner = toneAudioCtx.createStereoPanner ? toneAudioCtx.createStereoPanner() : null;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, toneAudioCtx.currentTime); // 440Hz chuẩn nốt La (A4)

            // Điều chỉnh hướng Pan (Kênh loa)
            if (panner) {
                panner.pan.setValueAtTime(panDirection, toneAudioCtx.currentTime);
                osc.connect(panner);
                panner.connect(gainNode);
            } else {
                osc.connect(gainNode);
            }

            gainNode.connect(toneAudioCtx.destination);

            // Mềm hóa âm sắc tránh tiếng nổ pop
            gainNode.gain.setValueAtTime(0, toneAudioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, toneAudioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, toneAudioCtx.currentTime + 1.2);

            osc.start();
            osc.stop(toneAudioCtx.currentTime + 1.2);
        } catch (e) {
            IslandKit.notify('Lỗi Loa', 'Trình duyệt không hỗ trợ Web Audio API.', 'error');
        }
    }

    _('#test-left-speaker')?.addEventListener('click', () => {
        playTone(-1);
        IslandKit.notify('Loa Trái', 'Đang phát âm thử nghiệm kênh Trái (Left).', 'info');
    });

    _('#test-both-speaker')?.addEventListener('click', () => {
        playTone(0);
        IslandKit.notify('Cả 2 Loa', 'Đang phát âm Stereo đồng bộ 2 bên.', 'info');
    });

    _('#test-right-speaker')?.addEventListener('click', () => {
        playTone(1);
        IslandKit.notify('Loa Phải', 'Đang phát âm thử nghiệm kênh Phải (Right).', 'info');
    });

    // Dừng toàn bộ thiết bị khi người dùng bấm nút hoặc rời app
    const stopAllDevices = () => {
        stopCamera();
        stopMic();
        if (toneAudioCtx) {
            toneAudioCtx.close();
            toneAudioCtx = null;
        }
    };

    _('#media-stop-all-btn')?.addEventListener('click', () => {
        stopAllDevices();
        IslandKit.notify('Đã dừng', 'Tất cả thiết bị đã được ngắt kết nối.', 'info');
    });

    // Dọn dẹp luồng khi đóng ứng dụng hoặc đổi tab
    window.addEventListener('beforeunload', stopAllDevices);
}