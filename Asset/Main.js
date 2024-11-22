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
        Exp4a: "Kiểm tra & sửa chữa Motor điện",
        TimeExp5: "Nay",
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
        Exp4a: "Inspect & repair electric motors",
        TimeExp5: "Present",
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
        Exp4a: "電動モーターの検査と修理",
        TimeExp5: "現在",
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
        "TimeExp5": "至今",
        "Exp5": "IMPC设计与技术管理股份公司",
        "Exp5a": "技术与监督",
        "Exp5b": "处理电力系统问题：解决电力中断、设备故障等问题。<br>消防系统监控：检查设备，控制火灾源，进行消防培训。<br>职业安全监督：提醒、宣传和培训施工承包商的安全措施。<br>项目管理中的秩序与安全监控。",

        LanguagesText: "語言",
        LanEN: "英語 B2",
        LanJA: "JLPT N4",

        Cer1: "机电一体化学院 - 德国标准",
        Cer1a: "LILAMA2国际技术学院",
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
        'vi': './Asset/icon/flag/Vietnam.png',
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





async function DownloadCV() {
    const { value: password } = await Swal.fire({
        title: "Recruitment Code",
        input: "text",
        inputLabel: "Password",
        inputPlaceholder: "Recruitment Code",
        inputAttributes: {
            maxlength: "10",
            autocapitalize: "off",
            autocorrect: "off"
        }
    });

    // Nếu có nhập mật khẩu
    if (password) {
        try {
            // Giải mã nội dung `.Contact` bằng mật khẩu nhập vào
            const decryptedContent = CryptoJS.AES.decrypt(encryptedContactInfo, password).toString(CryptoJS.enc.Utf8);

            // Kiểm tra nếu mật khẩu đúng (nội dung giải mã không rỗng)
            if (decryptedContent) {
                document.getElementById("Download").innerHTML = decryptedContent;
                document.getElementById("Download").style.display = "block";
                Swal.fire("Access Granted!", "Contact details are now visible", "success");
            } else {
                Swal.fire("Access denied", "Incorrect password", "error");
            }
        } catch (e) {
            Swal.fire("Access Denied", "Incorrect password", "error");
        }
    }
}

// Mã hóa nội dung liên hệ để tránh hiển thị trong mã nguồn
const encryptedContactInfo = "U2FsdGVkX18+/WQMYjScy5xZYU82uVGNZIfAnoF79uBZEVY7I2/RZ9UmEw8A6g00XlHVm7ZUBnQx2O1c4l4SQWQ1+brNt7bb/8nOfCs8cGnLWVjlz1MPxkBUZaj0XMTVH+MxcD0ODkb/Ilw0n0NfHOrkIh3n5wodM/q0vM2ebilMADuMC8sEctbMvQkez+K9wGiBvqOCi40z/NWarpV/Mw==";



// WEATHER
const apiKey = 'KZH7P9GUL9SBMVQ5MV4WDF23L'; // Thay thế bằng API Key của bạn

function getWeatherAuto() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                localStorage.setItem('location', `${lat},${lon}`);
                fetchWeather(lat, lon);
            },
            () => {
                // Nếu không thể lấy vị trí, sử dụng IP để lấy thời tiết
                getWeatherByIP();
            }
        );
    } else {
        // Nếu trình duyệt không hỗ trợ định vị, sử dụng IP để lấy thời tiết
        getWeatherByIP();
    }
}

// Bảng ánh xạ từ hướng gió quốc tế sang thuần Việt
const windDirectionMap = {
    'N': 'Bắc',
    'NNE': 'Bắc Đông Bắc',
    'NE': 'Đông Bắc',
    'ENE': 'Đông Bắc Đông',
    'E': 'Đông',
    'ESE': 'Đông Đông Nam',
    'SE': 'Đông Nam',
    'SSE': 'Nam Đông Nam',
    'S': 'Nam',
    'SSW': 'Nam Tây Nam',
    'SW': 'Tây Nam',
    'WSW': 'Tây Tây Nam',
    'W': 'Tây',
    'WNW': 'Tây Bắc Tây',
    'NW': 'Tây Bắc',
    'NNW': 'Bắc Tây Bắc'
};

// Bảng ánh xạ mã điều kiện thời tiết sang mô tả tiếng Việt
const weatherConditionMap = {
    'clear-day': 'Trời quang đãng',
    'clear-night': 'Trời quang đãng',
    'partly-cloudy-day': 'Có mây',
    'partly-cloudy-night': 'Có mây',
    'cloudy': 'Trời nhiều mây',
    'rain': 'Mưa rào',
    'sleet': 'Mưa tuyết',
    'snow': 'Tuyết rơi',
    'wind': 'Gió',
    'fog': 'Sương mù',
    'hail': 'Mưa đá',
    'thunderstorm': 'Bão tố'
};

