// === 1. NGÔN NGỮ & ĐỔ DỮ LIỆU ĐỘNG (DATA-DRIVEN) ===
let currentTranslations = {}; // Lưu trữ ngôn ngữ đang dùng

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    applyLanguage(lang);
    
    const flags = {
        'vi': './Asset/icon/flag/Vietnam.png',
        'en': './Asset/icon/flag/US.png',
        'ja': './Asset/icon/flag/Japan.png',
        'de': './Asset/icon/flag/germany.png',
        'zh': './Asset/icon/flag/china.png'
    };
    
    const flagEl = document.getElementById('currentFlag');
    if (flagEl && flags[lang]) flagEl.src = flags[lang];
    document.getElementById('languageDropdown').classList.add('hidden');
}

async function applyLanguage(lang) {
    try {
        // Tải file JSON tương ứng với ngôn ngữ
        const response = await fetch(`./Asset/locales/${lang}.json`);
        
        // Nếu không tìm thấy file, fallback về tiếng việt
        if (!response.ok) throw new Error("Language not found");
        
        currentTranslations = await response.json();

        // 1.1. Thay thế text tĩnh trên UI (Dựa vào data-translate)
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (currentTranslations[key]) {
                el.innerHTML = currentTranslations[key];
            }
        });

        // 1.2. TỰ ĐỘNG RENDER KỸ NĂNG (Dữ liệu động)
        let skillHtml = '';
        let s = 1;
        while (currentTranslations[`Skill_${s}_Name`]) {
            skillHtml += `
            <div class="skill-row">
                <div class="skill-meta">
                    <span>${currentTranslations[`Skill_${s}_Name`]}</span> 
                    <span class="percent">${currentTranslations[`Skill_${s}_Percent`]}</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: ${currentTranslations[`Skill_${s}_Percent`]}"></div>
                </div>
            </div>`;
            s++;
        }
        const skillContainer = document.getElementById('dynamic-skills');
        if (skillContainer) skillContainer.innerHTML = skillHtml;

        // 1.3. TỰ ĐỘNG RENDER KINH NGHIỆM (Dữ liệu động)
        let expHtml = '';
        let e = 1;
        while (currentTranslations[`Exp_${e}_Name`]) {
            let timeBadge = currentTranslations[`Exp_${e}_Time`] ? `<span class="time-badge">${currentTranslations[`Exp_${e}_Time`]}</span>` : '';
            let descText = currentTranslations[`Exp_${e}_Desc`] ? `<p class="desc">${currentTranslations[`Exp_${e}_Desc`]}</p>` : '';
            
            expHtml += `
            <div class="timeline-item">
                ${timeBadge}
                <h4>${currentTranslations[`Exp_${e}_Name`]}</h4>
                <div class="role-title">${currentTranslations[`Exp_${e}_Role`]}</div>
                ${descText}
            </div>`;
            e++;
        }
        const expContainer = document.getElementById('dynamic-experience');
        if (expContainer) expContainer.innerHTML = expHtml;

    } catch (error) {
        console.error("Lỗi ngôn ngữ:", error);
        if(lang !== 'vi') applyLanguage('vi'); // Fallback
    }
}

function toggleDropdown() {
    document.getElementById('languageDropdown').classList.toggle('hidden');
}

// === 2. THEME LOGIC (3 CHẾ ĐỘ: SYSTEM -> LIGHT -> DARK) ===
const themeBtn = document.getElementById('themeToggle');
const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
const themeModes = ['system', 'light', 'dark'];
let currentThemeIndex = 0;

function isSystemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode) {
    document.body.classList.remove('dark-theme');
    let isDark = false;
    
    if (mode === 'system') {
        isDark = isSystemDark();
        if(themeIcon) themeIcon.className = 'fas fa-desktop';
        if(themeBtn) themeBtn.title = "Chế độ: Theo hệ thống";
    } else if (mode === 'light') {
        isDark = false;
        if(themeIcon) themeIcon.className = 'fas fa-sun';
        if(themeBtn) themeBtn.title = "Chế độ Sáng";
    } else if (mode === 'dark') {
        isDark = true;
        if(themeIcon) themeIcon.className = 'fas fa-moon';
        if(themeBtn) themeBtn.title = "Chế độ Tối";
    }
    
    if (isDark) {
        document.body.classList.add('dark-theme');
    }
    localStorage.setItem('themeMode', mode);
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themeModes.length;
        applyTheme(themeModes[currentThemeIndex]);
    });
}

// Lắng nghe sự thay đổi của hệ thống
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (themeModes[currentThemeIndex] === 'system') {
        if (e.matches) document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
    }
});

// === 3. GLASS MODE LOGIC ===
const glassBtn = document.getElementById('glassToggle');
const glassIcon = glassBtn ? glassBtn.querySelector('i') : null;

