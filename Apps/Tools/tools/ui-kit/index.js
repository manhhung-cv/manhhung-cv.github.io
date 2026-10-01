// tools/ui-kit/index.js
import { UI } from '../../js/ui.js';

// =============================================================================
// MODULE 0: CORE THEME & ACCENT CONTROLLER
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
// MODULE 1: COMPONENT FACTORY ENGINE (REUSABLE UTILITIES & FACTORIES)
// =============================================================================
export const UIKit = {
    // -------------------------------------------------------------------------
    // 1. TIỀN TỆ & ĐỊNH DẠNG SỐ
    // -------------------------------------------------------------------------
    Currency: {
        format: (val) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(val) || 0)),
        parse: (str) => {
            const cleaned = (str || '').toString().replace(/\D/g, '');
            const val = parseInt(cleaned, 10);
            return isNaN(val) ? 0 : val;
        },
        bind: (inputEl, onChangeCallback) => {
            if (!inputEl) return;
            inputEl.addEventListener('input', (e) => {
                const raw = e.target.value.replace(/\D/g, '');
                e.target.value = raw ? new Intl.NumberFormat('vi-VN').format(parseInt(raw, 10)) : '';
                if (typeof onChangeCallback === 'function') {
                    onChangeCallback(UIKit.Currency.parse(e.target.value));
                }
            });
        }
    },

    // -------------------------------------------------------------------------
    // 2. TRÌNH PHÁT VIDEO TÙY BIẾN CAO CẤP (PLAYERVIDEO)
    // Cờ tuỳ biến: nodown, nopip, nospeed, noquality, nofull
    // -------------------------------------------------------------------------
    createVideoPlayer: (targetContainer, options = {}) => {
        if (!targetContainer) return null;

        const {
            src = '',
            title = 'Video Player',
            nodown = false,
            nopip = false,
            nospeed = false,
            noquality = false,
            nofull = false
        } = options;

        const flagsClass = [
            nodown ? 'nodown' : '',
            nopip ? 'nopip' : '',
            nospeed ? 'nospeed' : '',
            noquality ? 'noquality' : '',
            nofull ? 'nofull' : ''
        ].filter(Boolean).join(' ');

        targetContainer.innerHTML = `
            <div class="playervideo ${flagsClass} relative rounded-[22px] bg-black overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-md group flex flex-col justify-end aspect-video w-full mx-auto select-none">
                <video class="v-raw-el w-full h-full object-contain" playsinline preload="metadata">
                    <source src="${src}" type="video/mp4">
                    Trình duyệt không hỗ trợ Video.
                </video>

                <div class="absolute inset-x-3 bottom-3 p-2 sm:p-2.5 rounded-2xl bg-black/80 backdrop-blur-lg border border-white/10 flex flex-col gap-2 text-white text-xs transition-opacity duration-200">
                    <div class="flex items-center gap-2">
                        <input type="range" min="0" max="100" value="0" class="v-scrubber slim-scrubber flex-1 cursor-pointer">
                        <span class="v-time-txt font-mono text-[10px] text-zinc-300 shrink-0">00:00 / 00:00</span>
                    </div>

                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                            <button type="button" class="v-btn-toggle w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform active:scale-95">
                                <i class="fas fa-play text-xs v-icon-toggle"></i>
                            </button>
                            <button type="button" class="v-btn-rewind w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors" title="Lùi 10s">
                                <i class="fas fa-rotate-left text-[10px]"></i>
                            </button>
                            <button type="button" class="v-btn-forward w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors" title="Tua 10s">
                                <i class="fas fa-rotate-right text-[10px]"></i>
                            </button>
                        </div>

                        <div class="flex items-center gap-1 sm:gap-1.5">
                            <div class="dropdown-v-speed">
                                <select class="v-select-speed h-7 px-1.5 rounded-lg bg-white/10 text-[10px] font-mono font-semibold text-zinc-200 outline-none cursor-pointer hover:bg-white/15">
                                    <option value="0.75" class="bg-zinc-900">0.75x</option>
                                    <option value="1.0" class="bg-zinc-900" selected>1.0x</option>
                                    <option value="1.25" class="bg-zinc-900">1.25x</option>
                                    <option value="1.5" class="bg-zinc-900">1.5x</option>
                                    <option value="2.0" class="bg-zinc-900">2.0x</option>
                                </select>
                            </div>

                            <div class="dropdown-v-quality">
                                <select class="v-select-quality h-7 px-1.5 rounded-lg bg-white/10 text-[10px] font-mono font-semibold text-zinc-200 outline-none cursor-pointer hover:bg-white/15">
                                    <option value="auto" class="bg-zinc-900">Auto</option>
                                    <option value="1080" class="bg-zinc-900">1080p</option>
                                    <option value="720" class="bg-zinc-900">720p</option>
                                    <option value="480" class="bg-zinc-900">480p</option>
                                </select>
                            </div>

                            <button type="button" class="btn-v-pip w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white" title="Hình trong hình">
                                <i class="fas fa-clone text-[10px]"></i>
                            </button>

                            <button type="button" class="btn-v-download w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white" title="Tải xuống">
                                <i class="fas fa-download text-[10px]"></i>
                            </button>

                            <button type="button" class="btn-v-fullscreen w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white" title="Toàn màn hình">
                                <i class="fas fa-expand text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const vWrap = targetContainer.querySelector('.playervideo');
        const video = targetContainer.querySelector('.v-raw-el');
        const btnToggle = targetContainer.querySelector('.v-btn-toggle');
        const iconToggle = targetContainer.querySelector('.v-icon-toggle');
        const scrubber = targetContainer.querySelector('.v-scrubber');
        const timeTxt = targetContainer.querySelector('.v-time-txt');
        const speedSel = targetContainer.querySelector('.v-select-speed');
        const qualSel = targetContainer.querySelector('.v-select-quality');

        const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

        btnToggle?.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                iconToggle.className = 'fas fa-pause text-xs v-icon-toggle';
            } else {
                video.pause();
                iconToggle.className = 'fas fa-play text-xs v-icon-toggle';
            }
        });

        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            scrubber.value = (video.currentTime / video.duration) * 100;
            timeTxt.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
        });

        scrubber?.addEventListener('input', (e) => {
            if (!video.duration) return;
            video.currentTime = (e.target.value / 100) * video.duration;
        });

        targetContainer.querySelector('.v-btn-rewind')?.addEventListener('click', () => {
            video.currentTime = Math.max(0, video.currentTime - 10);
        });

        targetContainer.querySelector('.v-btn-forward')?.addEventListener('click', () => {
            video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        });

        speedSel?.addEventListener('change', (e) => {
            video.playbackRate = parseFloat(e.target.value);
            UI.notch.notify('Tốc độ', `Video phát tốc độ ${e.target.value}x`, 'info', 1500);
        });

        qualSel?.addEventListener('change', (e) => {
            UI.notch.notify('Chất lượng', `Độ phân giải: ${e.target.value}`, 'info', 1500);
        });

        targetContainer.querySelector('.btn-v-pip')?.addEventListener('click', async () => {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else if (document.pictureInPictureEnabled) {
                    await video.requestPictureInPicture();
                }
            } catch (e) {
                UI.notch.notify('PiP', 'Không thể khởi động PiP', 'warning');
            }
        });

        targetContainer.querySelector('.btn-v-fullscreen')?.addEventListener('click', () => {
            if (vWrap.requestFullscreen) vWrap.requestFullscreen();
        });

        targetContainer.querySelector('.btn-v-download')?.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = src;
            a.download = `${title.replace(/\s+/g, '_')}.mp4`;
            a.click();
            UI.notch.notify('Tải Video', 'Đang tải file video về máy...', 'success');
        });

        return {
            element: video,
            play: () => video.play(),
            pause: () => video.pause(),
            setFlags: (newFlags = {}) => {
                ['nodown', 'nopip', 'nospeed', 'noquality', 'nofull'].forEach(f => {
                    if (newFlags[f] !== undefined) vWrap.classList.toggle(f, Boolean(newFlags[f]));
                });
            }
        };
    },

    // -------------------------------------------------------------------------
    // 3. TRÌNH PHÁT AUDIO 1 HÀNG NGANG SIÊU GỌN (PLAYERAUDIO)
    // Cờ tuỳ biến: nodown, nospeed, nonotch
    // -------------------------------------------------------------------------
    createAudioPlayer: (targetContainer, options = {}) => {
        if (!targetContainer) return null;

        const {
            src = '',
            title = 'Audio Track',
            subtitle = 'TTS Voice Engine',
            cover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80',
            nodown = false,
            nospeed = false,
            nonotch = false
        } = options;

        const flagsClass = [
            nodown ? 'nodown' : '',
            nospeed ? 'nospeed' : '',
            nonotch ? 'nonotch' : ''
        ].filter(Boolean).join(' ');

        targetContainer.innerHTML = `
            <div class="playeraudio ${flagsClass} w-full rounded-2xl bg-[#f2f2f7] dark:bg-black/50 border border-black/[0.05] dark:border-white/[0.08] p-2.5 sm:px-4 flex items-center gap-3 select-none transition-all">
                <audio class="a-raw-el" preload="metadata">
                    <source src="${src}">
                </audio>

                <div class="a-vinyl w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/15 flex items-center justify-center bg-zinc-900 relative">
                    <img src="${cover}" class="w-full h-full object-cover" />
                </div>

                <div class="flex items-center gap-1 shrink-0">
                    <button type="button" class="a-btn-rewind w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center" title="Lùi 10s">
                        <i class="fas fa-rotate-left text-[10px]"></i>
                    </button>
                    <button type="button" class="a-btn-play w-9 h-9 rounded-xl bg-accent-theme text-white flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                        <i class="fas fa-play text-xs a-icon-play"></i>
                    </button>
                    <button type="button" class="a-btn-forward w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center" title="Tua 10s">
                        <i class="fas fa-rotate-right text-[10px]"></i>
                    </button>
                </div>

                <div class="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                    <div class="flex items-center justify-between text-xs">
                        <div class="truncate font-semibold text-zinc-900 dark:text-white text-[11px] sm:text-xs">
                            ${title} <span class="text-zinc-400 font-normal hidden sm:inline">• ${subtitle}</span>
                        </div>
                        <span class="a-time-txt font-mono text-[10px] text-zinc-400 shrink-0 ml-2">00:00 / 00:00</span>
                    </div>
                    <input type="range" min="0" max="100" value="0" class="a-scrubber slim-scrubber w-full cursor-pointer">
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="dropdown-a-speed">
                        <select class="a-select-speed h-7 px-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer">
                            <option value="1.0" selected>1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2.0">2.0x</option>
                        </select>
                    </div>

                    <button type="button" class="btn-a-download w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center" title="Tải file âm thanh">
                        <i class="fas fa-download text-[11px]"></i>
                    </button>

                    <button type="button" class="btn-a-notch h-7 px-2.5 rounded-lg bg-accent-theme-alpha text-accent-theme text-[10px] font-semibold flex items-center gap-1 transition-all" title="Đẩy lên Tai Thỏ">
                        <i class="fas fa-mobile-screen-button text-[9px]"></i> <span class="hidden sm:inline">Notch</span>
                    </button>
                </div>
            </div>
        `;

        const aWrap = targetContainer.querySelector('.playeraudio');
        const audio = targetContainer.querySelector('.a-raw-el');
        const btnPlay = targetContainer.querySelector('.a-btn-play');
        const iconPlay = targetContainer.querySelector('.a-icon-play');
        const scrubber = targetContainer.querySelector('.a-scrubber');
        const timeTxt = targetContainer.querySelector('.a-time-txt');
        const speedSel = targetContainer.querySelector('.a-select-speed');
        const vinyl = targetContainer.querySelector('.a-vinyl');

        const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

        btnPlay?.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                iconPlay.className = 'fas fa-pause text-xs a-icon-play';
                vinyl.classList.add('kit-spinning');
            } else {
                audio.pause();
                iconPlay.className = 'fas fa-play text-xs a-icon-play';
                vinyl.classList.remove('kit-spinning');
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            scrubber.value = (audio.currentTime / audio.duration) * 100;
            timeTxt.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
        });

        scrubber?.addEventListener('input', (e) => {
            if (!audio.duration) return;
            audio.currentTime = (e.target.value / 100) * audio.duration;
        });

        targetContainer.querySelector('.a-btn-rewind')?.addEventListener('click', () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        });

        targetContainer.querySelector('.a-btn-forward')?.addEventListener('click', () => {
            audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
        });

        speedSel?.addEventListener('change', (e) => {
            audio.playbackRate = parseFloat(e.target.value);
            UI.notch.notify('Tốc độ', `Audio phát ${e.target.value}x`, 'info', 1500);
        });

        targetContainer.querySelector('.btn-a-download')?.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = src;
            a.download = `${title.replace(/\s+/g, '_')}.mp3`;
            a.click();
            UI.notch.notify('Tải Audio', 'Đang tải file âm thanh...', 'success');
        });

        targetContainer.querySelector('.btn-a-notch')?.addEventListener('click', () => {
            UI.notch.media({
                title: title,
                artist: subtitle,
                isPlaying: !audio.paused,
                onTogglePlay: (state) => {
                    if (state) audio.play();
                    else audio.pause();
                    iconPlay.className = `fas ${state ? 'fa-pause' : 'fa-play'} text-xs a-icon-play`;
                    vinyl.classList.toggle('kit-spinning', state);
                }
            });
        });

        return {
            element: audio,
            play: () => audio.play(),
            pause: () => audio.pause(),
            setFlags: (newFlags = {}) => {
                ['nodown', 'nospeed', 'nonotch'].forEach(f => {
                    if (newFlags[f] !== undefined) aWrap.classList.toggle(f, Boolean(newFlags[f]));
                });
            }
        };
    },

    // -------------------------------------------------------------------------
    // 4. THƯ VIỆN ẢNH PRO LIGHTBOX (GALLERY PRO)
    // -------------------------------------------------------------------------
    Gallery: {
        items: [],
        currentIndex: 0,

        setup: (containerEl, itemsArray = []) => {
            if (!containerEl) return;
            UIKit.Gallery.items = itemsArray;

            containerEl.innerHTML = itemsArray.map((it, idx) => `
                <div class="aspect-square rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/[0.08] group relative cursor-pointer" data-idx="${idx}">
                    <img src="${it.thumb || it.url}" alt="${it.title || 'Photo'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                        <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 self-end">JPG</span>
                        <div class="flex items-center justify-between text-xs">
                            <span class="truncate text-[10px] font-semibold">${it.title || 'Ảnh'}</span>
                            <i class="fas fa-expand text-[10px]"></i>
                        </div>
                    </div>
                </div>
            `).join('');

            containerEl.querySelectorAll('[data-idx]').forEach(el => {
                el.onclick = () => UIKit.Gallery.open(parseInt(el.dataset.idx, 10));
            });
        },

        open: (index = 0) => {
            if (!UIKit.Gallery.items.length) return;
            UIKit.Gallery.currentIndex = Math.max(0, Math.min(index, UIKit.Gallery.items.length - 1));

            let box = document.getElementById('kit-pro-lightbox');
            if (box) box.remove();

            box = document.createElement('div');
            box.id = 'kit-pro-lightbox';
            box.className = 'fixed inset-0 z-[10000] flex flex-col justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-2xl select-none transition-opacity duration-200';
            box.innerHTML = `
                <div class="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 text-white z-20">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span id="lb-index" class="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold">1 / 1</span>
                        <h3 id="lb-title" class="text-xs sm:text-sm font-bold truncate">Xem ảnh</h3>
                    </div>
                    
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" id="btn-lb-copy" class="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all">
                            <i class="far fa-copy text-[11px]"></i> <span class="hidden sm:inline">Sao chép</span>
                        </button>
                        <button type="button" id="btn-lb-download" class="h-8 px-3 rounded-full bg-accent-theme text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                            <i class="fas fa-download text-[11px]"></i> <span class="hidden sm:inline">Tải về</span>
                        </button>
                        <button type="button" id="btn-lb-close" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ml-1">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-between gap-3 my-auto">
                    <button type="button" id="btn-lb-prev" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all z-20">
                        <i class="fas fa-chevron-left text-sm"></i>
                    </button>

                    <div class="flex-1 flex items-center justify-center h-full max-h-[76vh] overflow-hidden p-2">
                        <img id="lb-main-img" src="" alt="View" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" />
                    </div>

                    <button type="button" id="btn-lb-next" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all z-20">
                        <i class="fas fa-chevron-right text-sm"></i>
                    </button>
                </div>

                <div class="w-full max-w-xl mx-auto flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1 z-20" id="lb-strip"></div>
            `;
            document.body.appendChild(box);

            const render = () => {
                const cur = UIKit.Gallery.items[UIKit.Gallery.currentIndex];
                if (!cur) return;

                box.querySelector('#lb-main-img').src = cur.url;
                box.querySelector('#lb-title').textContent = cur.title || `Ảnh #${UIKit.Gallery.currentIndex + 1}`;
                box.querySelector('#lb-index').textContent = `${UIKit.Gallery.currentIndex + 1} / ${UIKit.Gallery.items.length}`;

                const strip = box.querySelector('#lb-strip');
                if (strip) {
                    strip.innerHTML = UIKit.Gallery.items.map((it, idx) => `
                        <div class="w-10 h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${idx === UIKit.Gallery.currentIndex ? 'border-accent-theme scale-105' : 'border-white/20 opacity-40 hover:opacity-100'}" data-thumb="${idx}">
                            <img src="${it.thumb || it.url}" class="w-full h-full object-cover" />
                        </div>
                    `).join('');

                    strip.querySelectorAll('[data-thumb]').forEach(th => {
                        th.onclick = () => {
                            UIKit.Gallery.currentIndex = parseInt(th.dataset.thumb, 10);
                            render();
                        };
                    });
                }
            };

            render();

            box.querySelector('#btn-lb-prev').onclick = () => {
                UIKit.Gallery.currentIndex = (UIKit.Gallery.currentIndex - 1 + UIKit.Gallery.items.length) % UIKit.Gallery.items.length;
                render();
            };

            box.querySelector('#btn-lb-next').onclick = () => {
                UIKit.Gallery.currentIndex = (UIKit.Gallery.currentIndex + 1) % UIKit.Gallery.items.length;
                render();
            };

            box.querySelector('#btn-lb-download').onclick = async () => {
                const cur = UIKit.Gallery.items[UIKit.Gallery.currentIndex];
                try {
                    const res = await fetch(cur.url);
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = (cur.title || 'image').replace(/\s+/g, '_') + '.jpg';
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                    UI.notch.notify('Tải xuống', `Đã tải ảnh "${cur.title}"`, 'success');
                } catch (e) {
                    window.open(cur.url, '_blank');
                }
            };

            box.querySelector('#btn-lb-copy').onclick = async () => {
                const cur = UIKit.Gallery.items[UIKit.Gallery.currentIndex];
                try {
                    await navigator.clipboard.writeText(cur.url);
                    UI.notch.notify('Sao chép', 'Đã copy URL ảnh vào Clipboard', 'success');
                } catch (e) {
                    UI.showAlert('Lỗi', 'Không thể truy cập Clipboard', 'warning');
                }
            };

            const close = () => {
                window.removeEventListener('keydown', keyHandle);
                box.remove();
            };

            box.querySelector('#btn-lb-close').onclick = close;

            const keyHandle = (e) => {
                if (e.key === 'ArrowLeft') {
                    UIKit.Gallery.currentIndex = (UIKit.Gallery.currentIndex - 1 + UIKit.Gallery.items.length) % UIKit.Gallery.items.length;
                    render();
                } else if (e.key === 'ArrowRight') {
                    UIKit.Gallery.currentIndex = (UIKit.Gallery.currentIndex + 1) % UIKit.Gallery.items.length;
                    render();
                } else if (e.key === 'Escape') {
                    close();
                }
            };
            window.addEventListener('keydown', keyHandle);
        }
    }
};

