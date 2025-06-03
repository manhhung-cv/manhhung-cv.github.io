// Đối tượng chứa các bản dịch
const translations = {
    vi: {
        welcomeText: "Xin chào",
        Fullname: "Đinh Mạnh Hùng",
        Position: "Kỹ thuật Cơ Điện Tử",
        Quote: "Mong muốn phát triển kỹ năng và kiến thức trong kỹ thuật cơ điện tử, học hỏi công nghệ mới và đóng góp vào dự án thực tế để trở thành chuyên gia trong tương lai.",
        BtnHireMe: "Tuyển dụng",
        BtnDownloadCV: "Tải CV",
        Location: "Việt Nam 🇻🇳",
        

        QualificationsText: "Bằng cấp",
        SkillsText: "Kĩ năng",
        ProjectText: "Dự án",
        StoreText: "Cửa hàng",

        HideInfo: "Thông tin bị ẩn, Chỉ hiển thị khi nhập mã tuyển dụng.",

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
        Exp4a: "Kiểm tra & sửa chữa Motor điện, Lập trình PLC.",
        TimeExp5: "1/2025",
        Exp5: "CTY CP THIẾT KẾ VÀ QUẢN LÝ KỸ THUẬT IMPC",
        Exp5a: "Kỹ thuật & Giám sát",
        Exp5b: `Xử lý sự cố hệ thống điện: Khắc phục các lỗi như mất điện, lỗi thiết bị.
        <br>Giám sát hệ thống phòng cháy chữa cháy: Kiểm tra thiết bị, kiểm soát các nguồn cháy nổ, đào tạo về phòng cháy chữa cháy. 
        <br>Giám sát an toàn lao động: Nhắc nhở, phổ biến, huấn luyện an toàn cho nhà thầu thi công.
        <br>Giám sát an ninh trật tự trong quản lý dự án`,

        LanguagesText: "Ngoại ngữ",
        LanEN: "Tiếng Anh B2",
        LanJA: "Tiếng Nhật N4",

        Cer1: "Cao đẳng Cơ Điện Tử - Tiêu chuẩn Đức",
        Cer1a: "Trường Cao đẳng Công nghệ Quốc tế LILAMA2",

    },
    en: {
        welcomeText: "Hello",
        Fullname: "Dinh Manh Hung",
        Position: "Mechatronics Engineering",
        Quote: "*Desiring to develop skills and knowledge in mechatronics engineering, learn new technologies, and contribute to real-world projects to become an expert in the future.",
        BtnHireMe: "Hire Me",
        BtnDownloadCV: "Download CV",
        Location: "Viet Nam 🇻🇳",

        QualificationsText: "Qualifications",
        SkillsText: "Skills",
        ProjectText: "Project",
        StoreText: "Store",

        HideInfo: "Information is hidden, Only displayed when entering recruitment code.",

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
        Exp4a: "Inspect & repair electric motors, PLC.",
        TimeExp5: "1/2025",
        Exp5: "IMPC ENGINEERING DESIGN AND MANAGEMENT JSC",
        Exp5a: "Technical & Supervision",
        Exp5b: `Handling electrical system issues: Troubleshooting issues like power outages, equipment failures.
        <br>Supervising fire protection systems: Inspecting equipment, monitoring fire/explosion sources, providing fire protection training.
        <br>Supervising labor safety: Reminding, educating, and training safety practices for contractors.
        <br>Supervising security and order in project management.`,

        LanguagesText: "Languages",
        LanEN: "English B2",
        LanJA: "JLPT N4",

        Cer1: "College of Mechatronics - German Standard",
        Cer1a: "LILAMA2 International Technology College"
    },
    ja: {
        welcomeText: "こんにちは",
        Fullname: "ディン マン フン",
        Position: "メカトロニクス工学",
        Quote: "メカトロニクスのスキルと知識を伸ばしたいです。そして、新しい技術を学び、実際のプロジェクトに参加して、将来専門家になりたいです.",
        BtnHireMe: "私を雇ってください",
        BtnDownloadCV: "履歴書をダウンロード",
        Location: "ベトナム 🇻🇳",

        QualificationsText: "資格",
        SkillsText: "スキル",
        ProjectText: "プロジェクト",
        StoreText: "ショップ",

        HideInfo: " 情報は非表示、採用コード入力時のみ表示",
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
        Exp4a: "電動モーターの検査と修理, PLCプログラミング。",
        TimeExp5: "1/2025",
        Exp5: "IMPC設計と技術管理株式会社",
        Exp5a: "技術と監督",
        Exp5b: `電気システムの問題対応: 停電、設備故障などの問題を解決。
<br>防火システムの監視: 機器の点検、火災や爆発源の管理、防火訓練。
<br>労働安全の監視: 施工業者への注意喚起、教育、安全訓練。
<br>プロジェクト管理の治安と秩序の監視。`,
        LanguagesText: "言語 (げんご)",
        LanEN: "英語 B2",
        LanJA: "JLPT N4",

        Cer1: "メカトロニクス専門学校 - ドイツ基準",
        Cer1a: "LILAMA2国際技術専門学校"
    },
    zh: {
        "welcomeText": "你好",
        "Fullname": "丁孟雄",
        "Position": "机电工程",
        "Quote": "希望在机电工程领域提升技能和知识，学习新技术并参与实际项目，为成为未来的专家而努力。",
        "BtnHireMe": "招聘",
        "BtnDownloadCV": "下载简历",
        Location: "越南 🇻🇳",

        "QualificationsText": "学历",
        "SkillsText": "技能",
        "ProjectText": "项目",
        "StoreText": "商店",

        "HideInfo": "信息隐藏，仅输入招聘码时显示",

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
        "TimeExp5": "1/2025",
        "Exp5": "IMPC设计与技术管理股份公司",
        "Exp5a": "技术与监督",
        "Exp5b": "处理电力系统问题：解决电力中断、设备故障等问题。<br>消防系统监控：检查设备，控制火灾源，进行消防培训。<br>职业安全监督：提醒、宣传和培训施工承包商的安全措施。<br>项目管理中的秩序与安全监控。",

        LanguagesText: "語言",
        LanEN: "英語 B2",
        LanJA: "JLPT N4",

        Cer1: "机电一体化学院 - 德国标准",
        Cer1a: "LILAMA2国际技术学院",
    },
    de: {
        welcomeText: "Hallo",
        Fullname: "Dinh Manh Hung",
        Position: "Mechatronik-Ingenieurwesen",
        Quote: "*Ich möchte meine Fähigkeiten und Kenntnisse im Bereich Mechatronik-Ingenieurwesen weiterentwickeln, neue Technologien erlernen und zu realen Projekten beitragen, um in Zukunft ein Experte zu werden.",
        BtnHireMe: "Stellen Sie mich ein",
        BtnDownloadCV: "Lebenslauf herunterladen",
        Location: "Vietnam 🇻🇳",

        QualificationsText: "Qualifikationen",
        SkillsText: "Fähigkeiten",
        ProjectText: "Projekt",
        StoreText: "Shop",

        HideInfo: "Informationen sind ausgeblendet und werden nur bei Eingabe des Rekrutierungscodes angezeigt.",

        DevText: "Entwickler",

        SkillNote: "*Diese Bewertungen basieren auf Einschätzungen erfahrener Fachleute auf diesem Gebiet.",
        Skill1: "Mechatronik",
        Skill2: "SPS-Programmierung",
        Skill3: "Büro-IT",
        Skill4: "Webprogrammierung [Front-End]",
        Skill5: "Auto CAD",
        Skill6: "Arduino-Programmierung, Mikrocontroller",

        ExpText: "Erfahrung",
        Exp1: "Abitur",
        Exp2: "Abschluss am Deutsch-Standard Mechatronik Kolleg",
        Exp3: "ELECOM VIETNAM TECHNICAL CO., LTD",
        Exp3a: "Praktikant",
        Exp3b: "Einblick in mechatronische Prozesse und Technologie",
        Exp4: "Techniker",
        Exp4a: "Elektromotoren prüfen und reparieren",
        TimeExp5: "1/2025",
        Exp5: "IMPC ENGINEERING DESIGN AND MANAGEMENT JSC",
        Exp5a: "Technik & Aufsicht",
        Exp5b: `Behebung von Problemen mit elektrischen Systemen: Fehlersuche bei Stromausfällen, Geräteausfällen.
        <br>Überwachung von Brandschutzsystemen: Überprüfung der Ausrüstung, Überwachung von Brand-/Explosionsquellen, Durchführung von Brandschutzschulungen.
        <br>Überwachung der Arbeitssicherheit: Erinnern, Aufklären und Schulen von Sicherheitsmaßnahmen für Auftragnehmer.
        <br>Überwachung von Sicherheit und Ordnung im Projektmanagement.`,

        LanguagesText: "Sprachen",
        LanEN: "Englisch B2",
        LanJA: "JLPT N4",

        Cer1: "Mechatronik Kolleg - Deutscher Standard",
        Cer1a: "LILAMA2 International Technology College"
    }
};


