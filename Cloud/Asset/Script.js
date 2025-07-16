// =================================================================
// CẤU HÌNH (Sử dụng config của bạn)
// =================================================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCQdfZcvfTJ6Oai-7rwaRLlM1ElxjqiAS0",
    authDomain: "storage-b226a.firebaseapp.com",
    databaseURL: "https://storage-b226a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "storage-b226a",
    storageBucket: "storage-b226a.firebasestorage.app",
    messagingSenderId: "773716707827",
    appId: "1:773716707827:web:31d8bf91f7184f7169ea86",
    measurementId: "G-RZ3JK0V4F3"
};
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWmdo70vWlz-5dRUIQFcmX77B_Uvplk5lb0B9mHPzSMssstKaW9YCZ1WWNiiHu3yzXew/exec";

// =================================================================
// KHỞI TẠO
// =================================================================
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const DOMElements = {
    loadingScreen: document.getElementById('loadingScreen'), authScreen: document.getElementById('authScreen'), mainScreen: document.getElementById('mainScreen'), loginView: document.getElementById('loginView'), registerView: document.getElementById('registerView'), forgotPasswordView: document.getElementById('forgotPasswordView'), loginForm: document.getElementById('loginForm'), registerForm: document.getElementById('registerForm'), forgotPasswordForm: document.getElementById('forgotPasswordForm'), authStatus: document.getElementById('authStatus'), userEmailDisplay: document.getElementById('userEmailDisplay'), logoutButton: document.getElementById('logoutButton'), uploadStatus: document.getElementById('uploadStatus'), fileInput: document.getElementById('fileInput'), dropZone: document.getElementById('drop-zone'), fileEditorContainer: document.getElementById('file-editor-container'), fileEditorList: document.getElementById('file-editor-list'), startUploadBtn: document.getElementById('start-upload-btn'), uploadChoiceModal: document.getElementById('upload-choice-modal'), compressOptionsModal: document.getElementById('compress-options-modal'), fileCountSpan: document.getElementById('file-count'), uploadIndividualBtn: document.getElementById('upload-individual-btn'), uploadCompressBtn: document.getElementById('upload-compress-btn'), compressForm: document.getElementById('compress-form'), cancelCompressBtn: document.getElementById('cancel-compress-btn'), listLoader: document.getElementById('listLoader'), fileListContainer: document.getElementById('fileListContainer'), fileListBody: document.getElementById('fileListBody'), noFilesMessage: document.getElementById('noFilesMessage'), errorMessage: document.getElementById('errorMessage'), themeToggle: document.getElementById('theme-toggle'), themeIcons: { system: document.getElementById('theme-icon-system'), light: document.getElementById('theme-icon-light'), dark: document.getElementById('theme-icon-dark') }
};
let originalFiles = [];

// =================================================================
// QUẢN LÝ GIAO DIỆN (THEME)
// =================================================================
(function () {
    const themes = ['system', 'light', 'dark']; let currentTheme = localStorage.getItem('theme') || 'system';
    function applyTheme(theme) { Object.values(DOMElements.themeIcons).forEach(icon => icon.style.display = 'none'); DOMElements.themeIcons[theme].style.display = 'block'; document.documentElement.dataset.theme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme; }
    DOMElements.themeToggle.addEventListener('click', () => { currentTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length]; localStorage.setItem('theme', currentTheme); applyTheme(currentTheme); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (currentTheme === 'system') applyTheme('system'); });
    applyTheme(currentTheme);
})();


