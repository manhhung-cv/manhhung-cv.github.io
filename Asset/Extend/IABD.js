/**
 * Trình phát hiện Trình duyệt Trong Ứng dụng (v3.0)
 *
 * Tệp JavaScript này tự động phát hiện nếu trang web được xem
 * bên trong một trình duyệt trong ứng dụng (như Facebook, Messenger, Zalo)
 * và hiển thị một thông báo hướng dẫn toàn màn hình có hỗ trợ
 * Chế độ Sáng/Tối, làm mờ nền, và có thể đóng lại.
 *
 * Hướng dẫn sử dụng:
 * 1. Nhúng tệp này vào trang web của bạn, tốt nhất là trước thẻ đóng </body>:
 * <script src="path/to/inAppBrowserDetector.js" defer></script>
 *
 * 2. (QUAN TRỌNG - TÙY CHỌN) Để hiệu ứng 'làm mờ nền' hoạt động:
 * Bạn phải bọc toàn bộ nội dung trang của bạn trong một thẻ div
 * với ID là "page-content-wrapper".
 *
 * VÍ DỤ CẤU TRÚC HTML:
 * <body>
 * <div id="page-content-wrapper">
 * <!-- TOÀN BỘ NỘI DUNG TRANG CỦA BẠN (header, content, footer...) -->
 * <h1>Tiêu đề của tôi</h1>
 * <p>Nội dung trang...</p>
 * </div>
 *
 * <!-- Đặt script của bạn ở đây -->
 * <script src="path/to/inAppBrowserDetector.js" defer></script>
 * </body>
 *
 * Nếu bạn không thêm ID này, thông báo vẫn sẽ xuất hiện,
 * nhưng nền trang sẽ không bị mờ.
 */
