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
// 2. VIETQR GENERATOR UTILS
// =============================================================================
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

// =============================================================================
// 3. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="qr-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #qr-root-container {
                --kit-accent: #10b981;
            }
            .bg-accent-theme { background-color: var(--kit-accent) !important; }
            .text-accent-theme { color: var(--kit-accent) !important; }
            .border-accent-theme { border-color: var(--kit-accent) !important; }
            .accent-theme-tint { accent-color: var(--kit-accent) !important; }
            
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }
            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
            .qr-input-zen { -webkit-user-select: text !important; user-select: text !important; }

            #qr-canvas-wrapper canvas, #qr-canvas-wrapper img {
                width: 100% !important;
                height: auto !important;
                object-fit: contain;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }

            .scanner-scanner-line {
                position: absolute;
                left: 0; right: 0; height: 2px;
                background: var(--kit-accent);
                box-shadow: 0 0 8px var(--kit-accent);
                animation: scanMove 2s infinite ease-in-out;
            }
            @keyframes scanMove {
                0% { top: 5%; }
                50% { top: 95%; }
                100% { top: 5%; }
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Utility</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Trung Tâm QR Code</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tạo mã VietQR, WiFi, vCard hoặc Quét/Đọc mã qua Camera, Màn hình, Dán ảnh nhanh.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-qr-clear" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-arrows-rotate text-accent-theme text-xs"></i> Đặt lại
                    </button>
                </div>
            </div>

            <!-- MODE SWITCHER TABS (GENERATE VS READ) -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-1.5 shadow-sm flex items-center gap-1">
                <button id="tab-mode-gen" class="flex-1 h-10 rounded-[18px] text-xs font-bold bg-[#f4f4f6] dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-2">
                    <i class="fas fa-qrcode text-accent-theme"></i> Tạo mã QR
                </button>
                <button id="tab-mode-scan" class="flex-1 h-10 rounded-[18px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2">
                    <i class="fas fa-expand text-xs"></i> Đọc & Quét mã QR
                </button>
            </div>

            <!-- SECTION 1: GENERATOR SECTION -->
            <div id="section-generator" class="space-y-5">
                <!-- CONTROLS & OPTIONS CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                    <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="qr-type-tabs">
                        <button class="qr-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-type="bank">
                            <i class="fas fa-building-columns text-[11px]"></i> Ngân hàng (VietQR)
                        </button>
                        <button class="qr-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-type="url">
                            <i class="fas fa-link text-[11px]"></i> URL Trang web
                        </button>
                        <button class="qr-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-type="text">
                            <i class="fas fa-align-left text-[11px]"></i> Văn bản thuần
                        </button>
                        <button class="qr-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-type="wifi">
                            <i class="fas fa-wifi text-[11px]"></i> Mạng WiFi
                        </button>
                        <button class="qr-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-type="vcard">
                            <i class="fas fa-address-card text-[11px]"></i> Danh thiếp vCard
                        </button>
                    </div>
                </div>

                <!-- WORKSPACE GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                    <div class="lg:col-span-7 flex flex-col gap-4">
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Thông tin chuyển tải</h3>
                                <span class="text-[10px] text-zinc-400 font-mono" id="qr-type-badge">VietQR EMVCo</span>
                            </div>
                            <div id="qr-inputs-dynamic" class="space-y-3"></div>
                        </div>

                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tùy biến kết xuất</h3>
                                <span class="text-[10px] text-zinc-400 font-mono">Pixel Engine</span>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Màu mã</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" id="opt-color" value="#000000" class="qr-opt w-7 h-7 rounded-[8px] cursor-pointer bg-transparent border-none p-0">
                                        <span class="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400" id="opt-color-hex">#000000</span>
                                    </div>
                                </div>

                                <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Màu nền</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" id="opt-bg" value="#ffffff" class="qr-opt w-7 h-7 rounded-[8px] cursor-pointer bg-transparent border-none p-0">
                                        <span class="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400" id="opt-bg-hex">#ffffff</span>
                                    </div>
                                </div>

                                <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 relative">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Kích cỡ</label>
                                    <select id="opt-size" class="qr-opt zen-select w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white cursor-pointer p-0">
                                        <option value="256">256 px</option>
                                        <option value="512" selected>512 px</option>
                                        <option value="1024">1024 px</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 bottom-3 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>

                                <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 relative">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Sửa lỗi</label>
                                    <select id="opt-error" class="qr-opt zen-select w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white cursor-pointer p-0">
                                        <option value="L">Mức L (7%)</option>
                                        <option value="M">Mức M (15%)</option>
                                        <option value="Q">Mức Q (25%)</option>
                                        <option value="H" selected>Mức H (30%)</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 bottom-3 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>
                            </div>

                            <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3">
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-10 h-10 rounded-[12px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-accent-theme shrink-0 shadow-sm">
                                        <i class="fas fa-image text-sm"></i>
                                    </div>
                                    <div class="truncate">
                                        <span class="text-xs font-bold text-zinc-900 dark:text-white block truncate">Biểu tượng thương hiệu (Logo)</span>
                                        <span class="text-[11px] text-zinc-400 block truncate" id="logo-file-name">Tự động đặt giữa và tạo viền cách ly</span>
                                    </div>
                                </div>
                                <label class="h-9 px-3.5 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-all shadow-sm">
                                    <span>Chọn ảnh</span>
                                    <input type="file" id="opt-logo" accept="image/png, image/jpeg, image/webp" class="hidden">
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-6">
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-6 shadow-sm flex flex-col items-center justify-center space-y-5">
                            <div class="relative w-full max-w-[260px] aspect-square bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[20px] flex flex-col items-center justify-center overflow-hidden p-3.5" id="qr-canvas-wrapper">
                                <div class="text-zinc-400 flex flex-col items-center gap-2.5 opacity-60" id="qr-empty-state">
                                    <i class="fas fa-qrcode text-4xl"></i>
                                    <span class="text-xs font-semibold">Chưa có dữ liệu mã QR</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2.5 w-full">
                                <button id="btn-dl-png" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" disabled>
                                    <i class="fas fa-download text-xs"></i> <span>Tải xuống hình ảnh (PNG)</span>
                                </button>
                                <div class="flex gap-2 w-full">
                                    <button id="btn-dl-jpg" class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center gap-1.5 active:scale-95 transition-all opacity-50 pointer-events-none" disabled>
                                        <i class="fas fa-file-image text-xs"></i> <span>Tải JPG</span>
                                    </button>
                                    <button id="btn-copy-clip" class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center gap-1.5 active:scale-95 transition-all opacity-50 pointer-events-none" disabled>
                                        <i class="far fa-copy text-xs"></i> <span>Sao chép</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: READER & SCANNER SECTION -->
            <div id="section-scanner" class="space-y-4 hidden">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    <!-- LEFT SIDE: MEDIA SOURCE & SCANNER VIEWPORT -->
                    <div class="lg:col-span-7 space-y-4">
                        <!-- SOURCE BUTTONS INCLUDING FAST PASTE -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button id="btn-source-paste" class="h-11 rounded-[16px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                                <i class="fas fa-paste text-accent-theme"></i> <span>Dán nhanh</span>
                            </button>
                            <button id="btn-source-cam" class="h-11 rounded-[16px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                                <i class="fas fa-camera text-accent-theme"></i> <span>Camera</span>
                            </button>
                            <button id="btn-source-screen" class="h-11 rounded-[16px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                                <i class="fas fa-desktop text-accent-theme"></i> <span>Màn hình</span>
                            </button>
                            <label class="h-11 rounded-[16px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer">
                                <i class="fas fa-upload text-accent-theme"></i> <span>Tải ảnh</span>
                                <input type="file" id="scan-file-input" accept="image/*" class="hidden">
                            </label>
                        </div>

                        <!-- SCANNER DISPLAY CONTAINER -->
                        <div class="relative w-full aspect-video bg-black rounded-[24px] overflow-hidden border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-center">
                            <video id="scan-video" class="w-full h-full object-cover hidden" playsinline></video>
                            <img id="scan-img-preview" class="w-full h-full object-contain hidden" alt="Preview">
                            
                            <!-- SCANNER OVERLAY LINE -->
                            <div id="scan-overlay" class="absolute inset-0 hidden pointer-events-none">
                                <div class="scanner-scanner-line"></div>
                            </div>

                            <!-- PLACEHOLDER -->
                            <div id="scan-placeholder" class="text-center space-y-2 p-6">
                                <div class="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto text-xl backdrop-blur-md">
                                    <i class="fas fa-paste"></i>
                                </div>
                                <p class="text-xs font-semibold text-zinc-400">Bấm nút <span class="text-accent-theme font-bold">Dán nhanh</span> hoặc dùng phím tắt <kbd class="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">Ctrl+V</kbd> / <kbd class="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">Cmd+V</kbd></p>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT SIDE: SCAN RESULTS -->
                    <div class="lg:col-span-5 space-y-4">
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kết quả đọc mã</h3>
                                <span class="text-[10px] text-zinc-400 font-mono" id="scan-status-badge">Chờ dữ liệu</span>
                            </div>

                            <textarea id="scan-result-text" readonly class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-900 dark:text-white min-h-[140px] resize-none custom-scrollbar placeholder-zinc-400" placeholder="Nội dung mã QR sau khi giải mã sẽ xuất hiện tại đây..."></textarea>

                            <div class="flex flex-col gap-2">
                                <button id="btn-scan-reuse" disabled class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all opacity-50 pointer-events-none shadow-sm">
                                    <i class="fas fa-wand-magic-sparkles text-xs"></i> <span>Tái sử dụng nội dung để tạo & chỉnh sửa QR</span>
                                </button>
                                <div class="flex gap-2">
                                    <button id="btn-scan-copy" disabled class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center gap-1.5 active:scale-95 transition-all opacity-50 pointer-events-none">
                                        <i class="far fa-copy text-xs"></i> <span>Sao chép</span>
                                    </button>
                                    <button id="btn-scan-open" disabled class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center gap-1.5 active:scale-95 transition-all opacity-50 pointer-events-none">
                                        <i class="fas fa-external-link-alt text-xs"></i> <span>Mở liên kết</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 4. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#qr-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Tải Libraries
    const loadLibraries = () => {
        const p1 = new Promise((resolve) => {
            if (window.QRCode) return resolve();
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });

        const p2 = new Promise((resolve) => {
            if (window.jsQR) return resolve();
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });

        return Promise.all([p1, p2]);
    };

    // --- GENERATOR REFS ---
    const sectionGen = hostElement.querySelector('#section-generator');
    const sectionScan = hostElement.querySelector('#section-scanner');
    const tabModeGen = hostElement.querySelector('#tab-mode-gen');
    const tabModeScan = hostElement.querySelector('#tab-mode-scan');

    const dynamicFields = hostElement.querySelector('#qr-inputs-dynamic');
    const tabs = hostElement.querySelectorAll('#qr-type-tabs .qr-tab');
    const qrWrapper = hostElement.querySelector('#qr-canvas-wrapper');
    const logoInput = hostElement.querySelector('#opt-logo');
    const logoFileName = hostElement.querySelector('#logo-file-name');
    const qrTypeBadge = hostElement.querySelector('#qr-type-badge');

    const optColor = hostElement.querySelector('#opt-color');
    const optBg = hostElement.querySelector('#opt-bg');
    const optColorHex = hostElement.querySelector('#opt-color-hex');
    const optBgHex = hostElement.querySelector('#opt-bg-hex');
    
    const btnDlPng = hostElement.querySelector('#btn-dl-png');
    const btnDlJpg = hostElement.querySelector('#btn-dl-jpg');
    const btnCopyClip = hostElement.querySelector('#btn-copy-clip');
    const btnClear = hostElement.querySelector('#btn-qr-clear');
    
    let currentType = 'bank'; 
    let logoImgData = null;
    let isGenerated = false;

    // Tab Classes Standard
    const activeTabClass = 'qr-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveTabClass = 'qr-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    const switchToGenMode = () => {
        tabModeGen.className = "flex-1 h-10 rounded-[18px] text-xs font-bold bg-[#f4f4f6] dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-2";
        tabModeScan.className = "flex-1 h-10 rounded-[18px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2";
        sectionGen.classList.remove('hidden');
        sectionScan.classList.add('hidden');
        stopStream();
    };

    const switchToScanMode = () => {
        tabModeScan.className = "flex-1 h-10 rounded-[18px] text-xs font-bold bg-[#f4f4f6] dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all flex items-center justify-center gap-2";
        tabModeGen.className = "flex-1 h-10 rounded-[18px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2";
        sectionScan.classList.remove('hidden');
        sectionGen.classList.add('hidden');
    };

    tabModeGen?.addEventListener('click', switchToGenMode);
    tabModeScan?.addEventListener('click', switchToScanMode);

    const switchTabType = (targetType) => {
        tabs.forEach(t => {
            if (t.dataset.type === targetType) {
                t.className = activeTabClass;
            } else {
                t.className = inactiveTabClass;
            }
        });
        currentType = targetType;
        renderInputs(targetType);
    };

    // Render Input Fields theo Type
    const renderInputs = (type) => {
        let html = '';
        switch (type) {
            case 'bank':
                qrTypeBadge.textContent = 'VietQR EMVCo';
                let bankOptions = '<option value="">-- Chọn ngân hàng thụ hưởng --</option>';
                POPULAR_BANKS.forEach(b => {
                    bankOptions += `<option value="${b.bin}">${b.shortName} - ${b.name}</option>`;
                });
                bankOptions += '<option value="other">Khác (Nhập mã BIN thủ công)</option>';

                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1 relative">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Ngân hàng <span class="text-rose-500">*</span></label>
                            <select class="qr-in qr-input-zen zen-select w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 pr-8 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white cursor-pointer" id="in-bank-bin">${bankOptions}</select>
                            <i class="fas fa-chevron-down absolute right-3 bottom-3.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Số tài khoản <span class="text-rose-500">*</span></label>
                            <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-bank-acc" placeholder="Nhập số tài khoản...">
                        </div>
                    </div>
                    <div class="space-y-1" id="group-custom-bin" style="display: none;">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Mã BIN Ngân hàng (6 chữ số) <span class="text-rose-500">*</span></label>
                        <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-bank-custom-bin" placeholder="Ví dụ: 970436">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Số tiền thanh toán (VNĐ)</label>
                            <input type="number" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-bank-amount" placeholder="Ví dụ: 100000">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Nội dung chuyển khoản</label>
                            <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-bank-info" placeholder="Ví dụ: Dong tien quy">
                        </div>
                    </div>`;
                break;
            case 'url':
                qrTypeBadge.textContent = 'Web Hyperlink';
                html = `
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Địa chỉ liên kết (URL)</label>
                        <input type="url" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-url" placeholder="https://hunqos.workspace">
                    </div>`;
                break;
            case 'text':
                qrTypeBadge.textContent = 'Raw Text';
                html = `
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Văn bản cần mã hóa</label>
                        <textarea class="qr-in qr-input-zen w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white min-h-[110px] resize-y custom-scrollbar placeholder-zinc-400" id="in-text" placeholder="Nhập nội dung văn bản bất kỳ..."></textarea>
                    </div>`;
                break;
            case 'wifi':
                qrTypeBadge.textContent = 'WiFi Protocol';
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Tên mạng WiFi (SSID)</label>
                            <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-wifi-ssid" placeholder="Tên điểm phát WiFi">
                        </div>
                        <div class="space-y-1 relative">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Chuẩn bảo mật</label>
                            <select class="qr-in qr-input-zen zen-select w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 pr-8 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white cursor-pointer" id="in-wifi-enc">
                                <option value="WPA">WPA / WPA2 / WPA3</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">Không có mật khẩu</option>
                            </select>
                            <i class="fas fa-chevron-down absolute right-3 bottom-3.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Mật khẩu kết nối</label>
                        <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-wifi-pass" placeholder="Nhập mật khẩu WiFi...">
                    </div>`;
                break;
            case 'vcard':
                qrTypeBadge.textContent = 'vCard 3.0';
                html = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Họ và tên</label>
                            <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-vc-name" placeholder="Nguyễn Văn A">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Đơn vị / Công ty</label>
                            <input type="text" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-vc-org" placeholder="Công ty TNHH HunqOS">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Số điện thoại liên hệ</label>
                            <input type="tel" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-vc-tel" placeholder="0987654321">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Địa chỉ Email</label>
                            <input type="email" class="qr-in qr-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" id="in-vc-email" placeholder="contact@example.com">
                        </div>
                    </div>`;
                break;
        }
        dynamicFields.innerHTML = html;

        if (type === 'bank') {
            const selectBin = hostElement.querySelector('#in-bank-bin');
            const groupCustomBin = hostElement.querySelector('#group-custom-bin');
            selectBin?.addEventListener('change', (e) => {
                groupCustomBin.style.display = e.target.value === 'other' ? 'block' : 'none';
                triggerGenerate();
            });
        }

        dynamicFields.querySelectorAll('.qr-in').forEach(el => {
            el.addEventListener('input', triggerGenerate);
        });
    };

    // Chuẩn bị chuỗi Payload cho QR
    const getPayload = () => {
        const val = (id) => hostElement.querySelector(`#${id}`)?.value.trim() || '';
        switch (currentType) {
            case 'bank':
                const bankVal = val('in-bank-bin');
                const bin = bankVal === 'other' ? val('in-bank-custom-bin') : bankVal;
                const acc = val('in-bank-acc');
                const amt = val('in-bank-amount');
                const info = val('in-bank-info');
                
                if (!bin || !acc) return null;
                return buildVietQR(bin, acc, amt, info);
            case 'url': 
                return val('in-url');
            case 'text': 
                return val('in-text');
            case 'wifi': 
                if (!val('in-wifi-ssid')) return '';
                return `WIFI:S:${val('in-wifi-ssid')};T:${val('in-wifi-enc')};P:${val('in-wifi-pass')};;`;
            case 'vcard': 
                if (!val('in-vc-name') && !val('in-vc-tel') && !val('in-vc-email')) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${val('in-vc-name')}\nORG:${val('in-vc-org')}\nTEL:${val('in-vc-tel')}\nEMAIL:${val('in-vc-email')}\nEND:VCARD`;
            default: 
                return '';
        }
    };

    const resetPreview = () => {
        qrWrapper.innerHTML = `
            <div class="text-zinc-400 flex flex-col items-center gap-2.5 opacity-60" id="qr-empty-state">
                <i class="fas fa-qrcode text-4xl"></i>
                <span class="text-xs font-semibold">Chưa có dữ liệu mã QR</span>
            </div>
        `;
        isGenerated = false;

        [btnDlPng, btnDlJpg, btnCopyClip].forEach(b => {
            b.disabled = true;
            b.classList.add('opacity-50', 'pointer-events-none');
        });
    };

    // Tạo mã QR với qrcode.js
    const triggerGenerate = () => {
        const payload = getPayload();

        if (payload === null || payload === '') {
            resetPreview();
            return;
        }

        if (!window.QRCode) return;

        qrWrapper.innerHTML = '';

        const size = parseInt(hostElement.querySelector('#opt-size').value, 10);
        const color = hostElement.querySelector('#opt-color').value;
        const bg = hostElement.querySelector('#opt-bg').value;
        const errorStr = hostElement.querySelector('#opt-error').value;

        try {
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
            });

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
                        if (ctx.roundRect) {
                            ctx.beginPath();
                            ctx.roundRect(x - 8, y - 8, lSize + 16, lSize + 16, 10);
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
            resetPreview();
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTabType(tab.dataset.type);
            resetPreview();
        });
    });

    optColor?.addEventListener('input', (e) => {
        optColorHex.textContent = e.target.value.toLowerCase();
        if (isGenerated) triggerGenerate();
    });

    optBg?.addEventListener('input', (e) => {
        optBgHex.textContent = e.target.value.toLowerCase();
        if (isGenerated) triggerGenerate();
    });

    hostElement.querySelectorAll('.qr-opt').forEach(el => {
        el.addEventListener('change', () => {
            if (isGenerated) triggerGenerate();
        });
    });

    logoInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            logoFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (ev) => {
                logoImgData = ev.target.result;
                if (isGenerated) triggerGenerate();
                IslandKit.notify('Logo', 'Đã tích hợp logo vào tâm mã QR.', 'info');
            };
            reader.readAsDataURL(file);
        } else {
            logoFileName.textContent = 'Tự động đặt giữa và tạo viền cách ly';
            logoImgData = null;
            if (isGenerated) triggerGenerate();
        }
    });

    const downloadImage = (format) => {
        const canvas = qrWrapper.querySelector('canvas');
        if (!canvas) return;
        const dataURL = canvas.toDataURL(`image/${format}`, 1.0);
        const link = document.createElement('a');
        link.download = `HunqOS_QR_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = dataURL;
        link.click();
        IslandKit.notify('Tải xuống', `Đã lưu mã QR định dạng ${format.toUpperCase()}.`, 'success');
    };

    btnDlPng?.addEventListener('click', () => downloadImage('png')); 
    btnDlJpg?.addEventListener('click', () => downloadImage('jpeg')); 

    btnCopyClip?.addEventListener('click', async () => {
        const canvas = qrWrapper.querySelector('canvas');
        if (!canvas) return IslandKit.notify('Lỗi', 'Chưa có ảnh mã QR hoàn chỉnh.', 'error');
        try {
            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                IslandKit.notify('Đã sao chép', 'Hình ảnh QR đã lưu vào bộ nhớ tạm.', 'success');
            });
        } catch (err) {
            IslandKit.notify('Lỗi', 'Trình duyệt không hỗ trợ sao chép hình ảnh trực tiếp.', 'error');
        }
    });

    btnClear?.addEventListener('click', () => {
        UI.showConfirm('Đặt lại dữ liệu?', 'Toàn bộ nội dung, màu sắc tùy chỉnh và logo sẽ được khôi phục.', () => {
            optColor.value = '#000000';
            optBg.value = '#ffffff';
            optColorHex.textContent = '#000000';
            optBgHex.textContent = '#ffffff';
            hostElement.querySelector('#opt-size').value = '512';
            hostElement.querySelector('#opt-error').value = 'H';
            logoInput.value = '';
            logoFileName.textContent = 'Tự động đặt giữa và tạo viền cách ly';
            logoImgData = null;

            renderInputs(currentType);
            resetPreview();
            IslandKit.notify('Đã đặt lại', 'Các thông số đã trở về mặc định.', 'info');
        });
    });

    // =============================================================================
    // 5. SCANNER / READER ENGINE (CAMERA, SCREEN SHARE, FILE UPLOAD & FAST PASTE)
    // =============================================================================
    const videoEl = hostElement.querySelector('#scan-video');
    const imgPreviewEl = hostElement.querySelector('#scan-img-preview');
    const overlayEl = hostElement.querySelector('#scan-overlay');
    const placeholderEl = hostElement.querySelector('#scan-placeholder');
    const resultTextarea = hostElement.querySelector('#scan-result-text');
    const statusBadge = hostElement.querySelector('#scan-status-badge');

    const btnSourcePaste = hostElement.querySelector('#btn-source-paste');
    const btnSourceCam = hostElement.querySelector('#btn-source-cam');
    const btnSourceScreen = hostElement.querySelector('#btn-source-screen');
    const scanFileInput = hostElement.querySelector('#scan-file-input');

    const btnScanReuse = hostElement.querySelector('#btn-scan-reuse');
    const btnScanCopy = hostElement.querySelector('#btn-scan-copy');
    const btnScanOpen = hostElement.querySelector('#btn-scan-open');

    let mediaStream = null;
    let scanAnimationFrame = null;

    const canvasOffscreen = document.createElement('canvas');
    const ctxOffscreen = canvasOffscreen.getContext('2d');

    const stopStream = () => {
        if (scanAnimationFrame) {
            cancelAnimationFrame(scanAnimationFrame);
            scanAnimationFrame = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        videoEl.pause();
        videoEl.srcObject = null;
        videoEl.classList.add('hidden');
        imgPreviewEl.classList.add('hidden');
        overlayEl.classList.add('hidden');
        placeholderEl.classList.remove('hidden');
    };

    const handleResultFound = (text) => {
        resultTextarea.value = text;
        statusBadge.textContent = 'Thành công';
        statusBadge.className = 'text-[10px] text-accent-theme font-bold font-mono';

        [btnScanCopy, btnScanReuse].forEach(b => {
            b.disabled = false;
            b.classList.remove('opacity-50', 'pointer-events-none');
        });

        const isUrl = /^https?:\/\//i.test(text.trim());
        if (isUrl) {
            btnScanOpen.disabled = false;
            btnScanOpen.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            btnScanOpen.disabled = true;
            btnScanOpen.classList.add('opacity-50', 'pointer-events-none');
        }

        IslandKit.notify('Đã tìm thấy mã QR', 'Giải mã thông tin thành công.', 'success');
    };

    const scanFrameLoop = () => {
        if (!videoEl.videoWidth || !window.jsQR) {
            scanAnimationFrame = requestAnimationFrame(scanFrameLoop);
            return;
        }

        canvasOffscreen.width = videoEl.videoWidth;
        canvasOffscreen.height = videoEl.videoHeight;
        ctxOffscreen.drawImage(videoEl, 0, 0, canvasOffscreen.width, canvasOffscreen.height);

        const imageData = ctxOffscreen.getImageData(0, 0, canvasOffscreen.width, canvasOffscreen.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
            handleResultFound(code.data);
            stopStream();
            return;
        }

        scanAnimationFrame = requestAnimationFrame(scanFrameLoop);
    };

    const startVideoStream = async (stream, modeName) => {
        stopStream();
        mediaStream = stream;
        videoEl.srcObject = stream;
        videoEl.classList.remove('hidden');
        overlayEl.classList.remove('hidden');
        placeholderEl.classList.add('hidden');
        statusBadge.textContent = `Đang quét (${modeName})...`;
        statusBadge.className = 'text-[10px] text-amber-500 font-bold font-mono';

        stream.getVideoTracks()[0].onended = () => {
            stopStream();
            statusBadge.textContent = 'Đã dừng';
        };

        await videoEl.play();
        scanAnimationFrame = requestAnimationFrame(scanFrameLoop);
    };

    const processImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        stopStream();
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                imgPreviewEl.src = ev.target.result;
                imgPreviewEl.classList.remove('hidden');
                placeholderEl.classList.add('hidden');

                canvasOffscreen.width = img.width;
                canvasOffscreen.height = img.height;
                ctxOffscreen.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctxOffscreen.getImageData(0, 0, img.width, img.height);
                if (window.jsQR) {
                    const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                    if (code && code.data) {
                        handleResultFound(code.data);
                    } else {
                        statusBadge.textContent = 'Không tìm thấy QR';
                        statusBadge.className = 'text-[10px] text-rose-500 font-bold font-mono';
                        IslandKit.notify('Lỗi đọc ảnh', 'Không tìm thấy mã QR trong hình ảnh này.', 'error');
                    }
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    // 1. Nút Dán nhanh từ Clipboard
    btnSourcePaste?.addEventListener('click', async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.read) {
                IslandKit.notify('Dán ảnh', 'Hãy bấm phím Ctrl+V hoặc Cmd+V để dán ảnh.', 'info');
                return;
            }

            const clipboardItems = await navigator.clipboard.read();
            let hasImage = false;

            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    processImageFile(blob);
                    hasImage = true;
                    IslandKit.notify('Dán ảnh thành công', 'Đã lấy ảnh từ bộ nhớ tạm.', 'success');
                    break;
                }
            }

            if (!hasImage) {
                IslandKit.notify('Bộ nhớ tạm rỗng', 'Không tìm thấy hình ảnh nào trong Clipboard.', 'warning');
            }
        } catch (err) {
            IslandKit.notify('Quyền truy cập', 'Vui lòng nhấn Ctrl+V / Cmd+V hoặc cho phép quyền đọc Clipboard.', 'info');
        }
    });

    // 2. Quét Camera
    btnSourceCam?.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            startVideoStream(stream, 'Camera');
        } catch (err) {
            IslandKit.notify('Lỗi Camera', 'Không thể truy cập Camera thiết bị.', 'error');
        }
    });

    // 3. Quét Chia sẻ màn hình
    btnSourceScreen?.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });
            startVideoStream(stream, 'Màn hình');
        } catch (err) {
            IslandKit.notify('Thông báo', 'Hủy chọn chia sẻ màn hình.', 'info');
        }
    });

    // 4. Đọc mã từ Tải ảnh lên
    scanFileInput?.addEventListener('change', (e) => {
        processImageFile(e.target.files[0]);
    });

    // 5. Xử lý Dán ảnh trực tiếp toàn cục qua Ctrl + V / Cmd + V
    const handlePaste = (e) => {
        const clipboardItems = e.clipboardData?.items;
        if (!clipboardItems) return;

        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    switchToScanMode();
                    processImageFile(blob);
                    IslandKit.notify('Dán ảnh', 'Đang phân tích hình ảnh từ bộ nhớ tạm...', 'info');
                    break;
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);

    // 6. Nút Tái sử dụng nội dung vừa quét để tạo QR mới
    btnScanReuse?.addEventListener('click', () => {
        const val = resultTextarea.value.trim();
        if (!val) return;

        switchToGenMode();

        const isUrl = /^https?:\/\//i.test(val);
        if (isUrl) {
            switchTabType('url');
            const inUrl = hostElement.querySelector('#in-url');
            if (inUrl) inUrl.value = val;
        } else {
            switchTabType('text');
            const inText = hostElement.querySelector('#in-text');
            if (inText) inText.value = val;
        }

        triggerGenerate();
        IslandKit.notify('Tái sử dụng', 'Đã chuyển nội dung sang trình tạo mã QR.', 'success');
    });

    btnScanCopy?.addEventListener('click', () => {
        const val = resultTextarea.value;
        if (!val) return;
        navigator.clipboard.writeText(val);
        IslandKit.notify('Đã sao chép', 'Nội dung kết quả đã lưu vào bộ nhớ tạm.', 'success');
    });

    btnScanOpen?.addEventListener('click', () => {
        const val = resultTextarea.value.trim();
        if (val && /^https?:\/\//i.test(val)) {
            window.open(val, '_blank', 'noopener,noreferrer');
        }
    });

    // Khởi chạy ban đầu
    loadLibraries().then(() => {
        renderInputs('bank'); 
        resetPreview();
    });
}