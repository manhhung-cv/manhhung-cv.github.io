chrome.storage.local.get(null, (config) => {
    
    // KIỂM TRA PHẠM VI HOẠT ĐỘNG
    if (config.apply_mode === 'specific') {
        const currentDomain = location.hostname;
        const siteList = config.site_list || [];
        // Nếu tên miền hiện tại không có trong danh sách -> Dừng chạy extension ở trang này
        if (!siteList.some(site => currentDomain.includes(site))) {
            return; 
        }
    }

    // 1. Chặn Popup Cookie bằng CSS (Nếu được bật)
    if (config.enable_cookie_popup) {
        const style = document.createElement('style');
        style.id = 'privacy-shield-cookie-hider';
        style.innerHTML = `
          [id*="cookie-banner"], [class*="cookie-banner"], 
          [id*="cmp-"], [class*="cmp-wrapper"], [class*="cmp-container"],
          [id*="cookie-consent"], [class*="cookie-consent"],
          [id*="gdpr"], [class*="gdpr"],
          #CybotCookiebotDialog, #usercentrics-root, 
          .cc-window, .cc-banner { 
              display: none !important; opacity: 0 !important; visibility: hidden !important; z-index: -9999 !important; pointer-events: none !important;
          }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // 2. Chèn script đè biến JS
    if (config.enable_ua || config.enable_tz) {
        const configElement = document.createElement('div');
        configElement.id = 'privacy-shield-config';
        configElement.style.display = 'none';
        configElement.dataset.config = JSON.stringify(config);
        document.documentElement.appendChild(configElement);

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        script.async = false; 
        document.documentElement.appendChild(script);
        
        script.onload = () => {
            script.remove();
            configElement.remove(); 
        };
    }
});