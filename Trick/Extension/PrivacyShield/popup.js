document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.getAttribute('data-tab')).classList.add('active');
    });
});


// ====== DỮ LIỆU USER AGENT ======
const uaPresets = {
    "Windows": {
        "Edge": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
        "Chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Safari": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    },
    "MacOS": {
        "Edge": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
        "Chrome": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Firefox": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Safari": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15"
    },
    "Android": {
        "Edge": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.0.0",
        "Chrome": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
        "Firefox": "Mozilla/5.0 (Android 14; Mobile; rv:123.0) Gecko/123.0 Firefox/123.0",
        "Safari": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    },
    "iOS": {
        "Edge": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/122.0.0.0 Mobile/15E148 Safari/605.1.15",
        "Chrome": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.0.0 Mobile/15E148 Safari/604.1",
        "Firefox": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15",
        "Safari": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1"
    },
    "Linux": {
        "Edge": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
        "Chrome": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Firefox": "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Safari": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
};
const platformMap = { "Windows": "Win32", "MacOS": "MacIntel", "Android": "Linux aarch64", "iOS": "iPhone", "Linux": "Linux x86_64" };

// MAPPING TÊN MÚI GIỜ IANA ĐỂ QUA MẶT INTL API
const tzNames = {
    "-420": "Asia/Ho_Chi_Minh",
    "-540": "Asia/Tokyo",
    "300": "America/New_York"
};

const els = {
    mode_all: document.getElementById('mode_all'), mode_specific: document.getElementById('mode_specific'), specific_options: document.getElementById('specific_options'), val_sites: document.getElementById('val_sites'),
    chk_ua: document.getElementById('chk_ua'), sel_os: document.getElementById('sel_os'), sel_browser: document.getElementById('sel_browser'), val_ua: document.getElementById('val_ua'), val_platform: document.getElementById('val_platform'),
    chk_tz: document.getElementById('chk_tz'), sel_tz: document.getElementById('sel_tz'), custom_tz_wrap: document.getElementById('custom_tz_wrap'), val_tz_h: document.getElementById('val_tz_h'), val_tz_m: document.getElementById('val_tz_m'),
    chk_cookie: document.getElementById('chk_cookie'), chk_cookie_popup: document.getElementById('chk_cookie_popup'), chk_dnt: document.getElementById('chk_dnt')
};

function getValidDomainsList(text) { return text.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => { try { return new URL(line.startsWith('http') ? line : `https://${line}`).hostname; } catch (e) { return null; } }).filter(domain => domain !== null); }
function toggleSpecificSitesDisplay() { els.specific_options.style.display = els.mode_specific.checked ? 'block' : 'none'; }

chrome.storage.local.get(null, (res) => {
    if (res.apply_mode === 'specific') { els.mode_specific.checked = true; } else { els.mode_all.checked = true; }
    toggleSpecificSitesDisplay();
    els.val_sites.value = (res.site_list || []).join('\n');
    els.chk_ua.checked = res.enable_ua || false; els.sel_os.value = res.os_choice || 'Windows'; els.sel_browser.value = res.browser_choice || 'Edge'; els.val_ua.value = res.val_ua || uaPresets['Windows']['Edge']; els.val_platform.value = res.val_platform || 'Win32';
    els.chk_tz.checked = res.enable_tz || false; els.sel_tz.value = res.tz_choice || 'local'; els.val_tz_h.value = res.tz_h !== undefined ? res.tz_h : 9; els.val_tz_m.value = res.tz_m !== undefined ? res.tz_m : 0; els.custom_tz_wrap.style.display = els.sel_tz.value === 'custom' ? 'block' : 'none';
    els.chk_cookie.checked = res.enable_cookie || false; els.chk_cookie_popup.checked = res.enable_cookie_popup || false; els.chk_dnt.checked = res.enable_dnt || false;
});

els.mode_all.addEventListener('change', () => { toggleSpecificSitesDisplay(); saveSettings(); });
els.mode_specific.addEventListener('change', () => { toggleSpecificSitesDisplay(); saveSettings(); });

function saveSettings() {
    let tzValue = parseInt(els.sel_tz.value);
    let tzName = "UTC"; // Mặc định nếu là custom
    
    if (els.sel_tz.value === 'custom') {
        tzValue = -((parseInt(els.val_tz_h.value) || 0) * 60 + (parseInt(els.val_tz_m.value) || 0));
    } else if (els.sel_tz.value !== 'local') {
        tzName = tzNames[els.sel_tz.value] || "UTC";
    }

    chrome.storage.local.set({
        apply_mode: els.mode_all.checked ? 'all' : 'specific', site_list: getValidDomainsList(els.val_sites.value),
        enable_ua: els.chk_ua.checked, os_choice: els.sel_os.value, browser_choice: els.sel_browser.value, val_ua: els.val_ua.value, val_platform: els.val_platform.value,
        enable_tz: els.chk_tz.checked, tz_choice: els.sel_tz.value, tz_h: els.val_tz_h.value, tz_m: els.val_tz_m.value, 
        val_tz: tzValue, tz_name: tzName, // Truyền tên múi giờ xuống inject.js
        enable_cookie: els.chk_cookie.checked, enable_cookie_popup: els.chk_cookie_popup.checked, enable_dnt: els.chk_dnt.checked
    });
}

