import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* CSS hô biến bản đồ thành Dark Mode siêu mượt */
            .dark #ipc-map-container .leaflet-layer {
                filter: invert(1) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
        </style>

        <div class="relative min-h-[500px]">
            
            <div id="ipc-consent-modal" class="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-lg rounded-[32px] transition-all duration-300">
                <div class="premium-card bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-[28px] p-8 max-w-md w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-300 mx-4">
                    <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-2xl mb-5 shadow-sm">
                        <i class="fas fa-radar"></i>
                    </div>
                    <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Cấp quyền định vị IP</h3>
                    <p class="text-[13px] text-zinc-500 leading-relaxed mb-8">
                        Để hiển thị bản đồ và phân tích chi tiết dữ liệu mạng, công cụ cần kết nối với <strong class="text-zinc-800 dark:text-zinc-200 font-mono">ipapi.co</strong>. Bạn đồng ý cấp quyền chứ?
                    </p>
                    <div class="flex gap-3 w-full">
                        <button id="btn-ipc-decline" class="flex-1 py-3.5 rounded-xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">
                            Từ chối
                        </button>
                        <button id="btn-ipc-accept" class="flex-1 py-3.5 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-md active:scale-95">
                            Chấp nhận
                        </button>
                    </div>
                </div>
            </div>

            <div id="ipc-main-content" class="space-y-5 opacity-0 pointer-events-none hidden transition-opacity duration-500">
                
                <div class="flex justify-between items-end mb-2">
                    <div>
                        <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Phân tích IP & Bản đồ</h2>
                        <p class="text-sm text-zinc-500 mt-1">Trích xuất tối đa dữ liệu từ địa chỉ IP của bạn.</p>
                    </div>
                    <div class="flex gap-2">
                        <button id="btn-ipc-copy-all" class="h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm active:scale-95">
                            <i class="far fa-copy"></i> <span class="hidden sm:inline">Chép toàn bộ</span>
                        </button>
                        <button id="btn-ipc-refresh" class="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 transition-all flex items-center justify-center shadow-md active:scale-95 hover:opacity-90" title="Làm mới">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    <div class="lg:col-span-5 flex flex-col gap-4">
                        
                        <div class="premium-card bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col items-center text-center">
                            <div class="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div class="relative z-10 w-full">
                                <span class="flex justify-center items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                    <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> Public IP
                                </span>
                                <h3 class="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono mb-4" id="ipc-ip">
                                    <i class="fas fa-circle-notch fa-spin text-zinc-600"></i>
                                </h3>
                                <button id="btn-ipc-copy-ip" class="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-2 active:scale-95 border border-white/5 backdrop-blur-sm">
                                    <i class="fas fa-copy"></i> SAO CHÉP IP
                                </button>
                            </div>
                        </div>

                        <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <i class="fas fa-map-marker-alt text-rose-500"></i> Định vị địa lý
                            </h3>
                            <ul class="space-y-3">
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Quốc gia</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><span id="ipc-flag">🌍</span> <span id="ipc-country">--</span></span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Khu vực / Tỉnh</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="ipc-region">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Thành phố</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="ipc-city">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Mã bưu chính (Zip)</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="ipc-postal">--</span>
                                </li>
                            </ul>
                        </div>

                        <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <i class="fas fa-server text-indigo-500"></i> Thông tin Mạng
                            </h3>
                            <ul class="space-y-3">
                                <li class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500 shrink-0 mr-4">Nhà cung cấp (ISP)</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white text-right break-words" id="ipc-org">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Số hiệu mạng (ASN)</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="ipc-asn">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Loại địa chỉ</span>
                                    <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-bold text-zinc-700 dark:text-zinc-300" id="ipc-type">--</span>
                                </li>
                            </ul>
                        </div>

                        <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <i class="fas fa-globe-asia text-emerald-500"></i> Dữ liệu Khu vực
                            </h3>
                            <ul class="space-y-3">
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Múi giờ</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="ipc-timezone">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Tiền tệ</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white" id="ipc-currency">--</span>
                                </li>
                                <li class="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500">Mã vùng điện thoại</span>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white font-mono" id="ipc-calling-code">--</span>
                                </li>
                                <li class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <span class="text-xs font-medium text-zinc-500 shrink-0 mr-4">Ngôn ngữ</span>
                                    <span class="text-[13px] font-bold text-zinc-900 dark:text-white text-right truncate" id="ipc-languages">--</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div class="lg:col-span-7 h-[400px] lg:h-auto min-h-[600px] premium-card bg-zinc-100 dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative p-1.5 flex flex-col">
                        
                        <div class="flex-1 w-full relative rounded-[26px] overflow-hidden">
                            <div id="ipc-map-container" class="absolute inset-0 z-10 bg-zinc-100 dark:bg-zinc-900">
                                </div>
                            
                            <div class="absolute bottom-4 right-4 z-20 px-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-white/20 dark:border-zinc-700/50 shadow-lg flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <i class="fas fa-crosshairs"></i>
                                </div>
                                <div>
                                    <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Tọa độ GPS</p>
                                    <p id="ipc-coords" class="text-sm font-mono font-black text-zinc-900 dark:text-white">--</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
        
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    `;
}

export function init() {
    const modal = document.getElementById('ipc-consent-modal');
    const mainContent = document.getElementById('ipc-main-content');
    const btnAccept = document.getElementById('btn-ipc-accept');
    const btnDecline = document.getElementById('btn-ipc-decline');
    const btnRefresh = document.getElementById('btn-ipc-refresh');
    const btnCopyIp = document.getElementById('btn-ipc-copy-ip');
    const btnCopyAll = document.getElementById('btn-ipc-copy-all');

    const els = {
        ip: document.getElementById('ipc-ip'),
        type: document.getElementById('ipc-type'),
        flag: document.getElementById('ipc-flag'),
        country: document.getElementById('ipc-country'),
        region: document.getElementById('ipc-region'),
        city: document.getElementById('ipc-city'),
        postal: document.getElementById('ipc-postal'),
        org: document.getElementById('ipc-org'),
        asn: document.getElementById('ipc-asn'),
        timezone: document.getElementById('ipc-timezone'),
        currency: document.getElementById('ipc-currency'),
        callingCode: document.getElementById('ipc-calling-code'),
        languages: document.getElementById('ipc-languages'),
        coords: document.getElementById('ipc-coords')
    };

    let map = null;
    let marker = null;
    let currentData = null;

    // --- TẢI THƯ VIỆN LEAFLET DỰ PHÒNG ---
    const loadLeaflet = () => {
        return new Promise((resolve) => {
            if (window.L) return resolve();
            const script = document.createElement('script');
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
            script.crossOrigin = "";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    };

    // --- KHỞI TẠO HOẶC CẬP NHẬT BẢN ĐỒ ---
    const updateMap = (lat, lon) => {
        if (!window.L) return;

        if (!map) {
            map = L.map('ipc-map-container', {
                zoomControl: false,
                attributionControl: false
            }).setView([lat, lon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Tùy chỉnh Marker phong cách Minimal Premium (Trắng đen có hiệu ứng)
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="w-7 h-7 bg-zinc-900 dark:bg-white rounded-full border-4 border-white dark:border-zinc-900 shadow-xl flex items-center justify-center animate-bounce">
                           <div class="w-1.5 h-1.5 bg-white dark:bg-zinc-900 rounded-full"></div>
                       </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            marker = L.marker([lat, lon], { icon }).addTo(map);
        } else {
            map.setView([lat, lon], 13, { animate: true });
            marker.setLatLng([lat, lon]);
        }
    };

    // --- FETCH DATA ---
    const fetchIPData = async () => {
        const icon = btnRefresh.querySelector('i');
        icon.classList.add('fa-spin');
        els.ip.innerHTML = '<i class="fas fa-circle-notch fa-spin text-zinc-600"></i>';
        
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.error) throw new Error(data.reason);
            currentData = data;

            // Render Hero & Network
            els.ip.textContent = data.ip;
            els.type.textContent = data.version || 'IPv4';
            els.org.textContent = data.org || '--';
            els.asn.textContent = data.asn || '--';

            // Render Location
            els.flag.textContent = countryToEmoji(data.country_code);
            els.country.textContent = data.country_name || '--';
            els.region.textContent = data.region || '--';
            els.city.textContent = data.city || '--';
            els.postal.textContent = data.postal || '--';

            // Render Regional
            els.timezone.textContent = data.timezone ? `${data.timezone} (UTC ${data.utc_offset})` : '--';
            els.currency.textContent = data.currency ? `${data.currency} - ${data.currency_name}` : '--';
            els.callingCode.textContent = data.country_calling_code || '--';
            els.languages.textContent = data.languages ? data.languages.split(',').join(', ') : '--';

            // Coordinates & Map
            if (data.latitude && data.longitude) {
                els.coords.textContent = `${data.latitude}, ${data.longitude}`;
                await loadLeaflet();
                updateMap(data.latitude, data.longitude);
            } else {
                els.coords.textContent = '--';
            }

        } catch (error) {
            console.error(error);
            UI.showAlert('Lỗi', 'Không thể lấy dữ liệu IP. Hãy thử tắt AdBlock.', 'error');
            els.ip.textContent = 'Lỗi kết nối';
        } finally {
            icon.classList.remove('fa-spin');
        }
    };

    const countryToEmoji = (code) => {
        if (!code) return '🌍';
        return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    };

    // --- SỰ KIỆN NÚT BẤM ---
    btnDecline.onclick = () => window.location.hash = '#/';

    btnAccept.onclick = () => {
        modal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        setTimeout(() => {
            modal.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainContent.classList.replace('opacity-0', 'opacity-100');
            mainContent.classList.add('pointer-events-auto');
            fetchIPData();
        }, 300);
    };

    btnRefresh.onclick = fetchIPData;

    btnCopyIp.onclick = async () => {
        if (!currentData?.ip) return;
        try {
            await navigator.clipboard.writeText(currentData.ip);
            const originalHtml = btnCopyIp.innerHTML;
            btnCopyIp.innerHTML = '<i class="fas fa-check"></i> ĐÃ CHÉP';
            btnCopyIp.classList.add('text-emerald-400', 'border-emerald-500/50');
            setTimeout(() => {
                btnCopyIp.innerHTML = originalHtml;
                btnCopyIp.classList.remove('text-emerald-400', 'border-emerald-500/50');
            }, 2000);
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể copy', 'error');
        }
    };

    btnCopyAll.onclick = async () => {
        if (!currentData) return;
        const text = `--- BÁO CÁO CHI TIẾT IP ---
IP: ${currentData.ip} (${currentData.version})
ISP: ${currentData.org}
ASN: ${currentData.asn}

Quốc gia: ${currentData.country_name} (${currentData.country_code})
Thành phố: ${currentData.city}
Khu vực: ${currentData.region}
Mã bưu chính: ${currentData.postal}
Tọa độ: ${currentData.latitude}, ${currentData.longitude}

Múi giờ: ${currentData.timezone} (UTC ${currentData.utc_offset})
Tiền tệ: ${currentData.currency} - ${currentData.currency_name}
Mã vùng gọi: ${currentData.country_calling_code}
Ngôn ngữ: ${currentData.languages}`;

        try {
            await navigator.clipboard.writeText(text);
            UI.showAlert('Đã chép', 'Toàn bộ thông tin báo cáo đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể copy', 'error');
        }
    };
}