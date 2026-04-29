import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .di-widget { max-width: 900px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Bento Grid Layout */
            .di-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
            @media (min-width: 768px) { .di-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 992px) { .di-grid { grid-template-columns: repeat(3, 1fr); } }

            /* Card Style */
            .di-card { 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: 16px; padding: 20px; display: flex; flex-direction: column; 
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .di-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.05); border-color: var(--text-mut); }
            
            /* Hero Card (Chiếm 2 cột trên Desktop) */
            .di-card-hero { grid-column: 1 / -1; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-color: rgba(59, 130, 246, 0.2); flex-direction: row; align-items: center; gap: 24px; flex-wrap: wrap; }
            @media (min-width: 768px) { .di-card-hero { grid-column: span 2; } }
            @media (min-width: 992px) { .di-card-hero { grid-column: span 3; } }
            
            .di-hero-icon { font-size: 4rem; color: #3b82f6; }
            .di-hero-info h2 { margin: 0 0 8px 0; font-size: 1.8rem; color: var(--text-main); line-height: 1.2; }
            .di-hero-info p { margin: 0; color: var(--text-mut); font-size: 1rem; }

            /* Tiêu đề nhóm trong Card */
            .di-card-title { font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed var(--border); padding-bottom: 12px; }
            .di-card-title i { color: #3b82f6; }

            /* Các dòng thông tin (Key - Value) */
            .di-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem; }
            .di-item:last-child { margin-bottom: 0; }
            .di-label { color: var(--text-mut); font-weight: 500; }
            .di-value { color: var(--text-main); font-weight: 600; font-family: 'Courier New', monospace; text-align: right; word-break: break-all; }
            
            /* Highlight Value */
            .di-value.highlight { color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 6px; }

            /* Khung User Agent rộng */
            .di-card-full { grid-column: 1 / -1; }
            .di-ua-box { background: var(--bg-sec); padding: 16px; border-radius: 8px; border: 1px solid var(--border); font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--text-main); line-height: 1.5; word-wrap: break-word; }

            .btn-copy-huge { width: 100%; padding: 16px; font-size: 1.1rem; font-weight: 600; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; }
        </style>

        <div class="di-widget">
            
            <div class="flex-between" style="margin-bottom: 24px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Thông tin Thiết bị</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Khám phá cấu hình phần cứng và trình duyệt của bạn.</p>
                </div>
            </div>

            <div class="di-grid">
                
                <div class="di-card di-card-hero">
                    <div class="di-hero-icon" id="di-os-icon"><i class="fas fa-laptop"></i></div>
                    <div class="di-hero-info">
                        <h2 id="di-os-name">Đang tải...</h2>
                        <p id="di-browser-name">Trình duyệt: Đang phân tích...</p>
                    </div>
                </div>

                <div class="di-card">
                    <div class="di-card-title"><i class="fas fa-desktop"></i> Hiển thị & Màn hình</div>
                    <div class="di-item">
                        <span class="di-label">Độ phân giải (Screen)</span>
                        <span class="di-value" id="di-screen">-- x --</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Khung nhìn (Viewport)</span>
                        <span class="di-value highlight" id="di-viewport" title="Tự động cập nhật khi kéo thả trình duyệt">-- x --</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Tỷ lệ Pixel (DPR)</span>
                        <span class="di-value" id="di-dpr">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Độ sâu màu (Color Depth)</span>
                        <span class="di-value" id="di-color-depth">-- bit</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Góc xoay (Orientation)</span>
                        <span class="di-value" id="di-orientation">--</span>
                    </div>
                </div>

                <div class="di-card">
                    <div class="di-card-title"><i class="fas fa-microchip"></i> Phần cứng & Mạng</div>
                    <div class="di-item">
                        <span class="di-label">Luồng CPU (Cores)</span>
                        <span class="di-value" id="di-cpu">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">RAM (Ước tính)</span>
                        <span class="di-value" id="di-ram">-- GB</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Điểm chạm (Touch)</span>
                        <span class="di-value" id="di-touch">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Loại kết nối mạng</span>
                        <span class="di-value" id="di-network">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Trạng thái mạng</span>
                        <span class="di-value" id="di-online">--</span>
                    </div>
                </div>

                <div class="di-card">
                    <div class="di-card-title"><i class="fas fa-cog"></i> Môi trường & Hệ thống</div>
                    <div class="di-item">
                        <span class="di-label">Ngôn ngữ Trình duyệt</span>
                        <span class="di-value" id="di-lang">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Múi giờ (Timezone)</span>
                        <span class="di-value" id="di-timezone">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Cookie Enabled</span>
                        <span class="di-value" id="di-cookie">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Do Not Track</span>
                        <span class="di-value" id="di-dnt">--</span>
                    </div>
                    <div class="di-item">
                        <span class="di-label">Nền tảng (Platform)</span>
                        <span class="di-value" id="di-platform" style="font-size:0.8rem;">--</span>
                    </div>
                </div>

                <div class="di-card di-card-full">
                    <div class="di-card-title"><i class="fas fa-fingerprint"></i> User Agent (Định danh Trình duyệt)</div>
                    <div class="di-ua-box" id="di-ua-text">Đang lấy dữ liệu...</div>
                </div>

            </div>

            <button class="btn btn-outline btn-copy-huge" id="btn-di-copy">
                <i class="fas fa-copy"></i> Sao chép Toàn bộ Cấu hình (Copy to Clipboard)
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
        screen: document.getElementById('di-screen'),
        viewport: document.getElementById('di-viewport'),
        dpr: document.getElementById('di-dpr'),
        colorDepth: document.getElementById('di-color-depth'),
        orientation: document.getElementById('di-orientation'),
        cpu: document.getElementById('di-cpu'),
        ram: document.getElementById('di-ram'),
        touch: document.getElementById('di-touch'),
        network: document.getElementById('di-network'),
        online: document.getElementById('di-online'),
        lang: document.getElementById('di-lang'),
        timezone: document.getElementById('di-timezone'),
        cookie: document.getElementById('di-cookie'),
        dnt: document.getElementById('di-dnt'),
        platform: document.getElementById('di-platform'),
        uaText: document.getElementById('di-ua-text'),
        btnCopy: document.getElementById('btn-di-copy')
    };

    let fullDataForCopy = "";

    // --- Helper: Phân tích User Agent ---
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

        // Tính cả trường hợp iPad trên Safari 13+ (chặn user agent giả dạng Mac)
        if (os === 'macOS' && navigator.maxTouchPoints > 1) {
            os = "iOS (iPad)";
            icon = '<i class="fab fa-apple"></i>';
        }

        let browser = "Không xác định";
        if (/opr\//i.test(ua) || /opera/i.test(ua)) { browser = "Opera"; }
        else if (/edg/i.test(ua)) { browser = "Microsoft Edge"; }
        else if (/chrome|chromium|crios/i.test(ua)) { browser = "Google Chrome"; }
        else if (/firefox|fxios/i.test(ua)) { browser = "Mozilla Firefox"; }
        else if (/safari/i.test(ua)) { browser = "Apple Safari"; }

        return { os, icon, browser, ua };
    };

    // --- Khởi tạo và Lấy dữ liệu ---
    const renderDeviceInfo = () => {
        const parsedUA = parseUserAgent();
        
        // 1. Hero
        els.osName.textContent = parsedUA.os;
        els.osIcon.innerHTML = parsedUA.icon;
        els.browserName.textContent = `Trình duyệt: ${parsedUA.browser}`;
        els.uaText.textContent = parsedUA.ua;

        // 2. Màn hình & Hiển thị
        els.screen.textContent = `${window.screen.width} x ${window.screen.height} px`;
        els.dpr.textContent = window.devicePixelRatio || 1;
        els.colorDepth.textContent = `${window.screen.colorDepth}-bit`;
        
        // Cập nhật Viewport & Orientation ngay lập tức
        updateViewport();

        // 3. Phần cứng & Mạng
        els.cpu.textContent = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Không hỗ trợ';
        els.ram.textContent = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : 'Không hỗ trợ API';
        els.touch.textContent = navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} điểm` : 'Không có cảm ứng';
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        els.network.textContent = connection ? `${connection.effectiveType || 'unknown'} ${connection.downlink ? '(' + connection.downlink + ' Mbps)' : ''}` : 'Không xác định';
        
        updateOnlineStatus();

        // 4. Hệ thống phụ
        els.lang.textContent = navigator.language || navigator.userLanguage;
        try {
            els.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch(e) { els.timezone.textContent = "Không xác định"; }
        
        els.cookie.textContent = navigator.cookieEnabled ? "Đang bật (Yes)" : "Đã tắt (No)";
        // DNT (Do not track)
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        els.dnt.textContent = (dnt === "1" || dnt === "yes") ? "Đang bật (Yes)" : "Đã tắt (No)";
        
        els.platform.textContent = navigator.platform || "Không xác định";

        // Tạo chuỗi text chuẩn bị cho nút Copy
        buildCopyText();
    };

    const updateViewport = () => {
        els.viewport.textContent = `${window.innerWidth} x ${window.innerHeight} px`;
        
        let orientationStr = "Không xác định";
        if (window.matchMedia("(orientation: portrait)").matches) orientationStr = "Dọc (Portrait)";
        if (window.matchMedia("(orientation: landscape)").matches) orientationStr = "Ngang (Landscape)";
        els.orientation.textContent = orientationStr;
    };

    const updateOnlineStatus = () => {
        if (navigator.onLine) {
            els.online.innerHTML = `<span style="color:#10b981;"><i class="fas fa-circle"></i> Đang trực tuyến</span>`;
        } else {
            els.online.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-circle"></i> Ngoại tuyến (Offline)</span>`;
        }
    };

    const buildCopyText = () => {
        fullDataForCopy = `--- THÔNG TIN THIẾT BỊ ---
Hệ điều hành: ${els.osName.textContent}
Trình duyệt: ${els.browserName.textContent.replace('Trình duyệt: ', '')}

[ MÀN HÌNH ]
Độ phân giải: ${els.screen.textContent}
Khung nhìn (Viewport): ${els.viewport.textContent}
Tỷ lệ Pixel (DPR): ${els.dpr.textContent}
Độ sâu màu: ${els.colorDepth.textContent}

[ PHẦN CỨNG & MẠNG ]
CPU: ${els.cpu.textContent}
RAM (Ước tính): ${els.ram.textContent}
Cảm ứng: ${els.touch.textContent}
Mạng: ${els.network.textContent}

[ HỆ THỐNG ]
Ngôn ngữ: ${els.lang.textContent}
Múi giờ: ${els.timezone.textContent}
Nền tảng: ${els.platform.textContent}

[ USER AGENT ]
${els.uaText.textContent}`;
    };

    // --- Sự kiện Lắng nghe ---
    // Cập nhật Viewport khi người dùng thu phóng cửa sổ
    window.addEventListener('resize', () => {
        updateViewport();
        buildCopyText(); // Update lại chuỗi copy
    });

    // Cập nhật trạng thái mạng
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Nút Copy
    els.btnCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(fullDataForCopy);
            UI.showAlert('Đã chép', 'Toàn bộ thông tin cấu hình đã được sao chép.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
        }
    });

    // Chạy mặc định
    renderDeviceInfo();
}