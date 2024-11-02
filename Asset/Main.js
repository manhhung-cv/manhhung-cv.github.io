// Đối tượng chứa các bản dịch
const translations = {
    vi: {
        welcomeText: "Xin chào",
        Fullname: "Đinh Mạnh Hùng",
        Position: "Kỹ thuật Cơ Điện Tử",
        Quote: "Mong muốn phát triển kỹ năng và kiến thức trong kỹ thuật cơ điện tử, học hỏi công nghệ mới và đóng góp vào dự án thực tế để trở thành chuyên gia trong tương lai.",
        BtnHireMe: "Tuyển dụng",
        BtnDownloadCV: "Tải CV",

        QualificationsText: "Bằng cấp",
        SkillsText:"Kĩ năng",
        ProjectText:"Dự án",
        StoreText:"Cừa hàng",

        HideInfo:"Hiện tại đang ẩn",

        DevText: "Lập trình",
    },
    en: {
        welcomeText: "Hello",
        Fullname: "Dinh Manh Hung",
        Position: "Mechatronics Engineering",
        Quote: "Desiring to develop skills and knowledge in mechatronics engineering, learn new technologies, and contribute to real-world projects to become an expert in the future.",
        BtnHireMe: "Hire Me",
        BtnDownloadCV: "Download CV",

        QualificationsText: "Qualifications",
        SkillsText:"Skills",
        ProjectText:"Project",
        StoreText:"Store",

        HideInfo:"Currently hidden",
        DevText: "Developer",
    },
    ja: {
        welcomeText: "こんにちは",
        Fullname: "ディン マン フン",
        Position: "メカトロニクス工学",
        Quote: "メカトロニクスのスキルと知識を伸ばしたいです。そして、新しい技術を学び、実際のプロジェクトに参加して、将来専門家になりたいです.",
        BtnHireMe: "私を雇ってください",
        BtnDownloadCV: "履歴書をダウンロード",

        QualificationsText: "資格",
        SkillsText:"スキル",
        ProjectText:"プロジェクト",
        StoreText:"ショップ",

        HideInfo:"現在隠れています",
        DevText: "開発者 ",
    }
};




// Hàm bật/tắt hiển thị menu ngôn ngữ
function toggleDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
}

// Hàm lưu ngôn ngữ và cập nhật cờ
function setLanguage(language, flagSrc) {
    localStorage.setItem('language', language);
    applyLanguage(language);

    // Cập nhật ảnh lá cờ trong Language Active
    document.getElementById('currentFlag').src = flagSrc;

    // Ẩn menu sau khi chọn ngôn ngữ
    document.getElementById('languageDropdown').classList.remove('show');
}

// Hàm khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        applyLanguage(savedLanguage);
        updateFlag(savedLanguage);
    } else {
        applyLanguage('vi');
    }
});

// Hàm áp dụng ngôn ngữ
function applyLanguage(language) {
    console.log(`Áp dụng ngôn ngữ: ${language}`);

    // Lấy tất cả phần tử có thuộc tính data-translate và cập nhật nội dung
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = translations[language][key] || el.textContent;
    });
}

// Hàm cập nhật cờ dựa trên ngôn ngữ đã lưu
function updateFlag(language) {
    const flagMap = {
        'vi': './Asset/icon/flag/VietNam.png',
        'en': './Asset/icon/flag/US.png',
        'ja': './Asset/icon/flag/Japan.png'
    };
    document.getElementById('currentFlag').src = flagMap[language];
}



//Theme Darkmode - LightMode
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Load the theme from localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(currentTheme + '-theme');
themeIcon.src = currentTheme === 'light' ? './Asset/icon/theme/sun.png' : './Asset/icon/theme/moon.png';

// Toggle theme function
themeToggle.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    themeIcon.src = newTheme === 'light' ? './Asset/icon/theme/sun.png' : './Asset/icon/theme/moon.png';

    // Save the new theme to localStorage
    localStorage.setItem('theme', newTheme);
});
