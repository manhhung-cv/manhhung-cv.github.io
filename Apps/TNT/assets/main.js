// ==========================================================================
// TNT TRUYỆN VOICE - MAIN.JS (Full Centralized State & Config Center)
// ==========================================================================

let APP_VERSION = 'Đang đồng bộ...';

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function normalizeFontString(str) {
    if (!str) return '';
    return str.replace(/['"]/g, '').trim().toLowerCase();
}

// ==========================================================================
// 1. DEVLOG & CONSOLE MONITOR ENGINE
// ==========================================================================
const DevLogger = {
    logs: [],
    maxLogs: 250,
    screenEl: null,
    badgeEl: null,

    init() {
        const self = this;
        this.screenEl = document.getElementById('devlog-screen');
        this.badgeEl = document.getElementById('devlog-count-badge');

        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        function appendLog(type, args) {
            const time = new Date().toLocaleTimeString('vi-VN');
            const message = Array.from(args).map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    try { return JSON.stringify(arg); } catch (e) { return String(arg); }
                }
                return String(arg);
            }).join(' ');

            self.logs.push({ time, type, message });
            if (self.logs.length > self.maxLogs) self.logs.shift();
            self.renderEntry(time, type, message);
        }

        console.log = function (...args) {
            originalLog.apply(console, args);
            appendLog('log', args);
        };
        console.warn = function (...args) {
            originalWarn.apply(console, args);
            appendLog('warn', args);
        };
        console.error = function (...args) {
            originalError.apply(console, args);
            appendLog('error', args);
        };

        window.addEventListener('error', function (event) {
            appendLog('error', [`[Runtime Error] ${event.message} (${event.filename}:${event.lineno})`]);
        });

        window.addEventListener('unhandledrejection', function (event) {
            appendLog('error', [`[Promise Rejection] ${event.reason ? (event.reason.message || event.reason) : 'Unknown'}`]);
        });
    },

    renderEntry(time, type, msg) {
        if (!this.screenEl) {
            this.screenEl = document.getElementById('devlog-screen');
        }
        if (!this.screenEl) return;

        const colorClass = type === 'error' ? 'text-rose-400' : (type === 'warn' ? 'text-amber-300' : 'text-emerald-400');
        const icon = type === 'error' ? '✖' : (type === 'warn' ? '⚠' : 'ℹ');

        const row = document.createElement('div');
        row.className = `leading-relaxed border-b border-neutral-800/40 pb-0.5 ${colorClass}`;
        row.innerHTML = `<span class="opacity-50 text-[10px]">[${time}]</span> <span class="font-bold">${icon}</span> <span>${this.escapeHtml(msg)}</span>`;

        this.screenEl.appendChild(row);
        this.screenEl.scrollTop = this.screenEl.scrollHeight;

        if (!this.badgeEl) this.badgeEl = document.getElementById('devlog-count-badge');
        if (this.badgeEl) {
            this.badgeEl.textContent = `${this.logs.length} log`;
        }
    },

    escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    clear() {
        this.logs = [];
        if (this.screenEl) this.screenEl.innerHTML = '<div class="text-neutral-500 italic">[Đã dọn sạch nhật ký]</div>';
        if (this.badgeEl) this.badgeEl.textContent = '0 log';
    },

    copy() {
        if (this.logs.length === 0) {
            showToast("Chưa có nhật ký nào để sao chép!");
            return;
        }
        const textToCopy = this.logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Đã sao chép toàn bộ DevLog!");
        }).catch(() => {
            showToast("Không thể truy cập clipboard!");
        });
    },

    evalCode(code) {
        if (!code || !code.trim()) return;
        this.renderEntry(new Date().toLocaleTimeString('vi-VN'), 'log', `> ${code}`);
        try {
            const result = window.eval(code);
            console.log(result);
        } catch (err) {
            console.error(`Eval Error: ${err.message}`);
        }
    }
};

DevLogger.init();

// ==========================================================================
// 2. AUDIO & MEDIA SESSION MANAGER
// ==========================================================================
class WebAudioManager {
    constructor() {
        this.silentAudio = document.getElementById('silent-keeper-audio');
        this.silentWavBase64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        if (this.silentAudio) {
            this.silentAudio.src = this.silentWavBase64;
        }

        this.webAudioCtx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isSessionUnlocked = false;

        this.onActionPlay = null;
        this.onActionPause = null;
        this.onActionNext = null;
        this.onActionPrev = null;
    }

    unlockAudioSession() {
        if (this.isSessionUnlocked) return;

        try {
            if (this.silentAudio) {
                const playPromise = this.silentAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(function () { });
                }
            }

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.webAudioCtx = new AudioContextClass();
                if (this.webAudioCtx.state === 'suspended') {
                    this.webAudioCtx.resume();
                }

                this.oscillator = this.webAudioCtx.createOscillator();
                this.gainNode = this.webAudioCtx.createGain();
                this.gainNode.gain.value = 0.0001;

                this.oscillator.connect(this.gainNode);
                this.gainNode.connect(this.webAudioCtx.destination);
                this.oscillator.start();
            }

            this.setupMediaSession();
            this.isSessionUnlocked = true;
        } catch (err) {
            console.warn("[WebAudioManager] Unlock error:", err);
        }
    }

    setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            if (this.onActionPlay) this.onActionPlay();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (this.onActionPause) this.onActionPause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (this.onActionPrev) this.onActionPrev();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (this.onActionNext) this.onActionNext();
        });
    }

    updateMetadata(title, chapterTitle, coverUrl) {
        if (!('mediaSession' in navigator)) return;

        const artworkSrc = coverUrl || './assets/logo.png';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: chapterTitle || 'Truyện Voice',
            artist: title || 'Giọng đọc AI',
            album: 'Truyện Voice Reader',
            artwork: [
                { src: artworkSrc, sizes: '192x192', type: 'image/png' },
                { src: artworkSrc, sizes: '512x512', type: 'image/png' }
            ]
        });
    }

    setPlaybackState(isPlaying) {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        if (isPlaying && this.silentAudio && this.silentAudio.paused) {
            this.silentAudio.play().catch(function () { });
        }
    }
}

// ==========================================================================
// 3. DATABASE SETUP (DEXIE.JS - CHỈ MỤC KÉP bookId+chapterIndex & BẢNG GALLERY)
// ==========================================================================
const db = new Dexie('TruyenVoiceDB_v3');
db.version(1).stores({
    books: 'id, title, author, totalChapters, currentChapter, currentSentence, scrollTop, createdAt',
    chapters: 'id, bookId, chapterIndex, title',
    audio_offline: 'id, bookId, chapterIndex, quality, voice',
    sentence_audio: 'id, bookId, chapterIndex, sentenceIndex, voice',
    settings: 'id'
});
db.version(2).stores({
    books: 'id, title, author, totalChapters, currentChapter, currentSentence, scrollTop, createdAt',
    chapters: 'id, bookId, chapterIndex, title',
    audio_offline: 'id, bookId, chapterIndex, quality, voice',
    sentence_audio: 'id, bookId, chapterIndex, sentenceIndex, voice',
    settings: 'id',
    app_backups: 'id, createdAt, version'
});
db.version(3).stores({
    chapters: 'id, bookId, chapterIndex, [bookId+chapterIndex], title',
    sentence_audio: 'id, bookId, chapterIndex, sentenceIndex, [bookId+chapterIndex], voice'
});
db.version(4).stores({
    bg_gallery: 'id, createdAt, type'
});

