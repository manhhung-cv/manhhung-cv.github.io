// content.js

// Lắng nghe lệnh từ Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showResult") {
        showOverlay(request.data);
    }
});

function showOverlay(data) {
    // Xóa overlay cũ nếu có
    const old = document.getElementById('smiles-overlay-box');
    if (old) old.remove();

    // Tạo HTML cho hộp thông báo
    const div = document.createElement('div');
    div.id = 'smiles-overlay-box';
    
    // CSS trực tiếp trong JS để đảm bảo hiển thị đúng trên mọi web
    Object.assign(div.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: '999999',
        fontFamily: 'sans-serif',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid #ffb700',
        animation: 'slideIn 0.3s ease-out'
    });

    div.innerHTML = `
        <style>
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .sm-header { background: #ffb700; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; }
            .sm-title { font-weight: 800; color: #000; font-size: 14px; margin: 0; }
            .sm-close { cursor: pointer; font-weight: bold; font-size: 18px; color: #333; background: none; border: none; }
            .sm-body { padding: 15px; color: #333; font-size: 14px; }
            .sm-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .sm-val { font-weight: 700; }
            .sm-highlight { color: #2e7d32; font-size: 1.1em; }
            .sm-total { border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; color: #e65100; font-size: 1.2em; font-weight: 800; text-align: right; }
            .sm-note { font-size: 11px; color: #999; margin-top: 5px; text-align: center; }
        </style>
        
        <div class="sm-header">
            <h3 class="sm-title">Smiles Remit (Tỷ giá: ${data.rate})</h3>
            <button class="sm-close" id="sm-close-btn">&times;</button>
        </div>
        <div class="sm-body">
            <div class="sm-row"><span>Gửi đi:</span> <span class="sm-val">${data.jpy} JPY</span></div>
            <div class="sm-row"><span>Người nhận:</span> <span class="sm-val sm-highlight">${data.vnd} VND</span></div>
            <div class="sm-row"><span>Phí (+):</span> <span class="sm-val text-red">${data.fee} JPY</span></div>
            <div class="sm-row"><span>Điểm thưởng:</span> <span style="color:green">+${data.points} pts</span></div>
            
            <div class="sm-total">
                Tổng: ${data.total} JPY
            </div>
            <div class="sm-note">Click vào số tiền để copy</div>
        </div>
    `;

    document.body.appendChild(div);

    // Xử lý nút đóng
    document.getElementById('sm-close-btn').addEventListener('click', () => div.remove());

    // Click vào box để copy số tiền VND
    div.addEventListener('click', (e) => {
        if(e.target.id !== 'sm-close-btn') {
            navigator.clipboard.writeText(data.vnd.replace(/,/g, ''));
            const title = div.querySelector('.sm-title');
            const originalText = title.innerText;
            title.innerText = "Đã copy VND!";
            setTimeout(() => title.innerText = originalText, 1500);
        }
    });

    // Tự động tắt sau 15 giây
    setTimeout(() => { if(document.body.contains(div)) div.remove(); }, 15000);
}