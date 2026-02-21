import { UI } from '../../js/ui.js';

// --- BIẾN VÀ HÀM HỖ TRỢ CHO VIETQR ---
const POPULAR_BANKS = [
    { "bin": "970436", "shortName": "Vietcombank", "name": "Ngân hàng TMCP Ngoại thương VN" },
    { "bin": "970407", "shortName": "Techcombank", "name": "Ngân hàng TMCP Kỹ thương VN" },
    { "bin": "970415", "shortName": "VietinBank", "name": "Ngân hàng TMCP Công Thương VN" },
    { "bin": "970418", "shortName": "BIDV", "name": "Ngân hàng TMCP Đầu tư và Phát triển VN" },
    { "bin": "970422", "shortName": "MB Bank", "name": "Ngân hàng TMCP Quân đội" },
    { "bin": "970405", "shortName": "Agribank", "name": "NH Nông nghiệp và PTNT VN" },
    { "bin": "970416", "shortName": "ACB", "name": "Ngân hàng TMCP Á Châu" },
    { "bin": "970432", "shortName": "VPBank", "name": "Ngân hàng TMCP VN Thịnh Vượng" },
    { "bin": "970423", "shortName": "TPBank", "name": "Ngân hàng TMCP Tiên Phong" },
    { "bin": "970406", "shortName": "Sacombank", "name": "Ngân hàng TMCP Sài Gòn Thương Tín" },
    { "bin": "970429", "shortName": "HDBank", "name": "Ngân hàng TMCP Phát triển TP. HCM" },
    { "bin": "970403", "shortName": "VIB", "name": "Ngân hàng TMCP Quốc tế VN" }
];

const f = (id, value) => {
    const l = value.length.toString().padStart(2, '0');
    return `${id}${l}${value}`;
};

const crc16 = (data) => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

const buildVietQR = (bin, accountNumber, amount, info) => {
    const bankInfo = f('00', 'A000000727') + f('01', f('00', bin) + f('01', accountNumber));
    const merchantAccountInfo = f('38', bankInfo);
    const transactionAmount = amount ? f('54', amount) : '';
    const purposeOfTransaction = info ? f('08', info) : '';
    const additionalData = purposeOfTransaction ? f('62', purposeOfTransaction) : '';
    const payload = `000201010211${merchantAccountInfo}5303704${transactionAmount}5802VN${additionalData}6304`;
    return payload + crc16(payload);
};

