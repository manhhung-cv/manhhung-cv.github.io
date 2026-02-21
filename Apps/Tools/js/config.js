export const CATEGORIES = [
    { id: 'utilities', name: 'Tiện Ích', icon: 'fas fa-tools', desc: 'Các công cụ đa năng, tiện lợi hàng ngày' },
    { id: 'calc', name: 'Máy Tính', icon: 'fas fa-calculator', desc: 'Tính toán toán học và tài chính' },
    { id: 'converter', name: 'Chuyển Đổi', icon: 'fas fa-exchange-alt', desc: 'Quy đổi đơn vị, tỷ giá, kích cỡ' },
    { id: 'text', name: 'Văn Bản', icon: 'fas fa-align-left', desc: 'Xử lý chuỗi, định dạng văn bản' },
    { id: 'life', name: 'Đời Sống', icon: 'fas fa-heartbeat', desc: 'Sức khỏe, thời gian và sinh hoạt' },
    { id: 'dev', name: 'Developer', icon: 'fas fa-code', desc: 'Công cụ lập trình, web và dữ liệu' },
    { id: 'system', name: 'Hệ Thống', icon: 'fas fa-laptop-code', desc: 'Mạng, bảo mật và thiết bị' }
];

export const TOOLS = [
    // ==========================================
    // 1. TIỆN ÍCH (utilities)
    // ==========================================
    {
        id: 'qr-generator',
        catId: 'utilities',
        name: 'Tạo mã QR',
        icon: 'fas fa-qrcode',
        desc: 'Tạo mã QR tùy chỉnh cho URL, WiFi, Liên hệ, Tin nhắn với khả năng chèn Logo và thay đổi màu sắc.',
        tags: ['qr code', 'tạo mã qr', 'wifi qr', 'vcard', 'marketing', 'generator']
    },
    {
        id: 'email-signature',
        catId: 'utilities',
        name: 'Tạo chữ ký Email',
        icon: 'fas fa-envelope-open-text',
        desc: 'Thiết kế chữ ký email chuyên nghiệp, tương thích tốt với Gmail, Outlook, Apple Mail và dán trực tiếp dễ dàng.',
        tags: ['email', 'chữ ký', 'signature', 'gmail', 'outlook', 'mail', 'thiết kế', 'văn phòng']
    },
    {
        id: 'reverse-image-search',
        catId: 'utilities', 
        name: 'Tìm kiếm bằng hình ảnh',
        icon: 'fas fa-image',
        desc: 'Truy tìm nguồn gốc, ảnh gốc và ảnh tương tự bằng cách upload lên Google Lens, Yandex, Bing.',
        tags: ['image', 'search', 'ảnh', 'tìm kiếm', 'google lens', 'yandex', 'bing', 'reverse image']
    },
    {
        id: 'excel-unlocker',
        catId: 'utilities',
        name: 'Mở khóa Sheet Excel',
        icon: 'fas fa-file-excel',
        desc: 'Xóa bỏ mật khẩu bảo vệ trang tính (Sheet Protection) của file Excel. Xử lý an toàn 100% E2E.',
        tags: ['excel', 'unlock', 'mở khóa', 'bẻ khóa', 'sheet', 'mật khẩu', 'password']
    },
    {
        id: 'gmail-dot-trick',
        catId: 'utilities',
        name: 'Gmail Dot Trick',
        icon: 'fas fa-envelope-open-text',
        desc: 'Tạo hàng ngàn bí danh email (alias) bằng cách chèn dấu chấm vào Username.',
        tags: ['gmail', 'email', 'dot trick', 'alias', 'bí danh', 'clone']
    },
    {
        id: 'random-generator',
        catId: 'utilities',
        name: 'Quay Số / Bốc Thăm',
        icon: 'fas fa-dice',
        desc: 'Công cụ quay số, chọn tên ngẫu nhiên tích hợp thuật toán Crypto chống thiên vị.',
        tags: ['ngẫu nhiên', 'random', 'quay số', 'bốc thăm', 'chọn tên', 'xổ số']
    },

    // ==========================================
    // 2. MÁY TÍNH (calc)
    // ==========================================
    {
        id: 'multi-calculator',
        catId: 'calc',
        name: 'Multi Calculator',
        icon: 'fas fa-calculator',
        desc: 'Máy tính đa năng tích hợp bộ lưu trữ lịch sử tính toán và chuyển đổi đơn vị.'
    },
    {
        id: 'percentage-calculator',
        catId: 'calc',
        name: 'Máy Tính Phần Trăm',
        icon: 'fas fa-percentage',
        desc: 'Tính toán cực nhanh các bài toán %: tỷ lệ tăng giảm, X là bao nhiêu % của Y, và % của một số.',
        tags: ['phần trăm', 'tính toán', 'máy tính', 'percentage', 'tỷ lệ']
    },
    {
        id: 'loan-calculator',
        catId: 'calc',
        name: 'Máy Tính Vay Trả Góp',
        icon: 'fas fa-hand-holding-usd',
        desc: 'Tính toán chính xác lịch trả nợ hàng tháng theo chuẩn Dư nợ giảm dần hoặc Trả góp cố định (EMI).',
        tags: ['vay', 'trả góp', 'lãi suất', 'ngân hàng', 'emi', 'tài chính', 'tiền']
    },

    // ==========================================
    // 3. CHUYỂN ĐỔI (converter)
    // ==========================================
    {
        id: 'unit-converter',
        catId: 'converter',
        name: 'Chuyển đổi Đơn vị',
        icon: 'fas fa-exchange-alt',
        desc: 'Công cụ chuyển đổi 2 chiều siêu tốc giữa các đơn vị Chiều dài, Thể tích, Khối lượng và Tốc độ.',
        tags: ['chuyển đổi', 'đơn vị', 'mét', 'kg', 'lít', 'converter', 'đo lường']
    },
    {
        id: 'currency-converter',
        catId: 'converter',
        name: 'Chuyển đổi Tiền tệ',
        icon: 'fas fa-money-bill-wave',
        desc: 'Theo dõi và chuyển đổi tỷ giá ngoại tệ. Tích hợp tỷ giá chuyển tiền Nhật - Việt từ Smiles Wallet.',
        tags: ['tiền tệ', 'tỷ giá', 'ngoại tệ', 'usd', 'vnd', 'jpy', 'smiles']
    },
    {
        id: 'size-converter',
        catId: 'converter',
        name: 'Đổi cỡ Quần áo/Giày',
        icon: 'fas fa-tshirt',
        desc: 'Quy đổi kích cỡ Giày dép, Áo quần giữa các chuẩn quốc tế (US, UK, EU, VN...) nhanh chóng.',
        tags: ['size', 'quần áo', 'giày', 'chuyển đổi cỡ', 'converter']
    },

    // ==========================================
    // 4. VĂN BẢN (text)
    // ==========================================
    {
        id: 'text-counter',
        catId: 'text',
        name: 'AIO Text Tools',
        icon: 'fas fa-font',
        desc: 'Bộ công cụ: Đếm ký tự, chuẩn hóa, lọc Email/Link, tạo Lorem Ipsum và so sánh (Diff).'
    },
    {
        id: 'morse-code',
        catId: 'text',
        name: 'Mã Morse',
        icon: 'fas fa-ellipsis-h',
        desc: 'Chuyển đổi văn bản thành mã Morse và ngược lại. Tự động loại bỏ dấu Tiếng Việt.'
    },

    // ==========================================
    // 5. ĐỜI SỐNG (life)
    // ==========================================
    {
        id: 'time-tools',
        catId: 'life',
        name: 'Đồng hồ & Thời gian',
        icon: 'fas fa-clock',
        desc: '7 công cụ thời gian: Đếm ngược, Bấm giờ, Tính khoảng cách ngày, Tính số giờ làm việc, Tính số tuần và Tính tuổi.',
        tags: ['thời gian', 'đồng hồ', 'đếm ngược', 'bấm giờ', 'ngày', 'tuổi', 'tuần', 'clock', 'time']
    },
    {
        id: 'health-calculator',
        catId: 'life',
        name: 'Tính chỉ số Sức khỏe',
        icon: 'fas fa-heartbeat',
        desc: 'Tính toán nhanh chỉ số BMI (chuẩn Châu Á), BMR và lượng Calo tiêu thụ (TDEE) để giảm/tăng cân.',
        tags: ['sức khỏe', 'bmi', 'bmr', 'tdee', 'calo', 'cân nặng', 'health']
    },
    {
        id: 'sleep-calculator',
        catId: 'life',
        name: 'Máy Tính Giấc Ngủ',
        icon: 'fas fa-bed',
        desc: 'Tính toán thời gian đi ngủ và thức dậy tối ưu dựa trên chu kỳ giấc ngủ sinh học (90 phút).',
        tags: ['ngủ', 'giấc ngủ', 'thức dậy', 'chu kỳ', 'sức khỏe', 'sleep']
    },

    // ==========================================
    // 6. DEVELOPER (dev)
    // ==========================================
    {
        id: 'json-format',
        catId: 'dev',
        name: 'Format JSON',
        icon: 'fas fa-code',
        desc: 'Làm đẹp, nén và kiểm tra lỗi cú pháp JSON.'
    },
    {
        id: 'base64-converter',
        catId: 'dev',
        name: 'Base64 Encode/Decode',
        icon: 'fas fa-shield-alt',
        desc: 'Mã hóa và giải mã chuỗi Base64 an toàn, hỗ trợ Unicode (Tiếng Việt).'
    },
    {
        id: 'regex-tester',
        catId: 'dev',
        name: 'Kiểm tra Regex',
        icon: 'fas fa-code',
        desc: 'Trình kiểm thử Biểu thức chính quy (Regular Expression) theo thời gian thực. Hỗ trợ trích xuất dữ liệu và Capture Groups.',
        tags: ['regex', 'biểu thức chính quy', 'code', 'dev', 'kiểm tra', 'tester']
    },
    {
        id: 'fake-data-generator',
        catId: 'dev',
        name: 'Tạo Dữ liệu Giả',
        icon: 'fas fa-database',
        desc: 'Sinh ra hàng ngàn dòng dữ liệu ngẫu nhiên (Tên, SĐT, Email chuẩn Việt Nam) dưới dạng JSON, CSV, SQL.',
        tags: ['dữ liệu', 'data', 'fake', 'mock', 'json', 'csv', 'sql', 'test']
    },
    {
        id: 'meta-tag-generator',
        catId: 'dev',
        name: 'Tạo thẻ Meta (SEO)',
        icon: 'fas fa-search',
        desc: 'Tạo thẻ Meta chuẩn SEO cho Google, Open Graph (Facebook), Twitter và xem trước (Live Preview).',
        tags: ['seo', 'meta tag', 'open graph', 'twitter card', 'apple icon', 'tạo thẻ meta', 'facebook', 'google']
    },

    // ==========================================
    // 7. HỆ THỐNG & BẢO MẬT (system)
    // ==========================================
    {
        id: 'ip-checker',
        catId: 'system',
        name: 'Địa chỉ IP của tôi',
        icon: 'fas fa-network-wired',
        desc: 'Xem ngay Public IP, vị trí địa lý, nhà mạng (ISP) và bản đồ tương tác OpenStreetMap.',
        tags: ['ip', 'địa chỉ ip', 'mạng', 'vị trí', 'bản đồ', 'network', 'isp']
    },
    {
        id: 'device-info',
        catId: 'system',
        name: 'Thông tin Thiết bị',
        icon: 'fas fa-info-circle',
        desc: 'Truy xuất các thông số ẩn của thiết bị: Hệ điều hành, màn hình, RAM, CPU, User Agent và Mạng.',
        tags: ['thiết bị', 'thông tin', 'cấu hình', 'màn hình', 'ram', 'cpu', 'browser', 'device']
    },
    {
        id: 'password-generator',
        catId: 'system',
        name: 'Tạo Mật Khẩu',
        icon: 'fas fa-key',
        desc: 'Tạo mật khẩu siêu bảo mật với Crypto API và kiểm tra độ mạnh của mật khẩu theo thời gian thực.',
        tags: ['mật khẩu', 'password', 'bảo mật', 'tạo mã', 'generator', 'security']
    },
    {
        id: 'ui-kit',
        catId: 'system',
        name: 'UI Kit / Components',
        icon: 'fas fa-cubes',
        desc: 'Thư viện giao diện tái sử dụng.'
    }
];