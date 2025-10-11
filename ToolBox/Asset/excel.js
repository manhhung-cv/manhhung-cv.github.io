// asset/excel-tool.js

document.addEventListener('DOMContentLoaded', () => {
    const toolContainer = document.getElementById('excel-tool');
    if (!toolContainer) return;

    // Create necessary hidden elements dynamically
    const inputFileEl = document.createElement('input');
    inputFileEl.type = 'file';
    inputFileEl.accept = ".xlsx, .xlsm";
    inputFileEl.style.display = 'none';
    document.body.appendChild(inputFileEl);

    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    // --- REGEX CONSTANTS ---
    const EXCEL_FILE_REGEX = /^.*\.xls[xm]$/i;
    const WORKSHEET_REGEX = /^xl\/worksheets\/.*\.xml$/i;

    // --- STATE VARIABLES ---
    let selectedFile = null;
    let outputZip = null;
    let outputZipFilename = "unlocked-file.xlsx";

    // --- UI TEMPLATES ---
    const TEMPLATES = {
        welcome: `
            <div class="tool-card">
                <div class="icon"><i class="fa-solid fa-shield-halved"></i></div>
                <h2>Xoá mật khẩu Excel</h2>
                <p>Công cụ này giúp bạn gỡ bỏ mật khẩu bảo vệ khỏi các trang tính trong tệp Excel. Mọi xử lý đều diễn ra an toàn ngay trên trình duyệt của bạn.</p>
                <button class="btn btn-primary" onclick="app.changeState('selectFile')">Bắt đầu</button>
            </div>`,
        selectFile: `
            <div class="tool-card">
                <div class="icon"><i class="fa-solid fa-file-arrow-up"></i></div>
                <h2>Chọn tệp Excel</h2>
                <p>Nhấn vào nút bên dưới để chọn tệp Excel (.xlsx, .xlsm) bạn muốn mở khoá. Tệp của bạn sẽ không được tải lên bất kỳ máy chủ nào.</p>
                <button class="btn btn-primary" onclick="app.handlers.selectFileClick()">Chọn tệp từ máy tính</button>
            </div>`,
        confirmFile: (filename) => `
            <div class="tool-card">
                <div class="icon"><i class="fa-solid fa-file-circle-question"></i></div>
                <h2>Xác nhận tệp</h2>
                <p>Bạn đã chọn tệp: <br><b>${filename}</b><br><br>Tiếp tục để xử lý?</p>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="app.changeState('selectFile')"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
                    <button class="btn btn-primary" onclick="app.handlers.startProcessing()"><i class="fa-solid fa-arrow-right"></i> Tiếp tục</button>
                </div>
            </div>`,
        processing: `
            <div class="tool-card">
                <h2>Đang xử lý...</h2>
                <div class="loader"></div>
                <p>Vui lòng chờ trong giây lát. Quá trình này có thể mất một chút thời gian đối với các tệp lớn.</p>
            </div>`,
        finished: (passwordsRemoved) => `
            <div class="tool-card">
                <div class="icon" style="color: var(--success-text);"><i class="fa-solid fa-circle-check"></i></div>
                <h2>Hoàn thành!</h2>
                <p>Đã xóa thành công <b>${passwordsRemoved}</b> mật khẩu khỏi tệp của bạn. Nhấn nút bên dưới để tải về.</p>
                <button class="btn btn-primary" onclick="app.handlers.downloadFile()"><i class="fa-solid fa-download"></i> Tải về tệp đã mở khoá</button>
                <div class="button-group" style="margin-top: 16px;">
                    <button class="btn btn-secondary" onclick="app.changeState('selectFile')">Xử lý tệp khác</button>
                </div>
            </div>`,
        error: (message) => `
            <div class="tool-card">
                <div class="icon" style="color: var(--danger-text);"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h2>Đã xảy ra lỗi</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="app.changeState('selectFile')">Thử lại</button>
            </div>`
    };

    // --- APPLICATION LOGIC ---
    const app = {
        changeState(newState, context = {}) {
            // FIX: Use a switch statement to correctly handle templates that are strings vs. functions
            let htmlContent = '';
            switch (newState) {
                case 'welcome':
                case 'selectFile':
                case 'processing':
                    htmlContent = TEMPLATES[newState];
                    break;
                case 'confirmFile':
                    htmlContent = TEMPLATES.confirmFile(context.filename);
                    break;
                case 'finished':
                    htmlContent = TEMPLATES.finished(context.passwordsRemoved);
                    break;
                case 'error':
                    htmlContent = TEMPLATES.error(context.message);
                    break;
                default:
                    console.error("Unknown state:", newState);
                    htmlContent = TEMPLATES.error("Đã xảy ra lỗi không xác định.");
            }
            toolContainer.innerHTML = htmlContent;

            // Reset state when going back to file selection
            if (newState === 'selectFile') {
                selectedFile = null;
                inputFileEl.value = '';
            }
        },
        handlers: {
            selectFileClick() {
                inputFileEl.click();
            },
            handleFileSelection(event) {
                if (event.target.files.length === 0) return;
                const file = event.target.files[0];
                if (file.name.match(EXCEL_FILE_REGEX)) {
                    selectedFile = file;
                    app.changeState('confirmFile', { filename: file.name });
                } else {
                    app.changeState('error', { message: 'Tệp bạn đã chọn không phải là tệp Excel hợp lệ (.xlsx hoặc .xlsm).' });
                }
            },
            startProcessing() {
                if (!selectedFile) {
                    app.changeState('error', { message: 'Không có tệp nào được chọn.' });
                    return;
                }
                app.changeState('processing');
                setTimeout(app.logic.processFile, 100);
            },
            downloadFile() {
                if (!outputZip) {
                    app.changeState('error', { message: 'Không có tệp đã xử lý để tải xuống.' });
                    return;
                }
                outputZip.generateAsync({ type: "base64" }).then(base64 => {
                    downloadLink.download = outputZipFilename;
                    downloadLink.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;
                    downloadLink.click();
                }, err => {
                    console.error(err);
                    app.changeState('error', { message: 'Đã xảy ra lỗi khi tạo tệp của bạn để tải xuống.' });
                });
            }
        },
        logic: {
            processFile() {
                const originalFilename = selectedFile.name;
                const extension = originalFilename.slice(originalFilename.lastIndexOf("."));
                const baseName = originalFilename.slice(0, originalFilename.lastIndexOf("."));
                outputZipFilename = `DaMoKhoa_${baseName}${extension}`;

                JSZip.loadAsync(selectedFile).then(zip => {
                    outputZip = new JSZip();
                    let passwordsRemoved = 0;
                    const fileEntries = Object.values(zip.files);
                    const promises = fileEntries.map(file => {
                        return file.async('string').then(content => {
                            if (file.name.match(WORKSHEET_REGEX)) {
                                const protectedSheetRegex = /<sheetProtection [^>]+>/;
                                if (protectedSheetRegex.test(content)) {
                                    content = content.replace(protectedSheetRegex, '');
                                    passwordsRemoved++;
                                }
                            }
                            outputZip.file(file.name, content, { dir: file.dir });
                        });
                    });

                    Promise.all(promises).then(() => {
                        if (passwordsRemoved > 0) {
                            app.changeState('finished', { passwordsRemoved });
                        } else {
                            app.changeState('error', { message: 'Không tìm thấy trang tính nào được bảo vệ bằng mật khẩu trong tệp này.' });
                        }
                    });
                }).catch(e => {
                    console.error(e);
                    app.changeState('error', { message: `Không thể đọc tệp. Tệp có thể bị hỏng hoặc không được hỗ trợ. Lỗi: ${e.message}` });
                });
            }
        },
        init() {
            window.app = this;
            inputFileEl.addEventListener('change', this.handlers.handleFileSelection);
            this.changeState('welcome');
        }
    };

    app.init();
});