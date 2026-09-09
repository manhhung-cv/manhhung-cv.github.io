// js/ui.js

export const UI = {
    /**
     * Hiển thị thông báo (Dynamic Island morphing hoặc iOS Push Banner)
     */
    showAlert: (title, desc, type = 'info', duration = 3200) => {
        const isIslandEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const islandWrapper = document.getElementById('dynamic-island-wrapper');
        const isIslandVisible = islandWrapper && !islandWrapper.classList.contains('hidden');

        // NẾU BẬT DYNAMIC ISLAND -> Biến hình thanh Dynamic Island thành thông báo
        if (isIslandEnabled && isIslandVisible && window.triggerIslandNotification) {
            window.triggerIslandNotification(title, desc, type, duration);
            return;
        }

        // NẾU TẮT DYNAMIC ISLAND -> Hiện Banner iOS trượt từ trên đỉnh xuống
        let container = document.getElementById('toast-container');
        if (!container) return;

        const bannerEl = document.createElement('div');
        const iconConfig = {
            info: { icon: 'fa-info-circle', color: 'text-blue-400' },
            success: { icon: 'fa-check-circle', color: 'text-emerald-400' },
            error: { icon: 'fa-exclamation-triangle', color: 'text-rose-400' },
            warning: { icon: 'fa-exclamation-circle', color: 'text-amber-400' }
        };
        const cfg = iconConfig[type] || iconConfig.info;

        bannerEl.className = "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[24px] shadow-2xl border border-white/20 bg-black/85 backdrop-blur-2xl text-white transition-all duration-400 transform -translate-y-10 opacity-0 scale-95 max-w-sm w-full cursor-pointer select-none";
        bannerEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <i class="fas ${cfg.icon} ${cfg.color} text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-xs text-white leading-tight truncate">${title}</div>
                <div class="text-[11px] text-white/60 truncate mt-0.5">${desc}</div>
            </div>
        `;

        container.appendChild(bannerEl);

        requestAnimationFrame(() => {
            bannerEl.classList.remove('-translate-y-10', 'opacity-0', 'scale-95');
            bannerEl.classList.add('translate-y-0', 'opacity-100', 'scale-100');
        });

        const removeBanner = () => {
            bannerEl.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
            bannerEl.classList.add('-translate-y-10', 'opacity-0', 'scale-95');
            setTimeout(() => bannerEl.remove(), 300);
        };

        bannerEl.onclick = removeBanner;
        if (duration > 0) setTimeout(removeBanner, duration);
    },

    showConfirm: (title, message, onConfirm, onCancel = null) => {
        const oldModal = document.getElementById('dynamic-modal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div class="fixed inset-0 z-[300] flex items-center justify-center p-4 select-none" id="dynamic-modal">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0" id="modal-backdrop"></div>
                <div class="relative w-full max-w-xs liquid-glass bg-zinc-900/90 rounded-[28px] p-5 shadow-2xl border border-white/15 text-white transform scale-95 opacity-0 transition-all duration-300" id="modal-content">
                    <h3 class="text-base font-bold text-center mb-1 tracking-tight">${title}</h3>
                    <div class="text-white/70 text-xs text-center mb-5 leading-relaxed">${message}</div>
                    <div class="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                        <button id="btn-modal-cancel" class="py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors">Hủy</button>
                        <button id="btn-modal-confirm" class="py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-white/90 transition-all">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalContainer = document.getElementById('dynamic-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const content = document.getElementById('modal-content');

        requestAnimationFrame(() => {
            backdrop.classList.replace('opacity-0', 'opacity-100');
            content.classList.replace('opacity-0', 'opacity-100');
            content.classList.replace('scale-95', 'scale-100');
        });

        const closeModal = () => {
            backdrop.classList.replace('opacity-100', 'opacity-0');
            content.classList.replace('opacity-100', 'opacity-0');
            content.classList.replace('scale-100', 'scale-95');
            setTimeout(() => modalContainer.remove(), 300);
        };

        document.getElementById('btn-modal-cancel').onclick = () => { if (onCancel) onCancel(); closeModal(); };
        document.getElementById('btn-modal-confirm').onclick = () => { onConfirm(); closeModal(); };
        backdrop.onclick = closeModal;
    },

    showMediaFullscreen: (src, type = 'image') => {
        const oldModal = document.getElementById('media-fs-modal');
        if (oldModal) oldModal.remove();

        const contentHtml = type === 'video' 
            ? `<video src="${src}" class="max-w-[95vw] max-h-[90vh] rounded-3xl outline-none shadow-2xl scale-95 opacity-0 transition-all duration-300" id="media-content" controls autoplay></video>`
            : `<img src="${src}" class="max-w-[95vw] max-h-[90vh] rounded-3xl shadow-2xl scale-95 opacity-0 transition-all duration-300 bg-black/80 p-2" id="media-content">`;

        const modalHtml = `
            <div class="fixed inset-0 z-[350] bg-black/90 backdrop-blur-md flex items-center justify-center opacity-0 transition-opacity duration-300" id="media-fs-modal">
                <button id="btn-media-fs-close" class="absolute top-6 right-6 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-colors z-10">
                    <i class="fas fa-times"></i>
                </button>
                ${contentHtml}
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('media-fs-modal');
        const mediaContent = document.getElementById('media-content');

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
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    }
};