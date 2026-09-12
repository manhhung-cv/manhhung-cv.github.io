// =========================================================================
// 1. DANH MỤC HỆ THỐNG (CATEGORIES)
// =========================================================================
export const CATEGORIES = [
    { 
        id: 'utilities', 
        name: 'Tiện Ích', 
        icon: 'fas fa-tools', 
        color: '#10b981', 
        desc: 'Công cụ đa năng hỗ trợ công việc và sinh hoạt hàng ngày' 
    },
    { 
        id: 'calc', 
        name: 'Tính Toán', 
        icon: 'fas fa-calculator', 
        color: '#f59e0b', 
        desc: 'Tính toán tài chính, tiền lương, khoản vay và công thức' 
    },
    { 
        id: 'converter', 
        name: 'Chuyển Đổi', 
        icon: 'fas fa-exchange-alt', 
        color: '#06b6d4', 
        desc: 'Quy đổi tỷ giá tiền tệ, kích cỡ, khối lượng và đơn vị đo' 
    },
    { 
        id: 'text', 
        name: 'Văn Bản', 
        icon: 'fas fa-align-left', 
        color: '#8b5cf6', 
        desc: 'Xử lý ký tự, gieo vần, đếm từ và định dạng chuỗi' 
    },
    { 
        id: 'document', 
        name: 'Tài Liệu', 
        icon: 'fas fa-file-alt', 
        color: '#ef4444', 
        desc: 'Biên tập, ghép tách tệp PDF và bảng tính Excel' 
    },
    { 
        id: 'life', 
        name: 'Đời Sống', 
        icon: 'fas fa-heartbeat', 
        color: '#ec4899', 
        desc: 'Sức khỏe, chu kỳ giấc ngủ, thời gian và sinh hoạt' 
    },
    { 
        id: 'dev', 
        name: 'Lập Trình', 
        icon: 'fas fa-code', 
        color: '#3b82f6', 
        desc: 'Công cụ dữ liệu, kiểm thử regex, mã hóa và định dạng code' 
    },
    { 
        id: 'system', 
        name: 'Hệ Thống', 
        icon: 'fas fa-microchip', 
        color: '#64748b', 
        desc: 'Kiểm tra phần cứng, màn hình, bàn phím và bảo mật mạng' 
    },
    { 
        id: 'entertainment', 
        name: 'Giải Trí', 
        icon: 'fas fa-gamepad', 
        color: '#a855f7', 
        desc: 'Bảng LED cổ vũ, trò chơi ngẫu nhiên và ghi chú' 
    }
];