// ======= UPDATE FLAG IMAGE BASED ON LANGUAGE =======
function updateFlag(language) {
    const flagMap = {
        'vi': './Asset/icon/flag/Vietnam.png',
        'en': './Asset/icon/flag/US.png',
        'de': './Asset/icon/flag/germany.png',
        'ja': './Asset/icon/flag/Japan.png',
        'zh': './Asset/icon/flag/china.png',
    };
    document.getElementById('currentFlag').src = flagMap[language];
}

// ======= APPLY LANGUAGE =======
function applyLanguage(language) {
    const body = document.body.classList;
    body.remove('en', 'vi', 'ja', 'zh', 'de');
    body.add(language);
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.innerHTML = translations[language][key] || el.innerHTML;
    });
}

// ======= SET LANGUAGE =======
function setLanguage(language, flagSrc) {
    // localStorage.setItem('language', language);
    applyLanguage(language);
    document.getElementById('currentFlag').src = flagSrc;
    document.getElementById('languageDropdown').classList.remove('show');
}

// ======= TOGGLE DROPDOWN =======
function toggleDropdown() {
    document.getElementById('languageDropdown').classList.toggle('show');
}


// ======= INIT ON PAGE LOAD =======
document.addEventListener('DOMContentLoaded', async () => {
    const hashLang = window.location.hash.toUpperCase();
    const langFromHash = {
        '#JA': 'ja',
        '#VI': 'vi',
        '#EN': 'en',
        '#ZH': 'zh',
        '#DE': 'de' //
    };

    const flagMap = {
        'vi': './Asset/icon/flag/Vietnam.png',
        'en': './Asset/icon/flag/US.png',
        'ja': './Asset/icon/flag/Japan.png',
        'zh': './Asset/icon/flag/china.png',
        'de': './Asset/icon/flag/germany.png' 
    };

    // Function to detect language from IP using ip-api.com
    async function detectLanguageFromIP() {
        try {
            const yourIpInfoToken = '8c35ace05458e6'; // Đây là token bạn đã cung cấp
            const response = await fetch(`https://ipinfo.io/json?token=${yourIpInfoToken}`);
            const data = await response.json();
            // console.log("Dữ liệu từ IPinfo.io:", data); // Ghi log để debug
    
            // ipinfo.io trả về mã quốc gia trong trường 'country'
            // ví dụ: { "ip": "...", "country": "VN", ... }
            if (data && data.country) {
                const countryCode = data.country.toLowerCase(); // Lấy mã quốc gia và chuyển thành chữ thường
    
                const countryLangMap = {
                    'vn': 'vi', // Vietnam
                    'us': 'en', // United States
                    'gb': 'en', // United Kingdom
                    'jp': 'ja', // Japan
                    'cn': 'zh', // China
                    'de': 'de'  // Germany
                    // Thêm các mapping khác nếu cần
                };
    
                
                return countryLangMap[countryCode] || null; // Trả về ngôn ngữ hoặc null nếu không có mapping
            } else {
                console.error("IPinfo.io API request failed or no country data:", data ? data.error : "No data");
                return null;
            }
        } catch (error) {
            console.error("Error detecting language from IP (IPinfo.io):", error);
            return null;
        }
    }
    // Giả sử bạn có các hàm này đã được định nghĩa ở nơi khác
    // function applyLanguage(lang) { /* ... logic áp dụng ngôn ngữ ... */ }
    // function updateFlag(lang) { /* ... logic cập nhật cờ ... */ }

    let language = langFromHash[hashLang];

    // if (!language) {
    //     language = localStorage.getItem('language');
    // }

    if (!language) {
        // Await the IP detection if language is not found from hash or local storage
        language = await detectLanguageFromIP();
    }

    if (!language) {
        language = 'vi'; // Fallback to 'vi' if no language is determined from any source
    }

    // Bạn cần đảm bảo rằng hàm applyLanguage và updateFlag đã được định nghĩa
    // Ví dụ:
    applyLanguage(language);
    updateFlag(language);
    // console.log(`Final language determined: ${language}`);
    // Gọi các hàm thực tế của bạn ở đây, ví dụ:
    window.applyLanguage(language); // Nếu chúng là global
    window.updateFlag(language);
});





