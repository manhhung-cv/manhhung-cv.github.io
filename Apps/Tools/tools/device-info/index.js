import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Thông tin Thiết bị</h2>
                    <p class="text-sm text-zinc-500 mt-1">Khám phá chi tiết phần cứng, trình duyệt và mạng của bạn.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-start">
                
                <div class="md:col-span-2 lg:col-span-3 premium-card bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 p-6 md:p-8 rounded-[32px] border border-zinc-800 shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div id="di-os-icon" class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl text-white shadow-inner shrink-0 relative z-10">
                        <i class="fas fa-laptop"></i>
                    </div>
                    <div class="text-center sm:text-left relative z-10 flex-1">
                        <h2 id="di-os-name" class="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Đang tải...</h2>
                        <p id="di-browser-name" class="text-zinc-400 font-medium text-sm md:text-base">Trình duyệt: Đang phân tích...</p>
                    </div>
                    <div class="relative z-10 shrink-0 mt-4 sm:mt-0">
                         <div id="di-online-badge" class="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-2">
                            <i class="fas fa-circle text-[8px] animate-pulse"></i> Trực tuyến
                         </div>
                    </div>
                </div>

                <div class="premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col h-full">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <i class="fas fa-desktop text-blue-500"></i> Hiển thị & Màn hình
                    </h3>
                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Độ phân giải</span>
                            <span id="di-screen" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Khung nhìn (Viewport)</span>
                            <span id="di-viewport" class="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Tỷ lệ Pixel (DPR)</span>
                            <span id="di-dpr" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Độ sâu màu</span>
                            <span id="di-color-depth" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Góc xoay</span>
                            <span id="di-orientation" class="font-mono font-bold text-zinc-900 dark:text-white text-right">--</span>
                        </div>
                    </div>
                </div>

                <div class="premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col h-full">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <i class="fas fa-microchip text-indigo-500"></i> Phần cứng & GPU
                    </h3>
                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Nhân CPU (Cores)</span>
                            <span id="di-cpu" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">RAM ước tính</span>
                            <span id="di-ram" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Cảm ứng</span>
                            <span id="di-touch" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-start text-sm flex-col gap-1 mt-2">
                            <span class="text-zinc-500 font-medium">Card Đồ họa (GPU)</span>
                            <span id="di-gpu" class="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md text-[11px] w-full break-words">Đang phân tích...</span>
                        </div>
                    </div>
                </div>

                <div class="premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col h-full">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <i class="fas fa-wifi text-amber-500"></i> Mạng & Năng lượng
                    </h3>
                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Loại kết nối</span>
                            <span id="di-network" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Tốc độ (Downlink)</span>
                            <span id="di-downlink" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm mt-4 border-t border-zinc-50 dark:border-zinc-800/50 pt-3">
                            <span class="text-zinc-500 font-medium">Mức Pin</span>
                            <span id="di-battery-level" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Trạng thái Sạc</span>
                            <span id="di-battery-status" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2 lg:col-span-1 premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col h-full">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <i class="fas fa-cog text-rose-500"></i> Hệ thống
                    </h3>
                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Ngôn ngữ</span>
                            <span id="di-lang" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Múi giờ</span>
                            <span id="di-timezone" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Cookie Enabled</span>
                            <span id="di-cookie" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Do Not Track</span>
                            <span id="di-dnt" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-zinc-500 font-medium">Nền tảng</span>
                            <span id="di-platform" class="font-mono font-bold text-zinc-900 dark:text-white text-right">--</span>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2 premium-card bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col h-full">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <i class="fas fa-fingerprint text-zinc-500"></i> Định danh Trình duyệt (User Agent)
                    </h3>
                    <div id="di-ua-text" class="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-words h-full">
                        Đang lấy dữ liệu...
                    </div>
                </div>

            </div>

            <button id="btn-di-copy" class="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[20px] font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-3">
                <i class="fas fa-copy"></i> SAO CHÉP TOÀN BỘ CẤU HÌNH
            </button>

        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const els = {
        osIcon: document.getElementById('di-os-icon'),
        osName: document.getElementById('di-os-name'),
        browserName: document.getElementById('di-browser-name'),
        onlineBadge: document.getElementById('di-online-badge'),
        
        screen: document.getElementById('di-screen'),
        viewport: document.getElementById('di-viewport'),
        dpr: document.getElementById('di-dpr'),
        colorDepth: document.getElementById('di-color-depth'),
        orientation: document.getElementById('di-orientation'),
        
        cpu: document.getElementById('di-cpu'),
        ram: document.getElementById('di-ram'),
        touch: document.getElementById('di-touch'),
        gpu: document.getElementById('di-gpu'),
        
        network: document.getElementById('di-network'),
        downlink: document.getElementById('di-downlink'),
        batteryLevel: document.getElementById('di-battery-level'),
        batteryStatus: document.getElementById('di-battery-status'),
        
        lang: document.getElementById('di-lang'),
        timezone: document.getElementById('di-timezone'),
        cookie: document.getElementById('di-cookie'),
        dnt: document.getElementById('di-dnt'),
        platform: document.getElementById('di-platform'),
        
        uaText: document.getElementById('di-ua-text'),
        btnCopy: document.getElementById('btn-di-copy')
    };

    let fullDataForCopy = "";

    // --- Phân tích User Agent ---
    const parseUserAgent = () => {
        const ua = navigator.userAgent;
        let os = "Không xác định";
        let icon = '<i class="fas fa-laptop"></i>';
        
        if (/windows phone/i.test(ua)) { os = "Windows Phone"; icon = '<i class="fab fa-windows"></i>'; }
        else if (/win/i.test(ua)) { os = "Windows"; icon = '<i class="fab fa-windows"></i>'; }
        else if (/android/i.test(ua)) { os = "Android"; icon = '<i class="fab fa-android"></i>'; }
        else if (/ipad|iphone|ipod/i.test(ua)) { os = "iOS"; icon = '<i class="fab fa-apple"></i>'; }
        else if (/mac/i.test(ua)) { os = "macOS"; icon = '<i class="fab fa-apple"></i>'; }
        else if (/linux/i.test(ua)) { os = "Linux"; icon = '<i class="fab fa-linux"></i>'; }

        if (os === 'macOS' && navigator.maxTouchPoints > 1) {
            os = "iOS (iPad)";
            icon = '<i class="fab fa-apple"></i>';
        }

        let browser = "Không xác định";
        if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
        else if (/edg/i.test(ua)) browser = "Microsoft Edge";
        else if (/chrome|chromium|crios/i.test(ua)) browser = "Google Chrome";
        else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
        else if (/safari/i.test(ua)) browser = "Apple Safari";

        return { os, icon, browser, ua };
    };

    // --- Lấy thông tin Card đồ họa (GPU WebGL) ---
    const getGPUInfo = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) { console.warn("Không lấy được GPU info"); }
        return "Không xác định / Bị ẩn";
    };

    // --- Khởi tạo dữ liệu ---
    const renderDeviceInfo = () => {
        const parsedUA = parseUserAgent();
        
        // 1. Hero
        els.osName.textContent = parsedUA.os;
        els.osIcon.innerHTML = parsedUA.icon;
        els.browserName.textContent = `Trình duyệt: ${parsedUA.browser}`;
        els.uaText.textContent = parsedUA.ua;

        // 2. Màn hình
        els.screen.textContent = `${window.screen.width} x ${window.screen.height} px`;
        els.dpr.textContent = window.devicePixelRatio || 1;
        els.colorDepth.textContent = `${window.screen.colorDepth}-bit`;
        updateViewport();

        // 3. Phần cứng & GPU
        els.cpu.textContent = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Không hỗ trợ';
        els.ram.textContent = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : 'Không hỗ trợ API';
        els.touch.textContent = navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} điểm` : 'Không hỗ trợ';
        els.gpu.textContent = getGPUInfo();
        
        // 4. Mạng & Pin
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        els.network.textContent = conn?.effectiveType ? conn.effectiveType.toUpperCase() : 'Không xác định';
        els.downlink.textContent = conn?.downlink ? `${conn.downlink} Mbps` : 'Không xác định';
        updateOnlineStatus();

        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBattery = () => {
                    els.batteryLevel.textContent = `${Math.round(battery.level * 100)}%`;
                    els.batteryStatus.innerHTML = battery.charging ? `<span class="text-emerald-500"><i class="fas fa-bolt"></i> Đang sạc</span>` : 'Rút sạc';
                    buildCopyText();
                };
                updateBattery();
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);
            });
        } else {
            els.batteryLevel.textContent = "Không hỗ trợ";
            els.batteryStatus.textContent = "Không hỗ trợ";
        }

        // 5. Hệ thống
        els.lang.textContent = navigator.language || navigator.userLanguage;
        try { els.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; } 
        catch(e) { els.timezone.textContent = "Không xác định"; }
        els.cookie.textContent = navigator.cookieEnabled ? "Đang bật" : "Đã tắt";
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        els.dnt.textContent = (dnt === "1" || dnt === "yes") ? "Bật (Yes)" : "Tắt (No)";
        els.platform.textContent = navigator.platform || "Không xác định";

        buildCopyText();
    };

    const updateViewport = () => {
        els.viewport.textContent = `${window.innerWidth} x ${window.innerHeight} px`;
        let ori = "Không xác định";
        if (window.matchMedia("(orientation: portrait)").matches) ori = "Dọc (Portrait)";
        if (window.matchMedia("(orientation: landscape)").matches) ori = "Ngang (Landscape)";
        els.orientation.textContent = ori;
    };

    const updateOnlineStatus = () => {
        if (navigator.onLine) {
            els.onlineBadge.className = "px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-2";
            els.onlineBadge.innerHTML = `<i class="fas fa-circle text-[8px] animate-pulse"></i> Trực tuyến`;
        } else {
            els.onlineBadge.className = "px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm flex items-center gap-2";
            els.onlineBadge.innerHTML = `<i class="fas fa-wifi-slash text-sm"></i> Mất mạng`;
        }
    };

    const buildCopyText = () => {
        fullDataForCopy = `--- THÔNG TIN THIẾT BỊ ---
Hệ điều hành: ${els.osName.textContent}
Trình duyệt: ${els.browserName.textContent.replace('Trình duyệt: ', '')}

[ MÀN HÌNH ]
Độ phân giải: ${els.screen.textContent}
Khung nhìn: ${els.viewport.textContent}
Tỷ lệ Pixel: ${els.dpr.textContent}
Góc xoay: ${els.orientation.textContent}

[ PHẦN CỨNG & GPU ]
CPU: ${els.cpu.textContent}
RAM: ${els.ram.textContent}
GPU: ${els.gpu.textContent}
Mạng: ${els.network.textContent} (${els.downlink.textContent})

[ HỆ THỐNG ]
Ngôn ngữ: ${els.lang.textContent}
Múi giờ: ${els.timezone.textContent}
Nền tảng: ${els.platform.textContent}

[ USER AGENT ]
${els.uaText.textContent}`;
    };

    // --- Sự kiện ---
    window.addEventListener('resize', () => { updateViewport(); buildCopyText(); });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    els.btnCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(fullDataForCopy);
            UI.showAlert('Đã chép', 'Toàn bộ thông tin cấu hình đã được sao chép.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
        }
    });

    renderDeviceInfo();
}