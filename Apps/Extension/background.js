// background.js

// 1. Hàm tính phí (Copy logic từ popup)
function getFee(amount) {
    if (amount <= 0) return 0;
    if (amount <= 10000) return 380;
    if (amount <= 50000) return 450;
    if (amount <= 100000) return 760;
    if (amount <= 300000) return 980;
    if (amount <= 1000000) return 1700;
    return 0;
}

function getPoints(amount) {
    if (amount <= 0) return 0;
    if (amount <= 10000) return 10;
    if (amount <= 50000) return 20;
    if (amount <= 100000) return 50;
    if (amount <= 300000) return 100;
    return 150;
}

function formatNumber(num) { 
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
}

// 2. Tạo menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "calcSmiles",
        title: "Tính gửi ¥%s qua Smiles", 
        contexts: ["selection"]
    });
});

// 3. Xử lý khi click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "calcSmiles") {
        const rawText = info.selectionText;
        const amountJPY = parseInt(rawText.replace(/\D/g, '')); // Lọc lấy số

        if (!amountJPY) return;

        // Lấy tỷ giá từ bộ nhớ
        chrome.storage.local.get(['savedRate'], (result) => {
            const rate = result.savedRate || 165.5; // Mặc định nếu chưa có tỷ giá
            
            // Tính toán (Mặc định tính theo chế độ: Gửi tiền gốc + Phí)
            const fee = getFee(amountJPY);
            const points = getPoints(amountJPY);
            const receiveVND = Math.floor(amountJPY * rate);
            const totalPay = amountJPY + fee;

            // Gửi kết quả xuống Content Script để hiển thị
            chrome.tabs.sendMessage(tab.id, {
                action: "showResult",
                data: {
                    jpy: formatNumber(amountJPY),
                    vnd: formatNumber(receiveVND),
                    fee: formatNumber(fee),
                    points: points,
                    total: formatNumber(totalPay),
                    rate: rate
                }
            }).catch(err => console.log("Lỗi gửi message (có thể do chưa reload trang):", err));
        });
    }
});