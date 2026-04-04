(() => {
    const configEl = document.getElementById('privacy-shield-config');
    if (!configEl) return;
    
    let config;
    try { config = JSON.parse(configEl.dataset.config); } catch (e) { return; }

    // 1. Ghi đè User Agent & Platform
    if (config.enable_ua) {
        Object.defineProperty(navigator, 'userAgent', { get: () => config.val_ua });
        Object.defineProperty(navigator, 'platform', { get: () => config.val_platform });
        Object.defineProperty(navigator, 'appVersion', { get: () => config.val_ua.replace(/^Mozilla\//, '') });
    }

    // 2. GHI ĐÈ TIMEZONE CHUYÊN SÂU
    if (config.enable_tz && config.tz_choice !== 'local') {
        const targetTimezoneOffset = parseInt(config.val_tz) || 0;
        const targetTimezoneName = config.tz_name || 'UTC';

        // A. Ghi đè hàm lấy phút bù trừ
        Date.prototype.getTimezoneOffset = function() {
            return targetTimezoneOffset;
        };
        Date.prototype.getTimezoneOffset.toString = function() {
            return "function getTimezoneOffset() { [native code] }";
        };

        // B. Ghi đè API Quốc tế hóa (Intl) - Đây là lý do bản trước không hoạt động ở một số web
        const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
        
        Intl.DateTimeFormat.prototype.resolvedOptions = function() {
            // Gọi hàm gốc để lấy các thuộc tính chuẩn
            const options = originalResolvedOptions.call(this);
            // Ghi đè tên Timezone (VD: Đổi 'Asia/Bangkok' thành 'Asia/Tokyo')
            options.timeZone = targetTimezoneName;
            return options;
        };
        
        Intl.DateTimeFormat.prototype.resolvedOptions.toString = function() {
            return "function resolvedOptions() { [native code] }";
        };
    }
})();