document.querySelectorAll('input, select, textarea').forEach(el => {
    if (!['sel_os', 'sel_browser', 'sel_tz', 'file_import'].includes(el.id)) {
        el.addEventListener('change', saveSettings); el.addEventListener('input', saveSettings);
    }
});

els.sel_tz.addEventListener('change', () => { els.custom_tz_wrap.style.display = els.sel_tz.value === 'custom' ? 'block' : 'none'; saveSettings(); });
els.sel_os.addEventListener('change', () => { els.val_ua.value = uaPresets[els.sel_os.value][els.sel_browser.value]; els.val_platform.value = platformMap[els.sel_os.value]; saveSettings(); });
els.sel_browser.addEventListener('change', () => { els.val_ua.value = uaPresets[els.sel_os.value][els.sel_browser.value]; saveSettings(); });

// ====== TÍNH NĂNG XEM VÀ XÓA COOKIE ======
let currentTabUrl = '';

document.getElementById('btn_manage_cookies').addEventListener('click', () => {
    const area = document.getElementById('cookie_manager_area');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
    if (area.style.display === 'block') loadCookies();
});

function loadCookies() {
    const listDiv = document.getElementById('cookie_list');
    const statusP = document.getElementById('cookie_status');
    const btnClearAll = document.getElementById('btn_clear_all_cookies');
    
    listDiv.innerHTML = '';
    statusP.innerText = "Đang tải...";
    btnClearAll.style.display = 'none';

    // Lấy URL của tab đang mở hiện tại
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0] || !tabs[0].url.startsWith('http')) {
            statusP.innerText = "Trang này không hỗ trợ Cookie.";
            return;
        }
        currentTabUrl = tabs[0].url;
        const urlObj = new URL(currentTabUrl);
        
        // Lấy tất cả cookie thuộc domain hiện tại
        chrome.cookies.getAll({ domain: urlObj.hostname }, function(cookies) {
            if (cookies.length === 0) {
                statusP.innerText = "Không có cookie nào được lưu.";
                return;
            }
            statusP.innerText = `Tìm thấy ${cookies.length} cookie.`;
            btnClearAll.style.display = 'block';
            
            cookies.forEach(cookie => {
                const item = document.createElement('div');
                item.className = 'cookie-item';
                item.innerHTML = `
                    <span class="cookie-name" title="${cookie.value}"><strong>${cookie.name}</strong></span>
                    <button class="btn-del-cookie" data-name="${cookie.name}" data-domain="${cookie.domain}" data-path="${cookie.path}" data-secure="${cookie.secure}">Xóa</button>
                `;
                listDiv.appendChild(item);
            });

            // Gắn sự kiện cho các nút Xóa lẻ
            document.querySelectorAll('.btn-del-cookie').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const c = e.target.dataset;
                    const cUrl = "http" + (c.secure == "true" ? "s" : "") + "://" + c.domain + c.path;
                    chrome.cookies.remove({ url: cUrl, name: c.name }, () => {
                        e.target.parentElement.remove();
                        loadCookies(); // Tải lại danh sách
                    });
                });
            });
        });
    });
}

// Xóa tất cả cookie
document.getElementById('btn_clear_all_cookies').addEventListener('click', () => {
    if(confirm('Bạn có chắc muốn xóa toàn bộ cookie của trang web này? Việc này có thể làm bạn bị đăng xuất.')) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const urlObj = new URL(tabs[0].url);
            chrome.cookies.getAll({ domain: urlObj.hostname }, function(cookies) {
                cookies.forEach(cookie => {
                    const cUrl = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                    chrome.cookies.remove({ url: cUrl, name: cookie.name });
                });
                setTimeout(loadCookies, 500); // Đợi xóa xong rồi tải lại danh sách
            });
        });
    }
});

// ====== XUẤT/NHẬP JSON & RELOAD ======
// ... [Phần Import/Export và nút Reload giữ nguyên như bản trước] ...
document.getElementById('btn_reload').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(tabs[0]) {
            document.getElementById('btn_reload').innerText = "Đang tải...";
            chrome.tabs.reload(tabs[0].id, () => { setTimeout(() => document.getElementById('btn_reload').innerText = "Tải lại trang hiện tại", 500); });
        }
    });
});