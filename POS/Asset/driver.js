// ============================================================
// 1. KHỞI TẠO & CẤU HÌNH
// ============================================================
const driverObj = window.driver.js.driver;

const config = {
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'Đã hiểu',
    nextBtnText: 'Tiếp theo ▶',
    prevBtnText: '◀ Quay lại',
    progressText: 'Bước {{current}} / {{total}}',
    // Tùy chỉnh màu sắc (nếu cần)
    popoverClass: 'driverjs-theme-hunqpos'
};

// ============================================================
// 2. KỊCH BẢN CHI TIẾT CHO DỊCH VỤ (SALON/SPA/BARBER)
// ============================================================

const stepsPOS = [
    // --- Phần 1: Tổng quan ---
    {
        element: '#view-pos',
        popover: {
            title: '👋 Xin chào!',
            description: 'Đây là giao diện <b>Tạo đơn & Tính tiền</b>. Hãy cùng đi qua quy trình phục vụ một khách hàng nhé.',
            position: 'mid-center'
        }
    },
    // --- Phần 2: Chọn khách & Đa nhiệm ---
    {
        element: '#h-CreateNewOrder',
        popover: {
            title: '1. Phục vụ nhiều khách',
            description: 'Salon thường đông khách cùng lúc. Bấm dấu <b>(+)</b> để tạo phiếu mới cho từng khách (Ví dụ: Tab 1 cho khách A đang cắt, Tab 2 cho khách B đang chờ gội).',
            position: 'bottom'
        }
    },
    {
        element: '.bg-blue-50.border-b.border-blue-100', // Chọn vùng chứa tên khách
        popover: {
            title: '2. Chọn Khách hàng',
            description: 'Rất quan trọng! Bấm vào đây để chọn <b>Khách quen</b> (để tích điểm/xem lịch sử làm tóc) hoặc tạo hồ sơ khách mới.',
            position: 'left'
        }
    },
    // --- Phần 3: Tìm kiếm & Chọn dịch vụ ---
    {
        element: '#pos-search-input',
        popover: {
            title: '3. Tìm dịch vụ',
            description: 'Nhập tên dịch vụ (VD: "Cắt layer", "Nhuộm", "Gội"...) để tìm nhanh.',
            position: 'bottom'
        }
    },
    {
        element: 'button[onclick="toggleAddProductModal()"]',
        popover: {
            title: 'Thêm dịch vụ nhanh',
            description: 'Nếu dịch vụ chưa có trong hệ thống, bấm nút này để tạo nhanh dịch vụ mới ngay lập tức.',
            position: 'bottom'
        }
    },
    {
        element: '#pos-categories',
        popover: {
            title: '4. Nhóm dịch vụ',
            description: 'Lọc nhanh theo nhóm: <i>Cắt, Uốn, Nhuộm, Gội dưỡng sinh, Sản phẩm...</i>',
            position: 'bottom'
        }
    },
    {
        element: '#products-grid',
        popover: {
            title: '5. Chọn dịch vụ',
            description: 'Bấm vào thẻ dịch vụ để thêm vào phiếu. <br><i>Mẹo: Bấm nhiều lần để tăng số lượng (với sản phẩm bán kèm).</i>',
            position: 'top'
        }
    },
    // --- Phần 4: Giỏ hàng & Thanh toán ---
    {
        element: '#sidebar-cart',
        popover: {
            title: '6. Phiếu dịch vụ',
            description: 'Danh sách các dịch vụ khách đang làm. Bạn có thể sửa giá (nếu giảm giá riêng) hoặc xóa bớt tại đây.',
            position: 'left'
        }
    },
    {
        element: '#pos-order-note',
        popover: {
            title: '7. Ghi chú cho thợ',
            description: 'Ghi chú quan trọng (VD: "Hẹ Hẹ", "HunqPOS"...).',
            position: 'left'
        }
    },
    {
        element: '.flex.items-center.justify-between.cursor-pointer', // Icon ưu đãi (dựa vào class font-awesome)
        popover: {
            title: '8. Ưu đãi & Tích điểm',
            description: 'Bấm vào đây để: <br>- Nhập mã Voucher.<br>- Giảm giá trực tiếp.<br>- <b>Trừ điểm tích lũy</b> của khách.',
            position: 'left'
        }
    },
    {
        element: '#btn-checkout',
        popover: {
            title: '9. Thanh toán',
            description: 'Hoàn tất dịch vụ. Hệ thống sẽ in hóa đơn và hiện mã QR chuyển khoản.',
            position: 'top'
        }
    }
];

// --- CÁC TAB KHÁC (GIỮ NGUYÊN HOẶC RÚT GỌN) ---
const stepsInventory = [
    { element: '#view-inventory h2', popover: { title: 'Kho & Dịch vụ', description: 'Quản lý danh sách dịch vụ, mỹ phẩm bán kèm và tồn kho.', position: 'bottom' } },
    { element: 'button[onclick="openProductModal()"]', popover: { title: 'Thêm mới', description: 'Tạo dịch vụ hoặc nhập hàng mới.', position: 'left' } },
    { element: '#inv-search', popover: { title: 'Tra cứu', description: 'Tìm kiếm để sửa giá dịch vụ.', position: 'bottom' } },

];

const stepsHistory = [
    { element: '#view-history h2', popover: { title: 'Lịch sử giao dịch', description: 'Xem lại doanh thu và các đơn đã làm.', position: 'bottom' } },
    { element: '#history-search', popover: { title: 'Tìm lại đơn', description: 'Nhập tên khách hoặc SĐT để tìm lại bill cũ.', position: 'bottom' } },
    { element: '#history-list-pc', popover: { title: 'Toàn bộ lịch sử giao dịch', description: 'Các thông tin sẽ nằm ở đây.', position: 'bottom' } },

];

const stepsCustomers = [
    { element: '#view-customers h2', popover: { title: 'CSKH', description: 'Danh sách khách hàng thân thiết.', position: 'bottom' } },
    { element: 'button[onclick="toggleCustomerModal()"]', popover: { title: 'Thêm khách', description: 'Tạo hồ sơ khách hàng mới.', position: 'left' } }
];

// ============================================================
// 3. HÀM KÍCH HOẠT (LOGIC THÔNG MINH)
// ============================================================

function createDriver(steps) {
    return driverObj({
        ...config,
        steps: steps
    });
}

window.startSmartTour = function () {
    console.log("🚀 Bắt đầu hướng dẫn...");

    // Kiểm tra tab nào đang hiển thị (không có class hidden)
    const isPos = !document.getElementById('view-pos').classList.contains('hidden');
    const isInventory = !document.getElementById('view-inventory').classList.contains('hidden');
    const isHistory = !document.getElementById('view-history').classList.contains('hidden');
    const isCustomers = !document.getElementById('view-customers').classList.contains('hidden');

    let currentSteps = stepsPOS; // Mặc định là POS

    if (isPos) {
        currentSteps = stepsPOS;
    } else if (isInventory) {
        currentSteps = stepsInventory;
    } else if (isHistory) {
        currentSteps = stepsHistory;
    } else if (isCustomers) {
        currentSteps = stepsCustomers;
    }

    // Chạy Driver sau 300ms để đảm bảo UI ổn định
    setTimeout(() => {
        const driver = createDriver(currentSteps);
        driver.drive();
    }, 300);
};