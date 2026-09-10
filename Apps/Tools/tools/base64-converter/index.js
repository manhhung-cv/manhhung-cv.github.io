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
    <div id="b64-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #b64-root-container {
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

            /* Định nghĩa Switch Pill độ tương phản cao */
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
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Utility</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Base64 Converter</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Mã hóa văn bản, tập tin thành Base64 và ngược lại với chuẩn an toàn URL.</p>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- SEGMENTED TABS ĐÃ FIX ĐỘ TƯƠNG PHẢN DARK MODE -->
                    <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-64" id="b64-tabs">
                        <button id="tab-text" class="tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5">
                            <i class="fas fa-font text-[11px]"></i> Văn bản
                        </button>
                        <button id="tab-file" class="tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5">
                            <i class="fas fa-file-arrow-up text-[11px]"></i> Tập tin
                        </button>
                    </div>

                    <!-- URL-SAFE TOGGLE SWITCH -->
                    <div class="flex items-center justify-between sm:justify-end gap-3 bg-[#f2f2f7] dark:bg-black/40 px-3.5 py-1.5 rounded-[14px] border border-black/[0.04] dark:border-white/[0.06]">
                        <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">URL-Safe Mode</span>
                        <button id="url-safe-switch" class="switch-pill" type="button" aria-label="Toggle URL-Safe Mode">
                            <div class="switch-thumb"></div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- INPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Đầu vào (Input)</h3>
                            <span class="text-[10px] text-zinc-400 font-mono">Raw Content</span>
                        </div>

                        <!-- Text Input Pane -->
                        <div id="pane-text-input" class="flex-1 flex flex-col min-h-[220px]">
                            <textarea id="b64-text-input" 
                                class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-900 dark:text-white resize-y placeholder-zinc-400 transition-all focus:border-accent-theme"
                                placeholder="Nhập văn bản thô hoặc dán mã Base64..."></textarea>
                        </div>

                        <!-- File Input Pane -->
                        <div id="pane-file-input" class="hidden flex-1 min-h-[220px] flex-col items-center justify-center p-6 border-2 border-dashed border-black/[0.1] dark:border-white/[0.15] rounded-[18px] bg-[#f2f2f7]/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative group">
                            <input type="file" id="file-upload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                            <div class="w-12 h-12 rounded-[16px] bg-white dark:bg-[#27272a] shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-3 group-hover:scale-105 transition-transform border border-black/[0.04] dark:border-white/[0.06]">
                                <i class="fas fa-cloud-arrow-up text-lg text-accent-theme"></i>
                            </div>
                            <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 text-center">Kéo thả hoặc nhấn để chọn file</p>
                            <p class="text-[11px] text-zinc-400 text-center mt-1" id="file-name-display">Hỗ trợ ảnh, tài liệu (Khuyến nghị &lt; 5MB)</p>
                        </div>
                    </div>

                    <!-- Encode/Decode Actions -->
                    <div class="flex gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button id="btn-encode" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                            <i class="fas fa-lock text-xs"></i> Mã hóa
                        </button>
                        <button id="btn-decode" class="flex-1 h-11 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                            <i class="fas fa-lock-open text-xs"></i> Giải mã
                        </button>
                    </div>
                </div>

                <!-- OUTPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex justify-between items-center">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kết quả (Output)</h3>
                            <div class="flex items-center gap-1">
                                <button id="btn-download" class="hidden px-2.5 py-1 rounded-[8px] bg-accent-theme-alpha text-accent-theme font-semibold text-[11px] transition-colors">
                                    <i class="fas fa-download mr-1"></i> Tải File
                                </button>
                                <button id="btn-copy" class="px-2 py-1 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[11px] font-medium transition-colors">
                                    <i class="far fa-copy mr-1"></i> Chép
                                </button>
                                <button id="btn-clear" class="px-2 py-1 rounded-[8px] hover:bg-rose-500/10 text-rose-500 text-[11px] font-medium transition-colors">
                                    <i class="far fa-trash-can mr-1"></i> Xóa
                                </button>
                            </div>
                        </div>

                        <!-- Output Box & Preview -->
                        <div class="relative flex-1 flex flex-col min-h-[220px]">
                            <textarea id="b64-output" readonly
                                class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-800 dark:text-zinc-200 resize-y placeholder-zinc-400 select-all"
                                placeholder="Kết quả sau khi chuyển đổi sẽ hiển thị tại đây..."></textarea>
                            
                            <!-- Media / Image Preview Overlay -->
                            <div id="image-preview-container" class="absolute inset-0 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md rounded-[16px] border border-black/[0.04] dark:border-white/[0.06] hidden flex-col items-center justify-center p-4">
                                <div class="relative group max-w-full max-h-[160px] mb-2 rounded-[12px] overflow-hidden border border-black/[0.05] dark:border-white/[0.1]">
                                    <img id="image-preview" class="max-w-full max-h-[160px] object-contain" alt="Base64 Preview">
                                    <button id="btn-zoom-image" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white" title="Xem toàn màn hình">
                                        <i class="fas fa-expand text-sm"></i>
                                    </button>
                                </div>
                                <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Đã nhận diện tệp hình ảnh</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Info Note -->
                    <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                        <span id="output-length">0 ký tự</span>
                        <span class="font-mono text-[10px]">UTF-8 Ready</span>
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
    const rootContainer = hostElement.querySelector('#b64-root-container') || hostElement;

    // Áp dụng màu chủ đạo từ hệ thống
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query DOM Elements
    const tabText = hostElement.querySelector('#tab-text');
    const tabFile = hostElement.querySelector('#tab-file');
    const paneText = hostElement.querySelector('#pane-text-input');
    const paneFile = hostElement.querySelector('#pane-file-input');

    const txtInput = hostElement.querySelector('#b64-text-input');
    const fileUpload = hostElement.querySelector('#file-upload');
    const fileNameDisplay = hostElement.querySelector('#file-name-display');
    const output = hostElement.querySelector('#b64-output');
    const outputLength = hostElement.querySelector('#output-length');

    const btnEncode = hostElement.querySelector('#btn-encode');
    const btnDecode = hostElement.querySelector('#btn-decode');
    const btnCopy = hostElement.querySelector('#btn-copy');
    const btnClear = hostElement.querySelector('#btn-clear');
    const btnDownload = hostElement.querySelector('#btn-download');

    const switchUrlSafe = hostElement.querySelector('#url-safe-switch');
    const imgPreviewContainer = hostElement.querySelector('#image-preview-container');
    const imgPreview = hostElement.querySelector('#image-preview');
    const btnZoomImage = hostElement.querySelector('#btn-zoom-image');

    let currentMode = 'text';
    let currentFile = null;
    let isUrlSafe = false;

    // Toggle Switch (URL-Safe)
    switchUrlSafe?.addEventListener('click', () => {
        switchUrlSafe.classList.toggle('active');
        isUrlSafe = switchUrlSafe.classList.contains('active');
    });

    // Segmented Tabs Switcher với class tương phản cao
    const activeClass = 'tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-1.5';
    const inactiveClass = 'tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-1.5';

    const switchTab = (mode) => {
        currentMode = mode;

        if (mode === 'text') {
            tabText.className = activeClass;
            tabFile.className = inactiveClass;
            paneText.classList.remove('hidden');
            paneFile.classList.add('hidden');
            paneFile.classList.remove('flex');
        } else {
            tabFile.className = activeClass;
            tabText.className = inactiveClass;
            paneText.classList.add('hidden');
            paneFile.classList.remove('hidden');
            paneFile.classList.add('flex');
        }
        clearAll();
    };

    tabText?.addEventListener('click', () => switchTab('text'));
    tabFile?.addEventListener('click', () => switchTab('file'));

    // Helpers
    const encodeUTF8ToBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
    const decodeBase64ToUTF8 = (str) => decodeURIComponent(escape(atob(str)));

    const makeUrlSafe = (b64) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const revertUrlSafe = (b64) => {
        let str = b64.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return str;
    };

    const updateOutput = (val) => {
        output.value = val;
        outputLength.textContent = `${val.length.toLocaleString()} ký tự`;
    };

    // File Input
    fileUpload?.addEventListener('change', (e) => {
        if (e.target.files?.length > 0) {
            currentFile = e.target.files[0];
            fileNameDisplay.textContent = `${currentFile.name} (${(currentFile.size / 1024).toFixed(1)} KB)`;
        }
    });

    // Encode Action
    btnEncode?.addEventListener('click', () => {
        imgPreviewContainer.classList.add('hidden');
        btnDownload.classList.add('hidden');

        if (currentMode === 'text') {
            const str = txtInput.value;
            if (!str) return IslandKit.notify('Thiếu dữ liệu', 'Vui lòng nhập văn bản cần mã hóa.', 'warning');
            
            try {
                let encoded = encodeUTF8ToBase64(str);
                if (isUrlSafe) encoded = makeUrlSafe(encoded);
                updateOutput(encoded);
                IslandKit.notify('Thành công', 'Đã mã hóa Base64.', 'success');
            } catch (e) {
                IslandKit.notify('Lỗi mã hóa', 'Không thể mã hóa chuỗi ký tự này.', 'error');
            }
        } else {
            if (!currentFile) return IslandKit.notify('Thiếu tập tin', 'Vui lòng chọn một tập tin.', 'warning');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                let result = e.target.result;
                if (isUrlSafe) {
                    const parts = result.split(',');
                    if (parts.length === 2) result = parts[0] + ',' + makeUrlSafe(parts[1]);
                }
                updateOutput(result);
                IslandKit.notify('Thành công', `Đã chuyển đổi ${currentFile.name}.`, 'success');
            };
            reader.onerror = () => IslandKit.notify('Lỗi đọc file', 'Không thể đọc nội dung tập tin.', 'error');
            reader.readAsDataURL(currentFile);
        }
    });

    // Decode Action
    btnDecode?.addEventListener('click', () => {
        imgPreviewContainer.classList.add('hidden');
        imgPreviewContainer.classList.remove('flex');
        btnDownload.classList.add('hidden');

        let rawInput = txtInput.value.trim();
        if (!rawInput && output.value.trim()) rawInput = output.value.trim();

        if (!rawInput) {
            return IslandKit.notify('Thiếu dữ liệu', 'Vui lòng nhập mã Base64 cần giải mã.', 'warning');
        }

        const isDataURI = rawInput.match(/^data:(.*?);base64,(.*)$/);

        try {
            if (isDataURI) {
                const mime = isDataURI[1];
                const cleanBase64 = revertUrlSafe(isDataURI[2]);
                const finalDataUri = `data:${mime};base64,${cleanBase64}`;

                if (mime.startsWith('image/')) {
                    imgPreview.src = finalDataUri;
                    imgPreviewContainer.classList.remove('hidden');
                    imgPreviewContainer.classList.add('flex');

                    btnZoomImage.onclick = () => {
                        UI.showMediaFullscreen(finalDataUri, 'image');
                    };
                }

                btnDownload.classList.remove('hidden');
                btnDownload.onclick = () => {
                    const anchor = document.createElement('a');
                    anchor.href = finalDataUri;
                    anchor.download = `decoded_file.${mime.split('/')[1]?.split('+')[0] || 'bin'}`;
                    anchor.click();
                };

                updateOutput(rawInput);
                IslandKit.notify('Thành công', `Đã nhận diện tệp [${mime}].`, 'success');
            } else {
                const decodedText = decodeBase64ToUTF8(revertUrlSafe(rawInput));
                updateOutput(decodedText);
                IslandKit.notify('Thành công', 'Đã giải mã ra văn bản.', 'success');
            }
        } catch (e) {
            IslandKit.notify('Lỗi giải mã', 'Chuỗi Base64 không hợp lệ.', 'error');
        }
    });

    // Copy & Clear
    btnCopy?.addEventListener('click', async () => {
        if (!output.value) return;
        try {
            await navigator.clipboard.writeText(output.value);
            IslandKit.notify('Đã sao chép', 'Đã lưu vào bộ nhớ tạm.', 'success');
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    });

    const clearAll = () => {
        txtInput.value = '';
        updateOutput('');
        currentFile = null;
        fileUpload.value = '';
        fileNameDisplay.textContent = 'Hỗ trợ ảnh, tài liệu (Khuyến nghị < 5MB)';
        imgPreviewContainer.classList.add('hidden');
        imgPreviewContainer.classList.remove('flex');
        btnDownload.classList.add('hidden');
        imgPreview.src = '';
    };

    btnClear?.addEventListener('click', clearAll);
}