import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Mở Khóa Excel</h2>
                    <p class="text-sm text-zinc-500 mt-1">Gỡ bỏ mật khẩu bảo vệ Sheet & Workbook an toàn 100% trên trình duyệt.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-7 premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col overflow-hidden relative min-h-[350px]">
                    
                    <div id="eu-dropzone" class="absolute inset-0 m-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-950/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-[24px] flex flex-col items-center justify-center transition-all cursor-pointer group z-10">
                        <input type="file" id="eu-file-input" class="hidden" accept=".xlsx">
                        
                        <div class="w-20 h-20 bg-white dark:bg-zinc-800 shadow-sm rounded-3xl flex items-center justify-center text-4xl text-emerald-500 mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">Kéo thả file Excel vào đây</h3>
                        <p class="text-sm text-zinc-500 font-medium px-8 text-center">Hoặc click để chọn file từ máy (Chỉ hỗ trợ <span class="font-bold text-zinc-700 dark:text-zinc-300">.xlsx</span>)</p>
                    </div>

                    <div id="eu-result-view" class="absolute inset-0 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center z-20 opacity-0 pointer-events-none transition-opacity duration-300 p-8 text-center hidden">
                        
                        <div id="eu-loading" class="flex flex-col items-center">
                            <div class="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                            <h3 class="text-lg font-bold text-zinc-900 dark:text-white">Đang xử lý...</h3>
                            <p class="text-sm text-zinc-500 mt-1">Đang phân tích cấu trúc XML của file</p>
                        </div>

                        <div id="eu-success" class="flex flex-col items-center hidden w-full max-w-sm">
                            <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl mb-6">
                                <i class="fas fa-unlock-alt"></i>
                            </div>
                            <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">Mở khóa thành công!</h3>
                            <div class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-6 flex items-center gap-3 text-left">
                                <i class="fas fa-file-excel text-emerald-500 text-xl ml-2"></i>
                                <div class="flex-1 overflow-hidden">
                                    <p id="eu-filename" class="text-sm font-bold text-zinc-900 dark:text-white truncate">filename.xlsx</p>
                                    <p id="eu-filesize" class="text-xs text-zinc-500">0 KB</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-3 w-full">
                                <button id="btn-eu-download" class="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                                    <i class="fas fa-download"></i> Tải xuống
                                </button>
                                <button id="btn-eu-reset" class="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center">
                                    <i class="fas fa-redo"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="lg:col-span-5 space-y-4">
                    
                    <div class="premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <i class="fas fa-check-circle text-emerald-500"></i> Công cụ này hỗ trợ:
                        </h3>
                        <ul class="space-y-3">
                            <li class="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <i class="fas fa-file-alt text-zinc-400 mt-0.5"></i>
                                <span>Mở khóa các <strong class="text-zinc-900 dark:text-white">Sheet</strong> không cho chỉnh sửa, copy dữ liệu (Protect Sheet).</span>
                            </li>
                            <li class="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <i class="fas fa-book text-zinc-400 mt-0.5"></i>
                                <span>Gỡ bỏ mật khẩu cấu trúc <strong class="text-zinc-900 dark:text-white">Workbook</strong> (Không cho thêm/xóa sheet).</span>
                            </li>
                            <li class="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <i class="fas fa-shield-alt text-emerald-500 mt-0.5"></i>
                                <span><strong class="text-emerald-600 dark:text-emerald-400">Xử lý Offline:</strong> Dữ liệu không bao giờ bị tải lên máy chủ. Mọi thứ diễn ra ngay trên trình duyệt của bạn.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="premium-card bg-red-50/50 dark:bg-red-900/10 p-6 rounded-[28px] border border-red-100 dark:border-red-800/30 shadow-sm">
                        <h3 class="text-sm font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                            <i class="fas fa-exclamation-triangle"></i> Giới hạn
                        </h3>
                        <p class="text-sm text-red-500/80 dark:text-red-400/80 leading-relaxed">
                            Công cụ <strong>không thể</strong> mở các file yêu cầu nhập mật khẩu ngay lúc mở file (File Encryption). Nó chỉ bẻ khóa các lớp bảo vệ bên trong file đã mở được.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    `;
}

export function init() {
    const dropzone = document.getElementById('eu-dropzone');
    const fileInput = document.getElementById('eu-file-input');
    const resultView = document.getElementById('eu-result-view');
    const viewLoading = document.getElementById('eu-loading');
    const viewSuccess = document.getElementById('eu-success');
    
    const elFilename = document.getElementById('eu-filename');
    const elFilesize = document.getElementById('eu-filesize');
    const btnDownload = document.getElementById('btn-eu-download');
    const btnReset = document.getElementById('btn-eu-reset');

    let unlockedBlob = null;
    let originalFilename = '';

    // --- TIỆN ÍCH ---
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // --- TẢI THƯ VIỆN JSZIP ĐỘNG ---
    const loadJSZip = () => {
        return new Promise((resolve, reject) => {
            if (window.JSZip) return resolve(window.JSZip);
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = () => reject(new Error('Lỗi tải thư viện JSZip'));
            document.head.appendChild(script);
        });
    };

    // --- LOGIC GIAO DIỆN ---
    const resetUI = () => {
        unlockedBlob = null;
        fileInput.value = '';
        dropzone.classList.remove('hidden');
        resultView.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
            resultView.classList.add('hidden');
            resultView.classList.remove('pointer-events-auto');
            viewLoading.classList.remove('hidden');
            viewSuccess.classList.add('hidden');
        }, 300);
    };

    const showLoading = () => {
        dropzone.classList.add('hidden');
        resultView.classList.remove('hidden');
        setTimeout(() => {
            resultView.classList.replace('opacity-0', 'opacity-100');
            resultView.classList.add('pointer-events-auto');
        }, 10);
    };

    const showSuccess = (file, blob) => {
        originalFilename = file.name;
        elFilename.textContent = file.name;
        elFilesize.textContent = formatBytes(blob.size);
        unlockedBlob = blob;

        viewLoading.classList.add('hidden');
        viewSuccess.classList.remove('hidden');
        
        // Thêm animation nhẹ
        viewSuccess.classList.add('animate-in', 'fade-in', 'zoom-in', 'duration-300');
    };

    // --- LOGIC XỬ LÝ UNLOCK EXCEL ---
    const unlockExcel = async (file) => {
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            UI.showAlert('Lỗi định dạng', 'Chỉ hỗ trợ file Excel định dạng .xlsx', 'error');
            resetUI();
            return;
        }

        showLoading();

        try {
            const JSZipObj = await loadJSZip();
            const zip = new JSZipObj();
            const content = await zip.loadAsync(file);
            let isModified = false;

            // 1. Gỡ bảo vệ Workbook
            if (content.file("xl/workbook.xml")) {
                let xml = await content.file("xl/workbook.xml").async("string");
                if (xml.includes("workbookProtection")) {
                    // Xóa thẻ workbookProtection (Tự đóng hoặc mở đóng)
                    xml = xml.replace(/<workbookProtection[^>]*\/>/g, "");
                    xml = xml.replace(/<workbookProtection[^>]*>.*?<\/workbookProtection>/g, "");
                    zip.file("xl/workbook.xml", xml);
                    isModified = true;
                }
            }

            // 2. Gỡ bảo vệ từng Sheet
            const sheetRegex = /^xl\/worksheets\/sheet\d+\.xml$/;
            for (let relativePath in content.files) {
                if (sheetRegex.test(relativePath)) {
                    let xml = await content.file(relativePath).async("string");
                    if (xml.includes("sheetProtection")) {
                        xml = xml.replace(/<sheetProtection[^>]*\/>/g, "");
                        xml = xml.replace(/<sheetProtection[^>]*>.*?<\/sheetProtection>/g, "");
                        zip.file(relativePath, xml);
                        isModified = true;
                    }
                }
            }

            // Nếu không có mật khẩu nào được tìm thấy
            if (!isModified) {
                UI.showAlert('Thông báo', 'File này không có mật khẩu Sheet/Workbook hoặc không được hỗ trợ.', 'warning');
                resetUI();
                return;
            }

            // Đóng gói lại thành Blob
            const newBlob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            showSuccess(file, newBlob);

        } catch (err) {
            console.error(err);
            let msg = 'Lỗi không xác định khi xử lý file.';
            if (err.message.includes('End of data reached') || err.message.includes('Corrupted zip')) {
                msg = 'File bị mã hóa chặn mở (Encrypted) hoặc bị hỏng. Công cụ này không thể mở khóa loại này.';
            }
            UI.showAlert('Lỗi xử lý', msg, 'error', 5000);
            resetUI();
        }
    };

    // --- SỰ KIỆN DRAG & DROP ---
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-900/10');
            dropzone.classList.remove('border-zinc-300', 'dark:border-zinc-700');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-900/10');
            dropzone.classList.add('border-zinc-300', 'dark:border-zinc-700');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) unlockExcel(files[0]);
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) unlockExcel(this.files[0]);
    });

    // --- SỰ KIỆN NÚT BẤM ---
    btnReset.addEventListener('click', resetUI);

    btnDownload.addEventListener('click', () => {
        if (!unlockedBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(unlockedBlob);
        link.download = 'Unlocked_' + originalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        UI.showAlert('Thành công', 'File đã được tải xuống máy của bạn.', 'success');
    });
}