// ==========================================================================
// 4. UTILITIES & PURE TEXT SANITIZATION
// ==========================================================================
function decodeHtmlEntities(str) {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#34;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, function (match, dec) { return String.fromCharCode(dec); })
        .replace(/&#x([0-9a-fA-F]+);/g, function (match, hex) { return String.fromCharCode(parseInt(hex, 16)); });
}

function cleanTextForTTS(text) {
    if (!text) return '';
    let str = decodeHtmlEntities(text);

    str = str.replace(/https?:\/\/\S+/gi, '');
    str = str.replace(/&/g, ' và ');
    str = str.replace(/[\[\](){}<>【】〖〗「」『』〔〕〈〉《》]/g, ' ');
    str = str.replace(/["“”«»„‟`'’‘]/g, ' ');
    str = str.replace(/[#*_~^|\\\/+@$%:=;~]/g, ' ');
    str = str.replace(/[-–—]{2,}/g, ' ');
    str = str.replace(/[-–—]/g, ' ');
    str = str.replace(/[!?.…]{2,}/g, '.');
    str = str.replace(/^[^\p{L}\p{N}]+/u, '');
    str = str.replace(/[^\p{L}\p{N}.!?]+$/u, '');

    return str.replace(/\s+/g, ' ').trim();
}

function hasPronounceableContent(text) {
    if (!text) return false;
    return /[\p{L}\p{N}]/u.test(text);
}

function splitSentences(text) {
    if (!text) return [];
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    const rawSentences = cleaned.match(/[^.!?…\n]+[.!?…\n]+|[^.!?…\n]+$/g) || [text];
    return rawSentences
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
}

// ==========================================================================
// 5. TRUNG TÂM CẤU HÌNH & TRẠNG THÁI (APPLICATION CONFIG STATE)
// ==========================================================================
const sharedAudioElement = new Audio();
sharedAudioElement.preload = 'auto';

const state = {
    // [A] THÔNG TIN SÁCH & TIẾN TRÌNH ĐỌC
    currentBook: null,
    currentChapterIndex: 0,
    currentSentenceIndex: 0,
    savedScrollTop: 0,
    isRestoringScroll: false,

    // [B] CHẾ ĐỘ HIỂN THỊ TRANG SÁCH: 'scroll-single' | 'scroll-infinite'
    readingMode: 'scroll-single',
    loadedInfiniteChapters: new Set(),
    isLoadingNextChapter: false,

    // [C] ÂM THANH & GIỌNG ĐỌC AI
    isMuted: true,
    isPlaying: false,
    playbackRate: 1.0,
    currentVoiceName: 'Hoài My',
    activeAudioElement: null,
    consecutiveErrors: 0,
    autoBufferCount: 5,

    // [D] TẢI NGOẠI TUYẾN
    audioFormat: 'standard',
    downloadConcurrency: 3,
    isBatchDownloading: false,
    abortBatchDownload: false,

    // [E] CỠ CHỮ, PHÔNG CHỮ & GIAO DIỆN
    fontSize: 18,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    currentTheme: 'theme-dark',
    customFontFamily: null,

    // [F] CẤU HÌNH HIGHLIGHT KHI ĐỌC: 'fill' | 'underline' | 'wavy' | 'text'
    hlStyle: 'text',
    hlTextColor: '#1d4ed8',
    hlBgColor: '#eff6ff',
    hlBorderColor: '#2563eb',

    // [G] HÌNH NỀN SÁCH CỐ ĐỊNH & ĐỘ MỜ (Hỗ trợ Ảnh, GIF, Video MP4/WEBM)
    bgImage: './assets/bg/bg1.png',
    bgOpacity: 0.4,

    // Tự động lấy bìa EPUB làm hình nền
    autoUseEpubCover: false,

    // [H] KHỞI ĐỘNG & HỆ THỐNG
    pageLoadDelay: 500,
    autoUpdateApp: false,

    // Tìm kiếm trong sách
    searchResults: [],
    currentSearchIndex: -1
};

const audioManager = new WebAudioManager();

// ==========================================================================
// 6. DOM ELEMENTS REFERENCES
// ==========================================================================
const DOM = {
    app: document.getElementById('app'),
    viewport: document.getElementById('reader-viewport'),
    container: document.getElementById('reader-container'),
    readerBgOverlay: document.getElementById('reader-bg-overlay'),
    readerBgVideo: document.getElementById('reader-bg-video'),
    infiniteSentinel: document.getElementById('infinite-sentinel'),
    infiniteSentinelText: document.getElementById('infinite-sentinel-text'),
    headerBookTitle: document.getElementById('header-book-title'),
    headerChapterTitle: document.getElementById('header-chapter-title'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    iconPlayState: document.getElementById('icon-play-state'),
    audioWaveBox: document.getElementById('audio-wave-box'),
    btnPrevSentence: document.getElementById('btn-prev-sentence'),
    btnNextSentence: document.getElementById('btn-next-sentence'),
    btnPrevChapter: document.getElementById('btn-prev-chapter'),
    btnNextChapter: document.getElementById('btn-next-chapter'),
    btnOnTop: document.getElementById('btn-on-top'),
    btnOnTopMobile: document.getElementById('btn-ontop-mobile'),
    btnQuickSpeed: document.getElementById('btn-quick-speed'),
    labelVoice: document.getElementById('label-current-voice'),
    sentenceIdxLabel: document.getElementById('player-sentence-idx'),
    headerOfflineDot: document.getElementById('header-offline-dot'),
    btnReadingMode: document.getElementById('btn-reading-mode'),
    labelReadingMode: document.getElementById('label-reading-mode'),
    btnMuteToggle: document.getElementById('btn-mute-toggle'),
    iconMuteState: document.getElementById('icon-mute-state'),
    labelMuteState: document.getElementById('label-mute-state'),
    btnAaOpen: document.getElementById('btn-aa-open'),
    drawerLibrary: document.getElementById('drawer-library'),
    drawerToc: document.getElementById('drawer-toc'),
    modalTypography: document.getElementById('modal-typography'),
    modalStorage: document.getElementById('modal-storage'),
    modalDevLog: document.getElementById('modal-devlog'),
    btnDevLogMobile: document.getElementById('btn-devlog-mobile'),
    btnDevLogDesktop: document.getElementById('btn-devlog'),
    btnDevLogCopy: document.getElementById('btn-devlog-copy'),
    btnDevLogClear: document.getElementById('btn-devlog-clear'),
    inputDevLog: document.getElementById('devlog-input'),
    btnDevLogEval: document.getElementById('btn-devlog-eval'),
    btnLibrary: document.getElementById('btn-library'),
    btnToc: document.getElementById('btn-toc'),
    btnStorageModal: document.getElementById('btn-storage-modal'),
    btnExportAudioFile: document.getElementById('btn-export-audio-file'),
    storageSelectVoice: document.getElementById('storage-select-voice'),
    storageSelectExt: document.getElementById('storage-select-ext'),
    fileInput: document.getElementById('file-import-input'),
    btnTriggerImport: document.getElementById('btn-trigger-import'),
    libraryBookList: document.getElementById('library-book-list'),
    tocChapterList: document.getElementById('toc-chapter-list'),
    btnExportTbz: document.getElementById('btn-export-tbz'),
    sliderFontSize: document.getElementById('slider-font-size'),
    labelFontSize: document.getElementById('label-font-size'),
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toast-text'),
    statBooks: document.getElementById('stat-total-books'),
    statChapters: document.getElementById('stat-total-chapters'),
    statBytes: document.getElementById('stat-total-bytes'),
    btnCleanAudioCache: document.getElementById('btn-clean-audio-cache'),
    btnPurgeAll: document.getElementById('btn-purge-all-data'),
    storageDownloadScope: document.getElementById('storage-download-scope'),
    storageDownloadConcurrency: document.getElementById('storage-download-concurrency'),
    storageRangeBox: document.getElementById('storage-range-box'),
    inputRangeFrom: document.getElementById('input-range-from'),
    inputRangeTo: document.getElementById('input-range-to'),
    btnStartBatchDownload: document.getElementById('btn-start-batch-download'),
    downloadProgressCard: document.getElementById('download-progress-card'),
    dlStatusText: document.getElementById('dl-status-text'),
    dlStatusPercent: document.getElementById('dl-status-percent'),
    dlProgressBarFill: document.getElementById('dl-progress-bar-fill'),
    dlCountText: document.getElementById('dl-count-text'),
    btnCancelDownload: document.getElementById('btn-cancel-download'),
    editBookTitle: document.getElementById('edit-book-title'),
    editBookAuthor: document.getElementById('edit-book-author'),
    btnSaveBookMeta: document.getElementById('btn-save-book-meta'),
    cachedChaptersList: document.getElementById('cached-chapters-list'),
    btnDeleteCurrentBook: document.getElementById('btn-delete-current-book'),
    btnExportFullTbz: document.getElementById('btn-export-full-tbz'),
    btnToggleHud: document.getElementById('btn-toggle-hud'),
    btnSearchOpen: document.getElementById('btn-search-open'),
    searchBarDrawer: document.getElementById('search-bar-drawer'),
    inputSearchQuery: document.getElementById('input-search-query'),
    btnSearchPrev: document.getElementById('btn-search-prev'),
    btnSearchNext: document.getElementById('btn-search-next'),
    btnSearchClose: document.getElementById('btn-search-close'),
    searchResultsCounter: document.getElementById('search-results-counter'),
    modalConfirm: document.getElementById('modal-confirm'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmDesc: document.getElementById('confirm-desc'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmOk: document.getElementById('btn-confirm-ok'),
    pickerHlText: document.getElementById('picker-hl-text'),
    pickerHlBg: document.getElementById('picker-hl-bg'),
    pickerHlBorder: document.getElementById('picker-hl-border'),
    appVersionBadge: document.getElementById('app-version-badge'),
    configPageLoadingDelay: document.getElementById('config-page-loading-delay'),
    switchAutoUpdate: document.getElementById('switch-auto-update'),
    switchAutoEpubCover: document.getElementById('switch-auto-epub-cover'),
    pageLoadingScreen: document.getElementById('page-loading-screen'),
    sliderBgOpacity: document.getElementById('slider-bg-opacity'),
    labelBgOpacity: document.getElementById('label-bg-opacity')
};

const DOM_GALLERY = {
    grid: document.getElementById('bg-gallery-grid'),
    countLabel: document.getElementById('label-gallery-count'),
    inputFiles: document.getElementById('input-bg-file'),
    btnTriggerFiles: document.getElementById('btn-trigger-bg-file'),
    btnToggleBatchUrl: document.getElementById('btn-toggle-batch-url'),
    trayBatchUrl: document.getElementById('tray-batch-url'),
    textareaBatchUrls: document.getElementById('input-batch-bg-urls'),
    btnApplyBatchUrls: document.getElementById('btn-apply-batch-urls'),
    btnClearAll: document.getElementById('btn-clear-all-gallery')
};

// ==========================================================================
// 7. UI HELPERS & NOTIFICATIONS
// ==========================================================================
function showToast(message) {
    if (DOM.toastText) {
        DOM.toastText.textContent = message;
    } else if (DOM.toast) {
        DOM.toast.textContent = message;
    }
    if (DOM.toast) {
        DOM.toast.classList.remove('-translate-y-full', 'opacity-0');
        DOM.toast.classList.add('translate-y-0', 'opacity-100');
        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(function () {
            DOM.toast.classList.remove('translate-y-0', 'opacity-100');
            DOM.toast.classList.add('-translate-y-full', 'opacity-0');
        }, 2200);
    }
}

function askConfirmation(title, message) {
    return new Promise(function (resolve) {
        DOM.confirmTitle.textContent = title;
        DOM.confirmDesc.textContent = message;
        DOM.modalConfirm.classList.remove('hidden');
        DOM.modalConfirm.classList.add('flex');

        function handleCancel() {
            DOM.modalConfirm.classList.add('hidden');
            DOM.modalConfirm.classList.remove('flex');
            cleanup();
            resolve(false);
        }

        function handleOk() {
            DOM.modalConfirm.classList.add('hidden');
            DOM.modalConfirm.classList.remove('flex');
            cleanup();
            resolve(true);
        }

        function handleBackdropClick(e) {
            if (e.target === DOM.modalConfirm) {
                handleCancel();
            }
        }

        function cleanup() {
            DOM.btnConfirmCancel.removeEventListener('click', handleCancel);
            DOM.btnConfirmOk.removeEventListener('click', handleOk);
            DOM.modalConfirm.removeEventListener('click', handleBackdropClick);
        }

        DOM.btnConfirmCancel.addEventListener('click', handleCancel);
        DOM.btnConfirmOk.addEventListener('click', handleOk);
        DOM.modalConfirm.addEventListener('click', handleBackdropClick);
    });
}

function updateMuteUI() {
    if (state.isMuted) {
        if (DOM.iconMuteState) DOM.iconMuteState.className = 'fa-glasses text-xs';
        if (DOM.labelMuteState) DOM.labelMuteState.textContent = 'Chỉ đọc';
        if (DOM.btnMuteToggle) {
            DOM.btnMuteToggle.classList.remove('text-emerald-600', 'dark:text-emerald-400');
            DOM.btnMuteToggle.classList.add('text-amber-600', 'dark:text-amber-400');
        }
    } else {
        if (DOM.iconMuteState) DOM.iconMuteState.className = 'fa-solid fa-podcast text-xs';
        if (DOM.labelMuteState) DOM.labelMuteState.textContent = 'Phát tiếng';
        if (DOM.btnMuteToggle) {
            DOM.btnMuteToggle.classList.remove('text-amber-600', 'dark:text-amber-400');
            DOM.btnMuteToggle.classList.add('text-emerald-600', 'dark:text-emerald-400');
        }
    }

    const mobileIcon = document.getElementById('icon-mute-state-mobile');
    if (mobileIcon) {
        mobileIcon.className = state.isMuted ? 'fa-glasses text-xs' : 'fa-solid fa-podcast text-xs text-emerald-500';
    }
}

function updateChapterNavButtons() {
    if (!state.currentBook) return;
    DOM.btnPrevChapter.disabled = state.currentChapterIndex <= 0;
    DOM.btnNextChapter.disabled = state.currentChapterIndex >= state.currentBook.totalChapters - 1;
}

function applyHighlightCustomization() {
    document.body.classList.remove('hl-mode-fill', 'hl-mode-underline', 'hl-mode-wavy', 'hl-mode-text');
    document.body.classList.add('hl-mode-' + state.hlStyle);

    document.documentElement.style.setProperty('--hl-bg', state.hlBgColor);
    document.documentElement.style.setProperty('--hl-text', state.hlTextColor);
    document.documentElement.style.setProperty('--hl-border', state.hlBorderColor);
    document.documentElement.style.setProperty('--accent-color', state.hlBorderColor);

    if (DOM.pickerHlText) DOM.pickerHlText.value = state.hlTextColor;
    if (DOM.pickerHlBg) DOM.pickerHlBg.value = state.hlBgColor;
    if (DOM.pickerHlBorder) DOM.pickerHlBorder.value = state.hlBorderColor;

    document.querySelectorAll('.btn-hl-style').forEach(function (btn) {
        if (btn.getAttribute('data-style') === state.hlStyle) {
            btn.className = 'btn-hl-style touch-action py-1.5 rounded-xl border border-[var(--accent-color)] text-[var(--accent-color)] bg-neutral-500/10 text-xs font-semibold';
        } else {
            btn.className = 'btn-hl-style touch-action py-1.5 rounded-xl border border-neutral-500/20 text-xs font-medium opacity-75';
        }
    });
}

function updateFontChipsUI() {
    const currentNorm = normalizeFontString(state.fontFamily);
    document.querySelectorAll('.btn-font-chip').forEach(function (b) {
        const btnFontNorm = normalizeFontString(b.getAttribute('data-font'));
        if (btnFontNorm === currentNorm) {
            b.className = 'btn-font-chip touch-action py-1.5 rounded-xl border border-[var(--accent-color)] text-xs font-semibold text-[var(--accent-color)] bg-neutral-500/10';
        } else {
            b.className = 'btn-font-chip touch-action py-1.5 rounded-xl border border-neutral-500/20 text-xs font-medium opacity-80';
        }
    });
}

// Kiểm tra xem chuỗi có phải là định dạng Video không
function isVideoMedia(urlOrData) {
    if (!urlOrData) return false;
    const lower = urlOrData.toLowerCase();
    return lower.startsWith('data:video/') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('blob:video');
}

// Áp dụng hình nền hoặc Video nền
function applyReaderBackground(bgUrl, opacity = null) {
    state.bgImage = bgUrl;
    if (opacity !== null) {
        state.bgOpacity = opacity;
    }

    const isVideo = isVideoMedia(bgUrl);

    if (DOM.readerBgVideo) {
        if (isVideo && bgUrl) {
            DOM.readerBgVideo.src = bgUrl;
            DOM.readerBgVideo.classList.remove('hidden');
            DOM.readerBgVideo.style.opacity = state.bgOpacity;
            DOM.readerBgVideo.play().catch(() => { });
        } else {
            DOM.readerBgVideo.pause();
            DOM.readerBgVideo.src = '';
            DOM.readerBgVideo.classList.add('hidden');
        }
    }

    if (DOM.readerBgOverlay) {
        if (!isVideo && bgUrl) {
            DOM.readerBgOverlay.style.backgroundImage = `url("${bgUrl}")`;
            DOM.readerBgOverlay.style.opacity = state.bgOpacity;
        } else {
            DOM.readerBgOverlay.style.backgroundImage = 'none';
            DOM.readerBgOverlay.style.opacity = '0';
        }
    }

    if (DOM.sliderBgOpacity) DOM.sliderBgOpacity.value = Math.round(state.bgOpacity * 100);
    if (DOM.labelBgOpacity) DOM.labelBgOpacity.textContent = Math.round(state.bgOpacity * 100) + '%';
}

function loadGoogleFont(fontNameOrUrl) {
    if (!fontNameOrUrl || !fontNameOrUrl.trim()) return;

    let fontName = fontNameOrUrl.trim();
    let fontUrl = '';

    if (fontName.startsWith('http://') || fontName.startsWith('https://')) {
        fontUrl = fontName;
        const match = fontUrl.match(/family=([^:&]+)/);
        if (match && match[1]) {
            fontName = decodeURIComponent(match[1]).replace(/\+/g, ' ');
        }
    } else {
        fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, '+')}:wght@400;600;700&display=swap`;
    }

    let existingLink = document.querySelector(`link[data-font="${fontName}"]`);
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        link.setAttribute('data-font', fontName);
        document.head.appendChild(link);
    }

    const fontFamilyRule = `'${fontName}', sans-serif`;
    state.fontFamily = fontFamilyRule;
    state.customFontFamily = fontFamilyRule;

    document.documentElement.style.setProperty('--reader-font', fontFamilyRule);
    if (DOM.container) DOM.container.style.fontFamily = fontFamilyRule;
    updateFontChipsUI();
    saveProgressState();
    showToast(`Đã áp dụng phông: ${fontName}`);
}

function openDevLogModal() {
    if (DOM.modalDevLog) {
        DOM.modalDevLog.classList.remove('hidden');
        DOM.modalDevLog.classList.add('flex');
    }
}

async function hidePageLoadingScreen() {
    if (!DOM.pageLoadingScreen) return;
    if (state.pageLoadDelay > 0) {
        await sleep(state.pageLoadDelay);
    }
    DOM.pageLoadingScreen.classList.add('fade-out');
    setTimeout(() => {
        DOM.pageLoadingScreen.style.display = 'none';
    }, 450);


}

// ==========================================================================
// 8. STORAGE & SETTINGS PERSISTENCE
// ==========================================================================
async function saveProgressState() {
    try {
        if (!state.currentBook) return;
        const currentScroll = state.savedScrollTop || DOM.viewport.scrollTop || 0;

        await db.books.update(state.currentBook.id, {
            currentChapter: state.currentChapterIndex,
            currentSentence: state.currentSentenceIndex,
            scrollTop: currentScroll
        });

        await db.settings.put({
            id: 'user_preferences',
            readingMode: state.readingMode,
            isMuted: state.isMuted,
            playbackRate: state.playbackRate,
            currentVoiceName: state.currentVoiceName,
            fontSize: state.fontSize,
            fontFamily: state.fontFamily,
            customFontFamily: state.customFontFamily,
            currentTheme: state.currentTheme,
            autoBufferCount: state.autoBufferCount,
            downloadConcurrency: state.downloadConcurrency,
            lastBookId: state.currentBook.id,
            lastChapterIndex: state.currentChapterIndex,
            lastSentenceIndex: state.currentSentenceIndex,
            lastScrollTop: currentScroll,
            hlStyle: state.hlStyle,
            hlTextColor: state.hlTextColor,
            hlBgColor: state.hlBgColor,
            hlBorderColor: state.hlBorderColor,
            pageLoadDelay: state.pageLoadDelay,
            autoUpdateApp: state.autoUpdateApp,
            bgImage: state.bgImage,
            bgOpacity: state.bgOpacity,
            autoUseEpubCover: state.autoUseEpubCover
        });
    } catch (err) {
        console.warn("[Storage] Save progress error:", err);
    }
}

async function loadSettings() {
    try {
        const saved = await db.settings.get('user_preferences');
        if (saved) {
            state.readingMode = saved.readingMode || state.readingMode;
            state.isMuted = saved.isMuted !== undefined ? saved.isMuted : state.isMuted;
            state.playbackRate = saved.playbackRate || state.playbackRate;
            state.currentVoiceName = saved.currentVoiceName || state.currentVoiceName;
            state.fontSize = saved.fontSize || state.fontSize;
            state.fontFamily = saved.fontFamily || state.fontFamily;
            state.customFontFamily = saved.customFontFamily || state.customFontFamily;
            state.currentTheme = saved.currentTheme || state.currentTheme;
            state.autoBufferCount = saved.autoBufferCount || state.autoBufferCount;
            state.downloadConcurrency = saved.downloadConcurrency || state.downloadConcurrency;

            state.hlStyle = saved.hlStyle || state.hlStyle;
            state.hlTextColor = saved.hlTextColor || state.hlTextColor;
            state.hlBgColor = saved.hlBgColor || state.hlBgColor;
            state.hlBorderColor = saved.hlBorderColor || state.hlBorderColor;

            if (saved.bgOpacity !== undefined) state.bgOpacity = saved.bgOpacity;
            if (saved.bgImage !== undefined) state.bgImage = saved.bgImage;
            if (saved.autoUseEpubCover !== undefined) state.autoUseEpubCover = saved.autoUseEpubCover;
            if (saved.pageLoadDelay !== undefined) state.pageLoadDelay = saved.pageLoadDelay;
            if (saved.autoUpdateApp !== undefined) state.autoUpdateApp = saved.autoUpdateApp;

            if (saved.lastChapterIndex !== undefined) state.currentChapterIndex = saved.lastChapterIndex;
            if (saved.lastSentenceIndex !== undefined) state.currentSentenceIndex = saved.lastSentenceIndex;
            if (saved.lastScrollTop !== undefined) state.savedScrollTop = saved.lastScrollTop;
        }

        document.documentElement.style.setProperty('--reader-size', state.fontSize + 'px');
        document.documentElement.style.setProperty('--reader-font', state.fontFamily);

        document.body.className = state.currentTheme + ' h-full overflow-hidden select-none hl-mode-' + state.hlStyle;
        if (DOM.container) {
            DOM.container.style.fontSize = state.fontSize + 'px';
            DOM.container.style.fontFamily = state.fontFamily;
        }
        if (DOM.sliderFontSize) DOM.sliderFontSize.value = state.fontSize;
        if (DOM.labelFontSize) DOM.labelFontSize.textContent = state.fontSize + 'px';

        if (state.bgImage) {
            applyReaderBackground(state.bgImage, state.bgOpacity);
        }

        if (DOM.configPageLoadingDelay) {
            DOM.configPageLoadingDelay.value = state.pageLoadDelay;
        }
        if (DOM.switchAutoUpdate) {
            DOM.switchAutoUpdate.checked = state.autoUpdateApp;
        }
        if (DOM.switchAutoEpubCover) {
            DOM.switchAutoEpubCover.checked = state.autoUseEpubCover;
        }

        applyHighlightCustomization();
        updateFontChipsUI();
        updateMuteUI();

        if (DOM.labelReadingMode) {
            DOM.labelReadingMode.textContent = state.readingMode === 'scroll-infinite' ? 'Vô cực' : '1 Chương';
        }
        if (DOM.labelVoice) {
            DOM.labelVoice.textContent = state.currentVoiceName;
        }
        if (DOM.btnQuickSpeed) {
            DOM.btnQuickSpeed.textContent = state.playbackRate + '×';
        }

        document.querySelectorAll('.btn-voice-opt').forEach(function (b) {
            if (b.getAttribute('data-voice') === state.currentVoiceName) {
                b.className = 'btn-voice-opt touch-action py-2 rounded-xl border border-[var(--accent-color)] text-[var(--accent-color)] font-medium';
            } else {
                b.className = 'btn-voice-opt touch-action py-2 rounded-xl border border-neutral-500/20 font-medium';
            }
        });
    } catch (err) {
        console.warn("[Storage] Load settings error:", err);
    }
}

// ==========================================================================
// 8B. BACKGROUND GALLERY ENGINE (KHÔNG LƯU BÌA EPUB VÀO GALLERY)
// ==========================================================================
async function saveImageToGallery(dataUrlOrHttpUrl, type = 'url') {
    if (!dataUrlOrHttpUrl) return;
    try {
        const existing = await db.bg_gallery.where('data').equals(dataUrlOrHttpUrl).first().catch(() => null);
        if (!existing) {
            await db.bg_gallery.put({
                id: 'bg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                data: dataUrlOrHttpUrl,
                type: type,
                createdAt: Date.now()
            });
        }
    } catch (e) {
        console.warn("Lỗi lưu ảnh vào gallery:", e);
    }
}

async function renderBackgroundGallery() {
    if (!DOM_GALLERY.grid) return;

    try {
        const items = await db.bg_gallery.orderBy('createdAt').reverse().toArray();
        DOM_GALLERY.grid.innerHTML = '';

        if (DOM_GALLERY.countLabel) {
            DOM_GALLERY.countLabel.textContent = items.length;
        }

        if (items.length === 0) {
            DOM_GALLERY.grid.innerHTML = `
                <div class="col-span-4 text-center py-4 opacity-40 italic text-[11px]">
                    Chưa có ảnh/video nào được lưu
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const isCurrentActive = state.bgImage === item.data;
            const isVideo = isVideoMedia(item.data);
            const cell = document.createElement('div');
            cell.className = `relative group h-12 rounded-xl border overflow-hidden cursor-pointer bg-cover bg-center transition-all ${isCurrentActive ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/30' : 'border-neutral-500/20 hover:border-neutral-500/40'
                }`;

            if (isVideo) {
                cell.innerHTML = `
                    <video src="${item.data}" muted loop playsinline class="w-full h-full object-cover"></video>
                    <span class="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded"><i class="fa-solid fa-video"></i></span>
                `;
            } else {
                cell.style.backgroundImage = `url("${item.data}")`;
            }

            const delBtn = document.createElement('button');
            delBtn.className = "btn-del-single-bg absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600";
            delBtn.title = "Xóa mục này";
            delBtn.innerHTML = '<i class="fa-solid fa-xmark text-[9px]"></i>';
            cell.appendChild(delBtn);

            if (isCurrentActive) {
                const activeDot = document.createElement('div');
                activeDot.className = 'absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[var(--accent-color)]';
                cell.appendChild(activeDot);
            }

            cell.onclick = function (e) {
                if (e.target.closest('.btn-del-single-bg')) return;
                applyReaderBackground(item.data);
                saveProgressState();
                renderBackgroundGallery();
                showToast("Đã chọn nền!");
            };

            delBtn.onclick = async function (e) {
                e.stopPropagation();
                await db.bg_gallery.delete(item.id);
                if (state.bgImage === item.data) {
                    applyReaderBackground(null);
                    saveProgressState();
                }
                renderBackgroundGallery();
                showToast("Đã xoá khỏi bộ sưu tập!");
            };

            DOM_GALLERY.grid.appendChild(cell);
        });
    } catch (err) {
        console.warn("Lỗi render background gallery:", err);
    }
}

// ==========================================================================
// 9. TTS ENGINE & CONCURRENT BUFFERING
// ==========================================================================
async function fetchTTSAudio(text, voiceName, rate = 1.0) {
    const sanitizedText = cleanTextForTTS(text);
    if (!hasPronounceableContent(sanitizedText)) {
        throw new Error('NO_PRONOUNCEABLE_CONTENT');
    }

    const voiceMap = {
        'Hoài My': 'vi-VN-HoaiMyNeural',
        'Nam Minh': 'vi-VN-NamMinhNeural'
    };
    const voice = voiceMap[voiceName] || 'vi-VN-HoaiMyNeural';

    const rateDiff = Math.round((rate - 1.0) * 100);
    const rateStr = (rateDiff >= 0 ? '+' : '') + rateDiff + '%';

    const response = await fetch('https://be-api-service.vercel.app/api/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-App-Key': 'TTS-Hunq'
        },
        body: JSON.stringify({
            text: sanitizedText,
            voice: voice,
            rate: rateStr,
            pitch: '0Hz',
            volume: '0%'
        })
    });

    if (!response.ok) {
        throw new Error('TTS Error HTTP ' + response.status);
    }

    return await response.blob();
}

async function getOrFetchSentenceAudio(bookId, chapterIndex, sentenceIndex, text) {
    const cacheId = bookId + '-ch' + chapterIndex + '-s' + sentenceIndex + '-' + state.currentVoiceName;
    const cached = await db.sentence_audio.get(cacheId);
    if (cached && cached.audioBlob) {
        return URL.createObjectURL(cached.audioBlob);
    }

    try {
        const audioBlob = await fetchTTSAudio(text, state.currentVoiceName, state.playbackRate);
        await db.sentence_audio.put({
            id: cacheId,
            bookId: bookId,
            chapterIndex: chapterIndex,
            sentenceIndex: sentenceIndex,
            voice: state.currentVoiceName,
            audioBlob: audioBlob
        });
        return URL.createObjectURL(audioBlob);
    } catch (err) {
        throw err;
    }
}

async function runConcurrentPool(items, concurrency, taskHandler) {
    const results = [];
    const executing = [];
    for (const item of items) {
        if (state.abortBatchDownload) break;
        const p = Promise.resolve().then(function () { return taskHandler(item); });
        results.push(p);

        if (concurrency <= items.length) {
            const e = p.then(function () { return executing.splice(executing.indexOf(e), 1); });
            executing.push(e);
            if (executing.length >= concurrency) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(results);
}

async function bufferUpcomingSentences(sentences, startIndex) {
    const bufferLimit = Math.min(sentences.length, startIndex + state.autoBufferCount);
    const tasks = [];
    for (let i = startIndex; i < bufferLimit; i++) {
        const sRaw = sentences[i];
        const sClean = cleanTextForTTS(sRaw);
        if (!hasPronounceableContent(sClean)) continue;
        tasks.push({ sentenceIndex: i, text: sClean });
    }

    await runConcurrentPool(tasks, state.downloadConcurrency || 3, async function (task) {
        const cacheId = state.currentBook.id + '-ch' + state.currentChapterIndex + '-s' + task.sentenceIndex + '-' + state.currentVoiceName;
        const exists = await db.sentence_audio.get(cacheId);
        if (!exists) {
            try {
                const blob = await fetchTTSAudio(task.text, state.currentVoiceName, state.playbackRate);
                await db.sentence_audio.put({
                    id: cacheId,
                    bookId: state.currentBook.id,
                    chapterIndex: state.currentChapterIndex,
                    sentenceIndex: task.sentenceIndex,
                    voice: state.currentVoiceName,
                    audioBlob: blob
                });
            } catch (e) { }
        }
    });
}

function stopCurrentAudio() {
    if (state.activeAudioElement) {
        state.activeAudioElement.pause();
        state.activeAudioElement = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function highlightActiveSentence(shouldScroll = false) {
    document.querySelectorAll('.sentence-block.is-active').forEach(function (el) {
        el.classList.remove('is-active');
    });

    const selector = '.sentence-block[data-chapter="' + state.currentChapterIndex + '"][data-sentence="' + state.currentSentenceIndex + '"]';
    const activeEl = document.querySelector(selector);
    if (activeEl) {
        activeEl.classList.add('is-active');
        if (shouldScroll) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// ==========================================================================
// 10. PLAYBACK CONTROLLER
// ==========================================================================
async function playCurrentSentence() {
    if (!state.currentBook || state.isMuted) return;

    const chapter = await db.chapters
        .where({ bookId: state.currentBook.id, chapterIndex: state.currentChapterIndex })
        .first();

    if (!chapter) return;
    const sentences = chapter.sentences || splitSentences(chapter.content);

    if (state.currentSentenceIndex >= sentences.length) {
        if (state.currentChapterIndex < state.currentBook.totalChapters - 1) {
            state.currentChapterIndex++;
            state.currentSentenceIndex = 0;
            if (state.readingMode === 'scroll-single') {
                await renderReaderContent(false);
            } else {
                await appendInfiniteChapter(state.currentChapterIndex);
            }
            playCurrentSentence();
        } else {
            togglePlayPause(false);
            showToast("Đã đọc xong toàn bộ cuốn sách!");
        }
        saveProgressState();
        return;
    }

    const sentenceRaw = sentences[state.currentSentenceIndex] || '';
    const sentenceClean = cleanTextForTTS(sentenceRaw);

    if (!hasPronounceableContent(sentenceClean)) {
        state.currentSentenceIndex++;
        setTimeout(function () {
            if (state.isPlaying) playCurrentSentence();
        }, 15);
        saveProgressState();
        return;
    }

    highlightActiveSentence(true);
    DOM.sentenceIdxLabel.textContent = (state.currentSentenceIndex + 1) + ' / ' + sentences.length;
    saveProgressState();

    stopCurrentAudio();
    bufferUpcomingSentences(sentences, state.currentSentenceIndex + 1);

    const audio = sharedAudioElement;
    state.activeAudioElement = audio;

    try {
        const audioUrl = await getOrFetchSentenceAudio(
            state.currentBook.id,
            state.currentChapterIndex,
            state.currentSentenceIndex,
            sentenceClean
        );

        if (audioUrl) {
            audio.src = audioUrl;
            audio.playbackRate = state.playbackRate;

            audio.onended = function () {
                state.consecutiveErrors = 0;
                if (!state.isPlaying) return;
                state.currentSentenceIndex++;
                playCurrentSentence();
            };

            audio.onerror = function (e) {
                handleSentenceAudioError('Lỗi phát âm thanh', e, sentenceRaw, sentenceClean);
            };

            await audio.play();
            state.consecutiveErrors = 0;
            audioManager.setPlaybackState(true);
        } else {
            handleSentenceAudioError('Không lấy được audioUrl', null, sentenceRaw, sentenceClean);
        }
    } catch (err) {
        handleSentenceAudioError(err.message || 'Lỗi TTS Pipeline', err, sentenceRaw, sentenceClean);
    }
}

function handleSentenceAudioError(reason, errObj, rawText, cleanedText) {
    state.consecutiveErrors = (state.consecutiveErrors || 0) + 1;
    console.error(`[Audio Error #${state.consecutiveErrors}] ${reason}:`, errObj);

    if ('speechSynthesis' in window && state.consecutiveErrors <= 3) {
        try {
            const utterance = new SpeechSynthesisUtterance(cleanedText || rawText);
            utterance.lang = 'vi-VN';
            utterance.rate = state.playbackRate;
            utterance.onend = function () {
                state.consecutiveErrors = 0;
                if (!state.isPlaying) return;
                state.currentSentenceIndex++;
                playCurrentSentence();
            };
            utterance.onerror = function () { skipToNextSentenceOnError(); };
            window.speechSynthesis.speak(utterance);
            audioManager.setPlaybackState(true);
            return;
        } catch (synthCatch) { }
    }

    skipToNextSentenceOnError();
}

function skipToNextSentenceOnError() {
    if (state.consecutiveErrors >= 6) {
        showToast('Gặp nhiều lỗi âm thanh liên tiếp. Đã dừng đọc.');
        togglePlayPause(false);
        state.consecutiveErrors = 0;
        return;
    }

    showToast('Tự động bỏ qua câu ' + (state.currentSentenceIndex + 1));
    state.currentSentenceIndex++;
    setTimeout(function () {
        if (state.isPlaying) playCurrentSentence();
    }, 70);
}

function togglePlayPause(forcedState = null) {
    state.isPlaying = forcedState !== null ? forcedState : !state.isPlaying;
    audioManager.unlockAudioSession();

    if (state.isPlaying) {
        sharedAudioElement.play().then(() => {
            sharedAudioElement.pause();
        }).catch(() => { });

        if (state.isMuted) {
            state.isMuted = false;
            updateMuteUI();
        }
        playCurrentSentence();
    } else {
        stopCurrentAudio();
        audioManager.setPlaybackState(false);
    }
    updatePlayerUI();
    saveProgressState();
}

function updatePlayerUI() {
    if (state.isPlaying) {
        DOM.iconPlayState.classList.remove('fa-play');
        DOM.iconPlayState.classList.add('fa-pause');
        DOM.audioWaveBox.classList.add('is-playing');
        DOM.audioWaveBox.classList.remove('opacity-60');
        DOM.audioWaveBox.classList.add('opacity-100');
    } else {
        DOM.iconPlayState.classList.remove('fa-pause');
        DOM.iconPlayState.classList.add('fa-play');
        DOM.audioWaveBox.classList.remove('is-playing');
        DOM.audioWaveBox.classList.remove('opacity-100');
        DOM.audioWaveBox.classList.add('opacity-60');
    }
}

function skipSentence(delta) {
    stopCurrentAudio();
    state.currentSentenceIndex = Math.max(0, state.currentSentenceIndex + delta);
    highlightActiveSentence(true);
    if (state.isPlaying) {
        playCurrentSentence();
    }
    saveProgressState();
}

async function changeChapter(targetIndex) {
    if (!state.currentBook) return;
    if (targetIndex < 0 || targetIndex >= state.currentBook.totalChapters) return;

    stopCurrentAudio();
    state.currentChapterIndex = targetIndex;
    state.currentSentenceIndex = 0;
    state.savedScrollTop = 0;

    await renderReaderContent(false);
    updateChapterNavButtons();
    saveProgressState();

    if (state.isPlaying && !state.isMuted) {
        playCurrentSentence();
    }
}

// ==========================================================================
// 11. CONTENT RENDERING & DOM BUILDERS
// ==========================================================================
async function renderReaderContent(restoreScroll = false) {
    if (!state.currentBook) return;

    DOM.headerBookTitle.textContent = state.currentBook.title;
    updateChapterNavButtons();

    if (state.readingMode === 'scroll-single') {
        DOM.infiniteSentinel.classList.add('hidden');
        const chapter = await db.chapters
            .where({ bookId: state.currentBook.id, chapterIndex: state.currentChapterIndex })
            .first();

        if (chapter) {
            DOM.headerChapterTitle.textContent = chapter.title;
            DOM.container.innerHTML = buildChapterHTML(chapter);
            audioManager.updateMetadata(state.currentBook.title, chapter.title, state.currentBook.cover);

            const sentences = chapter.sentences || splitSentences(chapter.content);
            DOM.sentenceIdxLabel.textContent = (state.currentSentenceIndex + 1) + ' / ' + sentences.length;
        }
    } else {
        state.loadedInfiniteChapters.clear();
        DOM.container.innerHTML = '';
        await appendInfiniteChapter(state.currentChapterIndex);

        if (state.currentChapterIndex >= state.currentBook.totalChapters - 1) {
            DOM.infiniteSentinel.classList.add('hidden');
        } else {
            DOM.infiniteSentinel.classList.remove('hidden');
            if (DOM.infiniteSentinelText) DOM.infiniteSentinelText.textContent = "Đang nạp chương tiếp theo...";
        }
    }

    attachSentenceClickListeners();

    if (restoreScroll && state.savedScrollTop > 0) {
        state.isRestoringScroll = true;
        setTimeout(function () {
            DOM.viewport.scrollTo({ top: state.savedScrollTop, behavior: 'auto' });
            state.isRestoringScroll = false;
        }, 80);
    } else {
        highlightActiveSentence(false);
    }
}

function buildChapterHTML(chapter) {
    const paragraphs = chapter.content.split(/\n+/).filter(function (p) { return p.trim().length > 0; });
    let sentenceCounter = 0;
    let chapterBodyHTML = '';

    for (const p of paragraphs) {
        const pSentences = splitSentences(p);
        let paragraphSpans = '';

        for (const s of pSentences) {
            const sIdx = sentenceCounter++;
            paragraphSpans += '<span class="sentence-block" data-chapter="' + chapter.chapterIndex + '" data-sentence="' + sIdx + '">' + s + ' </span>';
        }

        chapterBodyHTML += '<p class="mb-4 text-justify leading-relaxed">' + paragraphSpans + '</p>';
    }

    return '<article class="chapter-wrapper py-4 border-b border-neutral-500/10 mb-4" data-chapter-index="' + chapter.chapterIndex + '">' +
        '<h1 class="text-lg sm:text-xl font-bold tracking-tight mb-4 text-center opacity-90">' + chapter.title + '</h1>' +
        '<div class="prose-content">' + chapterBodyHTML + '</div>' +
        '</article>';
}

async function appendInfiniteChapter(chapterIndex) {
    if (state.loadedInfiniteChapters.has(chapterIndex)) return;
    if (chapterIndex >= state.currentBook.totalChapters) {
        DOM.infiniteSentinel.classList.add('hidden');
        return;
    }

    const chapter = await db.chapters
        .where({ bookId: state.currentBook.id, chapterIndex: chapterIndex })
        .first();

    if (chapter) {
        state.loadedInfiniteChapters.add(chapterIndex);
        DOM.container.insertAdjacentHTML('beforeend', buildChapterHTML(chapter));
        attachSentenceClickListeners();

        if (state.loadedInfiniteChapters.size >= state.currentBook.totalChapters || chapterIndex >= state.currentBook.totalChapters - 1) {
            DOM.infiniteSentinel.classList.add('hidden');
        }
    }
}

let infiniteObserver = null;
function setupInfiniteScrollObserver() {
    if (infiniteObserver) {
        infiniteObserver.disconnect();
    }

    infiniteObserver = new IntersectionObserver(async function (entries) {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;
        if (state.readingMode !== 'scroll-infinite') return;
        if (state.isLoadingNextChapter || !state.currentBook) return;

        const maxLoaded = Math.max.apply(null, Array.from(state.loadedInfiniteChapters).concat([state.currentChapterIndex]));
        const nextChapter = maxLoaded + 1;

        if (nextChapter < state.currentBook.totalChapters) {
            state.isLoadingNextChapter = true;
            DOM.infiniteSentinel.classList.remove('hidden');
            if (DOM.infiniteSentinelText) {
                DOM.infiniteSentinelText.textContent = 'Đang nạp chương ' + (nextChapter + 1) + '...';
            }

            await sleep(160);
            await appendInfiniteChapter(nextChapter);
            state.isLoadingNextChapter = false;
        } else {
            DOM.infiniteSentinel.classList.add('hidden');
        }
    }, {
        root: DOM.viewport,
        rootMargin: '200px',
        threshold: 0.1
    });

    if (DOM.infiniteSentinel) {
        infiniteObserver.observe(DOM.infiniteSentinel);
    }
}

function attachSentenceClickListeners() {
    document.querySelectorAll('.sentence-block').forEach(function (el) {
        el.onclick = function (e) {
            e.stopPropagation();
            const cIdx = parseInt(el.getAttribute('data-chapter'), 10);
            const sIdx = parseInt(el.getAttribute('data-sentence'), 10);

            state.currentChapterIndex = cIdx;
            state.currentSentenceIndex = sIdx;
            highlightActiveSentence(false);
            saveProgressState();

            if (state.isMuted) {
                showToast("Chế độ chỉ đọc: Nhấn nút ▶ để bắt đầu nghe");
                return;
            }

            stopCurrentAudio();
            togglePlayPause(true);
        };
    });
}

// ==========================================================================
// 12. TEXT SEARCH ENGINE
// ==========================================================================
function clearSearchHighlights() {
    document.querySelectorAll('.sentence-block.search-match').forEach(function (el) {
        el.classList.remove('search-match', 'search-focus');
    });
    state.searchResults = [];
    state.currentSearchIndex = -1;
    DOM.searchResultsCounter.textContent = '0/0';
    DOM.btnSearchPrev.disabled = true;
    DOM.btnSearchNext.disabled = true;
}

function executeInBookSearch(query) {
    clearSearchHighlights();
    if (!query || query.trim().length === 0) return;

    const q = query.trim().toLowerCase();
    const sentenceBlocks = Array.from(document.querySelectorAll('.sentence-block'));
    const matches = [];

    sentenceBlocks.forEach(function (el) {
        const text = el.textContent.toLowerCase();
        if (text.includes(q)) {
            el.classList.add('search-match');
            matches.push(el);
        }
    });

    state.searchResults = matches;
    if (matches.length > 0) {
        state.currentSearchIndex = 0;
        focusSearchResult(0);
        DOM.btnSearchPrev.disabled = false;
        DOM.btnSearchNext.disabled = false;
    } else {
        showToast("Không tìm thấy kết quả phù hợp");
    }
}

function focusSearchResult(index) {
    if (state.searchResults.length === 0) return;
    if (index < 0 || index >= state.searchResults.length) return;

    state.searchResults.forEach(function (el) { el.classList.remove('search-focus'); });
    state.currentSearchIndex = index;

    const targetEl = state.searchResults[index];
    targetEl.classList.add('search-focus');
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    DOM.searchResultsCounter.textContent = (index + 1) + '/' + state.searchResults.length;

    const cIdx = parseInt(targetEl.getAttribute('data-chapter'), 10);
    const sIdx = parseInt(targetEl.getAttribute('data-sentence'), 10);
    state.currentChapterIndex = cIdx;
    state.currentSentenceIndex = sIdx;
    highlightActiveSentence(false);
    saveProgressState();
}

function openSearchAction() {
    DOM.searchBarDrawer.classList.toggle('hidden');
    if (!DOM.searchBarDrawer.classList.contains('hidden')) {
        DOM.inputSearchQuery.focus();
        if (DOM.inputSearchQuery.value.trim()) {
            executeInBookSearch(DOM.inputSearchQuery.value.trim());
        }
    }
}

// ==========================================================================
// 13. LIBRARY, TOC & OFFLINE CACHE MANAGEMENT
// ==========================================================================
async function deleteBookById(bookId, e) {
    if (e) e.stopPropagation();
    const targetBook = await db.books.get(bookId);
    if (!targetBook) return;

    const confirmed = await askConfirmation(
        "Xoá sách khỏi tủ?",
        'Bạn có chắc chắn muốn xoá cuốn "' + targetBook.title + '" và toàn bộ dữ liệu audio đi kèm?'
    );

    if (!confirmed) return;

    await db.sentence_audio.where('bookId').equals(bookId).delete();
    await db.chapters.where('bookId').equals(bookId).delete();
    await db.books.delete(bookId);

    showToast('Đã xoá cuốn "' + targetBook.title + '"');

    if (state.currentBook && state.currentBook.id === bookId) {
        const remaining = await db.books.toCollection().first();
        if (remaining) {
            state.currentBook = remaining;
            state.currentChapterIndex = remaining.currentChapter || 0;
            state.currentSentenceIndex = remaining.currentSentence || 0;
            state.savedScrollTop = remaining.scrollTop || 0;
            await renderReaderContent(true);
        } else {
            state.currentBook = null;
            state.currentChapterIndex = 0;
            state.currentSentenceIndex = 0;
            state.savedScrollTop = 0;
            DOM.headerBookTitle.textContent = "Tủ sách trống";
            DOM.headerChapterTitle.textContent = "Chưa có sách";
            DOM.container.innerHTML = '<p class="text-center opacity-50 py-12">Tủ sách trống. Vui lòng nạp file để bắt đầu.</p>';
        }
    }

    await renderLibraryList();
    await refreshStorageStats();
    saveProgressState();
}

async function renderLibraryList() {
    const books = await db.books.toArray();
    DOM.libraryBookList.innerHTML = '';

    if (books.length === 0) {
        DOM.libraryBookList.innerHTML = '<p class="text-center text-xs opacity-50 py-4">Tủ sách hiện đang trống.</p>';
        return;
    }

    books.forEach(function (b) {
        const isCurrent = state.currentBook && state.currentBook.id === b.id;
        const div = document.createElement('div');
        div.className = 'p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ' + (isCurrent ? 'border-[var(--accent-color)] bg-neutral-500/5 font-semibold' : 'border-neutral-500/15 hover:bg-neutral-500/5');

        const readingProgress = b.currentChapter ? ' (Đang đọc C.' + (b.currentChapter + 1) + ')' : '';
        const authorName = b.author || 'Tác giả';
        const checkIcon = isCurrent ? '<i class="fa-solid fa-check text-xs text-[var(--accent-color)]"></i>' : '';

        div.innerHTML = '<div class="truncate mr-2 flex-1">' +
            '<p class="text-xs truncate font-bold">' + b.title + '</p>' +
            '<p class="text-[10px] opacity-60 mt-0.5">' + authorName + ' • ' + b.totalChapters + ' chương' + readingProgress + '</p>' +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
            checkIcon +
            '<button class="btn-delete-book-row h-7 w-7 rounded flex items-center justify-center text-rose-500 hover:bg-rose-500/10 active:opacity-70" title="Xóa sách này">' +
            '<i class="fa-regular fa-trash-can text-xs"></i>' +
            '</button>' +
            '</div>';

        div.onclick = async function () {
            state.currentBook = b;
            state.currentChapterIndex = b.currentChapter || 0;
            state.currentSentenceIndex = b.currentSentence || 0;
            state.savedScrollTop = b.scrollTop || 0;
            DOM.drawerLibrary.classList.add('hidden');
            DOM.drawerLibrary.classList.remove('flex');
            await renderReaderContent(true);
            saveProgressState();
        };

        const delBtn = div.querySelector('.btn-delete-book-row');
        delBtn.onclick = function (e) { deleteBookById(b.id, e); };

        DOM.libraryBookList.appendChild(div);
    });
}

async function renderTocList() {
    if (!state.currentBook) return;
    const chapters = await db.chapters.where('bookId').equals(state.currentBook.id).sortBy('chapterIndex');
    DOM.tocChapterList.innerHTML = '';

    chapters.forEach(function (ch) {
        const isCurrent = ch.chapterIndex === state.currentChapterIndex;
        const div = document.createElement('div');
        div.className = 'py-2 px-2.5 cursor-pointer text-xs transition flex items-center justify-between ' + (isCurrent ? 'font-bold text-[var(--accent-color)] bg-neutral-500/5 rounded' : 'hover:bg-neutral-500/5 rounded opacity-80');
        const iconPlaying = isCurrent ? '<i class="fa-solid fa-headphones text-[10px]"></i>' : '';

        div.innerHTML = '<span class="truncate">' + ch.title + '</span>' + iconPlaying;

        div.onclick = async function () {
            state.currentChapterIndex = ch.chapterIndex;
            state.currentSentenceIndex = 0;
            state.savedScrollTop = 0;
            DOM.drawerToc.classList.add('hidden');
            DOM.drawerToc.classList.remove('flex');
            await renderReaderContent(false);
            if (state.isPlaying && !state.isMuted) playCurrentSentence();
            saveProgressState();
        };
        DOM.tocChapterList.appendChild(div);
    });
}

async function renderCachedChaptersList() {
    if (!state.currentBook) return;
    const chapters = await db.chapters.where('bookId').equals(state.currentBook.id).sortBy('chapterIndex');
    DOM.cachedChaptersList.innerHTML = '';

    for (const ch of chapters) {
        const cachedCount = await db.sentence_audio
            .where({ bookId: state.currentBook.id, chapterIndex: ch.chapterIndex })
            .count();
        const total = (ch.sentences || splitSentences(ch.content)).length;

        const row = document.createElement('div');
        row.className = 'ios-cell';

        const badgeClass = cachedCount > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-50';
        const delBtn = cachedCount > 0 ? '<button data-del-ch="' + ch.chapterIndex + '" class="btn-del-ch-audio text-rose-500 p-1" title="Xóa audio"><i class="fa-solid fa-trash text-xs"></i></button>' : '';

        row.innerHTML = '<span class="truncate max-w-[200px] font-medium">' + ch.title + '</span>' +
            '<div class="flex items-center gap-2">' +
            '<span class="px-2 py-0.5 rounded text-[10px] font-mono ' + badgeClass + '">' + cachedCount + ' / ' + total + '</span>' +
            delBtn +
            '</div>';

        DOM.cachedChaptersList.appendChild(row);
    }

    document.querySelectorAll('.btn-del-ch-audio').forEach(function (btn) {
        btn.onclick = async function () {
            const chIdx = parseInt(btn.getAttribute('data-del-ch'), 10);
            await db.sentence_audio
                .where({ bookId: state.currentBook.id, chapterIndex: chIdx })
                .delete();
            showToast('Đã xoá audio chương ' + (chIdx + 1));
            await renderCachedChaptersList();
            await refreshStorageStats();
        };
    });
}

async function refreshStorageStats() {
    const bookCount = await db.books.count();
    const sentenceAudioCount = await db.sentence_audio.count();

    DOM.statBooks.textContent = bookCount;
    DOM.statChapters.textContent = sentenceAudioCount;

    if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const mb = (est.usage / (1024 * 1024)).toFixed(1);
        DOM.statBytes.textContent = mb + ' MB';
    } else {
        DOM.statBytes.textContent = (sentenceAudioCount * 0.04).toFixed(1) + ' MB';
    }

    if (state.currentBook) {
        DOM.editBookTitle.value = state.currentBook.title;
        DOM.editBookAuthor.value = state.currentBook.author || '';
        DOM.inputRangeTo.value = state.currentBook.totalChapters;
    }
}

// ==========================================================================
// 14. FILE PARSING & IMPORT (EPUB, TXT & PHỤC HỒI CHỌN LỌC .TBZ)
// ==========================================================================
function normalizeZipPath(path) {
    const parts = path.split('/');
    const stack = [];
    for (const part of parts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
            if (stack.length > 0) stack.pop();
        } else {
            stack.push(part);
        }
    }
    return stack.join('/');
}

async function extractEpubCover(zip, opfDoc, opfDir) {
    try {
        let coverHref = null;
        const coverMeta = opfDoc.querySelector('meta[name="cover"]');
        if (coverMeta) {
            const coverId = coverMeta.getAttribute('content');
            const item = opfDoc.querySelector(`manifest > item[id="${coverId}"]`);
            if (item) coverHref = item.getAttribute('href');
        }
        if (!coverHref) {
            const item = opfDoc.querySelector('manifest > item[properties*="cover-image"]');
            if (item) coverHref = item.getAttribute('href');
        }

        if (coverHref) {
            const resolvedPath = normalizeZipPath(opfDir + coverHref);
            const coverFile = zip.file(resolvedPath) || zip.file(coverHref);
            if (coverFile) {
                const blob = await coverFile.async('blob');
                return URL.createObjectURL(blob);
            }
        }
    } catch (e) {
        console.warn("Lỗi trích xuất cover EPUB:", e);
    }
    return null;
}

async function parseEpubFile(file) {
    const zip = await JSZip.loadAsync(file);

    const containerXmlFile = zip.file("META-INF/container.xml");
    if (!containerXmlFile) {
        throw new Error("Tệp EPUB không hợp lệ (thiếu container.xml).");
    }
    const containerXmlText = await containerXmlFile.async("string");
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXmlText, "text/xml");
    const rootfileEl = containerDoc.querySelector("rootfile");
    if (!rootfileEl) {
        throw new Error("Không tìm thấy rootfile trong container.xml.");
    }
    const opfPath = rootfileEl.getAttribute("full-path");
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
        throw new Error("Không tìm thấy tệp OPF: " + opfPath);
    }

    const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
    const opfText = await opfFile.async("string");
    const opfDoc = parser.parseFromString(opfText, "text/xml");

    const titleEl = opfDoc.querySelector("title");
    const creatorEl = opfDoc.querySelector("creator");
    const bookTitle = titleEl ? titleEl.textContent.trim() : file.name.replace(/\.epub$/i, "");
    const bookAuthor = creatorEl ? creatorEl.textContent.trim() : "Tác giả EPUB";

    const extractedCover = await extractEpubCover(zip, opfDoc, opfDir);

    const manifestItems = {};
    opfDoc.querySelectorAll("manifest > item").forEach(function (item) {
        manifestItems[item.getAttribute("id")] = item.getAttribute("href");
    });

    const itemRefs = opfDoc.querySelectorAll("spine > itemref");
    const chapters = [];
    const bookId = 'book-' + Date.now();
    let chapterIndex = 0;

    for (const itemRef of itemRefs) {
        const idref = itemRef.getAttribute("idref");
        const href = manifestItems[idref];
        if (!href) continue;

        const resolvedPath = normalizeZipPath(opfDir + href);
        const chapterFile = zip.file(resolvedPath) || zip.file(href);
        if (!chapterFile) continue;

        const htmlContent = await chapterFile.async("string");
        const htmlDoc = parser.parseFromString(htmlContent, "text/html");

        htmlDoc.querySelectorAll("script, style, noscript, svg, nav").forEach(function (el) { el.remove(); });

        let chTitle = "";
        const h1 = htmlDoc.querySelector("h1, h2, h3");
        if (h1 && h1.textContent.trim()) {
            chTitle = h1.textContent.trim().slice(0, 80);
        } else {
            const docTitle = htmlDoc.querySelector("title");
            if (docTitle && docTitle.textContent.trim()) {
                chTitle = docTitle.textContent.trim().slice(0, 80);
            }
        }

        const blockElements = htmlDoc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, blockquote, li");
        let chapterText = "";
        if (blockElements.length > 0) {
            const paragraphs = [];
            blockElements.forEach(function (el) {
                const t = el.textContent.trim();
                if (t.length > 0) {
                    paragraphs.push(t);
                }
            });
            chapterText = paragraphs.join("\n\n");
        } else {
            chapterText = htmlDoc.body ? htmlDoc.body.textContent.trim() : "";
        }

        if (chapterText.trim().length > 25) {
            if (!chTitle) {
                chTitle = 'Chương ' + (chapterIndex + 1);
            }
            chapters.push({
                id: bookId + '-ch-' + chapterIndex,
                bookId: bookId,
                chapterIndex: chapterIndex,
                title: chTitle,
                content: chapterText.trim(),
                sentences: splitSentences(chapterText.trim())
            });
            chapterIndex++;
        }
    }

    if (chapters.length === 0) {
        throw new Error("Không thể trích xuất văn bản từ tệp EPUB này.");
    }

    return {
        book: {
            id: bookId,
            title: bookTitle,
            author: bookAuthor,
            cover: extractedCover || 'https://placehold.co/400x600/2563eb/ffffff?text=EPUB',
            totalChapters: chapters.length,
            currentChapter: 0,
            currentSentence: 0,
            scrollTop: 0,
            createdAt: Date.now()
        },
        chapters: chapters
    };
}

// Biến lưu tạm dữ liệu zip TBZ đang chờ người dùng chọn mục để nhập
let pendingTbzZip = null;

// Hộp thoại phục hồi chọn lọc file TBZ
function promptSelectiveTbzImport(zip, fileName) {
    pendingTbzZip = zip;
    const modal = document.getElementById('modal-tbz-restore');
    if (!modal) return;

    let booksCount = 0;
    let audioCount = 0;
    let galleryCount = 0;

    try {
        const manifestFile = zip.file('manifest.json');
        if (manifestFile) {
            manifestFile.async('string').then(str => {
                const meta = JSON.parse(str);
                document.getElementById('tbz-count-books').textContent = meta.booksCount || 0;
                document.getElementById('tbz-count-audio').textContent = meta.audioCount || 0;
                document.getElementById('tbz-count-gallery').textContent = meta.galleryCount || 0;
            });
        }
    } catch (e) { }

    document.getElementById('tbz-info-filename').textContent = fileName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Thực thi phục hồi các mục đã đánh dấu chọn
async function executeSelectiveTbzImport() {
    const zip = pendingTbzZip;
    if (!zip) return;

    const optBooks = document.getElementById('tbz-opt-books').checked;
    const optSettings = document.getElementById('tbz-opt-settings').checked;
    const optGallery = document.getElementById('tbz-opt-gallery').checked;
    const optAudio = document.getElementById('tbz-opt-audio').checked;

    const modal = document.getElementById('modal-tbz-restore');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    showToast("Đang phục hồi dữ liệu đã chọn...");

    try {
        // 1. Phục hồi Sách & Chương
        if (optBooks) {
            if (zip.file('books.json')) {
                const books = JSON.parse(await zip.file('books.json').async('string'));
                for (const b of books) await db.books.put(b);
            }
            if (zip.file('chapters.json')) {
                const chapters = JSON.parse(await zip.file('chapters.json').async('string'));
                for (const c of chapters) await db.chapters.put(c);
            }
        }

        // 2. Phục hồi Cài đặt & Tùy biến
        if (optSettings) {
            if (zip.file('settings.json')) {
                const settings = JSON.parse(await zip.file('settings.json').async('string'));
                for (const s of settings) await db.settings.put(s);
            }
        }

        // 3. Phục hồi Bộ sưu tập hình ảnh, GIF & Video nền
        if (optGallery) {
            if (zip.file('gallery.json')) {
                const galleryItems = JSON.parse(await zip.file('gallery.json').async('string'));
                for (const g of galleryItems) {
                    if (g.isAttachment && g.storagePath) {
                        const mediaFile = zip.file(g.storagePath);
                        if (mediaFile) {
                            const blob = await mediaFile.async('blob');
                            const reader = new FileReader();
                            const dataUrl = await new Promise(res => {
                                reader.onload = () => res(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            await db.bg_gallery.put({
                                id: g.id,
                                data: dataUrl,
                                type: g.type,
                                createdAt: g.createdAt || Date.now()
                            });
                        }
                    } else {
                        await db.bg_gallery.put({
                            id: g.id,
                            data: g.data,
                            type: g.type,
                            createdAt: g.createdAt || Date.now()
                        });
                    }
                }
            }
        }

        // 4. Phục hồi Âm thanh ngoại tuyến
        if (optAudio) {
            if (zip.file('audio_index.json')) {
                const audioMeta = JSON.parse(await zip.file('audio_index.json').async('string'));
                for (const meta of audioMeta) {
                    const audioFile = zip.file('audio/' + meta.fileName);
                    if (audioFile) {
                        const blob = await audioFile.async('blob');
                        await db.sentence_audio.put({
                            id: meta.id,
                            bookId: meta.bookId,
                            chapterIndex: meta.chapterIndex,
                            sentenceIndex: meta.sentenceIndex,
                            voice: meta.voice,
                            audioBlob: blob
                        });
                    }
                }
            }
        }

        showToast("Khôi phục bản sao lưu thành công!");
        pendingTbzZip = null;
        await initApp();
    } catch (err) {
        console.error("Lỗi phục hồi TBZ:", err);
        showToast("Lỗi nhập file TBZ: " + err.message);
    }
}

// 1. Xử lý mở file khi bấm vào dropzone
const dropzoneLibrary = document.getElementById('dropzone-library');
if (dropzoneLibrary) {
    dropzoneLibrary.onclick = () => DOM.fileInput.click();

    // Ngăn chặn hành vi mở file mặc định của trình duyệt
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzoneLibrary.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Hiệu ứng khi kéo file qua vùng dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzoneLibrary.addEventListener(eventName, () => {
            dropzoneLibrary.classList.add('border-[var(--accent-color)]', 'bg-neutral-500/10');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzoneLibrary.addEventListener(eventName, () => {
            dropzoneLibrary.classList.remove('border-[var(--accent-color)]', 'bg-neutral-500/10');
        }, false);
    });

    // Xử lý khi thả file vào
    dropzoneLibrary.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleImportFile(files[0]);
        }
    }, false);
}

// 2. Cập nhật hàm handleImportFile để kiểm tra file mượt mà hơn
async function handleImportFile(file) {
    if (!file) return;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.epub')) {
        showToast("Đang nạp file EPUB...");
        try {
            const parsed = await parseEpubFile(file);
            await db.books.put(parsed.book);
            for (const ch of parsed.chapters) {
                await db.chapters.put(ch);
            }

            state.currentBook = parsed.book;
            state.currentChapterIndex = 0;
            state.currentSentenceIndex = 0;
            state.savedScrollTop = 0;

            if (state.autoUseEpubCover && parsed.book.cover && !parsed.book.cover.includes('placehold.co')) {
                applyReaderBackground(parsed.book.cover, state.bgOpacity);
            }

            await renderReaderContent(false);
            await renderLibraryList();
            saveProgressState();
            showToast('Đã nạp EPUB: "' + parsed.book.title + '"');
        } catch (err) {
            console.error("Import EPUB error:", err);
            showToast("Lỗi nạp EPUB: " + err.message);
        }
    } else if (fileName.endsWith('.tbz')) {
        try {
            showToast("Đang đọc gói .TBZ...");
            const zip = await JSZip.loadAsync(file);
            promptSelectiveTbzImport(zip, file.name);
        } catch (err) {
            console.error("Lỗi đọc file TBZ:", err);
            showToast("File .TBZ không hợp lệ hoặc bị hỏng!");
        }
    } else if (fileName.endsWith('.txt')) {
        const text = await file.text();
        const bookId = 'book-' + Date.now();
        const title = file.name.replace(/\.[^/.]+$/, "");

        const rawChapters = text.split(/(?=Chương\s+\d+|Hồi\s+\d+|Tiết\s+\d+)/i);
        const chapterList = [];

        if (rawChapters.length <= 1) {
            chapterList.push({
                id: bookId + '-ch-0',
                bookId: bookId,
                chapterIndex: 0,
                title: title,
                content: text,
                sentences: splitSentences(text)
            });
        } else {
            rawChapters.forEach(function (chText, idx) {
                if (chText.trim().length > 0) {
                    const lines = chText.trim().split('\n');
                    const chTitle = lines[0].slice(0, 60);
                    chapterList.push({
                        id: bookId + '-ch-' + idx,
                        bookId: bookId,
                        chapterIndex: idx,
                        title: chTitle || ('Chương ' + (idx + 1)),
                        content: chText.trim(),
                        sentences: splitSentences(chText.trim())
                    });
                }
            });
        }

        const newBook = {
            id: bookId,
            title: title,
            author: 'Sưu tầm',
            cover: 'https://placehold.co/400x600/2563eb/ffffff?text=Book',
            totalChapters: chapterList.length,
            currentChapter: 0,
            currentSentence: 0,
            scrollTop: 0,
            createdAt: Date.now()
        };

        await db.books.put(newBook);
        for (const ch of chapterList) {
            await db.chapters.put(ch);
        }

        state.currentBook = newBook;
        state.currentChapterIndex = 0;
        state.currentSentenceIndex = 0;
        state.savedScrollTop = 0;

        await renderReaderContent(false);
        await renderLibraryList();
        saveProgressState();
        showToast("Đã nạp file văn bản thành công!");
    } else {
        // Dự phòng cho trường hợp file .tbz bị đổi tên hoặc tệp zip sao lưu khác
        try {
            const zip = await JSZip.loadAsync(file);
            promptSelectiveTbzImport(zip, file.name);
        } catch (e) {
            showToast("Định dạng file không được hỗ trợ (cần .epub, .txt, .tbz)");
        }
    }

    // Reset giá trị input để có thể chọn lại cùng một file nếu cần
    if (DOM.fileInput) DOM.fileInput.value = '';
}


// ==========================================================================
// 15. BATCH DOWNLOAD & ARCHIVE EXPORT (.TBZ SAO LƯU TOÀN DIỆN CẢ MEDIA)
// ==========================================================================
async function runBatchDownload() {
    if (!state.currentBook || state.isBatchDownloading) return;

    const scope = DOM.storageDownloadScope.value;
    const targetVoice = DOM.storageSelectVoice.value;
    const threads = parseInt(DOM.storageDownloadConcurrency.value, 10) || 3;
    state.downloadConcurrency = threads;

    let targetChapters = [];
    const allChapters = await db.chapters.where('bookId').equals(state.currentBook.id).sortBy('chapterIndex');

    if (scope === 'chapter') {
        const ch = allChapters.find(function (c) { return c.chapterIndex === state.currentChapterIndex; });
        if (ch) targetChapters = [ch];
    } else if (scope === 'all') {
        targetChapters = allChapters;
    } else if (scope === 'range') {
        const from = Math.max(1, parseInt(DOM.inputRangeFrom.value, 10)) - 1;
        const to = Math.min(allChapters.length, parseInt(DOM.inputRangeTo.value, 10)) - 1;
        targetChapters = allChapters.filter(function (c) { return c.chapterIndex >= from && c.chapterIndex <= to; });
    }

    if (targetChapters.length === 0) {
        showToast("Không tìm thấy chương nào trong phạm vi chọn!");
        return;
    }

    const downloadTasks = [];
    targetChapters.forEach(function (c) {
        const sList = c.sentences || splitSentences(c.content);
        for (let i = 0; i < sList.length; i++) {
            const sClean = cleanTextForTTS(sList[i]);
            if (hasPronounceableContent(sClean)) {
                downloadTasks.push({
                    chapterIndex: c.chapterIndex,
                    sentenceIndex: i,
                    chapterTitle: c.title,
                    cleanText: sClean
                });
            }
        }
    });

    const totalSentencesCount = downloadTasks.length;
    if (totalSentencesCount === 0) {
        showToast("Không có câu nào cần tải!");
        return;
    }

    state.isBatchDownloading = true;
    state.abortBatchDownload = false;
    DOM.downloadProgressCard.classList.remove('hidden');
    DOM.btnStartBatchDownload.disabled = true;
    DOM.btnStartBatchDownload.classList.add('opacity-50');

    let processedSentences = 0;
    DOM.dlProgressBarFill.style.width = '0%';
    DOM.dlStatusPercent.textContent = '0%';
    DOM.dlCountText.textContent = '0 / ' + totalSentencesCount + ' câu';

    await runConcurrentPool(downloadTasks, threads, async function (item) {
        if (state.abortBatchDownload) return;

        DOM.dlStatusText.textContent = '[' + threads + ' luồng] ' + item.chapterTitle;
        const cacheId = state.currentBook.id + '-ch' + item.chapterIndex + '-s' + item.sentenceIndex + '-' + targetVoice;
        const existing = await db.sentence_audio.get(cacheId);

        if (!existing) {
            try {
                const blob = await fetchTTSAudio(item.cleanText, targetVoice, 1.0);
                await db.sentence_audio.put({
                    id: cacheId,
                    bookId: state.currentBook.id,
                    chapterIndex: item.chapterIndex,
                    sentenceIndex: item.sentenceIndex,
                    voice: targetVoice,
                    audioBlob: blob
                });
            } catch (err) {
                console.warn('[BatchDL] Lỗi C.' + item.chapterIndex + ' S.' + item.sentenceIndex + ':', err);
            }
        }

        processedSentences++;
        const percent = Math.min(100, Math.round((processedSentences / totalSentencesCount) * 100));
        DOM.dlProgressBarFill.style.width = percent + '%';
        DOM.dlStatusPercent.textContent = percent + '%';
        DOM.dlCountText.textContent = processedSentences + ' / ' + totalSentencesCount + ' câu';
    });

    state.isBatchDownloading = false;
    DOM.btnStartBatchDownload.disabled = false;
    DOM.btnStartBatchDownload.classList.remove('opacity-50');

    if (state.abortBatchDownload) {
        showToast("Đã dừng tiến trình tải.");
        DOM.dlStatusText.textContent = "Đã dừng tải.";
    } else {
        showToast('Tải xong ' + totalSentencesCount + ' câu!');
        DOM.dlStatusText.textContent = "Hoàn tất 100%";
    }

    await refreshStorageStats();
    await renderCachedChaptersList();
    saveProgressState();
}

async function exportSingleChapterAudio() {
    if (!state.currentBook) return;

    const ext = DOM.storageSelectExt.value;
    const chapter = await db.chapters
        .where({ bookId: state.currentBook.id, chapterIndex: state.currentChapterIndex })
        .first();

    if (!chapter) return;
    showToast("Đang chuẩn bị ghép file audio...");

    const sentences = chapter.sentences || splitSentences(chapter.content);
    const blobs = [];

    for (let i = 0; i < sentences.length; i++) {
        const sClean = cleanTextForTTS(sentences[i]);
        if (!hasPronounceableContent(sClean)) continue;

        const cacheId = state.currentBook.id + '-ch' + chapter.chapterIndex + '-s' + i + '-' + state.currentVoiceName;
        let record = await db.sentence_audio.get(cacheId);

        if (!record || !record.audioBlob) {
            try {
                const fetched = await fetchTTSAudio(sClean, state.currentVoiceName, 1.0);
                blobs.push(fetched);
            } catch (e) { }
        } else {
            blobs.push(record.audioBlob);
        }
    }

    if (blobs.length === 0) {
        showToast("Không có dữ liệu âm thanh để xuất!");
        return;
    }

    const mimeType = ext === 'mp3' ? 'audio/mpeg' : (ext === 'ogg' ? 'audio/ogg' : 'audio/webm');
    const mergedBlob = new Blob(blobs, { type: mimeType });
    const downloadUrl = URL.createObjectURL(mergedBlob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = state.currentBook.title + '_' + chapter.title + '.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    showToast('Đã xuất file ' + ext.toUpperCase() + '!');
}

// XUẤT SAO LƯU HOÀN CHỈNH: SÁCH, CHƯƠNG, SETTING, MEDIA NỀN VÀ AUDIO
async function exportFullTbzArchive() {
    showToast("Đang đóng gói file sao lưu .TBZ đầy đủ...");
    const zip = new JSZip();

    const booksData = await db.books.toArray();
    const chaptersData = await db.chapters.toArray();
    const settingsData = await db.settings.toArray();
    const audioRecords = await db.sentence_audio.toArray();
    const galleryRecords = await db.bg_gallery.toArray();

    // Đóng gói tệp nền hình/GIF/video
    const mediaFolder = zip.folder('media');
    const packagedGallery = [];

    for (let i = 0; i < galleryRecords.length; i++) {
        const item = galleryRecords[i];
        if (item.data && item.data.startsWith('data:')) {
            const extMatch = item.data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
            const mime = extMatch ? extMatch[1] : 'image/png';
            const base64Content = item.data.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
            const ext = mime.split('/')[1] || 'bin';
            const fileName = `bg_${i}.${ext}`;
            mediaFolder.file(fileName, base64Content, { base64: true });

            packagedGallery.push({
                id: item.id,
                type: item.type,
                isAttachment: true,
                storagePath: `media/${fileName}`,
                createdAt: item.createdAt
            });
        } else {
            packagedGallery.push(item);
        }
    }

    const manifest = {
        version: "4.0",
        exportDate: new Date().toISOString(),
        booksCount: booksData.length,
        chaptersCount: chaptersData.length,
        audioCount: audioRecords.length,
        galleryCount: galleryRecords.length
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('books.json', JSON.stringify(booksData));
    zip.file('chapters.json', JSON.stringify(chaptersData));
    zip.file('settings.json', JSON.stringify(settingsData));
    zip.file('gallery.json', JSON.stringify(packagedGallery));

    // Đóng gói âm thanh ngoại tuyến
    const audioFolder = zip.folder('audio');
    const audioMeta = [];

    for (let i = 0; i < audioRecords.length; i++) {
        const item = audioRecords[i];
        if (item.audioBlob) {
            const fileName = 'audio_' + i + '.bin';
            audioFolder.file(fileName, item.audioBlob);
            audioMeta.push({
                id: item.id,
                bookId: item.bookId,
                chapterIndex: item.chapterIndex,
                sentenceIndex: item.sentenceIndex,
                voice: item.voice,
                fileName: fileName
            });
        }
    }

    zip.file('audio_index.json', JSON.stringify(audioMeta));

    const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    // Hàm tạo chuỗi DDMMYY từ thời gian hiện tại
    const getDDMMYY = () => {
        const d = new Date(Date.now());
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0
        const year = String(d.getFullYear()).slice(-2); // Lấy 2 chữ số cuối của năm
        return `${day}${month}${year}`;
    };

    // Cập nhật câu lệnh của bạn:
    a.download = `TNT_Backup_${getDDMMYY()}.tbz`; document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Đã xuất bản sao lưu .TBZ đầy đủ!");
}

// ==========================================================================
// 16. EVENT LISTENERS SETUP
// ==========================================================================
DOM.btnPrevChapter.onclick = function () { changeChapter(state.currentChapterIndex - 1); };
DOM.btnNextChapter.onclick = function () { changeChapter(state.currentChapterIndex + 1); };

function scrollToTop() {
    DOM.viewport.scrollTo({ top: 0, behavior: 'smooth' });
}
if (DOM.btnOnTop) DOM.btnOnTop.onclick = scrollToTop;
if (DOM.btnOnTopMobile) DOM.btnOnTopMobile.onclick = scrollToTop;

if (DOM.btnDevLogDesktop) DOM.btnDevLogDesktop.onclick = openDevLogModal;
if (DOM.btnDevLogMobile) DOM.btnDevLogMobile.onclick = openDevLogModal;

if (DOM.btnDevLogCopy) DOM.btnDevLogCopy.onclick = () => DevLogger.copy();
if (DOM.btnDevLogClear) DOM.btnDevLogClear.onclick = () => DevLogger.clear();

if (DOM.btnDevLogEval && DOM.inputDevLog) {
    DOM.btnDevLogEval.onclick = () => {
        DevLogger.evalCode(DOM.inputDevLog.value);
        DOM.inputDevLog.value = '';
    };
    DOM.inputDevLog.onkeydown = (e) => {
        if (e.key === 'Enter') {
            DevLogger.evalCode(DOM.inputDevLog.value);
            DOM.inputDevLog.value = '';
        }
    };
}

DOM.btnToggleHud.onclick = function (e) {
    e.stopPropagation();
    DOM.app.classList.toggle('ui-hidden');
    const isHidden = DOM.app.classList.contains('ui-hidden');
    showToast(isHidden ? "Đã ẩn thanh công cụ (F)" : "Đã hiện thanh công cụ");
};

DOM.btnMuteToggle.onclick = function () {
    state.isMuted = !state.isMuted;
    updateMuteUI();
    if (state.isMuted) {
        if (state.isPlaying) togglePlayPause(false);
        showToast("Đã bật chế độ Chỉ Đọc (Tắt tiếng)");
    } else {
        showToast("Đã bật chế độ Nghe (Phát tiếng)");
    }
    saveProgressState();
};

const btnMuteMobile = document.getElementById('btn-mute-toggle-mobile');
if (btnMuteMobile) {
    btnMuteMobile.onclick = function () {
        DOM.btnMuteToggle.click();
    };
}

DOM.btnReadingMode.onclick = function () {
    if (state.readingMode === 'scroll-single') {
        state.readingMode = 'scroll-infinite';
        DOM.labelReadingMode.textContent = 'Vô cực';
        showToast("Chế độ: Cuộn Vô Cực");
    } else {
        state.readingMode = 'scroll-single';
        DOM.labelReadingMode.textContent = '1 Chương';
        showToast("Chế độ: Cuộn 1 Chương");
    }
    saveProgressState();
    renderReaderContent(false);
};

DOM.btnPlayPause.onclick = function () { togglePlayPause(); };
DOM.btnPrevSentence.onclick = function () { skipSentence(-1); };
DOM.btnNextSentence.onclick = function () { skipSentence(1); };

const SPEEDS = [0.8, 1.0, 1.25, 1.5, 2.0];
DOM.btnQuickSpeed.onclick = function () {
    let idx = SPEEDS.indexOf(state.playbackRate);
    idx = (idx + 1) % SPEEDS.length;
    state.playbackRate = SPEEDS[idx];
    DOM.btnQuickSpeed.textContent = state.playbackRate + '×';
    if (state.activeAudioElement) state.activeAudioElement.playbackRate = state.playbackRate;
    showToast('Tốc độ: ' + state.playbackRate + '×');
    saveProgressState();
};

DOM.btnLibrary.onclick = function () {
    renderLibraryList();
    DOM.drawerLibrary.classList.remove('hidden');
    DOM.drawerLibrary.classList.add('flex');
};

DOM.btnToc.onclick = function () {
    renderTocList();
    DOM.drawerToc.classList.remove('hidden');
    DOM.drawerToc.classList.add('flex');
};

const btnTocMobile = document.getElementById('btn-toc-mobile');
if (btnTocMobile) {
    btnTocMobile.onclick = function () {
        DOM.btnToc.click();
    };
}

DOM.btnAaOpen.onclick = function () {
    DOM.modalTypography.classList.remove('hidden');
    DOM.modalTypography.classList.add('flex');
    renderBackgroundGallery();
};

DOM.btnStorageModal.onclick = async function () {
    await refreshStorageStats();
    await renderCachedChaptersList();
    DOM.modalStorage.classList.remove('hidden');
    DOM.modalStorage.classList.add('flex');
};

document.querySelectorAll('.btn-close-drawer').forEach(function (btn) {
    btn.onclick = function () {
        document.querySelectorAll('#drawer-library, #drawer-toc, #modal-typography, #modal-storage, #modal-devlog, #modal-changelog, #modal-tbz-restore').forEach(function (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
        });
    };
});

['drawer-library', 'drawer-toc', 'modal-storage', 'modal-devlog', 'modal-changelog', 'modal-tbz-restore'].forEach(function (id) {
    const modalEl = document.getElementById(id);
    if (modalEl) {
        modalEl.addEventListener('click', function (e) {
            if (e.target === modalEl) {
                modalEl.classList.add('hidden');
                modalEl.classList.remove('flex');
            }
        });
    }
});

const modalTypo = document.getElementById('modal-typography');
if (modalTypo) {
    modalTypo.addEventListener('click', function (e) {
        if (e.target === modalTypo) {
            modalTypo.classList.add('hidden');
            modalTypo.classList.remove('flex');
        }
    });
}

// Điều hướng 4 Tab con trong Modal aA
const typoSubtabs = [
    { btn: document.getElementById('typo-tab-btn-text'), pane: document.getElementById('typo-tab-pane-text') },
    { btn: document.getElementById('typo-tab-btn-hl'), pane: document.getElementById('typo-tab-pane-hl') },
    { btn: document.getElementById('typo-tab-btn-bg'), pane: document.getElementById('typo-tab-pane-bg') },
    { btn: document.getElementById('typo-tab-btn-voice'), pane: document.getElementById('typo-tab-pane-voice') }
];

typoSubtabs.forEach(function (tab) {
    if (!tab.btn || !tab.pane) return;
    tab.btn.onclick = function () {
        typoSubtabs.forEach(function (t) {
            if (t.btn && t.pane) {
                t.btn.className = 'typo-subtab-btn py-1.5 rounded-lg opacity-60 hover:opacity-100';
                t.pane.classList.add('hidden');
            }
        });
        tab.btn.className = 'typo-subtab-btn py-1.5 rounded-lg bg-[var(--bar-bg)] text-[var(--accent-color)] shadow-sm font-semibold';
        tab.pane.classList.remove('hidden');

        if (tab.btn.id === 'typo-tab-btn-bg') {
            renderBackgroundGallery();
        }
    };
});

document.querySelectorAll('.btn-theme-select').forEach(function (btn) {
    btn.onclick = function () {
        state.currentTheme = btn.getAttribute('data-theme');
        document.body.className = state.currentTheme + ' h-full overflow-hidden select-none hl-mode-' + state.hlStyle;
        showToast('Chủ đề: ' + btn.textContent.trim());
        saveProgressState();
    };
});

DOM.sliderFontSize.oninput = function (e) {
    state.fontSize = parseInt(e.target.value, 10);
    DOM.labelFontSize.textContent = state.fontSize + 'px';
    document.documentElement.style.setProperty('--reader-size', state.fontSize + 'px');
    if (DOM.container) DOM.container.style.fontSize = state.fontSize + 'px';
    saveProgressState();
};

document.querySelectorAll('.btn-font-chip').forEach(function (btn) {
    btn.onclick = function () {
        state.fontFamily = btn.getAttribute('data-font');
        state.customFontFamily = null;
        document.documentElement.style.setProperty('--reader-font', state.fontFamily);
        if (DOM.container) DOM.container.style.fontFamily = state.fontFamily;
        updateFontChipsUI();
        saveProgressState();
    };
});

const inputGoogleFont = document.getElementById('input-custom-google-font');
const btnApplyGoogleFont = document.getElementById('btn-apply-google-font');

if (btnApplyGoogleFont && inputGoogleFont) {
    btnApplyGoogleFont.onclick = function () {
        const val = inputGoogleFont.value.trim();
        if (val) loadGoogleFont(val);
    };
    inputGoogleFont.onkeydown = function (e) {
        if (e.key === 'Enter') btnApplyGoogleFont.click();
    };
}

// Xử lý Hình nền và Độ mờ
const btnUseCoverArt = document.getElementById('btn-use-cover-art');
const btnClearBgImage = document.getElementById('btn-clear-bg-image');

if (DOM.sliderBgOpacity) {
    DOM.sliderBgOpacity.oninput = function (e) {
        const val = parseInt(e.target.value, 10);
        state.bgOpacity = val / 100;
        if (DOM.labelBgOpacity) DOM.labelBgOpacity.textContent = val + '%';
        if (DOM.readerBgOverlay) DOM.readerBgOverlay.style.opacity = state.bgImage && !isVideoMedia(state.bgImage) ? state.bgOpacity : '0';
        if (DOM.readerBgVideo) DOM.readerBgVideo.style.opacity = state.bgImage && isVideoMedia(state.bgImage) ? state.bgOpacity : '0';
        saveProgressState();
    };
}

// Tải ảnh/GIF/video từ máy và lưu vào Gallery
if (DOM_GALLERY.btnTriggerFiles && DOM_GALLERY.inputFiles) {
    DOM_GALLERY.btnTriggerFiles.onclick = () => DOM_GALLERY.inputFiles.click();

    DOM_GALLERY.inputFiles.onchange = async function (e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        showToast(`Đang nạp ${files.length} tệp...`);
        for (const file of files) {
            await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = async function (evt) {
                    const base64Data = evt.target.result;
                    await saveImageToGallery(base64Data, file.type.startsWith('video') ? 'video' : 'file');
                    applyReaderBackground(base64Data);
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }

        saveProgressState();
        await renderBackgroundGallery();
        showToast(`Đã lưu ${files.length} tệp vào bộ sưu tập!`);
        DOM_GALLERY.inputFiles.value = '';
    };
}

if (DOM_GALLERY.btnToggleBatchUrl && DOM_GALLERY.trayBatchUrl) {
    DOM_GALLERY.btnToggleBatchUrl.onclick = function () {
        DOM_GALLERY.trayBatchUrl.classList.toggle('hidden');
    };
}

if (DOM_GALLERY.btnApplyBatchUrls && DOM_GALLERY.textareaBatchUrls) {
    DOM_GALLERY.btnApplyBatchUrls.onclick = async function () {
        const rawText = DOM_GALLERY.textareaBatchUrls.value.trim();
        if (!rawText) return;

        const urls = rawText.split('\n').map(u => u.trim()).filter(u => u.length > 5);
        if (urls.length === 0) return;

        showToast(`Đang lưu ${urls.length} liên kết...`);
        for (const url of urls) {
            await saveImageToGallery(url, isVideoMedia(url) ? 'video' : 'url');
        }

        applyReaderBackground(urls[0]);
        saveProgressState();
        await renderBackgroundGallery();

        DOM_GALLERY.textareaBatchUrls.value = '';
        DOM_GALLERY.trayBatchUrl.classList.add('hidden');
        showToast(`Đã thêm ${urls.length} tệp vào bộ sưu tập!`);
    };
}

// Chọn ảnh bìa EPUB làm nền thủ công
if (btnUseCoverArt) {
    btnUseCoverArt.onclick = function () {
        if (state.currentBook && state.currentBook.cover && !state.currentBook.cover.includes('placehold.co')) {
            applyReaderBackground(state.currentBook.cover);
            saveProgressState();
            showToast("Đã đặt bìa EPUB làm hình nền!");
        } else {
            showToast("Cuốn sách này không có ảnh bìa hợp lệ.");
        }
    };
}

// Công tắc Bật/Tắt tự động lấy bìa EPUB
if (DOM.switchAutoEpubCover) {
    DOM.switchAutoEpubCover.onchange = function (e) {
        state.autoUseEpubCover = e.target.checked;
        saveProgressState();
        showToast(state.autoUseEpubCover ? "Đã bật: Tự động dùng bìa EPUB làm nền" : "Đã tắt: Giữ nguyên ảnh nền tự chọn");
    };
}

// Mẫu ảnh nền nội bộ có sẵn
document.querySelectorAll('#internal-bg-presets-tray .btn-preset-bg-item').forEach(btn => {
    btn.onclick = function () {
        const bgPath = btn.getAttribute('data-bg');
        applyReaderBackground(bgPath);
        saveProgressState();
        showToast("Đã áp dụng mẫu ảnh nền!");
    };
});

if (btnClearBgImage) {
    btnClearBgImage.onclick = function () {
        applyReaderBackground(null);
        saveProgressState();
        renderBackgroundGallery();
        showToast("Đã tắt hình nền");
    };
}

if (DOM_GALLERY.btnClearAll) {
    DOM_GALLERY.btnClearAll.onclick = async function () {
        const count = await db.bg_gallery.count();
        if (count === 0) return;

        const ok = await askConfirmation("Xóa bộ sưu tập?", `Bạn có chắc muốn xoá toàn bộ ${count} hình nền/video đã lưu không?`);
        if (ok) {
            await db.bg_gallery.clear();
            applyReaderBackground(null);
            saveProgressState();
            await renderBackgroundGallery();
            showToast("Đã dọn dẹp sạch bộ sưu tập!");
        }
    };
}

// Tương tác với Modal phục hồi chọn lọc TBZ
const btnCloseTbzModal = document.getElementById('btn-close-tbz-modal');
const btnCancelTbzRestore = document.getElementById('btn-cancel-tbz-restore');
const btnConfirmTbzRestore = document.getElementById('btn-confirm-tbz-restore');

if (btnCloseTbzModal) {
    btnCloseTbzModal.onclick = () => {
        document.getElementById('modal-tbz-restore').classList.add('hidden');
        pendingTbzZip = null;
    };
}
if (btnCancelTbzRestore) {
    btnCancelTbzRestore.onclick = () => {
        document.getElementById('modal-tbz-restore').classList.add('hidden');
        pendingTbzZip = null;
    };
}
if (btnConfirmTbzRestore) {
    btnConfirmTbzRestore.onclick = executeSelectiveTbzImport;
}

document.querySelectorAll('.btn-hl-style').forEach(function (btn) {
    btn.onclick = function () {
        state.hlStyle = btn.getAttribute('data-style');
        applyHighlightCustomization();
        saveProgressState();
        showToast('Kiểu highlight: ' + btn.textContent.trim());
    };
});

if (DOM.configPageLoadingDelay) {
    DOM.configPageLoadingDelay.onchange = function (e) {
        state.pageLoadDelay = parseInt(e.target.value, 10);
        saveProgressState();
        showToast('Đã lưu thời gian chờ: ' + (state.pageLoadDelay / 1000) + 's');
    };
}

if (DOM.switchAutoUpdate) {
    DOM.switchAutoUpdate.onchange = function (e) {
        state.autoUpdateApp = e.target.checked;
        saveProgressState();
        showToast(state.autoUpdateApp ? "Đã bật tự động cập nhật bản mới" : "Chế độ: Cập nhật thủ công");
    };
}

document.querySelectorAll('.btn-hl-preset').forEach(function (btn) {
    btn.onclick = function () {
        state.hlTextColor = btn.getAttribute('data-text');
        state.hlBgColor = btn.getAttribute('data-bg');
        state.hlBorderColor = btn.getAttribute('data-border');

        applyHighlightCustomization();
        saveProgressState();
        showToast('Hệ màu: ' + btn.textContent.trim());
    };
});

if (DOM.pickerHlText) {
    DOM.pickerHlText.oninput = function (e) {
        state.hlTextColor = e.target.value;
        applyHighlightCustomization();
        saveProgressState();
    };
}
if (DOM.pickerHlBg) {
    DOM.pickerHlBg.oninput = function (e) {
        state.hlBgColor = e.target.value;
        applyHighlightCustomization();
        saveProgressState();
    };
}
if (DOM.pickerHlBorder) {
    DOM.pickerHlBorder.oninput = function (e) {
        state.hlBorderColor = e.target.value;
        applyHighlightCustomization();
        saveProgressState();
    };
}

document.querySelectorAll('.btn-voice-opt').forEach(function (btn) {
    btn.onclick = function () {
        document.querySelectorAll('.btn-voice-opt').forEach(function (b) {
            b.className = 'btn-voice-opt touch-action py-2 rounded-xl border border-neutral-500/20 font-medium';
        });
        btn.className = 'btn-voice-opt touch-action py-2 rounded-xl border border-[var(--accent-color)] text-[var(--accent-color)] font-medium';
        state.currentVoiceName = btn.getAttribute('data-voice');
        if (DOM.labelVoice) DOM.labelVoice.textContent = state.currentVoiceName;
        showToast('Giọng đọc: ' + state.currentVoiceName);
        saveProgressState();
        if (state.isPlaying && !state.isMuted) playCurrentSentence();
    };
});

if (DOM.btnSearchOpen) DOM.btnSearchOpen.onclick = openSearchAction;
const btnSearchMobile = document.getElementById('btn-search-open-mobile');
if (btnSearchMobile) btnSearchMobile.onclick = openSearchAction;

DOM.btnSearchClose.onclick = function () {
    DOM.searchBarDrawer.classList.add('hidden');
    clearSearchHighlights();
};

DOM.inputSearchQuery.addEventListener('input', function (e) {
    executeInBookSearch(e.target.value);
});

DOM.btnSearchNext.onclick = function () {
    if (state.searchResults.length === 0) return;
    const nextIdx = (state.currentSearchIndex + 1) % state.searchResults.length;
    focusSearchResult(nextIdx);
};

DOM.btnSearchPrev.onclick = function () {
    if (state.searchResults.length === 0) return;
    const prevIdx = (state.currentSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
    focusSearchResult(prevIdx);
};

// iOS Segmented Control Tabs Navigation
const storageTabs = [
    { btn: document.getElementById('tab-btn-system'), pane: document.getElementById('tab-pane-system') },
    { btn: document.getElementById('tab-btn-download'), pane: document.getElementById('tab-pane-download') },
    { btn: document.getElementById('tab-btn-manage'), pane: document.getElementById('tab-pane-manage') },
    { btn: document.getElementById('tab-btn-backup'), pane: document.getElementById('tab-pane-backup') }
];

storageTabs.forEach(function (t) {
    if (!t.btn || !t.pane) return;
    t.btn.onclick = function () {
        storageTabs.forEach(function (item) {
            if (item.btn && item.pane) {
                item.btn.classList.remove('active');
                item.pane.classList.add('hidden');
            }
        });
        t.btn.classList.add('active');
        t.pane.classList.remove('hidden');
    };
});

DOM.storageDownloadScope.onchange = function (e) {
    DOM.storageRangeBox.classList.toggle('hidden', e.target.value !== 'range');
    DOM.storageRangeBox.classList.toggle('flex', e.target.value === 'range');
};

DOM.btnStartBatchDownload.onclick = function () { runBatchDownload(); };
DOM.btnCancelDownload.onclick = function () { state.abortBatchDownload = true; };

DOM.btnExportAudioFile.onclick = function () { exportSingleChapterAudio(); };
DOM.btnExportFullTbz.onclick = function () { exportFullTbzArchive(); };
DOM.btnExportTbz.onclick = function () { exportFullTbzArchive(); };

DOM.btnTriggerImport.onclick = function () { DOM.fileInput.click(); };
DOM.fileInput.onchange = function (e) {
    if (e.target.files.length > 0) {
        handleImportFile(e.target.files[0]);
    }
};

DOM.btnSaveBookMeta.onclick = async function () {
    if (!state.currentBook) return;
    state.currentBook.title = DOM.editBookTitle.value.trim() || state.currentBook.title;
    state.currentBook.author = DOM.editBookAuthor.value.trim() || state.currentBook.author;
    await db.books.put(state.currentBook);
    DOM.headerBookTitle.textContent = state.currentBook.title;
    showToast("Đã lưu thông tin sách!");
    await renderLibraryList();
};

DOM.btnCleanAudioCache.onclick = async function () {
    if (!state.currentBook) return;
    await db.sentence_audio.where('bookId').equals(state.currentBook.id).delete();
    showToast("Đã xoá toàn bộ Audio đệm cuốn này!");
    await refreshStorageStats();
    await renderCachedChaptersList();
};

DOM.btnDeleteCurrentBook.onclick = async function () {
    if (!state.currentBook) return;
    await deleteBookById(state.currentBook.id);
    DOM.modalStorage.classList.add('hidden');
    DOM.modalStorage.classList.remove('flex');
};

DOM.btnPurgeAll.onclick = async function () {
    const ok = await askConfirmation(
        "Xoá toàn bộ ứng dụng?",
        "Thao tác này sẽ xoá sạch hoàn toàn dữ liệu (Sách, Audio, Hình nền, Cài đặt), bộ nhớ đệm Cache, Cookie và gỡ Service Worker về trạng thái ban đầu."
    );

    if (!ok) return;

    showToast("Đang dọn dẹp sạch toàn bộ ứng dụng...");

    try {
        // 1. DỌN SẠCH TẤT CẢ CÁC BẢNG TRONG DEXIE INDEXEDDB
        if (typeof db !== 'undefined' && db.isOpen()) {
            await Promise.all([
                db.sentence_audio.clear(),
                db.chapters.clear(),
                db.books.clear(),
                db.settings.clear(),
                db.bg_gallery.clear()
            ]);
            await db.delete(); // Xoá luôn schema cơ sở dữ liệu để reset index
        }

        // 2. XOÁ LOCALSTORAGE & SESSIONSTORAGE
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.warn("Lỗi xoá Web Storage:", e);
        }

        // 3. XOÁ TOÀN BỘ COOKIE CỦA DOMAIN
        try {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
        } catch (e) {
            console.warn("Lỗi xoá Cookie:", e);
        }

        // 4. XOÁ TOÀN BỘ CACHE STORAGE
        if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map(k => caches.delete(k)));
        }

        // 5. GỠ BỎ TOÀN BỘ SERVICE WORKER ĐANG ĐĂNG KÝ
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.unregister();
            }
        }

        showToast("Đã dọn dẹp sạch toàn bộ ứng dụng!");

        // Chờ 0.5s rồi tải lại sạch từ máy chủ
        setTimeout(() => {
            window.location.replace(window.location.origin + window.location.pathname);
        }, 500);

    } catch (err) {
        console.error("Lỗi khi xoá toàn bộ dữ liệu:", err);
        // Ngay cả khi gặp lỗi cục bộ, vẫn xóa Storage và reload lại trang
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }
};

window.addEventListener('keydown', function (e) {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
            DOM.searchBarDrawer.classList.add('hidden');
            clearSearchHighlights();
            document.activeElement.blur();
        }
        return;
    }

    if (e.key === 'f' || e.key === 'F') {
        DOM.app.classList.toggle('ui-hidden');
    } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) changeChapter(state.currentChapterIndex + 1);
        else skipSentence(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) changeChapter(state.currentChapterIndex - 1);
        else skipSentence(-1);
    } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        openSearchAction();
    } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        DOM.btnMuteToggle.click();
    } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        DOM.btnLibrary.click();
    } else if (e.key === 'Home') {
        DOM.viewport.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'Escape') {
        document.querySelectorAll('#drawer-library, #drawer-toc, #modal-typography, #modal-storage, #search-bar-drawer, #modal-devlog, #modal-changelog, #modal-tbz-restore').forEach(function (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
        });
        clearSearchHighlights();
    }
});

