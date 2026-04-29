// js/ui.js

export const UI = {
    /**
     * Hiển thị thông báo (Toast Alert)
     */
    showAlert: (title, desc, type = 'info', duration = 3000) => {
        let container = document.getElementById('toast-container');
        if (!container) return;

        const alertEl = document.createElement('div');
        
        // Cấu hình màu sắc và icon theo từng loại thông báo
        const typeConfig = {
            info: { bg: 'bg-blue-50/90 dark:bg-blue-900/30', border: 'border-blue-200/50 dark:border-blue-800/50', icon: 'fa-info-circle', iconColor: 'text-blue-500' },
            success: { bg: 'bg-emerald-50/90 dark:bg-emerald-900/30', border: 'border-emerald-200/50 dark:border-emerald-800/50', icon: 'fa-check-circle', iconColor: 'text-emerald-500' },
            error: { bg: 'bg-red-50/90 dark:bg-red-900/30', border: 'border-red-200/50 dark:border-red-800/50', icon: 'fa-exclamation-triangle', iconColor: 'text-red-500' },
            warning: { bg: 'bg-amber-50/90 dark:bg-amber-900/30', border: 'border-amber-200/50 dark:border-amber-800/50', icon: 'fa-exclamation-circle', iconColor: 'text-amber-500' }
        };

        const config = typeConfig[type] || typeConfig.info;
        
        // Class cơ bản (Bao gồm hiệu ứng animation khởi tạo: dịch xuống và mờ)
        const baseClass = "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 transform translate-y-4 opacity-0 scale-95";
        
        alertEl.className = `${baseClass} ${config.bg} ${config.border}`;
        alertEl.innerHTML = `
            <i class="fas ${config.icon} ${config.iconColor} text-lg mt-0.5"></i>
            <div class="flex-1 min-w-[200px]">
                <div class="font-bold text-zinc-900 dark:text-zinc-100 text-[13px]">${title}</div>
                <div class="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">${desc}</div>
            </div>
            <button class="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 transition-colors close-toast-btn">
                <i class="fas fa-times text-[10px]"></i>
            </button>
        `;
        
        container.appendChild(alertEl);

        // Kích hoạt Animation hiện ra
        requestAnimationFrame(() => {
            alertEl.classList.remove('translate-y-4', 'opacity-0', 'scale-95');
            alertEl.classList.add('translate-y-0', 'opacity-100', 'scale-100');
        });

        // Hàm xóa Toast với Animation ẩn đi
        const removeToast = () => {
            alertEl.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
            alertEl.classList.add('translate-y-4', 'opacity-0', 'scale-95');
            setTimeout(() => alertEl.remove(), 300); // Chờ animation chạy xong mới xóa DOM
        };

        // Bắt sự kiện nút đóng
        alertEl.querySelector('.close-toast-btn').onclick = removeToast;

        // Tự động đóng sau X giây
        if (duration > 0) {
            setTimeout(removeToast, duration);
        }
    },

    /**
     * Hiển thị Hộp thoại xác nhận (Confirm Modal)
     */
    showConfirm: (title, message, onConfirm, onCancel = null) => {
        // Xóa modal cũ nếu có
        const oldModal = document.getElementById('dynamic-modal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div class="fixed inset-0 z-[200] flex items-center justify-center p-4" id="dynamic-modal">
                <div class="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity duration-300 opacity-0" id="modal-backdrop"></div>
                
                <div class="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 transform scale-95 opacity-0 transition-all duration-300" id="modal-content">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-lg mb-2">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <button id="btn-modal-close" class="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <i class="fas fa-times text-[10px]"></i>
                        </button>
                    </div>
                    
                    <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">${title}</h3>
                    <div class="text-zinc-500 text-sm mb-8 leading-relaxed">${message}</div>
                    
                    <div class="flex flex-col sm:flex-row justify-end gap-3">
                        <button id="btn-modal-cancel" class="px-5 py-3 rounded-xl font-semibold text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors w-full sm:w-auto active:scale-95">Hủy bỏ</button>
                        <button id="btn-modal-confirm" class="px-5 py-3 rounded-xl font-semibold text-sm text-white dark:text-zinc-900 bg-zinc-900 dark:bg-white hover:opacity-90 transition-all w-full sm:w-auto shadow-sm active:scale-95">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modalContainer = document.getElementById('dynamic-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const content = document.getElementById('modal-content');

        // Kích hoạt animation hiện Modal
        requestAnimationFrame(() => {
            backdrop.classList.replace('opacity-0', 'opacity-100');
            content.classList.replace('opacity-0', 'opacity-100');
            content.classList.replace('scale-95', 'scale-100');
        });

        // Hàm đóng Modal
        const closeModal = () => {
            backdrop.classList.replace('opacity-100', 'opacity-0');
            content.classList.replace('opacity-100', 'opacity-0');
            content.classList.replace('scale-100', 'scale-95');
            setTimeout(() => modalContainer.remove(), 300);
        };

        // Gắn sự kiện
        document.getElementById('btn-modal-close').onclick = closeModal;
        document.getElementById('btn-modal-cancel').onclick = () => { 
            if (onCancel) onCancel(); 
            closeModal(); 
        };
        document.getElementById('btn-modal-confirm').onclick = () => { 
            onConfirm(); 
            closeModal(); 
        };
        backdrop.onclick = closeModal; // Click ra ngoài nền để đóng
    },

    /**
     * Hiển thị Hình ảnh/Video toàn màn hình (Phục vụ cho tính năng QR, Xem ảnh...)
     */
    showMediaFullscreen: (src, type = 'image') => {
        const oldModal = document.getElementById('media-fs-modal');
        if (oldModal) oldModal.remove();

        const contentHtml = type === 'video' 
            ? `<video src="${src}" class="max-w-[95vw] max-h-[90vh] rounded-3xl object-contain outline-none shadow-2xl scale-95 opacity-0 transition-all duration-300" id="media-content" controls autoplay></video>`
            : `<img src="${src}" class="max-w-[95vw] max-h-[90vh] rounded-3xl object-contain shadow-2xl scale-95 opacity-0 transition-all duration-300 bg-white dark:bg-zinc-900 p-4" id="media-content">`;

        const modalHtml = `
            <div class="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center opacity-0 transition-opacity duration-300" id="media-fs-modal">
                <button id="btn-media-fs-close" class="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-colors z-10 backdrop-blur-sm">
                    <i class="fas fa-times"></i>
                </button>
                ${contentHtml}
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('media-fs-modal');
        const mediaContent = document.getElementById('media-content');

        // Animation hiện
        requestAnimationFrame(() => {
            modal.classList.replace('opacity-0', 'opacity-100');
            setTimeout(() => {
                mediaContent.classList.replace('opacity-0', 'opacity-100');
                mediaContent.classList.replace('scale-95', 'scale-100');
            }, 50);
        });
        
        const closeModal = () => {
            mediaContent.classList.replace('scale-100', 'scale-95');
            mediaContent.classList.replace('opacity-100', 'opacity-0');
            modal.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => modal.remove(), 300);
        };
        
        document.getElementById('btn-media-fs-close').onclick = closeModal;
        modal.onclick = (e) => { 
            // Chỉ đóng nếu click vào vùng đen bên ngoài, không đóng nếu click vào ảnh
            if (e.target === modal) closeModal(); 
        }; 
    }
};