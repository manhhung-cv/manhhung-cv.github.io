import { UI } from '../../js/ui.js';

export const template = () => {
    return `
        <div class="space-y-6">
            <div class="mb-2">
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Base64 Converter</h2>
                <p class="text-sm text-zinc-500 mt-1">Mã hóa văn bản, tập tin thành Base64 hoặc ngược lại.</p>
            </div>

            <div class="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-fit">
                <button id="tab-text" class="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm transition-all">Văn bản</button>
                <button id="tab-file" class="px-4 py-2 text-sm font-medium rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">Tập tin</button>
            </div>

            <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                <label class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center">
                        <input type="checkbox" id="url-safe-toggle" class="sr-only peer">
                        <div class="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-white transition-colors"></div>
                    </div>
                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">URL Safe Mode</span>
                </label>
                <div class="text-[11px] text-zinc-400 hidden sm:block">Chuyển '+' thành '-', '/' thành '_'</div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                <div class="space-y-3 flex flex-col">
                    <label class="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Đầu vào (Input)</label>
                    
                    <textarea id="b64-text-input" 
                        class="flex-1 min-h-[250px] w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all resize-y text-sm leading-relaxed"
                        placeholder="Nhập văn bản hoặc dán mã Base64 vào đây..."></textarea>

                    <div id="b64-file-input" class="hidden flex-1 min-h-[250px] w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer relative group">
                        <input type="file" id="file-upload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-3 group-hover:scale-110 transition-transform">
                            <i class="fas fa-cloud-upload-alt text-xl"></i>
                        </div>
                        <p class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center">Kéo thả hoặc Click để chọn file</p>
                        <p class="text-xs text-zinc-400 text-center mt-1" id="file-name-display">Max 5MB (Khuyến nghị)</p>
                    </div>

                    <div class="flex gap-2 mt-auto pt-2">
                        <button id="btn-encode" class="flex-1 py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-lock"></i> Mã hóa
                        </button>
                        <button id="btn-decode" class="flex-1 py-3 px-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-unlock"></i> Giải mã
                        </button>
                    </div>
                </div>

                <div class="space-y-3 flex flex-col">
                    <div class="flex justify-between items-center px-1">
                        <label class="text-xs font-bold uppercase tracking-wider text-zinc-400">Kết quả (Output)</label>
                        <div class="flex gap-3">
                            <button id="btn-download" class="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors hidden">
                                <i class="fas fa-download mr-1"></i>Tải File
                            </button>
                            <button id="btn-copy" class="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                <i class="far fa-copy mr-1"></i>Sao chép
                            </button>
                            <button id="btn-clear" class="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                                <i class="far fa-trash-alt mr-1"></i>Xóa
                            </button>
                        </div>
                    </div>
                    
                    <div class="relative flex-1 flex flex-col min-h-[250px]">
                        <textarea id="b64-output" readonly
                            class="flex-1 w-full p-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 resize-y"
                            placeholder="Kết quả hiển thị tại đây..."></textarea>
                        
                        <div id="image-preview-container" class="absolute inset-0 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl hidden flex-col items-center justify-center p-4">
                            <img id="image-preview" class="max-w-full max-h-[200px] object-contain rounded-lg shadow-sm mb-3">
                            <p class="text-xs text-zinc-500">Xem trước hình ảnh từ Base64</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
};

export const init = () => {
    // UI Elements
    const tabText = document.getElementById('tab-text');
    const tabFile = document.getElementById('tab-file');
    const txtInput = document.getElementById('b64-text-input');
    const fileInputArea = document.getElementById('b64-file-input');
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name-display');
    const output = document.getElementById('b64-output');
    
    const btnEncode = document.getElementById('btn-encode');
    const btnDecode = document.getElementById('btn-decode');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');
    const btnDownload = document.getElementById('btn-download');
    
    const urlSafeToggle = document.getElementById('url-safe-toggle');
    const imgPreviewContainer = document.getElementById('image-preview-container');
    const imgPreview = document.getElementById('image-preview');

    let currentMode = 'text'; // 'text' or 'file'
    let currentFile = null;

    // --- TAB SWITCH LOGIC ---
    const switchTab = (mode) => {
        currentMode = mode;
        if (mode === 'text') {
            tabText.classList.replace('text-zinc-500', 'text-zinc-900');
            tabText.classList.replace('hover:text-zinc-900', 'bg-white');
            tabText.classList.add('dark:text-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-semibold');
            tabText.classList.remove('font-medium', 'dark:hover:text-white');

            tabFile.classList.remove('text-zinc-900', 'bg-white', 'dark:text-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-semibold');
            tabFile.classList.add('text-zinc-500', 'hover:text-zinc-900', 'dark:hover:text-white', 'font-medium');

            txtInput.classList.remove('hidden');
            fileInputArea.classList.add('hidden');
        } else {
            tabFile.classList.replace('text-zinc-500', 'text-zinc-900');
            tabFile.classList.replace('hover:text-zinc-900', 'bg-white');
            tabFile.classList.add('dark:text-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-semibold');
            tabFile.classList.remove('font-medium', 'dark:hover:text-white');

            tabText.classList.remove('text-zinc-900', 'bg-white', 'dark:text-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-semibold');
            tabText.classList.add('text-zinc-500', 'hover:text-zinc-900', 'dark:hover:text-white', 'font-medium');

            txtInput.classList.add('hidden');
            fileInputArea.classList.remove('hidden');
        }
        clearAll();
    };

    tabText.onclick = () => switchTab('text');
    tabFile.onclick = () => switchTab('file');

    // --- HELPER FUNCTIONS ---
    const encodeUTF8ToBase64 = (str) => {
        return btoa(unescape(encodeURIComponent(str)));
    };
    const decodeBase64ToUTF8 = (str) => {
        return decodeURIComponent(escape(atob(str)));
    };
    const makeUrlSafe = (base64Str) => {
        return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    const revertUrlSafe = (base64Str) => {
        let str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return str;
    };

    // --- FILE INPUT LOGIC ---
    fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            currentFile = e.target.files[0];
            fileNameDisplay.textContent = `${currentFile.name} (${(currentFile.size / 1024).toFixed(1)} KB)`;
        }
    });

    // --- ENCODE LOGIC ---
    btnEncode.addEventListener('click', () => {
        if (currentMode === 'text') {
            const str = txtInput.value;
            if (!str) return UI.showAlert('Thông báo', 'Vui lòng nhập văn bản cần mã hóa', 'warning');
            try {
                let encoded = encodeUTF8ToBase64(str);
                if (urlSafeToggle.checked) encoded = makeUrlSafe(encoded);
                output.value = encoded;
            } catch (e) {
                UI.showAlert('Lỗi', 'Không thể mã hóa văn bản này', 'error');
            }
        } else {
            if (!currentFile) return UI.showAlert('Thông báo', 'Vui lòng chọn một tập tin', 'warning');
            const reader = new FileReader();
            reader.onload = (e) => {
                let result = e.target.result; // Data URL format: data:image/png;base64,iVBORw0KGgo...
                if (urlSafeToggle.checked) {
                    const parts = result.split(',');
                    if (parts.length === 2) result = parts[0] + ',' + makeUrlSafe(parts[1]);
                }
                output.value = result;
                UI.showAlert('Thành công', 'Đã chuyển file thành mã Base64', 'success');
            };
            reader.readAsDataURL(currentFile);
        }
    });

    // --- DECODE LOGIC ---
    btnDecode.addEventListener('click', () => {
        imgPreviewContainer.classList.add('hidden');
        btnDownload.classList.add('hidden');

        if (currentMode === 'text') {
            let str = txtInput.value.trim();
            if (!str) return UI.showAlert('Thông báo', 'Vui lòng dán mã Base64 cần giải mã', 'warning');
            try {
                str = revertUrlSafe(str);
                output.value = decodeBase64ToUTF8(str);
            } catch (e) {
                UI.showAlert('Lỗi', 'Chuỗi Base64 không hợp lệ', 'error');
            }
        } else {
            // Trong tab File, nếu giải mã, user vẫn phải paste mã Base64 vào output (hoặc input text rồi switch)
            // Để tiện lợi, chúng ta sẽ lấy text từ output nếu input trống
            let str = txtInput.value.trim();
            if (!str && output.value) str = output.value.trim();
            
            if (!str) return UI.showAlert('Thông báo', 'Vui lòng dán chuỗi Base64 (có data URI) vào vùng Nhập hoặc Kết quả', 'warning');

            // Xử lý xem có phải là file/ảnh không (có data:image/png;base64,... không)
            const isDataURI = str.match(/^data:(.*?);base64,(.*)$/);
            
            try {
                if (isDataURI) {
                    const mime = isDataURI[1];
                    const b64Data = revertUrlSafe(isDataURI[2]);
                    
                    if (mime.startsWith('image/')) {
                        imgPreview.src = `data:${mime};base64,${b64Data}`;
                        imgPreviewContainer.classList.remove('hidden');
                        imgPreviewContainer.classList.add('flex');
                    }
                    
                    // Setup nút download
                    btnDownload.classList.remove('hidden');
                    btnDownload.onclick = () => {
                        const a = document.createElement('a');
                        a.href = `data:${mime};base64,${b64Data}`;
                        a.download = `downloaded_file.${mime.split('/')[1] || 'bin'}`;
                        a.click();
                    };
                    UI.showAlert('Thành công', 'Đã giải mã thành tập tin thành công', 'success');
                } else {
                    // Cố gắng giải mã text thuần
                    output.value = decodeBase64ToUTF8(revertUrlSafe(str));
                    UI.showAlert('Giải mã văn bản', 'Mã Base64 này không chứa định dạng File, đã giải mã ra văn bản thường.', 'info');
                }
            } catch (e) {
                UI.showAlert('Lỗi', 'Mã Base64 không hợp lệ hoặc bị hỏng', 'error');
            }
        }
    });

    // --- ACTIONS ---
    btnCopy.addEventListener('click', () => {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value);
        UI.showAlert('Đã sao chép', 'Kết quả đã được lưu vào Clipboard', 'success');
    });

    const clearAll = () => {
        txtInput.value = '';
        output.value = '';
        currentFile = null;
        fileUpload.value = '';
        fileNameDisplay.textContent = 'Max 5MB (Khuyến nghị)';
        imgPreviewContainer.classList.add('hidden');
        imgPreviewContainer.classList.remove('flex');
        btnDownload.classList.add('hidden');
    };

    btnClear.addEventListener('click', clearAll);
};