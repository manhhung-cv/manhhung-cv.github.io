chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        chrome.storage.local.get(null, (config) => {
            updateNetworkRules(config);
            updateCookieSettings(config);
        });
    }
});

function updateCookieSettings(config) {
    // Luôn dọn dẹp các setting cũ trước khi áp dụng mới
    chrome.contentSettings.cookies.clear({}, () => {
        if (config.enable_cookie) {
            
            // Dùng session_only để web không bị lỗi (tự xóa khi tắt trình duyệt)
            const settingAction = 'session_only'; 

            if (config.apply_mode === 'all') {
                chrome.contentSettings.cookies.set({ 
                    primaryPattern: '<all_urls>', 
                    setting: settingAction 
                });
            } else if (config.site_list && config.site_list.length > 0) {
                // Áp dụng từng domain một
                config.site_list.forEach(domain => {
                    chrome.contentSettings.cookies.set({ 
                        primaryPattern: `*://${domain}/*`, 
                        setting: settingAction 
                    });
                });
            }
        }
    });
}

function updateNetworkRules(config) {
    const rules = [];
    let idCounter = 1;

    // Thiết lập điều kiện dựa trên Mode
    const ruleCondition = { resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"] };
    
    // Nếu chọn Specific nhưng danh sách rỗng -> Không chặn gì cả
    if (config.apply_mode === 'specific') {
        if (!config.site_list || config.site_list.length === 0) {
            clearAllRules();
            return;
        }
        ruleCondition.requestDomains = config.site_list;
    } else {
        ruleCondition.urlFilter = "*";
    }

    if (config.enable_ua) {
        rules.push(createHeaderRule(idCounter++, 'User-Agent', config.val_ua, ruleCondition));
        rules.push(createHeaderRule(idCounter++, 'sec-ch-ua-platform', `"${config.val_platform}"`, ruleCondition)); 
    }
    if (config.enable_dnt) {
        rules.push(createHeaderRule(idCounter++, 'DNT', '1', ruleCondition));
    }

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        addRules: rules
    });
}

function createHeaderRule(id, header, value, condition) {
    return {
        id: id,
        priority: 1,
        action: { type: "modifyHeaders", requestHeaders: [{ header: header, operation: "set", value: value }] },
        condition: condition
    };
}

function clearAllRules() {
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
}