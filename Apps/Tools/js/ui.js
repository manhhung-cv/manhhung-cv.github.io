// js/ui.js
export const UI = {
    // 1. Hàm gọi Alert (Toast)
    showAlert: (title, desc, type = 'info', duration = 3000) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type}`;
        
        const icons = { info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-exclamation-triangle', warning: 'fa-exclamation-circle' };
        
        alertEl.innerHTML = `
            <i class="fas ${icons[type]} alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-desc">${desc}</div>
            </div>
        `;
        
        container.appendChild(alertEl);

        setTimeout(() => {
            alertEl.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => alertEl.remove(), 300);
        }, duration);
    }, // <--- Dấu phẩy ngăn cách hàm 1

    // 2. Hàm gọi Modal Xác nhận (Confirm Dialog)
    showConfirm: (title, message, onConfirm, onCancel = null) => {
        const oldModal = document.getElementById('dynamic-modal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div class="dialog-backdrop open" id="dynamic-modal">
                <div class="dialog">
                    <div class="dialog-header">
                        <div class="dialog-title">${title}</div>
                        <button class="dialog-close" id="btn-modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="dialog-body">${message}</div>
                    <div class="dialog-footer">
                        <button class="btn btn-outline" id="btn-modal-cancel">Hủy bỏ</button>
                        <button class="btn btn-primary" id="btn-modal-confirm">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalEl = document.getElementById('dynamic-modal');

        const close = () => modalEl.remove();

        // CẬP NHẬT: Dùng addEventListener với { once: true } để tối ưu bộ nhớ và chặn double-click
        document.getElementById('btn-modal-close').addEventListener('click', close, { once: true });
        
        document.getElementById('btn-modal-cancel').addEventListener('click', () => { 
            if (onCancel) onCancel(); 
            close(); 
        }, { once: true });
        
        document.getElementById('btn-modal-confirm').addEventListener('click', () => { 
            onConfirm(); 
            close(); 
        }, { once: true });

        // Thoát khi click ra ngoài backdrop
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) close();
        });
    },
    // 3. Hàm mở Modal Fullscreen cho Ảnh/Video
    showMediaFullscreen: (src, type) => {
        const oldModal = document.getElementById('media-fs-modal');
        if (oldModal) oldModal.remove();

        const contentHtml = type === 'video' 
            ? `<video src="${src}" class="media-fs-content" controls autoplay></video>`
            : `<img src="${src}" class="media-fs-content">`;

        const modalHtml = `
            <div class="media-fs-modal open" id="media-fs-modal">
                <button class="media-fs-close" id="btn-media-fs-close"><i class="fas fa-times"></i></button>
                ${contentHtml}
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('media-fs-modal');
        const close = () => {
            modal.classList.remove('open');
            setTimeout(() => modal.remove(), 250);
        };
        
        document.getElementById('btn-media-fs-close').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); }; 
    }, // <--- Dấu phẩy ngăn cách hàm 3

    // 4. Hàm khởi tạo các nút điều khiển (Play, Mute, Fullscreen)
    initMediaControls: () => {
        const mediaBoxes = document.querySelectorAll('.media-box-control');
        
        mediaBoxes.forEach(box => {
            if (box.dataset.mediaInit) return; 
            box.dataset.mediaInit = 'true';

            const video = box.querySelector('video');
            const img = box.querySelector('img');
            const btnPlay = box.querySelector('.btn-play');
            const btnMute = box.querySelector('.btn-mute');
            const btnFs = box.querySelector('.btn-fullscreen');

            if (video && btnPlay) {
                btnPlay.onclick = () => {
                    if (video.paused) { 
                        video.play(); 
                        btnPlay.innerHTML = '<i class="fas fa-pause"></i>'; 
                    } else { 
                        video.pause(); 
                        btnPlay.innerHTML = '<i class="fas fa-play"></i>'; 
                    }
                };
            }

            if (video && btnMute) {
                btnMute.onclick = () => {
                    video.muted = !video.muted;
                    btnMute.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
                };
            }

            if (btnFs) {
                btnFs.onclick = () => {
                    if (video) UI.showMediaFullscreen(video.querySelector('source')?.src || video.src, 'video');
                    else if (img) UI.showMediaFullscreen(img.src, 'img');
                };
            }
        });
    }
};