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
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="tts-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #tts-root-container {
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
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }

            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

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

            .tts-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .wave-bar { 
                width: 2.5px; 
                border-radius: 9999px; 
                background: var(--kit-accent); 
                animation: soundWave 1.1s ease-in-out infinite alternate; 
            }
            .wave-bar:nth-child(2) { animation-delay: 0.15s; }
            .wave-bar:nth-child(3) { animation-delay: 0.3s; }
            .wave-bar:nth-child(4) { animation-delay: 0.45s; }
            @keyframes soundWave { 0% { height: 3px; } 100% { height: 14px; } }
            .wave-paused .wave-bar { animation-play-state: paused; height: 3px !important; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Voice Engine</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Hunq TTS</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Chuyển đổi văn bản thành giọng đọc tự nhiên đa ngôn ngữ bằng công nghệ Edge Neural.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="tts-reload-voices" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm" title="Làm mới danh sách giọng đọc">
                        <i class="fas fa-arrows-rotate text-accent-theme text-xs" id="icon-reload"></i>
                        <span id="voice-count-badge">Tải lại</span>
                    </button>
                </div>
            </div>

            <!-- WORKSPACE CONTAINER -->
            <div class="space-y-4">
                
                <!-- CARD 1: INPUT & VOICE SELECTION -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                    
                    <div class="flex flex-wrap items-center justify-between gap-2.5">
                        <!-- SEGMENTED VOICE BUTTON GROUP -->
                        <div class="flex items-center gap-1 p-1 bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] rounded-[14px]" id="voice-button-group">
                            <button type="button" data-voice="vi-VN-HoaiMyNeural" class="voice-btn active py-1.5 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all">
                                Hoài My (Nữ)
                            </button>
                            <button type="button" data-voice="vi-VN-NamMinhNeural" class="voice-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                Nam Minh (Nam)
                            </button>
                            <button type="button" id="btn-toggle-more-voices" class="voice-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-all">
                                <span id="more-voice-label">Mở rộng</span>
                                <i class="fas fa-chevron-down text-[10px] transition-transform duration-200" id="icon-chevron-more"></i>
                            </button>
                        </div>

                        <!-- SAMPLE TEXT CHIPS -->
                        <div class="flex items-center gap-1.5">
                            <button class="sample-btn h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme active:scale-95 transition-all shadow-sm" data-text="Xin chào! Chúc bạn một ngày làm việc hiệu quả và tràn đầy năng lượng tích cực trên HunqOS.">
                                Lời chào
                            </button>
                            <button class="sample-btn h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-accent-theme active:scale-95 transition-all shadow-sm" data-text="Bản tin công nghệ: Trí tuệ nhân tạo thế hệ mới đang hỗ trợ trực tiếp quy trình sáng tạo và phát triển phần mềm.">
                                Tin tức
                            </button>
                        </div>
                    </div>

                    <!-- DROPDOWN QUỐC TẾ MỞ RỘNG -->
                    <div id="more-voices-dropdown-container" class="hidden">
                        <div class="relative flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                            <i class="fas fa-globe text-zinc-400 text-xs mr-2.5"></i>
                            <select id="tts-voice-select" class="zen-select w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                                <option value="" disabled selected>Chọn giọng đọc quốc tế khác...</option>
                            </select>
                            <i class="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                        </div>
                    </div>

                    <!-- INPUT TEXTAREA -->
                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-4 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all space-y-3">
                        <textarea 
                            id="tts-input-text" 
                            class="tts-input-zen w-full h-[150px] bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white p-0 resize-none custom-scrollbar placeholder-zinc-400 leading-relaxed"
                            placeholder="Nhập hoặc dán nội dung bạn muốn chuyển thành giọng nói tại đây..."
                        ></textarea>
                        
                        <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>

                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-3">
                                <button id="tts-btn-paste" class="font-bold text-zinc-600 dark:text-zinc-400 hover:text-accent-theme flex items-center gap-1.5 active:scale-95 transition-transform">
                                    <i class="far fa-paste text-xs"></i> <span>Dán</span>
                                </button>
                                <button id="tts-btn-clear" class="font-bold text-zinc-400 hover:text-rose-500 active:scale-95 transition-transform">
                                    Xóa
                                </button>
                            </div>
                            <span id="tts-char-count" class="font-mono font-bold text-zinc-400">0 ký tự</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 2: CONTROLS CONFIGURATION -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Tốc độ đọc -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-2.5">
                        <div class="flex justify-between items-center text-xs">
                            <span class="font-medium text-zinc-800 dark:text-zinc-200">Tốc độ đọc</span>
                            <span id="tts-rate-label" class="px-2 py-0.5 rounded-[8px] bg-accent-theme-alpha text-accent-theme font-mono font-bold text-xs">x1.0</span>
                        </div>
                        <input id="tts-rate-slider" type="range" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" min="0.5" max="4.0" step="0.1" value="1.0">
                    </div>

                    <!-- Tự động phát -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-zinc-900 dark:text-white block">Tự động phát</span>
                            <span class="text-[11px] text-zinc-400 font-medium">Khởi phát ngay sau khi tổng hợp xong</span>
                        </div>
                        <button id="tts-auto-play-switch" class="switch-pill active" type="button" aria-label="Toggle Auto Play">
                            <div class="switch-thumb"></div>
                        </button>
                    </div>
                </div>

                <!-- CARD 3: ACTION TRIGGER -->
                <button id="tts-btn-generate" class="w-full h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                    <i class="fas fa-waveform text-xs" id="btn-icon"></i>
                    <span id="btn-text">Bắt đầu chuyển giọng nói</span>
                </button>

                <!-- CARD 4: CAPSULE AUDIO PLAYER -->
                <div id="tts-player-card" class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 sm:px-4 flex items-center gap-3 shadow-sm opacity-40 pointer-events-none transition-all duration-200">
                    
                    <!-- Nút Play / Pause -->
                    <button id="player-play-btn" class="w-10 h-10 rounded-[14px] bg-accent-theme text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-sm">
                        <i class="fas fa-play text-xs ml-0.5" id="player-play-icon"></i>
                    </button>

                    <!-- Tiến trình thời gian -->
                    <span id="player-time-current" class="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300 min-w-[32px]">0:00</span>

                    <div class="flex-1 flex items-center group py-2">
                        <div class="w-full bg-black/10 dark:bg-white/10 h-1.5 group-hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all" id="player-progress-bar">
                            <div id="player-progress-fill" class="h-full bg-accent-theme rounded-full w-0 transition-all duration-75"></div>
                        </div>
                    </div>

                    <span id="player-time-duration" class="text-[11px] font-mono font-bold text-zinc-400 min-w-[32px] text-right">0:00</span>

                    <!-- Sóng âm thanh động -->
                    <div id="sound-wave-container" class="wave-paused hidden sm:flex items-center gap-1 h-3.5 px-1">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                    </div>

                    <div class="h-4 w-px bg-black/[0.08] dark:border-white/[0.1] hidden sm:block"></div>

                    <!-- Nút Tải về -->
                    <a id="player-download-btn" href="#" download="tts-audio.mp3" class="w-10 h-10 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs shrink-0 active:scale-95 transition-all" title="Tải xuống tệp MP3">
                        <i class="fas fa-download text-xs"></i>
                    </a>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#tts-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const BASE_URL = 'https://be-api-service.vercel.app/api';
    const APP_KEY = 'TTS-Hunq';

    const formatSpeedToApiRate = (multiplier) => {
        const percent = Math.round((multiplier - 1.0) * 100);
        return percent >= 0 ? `+${percent}%` : `${percent}%`;
    };

    let selectedVoice = 'vi-VN-HoaiMyNeural';
    let currentAudioUrl = null;
    let audioElement = new Audio();
    let isAutoPlay = true;

    // Scoped Elements
    const inputText = hostElement.querySelector('#tts-input-text');
    const charCount = hostElement.querySelector('#tts-char-count');
    const btnPaste = hostElement.querySelector('#tts-btn-paste');
    const btnClear = hostElement.querySelector('#tts-btn-clear');
    const voiceCountBadge = hostElement.querySelector('#voice-count-badge');
    const btnReloadVoices = hostElement.querySelector('#tts-reload-voices');
    const iconReload = hostElement.querySelector('#icon-reload');
    const rateSlider = hostElement.querySelector('#tts-rate-slider');
    const rateLabel = hostElement.querySelector('#tts-rate-label');
    const autoPlaySwitch = hostElement.querySelector('#tts-auto-play-switch');
    const btnGenerate = hostElement.querySelector('#tts-btn-generate');
    const btnText = hostElement.querySelector('#btn-text');
    const btnIcon = hostElement.querySelector('#btn-icon');
    const sampleBtns = hostElement.querySelectorAll('.sample-btn');

    const voiceBtns = hostElement.querySelectorAll('.voice-btn[data-voice]');
    const btnToggleMore = hostElement.querySelector('#btn-toggle-more-voices');
    const moreVoicesContainer = hostElement.querySelector('#more-voices-dropdown-container');
    const voiceSelect = hostElement.querySelector('#tts-voice-select');
    const iconChevronMore = hostElement.querySelector('#icon-chevron-more');
    const moreVoiceLabel = hostElement.querySelector('#more-voice-label');

    // Player Elements
    const playerCard = hostElement.querySelector('#tts-player-card');
    const playerPlayBtn = hostElement.querySelector('#player-play-btn');
    const playerPlayIcon = hostElement.querySelector('#player-play-icon');
    const soundWave = hostElement.querySelector('#sound-wave-container');
    const playerDownloadBtn = hostElement.querySelector('#player-download-btn');
    const progressBar = hostElement.querySelector('#player-progress-bar');
    const progressFill = hostElement.querySelector('#player-progress-fill');
    const timeCurrent = hostElement.querySelector('#player-time-current');
    const timeDuration = hostElement.querySelector('#player-time-duration');

    const updateCharCount = () => {
        const length = inputText.value.trim().length;
        charCount.textContent = `${length.toLocaleString()} ký tự`;
    };
    inputText.addEventListener('input', updateCharCount);

    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                const start = inputText.selectionStart;
                const end = inputText.selectionEnd;
                inputText.value = inputText.value.substring(0, start) + text + inputText.value.substring(end);
                updateCharCount();
                IslandKit.notify('Đã dán', 'Nội dung clipboard đã được chèn vào văn bản.', 'success');
            }
        } catch {
            IslandKit.notify('Lỗi clipboard', 'Hãy dùng tổ hợp phím Ctrl+V để dán.', 'error');
        }
    });

    btnClear.addEventListener('click', () => {
        if (!inputText.value) return;
        inputText.value = '';
        updateCharCount();
        inputText.focus();
        IslandKit.notify('Đã xóa', 'Văn bản đã được làm sạch.', 'info');
    });

    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            inputText.value = btn.getAttribute('data-text');
            updateCharCount();
            IslandKit.notify('Mẫu văn bản', 'Đã nạp văn bản mẫu.', 'info');
        });
    });

    rateSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        rateLabel.textContent = `x${val}`;
    });

    autoPlaySwitch?.addEventListener('click', () => {
        autoPlaySwitch.classList.toggle('active');
        isAutoPlay = autoPlaySwitch.classList.contains('active');
    });

    const activeVoiceClass = 'voice-btn active py-1.5 px-3 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all';
    const inactiveVoiceClass = 'voice-btn py-1.5 px-3 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all';

    const setActiveBtn = (activeElement) => {
        [...voiceBtns, btnToggleMore].forEach(btn => {
            btn.className = inactiveVoiceClass;
        });
        activeElement.className = activeVoiceClass;
    };

    voiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedVoice = btn.getAttribute('data-voice');
            setActiveBtn(btn);
            moreVoicesContainer.classList.add('hidden');
            iconChevronMore.classList.remove('rotate-180');
            moreVoiceLabel.textContent = 'Mở rộng';
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

    // Call TTS API Pipeline
    btnGenerate.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) {
            IslandKit.notify('Chưa có nội dung', 'Vui lòng nhập văn bản cần chuyển thành giọng nói.', 'warning');
            inputText.focus();
            return;
        }

        const multiplier = parseFloat(rateSlider.value);
        const apiRate = formatSpeedToApiRate(multiplier);

        btnGenerate.disabled = true;
        btnIcon.className = 'fas fa-circle-notch fa-spin text-xs';
        btnText.textContent = 'Đang chuyển đổi giọng nói...';

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
            if (blob.size === 0) throw new Error('Dữ liệu luồng rỗng');

            if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);

            currentAudioUrl = URL.createObjectURL(blob);
            audioElement.src = currentAudioUrl;
            audioElement.load();

            // Kích hoạt thanh phát
            playerCard.classList.remove('opacity-40', 'pointer-events-none');
            playerDownloadBtn.href = currentAudioUrl;
            playerDownloadBtn.setAttribute('download', `TTS_${Date.now()}.mp3`);

            IslandKit.notify('Thành công', 'Đã tạo xong file giọng nói.', 'success');

            if (isAutoPlay) {
                playAudio();
            }

        } catch (error) {
            console.error(error);
            IslandKit.notify('Lỗi tạo giọng nói', error.message || 'Không thể tổng hợp giọng đọc.', 'error');
        } finally {
            btnGenerate.disabled = false;
            btnIcon.className = 'fas fa-waveform text-xs';
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

    progressBar.parentElement.addEventListener('click', (e) => {
        if (!audioElement.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audioElement.currentTime = clickPos * audioElement.duration;
    });

    updateCharCount();
    loadVoices();

    return () => {
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }
    };
}