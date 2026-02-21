import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .eu-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; }
            
            .eu-state { display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; min-height: 300px; }
            .eu-state.active { display: flex; animation: fadeIn 0.3s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

            .eu-dropzone {
                width: 100%; border: 2px dashed var(--border); border-radius: var(--radius);
                background: var(--bg-sec); transition: all 0.2s; cursor: pointer;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 50px 20px;
            }
            .eu-dropzone:hover, .eu-dropzone.dragover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
            .eu-icon { font-size: 3.5rem; color: #10b981; margin-bottom: 16px; transition: transform 0.2s; }
            .eu-dropzone:hover .eu-icon { transform: translateY(-5px); }
            
            .eu-title { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
            .eu-desc { font-size: 0.95rem; color: var(--text-mut); line-height: 1.5; max-width: 450px; }

            .eu-spinner {
                width: 50px; height: 50px; border: 4px solid var(--border);
                border-top-color: #3b82f6; border-radius: 50%;
                animation: spin 1s linear infinite; margin-bottom: 20px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }

            .eu-btn-large { padding: 12px 24px; font-size: 1.05rem; margin-top: 16px; border-radius: 30px; }
            
            .eu-error-box { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: var(--radius); margin-top: 16px; text-align: left; }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Mở khóa Sheet Excel</h1>
                <p class="text-mut">Xóa mật khẩu bảo vệ trang tính (.xlsx, .xlsm). Xử lý 100% trên trình duyệt của bạn (End to End - E2E).</p>
            </div>
        </div>

        <div class="eu-layout">
            <div class="card" style="padding: 0; overflow: hidden;">
                
                <input type="file" id="eu-file-input" accept=".xlsx, .xlsm" style="display: none;">

                <div class="eu-state active" id="state-upload">
                    <div class="eu-dropzone" id="eu-dropzone">
                        <i class="fas fa-file-excel eu-icon"></i>
                        <div class="eu-title">Nhấn để chọn hoặc kéo thả tệp vào đây</div>
                        <div class="eu-desc">Hỗ trợ chuẩn <b>.xlsx</b> và <b>.xlsm</b><br>Tệp của bạn không bao giờ rời khỏi thiết bị, đảm bảo an toàn tuyệt đối.</div>
                        <button class="btn btn-primary eu-btn-large" style="margin-top: 24px; pointer-events: none;">Chọn tệp từ máy tính</button>
                    </div>
                </div>

                <div class="eu-state" id="state-processing">
                    <div class="eu-spinner"></div>
                    <div class="eu-title">Đang bẻ khóa tệp...</div>
                    <div class="eu-desc" id="eu-process-filename" style="margin-top: 8px;">filename.xlsx</div>
                    <div class="text-mut" style="font-size: 0.85rem; margin-top: 16px;">Vui lòng không đóng trình duyệt.</div>
                </div>

                <div class="eu-state" id="state-success">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981; margin-bottom: 20px;"></i>
                    <div class="eu-title">Mở khóa thành công!</div>
                    <div class="eu-desc" id="eu-success-msg">Đã xóa mật khẩu bảo vệ.</div>
                    
                    <div class="flex-row" style="gap: 12px; margin-top: 24px; flex-wrap: wrap; justify-content: center;">
                        <button class="btn btn-primary eu-btn-large" id="btn-eu-download">
                            <i class="fas fa-download"></i> Tải tệp đã mở khóa
                        </button>
                        <button class="btn btn-outline eu-btn-large" id="btn-eu-reset">
                            Xử lý tệp khác
                        </button>
                    </div>
                </div>

                <div class="eu-state" id="state-error">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 16px;"></i>
                    <div class="eu-title">Đã xảy ra lỗi</div>
                    <div id="eu-error-msg" style="width: 100%;">Nội dung lỗi chi tiết hiển thị ở đây.</div>
                    <button class="btn btn-primary eu-btn-large" id="btn-eu-retry" style="margin-top: 24px;">Thử lại</button>
                </div>

            </div>
            
           <div class="card" style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2);">
                <div style="font-weight: 600; color: #3b82f6; margin-bottom: 8px;">
                    <i class="fas fa-info-circle"></i> Về công cụ này
                </div>
                <div class="text-mut" style="font-size: 0.9rem; line-height: 1.6;">
                    Công cụ này giúp bạn gỡ bỏ lớp bảo vệ "Sheet Protection" (chặn chỉnh sửa ô, cấu trúc) bên trong tệp Excel. 
                    <b>Lưu ý:</b> Công cụ không thể mở khóa các tệp có mật khẩu ngay lúc mở (File Open Password) do dữ liệu đã bị mã hóa hoàn toàn.
                    
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(59, 130, 246, 0.2);">
                        Bạn chưa có tệp để thử? 
                        <a href="/files/file-examples.xlsx" download style="color: #3b82f6; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-left: 4px; transition: opacity 0.2s;">
                            <i class="fas fa-file-download"></i> Tải tệp Excel mẫu
                        </a> (đã khóa Sheet sẵn) để trải nghiệm.
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const fileInput = document.getElementById('eu-file-input');
    const dropzone = document.getElementById('eu-dropzone');
    
    const states = {
        upload: document.getElementById('state-upload'),
        processing: document.getElementById('state-processing'),
        success: document.getElementById('state-success'),
        error: document.getElementById('state-error')
    };

    const processFilename = document.getElementById('eu-process-filename');
    const successMsg = document.getElementById('eu-success-msg');
    const errorMsg = document.getElementById('eu-error-msg');
    
    const btnDownload = document.getElementById('btn-eu-download');
    const btnReset = document.getElementById('btn-eu-reset');
    const btnRetry = document.getElementById('btn-eu-retry');

    let outputZip = null;
    let outputZipFilename = "unlocked-file.xlsx";

    const showState = (stateName) => {
        Object.values(states).forEach(el => el.classList.remove('active'));
        states[stateName].classList.add('active');
    };

    // Đọc File qua FileReader (Cách an toàn nhất cho JSZip)
    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error("Lỗi trình duyệt khi đọc tệp."));
            reader.readAsArrayBuffer(file);
        });
    };

    const processFile = async (file) => {
        if (!file.name.match(/^.*\.(xlsx|xlsm)$/i)) {
            errorMsg.innerHTML = '<div class="eu-error-msg" style="color:#ef4444;">Tệp bạn chọn không phải .xlsx hoặc .xlsm.</div>';
            showState('error');
            return;
        }

        processFilename.textContent = file.name;
        showState('processing');

        try {
            if (typeof JSZip === 'undefined') throw new Error("Không tìm thấy thư viện JSZip.");

            const originalFilename = file.name;
            const extension = originalFilename.slice(originalFilename.lastIndexOf("."));
            const baseName = originalFilename.slice(0, originalFilename.lastIndexOf("."));
            outputZipFilename = `${baseName}_Unlocked${extension}`;

            // Bước 1: Chuyển File thành ArrayBuffer bằng FileReader
            const arrayBuffer = await readFileAsArrayBuffer(file);
            
            // Bước 2: Load JSZip
            const zip = await JSZip.loadAsync(arrayBuffer);
            
            let passwordsRemoved = 0;
            const worksheetPromises = [];
            
            // Bước 3: Tìm thư mục worksheets và bẻ khóa
            const wsFolder = zip.folder("xl/worksheets");
            if (wsFolder) {
                wsFolder.forEach((relativePath, zipEntry) => {
                    if (zipEntry.name.endsWith('.xml')) {
                        worksheetPromises.push(async () => {
                            let content = await zipEntry.async('string');
                            const protectedSheetRegex = /<sheetProtection [^>]*\/?>(?:<\/sheetProtection>)?/gi;
                            
                            if (protectedSheetRegex.test(content)) {
                                content = content.replace(protectedSheetRegex, '');
                                zip.file(zipEntry.name, content);
                                passwordsRemoved++;
                            }
                        });
                    }
                });
            }

            // Gọi tuần tự thay vì Promise.all map để an toàn hơn
            for (const task of worksheetPromises) {
                await task();
            }

            // Xóa bảo vệ cấu trúc Workbook (nếu có)
            const workbookFile = zip.file("xl/workbook.xml");
            if (workbookFile) {
                let wbContent = await workbookFile.async("string");
                const wbProtectRegex = /<workbookProtection [^>]*\/?>(?:<\/workbookProtection>)?/gi;
                if (wbProtectRegex.test(wbContent)) {
                    wbContent = wbContent.replace(wbProtectRegex, '');
                    zip.file("xl/workbook.xml", wbContent);
                    passwordsRemoved++;
                }
            }

            if (passwordsRemoved > 0) {
                outputZip = zip;
                successMsg.innerHTML = `Đã tìm thấy và gỡ bỏ <b>${passwordsRemoved}</b> lớp mật khẩu bảo vệ trang tính.`;
                showState('success');
            } else {
                errorMsg.innerHTML = `
                    <div class="eu-error-box">
                        <b style="color: var(--text-main);">Không tìm thấy mật khẩu Sheet Protection.</b><br>
                        <ul style="color: var(--text-mut); font-size: 0.9rem; padding-left: 20px; margin-top: 8px;">
                            <li>Tệp này có thể chưa bị khóa Sheet.</li>
                            <li>Tệp bị mã hóa bằng thuật toán <b>Mật khẩu mở File (Open Password)</b>. Công cụ này không thể bẻ khóa dạng mã hóa đó.</li>
                        </ul>
                    </div>`;
                showState('error');
            }

        } catch (error) {
            console.error(error);
            
            // XỬ LÝ ĐÚNG LỖI CỦA NGƯỜI DÙNG: Không phải file Zip chuẩn
            if (error.message.includes("end of central directory") || error.message.includes("is this a zip file")) {
                errorMsg.innerHTML = `
                    <div class="eu-error-box">
                        <b style="color: #ef4444;"><i class="fas fa-times-circle"></i> Tệp không hợp lệ!</b><br>
                        <p style="color: var(--text-main); font-size: 0.95rem; margin-top: 8px; margin-bottom: 8px;">Tệp này bị sai cấu trúc hoặc bị đổi đuôi thủ công. Tệp XLSX chuẩn phải có cấu trúc giải nén (ZIP).</p>
                        <b style="color: var(--text-main); font-size: 0.85rem;">Cách khắc phục:</b>
                        <ul style="color: var(--text-mut); font-size: 0.85rem; padding-left: 20px; margin-top: 4px;">
                            <li>Bạn đang dùng file <b>.xls</b> hoặc <b>.csv</b> cũ bị đổi đuôi thành .xlsx?</li>
                            <li>Hãy mở file này bằng phần mềm Excel, chọn <i>File -> Save As -> Excel Workbook (*.xlsx)</i> để lưu lại đúng chuẩn trước khi mở khóa.</li>
                        </ul>
                    </div>
                `;
            } else {
                errorMsg.innerHTML = `<div class="eu-error-msg" style="color:#ef4444;">Lỗi không xác định: ${error.message}</div>`;
            }
            showState('error');
        }
    };

    // --- SỰ KIỆN KÉO THẢ & CLICK ---
    dropzone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processFile(e.target.files[0]);
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });

    // --- SỰ KIỆN NÚT BẤM ---
    btnDownload.addEventListener('click', async () => {
        if (!outputZip) return;
        try {
            const base64 = await outputZip.generateAsync({ type: "base64" });
            const link = document.createElement('a');
            link.download = outputZipFilename;
            link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            UI.showAlert('Thành công', 'Tệp đã được tải xuống.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Không thể tạo file để tải.', 'error');
        }
    });

    const resetTool = () => {
        fileInput.value = '';
        outputZip = null;
        showState('upload');
    };

    btnReset.addEventListener('click', resetTool);
    btnRetry.addEventListener('click', resetTool);
}