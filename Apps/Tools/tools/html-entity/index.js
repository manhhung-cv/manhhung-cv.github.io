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
    <div id="entity-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #entity-root-container {
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
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Dev Kit</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Entity Encoder / Decoder</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Chuyển đổi ký tự đặc biệt sang HTML Entities an toàn, chống lỗ hổng XSS khi hiển thị mã.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                <!-- INPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Đầu vào (Input)</h3>
                            <button id="btn-clear" class="w-7 h-7 rounded-[8px] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-colors" title="Xóa dữ liệu">
                                <i class="far fa-trash-can text-xs"></i>
                            </button>
                        </div>

                        <div class="flex-1 flex flex-col min-h-[260px]">
                            <textarea id="entity-input" 
                                class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-900 dark:text-white resize-y placeholder-zinc-400 transition-all focus:border-accent-theme"
                                placeholder="Nhập văn bản thô, mã HTML, dấu câu đặc biệt..."></textarea>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="flex gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                        <button id="btn-encode" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
                            <i class="fas fa-code text-xs"></i> Encode
                        </button>
                        <button id="btn-decode" class="flex-1 h-11 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                            <i class="fas fa-file-code text-xs"></i> Decode
                        </button>
                    </div>
                </div>

                <!-- OUTPUT CARD -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kết quả (Output)</h3>
                            <button id="btn-copy" class="px-2.5 py-1 rounded-[8px] bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-colors" title="Sao chép">
                                <i class="far fa-copy text-[11px]"></i> Chép
                            </button>
                        </div>

                        <div class="flex-1 flex flex-col min-h-[260px]">
                            <textarea id="entity-output" readonly
                                class="flex-1 w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none text-xs font-mono text-zinc-800 dark:text-zinc-200 resize-y placeholder-zinc-400 select-all"
                                placeholder="Kết quả chuyển đổi Entities sẽ hiển thị tại đây..."></textarea>
                        </div>
                    </div>

                    <!-- STATUS DISPLAY -->
                    <div class="p-3 rounded-[14px] bg-accent-theme-alpha border border-black/[0.03] dark:border-white/[0.05] flex items-center gap-2.5">
                        <div class="w-6 h-6 rounded-[8px] bg-white dark:bg-[#1c1c1e] text-accent-theme flex items-center justify-center text-xs shrink-0 shadow-sm">
                            <i class="fas fa-shield-halved text-[10px]"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <p id="status-text" class="text-[11px] font-bold text-accent-theme uppercase tracking-wider truncate">Đang chờ thao tác</p>
                            <p class="text-[10px] text-zinc-400 truncate">Hệ thống xử lý qua DOMParser an toàn, vô hiệu hóa script độc hại.</p>
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

    const rootContainer = hostElement.querySelector('#entity-root-container') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);

    const inputEl = _('#entity-input');
    const outputEl = _('#entity-output');
    const btnEncode = _('#btn-encode');
    const btnDecode = _('#btn-decode');
    const btnClear = _('#btn-clear');
    const btnCopy = _('#btn-copy');
    const statusText = _('#status-text');

    const encodeHTML = (str) => {
        return str.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
            return '&#' + i.charCodeAt(0) + ';';
        });
    };

    const decodeHTML = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.documentElement.textContent || "";
    };

    const updateStatus = (message, isSuccess = true) => {
        if (!statusText) return;
        statusText.textContent = message;
        statusText.className = isSuccess 
            ? 'text-[11px] font-bold text-accent-theme uppercase tracking-wider truncate' 
            : 'text-[11px] font-bold text-rose-500 uppercase tracking-wider truncate';
        
        setTimeout(() => {
            if (statusText) {
                statusText.textContent = 'Sẵn sàng';
                statusText.className = 'text-[11px] font-bold text-accent-theme uppercase tracking-wider truncate';
            }
        }, 2800);
    };

    btnEncode?.addEventListener('click', () => {
        const val = inputEl?.value || '';
        if (!val.trim()) {
            IslandKit.notify('Cảnh báo', 'Vui lòng nhập văn bản hoặc thẻ HTML cần Encode.', 'warning');
            return;
        }
        if (outputEl) outputEl.value = encodeHTML(val);
        updateStatus('Đã mã hóa (Encode) thành công');
        IslandKit.notify('Thành công', 'Đã chuyển đổi văn bản sang HTML Entities.', 'success');
    });

    btnDecode?.addEventListener('click', () => {
        const val = inputEl?.value || '';
        if (!val.trim()) {
            IslandKit.notify('Cảnh báo', 'Vui lòng nhập chuỗi Entities cần giải mã.', 'warning');
            return;
        }
        if (outputEl) outputEl.value = decodeHTML(val);
        updateStatus('Đã giải mã (Decode) thành công');
        IslandKit.notify('Thành công', 'Đã khôi phục văn bản gốc từ Entities.', 'success');
    });

    btnCopy?.addEventListener('click', async () => {
        const val = outputEl?.value || '';
        if (!val) {
            IslandKit.notify('Trống', 'Chưa có kết quả để sao chép.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(val);
            updateStatus('Đã sao chép vào Clipboard');
            IslandKit.notify('Đã sao chép', 'Kết quả đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (err) {
            IslandKit.notify('Lỗi', 'Trình duyệt không hỗ trợ truy cập clipboard.', 'error');
        }
    });

    btnClear?.addEventListener('click', () => {
        if (inputEl) inputEl.value = '';
        if (outputEl) outputEl.value = '';
        inputEl?.focus();
        updateStatus('Đã dọn dẹp vùng nhập');
    });
}