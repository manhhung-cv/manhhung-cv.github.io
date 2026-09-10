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
    <div id="ip-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #ip-root-container {
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

            .dark #ipc-map-container .leaflet-layer {
                filter: invert(1) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
        </style>

        <div class="relative w-full h-full">
            
            <!-- CONSENT & PRIVACY WARNING MODAL -->
            <div id="ipc-consent-modal" class="absolute inset-0 z-50 flex items-center justify-center bg-white/75 dark:bg-black/80 backdrop-blur-xl transition-all duration-300 p-4">
                <div class="rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-2xl p-6 sm:p-7 max-w-md w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-200 space-y-4">
                    <div class="w-14 h-14 rounded-[18px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-2xl shadow-sm">
                        <i class="fas fa-shield-halved"></i>
                    </div>

                    <div class="space-y-1.5">
                        <h3 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Cấp quyền & Quyền riêng tư</h3>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed text-left">
                            Để định vị và lập bản đồ mạng, công cụ cần kết nối trực tiếp đến API ngoài. 
                            <strong class="text-rose-500 font-semibold block mt-1">Lưu ý: Địa chỉ IP thực tế và thời gian truy vấn của bạn sẽ được máy chủ bên thứ ba ghi nhận khi gửi yêu cầu.</strong>
                        </p>
                    </div>

                    <!-- SEGMENTED TABS CHỌN MÁY CHỦ TRÊN MODAL (2 CỘT TƯƠNG PHẢN CAO) -->
                    <div class="w-full space-y-1.5 text-left pt-1">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-1">Chọn máy chủ kết nối</span>
                        <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="ipc-modal-server-tabs">
                            <button type="button" class="ipc-srv-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate" data-server="auto">
                                Tự động
                            </button>
                            <button type="button" class="ipc-srv-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-server="ipapi">
                                ipapi.co
                            </button>
                            <button type="button" class="ipc-srv-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-server="ipinfo">
                                ipinfo.io
                            </button>
                        </div>
                    </div>

                    <div class="flex gap-2.5 w-full pt-2">
                        <button id="btn-ipc-decline" class="flex-1 h-11 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95 transition-all">
                            Hủy bỏ
                        </button>
                        <button id="btn-ipc-accept" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5">
                            Tôi đồng ý <i class="fas fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- MAIN SCROLLER -->
            <main id="ipc-main-content" class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5 opacity-0 pointer-events-none hidden transition-opacity duration-300">
                
                <!-- SEAMLESS HERO TITLE -->
                <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                            <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Network Inspector</span>
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Phân tích IP & Bản đồ</h1>
                        <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Trích xuất vị trí địa lý, nhà mạng (ISP) và tọa độ thời gian thực.</p>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <button id="btn-ipc-copy-all" class="h-10 px-3 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Sao chép toàn bộ báo cáo">
                            <i class="far fa-copy text-[11px]"></i> <span class="hidden sm:inline">Chép tất cả</span>
                        </button>

                        <button id="btn-ipc-refresh" class="w-10 h-10 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Làm mới dữ liệu">
                            <i class="fas fa-arrows-rotate text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- LIVE CONTROLS: SEGMENTED TABS TRÊN MAIN VIEW -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Máy chủ API:</span>
                        <span class="text-[10px] font-mono text-zinc-500 dark:text-zinc-400" id="ipc-provider-badge">Đang kết nối</span>
                    </div>

                    <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-80" id="ipc-live-server-tabs">
                        <button type="button" class="ipc-srv-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate" data-server="auto">
                            Tự động
                        </button>
                        <button type="button" class="ipc-srv-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-server="ipapi">
                            ipapi.co
                        </button>
                        <button type="button" class="ipc-srv-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-server="ipinfo">
                            ipinfo.io
                        </button>
                    </div>
                </div>

                <!-- WORKSPACE GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    <!-- CỘT TRÁI: DỮ LIỆU IP & MẠNG (5 COLS) -->
                    <div class="lg:col-span-5 flex flex-col gap-4">
                        
                        <!-- PUBLIC IP CARD -->
                        <div class="rounded-[24px] bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-[#121214] dark:to-black text-white border border-white/5 p-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                            <div class="absolute top-0 right-0 w-40 h-40 bg-accent-theme-alpha rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div class="relative z-10 w-full space-y-3">
                                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300 border border-white/5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-accent-theme animate-pulse"></span> Public IP
                                </div>

                                <h3 class="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight" id="ipc-ip">
                                    <i class="fas fa-circle-notch fa-spin text-zinc-600 text-2xl"></i>
                                </h3>

                                <div class="pt-1">
                                    <button id="btn-ipc-copy-ip" class="mx-auto px-3.5 py-1.5 rounded-[12px] bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 active:scale-95 border border-white/10">
                                        <i class="far fa-copy text-[10px]"></i> Sao chép IP
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- VỊ TRÍ ĐỊA LÝ -->
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-map-pin text-rose-500"></i> Định vị địa lý
                            </h3>

                            <ul class="space-y-2.5 text-xs">
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Quốc gia</span>
                                    <span class="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                        <span id="ipc-flag">🌍</span> <span id="ipc-country">--</span>
                                    </span>
                                </li>
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Khu vực / Tỉnh</span>
                                    <span class="font-bold text-zinc-900 dark:text-white" id="ipc-region">--</span>
                                </li>
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Thành phố</span>
                                    <span class="font-bold text-zinc-900 dark:text-white" id="ipc-city">--</span>
                                </li>
                                <li class="flex justify-between items-center">
                                    <span class="text-zinc-500">Mã bưu chính (ZIP)</span>
                                    <span class="font-bold font-mono text-zinc-900 dark:text-white" id="ipc-postal">--</span>
                                </li>
                            </ul>
                        </div>

                        <!-- THÔNG TIN MẠNG -->
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-network-wired text-indigo-500"></i> Thông tin mạng
                            </h3>

                            <ul class="space-y-2.5 text-xs">
                                <li class="flex justify-between items-start border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500 shrink-0 mr-3">Nhà cung cấp (ISP)</span>
                                    <span class="font-bold text-zinc-900 dark:text-white text-right break-words font-mono" id="ipc-org">--</span>
                                </li>
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Số hiệu mạng (ASN)</span>
                                    <span class="font-bold font-mono text-zinc-900 dark:text-white" id="ipc-asn">--</span>
                                </li>
                                <li class="flex justify-between items-center">
                                    <span class="text-zinc-500">Loại địa chỉ</span>
                                    <span class="px-2 py-0.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-[10px] font-bold font-mono text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.06]" id="ipc-type">IPv4</span>
                                </li>
                            </ul>
                        </div>

                        <!-- KHU VỰC & THỜI GIAN -->
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-clock text-accent-theme"></i> Bản địa & Múi giờ
                            </h3>

                            <ul class="space-y-2.5 text-xs">
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Múi giờ</span>
                                    <span class="font-bold text-zinc-900 dark:text-white font-mono" id="ipc-timezone">--</span>
                                </li>
                                <li class="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                                    <span class="text-zinc-500">Tiền tệ</span>
                                    <span class="font-bold text-zinc-900 dark:text-white font-mono" id="ipc-currency">--</span>
                                </li>
                                <li class="flex justify-between items-center">
                                    <span class="text-zinc-500">Mã vùng gọi</span>
                                    <span class="font-bold font-mono text-zinc-900 dark:text-white" id="ipc-calling-code">--</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <!-- CỘT PHẢI: BẢN ĐỒ LEAFLET TRỰC QUAN (7 COLS) -->
                    <div class="lg:col-span-7 h-[420px] lg:h-[640px] rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden relative p-1.5 flex flex-col">
                        <div class="flex-1 w-full relative rounded-[20px] overflow-hidden">
                            <div id="ipc-map-container" class="absolute inset-0 z-10 bg-[#f2f2f7] dark:bg-black/60"></div>
                            
                            <!-- GPS COORDS OVERLAY -->
                            <div class="absolute bottom-3 right-3 z-20 px-3.5 py-2.5 bg-white/85 dark:bg-[#161618]/85 backdrop-blur-md rounded-[16px] border border-black/[0.05] dark:border-white/[0.08] shadow-md flex items-center gap-2.5">
                                <div class="w-7 h-7 rounded-[10px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-crosshairs"></i>
                                </div>
                                <div class="space-y-0.5">
                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">Tọa độ GPS</span>
                                    <span id="ipc-coords" class="text-xs font-mono font-bold text-zinc-900 dark:text-white">--</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

        </div>
        
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & MULTI-SERVER ENGINE (ipapi.co & ipinfo.io)
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#ip-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const modal = _('#ipc-consent-modal');
    const mainContent = _('#ipc-main-content');
    const btnAccept = _('#btn-ipc-accept');
    const btnDecline = _('#btn-ipc-decline');
    const btnRefresh = _('#btn-ipc-refresh');
    const btnCopyIp = _('#btn-ipc-copy-ip');
    const btnCopyAll = _('#btn-ipc-copy-all');
    const providerBadge = _('#ipc-provider-badge');

    const els = {
        ip: _('#ipc-ip'),
        type: _('#ipc-type'),
        flag: _('#ipc-flag'),
        country: _('#ipc-country'),
        region: _('#ipc-region'),
        city: _('#ipc-city'),
        postal: _('#ipc-postal'),
        org: _('#ipc-org'),
        asn: _('#ipc-asn'),
        timezone: _('#ipc-timezone'),
        currency: _('#ipc-currency'),
        callingCode: _('#ipc-calling-code'),
        coords: _('#ipc-coords')
    };

    let map = null;
    let marker = null;
    let currentData = null;
    let currentServer = 'auto';

    const loadLeaflet = () => {
        return new Promise((resolve) => {
            if (window.L) return resolve();
            const script = document.createElement('script');
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.crossOrigin = "";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    };

    const updateMap = (lat, lon) => {
        if (!window.L) return;

        const mapContainer = _('#ipc-map-container');
        if (!mapContainer) return;

        if (!map) {
            map = L.map(mapContainer, {
                zoomControl: false,
                attributionControl: false
            }).setView([lat, lon], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            const accentColor = ThemeKit.getAccentColor();
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${accentColor};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                           <div class="w-2 h-2 bg-white rounded-full"></div>
                       </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            marker = L.marker([lat, lon], { icon }).addTo(map);
        } else {
            map.setView([lat, lon], 12, { animate: true });
            marker.setLatLng([lat, lon]);
        }
    };

    const countryToEmoji = (code) => {
        if (!code) return '🌍';
        return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    };

    // =========================================================================
    // PROVIDER ENGINES (ipapi.co & ipinfo.io)
    // =========================================================================
    const fetchFromIpApiCo = async () => {
        const res = await fetch('https://ipapi.co/json/');
        const d = await res.json();
        if (d.error) throw new Error(d.reason || 'ipapi.co error');
        return {
            ip: d.ip,
            version: d.version || 'IPv4',
            country_name: d.country_name,
            country_code: d.country_code,
            region: d.region,
            city: d.city,
            postal: d.postal || '--',
            org: d.org || '--',
            asn: d.asn || '--',
            timezone: d.timezone ? `${d.timezone} (UTC ${d.utc_offset})` : '--',
            currency: d.currency ? `${d.currency} - ${d.currency_name || ''}` : '--',
            country_calling_code: d.country_calling_code || '--',
            latitude: d.latitude,
            longitude: d.longitude,
            provider: 'ipapi.co'
        };
    };

    const fetchFromIpInfo = async () => {
        const res = await fetch('https://ipinfo.io/json');
        const d = await res.json();
        const [lat, lon] = (d.loc || '').split(',').map(Number);
        return {
            ip: d.ip,
            version: (d.ip || '').includes(':') ? 'IPv6' : 'IPv4',
            country_name: d.country || '--',
            country_code: d.country || '',
            region: d.region || '--',
            city: d.city || '--',
            postal: d.postal || '--',
            org: d.org || '--',
            asn: (d.org || '').split(' ')[0] || '--',
            timezone: d.timezone || '--',
            currency: '--',
            country_calling_code: '--',
            latitude: lat,
            longitude: lon,
            provider: 'ipinfo.io'
        };
    };

    const fetchIPData = async () => {
        const spinIcon = btnRefresh?.querySelector('i');
        spinIcon?.classList.add('fa-spin');
        if (els.ip) els.ip.innerHTML = '<i class="fas fa-circle-notch fa-spin text-zinc-500 text-xl"></i>';

        let data = null;
        let lastError = null;

        const executeServer = async (srv) => {
            if (srv === 'ipapi') return await fetchFromIpApiCo();
            if (srv === 'ipinfo') return await fetchFromIpInfo();
            throw new Error('Máy chủ không được hỗ trợ');
        };

        try {
            if (currentServer === 'auto') {
                const pipeline = ['ipapi', 'ipinfo'];
                for (const srv of pipeline) {
                    try {
                        data = await executeServer(srv);
                        break;
                    } catch (err) {
                        lastError = err;
                    }
                }
            } else {
                data = await executeServer(currentServer);
            }

            if (!data) throw lastError || new Error('Không thể kết nối đến máy chủ.');

            currentData = data;

            if (els.ip) els.ip.textContent = data.ip;
            if (els.type) els.type.textContent = data.version;
            if (els.org) els.org.textContent = data.org;
            if (els.asn) els.asn.textContent = data.asn;

            if (els.flag) els.flag.textContent = countryToEmoji(data.country_code);
            if (els.country) els.country.textContent = data.country_name;
            if (els.region) els.region.textContent = data.region;
            if (els.city) els.city.textContent = data.city;
            if (els.postal) els.postal.textContent = data.postal;

            if (els.timezone) els.timezone.textContent = data.timezone;
            if (els.currency) els.currency.textContent = data.currency;
            if (els.callingCode) els.callingCode.textContent = data.country_calling_code;

            if (providerBadge) providerBadge.textContent = `${data.provider} (${currentServer === 'auto' ? 'Tự động' : 'Chỉ định'})`;

            if (data.latitude && data.longitude) {
                if (els.coords) els.coords.textContent = `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
                await loadLeaflet();
                updateMap(data.latitude, data.longitude);
            } else {
                if (els.coords) els.coords.textContent = '--';
            }

            IslandKit.notify('Định vị thành công', `Đã nhận diện: ${data.ip} qua ${data.provider}`, 'success');

        } catch (error) {
            console.error(error);
            if (els.ip) els.ip.textContent = 'Lỗi kết nối';
            if (providerBadge) providerBadge.textContent = 'Bị chặn';
            IslandKit.notify('Lỗi tải dữ liệu', 'Máy chủ hiện tại bị chặn hoặc hết lượt. Hãy đổi sang máy chủ khác.', 'error');
        } finally {
            spinIcon?.classList.remove('fa-spin');
        }
    };

    // =========================================================================
    // SEGMENTED TABS SYNC (MODAL & MAIN VIEW)
    // =========================================================================
    const activeTabClass = 'ipc-srv-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate';
    const inactiveTabClass = 'ipc-srv-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate';

    const syncServerTabs = (selectedServer) => {
        currentServer = selectedServer;
        $$('.ipc-srv-tab').forEach(btn => {
            if (btn.dataset.server === selectedServer) {
                btn.className = activeTabClass;
            } else {
                btn.className = inactiveTabClass;
            }
        });
    };

    $$('#ipc-modal-server-tabs .ipc-srv-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            syncServerTabs(btn.dataset.server);
        });
    });

    $$('#ipc-live-server-tabs .ipc-srv-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            syncServerTabs(btn.dataset.server);
            fetchIPData();
        });
    });

    btnAccept?.addEventListener('click', () => {
        modal?.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        setTimeout(() => {
            modal?.classList.add('hidden');
            mainContent?.classList.remove('hidden');
            mainContent?.classList.replace('opacity-0', 'opacity-100');
            mainContent?.classList.remove('pointer-events-none');
            fetchIPData();
        }, 250);
    });

    btnDecline?.addEventListener('click', () => {
        window.history.back();
    });

    btnRefresh?.addEventListener('click', fetchIPData);

    btnCopyIp?.addEventListener('click', async () => {
        if (!currentData?.ip) return;
        try {
            await navigator.clipboard.writeText(currentData.ip);
            IslandKit.notify('Đã sao chép IP', currentData.ip, 'success');
        } catch (e) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    btnCopyAll?.addEventListener('click', async () => {
        if (!currentData) return;
        const text = `--- BÁO CÁO PHÂN TÍCH IP (HUNQOS) ---
Máy chủ API: ${currentData.provider} (${currentServer})
Địa chỉ IP: ${currentData.ip} (${currentData.version})
ISP: ${currentData.org}
ASN: ${currentData.asn}

[ VỊ TRÍ ĐỊA LÝ ]
Quốc gia: ${currentData.country_name} (${currentData.country_code})
Thành phố: ${currentData.city}
Khu vực: ${currentData.region}
Mã ZIP: ${currentData.postal}
Tọa độ GPS: ${currentData.latitude}, ${currentData.longitude}

[ MÔI TRƯỜNG ]
Múi giờ: ${currentData.timezone}
Tiền tệ: ${currentData.currency}
Mã vùng gọi: ${currentData.country_calling_code}`;

        try {
            await navigator.clipboard.writeText(text);
            IslandKit.notify('Đã sao chép báo cáo', 'Toàn bộ thông tin mạng đã lưu vào clipboard.', 'success');
        } catch (e) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });
}