async function fetchWeather(latitude, longitude) {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=${apiKey}&contentType=json`);
    const data = await response.json();

    // Xử lý thông tin điều kiện thời tiết
    const currentConditions = data.currentConditions;
    const conditionCode = currentConditions.icon;
    const conditionText = weatherConditionMap[conditionCode] || currentConditions.conditions;
    const conditionIcon = `/Asset/Weather/${conditionCode}.svg`;

    // document.getElementById('temperature').innerHTML = `${currentConditions.temp.toFixed(0)}°C`;
    // document.getElementById('rain_chance').innerHTML = `<i class="fa-solid fa-cloud-rain"></i> ${currentConditions.precip !== null ? currentConditions.precip.toFixed(1) : 0} mm`;
    // document.getElementById('uv_index').innerHTML = `<i class="fa-solid fa-sun"></i> UV: ${currentConditions.uvindex}`;

    // // Chuyển đổi gió hướng sang định dạng thuần Việt
    // const windDir = currentConditions.winddir;
    // const windDirection = windDirectionMap[windDir] || windDir;
    // document.getElementById('wind_direction').innerHTML = `<i class="fa-solid fa-wind"></i> ${windDirection} ${currentConditions.windspeed.toFixed(1)} km/h`;

    reverseGeocodeNominatim(latitude, longitude).then(({ address, addressFull }) => {
        // Cập nhật nội dung trên giao diện người dùng
        document.getElementById('weather').innerHTML = `<p>${address} <i class="fa-solid fa-location-arrow" aria-hidden="true"></i></p>
  <div class="flex">
    <img src="${conditionIcon}" alt="${conditionText}" />
      <h1>${currentConditions.temp.toFixed(0)}°C</h1></div>
    </div>
      
      `;
    }).catch(error => {
        console.error('Lỗi khi lấy địa điểm:', error);
    });

}

async function reverseGeocodeNominatim(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        // Khởi tạo giá trị mặc định cho address và addressFull
        let address = '';
        let addressFull = '';

        if (data.address) {
            if (data.address.village !== undefined) {
                const originalSuburb = data.address.village || '';  // Đảm bảo có giá trị mặc định
                const formattedSuburb = originalSuburb.replace(/^Xã\s/, 'X.');
                address = formattedSuburb;
            } else if (data.address.quarter !== undefined) {
                address = data.address.quarter;
            } else {
                const originalSuburb = data.address.suburb || '';  // Đảm bảo có giá trị mặc định
                const formattedSuburb = originalSuburb.replace(/^Phường\s/, 'P.');
                address = formattedSuburb;
            }
            addressFull = data.display_name;

        } else {
            throw new Error('Không thể tìm thấy địa điểm.');
        }

        return {
            address: address.trim(),
            addressFull: addressFull.trim()
        };
    } catch (error) {
        console.error('Lỗi khi tìm địa điểm:', error);
        throw error;  // Ném lỗi để xử lý ở nơi gọi hàm
    }
}

async function getWeatherByIP() {
    try {
        const ipResponse = await fetch('https://ipinfo.io/json?token=8c35ace05458e6');
        const ipData = await ipResponse.json();

        document.getElementById('ip').innerText = `IP: ${ipData.ip}`;
        document.getElementById('organization').innerText = `Nhà mạng: ${ipData.org}`;

        if (ipData.loc) {
            const [latitude, longitude] = ipData.loc.split(',');
            fetchWeather(latitude, longitude);
        } else {
            console.error('Không tìm thấy thông tin tọa độ từ IP.');
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin từ IP:', error);
    }
}

function getWeatherByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(lat, lon);
        }, error => {
            console.error('Lỗi khi lấy thông tin định vị:', error);
        });
    } else {
        alert('Trình duyệt của bạn không hỗ trợ định vị địa lý.');
    }
}

async function geocodeAddress(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
    const data = await response.json();

    if (data.length > 0) {
        const location = data[0];
        return {
            latitude: location.lat,
            longitude: location.lon
        };

    } else {
        throw new Error('Không tìm thấy địa điểm.');
    }

}

async function getWeatherByManual() {
    const manualLocation = document.getElementById('manualLocation').value;
    if (manualLocation) {
        try {
            const { latitude, longitude } = await geocodeAddress(manualLocation);
            fetchWeather(latitude, longitude);
        } catch (error) {
            alert(error.message);
        }
    } else {
        Info('Vui lòng nhập địa điểm.');
    }
}

//Modal thời tiết
document.addEventListener('DOMContentLoaded', () => {
    const weatherPreference = localStorage.getItem('weatherPreference');
    if (weatherPreference === 'none') {
        // Nếu người dùng chọn "Không", không làm gì
        return;
    } else if (!weatherPreference) {
        // Hiển thị modal nếu chưa lưu lựa chọn
        document.getElementById('weatherModal').style.display = 'flex';
    } else if (weatherPreference === 'geolocation') {
        getWeatherAuto();
    } else if (weatherPreference === 'ip') {
        getWeatherByIP();
    }
});


// Lắng nghe sự kiện click trên phần tử #weather
document.getElementById('weather').addEventListener('click', () => {
    // Hiển thị lại modal để người dùng thay đổi quyết định
    document.getElementById('weatherModal').style.display = 'flex';
    // Xóa trạng thái "không hỏi nữa" để cho phép chọn lại
    localStorage.removeItem('weatherPreference');
});


// Hàm xử lý khi người dùng chọn phương thức
function handleWeatherChoice(choice) {
    const modal = document.getElementById('weatherModal');

    if (choice === 'geolocation') {
        // Lưu lựa chọn định vị và gọi hàm lấy thời tiết
        localStorage.setItem('weatherPreference', 'geolocation');
        getWeatherAuto();
    } else if (choice === 'ip') {
        // Lưu lựa chọn IP và gọi hàm lấy thời tiết
        localStorage.setItem('weatherPreference', 'ip');
        getWeatherByIP();
    } else if (choice === 'cancel') {
        // Lưu lựa chọn "không hỏi nữa"
        localStorage.setItem('weatherPreference', 'none');
        // Xóa thông tin vị trí cũ nếu có
        localStorage.removeItem('location');
    }

    // Ẩn modal
    modal.style.display = 'none';
}
