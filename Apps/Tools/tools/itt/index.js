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

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            .dropzone-active { border-color: #18181b !important; background-color: rgba(24, 24, 27, 0.04) !important; }
            .dark .dropzone-active { border-color: #ffffff !important; background-color: rgba(255, 255, 255, 0.04) !important; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            <!-- Header -->
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Trích xuất văn bản</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Chạy hoàn toàn nội bộ trong trình duyệt. Không gửi dữ liệu ra bên ngoài.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Left Column -->
                <div class="space-y-6">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Nguồn ảnh</h3>
                            <button id="ocr-clear-btn" class="text-xs font-bold text-red-500 hover:opacity-80 transition-opacity hidden">
                                <i class="fas fa-trash-alt mr-1"></i> Xóa ảnh
                            </button>
                        </div>

                        <!-- Dropzone Area -->
                        <div id="ocr-dropzone" class="relative rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group">
                            <input type="file" id="ocr-file-input" accept="image/*" class="hidden">
                            
                            <div id="ocr-placeholder" class="flex flex-col items-center">
                                <div class="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-lg mb-3 group-hover:scale-105 transition-transform">
                                    <i class="fas fa-magic"></i>
                                </div>
                                <p class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Kéo thả hoặc dán ảnh (Ctrl + V)</p>
                                <p class="text-xs text-zinc-500">Nhấp để chọn tệp từ máy</p>
                            </div>

                            <div id="ocr-preview-wrap" class="w-full h-full hidden flex flex-col items-center justify-center">
                                <img id="ocr-preview-img" class="max-h-[240px] w-auto max-w-full rounded-xl object-contain shadow-sm border border-zinc-200 dark:border-zinc-800" src="" alt="OCR Target">
                            </div>
                        </div>

                        <!-- Quick Paste Button -->
                        <div class="mt-4">
                            <button id="ocr-paste-btn" class="btn-premium w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                <i class="fas fa-paste"></i> Dán nhanh từ bộ nhớ tạm (Clipboard)
                            </button>
                        </div>

                        <!-- Options -->
                        <div class="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div class="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800">
                                <i class="fas fa-globe text-zinc-400 text-sm ml-1"></i>
                                <div class="flex-1">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block leading-tight">Ngôn ngữ nhận dạng</label>
                                    <select id="ocr-lang-select" class="w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white cursor-pointer p-0">
                                        <option value="vie" class="dark:bg-zinc-900">Tiếng Việt (vie)</option>
                                        <option value="eng" class="dark:bg-zinc-900">Tiếng Anh (eng)</option>
                                        <option value="vie+eng" class="dark:bg-zinc-900">Tiếng Việt + Tiếng Anh</option>
                                        <option value="jpn" class="dark:bg-zinc-900">Tiếng Nhật (jpn)</option>
                                        <option value="chi_sim" class="dark:bg-zinc-900">Tiếng Trung Giản Thể (chi_sim)</option>
                                        <option value="auto" class="dark:bg-zinc-900">✨ Tự nhận diện (Yêu cầu osd.traineddata.gz)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Văn bản trích xuất</h3>
                            <span id="ocr-status-badge" class="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded-lg">Chờ ảnh</span>
                        </div>

                        <!-- Progress Bar -->
                        <div id="ocr-progress-box" class="w-full mb-4 hidden">
                            <div class="flex justify-between text-[11px] font-bold text-zinc-500 mb-1.5">
                                <span id="ocr-progress-label">Đang khởi tạo...</span>
                                <span id="ocr-progress-val">0%</span>
                            </div>
                            <div class="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div id="ocr-progress-bar" class="h-full bg-zinc-900 dark:bg-white w-0 transition-all duration-150"></div>
                            </div>
                        </div>

                        <textarea id="ocr-result-text" readonly class="w-full bg-zinc-50 dark:bg-[#121214]/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-y min-h-[300px] custom-scrollbar placeholder-zinc-400 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all leading-relaxed" placeholder="Kết quả nhận diện sẽ hiển thị ở đây..."></textarea>

                        <div class="grid grid-cols-2 gap-3 mt-4">
                            <button id="ocr-copy-btn" class="btn-premium py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center justify-center gap-2">
                                <i class="far fa-copy"></i> Sao chép
                            </button>
                            <button id="ocr-download-btn" class="btn-premium py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2">
                                <i class="fas fa-file-download"></i> Tải .TXT
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const dropzone = document.getElementById('ocr-dropzone');
    const fileInput = document.getElementById('ocr-file-input');
    const placeholder = document.getElementById('ocr-placeholder');
    const previewWrap = document.getElementById('ocr-preview-wrap');
    const previewImg = document.getElementById('ocr-preview-img');
    const clearBtn = document.getElementById('ocr-clear-btn');
    const pasteBtn = document.getElementById('ocr-paste-btn');
    
    const langSelect = document.getElementById('ocr-lang-select');
    const resultText = document.getElementById('ocr-result-text');
    const statusBadge = document.getElementById('ocr-status-badge');
    const progressBox = document.getElementById('ocr-progress-box');
    const progressBar = document.getElementById('ocr-progress-bar');
    const progressVal = document.getElementById('ocr-progress-val');
    const progressLabel = document.getElementById('ocr-progress-label');
    const copyBtn = document.getElementById('ocr-copy-btn');
    const downloadBtn = document.getElementById('ocr-download-btn');

    let currentImageData = null;
    let isProcessing = false;

    // Chuẩn hóa Base URL tuyệt đối đến thư mục chứa file index.js hiện tại
    const CURRENT_DIR = new URL('.', import.meta.url).href;

    const PATHS = {
        script: new URL('tesseract/tesseract.min.js', CURRENT_DIR).href,
        workerPath: new URL('tesseract/worker.min.js', CURRENT_DIR).href,
        corePath: new URL('tesseract/tesseract-core.wasm.js', CURRENT_DIR).href,
        langPath: new URL('tessdata', CURRENT_DIR).href.replace(/\/$/, '') // bỏ dấu / ở cuối nếu có
    };

    // Kiểm tra tính kết nối của file trước khi để WebAssembly chạy
    const verifyResource = async (url, label) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return true;
        } catch (e) {
            console.error(`[Preflight Check] Thiếu hoặc sai đường dẫn: ${label} (${url})`);
            throw new Error(`Không tìm thấy file: ${label}. Đường dẫn: ${url}`);
        }
    };

    const loadTesseract = async () => {
        if (window.Tesseract) return window.Tesseract;
        await verifyResource(PATHS.script, 'tesseract.min.js');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PATHS.script;
            script.onload = () => resolve(window.Tesseract);
            script.onerror = () => reject(new Error('Lỗi load script tesseract.min.js'));
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
        previewImg.src = currentImageData;
        placeholder.classList.add('hidden');
        previewWrap.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
        runOCR();
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            UI.showAlert('Lỗi định dạng', 'Vui lòng chọn tệp hình ảnh.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => processImageSource(e.target.result);
        reader.readAsDataURL(file);
    };

    const resetImage = () => {
        currentImageData = null;
        fileInput.value = '';
        previewImg.src = '';
        placeholder.classList.remove('hidden');
        previewWrap.classList.add('hidden');
        clearBtn.classList.add('hidden');
        progressBox.classList.add('hidden');
        statusBadge.textContent = 'Chờ ảnh';
        statusBadge.className = 'px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded-lg';
    };

    pasteBtn.addEventListener('click', async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    handleFile(blob);
                    UI.showAlert('Đã nạp ảnh', 'Đang nhận diện nội dung...', 'info');
                    return;
                }
            }
            UI.showAlert('Không có ảnh', 'Không tìm thấy ảnh trong Clipboard.', 'info');
        } catch (err) {
            UI.showAlert('Quyền truy cập', 'Nhấn Ctrl + V để dán trực tiếp.', 'error');
        }
    });

    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
        if (!items) return;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                handleFile(blob);
                UI.showAlert('Đã dán ảnh', 'Bắt đầu nhận diện tức thì...', 'info');
                break;
            }
        }
    });

    dropzone.addEventListener('click', (e) => {
        if (e.target !== clearBtn && !clearBtn.contains(e.target)) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach(event => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.add('dropzone-active');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dropzone-active');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetImage();
    });

    langSelect.addEventListener('change', () => { 
        if (currentImageData && !isProcessing) runOCR(); 
    });

    async function runOCR() {
        if (!currentImageData || isProcessing) return;
        isProcessing = true;

        progressBox.classList.remove('hidden');
        progressBar.style.width = '10%';
        progressVal.textContent = '10%';
        statusBadge.textContent = 'Khởi động';
        statusBadge.className = 'px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded-lg';
        resultText.value = '';

        try {
            // 1. Kiểm tra tài nguyên cốt lõi (Tránh ném Aborted(-1))
            progressLabel.textContent = 'Kiểm tra tài nguyên offline...';
            await verifyResource(PATHS.workerPath, 'worker.min.js');
            await verifyResource(PATHS.corePath, 'tesseract-core.wasm.js');

            const Tesseract = await loadTesseract();

            progressLabel.textContent = 'Tối ưu độ tương phản ảnh...';
            const optimizedImage = await preprocessImage(currentImageData);

            let chosenLang = langSelect.value;

            // Xử lý tự nhận diện ngôn ngữ nếu chọn 'auto'
            if (chosenLang === 'auto') {
                progressLabel.textContent = 'Đang nhận diện hệ chữ (OSD)...';
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
                statusBadge.textContent = `Hệ chữ: ${script}`;
            }

            // Kiểm tra trước file model ngôn ngữ được chọn
            const langs = chosenLang.split('+');
            for (const l of langs) {
                await verifyResource(`${PATHS.langPath}/${l}.traineddata.gz`, `${l}.traineddata.gz`);
            }

            // 2. Khởi tạo Worker chính với cấu hình Offline chuẩn
            progressLabel.textContent = 'Nạp mô hình ngôn ngữ...';
            const worker = await Tesseract.createWorker(chosenLang, 1, {
                workerPath: PATHS.workerPath,
                corePath: PATHS.corePath,
                langPath: PATHS.langPath,
                gzip: true,
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const percent = Math.round((m.progress || 0) * 100);
                        progressBar.style.width = `${percent}%`;
                        progressVal.textContent = `${percent}%`;
                        progressLabel.textContent = 'Đang bóc tách từng dòng chữ...';
                    } else if (m.status === 'loading language traineddata') {
                        progressLabel.textContent = 'Nạp dữ liệu từ tessdata local...';
                    }
                },
                errorHandler: err => {
                    console.error('Worker internal error:', err);
                }
            });

            await worker.setParameters({
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            });

            progressLabel.textContent = 'Đang nhận diện...';
            const { data: { text } } = await worker.recognize(optimizedImage);
            await worker.terminate();

            resultText.value = text.trim();
            statusBadge.textContent = 'Hoàn tất';
            statusBadge.className = 'px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-lg';
            UI.showAlert('Hoàn tất', 'Đã trích xuất nội dung thành công.', 'success');
        } catch (err) {
            console.error('Lỗi quy trình OCR:', err);
            statusBadge.textContent = 'Lỗi';
            statusBadge.className = 'px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase rounded-lg';
            UI.showAlert('Lỗi nhận diện', err.message || 'Kiểm tra console F12 để biết chi tiết.', 'error');
        } finally {
            isProcessing = false;
        }
    }

    copyBtn.addEventListener('click', async () => {
        const text = resultText.value.trim();
        if (!text) {
            UI.showAlert('Rỗng', 'Không có nội dung để sao chép.', 'info');
            return;
        }
        await navigator.clipboard.writeText(text);
        UI.showAlert('Đã chép', 'Đã sao chép văn bản vào Clipboard.', 'success');
    });

    downloadBtn.addEventListener('click', () => {
        const text = resultText.value.trim();
        if (!text) {
            UI.showAlert('Rỗng', 'Chưa có dữ liệu để tải về.', 'info');
            return;
        }
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
}