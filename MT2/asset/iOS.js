/**
 * PWA Force Add to Home Screen - CHỈ DÀNH CHO IPHONE/IOS
 * Chặn: Yêu cầu Safari. Nếu Chrome/App khác -> Yêu cầu Copy Link.
 * Cách dùng: Nhúng <script src="path/to/pwa-guide.js"></script> vào cuối thẻ body
 */

(function() {
    const PWAManager = {
        // 1. CSS cho màn hình Full-screen
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --pwa-primary: #007AFF;
                    --pwa-danger: #FF3B30;
                    --pwa-bg: #ffffff;
                    --pwa-text: #1c1c1e;
                    --pwa-text-sec: #8e8e93;
                }
                .pwa-fullscreen {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: var(--pwa-bg); z-index: 9999999; 
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-family: -apple-system, system-ui, sans-serif; box-sizing: border-box;
                    padding: 24px; text-align: center; overscroll-behavior: none;
                }
                .pwa-icon-box {
                    width: 80px; height: 80px; background: #f2f2f7; border-radius: 18px;
                    margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;
                    color: var(--pwa-primary);
                }
                .pwa-icon-box.danger {
                    background: #FFE5E5; color: var(--pwa-danger);
                }
                .pwa-title { font-size: 22px; font-weight: 700; color: var(--pwa-text); margin: 0 0 10px; }
                .pwa-desc { font-size: 15px; color: var(--pwa-text-sec); margin: 0 0 25px; line-height: 1.5; max-width: 320px; }
                .pwa-steps { width: 100%; max-width: 320px; text-align: left; padding: 20px; border-radius: 16px; background: #f2f2f7; box-sizing: border-box; }
                .pwa-step { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
                .pwa-step:last-child { margin-bottom: 0; }
                .pwa-s-icon { 
                    width: 36px; height: 36px; background: #ffffff; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .pwa-s-text { font-size: 15px; color: var(--pwa-text); margin: 0; }
                .pwa-s-text strong { color: var(--pwa-primary); }
                .pwa-copy-box { background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e5e5ea; word-break: break-all; font-size: 14px; margin-bottom: 15px; text-align: center; color: var(--pwa-primary); }
                .pwa-btn { width: 100%; background: var(--pwa-primary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; transition: opacity 0.2s; }
                .pwa-btn:active { opacity: 0.7; }
                .pwa-btn.success { background: #34C759; }
                body.pwa-locked { overflow: hidden !important; }
            `;
            document.head.appendChild(style);
        },

        // 2. Tạo HTML chèn toàn bộ màn hình
        createElements(isSafari) {
            const host = document.createElement('div');
            host.id = 'pwa-guide-container';
            
            // Giao diện nếu ĐÚNG là Safari
            const safariUI = `
                <div class="pwa-icon-box">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                </div>
                <h3 class="pwa-title">Yêu cầu cài đặt</h3>
                <p class="pwa-desc">Bạn phải thêm ứng dụng này vào Màn hình chính để tiếp tục sử dụng.</p>
                
                <div class="pwa-steps">
                    <div class="pwa-step">
                        <div class="pwa-s-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"></path>
                                <polyline points="16 6 12 2 8 6"></polyline>
                                <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <p class="pwa-s-text">1. Nhấn nút <strong>Chia sẻ</strong> ở dưới cùng màn hình Safari.</p>
                    </div>
                    <div class="pwa-step">
                        <div class="pwa-s-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                        </div>
                        <p class="pwa-s-text">2. Chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen).</p>
                    </div>
                    <div class="pwa-step">
                        <div class="pwa-s-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <p class="pwa-s-text">3. Mở ứng dụng từ màn hình chính của bạn.</p>
                    </div>
                </div>
            `;

            // Giao diện nếu KHÔNG PHẢI Safari (Chrome, Edge, Facebook Browser...)
            const nonSafariUI = `
                <div class="pwa-icon-box danger">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 class="pwa-title">Chỉ hỗ trợ Safari</h3>
                <p class="pwa-desc">Cài đặt ứng dụng trên iPhone <strong>chỉ hoạt động qua Safari</strong>. Bạn đang mở bằng trình duyệt khác.</p>
                
                <div class="pwa-steps">
                    <p class="pwa-s-text" style="text-align: center; margin-bottom: 12px;">Vui lòng sao chép liên kết dưới đây và mở lại bằng <strong>Safari</strong>:</p>
                    <div class="pwa-copy-box" id="pwa-current-url">
                        ${window.location.href}
                    </div>
                    <button class="pwa-btn" id="pwa-copy-btn">Sao chép liên kết</button>
                </div>
            `;

            host.innerHTML = `
                <div class="pwa-fullscreen">
                    ${isSafari ? safariUI : nonSafariUI}
                </div>
            `;
            
            document.body.appendChild(host);
            document.body.classList.add('pwa-locked');

            // Gán sự kiện cho nút Copy nếu ở giao diện Non-Safari
            if (!isSafari) {
                const copyBtn = document.getElementById('pwa-copy-btn');
                copyBtn.addEventListener('click', () => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url).then(() => {
                        copyBtn.textContent = 'Đã sao chép! Mở Safari ngay';
                        copyBtn.classList.add('success');
                        setTimeout(() => {
                            copyBtn.textContent = 'Sao chép liên kết';
                            copyBtn.classList.remove('success');
                        }, 3000);
                    }).catch(() => {
                        copyBtn.textContent = 'Lỗi! Hãy copy thủ công';
                    });
                });
            }
        },

        init() {
            const ua = navigator.userAgent;

            // 1. Kiểm tra thiết bị iOS (iPhone/iPad)
            const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            // 2. Kiểm tra Standalone (Đã lưu màn hình chính chưa?)
            const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

            // 3. Phân biệt Safari xịn và các trình duyệt Fake/App in-app (Chrome iOS có "CriOS", Firefox có "FxiOS"...)
            const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury|EdgiOS|Instagram|FBAV|FBAN/i.test(ua);

            // 4. Nếu là iOS VÀ Chưa cài đặt -> Hiển thị màn hình chặn
            if (isIOS && !isStandalone) {
                this.injectStyles();
                this.createElements(isSafari); // Truyền trạng thái isSafari để render UI phù hợp
            }
        }
    };

    // Tự chạy khi trang load xong
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        PWAManager.init();
    } else {
        window.addEventListener('load', () => PWAManager.init());
    }
})();