// ======= THEME DARK / LIGHT =======
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(currentTheme + '-theme');
themeIcon.src = currentTheme === 'light' ? './Asset/icon/theme/sun.png' : './Asset/icon/theme/moon.png';

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    themeIcon.src = newTheme === 'light' ? './Asset/icon/theme/sun.png' : './Asset/icon/theme/moon.png';
    localStorage.setItem('theme', newTheme);
});

// ======= PROGRESS BARS =======
document.querySelectorAll('.progress').forEach(progress => {
    const percentage = progress.getAttribute('data-percentage');
    const container = document.createElement('div');
    container.classList.add('progress-container');

    const barWrapper = document.createElement('div');
    barWrapper.classList.add('progress-bar-wrapper');

    const bar = document.createElement('div');
    bar.classList.add('progress-bar');
    bar.style.width = percentage + '%';

    barWrapper.appendChild(bar);
    container.appendChild(barWrapper);
    progress.appendChild(container);
});

// // ======= DOWNLOAD CV WITH RECRUITMENT CODE =======
// async function DownloadCV() {
//     const { value: password } = await Swal.fire({
//         title: "Recruitment Code",
//         input: "text",
//         inputLabel: "Password",
//         inputPlaceholder: "Recruitment Code",
//         inputAttributes: {
//             maxlength: "10",
//             autocapitalize: "off",
//             autocorrect: "off"
//         }
//     });

//     if (password) {
//         try {
//             const decrypted = CryptoJS.AES.decrypt(encryptedContactInfo, password).toString(CryptoJS.enc.Utf8);
//             if (decrypted) {
//                 document.getElementById("Download").innerHTML = decrypted;
//                 document.getElementById("Download").style.display = "block";
//                 Swal.fire("Access Granted!", "Contact details are now visible", "success");
//             } else {
//                 Swal.fire("Access Denied", "Incorrect password", "error");
//             }
//         } catch (e) {
//             Swal.fire("Access Denied", "Incorrect password", "error");
//         }
//     }
// }

// // ======= ENCRYPTED CONTACT INFO (MÃ HÓA SẴN) =======
// const encryptedContactInfo = "U2FsdGVkX18+/WQMYjScy5xZYU82uVGNZIfAnoF79uBZEVY7I2/RZ9UmEw8A6g00XlHVm7ZUBnQx2O1c4l4SQWQ1+brNt7bb/8nOfCs8cGnLWVjlz1MPxkBUZaj0XMTVH+MxcD0ODkb/Ilw0n0NfHOrkIh3n5wodM/q0vM2ebilMADuMC8sEctbMvQkez+K9wGiBvqOCi40z/NWarpV/Mw==";
