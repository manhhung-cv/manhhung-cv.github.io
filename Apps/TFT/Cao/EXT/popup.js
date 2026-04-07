document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('status').innerText = "Đang khởi chạy chạy ngầm...\nBạn có thể đóng bảng này và làm việc khác.";
    
    // Gửi lệnh sang background.js để bắt đầu
    chrome.runtime.sendMessage({ action: "startScraping" });
});