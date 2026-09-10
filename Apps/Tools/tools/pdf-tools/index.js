import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER
// =============================================================================
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') || 
               localStorage.getItem('hunqos_icon_custom_bg') || 
               DEFAULT_EMERALD;
    },
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
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="pdf-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #pdf-root-container {
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
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }

            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

            .is-dragging {
                border-color: var(--kit-accent) !important;
                background-color: color-mix(in srgb, var(--kit-accent) 6%, transparent) !important;
            }

            .thumb-card {
                position: relative;
                border-radius: 14px;
                overflow: hidden;
                border: 2px solid transparent;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                cursor: pointer;
                user-select: none;
                background: #f4f4f5;
            }
            .dark .thumb-card { background: #18181b; }
            .thumb-card img { width: 100%; height: auto; display: block; object-fit: contain; pointer-events: none; }
            .thumb-card .page-num {
                position: absolute;
                bottom: 4px;
                right: 4px;
                background: rgba(0,0,0,0.65);
                color: #ffffff;
                font-size: 9px;
                font-weight: 700;
                padding: 1.5px 5px;
                border-radius: 6px;
                backdrop-filter: blur(4px);
                pointer-events: none;
            }
            .thumb-card.selected {
                border-color: var(--kit-accent) !important;
                box-shadow: 0 0 0 1px var(--kit-accent);
            }
            .thumb-card.selected::after {
                content: '\\f00c';
                font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free';
                font-weight: 900;
                position: absolute;
                top: 4px;
                right: 4px;
                background: var(--kit-accent);
                color: #ffffff;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 9px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }

            .org-card { cursor: grab; }
            .org-card:active { cursor: grabbing; }
            .org-card.dragging { opacity: 0.4; border: 2px dashed var(--kit-accent) !important; }
            .org-del {
                position: absolute;
                top: 4px;
                right: 4px;
                width: 20px;
                height: 20px;
                background: rgba(244, 63, 94, 0.9);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .org-card:hover .org-del { opacity: 1; }

            .preview-workspace {
                position: relative;
                background: #ffffff;
                border: 1px solid rgba(0,0,0,0.06);
                border-radius: 18px;
                display: inline-block;
                user-select: none;
                touch-action: none;
                overflow: hidden;
                width: 100%;
                max-width: 520px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .dark .preview-workspace {
                border-color: rgba(255,255,255,0.08);
                background: #1c1c1e;
            }
            .preview-workspace img.bg-page { display: block; width: 100%; height: auto; pointer-events: none; }
            
            .drag-element {
                position: absolute;
                cursor: move;
                border: 1.5px dashed var(--kit-accent);
                padding: 2px;
                transform: translate(-50%, -50%);
                z-index: 10;
                transform-origin: center center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .drag-element::after {
                content: '';
                position: absolute;
                width: 8px;
                height: 8px;
                background: var(--kit-accent);
                border-radius: 50%;
                bottom: -4px;
                right: -4px;
                pointer-events: none;
            }
            .drag-element img { display: block; width: 100%; height: auto; pointer-events: none; }
            .drag-element span { font-weight: 700; pointer-events: none; white-space: nowrap; line-height: 1; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Workspace</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">PDF Studio Pro</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Xử lý toàn bộ trên trình duyệt, trực quan với dàn trang và kéo thả định vị.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-pdf-clear" class="h-10 px-3.5 rounded-[14px] bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm hidden">
                        <i class="fas fa-trash-can text-xs"></i> Xóa tài liệu
                    </button>
                </div>
            </div>

            <!-- TAB NAVIGATION CONTROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="pdf-tabs">
                    <button class="pdf-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-target="pane-merge">
                        <i class="fas fa-layer-group text-[11px]"></i> Ghép PDF
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-split">
                        <i class="fas fa-cut text-[11px]"></i> Tách PDF
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-compress">
                        <i class="fas fa-compress text-[11px]"></i> Nén PDF
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-sign">
                        <i class="fas fa-signature text-[11px]"></i> Ký PDF
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-convert">
                        <i class="fas fa-file-image text-[11px]"></i> Chuyển sang ảnh
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-extract">
                        <i class="fas fa-images text-[11px]"></i> Xuất hình ảnh
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-organize">
                        <i class="fas fa-arrow-down-1-9 text-[11px]"></i> Sắp xếp trang
                    </button>
                    <button class="pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-watermark">
                        <i class="fas fa-stamp text-[11px]"></i> Watermark
                    </button>
                </div>
            </div>

            <!-- GLOBAL DROPZONE / FILE STATUS -->
            <div id="global-dropzone" class="rounded-[24px] bg-white dark:bg-[#161618] border-2 border-dashed border-black/[0.08] dark:border-white/[0.12] p-5 shadow-sm transition-all cursor-pointer overflow-hidden group min-h-[140px] flex items-center justify-center relative">
                <input type="file" id="global-file-input" accept="application/pdf" class="hidden">
                
                <div class="flex flex-col items-center text-center group-active:scale-95 transition-transform" id="dz-idle">
                    <div class="w-12 h-12 rounded-[16px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center mb-2 shadow-sm">
                        <i class="fas fa-file-pdf text-xl"></i>
                    </div>
                    <span class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Tải lên tệp PDF</span>
                    <span class="text-[11px] text-zinc-400 mt-0.5">Kéo thả tài liệu vào đây hoặc nhấn để chọn</span>
                </div>

                <div class="hidden flex-col items-center gap-2.5 py-4" id="dz-loading">
                    <i class="fas fa-circle-notch fa-spin text-accent-theme text-xl"></i>
                    <span class="text-xs font-bold text-zinc-600 dark:text-zinc-300" id="dz-loading-text">Đang phân tích cấu trúc trang...</span>
                </div>

                <div class="hidden flex-row items-center justify-center w-full px-4 gap-4 py-1" id="dz-info">
                    <div class="w-16 h-20 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.05] dark:border-white/[0.08] shadow-sm rounded-[12px] overflow-hidden shrink-0 flex items-center justify-center">
                        <canvas id="dz-preview-canvas" class="w-full h-full object-cover"></canvas>
                    </div>
                    <div class="flex flex-col flex-1 min-w-0">
                        <span class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate" id="dz-filename">filename.pdf</span>
                        <div class="flex items-center gap-2 mt-1.5">
                            <span class="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-[8px]" id="dz-filesize">-- MB</span>
                            <span class="text-[10px] font-mono font-bold text-accent-theme bg-accent-theme-alpha px-2 py-0.5 rounded-[8px]" id="dz-pagecount">-- Trang</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ================= PANES CONTAINER ================= -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm">
                
                <!-- 1. MERGE -->
                <div id="pane-merge" class="pdf-pane block space-y-4">
                    <div class="flex justify-between items-center px-1">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Danh sách tập tin cần ghép</span>
                        <button id="btn-merge-add" class="h-8 px-3 rounded-[10px] bg-accent-theme-alpha text-accent-theme font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all">
                            <i class="fas fa-plus text-[10px]"></i> Thêm tập tin
                        </button>
                    </div>
                    
                    <div id="merge-list" class="flex flex-col gap-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                        <div class="text-center text-xs font-medium text-zinc-400 py-12" id="merge-empty">Hãy thêm tối thiểu 2 tập tin PDF để bắt đầu ghép.</div>
                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="merge" disabled>
                        <i class="fas fa-layer-group text-xs"></i> <span>Ghép nối PDF</span>
                    </button>
                </div>

                <!-- 2. SPLIT -->
                <div id="pane-split" class="pdf-pane hidden space-y-4">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Đã chọn: <span id="split-selected-count" class="text-accent-theme font-mono font-bold">0</span> trang
                        </span>
                        <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
                            <button id="sel-all" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Tất cả</button>
                            <button id="sel-odd" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Trang lẻ</button>
                            <button id="sel-even" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Trang chẵn</button>
                            <button id="sel-clear" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Bỏ chọn</button>
                        </div>
                    </div>

                    <div class="relative">
                        <select id="split-mode" class="zen-select w-full h-11 px-3.5 pr-8 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer focus:border-accent-theme transition-all" disabled>
                            <option value="range">Gộp các trang đã chọn thành 1 tập tin duy nhất</option>
                            <option value="burst">Tách mỗi trang đã chọn thành từng tập tin riêng lẻ (.ZIP)</option>
                        </select>
                        <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                    </div>

                    <div id="split-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[340px] overflow-y-auto custom-scrollbar p-1">
                        <div class="col-span-full text-center text-xs font-medium text-zinc-400 py-10">Vui lòng tải tập tin PDF lên trước.</div>
                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="split" disabled>
                        <i class="fas fa-cut text-xs"></i> <span>Tách và tải xuống</span>
                    </button>
                </div>

                <!-- 3. COMPRESS -->
                <div id="pane-compress" class="pdf-pane hidden space-y-4">
                    <div class="rounded-[18px] bg-accent-theme-alpha border border-accent-theme/20 p-6 text-center flex flex-col items-center gap-2.5">
                        <div class="w-12 h-12 rounded-[16px] bg-white dark:bg-[#161618] flex items-center justify-center text-accent-theme shadow-sm">
                            <i class="fas fa-wrench text-lg"></i>
                        </div>
                        <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tính năng đang hoàn thiện</span>
                        <p class="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-md">Thuật toán nén luồng raster trực tiếp trên bộ nhớ máy khách (Client-side) đang được tối ưu hóa nhằm bảo đảm không suy giảm định dạng chữ.</p>
                    </div>
                </div>

                <!-- 4. SIGN -->
                <div id="pane-sign" class="pdf-pane hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="md:col-span-1 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-4 border border-dashed border-black/[0.1] dark:border-white/[0.15] flex flex-col items-center justify-center cursor-pointer group h-[120px] relative overflow-hidden" id="sign-img-upload">
                            <input type="file" id="sign-file" accept="image/*" class="hidden">
                            <i class="fas fa-signature text-xl text-accent-theme mb-1 group-hover:scale-110 transition-transform"></i>
                            <span class="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 text-center">Tải ảnh chữ ký</span>
                            <img id="sign-preview" class="hidden absolute inset-0 w-full h-full object-contain p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                        </div>

                        <div class="md:col-span-2 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] flex flex-col justify-center space-y-2.5">
                            <div class="relative">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Trang đặt chữ ký</label>
                                <select id="sign-page-select" class="zen-select w-full h-9 px-3 pr-7 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer" disabled>
                                    <option value="">Chờ tải tệp...</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-2.5 bottom-2.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                            </div>

                            <div class="flex items-center gap-3">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">Kích cỡ (<span id="val-sign-size" class="text-accent-theme">30</span>%)</span>
                                <input type="range" id="sign-size" min="5" max="100" value="30" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" disabled>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-4 flex flex-col items-center border border-black/[0.04] dark:border-white/[0.06]">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Kéo thả để định vị chữ ký trên trang</span>
                        <div id="sign-workspace" class="preview-workspace hidden">
                            <img id="sign-bg-page" class="bg-page">
                            <div id="sign-draggable" class="drag-element hidden" style="width: 30%;">
                                <img id="sign-drag-img" src="">
                            </div>
                        </div>
                        <div id="sign-ws-empty" class="text-xs text-zinc-400 py-10">Vui lòng nạp tệp PDF và chọn ảnh chữ ký.</div>
                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="sign" disabled>
                        <i class="fas fa-signature text-xs"></i> <span>Đóng dấu chữ ký</span>
                    </button>
                </div>

                <!-- 5. CONVERT -->
                <div id="pane-convert" class="pdf-pane hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] relative">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Định dạng trích xuất</label>
                            <select id="conv-format" class="zen-select w-full h-10 px-3 pr-7 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer">
                                <option value="jpg">Ảnh JPG (.ZIP)</option>
                                <option value="png">Ảnh PNG (.ZIP)</option>
                            </select>
                            <i class="fas fa-chevron-down absolute right-6 bottom-3.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                        </div>

                        <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] relative">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Khoảng trang chọn</label>
                            <select id="conv-mode" class="zen-select w-full h-10 px-3 pr-7 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer" disabled>
                                <option value="all">Toàn bộ trang</option>
                                <option value="odd">Các trang lẻ (1, 3, 5...)</option>
                                <option value="even">Các trang chẵn (2, 4, 6...)</option>
                                <option value="custom">Tùy chỉnh khoảng trang</option>
                            </select>
                            <i class="fas fa-chevron-down absolute right-6 bottom-3.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                            <input type="text" id="conv-range" class="w-full h-9 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[10px] px-3 mt-2 outline-none text-xs font-semibold text-zinc-900 dark:text-white hidden" placeholder="VD: 1, 3, 5-8">
                        </div>
                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="convert" disabled>
                        <i class="fas fa-file-image text-xs"></i> <span>Chuyển đổi sang ảnh</span>
                    </button>
                </div>

                <!-- 6. EXTRACT -->
                <div id="pane-extract" class="pdf-pane hidden space-y-4">
                    <div id="ext-pre-scan" class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-6 text-center border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-2">
                        <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Quét tìm các khối hình ảnh nhúng</span>
                        <p class="text-[11px] text-zinc-400">Trích xuất trực tiếp toàn bộ ảnh raw nhúng bên trong trang PDF.</p>
                        <button id="btn-extract-scan" class="btn-action h-10 px-5 rounded-[12px] bg-accent-theme text-white font-bold text-xs active:scale-95 transition-all shadow-sm mt-2 opacity-50 pointer-events-none" data-type="extract-scan" disabled>
                            <i class="fas fa-magnifying-glass text-xs mr-1"></i> Quét ảnh
                        </button>
                    </div>

                    <div id="ext-workspace" class="hidden flex-col space-y-3">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                Tìm thấy: <span id="ext-selected-count" class="text-accent-theme font-mono font-bold">0</span> ảnh
                            </span>
                            <div class="flex gap-1.5">
                                <button id="ext-sel-all" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Tất cả</button>
                                <button id="ext-sel-clear" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] active:scale-95 transition-all">Bỏ chọn</button>
                            </div>
                        </div>

                        <div id="ext-grid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto custom-scrollbar p-1"></div>
                    </div>

                    <button id="btn-extract-download" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide items-center justify-center gap-2 active:scale-95 transition-all shadow-sm hidden" disabled>
                        <i class="fas fa-download text-xs"></i> <span>Tải hình ảnh đã chọn</span>
                    </button>
                </div>

                <!-- 7. ORGANIZE -->
                <div id="pane-organize" class="pdf-pane hidden space-y-4">
                    <div class="flex justify-between items-center px-1">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kéo thả để sắp xếp lại vị trí hoặc xóa trang</span>
                    </div>

                    <div id="org-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
                        <div class="col-span-full text-center text-xs font-medium text-zinc-400 py-10">Vui lòng nạp tệp PDF để chỉnh sửa thứ tự.</div>
                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="organize" disabled>
                        <i class="fas fa-check text-xs"></i> <span>Lưu cấu trúc mới</span>
                    </button>
                </div>

                <!-- 8. WATERMARK -->
                <div id="pane-watermark" class="pdf-pane hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                        
                        <div class="md:col-span-5 space-y-3">
                            <div class="rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                                <div>
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nội dung đóng dấu</label>
                                    <input type="text" id="wm-text" class="w-full h-9 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[10px] px-3 outline-none text-xs font-semibold text-zinc-900 dark:text-white" value="HUNQOS WATERMARK" disabled>
                                </div>

                                <div class="relative">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Phông chữ</label>
                                    <select id="wm-font" class="zen-select w-full h-9 px-3 pr-7 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer" disabled>
                                        <option value="Helvetica">Helvetica (Mặc định)</option>
                                        <option value="Times-Roman">Times Roman</option>
                                        <option value="Courier">Courier (Mono)</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-2.5 bottom-2.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>

                                <div class="flex items-center justify-between pt-1">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Màu sắc dấu</span>
                                    <input type="color" id="wm-color" value="#10b981" class="w-7 h-7 rounded-[8px] cursor-pointer bg-transparent border-none p-0" disabled>
                                </div>

                                <div class="space-y-1">
                                    <div class="flex justify-between text-[11px] font-medium text-zinc-500">
                                        <span>Độ mờ đục</span><span id="val-wm-opacity" class="font-mono font-bold text-accent-theme">30%</span>
                                    </div>
                                    <input type="range" id="wm-opacity" min="0.1" max="1" step="0.05" value="0.3" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" disabled>
                                </div>

                                <div class="space-y-1">
                                    <div class="flex justify-between text-[11px] font-medium text-zinc-500">
                                        <span>Cỡ chữ</span><span id="val-wm-size" class="font-mono font-bold text-accent-theme">36</span>
                                    </div>
                                    <input type="range" id="wm-size" min="10" max="120" value="36" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" disabled>
                                </div>

                                <div class="space-y-1">
                                    <div class="flex justify-between text-[11px] font-medium text-zinc-500">
                                        <span>Góc xoay</span><span id="val-wm-rotate" class="font-mono font-bold text-accent-theme">0°</span>
                                    </div>
                                    <input type="range" id="wm-rotate" min="-180" max="180" value="0" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer" disabled>
                                </div>

                                <div class="relative pt-1">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Áp dụng cho trang</label>
                                    <select id="wm-page-select" class="zen-select w-full h-9 px-3 pr-7 rounded-[10px] bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer" disabled>
                                        <option value="all">Tất cả các trang</option>
                                        <option value="1">Chỉ trang 1</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-2.5 bottom-2.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>
                            </div>
                        </div>

                        <div class="md:col-span-7 rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-4 border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center justify-center">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Kéo thả để định vị nhãn Watermark</span>
                            <div id="wm-workspace" class="preview-workspace hidden">
                                <img id="wm-bg-page" class="bg-page">
                                <div id="wm-draggable" class="drag-element hidden">
                                    <span id="wm-drag-text">HUNQOS WATERMARK</span>
                                </div>
                            </div>
                            <div id="wm-ws-empty" class="text-xs text-zinc-400 py-10">Vui lòng nạp tập tin PDF.</div>
                        </div>

                    </div>

                    <button class="btn-action w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm opacity-50 pointer-events-none" data-type="watermark" disabled>
                        <i class="fas fa-stamp text-xs"></i> <span>Đóng dấu Watermark</span>
                    </button>
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
    const rootContainer = hostElement.querySelector('#pdf-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Dynamic Lib Loaders
    const loadPdfLib = () => new Promise((res) => {
        if (window.PDFLib) return res(window.PDFLib);
        const script = document.createElement('script');
        script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
        script.onload = () => res(window.PDFLib);
        document.head.appendChild(script);
    });

    const loadPdfJs = () => new Promise((res) => {
        if (window.pdfjsLib) return res(window.pdfjsLib);
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => {
            window.pdfjsLib = window['pdfjs-dist/build/pdf'];
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            res(window.pdfjsLib);
        };
        document.head.appendChild(script);
    });

    const loadJSZip = () => new Promise((res) => {
        if (window.JSZip) return res(window.JSZip);
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => res(window.JSZip);
        document.head.appendChild(script);
    });

    // State Variables
    let activeFile = null;
    let mergeFiles = [];
    let pdfDocInfo = null; 
    let pdfThumbnails = []; 
    let extractedImages = []; 
    
    let signImageBytes = null;
    let currentMode = 'merge';
    
    let splitSelection = new Set();
    let extractSelection = new Set();
    let orgPageOrder = [];
    
    const signPos = { x: 0.5, y: 0.5 };
    const wmPos = { x: 0.5, y: 0.5 };

    // Scoped Elements Query
    const tabs = hostElement.querySelectorAll('.pdf-tab');
    const panes = hostElement.querySelectorAll('.pdf-pane');
    const btnClearAll = hostElement.querySelector('#btn-pdf-clear');
    const actionBtns = hostElement.querySelectorAll('.btn-action');
    
    const gDropzone = hostElement.querySelector('#global-dropzone');
    const gInput = hostElement.querySelector('#global-file-input');
    const dzIdle = hostElement.querySelector('#dz-idle');
    const dzLoading = hostElement.querySelector('#dz-loading');
    const dzInfo = hostElement.querySelector('#dz-info');

    // Tab Classes Standard
    const activeTabClass = 'pdf-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveTabClass = 'pdf-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    const formatBytes = (b) => {
        if (b === 0) return '0 B';
        const k = 1024;
        const s = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
    };

    const downloadBlob = (bytes, filename, type = 'application/pdf') => {
        const blob = new Blob([bytes], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const toggleActionBtns = (enabled) => {
        actionBtns.forEach(btn => {
            if (btn.dataset.type === 'merge') {
                const canMerge = mergeFiles.length >= 2;
                btn.disabled = !canMerge;
                btn.classList.toggle('opacity-50', !canMerge);
                btn.classList.toggle('pointer-events-none', !canMerge);
            } else if (btn.dataset.type === 'compress') {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'pointer-events-none');
            } else if (btn.dataset.type === 'extract-scan') {
                btn.disabled = !enabled;
                btn.classList.toggle('opacity-50', !enabled);
                btn.classList.toggle('pointer-events-none', !enabled);
            } else if (btn.dataset.type !== 'extract') {
                btn.disabled = !enabled;
                btn.classList.toggle('opacity-50', !enabled);
                btn.classList.toggle('pointer-events-none', !enabled);
            }
        });
        
        ['split-mode', 'sign-page-select', 'sign-size', 'conv-mode', 'conv-format', 'wm-text', 'wm-font', 'wm-size', 'wm-rotate', 'wm-opacity', 'wm-color', 'wm-page-select'].forEach(id => {
            const el = hostElement.querySelector(`#${id}`);
            if (el) el.disabled = !enabled;
        });
    };

    // Responsive Canvas/DOM Drag Math
    const makeDraggable = (workspace, dragEl, posState) => {
        if (!workspace || !dragEl) return;
        let isDragging = false;

        const updatePos = (clientX, clientY) => {
            const rect = workspace.getBoundingClientRect();
            let x = clientX - rect.left;
            let y = clientY - rect.top;

            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));

            dragEl.style.left = `${(x / rect.width) * 100}%`;
            dragEl.style.top = `${(y / rect.height) * 100}%`;

            posState.x = x / rect.width;
            posState.y = y / rect.height;
        };

        const startDrag = (e) => {
            isDragging = true;
            e.preventDefault();
            e.stopPropagation();
        };

        const endDrag = () => { isDragging = false; };

        dragEl.onmousedown = startDrag;
        window.addEventListener('mousemove', (e) => { if (isDragging) updatePos(e.clientX, e.clientY); });
        window.addEventListener('mouseup', endDrag);

        dragEl.ontouchstart = startDrag;
        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                updatePos(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });
        window.addEventListener('touchend', endDrag);

        workspace.onmousedown = (e) => {
            if (e.target === workspace || e.target.classList.contains('bg-page')) {
                updatePos(e.clientX, e.clientY);
            }
        };
    };

    makeDraggable(hostElement.querySelector('#sign-workspace'), hostElement.querySelector('#sign-draggable'), signPos);
    makeDraggable(hostElement.querySelector('#wm-workspace'), hostElement.querySelector('#wm-draggable'), wmPos);

    // Segmented Navigation Handlers
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.className = inactiveTabClass; });
            tab.className = activeTabClass;

            currentMode = tab.dataset.target.replace('pane-', '');
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });

            const activePane = hostElement.querySelector(`#${tab.dataset.target}`);
            if (activePane) {
                activePane.classList.remove('hidden');
                activePane.classList.add('block');
            }

            gDropzone.style.display = currentMode === 'merge' ? 'none' : 'flex';
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        };
    });
    gDropzone.style.display = 'none';

    // 1. Merge Handlers
    const mList = hostElement.querySelector('#merge-list');
    const mEmpty = hostElement.querySelector('#merge-empty');

    const renderMergeList = () => {
        if (mergeFiles.length === 0) {
            mList.innerHTML = '';
            mList.appendChild(mEmpty);
            mEmpty.style.display = 'block';
            toggleActionBtns(false);
            btnClearAll?.classList.add('hidden');
            return;
        }
        mEmpty.style.display = 'none';
        mList.innerHTML = '';
        btnClearAll?.classList.remove('hidden');

        mergeFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]';
            item.innerHTML = `
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-6 h-6 rounded-[8px] bg-accent-theme text-white flex items-center justify-center text-[10px] font-bold shrink-0">${index + 1}</span>
                    <span class="text-xs font-bold text-zinc-900 dark:text-white truncate">${file.name}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0 ml-2">
                    <button class="m-up w-7 h-7 rounded-[8px] bg-white dark:bg-[#27272a] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"><i class="fas fa-chevron-up text-[10px]"></i></button>
                    <button class="m-down w-7 h-7 rounded-[8px] bg-white dark:bg-[#27272a] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"><i class="fas fa-chevron-down text-[10px]"></i></button>
                    <button class="m-del w-7 h-7 rounded-[8px] bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center transition-colors"><i class="fas fa-times text-[10px]"></i></button>
                </div>
            `;
            item.querySelector('.m-up').onclick = () => {
                if (index > 0) {
                    [mergeFiles[index - 1], mergeFiles[index]] = [mergeFiles[index], mergeFiles[index - 1]];
                    renderMergeList();
                }
            };
            item.querySelector('.m-down').onclick = () => {
                if (index < mergeFiles.length - 1) {
                    [mergeFiles[index + 1], mergeFiles[index]] = [mergeFiles[index], mergeFiles[index + 1]];
                    renderMergeList();
                }
            };
            item.querySelector('.m-del').onclick = () => {
                mergeFiles.splice(index, 1);
                renderMergeList();
            };
            mList.appendChild(item);
        });
        toggleActionBtns(true);
    };

    hostElement.querySelector('#btn-merge-add')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.multiple = true;
        input.onchange = (e) => {
            mergeFiles.push(...Array.from(e.target.files).filter(f => f.type === 'application/pdf'));
            renderMergeList();
        };
        input.click();
    });

    // 2. Split Selection Engine
    const renderSplitGrid = () => {
        const grid = hostElement.querySelector('#split-grid');
        grid.innerHTML = '';
        hostElement.querySelector('#split-selected-count').textContent = splitSelection.size;

        pdfThumbnails.forEach((imgSrc, index) => {
            const card = document.createElement('div');
            card.className = `thumb-card ${splitSelection.has(index) ? 'selected' : ''}`;
            card.innerHTML = `<img src="${imgSrc}"><div class="page-num">${index + 1}</div>`;

            card.onclick = () => {
                if (splitSelection.has(index)) {
                    splitSelection.delete(index);
                    card.classList.remove('selected');
                } else {
                    splitSelection.add(index);
                    card.classList.add('selected');
                }
                hostElement.querySelector('#split-selected-count').textContent = splitSelection.size;
                const btn = hostElement.querySelector('.btn-action[data-type="split"]');
                const hasSelected = splitSelection.size > 0;
                btn.disabled = !hasSelected;
                btn.classList.toggle('opacity-50', !hasSelected);
                btn.classList.toggle('pointer-events-none', !hasSelected);
            };
            grid.appendChild(card);
        });
    };

    hostElement.querySelector('#sel-all')?.addEventListener('click', () => {
        splitSelection = new Set(pdfThumbnails.map((_, i) => i));
        renderSplitGrid();
        const btn = hostElement.querySelector('.btn-action[data-type="split"]');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'pointer-events-none');
    });

    hostElement.querySelector('#sel-odd')?.addEventListener('click', () => {
        splitSelection = new Set(pdfThumbnails.map((_, i) => i).filter(i => i % 2 === 0));
        renderSplitGrid();
        const btn = hostElement.querySelector('.btn-action[data-type="split"]');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'pointer-events-none');
    });

    hostElement.querySelector('#sel-even')?.addEventListener('click', () => {
        splitSelection = new Set(pdfThumbnails.map((_, i) => i).filter(i => i % 2 !== 0));
        renderSplitGrid();
        const btn = hostElement.querySelector('.btn-action[data-type="split"]');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'pointer-events-none');
    });

    hostElement.querySelector('#sel-clear')?.addEventListener('click', () => {
        splitSelection.clear();
        renderSplitGrid();
        const btn = hostElement.querySelector('.btn-action[data-type="split"]');
        btn.disabled = true;
        btn.classList.add('opacity-50', 'pointer-events-none');
    });

    // 3. Organize Pages
    const renderOrganizeGrid = () => {
        const grid = hostElement.querySelector('#org-grid');
        grid.innerHTML = '';

        orgPageOrder.forEach((originalIndex, currentIndex) => {
            const imgSrc = pdfThumbnails[originalIndex];
            const card = document.createElement('div');
            card.className = 'thumb-card org-card';
            card.draggable = true;
            card.dataset.index = currentIndex;
            card.innerHTML = `<img src="${imgSrc}"><div class="page-num">${originalIndex + 1}</div><button class="org-del"><i class="fas fa-times"></i></button>`;

            card.querySelector('.org-del').onclick = (e) => {
                e.stopPropagation();
                orgPageOrder.splice(currentIndex, 1);
                renderOrganizeGrid();
            };

            card.ondragstart = (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', currentIndex);
                setTimeout(() => card.classList.add('dragging'), 0);
            };
            card.ondragend = () => card.classList.remove('dragging');
            card.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            };
            card.ondrop = (e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = currentIndex;
                if (fromIdx !== toIdx) {
                    const movedItem = orgPageOrder.splice(fromIdx, 1)[0];
                    orgPageOrder.splice(toIdx, 0, movedItem);
                    renderOrganizeGrid();
                }
            };
            grid.appendChild(card);
        });
    };

    // 4. Extract Images UI
    const renderExtractGrid = () => {
        const grid = hostElement.querySelector('#ext-grid');
        grid.innerHTML = '';
        hostElement.querySelector('#ext-selected-count').textContent = extractSelection.size;

        extractedImages.forEach((imgSrc, index) => {
            const card = document.createElement('div');
            card.className = `thumb-card ${extractSelection.has(index) ? 'selected' : ''}`;
            card.innerHTML = `<img src="${imgSrc}">`;

            card.onclick = () => {
                if (extractSelection.has(index)) {
                    extractSelection.delete(index);
                    card.classList.remove('selected');
                } else {
                    extractSelection.add(index);
                    card.classList.add('selected');
                }
                hostElement.querySelector('#ext-selected-count').textContent = extractSelection.size;
                const dlBtn = hostElement.querySelector('#btn-extract-download');
                dlBtn.disabled = extractSelection.size === 0;
            };
            grid.appendChild(card);
        });
    };

    hostElement.querySelector('#ext-sel-all')?.addEventListener('click', () => {
        extractSelection = new Set(extractedImages.map((_, i) => i));
        renderExtractGrid();
        hostElement.querySelector('#btn-extract-download').disabled = false;
    });

    hostElement.querySelector('#ext-sel-clear')?.addEventListener('click', () => {
        extractSelection.clear();
        renderExtractGrid();
        hostElement.querySelector('#btn-extract-download').disabled = true;
    });

    // 5. Global File Load Pipeline
    const loadGlobalFile = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            return IslandKit.notify('Tập tin lỗi', 'Chỉ chấp nhận định dạng PDF hợp lệ.', 'warning');
        }

        dzIdle.classList.add('hidden');
        dzLoading.classList.remove('hidden');
        dzLoading.classList.add('flex');

        hostElement.querySelector('#dz-filename').textContent = file.name;
        hostElement.querySelector('#dz-filesize').textContent = formatBytes(file.size);

        activeFile = file;
        btnClearAll?.classList.remove('hidden');

        try {
            pdfDocInfo = await file.arrayBuffer();
            const pdfjs = await loadPdfJs();
            const pdfjsDoc = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
            const pageCount = pdfjsDoc.numPages;
            hostElement.querySelector('#dz-pagecount').textContent = `${pageCount} Trang`;

            pdfThumbnails = [];
            for (let i = 1; i <= pageCount; i++) {
                hostElement.querySelector('#dz-loading-text').textContent = `Đang kết xuất trang ${i}/${pageCount}...`;
                const page = await pdfjsDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                pdfThumbnails.push(canvas.toDataURL('image/jpeg', 0.8));

                if (i === 1) {
                    const dzCanvas = hostElement.querySelector('#dz-preview-canvas');
                    if (dzCanvas) {
                        const ctx = dzCanvas.getContext('2d');
                        dzCanvas.width = viewport.width;
                        dzCanvas.height = viewport.height;
                        ctx.drawImage(canvas, 0, 0);
                    }
                }
            }

            dzLoading.classList.add('hidden');
            dzLoading.classList.remove('flex');
            dzInfo.classList.remove('hidden');
            dzInfo.classList.add('flex');

            splitSelection = new Set();
            orgPageOrder = Array.from({ length: pageCount }, (_, i) => i);
            renderSplitGrid();
            renderOrganizeGrid();

            extractedImages = [];
            extractSelection.clear();
            hostElement.querySelector('#ext-pre-scan').style.display = 'block';
            hostElement.querySelector('#ext-workspace').classList.remove('flex');
            hostElement.querySelector('#ext-workspace').classList.add('hidden');
            hostElement.querySelector('#btn-extract-download').classList.remove('flex');
            hostElement.querySelector('#btn-extract-download').classList.add('hidden');

            hostElement.querySelector('#sign-bg-page').src = pdfThumbnails[0];
            hostElement.querySelector('#wm-bg-page').src = pdfThumbnails[0];

            const sSelect = hostElement.querySelector('#sign-page-select');
            sSelect.innerHTML = '';
            for (let i = 1; i <= pageCount; i++) sSelect.add(new Option(`Trang ${i}`, i));
            sSelect.disabled = false;
            sSelect.onchange = (e) => {
                hostElement.querySelector('#sign-bg-page').src = pdfThumbnails[parseInt(e.target.value) - 1];
            };

            const wSelect = hostElement.querySelector('#wm-page-select');
            wSelect.innerHTML = '<option value="all">Tất cả các trang</option>';
            for (let i = 1; i <= pageCount; i++) wSelect.add(new Option(`Chỉ trang ${i}`, i));
            wSelect.disabled = false;
            wSelect.onchange = (e) => {
                if (e.target.value !== 'all') {
                    hostElement.querySelector('#wm-bg-page').src = pdfThumbnails[parseInt(e.target.value) - 1];
                }
            };

            hostElement.querySelector('#sign-workspace').classList.remove('hidden');
            hostElement.querySelector('#sign-ws-empty').classList.add('hidden');
            hostElement.querySelector('#wm-workspace').classList.remove('hidden');
            hostElement.querySelector('#wm-ws-empty').classList.add('hidden');

            signPos.x = 0.5;
            signPos.y = 0.5;
            wmPos.x = 0.5;
            wmPos.y = 0.5;

            hostElement.querySelector('#sign-draggable').style.left = '50%';
            hostElement.querySelector('#sign-draggable').style.top = '50%';
            hostElement.querySelector('#wm-draggable').style.left = '50%';
            hostElement.querySelector('#wm-draggable').style.top = '50%';

            updateWmPreview();
            toggleActionBtns(true);

            const splitBtn = hostElement.querySelector('.btn-action[data-type="split"]');
            splitBtn.disabled = true;
            splitBtn.classList.add('opacity-50', 'pointer-events-none');
            IslandKit.notify('Tải thành công', `Đã nạp ${pageCount} trang PDF.`, 'success');
        } catch (e) {
            dzLoading.classList.add('hidden');
            dzLoading.classList.remove('flex');
            dzIdle.classList.remove('hidden');
            IslandKit.notify('Lỗi đọc tệp', 'Tập tin bị hỏng hoặc có bảo mật mật khẩu.', 'error');
            toggleActionBtns(false);
        }
    };

    gDropzone.onclick = (e) => {
        if (e.target.closest('#btn-pdf-clear')) return;
        gInput.click();
    };
    gInput.onchange = (e) => {
        if (e.target.files.length) loadGlobalFile(e.target.files[0]);
        gInput.value = '';
    };
    gDropzone.ondragover = (e) => {
        e.preventDefault();
        gDropzone.classList.add('is-dragging');
    };
    gDropzone.ondragleave = () => gDropzone.classList.remove('is-dragging');
    gDropzone.ondrop = (e) => {
        e.preventDefault();
        gDropzone.classList.remove('is-dragging');
        if (e.dataTransfer.files.length) loadGlobalFile(e.dataTransfer.files[0]);
    };

    btnClearAll.onclick = () => {
        mergeFiles = [];
        renderMergeList();
        activeFile = null;
        pdfDocInfo = null;
        pdfThumbnails = [];
        signImageBytes = null;
        extractedImages = [];

        dzIdle.classList.remove('hidden');
        dzInfo.classList.add('hidden');
        dzInfo.classList.remove('flex');
        dzLoading.classList.add('hidden');
        dzLoading.classList.remove('flex');

        hostElement.querySelector('#sign-preview').classList.add('hidden');
        hostElement.querySelector('#sign-img-upload i').classList.remove('hidden');
        hostElement.querySelector('#sign-img-upload span').classList.remove('hidden');
        hostElement.querySelector('#sign-draggable').classList.add('hidden');

        hostElement.querySelector('#split-grid').innerHTML = '<div class="col-span-full text-center text-xs text-zinc-400 py-10">Vui lòng nạp tập tin PDF lên trước.</div>';
        hostElement.querySelector('#org-grid').innerHTML = '<div class="col-span-full text-center text-xs text-zinc-400 py-10">Vui lòng nạp tập tin PDF lên trước.</div>';

        hostElement.querySelector('#sign-workspace').classList.add('hidden');
        hostElement.querySelector('#sign-ws-empty').classList.remove('hidden');
        hostElement.querySelector('#wm-workspace').classList.add('hidden');
        hostElement.querySelector('#wm-ws-empty').classList.remove('hidden');

        hostElement.querySelector('#ext-pre-scan').style.display = 'block';
        hostElement.querySelector('#ext-workspace').classList.remove('flex');
        hostElement.querySelector('#ext-workspace').classList.add('hidden');
        hostElement.querySelector('#btn-extract-download').classList.remove('flex');
        hostElement.querySelector('#btn-extract-download').classList.add('hidden');

        toggleActionBtns(false);
        btnClearAll.classList.add('hidden');
        IslandKit.notify('Đặt lại', 'Đã xóa toàn bộ bộ đệm tập tin.', 'info');
    };

    // UI Input Bindings
    hostElement.querySelector('#conv-mode').onchange = (e) => {
        const r = hostElement.querySelector('#conv-range');
        if (e.target.value === 'custom') {
            r.classList.remove('hidden');
            r.disabled = false;
        } else {
            r.classList.add('hidden');
            r.disabled = true;
        }
    };

    const updateWmPreview = () => {
        const t = hostElement.querySelector('#wm-text').value || "HUNQOS WATERMARK";
        const o = hostElement.querySelector('#wm-opacity').value;
        const c = hostElement.querySelector('#wm-color').value;
        const s = hostElement.querySelector('#wm-size').value;
        const r = hostElement.querySelector('#wm-rotate').value;
        const f = hostElement.querySelector('#wm-font').value;

        const dt = hostElement.querySelector('#wm-drag-text');
        dt.textContent = t;

        const rC = parseInt(c.slice(1, 3), 16);
        const gC = parseInt(c.slice(3, 5), 16);
        const bC = parseInt(c.slice(5, 7), 16);
        dt.style.color = `rgba(${rC},${gC},${bC},${o})`;
        dt.style.fontFamily = f;

        const wsWidth = hostElement.querySelector('#wm-workspace').clientWidth || 500;
        const scale = wsWidth / 595;
        dt.style.fontSize = `${s * scale}px`;

        hostElement.querySelector('#wm-draggable').style.transform = `translate(-50%, -50%) rotate(${r}deg)`;
        hostElement.querySelector('#val-wm-size').textContent = s;
        hostElement.querySelector('#val-wm-rotate').textContent = `${r}°`;
        hostElement.querySelector('#val-wm-opacity').textContent = `${Math.round(o * 100)}%`;
    };

    ['wm-text', 'wm-opacity', 'wm-color', 'wm-size', 'wm-rotate', 'wm-font'].forEach(id => {
        const el = hostElement.querySelector(`#${id}`);
        if (el) el.addEventListener('input', updateWmPreview);
    });

    hostElement.querySelector('#sign-size')?.addEventListener('input', (e) => {
        const scale = e.target.value;
        const dragEl = hostElement.querySelector('#sign-draggable');
        dragEl.style.width = `${scale}%`;
        hostElement.querySelector('#val-sign-size').textContent = scale;
    });

    // Extract Images Action
    hostElement.querySelector('.btn-action[data-type="extract-scan"]').onclick = async (e) => {
        const btn = e.currentTarget;
        const oriT = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Đang quét...';
        btn.disabled = true;

        try {
            const pdfjs = await loadPdfJs();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
            extractedImages = [];
            extractSelection.clear();

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const ops = await page.getOperatorList();
                for (let j = 0; j < ops.fnArray.length; j++) {
                    if (ops.fnArray[j] === window.pdfjsLib.OPS.paintImageXObject) {
                        const objId = ops.argsArray[j][0];
                        try {
                            const imgObj = await page.objs.get(objId);
                            const canvas = document.createElement('canvas');
                            canvas.width = imgObj.width;
                            canvas.height = imgObj.height;
                            const ctx = canvas.getContext('2d');
                            const imgData = ctx.createImageData(imgObj.width, imgObj.height);
                            imgData.data.set(imgObj.data);
                            ctx.putImageData(imgData, 0, 0);
                            extractedImages.push(canvas.toDataURL('image/png'));
                        } catch (err) {}
                    }
                }
            }

            if (extractedImages.length === 0) {
                IslandKit.notify('Thông báo', 'Không tìm thấy hình ảnh nào trong tài liệu.', 'warning');
            } else {
                hostElement.querySelector('#ext-pre-scan').style.display = 'none';
                hostElement.querySelector('#ext-workspace').classList.remove('hidden');
                hostElement.querySelector('#ext-workspace').classList.add('flex');
                hostElement.querySelector('#btn-extract-download').classList.remove('hidden');
                hostElement.querySelector('#btn-extract-download').classList.add('flex');

                extractSelection = new Set(extractedImages.map((_, i) => i));
                renderExtractGrid();
                hostElement.querySelector('#btn-extract-download').disabled = false;
                IslandKit.notify('Hoàn tất', `Đã tìm thấy ${extractedImages.length} hình ảnh nhúng.`, 'success');
            }
        } catch (err) {
            IslandKit.notify('Lỗi quét', 'Không thể hoàn tất quét khối ảnh.', 'error');
        } finally {
            btn.innerHTML = oriT;
            btn.disabled = false;
        }
    };

    hostElement.querySelector('#btn-extract-download').onclick = async (e) => {
        if (extractSelection.size === 0) return;
        const btn = e.currentTarget;
        const oriT = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Đang tải...';
        btn.disabled = true;

        try {
            if (extractSelection.size === 1) {
                const idx = Array.from(extractSelection)[0];
                const a = document.createElement('a');
                a.href = extractedImages[idx];
                a.download = `Extracted_Img_${idx + 1}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const JSZip = await loadJSZip();
                const zip = new JSZip();
                let c = 1;
                Array.from(extractSelection).forEach(idx => {
                    const base64 = extractedImages[idx].split(',')[1];
                    zip.file(`Extracted_Img_${c}.png`, base64, { base64: true });
                    c++;
                });
                const zipBlob = await zip.generateAsync({ type: "blob" });
                downloadBlob(zipBlob, `HunqOS_Images_${Date.now()}.zip`, 'application/zip');
            }
            IslandKit.notify('Đã tải', 'Xuất hình ảnh hoàn tất.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi', 'Không thể khởi tạo gói nén tải về.', 'error');
        } finally {
            btn.innerHTML = oriT;
            btn.disabled = false;
        }
    };

    // Core Pipeline Execution
    actionBtns.forEach(btn => {
        if (btn.dataset.type === 'extract-scan') return;

        btn.onclick = async () => {
            const type = btn.dataset.type;
            const oriText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Đang xử lý...';
            btn.disabled = true;

            try {
                const PDFLib = await loadPdfLib();

                // Merge
                if (type === 'merge') {
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    for (const f of mergeFiles) {
                        const arr = await f.arrayBuffer();
                        const pdf = await PDFLib.PDFDocument.load(arr);
                        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        pages.forEach(p => mergedPdf.addPage(p));
                    }
                    downloadBlob(await mergedPdf.save(), `HunqOS_Merged_${Date.now()}.pdf`);
                    IslandKit.notify('Thành công', 'Đã ghép nối các tệp PDF.', 'success');
                }

                // Split
                else if (type === 'split') {
                    if (splitSelection.size === 0) throw new Error('Chưa chọn trang');
                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const mode = hostElement.querySelector('#split-mode').value;
                    const indices = Array.from(splitSelection).sort((a, b) => a - b);

                    if (mode === 'range') {
                        const newPdf = await PDFLib.PDFDocument.create();
                        const copiedPages = await newPdf.copyPages(pdf, indices);
                        copiedPages.forEach(p => newPdf.addPage(p));
                        downloadBlob(await newPdf.save(), `HunqOS_Split_${Date.now()}.pdf`);
                    } else {
                        const JSZip = await loadJSZip();
                        const zip = new JSZip();
                        for (let i of indices) {
                            const singlePdf = await PDFLib.PDFDocument.create();
                            const [copiedPage] = await singlePdf.copyPages(pdf, [i]);
                            singlePdf.addPage(copiedPage);
                            const bytes = await singlePdf.save();
                            zip.file(`Page_${i + 1}.pdf`, bytes);
                        }
                        const zipBlob = await zip.generateAsync({ type: "blob" });
                        downloadBlob(zipBlob, `HunqOS_Split_Burst_${Date.now()}.zip`, 'application/zip');
                    }
                    IslandKit.notify('Hoàn tất', 'Đã trích xuất các trang đã chọn.', 'success');
                }

                // Sign
                else if (type === 'sign') {
                    if (!signImageBytes) {
                        IslandKit.notify('Thiếu chữ ký', 'Vui lòng nạp ảnh chữ ký vào khung tải.', 'warning');
                        throw new Error('No sign');
                    }
                    const pageNum = parseInt(hostElement.querySelector('#sign-page-select').value);
                    const scalePercent = parseFloat(hostElement.querySelector('#sign-size').value);

                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const image = await pdf.embedPng(signImageBytes);

                    const page = pdf.getPage(pageNum - 1);
                    const { width, height } = page.getSize();

                    const drawWidth = width * (scalePercent / 100);
                    const imgObj = new Image();
                    imgObj.src = signImageBytes;
                    await new Promise(r => imgObj.onload = r);
                    const drawHeight = drawWidth * (imgObj.height / imgObj.width);

                    const x = width * signPos.x - (drawWidth / 2);
                    const y = height * (1 - signPos.y) - (drawHeight / 2);

                    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
                    downloadBlob(await pdf.save(), `HunqOS_Signed_${Date.now()}.pdf`);
                    IslandKit.notify('Hoàn tất', 'Đã nhúng chữ ký số thành công.', 'success');
                }

                // Convert
                else if (type === 'convert') {
                    const format = hostElement.querySelector('#conv-format').value;
                    const mode = hostElement.querySelector('#conv-mode').value;

                    const pdfjs = await loadPdfJs();
                    const pdf = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
                    const max = pdf.numPages;

                    let indices = [];
                    if (mode === 'all') indices = Array.from({ length: max }, (_, i) => i);
                    else if (mode === 'odd') indices = Array.from({ length: max }, (_, i) => i).filter(i => (i + 1) % 2 !== 0);
                    else if (mode === 'even') indices = Array.from({ length: max }, (_, i) => i).filter(i => (i + 1) % 2 === 0);
                    else {
                        const rangeStr = hostElement.querySelector('#conv-range').value;
                        const pages = new Set();
                        rangeStr.split(',').forEach(part => {
                            if (part.includes('-')) {
                                const [s, e] = part.split('-').map(n => parseInt(n.trim()));
                                if (s > 0 && e >= s) for (let i = s; i <= e; i++) if (i <= max) pages.add(i - 1);
                            } else {
                                const n = parseInt(part.trim());
                                if (n > 0 && n <= max) pages.add(n - 1);
                            }
                        });
                        indices = Array.from(pages).sort((a, b) => a - b);
                    }

                    if (indices.length === 0) throw new Error('Range invalid');

                    if (indices.length === 1) {
                        const page = await pdf.getPage(indices[0] + 1);
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

                        const a = document.createElement('a');
                        a.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9);
                        a.download = `Page_${indices[0] + 1}.${format}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else {
                        const JSZip = await loadJSZip();
                        const zip = new JSZip();
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        for (let i of indices) {
                            const page = await pdf.getPage(i + 1);
                            const viewport = page.getViewport({ scale: 2.0 });
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                            const base64Data = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9).split(',')[1];
                            zip.file(`Page_${i + 1}.${format}`, base64Data, { base64: true });
                        }

                        const zipBlob = await zip.generateAsync({ type: "blob" });
                        downloadBlob(zipBlob, `HunqOS_Images_${Date.now()}.zip`, 'application/zip');
                    }
                    IslandKit.notify('Thành công', 'Đã xuất ảnh từ PDF.', 'success');
                }

                // Organize
                else if (type === 'organize') {
                    if (orgPageOrder.length === 0) throw new Error('Order empty');
                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const newPdf = await PDFLib.PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(pdf, orgPageOrder);
                    copiedPages.forEach(p => newPdf.addPage(p));
                    downloadBlob(await newPdf.save(), `HunqOS_Organized_${Date.now()}.pdf`);
                    IslandKit.notify('Hoàn tất', 'Đã lưu cấu trúc sắp xếp mới.', 'success');
                }

                // Watermark
                else if (type === 'watermark') {
                    const text = hostElement.querySelector('#wm-text').value || "HUNQOS WATERMARK";
                    const op = parseFloat(hostElement.querySelector('#wm-opacity').value);
                    const hex = hostElement.querySelector('#wm-color').value;
                    const pageMode = hostElement.querySelector('#wm-page-select').value;
                    const rotate = parseInt(hostElement.querySelector('#wm-rotate').value);
                    const customSize = parseInt(hostElement.querySelector('#wm-size').value);
                    const fontSelection = hostElement.querySelector('#wm-font').value;

                    const r = parseInt(hex.slice(1, 3), 16) / 255;
                    const g = parseInt(hex.slice(3, 5), 16) / 255;
                    const b = parseInt(hex.slice(5, 7), 16) / 255;

                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);

                    let targetFont;
                    if (fontSelection === 'Times-Roman') targetFont = PDFLib.StandardFonts.TimesRoman;
                    else if (fontSelection === 'Courier') targetFont = PDFLib.StandardFonts.Courier;
                    else targetFont = PDFLib.StandardFonts.Helvetica;

                    const font = await pdf.embedFont(targetFont);

                    const drawW = (page) => {
                        const { width, height } = page.getSize();
                        const textWidth = font.widthOfTextAtSize(text, customSize);

                        const cx = width * wmPos.x;
                        const cy = height * (1 - wmPos.y);

                        const rad = PDFLib.degrees(-rotate).inRadians();
                        const x = cx - (textWidth / 2) * Math.cos(rad) + (customSize / 2) * Math.sin(rad);
                        const y = cy - (textWidth / 2) * Math.sin(rad) - (customSize / 2) * Math.cos(rad);

                        page.drawText(text, {
                            x, y,
                            size: customSize,
                            font: font,
                            color: PDFLib.rgb(r, g, b),
                            opacity: op,
                            rotate: PDFLib.degrees(-rotate)
                        });
                    };

                    if (pageMode === 'all') pdf.getPages().forEach(p => drawW(p));
                    else drawW(pdf.getPage(parseInt(pageMode) - 1));

                    downloadBlob(await pdf.save(), `HunqOS_Watermark_${Date.now()}.pdf`);
                    IslandKit.notify('Hoàn tất', 'Đã đóng dấu watermark thành công.', 'success');
                }

            } catch (error) {
                if (error.message === 'Chưa chọn trang') IslandKit.notify('Cảnh báo', 'Vui lòng chọn trang cần tách.', 'warning');
                else if (error.message === 'Range invalid') IslandKit.notify('Cảnh báo', 'Khoảng trang nhập vào không hợp lệ.', 'warning');
                else if (error.message !== 'No sign') IslandKit.notify('Lỗi xuất tệp', 'Có sự cố trong quá trình xuất PDF.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = oriText;
            }
        };
    });

    // Signature Upload Handler
    const sImgUpload = hostElement.querySelector('#sign-img-upload');
    const sFile = hostElement.querySelector('#sign-file');
    sImgUpload.onclick = () => sFile.click();
    sFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);

                signImageBytes = canvas.toDataURL('image/png');

                hostElement.querySelector('#sign-preview').src = signImageBytes;
                hostElement.querySelector('#sign-preview').classList.remove('hidden');

                hostElement.querySelector('#sign-drag-img').src = signImageBytes;
                hostElement.querySelector('#sign-draggable').classList.remove('hidden');

                sImgUpload.querySelector('i').classList.add('hidden');
                sImgUpload.querySelector('span').classList.add('hidden');
                URL.revokeObjectURL(url);
                IslandKit.notify('Chữ ký', 'Đã tải ảnh chữ ký mẫu.', 'info');
            };
            img.src = url;
        }
    };
}