let scrollSaveTimer = null;
DOM.viewport.addEventListener('scroll', function () {
    if (state.isRestoringScroll) return;
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(function () {
        state.savedScrollTop = DOM.viewport.scrollTop;
        saveProgressState();
    }, 150);
});

// ==========================================================================
// 17. VERSIONING & .HUNQWEB BACKUP SYSTEM
// ==========================================================================
const btnCheckUpdate = document.getElementById('btn-check-app-update');
const btnCreateHunqWeb = document.getElementById('btn-create-hunqweb-backup');
const btnDownloadHunqWeb = document.getElementById('btn-download-cached-hunqweb');
const labelCachedHunqWeb = document.getElementById('label-cached-hunqweb');
const btnTriggerUploadHunq = document.getElementById('btn-trigger-upload-hunqweb');
const inputUploadHunq = document.getElementById('input-upload-hunqweb');

function syncVersionLabels(version) {
    if (version) APP_VERSION = version;
    if (DOM.appVersionBadge) DOM.appVersionBadge.textContent = 'v' + APP_VERSION;
}

function fetchVersionFromSW() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
        if ('caches' in window) {
            caches.keys().then(function (keys) {
                if (keys.length > 0) syncVersionLabels(keys[0]);
            });
        }
        return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function (event) {
        if (event.data && event.data.version) {
            syncVersionLabels(event.data.version);
        }
    };

    navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
}

