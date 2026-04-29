import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .ip-widget { max-width: 900px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Bento Grid Layout */
            .ip-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
            @media (min-width: 768px) { .ip-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 992px) { .ip-grid { grid-template-columns: repeat(3, 1fr); } }

            /* Card Style */
            .ip-card { 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: 16px; padding: 20px; display: flex; flex-direction: column; 
                transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;
            }
            .ip-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.05); border-color: var(--text-mut); }
            
            /* Hero Card (Hiển thị IP chính) */
            .ip-card-hero { 
                grid-column: 1 / -1; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); 
                border-color: rgba(16, 185, 129, 0.2); flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;
            }
            
            .ip-hero-left { display: flex; align-items: center; gap: 20px; }
            .ip-hero-icon { font-size: 3.5rem; color: #10b981; }
            .ip-hero-info h2 { margin: 0 0 4px 0; font-size: 2.2rem; color: var(--text-main); line-height: 1.2; font-family: 'Courier New', monospace; font-weight: 800; letter-spacing: 1px; }
            .ip-hero-info p { margin: 0; color: var(--text-mut); font-size: 1rem; font-weight: 500; }

            .btn-ip-copy { 
                background: var(--bg-main); border: 2px solid #10b981; color: #10b981; 
                padding: 10px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; 
                transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-size: 1rem;
            }
            .btn-ip-copy:hover { background: #10b981; color: white; }

            /* Tiêu đề nhóm trong Card */
            .ip-card-title { font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed var(--border); padding-bottom: 12px; }
            .ip-card-title i { color: #3b82f6; }

            /* Các dòng thông tin (Key - Value) */
            .ip-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem; }
            .ip-item:last-child { margin-bottom: 0; }
            .ip-label { color: var(--text-mut); font-weight: 500; }
            
            /* Class cho Click-to-copy */
            .clickable-value { 
                color: var(--text-main); font-weight: 600; font-family: 'Courier New', monospace; 
                text-align: right; word-break: break-word; 
                cursor: pointer; padding: 4px 8px; margin-right: -8px; border-radius: 6px;
                transition: all 0.2s; position: relative;
            }
            .clickable-value:hover { 
                background: rgba(59, 130, 246, 0.1); color: #3b82f6; 
            }
            .clickable-value:active {
                transform: scale(0.95);
            }
            
            /* Cờ quốc gia */
            .ip-flag { font-size: 1.2rem; margin-right: 6px; vertical-align: middle; }

            /* Bản đồ OSM Card */
            .ip-card-map { grid-column: 1 / -1; padding: 0; min-height: 350px; }
            .ip-map-header { padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--text-main); display: flex; justify-content: space-between; align-items: center; }
            .ip-iframe { width: 100%; height: 100%; min-height: 350px; border: none; background: #e5e5e5; display: block; }
            
            /* Loader Overlay */
            .ip-loader-overlay { position: absolute; inset: 0; background: var(--bg-main); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; transition: opacity 0.3s; }
            .ip-loader-overlay.hidden { opacity: 0; pointer-events: none; }
            .ip-spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }

        </style>

        <div class="ip-widget">
            
            <div class="flex-between" style="margin-bottom: 24px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Địa chỉ IP của tôi</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Kiểm tra IP công khai, nhà mạng và vị trí địa lý.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost btn-sm" id="btn-ip-download" title="Tải xuống toàn bộ thông tin (.txt)">
                        <i class="fas fa-download"></i> Tải về
                    </button>
                    <button class="btn btn-ghost btn-sm" id="btn-ip-refresh" title="Làm mới dữ liệu">
                        <i class="fas fa-sync-alt"></i> Làm mới
                    </button>
                </div>
            </div>

            <div class="ip-grid" id="ip-grid-container">
                
                <div class="ip-loader-overlay" id="ip-loader">
                    <div class="ip-spinner"></div>
                    <div style="color: var(--text-mut); font-weight: 500;">Đang quét địa chỉ mạng...</div>
                </div>

                <div class="ip-card ip-card-hero">
                    <div class="ip-hero-left">
                        <div class="ip-hero-icon"><i class="fas fa-network-wired"></i></div>
                        <div class="ip-hero-info">
                            <p>IP Công khai (Public IP)</p>
                            <h2 id="ip-main" class="clickable-value" title="Nhấn để sao chép" style="padding:0; margin:0 0 4px 0;">--.---.---.--</h2>
                            <p id="ip-type" style="font-family: monospace; color: #3b82f6;">Phiên bản: ---</p>
                        </div>
                    </div>
                    <button class="btn-ip-copy" id="btn-ip-copy">
                        <i class="fas fa-copy"></i> Sao chép IP
                    </button>
                </div>

                <div class="ip-card">
                    <div class="ip-card-title"><i class="fas fa-map-marker-alt"></i> Vị trí Địa lý</div>
                    <div class="ip-item">
                        <span class="ip-label">Quốc gia</span>
                        <span class="clickable-value" id="ip-country" title="Nhấn để sao chép"><span class="ip-flag" id="ip-flag"></span><span id="ip-country-text">---</span></span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Tỉnh / Vùng</span>
                        <span class="clickable-value" id="ip-region" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Thành phố</span>
                        <span class="clickable-value" id="ip-city" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Mã bưu chính</span>
                        <span class="clickable-value" id="ip-postal" title="Nhấn để sao chép">---</span>
                    </div>
                </div>

                <div class="ip-card">
                    <div class="ip-card-title"><i class="fas fa-server"></i> Mạng & Cung cấp dịch vụ</div>
                    <div class="ip-item">
                        <span class="ip-label">Nhà cung cấp (ISP)</span>
                        <span class="clickable-value" id="ip-isp" title="Nhấn để sao chép" style="color: #f59e0b;">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Tổ chức (Org)</span>
                        <span class="clickable-value" id="ip-org" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Số ASN</span>
                        <span class="clickable-value" id="ip-asn" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Tọa độ (Lat/Lon)</span>
                        <span class="clickable-value" id="ip-coord" title="Nhấn để sao chép">--- / ---</span>
                    </div>
                </div>

                <div class="ip-card">
                    <div class="ip-card-title"><i class="fas fa-globe"></i> Thông tin Phụ</div>
                    <div class="ip-item">
                        <span class="ip-label">Múi giờ</span>
                        <span class="clickable-value" id="ip-timezone" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Giờ địa phương</span>
                        <span class="clickable-value" id="ip-localtime" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Mã gọi quốc tế</span>
                        <span class="clickable-value" id="ip-calling" title="Nhấn để sao chép">---</span>
                    </div>
                    <div class="ip-item">
                        <span class="ip-label">Châu lục</span>
                        <span class="clickable-value" id="ip-continent" title="Nhấn để sao chép">---</span>
                    </div>
                </div>

                <div class="ip-card ip-card-map shadow-sm">
                    <div class="ip-map-header">
                        <span><i class="fas fa-map" style="color: #3b82f6; margin-right: 8px;"></i> Bản đồ vị trí (OpenStreetMap)</span>
                        <span style="font-size: 0.8rem; color: var(--text-mut); font-weight: normal;">*Vị trí ước tính theo dải IP</span>
                    </div>
                    <iframe class="ip-iframe" id="ip-map-frame" src="about:blank" title="Bản đồ IP"></iframe>
                </div>

            </div>

        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const els = {
        loader: document.getElementById('ip-loader'),
        main: document.getElementById('ip-main'),
        type: document.getElementById('ip-type'),
        btnCopy: document.getElementById('btn-ip-copy'),
        btnRefresh: document.getElementById('btn-ip-refresh'),
        btnDownload: document.getElementById('btn-ip-download'),
        
        countryText: document.getElementById('ip-country-text'),
        flag: document.getElementById('ip-flag'),
        region: document.getElementById('ip-region'),
        city: document.getElementById('ip-city'),
        postal: document.getElementById('ip-postal'),
        
        isp: document.getElementById('ip-isp'),
        org: document.getElementById('ip-org'),
        asn: document.getElementById('ip-asn'),
        coord: document.getElementById('ip-coord'),
        
        timezone: document.getElementById('ip-timezone'),
        localtime: document.getElementById('ip-localtime'),
        calling: document.getElementById('ip-calling'),
        continent: document.getElementById('ip-continent'),
        
        mapFrame: document.getElementById('ip-map-frame')
    };

    let currentIP = '';
    let fullDataForCopy = '';

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '';
        const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    // Hàm tạo chuỗi lưu file
    const buildDownloadText = (data, isFallback = false) => {
        if (!isFallback) {
            fullDataForCopy = `--- THÔNG TIN IP ---
IP: ${data.ip}
Phiên bản: ${data.version || 'IPv4'}

[ VỊ TRÍ ĐỊA LÝ ]
Quốc gia: ${data.country_name || 'Không xác định'}
Tỉnh/Vùng: ${data.region || 'Không xác định'}
Thành phố: ${data.city || 'Không xác định'}
Mã bưu chính: ${data.postal || 'N/A'}

[ MẠNG & NHÀ CUNG CẤP ]
ISP: ${data.org || 'Không xác định'}
Tổ chức: ${data.org || 'Không xác định'}
Số ASN: ${data.asn || 'N/A'}
Tọa độ: ${data.latitude} / ${data.longitude}

[ THÔNG TIN PHỤ ]
Múi giờ: ${data.timezone || 'N/A'}
Mã gọi quốc tế: +${data.country_calling_code || 'N/A'}
Châu lục: ${data.continent_code || 'N/A'}
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
`;
        } else {
            fullDataForCopy = `--- THÔNG TIN IP ---
IP: ${data.ipAddress}
Phiên bản: IPv${data.ipVersion}

[ VỊ TRÍ ĐỊA LÝ ]
Quốc gia: ${data.countryName || 'Không xác định'}
Tỉnh/Vùng: ${data.regionName || 'Không xác định'}
Thành phố: ${data.cityName || 'Không xác định'}
Mã bưu chính: ${data.zipCode || 'N/A'}

[ MẠNG & NHÀ CUNG CẤP ]
ISP: Dữ liệu bị giới hạn
Tổ chức: N/A
Số ASN: N/A
Tọa độ: ${data.latitude} / ${data.longitude}

[ THÔNG TIN PHỤ ]
Múi giờ: ${data.timeZone || 'N/A'}
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
`;
        }
    };

    // --- Hàm lấy dữ liệu (Hệ thống API Kép) ---
    const fetchIPData = async () => {
        els.loader.classList.remove('hidden');
        
        try {
            // API CHÍNH
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('API chính phản hồi lỗi ' + response.status);
            
            const data = await response.json();
            if (data.error) throw new Error(data.reason || 'Lỗi API');

            currentIP = data.ip;
            els.main.textContent = data.ip;
            els.type.textContent = `Phiên bản: ${data.version || 'IPv4'}`;
            
            els.flag.textContent = getFlagEmoji(data.country_code);
            els.countryText.textContent = data.country_name || 'Không xác định';
            
            els.region.textContent = data.region || 'Không xác định';
            els.city.textContent = data.city || 'Không xác định';
            els.postal.textContent = data.postal || 'N/A';
            
            els.isp.textContent = data.org || 'Không xác định';
            els.org.textContent = data.org || 'Không xác định';
            els.asn.textContent = data.asn || 'N/A';
            
            const lat = data.latitude;
            const lon = data.longitude;
            els.coord.textContent = (lat && lon) ? `${lat} / ${lon}` : 'N/A';

            els.timezone.textContent = data.timezone || 'N/A';
            try { els.localtime.textContent = new Date().toLocaleString('vi-VN', { timeZone: data.timezone }); } 
            catch(e) { els.localtime.textContent = 'N/A'; }
            
            els.calling.textContent = data.country_calling_code ? `+${data.country_calling_code}` : 'N/A';
            els.continent.textContent = data.continent_code || 'N/A';

            buildDownloadText(data, false);

            if (lat && lon) {
                const offset = 0.05; 
                els.mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-offset},${lat-offset},${lon+offset},${lat+offset}&layer=mapnik&marker=${lat},${lon}`;
            }

        } catch (error) {
            console.warn('API Chính lỗi, chuyển sang API Dự phòng:', error);
            
            // API DỰ PHÒNG
            try {
                const fallbackRes = await fetch('https://freeipapi.com/api/json');
                if (!fallbackRes.ok) throw new Error('API dự phòng cũng lỗi');
                const fbData = await fallbackRes.json();
                
                currentIP = fbData.ipAddress;
                els.main.textContent = fbData.ipAddress;
                els.type.textContent = `Phiên bản: IPv${fbData.ipVersion}`;
                
                els.flag.textContent = ''; 
                els.countryText.textContent = fbData.countryName || 'Không xác định';
                els.region.textContent = fbData.regionName || 'Không xác định';
                els.city.textContent = fbData.cityName || 'Không xác định';
                els.postal.textContent = fbData.zipCode || 'N/A';
                
                els.timezone.textContent = fbData.timeZone || 'N/A';
                els.isp.textContent = 'Dữ liệu ISP bị giới hạn';
                els.org.textContent = 'N/A';
                els.asn.textContent = 'N/A';
                
                buildDownloadText(fbData, true);

                if (fbData.latitude && fbData.longitude) {
                    els.coord.textContent = `${fbData.latitude} / ${fbData.longitude}`;
                    const offset = 0.05; 
                    els.mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${fbData.longitude-offset},${fbData.latitude-offset},${fbData.longitude+offset},${fbData.latitude+offset}&layer=mapnik&marker=${fbData.latitude},${fbData.longitude}`;
                }

            } catch (fallbackError) {
                console.error('Cả 2 API đều thất bại:', fallbackError);
                UI.showAlert('Lỗi', 'Không thể kết nối máy chủ để lấy thông tin IP. Vui lòng tắt trình chặn quảng cáo (Adblock) hoặc VPN và thử lại.', 'error');
                els.main.textContent = 'Lỗi kết nối';
            }
        } finally {
            setTimeout(() => { els.loader.classList.add('hidden'); }, 300);
        }
    };

    // --- SỰ KIỆN NÚT SAO CHÉP CHÍNH ---
    els.btnCopy.addEventListener('click', async () => {
        if (!currentIP || currentIP === 'Lỗi kết nối') return;
        try {
            await navigator.clipboard.writeText(currentIP);
            UI.showAlert('Đã chép', `IP: ${currentIP} đã lưu vào bộ nhớ đệm.`, 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
        }
    });

    // --- SỰ KIỆN CLICK-TO-COPY TRỰC TIẾP LÊN DỮ LIỆU ---
    document.querySelectorAll('.clickable-value').forEach(el => {
        el.addEventListener('click', async () => {
            // Lọc ra text chính xác cần copy (Nếu click vào dòng Quốc gia thì bỏ qua cái emoji cờ)
            let textToCopy = el.id === 'ip-country' 
                ? document.getElementById('ip-country-text').innerText.trim() 
                : el.innerText.trim();

            if (textToCopy && textToCopy !== '---' && textToCopy !== 'N/A' && !textToCopy.includes('Không xác định')) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    UI.showAlert('Đã chép', `Đã sao chép: ${textToCopy}`, 'success');
                    
                    // Hiệu ứng nháy xanh lá báo thành công
                    const originalColor = el.style.color;
                    const originalBg = el.style.background;
                    el.style.color = '#10b981';
                    el.style.background = 'rgba(16, 185, 129, 0.1)';
                    setTimeout(() => {
                        el.style.color = originalColor;
                        el.style.background = originalBg;
                    }, 500);

                } catch (e) {
                    UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
                }
            } else {
                UI.showAlert('Thông báo', 'Không có dữ liệu hợp lệ để chép.', 'warning');
            }
        });
    });

    // --- SỰ KIỆN TẢI XUỐNG ---
    els.btnDownload.addEventListener('click', () => {
        if (!currentIP || currentIP === 'Lỗi kết nối') {
            return UI.showAlert('Thông báo', 'Không có dữ liệu hợp lệ để tải.', 'warning');
        }
        
        const blob = new Blob([fullDataForCopy], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const safeFileName = currentIP.replace(/:/g, '-');
        a.download = `IP_Info_${safeFileName}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- SỰ KIỆN REFRESH ---
    els.btnRefresh.addEventListener('click', () => {
        const icon = els.btnRefresh.querySelector('i');
        icon.classList.add('fa-spin');
        fetchIPData().then(() => {
            setTimeout(() => icon.classList.remove('fa-spin'), 500);
        });
    });

    // Chạy mặc định khi vào tool
    fetchIPData();
}