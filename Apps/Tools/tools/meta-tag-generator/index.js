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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="meta-tag-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #meta-tag-root {
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
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE & TOP CONTROLS -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Web Master</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Meta Tag Generator</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tạo bộ thẻ Meta SEO, Open Graph & Twitter Cards chuẩn xác, quản lý lưu trữ cấu hình linh hoạt.</p>
                </div>

                <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <button id="btn-mt-load" class="h-9 px-3 rounded-[12px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-history text-[11px]"></i> Bản lưu
                    </button>
                    <button id="btn-mt-save" class="h-9 px-3 rounded-[12px] bg-accent-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-floppy-disk text-[11px]"></i> Lưu cấu hình
                    </button>
                    <button id="btn-mt-export" class="w-9 h-9 rounded-[12px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Xuất file JSON">
                        <i class="fas fa-download text-xs"></i>
                    </button>
                    <button id="btn-mt-import-trigger" class="w-9 h-9 rounded-[12px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Nhập file JSON">
                        <i class="fas fa-upload text-xs"></i>
                    </button>
                    <button id="btn-mt-clear" class="w-9 h-9 rounded-[12px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Làm mới form">
                        <i class="far fa-trash-can text-xs"></i>
                    </button>
                    <input type="file" id="file-mt-import" accept=".json" class="hidden">
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: FORM CẤU HÌNH (5 COLS) -->
                <div class="xl:col-span-5 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
                        
                        <!-- SEGMENTED TABS TƯƠNG PHẢN CAO -->
                        <div class="p-2 border-b border-black/[0.05] dark:border-white/[0.08] select-none bg-white dark:bg-[#161618]">
                            <div class="grid grid-cols-5 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="form-tabs">
                                <button type="button" class="mini-tab-btn active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate" data-target="form-basic">SEO</button>
                                <button type="button" class="mini-tab-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-target="form-og">OG (FB)</button>
                                <button type="button" class="mini-tab-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-target="form-tw">Twitter</button>
                                <button type="button" class="mini-tab-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-target="form-misc">Nâng cao</button>
                                <button type="button" class="mini-tab-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-target="form-cdn">Tài nguyên</button>
                            </div>
                        </div>

                        <form id="meta-form" class="p-4 sm:p-5">
                            
                            <!-- TAB 1: SEO CƠ BẢN -->
                            <div class="tab-content block" id="form-basic">
                                <div class="space-y-3.5">
                                    <div class="space-y-1">
                                        <div class="flex justify-between items-center select-none">
                                            <label for="in-title" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5">Tiêu đề trang (Title)</label>
                                            <span class="text-[10px] font-mono font-bold text-zinc-400" id="cnt-title">0/60</span>
                                        </div>
                                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                            <input type="text" class="meta-input w-full bg-transparent border-none py-1.5 outline-none text-xs font-semibold text-zinc-900 dark:text-white select-text cursor-text" id="in-title" placeholder="VD: HunqOS - Nền tảng tiện ích AIO">
                                            <button type="button" class="btn-paste p-1.5 text-zinc-400 hover:text-accent-theme transition-colors shrink-0" data-target="in-title" title="Dán"><i class="far fa-paste text-xs"></i></button>
                                        </div>
                                    </div>

                                    <div class="space-y-1">
                                        <div class="flex justify-between items-center select-none">
                                            <label for="in-desc" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5">Mô tả (Description)</label>
                                            <span class="text-[10px] font-mono font-bold text-zinc-400" id="cnt-desc">0/160</span>
                                        </div>
                                        <textarea class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 outline-none focus:border-accent-theme transition-all text-xs text-zinc-900 dark:text-white resize-y min-h-[75px] select-text" id="in-desc" placeholder="Mô tả tóm tắt ngắn gọn dưới 160 ký tự..."></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div class="space-y-1">
                                            <label for="in-url" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">URL Trang</label>
                                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                                <input type="url" class="meta-input w-full bg-transparent border-none py-1 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-url" placeholder="https://example.com">
                                                <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-url"><i class="far fa-paste text-[10px]"></i></button>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <label for="in-favicon" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Favicon URL</label>
                                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                                <input type="url" class="meta-input w-full bg-transparent border-none py-1 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-favicon" placeholder="https://.../favicon.ico">
                                                <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-favicon"><i class="far fa-paste text-[10px]"></i></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div class="space-y-1">
                                            <label for="in-keywords" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Từ khóa (Keywords)</label>
                                            <input type="text" class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 outline-none focus:border-accent-theme transition-all text-xs text-zinc-900 dark:text-white select-text" id="in-keywords" placeholder="seo, tools, utility">
                                        </div>
                                        <div class="space-y-1">
                                            <label for="in-author" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Tác giả (Author)</label>
                                            <input type="text" class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 outline-none focus:border-accent-theme transition-all text-xs text-zinc-900 dark:text-white select-text" id="in-author" placeholder="Hunq">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 2: OPEN GRAPH (FB) -->
                            <div class="tab-content hidden" id="form-og">
                                <div class="space-y-3.5">
                                    <div class="flex items-center justify-between p-2.5 bg-accent-theme-alpha border border-accent-theme/20 rounded-[14px] select-none">
                                        <span class="text-[11px] text-accent-theme font-medium"><i class="fas fa-info-circle mr-1"></i> Để trống sẽ mượn từ tab SEO.</span>
                                        <button type="button" class="px-2.5 py-1 bg-white dark:bg-[#2c2c2e] text-zinc-800 dark:text-zinc-200 border border-black/[0.05] dark:border-white/[0.08] rounded-[8px] text-[10px] font-bold active:scale-95 transition-all shadow-sm" id="btn-sync-og">
                                            <i class="fas fa-arrows-rotate mr-1"></i> Điền nhanh
                                        </button>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-og-title" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">OG Title</label>
                                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                            <input type="text" class="meta-input w-full bg-transparent border-none py-1.5 text-xs text-zinc-900 dark:text-white outline-none select-text" id="in-og-title">
                                            <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-og-title"><i class="far fa-paste text-[10px]"></i></button>
                                        </div>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-og-desc" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">OG Description</label>
                                        <textarea class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3 outline-none focus:border-accent-theme transition-all text-xs text-zinc-900 dark:text-white resize-y min-h-[60px] select-text" id="in-og-desc"></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div class="space-y-1">
                                            <label for="in-og-img" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">OG Image URL</label>
                                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                                <input type="url" class="meta-input w-full bg-transparent border-none py-1 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-og-img" placeholder="https://.../cover.png">
                                                <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-og-img"><i class="far fa-paste text-[10px]"></i></button>
                                            </div>
                                        </div>
                                        <div class="space-y-1 select-none">
                                            <label for="in-og-type" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5">OG Type</label>
                                            <div class="relative">
                                                <select class="meta-input appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-accent-theme cursor-pointer" id="in-og-type">
                                                    <option value="website">Website</option>
                                                    <option value="article">Article</option>
                                                    <option value="product">Product</option>
                                                </select>
                                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[9px]"></i></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 3: TWITTER -->
                            <div class="tab-content hidden" id="form-tw">
                                <div class="space-y-3.5">
                                    <div class="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-[14px] select-none">
                                        <span class="text-[11px] text-blue-500 font-medium"><i class="fas fa-info-circle mr-1"></i> Để trống sẽ tự mượn từ tab OG / SEO.</span>
                                        <button type="button" class="px-2.5 py-1 bg-white dark:bg-[#2c2c2e] text-zinc-800 dark:text-zinc-200 border border-black/[0.05] dark:border-white/[0.08] rounded-[8px] text-[10px] font-bold active:scale-95 transition-all shadow-sm" id="btn-sync-tw">
                                            <i class="fas fa-arrows-rotate mr-1"></i> Điền nhanh
                                        </button>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 select-none">
                                        <div class="space-y-1">
                                            <label for="in-tw-card" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5">Card Type</label>
                                            <div class="relative">
                                                <select class="meta-input appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-accent-theme cursor-pointer" id="in-tw-card">
                                                    <option value="summary_large_image">Large Image</option>
                                                    <option value="summary">Summary</option>
                                                </select>
                                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[9px]"></i></div>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <label for="in-tw-site" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5">Twitter Site (@user)</label>
                                            <input type="text" class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-accent-theme select-text" id="in-tw-site" placeholder="@hunqos">
                                        </div>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-tw-title" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Twitter Title</label>
                                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                            <input type="text" class="meta-input w-full bg-transparent border-none py-1.5 text-xs text-zinc-900 dark:text-white outline-none select-text" id="in-tw-title">
                                            <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-tw-title"><i class="far fa-paste text-[10px]"></i></button>
                                        </div>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-tw-desc" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Twitter Description</label>
                                        <textarea class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3 outline-none focus:border-accent-theme transition-all text-xs text-zinc-900 dark:text-white resize-y min-h-[60px] select-text" id="in-tw-desc"></textarea>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-tw-img" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5 select-none">Twitter Image URL</label>
                                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all cursor-text">
                                            <input type="url" class="meta-input w-full bg-transparent border-none py-1 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-tw-img">
                                            <button type="button" class="btn-paste p-1 text-zinc-400 hover:text-accent-theme" data-target="in-tw-img"><i class="far fa-paste text-[10px]"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 4: NÂNG CAO & MOBILE -->
                            <div class="tab-content hidden" id="form-misc">
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-2.5 select-none">
                                        <div class="space-y-1">
                                            <label for="in-charset" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Charset</label>
                                            <div class="relative">
                                                <select class="meta-input appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 outline-none" id="in-charset">
                                                    <option value="UTF-8">UTF-8</option>
                                                    <option value="ISO-8859-1">ISO-8859-1</option>
                                                </select>
                                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[9px]"></i></div>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <label for="in-robots" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Robots</label>
                                            <div class="relative">
                                                <select class="meta-input appearance-none w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 outline-none" id="in-robots">
                                                    <option value="index, follow">Index, Follow</option>
                                                    <option value="noindex, nofollow">Noindex, Nofollow</option>
                                                </select>
                                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[9px]"></i></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-1.5 select-none">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Viewport Settings</span>
                                        <div class="grid grid-cols-2 gap-1.5 p-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input vp-check rounded border-zinc-300" value="width=device-width" checked> width=device-width</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input vp-check rounded border-zinc-300" value="initial-scale=1.0" checked> initial-scale=1.0</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input vp-check rounded border-zinc-300" value="maximum-scale=1.0"> max-scale=1.0</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input vp-check rounded border-zinc-300" value="user-scalable=no"> user-scalable=no</label>
                                        </div>
                                    </div>

                                    <div class="space-y-1.5 select-none">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Chặn tự động nhận diện (Format Detection)</span>
                                        <div class="grid grid-cols-2 gap-1.5 p-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input fd-check rounded border-zinc-300" value="telephone=no"> Chặn SĐT</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input fd-check rounded border-zinc-300" value="email=no"> Chặn Email</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input fd-check rounded border-zinc-300" value="address=no"> Chặn Địa chỉ</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input fd-check rounded border-zinc-300" value="date=no"> Chặn Ngày</label>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between p-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] select-none">
                                        <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Màu thanh địa chỉ (Theme Color)</span>
                                        <input type="color" class="meta-input w-8 h-7 rounded-[8px] cursor-pointer bg-transparent border-none p-0" id="in-theme-color" value="#ffffff">
                                    </div>

                                    <div class="space-y-2 pt-1 select-none">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5 flex items-center gap-1.5"><i class="fab fa-apple"></i> Cấu hình Apple Web App</span>
                                        <div class="space-y-2 p-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                                            <input type="url" class="meta-input w-full bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] rounded-[12px] px-3 py-1.5 text-xs text-zinc-900 dark:text-white select-text" id="in-apple-icon" placeholder="Apple Touch Icon URL">
                                            <div class="grid grid-cols-2 gap-2">
                                                <select class="meta-input appearance-none bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] rounded-[12px] px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none" id="in-apple-capable">
                                                    <option value="yes">Capable: Yes</option>
                                                    <option value="no">Capable: No</option>
                                                </select>
                                                <select class="meta-input appearance-none bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] rounded-[12px] px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none" id="in-apple-status">
                                                    <option value="default">Status: Default</option>
                                                    <option value="black">Status: Black</option>
                                                    <option value="black-translucent">Translucent</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 5: CDN & CUSTOM -->
                            <div class="tab-content hidden" id="form-cdn">
                                <div class="space-y-3.5">
                                    <div class="grid grid-cols-2 gap-2.5">
                                        <div class="space-y-1 select-none">
                                            <label for="in-lang" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Ngôn ngữ HTML</label>
                                            <input type="text" class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-lang" value="vi" placeholder="vi, en...">
                                        </div>
                                        <div class="space-y-1 select-none">
                                            <label for="in-manifest" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Web Manifest</label>
                                            <input type="url" class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-white outline-none select-text" id="in-manifest" placeholder="/manifest.json">
                                        </div>
                                    </div>

                                    <div class="space-y-1.5 select-none">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5">Tích hợp thư viện CDN</span>
                                        <div class="grid grid-cols-2 gap-1.5 p-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px]">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input rounded border-zinc-300" id="in-cdn-tailwind"> Tailwind CSS</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input rounded border-zinc-300" id="in-cdn-bootstrap"> Bootstrap 5</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input rounded border-zinc-300" id="in-cdn-fa"> FontAwesome 6</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"><input type="checkbox" class="meta-input rounded border-zinc-300" id="in-cdn-jquery"> jQuery 3.6</label>
                                        </div>
                                    </div>

                                    <div class="space-y-1">
                                        <label for="in-custom-head" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-0.5 select-none">Thẻ tùy chỉnh (&lt;link&gt;, &lt;script&gt;)</label>
                                        <textarea class="meta-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 text-xs font-mono text-zinc-900 dark:text-white outline-none resize-y min-h-[60px] select-text" id="in-custom-head" placeholder="Dán các thẻ script/link khác vào đây..."></textarea>
                                    </div>

                                    <div class="p-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] select-none">
                                        <label class="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                                            <input type="checkbox" class="meta-input rounded text-zinc-900 w-3.5 h-3.5" id="in-full-html" checked> 
                                            Tạo khung HTML5 Boilerplate hoàn chỉnh
                                        </label>
                                        <p class="text-[10px] text-zinc-400 mt-1 ml-5">Tắt nếu bạn chỉ muốn copy riêng phần thẻ meta để chèn vào &lt;head&gt; có sẵn.</p>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    <button class="w-full h-12 bg-accent-theme text-white rounded-[16px] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm select-none" id="btn-mt-copy-main">
                        <i class="far fa-copy text-xs"></i> Sao chép toàn bộ HTML
                    </button>
                </div>

                <!-- CỘT PHẢI: LIVE CODE & SOCIAL PREVIEWS (7 COLS) -->
                <div class="xl:col-span-7 flex flex-col gap-4">
                    
                    <!-- HTML CODE CANVAS -->
                    <div class="rounded-[24px] bg-[#0d1117] dark:bg-zinc-950 border border-zinc-800/60 shadow-sm overflow-hidden flex flex-col">
                        <div class="flex justify-between items-center px-4 py-3 bg-[#161b22] dark:bg-zinc-900 border-b border-white/10 select-none">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-accent-theme animate-pulse"></div>
                                <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <i class="fas fa-file-code text-accent-theme"></i> Mã nguồn HTML sinh tự động
                                </span>
                            </div>
                            <span class="text-[9px] font-mono text-zinc-500">Live Sync</span>
                        </div>
                        <div class="p-3.5 bg-[#0d1117]">
                            <textarea id="mt-code-output" class="w-full h-[240px] bg-transparent text-xs font-mono leading-relaxed text-[#c9d1d9] resize-none outline-none no-scrollbar select-all" readonly spellcheck="false"></textarea>
                        </div>
                    </div>

                    <!-- SOCIAL CARDS PREVIEW -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- GOOGLE SEARCH PREVIEW -->
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm p-4 space-y-2.5 select-none">
                            <h4 class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fab fa-google text-rose-500"></i> Google Search
                            </h4>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 space-y-1">
                                <div class="flex items-center gap-1.5">
                                    <img id="pv-gg-favicon" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23888'/></svg>" class="w-3.5 h-3.5 rounded-full object-cover bg-zinc-300">
                                    <span id="pv-gg-url" class="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate">example.com</span>
                                </div>
                                <div id="pv-gg-title" class="text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">Tiêu đề trang web</div>
                                <div id="pv-gg-desc" class="text-xs text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">Mô tả tóm tắt nội dung trang web hiển thị trên kết quả tìm kiếm Google...</div>
                            </div>
                        </div>

                        <!-- TWITTER CARD PREVIEW -->
                        <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm p-4 space-y-2.5 select-none">
                            <h4 class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fab fa-x-twitter text-blue-400"></i> Twitter Card
                            </h4>
                            <div class="border border-black/[0.05] dark:border-white/[0.08] rounded-[16px] overflow-hidden bg-[#f2f2f7] dark:bg-black/40">
                                <div id="pv-tw-img-wrap" class="w-full aspect-[1.91/1] bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-400 border-b border-black/[0.05] dark:border-white/[0.08] overflow-hidden relative">
                                    <i class="far fa-image text-xl"></i>
                                </div>
                                <div class="p-2.5 space-y-0.5">
                                    <div id="pv-tw-title" class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Tiêu đề Twitter</div>
                                    <div id="pv-tw-desc" class="text-[11px] text-zinc-500 line-clamp-1">Mô tả tóm tắt dành cho Twitter...</div>
                                    <div class="text-[10px] font-mono text-zinc-400 truncate pt-0.5" id="pv-tw-domain">example.com</div>
                                </div>
                            </div>
                        </div>

                        <!-- FACEBOOK PREVIEW -->
                        <div class="md:col-span-2 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm p-4 space-y-2.5 select-none">
                            <h4 class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fab fa-facebook text-blue-600"></i> Facebook (Open Graph)
                            </h4>
                            <div class="max-w-[460px] mx-auto border border-black/[0.05] dark:border-white/[0.08] rounded-[16px] overflow-hidden bg-[#f2f2f7] dark:bg-black/40">
                                <div id="pv-fb-img-wrap" class="w-full aspect-[1.91/1] bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-400 border-b border-black/[0.05] dark:border-white/[0.08] overflow-hidden relative">
                                    <i class="far fa-image text-2xl"></i>
                                </div>
                                <div class="p-3 space-y-0.5">
                                    <div id="pv-fb-domain" class="text-[9px] font-mono text-zinc-400 uppercase tracking-wider truncate">EXAMPLE.COM</div>
                                    <div id="pv-fb-title" class="text-xs font-bold text-zinc-900 dark:text-white truncate">Tiêu đề trang web Facebook</div>
                                    <div id="pv-fb-desc" class="text-[11px] text-zinc-500 line-clamp-1">Mô tả ngắn gọn hiển thị khi chia sẻ liên kết trên Facebook...</div>
                                </div>
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
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#meta-tag-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const showDialog = ({ type, title, message, defaultValue = '', okText = 'Đồng ý', cancelText = 'Hủy', onConfirm }) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-200 px-4';
        
        const box = document.createElement('div');
        box.className = 'bg-white dark:bg-[#161618] w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-black/[0.05] dark:border-white/[0.08]';
        
        let inputHTML = '';
        if (type === 'prompt') {
            inputHTML = `<input type="text" id="mtg-dialog-input" value="${escapeHTML(defaultValue)}" class="w-full mt-3 mb-5 px-3.5 py-2.5 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.05] dark:border-white/[0.08] rounded-[14px] outline-none focus:border-accent-theme transition-all text-xs font-semibold text-zinc-900 dark:text-white">`;
        } else {
            inputHTML = `<div class="mb-5"></div>`;
        }

        box.innerHTML = `
            <h3 class="text-base font-bold text-zinc-900 dark:text-white mb-1.5">${title}</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">${message}</p>
            ${inputHTML}
            <div class="flex justify-end gap-2">
                <button id="mtg-dialog-cancel" class="px-3.5 py-2 rounded-[12px] font-semibold text-xs bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-black/10 transition-all active:scale-95">${cancelText}</button>
                <button id="mtg-dialog-ok" class="px-4 py-2 rounded-[12px] font-bold text-xs bg-accent-theme text-white hover:opacity-90 transition-all active:scale-95 shadow-sm">${okText}</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const btnCancel = box.querySelector('#mtg-dialog-cancel');
        const btnOk = box.querySelector('#mtg-dialog-ok');
        const inputEl = box.querySelector('#mtg-dialog-input');

        const closeDialog = () => {
            overlay.classList.add('opacity-0');
            setTimeout(() => document.body.removeChild(overlay), 200);
        };

        btnCancel.onclick = closeDialog;
        overlay.onmousedown = (e) => { if (e.target === overlay) closeDialog(); };

        const confirmAction = () => {
            const val = type === 'prompt' ? inputEl.value : null;
            closeDialog();
            if (onConfirm) onConfirm(val);
        };

        btnOk.onclick = confirmAction;

        if (inputEl) {
            inputEl.focus();
            inputEl.select();
            inputEl.onkeydown = (e) => { if (e.key === 'Enter') confirmAction(); };
        }
    };

    // Segmented Tabs Switching
    const tabBtns = $$('#form-tabs .mini-tab-btn');
    const activeTabClass = 'mini-tab-btn active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate';
    const inactiveTabClass = 'mini-tab-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate';

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            tabBtns.forEach(b => b.className = inactiveTabClass);
            btn.className = activeTabClass;
            
            const tabContents = $$('.tab-content');
            tabContents.forEach(tc => tc.classList.replace('block', 'hidden'));
            const targetContent = _(`#${targetId}`);
            if (targetContent) targetContent.classList.replace('hidden', 'block');
        });
    });

    // Paste Buttons
    $$('.btn-paste').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return;
                const targetId = btn.getAttribute('data-target');
                const targetInput = _(`#${targetId}`);
                if (targetInput) {
                    targetInput.value = text;
                    targetInput.dispatchEvent(new Event('input'));
                }
            } catch (err) {
                IslandKit.notify('Quyền truy cập', 'Hãy nhấn Ctrl + V để dán trực tiếp.', 'warning');
            }
        });
    });

    // Điền nhanh OG & Twitter
    _('#btn-sync-og')?.addEventListener('click', () => {
        const titleVal = _('#in-title')?.value || '';
        const descVal = _('#in-desc')?.value || '';
        
        if (!titleVal && !descVal) {
            IslandKit.notify('Thông báo', 'Tab SEO cơ bản đang trống.', 'info');
            return;
        }

        const ogTitle = _('#in-og-title');
        const ogDesc = _('#in-og-desc');
        if (ogTitle) ogTitle.value = titleVal;
        if (ogDesc) ogDesc.value = descVal;
        
        generateMeta();
        IslandKit.notify('Đã đồng bộ', 'Đã chép nội dung sang Open Graph.', 'success');
    });

    _('#btn-sync-tw')?.addEventListener('click', () => {
        const ogTitle = _('#in-og-title')?.value || '';
        const ogDesc = _('#in-og-desc')?.value || '';
        const seoTitle = _('#in-title')?.value || '';
        const seoDesc = _('#in-desc')?.value || '';
        const ogImg = _('#in-og-img')?.value || '';

        if (!ogTitle && !ogDesc && !seoTitle && !seoDesc) {
            IslandKit.notify('Thông báo', 'Chưa có thông tin để đồng bộ.', 'info');
            return;
        }

        const twTitle = _('#in-tw-title');
        const twDesc = _('#in-tw-desc');
        const twImg = _('#in-tw-img');

        if (twTitle) twTitle.value = ogTitle || seoTitle;
        if (twDesc) twDesc.value = ogDesc || seoDesc;
        if (ogImg && twImg) twImg.value = ogImg;
        
        generateMeta();
        IslandKit.notify('Đã đồng bộ', 'Đã chép nội dung sang Twitter Card.', 'success');
    });

    // Inputs & Previews
    const inputs = $$('.meta-input');
    const outCode = _('#mt-code-output');
    
    const pGgTitle = _('#pv-gg-title'); 
    const pGgDesc = _('#pv-gg-desc'); 
    const pGgUrl = _('#pv-gg-url'); 
    const pGgFavicon = _('#pv-gg-favicon');

    const pFbTitle = _('#pv-fb-title'); 
    const pFbDesc = _('#pv-fb-desc'); 
    const pFbDomain = _('#pv-fb-domain'); 
    const pFbImgWrap = _('#pv-fb-img-wrap');

    const pTwTitle = _('#pv-tw-title'); 
    const pTwDesc = _('#pv-tw-desc'); 
    const pTwDomain = _('#pv-tw-domain'); 
    const pTwImgWrap = _('#pv-tw-img-wrap');
    
    const cntTitle = _('#cnt-title'); 
    const cntDesc = _('#cnt-desc');

    const getDomain = (urlStr) => { 
        try { 
            return new URL(urlStr).hostname.replace('www.', ''); 
        } catch (e) { 
            return urlStr ? urlStr : 'example.com'; 
        } 
    };

    const getAllData = () => {
        return {
            title: _('#in-title')?.value.trim() || '',
            desc: _('#in-desc')?.value.trim() || '',
            url: _('#in-url')?.value.trim() || '',
            favicon: _('#in-favicon')?.value.trim() || '',
            kw: _('#in-keywords')?.value.trim() || '',
            author: _('#in-author')?.value.trim() || '',
            ogTitle: _('#in-og-title')?.value.trim() || '',
            ogDesc: _('#in-og-desc')?.value.trim() || '',
            ogImg: _('#in-og-img')?.value.trim() || '',
            ogType: _('#in-og-type')?.value || 'website',
            twCard: _('#in-tw-card')?.value || 'summary_large_image',
            twSite: _('#in-tw-site')?.value.trim() || '',
            twTitle: _('#in-tw-title')?.value.trim() || '',
            twDesc: _('#in-tw-desc')?.value.trim() || '',
            twImg: _('#in-tw-img')?.value.trim() || '',
            charset: _('#in-charset')?.value || 'UTF-8',
            robots: _('#in-robots')?.value || 'index, follow',
            theme: _('#in-theme-color')?.value || '#ffffff',
            appleIcon: _('#in-apple-icon')?.value.trim() || '',
            appleCapable: _('#in-apple-capable')?.value || 'yes',
            appleStatus: _('#in-apple-status')?.value || 'default',
            vpChecks: Array.from(hostElement.querySelectorAll('.vp-check:checked')).map(cb => cb.value),
            fdChecks: Array.from(hostElement.querySelectorAll('.fd-check:checked')).map(cb => cb.value),
            lang: _('#in-lang')?.value.trim() || 'vi',
            manifest: _('#in-manifest')?.value.trim() || '',
            cdnTw: _('#in-cdn-tailwind')?.checked || false,
            cdnBs: _('#in-cdn-bootstrap')?.checked || false,
            cdnFa: _('#in-cdn-fa')?.checked || false,
            cdnJq: _('#in-cdn-jquery')?.checked || false,
            customHead: _('#in-custom-head')?.value || '',
            fullHtml: _('#in-full-html')?.checked || false
        };
    };

    const generateMeta = () => {
        const d = getAllData();

        const ogTitle = d.ogTitle || d.title;
        const ogDesc = d.ogDesc || d.desc;
        const twTitle = d.twTitle || ogTitle;
        const twDesc = d.twDesc || ogDesc;
        const twImg = d.twImg || d.ogImg;

        if (cntTitle) {
            cntTitle.textContent = `${d.title.length}/60`;
            cntTitle.className = d.title.length > 60 ? 'text-[10px] font-mono font-bold text-rose-500' : 'text-[10px] font-mono font-bold text-zinc-400';
        }
        if (cntDesc) {
            cntDesc.textContent = `${d.desc.length}/160`;
            cntDesc.className = d.desc.length > 160 ? 'text-[10px] font-mono font-bold text-rose-500' : 'text-[10px] font-mono font-bold text-zinc-400';
        }

        const domainStr = getDomain(d.url);

        if (pGgTitle) pGgTitle.textContent = d.title || 'Tiêu đề trang web của bạn';
        if (pGgDesc) pGgDesc.textContent = d.desc || 'Mô tả tóm tắt nội dung trang web hiển thị trên Google...';
        if (pGgUrl) pGgUrl.textContent = d.url || 'example.com';
        if (pGgFavicon) pGgFavicon.src = d.favicon ? d.favicon : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23888'/></svg>";

        if (pFbTitle) pFbTitle.textContent = ogTitle || 'Tiêu đề trang web Facebook';
        if (pFbDesc) pFbDesc.textContent = ogDesc || 'Mô tả ngắn gọn hấp dẫn...';
        if (pFbDomain) pFbDomain.textContent = domainStr.toUpperCase();
        if (pFbImgWrap) pFbImgWrap.innerHTML = d.ogImg ? `<img src="${escapeHTML(d.ogImg)}" class="w-full h-full object-cover">` : `<i class="far fa-image text-2xl"></i>`;

        if (pTwTitle) pTwTitle.textContent = twTitle || 'Tiêu đề Twitter';
        if (pTwDesc) pTwDesc.textContent = twDesc || 'Mô tả tóm tắt dành cho Twitter...';
        if (pTwDomain) pTwDomain.textContent = domainStr;
        if (pTwImgWrap) pTwImgWrap.innerHTML = twImg ? `<img src="${escapeHTML(twImg)}" class="w-full h-full object-cover">` : `<i class="far fa-image text-xl"></i>`;

        let html = '';
        const ind = d.fullHtml ? '    ' : ''; 
        
        if (d.fullHtml) {
            html += `<!DOCTYPE html>\n<html lang="${d.lang}">\n<head>\n`;
        }

        html += `${ind}<meta charset="${d.charset}">\n`;
        
        if (d.vpChecks.length > 0) html += `${ind}<meta name="viewport" content="${d.vpChecks.join(', ')}">\n`;
        
        if (d.title) html += `${ind}<title>${escapeHTML(d.title)}</title>\n`;
        if (d.desc) html += `${ind}<meta name="description" content="${escapeHTML(d.desc)}">\n`;
        if (d.kw) html += `${ind}<meta name="keywords" content="${escapeHTML(d.kw)}">\n`;
        if (d.author) html += `${ind}<meta name="author" content="${escapeHTML(d.author)}">\n`;
        if (d.theme) html += `${ind}<meta name="theme-color" content="${d.theme}">\n`;
        
        if (d.fdChecks.length > 0) html += `${ind}<meta name="format-detection" content="${d.fdChecks.join(', ')}">\n`;
        
        html += `${ind}<meta name="robots" content="${d.robots}">\n`;
        if (d.url) html += `${ind}<link rel="canonical" href="${escapeHTML(d.url)}">\n`;
        if (d.favicon) html += `${ind}<link rel="icon" href="${escapeHTML(d.favicon)}">\n`;
        if (d.manifest) html += `${ind}<link rel="manifest" href="${escapeHTML(d.manifest)}">\n`;
        
        if (ogTitle || ogDesc || d.ogImg || d.url) {
            html += `\n`;
            if (d.url) html += `${ind}<meta property="og:url" content="${escapeHTML(d.url)}">\n`;
            html += `${ind}<meta property="og:type" content="${d.ogType}">\n`;
            if (ogTitle) html += `${ind}<meta property="og:title" content="${escapeHTML(ogTitle)}">\n`;
            if (ogDesc) html += `${ind}<meta property="og:description" content="${escapeHTML(ogDesc)}">\n`;
            if (d.ogImg) html += `${ind}<meta property="og:image" content="${escapeHTML(d.ogImg)}">\n`;
        }

        if (twTitle || twDesc || twImg || d.twSite) {
            html += `\n`;
            html += `${ind}<meta name="twitter:card" content="${d.twCard}">\n`;
            if (d.url) html += `${ind}<meta property="twitter:domain" content="${domainStr}">\n`;
            if (d.url) html += `${ind}<meta property="twitter:url" content="${escapeHTML(d.url)}">\n`;
            if (d.twSite) html += `${ind}<meta name="twitter:site" content="${escapeHTML(d.twSite)}">\n`;
            if (twTitle) html += `${ind}<meta name="twitter:title" content="${escapeHTML(twTitle)}">\n`;
            if (twDesc) html += `${ind}<meta name="twitter:description" content="${escapeHTML(twDesc)}">\n`;
            if (twImg) html += `${ind}<meta name="twitter:image" content="${escapeHTML(twImg)}">\n`;
        }

        if (d.appleIcon || d.appleCapable === 'yes') {
            html += `\n`;
            if (d.appleCapable === 'yes') {
                html += `${ind}<meta name="apple-mobile-web-app-capable" content="yes">\n`;
                html += `${ind}<meta name="apple-mobile-web-app-status-bar-style" content="${d.appleStatus}">\n`;
                if (d.title) html += `${ind}<meta name="apple-mobile-web-app-title" content="${escapeHTML(d.title)}">\n`;
            }
            if (d.appleIcon) html += `${ind}<link rel="apple-touch-icon" href="${escapeHTML(d.appleIcon)}">\n`;
        }

        if (d.cdnTw || d.cdnBs || d.cdnFa || d.cdnJq || d.customHead) {
            html += `\n`;
            if (d.cdnTw) html += `${ind}<script src="https://cdn.tailwindcss.com"></script>\n`;
            if (d.cdnBs) {
                html += `${ind}<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n`;
                html += `${ind}<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n`;
            }
            if (d.cdnFa) html += `${ind}<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n`;
            if (d.cdnJq) html += `${ind}<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>\n`;
            
            if (d.customHead) {
                const customLines = d.customHead.split('\n');
                customLines.forEach(line => {
                    if (line.trim() !== '') html += `${ind}${line}\n`;
                });
            }
        }

        if (d.fullHtml) {
            html += `</head>\n<body>\n\n</body>\n</html>`;
        }

        if (outCode) outCode.value = html.trim();
    };

    inputs.forEach(inp => {
        inp.addEventListener('input', generateMeta);
        inp.addEventListener('change', generateMeta);
    });

    generateMeta();

    _('#btn-mt-copy-main')?.addEventListener('click', async () => {
        if (!outCode?.value) return;
        try {
            await navigator.clipboard.writeText(outCode.value);
            IslandKit.notify('Đã sao chép', 'Toàn bộ mã nguồn HTML đã lưu vào clipboard.', 'success');
        } catch (e) {
            outCode.select();
            IslandKit.notify('Lỗi sao chép', 'Trình duyệt chặn quyền truy cập bộ nhớ tạm.', 'error');
        }
    });

    // =========================================================================
    // QUẢN LÝ BẢN LƯU (PROFILES ENGINE)
    // =========================================================================
    const STORAGE_KEY = 'aio_meta_tags_profiles';

    const applyDataToForm = (data) => {
        if (!data) return;
        const mapping = {
            'in-title': data.title, 'in-desc': data.desc, 'in-url': data.url, 'in-favicon': data.favicon, 
            'in-keywords': data.kw, 'in-author': data.author,
            'in-og-title': data.ogTitle, 'in-og-desc': data.ogDesc, 'in-og-img': data.ogImg, 'in-og-type': data.ogType,
            'in-tw-card': data.twCard, 'in-tw-site': data.twSite, 'in-tw-title': data.twTitle, 'in-tw-desc': data.twDesc, 'in-tw-img': data.twImg,
            'in-charset': data.charset, 'in-robots': data.robots, 'in-theme-color': data.theme,
            'in-apple-icon': data.appleIcon, 'in-apple-capable': data.appleCapable, 'in-apple-status': data.appleStatus,
            'in-lang': data.lang, 'in-manifest': data.manifest, 'in-custom-head': data.customHead
        };
        for (let id in mapping) {
            const el = _(`#${id}`);
            if (mapping[id] !== undefined && el) {
                el.value = mapping[id];
            }
        }
        
        if (data.vpChecks) hostElement.querySelectorAll('.vp-check').forEach(cb => cb.checked = data.vpChecks.includes(cb.value));
        if (data.fdChecks) hostElement.querySelectorAll('.fd-check').forEach(cb => cb.checked = data.fdChecks.includes(cb.value));
        
        const cdnTwEl = _('#in-cdn-tailwind'); if (cdnTwEl && data.cdnTw !== undefined) cdnTwEl.checked = data.cdnTw;
        const cdnBsEl = _('#in-cdn-bootstrap'); if (cdnBsEl && data.cdnBs !== undefined) cdnBsEl.checked = data.cdnBs;
        const cdnFaEl = _('#in-cdn-fa'); if (cdnFaEl && data.cdnFa !== undefined) cdnFaEl.checked = data.cdnFa;
        const cdnJqEl = _('#in-cdn-jquery'); if (cdnJqEl && data.cdnJq !== undefined) cdnJqEl.checked = data.cdnJq;
        const fullHtmlEl = _('#in-full-html'); if (fullHtmlEl && data.fullHtml !== undefined) fullHtmlEl.checked = data.fullHtml;

        generateMeta();
    };

    const getProfiles = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
    };

    const saveProfiles = (profiles) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    };

    // Lưu Local
    _('#btn-mt-save')?.addEventListener('click', () => {
        showDialog({
            type: 'prompt',
            title: 'Lưu cấu hình Meta',
            message: 'Đặt tên định danh cho bản lưu này:',
            defaultValue: 'Bản lưu ' + new Date().toLocaleDateString('vi-VN'),
            okText: 'Lưu',
            onConfirm: (name) => {
                if (!name || name.trim() === '') return;

                const profiles = getProfiles();
                const data = getAllData();
                const trimmedName = name.trim();
                
                const existingIndex = profiles.findIndex(p => p.name.toLowerCase() === trimmedName.toLowerCase());
                
                if (existingIndex > -1) {
                    showDialog({
                        type: 'confirm',
                        title: 'Ghi đè bản lưu?',
                        message: `Bản lưu "<b>${escapeHTML(trimmedName)}</b>" đã tồn tại. Bạn có muốn cập nhật lại không?`,
                        okText: 'Ghi đè',
                        onConfirm: () => {
                            profiles[existingIndex].data = data;
                            profiles[existingIndex].updatedAt = Date.now();
                            saveProfiles(profiles);
                            IslandKit.notify('Thành công', `Đã cập nhật bản lưu "${trimmedName}".`, 'success');
                        }
                    });
                } else {
                    profiles.push({
                        id: Date.now().toString(),
                        name: trimmedName,
                        data: data,
                        createdAt: Date.now()
                    });
                    saveProfiles(profiles);
                    IslandKit.notify('Thành công', `Đã lưu cấu hình mới "${trimmedName}".`, 'success');
                }
            }
        });
    });

    // Tải Local Modal
    _('#btn-mt-load')?.addEventListener('click', () => {
        let profiles = getProfiles();
        if (profiles.length === 0) {
            IslandKit.notify('Trống', 'Chưa có bản lưu nào trong bộ nhớ.', 'warning');
            return;
        }
        
        let modal = document.getElementById('mt-save-mgr-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'mt-save-mgr-modal';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4';
            modal.innerHTML = `
                <div class="bg-white dark:bg-[#161618] w-full max-w-lg rounded-[24px] p-5 shadow-2xl flex flex-col max-h-[80vh] border border-black/[0.05] dark:border-white/[0.08] animate-in zoom-in-95">
                    <div class="flex justify-between items-center mb-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Quản lý Bản lưu Local</h3>
                        <button class="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" id="mt-close-modal"><i class="fas fa-xmark text-xs"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5 pr-1" id="mt-profile-list"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('mt-close-modal').onclick = () => modal.classList.add('hidden');
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
        }
        
        const listEl = document.getElementById('mt-profile-list');
        
        const refreshList = () => {
            profiles = getProfiles();
            if (profiles.length === 0) {
                listEl.innerHTML = '<div class="text-center py-8 text-zinc-400 text-xs font-mono">Không còn bản lưu nào.</div>';
                setTimeout(() => modal.classList.add('hidden'), 1200);
                return;
            }
            
            listEl.innerHTML = [...profiles].reverse().map(p => {
                const d = new Date(p.updatedAt || p.createdAt || Date.now());
                const dateStr = d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' - ' + d.toLocaleDateString('vi-VN');
                return `
                <div class="flex justify-between items-center p-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] hover:border-accent-theme transition-colors group">
                    <div class="flex-1 overflow-hidden pr-3">
                        <div class="font-bold text-xs text-zinc-900 dark:text-white truncate">${escapeHTML(p.name)}</div>
                        <div class="text-[10px] font-mono text-zinc-400 mt-0.5"><i class="far fa-clock text-[9px] mr-1"></i>${dateStr}</div>
                    </div>
                    <div class="flex gap-1.5 shrink-0">
                        <button class="btn-pf-load h-7 px-2.5 rounded-[8px] bg-accent-theme text-white text-[10px] font-bold active:scale-95 transition-all shadow-sm" data-id="${p.id}" title="Tải"><i class="fas fa-upload mr-1"></i>Tải</button>
                        <button class="btn-pf-rename w-7 h-7 rounded-[8px] bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" data-id="${p.id}" title="Đổi tên"><i class="far fa-pen-to-square text-xs"></i></button>
                        <button class="btn-pf-del w-7 h-7 rounded-[8px] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-colors" data-id="${p.id}" title="Xóa"><i class="far fa-trash-can text-xs"></i></button>
                    </div>
                </div>
                `;
            }).join('');
            
            document.querySelectorAll('.btn-pf-load').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        applyDataToForm(pf.data);
                        IslandKit.notify('Đã khôi phục', `Đã nạp bản lưu "${pf.name}".`, 'success');
                        modal.classList.add('hidden');
                    }
                };
            });
            
            document.querySelectorAll('.btn-pf-rename').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        showDialog({
                            type: 'prompt',
                            title: 'Đổi tên bản lưu',
                            message: 'Nhập tên mới cho cấu hình này:',
                            defaultValue: pf.name,
                            okText: 'Lưu tên',
                            onConfirm: (newName) => {
                                if (newName && newName.trim() !== '' && newName !== pf.name) {
                                    pf.name = newName.trim();
                                    pf.updatedAt = Date.now();
                                    saveProfiles(profiles);
                                    refreshList();
                                    IslandKit.notify('Thành công', 'Đã đổi tên bản lưu.', 'success');
                                }
                            }
                        });
                    }
                };
            });
            
            document.querySelectorAll('.btn-pf-del').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        showDialog({
                            type: 'confirm',
                            title: 'Xóa bản lưu',
                            message: `Bạn có chắc chắn muốn xóa bản lưu "<b>${escapeHTML(pf.name)}</b>"?`,
                            okText: 'Xóa',
                            onConfirm: () => {
                                profiles = profiles.filter(x => x.id !== pf.id);
                                saveProfiles(profiles);
                                refreshList();
                                IslandKit.notify('Đã xóa', 'Bản lưu đã được loại bỏ.', 'info');
                            }
                        });
                    }
                };
            });
        };
        
        refreshList();
        modal.classList.remove('hidden');
    });

    // Xuất file JSON
    _('#btn-mt-export')?.addEventListener('click', () => {
        const title = _('#in-title')?.value.trim() || 'config';
        const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllData(), null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `meta-tags-${safeTitle}.json`;
        a.click();
        IslandKit.notify('Đã xuất file', 'Tệp JSON cấu hình đã được tải về.', 'success');
    });

    // Nhập file JSON
    const fileImportInput = _('#file-mt-import');
    _('#btn-mt-import-trigger')?.addEventListener('click', () => fileImportInput?.click());

    fileImportInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                applyDataToForm(data);
                IslandKit.notify('Thành công', `Đã nạp cấu hình từ ${file.name}.`, 'success');
            } catch (err) {
                IslandKit.notify('Lỗi tệp', 'Tệp JSON không hợp lệ.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    });

    // Xóa Form
    _('#btn-mt-clear')?.addEventListener('click', () => {
        showDialog({
            type: 'confirm',
            title: 'Làm mới biểu mẫu?',
            message: 'Toàn bộ nội dung đang nhập sẽ bị xóa và đưa về mặc định.',
            okText: 'Làm mới',
            onConfirm: () => {
                _('#meta-form')?.reset();
                const themeCol = _('#in-theme-color'); if (themeCol) themeCol.value = "#ffffff";
                hostElement.querySelectorAll('.vp-check').forEach(cb => cb.checked = (cb.value === 'width=device-width' || cb.value === 'initial-scale=1.0'));
                hostElement.querySelectorAll('.fd-check').forEach(cb => cb.checked = false);
                
                const cdnTw = _('#in-cdn-tailwind'); if (cdnTw) cdnTw.checked = false;
                const cdnBs = _('#in-cdn-bootstrap'); if (cdnBs) cdnBs.checked = false;
                const cdnFa = _('#in-cdn-fa'); if (cdnFa) cdnFa.checked = false;
                const cdnJq = _('#in-cdn-jquery'); if (cdnJq) cdnJq.checked = false;
                const fullHtml = _('#in-full-html'); if (fullHtml) fullHtml.checked = true;

                generateMeta();
                const basicTab = _('[data-target="form-basic"]');
                basicTab?.click();
                IslandKit.notify('Đã làm mới', 'Biểu mẫu đã được khôi phục.', 'info');
            }
        });
    });
}