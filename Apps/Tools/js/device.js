// js/device.js
import { UI } from './ui.js';

let forcedDeviceMode = localStorage.getItem('hunqos_device_mode') || 'auto';

export function detectDeviceMode() {
    if (forcedDeviceMode !== 'auto') {
        document.documentElement.setAttribute('data-device-mode', forcedDeviceMode);
        return forcedDeviceMode;
    }
    const w = window.innerWidth;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let mode = 'phone';

    if (w >= 1024 && !isTouch) {
        mode = 'desktop'; // DexUI
    } else if (w >= 680 || (w >= 600 && isTouch)) {
        mode = 'tablet';  // TabUI
    } else {
        mode = 'phone';   // MobUI
    }

    document.documentElement.setAttribute('data-device-mode', mode);
    return mode;
}

export function getGridColumns() {
    const mode = detectDeviceMode();
    if (mode === 'desktop') return 8;
    if (mode === 'tablet') return 6;
    return 4;
}

export function initDeviceMode(onModeChangeCallback) {
    window.setForcedDeviceMode = (mode) => {
        forcedDeviceMode = mode;
        localStorage.setItem('hunqos_device_mode', mode);

        const modeLabels = {
            auto: 'Tự động',
            phone: 'MobUI',
            tablet: 'TabUI',
            desktop: 'DexUI'
        };

        ['auto', 'phone', 'tablet', 'desktop'].forEach(m => {
            const btn = document.getElementById(`mode-btn-${m}`);
            if (btn) {
                btn.className = (m === mode)
                    ? "py-2.5 px-2 rounded-xl bg-accent-theme text-white font-medium text-xs text-center border border-white/20 transition-all"
                    : "py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs text-center transition-all";
            }
        });

        detectDeviceMode();
        if (typeof onModeChangeCallback === 'function') {
            onModeChangeCallback();
        }
        UI.showAlert('Chế độ hiển thị', `Đã chuyển sang ${modeLabels[mode]}.`, 'success');
    };

    detectDeviceMode();
}