import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            .toggle-premium { appearance: none; width: 40px; height: 22px; background: #e4e4e7; border-radius: 11px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; flex-shrink: 0; }
            .dark .toggle-premium { background: #27272a; }
            .toggle-premium::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .toggle-premium:checked { background: #18181b; }
            .dark .toggle-premium:checked { background: #fff; }
            .toggle-premium:checked::after { transform: translateX(18px); background: #fff; }
            .dark .toggle-premium:checked::after { background: #18181b; }

            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
            .flat-range::-webkit-slider-runnable-track { height: 6px; background: #e4e4e7; border-radius: 3px; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #18181b; margin-top: -6px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            .wave-bar { width: 2.5px; border-radius: 9999px; background: #18181b; animation: soundWave 1.1s ease-in-out infinite alternate; }
            .dark .wave-bar { background: #f4f4f5; }
            .wave-bar:nth-child(2) { animation-delay: 0.15s; }
            .wave-bar:nth-child(3) { animation-delay: 0.3s; }
            .wave-bar:nth-child(4) { animation-delay: 0.45s; }
            @keyframes soundWave { 0% { height: 3px; } 100% { height: 14px; } }
            .wave-paused .wave-bar { animation-play-state: paused; height: 3px !important; }
        </style>

        <div class="relative flex flex-col w-full max-w-[840px] mx-auto min-h-[550px] pb-10 px-2">
            
            <!-- Header -->
            <div class="mb-6 ui-fade-in flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-[26px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5">
                        Hunq TTS
                    </h2>
                    <p class="text-[13px] text-zinc-500 font-medium">Chuyển đổi văn bản thành giọng đọc tự nhiên.</p>
                </div>
                <button id="tts-reload-voices" class="btn-premium flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold" title="Làm mới danh sách giọng">
                    <i class="fas fa-sync-alt text-[10px]" id="icon-reload"></i>
                    <span id="voice-count-badge">Tải lại</span>
                </button>
            </div>

            <div class="space-y-4 ui-fade-in" style="animation-delay: 80ms;">
                
                <!-- Khối nhập liệu & Chọn giọng -->
                <div class="bg-white dark:bg-[#0c0c0e] rounded-[28px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 space-y-3.5">
                    
                    <div class="flex flex-wrap items-center justify-between gap-2.5">
                        <div class="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" id="voice-button-group">
                            <button type="button" data-voice="vi-VN-HoaiMyNeural" class="voice-btn active btn-premium px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm transition-all">
                                Hoài My (Nữ)
                            </button>
                            <button type="button" data-voice="vi-VN-NamMinhNeural" class="voice-btn btn-premium px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                Nam Minh (Nam)
                            </button>
                            <button type="button" id="btn-toggle-more-voices" class="voice-btn btn-premium px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-all">
                                <span id="more-voice-label">Tùy chọn</span>
                                <i class="fas fa-chevron-down text-[10px] transition-transform duration-200" id="icon-chevron-more"></i>
                            </button>
                        </div>

                        <div class="flex items-center gap-1.5">
                            <button class="sample-btn btn-premium px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" data-text="Xin chào! Chúc bạn một ngày mới tràn đầy năng lượng và hiệu quả công việc cao nhất.">
                                Lời chào
                            </button>
                            <button class="sample-btn btn-premium px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" data-text="Bản tin hôm nay: Công nghệ trí tuệ nhân tạo đang thay đổi các phương thức sáng tạo nội dung.">
                                Tin tức
                            </button>
                        </div>
                    </div>

                    <div id="more-voices-dropdown-container" class="hidden animate-in fade-in">
                        <div class="flex items-center bg-zinc-50 dark:bg-[#121214]/50 rounded-xl px-3 py-1 border border-zinc-200 dark:border-zinc-800">
                            <i class="fas fa-globe text-zinc-400 text-xs mr-2"></i>
                            <select id="tts-voice-select" class="w-full bg-transparent border-none outline-none py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                                <option value="" disabled selected>Chọn ngôn ngữ / giọng đọc quốc tế...</option>
                            </select>
                        </div>
                    </div>

                    <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                        <textarea 
                            id="tts-input-text" 
                            class="w-full h-[150px] bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 resize-none custom-scrollbar placeholder-zinc-400 leading-relaxed"
                            placeholder="Nhập hoặc dán nội dung bạn muốn chuyển thành giọng nói tại đây..."
                        ></textarea>
                        
                        <div class="w-full h-px bg-zinc-200/80 dark:bg-zinc-800 my-2.5"></div>

                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2.5">
                                <button id="tts-btn-paste" class="btn-premium font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1">
                                    <i class="far fa-clipboard text-[11px]"></i> Dán
                                </button>
                                <button id="tts-btn-clear" class="btn-premium font-bold text-zinc-400 hover:text-red-500">
                                    Xóa
                                </button>
                            </div>
                            <span id="tts-char-count" class="font-bold text-zinc-400">0 ký tự</span>
                        </div>
                    </div>
                </div>

                <!-- Cấu hình: Tốc độ & Tự động phát -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[24px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 flex flex-col justify-center">
                        <div class="flex justify-between items-center text-[11px] font-bold uppercase mb-2">
                            <span class="text-zinc-400 tracking-wider">Tốc độ đọc</span>
                            <span id="tts-rate-label" class="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs">x1.0</span>
                        </div>
                        <input id="tts-rate-slider" type="range" class="range flat-range" min="0.5" max="4.0" step="0.1" value="1.0">
                    </div>

                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[24px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 flex items-center justify-between">
                        <div>
                            <span class="text-sm font-bold text-zinc-900 dark:text-white block">Tự động phát</span>
                            <span class="text-[11px] text-zinc-400 font-medium">Phát âm thanh ngay khi tạo</span>
                        </div>
                        <input id="tts-auto-play" type="checkbox" class="toggle-premium" checked>
                    </div>
                </div>

                <!-- Nút Tạo giọng nói -->
                <button id="tts-btn-generate" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                    <i class="fas fa-waveform-path text-xs" id="btn-icon"></i>
                    <span id="btn-text">Bắt đầu chuyển giọng nói</span>
                </button>

                <!-- Trình phát gọn gàng, liền mạch dạng Capsule Bar -->
                <div id="tts-player-card" class="bg-white dark:bg-[#0c0c0e] rounded-2xl ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-2.5 sm:px-4 flex items-center gap-3 opacity-30 pointer-events-none transition-all duration-200">
                    
                    <!-- Play / Pause Button -->
                    <button id="player-play-btn" class="btn-premium w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                        <i class="fas fa-play text-xs ml-0.5" id="player-play-icon"></i>
                    </button>

                    <!-- Time & Scrub progress -->
                    <span id="player-time-current" class="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 min-w-[28px]">0:00</span>

                    <div class="flex-1 flex items-center group py-2">
                        <div class="w-full bg-zinc-200/80 dark:bg-zinc-800 h-1.5 group-hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all" id="player-progress-bar">
                            <div id="player-progress-fill" class="h-full bg-zinc-900 dark:bg-white rounded-full w-0 transition-all duration-75"></div>
                        </div>
                    </div>

                    <span id="player-time-duration" class="text-[11px] font-bold text-zinc-400 min-w-[28px] text-right">0:00</span>

                    <!-- Sound Wave Indicator -->
                    <div id="sound-wave-container" class="wave-paused hidden sm:flex items-center gap-1 h-3.5 px-1">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                    </div>

                    <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

                    <!-- Tải file MP3 -->
                    <a id="player-download-btn" href="#" download="tts-audio.mp3" class="btn-premium w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-xs shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-700" title="Tải file MP3">
                        <i class="fas fa-arrow-down"></i>
                    </a>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const BASE_URL = 'https://be-api-service.vercel.app/api';
    const APP_KEY = 'TTS-Hunq';

    const formatSpeedToApiRate = (multiplier) => {
        const percent = Math.round((multiplier - 1.0) * 100);
        return percent >= 0 ? `+${percent}%` : `${percent}%`;
    };

    let selectedVoice = 'vi-VN-HoaiMyNeural';
    let currentAudioUrl = null;
    let audioElement = new Audio();

    // DOM Elements
    const inputText = document.getElementById('tts-input-text');
    const charCount = document.getElementById('tts-char-count');
    const btnPaste = document.getElementById('tts-btn-paste');
    const btnClear = document.getElementById('tts-btn-clear');
    const voiceCountBadge = document.getElementById('voice-count-badge');
    const btnReloadVoices = document.getElementById('tts-reload-voices');
    const iconReload = document.getElementById('icon-reload');
    const rateSlider = document.getElementById('tts-rate-slider');
    const rateLabel = document.getElementById('tts-rate-label');
    const autoPlayCheckbox = document.getElementById('tts-auto-play');
    const btnGenerate = document.getElementById('tts-btn-generate');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const sampleBtns = document.querySelectorAll('.sample-btn');

    const voiceBtns = document.querySelectorAll('.voice-btn[data-voice]');
    const btnToggleMore = document.getElementById('btn-toggle-more-voices');
    const moreVoicesContainer = document.getElementById('more-voices-dropdown-container');
    const voiceSelect = document.getElementById('tts-voice-select');
    const iconChevronMore = document.getElementById('icon-chevron-more');
    const moreVoiceLabel = document.getElementById('more-voice-label');

    // Player Elements
    const playerCard = document.getElementById('tts-player-card');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const playerPlayIcon = document.getElementById('player-play-icon');
    const soundWave = document.getElementById('sound-wave-container');
    const playerDownloadBtn = document.getElementById('player-download-btn');
    const progressBar = document.getElementById('player-progress-bar');
    const progressFill = document.getElementById('player-progress-fill');
    const timeCurrent = document.getElementById('player-time-current');
    const timeDuration = document.getElementById('player-time-duration');

    const notify = (title, message, type = 'info') => {
        if (UI && typeof UI.showAlert === 'function') {
            UI.showAlert(title, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    };

    const updateCharCount = () => {
        const length = inputText.value.trim().length;
        charCount.textContent = `${length.toLocaleString()} ký tự`;
    };
    inputText.addEventListener('input', updateCharCount);

    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                inputText.value = text;
                updateCharCount();
                notify('Đã dán', 'Nội dung clipboard đã được chèn.', 'success');
            }
        } catch {
            notify('Lỗi clipboard', 'Hãy dùng phím Ctrl+V hoặc Cmd+V.', 'error');
        }
    });

    btnClear.addEventListener('click', () => {
        if (!inputText.value) return;
        inputText.value = '';
        updateCharCount();
        inputText.focus();
    });

    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            inputText.value = btn.getAttribute('data-text');
            updateCharCount();
        });
    });

    rateSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        rateLabel.textContent = `x${val}`;
    });

    const setActiveBtn = (activeElement) => {
        [...voiceBtns, btnToggleMore].forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-zinc-900', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
            btn.classList.add('text-zinc-500', 'dark:text-zinc-400');
        });

        activeElement.classList.add('bg-white', 'dark:bg-zinc-900', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
        activeElement.classList.remove('text-zinc-500', 'dark:text-zinc-400');
    };

    voiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedVoice = btn.getAttribute('data-voice');
            setActiveBtn(btn);
            moreVoicesContainer.classList.add('hidden');
            iconChevronMore.classList.remove('rotate-180');
            moreVoiceLabel.textContent = 'Tùy chọn';
        });
    });

    btnToggleMore.addEventListener('click', () => {
        const isHidden = moreVoicesContainer.classList.contains('hidden');
        if (isHidden) {
            moreVoicesContainer.classList.remove('hidden');
            iconChevronMore.classList.add('rotate-180');
            setActiveBtn(btnToggleMore);
            if (voiceSelect.value) {
                selectedVoice = voiceSelect.value;
            }
        } else {
            moreVoicesContainer.classList.add('hidden');
            iconChevronMore.classList.remove('rotate-180');
        }
    });

    voiceSelect.addEventListener('change', (e) => {
        selectedVoice = e.target.value;
        const opt = voiceSelect.options[voiceSelect.selectedIndex];
        moreVoiceLabel.textContent = opt.text.split(' ')[0] || 'Đã chọn';
        setActiveBtn(btnToggleMore);
    });

    async function loadVoices() {
        if (iconReload) iconReload.classList.add('fa-spin');
        voiceCountBadge.textContent = '...';

        try {
            const res = await fetch(`${BASE_URL}/voices`, {
                headers: { 'X-App-Key': APP_KEY }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                renderVoiceOptions(data);
                voiceCountBadge.textContent = `${data.length} giọng`;
            } else {
                throw new Error();
            }
        } catch {
            voiceCountBadge.textContent = 'Mặc định';
            renderFallbackVoices();
        } finally {
            if (iconReload) iconReload.classList.remove('fa-spin');
        }
    }

    function renderFallbackVoices() {
        voiceSelect.innerHTML = `
            <option value="en-US-JennyNeural">en-US - Jenny (Nữ)</option>
            <option value="en-US-GuyNeural">en-US - Guy (Nam)</option>
            <option value="ja-JP-NanamiNeural">ja-JP - Nanami (Nữ)</option>
        `;
    }

    function renderVoiceOptions(voices) {
        voiceSelect.innerHTML = '<option value="" disabled selected>Chọn giọng đọc quốc tế khác...</option>';
        const internationalVoices = voices.filter(v => v.name !== 'vi-VN-HoaiMyNeural' && v.name !== 'vi-VN-NamMinhNeural');

        internationalVoices.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.name;
            const gender = v.gender === 'Female' ? 'Nữ' : (v.gender === 'Male' ? 'Nam' : '');
            opt.textContent = `${v.locale || ''} - ${v.friendlyName || v.name} ${gender ? `(${gender})` : ''}`;
            voiceSelect.appendChild(opt);
        });
    }

    btnReloadVoices.addEventListener('click', loadVoices);

    // Call TTS API
    btnGenerate.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) {
            notify('Chưa có nội dung', 'Vui lòng nhập văn bản cần đọc.', 'error');
            inputText.focus();
            return;
        }

        const multiplier = parseFloat(rateSlider.value);
        const apiRate = formatSpeedToApiRate(multiplier);

        btnGenerate.disabled = true;
        btnIcon.className = 'fas fa-circle-notch fa-spin text-xs';
        btnText.textContent = 'Đang xử lý...';

        try {
            const response = await fetch(`${BASE_URL}/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-App-Key': APP_KEY
                },
                body: JSON.stringify({
                    text: text,
                    voice: selectedVoice,
                    rate: apiRate
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`HTTP ${response.status}: ${err}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) throw new Error('Dữ liệu rỗng');

            if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);

            currentAudioUrl = URL.createObjectURL(blob);
            audioElement.src = currentAudioUrl;
            audioElement.load();

            // Mở khóa Player
            playerCard.classList.remove('opacity-30', 'pointer-events-none');
            playerDownloadBtn.href = currentAudioUrl;
            playerDownloadBtn.setAttribute('download', `TTS_${Date.now()}.mp3`);

            notify('Thành công', 'Đã tạo giọng nói hoàn tất.', 'success');

            if (autoPlayCheckbox.checked) {
                playAudio();
            }

        } catch (error) {
            console.error(error);
            notify('Lỗi tạo giọng nói', error.message || 'Không thể tổng hợp giọng.', 'error');
        } finally {
            btnGenerate.disabled = false;
            btnIcon.className = 'fas fa-waveform-path text-xs';
            btnText.textContent = 'Bắt đầu chuyển giọng nói';
        }
    });

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    function playAudio() {
        audioElement.play().then(() => {
            playerPlayIcon.className = 'fas fa-pause text-xs';
            soundWave.classList.remove('wave-paused');
        }).catch(err => console.warn(err));
    }

    function pauseAudio() {
        audioElement.pause();
        playerPlayIcon.className = 'fas fa-play text-xs ml-0.5';
        soundWave.classList.add('wave-paused');
    }

    playerPlayBtn.addEventListener('click', () => {
        if (audioElement.paused) playAudio();
        else pauseAudio();
    });

    audioElement.addEventListener('loadedmetadata', () => {
        timeDuration.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', () => {
        timeCurrent.textContent = formatTime(audioElement.currentTime);
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressFill.style.width = `${percent}%`;
        }
    });

    audioElement.addEventListener('ended', () => {
        playerPlayIcon.className = 'fas fa-play text-xs ml-0.5';
        soundWave.classList.add('wave-paused');
        progressFill.style.width = '0%';
        timeCurrent.textContent = '0:00';
    });

    // Tua nhanh khi bấm vào thanh tiến trình
    progressBar.parentElement.addEventListener('click', (e) => {
        if (!audioElement.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audioElement.currentTime = clickPos * audioElement.duration;
    });

    updateCharCount();
    loadVoices();
}