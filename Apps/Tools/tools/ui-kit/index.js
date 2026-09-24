// tools/ui-kit/index.js
import { UI } from '../../js/ui.js';

// =============================================================================
// MODULE 0: THEME & ACCENT CONTROLLER
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
// MODULE 1: CURRENCY & PRO MEDIA GALLERY FACTORY
// =============================================================================
export const CurrencyKit = {
    format: (value) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(value) || 0)),
    parse: (formattedStr) => {
        const cleaned = (formattedStr || '').toString().replace(/\D/g, '');
        const val = parseInt(cleaned, 10);
        return isNaN(val) ? 0 : val;
    },
    bindInput: (inputElement, onChangeCallback) => {
        if (!inputElement) return;
        inputElement.addEventListener('input', (e) => {
            const raw = e.target.value.replace(/\D/g, '');
            e.target.value = raw ? new Intl.NumberFormat('vi-VN').format(parseInt(raw, 10)) : '';
            if (typeof onChangeCallback === 'function') {
                onChangeCallback(CurrencyKit.parse(e.target.value));
            }
        });
    }
};

export const GalleryKit = {
    items: [],
    currentIndex: 0,

    initGallery: (itemsArray) => {
        GalleryKit.items = itemsArray || [];
    },

    openLightbox: (index = 0) => {
        if (!GalleryKit.items.length) return;
        GalleryKit.currentIndex = Math.max(0, Math.min(index, GalleryKit.items.length - 1));

        let box = document.getElementById('kit-pro-lightbox');
        if (box) box.remove();

        box = document.createElement('div');
        box.id = 'kit-pro-lightbox';
        box.className = 'fixed inset-0 z-[10000] flex flex-col justify-between p-3 sm:p-6 bg-black/92 backdrop-blur-2xl select-none transition-opacity duration-200';
        box.innerHTML = `
            <!-- TOP BAR: TIÊU ĐỀ, CHỈ SỐ VÀ ACTION BUTTONS -->
            <div class="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 text-white z-20">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span id="lightbox-index-badge" class="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold">1 / 1</span>
                    <h3 id="lightbox-image-title" class="text-xs sm:text-sm font-bold truncate">Xem ảnh</h3>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" id="btn-lb-copy" class="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all" title="Sao chép liên kết">
                        <i class="far fa-copy text-[11px]"></i> <span class="hidden sm:inline">Sao chép</span>
                    </button>
                    <button type="button" id="btn-lb-download" class="h-8 px-3 rounded-full bg-accent-theme text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm" title="Tải ảnh về máy">
                        <i class="fas fa-download text-[11px]"></i> <span class="hidden sm:inline">Tải về</span>
                    </button>
                    <button type="button" id="btn-lb-close" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ml-1" title="Đóng">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- MAIN VIEW: ẢNH HIỂN THỊ KÈM NÚT QUA / LẠI -->
            <div class="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-between gap-3 my-auto">
                <button type="button" id="btn-lb-prev" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all z-20" title="Ảnh trước">
                    <i class="fas fa-chevron-left text-sm"></i>
                </button>

                <div class="flex-1 flex items-center justify-center h-full max-h-[78vh] overflow-hidden p-2">
                    <img id="lightbox-display-img" src="" alt="View" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-200" />
                </div>

                <button type="button" id="btn-lb-next" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all z-20" title="Ảnh tiếp theo">
                    <i class="fas fa-chevron-right text-sm"></i>
                </button>
            </div>

            <!-- BOTTOM THUMBNAIL STRIP -->
            <div class="w-full max-w-xl mx-auto flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1 z-20" id="lightbox-thumbs-strip"></div>
        `;
        document.body.appendChild(box);

        const updateLightbox = () => {
            const current = GalleryKit.items[GalleryKit.currentIndex];
            if (!current) return;

            const imgEl = box.querySelector('#lightbox-display-img');
            const titleEl = box.querySelector('#lightbox-image-title');
            const badgeEl = box.querySelector('#lightbox-index-badge');
            const thumbsStrip = box.querySelector('#lightbox-thumbs-strip');

            if (imgEl) imgEl.src = current.url;
            if (titleEl) titleEl.textContent = current.title || `Hình ảnh #${GalleryKit.currentIndex + 1}`;
            if (badgeEl) badgeEl.textContent = `${GalleryKit.currentIndex + 1} / ${GalleryKit.items.length}`;

            // Render thanh thumbnail nhỏ bên dưới
            if (thumbsStrip) {
                thumbsStrip.innerHTML = GalleryKit.items.map((it, idx) => `
                    <div class="w-10 h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${idx === GalleryKit.currentIndex ? 'border-emerald-500 scale-105' : 'border-white/20 opacity-50 hover:opacity-100'}" data-thumb-idx="${idx}">
                        <img src="${it.url}" class="w-full h-full object-cover" />
                    </div>
                `).join('');

                thumbsStrip.querySelectorAll('[data-thumb-idx]').forEach(th => {
                    th.onclick = () => {
                        GalleryKit.currentIndex = parseInt(th.dataset.thumbIdx, 10);
                        updateLightbox();
                    };
                });
            }
        };

        updateLightbox();

        // Xử lý nút điều hướng
        box.querySelector('#btn-lb-prev').onclick = () => {
            GalleryKit.currentIndex = (GalleryKit.currentIndex - 1 + GalleryKit.items.length) % GalleryKit.items.length;
            updateLightbox();
        };

        box.querySelector('#btn-lb-next').onclick = () => {
            GalleryKit.currentIndex = (GalleryKit.currentIndex + 1) % GalleryKit.items.length;
            updateLightbox();
        };

        // Nút tải ảnh trực tiếp
        box.querySelector('#btn-lb-download').onclick = async () => {
            const cur = GalleryKit.items[GalleryKit.currentIndex];
            try {
                const res = await fetch(cur.url);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = (cur.title || 'image').replace(/\s+/g, '_') + '.jpg';
                a.click();
                URL.revokeObjectURL(blobUrl);
                UI.notch.notify('Đã tải xuống', `Đã lưu ảnh "${cur.title}" về máy.`, 'success');
            } catch (e) {
                window.open(cur.url, '_blank');
            }
        };

        // Nút sao chép URL ảnh
        box.querySelector('#btn-lb-copy').onclick = async () => {
            const cur = GalleryKit.items[GalleryKit.currentIndex];
            try {
                await navigator.clipboard.writeText(cur.url);
                UI.notch.notify('Đã sao chép', 'Đã lưu đường dẫn ảnh vào Clipboard.', 'success');
            } catch (e) {
                UI.showAlert('Lỗi', 'Không thể truy cập Clipboard', 'warning');
            }
        };

        const closeBox = () => {
            window.removeEventListener('keydown', keyNav);
            box.remove();
        };

        box.querySelector('#btn-lb-close').onclick = closeBox;

        // Phím tắt mũi tên trái/phải và Esc
        const keyNav = (e) => {
            if (e.key === 'ArrowLeft') {
                GalleryKit.currentIndex = (GalleryKit.currentIndex - 1 + GalleryKit.items.length) % GalleryKit.items.length;
                updateLightbox();
            } else if (e.key === 'ArrowRight') {
                GalleryKit.currentIndex = (GalleryKit.currentIndex + 1) % GalleryKit.items.length;
                updateLightbox();
            } else if (e.key === 'Escape') {
                closeBox();
            }
        };
        window.addEventListener('keydown', keyNav);
    }
};