// =================================================================
// QUẢN LÝ XÁC THỰC
// =================================================================
(function () {
    auth.onAuthStateChanged(user => {
        DOMElements.loadingScreen.classList.add('hidden');
        if (user) { DOMElements.authScreen.classList.add('hidden'); DOMElements.mainScreen.classList.remove('hidden'); DOMElements.userEmailDisplay.textContent = user.email; fetchFiles(); }
        else { DOMElements.mainScreen.classList.add('hidden'); DOMElements.authScreen.classList.remove('hidden'); showAuthView('loginView'); }
    });
    function showAuthView(viewId) { ['loginView', 'registerView', 'forgotPasswordView'].forEach(id => DOMElements[id].classList.add('hidden')); DOMElements[viewId].classList.remove('hidden'); DOMElements.authStatus.style.display = 'none'; }
    function setAuthStatus(message, type) { const el = DOMElements.authStatus; el.textContent = message; el.className = `status-message status-${type}`; el.style.display = 'block'; }
    DOMElements.loginForm.addEventListener('submit', e => { e.preventDefault(); setAuthStatus('Đang đăng nhập...', 'info'); auth.signInWithEmailAndPassword(e.target.loginEmail.value, e.target.loginPassword.value).catch(err => setAuthStatus(`Lỗi: ${err.message}`, 'error')); });

    // === HÀM ĐƯỢC SỬA LỖI ===
    DOMElements.registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const { registerEmail, registerPassword, inviteCode } = e.target;
        setAuthStatus('Đang kiểm tra mã...', 'info');
        try {
            const docSnap = await db.collection('invitationCodes').doc(inviteCode.value.trim()).get();
            // SỬA LỖI: Bỏ dấu () ở docSnap.exists
            if (docSnap.exists) {
                setAuthStatus('Mã hợp lệ. Đang tạo tài khoản...', 'info');
                await auth.createUserWithEmailAndPassword(registerEmail.value, registerPassword.value);
            } else {
                setAuthStatus('Mã giới thiệu không hợp lệ.', 'error');
            }
        } catch (err) {
            setAuthStatus(`Lỗi: ${err.message}`, 'error');
        }
    });

    DOMElements.forgotPasswordForm.addEventListener('submit', e => { e.preventDefault(); setAuthStatus('Đang gửi email...', 'info'); auth.sendPasswordResetEmail(e.target.forgotEmail.value).then(() => setAuthStatus('Đã gửi link khôi phục!', 'success')).catch(err => setAuthStatus(`Lỗi: ${err.message}`, 'error')); });
    ['showRegister', 'showLogin', 'showForgotPassword', 'backToLogin'].forEach(id => { document.getElementById(id).addEventListener('click', e => { e.preventDefault(); const viewMap = { 'showRegister': 'registerView', 'showLogin': 'loginView', 'showForgotPassword': 'forgotPasswordView', 'backToLogin': 'loginView' }; showAuthView(viewMap[id]); }); });
    DOMElements.logoutButton.addEventListener('click', () => auth.signOut());
})();


// =================================================================
// QUẢN LÝ TẢI LÊN
// =================================================================
const escapeHtml = str => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    if (DOMElements.fileEditorContainer.classList.contains('hidden')) {
        originalFiles = [];
        DOMElements.fileEditorList.innerHTML = '';
    }
    const newFiles = Array.from(files);
    newFiles.forEach(file => {
        const currentIndex = originalFiles.length;
        originalFiles.push(file);
        const lastDot = file.name.lastIndexOf('.');
        const baseName = (lastDot === -1) ? file.name : file.name.substring(0, lastDot);
        const extension = (lastDot === -1) ? '' : file.name.substring(lastDot);
        const li = document.createElement('li');
        li.className = 'file-editor-item';
        li.dataset.index = currentIndex;
        li.innerHTML = `<input type="text" value="${escapeHtml(baseName)}" class="form-input file-editor-item-basename"><input type="text" value="${escapeHtml(extension)}" class="form-input file-editor-item-extension" readonly><div class="file-editor-status"></div><button type="button" class="btn-delete-item" title="Xóa tệp này">&times;</button>`;
        DOMElements.fileEditorList.appendChild(li);
    });
    DOMElements.fileEditorContainer.classList.remove('hidden');
    DOMElements.fileInput.value = '';
}