// =============================================================================
// MODULE 2: SHOWCASE TEMPLATE RENDERER (FULL COMPONENTS)
// =============================================================================
export function template() {
    return `
    <div id="ui-kit-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] overflow-hidden font-sans transition-colors duration-200 flex flex-col">
        
        <style>
            #ui-kit-root {
                --kit-accent: #10b981;
            }
            .bg-accent-theme { background-color: var(--kit-accent) !important; }
            .text-accent-theme { color: var(--kit-accent) !important; }
            .border-accent-theme { border-color: var(--kit-accent) !important; }
            .bg-accent-theme-alpha { background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important; }
            .hover-bg-accent-theme-alpha:hover { background-color: color-mix(in srgb, var(--kit-accent) 22%, transparent) !important; }

            /* Slim Scrubber Range */
            input[type=range].slim-scrubber {
                -webkit-appearance: none;
                background: rgba(255, 255, 255, 0.2);
                height: 3px;
                border-radius: 9999px;
            }
            .dark input[type=range].slim-scrubber {
                background: rgba(255, 255, 255, 0.15);
            }
            input[type=range].slim-scrubber::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 10px;
                width: 10px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.4);
                cursor: pointer;
            }

            /* Custom Flags cho Video Player */
            .playervideo.nodown .btn-v-download { display: none !important; }
            .playervideo.nopip .btn-v-pip { display: none !important; }
            .playervideo.nospeed .dropdown-v-speed { display: none !important; }
            .playervideo.noquality .dropdown-v-quality { display: none !important; }
            .playervideo.nofull .btn-v-fullscreen { display: none !important; }

            /* Custom Flags cho Audio Player */
            .playeraudio.nodown .btn-a-download { display: none !important; }
            .playeraudio.nospeed .dropdown-a-speed { display: none !important; }
            .playeraudio.nonotch .btn-a-notch { display: none !important; }

            /* Range Slider chuẩn */
            input[type=range].hunq-range {
                -webkit-appearance: none;
                background: rgba(0, 0, 0, 0.08);
                height: 6px;
                border-radius: 9999px;
            }
            .dark input[type=range].hunq-range {
                background: rgba(255, 255, 255, 0.12);
            }
            input[type=range].hunq-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 18px;
                width: 18px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
                border: 2px solid var(--kit-accent);
                cursor: pointer;
            }

            @keyframes kit-spin { 100% { transform: rotate(360deg); } }
            .kit-spinning { animation: kit-spin 7s linear infinite; }

            /* Shimmer Animation */
            @keyframes kit-shimmer { 100% { transform: translateX(100%); } }
            .kit-shimmer { position: relative; overflow: hidden; }
            .kit-shimmer::after {
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                transform: translateX(-100%);
                background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.06) 20%, rgba(255, 255, 255, 0.12) 60%, rgba(255, 255, 255, 0));
                animation: kit-shimmer 1.8s infinite;
                content: '';
            }

            /* Custom Checkbox & Radio Check */
            .kit-custom-checkbox:checked {
                background-color: var(--kit-accent) !important;
                border-color: var(--kit-accent) !important;
            }
            .kit-custom-radio:checked {
                border-color: var(--kit-accent) !important;
                background-color: var(--kit-accent) !important;
            }
        </style>

        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-12 pb-36 max-w-6xl mx-auto space-y-8">
            
            <!-- HEADER -->
            <div class="px-1 space-y-1 select-none">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">Enterprise Design System</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">UI Kit & Master Design System</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Bộ linh kiện quy chuẩn: Trình phát Video/Audio cờ ẩn, Thư viện Lightbox, đầy đủ Form, Input, Switch, Toggle, Checkbox, Tabs & Data Table.</p>
            </div>

            <!-- ========================================================
                 PHẦN 1: FORM INPUTS, CONTROLS, SELECT & TEXTAREA
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-pen-to-square text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">1. Ô Nhập Liệu & Điều Khiển Biểu Mẫu (Form Inputs)</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Inputs & Controls</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Text Input -->
                    <div class="space-y-1">
                        <label for="demo-input-text" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none pl-0.5">Tiêu đề / Văn bản chuẩn</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-2 focus-within:border-accent-theme transition-all cursor-text" onclick="document.getElementById('demo-input-text')?.focus()">
                            <i class="far fa-font text-zinc-400 text-xs mr-2.5 select-none"></i>
                            <input type="text" id="demo-input-text" placeholder="Nhập tiêu đề tác vụ..." value="Truyện Voice Master"
                                class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 select-text cursor-text" />
                        </div>
                    </div>

                    <!-- Password Input with Toggle View -->
                    <div class="space-y-1">
                        <label for="demo-input-pass" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none pl-0.5">Mật khẩu / Mã khóa API</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-2 focus-within:border-accent-theme transition-all">
                            <i class="fas fa-key text-zinc-400 text-xs mr-2.5 select-none"></i>
                            <input type="password" id="demo-input-pass" placeholder="••••••••••••" value="HunqOS@2026"
                                class="w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400 select-text" />
                            <button type="button" id="btn-toggle-pass" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-white ml-2 text-xs" title="Ẩn/Hiện mật khẩu">
                                <i class="far fa-eye" id="icon-pass-toggle"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Currency Input (Tự động format) -->
                    <div class="space-y-1">
                        <label for="demo-input-curr" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none pl-0.5">Số tiền (Tự động format tiền tệ)</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-1.5 focus-within:border-accent-theme transition-all cursor-text" onclick="document.getElementById('demo-input-curr')?.focus()">
                            <span class="text-zinc-400 font-bold font-mono text-sm mr-2 select-none">₫</span>
                            <input type="text" inputmode="decimal" id="demo-input-curr" 
                                class="w-full bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white text-right placeholder-zinc-400 select-text cursor-text" 
                                placeholder="10.000.000" value="10.000.000">
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <!-- Dropdown Select -->
                    <div class="space-y-1">
                        <label for="demo-input-sel" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none pl-0.5">Danh mục bộ nhớ</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-2.5 focus-within:border-accent-theme transition-all">
                            <select id="demo-input-sel" class="w-full bg-transparent border-none outline-none text-xs font-medium text-zinc-900 dark:text-white cursor-pointer">
                                <option value="dexie" class="bg-white dark:bg-zinc-900">IndexedDB (Dexie Engine)</option>
                                <option value="cache" class="bg-white dark:bg-zinc-900">CacheStorage API</option>
                                <option value="local" class="bg-white dark:bg-zinc-900">LocalStorage Key-Value</option>
                            </select>
                        </div>
                    </div>

                    <!-- Textarea Ghi chú -->
                    <div class="space-y-1 md:col-span-2">
                        <label for="demo-input-area" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none pl-0.5">Ghi chú tác vụ (Multi-line Textarea)</label>
                        <textarea id="demo-input-area" rows="2" placeholder="Nhập mô tả tóm tắt..."
                            class="w-full rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] px-3.5 py-2 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-accent-theme transition resize-none select-text">Hệ thống hỗ trợ offline-first, tự động cache media và tài nguyên.</textarea>
                    </div>
                </div>
            </section>

            <!-- ========================================================
                 PHẦN 2: SWITCH, TOGGLE, CHECKBOX, RADIO & SLIDERS
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-toggle-on text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">2. Công Tắc Switch, Checkbox, Radio & Slider</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Toggles & Checks</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
                    <!-- iOS Switch Box 1 -->
                    <div class="p-3.5 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                        <div>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Ghi nhớ phiên</div>
                            <div class="text-[9px] text-zinc-400">Restore session F5</div>
                        </div>
                        <button type="button" id="demo-switch-session" class="switch-pill active">
                            <div class="switch-thumb"></div>
                        </button>
                    </div>

                    <!-- iOS Switch Box 2 -->
                    <div class="p-3.5 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                        <div>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Smart Notch</div>
                            <div class="text-[9px] text-zinc-400">Tai thỏ phần cứng</div>
                        </div>
                        <button type="button" id="demo-switch-notch" class="switch-pill active">
                            <div class="switch-thumb"></div>
                        </button>
                    </div>

                    <!-- Custom Checkbox Box -->
                    <label class="p-3.5 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between cursor-pointer">
                        <div>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Chế độ Offline</div>
                            <div class="text-[9px] text-zinc-400">Ưu tiên bộ đệm</div>
                        </div>
                        <input type="checkbox" id="demo-check-offline" checked class="kit-custom-checkbox h-4 w-4 rounded-md border border-zinc-400/50 cursor-pointer appearance-none checked:bg-accent-theme checked:border-accent-theme" />
                    </label>

                    <!-- Custom Radio Selection Card -->
                    <label class="p-3.5 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between cursor-pointer">
                        <div>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Tự động đồng bộ</div>
                            <div class="text-[9px] text-zinc-400">Background Sync</div>
                        </div>
                        <input type="radio" name="sync_mode" checked class="kit-custom-radio h-4 w-4 rounded-full border border-zinc-400/50 cursor-pointer appearance-none checked:border-accent-theme checked:bg-accent-theme" />
                    </label>
                </div>

                <!-- Range Slider Component -->
                <div class="p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] space-y-2 select-none">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-[10px] text-zinc-400 uppercase tracking-wider">Mức điều chỉnh âm lượng / tỷ lệ</span>
                        <span id="demo-slider-val" class="font-mono font-bold text-accent-theme">75%</span>
                    </div>
                    <input type="range" min="0" max="100" value="75" id="demo-range-slider" class="hunq-range w-full cursor-pointer">
                </div>
            </section>

            <!-- ========================================================
                 PHẦN 3: BỘ CHUYỂN TAB (SEGMENTED CONTROLS & PILLS)
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-table-columns text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">3. Bộ Chuyển Đổi Tab (Segmented Controls & Tab Panels)</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Tabs Architecture</span>
                </div>

                <div class="space-y-4 select-none">
                    <!-- Segmented Tabs 3 cột -->
                    <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] max-w-md mx-auto" id="demo-segmented-tabs">
                        <button type="button" class="tab-seg-btn active py-2 rounded-[10px] text-xs font-bold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all text-center" data-target="panel-tab-overview">
                            Tổng quan
                        </button>
                        <button type="button" class="tab-seg-btn py-2 rounded-[10px] text-xs font-medium text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all text-center" data-target="panel-tab-metrics">
                            Chỉ số
                        </button>
                        <button type="button" class="tab-seg-btn py-2 rounded-[10px] text-xs font-medium text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all text-center" data-target="panel-tab-logs">
                            Nhật ký
                        </button>
                    </div>

                    <!-- Tab Content Panels -->
                    <div class="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs leading-relaxed">
                        <div id="panel-tab-overview" class="tab-content-panel space-y-1">
                            <h4 class="font-bold text-zinc-900 dark:text-white">Bảng thông tin Tổng quan</h4>
                            <p class="text-zinc-400">Hiển thị toàn diện trạng thái hoạt động của các thành phần trong hệ điều hành web.</p>
                        </div>
                        <div id="panel-tab-metrics" class="tab-content-panel hidden space-y-1">
                            <h4 class="font-bold text-zinc-900 dark:text-white">Chỉ số Đo lường Hiệu năng</h4>
                            <p class="text-zinc-400">Thời gian phản hồi render: 12ms • Dung lượng RAM chiếm dụng: 24MB • 60 FPS mượt mà.</p>
                        </div>
                        <div id="panel-tab-logs" class="tab-content-panel hidden space-y-1">
                            <h4 class="font-bold text-zinc-900 dark:text-white">Nhật ký Hệ thống (Logs)</h4>
                            <p class="text-zinc-400 font-mono text-[11px]">[OK] Mount video player • [OK] Init audio capsule • [OK] Sync accents.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================
                 PHẦN 4: TRÌNH PHÁT VIDEO TÙY BIẾN CỜ (PLAYERVIDEO)
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-video text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">4. Trình phát Video (PlayerVideo + Cờ nodown, nopip, nospeed...)</h2>
                    </div>
                    
                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-[10px] text-zinc-400 font-mono">Bật/Tắt cờ thử nghiệm:</span>
                        <button type="button" id="demo-flag-nodown" class="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-mono hover:text-accent-theme transition-colors">nodown</button>
                        <button type="button" id="demo-flag-nopip" class="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-mono hover:text-accent-theme transition-colors">nopip</button>
                        <button type="button" id="demo-flag-nospeed" class="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-mono hover:text-accent-theme transition-colors">nospeed</button>
                    </div>
                </div>

                <div id="factory-video-mount-point" class="w-full"></div>
            </section>

            <!-- ========================================================
                 PHẦN 5: TRÌNH PHÁT AUDIO 1 HÀNG NGANG GỌN GÀNG (PLAYERAUDIO)
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-music text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">5. Trình phát Audio 1 Hàng Ngang (PlayerAudio Slim Capsule)</h2>
                    </div>
                    
                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-[10px] text-zinc-400 font-mono">Cờ ẩn:</span>
                        <button type="button" id="demo-flag-a-nodown" class="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-mono hover:text-accent-theme transition-colors">nodown</button>
                        <button type="button" id="demo-flag-a-nospeed" class="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-mono hover:text-accent-theme transition-colors">nospeed</button>
                    </div>
                </div>

                <div id="factory-audio-mount-point" class="w-full"></div>
            </section>

            <!-- ========================================================
                 PHẦN 6: THƯ VIỆN ẢNH PRO LIGHTBOX CÓ DOWNLOAD & COPY
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-images text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">6. Thư viện Ảnh (Pro Lightbox: Phím ← →, Tải về, Sao chép)</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Gallery Engine</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="factory-gallery-mount-point"></div>
            </section>

            <!-- ========================================================
                 PHẦN 7: LINH KIỆN MỞ RỘNG (ACCORDION & SKELETON)
                 ======================================================== -->
            <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- ACCORDION -->
                <div class="rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none">Accordion & Collapsible</span>
                    
                    <div class="space-y-2">
                        <div class="rounded-xl border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
                            <button type="button" class="kit-acc-toggle w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                <span>Cách nhúng PlayerVideo vào Tool mới?</span>
                                <i class="fas fa-chevron-down text-[10px] text-zinc-400 transition-transform"></i>
                            </button>
                            <div class="kit-acc-content hidden px-4 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05] leading-relaxed">
                                Chỉ cần gọi <code>UIKit.createVideoPlayer(container, { src, nodown: true })</code>.
                            </div>
                        </div>

                        <div class="rounded-xl border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
                            <button type="button" class="kit-acc-toggle w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                <span>Cơ chế tải ảnh qua Lightbox có an toàn không?</span>
                                <i class="fas fa-chevron-down text-[10px] text-zinc-400 transition-transform"></i>
                            </button>
                            <div class="kit-acc-content hidden px-4 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05] leading-relaxed">
                                Lightbox tự động fetch Blobs và tạo ObjectURL để tải tệp về mà không cần redirect trang.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SKELETON SHIMMER & EMPTY STATE -->
                <div class="rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none mb-2">Skeleton Loading Shimmer</span>
                        <div class="space-y-2">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] kit-shimmer shrink-0"></div>
                                <div class="flex-1 space-y-1.5">
                                    <div class="w-3/4 h-3 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] kit-shimmer"></div>
                                    <div class="w-1/2 h-2.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] kit-shimmer"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-3.5 rounded-xl border border-dashed border-black/[0.08] dark:border-white/[0.1] flex flex-col items-center justify-center text-center space-y-1 select-none">
                        <i class="far fa-folder-open text-zinc-400 text-base opacity-60"></i>
                        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Không có dữ liệu</span>
                        <span class="text-[10px] text-zinc-400">Danh sách rỗng có thể dùng mẫu này</span>
                    </div>
                </div>
            </section>

            <!-- ========================================================
                 PHẦN 8: TÀI LIỆU HƯỚNG DẪN IMPORT (QUICK SNIPPET)
                 ======================================================== -->
            <section class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                <div class="flex items-center justify-between select-none">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mã nhúng Factory UIKit vào Tool khác</span>
                    <button type="button" id="btn-copy-code" class="h-7 px-3 bg-accent-theme text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1.5 active:scale-95 transition-transform">
                        <i class="far fa-copy text-[10px]"></i> Sao chép
                    </button>
                </div>
                <div class="rounded-xl bg-zinc-950 p-3.5 font-mono text-[11px] text-zinc-300 overflow-x-auto no-scrollbar border border-white/10">
                    <pre><code id="code-snippet-box"></code></pre>
                </div>
            </section>

        </main>
    </div>
    `;
}

