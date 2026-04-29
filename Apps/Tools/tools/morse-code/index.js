import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-end mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Morse AI Pro</h2>
                    <p class="text-sm text-zinc-500 mt-1">Dịch thuật, phát tín hiệu OLED và giải mã bằng Camera.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col p-5">
                        <div class="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                            <div class="flex items-center gap-3 w-full">
                                <div id="mc-label-1" class="flex-1 text-center py-2 bg-zinc-900 dark:bg-white rounded-xl text-sm font-bold text-white dark:text-zinc-900 shadow-sm transition-all">Văn Bản</div>
                                <button id="btn-mc-swap" class="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-zinc-900 transition-all flex items-center justify-center shadow-sm active:scale-95 group"><i class="fas fa-exchange-alt group-hover:rotate-180 transition-all"></i></button>
                                <div id="mc-label-2" class="flex-1 text-center py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-zinc-500 transition-all">Mã Morse</div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="relative">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Đầu vào</label>
                                <textarea id="mc-input" class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-base text-zinc-900 dark:text-white resize-none min-h-[120px] custom-scrollbar" placeholder="Nhập nội dung cần xử lý..."></textarea>
                                <button id="btn-mc-clear" class="absolute top-8 right-3 w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 transition-colors flex items-center justify-center"><i class="fas fa-times"></i></button>
                            </div>
                            <div class="relative">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Kết quả</label>
                                <textarea id="mc-output" class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none text-base font-mono text-zinc-900 dark:text-white resize-none min-h-[120px] custom-scrollbar" readonly placeholder="Kết quả..."></textarea>
                                <button id="btn-mc-copy" class="absolute top-8 right-3 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs shadow-sm"><i class="far fa-copy"></i> Copy</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 flex flex-col gap-5">
                    <div class="premium-card bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 text-center relative overflow-hidden">
                        <button id="btn-mc-fullscreen" class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all z-20"><i class="fas fa-expand"></i></button>
                        <div class="mb-6 mt-4 flex flex-col items-center">
                            <div id="mc-visual-light" class="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 border-[4px] border-zinc-300 dark:border-zinc-700 flex items-center justify-center transition-all duration-75 shadow-inner"><i class="fas fa-lightbulb text-zinc-400 dark:text-zinc-600 text-2xl" id="mc-visual-icon"></i></div>
                            <p class="text-[10px] text-zinc-500 mt-4 uppercase tracking-[0.2em] font-bold">Signal Monitor</p>
                        </div>
                        <button id="btn-mc-play" class="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"><i class="fas fa-play"></i> PHÁT TÍN HIỆU</button>
                    </div>

                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-5">
                        <div class="space-y-3">
                            <div class="flex justify-between items-center"><label class="text-[13px] font-bold text-zinc-900 dark:text-white">Tốc độ (WPM)</label><span id="mc-val-wpm" class="font-mono font-bold text-zinc-900 dark:text-white">20</span></div>
                            <input type="range" id="mc-range-wpm" min="5" max="50" value="20" class="w-full accent-zinc-900 dark:accent-white h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="mc-fs-container" class="fixed inset-0 z-[10000] bg-black flex flex-col hidden opacity-0 transition-opacity duration-300 overflow-hidden">
            <div id="mc-fs-visualizer" class="h-[75%] md:h-[80%] w-full bg-black transition-colors duration-75 relative flex items-center justify-center">
                <button id="btn-mc-fs-close" class="absolute top-6 right-6 w-12 h-12 rounded-full bg-zinc-900/50 text-white flex items-center justify-center backdrop-blur-md z-50 border border-white/10"><i class="fas fa-compress"></i></button>
                
                <div id="mc-camera-box" class="absolute top-6 left-6 w-40 h-28 md:w-56 md:h-40 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 hidden shadow-2xl">
                    <video id="mc-video" class="w-full h-full object-cover scale-x-[-1]" autoplay playsinline></video>
                    <div class="absolute inset-0 border border-emerald-500/30 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-0.5 bg-emerald-400/50 animate-scan"></div>
                </div>

                <div class="text-center text-zinc-900 pointer-events-none opacity-20" id="mc-fs-info">
                    <i class="fas fa-wave-square text-8xl mb-4"></i>
                    <p class="text-xl font-black uppercase tracking-[0.5em]">OLED MODE</p>
                </div>
            </div>

            <div class="h-[25%] md:h-[20%] w-full bg-black border-t border-zinc-900 p-4 md:px-8 flex items-center justify-center">
                <div class="w-full max-w-screen-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center overflow-hidden h-full py-2">
                    
                    <div class="flex gap-2 shrink-0">
                        <button id="btn-mc-camera" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center justify-center" title="Camera Decoder"><i class="fas fa-camera"></i></button>
                        <button id="btn-mc-fs-clear" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 transition-all flex items-center justify-center" title="Xóa nội dung"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    
                    <div class="flex-1 min-w-0 h-full relative">
                        <textarea id="mc-fs-input" class="w-full h-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3 outline-none focus:border-zinc-600 transition-all text-white placeholder-zinc-800 text-base md:text-lg font-medium resize-none custom-scrollbar" placeholder="Nhập văn bản hoặc mã Morse để xử lý..."></textarea>
                    </div>
                    
                    <div class="flex gap-2 shrink-0 h-14 md:h-full">
                        <button id="btn-mc-fs-play" class="flex-1 md:w-32 bg-white text-black rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                           <i class="fas fa-play"></i> PHÁT
                        </button>
                        <button id="btn-mc-fs-stop" class="w-14 md:w-20 bg-zinc-900 text-zinc-500 rounded-2xl font-bold text-sm opacity-50 flex items-center justify-center" disabled>
                            <i class="fas fa-stop"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <canvas id="mc-canvas" class="hidden"></canvas>

        <style>
            @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
            .animate-scan { position: absolute; animation: scan 3s linear infinite; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        </style>
    `;
}

export function init() {
    const MORSE_DICT = {'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'};
    const REVERSE_DICT = Object.fromEntries(Object.entries(MORSE_DICT).map(([k, v]) => [v, k]));

    let state = { mode: 'text2morse', wpm: 20, isPlaying: false, isCameraOn: false };
    let audioCtx = null, oscillator = null, playTimeouts = [];
    let stream = null, decodeInterval = null;

    // Elements
    const elInput = document.getElementById('mc-input'), elOutput = document.getElementById('mc-output');
    const fsContainer = document.getElementById('mc-fs-container'), fsVisualizer = document.getElementById('mc-fs-visualizer'), fsInput = document.getElementById('mc-fs-input');
    const btnPlay = document.getElementById('btn-mc-play'), btnFsPlay = document.getElementById('btn-mc-fs-play'), btnFsStop = document.getElementById('btn-mc-fs-stop');
    const video = document.getElementById('mc-video'), canvas = document.getElementById('mc-canvas');

    // --- CORE LOGIC ---
    const translate = () => {
        const val = elInput.value.toUpperCase();
        if (fsInput.value !== elInput.value) fsInput.value = elInput.value;
        
        if (!val) return elOutput.value = '';
        if (state.mode === 'text2morse') {
            elOutput.value = val.split('').map(c => MORSE_DICT[c] || '').join(' ');
        } else {
            elOutput.value = val.split(' ').map(c => REVERSE_DICT[c] || '').join('');
        }
    };

    // --- AUDIO & LIGHT ---
    const light = (on) => {
        fsVisualizer.style.backgroundColor = on ? 'white' : 'black';
        document.getElementById('mc-visual-light').style.backgroundColor = on ? 'white' : '';
        document.getElementById('mc-visual-icon').style.color = on ? '#000' : '#444';
    };

    const stopAudio = () => {
        state.isPlaying = false;
        playTimeouts.forEach(clearTimeout);
        if (oscillator) { try { oscillator.stop(); } catch(e){} }
        light(false);
        btnFsStop.disabled = true; btnFsStop.style.opacity = '0.5';
    };

    const playMorse = () => {
        if (state.isPlaying) return stopAudio();
        const code = state.mode === 'text2morse' ? elOutput.value : elInput.value;
        if (!code) return;

        state.isPlaying = true;
        btnFsStop.disabled = false; btnFsStop.style.opacity = '1';
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
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
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.frequency.value = 600;
                    osc.start(); light(true);
                    setTimeout(() => { try { osc.stop(); } catch(e){} light(false); }, duration);
                }, time));
            }
            time += duration + unit;
        });
        playTimeouts.push(setTimeout(stopAudio, time));
    };

    // --- CAMERA DECODER ---
    const toggleCamera = async () => {
        const box = document.getElementById('mc-camera-box');
        if (state.isCameraOn) {
            if(stream) stream.getTracks().forEach(t => t.stop());
            clearInterval(decodeInterval);
            state.isCameraOn = false;
            box.classList.add('hidden');
        } else {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                state.isCameraOn = true;
                box.classList.remove('hidden');
                startDecoding();
            } catch (e) { UI.showAlert('Lỗi', 'Không thể truy cập Camera', 'error'); }
        }
    };

    let lastState = false, lastTime = Date.now(), buffer = "";
    const startDecoding = () => {
        const ctx = canvas.getContext('2d', { alpha: false });
        decodeInterval = setInterval(() => {
            if (video.paused || video.ended) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(canvas.width/2 - 5, canvas.height/2 - 5, 10, 10).data;
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) brightness += (data[i] + data[i+1] + data[i+2]) / 3;
            const avg = brightness / (data.length / 4);
            const isOn = avg > 200; 

            if (isOn !== lastState) {
                const now = Date.now(), diff = now - lastTime;
                const unit = 1200 / state.wpm;
                if (!isOn) { 
                    if (diff < unit * 2) buffer += ".";
                    else buffer += "-";
                } else { 
                    if (diff > unit * 3) {
                        fsInput.value += REVERSE_DICT[buffer] || "";
                        elInput.value = fsInput.value;
                        translate();
                        buffer = "";
                    }
                }
                lastState = isOn; lastTime = now;
            }
        }, 50);
    };

    // --- EVENTS ---
    document.getElementById('btn-mc-fullscreen').onclick = () => {
        fsContainer.classList.remove('hidden');
        setTimeout(() => fsContainer.classList.replace('opacity-0', 'opacity-100'), 10);
        if (fsContainer.requestFullscreen) fsContainer.requestFullscreen();
    };

    document.getElementById('btn-mc-fs-close').onclick = () => {
        if (document.exitFullscreen) document.exitFullscreen();
        fsContainer.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => fsContainer.classList.add('hidden'), 300);
        if(state.isCameraOn) toggleCamera();
    };

    elInput.oninput = translate;
    fsInput.oninput = () => { elInput.value = fsInput.value; translate(); };
    btnPlay.onclick = playMorse;
    btnFsPlay.onclick = playMorse;
    btnFsStop.onclick = stopAudio;
    document.getElementById('btn-mc-camera').onclick = toggleCamera;
    document.getElementById('mc-range-wpm').oninput = (e) => {
        state.wpm = e.target.value;
        document.getElementById('mc-val-wpm').textContent = state.wpm;
    };
    const clearFn = () => { elInput.value = ''; elOutput.value = ''; fsInput.value = ''; stopAudio(); };
    document.getElementById('btn-mc-clear').onclick = clearFn;
    document.getElementById('btn-mc-fs-clear').onclick = clearFn;
}