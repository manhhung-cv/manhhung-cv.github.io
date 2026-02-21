import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .ris-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            @media(min-width: 768px) {
                .ris-layout { display: grid; grid-template-columns: 1fr 1fr; }
            }
            
            /* Upload Zone */
            .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 40px 20px; text-align: center; background: var(--bg-sec); cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; }
            .upload-zone:hover, .upload-zone.dragover { border-color: #3b82f6; background: #3b82f610; }
            .upload-zone i { font-size: 3rem; color: #94a3b8; margin-bottom: 16px; transition: color 0.3s; }
            .upload-zone:hover i { color: #3b82f6; }
            .upload-zone p { margin: 8px 0; color: var(--text-mut); font-size: 0.95rem; }
            .upload-zone .highlight { color: #3b82f6; font-weight: 600; }
            
            /* Divider */
            .divider { display: flex; align-items: center; text-align: center; margin: 20px 0; color: var(--text-mut); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
            .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border); }
            .divider::before { margin-right: .5em; }
            .divider::after { margin-left: .5em; }
            
            /* Input URL */
            .url-input-group { display: flex; width: 100%; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-main); }
            .url-input-group input { flex: 1; padding: 12px 16px; border: none; background: transparent; color: var(--text-main); outline: none; }
            .url-input-group button { padding: 0 16px; background: var(--bg-sec); border: none; border-left: 1px solid var(--border); color: var(--text-main); font-weight: 600; cursor: pointer; transition: background 0.2s; }
            .url-input-group button:hover { background: #e2e8f0; }
            
            /* Preview Area */
            .preview-card { background: var(--bg-sec); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; height: 100%; }
            .preview-img-container { flex: 1; border-radius: 8px; overflow: hidden; background: var(--bg-main); display: flex; align-items: center; justify-content: center; min-height: 200px; margin-bottom: 20px; border: 1px dashed var(--border); position: relative; }
            .preview-img-container img { max-width: 100%; max-height: 250px; object-fit: contain; display: none; }
            .preview-placeholder { color: var(--text-mut); font-size: 0.9rem; text-align: center; padding: 20px; }
            
            /* Action Buttons */
            .search-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .engine-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px; border: 1px solid transparent; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; color: white; opacity: 0.5; pointer-events: none; }
            .engine-btn.ready { opacity: 1; pointer-events: auto; }
            .engine-btn.ready:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            
            /* Brand Colors */
            .btn-google { background: #ea4335; }
            .btn-yandex { background: #fc3f1d; }
            .btn-bing { background: #00809d; }
            .btn-tineye { background: #166e99; }
            
            .security-badge { margin-top: 16px; padding: 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; font-size: 0.85rem; text-align: center; line-height: 1.5; }
            @media (prefers-color-scheme: dark) {
                .url-input-group button:hover { background: #334155; }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Tìm kiếm bằng hình ảnh</h1>
                <p class="text-mut">Tìm nguồn gốc hình ảnh, xem ảnh tương tự trên Google Lens, Yandex, Bing...</p>
            </div>
            <button class="btn btn-outline" id="ris-clear" style="padding: 6px 12px; font-size: 0.85rem;">
                <i class="fas fa-trash-alt text-danger"></i> Xóa ảnh
            </button>
        </div>

        <div class="ris-layout">
            <div class="card" style="padding: 20px;">
                <input type="file" id="ris-file-input" accept="image/*" style="display: none;">
                
                <div class="upload-zone" id="ris-drop-zone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p><span class="highlight">Bấm để chọn ảnh</span> hoặc Kéo thả ảnh vào đây</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">(Hỗ trợ dán ảnh trực tiếp bằng Ctrl+V)</p>
                </div>

                <div class="divider">Hoặc</div>

                <div class="url-input-group">
                    <input type="url" id="ris-url-input" placeholder="Dán đường link (URL) của ảnh vào đây...">
                    <button id="ris-url-btn">Nhận ảnh</button>
                </div>
            </div>

            <div class="preview-card">
                <div class="preview-img-container">
                    <div class="preview-placeholder" id="ris-placeholder">
                        <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5; display: block;"></i>
                        Chưa có ảnh nào được chọn
                    </div>
                    <img id="ris-preview-img" src="" alt="Preview">
                </div>

                <h3 style="font-size: 1rem; margin-bottom: 12px; font-weight: 600; color: var(--text-main);">Tìm kiếm trên:</h3>
                <div class="search-actions">
                    <button class="engine-btn btn-google" data-engine="google">
                        <i class="fab fa-google"></i> Google Lens
                    </button>
                    <button class="engine-btn btn-yandex" data-engine="yandex">
                        <i class="fab fa-yandex"></i> Yandex
                    </button>
                    <button class="engine-btn btn-bing" data-engine="bing">
                        <i class="fab fa-microsoft"></i> Bing Visual
                    </button>
                    <button class="engine-btn btn-tineye" data-engine="tineye">
                        <i class="fas fa-eye"></i> TinEye
                    </button>
                </div>
                
                <div class="security-badge">
                    <i class="fas fa-shield-check"></i> <b>Bảo mật 100%:</b> Ảnh của bạn không bị tải lên bất kỳ máy chủ bên thứ 3 nào. Công cụ sử dụng bộ nhớ tạm (Clipboard) của máy để chuyển ảnh thẳng sang Google/Bing.
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const dropZone = document.getElementById('ris-drop-zone');
    const fileInput = document.getElementById('ris-file-input');
    const urlInput = document.getElementById('ris-url-input');
    const urlBtn = document.getElementById('ris-url-btn');
    const clearBtn = document.getElementById('ris-clear');
    const previewImg = document.getElementById('ris-preview-img');
    const placeholder = document.getElementById('ris-placeholder');
    const engineBtns = document.querySelectorAll('.engine-btn');

    let currentMode = null; // 'file' hoặc 'url'
    let currentUrl = '';

    // Cấu hình URL khi tìm kiếm bằng Link (GET Request)
    const getUrls = {
        google: 'https://lens.google.com/uploadbyurl?url=',
        yandex: 'https://yandex.com/images/search?rpt=imageview&url=',
        bing: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:',
        tineye: 'https://tineye.com/search?url='
    };

    // Cấu hình URL trang chủ công cụ để dán ảnh thủ công
    const manualUrls = {
        google: 'https://lens.google.com/',
        yandex: 'https://yandex.com/images/',
        bing: 'https://www.bing.com/visualsearch',
        tineye: 'https://tineye.com/'
    };

    function setPreviewReady() {
        placeholder.style.display = 'none';
        previewImg.style.display = 'block';
        engineBtns.forEach(btn => btn.classList.add('ready'));
    }

    function resetUI() {
        currentMode = null;
        currentUrl = '';
        fileInput.value = '';
        urlInput.value = '';
        previewImg.src = '';
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
        engineBtns.forEach(btn => btn.classList.remove('ready'));
    }

    // Xử lý Ảnh Local
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            return UI.showAlert('Lỗi', 'Vui lòng chọn tệp hình ảnh hợp lệ.', 'error');
        }
        currentMode = 'file';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            setPreviewReady();
        };
        reader.readAsDataURL(file);
    }

    // Các sự kiện upload file (Click, Drag, Paste)
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
    
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    document.addEventListener('paste', (e) => {
        if (document.activeElement === urlInput) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                handleFile(item.getAsFile());
                UI.showAlert('Đã nhận', 'Đã dán ảnh thành công.', 'success');
                return;
            }
        }
    });

    // Xử lý Link
    function handleUrl() {
        const url = urlInput.value.trim();
        if (!url || !url.startsWith('http')) return UI.showAlert('Lỗi', 'Link không hợp lệ.', 'warning');
        currentMode = 'url';
        currentUrl = url;
        previewImg.src = url;
        setPreviewReady();
    }
    urlBtn.addEventListener('click', handleUrl);
    urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUrl(); });
    clearBtn.addEventListener('click', resetUI);

    // XỬ LÝ GỬI YÊU CẦU TÌM KIẾM
    engineBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!currentMode) return;
            const engineName = btn.dataset.engine;

            // Nếu là URL, tìm trực tiếp không cần copy
            if (currentMode === 'url') {
                window.open(getUrls[engineName] + encodeURIComponent(currentUrl), '_blank');
                return;
            }

            // Nếu là File máy tính -> Copy vào Clipboard và mở trang để dán
            if (currentMode === 'file') {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang copy...';

                try {
                    // Chuyển ảnh trên canvas thành định dạng PNG tiêu chuẩn để tránh lỗi Clipboard
                    const canvas = document.createElement('canvas');
                    canvas.width = previewImg.naturalWidth;
                    canvas.height = previewImg.naturalHeight;
                    canvas.getContext('2d').drawImage(previewImg, 0, 0);
                    
                    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);

                    // Mở tab tìm kiếm tương ứng
                    window.open(manualUrls[engineName], '_blank');
                    
                    // Thông báo hướng dẫn
                    UI.showAlert('Thành công', 'Đã copy ảnh! Hãy bấm Ctrl+V (hoặc Chuột phải -> Dán) vào ô tìm kiếm trên tab vừa mở.', 'success');
                } catch (err) {
                    console.error('Lỗi Clipboard:', err);
                    UI.showAlert('Không thể Copy', 'Trình duyệt của bạn không hỗ trợ tính năng copy ảnh. Vui lòng thử trên trình duyệt khác.', 'error');
                } finally {
                    btn.innerHTML = originalHTML;
                }
            }
        });
    });
}