/**
 * PWA Force Add to Home Screen - CHỈ DÀNH CHO IPHONE/IOS
 * Tích hợp: Nhận diện In-App, Video PiP (đã fix lỗi source), Icon chuẩn iOS, Bố cục tối ưu.
 */

(function() {
    const PWAManager = {
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --pwa-primary: #0f172a;
                    --pwa-danger: #ef4444;
                    --pwa-warning: #f59e0b;
                    --pwa-bg: #f8fafc;
                    --pwa-text: #0f172a;
                    --pwa-text-sec: #64748b;
                }
                .pwa-fullscreen {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: var(--pwa-bg); z-index: 9999999; 
                    display: flex; flex-direction: column; align-items: center; 
                    justify-content: flex-start;
                    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; box-sizing: border-box;
                    padding: 16px; 
                    padding-top: calc(20px + env(safe-area-inset-top, 0px));
                    text-align: center; overscroll-behavior: none;
                }
                .pwa-icon-box {
                    width: 48px; height: 48px; background: #ffffff; border-radius: 14px;
                    margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;
                    color: var(--pwa-primary); box-shadow: 0 4px 15px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
                }
                .pwa-title { font-size: 18px; font-weight: 800; color: var(--pwa-text); margin: 0 0 4px; letter-spacing: -0.5px; }
                .pwa-desc { font-size: 12px; color: var(--pwa-text-sec); margin: 0 0 12px; line-height: 1.4; max-width: 280px; font-weight: 500; }
                
                /* VIDEO CONTAINER STYLES */
                .pwa-video-card {
                    width: 100%; max-width: 280px; background: #000; border-radius: 14px; 
                    margin-bottom: 12px; position: relative; overflow: hidden;
                    aspect-ratio: 16 / 9; box-shadow: 0 8px 20px -8px rgba(0,0,0,0.15);
                }
                .pwa-video-card video { width: 100%; height: 100%; object-fit: cover; }
                .pwa-video-overlay {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.4);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: white; transition: opacity 0.3s; cursor: pointer;
                }
                .pwa-video-overlay i { font-size: 28px; margin-bottom: 4px; }
                .pwa-video-overlay span { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

                /* STEPS & IOS ICONS STYLES */
                .pwa-steps { width: 100%; max-width: 300px; text-align: left; padding: 14px 16px; border-radius: 16px; background: #ffffff; border: 1px solid #f1f5f9; box-sizing: border-box; margin-bottom: 14px; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03); }
                .pwa-step { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .pwa-step:last-child { margin-bottom: 0; }
                .pwa-s-icon { 
                    width: 32px; height: 32px; background: #ffffff; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #f8fafc;
                }
                .pwa-s-text { font-size: 11.5px; color: var(--pwa-text-sec); margin: 0; line-height: 1.4; }
                .pwa-s-text strong { color: var(--pwa-text); font-weight: 800; }
                
                .pwa-btn { width: 100%; max-width: 300px; background: var(--pwa-primary); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; box-shadow: 0 8px 16px -4px rgba(15,23,42,0.2); }
                .pwa-btn:active { transform: scale(0.97); }

                /* IN-APP / NON-SAFARI SPECIFIC */
                .pwa-icon-box.danger { background: #fef2f2; color: var(--pwa-danger); border-color: #fee2e2; }
                .pwa-icon-box.warning { background: #fffbeb; color: var(--pwa-warning); border-color: #fef3c7; }
                .pwa-copy-box { background: #f8fafc; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; word-break: break-all; font-size: 12px; margin-bottom: 12px; text-align: center; color: var(--pwa-text-sec); font-family: monospace; }
                
                body.pwa-locked { overflow: hidden !important; }
            `;
            document.head.appendChild(style);
        },

        createElements(state) {
            const host = document.createElement('div');
            host.id = 'pwa-guide-container';
            let content = '';

            if (state === 'in_app') {
                content = `
                    <div class="pwa-icon-box warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <h3 class="pwa-title">Trình duyệt hạn chế</h3>
                    <p class="pwa-desc">Bạn đang mở ứng dụng trong trình duyệt nội bộ của mạng xã hội.</p>
                    <div class="pwa-steps">
                        <p class="pwa-s-text" style="text-align: center; font-size: 13px;">Nhấn vào biểu tượng <strong>Ba chấm (...)</strong> hoặc <strong>Mũi tên</strong> và chọn:<br><br><strong style="color: #0f172a; font-size: 14px;">"Mở bằng trình duyệt"</strong><br>hoặc <strong>"Open in Safari"</strong>.</p>
                    </div>
                `;
            } else if (state === 'non_safari') {
                content = `
                    <div class="pwa-icon-box danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <h3 class="pwa-title">Sử dụng Safari</h3>
                    <p class="pwa-desc">Để cài đặt ứng dụng, bạn cần sử dụng trình duyệt Safari gốc trên iPhone.</p>
                    <div class="pwa-steps">
                        <p class="pwa-s-text" style="text-align: center; margin-bottom: 10px;">Sao chép liên kết và dán vào <strong>Safari</strong>:</p>
                        <div class="pwa-copy-box" id="pwa-current-url">${window.location.href}</div>
                    </div>
                    <button class="pwa-btn" id="pwa-copy-btn">Sao chép liên kết</button>
                `;
            } else if (state === 'safari') {
                content = `
                    <div class="pwa-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </div>
                    <h3 class="pwa-title">Cài đặt ứng dụng</h3>
                    <p class="pwa-desc">Xem video hoặc làm theo 3 bước dưới đây.</p>
                    
                    <div class="pwa-video-card" id="pwa-video-trigger">
                        <video id="pwa-instruction-video" playsinline webkit-playsinline preload="metadata" poster="./asset/poster.jpg">
                            <source src="./asset/guide.mp4" type="video/mp4">
                            <p>Trình duyệt không hỗ trợ video.</p>
                        </video>
                        <div class="pwa-video-overlay" id="pwa-video-overlay">
                            <i class="fa-solid fa-circle-play"></i>
                            <span>Xem video hướng dẫn (PiP)</span>
                        </div>
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
                            <p class="pwa-s-text">Nhấn nút <strong>Chia sẻ</strong> bên dưới.</p>
                        </div>
                        <div class="pwa-step">
                            <div class="pwa-s-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                            </div>
                            <p class="pwa-s-text">Vuốt lên, tìm & chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen).</p>
                        </div>
                        <div class="pwa-step">
                            <div class="pwa-s-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <p class="pwa-s-text">Nhấn nút <strong>Thêm</strong> ở góc trên bên phải màn hình.</p>
                        </div>
                    </div>

                    <button class="pwa-btn" id="pwa-share-btn">Hoặc nhấn vào đây để cài đặt</button>
                `;
            }

            host.innerHTML = `<div class="pwa-fullscreen">${content}</div>`;
            document.body.appendChild(host);
            document.body.classList.add('pwa-locked');

            if (state === 'non_safari') {
                const copyBtn = document.getElementById('pwa-copy-btn');
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        copyBtn.textContent = 'Đã sao chép liên kết!';
                        copyBtn.style.background = '#10b981';
                        setTimeout(() => { copyBtn.textContent = 'Sao chép liên kết'; copyBtn.style.background = ''; }, 3000);
                    });
                });
            } else if (state === 'safari') {
                const video = document.getElementById('pwa-instruction-video');
                const trigger = document.getElementById('pwa-video-trigger');
                const overlay = document.getElementById('pwa-video-overlay');
                const shareBtn = document.getElementById('pwa-share-btn');

                // Kích hoạt PiP khi nhấn vào video (Đã bao bọc Try-Catch và kiểm tra lỗi)
                trigger.addEventListener('click', async () => {
                    try {
                        if (video.error) {
                            overlay.querySelector('span').innerText = "LỖI TẢI VIDEO!";
                            overlay.querySelector('i').className = "fa-solid fa-triangle-exclamation text-rose-500";
                            return;
                        }

                        overlay.style.opacity = '0';
                        await video.play();
                        
                        if (video.requestPictureInPicture) {
                            await video.requestPictureInPicture();
                        } else if (video.webkitSetPresentationMode) {
                            video.webkitSetPresentationMode("picture-in-picture");
                        }
                    } catch (error) {
                        console.error("PiP Error:", error);
                        overlay.style.opacity = '1';
                    }
                });

                // Gọi Web Share API
                shareBtn.addEventListener('click', () => {
                    if (navigator.share) {
                        navigator.share({
                            title: 'Mai Tây Studio',
                            text: 'Ứng dụng đặt lịch Mai Tây Hair Salon',
                            url: window.location.href
                        }).catch(() => {}); 
                    }
                });
            }
        },

        init() {
            const ua = navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            if (!isIOS) return;

            const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
            if (isStandalone) return;

            const isInApp = /FBAV|FBAN|Zalo|Instagram|TikTok|Messenger/i.test(ua);
            const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury|EdgiOS/i.test(ua) && !isInApp;

            this.injectStyles();
            if (isInApp) this.createElements('in_app');
            else if (!isSafari) this.createElements('non_safari');
            else this.createElements('safari');
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') PWAManager.init();
    else window.addEventListener('load', () => PWAManager.init());
})();