function toggleGlass() {
    document.body.classList.toggle('no-glass');
    const isNoGlass = document.body.classList.contains('no-glass');
    localStorage.setItem('glassMode', isNoGlass ? 'off' : 'on');
    
    if (glassIcon && glassBtn) {
        if (isNoGlass) {
            glassIcon.className = 'fa-solid fa-droplet-slash';
            glassBtn.title = "Bật hiệu ứng kính";
        } else {
            glassIcon.className = 'fa-solid fa-droplet';
            glassBtn.title = "Tắt hiệu ứng kính";
        }
    }
}

if (glassBtn) glassBtn.addEventListener('click', toggleGlass);

// === 4. MODAL & DOWNLOAD ===
function closeModal(e) {
    if (!e || e.target.id === 'modalOverlay' || e.target.closest('.btn-text')) {
        document.getElementById('modalOverlay').classList.add('hidden');
    }
}

function showModal(title, content) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function DownloadCV() {
    const link = document.createElement('a');
    link.href = './Asset/DINHMANHHUNG-CV.pdf';
    link.download = 'DINHMANHHUNG-CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showModal("Thông báo", "Đang tải xuống CV...");
}

// === 5. VIEW MODE LOGIC (A4) ===
const viewBtn = document.getElementById('viewModeBtn');
const viewIcon = viewBtn ? viewBtn.querySelector('i') : null;

// Cập nhật hàm xử lý nút chuyển chế độ A4
if (viewBtn) {
    viewBtn.addEventListener('click', () => {
        document.body.classList.toggle('a4-mode');
        const isA4 = document.body.classList.contains('a4-mode');
        
        if (isA4) {
            viewIcon.className = 'fas fa-th-large';
            // Tự động tắt Dark Theme để giấy luôn trắng khi xem PDF
            document.body.classList.remove('dark-theme'); 
        } else {
            viewIcon.className = 'fas fa-file-alt';
            // Khôi phục theme người dùng đã chọn trước đó
            const savedThemeMode = localStorage.getItem('themeMode') || 'system';
            applyTheme(savedThemeMode);
        }
    });
}

// Hàm In/Tải chuyên dụng
function printCV() {
    // Chỉ kích hoạt khi đang ở chế độ A4 để có bố cục đẹp nhất
    if (!document.body.classList.contains('a4-mode')) {
        document.body.classList.add('a4-mode');
    }
    window.print();
}

function DownloadCV() {
    showModal("Thông báo", "Đang xuất file PDF chuẩn A4, vui lòng đợi...");

    // Tự động bật chế độ A4 (a4-mode) để gom layout về đúng 794px[cite: 1]
    const wasA4 = document.body.classList.contains('a4-mode');
    if (!wasA4) {
        document.body.classList.add('a4-mode');
    }

    const element = document.getElementById('mainContainer'); // Lấy khung CV[cite: 1]

    // Cấu hình html2pdf map 1:1 với pixel trên web
    const opt = {
        margin:       0,
        filename:     'DINHMANHHUNG-CV.pdf',
        image:        { type: 'jpeg', quality: 1 }, // Render chất lượng cao nhất
        html2canvas:  { 
            scale: 2, // Render độ nét gấp đôi để text không bị mờ
            useCORS: true, 
            scrollY: 0,
            windowWidth: 794, // Ép trình duyệt hiểu màn hình rộng 794px khi chụp
            width: 794
        },
        jsPDF: { 
            unit: 'px', // Bắt buộc dùng pixel để đồng bộ với CSS
            format: [794, 1123], // Khung A4 hệ Pixel
            orientation: 'portrait',
            hotfixes: ['px_scaling']
        }
    };

    // Tiến hành chụp và xuất file
    html2pdf().set(opt).from(element).save().then(() => {
        // Trả lại giao diện cũ nếu người dùng không bật a4-mode từ trước[cite: 1]
        if (!wasA4) {
            document.body.classList.remove('a4-mode');
        }
        closeModal(); // Tắt popup[cite: 1]
    });
}
// === INIT (KHỞI TẠO KHI TẢI TRANG) ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Language
    const savedLang = localStorage.getItem('language') || 'vi';
    setLanguage(savedLang);

    // 2. Load Theme
    const savedThemeMode = localStorage.getItem('themeMode') || 'system';
    currentThemeIndex = themeModes.indexOf(savedThemeMode);
    if (currentThemeIndex === -1) currentThemeIndex = 0; 
    applyTheme(themeModes[currentThemeIndex]);

    // 3. Load Glass Mode
    const savedGlass = localStorage.getItem('glassMode');
    if (savedGlass === 'off') {
        toggleGlass(); 
    }
});