export function template() {
    return `
        <style>
            .qr-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            .qr-preview-sticky { position: sticky; top: 80px; } 
            
            #qr-canvas-wrapper { 
                background: #ffffff; 
                padding: 16px; 
                border-radius: var(--radius); 
                border: 1px solid var(--border);
                margin-bottom: 24px;
                display: flex; justify-content: center; align-items: center;
                min-height: 250px;
                position: relative;
            }
            #qr-canvas-wrapper canvas, #qr-canvas-wrapper img { 
                max-width: 100%; height: auto !important; 
                border-radius: 4px; display: block; 
            }
            .qr-empty-state {
                color: var(--text-mut);
                font-size: 0.9rem;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .qr-empty-state i { font-size: 2rem; opacity: 0.5; }

            @media (min-width: 992px) { 
                .qr-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; align-items: start; } 
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Tạo Mã QR (QR Generator)</h1>
                <p class="text-mut">Tạo mã QR tùy chỉnh nhanh chóng. Cập nhật VietQR hỗ trợ mọi ứng dụng ngân hàng.</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-qr-clear" style="color: #ef4444;">
                <i class="fas fa-trash-alt"></i> Đặt lại
            </button>
        </div>

        <div class="qr-layout">
            
            <div class="card" style="padding: 20px;">
                
                <div class="tabs" id="qr-type-tabs" style="margin-bottom: 20px;">
                    <button class="tab-btn active" data-type="bank"><i class="fas fa-university"></i> Ngân hàng</button>
                    <button class="tab-btn" data-type="url"><i class="fas fa-link"></i> URL</button>
                    <button class="tab-btn" data-type="text"><i class="fas fa-font"></i> Văn bản</button>
                    <button class="tab-btn" data-type="wifi"><i class="fas fa-wifi"></i> WiFi</button>
                    <button class="tab-btn" data-type="phone"><i class="fas fa-phone"></i> Gọi điện</button>
                    <button class="tab-btn" data-type="sms"><i class="fas fa-sms"></i> SMS</button>
                    <button class="tab-btn" data-type="email"><i class="fas fa-envelope"></i> Email</button>
                    <button class="tab-btn" data-type="vcard"><i class="fas fa-id-card"></i> Danh thiếp</button>
                </div>

                <div id="qr-inputs-dynamic" style="min-height: 100px;"></div>

                <div class="divider"></div>

                <div class="h1" style="font-size: 1.1rem; margin-bottom: 16px;">
                    <i class="fas fa-palette text-mut"></i> Tùy chỉnh thiết kế
                </div>
                
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Màu mã QR (Foreground)</label>
                        <input type="color" class="input input-color qr-opt" id="opt-color" value="#000000" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Màu nền (Background)</label>
                        <input type="color" class="input input-color qr-opt" id="opt-bg" value="#ffffff" style="width: 100%;">
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Kích thước (Pixels)</label>
                        <select class="input qr-opt" id="opt-size">
                            <option value="256">256 x 256</option>
                            <option value="512" selected>512 x 512</option>
                            <option value="1024">1024 x 1024</option>
                            <option value="2048">2048 x 2048 (Siêu nét)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Mức chịu lỗi (Error Correction)</label>
                        <select class="input qr-opt" id="opt-error">
                            <option value="L">Thấp (7%) - Gọn nhẹ</option>
                            <option value="M">Trung bình (15%)</option>
                            <option value="Q">Khá (25%)</option>
                            <option value="H" selected>Cao (30%) - Khuyên dùng có Logo</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Chèn Logo ở giữa (Tùy chọn)</label>
                    <input type="file" class="input input-file" id="opt-logo" accept="image/png, image/jpeg, image/webp">
                </div>
                
                <button class="btn btn-primary" id="btn-generate-qr" style="width: 100%; justify-content: center; margin-top: 24px; padding: 12px; font-size: 1.05rem;">
                    <i class="fas fa-qrcode"></i> Tạo mã QR
                </button>
            </div>

            <div class="qr-preview-sticky">
                <div class="card" style="background: var(--bg-sec); display: flex; flex-direction: column; align-items: center; padding: 24px;">
                    
                    <div id="qr-canvas-wrapper" style="width: 100%; max-width: 300px; aspect-ratio: 1/1;">
                        <div class="qr-empty-state" id="qr-empty-state">
                            <i class="fas fa-qrcode"></i>
                            <span>Chưa có mã QR</span>
                        </div>
                    </div>
                    
                    <div style="width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-primary" id="btn-dl-png" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem;" disabled>
                            <i class="fas fa-download"></i> Tải xuống PNG
                        </button>
                        
                        <div class="grid-2" style="gap: 12px;">
                            <button class="btn btn-outline" id="btn-dl-jpg" style="justify-content: center;" disabled>
                                <i class="fas fa-file-image"></i> JPEG
                            </button>
                            <button class="btn btn-outline" id="btn-copy-clip" style="justify-content: center;" disabled>
                                <i class="fas fa-clipboard"></i> Copy Ảnh
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    `;
}

