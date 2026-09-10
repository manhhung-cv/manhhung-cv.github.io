import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER (MẶC ĐỊNH: EMERALD / MINT JADE)
// =============================================================================
// Tông Emerald (#10b981) hài hòa với dải gradient gốc của HunqOS (#064e3b -> #020f0b)
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    /**
     * Lấy màu chủ đạo thực tế từ Cài Đặt HunqOS (Fallback về Emerald mặc định)
     */
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') ||
            localStorage.getItem('hunqos_icon_custom_bg') ||
            DEFAULT_EMERALD;
    },

    /**
     * Áp dụng biến màu chủ đạo lên vùng chứa giao diện
     */
    applyAccent: (container) => {
        if (!container) return;
        const accent = ThemeKit.getAccentColor();
        container.style.setProperty('--kit-accent', accent);
    }
};

// =============================================================================
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER
// =============================================================================
export const IslandKit = {
    /**
     * Kiểm tra trạng thái Dynamic Island (Cài đặt & Trạng thái hiển thị DOM)
     */
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    /**
     * Bắn thông báo: Tự động morphing Island hoặc chuyển thành Push Banner Toast
     */
    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    },

    /**
     * Ghim Live Activity thời gian thực lên Island
     */
    setLiveView: (htmlMarkup, onClick = null) => {
        if (!IslandKit.isIslandActive()) {
            UI.showAlert('Live Activity', 'Dynamic Island hiện đang tắt trong Cài Đặt.', 'warning', 2500);
            return;
        }

        const compactView = document.getElementById('island-compact-view');
        const dynamicIsland = document.getElementById('dynamic-island');
        if (!compactView || !dynamicIsland) return;

        compactView.innerHTML = htmlMarkup;
        compactView.classList.remove('hidden');

        if (onClick) {
            dynamicIsland.onclick = (e) => {
                const alertView = document.getElementById('island-alert-view');
                if (alertView && !alertView.classList.contains('hidden')) return;
                onClick(e);
            };
        }
    },

    /**
     * Khôi phục Dynamic Island về trạng thái nhàn rỗi
     */
    resetLiveView: () => {
        const compactView = document.getElementById('island-compact-view');
        const dynamicIsland = document.getElementById('dynamic-island');
        if (compactView) compactView.innerHTML = '';
        if (dynamicIsland) dynamicIsland.onclick = null;
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - EMERALD ACCENT)
// =============================================================================
export function template() {
    return `
    <div id="uikit-root-container" class="w-full h-full flex flex-col bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #uikit-root-container {
                --kit-accent: #10b981;
            }
            .bg-accent-theme {
                background-color: var(--kit-accent) !important;
            }
            .text-accent-theme {
                color: var(--kit-accent) !important;
            }
            .border-accent-theme {
                border-color: var(--kit-accent) !important;
            }
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
        </style>

        <!-- TOP APP BAR -->
        <header class="h-12 px-4 shrink-0 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/75 dark:bg-[#111113]/75 backdrop-blur-2xl z-20">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-accent-theme transition-colors shadow-sm"></span>
                <span class="text-[13px] font-bold tracking-tight text-zinc-900 dark:text-white">HunqOS UI Kit</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-mono">Emerald Minimal</span>
            </div>

            <div class="flex items-center gap-2">
                <span id="kit-island-status-pill" class="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border transition-all">
                    Scanning...
                </span>
            </div>
        </header>

        <!-- MAIN SCROLLER (INSET GROUPED CARDS) -->
        <main class="flex-1 overflow-y-auto no-scrollbar px-3.5 sm:px-6 py-5 max-w-4xl mx-auto w-full space-y-6 pb-24">
            
            <div class="px-1 space-y-0.5">
                <h2 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Design Guidelines</h2>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Bộ quy chuẩn thành phần phẳng, cân bằng độ tương phản cho màn hình OLED tối và sáng.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                
                <!-- CỘT TRÁI -->
                <div class="space-y-5">
                    
                    <!-- 1. DYNAMIC ISLAND & NOTIFICATIONS -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy JS Code">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">1. Island & Dynamic Alerts</h3>
                        
                        <div class="code-source space-y-3" data-name="Alerts">
                            <div class="grid grid-cols-2 gap-2">
                                <button id="test-alert-success" class="h-11 rounded-[16px] bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <i class="fas fa-check-circle text-sm"></i> Success
                                </button>
                                <button id="test-alert-error" class="h-11 rounded-[16px] bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <i class="fas fa-exclamation-circle text-sm"></i> Error
                                </button>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <button id="test-alert-info" class="h-11 rounded-[16px] bg-accent-theme-alpha hover:opacity-90 text-accent-theme text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <i class="fas fa-info-circle text-sm"></i> Info Notice
                                </button>
                                <button id="test-modal" class="h-11 rounded-[16px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <i class="fas fa-window-restore text-sm"></i> Confirm Sheet
                                </button>
                            </div>

                            <!-- Live Activity Triggers -->
                            <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center gap-2">
                                <button id="btn-pin-timer" class="flex-1 py-2 px-2.5 rounded-[12px] bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium active:scale-95 transition-all truncate">
                                    <i class="fas fa-stopwatch text-accent-theme mr-1"></i> Live Timer
                                </button>
                                <button id="btn-pin-sync" class="flex-1 py-2 px-2.5 rounded-[12px] bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium active:scale-95 transition-all truncate">
                                    <i class="fas fa-arrows-rotate text-accent-theme mr-1"></i> Live Sync
                                </button>
                                <button id="btn-clear-island" class="py-2 px-2.5 rounded-[12px] text-zinc-400 hover:text-zinc-800 dark:hover:text-white text-[11px] font-medium transition-colors">
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. BUTTONS -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy HTML">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">2. Buttons & Actions</h3>
                        
                        <div class="code-source flex flex-col gap-2.5" data-name="Buttons">
                            <button class="w-full h-11 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide active:scale-[0.98] transition-all shadow-sm">
                                Primary Action Button
                            </button>
                            <div class="flex gap-2">
                                <button class="flex-1 h-10 rounded-[14px] border border-black/[0.1] dark:border-white/[0.15] text-zinc-800 dark:text-zinc-200 font-medium text-xs active:scale-95 transition-all">
                                    Outline
                                </button>
                                <button class="flex-1 h-10 rounded-[14px] bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-medium text-xs active:scale-95 transition-all">
                                    Secondary Flat
                                </button>
                            </div>
                            <div class="flex gap-2">
                                <button class="flex-1 h-10 rounded-[14px] bg-accent-theme-alpha text-accent-theme font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                    <i class="fas fa-cloud-arrow-down text-xs"></i> Download
                                </button>
                                <button class="flex-1 h-10 rounded-[14px] border border-black/[0.1] dark:border-white/[0.15] text-zinc-800 dark:text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                    Next Step <i class="fas fa-arrow-right text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 3. LINKED INPUT GROUPS -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy HTML">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">3. Linked Inputs</h3>
                        
                        <div class="code-source space-y-3" data-name="Input Groups">
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1 border border-black/[0.04] dark:border-white/[0.06]">
                                <i class="fas fa-link text-zinc-400 ml-3 text-xs"></i>
                                <input type="text" class="w-full bg-transparent border-none outline-none px-2.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white" value="https://hunqos.workspace" readonly>
                                <button class="bg-accent-theme text-white font-bold px-4 py-1.5 rounded-[12px] text-xs whitespace-nowrap active:scale-95 transition-transform">Copy</button>
                            </div>

                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1 border border-black/[0.04] dark:border-white/[0.06]">
                                <button class="bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] w-8 h-8 rounded-[12px] text-zinc-500 dark:text-zinc-300 flex items-center justify-center text-xs"><i class="fas fa-filter text-[10px]"></i></button>
                                <input type="text" class="w-full bg-transparent border-none outline-none px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Lọc từ khóa...">
                                <button class="bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] px-3.5 py-1.5 rounded-[12px] text-xs font-semibold text-zinc-900 dark:text-white whitespace-nowrap active:scale-95 transition-transform">Tìm</button>
                            </div>

                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1 border border-black/[0.04] dark:border-white/[0.06]">
                                <input type="number" class="w-full bg-transparent border-none outline-none px-2 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white text-center" placeholder="Rộng">
                                <i class="fas fa-times text-zinc-400 text-[10px] px-1"></i>
                                <input type="number" class="w-full bg-transparent border-none outline-none px-2 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white text-center" placeholder="Cao">
                                <button class="bg-white dark:bg-[#27272a] border border-black/[0.05] dark:border-white/[0.08] px-3.5 py-1.5 rounded-[12px] text-xs font-semibold text-zinc-900 dark:text-white whitespace-nowrap active:scale-95 transition-transform">Áp dụng</button>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- CỘT PHẢI -->
                <div class="space-y-5">
                    
                    <!-- 4. FORMS & CONTROLS -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy HTML">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">4. Forms & Inset Controls</h3>
                        
                        <div class="code-source space-y-4" data-name="Forms">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3 border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.05] dark:divide-white/[0.08]">
                                <input type="email" class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white pb-2 placeholder-zinc-400" placeholder="name@example.com">
                                <input type="password" class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white pt-2 placeholder-zinc-400" placeholder="••••••••">
                            </div>

                            <div class="flex gap-2.5">
                                <div class="flex-1 bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-2.5 border border-black/[0.04] dark:border-white/[0.06]">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Ngày tháng</label>
                                    <input type="date" class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white cursor-pointer">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-2.5 border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Palette</label>
                                    <input type="color" id="kit-color-picker-input" value="#10b981" class="w-6 h-6 rounded-md cursor-pointer bg-transparent border-none p-0" title="Đổi màu chủ đạo">
                                </div>
                            </div>

                            <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Đồng bộ đám mây (Switch)</span>
                                    <button id="demo-toggle-switch" class="switch-pill active">
                                        <div class="switch-thumb"></div>
                                    </button>
                                </div>

                                <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>

                                <label class="flex items-center justify-between cursor-pointer">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Ghi nhớ trạng thái</span>
                                    <input type="checkbox" class="w-4 h-4 rounded-md accent-theme-tint cursor-pointer" checked>
                                </label>

                                <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>

                                <div class="flex justify-between items-center">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Tùy chọn phân vùng</span>
                                    <div class="flex items-center gap-3">
                                        <label class="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                            <input type="radio" name="demo-radio" class="accent-theme-tint" checked> Primary
                                        </label>
                                        <label class="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                            <input type="radio" name="demo-radio" class="accent-theme-tint"> Standby
                                        </label>
                                    </div>
                                </div>

                                <div class="w-full h-px bg-black/[0.05] dark:border-white/[0.08]"></div>

                                <div class="range-wrapper">
                                    <div class="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                                        <span>Cường độ rung (Haptic)</span>
                                        <span class="range-value text-zinc-900 dark:text-white font-mono">60%</span>
                                    </div>
                                    <input type="range" class="range w-full accent-theme-tint h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" min="0" max="100" value="60">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. TABS & DATA TABLE -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy HTML">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">5. Tabs & Data Table</h3>
                        
                        <div class="code-source" data-name="Tabs">
                            <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.06] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] mb-3" id="ui-kit-tabs">
                                <button class="tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all" data-target="tab-table">
                                    Bảng dữ liệu
                                </button>
                                <button class="tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-target="tab-text">
                                    Văn bản thô
                                </button>
                            </div>
                            
                            <div class="tab-pane block" id="tab-table">
                                <div class="w-full overflow-x-auto rounded-[16px] border border-black/[0.04] dark:border-white/[0.06]">
                                    <table class="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr class="bg-black/[0.02] dark:bg-white/[0.04] text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                                                <th class="p-2.5">Thành phần</th>
                                                <th class="p-2.5 text-center">Trạng thái</th>
                                                <th class="p-2.5 text-right">Tác vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-zinc-700 dark:text-zinc-300">
                                            <tr>
                                                <td class="p-2.5 font-medium">Island Engine</td>
                                                <td class="p-2.5 text-center"><span class="px-2 py-0.5 bg-accent-theme-alpha text-accent-theme text-[9px] font-semibold rounded-full">Ready</span></td>
                                                <td class="p-2.5 text-right"><i class="fas fa-check text-accent-theme text-xs"></i></td>
                                            </tr>
                                            <tr>
                                                <td class="p-2.5 font-medium">Toast Fallback</td>
                                                <td class="p-2.5 text-center"><span class="px-2 py-0.5 bg-accent-theme-alpha text-accent-theme text-[9px] font-semibold rounded-full">Standby</span></td>
                                                <td class="p-2.5 text-right"><i class="fas fa-circle-notch text-accent-theme text-xs"></i></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div class="tab-pane hidden" id="tab-text">
                                <textarea class="w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 outline-none text-xs font-mono text-zinc-900 dark:text-white resize-none min-h-[90px] placeholder-zinc-400" placeholder="Soạn thảo thông số cấu hình tại đây..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- 6. MEDIA & OVERLAYS -->
                    <div class="ui-block rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 relative shadow-sm">
                        <button class="btn-copy-code w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center absolute top-4 right-4 active:scale-90 transition-transform" title="Copy HTML">
                            <i class="far fa-copy text-[11px]"></i>
                        </button>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">6. Media Viewport</h3>
                        
                        <div class="code-source grid grid-cols-2 gap-3" data-name="Media Controls">
                            <div class="relative rounded-[16px] overflow-hidden group aspect-[4/3] bg-black/5 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.06]">
                                <img src="/Asset/logo/logo.png" alt="HunqOS" class="w-full h-full object-contain p-3">
                                <div class="absolute inset-0 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button id="btn-view-fs" class="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"><i class="fas fa-expand text-xs"></i></button>
                                </div>
                            </div>
                            <div class="rounded-[16px] border border-dashed border-black/[0.1] dark:border-white/[0.15] flex flex-col items-center justify-center p-3 text-center">
                                <i class="fas fa-palette text-accent-theme text-lg mb-1"></i>
                                <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Emerald Mint đồng bộ tự động theo cấu hình hệ điều hành</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    let liveTimerInterval = null;
    const rootContainer = hostElement.querySelector('#uikit-root-container') || hostElement;

    // -------------------------------------------------------------
    // Áp dụng màu chủ đạo từ Cài Đặt HunqOS (Mặc định: Emerald #10b981)
    // -------------------------------------------------------------
    const updateAccent = () => {
        ThemeKit.applyAccent(rootContainer);
        const colorInput = hostElement.querySelector('#kit-color-picker-input');
        if (colorInput) {
            colorInput.value = ThemeKit.getAccentColor();
        }
    };
    updateAccent();

    // Lắng nghe khi cài đặt HunqOS đổi màu nền/accent trong localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Cho phép đổi màu thử nghiệm ngay trên công cụ
    hostElement.querySelector('#kit-color-picker-input')?.addEventListener('input', (e) => {
        const customColor = e.target.value;
        localStorage.setItem('hunqos_accent_color', customColor);
        updateAccent();
        IslandKit.notify('Màu chủ đạo', `Đã cập nhật accent: ${customColor}`, 'info');
    });

    // -------------------------------------------------------------
    // Quét trạng thái Island thời gian thực
    // -------------------------------------------------------------
    const updateEngineBadge = () => {
        const isIslandOn = IslandKit.isIslandActive();
        const badge = hostElement.querySelector('#kit-island-status-pill');
        if (badge) {
            badge.textContent = isIslandOn ? 'Island: Hoạt động' : 'Island: Đã tắt (Toast Mode)';
            badge.className = `text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${isIslandOn
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`;
        }
    };

    updateEngineBadge();
    const observer = new MutationObserver(updateEngineBadge);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // -------------------------------------------------------------
    // Copy Code Logic (Tự lọc style, hỗ trợ copy JS / HTML chuẩn)
    // -------------------------------------------------------------
    hostElement.querySelectorAll('.btn-copy-code').forEach(btn => {
        btn.addEventListener('click', async () => {
            const block = btn.closest('.ui-block')?.querySelector('.code-source');
            if (!block) return;

            if (block.dataset.name === 'Alerts') {
                const jsSnippet = `
// 1. Thông báo tự fallback giữa Dynamic Island và Banner Push
IslandKit.notify('Thành công', 'Thao tác đã hoàn thành.', 'success');
IslandKit.notify('Lỗi hệ thống', 'Dữ liệu không hợp lệ.', 'error');
IslandKit.notify('Cập nhật', 'Hệ thống đang đồng bộ dữ liệu ngầm.', 'info');

// 2. Hộp thoại xác nhận toàn hệ thống
UI.showConfirm('Xác nhận?', 'Bạn có chắc chắn muốn thực hiện thao tác này?', () => {
    IslandKit.notify('Đã duyệt', 'Lệnh đã được thực thi.', 'success');
});`.trim();
                await navigator.clipboard.writeText(jsSnippet);
                IslandKit.notify('Đã sao chép JS', 'Mã lệnh điều khiển thông báo đã lưu vào clipboard.', 'success');
                return;
            }

            let htmlCode = block.innerHTML.trim().replace(/ style="[^"]*"/g, "");
            try {
                await navigator.clipboard.writeText(htmlCode);
                IslandKit.notify('Đã sao chép HTML', `Mã giao diện [${block.dataset.name}] đã lưu vào clipboard.`, 'success');
            } catch (e) {
                IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
            }
        });
    });

    // -------------------------------------------------------------
    // Alerts Trigger (Island ⇄ Fallback Toast)
    // -------------------------------------------------------------
    hostElement.querySelector('#test-alert-success')?.addEventListener('click', () => {
        IslandKit.notify('Thành công', 'Hệ thống giao diện mới đã được áp dụng hoàn hảo.', 'success');
    });

    hostElement.querySelector('#test-alert-error')?.addEventListener('click', () => {
        IslandKit.notify('Lỗi hệ thống', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', 'error');
    });

    hostElement.querySelector('#test-alert-info')?.addEventListener('click', () => {
        IslandKit.notify('Cập nhật trạng thái', 'Giao diện đang được render dưới nền, vui lòng đợi.', 'info');
    });

    hostElement.querySelector('#test-modal')?.addEventListener('click', () => {
        UI.showConfirm(
            'Xác nhận hành động?',
            'Bạn đang chuẩn bị xóa toàn bộ cấu hình mặc định. Hành động này không thể hoàn tác, bạn có muốn tiếp tục không?',
            () => IslandKit.notify('Đã xóa', 'Toàn bộ cấu hình đã được khôi phục.', 'success'),
            () => IslandKit.notify('Đã hủy', 'Lệnh đặt lại đã bị hủy bỏ.', 'info')
        );
    });

    // -------------------------------------------------------------
    // Live Activities trên Island (Áp dụng Accent động)
    // -------------------------------------------------------------
    hostElement.querySelector('#btn-pin-timer')?.addEventListener('click', () => {
        if (!IslandKit.isIslandActive()) {
            UI.showAlert('Live Timer', 'Dynamic Island hiện đang tắt trong Cài Đặt.', 'warning');
            return;
        }

        if (liveTimerInterval) clearInterval(liveTimerInterval);
        let sec = 0;
        const currentAccent = ThemeKit.getAccentColor();

        const updateClock = () => {
            sec++;
            const m = String(Math.floor(sec / 60)).padStart(2, '0');
            const s = String(sec % 60).padStart(2, '0');
            IslandKit.setLiveView(`
                <div class="w-full h-full flex items-center justify-between px-2 text-[10px] font-mono select-none">
                    <span style="color: ${currentAccent};" class="font-bold flex items-center gap-1">
                        <i class="fas fa-stopwatch text-[8px] animate-pulse"></i> REC
                    </span>
                    <span class="text-white font-semibold">${m}:${s}</span>
                </div>
            `, () => {
                IslandKit.notify('Đồng hồ bấm giờ', `Đã đếm được ${sec}s.`, 'info');
            });
        };

        updateClock();
        liveTimerInterval = setInterval(updateClock, 1000);
        IslandKit.notify('Live Timer', 'Đã ghim đồng hồ lên Island.', 'success');
    });

    hostElement.querySelector('#btn-pin-sync')?.addEventListener('click', () => {
        if (!IslandKit.isIslandActive()) {
            UI.showAlert('Live Sync', 'Tiến trình sao lưu đang tiếp tục ngầm.', 'info');
            return;
        }

        if (liveTimerInterval) { clearInterval(liveTimerInterval); liveTimerInterval = null; }
        const currentAccent = ThemeKit.getAccentColor();

        IslandKit.setLiveView(`
            <div class="w-full h-full flex items-center justify-between px-2 text-[10px] font-mono select-none">
                <span style="color: ${currentAccent};" class="font-bold flex items-center gap-1">
                    <i class="fas fa-arrows-rotate text-[8px] animate-spin"></i> SYNC
                </span>
                <span class="text-white font-semibold">96%</span>
            </div>
        `, () => {
            IslandKit.notify('Đồng bộ', 'Tiến trình truyền dữ liệu đạt 96%.', 'info');
        });
        IslandKit.notify('Đồng bộ', 'Đã ghim tiến trình lên Island.', 'info');
    });

    hostElement.querySelector('#btn-clear-island')?.addEventListener('click', () => {
        if (liveTimerInterval) { clearInterval(liveTimerInterval); liveTimerInterval = null; }
        IslandKit.resetLiveView();
        IslandKit.notify('Dynamic Island', 'Đã xóa tiến trình ghim.', 'info');
    });

    // -------------------------------------------------------------
    // Segmented Tabs Switcher
    // -------------------------------------------------------------
    const tabs = hostElement.querySelectorAll('#ui-kit-tabs .tab-btn');
    const panes = hostElement.querySelectorAll('.tab-pane');

    const activeClass = 'tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all';
    const inactiveClass = 'tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all border border-transparent';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.className = inactiveClass; });
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });

            tab.className = activeClass;
            const target = hostElement.querySelector(`#${tab.getAttribute('data-target')}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('block');
            }
        });
    });

    // -------------------------------------------------------------
    // Range Slider
    // -------------------------------------------------------------
    const rangeWrapper = hostElement.querySelector('.range-wrapper');
    if (rangeWrapper) {
        const range = rangeWrapper.querySelector('.range');
        const valSpan = rangeWrapper.querySelector('.range-value');
        range?.addEventListener('input', (e) => {
            if (valSpan) valSpan.textContent = `${e.target.value}%`;
        });
    }

    // -------------------------------------------------------------
    // Switch Toggle
    // -------------------------------------------------------------
    const switchBtn = hostElement.querySelector('#demo-toggle-switch');
    switchBtn?.addEventListener('click', () => {
        switchBtn.classList.toggle('active');
        const active = switchBtn.classList.contains('active');
        IslandKit.notify('Đồng bộ', active ? 'Đã bật đồng bộ tự động.' : 'Đã tắt đồng bộ.', active ? 'success' : 'warning');
    });

    // -------------------------------------------------------------
    // Fullscreen Media
    // -------------------------------------------------------------
    hostElement.querySelector('#btn-view-fs')?.addEventListener('click', () => {
        UI.showMediaFullscreen('/Asset/logo/logo.png', 'image');
    });
}