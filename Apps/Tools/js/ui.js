// js/ui.js

let activeNotchMode = null; // 'notify' | 'timer' | 'media' | 'custom' | null
let notchTimerInterval = null;
let notchAutoCloseTimer = null;
let isNotchPinned = false;

function ensureSmartNotchDOM() {
    let notch = document.getElementById('hunqos-smart-notch');
    if (notch) return notch;

    notch = document.createElement('div');
    notch.id = 'hunqos-smart-notch';
    notch.className = 'notch-state-closed';
    notch.innerHTML = `
        <style>
            #hunqos-smart-notch {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background-color: #000000;
                color: #ffffff;
                box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
                border-bottom-left-radius: 22px;
                border-bottom-right-radius: 22px;
                border-left: 1px solid rgba(255, 255, 255, 0.08);
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom: 1px solid rgba(255, 255, 255, 0.14);
                overflow: hidden;
                transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
                max-height: 0px;
                opacity: 0;
                pointer-events: none;
            }

            /* TRẠNG THÁI 1: ẨN HOÀN TOÀN (KHÔNG IDLE GIẢ LẬP) */
            #hunqos-smart-notch.notch-state-closed {
                max-height: 0px !important;
                opacity: 0 !important;
                pointer-events: none !important;
                border-color: transparent !important;
                transform: translateX(-50%) translateY(-100%);
            }

            /* TRẠNG THÁI 2: THU GỌN MINI (COMPACT CAPSULE KHI ĐANG ĐẾM GIỜ / CHẠY NHẠC / THÔNG BÁO THU GỌN) */
            #hunqos-smart-notch.notch-state-minimized {
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: translateX(-50%) translateY(0);
                width: auto;
                min-width: 190px;
                max-width: 320px;
                height: 34px;
                max-height: 34px;
                border-bottom-left-radius: 18px;
                border-bottom-right-radius: 18px;
                cursor: pointer;
            }
            #hunqos-smart-notch.notch-state-minimized #notch-body-expanded {
                display: none !important;
            }
            #hunqos-smart-notch.notch-state-minimized #notch-body-compact {
                display: flex !important;
            }

            /* TRẠNG THÁI 3: MỞ RỘNG ĐẦY ĐỦ THAO TÁC */
            #hunqos-smart-notch.notch-state-expanded {
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: translateX(-50%) translateY(0);
                width: calc(100% - 24px);
                max-width: 480px;
                height: auto;
                max-height: 140px;
            }
            #hunqos-smart-notch.notch-state-expanded #notch-body-compact {
                display: none !important;
            }
            #hunqos-smart-notch.notch-state-expanded #notch-body-expanded {
                display: flex !important;
            }

            /* Hiệu ứng sóng âm mini cho Media */
            @keyframes notch-wave {
                0%, 100% { height: 4px; }
                50% { height: 14px; }
            }
            .notch-wave-bar {
                width: 2px;
                background-color: var(--kit-accent, #10b981);
                border-radius: 9999px;
                animation: notch-wave 1s ease-in-out infinite;
            }
            .notch-wave-bar:nth-child(2) { animation-delay: 0.2s; }
            .notch-wave-bar:nth-child(3) { animation-delay: 0.4s; }
            .notch-wave-bar:nth-child(4) { animation-delay: 0.1s; }
        </style>

        <!-- A. KHU VỰC THU NHỎ (COMPACT NOTCH) -->
        <div id="notch-body-compact" class="hidden items-center justify-between px-3.5 h-[34px] w-full text-xs gap-2">
            <div class="flex items-center gap-2 min-w-0" id="notch-compact-lead">
                <span class="w-2 h-2 rounded-full animate-pulse bg-emerald-500" id="notch-compact-dot"></span>
                <span id="notch-compact-title" class="text-xs font-semibold text-zinc-200 truncate">Notch Mini</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0" id="notch-compact-actions">
                <span id="notch-compact-status" class="text-[10px] font-mono text-zinc-400">00:00</span>
                <button type="button" id="btn-notch-compact-close" class="w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Đóng">
                    <i class="fas fa-times text-[9px]"></i>
                </button>
            </div>
        </div>

        <!-- B. KHU VỰC MỞ RỘNG (EXPANDED NOTCH) -->
        <div id="notch-body-expanded" class="flex flex-col w-full">
            <div id="notch-dynamic-slot" class="p-3.5 flex flex-col gap-2">
                <!-- Nội dung động sẽ nạp vào đây tuỳ theo mode -->
            </div>
            <div id="notch-dynamic-progress" class="h-[2px] w-0 bg-emerald-500 pointer-events-none transition-all"></div>
        </div>
    `;

    document.body.appendChild(notch);

    // Chạm vào thanh thu nhỏ để mở rộng lại
    notch.querySelector('#notch-body-compact')?.addEventListener('click', (e) => {
        if (e.target.closest('#btn-notch-compact-close')) return;
        UI.notch.expand();
    });

    notch.querySelector('#btn-notch-compact-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        UI.notch.close();
    });

    return notch;
}