async function updateBackupButtonState() {
    try {
        const lastBackup = await db.app_backups.orderBy('createdAt').reverse().first();
        if (lastBackup && btnDownloadHunqWeb) {
            btnDownloadHunqWeb.classList.remove('hidden');
            btnDownloadHunqWeb.classList.add('flex');

            const backupDate = new Date(lastBackup.createdAt).toLocaleDateString('vi-VN');
            const backupVer = lastBackup.version ? lastBackup.version : APP_VERSION;

            if (labelCachedHunqWeb) {
                labelCachedHunqWeb.textContent = 'Bản lưu ' + backupDate + ' (' + backupVer + ')';
            }

            btnDownloadHunqWeb.onclick = function () {
                const url = URL.createObjectURL(lastBackup.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'TruyenVoice_' + backupVer + '_' + lastBackup.createdAt + '.HunqWeb';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast("Đã tải xuống tệp .HunqWeb!");
            };
        }
    } catch (e) {
        console.warn("Lỗi đọc app_backups:", e);
    }
}

if (btnCreateHunqWeb) {
    btnCreateHunqWeb.onclick = async function () {
        showToast("Đang đóng gói mã nguồn .HunqWeb...");
        try {
            const zip = new JSZip();

            const htmlRes = await fetch(window.location.href);
            const htmlText = await htmlRes.text();

            const jsRes = await fetch('./assets/main.js');
            const jsText = await jsRes.text();

            zip.file("index.html", htmlText);
            const assetsFolder = zip.folder("assets");
            assetsFolder.file("main.js", jsText);

            const manifestMeta = {
                app: "Truyện Voice",
                extension: ".HunqWeb",
                version: APP_VERSION,
                backupAt: new Date().toISOString()
            };
            zip.file("hunqweb_meta.json", JSON.stringify(manifestMeta, null, 2));

            const blob = await zip.generateAsync({ type: "blob" });

            await db.app_backups.put({
                id: 'backup-' + Date.now(),
                createdAt: Date.now(),
                version: APP_VERSION,
                blob: blob
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'TruyenVoice_' + APP_VERSION + '_' + Date.now() + '.HunqWeb';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Đã xuất tệp .HunqWeb (' + APP_VERSION + ')!');
            await updateBackupButtonState();
        } catch (err) {
            console.error(err);
            showToast("Lỗi khi đóng gói .HunqWeb: " + err.message);
        }
    };
}

async function checkAndApplyUpdate(isManualTrigger = false) {
    if (isManualTrigger) {
        showToast("Đang kiểm tra phiên bản mới từ máy chủ...");
    }

    let latestVersion = null;
    try {
        const swRes = await fetch('./sw.js?nocache=' + Date.now());
        if (swRes.ok) {
            const swContent = await swRes.text();
            const match = swContent.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
            if (match && match[1]) {
                latestVersion = match[1];
            }
        }
    } catch (err) {
        console.warn("Không thể kiểm tra sw.js:", err);
    }

    const currentVer = APP_VERSION;
    const hasNewVersion = latestVersion && (latestVersion !== currentVer) && (currentVer !== 'Đang đồng bộ...');

    if (hasNewVersion) {
        if (!state.autoUpdateApp && !isManualTrigger) {
            showToast(`Có bản cập nhật mới (v${latestVersion}). Vào Cài đặt để cập nhật.`);
            return;
        }

        const confirmed = await askConfirmation(
            "Phát hiện phiên bản mới!",
            `Máy chủ có phiên bản mới (v${latestVersion}). Bạn có muốn nâng cấp và làm mới ứng dụng ngay không?`
        );

        if (!confirmed) {
            showToast("Đã hoãn cập nhật phiên bản.");
            return;
        }
    } else if (isManualTrigger) {
        const force = await askConfirmation(
            "Đang ở bản mới nhất",
            `Phiên bản hiện tại (v${currentVer}) đã là mới nhất. Bạn có muốn làm mới bộ đệm (force refresh) không?`
        );
        if (!force) return;
    } else {
        return;
    }

    showToast("Đang cài đặt phiên bản mới...");
    if ('caches' in window) {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let reg of registrations) {
                    if (reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    await reg.update();
                }
            }
            setTimeout(() => { location.reload(true); }, 500);
        } catch (err) {
            location.reload(true);
        }
    } else {
        location.reload(true);
    }
}

if (btnCheckUpdate) {
    btnCheckUpdate.onclick = function () {
        checkAndApplyUpdate(true);
    };
}

if (btnTriggerUploadHunq && inputUploadHunq) {
    btnTriggerUploadHunq.onclick = function () { inputUploadHunq.click(); };

    inputUploadHunq.onchange = async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.HunqWeb') && !file.name.endsWith('.zip')) {
            showToast("Vui lòng chọn file .HunqWeb hoặc .zip!");
            return;
        }

        const confirmRestore = await askConfirmation(
            "Khôi phục phiên bản cũ?",
            'Bạn có chắc chắn muốn nạp mã nguồn từ tệp "' + file.name + '"?'
        );

        if (!confirmRestore) return;

        try {
            showToast("Đang giải nén gói .HunqWeb...");
            const zip = await JSZip.loadAsync(file);

            const indexFile = zip.file("index.html");
            if (!indexFile) {
                throw new Error("Tệp không chứa index.html hợp lệ.");
            }

            const htmlContent = await indexFile.async("string");
            document.open();
            document.write(htmlContent);
            document.close();
            showToast("Đã khôi phục thành công phiên bản cũ!");
        } catch (err) {
            console.error(err);
            showToast("Lỗi khôi phục: " + err.message);
        }
    };
}

