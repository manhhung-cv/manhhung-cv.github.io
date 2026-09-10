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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="ocr-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #ocr-root-container {
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
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .ocr-dropzone-active {
                border-color: var(--kit-accent) !important;
                background-color: color-mix(in srgb, var(--kit-accent) 10%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Vision OCR</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Trích xuất văn bản</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Nhận diện ký tự quang học (OCR) hoàn toàn ngoại tuyến trên trình duyệt bằng WebAssembly.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- CỘT TRÁI: DROPZONE & CÀI ĐẶT NGUỒN ẢNH -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Nguồn ảnh quét</h3>
                            <button id="ocr-clear-btn" class="text-xs font-semibold text-rose-500 hover:opacity-80 transition-opacity hidden flex items-center gap-1">
                                <i class="far fa-trash-can text-[11px]"></i> Xóa ảnh
                            </button>
                        </div>

                        <!-- DROPZONE AREA -->
                        <div id="ocr-dropzone" class="relative rounded-[18px] border-2 border-dashed border-black/[0.1] dark:border-white/[0.15] bg-[#f2f2f7]/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group flex-1">
                            <input type="file" id="ocr-file-input" accept="image/*" class="hidden">
                            
                            <div id="ocr-placeholder" class="flex flex-col items-center space-y-2">
                                <div class="w-12 h-12 rounded-[16px] bg-white dark:bg-[#27272a] shadow-sm flex items-center justify-center text-accent-theme text-xl group-hover:scale-105 transition-transform border border-black/[0.04] dark:border-white/[0.06]">
                                    <i class="fas fa-wand-magic-sparkles"></i>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-zinc-900 dark:text-white">Kéo thả hoặc dán ảnh (Ctrl + V)</p>
                                    <p class="text-[11px] text-zinc-400 mt-0.5">Nhấp để duyệt tệp từ thiết bị</p>
                                </div>
                            </div>

                            <div id="ocr-preview-wrap" class="w-full h-full hidden flex flex-col items-center justify-center">
                                <img id="ocr-preview-img" class="max-h-[220px] w-auto max-w-full rounded-[14px] object-contain shadow-sm border border-black/[0.05] dark:border-white/[0.08]" src="" alt="OCR Target">
                            </div>
                        </div>

                        <!-- CLIPBOARD PASTE BUTTON -->
                        <button id="ocr-paste-btn" class="h-10 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all w-full">
                            <i class="far fa-clipboard text-xs"></i> Dán từ bộ nhớ tạm
                        </button>

                        <!-- NGÔN NGỮ NHẬN DẠNG -->
                        <div class="space-y-1 pt-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Ngôn ngữ mô hình</label>
                            <div class="relative">
                                <select id="ocr-lang-select" class="appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all cursor-pointer">
                                    <option value="vie">Tiếng Việt (vie)</option>
                                    <option value="eng">Tiếng Anh (eng)</option>
                                    <option value="vie+eng">Tiếng Việt + Tiếng Anh</option>
                                    <option value="jpn">Tiếng Nhật (jpn)</option>
                                    <option value="chi_sim">Tiếng Trung Giản Thể (chi_sim)</option>
                                    <option value="auto">✨ Tự nhận diện hệ chữ (OSD)</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
                                    <i class="fas fa-chevron-down text-[10px]"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CỘT PHẢI: KẾT QUẢ VĂN BẢN TRÍCH XUẤT -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Văn bản trích xuất</h3>
                            <span id="ocr-status-badge" class="px-2.5 py-0.5 bg-[#f2f2f7] dark:bg-black/40 text-zinc-500 text-[10px] font-mono font-bold uppercase rounded-full border border-black/[0.04] dark:border-white/[0.06]">
                                Chờ ảnh
                            </span>
                        </div>

                        <!-- PROGRESS BAR -->
                        <div id="ocr-progress-box" class="w-full space-y-1.5 hidden">
                            <div class="flex justify-between text-[11px] font-mono font-semibold text-zinc-500">
                                <span id="ocr-progress-label" class="truncate pr-2">Đang khởi động...</span>
                                <span id="ocr-progress-val" class="text-accent-theme shrink-0">0%</span>
                            </div>
                            <div class="w-full h-1.5 bg-[#f2f2f7] dark:bg-black/40 rounded-full overflow-hidden">
                                <div id="ocr-progress-bar" class="h-full bg-accent-theme rounded-full w-0 transition-all duration-150"></div>
                            </div>
                        </div>

                        <!-- TEXT RESULT AREA -->
                        <div class="flex-1 flex flex-col min-h-[260px]">
                            <textarea id="ocr-result-text" readonly class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-800 dark:text-zinc-200 resize-y placeholder-zinc-400 transition-all leading-relaxed select-all" placeholder="Kết quả nhận diện ký tự sẽ hiển thị tại đây..."></textarea>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button id="ocr-copy-btn" class="h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                            <i class="far fa-copy text-xs"></i> Sao chép
                        </button>
                        <button id="ocr-download-btn" class="h-11 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                            <i class="fas fa-download text-xs"></i> Tải .TXT
                        </button>
                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & TESSERACT WASM ENGINE
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#ocr-root-container') || hostElement;

    // Khởi tạo ThemeKit[cite: 1]
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);

    const dropzone = _('#ocr-dropzone');
    const fileInput = _('#ocr-file-input');
    const placeholder = _('#ocr-placeholder');
    const previewWrap = _('#ocr-preview-wrap');
    const previewImg = _('#ocr-preview-img');
    const clearBtn = _('#ocr-clear-btn');
    const pasteBtn = _('#ocr-paste-btn');
    
    const langSelect = _('#ocr-lang-select');
    const resultText = _('#ocr-result-text');
    const statusBadge = _('#ocr-status-badge');
    const progressBox = _('#ocr-progress-box');
    const progressBar = _('#ocr-progress-bar');
    const progressVal = _('#ocr-progress-val');
    const progressLabel = _('#ocr-progress-label');
    const copyBtn = _('#ocr-copy-btn');
    const downloadBtn = _('#ocr-download-btn');

    let currentImageData = null;
    let isProcessing = false;

    // Đường dẫn tuyệt đối chuẩn module
    const CURRENT_DIR = new URL('.', import.meta.url).href;

    const PATHS = {
        script: new URL('tesseract/tesseract.min.js', CURRENT_DIR).href,
        workerPath: new URL('tesseract/worker.min.js', CURRENT_DIR).href,
        corePath: new URL('tesseract/tesseract-core.wasm.js', CURRENT_DIR).href,
        langPath: new URL('tessdata', CURRENT_DIR).href.replace(/\/$/, '')
    };

    const verifyResource = async (url, label) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return true;
        } catch (e) {
            console.error(`[Preflight Check] Thiếu hoặc sai đường dẫn: ${label} (${url})`);
            throw new Error(`Không tìm thấy file: ${label}`);
        }
    };

    const loadTesseract = async () => {
        if (window.Tesseract) return window.Tesseract;
        await verifyResource(PATHS.script, 'tesseract.min.js');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PATHS.script;
            script.onload = () => resolve(window.Tesseract);
            script.onerror = () => reject(new Error('Lỗi tải script tesseract.min.js'));
            document.head.appendChild(script);
        });
    };

    const preprocessImage = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                let totalLuminance = 0;
                for (let i = 0; i < data.length; i += 4) {
                    totalLuminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                }
                const avgLuminance = totalLuminance / (data.length / 4);
                const isDarkBackground = avgLuminance < 110;

                for (let i = 0; i < data.length; i += 4) {
                    let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    if (isDarkBackground) {
                        gray = gray > 40 ? 0 : 255;
                    }
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imageSrc);
            img.src = imageSrc;
        });
    };

    const processImageSource = (imgSrc) => {
        if (!imgSrc) return;
        currentImageData = imgSrc;
        if (previewImg) previewImg.src = currentImageData;
        placeholder?.classList.add('hidden');
        previewWrap?.classList.remove('hidden');
        clearBtn?.classList.remove('hidden');
        runOCR();
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            IslandKit.notify('Sai định dạng', 'Vui lòng chọn tệp hình ảnh.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => processImageSource(e.target.result);
        reader.readAsDataURL(file);
    };

    const resetImage = () => {
        currentImageData = null;
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        placeholder?.classList.remove('hidden');
        previewWrap?.classList.add('hidden');
        clearBtn?.classList.add('hidden');
        progressBox?.classList.add('hidden');
        if (statusBadge) {
            statusBadge.textContent = 'Chờ ảnh';
            statusBadge.className = 'px-2.5 py-0.5 bg-[#f2f2f7] dark:bg-black/40 text-zinc-500 text-[10px] font-mono font-bold uppercase rounded-full border border-black/[0.04] dark:border-white/[0.06]';
        }
    };

    pasteBtn?.addEventListener('click', async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    handleFile(blob);
                    return;
                }
            }
            IslandKit.notify('Không có ảnh', 'Không tìm thấy hình ảnh trong Clipboard.', 'info');
        } catch (err) {
            IslandKit.notify('Quyền truy cập', 'Nhấn Ctrl + V để dán trực tiếp ảnh vào ứng dụng.', 'warning');
        }
    });

    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
        if (!items) return;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                handleFile(blob);
                break;
            }
        }
    });

    dropzone?.addEventListener('click', (e) => {
        if (e.target !== clearBtn && !clearBtn?.contains(e.target)) fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files?.length > 0) handleFile(e.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach(event => {
        dropzone?.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.add('ocr-dropzone-active');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        dropzone?.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.remove('ocr-dropzone-active');
        });
    });

    dropzone?.addEventListener('drop', (e) => {
        if (e.dataTransfer?.files?.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    clearBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetImage();
    });

    langSelect?.addEventListener('change', () => { 
        if (currentImageData && !isProcessing) runOCR(); 
    });

    async function runOCR() {
        if (!currentImageData || isProcessing) return;
        isProcessing = true;

        progressBox?.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '10%';
        if (progressVal) progressVal.textContent = '10%';
        if (statusBadge) {
            statusBadge.textContent = 'Khởi động';
            statusBadge.className = 'px-2.5 py-0.5 bg-accent-theme-alpha text-accent-theme text-[10px] font-mono font-bold uppercase rounded-full border border-accent-theme/20';
        }
        if (resultText) resultText.value = '';

        try {
            if (progressLabel) progressLabel.textContent = 'Kiểm tra tài nguyên offline...';
            await verifyResource(PATHS.workerPath, 'worker.min.js');
            await verifyResource(PATHS.corePath, 'tesseract-core.wasm.js');

            const Tesseract = await loadTesseract();

            if (progressLabel) progressLabel.textContent = 'Tối ưu độ tương phản ảnh...';
            const optimizedImage = await preprocessImage(currentImageData);

            let chosenLang = langSelect?.value || 'vie';

            if (chosenLang === 'auto') {
                if (progressLabel) progressLabel.textContent = 'Đang nhận diện hệ chữ (OSD)...';
                await verifyResource(`${PATHS.langPath}/osd.traineddata.gz`, 'osd.traineddata.gz');

                const osdWorker = await Tesseract.createWorker('osd', 0, {
                    workerPath: PATHS.workerPath,
                    corePath: PATHS.corePath,
                    langPath: PATHS.langPath,
                    gzip: true,
                    errorHandler: err => console.error('OSD Worker Error:', err)
                });

                const osdRes = await osdWorker.detect(optimizedImage);
                await osdWorker.terminate();

                const script = osdRes?.data?.script || 'Latin';
                const scriptMap = {
                    'Japanese': 'jpn',
                    'Han': 'chi_sim',
                    'Hangul': 'eng',
                    'Cyrillic': 'eng',
                    'Latin': 'vie'
                };
                chosenLang = scriptMap[script] || 'vie';
                if (statusBadge) statusBadge.textContent = `Hệ chữ: ${script}`;
            }

            const langs = chosenLang.split('+');
            for (const l of langs) {
                await verifyResource(`${PATHS.langPath}/${l}.traineddata.gz`, `${l}.traineddata.gz`);
            }

            if (progressLabel) progressLabel.textContent = 'Nạp mô hình ngôn ngữ...';
            const worker = await Tesseract.createWorker(chosenLang, 1, {
                workerPath: PATHS.workerPath,
                corePath: PATHS.corePath,
                langPath: PATHS.langPath,
                gzip: true,
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const percent = Math.round((m.progress || 0) * 100);
                        if (progressBar) progressBar.style.width = `${percent}%`;
                        if (progressVal) progressVal.textContent = `${percent}%`;
                        if (progressLabel) progressLabel.textContent = 'Đang bóc tách từng dòng chữ...';
                    } else if (m.status === 'loading language traineddata') {
                        if (progressLabel) progressLabel.textContent = 'Nạp dữ liệu từ tessdata local...';
                    }
                },
                errorHandler: err => console.error('Worker internal error:', err)
            });

            await worker.setParameters({
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            });

            if (progressLabel) progressLabel.textContent = 'Đang nhận diện...';
            const { data: { text } } = await worker.recognize(optimizedImage);
            await worker.terminate();

            if (resultText) resultText.value = text.trim();
            if (statusBadge) {
                statusBadge.textContent = 'Hoàn tất';
                statusBadge.className = 'px-2.5 py-0.5 bg-accent-theme-alpha text-accent-theme text-[10px] font-mono font-bold uppercase rounded-full border border-accent-theme/20';
            }
            IslandKit.notify('Hoàn tất', 'Đã trích xuất nội dung văn bản thành công.', 'success');
        } catch (err) {
            console.error('Lỗi quy trình OCR:', err);
            if (statusBadge) {
                statusBadge.textContent = 'Lỗi';
                statusBadge.className = 'px-2.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-mono font-bold uppercase rounded-full border border-rose-500/20';
            }
            IslandKit.notify('Lỗi nhận diện', err.message || 'Không thể xử lý hình ảnh này.', 'error');
        } finally {
            isProcessing = false;
        }
    }

    copyBtn?.addEventListener('click', async () => {
        const text = resultText?.value.trim() || '';
        if (!text) {
            IslandKit.notify('Trống', 'Chưa có văn bản để sao chép.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            IslandKit.notify('Đã sao chép', 'Đã lưu văn bản vào bộ nhớ tạm.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập clipboard.', 'error');
        }
    });

    downloadBtn?.addEventListener('click', () => {
        const text = resultText?.value.trim() || '';
        if (!text) {
            IslandKit.notify('Trống', 'Chưa có nội dung để tải về.', 'info');
            return;
        }
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}