export const UI = {
    // =========================================================================
    // HỆ THỐNG NOTCH SMART (ĐA NĂNG)
    // =========================================================================
    notch: {
        // 1. THÔNG BÁO SỰ KIỆN (NOTIFY MODE)
        notify: (title, desc = '', type = 'info', duration = 3800) => {
            const notch = ensureSmartNotchDOM();
            activeNotchMode = 'notify';
            isNotchPinned = false;

            const accent = localStorage.getItem('hunqos_accent_color') || '#10b981';
            const typeMap = {
                success: { icon: 'fa-check', color: '#10b981', label: 'Hoàn tất' },
                info: { icon: 'fa-bell', color: accent, label: 'Thông báo' },
                warning: { icon: 'fa-triangle-exclamation', color: '#f59e0b', label: 'Lưu ý' },
                danger: { icon: 'fa-circle-xmark', color: '#f43f5e', label: 'Cảnh báo' }
            };
            const current = typeMap[type] || typeMap.info;

            // Render giao diện mở rộng
            const slot = notch.querySelector('#notch-dynamic-slot');
            slot.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style="background: color-mix(in srgb, ${current.color} 15%, transparent); color: ${current.color};">
                            <i class="fas ${current.icon} text-xs"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-0.5">
                                <h4 class="text-xs font-bold text-white truncate">${title}</h4>
                                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold" style="color: ${current.color}; border-color: color-mix(in srgb, ${current.color} 30%, transparent); background: color-mix(in srgb, ${current.color} 10%, transparent);">${current.label}</span>
                            </div>
                            <p class="text-[11px] text-zinc-400 truncate">${desc}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button type="button" id="btn-notch-pin" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Ghim">
                            <i class="fas fa-thumbtack text-xs"></i>
                        </button>
                        <button type="button" id="btn-notch-minimize" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Thu nhỏ">
                            <i class="fas fa-chevron-up text-xs"></i>
                        </button>
                        <button type="button" id="btn-notch-close" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Đóng">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
            `;

            // Đồng bộ dữ liệu chế độ thu nhỏ
            notch.querySelector('#notch-compact-title').textContent = title;
            notch.querySelector('#notch-compact-status').textContent = current.label;
            notch.querySelector('#notch-compact-dot').style.backgroundColor = current.color;

            // Thanh tiến trình
            const bar = notch.querySelector('#notch-dynamic-progress');
            bar.style.display = 'block';
            bar.style.transition = 'none';
            bar.style.width = '100%';
            bar.style.backgroundColor = current.color;
            setTimeout(() => {
                bar.style.transition = `width ${duration}ms linear`;
                bar.style.width = '0%';
            }, 30);

            // Gắn sự kiện nút
            slot.querySelector('#btn-notch-pin').onclick = () => UI.notch.togglePin();
            slot.querySelector('#btn-notch-minimize').onclick = () => UI.notch.minimize();
            slot.querySelector('#btn-notch-close').onclick = () => UI.notch.close();

            UI.notch.expand();

            clearTimeout(notchAutoCloseTimer);
            notchAutoCloseTimer = setTimeout(() => {
                if (!isNotchPinned) UI.notch.minimize();
            }, duration);
        },

        // 2. BỘ ĐẾM GIỜ / TIMER ĐA NĂNG (TIMER MODE)
        timer: ({ title = 'Đếm ngược', seconds = 60, onFinish = null }) => {
            const notch = ensureSmartNotchDOM();
            activeNotchMode = 'timer';
            clearInterval(notchTimerInterval);

            let remaining = seconds;
            const total = seconds;

            const formatTime = (s) => {
                const m = Math.floor(s / 60);
                const sec = s % 60;
                return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
            };

            const slot = notch.querySelector('#notch-dynamic-slot');
            slot.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <i class="fas fa-stopwatch text-xs"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-mono uppercase text-zinc-400 block">${title}</span>
                            <span id="notch-timer-val" class="text-base font-black font-mono tracking-tight text-white">${formatTime(remaining)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" id="btn-notch-timer-toggle" class="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors">
                            <i class="fas fa-pause text-[10px]"></i>
                        </button>
                        <button type="button" id="btn-notch-minimize" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Thu nhỏ">
                            <i class="fas fa-chevron-up text-xs"></i>
                        </button>
                        <button type="button" id="btn-notch-close" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Hủy">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
            `;

            notch.querySelector('#notch-compact-title').textContent = title;
            notch.querySelector('#notch-compact-dot').style.backgroundColor = '#f59e0b';
            notch.querySelector('#notch-compact-status').textContent = formatTime(remaining);

            const bar = notch.querySelector('#notch-dynamic-progress');
            bar.style.display = 'block';
            bar.style.transition = 'width 1s linear';
            bar.style.backgroundColor = '#f59e0b';

            let isRunning = true;
            const timerValEl = slot.querySelector('#notch-timer-val');
            const toggleBtn = slot.querySelector('#btn-notch-timer-toggle');

            const tick = () => {
                remaining--;
                const pct = (remaining / total) * 100;
                bar.style.width = `${pct}%`;
                if (timerValEl) timerValEl.textContent = formatTime(remaining);
                notch.querySelector('#notch-compact-status').textContent = formatTime(remaining);

                if (remaining <= 0) {
                    clearInterval(notchTimerInterval);
                    UI.notch.notify('Hết giờ!', `Bộ đếm [${title}] đã hoàn thành.`, 'success', 5000);
                    if (typeof onFinish === 'function') onFinish();
                }
            };

            notchTimerInterval = setInterval(tick, 1000);

            toggleBtn.onclick = () => {
                isRunning = !isRunning;
                if (isRunning) {
                    toggleBtn.innerHTML = '<i class="fas fa-pause text-[10px]"></i>';
                    notchTimerInterval = setInterval(tick, 1000);
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-play text-[10px]"></i>';
                    clearInterval(notchTimerInterval);
                }
            };

            slot.querySelector('#btn-notch-minimize').onclick = () => UI.notch.minimize();
            slot.querySelector('#btn-notch-close').onclick = () => {
                clearInterval(notchTimerInterval);
                UI.notch.close();
            };

            UI.notch.expand();
        },

        // 3. TRÌNH PHÁT NHẠC / AUDIO READER (MEDIA MODE)
        media: ({ title = 'Đang phát âm thanh', artist = 'Truyện Voice Engine', isPlaying = true, onTogglePlay = null }) => {
            const notch = ensureSmartNotchDOM();
            activeNotchMode = 'media';

            const slot = notch.querySelector('#notch-dynamic-slot');
            slot.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="w-9 h-9 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center gap-0.5 shrink-0 overflow-hidden">
                            <div class="notch-wave-bar"></div>
                            <div class="notch-wave-bar"></div>
                            <div class="notch-wave-bar"></div>
                            <div class="notch-wave-bar"></div>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs font-bold text-white truncate">${title}</h4>
                            <p class="text-[11px] text-zinc-400 truncate">${artist}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" id="btn-media-toggle" class="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center text-xs active:scale-95 transition-transform">
                            <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                        <button type="button" id="btn-notch-minimize" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Thu nhỏ">
                            <i class="fas fa-chevron-up text-xs"></i>
                        </button>
                        <button type="button" id="btn-notch-close" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Dừng">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
            `;

            notch.querySelector('#notch-compact-title').textContent = title;
            notch.querySelector('#notch-compact-dot').style.backgroundColor = 'var(--kit-accent, #10b981)';
            notch.querySelector('#notch-compact-status').textContent = 'Audio';

            const playBtn = slot.querySelector('#btn-media-toggle');
            playBtn.onclick = () => {
                isPlaying = !isPlaying;
                playBtn.innerHTML = `<i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
                if (typeof onTogglePlay === 'function') onTogglePlay(isPlaying);
            };

            slot.querySelector('#btn-notch-minimize').onclick = () => UI.notch.minimize();
            slot.querySelector('#btn-notch-close').onclick = () => UI.notch.close();

            UI.notch.expand();
        },

        // 4. TIẾN TRÌNH ỨNG DỤNG / BATCH DOWNLOADER (APP ACTIVITY MODE)
        appActivity: ({ title = 'Đang trích xuất dữ liệu', progress = 0, statusText = '0%' }) => {
            const notch = ensureSmartNotchDOM();
            activeNotchMode = 'app';

            const slot = notch.querySelector('#notch-dynamic-slot');
            slot.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <i class="fas fa-cloud-arrow-down text-xs"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center justify-between mb-1 text-xs">
                                <span class="font-bold text-white truncate">${title}</span>
                                <span id="notch-app-pct" class="font-mono text-[11px] text-blue-400 font-semibold">${statusText}</span>
                            </div>
                            <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div id="notch-app-bar" class="h-full bg-blue-500 transition-all duration-300" style="width: ${progress}%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button type="button" id="btn-notch-minimize" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Thu nhỏ">
                            <i class="fas fa-chevron-up text-xs"></i>
                        </button>
                        <button type="button" id="btn-notch-close" class="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white" title="Hủy">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
            `;

            notch.querySelector('#notch-compact-title').textContent = title;
            notch.querySelector('#notch-compact-dot').style.backgroundColor = '#3b82f6';
            notch.querySelector('#notch-compact-status').textContent = statusText;

            slot.querySelector('#btn-notch-minimize').onclick = () => UI.notch.minimize();
            slot.querySelector('#btn-notch-close').onclick = () => UI.notch.close();

            UI.notch.expand();
        },

        // CÁC HÀM ĐIỀU KHIỂN TRẠNG THÁI
        expand: () => {
            const notch = ensureSmartNotchDOM();
            notch.classList.remove('notch-state-closed', 'notch-state-minimized');
            notch.classList.add('notch-state-expanded');
        },
        minimize: () => {
            const notch = ensureSmartNotchDOM();
            notch.classList.remove('notch-state-closed', 'notch-state-expanded');
            notch.classList.add('notch-state-minimized');
        },
        close: () => {
            const notch = ensureSmartNotchDOM();
            clearInterval(notchTimerInterval);
            clearTimeout(notchAutoCloseTimer);
            isNotchPinned = false;
            notch.classList.remove('notch-state-expanded', 'notch-state-minimized');
            notch.classList.add('notch-state-closed');
        },
        togglePin: () => {
            const notch = ensureSmartNotchDOM();
            const pinBtn = notch.querySelector('#btn-notch-pin');
            isNotchPinned = !isNotchPinned;

            if (isNotchPinned) {
                clearTimeout(notchAutoCloseTimer);
                if (pinBtn) {
                    pinBtn.classList.add('text-emerald-400', 'bg-white/10');
                    pinBtn.classList.remove('text-zinc-400');
                    pinBtn.title = 'Bỏ ghim';
                }
            } else {
                if (pinBtn) {
                    pinBtn.classList.remove('text-emerald-400', 'bg-white/10');
                    pinBtn.classList.add('text-zinc-400');
                    pinBtn.title = 'Ghim';
                }
                UI.notch.minimize();
            }
        }
    },

    // Tương thích ngược: Khi tool cũ gọi UI.notify() hoặc UI.showAlert() đều kích hoạt Notch
    notify: (title, desc = '', type = 'info', duration = 3800) => {
        UI.notch.notify(title, desc, type, duration);
    },
    showAlert: (title, desc = '', type = 'info', duration = 3800) => {
        UI.notch.notify(title, desc, type, duration);
    },

    // MODAL XÁC NHẬN CHUẨN
    showConfirm: (title, desc, onConfirm, onCancel) => {
        const modalId = 'hunqos-confirm-dialog';
        let modal = document.getElementById(modalId);
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none';
        modal.innerHTML = `
            <div class="w-full max-w-sm rounded-[24px] bg-[#161618] border border-white/10 p-5 shadow-2xl space-y-4 text-white">
                <div class="space-y-1.5">
                    <h3 class="text-sm font-bold text-white tracking-tight">${title}</h3>
                    <p class="text-xs text-zinc-400 leading-relaxed">${desc}</p>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <button type="button" id="confirm-btn-cancel" class="py-2.5 rounded-[14px] bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all active:scale-95">Hủy bỏ</button>
                    <button type="button" id="confirm-btn-ok" class="py-2.5 rounded-[14px] bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition-all active:scale-95">Xác nhận</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('#confirm-btn-ok').onclick = () => {
            modal.remove();
            if (typeof onConfirm === 'function') onConfirm();
        };
        modal.querySelector('#confirm-btn-cancel').onclick = () => {
            modal.remove();
            if (typeof onCancel === 'function') onCancel();
        };
    }
};