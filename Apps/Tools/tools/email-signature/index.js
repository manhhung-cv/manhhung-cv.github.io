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
// 2. TEMPLATE RENDERER (HUNQOS IDENTITY MAIL PREVIEW)
// =============================================================================
export function template() {
    return `
    <div id="sig-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #sig-root-container {
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
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-5xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Workspace</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Tạo Chữ ký Email</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Thiết kế chữ ký HTML chuẩn định dạng cho Gmail, Outlook & Apple Mail.</p>
                </div>

                <button id="btn-es-reset" class="w-10 h-10 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-500 hover:text-rose-500 flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Khôi phục mặc định">
                    <i class="fas fa-rotate-left text-xs"></i>
                </button>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: FORM ĐIỀU KHIỂN & CÀI ĐẶT -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    
                    <!-- SEGMENTED TABS -->
                    <div class="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full" id="es-source-tabs">
                        <button class="es-tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-tab="es-info">
                            Thông tin
                        </button>
                        <button class="es-tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-tab="es-links">
                            Liên kết
                        </button>
                        <button class="es-tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-tab="es-design">
                            Thiết kế
                        </button>
                    </div>

                    <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
                    <div id="es-info" class="es-tab-content space-y-3.5 block">
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Họ & Tên</label>
                                <input type="text" id="es-in-name" class="es-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all">
                            </div>
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Chức vụ</label>
                                <input type="text" id="es-in-title" class="es-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Công ty / Tổ chức</label>
                            <input type="text" id="es-in-company" class="es-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Điện thoại</label>
                                <input type="tel" id="es-in-phone" class="es-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-mono font-medium text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all">
                            </div>
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Email</label>
                                <input type="email" id="es-in-email" class="es-input w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-2 text-xs font-mono font-medium text-zinc-900 dark:text-white outline-none focus:border-accent-theme transition-all">
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: LIÊN KẾT & MẠNG XÃ HỘI -->
                    <div id="es-links" class="es-tab-content space-y-3.5 hidden">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">URL Ảnh đại diện</label>
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fas fa-image text-zinc-400 text-xs mr-2"></i>
                                <input type="url" id="es-in-avatar" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="https://...">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Website / Portfolio</label>
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fas fa-globe text-zinc-400 text-xs mr-2"></i>
                                <input type="url" id="es-in-website" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="https://...">
                            </div>
                        </div>

                        <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] space-y-2.5">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Mạng xã hội</label>
                            
                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fab fa-facebook text-zinc-400 text-xs mr-2.5 w-4 text-center"></i>
                                <input type="url" id="es-in-fb" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="Facebook URL">
                            </div>

                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fab fa-x-twitter text-zinc-400 text-xs mr-2.5 w-4 text-center"></i>
                                <input type="url" id="es-in-x" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="X (Twitter) URL">
                            </div>

                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fab fa-linkedin text-zinc-400 text-xs mr-2.5 w-4 text-center"></i>
                                <input type="url" id="es-in-li" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="LinkedIn URL">
                            </div>

                            <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1 focus-within:border-accent-theme transition-all">
                                <i class="fab fa-github text-zinc-400 text-xs mr-2.5 w-4 text-center"></i>
                                <input type="url" id="es-in-gh" class="es-input w-full bg-transparent border-none text-xs font-mono text-zinc-900 dark:text-white outline-none py-1" placeholder="GitHub URL">
                            </div>

                            <div class="flex gap-2">
                                <input type="text" id="es-in-other-name" class="es-input w-24 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-white outline-none" placeholder="Zalo">
                                <input type="url" id="es-in-other-url" class="es-input flex-1 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-white outline-none" placeholder="https://zalo.me/...">
                            </div>
                        </div>
                    </div>

                    <!-- TAB 3: THIẾT KẾ & MẪU -->
                    <div id="es-design" class="es-tab-content space-y-4 hidden">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Màu chữ ký</label>
                            <div class="flex items-center gap-2.5">
                                <button class="es-color-btn w-7 h-7 rounded-full shadow-sm ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-[#161618] transition-all" style="background-color: #18181b;" data-color="#18181b"></button>
                                <button class="es-color-btn w-7 h-7 rounded-full shadow-sm transition-all" style="background-color: #10b981;" data-color="#10b981"></button>
                                <button class="es-color-btn w-7 h-7 rounded-full shadow-sm transition-all" style="background-color: #2563eb;" data-color="#2563eb"></button>
                                <button class="es-color-btn w-7 h-7 rounded-full shadow-sm transition-all" style="background-color: #f59e0b;" data-color="#f59e0b"></button>
                                <div class="relative w-7 h-7 rounded-full overflow-hidden border border-black/[0.1] dark:border-white/[0.15] shadow-sm ml-1 flex items-center justify-center">
                                    <input type="color" id="es-custom-color" class="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none" value="#10b981" title="Tùy chỉnh màu">
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Bố cục mẫu</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="es-tpl-btn active p-2.5 rounded-[14px] border border-accent-theme bg-accent-theme-alpha text-left transition-all" data-tpl="premium">
                                    <div class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><i class="fas fa-gem text-[10px] text-accent-theme"></i> Premium</div>
                                    <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Hiện đại, viền đứng</span>
                                </button>
                                <button class="es-tpl-btn p-2.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all" data-tpl="corporate">
                                    <div class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><i class="fas fa-briefcase text-[10px] text-zinc-400"></i> Corporate</div>
                                    <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Doanh nghiệp</span>
                                </button>
                                <button class="es-tpl-btn p-2.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all" data-tpl="elegant">
                                    <div class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><i class="fas fa-align-center text-[10px] text-zinc-400"></i> Elegant</div>
                                    <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Căn giữa, tối giản</span>
                                </button>
                                <button class="es-tpl-btn p-2.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all" data-tpl="minimal">
                                    <div class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><i class="fas fa-bars-staggered text-[10px] text-zinc-400"></i> Minimal</div>
                                    <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Thuần văn bản</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- CỘT PHẢI: BẢN XEM TRƯỚC (HUNQOS MAIL CANVAS) -->
                <div class="lg:col-span-7 space-y-4 lg:sticky lg:top-6">
                    
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
                        
                        <!-- HEADER NÉT RIÊNG HUNQOS -->
                        <div class="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#161618]">
                            <div class="flex items-center gap-2.5">
                                <div class="w-6 h-6 rounded-[8px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-envelope-open-text text-[11px]"></i>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">Mail Canvas</span>
                                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-semibold">HTML 4</span>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <span class="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                                    <span class="w-1.5 h-1.5 rounded-full bg-accent-theme animate-pulse"></span>
                                    Live Render
                                </span>
                            </div>
                        </div>

                        <!-- EMAIL BODY CANVAS (Trắng thuần chuẩn Mail Client) -->
                        <div class="p-6 sm:p-8 bg-white overflow-x-auto min-h-[220px] flex items-center justify-start selection:bg-emerald-100 selection:text-black">
                            <div id="es-preview-box" class="w-full"></div>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button id="btn-es-copy-visual" class="h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                            <i class="far fa-copy text-sm"></i> Sao chép giao diện
                        </button>
                        <button id="btn-es-copy-html" class="h-12 rounded-[16px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            <i class="fas fa-code text-xs"></i> Sao chép mã HTML
                        </button>
                    </div>

                    <p class="text-[11px] text-zinc-400 text-center leading-relaxed">
                        Nhấn <b>Sao chép giao diện</b> rồi mở cài đặt chữ ký trong Gmail/Outlook và dán (<kbd class="font-mono text-[10px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+V</kbd>).
                    </p>
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
    const rootContainer = hostElement.querySelector('#sig-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const defaultAccent = ThemeKit.getAccentColor();

    let state = {
        name: 'Đinh Mạnh Hùng',
        title: 'Mechatronics Engineer',
        company: 'Hunq AIO Workspace',
        phone: '+81 90 1234 5678',
        email: 'contact@hunq.online',
        website: 'https://hunq.online',
        avatar: 'https://i.ibb.co/V3QzKxB/avatar.png',
        
        fb: '',
        x: 'https://x.com/hunq',
        li: 'https://linkedin.com/in/hunq',
        gh: 'https://github.com/hunq',
        otherName: 'Zalo',
        otherUrl: 'https://zalo.me/',
        
        color: defaultAccent,
        template: 'premium'
    };

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const inputs = {
        name: _('#es-in-name'),
        title: _('#es-in-title'),
        company: _('#es-in-company'),
        phone: _('#es-in-phone'),
        email: _('#es-in-email'),
        website: _('#es-in-website'),
        avatar: _('#es-in-avatar'),
        fb: _('#es-in-fb'),
        x: _('#es-in-x'),
        li: _('#es-in-li'),
        gh: _('#es-in-gh'),
        otherName: _('#es-in-other-name'),
        otherUrl: _('#es-in-other-url')
    };

    const colorBtns = $$('.es-color-btn');
    const customColorPicker = _('#es-custom-color');
    const tplBtns = $$('.es-tpl-btn');
    const tabBtns = $$('.es-tab-btn');
    const tabContents = $$('.es-tab-content');

    const previewBox = _('#es-preview-box');
    const btnCopyVisual = _('#btn-es-copy-visual');
    const btnCopyHtml = _('#btn-es-copy-html');
    const btnReset = _('#btn-es-reset');

    // Segmented Tabs Switching
    const activeTabClass = 'es-tab-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center';
    const inactiveTabClass = 'es-tab-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center';

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.className = inactiveTabClass);
            btn.className = activeTabClass;

            tabContents.forEach(c => c.classList.replace('block', 'hidden'));
            const target = _(`#${btn.dataset.tab}`);
            if (target) target.classList.replace('hidden', 'block');
        });
    });

    const ICON_BASE = {
        fb: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
        x: 'https://cdn-icons-png.flaticon.com/512/11262/11262828.png',
        li: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
        gh: 'https://cdn-icons-png.flaticon.com/512/733/733553.png'
    };

    const renderSocialsTable = (color, align = 'left') => {
        let tds = '';
        ['fb', 'x', 'li', 'gh'].forEach(key => {
            if (state[key]) {
                tds += `<td style="padding-right: 8px;"><a href="${state[key]}"><img src="${ICON_BASE[key]}" width="18" height="18" alt="${key}" style="display: block; border: 0;"></a></td>`;
            }
        });

        if (state.otherName && state.otherUrl) {
            tds += `<td style="padding-right: 8px; vertical-align: middle;"><a href="${state.otherUrl}" style="color: ${color}; font-size: 11px; font-weight: bold; text-decoration: none; font-family: sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">${state.otherName}</a></td>`;
        }

        if (!tds) return '';
        const tableAlign = align === 'center' ? 'margin: 12px auto 0 auto;' : 'margin-top: 12px;';

        return `
        <table cellpadding="0" cellspacing="0" border="0" style="${tableAlign} padding-top: 10px; border-top: 1px solid #f4f4f5;">
            <tr>${tds}</tr>
        </table>
        `;
    };

    const generateHTML = () => {
        const c = state.color;
        const cleanWebsite = state.website ? state.website.replace(/^https?:\/\//, '') : '';

        if (state.template === 'premium') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #3f3f46; background: #ffffff;">
                <tr>
                    ${state.avatar ? `
                    <td style="padding-right: 20px; border-right: 2px solid ${c}; vertical-align: top;">
                        <img src="${state.avatar}" alt="${state.name}" width="84" height="84" style="border-radius: 50%; display: block; object-fit: cover;">
                    </td>` : ''}
                    <td style="padding-left: ${state.avatar ? '20px' : '0'}; vertical-align: top;">
                        <h2 style="margin: 0 0 3px 0; font-size: 18px; font-weight: 700; color: #18181b; letter-spacing: -0.3px;">${state.name}</h2>
                        ${(state.title || state.company) ? `
                        <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: ${c}; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${state.title} ${state.title && state.company ? `<span style="color: #e4e4e7; margin: 0 4px;">|</span>` : ''} <span style="color: #71717a; font-weight: 500;">${state.company}</span>
                        </p>` : ''}
                        
                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; line-height: 1.6; color: #52525b;">
                            ${state.phone ? `<tr><td style="padding-right: 8px; padding-bottom: 2px;"><strong style="color: #18181b;">P.</strong></td><td style="padding-bottom: 2px;">${state.phone}</td></tr>` : ''}
                            ${state.email ? `<tr><td style="padding-right: 8px; padding-bottom: 2px;"><strong style="color: #18181b;">E.</strong></td><td style="padding-bottom: 2px;"><a href="mailto:${state.email}" style="color: #52525b; text-decoration: none;">${state.email}</a></td></tr>` : ''}
                            ${state.website ? `<tr><td style="padding-right: 8px; padding-bottom: 2px;"><strong style="color: #18181b;">W.</strong></td><td style="padding-bottom: 2px;"><a href="${state.website}" style="color: #52525b; text-decoration: none;">${cleanWebsite}</a></td></tr>` : ''}
                        </table>
                        
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        } 
        else if (state.template === 'corporate') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; background: #ffffff;">
                <tr>
                    ${state.avatar ? `
                    <td style="padding-right: 18px; vertical-align: middle;">
                        <img src="${state.avatar}" alt="${state.name}" width="80" height="80" style="border-radius: 8px; display: block; object-fit: cover;">
                    </td>` : ''}
                    <td style="padding-left: ${state.avatar ? '18px' : '0'}; border-left: 3px solid ${c}; vertical-align: middle;">
                        <h2 style="margin: 0 0 3px 0; font-size: 17px; font-weight: bold; color: #111111;">${state.name}</h2>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: ${c};">${state.title}${state.title && state.company ? ' / ' : ''}${state.company}</p>
                        
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #555555;">
                            ${state.phone ? `<strong style="color:#111;">M:</strong> ${state.phone}<br>` : ''}
                            ${state.email ? `<strong style="color:#111;">E:</strong> <a href="mailto:${state.email}" style="color: #555; text-decoration: none;">${state.email}</a><br>` : ''}
                            ${state.website ? `<strong style="color:#111;">W:</strong> <a href="${state.website}" style="color: #555; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        </p>
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        }
        else if (state.template === 'elegant') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Georgia, serif; font-size: 13px; color: #444444; text-align: center; width: 100%; max-width: 380px; background: #ffffff;">
                <tr>
                    <td style="padding-bottom: 14px;">
                        ${state.avatar ? `<img src="${state.avatar}" alt="${state.name}" width="76" height="76" style="border-radius: 50%; display: inline-block; object-fit: cover; margin-bottom: 10px; border: 2px solid ${c}; padding: 2px;">` : ''}
                        <h2 style="margin: 0 0 3px 0; font-size: 20px; font-weight: normal; color: #111111;">${state.name}</h2>
                        <p style="margin: 0; font-size: 12px; font-style: italic; color: ${c};">${state.title}${state.company ? ` &bull; ${state.company}` : ''}</p>
                    </td>
                </tr>
                <tr>
                    <td style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 10px 0;">
                        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #666666;">
                            ${state.phone ? `${state.phone} &nbsp;|&nbsp; ` : ''}
                            ${state.email ? `<a href="mailto:${state.email}" style="color: #666; text-decoration: none;">${state.email}</a>` : ''}
                            ${state.website ? ` &nbsp;|&nbsp; <a href="${state.website}" style="color: #666; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 10px;">
                        ${renderSocialsTable(c, 'center')}
                    </td>
                </tr>
            </table>`;
        }
        else {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #52525b; line-height: 1.6; background: #ffffff;">
                <tr>
                    <td style="padding-bottom: 8px;">
                        <h2 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 700; color: #18181b;">${state.name}</h2>
                        ${(state.title || state.company) ? `
                        <p style="margin: 0; color: ${c}; font-weight: 600; font-size: 12px;">${state.title} <span style="color: #a1a1aa; font-weight: 400;">@</span> ${state.company}</p>` : ''}
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 8px; border-top: 1px solid #e4e4e7;">
                        ${state.phone ? `<span style="color: #18181b; font-weight: 700;">T</span> &nbsp;${state.phone} &nbsp;&nbsp;&nbsp;` : ''}
                        ${state.email ? `<span style="color: #18181b; font-weight: 700;">E</span> &nbsp;<a href="mailto:${state.email}" style="color: #52525b; text-decoration: none;">${state.email}</a> <br>` : ''}
                        ${state.website ? `<span style="color: #18181b; font-weight: 700;">W</span> &nbsp;<a href="${state.website}" style="color: #52525b; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        }
    };

    const updatePreview = () => {
        if (previewBox) previewBox.innerHTML = generateHTML();
    };

    const syncInputToState = () => {
        for (let key in inputs) {
            if (inputs[key]) state[key] = inputs[key].value;
        }
        updatePreview();
    };

    const syncStateToInput = () => {
        for (let key in inputs) {
            if (inputs[key]) inputs[key].value = state[key];
        }

        colorBtns.forEach(b => {
            if (b.dataset.color === state.color) {
                b.classList.add('ring-2', 'ring-offset-2', 'ring-zinc-400', 'dark:ring-offset-[#161618]');
            } else {
                b.classList.remove('ring-2', 'ring-offset-2', 'ring-zinc-400', 'dark:ring-offset-[#161618]');
            }
        });

        tplBtns.forEach(b => {
            if (b.dataset.tpl === state.template) {
                b.className = 'es-tpl-btn active p-2.5 rounded-[14px] border border-accent-theme bg-accent-theme-alpha text-left transition-all';
                b.querySelector('i')?.classList.add('text-accent-theme');
            } else {
                b.className = 'es-tpl-btn p-2.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all';
                b.querySelector('i')?.classList.remove('text-accent-theme');
            }
        });

        updatePreview();
    };

    for (let key in inputs) {
        inputs[key]?.addEventListener('input', syncInputToState);
    }

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.color = btn.dataset.color;
            if (customColorPicker) customColorPicker.value = state.color;
            syncStateToInput();
        });
    });

    customColorPicker?.addEventListener('input', (e) => {
        state.color = e.target.value;
        syncStateToInput();
    });

    tplBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.template = btn.dataset.tpl;
            syncStateToInput();
        });
    });

    // Copy Visual (dán trực tiếp vào Gmail/Outlook)
    btnCopyVisual?.addEventListener('click', () => {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(previewBox);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            document.execCommand('copy');
            IslandKit.notify('Đã sao chép chữ ký', 'Mở Cài đặt Gmail/Outlook và nhấn Ctrl+V (hoặc Cmd+V) để dán.', 'success', 3500);
        } catch (err) {
            IslandKit.notify('Lỗi sao chép', 'Trình duyệt không hỗ trợ sao chép định dạng trực quan.', 'error');
        }
        selection.removeAllRanges();
    });

    // Copy mã HTML
    btnCopyHtml?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(generateHTML());
            IslandKit.notify('Đã sao chép HTML', 'Mã nguồn bảng HTML đã lưu vào clipboard.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi sao chép', 'Không thể truy cập bộ nhớ tạm.', 'error');
        }
    });

    // Reset Form
    btnReset?.addEventListener('click', () => {
        UI.showConfirm(
            'Khôi phục mặc định?',
            'Bạn có chắc muốn xóa tất cả thông tin vừa nhập?',
            () => {
                state = {
                    name: '', title: '', company: '', phone: '', email: '', website: '', avatar: '',
                    fb: '', x: '', li: '', gh: '', otherName: '', otherUrl: '',
                    color: ThemeKit.getAccentColor(), template: 'premium'
                };
                syncStateToInput();
                IslandKit.notify('Đã đặt lại', 'Đã xóa toàn bộ nội dung chữ ký.', 'info');
            }
        );
    });

    syncStateToInput();
}