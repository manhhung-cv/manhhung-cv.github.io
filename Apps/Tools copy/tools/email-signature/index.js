import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .es-layout { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
            @media(min-width: 992px) {
                .es-layout { display: grid; grid-template-columns: 1fr 1fr; }
            }
            .es-form-group { margin-bottom: 12px; }
            .es-form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.9rem; color: var(--text-main); }
            .es-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-sec); color: var(--text-main); font-family: inherit; transition: all 0.2s; }
            .es-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px #3b82f640; }
            .es-color-picker { width: 100%; height: 42px; padding: 0; border: 1px solid var(--border); cursor: pointer; border-radius: 6px; background: var(--bg-sec); }
            .es-preview-box { background: #f8fafc; border: 1px dashed var(--border); border-radius: 8px; padding: 24px; overflow-x: auto; display: flex; justify-content: center; align-items: center; min-height: 300px; }
            .tpl-btn { flex: 1; padding: 8px 4px; font-size: 0.85rem; text-align: center; white-space: nowrap; }
            .section-title { margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; font-size: 1.1rem; font-weight: 600; }
            
            /* Toggle Switch Styles */
            .toggle-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .toggle-checkbox { cursor: pointer; accent-color: #3b82f6; width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; }
            .toggle-text { font-size: 0.8rem; font-weight: normal; color: var(--text-mut); cursor: pointer; user-select: none; }

            /* Tabs Styles */
            .view-tabs { display: flex; gap: 16px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
            .view-tab { background: transparent; border: none; font-size: 0.95rem; font-weight: 600; color: var(--text-mut); cursor: pointer; padding: 8px 4px; border-bottom: 2px solid transparent; transition: all 0.2s; }
            .view-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
            .code-display { width: 100%; min-height: 280px; padding: 16px; background: #1e293b; color: #e2e8f0; font-family: monospace; font-size: 13px; border-radius: 6px; border: none; resize: vertical; outline: none; line-height: 1.5; }
            
            .action-btn { padding: 4px 8px; font-size: 0.8rem; border-radius: 4px; }
            
            @media (prefers-color-scheme: dark) {
                .es-preview-box { background: var(--bg-sec); }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Tạo chữ ký Email</h1>
                <p class="text-mut">Thiết kế, tùy chỉnh và xuất nhập dữ liệu chữ ký email dễ dàng.</p>
            </div>
        </div>

        <div class="es-layout">
            <div class="card" style="padding: 20px; overflow-y: auto; max-height: 85vh;">
                <div class="flex-between section-title" style="margin-top: 0;">
                    <h3 style="margin: 0;">Thông tin cá nhân</h3>
                    <div class="flex-row" style="gap: 6px;">
                        <button class="btn btn-outline action-btn" id="es-save" title="Lưu tiến trình vào trình duyệt"><i class="fas fa-save"></i> Lưu</button>
                        <button class="btn btn-outline action-btn" id="es-export" title="Xuất ra file JSON"><i class="fas fa-download"></i> Xuất</button>
                        <button class="btn btn-outline action-btn" id="es-import" title="Nhập từ file JSON"><i class="fas fa-upload"></i> Nhập</button>
                        <input type="file" id="es-file-input" accept=".json" style="display: none;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="es-form-group">
                        <label>Họ và tên</label>
                        <input type="text" id="es-name" class="es-input" value="Nguyễn Văn A">
                    </div>
                    <div class="es-form-group">
                        <div class="toggle-label">
                            <label style="margin:0;">Chức vụ</label>
                            <label class="toggle-text"><input type="checkbox" id="t-title" class="toggle-checkbox" checked> Hiện</label>
                        </div>
                        <input type="text" id="es-title" class="es-input" value="Giám đốc điều hành">
                    </div>
                </div>

                <div class="es-form-group">
                    <div class="toggle-label">
                        <label style="margin:0;">Tên công ty</label>
                        <label class="toggle-text"><input type="checkbox" id="t-company" class="toggle-checkbox" checked> Hiện</label>
                    </div>
                    <input type="text" id="es-company" class="es-input" value="Công ty TNHH Giải pháp Số">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="es-form-group">
                        <div class="toggle-label">
                            <label style="margin:0;">Số điện thoại</label>
                            <label class="toggle-text"><input type="checkbox" id="t-phone" class="toggle-checkbox" checked> Hiện</label>
                        </div>
                        <input type="tel" id="es-phone" class="es-input" value="090 123 4567">
                    </div>
                    <div class="es-form-group">
                        <div class="toggle-label">
                            <label style="margin:0;">Email</label>
                            <label class="toggle-text"><input type="checkbox" id="t-email" class="toggle-checkbox" checked> Hiện</label>
                        </div>
                        <input type="email" id="es-email" class="es-input" value="nguyenvana@example.com">
                    </div>
                </div>

                <div class="es-form-group">
                    <div class="toggle-label">
                        <label style="margin:0;">Website</label>
                        <label class="toggle-text"><input type="checkbox" id="t-website" class="toggle-checkbox" checked> Hiện</label>
                    </div>
                    <input type="url" id="es-website" class="es-input" value="https://www.example.com">
                </div>

                <div class="es-form-group">
                    <div class="toggle-label">
                        <label style="margin:0;">Địa chỉ</label>
                        <label class="toggle-text"><input type="checkbox" id="t-address" class="toggle-checkbox" checked> Hiện</label>
                    </div>
                    <input type="text" id="es-address" class="es-input" value="123 Đường Lê Lợi, Quận 1, TP. HCM">
                </div>

                <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 12px;">
                    <div class="es-form-group">
                        <div class="toggle-label">
                            <label style="margin:0;">Link ảnh (URL)</label>
                            <label class="toggle-text"><input type="checkbox" id="t-avatar" class="toggle-checkbox" checked> Hiện</label>
                        </div>
                        <input type="url" id="es-avatar" class="es-input" value="https://i.pravatar.cc/150?img=11">
                    </div>
                    <div class="es-form-group">
                        <label>Màu chủ đạo</label>
                        <input type="color" id="es-color" class="es-color-picker" value="#2563eb">
                    </div>
                </div>

                <div class="flex-between section-title">
                    <h3 style="margin:0;">Mạng xã hội</h3>
                    <label class="toggle-text"><input type="checkbox" id="t-socials" class="toggle-checkbox" checked> Hiện toàn bộ</label>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="es-form-group">
                        <label>Facebook</label>
                        <input type="url" id="es-fb" class="es-input" value="https://facebook.com">
                    </div>
                    <div class="es-form-group">
                        <label>Instagram</label>
                        <input type="url" id="es-ig" class="es-input" value="https://instagram.com">
                    </div>
                    <div class="es-form-group">
                        <label>X (Twitter)</label>
                        <input type="url" id="es-x" class="es-input" value="">
                    </div>
                    <div class="es-form-group">
                        <label>LinkedIn</label>
                        <input type="url" id="es-in" class="es-input" value="https://linkedin.com">
                    </div>
                </div>
            </div>

            <div class="card" style="padding: 20px; display: flex; flex-direction: column;">
                <div class="view-tabs">
                    <button class="view-tab active" id="tab-visual"><i class="fas fa-eye"></i> Giao diện</button>
                    <button class="view-tab" id="tab-html"><i class="fas fa-code"></i> Mã HTML</button>
                </div>

                <div class="flex-between" style="margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary tpl-btn" data-tpl="1">Mẫu 1</button>
                            <button class="btn btn-outline tpl-btn" data-tpl="2">Mẫu 2</button>
                            <button class="btn btn-outline tpl-btn" data-tpl="3">Mẫu 3</button>
                        </div>
                    </div>
                    <div class="flex-row" style="gap: 8px;">
                        <button class="btn btn-primary" id="es-copy-btn" style="padding: 8px 16px; font-size: 0.85rem;">
                            <i class="fas fa-copy"></i> <span id="copy-text">Copy Chữ ký</span>
                        </button>
                    </div>
                </div>
                
                <div class="es-preview-box" id="view-visual">
                    <div id="es-preview" style="background: white; padding: 20px; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; max-width: 100%; overflow-x: auto;">
                        </div>
                </div>

                <div id="view-html" style="display: none;">
                    <textarea id="es-html-code" class="code-display" readonly placeholder="Mã HTML sẽ hiển thị ở đây..."></textarea>
                </div>
                
                <div style="margin-top: 16px; font-size: 0.85rem; line-height: 1.5;" class="text-mut" id="guide-text">
                    <i class="fas fa-info-circle" style="color: #3b82f6;"></i> <b>Hướng dẫn cài đặt:</b> 
                    <br>Ấn <b>"Copy Chữ ký"</b> sau đó mở phần cài đặt chữ ký trong ứng dụng Mail (Gmail, Outlook...) và <b>Dán (Ctrl+V)</b>.
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const inputs = ['es-name', 'es-title', 'es-company', 'es-phone', 'es-email', 'es-website', 'es-address', 'es-avatar', 'es-color', 'es-fb', 'es-ig', 'es-x', 'es-in'];
    const toggles = ['t-title', 't-company', 't-phone', 't-email', 't-website', 't-address', 't-avatar', 't-socials'];
    const LS_KEY = 'email_signature_saved_data';
    
    let currentTemplate = '1';
    let currentTab = 'visual';

    // ======== 1. QUẢN LÝ DỮ LIỆU (SAVE / IMPORT / EXPORT) ========
    
    // Lấy toàn bộ trạng thái thô (để lưu trữ)
    function getState() {
        const state = { inputs: {}, toggles: {}, template: currentTemplate };
        inputs.forEach(id => state.inputs[id] = document.getElementById(id).value);
        toggles.forEach(id => state.toggles[id] = document.getElementById(id).checked);
        return state;
    }

    // Đổ dữ liệu trạng thái vào UI
    function setState(state) {
        if (!state) return;
        if (state.inputs) {
            Object.keys(state.inputs).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = state.inputs[id];
            });
        }
        if (state.toggles) {
            Object.keys(state.toggles).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.checked = state.toggles[id];
            });
        }
        if (state.template) {
            currentTemplate = state.template;
            document.querySelectorAll('.tpl-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline');
                if (b.dataset.tpl === currentTemplate) {
                    b.classList.remove('btn-outline');
                    b.classList.add('btn-primary');
                }
            });
        }
        updatePreview();
    }

    // Nút Lưu vào LocalStorage
    document.getElementById('es-save').onclick = () => {
        localStorage.setItem(LS_KEY, JSON.stringify(getState()));
        UI.showAlert('Đã lưu', 'Chữ ký của bạn đã được lưu an toàn trên trình duyệt.', 'success');
    };

    // Nút Xuất File JSON
    document.getElementById('es-export').onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getState(), null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "email-signature.json");
        document.body.appendChild(dlAnchorElem); // Yêu cầu cho Firefox
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
        UI.showAlert('Thành công', 'Đã tải xuống cấu hình chữ ký.', 'success');
    };

    // Nút Nhập File JSON
    document.getElementById('es-import').onclick = () => {
        document.getElementById('es-file-input').click();
    };
    
    document.getElementById('es-file-input').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setState(data);
                UI.showAlert('Thành công', 'Đã khôi phục dữ liệu từ file.', 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'File JSON không hợp lệ hoặc bị hỏng.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input để cho phép chọn lại cùng 1 file
    };

    // Khôi phục dữ liệu tự động từ LocalStorage khi khởi chạy
    const savedData = localStorage.getItem(LS_KEY);
    if (savedData) {
        try { setState(JSON.parse(savedData)); } catch(e) {}
    }


    // ======== 2. LOGIC GIAO DIỆN & RENDER ========

    // Xử lý chuyển đổi Mẫu
    const tplButtons = document.querySelectorAll('.tpl-btn');
    tplButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tplButtons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline');
            });
            btn.classList.remove('btn-outline');
            btn.classList.add('btn-primary');
            
            currentTemplate = btn.dataset.tpl;
            updatePreview();
        });
    });

    // Xử lý chuyển đổi Tabs (Visual / HTML)
    document.getElementById('tab-visual').addEventListener('click', (e) => switchTab('visual', e.target));
    document.getElementById('tab-html').addEventListener('click', (e) => switchTab('html', e.target));

    function switchTab(tab, element) {
        currentTab = tab;
        document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
        if(element.tagName === 'I') element.parentElement.classList.add('active');
        else element.classList.add('active');

        if (tab === 'visual') {
            document.getElementById('view-visual').style.display = 'flex';
            document.getElementById('view-html').style.display = 'none';
            document.getElementById('copy-text').innerText = 'Copy Chữ ký';
            document.getElementById('guide-text').innerHTML = `<i class="fas fa-info-circle" style="color: #3b82f6;"></i> <b>Hướng dẫn:</b> Mở cài đặt chữ ký trong Gmail/Outlook và Dán (Ctrl+V).`;
        } else {
            document.getElementById('view-visual').style.display = 'none';
            document.getElementById('view-html').style.display = 'block';
            document.getElementById('copy-text').innerText = 'Copy HTML';
            document.getElementById('guide-text').innerHTML = `<i class="fas fa-info-circle" style="color: #3b82f6;"></i> <b>Lưu ý:</b> Mã HTML dùng để nhúng trực tiếp vào các hệ thống gửi mail hoặc website.`;
        }
    }

    // Lấy dữ liệu đã lọc qua toggle (Dùng cho Render HTML)
    function getRenderData() {
        const isChecked = (id) => document.getElementById(id).checked;
        const showSocials = isChecked('t-socials');

        return {
            name: document.getElementById('es-name').value || 'Tên của bạn',
            title: isChecked('t-title') ? document.getElementById('es-title').value : '',
            company: isChecked('t-company') ? document.getElementById('es-company').value : '',
            phone: isChecked('t-phone') ? document.getElementById('es-phone').value : '',
            email: isChecked('t-email') ? document.getElementById('es-email').value : '',
            website: isChecked('t-website') ? document.getElementById('es-website').value : '',
            address: isChecked('t-address') ? document.getElementById('es-address').value : '',
            avatar: isChecked('t-avatar') ? (document.getElementById('es-avatar').value || 'https://via.placeholder.com/150') : '',
            color: document.getElementById('es-color').value || '#2563eb',
            fb: showSocials ? document.getElementById('es-fb').value : '',
            ig: showSocials ? document.getElementById('es-ig').value : '',
            x: showSocials ? document.getElementById('es-x').value : '',
            linkedin: showSocials ? document.getElementById('es-in').value : ''
        };
    }

    function getSocialHTML(data, tpl) {
        const links = [];
        const textStyle = `color: ${data.color}; text-decoration: none; font-size: 12px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;`;
        
        if (data.fb) links.push(`<a href="${data.fb}" style="${textStyle}">Facebook</a>`);
        if (data.ig) links.push(`<a href="${data.ig}" style="${textStyle}">Instagram</a>`);
        if (data.x) links.push(`<a href="${data.x}" style="${textStyle}">X</a>`);
        if (data.linkedin) links.push(`<a href="${data.linkedin}" style="${textStyle}">LinkedIn</a>`);
        
        if (links.length === 0) return '';
        
        if (tpl === 1) return `<tr><td style="padding-top: 10px;">${links.join(` <span style="color: #cccccc;">&nbsp;|&nbsp;</span> `)}</td></tr>`;
        if (tpl === 2) return `<tr><td style="padding-top: 12px;">${links.join(` <span style="color: #cccccc;">&nbsp;&bull;&nbsp;</span> `)}</td></tr>`;
        if (tpl === 3) return `<p style="margin: 8px 0 0 0;">${links.join(` <span style="color: #cccccc;">&nbsp;|&nbsp;</span> `)}</p>`;
    }

    function renderTemplate1(data) {
        return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.5; max-width: 600px; background-color: #ffffff;">
    <tr>
        ${data.avatar ? `<td style="padding-right: 20px; vertical-align: top; padding-top: 5px;">
            <img src="${data.avatar}" alt="${data.name}" width="90" style="border-radius: 50%; max-width: 90px; height: auto; border: 2px solid ${data.color}; object-fit: cover; aspect-ratio: 1/1;">
        </td>` : ''}
        <td style="vertical-align: top; ${data.avatar ? `border-left: 2px solid ${data.color}; padding-left: 20px;` : ''}">
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding-bottom: 8px;">
                        <h2 style="margin: 0; font-size: 18px; color: ${data.color}; font-weight: bold; letter-spacing: 0.5px;">${data.name}</h2>
                        ${data.title || data.company ? `<p style="margin: 2px 0 0 0; font-size: 14px; color: #666666;">
                            ${data.title}${data.title && data.company ? ` <span style="color: ${data.color};">|</span> ` : ''}
                            ${data.company ? `<span style="font-weight: bold; color: #333333;">${data.company}</span>` : ''}
                        </p>` : ''}
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 8px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                            ${data.phone ? `<tr><td style="padding-bottom: 4px;"><strong style="color: ${data.color}; font-size: 12px;">P:</strong> <a href="tel:${data.phone.replace(/[^0-9+]/g, '')}" style="color: #444444; text-decoration: none;">${data.phone}</a></td></tr>` : ''}
                            ${data.email ? `<tr><td style="padding-bottom: 4px;"><strong style="color: ${data.color}; font-size: 12px;">E:</strong> <a href="mailto:${data.email}" style="color: #444444; text-decoration: none;">${data.email}</a></td></tr>` : ''}
                            ${data.website ? `<tr><td style="padding-bottom: 4px;"><strong style="color: ${data.color}; font-size: 12px;">W:</strong> <a href="${data.website}" style="color: #444444; text-decoration: none;">${data.website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
                            ${data.address ? `<tr><td style="padding-bottom: 0;"><strong style="color: ${data.color}; font-size: 12px;">A:</strong> <span style="color: #444444;">${data.address}</span></td></tr>` : ''}
                        </table>
                    </td>
                </tr>
                ${getSocialHTML(data, 1)}
            </table>
        </td>
    </tr>
</table>`.trim();
    }

    function renderTemplate2(data) {
        return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.5; max-width: 600px; background-color: #ffffff; text-align: center; margin: 0 auto;">
    ${data.avatar ? `<tr>
        <td style="padding-bottom: 12px;">
            <img src="${data.avatar}" alt="${data.name}" width="80" style="border-radius: 50%; max-width: 80px; height: auto; border: 3px solid ${data.color}; object-fit: cover; aspect-ratio: 1/1; display: block; margin: 0 auto;">
        </td>
    </tr>` : ''}
    <tr>
        <td style="padding-bottom: 12px; border-bottom: 2px solid ${data.color};">
            <h2 style="margin: 0; font-size: 20px; color: #333333; font-weight: bold;">${data.name}</h2>
            ${data.title || data.company ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: ${data.color}; font-weight: bold;">
                ${data.title}${data.title && data.company ? ` <span style="color: #cccccc;">&bull;</span> ` : ''}
                ${data.company ? `<span style="color: #666666; font-weight: normal;">${data.company}</span>` : ''}
            </p>` : ''}
        </td>
    </tr>
    <tr>
        <td style="padding-top: 12px; font-size: 13px; color: #555555;">
            ${data.phone ? `<a href="tel:${data.phone.replace(/[^0-9+]/g, '')}" style="color: #555555; text-decoration: none;">${data.phone}</a>` : ''}
            ${data.phone && data.email ? ` <span style="color: ${data.color}; font-weight: bold;">|</span> ` : ''}
            ${data.email ? `<a href="mailto:${data.email}" style="color: #555555; text-decoration: none;">${data.email}</a>` : ''}
            ${(data.phone || data.email) && (data.website || data.address) ? '<br>' : ''}
            ${data.website ? `<a href="${data.website}" style="color: ${data.color}; text-decoration: none;">${data.website.replace(/^https?:\/\//, '')}</a>` : ''}
            ${data.website && data.address ? ` <span style="color: #cccccc;">&bull;</span> ` : ''}
            ${data.address ? `<span>${data.address}</span>` : ''}
        </td>
    </tr>
    ${getSocialHTML(data, 2)}
</table>`.trim();
    }

    function renderTemplate3(data) {
        return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.5; max-width: 600px; background-color: #ffffff;">
    <tr>
        ${data.avatar ? `<td style="padding-right: 15px; vertical-align: top;">
            <img src="${data.avatar}" alt="${data.name}" width="70" style="border-radius: 8px; max-width: 70px; height: auto; object-fit: cover; aspect-ratio: 1/1;">
        </td>` : ''}
        <td style="vertical-align: top;">
            <h2 style="margin: 0; font-size: 16px; color: #111111; font-weight: bold;">${data.name}</h2>
            ${data.title || data.company ? `<p style="margin: 2px 0 8px 0; font-size: 13px; color: ${data.color}; font-weight: bold;">
                ${data.title}${data.title && data.company ? ` <span style="color: #999999; font-weight: normal;">tại</span> ` : ''}
                ${data.company ? `<span style="color: #555555;">${data.company}</span>` : ''}
            </p>` : ''}
            
            <p style="margin: 0; font-size: 12px; color: #666666;">
                ${data.phone ? `<strong>T:</strong> <a href="tel:${data.phone.replace(/[^0-9+]/g, '')}" style="color: #666666; text-decoration: none;">${data.phone}</a>` : ''}
                ${data.phone && data.email ? ` &nbsp;|&nbsp; ` : ''}
                ${data.email ? `<strong>E:</strong> <a href="mailto:${data.email}" style="color: #666666; text-decoration: none;">${data.email}</a>` : ''}
            </p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #666666;">
                ${data.website ? `<strong>W:</strong> <a href="${data.website}" style="color: #666666; text-decoration: none;">${data.website.replace(/^https?:\/\//, '')}</a>` : ''}
                ${data.website && data.address ? ` &nbsp;|&nbsp; ` : ''}
                ${data.address ? `<strong>A:</strong> <span>${data.address}</span>` : ''}
            </p>
            ${getSocialHTML(data, 3)}
        </td>
    </tr>
</table>`.trim();
    }

    function getSignatureHtml() {
        const data = getRenderData();
        switch (currentTemplate) {
            case '2': return renderTemplate2(data);
            case '3': return renderTemplate3(data);
            case '1':
            default: return renderTemplate1(data);
        }
    }

    function updatePreview() {
        const html = getSignatureHtml();
        const previewEl = document.getElementById('es-preview');
        if (previewEl) previewEl.innerHTML = html;

        const codeEl = document.getElementById('es-html-code');
        if (codeEl) codeEl.value = html;
    }

    // Auto-update khi gõ/tắt bật
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updatePreview);
    });

    // Nút Copy
    document.getElementById('es-copy-btn').onclick = async () => {
        if (currentTab === 'visual') {
            const previewEl = document.getElementById('es-preview');
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(previewEl);
                selection.removeAllRanges();
                selection.addRange(range);
                
                document.execCommand('copy');
                selection.removeAllRanges();
                
                UI.showAlert('Thành công', 'Đã chép định dạng chữ ký! Bạn có thể dán (Ctrl+V) vào Mail.', 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ. Vui lòng chuyển sang tab Mã HTML để copy.', 'error');
            }
        } else {
            const codeEl = document.getElementById('es-html-code');
            try {
                await navigator.clipboard.writeText(codeEl.value);
                UI.showAlert('Thành công', 'Đã chép mã nguồn HTML.', 'success');
            } catch (err) {
                codeEl.select();
                document.execCommand('copy');
                UI.showAlert('Thành công', 'Đã chép mã nguồn HTML.', 'success');
            }
        }
    };

    updatePreview();
}