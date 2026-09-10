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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD ACCENT)
// =============================================================================
export function template() {
    return `
    <div id="devinfo-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #devinfo-root-container {
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
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Diagnostics</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Thông tin Thiết bị</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Chi tiết thông số phần cứng, màn hình, trình duyệt và kết nối mạng.</p>
            </div>

            <!-- HERO OVERVIEW CARD -->
            <div class="rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-accent-theme-alpha rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                
                <div id="di-os-icon" class="w-16 h-16 rounded-[20px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-3xl shrink-0 relative z-10 border border-black/[0.04] dark:border-white/[0.06]">
                    <i class="fas fa-laptop"></i>
                </div>

                <div class="text-center sm:text-left relative z-10 flex-1 space-y-1">
                    <h2 id="di-os-name" class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Đang tải...</h2>
                    <p id="di-browser-name" class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium font-mono">Trình duyệt: Đang phân tích...</p>
                </div>

                <div class="relative z-10 shrink-0">
                    <div id="di-online-badge" class="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
                        <i class="fas fa-circle text-[7px] animate-pulse"></i> Trực tuyến
                    </div>
                </div>
            </div>

            <!-- DETAILS GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                
                <!-- CARD 1: MÀN HÌNH -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-desktop text-accent-theme"></i> Hiển thị & Màn hình
                        </h3>
                    </div>

                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Độ phân giải</span>
                            <span id="di-screen" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Khung nhìn (Viewport)</span>
                            <span id="di-viewport" class="font-mono font-bold text-accent-theme bg-accent-theme-alpha px-2 py-0.5 rounded-[8px]">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Tỷ lệ Pixel (DPR)</span>
                            <span id="di-dpr" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Độ sâu màu</span>
                            <span id="di-color-depth" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Góc xoay</span>
                            <span id="di-orientation" class="font-mono font-bold text-zinc-900 dark:text-white text-right">--</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 2: PHẦN CỨNG & GPU -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-microchip text-accent-theme"></i> Phần cứng & GPU
                        </h3>
                    </div>

                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Nhân CPU (Cores)</span>
                            <span id="di-cpu" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">RAM ước tính</span>
                            <span id="di-ram" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Điểm cảm ứng</span>
                            <span id="di-touch" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex flex-col gap-1 pt-1">
                            <span class="text-zinc-500 font-medium text-xs">Card đồ họa (GPU)</span>
                            <span id="di-gpu" class="font-mono font-semibold text-zinc-800 dark:text-zinc-200 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-2 rounded-[12px] text-[11px] leading-relaxed break-words">Đang phân tích...</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 3: MẠNG & PIN -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-wifi text-accent-theme"></i> Mạng & Năng lượng
                        </h3>
                    </div>

                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Loại kết nối</span>
                            <span id="di-network" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Tốc độ (Downlink)</span>
                            <span id="di-downlink" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                            <span class="text-zinc-500 font-medium">Mức Pin</span>
                            <span id="di-battery-level" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Trạng thái Sạc</span>
                            <span id="di-battery-status" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 4: HỆ THỐNG -->
                <div class="md:col-span-2 lg:col-span-1 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-sliders text-accent-theme"></i> Môi trường Hệ thống
                        </h3>
                    </div>

                    <div class="space-y-3 flex-1">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Ngôn ngữ</span>
                            <span id="di-lang" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Múi giờ</span>
                            <span id="di-timezone" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Cookie</span>
                            <span id="di-cookie" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Do Not Track</span>
                            <span id="di-dnt" class="font-mono font-bold text-zinc-900 dark:text-white">--</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-zinc-500 font-medium">Nền tảng</span>
                            <span id="di-platform" class="font-mono font-bold text-zinc-900 dark:text-white text-right">--</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 5: USER AGENT -->
                <div class="md:col-span-2 lg:col-span-2 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-fingerprint text-accent-theme"></i> Định danh User Agent
                        </h3>
                        <span class="text-[9px] font-mono text-zinc-400">Raw Header</span>
                    </div>

                    <div id="di-ua-text" class="bg-[#f2f2f7] dark:bg-black/40 p-3.5 rounded-[16px] border border-black/[0.04] dark:border-white/[0.06] font-mono text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed break-words">
                        Đang lấy dữ liệu...
                    </div>
                </div>

            </div>

            <!-- ACTION: COPY TO CLIPBOARD -->
            <div class="pt-2">
                <button id="btn-di-copy" class="w-full h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                    <i class="far fa-copy text-sm"></i> Sao chép toàn bộ cấu hình
                </button>
            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#devinfo-root-container') || hostElement;

    // Khởi tạo và lắng nghe ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);

    const els = {
        osIcon: _('#di-os-icon'),
        osName: _('#di-os-name'),
        browserName: _('#di-browser-name'),
        onlineBadge: _('#di-online-badge'),
        
        screen: _('#di-screen'),
        viewport: _('#di-viewport'),
        dpr: _('#di-dpr'),
        colorDepth: _('#di-color-depth'),
        orientation: _('#di-orientation'),
        
        cpu: _('#di-cpu'),
        ram: _('#di-ram'),
        touch: _('#di-touch'),
        gpu: _('#di-gpu'),
        
        network: _('#di-network'),
        downlink: _('#di-downlink'),
        batteryLevel: _('#di-battery-level'),
        batteryStatus: _('#di-battery-status'),
        
        lang: _('#di-lang'),
        timezone: _('#di-timezone'),
        cookie: _('#di-cookie'),
        dnt: _('#di-dnt'),
        platform: _('#di-platform'),
        
        uaText: _('#di-ua-text'),
        btnCopy: _('#btn-di-copy')
    };

    let fullDataForCopy = "";

    // Phân tích User Agent
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

    // Lấy thông tin GPU WebGL
    const getGPUInfo = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) {
            console.warn("Không lấy được GPU info");
        }
        return "Không xác định / Bị ẩn";
    };

    const updateViewport = () => {
        if (!els.viewport || !els.orientation) return;
        els.viewport.textContent = `${window.innerWidth} x ${window.innerHeight} px`;
        let ori = "Không xác định";
        if (window.matchMedia("(orientation: portrait)").matches) ori = "Dọc (Portrait)";
        if (window.matchMedia("(orientation: landscape)").matches) ori = "Ngang (Landscape)";
        els.orientation.textContent = ori;
    };

    const updateOnlineStatus = () => {
        if (!els.onlineBadge) return;
        if (navigator.onLine) {
            els.onlineBadge.className = "px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2";
            els.onlineBadge.innerHTML = `<i class="fas fa-circle text-[7px] animate-pulse"></i> Trực tuyến`;
        } else {
            els.onlineBadge.className = "px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-2";
            els.onlineBadge.innerHTML = `<i class="fas fa-wifi-slash text-xs"></i> Mất mạng`;
        }
    };

    const buildCopyText = () => {
        fullDataForCopy = `--- THÔNG TIN THIẾT BỊ (HUNQOS) ---
Hệ điều hành: ${els.osName?.textContent || ''}
Trình duyệt: ${(els.browserName?.textContent || '').replace('Trình duyệt: ', '')}

[ MÀN HÌNH ]
Độ phân giải: ${els.screen?.textContent || ''}
Khung nhìn: ${els.viewport?.textContent || ''}
Tỷ lệ Pixel: ${els.dpr?.textContent || ''}
Độ sâu màu: ${els.colorDepth?.textContent || ''}
Góc xoay: ${els.orientation?.textContent || ''}

[ PHẦN CỨNG & GPU ]
CPU: ${els.cpu?.textContent || ''}
RAM: ${els.ram?.textContent || ''}
Cảm ứng: ${els.touch?.textContent || ''}
GPU: ${els.gpu?.textContent || ''}

[ MẠNG & PIN ]
Loại kết nối: ${els.network?.textContent || ''}
Tốc độ: ${els.downlink?.textContent || ''}
Mức Pin: ${els.batteryLevel?.textContent || ''}
Trạng thái sạc: ${els.batteryStatus?.textContent || ''}

[ HỆ THỐNG ]
Ngôn ngữ: ${els.lang?.textContent || ''}
Múi giờ: ${els.timezone?.textContent || ''}
Cookie: ${els.cookie?.textContent || ''}
Do Not Track: ${els.dnt?.textContent || ''}
Nền tảng: ${els.platform?.textContent || ''}

[ USER AGENT ]
${els.uaText?.textContent || ''}`;
    };

    // Khởi tạo render
    const renderDeviceInfo = () => {
        const parsedUA = parseUserAgent();
        
        // 1. Overview Hero
        els.osName.textContent = parsedUA.os;
        els.osIcon.innerHTML = parsedUA.icon;
        els.browserName.textContent = `Trình duyệt: ${parsedUA.browser}`;
        els.uaText.textContent = parsedUA.ua;

        // 2. Màn hình
        els.screen.textContent = `${window.screen.width} x ${window.screen.height} px`;
        els.dpr.textContent = window.devicePixelRatio || 1;
        els.colorDepth.textContent = `${window.screen.colorDepth}-bit`;
        updateViewport();

        // 3. Phần cứng
        els.cpu.textContent = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Không hỗ trợ';
        els.ram.textContent = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : 'Không hỗ trợ API';
        els.touch.textContent = navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} điểm` : 'Không';
        els.gpu.textContent = getGPUInfo();
        
        // 4. Mạng & Năng lượng
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        els.network.textContent = conn?.effectiveType ? conn.effectiveType.toUpperCase() : 'Không xác định';
        els.downlink.textContent = conn?.downlink ? `${conn.downlink} Mbps` : 'Không xác định';
        updateOnlineStatus();

        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBattery = () => {
                    els.batteryLevel.textContent = `${Math.round(battery.level * 100)}%`;
                    els.batteryStatus.innerHTML = battery.charging 
                        ? `<span class="text-emerald-500"><i class="fas fa-bolt mr-1"></i> Đang sạc</span>` 
                        : 'Rút sạc';
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

        // 5. Môi trường Hệ thống
        els.lang.textContent = navigator.language || navigator.userLanguage || "Không xác định";
        try { 
            els.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; 
        } catch (e) { 
            els.timezone.textContent = "Không xác định"; 
        }
        els.cookie.textContent = navigator.cookieEnabled ? "Đang bật" : "Đã tắt";
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        els.dnt.textContent = (dnt === "1" || dnt === "yes") ? "Bật (Yes)" : "Tắt (No)";
        els.platform.textContent = navigator.platform || "Không xác định";

        buildCopyText();
    };

    // Event listeners
    window.addEventListener('resize', () => { 
        updateViewport(); 
        buildCopyText(); 
    });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    els.btnCopy?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(fullDataForCopy);
            IslandKit.notify('Đã sao chép', 'Toàn bộ thông tin phần cứng & hệ thống đã lưu vào clipboard.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi sao chép', 'Trình duyệt chặn quyền truy cập bộ nhớ tạm.', 'error');
        }
    });

    renderDeviceInfo();
}