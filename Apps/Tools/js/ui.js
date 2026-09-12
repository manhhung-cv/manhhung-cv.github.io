export const UI = {
    /**
     * Hiển thị thông báo Toast siêu nhẹ đỉnh màn hình
     */
    showAlert: (title, desc, type = 'info', duration = 2400) => {
        let container = document.getElementById('toast-container');
        if (!container) return;

        const isMinimal = document.body.classList.contains('minimal-ui');
        const bannerEl = document.createElement('div');
        
        const iconConfig = {
            info: { icon: 'fa-info-circle', color: 'text-blue-400' },
            success: { icon: 'fa-check-circle', color: 'text-emerald-400' },
            error: { icon: 'fa-exclamation-circle', color: 'text-rose-400' },
            warning: { icon: 'fa-exclamation-triangle', color: 'text-amber-400' }
        };
        const cfg = iconConfig[type] || iconConfig.info;

        const bgClass = isMinimal ? "bg-[#09090b] border-white/20" : "bg-[#15171e] border-white/15";

        bannerEl.className = `flex items-center gap-3 px-4 py-2.5 rounded-xl border ${bgClass} text-white shadow-lg max-w-sm w-full transition-opacity duration-150 select-none`;
        bannerEl.innerHTML = `
            <i class="fas ${cfg.icon} ${cfg.color} text-xs shrink-0"></i>
            <div class="flex-1 min-w-0">
                <div class="font-medium text-xs truncate">${title}</div>
                <div class="text-[11px] text-white/60 truncate">${desc}</div>
            </div>
        `;

        container.appendChild(bannerEl);
        setTimeout(() => bannerEl.remove(), duration);
    },

    /**
     * Hộp thoại xác nhận phẳng, không blur
     */
    showConfirm: (title, message, onConfirm) => {
        const oldModal = document.getElementById('dynamic-modal');
        if (oldModal) oldModal.remove();

        const isMinimal = document.body.classList.contains('minimal-ui');
        const modalBg = isMinimal ? "bg-[#050505] border-white/20" : "bg-[#181b24] border-white/10";

        const modalHtml = `
            <div class="fixed inset-0 z-[300] flex items-center justify-center p-4 select-none no-scrollbar" id="dynamic-modal">
                <div class="absolute inset-0 bg-black/75" id="modal-backdrop"></div>
                <div class="relative w-full max-w-xs ${modalBg} rounded-2xl p-5 border text-white shadow-xl">
                    <h3 class="text-sm font-bold text-center mb-1">${title}</h3>
                    <div class="text-white/60 text-xs text-center mb-4 leading-relaxed">${message}</div>
                    <div class="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                        <button id="btn-modal-cancel" class="py-1.5 rounded-lg text-xs font-medium text-white/60 hover:bg-white/5">Hủy</button>
                        <button id="btn-modal-confirm" class="py-1.5 rounded-lg text-xs font-semibold bg-accent-theme text-white">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalContainer = document.getElementById('dynamic-modal');
        document.getElementById('btn-modal-cancel').onclick = () => modalContainer.remove();
        document.getElementById('btn-modal-confirm').onclick = () => {
            onConfirm();
            modalContainer.remove();
        };
    }
};