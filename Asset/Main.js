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
        SkillsText: "Kĩ năng",
        ProjectText: "Dự án",
        StoreText: "Cửa hàng",

        HideInfo: "Hiện tại đang ẩn",

        DevText: "Lập trình",

        SkillNote: "*Các đánh giá này được dựa trên đánh giá từ những người có kinh nghiệm chuyên ngành.",
        Skill1: "Cơ điện tử",
        Skill2: "Lập trình PLC",
        Skill3: "Tin học văn phòng",
        Skill4: "Lập trình Web [Front-End]",
        Skill5: "Auto CAD",
        Skill6: "Lập trình Arduino, Vi xử lý",

        ExpText: "Kinh nghiệm",
        Exp1: "Tốt nghiệp trung học phổ thông",
        Exp2: "Tốt nghiệp Cao đẳng Cơ Điện Tử tiêu chuẩn Đức",
        Exp3: "CTY TNHH KỸ THUẬT ELECOM VIỆT NAM",
        Exp3a: "Thực tập sinh",
        Exp3b: "Học hỏi về quy trình và công nghệ cơ điện tử",
        Exp4: "Kỹ thuật",
        Exp4a: "Kiểm tra & sửa chữa Motor điện",
        TimeExp5: "Nay",
        Exp5: "CTY CP THIẾT KẾ VÀ QUẢN LÝ KỸ THUẬT IMPC",
        Exp5a: "Kỹ thuật & Giám sát",
        Exp5b: `Xử lý sự cố hệ thống điện: Khắc phục các lỗi như mất điện, lỗi thiết bị.
        <br>Giám sát hệ thống phòng cháy chữa cháy: Kiểm tra thiết bị, kiểm soát các nguồn cháy nổ, đào tạo về phòng cháy chữa cháy. 
        <br>Giám sát an toàn lao động: Nhắc nhở, phổ biến, huấn luyện an toàn cho nhà thầu thi công.
        <br>Giám sát an ninh trật tự trong quản lý dự án`,

        LanguagesText: "Ngoại ngữ",
        LanEN:"Tiếng Anh B2",
        LanJA:"Tiếng Nhật N4",

    },
    en: {
        welcomeText: "Hello",
        Fullname: "Dinh Manh Hung",
        Position: "Mechatronics Engineering",
        Quote: "*Desiring to develop skills and knowledge in mechatronics engineering, learn new technologies, and contribute to real-world projects to become an expert in the future.",
        BtnHireMe: "Hire Me",
        BtnDownloadCV: "Download CV",

        QualificationsText: "Qualifications",
        SkillsText: "Skills",
        ProjectText: "Project",
        StoreText: "Store",

        HideInfo: "Currently hidden",
        DevText: "Developer",

        SkillNote: "*These evaluations are based on assessments from experienced professionals in the field.",
        Skill1: "Mechatronics",
        Skill2: "PLC Programming",
        Skill3: "Office Computing",
        Skill4: "Web Programming [Front-End]",
        Skill5: "Auto CAD",
        Skill6: "Arduino Programming, Microcontroller",

        ExpText: "Experience",
        Exp1: "High School Graduate",
        Exp2: "Graduated from German-standard Mechatronics College",
        Exp3: "ELECOM VIETNAM TECHNICAL CO., LTD",
        Exp3a: "Intern",
        Exp3b: "Learning about mechatronics processes and technology",
        Exp4: "Technical",
        Exp4a: "Inspect & repair electric motors",
        TimeExp5: "Present",
        Exp5: "IMPC ENGINEERING DESIGN AND MANAGEMENT JSC",
        Exp5a: "Technical & Supervision",
        Exp5b: `Handling electrical system issues: Troubleshooting issues like power outages, equipment failures.
        <br>Supervising fire protection systems: Inspecting equipment, monitoring fire/explosion sources, providing fire protection training.
        <br>Supervising labor safety: Reminding, educating, and training safety practices for contractors.
        <br>Supervising security and order in project management.`,

        LanguagesText: "Languages",
        LanEN:"English B2",
        LanJA:"JLPT N4",
    },
    ja: {
        welcomeText: "こんにちは",
        Fullname: "ディン マン フン",
        Position: "メカトロニクス工学",
        Quote: "メカトロニクスのスキルと知識を伸ばしたいです。そして、新しい技術を学び、実際のプロジェクトに参加して、将来専門家になりたいです.",
        BtnHireMe: "私を雇ってください",
        BtnDownloadCV: "履歴書をダウンロード",

        QualificationsText: "資格",
        SkillsText: "スキル",
        ProjectText: "プロジェクト",
        StoreText: "ショップ",

        HideInfo: "現在隠れています",
        DevText: "開発者 ",

        SkillNote: "*これらの評価は、専門分野で経験のある人の評価に基づいています。",
        Skill1: "メカトロニクス",
        Skill2: "PLCプログラミング",
        Skill3: "オフィスコンピューティング",
        Skill4: "ウェブプログラミング [フロントエンド]",
        Skill5: "オートCAD",
        Skill6: "Arduinoプログラミング、マイクロコントローラー",

        ExpText: "経験 (けいけん)",
        Exp1: "高校卒業",
        Exp2: "ドイツ基準のメカトロニクス専門学校卒業",
        Exp3: "ELECOM VIETNAM 技術有限会社",
        Exp3a: "インターン",
        Exp3b: "メカトロニクスのプロセスと技術について学ぶ",
        Exp4: "技術",
        Exp4a: "電動モーターの検査と修理",
        TimeExp5: "現在",
        Exp5: "IMPC設計と技術管理株式会社",
        Exp5a: "技術と監督",
        Exp5b: `電気システムの問題対応: 停電、設備故障などの問題を解決。
<br>防火システムの監視: 機器の点検、火災や爆発源の管理、防火訓練。
<br>労働安全の監視: 施工業者への注意喚起、教育、安全訓練。
<br>プロジェクト管理の治安と秩序の監視。`,
        LanguagesText: "言語 (げんご)",
        LanEN:"英語 B2",
        LanJA:"JLPT N4",
    },
    zh: {
        "welcomeText": "你好",
        "Fullname": "丁孟雄",
        "Position": "机电工程",
        "Quote": "希望在机电工程领域提升技能和知识，学习新技术并参与实际项目，为成为未来的专家而努力。",
        "BtnHireMe": "招聘",
        "BtnDownloadCV": "下载简历",

        "QualificationsText": "学历",
        "SkillsText": "技能",
        "ProjectText": "项目",
        "StoreText": "商店",

        "HideInfo": "当前隐藏",

        "DevText": "编程",

        "SkillNote": "*这些评估基于有行业经验的专业人士的评价。",
        "Skill1": "机电工程",
        "Skill2": "PLC编程",
        "Skill3": "办公软件",
        "Skill4": "网页编程 [前端]",
        "Skill5": "Auto CAD",
        "Skill6": "Arduino和微处理器编程",

        "ExpText": "经验",
        "Exp1": "高中毕业",
        "Exp2": "德国标准机电工程专科毕业",
        "Exp3": "越南ELECOM技术有限公司",
        "Exp3a": "实习生",
        "Exp3b": "学习机电工程的流程和技术",
        "Exp4": "技术",
        "Exp4a": "电动机的检查和维修",
        "TimeExp5": "至今",
        "Exp5": "IMPC设计与技术管理股份公司",
        "Exp5a": "技术与监督",
        "Exp5b": "处理电力系统问题：解决电力中断、设备故障等问题。<br>消防系统监控：检查设备，控制火灾源，进行消防培训。<br>职业安全监督：提醒、宣传和培训施工承包商的安全措施。<br>项目管理中的秩序与安全监控。",

        LanguagesText: "語言",
        LanEN:"英語 B2",
        LanJA:"JLPT N4",
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
    var body = document.body.classList;
    body.remove('en', 'vi', 'ja', 'zh');

    // Thêm lớp ngôn ngữ mới
    body.add(language);

    // Lấy tất cả phần tử có thuộc tính data-translate và cập nhật nội dung
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.innerHTML = translations[language][key] || el.innerHTML;
    });
}

// Hàm cập nhật cờ dựa trên ngôn ngữ đã lưu
function updateFlag(language) {
    const flagMap = {
        'vi': './Asset/icon/flag/vietnam.png',
        'en': './Asset/icon/flag/US.png',
        'ja': './Asset/icon/flag/Japan.png',
        'zh': './Asset/icon/flag/china.png'
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


// Tạo các thanh tiến trình dựa trên data-percentage
document.querySelectorAll('.progress').forEach(function (progress) {
    let percentage = progress.getAttribute('data-percentage');

    // Tạo phần tử nhãn, thanh chứa và thanh tiến trình
    let container = document.createElement('div');
    container.classList.add('progress-container');


    let barWrapper = document.createElement('div');
    barWrapper.classList.add('progress-bar-wrapper');

    let bar = document.createElement('div');
    bar.classList.add('progress-bar');
    bar.style.width = percentage + '%';

    // Gắn các phần tử vào DOM
    barWrapper.appendChild(bar);
    container.appendChild(barWrapper);
    progress.appendChild(container);
});