// =============================================================================
// MODULE 3: DATA FIXTURES CHO SHOWCASE
// =============================================================================
const SAMPLE_GALLERY_DATA = [
    { title: 'Gradient Wallpaper HD', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=320&q=80' },
    { title: 'Neon Cyberpunk City', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=320&q=80' },
    { title: 'Fluid Waveform Art', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&q=80' },
    { title: 'Dark Matrix Architecture', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&q=80' }
];

// =============================================================================
// MODULE 4: LOGIC HOOKS & DEMO INITIALIZATION
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const root = hostElement.querySelector('#ui-kit-root') || hostElement;
    ThemeKit.applyAccent(root);

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            ThemeKit.applyAccent(root);
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    // 1. TIỀN TỆ & FORM DEMO BINDING
    const currInput = _('#demo-input-curr');
    UIKit.Currency.bind(currInput, (parsedVal) => {
        console.log('Parsed Currency Value:', parsedVal);
    });

    const passInput = _('#demo-input-pass');
    const passToggleBtn = _('#btn-toggle-pass');
    const passIcon = _('#icon-pass-toggle');
    passToggleBtn?.addEventListener('click', () => {
        if (!passInput) return;
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (passIcon) passIcon.className = isPass ? 'far fa-eye-slash' : 'far fa-eye';
    });

    // 2. TOGGLES & SWITCHES DEMO
    const switchSession = _('#demo-switch-session');
    switchSession?.addEventListener('click', () => {
        const active = switchSession.classList.toggle('active');
        UI.notch.notify('Thiết lập', `Ghi nhớ phiên: ${active ? 'BẬT' : 'TẮT'}`, 'info', 1500);
    });

    const switchNotch = _('#demo-switch-notch');
    switchNotch?.addEventListener('click', () => {
        const active = switchNotch.classList.toggle('active');
        UI.notch.notify('Thiết lập', `Smart Notch: ${active ? 'BẬT' : 'TẮT'}`, 'info', 1500);
    });

    const slider = _('#demo-range-slider');
    const sliderVal = _('#demo-slider-val');
    slider?.addEventListener('input', (e) => {
        if (sliderVal) sliderVal.textContent = `${e.target.value}%`;
    });

    // 3. SEGMENTED TABS & PANELS SWITCHING
    $$('.tab-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-seg-btn').forEach(b => {                 b.classList.remove('active', 'bg-white', 'dark:bg-[#2c2c2e]', 'text-zinc-900', 'dark:text-white', 'shadow-sm', 'font-bold');                 b.classList.add('font-medium', 'text-zinc-400');             });              btn.classList.add('active', 'bg-white', 'dark:bg-[#2c2c2e]', 'text-zinc-900', 'dark:text-white', 'shadow-sm', 'font-bold');             btn.classList.remove('font-medium', 'text-zinc-400');              const targetPanelId = btn.dataset.target;             $$
('.tab-content-panel').forEach(p => p.classList.add('hidden'));
            _(`#${targetPanelId}`)?.classList.remove('hidden');
        });
    });

    // 4. RENDER VIDEO PLAYER TỪ FACTORY
    const videoMount = _('#factory-video-mount-point');
    const videoController = UIKit.createVideoPlayer(videoMount, {
        src: '/Asset/Video/video.mp4',
        title: 'Demo Trailer',
        nodown: false,
        nopip: false,
        nospeed: false
    });

    // Toggle Flag Controls Demo trên Showcase
    let vFlags = { nodown: false, nopip: false, nospeed: false };
    ['nodown', 'nopip', 'nospeed'].forEach(f => {
        _(`#demo-flag-${f}`)?.addEventListener('click', (e) => {
            vFlags[f] = !vFlags[f];
            e.target.classList.toggle('bg-accent-theme', vFlags[f]);
            e.target.classList.toggle('text-white', vFlags[f]);
            videoController?.setFlags(vFlags);
        });
    });

    // 5. RENDER AUDIO PLAYER TỪ FACTORY
    const audioMount = _('#factory-audio-mount-point');
    const audioController = UIKit.createAudioPlayer(audioMount, {
        src: '',
        title: 'Chương 102: Đại Lộ Thăng Hoa',
        subtitle: 'Ban Mai AI Voice • 1.25x',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80',
        nodown: false,
        nospeed: false
    });

    let aFlags = { nodown: false, nospeed: false };
    ['nodown', 'nospeed'].forEach(f => {
        _(`#demo-flag-a-${f}`)?.addEventListener('click', (e) => {
            aFlags[f] = !aFlags[f];
            e.target.classList.toggle('bg-accent-theme', aFlags[f]);
            e.target.classList.toggle('text-white', aFlags[f]);
            audioController?.setFlags(aFlags);
        });
    });

    // 6. RENDER GALLERY PRO TỪ FACTORY
    const galleryMount = _('#factory-gallery-mount-point');
    UIKit.Gallery.setup(galleryMount, SAMPLE_GALLERY_DATA);

    // 7. ACCORDION DEMO
    $$('.kit-acc-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            const isHidden = content.classList.contains('hidden');

            content.classList.toggle('hidden', !isHidden);
            if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    });

    // 8. SNIPPET BOX & COPY
    const codeBox = _('#code-snippet-box');
    if (codeBox) {
        codeBox.textContent = 
`import { UIKit } from '../ui-kit/index.js';

// 1. Tự động liên kết ô format tiền tệ:
UIKit.Currency.bind(inputElement, (val) => console.log(val));

// 2. Tạo Video Player có cờ ẩn nút tải và cờ ẩn PiP:
UIKit.createVideoPlayer(videoContainer, { src: 'video.mp4', nodown: true, nopip: true });

// 3. Tạo Audio Player 1 hàng ngang siêu gọn:
UIKit.createAudioPlayer(audioContainer, { src: 'audio.mp3', title: 'Tên bài', nodown: true });

// 4. Mở Thư viện Lightbox có duyệt qua lại, tải về và copy:
UIKit.Gallery.setup(galleryContainer, [{ url: 'image.jpg', title: 'Ảnh mẫu' }]);`;
    }

    _('#btn-copy-code')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeBox?.textContent || '');
            UI.notch.notify('Đã chép mã', 'Mã ví dụ đã được lưu vào Clipboard.', 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể truy cập Clipboard', 'warning');
        }
    });
}