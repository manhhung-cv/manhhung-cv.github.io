
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const toolContainer = document.getElementById('excel-tool');
    const inputFileEl = document.getElementById('input-file');
    const downloadLink = document.getElementById('zip-downloader-tag');

    // --- REGEX CONSTANTS ---
    const EXCEL_FILE_REGEX = /^.*\.xls[xm]$/i;
    const WORKSHEET_REGEX = /^xl\/worksheets\/.*\.xml$/i;

    // --- STATE VARIABLES ---
    let selectedFile = null;
    let outputZip = null;
    let outputZipFilename = "unlocked-file.xlsx";

    // --- UI TEMPLATES ---
    // Using template literals to define the HTML for each state of the application
    const TEMPLATES = {
        welcome: `
                    <div class="tool-card">
                        <div class="icon"><i class="fa-solid fa-shield-halved"></i></div>
                        <h2>Xoá mật khẩu Excel</h2>
                        <p>Công cụ này giúp bạn gỡ bỏ mật khẩu bảo vệ khỏi các trang tính trong tệp Excel. Mọi xử lý đều diễn ra an toàn ngay trên trình duyệt của bạn.</p>
                        <button class="btn" onclick="app.changeState('selectFile')">Bắt đầu</button>
                    </div>
                `,
        selectFile: `
                    <div class="tool-card">
                        <div class="icon"><i class="fa-solid fa-file-arrow-up"></i></div>
                        <h2>Chọn tệp Excel</h2>
                        <p>Nhấn vào nút bên dưới để chọn tệp Excel (.xlsx, .xlsm) bạn muốn mở khoá. Tệp của bạn sẽ không được tải lên bất kỳ máy chủ nào.</p>
                        <button class="btn" onclick="app.handlers.selectFileClick()">Chọn tệp từ máy tính</button>
                    </div>
                `,
        confirmFile: (filename) => `
                    <div class="tool-card">
                        <div class="icon"><i class="fa-solid fa-file-circle-question"></i></div>
                        <h2>Xác nhận tệp</h2>
                        <p>Bạn đã chọn tệp: <br><b>${filename}</b><br><br>Tiếp tục để xử lý?</p>
                        <div class="button-group">
                            <button class="btn btn-secondary" onclick="app.changeState('selectFile')"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
                            <button class="btn" onclick="app.handlers.startProcessing()"><i class="fa-solid fa-arrow-right"></i> Tiếp tục</button>
                        </div>
                    </div>
                `,
        processing: `
                    <div class="tool-card">
                        <h2>Đang xử lý...</h2>
                        <div class="loader"></div>
                        <p>Vui lòng chờ trong giây lát. Quá trình này có thể mất một chút thời gian đối với các tệp lớn.</p>
                    </div>
                `,
        finished: (passwordsRemoved, filename) => `
                    <div class="tool-card">
                        <div class="icon" style="color: #28a745;"><i class="fa-solid fa-circle-check"></i></div>
                        <h2>Hoàn thành!</h2>
                        <p>Đã xóa thành công <b>${passwordsRemoved}</b> mật khẩu khỏi tệp của bạn. Nhấn nút bên dưới để tải về.</p>
                        <button class="btn" onclick="app.handlers.downloadFile()"><i class="fa-solid fa-download"></i> Tải về tệp đã mở khoá</button>
                        <div class="button-group">
                            <button class="btn btn-secondary" onclick="app.changeState('selectFile')">Xử lý tệp khác</button>
                        </div>
                    </div>
                `,
        error: (message) => `
                    <div class="tool-card">
                        <div class="icon" style="color: #dc3545;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <h2>Đã xảy ra lỗi</h2>
                        <p>${message}</p>
                        <button class="btn" onclick="app.changeState('selectFile')">Thử lại</button>
                    </div>
                `
    };

    // --- APPLICATION LOGIC ---
    const app = {
        // Main function to change the UI state
        changeState(newState, context) {
            switch (newState) {
                case 'welcome':
                    toolContainer.innerHTML = TEMPLATES.welcome;
                    break;
                case 'selectFile':
                    selectedFile = null;
                    inputFileEl.value = ''; // Reset file input
                    toolContainer.innerHTML = TEMPLATES.selectFile;
                    break;
                case 'confirmFile':
                    toolContainer.innerHTML = TEMPLATES.confirmFile(context.filename);
                    break;
                case 'processing':
                    toolContainer.innerHTML = TEMPLATES.processing;
                    break;
                case 'finished':
                    toolContainer.innerHTML = TEMPLATES.finished(context.passwordsRemoved, context.filename);
                    break;
                case 'error':
                    toolContainer.innerHTML = TEMPLATES.error(context.message);
                    break;
                default:
                    console.error("Unknown state:", newState);
                    toolContainer.innerHTML = TEMPLATES.error("Đã xảy ra lỗi không xác định.");
            }
        },

        // Event handlers to be called from the UI
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
                // Use setTimeout to allow the UI to update before starting the heavy task
                setTimeout(app.logic.processFile, 100);
            },

            downloadFile() {
                if (!outputZip) {
                    app.changeState('error', { message: 'Không có tệp đã xử lý để tải xuống.' });
                    return;
                }

                outputZip.generateAsync({ type: "base64" }).then(function (base64) {
                    downloadLink.download = outputZipFilename;
                    downloadLink.href = 'data:application/zip;base64,' + base64;
                    downloadLink.click();
                }, function (err) {
                    console.error(err);
                    app.changeState('error', { message: 'Đã xảy ra lỗi khi tạo tệp của bạn để tải xuống.' });
                });
            }
        },

        // Core business logic
        logic: {
            processFile() {
                const originalFilename = selectedFile.name;
                const extension = "." + originalFilename.split(".").pop();
                const baseName = originalFilename.substring(0, originalFilename.length - extension.length);
                outputZipFilename = `DaMoKhoa_${baseName}${extension}`;

                JSZip.loadAsync(selectedFile).then(zip => {
                    outputZip = new JSZip();
                    let filesProcessed = 0;
                    let passwordsRemoved = 0;
                    const fileEntries = Object.values(zip.files);
                    const totalFiles = fileEntries.length;

                    if (totalFiles === 0) {
                        app.changeState('error', { message: 'Tệp Excel có vẻ trống hoặc bị hỏng.' });
                        return;
                    }

                    fileEntries.forEach(file => {
                        const isWorksheet = file.name.match(WORKSHEET_REGEX);

                        file.async('string').then(content => {
                            if (isWorksheet) {
                                const startIndex = content.indexOf('<sheetProtection ');
                                if (startIndex !== -1) {
                                    const endIndex = content.indexOf('/>', startIndex) + 2;
                                    content = content.replace(content.substring(startIndex, endIndex), "");
                                    passwordsRemoved++;
                                }
                            }
                            outputZip.file(file.name, content);
                            filesProcessed++;

                            // Check if all files are processed
                            if (filesProcessed === totalFiles) {
                                if (passwordsRemoved > 0) {
                                    app.changeState('finished', { passwordsRemoved: passwordsRemoved, filename: originalFilename });
                                } else {
                                    app.changeState('error', { message: 'Không tìm thấy mật khẩu nào trong các trang tính của tệp này.' });
                                }
                            }
                        });
                    });
                }).catch(e => {
                    console.error(e);
                    app.changeState('error', { message: `Không thể đọc tệp. Lỗi: ${e.message}` });
                });
            }
        },

        // Initialize the application
        init() {
            window.app = this; // Make app globally accessible for inline onclick events
            inputFileEl.addEventListener('change', this.handlers.handleFileSelection);
            this.changeState('welcome');
        }
    };

    // Start the application
    app.init();
});