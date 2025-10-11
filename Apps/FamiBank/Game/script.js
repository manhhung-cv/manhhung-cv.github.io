document.addEventListener('DOMContentLoaded', () => {

    // --- Hệ Thống Lượt Chơi ---
    const turnCountSpan = document.getElementById('turn-count');
    const buyTurnsBtn = document.getElementById('buy-turns-btn');
    let currentTurns = 5;

    // Cập nhật hiển thị lượt chơi
    function updateTurnDisplay() {
        turnCountSpan.textContent = currentTurns;
    }

    // Kiểm tra và trừ lượt chơi
    function useTurn() {
        if (currentTurns > 0) {
            currentTurns--;
            updateTurnDisplay();
            return true;
        } else {
            alert("Bạn đã hết lượt chơi. Vui lòng mua thêm!");
            return false;
        }
    }

    // Mua thêm lượt
    buyTurnsBtn.addEventListener('click', () => {
        // Đây là ví dụ đơn giản. Trong thực tế, bạn cần tích hợp cổng thanh toán.
        currentTurns += 5;
        updateTurnDisplay();
        alert("Bạn đã mua thành công 5 lượt chơi!");
    });

    // --- Trò Chơi 1: Rút Lì Xì ---
    const luckyMoneyBags = document.querySelectorAll('.lucky-money-bag');
    const luckyMoneyResult = document.getElementById('lucky-money-result');
    const luckyMoneyPrizes = ["10.000đ", "20.000đ", "50.000đ", "Chúc bạn may mắn", "100.000đ", "Thêm 1 lượt chơi"];

    luckyMoneyBags.forEach(bag => {
        bag.addEventListener('click', () => {
            if (useTurn()) {
                const randomPrize = luckyMoneyPrizes[Math.floor(Math.random() * luckyMoneyPrizes.length)];
                luckyMoneyResult.textContent = `Bạn đã rút được: ${randomPrize}`;

                if (randomPrize === "Thêm 1 lượt chơi") {
                    currentTurns++;
                    updateTurnDisplay();
                }
            }
        });
    });

    // --- Trò Chơi 2: Chọn Hộp Quà ---
    const gifts = document.querySelectorAll('.gift');
    const giftBoxResult = document.getElementById('gift-box-result');
    
    gifts.forEach(gift => {
        gift.addEventListener('click', (e) => {
             if (useTurn()) {
                // Thêm class 'opened' để thay đổi giao diện hộp quà đã mở
                e.target.classList.add('opened');
                const prize = e.target.getAttribute('data-gift');
                giftBoxResult.textContent = `Bạn đã nhận được: ${prize}`;
                
                // Vô hiệu hóa các hộp quà khác sau khi đã chọn
                gifts.forEach(g => g.style.pointerEvents = 'none');
             }
        });
    });

    // --- Trò Chơi 3: Vòng Quay May Mắn ---
    const wheel = document.querySelector('.wheel');
    const spinBtn = document.getElementById('spin-btn');
    const spinResult = document.getElementById('spin-result');
    const spinPrizes = ["Mất Lượt", "50k", "20k", "100k", "Thêm Lượt", "5k"];
    
    spinBtn.addEventListener('click', () => {
        if (useTurn()) {
            // Ngăn người dùng nhấn quay nhiều lần
            spinBtn.style.pointerEvents = 'none';

            // Tính góc quay ngẫu nhiên
            const randomDegree = Math.floor(Math.random() * 360) + 360 * 5; // Quay ít nhất 5 vòng
            wheel.style.transform = `rotate(${randomDegree}deg)`;
            
            // Xử lý kết quả sau khi vòng quay dừng
            setTimeout(() => {
                const actualDegree = randomDegree % 360;
                const prizeIndex = Math.floor(actualDegree / 60); // 360/6 phần
                const prize = spinPrizes[prizeIndex];

                spinResult.textContent = `Kết quả: ${prize}`;
                 if (prize === "Thêm Lượt") {
                    currentTurns++;
                    updateTurnDisplay();
                }
                 spinBtn.style.pointerEvents = 'auto'; // Cho phép quay lại
            }, 4000); // 4 giây, khớp với thời gian transition của CSS
        }
    });
});