export function init() {
    const dynamicFields = document.getElementById('qr-inputs-dynamic');
    const tabs = document.querySelectorAll('#qr-type-tabs .tab-btn');
    const qrWrapper = document.getElementById('qr-canvas-wrapper');
    const logoInput = document.getElementById('opt-logo');
    
    const btnGenerate = document.getElementById('btn-generate-qr');
    const btnDlPng = document.getElementById('btn-dl-png');
    const btnDlJpg = document.getElementById('btn-dl-jpg');
    const btnCopyClip = document.getElementById('btn-copy-clip');
    
    let currentType = 'bank'; // Chuyển default sang Bank
    let logoImgData = null;
    let isGenerated = false;

    const renderInputs = (type) => {
        let html = '';
        switch(type) {
            case 'bank':
                let bankOptions = '<option value="">-- Chọn ngân hàng thụ hưởng --</option>';
                POPULAR_BANKS.forEach(b => bankOptions += `<option value="${b.bin}">${b.shortName} - ${b.name}</option>`);
                bankOptions += '<option value="other">Khác (Nhập mã BIN thủ công)</option>';

                html = `
                    <div class="grid-2">
                        <div class="form-group">
                            <label class="form-label">Ngân hàng <span style="color:#ef4444">*</span></label>
                            <select class="input qr-in" id="in-bank-bin">${bankOptions}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Số tài khoản <span style="color:#ef4444">*</span></label>
                            <input type="text" class="input qr-in" id="in-bank-acc" placeholder="Nhập số tài khoản...">
                        </div>
                    </div>
                    <div class="form-group" id="group-custom-bin" style="display: none;">
                        <label class="form-label">Mã BIN Ngân hàng (6 chữ số) <span style="color:#ef4444">*</span></label>
                        <input type="text" class="input qr-in" id="in-bank-custom-bin" placeholder="Ví dụ: 970436">
                    </div>
                    <div class="grid-2">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Số tiền (VNĐ) <span class="text-mut" style="font-weight: 400;">(Tùy chọn)</span></label>
                            <input type="number" class="input qr-in" id="in-bank-amount" placeholder="Ví dụ: 50000">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Nội dung <span class="text-mut" style="font-weight: 400;">(Tùy chọn)</span></label>
                            <input type="text" class="input qr-in" id="in-bank-info" placeholder="Nhập lời nhắn...">
                        </div>
                    </div>`;
                break;
            case 'url':
                html = `<div class="form-group" style="margin-bottom: 0;"><label class="form-label">Địa chỉ liên kết (URL)</label><input type="url" class="input qr-in" id="in-url" placeholder="https://my-aio-tools.com"></div>`;
                break;
            case 'text':
                html = `<div class="form-group" style="margin-bottom: 0;"><label class="form-label">Nội dung văn bản</label><textarea class="textarea qr-in" id="in-text" rows="4" placeholder="Nhập văn bản bất kỳ..."></textarea></div>`;
                break;
            case 'wifi':
                html = `
                    <div class="grid-2">
                        <div class="form-group"><label class="form-label">Tên mạng (SSID)</label><input type="text" class="input qr-in" id="in-wifi-ssid" placeholder="Tên WiFi"></div>
                        <div class="form-group"><label class="form-label">Chuẩn bảo mật</label><select class="input qr-in" id="in-wifi-enc"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Mở (Không mật khẩu)</option></select></div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;"><label class="form-label">Mật khẩu WiFi</label><input type="text" class="input qr-in" id="in-wifi-pass" placeholder="••••••••"></div>`;
                break;
            case 'phone':
                html = `<div class="form-group" style="margin-bottom: 0;"><label class="form-label">Số điện thoại</label><input type="tel" class="input qr-in" id="in-phone" placeholder="0901234567"></div>`;
                break;
            case 'sms':
                html = `
                    <div class="form-group"><label class="form-label">Số điện thoại nhận</label><input type="tel" class="input qr-in" id="in-sms-num" placeholder="0901234567"></div>
                    <div class="form-group" style="margin-bottom: 0;"><label class="form-label">Nội dung tin nhắn</label><textarea class="textarea qr-in" id="in-sms-msg" rows="2" placeholder="Xin chào..."></textarea></div>`;
                break;
            case 'email':
                html = `
                    <div class="grid-2">
                        <div class="form-group"><label class="form-label">Gửi đến Email</label><input type="email" class="input qr-in" id="in-email-to" placeholder="admin@example.com"></div>
                        <div class="form-group"><label class="form-label">Tiêu đề (Subject)</label><input type="text" class="input qr-in" id="in-email-sub" placeholder="Tiêu đề..."></div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;"><label class="form-label">Nội dung (Body)</label><textarea class="textarea qr-in" id="in-email-body" rows="2" placeholder="Nội dung email..."></textarea></div>`;
                break;
            case 'vcard':
                html = `
                    <div class="grid-2">
                        <div class="form-group"><label class="form-label">Họ và Tên</label><input type="text" class="input qr-in" id="in-vc-name" placeholder="Nguyễn Văn A"></div>
                        <div class="form-group"><label class="form-label">Công ty / Tổ chức</label><input type="text" class="input qr-in" id="in-vc-org" placeholder="Công ty TNHH ABC"></div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group" style="margin-bottom: 0;"><label class="form-label">Số điện thoại</label><input type="tel" class="input qr-in" id="in-vc-tel" placeholder="0987654321"></div>
                        <div class="form-group" style="margin-bottom: 0;"><label class="form-label">Email</label><input type="email" class="input qr-in" id="in-vc-email" placeholder="email@example.com"></div>
                    </div>`;
                break;
        }
        dynamicFields.innerHTML = html;
        
        // Sự kiện hiển thị trường nhập BIN tùy chỉnh cho tính năng Bank
        if (type === 'bank') {
            const selectBin = document.getElementById('in-bank-bin');
            const groupCustomBin = document.getElementById('group-custom-bin');
            selectBin.addEventListener('change', (e) => {
                groupCustomBin.style.display = e.target.value === 'other' ? 'block' : 'none';
            });
        }

        dynamicFields.querySelectorAll('.qr-in').forEach(el => {
            el.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') triggerGenerate();
            });
        });
    };

    const getPayload = () => {
        const val = (id) => document.getElementById(id)?.value.trim() || '';
        switch(currentType) {
            case 'bank':
                const bankVal = val('in-bank-bin');
                const bin = bankVal === 'other' ? val('in-bank-custom-bin') : bankVal;
                const acc = val('in-bank-acc');
                const amt = val('in-bank-amount');
                const info = val('in-bank-info');
                
                if (!bin || !acc) {
                    UI.showAlert('Thiếu thông tin', 'Vui lòng chọn ngân hàng và nhập Số tài khoản.', 'warning');
                    return null; // Return null để phân biệt với chuỗi rỗng
                }
                return buildVietQR(bin, acc, amt, info);
            case 'url': return val('in-url');
            case 'text': return val('in-text');
            case 'wifi': 
                if(!val('in-wifi-ssid')) return '';
                return `WIFI:S:${val('in-wifi-ssid')};T:${val('in-wifi-enc')};P:${val('in-wifi-pass')};;`;
            case 'phone': 
                if(!val('in-phone')) return '';
                return `tel:${val('in-phone')}`;
            case 'sms': 
                if(!val('in-sms-num')) return '';
                return `smsto:${val('in-sms-num')}:${val('in-sms-msg')}`;
            case 'email': 
                if(!val('in-email-to')) return '';
                return `mailto:${val('in-email-to')}?subject=${encodeURIComponent(val('in-email-sub'))}&body=${encodeURIComponent(val('in-email-body'))}`;
            case 'vcard': 
                if(!val('in-vc-name') && !val('in-vc-tel') && !val('in-vc-email')) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${val('in-vc-name')}\nORG:${val('in-vc-org')}\nTEL:${val('in-vc-tel')}\nEMAIL:${val('in-vc-email')}\nEND:VCARD`;
            default: return '';
        }
    };

    const resetPreview = () => {
        qrWrapper.innerHTML = `
            <div class="qr-empty-state" id="qr-empty-state">
                <i class="fas fa-qrcode"></i>
                <span>Chưa có mã QR</span>
            </div>
        `;
        isGenerated = false;
        btnDlPng.disabled = true;
        btnDlJpg.disabled = true;
        btnCopyClip.disabled = true;
    };

    const triggerGenerate = () => {
        const payload = getPayload();
        
        // Return null từ getPayload có nghĩa là đã validate lỗi (VD: thiếu TK ngân hàng)
        if (payload === null) return;
        
        if (!payload || payload === '') {
            UI.showAlert('Thiếu dữ liệu', 'Vui lòng nhập thông tin (URL, Text, Số tài khoản...) trước khi tạo mã.', 'warning');
            return;
        }

        const size = parseInt(document.getElementById('opt-size').value);
        const color = document.getElementById('opt-color').value;
        const bg = document.getElementById('opt-bg').value;
        const errorStr = document.getElementById('opt-error').value;

        qrWrapper.innerHTML = ''; 
        
        try {
            const qr = new QRCode(qrWrapper, {
                text: payload,
                width: size,
                height: size,
                colorDark: color,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel[errorStr]
            });

            isGenerated = true;
            btnDlPng.disabled = false;
            btnDlJpg.disabled = false;
            btnCopyClip.disabled = false;

            // Xử lý chèn Logo
            if (logoImgData) {
                setTimeout(() => {
                    const canvas = qrWrapper.querySelector('canvas');
                    const qrImg = qrWrapper.querySelector('img'); 
                    
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    
                    const img = new Image();
                    img.src = logoImgData;
                    
                    img.onload = () => {
                        const lSize = size * 0.22; 
                        const x = (size - lSize) / 2;
                        const y = (size - lSize) / 2;
                        
                        ctx.fillStyle = bg;
                        if(ctx.roundRect) {
                            ctx.beginPath();
                            ctx.roundRect(x - 8, y - 8, lSize + 16, lSize + 16, 8);
                            ctx.fill();
                        } else {
                            ctx.fillRect(x - 8, y - 8, lSize + 16, lSize + 16);
                        }
                        
                        ctx.drawImage(img, x, y, lSize, lSize);

                        if (qrImg) {
                            qrImg.src = canvas.toDataURL("image/png");
                        }
                    };
                }, 50); 
            }
        } catch (err) {
            console.error("QR Error:", err);
            UI.showAlert('Lỗi', 'Nội dung đầu vào quá dài hoặc không hợp lệ để tạo QR.', 'error');
            resetPreview();
        }
    };

    // --- CÁC SỰ KIỆN --- //

    btnGenerate.addEventListener('click', triggerGenerate);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            renderInputs(currentType);
            resetPreview();
        });
    });

    document.querySelectorAll('.qr-opt').forEach(el => {
        el.addEventListener('change', () => {
            if (isGenerated) triggerGenerate();
        });
    });

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                logoImgData = ev.target.result;
                if (isGenerated) triggerGenerate();
            };
            reader.readAsDataURL(file);
        } else {
            logoImgData = null;
            if (isGenerated) triggerGenerate();
        }
    });

    const getCanvasData = (format) => {
        const canvas = qrWrapper.querySelector('canvas');
        if (!canvas) return null;
        return canvas.toDataURL(`image/${format}`, 1.0);
    };

    const downloadImage = (format) => {
        const dataURL = getCanvasData(format);
        if (!dataURL) return;
        const link = document.createElement('a');
        link.download = `AIO_QR_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = dataURL;
        link.click();
        UI.showAlert('Thành công', `Đã tải xuống mã QR định dạng ${format.toUpperCase()}.`, 'success');
    };

    btnDlPng.onclick = () => downloadImage('png');
    btnDlJpg.onclick = () => downloadImage('jpeg');

    btnCopyClip.onclick = async () => {
        const canvas = qrWrapper.querySelector('canvas');
        if (!canvas) return UI.showAlert('Lỗi', 'Không tìm thấy ảnh.', 'error');
        try {
            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                UI.showAlert('Đã sao chép', 'Ảnh QR đã được chép vào Clipboard.', 'info');
            });
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép ảnh trực tiếp.', 'error');
        }
    };

    document.getElementById('btn-qr-clear').onclick = () => {
        UI.showConfirm('Đặt lại mặc định?', 'Mọi nội dung, thiết lập màu sắc và logo sẽ bị xóa.', () => {
            document.getElementById('opt-color').value = '#000000';
            document.getElementById('opt-bg').value = '#ffffff';
            document.getElementById('opt-size').value = '512';
            document.getElementById('opt-error').value = 'H';
            logoInput.value = '';
            logoImgData = null;
            
            const activeTab = document.querySelector('#qr-type-tabs .tab-btn.active');
            renderInputs(activeTab.dataset.type);
            resetPreview();
        });
    };

    // Khởi chạy
    renderInputs('bank'); // Default vào Bank
    resetPreview();
}