// =========================================================================
// 2. DANH SÁCH CÔNG CỤ (TOOLS) - TƯƠNG THÍCH CHUẨN VỚI MAIN.JS
// =========================================================================
export const TOOLS = [
    // ---------------------------------------------------------------------
    // TIỆN ÍCH HẰNG NGÀY (utilities)
    // ---------------------------------------------------------------------
    {
        id: 'qr-generator',
        catId: 'utilities',
        name: 'Tạo Mã QR',
        icon: 'fas fa-qrcode',
        bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        iconColor: '#ffffff',
        desc: 'Tạo mã QR cho link, WiFi, danh bạ vCard và văn bản kèm logo tùy chỉnh.',
        tags: ['qr', 'tạo mã qr', 'wifi', 'vcard', 'barcode']
    },
    {
        id: 'email-signature',
        catId: 'utilities',
        name: 'Chữ Ký Email',
        icon: 'fas fa-envelope-open-text',
        bgColor: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        iconColor: '#ffffff',
        desc: 'Thiết kế chữ ký email chuyên nghiệp cho Gmail, Outlook và Apple Mail.',
        tags: ['email', 'chữ ký', 'signature', 'gmail', 'mail']
    },
    {
        id: 'reverse-image-search',
        catId: 'utilities',
        name: 'Tìm Ảnh Gốc',
        icon: 'fas fa-search-plus',
        bgColor: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)',
        iconColor: '#ffffff',
        desc: 'Tra cứu nguồn gốc và phiên bản độ phân giải cao qua Google Lens, Yandex.',
        tags: ['ảnh', 'tìm kiếm', 'google lens', 'image', 'reverse']
    },
    {
        id: 'gmail-dot-trick',
        catId: 'utilities',
        name: 'Gmail Alias',
        icon: 'fas fa-at',
        bgColor: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #9f1239 100%)',
        iconColor: '#ffffff',
        desc: 'Tạo hàng trăm biến thể email nhận tin bằng quy tắc dấu chấm Gmail.',
        tags: ['gmail', 'dot trick', 'alias', 'email clone']
    },
    {
        id: 'random-generator',
        catId: 'utilities',
        name: 'Bốc Thăm',
        icon: 'fas fa-dice',
        bgColor: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #9a3412 100%)',
        iconColor: '#ffffff',
        desc: 'Quay số ngẫu nhiên, tung xúc xắc và bốc thăm danh sách công bằng.',
        tags: ['random', 'quay số', 'bốc thăm', 'xúc xắc', 'may mắn']
    },
    {
        id: 'phone-encoder',
        catId: 'utilities',
        name: 'Mã Hóa SĐT',
        icon: 'fas fa-phone-slash',
        bgColor: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #115e59 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi số điện thoại thành ký tự đặc biệt để đăng bài không bị chặn.',
        tags: ['sđt', 'ẩn số', 'mã hóa', 'phone', 'lách lọc']
    },
    {
        id: 'vn-map',
        catId: 'utilities',
        name: 'Tra Cứu Địa Chỉ',
        icon: 'fas fa-map-marked-alt',
        bgColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi và tra cứu đối chiếu địa danh hành chính cũ - mới tại Việt Nam.',
        tags: ['địa chỉ', 'bản đồ', 'hành chính', 'tỉnh thành', 'quận huyện']
    },

    // ---------------------------------------------------------------------
    // TÍNH TOÁN & TÀI CHÍNH (calc)
    // ---------------------------------------------------------------------
    {
        id: 'multi-calculator',
        catId: 'calc',
        name: 'Máy Tính',
        icon: 'fas fa-calculator',
        bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        iconColor: '#ffffff',
        desc: 'Máy tính số học đa năng có lưu lại lịch sử các bước tính toán.',
        tags: ['máy tính', 'calculator', 'cộng trừ', 'số học']
    },
    {
        id: 'finance',
        catId: 'calc',
        name: 'Quản Lý Thu Chi',
        icon: 'fas fa-wallet',
        bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #064e3b 100%)',
        iconColor: '#ffffff',
        desc: 'Sổ tay theo dõi dòng tiền, hoạch định ngân sách và kiểm soát chi tiêu.',
        tags: ['tài chính', 'thu chi', 'ngân sách', 'tiền', 'finance']
    },
    {
        id: 'salary-calculator',
        catId: 'calc',
        name: 'Lương Net/Gross',
        icon: 'fas fa-money-check-alt',
        bgColor: 'linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #3f6212 100%)',
        iconColor: '#ffffff',
        desc: 'Quy đổi thu nhập Net sang Gross và tính chi tiết tiền bảo hiểm, thuế TNCN.',
        tags: ['lương', 'net', 'gross', 'thuế tncn', 'bảo hiểm']
    },
    {
        id: 'loan-calculator',
        catId: 'calc',
        name: 'Tính Vay Trả Góp',
        icon: 'fas fa-hand-holding-usd',
        bgColor: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #854d0e 100%)',
        iconColor: '#ffffff',
        desc: 'Lập bảng chi tiết gốc và lãi phải trả hàng tháng theo dư nợ giảm dần.',
        tags: ['vay', 'lãi suất', 'ngân hàng', 'trả góp', 'emi']
    },
    {
        id: 'percentage-calculator',
        catId: 'calc',
        name: 'Tính Phần Trăm',
        icon: 'fas fa-percentage',
        bgColor: 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #9a3412 100%)',
        iconColor: '#ffffff',
        desc: 'Tính tỷ lệ % tăng giảm, chiết khấu giảm giá và độ chênh lệch giữa hai số.',
        tags: ['phần trăm', 'tỷ lệ', 'chiết khấu', 'percentage']
    },

    // ---------------------------------------------------------------------
    // QUY ĐỔI & CHUYỂN HÓA (converter)
    // ---------------------------------------------------------------------
    {
        id: 'currency-converter',
        catId: 'converter',
        name: 'Tỷ Giá Ngoại Tệ',
        icon: 'fas fa-money-bill-wave',
        bgColor: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #166534 100%)',
        iconColor: '#ffffff',
        desc: 'Quy đổi tiền tệ trực tuyến theo tỷ giá thị trường thời gian thực.',
        tags: ['tiền tệ', 'tỷ giá', 'usd', 'vnd', 'jpy', 'ngoại tệ']
    },
    {
        id: 'unit-converter',
        catId: 'converter',
        name: 'Đổi Đơn Vị Đo',
        icon: 'fas fa-balance-scale',
        bgColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #155e75 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi qua lại giữa độ dài, khối lượng, dung tích, nhiệt độ và áp suất.',
        tags: ['đơn vị', 'đo lường', 'km', 'kg', 'lít', 'converter']
    },
    {
        id: 'size-converter',
        catId: 'converter',
        name: 'Bảng Size Chuẩn',
        icon: 'fas fa-tshirt',
        bgColor: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
        iconColor: '#ffffff',
        desc: 'Đối chiếu và quy đổi cỡ giày dép, quần áo giữa các chuẩn US, UK, EU, VN.',
        tags: ['size', 'cỡ giày', 'quần áo', 'bảng size']
    },

    // ---------------------------------------------------------------------
    // XỬ LÝ VĂN BẢN (text)
    // ---------------------------------------------------------------------
    {
        id: 'text-counter',
        catId: 'text',
        name: 'Đếm Văn Bản',
        icon: 'fas fa-font',
        bgColor: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #6b21a8 100%)',
        iconColor: '#ffffff',
        desc: 'Đếm số từ, ký tự, dòng văn bản, xóa khoảng trắng thừa và so sánh khác biệt.',
        tags: ['đếm từ', 'ký tự', 'văn bản', 'định dạng', 'diff']
    },
    {
        id: 'num-to-text',
        catId: 'text',
        name: 'Đọc Số Tiền',
        icon: 'fas fa-coins',
        bgColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #4c1d95 100%)',
        iconColor: '#ffffff',
        desc: 'Biến dãy số tiền tệ thành chuỗi chữ tiếng Việt phục vụ viết hóa đơn kế toán.',
        tags: ['đọc số', 'số thành chữ', 'tiền tệ', 'hóa đơn']
    },
    {
        id: 'word-station',
        catId: 'text',
        name: 'Trạm Tìm Vần',
        icon: 'fas fa-pen-nib',
        bgColor: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7e22ce 100%)',
        iconColor: '#ffffff',
        desc: 'Gợi ý từ gieo vần, đảo chữ, nói lái thông minh hỗ trợ sáng tác thơ và viết rap.',
        tags: ['gieo vần', 'nói lái', 'thơ', 'rap', 'từ ngữ']
    },
    {
        id: 'kitu',
        catId: 'text',
        name: 'Ký Tự Đẹp',
        icon: 'fas fa-icons',
        bgColor: 'linear-gradient(135deg, #d946ef 0%, #c026d3 50%, #86198f 100%)',
        iconColor: '#ffffff',
        desc: 'Bộ sưu tập emoji, font chữ cách điệu và ký tự tạo tên game độc đáo.',
        tags: ['ký tự', 'emoji', 'font', 'tên game', 'icon đặc biệt']
    },
    {
        id: 'morse-code',
        catId: 'text',
        name: 'Mã Hóa Morse',
        icon: 'fas fa-ellipsis-h',
        bgColor: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
        iconColor: '#ffffff',
        desc: 'Biên dịch văn bản thành mã tín hiệu Morse chấm gạch và giải mã ngược lại.',
        tags: ['morse', 'mã morse', 'giải mã', 'tín hiệu']
    },
    {
        id: 'text-to-speech',
        catId: 'text',
        name: 'Đọc Văn Bản',
        icon: 'fas fa-volume-up',
        bgColor: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #9d174d 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi nội dung bài viết thành giọng đọc tự nhiên đa ngôn ngữ.',
        tags: ['tts', 'đọc văn bản', 'giọng nói', 'phát âm']
    },
    {
        id: 'itt',
        catId: 'text',
        name: 'Quét Chữ Ảnh',
        icon: 'fas fa-file-image',
        bgColor: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #881337 100%)',
        iconColor: '#ffffff',
        desc: 'Nhận dạng và trích xuất chữ viết (OCR) từ hình ảnh chụp tài liệu.',
        tags: ['ocr', 'quét chữ', 'ảnh sang text', 'nhận diện chữ']
    },

    // ---------------------------------------------------------------------
    // TỆP TIN & TÀI LIỆU (document)
    // ---------------------------------------------------------------------
    {
        id: 'pdf-tools',
        catId: 'document',
        name: 'PDF Studio',
        icon: 'fas fa-file-pdf',
        bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
        iconColor: '#ffffff',
        desc: 'Gộp nhiều file PDF, tách trang, đặt mật khẩu và chèn chữ ký số trực tiếp.',
        tags: ['pdf', 'gộp pdf', 'tách trang', 'chữ ký pdf']
    },
    {
        id: 'excel-unlocker',
        catId: 'document',
        name: 'Mở Khóa Excel',
        icon: 'fas fa-unlock-alt',
        bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        iconColor: '#ffffff',
        desc: 'Xóa bỏ mật khẩu khóa trang tính (Sheet Protection) nhanh chóng và an toàn.',
        tags: ['excel', 'mở khóa', 'unlock sheet', 'quên mật khẩu']
    },
    {
        id: 'excel-converter',
        catId: 'document',
        name: 'Đổi File Excel',
        icon: 'fas fa-file-excel',
        bgColor: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi bảng tính qua lại giữa các định dạng XLS, XLSX, CSV và JSON.',
        tags: ['excel', 'csv', 'chuyển đổi file', 'xlsx']
    },

    // ---------------------------------------------------------------------
    // ĐỜI SỐNG & SỨC KHỎE (life)
    // ---------------------------------------------------------------------
    {
        id: 'time-tools',
        catId: 'life',
        name: 'Thời Gian',
        icon: 'fas fa-stopwatch',
        bgColor: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
        iconColor: '#ffffff',
        desc: 'Đồng hồ đếm ngược, bấm giờ thể thao, tính khoảng cách ngày và số tuần.',
        tags: ['thời gian', 'bấm giờ', 'đếm ngược', 'khoảng cách ngày']
    },
    {
        id: 'health-calculator',
        catId: 'life',
        name: 'Sức Khỏe BMI',
        icon: 'fas fa-heartbeat',
        bgColor: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #be123c 100%)',
        iconColor: '#ffffff',
        desc: 'Tính chỉ số thể hình BMI, chuyển hóa BMR và mức tiêu hao Calo hằng ngày (TDEE).',
        tags: ['bmi', 'bmr', 'tdee', 'calo', 'cân nặng', 'sức khỏe']
    },
    {
        id: 'sleep-calculator',
        catId: 'life',
        name: 'Tính Giấc Ngủ',
        icon: 'fas fa-bed',
        bgColor: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #312e81 100%)',
        iconColor: '#ffffff',
        desc: 'Tính giờ đi ngủ và thức dậy tối ưu dựa theo chu kỳ sinh học 90 phút.',
        tags: ['ngủ', 'giấc ngủ', 'thức dậy', 'chu kỳ ngủ']
    },
    {
        id: 'choronotype',
        catId: 'life',
        name: 'Nhịp Sinh Học',
        icon: 'fas fa-hourglass-half',
        bgColor: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #3730a3 100%)',
        iconColor: '#ffffff',
        desc: 'Đo lường nhịp sinh học cá nhân để phân bổ thời gian làm việc hiệu quả nhất.',
        tags: ['nhịp sinh học', 'choronotype', 'năng suất', 'sức khỏe']
    },

    // ---------------------------------------------------------------------
    // CÔNG CỤ LẬP TRÌNH (dev)
    // ---------------------------------------------------------------------
    {
        id: 'json-format',
        catId: 'dev',
        name: 'Format JSON',
        icon: 'fas fa-code',
        bgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
        iconColor: '#ffffff',
        desc: 'Định dạng, nén gọn và kiểm tra cú pháp cấu trúc dữ liệu JSON.',
        tags: ['json', 'format', 'minify', 'kiểm tra json']
    },
    {
        id: 'regex-tester',
        catId: 'dev',
        name: 'Kiểm Thử Regex',
        icon: 'fas fa-spell-check',
        bgColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #172554 100%)',
        iconColor: '#ffffff',
        desc: 'Thử nghiệm biểu thức chính quy (Regular Expression) trực quan theo thời gian thực.',
        tags: ['regex', 'biểu thức', 'kiểm tra regex', 'pattern']
    },
    {
        id: 'base64-converter',
        catId: 'dev',
        name: 'Base64 Mã Hóa',
        icon: 'fas fa-shield-alt',
        bgColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #082f49 100%)',
        iconColor: '#ffffff',
        desc: 'Mã hóa và giải mã văn bản, chuỗi ký tự sang chuẩn Base64 Unicode.',
        tags: ['base64', 'mã hóa', 'giải mã', 'encode', 'decode']
    },
    {
        id: 'html-entity',
        catId: 'dev',
        name: 'HTML Entities',
        icon: 'fas fa-code-branch',
        bgColor: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #075985 100%)',
        iconColor: '#ffffff',
        desc: 'Chuyển đổi ký tự đặc biệt thành mã HTML an toàn tránh lỗi hiển thị và XSS.',
        tags: ['html', 'entity', 'encode', 'escape']
    },
    {
        id: 'fake-data-generator',
        catId: 'dev',
        name: 'Tạo Data Ảo',
        icon: 'fas fa-database',
        bgColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #164e63 100%)',
        iconColor: '#ffffff',
        desc: 'Tạo danh sách mẫu ngẫu nhiên gồm họ tên, địa chỉ, email và SĐT Việt Nam.',
        tags: ['mock data', 'dữ liệu ảo', 'fake data', 'test']
    },
    {
        id: 'meta-tag-generator',
        catId: 'dev',
        name: 'Thẻ Meta SEO',
        icon: 'fas fa-globe',
        bgColor: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #042f2e 100%)',
        iconColor: '#ffffff',
        desc: 'Tạo bộ thẻ Meta SEO chuẩn cho Google, Facebook Open Graph và Twitter Card.',
        tags: ['seo', 'meta tag', 'open graph', 'tiêu đề web']
    },
    {
        id: 'tree-viewer',
        catId: 'dev',
        name: 'Cây Dữ Liệu',
        icon: 'fas fa-sitemap',
        bgColor: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
        iconColor: '#ffffff',
        desc: 'Phân tích và hiển thị trực quan cấu trúc dạng phân cấp nhánh cây.',
        tags: ['tree', 'cấu trúc', 'json tree', 'viewer']
    },

    // ---------------------------------------------------------------------
    // HỆ THỐNG & PHẦN CỨNG (system)
    // ---------------------------------------------------------------------
    {
        id: 'lcd-test',
        catId: 'system',
        name: 'Test Màn Hình',
        icon: 'fas fa-desktop',
        bgColor: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0369a1 100%)',
        iconColor: '#ffffff',
        desc: 'Rà soát điểm ảnh chết (dead pixel), dải màu, tần số quét Hz và độ sáng tấm nền.',
        tags: ['lcd', 'màn hình', 'điểm chết', 'dead pixel', 'hz', 'fps']
    },
    {
        id: 'key-mouse-test',
        catId: 'system',
        name: 'Test Phím Chuột',
        icon: 'fas fa-keyboard',
        bgColor: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #3730a3 100%)',
        iconColor: '#ffffff',
        desc: 'Kiểm tra độ nhạy, chống kẹt phím (ghosting) và độ phản hồi của chuột.',
        tags: ['bàn phím', 'test phím', 'chuột', 'click', 'keyboard test']
    },
    {
        id: 'device-info',
        catId: 'system',
        name: 'Thông Số Máy',
        icon: 'fas fa-info-circle',
        bgColor: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #1e293b 100%)',
        iconColor: '#ffffff',
        desc: 'Xem cấu hình phần cứng, RAM, CPU, trình duyệt, độ phân giải và mức pin.',
        tags: ['thiết bị', 'thông tin máy', 'phần cứng', 'cấu hình']
    },
    {
        id: 'ip-checker',
        catId: 'system',
        name: 'Địa Chỉ IP',
        icon: 'fas fa-network-wired',
        bgColor: 'linear-gradient(135deg, #475569 0%, #334155 50%, #0f172a 100%)',
        iconColor: '#ffffff',
        desc: 'Tra cứu địa chỉ IP mạng công cộng, nhà cung cấp ISP và vị trí địa lý.',
        tags: ['ip', 'địa chỉ ip', 'mạng', 'isp', 'vị trí']
    },
    {
        id: 'password-generator',
        catId: 'system',
        name: 'Tạo Mật Khẩu',
        icon: 'fas fa-key',
        bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        iconColor: '#ffffff',
        desc: 'Sinh mật khẩu ngẫu nhiên độ bảo mật cao và đo lường độ an toàn ký tự.',
        tags: ['mật khẩu', 'password', 'bảo mật', 'tạo pass']
    },
    {
        id: 'ui-kit',
        catId: 'system',
        name: 'UI Kit Mẫu',
        icon: 'fas fa-cubes',
        bgColor: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #9f1239 100%)',
        iconColor: '#ffffff',
        desc: 'Thư viện tổng hợp nút bấm, form nhập liệu và các thành phần giao diện mẫu.',
        tags: ['ui', 'kit', 'components', 'giao diện']
    },

    // ---------------------------------------------------------------------
    // GIẢI TRÍ & TIỆN ÍCH KHÁC (entertainment)
    // ---------------------------------------------------------------------
    {
        id: 'led-matrix',
        catId: 'entertainment',
        name: 'Bảng Chữ LED',
        icon: 'fas fa-bolt',
        bgColor: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #713f12 100%)',
        iconColor: '#ffffff',
        desc: 'Màn hình LED chạy chữ phát sáng rực rỡ dành cho sự kiện, concert cổ vũ.',
        tags: ['led', 'bảng led', 'chữ chạy', 'cổ vũ', 'concert']
    },
    {
        id: 'note-pro',
        catId: 'entertainment',
        name: 'Ghi Chú Nhanh',
        icon: 'fas fa-sticky-note',
        bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #78350f 100%)',
        iconColor: '#ffffff',
        desc: 'Trình soạn thảo ghi chú nhanh, gọn gàng và lưu trữ dữ liệu an toàn trên máy.',
        tags: ['ghi chú', 'note', 'soạn thảo', 'lưu trữ']
    }
];