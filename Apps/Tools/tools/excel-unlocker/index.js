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
    <div id="excel-unlock-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #excel-unlock-root {
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
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Security Suite</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Mở Khóa Excel</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Gỡ bỏ bảo vệ Sheet & Workbook offline an toàn 100% ngay trên trình duyệt.</p>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: DROPZONE & VIEW KẾT QUẢ (7 COLS) -->
                <div class="lg:col-span-7 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col overflow-hidden relative min-h-[380px]">
                    
                    <!-- DROPZONE VIEW -->
                    <div id="eu-dropzone" class="absolute inset-0 m-3 sm:m-4 border-2 border-dashed border-black/[0.1] dark:border-white/[0.15] hover:border-accent-theme dark:hover:border-accent-theme bg-[#f2f2f7]/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 rounded-[18px] flex flex-col items-center justify-center transition-all cursor-pointer group z-10 p-6 text-center">
                        <input type="file" id="eu-file-input" class="hidden" accept=".xlsx">
                        
                        <div class="w-16 h-16 rounded-[20px] bg-white dark:bg-[#27272a] shadow-sm flex items-center justify-center text-3xl text-accent-theme mb-4 group-hover:scale-105 transition-transform border border-black/[0.04] dark:border-white/[0.06]">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <h3 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">Kéo thả file Excel vào đây</h3>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs">
                            Hoặc nhấn để chọn tệp từ thiết bị (Hỗ trợ định dạng <span class="font-mono font-bold text-zinc-800 dark:text-zinc-200">.xlsx</span>).
                        </p>
                    </div>

                    <!-- RESULT / STATUS VIEW -->
                    <div id="eu-result-view" class="absolute inset-0 bg-white dark:bg-[#161618] flex flex-col items-center justify-center z-20 opacity-0 pointer-events-none transition-opacity duration-300 p-6 sm:p-8 text-center hidden">
                        
                        <!-- Đang phân tích -->
                        <div id="eu-loading" class="flex flex-col items-center space-y-3">
                            <div class="w-12 h-12 border-3 border-accent-theme-alpha border-t-accent-theme rounded-full animate-spin"></div>
                            <div>
                                <h3 class="text-sm font-bold text-zinc-900 dark:text-white">Đang giải nén & phân tích...</h3>
                                <p class="text-xs text-zinc-400 font-mono mt-0.5">Xóa thẻ workbookProtection & sheetProtection</p>
                            </div>
                        </div>

                        <!-- Thành công -->
                        <div id="eu-success" class="flex flex-col items-center hidden w-full max-w-sm space-y-4">
                            <div class="w-14 h-14 rounded-full bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-2xl">
                                <i class="fas fa-lock-open"></i>
                            </div>

                            <div>
                                <h3 class="text-base font-bold text-zinc-900 dark:text-white">Đã gỡ khóa thành công!</h3>
                                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Toàn bộ giới hạn chỉnh sửa đã được loại bỏ.</p>
                            </div>

                            <div class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex items-center gap-3 text-left">
                                <div class="w-9 h-9 rounded-[10px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center shrink-0">
                                    <i class="fas fa-file-excel text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p id="eu-filename" class="text-xs font-bold text-zinc-900 dark:text-white truncate">filename.xlsx</p>
                                    <p id="eu-filesize" class="text-[10px] font-mono text-zinc-400">0 KB</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-2 w-full pt-1">
                                <button id="btn-eu-download" class="flex-1 h-11 bg-accent-theme text-white rounded-[14px] font-bold text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
                                    <i class="fas fa-download text-xs"></i> Tải xuống file đã mở
                                </button>
                                <button id="btn-eu-reset" class="w-11 h-11 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 rounded-[14px] font-bold text-xs active:scale-95 transition-all flex items-center justify-center" title="Làm lại">
                                    <i class="fas fa-rotate-left text-xs"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- CỘT PHẢI: HƯỚNG DẪN & GIỚI HẠN (5 COLS) -->
                <div class="lg:col-span-5 space-y-4">
                    
                    <!-- PHẠM VI HỖ TRỢ -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-circle-check text-accent-theme"></i> Phạm vi hỗ trợ
                        </h3>
                        
                        <ul class="space-y-3 pt-1">
                            <li class="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                                <i class="fas fa-file-lines text-zinc-400 mt-0.5"></i>
                                <span>Mở khóa các <b class="text-zinc-900 dark:text-white font-semibold">Sheet</b> bị khóa chỉnh sửa ô, lọc, định dạng hoặc cấm sao chép dữ liệu.</span>
                            </li>
                            <li class="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                                <i class="fas fa-book text-zinc-400 mt-0.5"></i>
                                <span>Gỡ bỏ mật khẩu cấu trúc <b class="text-zinc-900 dark:text-white font-semibold">Workbook</b> (Không cho thêm/xóa/đổi tên sheet).</span>
                            </li>
                            <li class="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                                <i class="fas fa-shield-halved text-accent-theme mt-0.5"></i>
                                <span><b class="text-accent-theme font-semibold">100% Offline:</b> Tệp được giải mã và tái tạo ngay trên RAM trình duyệt, tuyệt đối không gửi lên máy chủ.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- LƯU Ý GIỚI HẠN -->
                    <div class="rounded-[24px] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 p-5 shadow-sm space-y-2">
                        <h3 class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-triangle-exclamation"></i> Giới hạn kỹ thuật
                        </h3>
                        <p class="text-xs text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
                            Công cụ <b>không hỗ trợ</b> file bị mã hóa toàn phần ngay khi mở file (yêu cầu mật khẩu để xem nội dung). Chỉ áp dụng cho các lớp khóa phân quyền bên trong bảng tính.
                        </p>
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
    const rootContainer = hostElement.querySelector('#excel-unlock-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);

    const dropzone = _('#eu-dropzone');
    const fileInput = _('#eu-file-input');
    const resultView = _('#eu-result-view');
    const viewLoading = _('#eu-loading');
    const viewSuccess = _('#eu-success');
    
    const elFilename = _('#eu-filename');
    const elFilesize = _('#eu-filesize');
    const btnDownload = _('#btn-eu-download');
    const btnReset = _('#btn-eu-reset');

    let unlockedBlob = null;
    let originalFilename = '';

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

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

    const resetUI = () => {
        unlockedBlob = null;
        if (fileInput) fileInput.value = '';
        dropzone?.classList.remove('hidden');
        resultView?.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
            resultView?.classList.add('hidden');
            resultView?.classList.remove('pointer-events-auto');
            viewLoading?.classList.remove('hidden');
            viewSuccess?.classList.add('hidden');
        }, 250);
    };

    const showLoading = () => {
        dropzone?.classList.add('hidden');
        resultView?.classList.remove('hidden');
        setTimeout(() => {
            resultView?.classList.replace('opacity-0', 'opacity-100');
            resultView?.classList.add('pointer-events-auto');
        }, 10);
    };

    const showSuccess = (file, blob) => {
        originalFilename = file.name;
        if (elFilename) elFilename.textContent = file.name;
        if (elFilesize) elFilesize.textContent = formatBytes(blob.size);
        unlockedBlob = blob;

        viewLoading?.classList.add('hidden');
        viewSuccess?.classList.remove('hidden');
    };

    const unlockExcel = async (file) => {
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            IslandKit.notify('Sai định dạng', 'Công cụ chỉ hỗ trợ tệp định dạng .xlsx.', 'error');
            resetUI();
            return;
        }

        showLoading();

        try {
            const JSZipObj = await loadJSZip();
            const zip = new JSZipObj();
            const content = await zip.loadAsync(file);
            let isModified = false;

            // 1. Gỡ bảo vệ cấu trúc Workbook
            if (content.file("xl/workbook.xml")) {
                let xml = await content.file("xl/workbook.xml").async("string");
                if (xml.includes("workbookProtection")) {
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

            if (!isModified) {
                IslandKit.notify('Thông báo', 'Tệp không có mật khẩu Sheet/Workbook cần gỡ bỏ.', 'warning');
                resetUI();
                return;
            }

            const newBlob = await zip.generateAsync({ 
                type: "blob", 
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
            });
            showSuccess(file, newBlob);
            IslandKit.notify('Thành công', 'Đã gỡ bỏ toàn bộ mật khẩu bảo vệ bảng tính.', 'success');

        } catch (err) {
            console.error(err);
            let msg = 'Lỗi trong quá trình xử lý tệp.';
            if (err.message?.includes('End of data reached') || err.message?.includes('Corrupted zip')) {
                msg = 'File bị mã hóa toàn phần hoặc bị hỏng.';
            }
            IslandKit.notify('Lỗi mở khóa', msg, 'error');
            resetUI();
        }
    };

    // Sự kiện kéo thả Dropzone
    dropzone?.addEventListener('click', () => fileInput?.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone?.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone?.addEventListener(eventName, () => {
            dropzone.classList.add('border-accent-theme', 'bg-accent-theme-alpha');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone?.addEventListener(eventName, () => {
            dropzone.classList.remove('border-accent-theme', 'bg-accent-theme-alpha');
        }, false);
    });

    dropzone?.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt?.files;
        if (files?.length) unlockExcel(files[0]);
    });

    fileInput?.addEventListener('change', function() {
        if (this.files?.length) unlockExcel(this.files[0]);
    });

    // Nút tải xuống & làm lại
    btnReset?.addEventListener('click', resetUI);

    btnDownload?.addEventListener('click', () => {
        if (!unlockedBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(unlockedBlob);
        link.download = 'Unlocked_' + originalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        IslandKit.notify('Đã tải xuống', `Đã xuất tệp Unlocked_${originalFilename}`, 'info');
    });
}