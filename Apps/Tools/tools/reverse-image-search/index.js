import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            /* Animation cho Spinner */
            @keyframes spin-flat { to { transform: rotate(360deg); } }
            .spinner-flat { width: 24px; height: 24px; border: 2px solid var(--tw-ring-color, #e4e4e7); border-top-color: #18181b; border-radius: 50%; animation: spin-flat 0.8s linear infinite; }
            .dark .spinner-flat { border-color: #27272a; border-top-color: #ffffff; }

            /* Dragging State */
            .is-dragging { border-color: #18181b !important; background-color: rgba(24, 24, 27, 0.05) !important; }
            .dark .is-dragging { border-color: #ffffff !important; background-color: rgba(255, 255, 255, 0.05) !important; }
        </style>

        <div class="relative flex flex-col w-full max-w-[800px] mx-auto min-h-[500px]">
            
            <div class="mb-6 px-2">
                <h2 class="text-[22px] font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Tìm Kiếm Hình Ảnh</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Khám phá nguồn gốc hình ảnh. An toàn & Tự hủy sau 5 phút.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-7 space-y-4">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-zinc-200 dark:ring-zinc-800 p-5 space-y-5">
                        
                        <div id="ris-dropzone" class="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-zinc-50 dark:bg-zinc-800/30 rounded-[24px] border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center transition-colors overflow-hidden group">
                            <input type="file" id="ris-file-input" accept="image/*" class="hidden">
                            
                            <div id="mz-idle" class="flex flex-col items-center text-zinc-400 group-active:scale-95 transition-transform cursor-pointer">
                                <div class="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mb-3">
                                    <i class="fas fa-arrow-up-from-bracket text-lg"></i>
                                </div>
                                <span class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Tải ảnh lên</span>
                                <span class="text-[11px] font-medium">Kéo thả, chạm hoặc dán (Ctrl+V)</span>
                            </div>

                            <div id="mz-loading" class="hidden flex-col items-center">
                                <div class="spinner-flat mb-3"></div>
                                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Đang tải lên...</span>
                            </div>

                            <div id="mz-preview" class="hidden absolute inset-0 w-full h-full bg-zinc-100 dark:bg-zinc-900">
                                <img id="ris-preview-img" src="" alt="Preview" class="w-full h-full object-contain">
                                <button id="ris-clear-img" class="btn-premium absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-900/50 text-white backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow">
                            <i class="fas fa-link text-zinc-400 ml-3 text-xs"></i>
                            <input type="url" id="ris-url-input" class="w-full bg-transparent border-none outline-none px-3 py-2 text-[13px] font-medium text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Hoặc dán URL ảnh trực tiếp...">
                            <button id="ris-url-btn" class="btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-[11px] font-bold text-zinc-900 dark:text-white whitespace-nowrap">Dùng Link</button>
                        </div>

                        <div id="ris-action-grid" class="grid grid-cols-2 gap-3 opacity-50 pointer-events-none transition-opacity">
                            <button class="btn-premium btn-search py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[13px] flex items-center justify-center gap-2" data-engine="google">
                                <i class="fab fa-google"></i> Google Lens
                            </button>
                            <button class="btn-premium btn-search py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-[13px] flex items-center justify-center gap-2" data-engine="bing">
                                <i class="fab fa-microsoft"></i> Bing
                            </button>
                            <button class="btn-premium btn-search py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-[13px] flex items-center justify-center gap-2" data-engine="yandex">
                                <i class="fab fa-yandex"></i> Yandex
                            </button>
                            <button class="btn-premium btn-search py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-[13px] flex items-center justify-center gap-2" data-engine="tineye">
                                <i class="fas fa-eye"></i> TinEye
                            </button>
                        </div>

                    </div>
                </div>

                <div class="lg:col-span-5 sticky top-6">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-zinc-200 dark:ring-zinc-800 p-5 flex flex-col h-[480px]">
                        
                        <div class="flex justify-between items-center mb-4 px-1">
                            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest"><i class="fas fa-history mr-1"></i> Gần đây</span>
                            <button id="ris-clear-history" class="btn-premium text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 rounded-lg">Xóa lịch sử</button>
                        </div>

                        <div id="ris-history-list" class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
                            </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const dropzone = document.getElementById('ris-dropzone');
    const fileInput = document.getElementById('ris-file-input');
    const idleView = document.getElementById('mz-idle');
    const loadingView = document.getElementById('mz-loading');
    const previewView = document.getElementById('mz-preview');
    const previewImg = document.getElementById('ris-preview-img');
    const clearImgBtn = document.getElementById('ris-clear-img');
    
    const urlInput = document.getElementById('ris-url-input');
    const urlBtn = document.getElementById('ris-url-btn');
    
    const actionGrid = document.getElementById('ris-action-grid');
    const searchBtns = document.querySelectorAll('.btn-search');
    
    const historyList = document.getElementById('ris-history-list');
    const clearHistoryBtn = document.getElementById('ris-clear-history');

    // --- Configurations ---
    const IMGBB_API_KEY = 'af19d1de11cd14d3d0363c9a2c95d6cf'; 
    const UPLOAD_LIFETIME = 5 * 60 * 1000; // 5 phút an toàn
    
    const engineUrls = {
        google: 'https://lens.google.com/uploadbyurl?url=',
        yandex: 'https://yandex.com/images/search?rpt=imageview&url=',
        bing: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:',
        tineye: 'https://tineye.com/search?url='
    };

    let currentUrl = null;
    let historyInterval;
    let hasConsentedToUpload = false; // Cờ xác nhận người dùng

    // --- STATE CONTROLLER ---
    const setUIState = (state, imgUrl = '') => {
        dropzone.dataset.state = state;
        
        idleView.classList.add('hidden');
        loadingView.classList.add('hidden');
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

    // --- UPLOAD LOGIC ---
    const uploadToImgBB = async (file) => {
        setUIState('loading');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('expiration', 300); // Tự hủy sau 300s (5 phút)

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.success) {
                const publicUrl = data.data.url;
                addToHistory(publicUrl, file.name);
                setUIState('ready', publicUrl);
                UI.showAlert('Thành công', 'Ảnh đã được tải lên và sẵn sàng phân tích.', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setUIState('idle');
            UI.showAlert('Lỗi', 'Không thể tải ảnh lên hệ thống. Vui lòng thử lại!', 'error'); 
        }
    };

    const processFileSelection = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            return UI.showAlert('Định dạng không hợp lệ', 'Vui lòng chọn file hình ảnh (JPG, PNG...).', 'warning');
        }
        if (file.size > 50 * 1024 * 1024) {
            return UI.showAlert('File quá lớn', 'Kích thước ảnh không được vượt quá 5MB.', 'warning');
        }

        // CẢNH BÁO BẢO MẬT TRƯỚC KHI TẢI LÊN
        if (!hasConsentedToUpload) {
            UI.showConfirm(
                'Xác nhận tải ảnh',
                'Để phân tích, ảnh của bạn sẽ được tải lên máy chủ trung gian (ImgBB) và tự động hủy hoàn toàn sau 5 phút. Bạn có đồng ý tiếp tục?',
                () => {
                    hasConsentedToUpload = true;
                    uploadToImgBB(file);
                }
            );
        } else {
            uploadToImgBB(file);
        }
    };

    // --- EVENT LISTENERS ---
    
    // Click Upload
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#ris-clear-img') || dropzone.dataset.state !== 'idle') return;
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => { 
        if (e.target.files.length) processFileSelection(e.target.files[0]); 
        fileInput.value = ''; 
    });

    // Drag & Drop
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

    // Paste Image
    document.addEventListener('paste', (e) => {
        if (document.activeElement === urlInput || dropzone.dataset.state !== 'idle') return;
        const items = (e.clipboardData || window.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) return processFileSelection(item.getAsFile());
        }
    });

    // Clear
    clearImgBtn.addEventListener('click', () => setUIState('idle'));

    // URL Logic
    const handleUrl = () => {
        const url = urlInput.value.trim();
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            return UI.showAlert('URL không hợp lệ', 'Vui lòng nhập đường dẫn ảnh hợp lệ.', 'warning');
        }
        addToHistory(url, 'Ảnh từ URL');
        setUIState('ready', url);
        urlInput.value = '';
    };
    
    urlBtn.addEventListener('click', handleUrl);
    urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUrl(); });

    // Search Actions
    searchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUrl) return; 
            const engine = btn.dataset.engine;
            window.open(engineUrls[engine] + encodeURIComponent(currentUrl), '_blank');
        });
    });

    // --- HISTORY MANAGEMENT ---
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
        if(history.length > 5) history.pop(); 
        saveHistory(history);
        renderHistory();
    };

    const renderHistory = () => {
        const history = getHistory();
        if (history.length === 0) {
            historyList.innerHTML = `<div class="text-center text-[11px] font-medium text-zinc-400 py-10 opacity-50">Chưa có dữ liệu tìm kiếm.</div>`;
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="flex items-center gap-3 p-2 rounded-2xl border border-transparent transition-colors group history-item" id="card-${item.id}">
                <div class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <img src="${item.url}" alt="thumb" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 class="text-[12px] font-bold text-zinc-900 dark:text-white truncate mb-0.5">${item.name}</h4>
                    <div id="timer-${item.id}" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono"><i class="fas fa-circle-notch fa-spin"></i> Tính toán...</div>
                </div>
                <div class="flex gap-1 h-actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.open('${engineUrls.google}${encodeURIComponent(item.url)}', '_blank')" class="btn-premium w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center"><i class="fab fa-google text-[11px]"></i></button>
                    <button onclick="window.open('${engineUrls.yandex}${encodeURIComponent(item.url)}', '_blank')" class="btn-premium w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center"><i class="fab fa-yandex text-[11px]"></i></button>
                </div>
            </div>
        `).join('');

        updateTimers(); 
    };

    const updateTimers = () => {
        const history = getHistory();
        const now = Date.now();

        history.forEach(item => {
            const timerEl = document.getElementById(`timer-${item.id}`);
            const cardEl = document.getElementById(`card-${item.id}`);
            if (!timerEl || !cardEl) return;

            const timeLeft = item.expiresAt - now;

            if (timeLeft <= 0) {
                timerEl.innerHTML = `<span class="text-red-500"><i class="fas fa-lock text-[9px] mr-0.5"></i> Đã tự hủy</span>`;
                cardEl.style.opacity = '0.4';
                cardEl.style.pointerEvents = 'none';
                const actions = cardEl.querySelector('.h-actions');
                if(actions) actions.style.display = 'none';
            } else {
                const mins = Math.floor(timeLeft / 60000);
                const secs = Math.floor((timeLeft % 60000) / 1000);
                timerEl.innerHTML = `Còn ${mins}:${secs.toString().padStart(2, '0')}`;
            }
        });
    };

    clearHistoryBtn.addEventListener('click', () => {
        UI.showConfirm('Xóa lịch sử?', 'Toàn bộ dữ liệu ảnh tải lên sẽ bị xóa khỏi trình duyệt.', () => {
            localStorage.removeItem('ris_history');
            renderHistory();
        });
    });

    // Initialize
    setUIState('idle');
    renderHistory();
    clearInterval(historyInterval);
    historyInterval = setInterval(updateTimers, 1000);
}