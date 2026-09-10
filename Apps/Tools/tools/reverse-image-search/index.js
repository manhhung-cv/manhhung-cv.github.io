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
    <div id="ris-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #ris-root-container {
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

            .ris-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .is-dragging {
                border-color: var(--kit-accent) !important;
                background-color: color-mix(in srgb, var(--kit-accent) 8%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Search</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Tìm Kiếm Hình Ảnh</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Truy xuất nguồn gốc hình ảnh đa nền tảng. Ảnh lưu tạm tự hủy hoàn toàn sau 5 phút.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="ris-clear-history" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-trash-can text-xs"></i> Xóa lịch sử
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- LEFT: UPLOAD & ACTIONS -->
                <div class="lg:col-span-7 space-y-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        
                        <!-- DROPZONE VIEWPORT -->
                        <div id="ris-dropzone" class="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-[#f2f2f7] dark:bg-black/40 rounded-[20px] border-2 border-dashed border-black/[0.08] dark:border-white/[0.12] flex flex-col items-center justify-center transition-all overflow-hidden group cursor-pointer">
                            <input type="file" id="ris-file-input" accept="image/*" class="hidden">
                            
                            <!-- IDLE VIEW -->
                            <div id="mz-idle" class="flex flex-col items-center text-center p-4 group-active:scale-95 transition-transform">
                                <div class="w-12 h-12 rounded-[16px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center mb-2 shadow-sm">
                                    <i class="fas fa-arrow-up-from-bracket text-lg"></i>
                                </div>
                                <span class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Tải hình ảnh lên</span>
                                <span class="text-[11px] text-zinc-400 mt-0.5">Kéo thả, chạm hoặc dán trực tiếp (Ctrl+V)</span>
                            </div>

                            <!-- LOADING VIEW -->
                            <div id="mz-loading" class="hidden flex-col items-center gap-2.5 py-4">
                                <i class="fas fa-circle-notch fa-spin text-accent-theme text-2xl"></i>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-300">Đang truyền tải và tối ưu...</span>
                            </div>

                            <!-- PREVIEW VIEW -->
                            <div id="mz-preview" class="hidden absolute inset-0 w-full h-full bg-[#f2f2f7] dark:bg-black/80">
                                <img id="ris-preview-img" src="" alt="Preview" class="w-full h-full object-contain p-2">
                                <button id="ris-clear-img" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-all shadow-md" title="Hủy ảnh">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <!-- URL INPUT BAR -->
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                            <i class="fas fa-link text-zinc-400 ml-3 text-xs"></i>
                            <input type="url" id="ris-url-input" class="ris-input-zen w-full bg-transparent border-none outline-none px-2.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Hoặc dán URL ảnh trực tiếp...">
                            <button id="ris-url-btn" class="bg-accent-theme text-white font-bold px-4 py-2 rounded-[12px] text-xs whitespace-nowrap active:scale-95 transition-transform shadow-sm">Dùng Link</button>
                        </div>

                        <!-- SEARCH ENGINE ACTIONS -->
                        <div class="space-y-2 pt-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Chọn công cụ phân tích</span>
                            <div id="ris-action-grid" class="grid grid-cols-2 gap-2.5 opacity-50 pointer-events-none transition-opacity">
                                <button class="btn-search h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" data-engine="google">
                                    <i class="fab fa-google text-xs"></i> Google Lens
                                </button>
                                <button class="btn-search h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all" data-engine="bing">
                                    <i class="fab fa-microsoft text-xs"></i> Bing Visual
                                </button>
                                <button class="btn-search h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all" data-engine="yandex">
                                    <i class="fab fa-yandex text-xs text-rose-500"></i> Yandex
                                </button>
                                <button class="btn-search h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all" data-engine="tineye">
                                    <i class="fas fa-eye text-xs text-cyan-500"></i> TinEye
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- RIGHT: RECENT SEARCH HISTORY -->
                <div class="lg:col-span-5 lg:sticky lg:top-6">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col h-[460px] justify-between space-y-3">
                        
                        <div class="flex justify-between items-center border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-clock-rotate-left text-accent-theme text-xs"></i>
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Lịch sử tra cứu</h3>
                            </div>
                            <span class="text-[10px] text-zinc-400 font-mono" id="ris-history-count">0 mục</span>
                        </div>

                        <!-- LIST SCROLLER -->
                        <div id="ris-history-list" class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1"></div>

                        <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                            <span class="flex items-center gap-1.5">
                                <i class="fas fa-shield-halved text-accent-theme text-[10px]"></i> Tự hủy sau 5 phút
                            </span>
                            <span class="font-mono text-[10px]">ImgBB Vault</span>
                        </div>

                    </div>
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
    const rootContainer = hostElement.querySelector('#ris-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    const storageHandler = (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    };
    window.addEventListener('storage', storageHandler);

    // Query Elements
    const dropzone = hostElement.querySelector('#ris-dropzone');
    const fileInput = hostElement.querySelector('#ris-file-input');
    const idleView = hostElement.querySelector('#mz-idle');
    const loadingView = hostElement.querySelector('#mz-loading');
    const previewView = hostElement.querySelector('#mz-preview');
    const previewImg = hostElement.querySelector('#ris-preview-img');
    const clearImgBtn = hostElement.querySelector('#ris-clear-img');
    
    const urlInput = hostElement.querySelector('#ris-url-input');
    const urlBtn = hostElement.querySelector('#ris-url-btn');
    
    const actionGrid = hostElement.querySelector('#ris-action-grid');
    const searchBtns = hostElement.querySelectorAll('.btn-search');
    
    const historyList = hostElement.querySelector('#ris-history-list');
    const historyCount = hostElement.querySelector('#ris-history-count');
    const clearHistoryBtn = hostElement.querySelector('#ris-clear-history');

    // Configs
    const IMGBB_API_KEY = 'af19d1de11cd14d3d0363c9a2c95d6cf'; 
    const UPLOAD_LIFETIME = 5 * 60 * 1000;
    
    const engineUrls = {
        google: 'https://lens.google.com/uploadbyurl?url=',
        yandex: 'https://yandex.com/images/search?rpt=imageview&url=',
        bing: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:',
        tineye: 'https://tineye.com/search?url='
    };

    let currentUrl = null;
    let historyInterval = null;
    let hasConsentedToUpload = false;

    // State Controller
    const setUIState = (state, imgUrl = '') => {
        dropzone.dataset.state = state;
        
        idleView.classList.add('hidden');
        idleView.classList.remove('flex');
        loadingView.classList.add('hidden');
        loadingView.classList.remove('flex');
        previewView.classList.add('hidden');
        
        if (state === 'idle') {
            idleView.classList.remove('hidden');
            idleView.classList.add('flex');
            currentUrl = null;
            previewImg.src = '';
            urlInput.value = '';
            actionGrid.classList.add('opacity-50', 'pointer-events-none');
            dropzone.classList.remove('border-transparent');
        } 
        else if (state === 'loading') {
            loadingView.classList.remove('hidden');
            loadingView.classList.add('flex');
            actionGrid.classList.add('opacity-50', 'pointer-events-none');
            dropzone.classList.remove('border-transparent');
        } 
        else if (state === 'ready') {
            previewView.classList.remove('hidden');
            currentUrl = imgUrl;
            previewImg.src = imgUrl;
            actionGrid.classList.remove('opacity-50', 'pointer-events-none');
            dropzone.classList.add('border-transparent');
        }
    };

    // Upload Pipe
    const uploadToImgBB = async (file) => {
        setUIState('loading');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('expiration', 300);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { 
                method: 'POST', 
                body: formData 
            });
            const data = await res.json();
            
            if (data.success) {
                const publicUrl = data.data.url;
                addToHistory(publicUrl, file.name);
                setUIState('ready', publicUrl);
                IslandKit.notify('Thành công', 'Đã tải ảnh lên và sẵn sàng phân tích.', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setUIState('idle');
            IslandKit.notify('Lỗi tải tệp', 'Không thể kết nối máy chủ phân tích ảnh.', 'error'); 
        }
    };

    const processFileSelection = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            return IslandKit.notify('Định dạng sai', 'Chỉ chấp nhận các tệp hình ảnh (JPG, PNG, WebP).', 'warning');
        }
        if (file.size > 30 * 1024 * 1024) {
            return IslandKit.notify('Kích thước quá lớn', 'Ảnh tải lên không được vượt quá 30MB.', 'warning');
        }

        if (!hasConsentedToUpload) {
            UI.showConfirm(
                'Bảo mật tải ảnh',
                'Để phân tích, ảnh của bạn sẽ được tải lên máy chủ lưu tạm (ImgBB) và tự động hủy sau 5 phút. Bạn có muốn tiếp tục không?',
                () => {
                    hasConsentedToUpload = true;
                    uploadToImgBB(file);
                }
            );
        } else {
            uploadToImgBB(file);
        }
    };

    // Listeners
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#ris-clear-img') || dropzone.dataset.state !== 'idle') return;
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => { 
        if (e.target.files.length) processFileSelection(e.target.files[0]); 
        fileInput.value = ''; 
    });

    dropzone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        if (dropzone.dataset.state === 'idle') dropzone.classList.add('is-dragging'); 
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault(); 
        dropzone.classList.remove('is-dragging');
        if (dropzone.dataset.state === 'idle' && e.dataTransfer.files.length) {
            processFileSelection(e.dataTransfer.files[0]);
        }
    });

    const pasteHandler = (e) => {
        if (document.activeElement === urlInput || dropzone.dataset.state !== 'idle') return;
        const items = (e.clipboardData || window.clipboardData)?.items;
        if (!items) return;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                return processFileSelection(item.getAsFile());
            }
        }
    };
    document.addEventListener('paste', pasteHandler);

    clearImgBtn?.addEventListener('click', () => setUIState('idle'));

    const handleUrl = () => {
        const url = urlInput.value.trim();
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            return IslandKit.notify('URL không đúng', 'Vui lòng cung cấp link ảnh hợp lệ bắt đầu bằng http(s).', 'warning');
        }
        addToHistory(url, 'Ảnh từ đường dẫn URL');
        setUIState('ready', url);
        urlInput.value = '';
        IslandKit.notify('Sẵn sàng', 'Đã nạp ảnh từ liên kết URL.', 'success');
    };
    
    urlBtn?.addEventListener('click', handleUrl);
    urlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUrl(); });

    searchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUrl) return; 
            const engine = btn.dataset.engine;
            window.open(engineUrls[engine] + encodeURIComponent(currentUrl), '_blank');
        });
    });

    // History Pipeline
    const getHistory = () => JSON.parse(localStorage.getItem('ris_history')) || [];
    const saveHistory = (arr) => localStorage.setItem('ris_history', JSON.stringify(arr));

    const addToHistory = (url, fileName) => {
        const history = getHistory();
        const now = Date.now();
        history.unshift({
            id: 'ris_' + now,
            url: url,
            name: fileName || 'Ảnh tải lên',
            expiresAt: now + UPLOAD_LIFETIME
        });
        if (history.length > 8) history.pop(); 
        saveHistory(history);
        renderHistory();
    };

    const renderHistory = () => {
        const history = getHistory();
        historyCount.textContent = `${history.length} mục`;

        if (history.length === 0) {
            historyList.innerHTML = `<div class="text-center text-xs font-medium text-zinc-400 py-12">Chưa có lịch sử tra cứu nào.</div>`;
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item flex items-center justify-between p-2.5 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.1] dark:hover:border-white/[0.15] transition-all group" id="card-${item.id}">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <div class="w-11 h-11 rounded-[12px] bg-white dark:bg-[#27272a] overflow-hidden shrink-0 border border-black/[0.04] dark:border-white/[0.06]">
                        <img src="${item.url}" alt="thumb" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold text-zinc-900 dark:text-white truncate">${item.name}</h4>
                        <div id="timer-${item.id}" class="text-[10px] font-mono font-bold text-accent-theme mt-0.5">Đang tính...</div>
                    </div>
                </div>
                <div class="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 h-actions">
                    <button onclick="window.open('${engineUrls.google}${encodeURIComponent(item.url)}', '_blank')" class="w-8 h-8 rounded-[10px] bg-white dark:bg-[#27272a] text-zinc-600 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center text-xs active:scale-90 transition-all shadow-sm" title="Google Lens">
                        <i class="fab fa-google"></i>
                    </button>
                    <button onclick="window.open('${engineUrls.yandex}${encodeURIComponent(item.url)}', '_blank')" class="w-8 h-8 rounded-[10px] bg-white dark:bg-[#27272a] text-zinc-600 dark:text-zinc-300 hover:text-rose-500 flex items-center justify-center text-xs active:scale-90 transition-all shadow-sm" title="Yandex">
                        <i class="fab fa-yandex"></i>
                    </button>
                </div>
            </div>
        `).join('');

        updateTimers(); 
    };

    const updateTimers = () => {
        const history = getHistory();
        const now = Date.now();

        history.forEach(item => {
            const timerEl = hostElement.querySelector(`#timer-${item.id}`);
            const cardEl = hostElement.querySelector(`#card-${item.id}`);
            if (!timerEl || !cardEl) return;

            const timeLeft = item.expiresAt - now;

            if (timeLeft <= 0) {
                timerEl.innerHTML = `<span class="text-rose-500 font-bold"><i class="fas fa-lock text-[9px] mr-1"></i>Đã tự hủy</span>`;
                cardEl.style.opacity = '0.45';
                cardEl.style.pointerEvents = 'none';
                const actions = cardEl.querySelector('.h-actions');
                if (actions) actions.style.display = 'none';
            } else {
                const mins = Math.floor(timeLeft / 60000);
                const secs = Math.floor((timeLeft % 60000) / 1000);
                timerEl.innerHTML = `Còn ${mins}:${secs.toString().padStart(2, '0')}`;
            }
        });
    };

    clearHistoryBtn?.addEventListener('click', () => {
        const history = getHistory();
        if (history.length === 0) return;
        UI.showConfirm('Xóa lịch sử?', 'Toàn bộ dữ liệu tra cứu ảnh sẽ được gỡ khỏi bộ nhớ trình duyệt.', () => {
            localStorage.removeItem('ris_history');
            renderHistory();
            IslandKit.notify('Đã xóa', 'Lịch sử tra cứu ảnh đã được làm sạch.', 'info');
        });
    });

    // Startup
    setUIState('idle');
    renderHistory();
    historyInterval = setInterval(updateTimers, 1000);

    // Cleanup on unmount
    return () => {
        clearInterval(historyInterval);
        document.removeEventListener('paste', pasteHandler);
        window.removeEventListener('storage', storageHandler);
    };
}