// ==========================================================================
// 18. INITIALIZATION
// ==========================================================================
async function initApp() {
    await loadSettings();
    applyHighlightCustomization();
    await renderBackgroundGallery();

    const bookCount = await db.books.count();
    if (bookCount === 0) {
        state.currentBook = null;
        state.currentChapterIndex = 0;
        state.currentSentenceIndex = 0;
        state.savedScrollTop = 0;

        if (DOM.headerBookTitle) DOM.headerBookTitle.textContent = "Tủ sách trống";
        if (DOM.headerChapterTitle) DOM.headerChapterTitle.textContent = "Chưa có sách";
        if (DOM.container) {
            DOM.container.innerHTML = `
                <div class="text-center py-20 space-y-3 opacity-60">
                    <i class="fa-solid fa-book-open text-4xl mb-2"></i>
                    <p class="text-sm font-semibold">Tủ sách hiện đang trống</p>
                    <p class="text-xs">Vui lòng bấm vào <b>Tủ Sách</b> ở góc trên để nạp file (.epub, .txt, .tbz).</p>
                </div>
            `;
        }
    } else {
        const savedPrefs = await db.settings.get('user_preferences');
        if (savedPrefs && savedPrefs.lastBookId) {
            state.currentBook = await db.books.get(savedPrefs.lastBookId);
            if (state.currentBook) {
                state.currentChapterIndex = savedPrefs.lastChapterIndex !== undefined ? savedPrefs.lastChapterIndex : (state.currentBook.currentChapter || 0);
                state.currentSentenceIndex = savedPrefs.lastSentenceIndex !== undefined ? savedPrefs.lastSentenceIndex : (state.currentBook.currentSentence || 0);
                state.savedScrollTop = savedPrefs.lastScrollTop !== undefined ? savedPrefs.lastScrollTop : (state.currentBook.scrollTop || 0);
            }
        }
        if (!state.currentBook) {
            state.currentBook = await db.books.toCollection().first();
            if (state.currentBook) {
                state.currentChapterIndex = state.currentBook.currentChapter || 0;
                state.currentSentenceIndex = state.currentBook.currentSentence || 0;
                state.savedScrollTop = state.currentBook.scrollTop || 0;
            }
        }
        await renderReaderContent(true);
    }

    setupInfiniteScrollObserver();
    await updateBackupButtonState();

    await hidePageLoadingScreen();

    if (state.autoUpdateApp) {
        setTimeout(() => checkAndApplyUpdate(false), 2000);
    }
    setTimeout(() => {
        hidePageLoadingScreen();
    }, Math.max(state.pageLoadDelay + 300, 1500));
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').then(function (reg) {
            console.log('[SW] Đã đăng ký Service Worker:', reg.scope);
            fetchVersionFromSW();

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (state.autoUpdateApp) {
                            checkAndApplyUpdate(false);
                        } else {
                            showToast("Có bản cập nhật mới. Bạn có thể cập nhật trong Cài đặt.");
                        }
                    }
                });
            });
        }).catch(function (err) {
            console.warn('[SW] Đăng ký Service Worker thất bại:', err);
        });

        navigator.serviceWorker.addEventListener('controllerchange', function () {
            fetchVersionFromSW();
        });
    });
}