(function() {
    "use strict";

    /**
     * Tự động chèn tất cả các kiểu CSS cần thiết vào <head> của trang.
     * Điều này đảm bảo script hoạt động mà không cần tệp .css bên ngoài.
     */
    function tiemCSSCanThiet() {
        // Kiểm tra xem CSS đã được tiêm chưa
        if (document.getElementById("in-app-detector-styles")) {
            return;
        }

        const cssStyles = `
            /* --- CÀI ĐẶT CƠ BẢN (Biến CSS) --- */
            :root {
                /* Chế độ Sáng (Mặc định) */
                --bg-color: #f0f2f5;
                --card-bg-color: #ffffff;
                --text-color: #1c1e21;
                --text-secondary-color: #606770;
                --primary-color: #1877f2; /* Xanh dương Facebook */
                --primary-text-color: #ffffff;
                --shadow-color: rgba(0, 0, 0, 0.1);
                --border-color: #ddd;

                /* Màu cho thông báo (Sáng) */
                --guide-bg-color: #ffffff;
                --guide-text-color: #1c1e21;
                --guide-header-bg: #f5f6f7;
                --guide-icon-bg: #e4e6eb;
                --guide-icon-color: #1c1e21;
            }

            /* Class làm mờ nội dung (nếu có #page-content-wrapper) */
            body.blurred #page-content-wrapper {
                filter: blur(4px);
                user-select: none;
                pointer-events: none;
                transition: filter 0.3s ease;
            }

            /* --- LỚP PHỦ VÀ THÔNG BÁO --- */
            #in-app-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 99997;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            #in-app-overlay.visible {
                opacity: 1;
                visibility: visible;
            }

            /* Cửa sổ hướng dẫn */
            #in-app-browser-guide {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background-color: var(--guide-bg-color);
                color: var(--guide-text-color);
                z-index: 99998;
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
                box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.2);
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s ease, color 0.3s ease;
                overflow: hidden;
                border-top: 1px solid var(--border-color);
                box-sizing: border-box;
            }

            #in-app-browser-guide.visible {
                transform: translateY(0);
            }
            
            #in-app-browser-guide * {
                box-sizing: border-box;
            }

            .guide-container {
                max-width: 600px;
                margin: 0 auto;
            }

            .guide-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                background-color: var(--guide-header-bg);
                border-bottom: 1px solid var(--border-color);
                transition: background-color 0.3s ease, border-color 0.3s ease;
            }

            .guide-header-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--guide-text-color);
            }

            .guide-close-btn {
                font-family: sans-serif;
                font-size: 1.5rem;
                font-weight: 600;
                color: #999;
                cursor: pointer;
                line-height: 1;
                padding: 4px;
                background: none;
                border: none;
            }
            .guide-close-btn:hover {
                color: #333;
            }

            .guide-content {
                padding: 24px 20px 32px 20px;
            }
            
            /* Các sélector được làm cụ thể để tránh xung đột CSS */
            #in-app-browser-guide p {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 1rem;
                line-height: 1.6;
                margin: 0 0 20px 0;
                color: var(--guide-text-color);
            }
            
            #in-app-browser-guide p strong {
                color: var(--primary-color);
                font-weight: 700;
            }

            .guide-step {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                font-size: 1rem;
                font-weight: 600;
            }
            
            .guide-step:last-child {
                margin-bottom: 0;
            }

            .guide-icon {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background-color: var(--guide-icon-bg);
                color: var(--guide-icon-color);
                margin-right: 16px;
                flex-shrink: 0;
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
            
            .guide-icon svg {
                width: 22px;
                height: 22px;
                stroke-width: 2.5;
            }

            /* * HỖ TRỢ CHẾ ĐỘ TỐI (DARK MODE) * */
            @media (prefers-color-scheme: dark) {
                :root {
                    /* Biến màu cho Chế độ Tối */
                    --bg-color: #18191a;
                    --card-bg-color: #242526;
                    --text-color: #e4e6eb;
                    --text-secondary-color: #b0b3b8;
                    --primary-color: #409cff;
                    --primary-text-color: #ffffff;
                    --shadow-color: rgba(0, 0, 0, 0.3);
                    --border-color: #3e4042;

                    /* Màu cho thông báo (Tối) */
                    --guide-bg-color: #242526;
                    --guide-text-color: #e4e6eb;
                    --guide-header-bg: #18191a;
                    --guide-icon-bg: #3e4042;
                    --guide-icon-color: #e4e6eb;
                }

                #in-app-browser-guide {
                    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.4);
                }

                .guide-close-btn {
                    color: #b0b3b8;
                }
                .guide-close-btn:hover {
                    color: #e4e6eb;
                }
            }
        `;

        // Tiêm CSS vào <head>
        const styleElement = document.createElement('style');
        styleElement.id = 'in-app-detector-styles';
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(cssStyles));
        document.head.appendChild(styleElement);

        // Tiêm font Inter (nếu cần)
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    /**
     * Kiểm tra xem có phải trình duyệt trong ứng dụng không.
     * @returns {string|null} Tên ứng dụng (ví dụ: 'Facebook') hoặc null.
     */
    function kiemTraTrinhDuyetTrongUngDung() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/FBAN|FBAV|FB_IAB|FB4A|FBDV/.test(userAgent)) {
            return "Facebook";
        }
        if (/Messenger|FBAV\/Messenger/.test(userAgent)) {
            return "Messenger";
        }
        if (/Instagram/.test(userAgent)) {
            return "Instagram";
        }
        if (/Zalo/.test(userAgent)) {
            return "Zalo";
        }
        if (/Twitter/.test(userAgent)) {
            return "Twitter";
        }
        // Các trình duyệt khác có thể được thêm vào đây
        
        // Kiểm tra chung cho WebViews trên iOS và Android

        /* * ĐÃ VÔ HIỆU HÓA THEO YÊU CẦU:
         * Bỏ qua 'iOS WebView' chung chung để không hiển thị thông báo
         * khi người dùng mở từ các ứng dụng như Mail, Gmail, Ghi chú...
         */
        // if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent)) {
        //     return "iOS WebView"; // Trình duyệt trong ứng dụng chung trên iOS
        // }

        if (/Android.* wv/i.test(userAgent)) {
            return "Android WebView"; // Trình duyệt trong ứng dụng chung trên Android
        }

        return null;
    }

    /**
     * Tạo và hiển thị cửa sổ hướng dẫn.
     * @param {string} tenUngDung - Tên ứng dụng (ví dụ: 'Facebook').
     */
    function taoCuaSoHuongDan(tenUngDung) {
        // Nếu đã có thông báo, không tạo thêm
        if (document.getElementById("in-app-browser-guide")) {
            return;
        }

        // 1. Tạo lớp phủ (Overlay)
        const overlay = document.createElement('div');
        overlay.id = 'in-app-overlay';
        document.body.appendChild(overlay);

        // 2. Tạo cửa sổ hướng dẫn (Modal)
        const guideModal = document.createElement('div');
        guideModal.id = 'in-app-browser-guide';
        guideModal.innerHTML = `
            <div class="guide-container">
                <div class="guide-header">
                    <span class="guide-header-title">Trải nghiệm tốt hơn</span>
                    <button class="guide-close-btn" aria-label="Đóng">&times;</button>
                </div>
                <div class="guide-content">
                    <p>Bạn đang dùng trình duyệt của <strong>${tenUngDung}</strong>.
                        Vui lòng mở bằng trình duyệt bên ngoài để có trải nghiệm tốt nhất.</p>
                    
                    <div class="guide-step">
                        <span class="guide-icon">
                            <!-- Icon 3 chấm -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </span>
                        <span>Bấm vào <strong>biểu tượng 3 chấm (⋮)</strong> ở góc.</span>
                    </div>
                    
                    <div class="guide-step">
                        <span class="guide-icon">
                            <!-- Icon mở bên ngoài -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </span>
                        <span>Chọn "<strong>Mở bằng trình duyệt bên ngoài</strong>".</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(guideModal);

        // 3. Hàm đóng thông báo
        function dongThongBao() {
            if (guideModal) {
                guideModal.classList.remove('visible');
            }
            if (overlay) {
                overlay.classList.remove('visible');
            }
            document.body.classList.remove('blurred');
            
            // Xóa hẳn khỏi DOM sau khi hiệu ứng kết thúc
            setTimeout(() => {
                if (guideModal && guideModal.parentNode) {
                    guideModal.parentNode.removeChild(guideModal);
                }
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 400); // 400ms khớp với thời gian transition
        }

        // 4. Gán sự kiện cho nút đóng
        const nutDong = guideModal.querySelector('.guide-close-btn');
        if (nutDong) {
            nutDong.addEventListener('click', dongThongBao);
        }
        // Cũng có thể đóng khi bấm vào overlay
        overlay.addEventListener('click', dongThongBao);

        // 5. Hiển thị thông báo (sau 1 chút delay để CSS transition hoạt động)
        setTimeout(() => {
            document.body.classList.add('blurred');
            overlay.classList.add('visible');
            guideModal.classList.add('visible');
        }, 50); // Delay 50ms
    }

    // --- CHẠY CHÍNH ---

    // 1. Tiêm CSS ngay lập tức
    // Phải làm điều này bên ngoài 'DOMContentLoaded'
    // vì CSS cần phải có sẵn ngay khi script chạy.
    tiemCSSCanThiet();

    // 2. Chạy logic phát hiện
    const tenUngDung = kiemTraTrinhDuyetTrongUngDung();
    if (tenUngDung) {
        // Chờ DOM sẵn sàng hoàn toàn (để thêm vào <body>)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => taoCuaSoHuongDan(tenUngDung));
        } else {
            // DOM đã sẵn sàng
            taoCuaSoHuongDan(tenUngDung);
        }
    }

})();


