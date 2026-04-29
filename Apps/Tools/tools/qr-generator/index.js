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
            .qr-tabs-wrapper::-webkit-scrollbar { display: none; }
            .qr-tabs-wrapper { scrollbar-width: none; }
            
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            
            /* Color Picker Flat Style */
            input[type="color"] { -webkit-appearance: none; border: none; padding: 0; background: transparent; }
            input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
            input[type="color"]::-webkit-color-swatch { border: 1px solid #e4e4e7; border-radius: 8px; }
            .dark input[type="color"]::-webkit-color-swatch { border: 1px solid #3f3f46; }

            /* Fix tỷ lệ ảnh QR */
            #qr-canvas-wrapper canvas, #qr-canvas-wrapper img { width: 100% !important; height: auto !important; object-fit: contain; border-radius: 8px; }
        </style>

        <div class="relative flex flex-col w-full max-w-[960px] mx-auto min-h-[500px]">
            <div class="flex justify-between items-center mb-5 px-1">
                <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Tạo Mã QR</h2>
                <button class="h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform" id="btn-qr-clear">
                    <i class="fas fa-redo-alt"></i> Làm mới
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                        
                        <div class="qr-tabs-wrapper flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]" id="qr-type-tabs">
                            <button class="tab-btn active flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-type="bank"><i class="fas fa-university mr-1.5"></i> Ngân hàng</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-type="url"><i class="fas fa-link mr-1.5"></i> URL</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-type="text"><i class="fas fa-font mr-1.5"></i> Văn bản</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-type="wifi"><i class="fas fa-wifi mr-1.5"></i> WiFi</button>
                            <button class="tab-btn flex-1 py-3.5 px-4 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-type="vcard"><i class="fas fa-id-card mr-1.5"></i> Danh thiếp</button>
                        </div>

                        <div id="qr-inputs-dynamic" class="p-5 min-h-[220px] space-y-4">
                            </div>
                        
                        <div class="px-5 py-5 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                            <h3 class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider"><i class="fas fa-palette mr-1 text-zinc-400"></i> Tùy chỉnh thiết kế</h3>
                            
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-500 block">Màu mã (Foreground)</label>
                                    <input type="color" id="opt-color" value="#000000" class="qr-opt w-full h-10 rounded-xl cursor-pointer">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-500 block">Màu nền (Background)</label>
                                    <input type="color" id="opt-bg" value="#ffffff" class="qr-opt w-full h-10 rounded-xl cursor-pointer">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-500 block">Kích thước</label>
                                    <select id="opt-size" class="qr-opt w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-xs font-bold text-zinc-900 dark:text-white appearance-none">
                                        <option value="256">Nhỏ (256)</option>
                                        <option value="512" selected>Chuẩn (512)</option>
                                        <option value="1024">Nét (1024)</option>
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-500 block">Sửa lỗi (Mức)</label>
                                    <select id="opt-error" class="qr-opt w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-xs font-bold text-zinc-900 dark:text-white appearance-none">
                                        <option value="L">L (7%)</option>
                                        <option value="M">M (15%)</option>
                                        <option value="Q">Q (25%)</option>
                                        <option value="H" selected>H (30%)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="pt-2">
                                <label class="text-[11px] font-bold text-zinc-500 block mb-2">Chèn Logo ở giữa</label>
                                <input type="file" id="opt-logo" accept="image/png, image/jpeg, image/webp" class="w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-200 file:text-zinc-700 dark:file:bg-zinc-800 dark:file:text-zinc-300 cursor-pointer border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#09090b]">
                            </div>
                        </div>

                    </div>
                </div>

                <div class="lg:col-span-5 flex flex-col gap-4 sticky top-6">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[380px]">
                        
                        <div class="relative w-full max-w-[280px] aspect-square bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center mb-6 overflow-hidden p-3" id="qr-canvas-wrapper">
                            <div class="text-zinc-400 flex flex-col items-center gap-3 opacity-50" id="qr-empty-state">
                                <i class="fas fa-qrcode text-5xl"></i>
                                <span class="text-xs font-bold uppercase tracking-wider">Chưa có mã QR</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 w-full">
                            <button id="btn-dl-png" class="h-12 w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[13px] active:scale-95 transition-transform flex items-center justify-center gap-2 opacity-50 pointer-events-none" disabled>
                                <i class="fas fa-download"></i> TẢI XUỐNG (PNG)
                            </button>
                            <div class="flex gap-3 w-full">
                                <button id="btn-dl-jpg" class="flex-1 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 opacity-50 pointer-events-none" disabled>
                                    <i class="fas fa-file-image"></i> Tải JPG
                                </button>
                                <button id="btn-copy-clip" class="flex-1 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 opacity-50 pointer-events-none" disabled>
                                    <i class="fas fa-clipboard"></i> Chép ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // Tải thư viện QRCode chuẩn (davidshimjs)
    const loadQRCodeLib = () => {
        return new Promise((resolve) => {
            if (window.QRCode) return resolve();
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    };

    const dynamicFields = document.getElementById('qr-inputs-dynamic');
    const tabs = document.querySelectorAll('#qr-type-tabs .tab-btn');
    const qrWrapper = document.getElementById('qr-canvas-wrapper');
    const logoInput = document.getElementById('opt-logo');
    
    const btnDlPng = document.getElementById('btn-dl-png');
    const btnDlJpg = document.getElementById('btn-dl-jpg');
    const btnCopyClip = document.getElementById('btn-copy-clip');
    
    let currentType = 'bank'; 
    let logoImgData = null;
    let isGenerated = false;

    // --- RENDER FORM INPUTS DỰA VÀO TAB --- 
    const renderInputs = (type) => {
        let html = '';
        switch(type) {
            case 'bank':
                let bankOptions = '<option value="">-- Chọn ngân hàng thụ hưởng --</option>';
                POPULAR_BANKS.forEach(b => bankOptions += `<option value="${b.bin}">${b.shortName} - ${b.name}</option>`);
                bankOptions += '<option value="other">Khác (Nhập mã BIN thủ công)</option>';

                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Ngân hàng <span class="text-red-500">*</span></label>
                            <select class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white" id="in-bank-bin">${bankOptions}</select>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số tài khoản <span class="text-red-500">*</span></label>
                            <input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-bank-acc" placeholder="Nhập số tài khoản...">
                        </div>
                    </div>
                    <div class="space-y-1.5" id="group-custom-bin" style="display: none;">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Mã BIN Ngân hàng (6 số) <span class="text-red-500">*</span></label>
                        <input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-bank-custom-bin" placeholder="Ví dụ: 970436">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số tiền (VNĐ)</label>
                            <input type="number" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-bank-amount" placeholder="Ví dụ: 50000">
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Nội dung</label>
                            <input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-bank-info" placeholder="Nhập lời nhắn...">
                        </div>
                    </div>`;
                break;
            case 'url':
                html = `<div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Liên kết (URL)</label><input type="url" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-url" placeholder="https://example.com"></div>`;
                break;
            case 'text':
                html = `<div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Nội dung văn bản</label><textarea class="textarea qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white min-h-[120px] resize-y custom-scrollbar" id="in-text" placeholder="Nhập văn bản bất kỳ..."></textarea></div>`;
                break;
            case 'wifi':
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Tên mạng (SSID)</label><input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-wifi-ssid" placeholder="Tên WiFi"></div>
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Bảo mật</label><select class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white" id="in-wifi-enc"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Không mật khẩu</option></select></div>
                    </div>
                    <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Mật khẩu WiFi</label><input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-wifi-pass" placeholder="••••••••"></div>`;
                break;
            case 'vcard':
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Họ Tên</label><input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-vc-name" placeholder="Nguyễn Văn A"></div>
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Công ty</label><input type="text" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-vc-org" placeholder="Công ty ABC"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Điện thoại</label><input type="tel" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-vc-tel" placeholder="0987654321"></div>
                        <div class="space-y-1.5"><label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Email</label><input type="email" class="input qr-in w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white" id="in-vc-email" placeholder="email@example.com"></div>
                    </div>`;
                break;
        }
        dynamicFields.innerHTML = html;
        
        // Hiện input nhập BIN nếu chọn "Khác"
        if (type === 'bank') {
            const selectBin = document.getElementById('in-bank-bin');
            const groupCustomBin = document.getElementById('group-custom-bin');
            selectBin.addEventListener('change', (e) => {
                groupCustomBin.style.display = e.target.value === 'other' ? 'block' : 'none';
            });
        }

        // Auto Generate khi nhập
        dynamicFields.querySelectorAll('.qr-in').forEach(el => {
            el.addEventListener('input', triggerGenerate);
        });
    };

    // --- LẤY DỮ LIỆU ĐẦU VÀO --- 
    const getPayload = () => {
        const val = (id) => document.getElementById(id)?.value.trim() || '';
        switch(currentType) {
            case 'bank':
                const bankVal = val('in-bank-bin');
                const bin = bankVal === 'other' ? val('in-bank-custom-bin') : bankVal;
                const acc = val('in-bank-acc');
                const amt = val('in-bank-amount');
                const info = val('in-bank-info');
                
                if (!bin || !acc) return null; // Thiếu info bắt buộc
                return buildVietQR(bin, acc, amt, info);
            case 'url': return val('in-url');
            case 'text': return val('in-text');
            case 'wifi': 
                if(!val('in-wifi-ssid')) return '';
                return `WIFI:S:${val('in-wifi-ssid')};T:${val('in-wifi-enc')};P:${val('in-wifi-pass')};;`;
            case 'vcard': 
                if(!val('in-vc-name') && !val('in-vc-tel') && !val('in-vc-email')) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${val('in-vc-name')}\nORG:${val('in-vc-org')}\nTEL:${val('in-vc-tel')}\nEMAIL:${val('in-vc-email')}\nEND:VCARD`;
            default: return '';
        }
    };

    const resetPreview = () => {
        qrWrapper.innerHTML = `
            <div class="text-zinc-400 flex flex-col items-center gap-3 opacity-50" id="qr-empty-state">
                <i class="fas fa-qrcode text-5xl"></i>
                <span class="text-xs font-bold uppercase tracking-wider">Chưa có mã QR</span>
            </div>
        `;
        isGenerated = false;
        
        [btnDlPng, btnDlJpg, btnCopyClip].forEach(b => {
            b.disabled = true;
            b.classList.add('opacity-50', 'pointer-events-none');
            b.classList.remove('active:scale-95');
        });
    };

    // --- TẠO MÃ QR (CHUẨN DAVIDSHIMJS) --- 
    const triggerGenerate = () => {
        const payload = getPayload();
        
        if (payload === null || payload === '') {
            resetPreview();
            return;
        }

        if (!window.QRCode) return;

        // Xóa nội dung cũ trong khung
        qrWrapper.innerHTML = ''; 

        const size = parseInt(document.getElementById('opt-size').value);
        const color = document.getElementById('opt-color').value;
        const bg = document.getElementById('opt-bg').value;
        const errorStr = document.getElementById('opt-error').value;

        try {
            // Sử dụng cú pháp chuẩn của thư viện qrcode.js
            new QRCode(qrWrapper, {
                text: payload,
                width: size,
                height: size,
                colorDark: color,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel[errorStr]
            });

            isGenerated = true;
            [btnDlPng, btnDlJpg, btnCopyClip].forEach(b => {
                b.disabled = false;
                b.classList.remove('opacity-50', 'pointer-events-none');
                b.classList.add('active:scale-95');
            });

            // Chèn Logo lên Canvas do qrcode.js tạo ra
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
                        
                        // Vẽ background cho logo để không bị đè lên QR
                        ctx.fillStyle = bg;
                        if(ctx.roundRect) {
                            ctx.beginPath();
                            ctx.roundRect(x - 8, y - 8, lSize + 16, lSize + 16, 8);
                            ctx.fill();
                        } else {
                            ctx.fillRect(x - 8, y - 8, lSize + 16, lSize + 16);
                        }
                        
                        // Vẽ logo lên
                        ctx.drawImage(img, x, y, lSize, lSize);

                        // Cập nhật lại thẻ img nếu qrcode.js đang dùng img để hiển thị
                        if (qrImg) {
                            qrImg.src = canvas.toDataURL("image/png");
                        }
                    };
                }, 50); 
            }
        } catch (err) {
            console.error("QR Error:", err);
            resetPreview();
        }
    };

    // --- SỰ KIỆN TƯƠNG TÁC --- //
    
    // Click Tabs 
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
                t.classList.add('text-zinc-400', 'border-transparent');
            });
            tab.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
            tab.classList.remove('text-zinc-400', 'border-transparent');
            
            currentType = tab.dataset.type;
            renderInputs(currentType);
            resetPreview();
        });
    });

    // Options thay đổi thì render lại 
    document.querySelectorAll('.qr-opt').forEach(el => {
        el.addEventListener('change', () => {
            if (isGenerated) triggerGenerate();
        });
    });

    // Logo Upload 
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

    // Tải & Copy 
    const downloadImage = (format) => {
        const canvas = qrWrapper.querySelector('canvas');
        if (!canvas) return;
        const dataURL = canvas.toDataURL(`image/${format}`, 1.0);
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

    // Làm mới Form 
    document.getElementById('btn-qr-clear').onclick = () => {
        UI.showConfirm('Đặt lại mặc định?', 'Mọi nội dung, thiết lập màu sắc và logo sẽ bị xóa.', () => {
            document.getElementById('opt-color').value = '#000000';
            document.getElementById('opt-bg').value = '#ffffff';
            document.getElementById('opt-size').value = '512';
            document.getElementById('opt-error').value = 'H';
            logoInput.value = '';
            logoImgData = null;
            
            renderInputs(currentType);
            resetPreview();
        });
    }; 

    // Bắt đầu
    loadQRCodeLib().then(() => {
        renderInputs('bank'); 
        resetPreview();
    });
}