window.addEventListener('DOMContentLoaded', function () {
    initApp();
    window.addEventListener('touchstart', function () { audioManager.unlockAudioSession(); }, { once: true });
    window.addEventListener('click', function () { audioManager.unlockAudioSession(); }, { once: true });
    window.addEventListener('beforeunload', function () {
        state.savedScrollTop = DOM.viewport.scrollTop;
        saveProgressState();
    });
});

// ==========================================================================
// QUẢN LÝ LỊCH SỬ CẬP NHẬT (CHANGELOG VIEWER)
// ==========================================================================
const btnViewChangelog = document.getElementById('btn-view-changelog');
const modalChangelog = document.getElementById('modal-changelog');
const btnCloseChangelog = document.getElementById('btn-close-changelog');
const changelogContainer = document.getElementById('changelog-list-container');

async function renderChangelog() {
    if (!changelogContainer) return;

    try {
        const res = await fetch('./changelog.json?nocache=' + Date.now());
        if (!res.ok) throw new Error('Không thể tải changelog');
        const logs = await res.json();

        changelogContainer.innerHTML = '';
        logs.forEach((log) => {
            const card = document.createElement('div');
            card.className = 'ios-group-card p-3.5 space-y-2';

            const itemsHtml = log.changes.map(item => `
                <li class="flex items-start gap-2 leading-relaxed opacity-85">
                    <span class="text-[var(--accent-color)] mt-0.5">•</span>
                    <span>${item}</span>
                </li>
            `).join('');

            card.innerHTML = `
                <div class="flex items-center justify-between border-b border-[var(--ios-sep)] pb-1.5">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-md bg-[var(--accent-color)] text-white font-mono font-bold text-[10px]">v${log.version}</span>
                        <span class="font-semibold text-xs tracking-tight">${log.title}</span>
                    </div>
                    <span class="text-[10px] text-[var(--ios-subtext)] font-mono">${log.date}</span>
                </div>
                <ul class="space-y-1.5 pt-1 text-[11px] font-sans">
                    ${itemsHtml}
                </ul>
            `;
            changelogContainer.appendChild(card);
        });
    } catch (err) {
        changelogContainer.innerHTML = `
            <div class="text-center py-6 text-rose-500 font-medium">
                <i class="fa-solid fa-triangle-exclamation mb-1 text-sm"></i>
                <p>Không thể tải tệp changelog.json.</p>
            </div>
        `;
    }
}

if (btnViewChangelog) {
    btnViewChangelog.onclick = function () {
        if (modalChangelog) {
            modalChangelog.classList.remove('hidden');
            modalChangelog.classList.add('flex');
            renderChangelog();
        }
    };
}

if (btnCloseChangelog && modalChangelog) {
    btnCloseChangelog.onclick = function () {
        modalChangelog.classList.add('hidden');
        modalChangelog.classList.remove('flex');
    };
    modalChangelog.onclick = function (e) {
        if (e.target === modalChangelog) {
            modalChangelog.classList.add('hidden');
            modalChangelog.classList.remove('flex');
        }
    };
}