// =============================================================================
// MODULE 2: TEMPLATE RENDERER
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

            /* Mini Slim Scrubber */
            input[type=range].slim-scrubber {
                -webkit-appearance: none;
                background: rgba(255, 255, 255, 0.2);
                height: 4px;
                border-radius: 9999px;
            }
            input[type=range].slim-scrubber::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 10px;
                width: 10px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                cursor: pointer;
            }

            /* Sóng âm nhịp điệu mini */
            @keyframes kit-wave-jump {
                0%, 100% { height: 4px; }
                50% { height: 16px; }
            }
            .kit-wave-bar {
                width: 2.5px;
                background-color: var(--kit-accent, #10b981);
                border-radius: 9999px;
                animation: kit-wave-jump 0.75s ease-in-out infinite;
            }
            .kit-wave-bar:nth-child(2) { animation-delay: 0.15s; }
            .kit-wave-bar:nth-child(3) { animation-delay: 0.3s; }
            .kit-wave-bar:nth-child(4) { animation-delay: 0.45s; }

            /* Vinyl rotation animation */
            @keyframes kit-vinyl-spin {
                100% { transform: rotate(360deg); }
            }
            .kit-spinning {
                animation: kit-vinyl-spin 8s linear infinite;
            }
        </style>

        <!-- MAIN SCROLLER (pt-12 TRÁNH VA CHẠM TAI THỎ ĐỈNH MÀN HÌNH) -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-12 pb-36 max-w-6xl mx-auto space-y-7">
            
            <!-- HEADER -->
            <div class="px-1 space-y-1 select-none">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">Enterprise Design System</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">UI Kit & Media Master</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Quy chuẩn tinh gọn: Video Player mỏng nhẹ, Audio Capsule liền mạch, Thư viện ảnh Lightbox đa năng có tải về & sao chép.</p>
            </div>

            <!-- ========================================================
                 PHẦN 1: TRÌNH PHÁT VIDEO & AUDIO SIÊU GỌN (ULTRA-COMPACT)
                 ======================================================== -->
            <section class="space-y-4">
                <div class="flex items-center justify-between px-1 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-play text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">1. Trình phát Video & Audio Tinh Gọn</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Compact Media</span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    
                    <!-- COMPACT VIDEO PLAYER (6 COLS) -->
                    <div class="lg:col-span-6 rounded-[22px] bg-black border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-sm relative group flex flex-col justify-end">
                        <video id="demo-video-el" class="w-full aspect-video object-cover bg-black" playsinline preload="metadata">
                            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                        </video>

                        <!-- Floating Slim Video Controls -->
                        <div class="absolute inset-x-3 bottom-3 p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 text-white text-xs select-none">
                            <button type="button" id="btn-video-toggle" class="w-7 h-7 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform active:scale-90">
                                <i class="fas fa-play text-[10px]" id="demo-video-icon"></i>
                            </button>
                            
                            <input type="range" id="demo-video-scrubber" min="0" max="100" value="0" class="slim-scrubber flex-1 cursor-pointer">
                            
                            <span id="demo-video-time" class="font-mono text-[10px] text-zinc-300 shrink-0">00:00</span>

                            <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" id="btn-video-pip" class="w-6 h-6 rounded-lg hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white" title="Hình trong hình">
                                    <i class="fas fa-clone text-[9px]"></i>
                                </button>
                                <button type="button" id="btn-video-fullscreen" class="w-6 h-6 rounded-lg hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white" title="Toàn màn hình">
                                    <i class="fas fa-expand text-[9px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- COMPACT AUDIO CAPSULE PLAYER (6 COLS) -->
                    <div class="lg:col-span-6 rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-sm flex flex-col justify-between h-full space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2.5 select-none">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-accent-theme animate-pulse"></span>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Audio Capsule Player</span>
                            </div>
                            <button type="button" id="btn-send-notch-media" class="px-2.5 py-1 rounded-full bg-accent-theme-alpha text-accent-theme hover:brightness-110 text-[10px] font-semibold flex items-center gap-1 transition-all">
                                <i class="fas fa-mobile-screen-button text-[9px]"></i> Đẩy lên Notch
                            </button>
                        </div>

                        <!-- Audio Body -->
                        <div class="flex items-center gap-3 select-none">
                            <!-- Đĩa Vinyl Cover xoay khi phát -->
                            <div class="w-11 h-11 rounded-full bg-zinc-900 border border-white/15 overflow-hidden shrink-0 relative flex items-center justify-center" id="demo-audio-vinyl">
                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80" class="w-full h-full object-cover opacity-85" />
                                <div class="absolute w-3 h-3 rounded-full bg-black border border-white/40"></div>
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex items-center justify-between gap-2">
                                    <h4 class="text-xs font-bold text-zinc-900 dark:text-white truncate">Chương 102: Đại Lộ Thăng Hoa</h4>
                                    <!-- Waveform Bars -->
                                    <div class="flex items-center gap-0.5 h-3.5" id="demo-audio-waves">
                                        <div class="kit-wave-bar"></div>
                                        <div class="kit-wave-bar"></div>
                                        <div class="kit-wave-bar"></div>
                                        <div class="kit-wave-bar"></div>
                                    </div>
                                </div>
                                <p class="text-[11px] text-zinc-400 truncate">Giọng đọc Ban Mai AI • TTS Engine</p>
                            </div>
                        </div>

                        <!-- Scrubber mỏng -->
                        <div class="space-y-0.5 select-none">
                            <input type="range" id="demo-audio-scrubber" min="0" max="100" value="32" class="slim-scrubber w-full cursor-pointer">
                            <div class="flex justify-between text-[9px] font-mono text-zinc-400">
                                <span id="demo-audio-cur-time">02:40</span>
                                <span>08:15</span>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="flex items-center justify-between pt-1">
                            <div class="flex items-center gap-2">
                                <button type="button" id="btn-audio-prev" class="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white" title="Lùi 15s">
                                    <i class="fas fa-rotate-left text-[10px]"></i>
                                </button>
                                <button type="button" id="btn-audio-toggle" class="h-8 px-4 rounded-xl bg-accent-theme text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                                    <i class="fas fa-play text-[10px]" id="demo-audio-play-icon"></i> <span>Phát âm</span>
                                </button>
                                <button type="button" id="btn-audio-next" class="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white" title="Tua 15s">
                                    <i class="fas fa-rotate-right text-[10px]"></i>
                                </button>
                            </div>
                            <span class="text-[10px] font-mono text-zinc-400">Tốc độ: 1.25x</span>
                        </div>
                    </div>

                </div>
            </section>

            <!-- ========================================================
                 PHẦN 2: THƯ VIỆN ẢNH PRO LIGHTBOX & DROPZONE TẢI TỆP
                 ======================================================== -->
            <section class="space-y-4">
                <div class="flex items-center justify-between px-1 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-images text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">2. Thư viện Ảnh (Lightbox Toàn Năng) & File Dropzone</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Gallery & Storage</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    
                    <!-- PRO PHOTO GALLERY (7 COLS) -->
                    <div class="md:col-span-7 rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2.5 select-none">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bộ sưu tập ảnh (Nhấn để duyệt với Lightbox Pro)</span>
                            <span class="text-[9px] font-mono text-zinc-400">4 tệp</span>
                        </div>

                        <!-- Grid 4 ảnh -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="demo-gallery-grid">
                            <!-- JS sẽ nạp tự động qua GalleryKit -->
                        </div>
                    </div>

                    <!-- DROPZONE KÉO THẢ TỆP TIN (5 COLS) -->
                    <div class="md:col-span-5 rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2.5 select-none">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nạp tệp tin (.TBZ, .ZIP, .EPUB)</span>
                        </div>

                        <div id="demo-dropzone-box" class="border-2 border-dashed border-black/[0.1] dark:border-white/[0.1] hover:border-accent-theme rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-1.5 select-none">
                            <div class="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-zinc-400">
                                <i class="fas fa-cloud-arrow-up text-sm"></i>
                            </div>
                            <div class="text-xs font-bold text-zinc-900 dark:text-white">Kéo thả tệp hoặc duyệt file</div>
                            <div class="text-[10px] text-zinc-400">Hỗ trợ tệp zip, dữ liệu tiểu thuyết, ảnh</div>
                            <input type="file" id="demo-dropzone-input" class="hidden" multiple />
                        </div>

                        <div id="demo-uploaded-list" class="space-y-1.5 max-h-[85px] overflow-y-auto no-scrollbar pt-1"></div>
                    </div>

                </div>
            </section>

            <!-- ========================================================
                 PHẦN 3: ĐIỀU KHIỂN SMART NOTCH ĐA NĂNG (ZERO-IDLE)
                 ======================================================== -->
            <section class="rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2.5 select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-bolt text-accent-theme text-xs"></i>
                        <h2 class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">3. Kích hoạt Tai thỏ Smart Notch</h2>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">Zero-Idle Notch</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button type="button" id="btn-trigger-notch-notify" class="p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-emerald-500/40 text-left transition-all active:scale-[0.98]">
                        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 text-xs">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="text-xs font-bold text-zinc-900 dark:text-white">Thông báo (Notify)</div>
                        <div class="text-[10px] text-zinc-400 mt-0.5">Tự thu nhỏ sau 3.8s</div>
                    </button>

                    <button type="button" id="btn-trigger-notch-timer" class="p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-amber-500/40 text-left transition-all active:scale-[0.98]">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 text-xs">
                            <i class="fas fa-stopwatch"></i>
                        </div>
                        <div class="text-xs font-bold text-zinc-900 dark:text-white">Đếm ngược (Timer)</div>
                        <div class="text-[10px] text-zinc-400 mt-0.5">Đếm lùi 45s, có Pause/Play</div>
                    </button>

                    <button type="button" id="btn-trigger-notch-media" class="p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-purple-500/40 text-left transition-all active:scale-[0.98]">
                        <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 text-xs">
                            <i class="fas fa-headphones"></i>
                        </div>
                        <div class="text-xs font-bold text-zinc-900 dark:text-white">Trình phát (Media)</div>
                        <div class="text-[10px] text-zinc-400 mt-0.5">Sóng âm và điều khiển bài</div>
                    </button>

                    <button type="button" id="btn-trigger-notch-activity" class="p-4 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-blue-500/40 text-left transition-all active:scale-[0.98]">
                        <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 text-xs">
                            <i class="fas fa-cloud-arrow-down"></i>
                        </div>
                        <div class="text-xs font-bold text-zinc-900 dark:text-white">Tác vụ tải (Activity)</div>
                        <div class="text-[10px] text-zinc-400 mt-0.5">Cập nhật tải dữ liệu nền</div>
                    </button>
                </div>
            </section>

            <!-- ========================================================
                 PHẦN 4: TIỀN TỆ, INPUTS & CODE BOILERPLATE
                 ======================================================== -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Inputs & Form -->
                <div class="rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ô nhập liệu tiền tệ chuẩn hóa</span>
                    
                    <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-1.5 focus-within:border-accent-theme transition-all">
                        <span class="text-zinc-400 font-bold font-mono text-sm mr-2 select-none">₫</span>
                        <input type="text" inputmode="decimal" id="demo-input-currency" 
                            class="w-full bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white text-right placeholder-zinc-400 select-text" 
                            placeholder="50.000.000" value="50.000.000">
                    </div>

                    <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] select-none" id="demo-unit-tabs">
                        <button type="button" class="demo-unit-tab active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all text-center" data-unit="Ngày">Ngày</button>
                        <button type="button" class="demo-unit-tab py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-400 hover:text-white transition-all text-center" data-unit="Tuần">Tuần</button>
                        <button type="button" class="demo-unit-tab py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-400 hover:text-white transition-all text-center" data-unit="Tháng">Tháng</button>
                    </div>
                </div>

                <!-- Boilerplate code copy -->
                <div class="rounded-[22px] bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-2 flex flex-col justify-between">
                    <div class="flex items-center justify-between select-none">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mã khởi tạo nhanh</span>
                        <button type="button" id="btn-copy-code" class="h-6 px-2.5 bg-accent-theme text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 active:scale-95 transition-transform">
                            <i class="far fa-copy text-[9px]"></i> Sao chép
                        </button>
                    </div>
                    <div class="rounded-xl bg-zinc-950 p-3 font-mono text-[10px] text-zinc-300 overflow-x-auto no-scrollbar border border-white/10">
                        <pre><code id="code-snippet-box"></code></pre>
                    </div>
                </div>
            </section>

        </main>
    </div>
    `;
}

// =============================================================================
// MODULE 3: DATA FIXTURES
// =============================================================================
const SAMPLE_GALLERY_IMAGES = [
    { title: 'Gradient Wallpaper', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&q=80' },
    { title: 'Neon Abstract Light', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80' },
    { title: 'Fluid Digital 3D', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80' },
    { title: 'Cyber Circuit Matrix', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80' }
];

// =============================================================================
// MODULE 4: LOGIC HOOKS & EVENT DISPATCHING
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

    // 1. KHỞI TẠO BỘ SƯU TẬP ẢNH & GẮN SỰ KIỆN LIGHTBOX
    GalleryKit.initGallery(SAMPLE_GALLERY_IMAGES);
    const galleryGrid = _('#demo-gallery-grid');
    if (galleryGrid) {
        galleryGrid.innerHTML = SAMPLE_GALLERY_IMAGES.map((img, idx) => `
            <div class="aspect-square rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/[0.08] group relative cursor-pointer" data-gallery-idx="${idx}">
                <img src="${img.thumb}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div class="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <i class="fas fa-expand text-xs"></i>
                </div>
            </div>
        `).join('');

        galleryGrid.querySelectorAll('[data-gallery-idx]').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.galleryIdx, 10);
                GalleryKit.openLightbox(idx);
            });
        });
    }

    // 2. VIDEO PLAYER CONTROLLER
    const video = _('#demo-video-el');
    const btnVideoToggle = _('#btn-video-toggle');
    const videoIcon = _('#demo-video-icon');
    const videoScrubber = _('#demo-video-scrubber');
    const videoTime = _('#demo-video-time');

    if (video) {
        btnVideoToggle?.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                if (videoIcon) videoIcon.className = 'fas fa-pause text-[10px]';
            } else {
                video.pause();
                if (videoIcon) videoIcon.className = 'fas fa-play text-[10px]';
            }
        });

        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            const pct = (video.currentTime / video.duration) * 100;
            if (videoScrubber) videoScrubber.value = pct;
            if (videoTime) {
                const format = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
                videoTime.textContent = `${format(video.currentTime)} / ${format(video.duration)}`;
            }
        });

        videoScrubber?.addEventListener('input', (e) => {
            if (!video.duration) return;
            video.currentTime = (e.target.value / 100) * video.duration;
        });

        _('#btn-video-pip')?.addEventListener('click', async () => {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else if (document.pictureInPictureEnabled) {
                    await video.requestPictureInPicture();
                }
            } catch (err) {
                UI.notch.notify('PiP', 'Trình duyệt không hỗ trợ chế độ PiP', 'warning');
            }
        });

        _('#btn-video-fullscreen')?.addEventListener('click', () => {
            if (video.requestFullscreen) video.requestFullscreen();
        });
    }

    // 3. AUDIO PLAYER CONTROLLER
    let isAudioPlaying = false;
    const btnAudioToggle = _('#btn-audio-toggle');
    const audioPlayIcon = _('#demo-audio-play-icon');
    const audioWaves = _('#demo-audio-waves');
    const audioVinyl = _('#demo-audio-vinyl');

    btnAudioToggle?.addEventListener('click', () => {
        isAudioPlaying = !isAudioPlaying;
        if (audioPlayIcon) audioPlayIcon.className = `fas ${isAudioPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`;
        if (audioWaves) audioWaves.style.opacity = isAudioPlaying ? '1' : '0.3';
        if (audioVinyl) audioVinyl.classList.toggle('kit-spinning', isAudioPlaying);
    });

    _('#btn-send-notch-media')?.addEventListener('click', () => {
        UI.notch.media({
            title: 'Chương 102: Đại Lộ Thăng Hoa',
            artist: 'Ban Mai AI • TTS Engine',
            isPlaying: isAudioPlaying,
            onTogglePlay: (state) => {
                isAudioPlaying = state;
                if (audioPlayIcon) audioPlayIcon.className = `fas ${state ? 'fa-pause' : 'fa-play'} text-[10px]`;
                if (audioVinyl) audioVinyl.classList.toggle('kit-spinning', state);
            }
        });
    });

    // 4. DROPZONE TỆP TIN
    const dropzone = _('#demo-dropzone-box');
    const dropzoneInput = _('#demo-dropzone-input');
    const uploadList = _('#demo-uploaded-list');

    dropzone?.addEventListener('click', () => dropzoneInput?.click());
    dropzone?.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-accent-theme'); });
    dropzone?.addEventListener('dragleave', () => { dropzone.classList.remove('border-accent-theme'); });
    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-accent-theme');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    dropzoneInput?.addEventListener('change', (e) => {
        if (e.target.files.length) handleFiles(e.target.files);
    });

    const handleFiles = (files) => {
        Array.from(files).forEach(f => {
            const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
            const row = document.createElement('div');
            row.className = 'p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.05] flex items-center justify-between text-xs font-mono';
            row.innerHTML = `
                <div class="flex items-center gap-2 truncate">
                    <i class="far fa-file text-accent-theme text-xs"></i>
                    <span class="truncate text-[11px]">${f.name}</span>
                </div>
                <span class="text-[10px] text-zinc-400 shrink-0">${sizeMB} MB</span>
            `;
            uploadList?.prepend(row);
        });
        UI.notch.notify('Đã thêm tệp', `Đã nạp ${files.length} tệp tin vào phiên làm việc.`, 'success');
    };

    // 5. SMART NOTCH DEMO CONTROLLERS
    _('#btn-trigger-notch-notify')?.addEventListener('click', () => {
        UI.notch.notify('Đồng bộ dữ liệu', 'Toàn bộ thông số truyện đã lưu vào IndexedDB.', 'success');
    });

    _('#btn-trigger-notch-timer')?.addEventListener('click', () => {
        UI.notch.timer({ title: 'Thời gian xuất file .TBZ', seconds: 45 });
    });

    _('#btn-trigger-notch-media')?.addEventListener('click', () => {
        UI.notch.media({
            title: 'Chương 102: Đại Lộ Thăng Hoa',
            artist: 'Ban Mai AI Voice',
            isPlaying: true
        });
    });

    _('#btn-trigger-notch-activity')?.addEventListener('click', () => {
        let p = 0;
        UI.notch.appActivity({ title: 'Đang tải Audio Offline', progress: 0, statusText: '0%' });
        const timer = setInterval(() => {
            p += 25;
            if (p >= 100) {
                p = 100;
                clearInterval(timer);
                UI.notch.notify('Hoàn tất tải về', 'Gói dữ liệu Offline đã sẵn sàng.', 'success');
            } else {
                UI.notch.appActivity({ title: 'Đang tải Audio Offline', progress: p, statusText: `${p}%` });
            }
        }, 500);
    });

    // 6. TIỀN TỆ VÀ TABS
    CurrencyKit.bindInput(_('#demo-input-currency'));

    const activeUnitClass = 'demo-unit-tab active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all text-center';
    const inactiveUnitClass = 'demo-unit-tab py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-400 hover:text-white transition-all text-center';

    $$('.demo-unit-tab').forEach(btn => {         btn.addEventListener('click', () => {             $$
('.demo-unit-tab').forEach(b => b.className = inactiveUnitClass);
            btn.className = activeUnitClass;
            UI.notch.notify('Đơn vị', 'Đã chuyển sang phân đoạn: ' + btn.dataset.unit, 'info', 1800);
        });
    });

    // 7. BOILERPLATE CODE BOX
    const codeBox = _('#code-snippet-box');
    if (codeBox) {
        codeBox.textContent = 
`// Mở Lightbox xem ảnh toàn màn hình có nút Download & Copy:
GalleryKit.openLightbox(0);

// Đẩy nhạc/truyện TTS lên Tai Thỏ:
UI.notch.media({ title: 'Chương 1', artist: 'Truyện Voice' });

// Kích hoạt bộ đếm giờ thời gian thực:
UI.notch.timer({ title: 'Đếm lùi', seconds: 60 });`;
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