DOMElements.fileEditorList.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-delete-item')) {
        const item = target.closest('.file-editor-item');
        item.remove();
        if (DOMElements.fileEditorList.children.length === 0) {
            DOMElements.fileEditorContainer.classList.add('hidden');
        }
        return;
    }
    if (target.classList.contains('file-editor-item-extension') && target.readOnly) {
        e.preventDefault();
        const userConfirmed = confirm("CẢNH BÁO:\n\nThay đổi đuôi tệp có thể khiến tệp không thể sử dụng được.\n\nBạn có chắc chắn muốn tiếp tục?");
        if (userConfirmed) { target.readOnly = false; target.classList.add('is-editable'); target.focus(); target.select(); }
    }
});

DOMElements.startUploadBtn.addEventListener('click', () => {
    const listItems = DOMElements.fileEditorList.querySelectorAll('li');
    if (listItems.length === 0) { alert("Vui lòng chọn ít nhất một tệp để tải lên."); return; }
    if (listItems.length === 1) { uploadFilesIndividually(); }
    else { DOMElements.fileCountSpan.textContent = listItems.length; DOMElements.uploadChoiceModal.classList.remove('hidden'); }
});

DOMElements.uploadIndividualBtn.addEventListener('click', () => { DOMElements.uploadChoiceModal.classList.add('hidden'); uploadFilesIndividually(); });
DOMElements.uploadCompressBtn.addEventListener('click', () => {
    DOMElements.uploadChoiceModal.classList.add('hidden'); DOMElements.compressForm.reset();
    const now = new Date(); const defaultName = `HunqUP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    DOMElements.compressForm['zip-filename'].value = defaultName; DOMElements.compressOptionsModal.classList.remove('hidden');
});
DOMElements.compressForm.addEventListener('submit', e => { e.preventDefault(); const filename = e.target['zip-filename'].value; const password = e.target['zip-password'].value; DOMElements.compressOptionsModal.classList.add('hidden'); compressAndUpload(filename, password); });
DOMElements.cancelCompressBtn.addEventListener('click', () => DOMElements.compressOptionsModal.classList.add('hidden'));

async function uploadFilesIndividually() {
    const listItems = Array.from(DOMElements.fileEditorList.children);
    DOMElements.startUploadBtn.disabled = true;
    for (const item of listItems) {
        const index = parseInt(item.dataset.index, 10);
        const file = originalFiles[index];
        const baseName = item.querySelector('.file-editor-item-basename').value;
        const extension = item.querySelector('.file-editor-item-extension').value;
        const newFileName = baseName + extension;
        const statusEl = item.querySelector('.file-editor-status');
        try {
            statusEl.textContent = 'Đang tải...'; statusEl.className = 'file-editor-status status-info';
            const result = await uploadFileToServer(file, newFileName);
            statusEl.textContent = `✓ ${result.fileSizeFormatted}`; statusEl.className = 'file-editor-status status-success';
            item.classList.add('fade-out');
            setTimeout(() => {
                item.remove();
                if (DOMElements.fileEditorList.children.length === 0) {
                    DOMElements.fileEditorContainer.classList.add('hidden');
                }
            }, 500);
        } catch (error) { statusEl.textContent = 'Thất bại'; statusEl.className = 'file-editor-status status-error'; }
    }
    DOMElements.startUploadBtn.disabled = false;
    fetchFiles();
}

async function compressAndUpload(zipFileName, password) {
    const listItems = Array.from(DOMElements.fileEditorList.children);
    DOMElements.fileEditorContainer.classList.add('hidden');
    showUploadStatus(`Đang nén ${listItems.length} tệp...`, 'info');
    try {
        const zip = new JSZip();
        for (const item of listItems) {
            const index = parseInt(item.dataset.index, 10);
            const file = originalFiles[index];
            const newFileName = item.querySelector('.file-editor-item-basename').value + item.querySelector('.file-editor-item-extension').value;
            zip.file(newFileName, file);
        }
        const zipOptions = { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } };
        if (password) zipOptions.password = password;
        const content = await zip.generateAsync(zipOptions);
        const zipFile = new File([content], `${zipFileName}.zip`, { type: 'application/zip' });
        showUploadStatus(`Đã nén xong. Bắt đầu tải lên...`, 'info');
        const result = await uploadFileToServer(zipFile, zipFile.name);
        showUploadStatus(`Tải lên tệp nén ${result.fileName} thành công! (${result.fileSizeFormatted})`, 'success');
        fetchFiles();
    } catch (error) { showUploadStatus(`Lỗi: ${error.message}`, 'error'); }
}

function uploadFileToServer(file, fileName) {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser; if (!file || !user) return reject(new Error("Chưa đăng nhập hoặc không có tệp."));
        const reader = new FileReader();
        reader.onload = e => {
            const fileObject = { fileName, mimeType: file.type || 'application/octet-stream', fileSize: file.size, fileData: e.target.result, uploaderEmail: user.email };
            fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(fileObject), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
                .then(response => response.json()).then(data => data.status === 'success' ? resolve(data) : reject(new Error(data.message || 'Lỗi server.'))).catch(reject);
        };
        reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
        reader.readAsDataURL(file);
    });
}
function showUploadStatus(message, type) { const el = DOMElements.uploadStatus; el.textContent = message; el.className = `status-message status-${type}`; el.style.display = 'block'; }

// Lịch sử tệp & Sao chép link
function fetchFiles() {
    const user = auth.currentUser; if (!user) return;
    DOMElements.listLoader.classList.remove('hidden');
    ['errorMessage', 'noFilesMessage', 'fileListContainer'].forEach(id => { DOMElements[id].classList.add('hidden'); });
    const urlWithParams = new URL(SCRIPT_URL); urlWithParams.searchParams.append('userEmail', user.email);
    fetch(urlWithParams).then(res => res.ok ? res.json() : Promise.reject(`Lỗi mạng: ${res.statusText}`)).then(displayFiles).catch(showFetchError);
}
function displayFiles(response) {
    DOMElements.listLoader.classList.add('hidden'); DOMElements.fileListBody.innerHTML = '';
    if (response.status === 'success' && response.data?.length > 0) {
        DOMElements.fileListContainer.classList.remove('hidden');
        response.data.forEach(file => {
            const row = DOMElements.fileListBody.insertRow();
            row.innerHTML = `
            <td><button class="btn btn-copy" data-url="${escapeHtml(file.fileUrl)}"><i class="fas fa-copy"></i></button></td>
            <td><a href="${file.fileUrl}" target="_blank">${escapeHtml(file.fileName)}</a></td>
            <td>${escapeHtml(file.fileSize)}</td>
            <td>${escapeHtml(file.uploadDate)}</td>
            <td>${escapeHtml(file.uploaderEmail)}</td>
            `;
        });
    } else if (response.status === 'success') { DOMElements.noFilesMessage.classList.remove('hidden'); }
    else { throw new Error(response.message || 'Lỗi server.'); }
}
function showFetchError(error) { DOMElements.listLoader.classList.add('hidden'); DOMElements.errorMessage.textContent = `Lỗi tải lịch sử: ${error.message}`; DOMElements.errorMessage.classList.remove('hidden'); }
DOMElements.fileListBody.addEventListener('click', (e) => {
    const copyButton = e.target.closest('.btn-copy');
    if (copyButton) {
        navigator.clipboard.writeText(copyButton.dataset.url).then(() => {
            const originalText = copyButton.textContent; copyButton.textContent = 'Đã chép!'; copyButton.disabled = true;
            setTimeout(() => { copyButton.textContent = originalText; copyButton.disabled = false; }, 2000);
        }).catch(err => { console.error('Không thể sao chép link:', err); alert('Lỗi: Không thể sao chép link.'); });
    }
});

// Setup ban đầu
function setupDragAndDrop(callback) {
    const dropZone = DOMElements.dropZone;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
        document.body.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(eventName => dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false));
    dropZone.addEventListener('drop', e => callback(e.dataTransfer.files), false);
}
setupDragAndDrop(handleFileSelect);
DOMElements.fileInput.addEventListener('change', e => handleFileSelect(e.target.files));