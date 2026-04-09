/**
 * PWA Add to Home Screen Guide - Single File Solution
 * Cách dùng: Nhúng <script src="path/to/pwa-guide.js"></script> vào cuối thẻ body
 */

(function() {
    const PWAManager = {
        storageKey: 'pwa_guide_viewed',

        // 1. Toàn bộ CSS được nén vào JS để tự inject
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --pwa-primary: #007AFF;
                    --pwa-bg: #ffffff;
                    --pwa-text: #1c1c1e;
                    --pwa-text-sec: #8e8e93;
                }
                .pwa-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
                    z-index: 999998; display: none; opacity: 0; transition: opacity 0.3s ease;
                }
                .pwa-modal {
                    position: fixed; bottom: 20px; left: 50%;
                    transform: translateX(-50%) translateY(100%);
                    width: 90%; max-width: 400px; background: var(--pwa-bg);
                    border-radius: 20px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    z-index: 999999; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    font-family: -apple-system, system-ui, sans-serif; box-sizing: border-box;
                }
                .pwa-overlay.active { display: block; opacity: 1; }
                .pwa-modal.active { transform: translateX(-50%) translateY(0); }
                .pwa-header { text-align: center; margin-bottom: 20px; }
                .pwa-icon-box {
                    width: 60px; height: 60px; background: #f2f2f7; border-radius: 14px;
                    margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;
                    color: var(--pwa-primary);
                }
                .pwa-title { font-size: 19px; font-weight: 700; color: var(--pwa-text); margin: 0 0 6px; }
                .pwa-desc { font-size: 14px; color: var(--pwa-text-sec); margin: 0; line-height: 1.4; }
                .pwa-steps { border-top: 1px solid #f2f2f7; padding-top: 16px; margin-top: 16px; }
                .pwa-step { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
                .pwa-s-icon { 
                    width: 32px; height: 32px; background: #f2f2f7; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .pwa-s-text { font-size: 14px; color: var(--pwa-text); margin: 0; }
                .pwa-s-text strong { color: var(--pwa-primary); }
                .pwa-btn {
                    width: 100%; background: var(--pwa-text); color: #fff; border: none;
                    padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 600;
                    cursor: pointer; margin-top: 8px;
                }
                .pwa-close-x {
                    position: absolute; top: 12px; right: 12px; background: none;
                    border: none; color: var(--pwa-text-sec); cursor: pointer;
                }
                body.pwa-locked { overflow: hidden; }
            `;
            document.head.appendChild(style);
        },

        // 2. Tạo HTML và gắn vào body
        createElements() {
            const host = document.createElement('div');
            host.id = 'pwa-guide-container';
            host.innerHTML = `
                <div id="pwa-overlay" class="pwa-overlay"></div>
                <div id="pwa-modal" class="pwa-modal">
                    <button class="pwa-close-x" id="pwa-close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="pwa-header">
                        <div class="pwa-icon-box">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                        </div>
                        <h3 class="pwa-title">Thêm vào màn hình</h3>
                        <p class="pwa-desc">Cài đặt ứng dụng để truy cập nhanh và nhận thông báo mới nhất.</p>
                    </div>
                    <div class="pwa-steps">
                        <div class="pwa-step">
                            <div class="pwa-s-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2">
                                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"></path>
                                    <polyline points="16 6 12 2 8 6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <p class="pwa-s-text">1. Nhấn nút <strong>Chia sẻ</strong> ở dưới cùng.</p>
                        </div>
                        <div class="pwa-step">
                            <div class="pwa-s-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                            </div>
                            <p class="pwa-s-text">2. Chọn <strong>Thêm vào MH chính</strong>.</p>
                        </div>
                    </div>
                    <button class="pwa-btn" id="pwa-ok">Tôi đã hiểu</button>
                </div>
            `;
            document.body.appendChild(host);

            // Gán sự kiện
            document.getElementById('pwa-close').onclick = () => this.hide();
            document.getElementById('pwa-ok').onclick = () => this.dismiss();
            document.getElementById('pwa-overlay').onclick = () => this.hide();
        },

        init() {
            this.injectStyles();
            this.createElements();

            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isStandalone = window.navigator.standalone === true;

            // Kiểm tra hiển thị tự động
            if (isIOS && isSafari && !isStandalone) {
                if (!localStorage.getItem(this.storageKey)) {
                    setTimeout(() => this.show(), 1500);
                }
            }
        },

        show() {
            document.getElementById('pwa-overlay').classList.add('active');
            document.getElementById('pwa-modal').classList.add('active');
            document.body.classList.add('pwa-locked');
        },

        hide() {
            document.getElementById('pwa-modal').classList.remove('active');
            setTimeout(() => {
                document.getElementById('pwa-overlay').classList.remove('active');
                document.body.classList.remove('pwa-locked');
            }, 300);
        },

        dismiss() {
            localStorage.setItem(this.storageKey, 'true');
            this.hide();
        }
    };

    // Export hàm ra window để dùng thủ công
    window.AddIcon = () => PWAManager.show();

    // Tự chạy khi trang load xong
    if (document.readyState === 'complete') {
        PWAManager.init();
    } else {
        window.addEventListener('load', () => PWAManager.init());
    }
})();