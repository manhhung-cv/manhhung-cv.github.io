import { UI } from '../../js/ui.js';
import { ThemeKit, IslandKit } from '../ui-kit/index.js'; // Nhập bộ điều khiển Theme & Dynamic Island

// =============================================================================
// 1. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - EMERALD ACCENT)
// =============================================================================
export function template() {
    return `
    <div id="url-shortener-container" class="w-full h-full flex flex-col bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #url-shortener-container {
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
        </style>

        <!-- TOP APP BAR -->
        <header class="h-12 px-4 shrink-0 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/75 dark:bg-[#111113]/75 backdrop-blur-2xl z-20">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-accent-theme transition-colors shadow-sm"></span>
                <span class="text-[13px] font-bold tracking-tight text-zinc-900 dark:text-white">URL Shortener</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-mono">v1.0</span>
            </div>

            <div class="flex items-center gap-2">
                <span id="shortener-island-status" class="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border transition-all">
                    Scanning...
                </span>
            </div>
        </header>

        <!-- MAIN SCROLLER -->
        <main class="flex-1 overflow-y-auto no-scrollbar px-3.5 sm:px-6 py-5 max-w-2xl mx-auto w-full space-y-5 pb-24">
            
            <div class="px-1 space-y-0.5">
                <h2 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Rút gọn liên kết</h2>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tạo liên kết ngắn gọn, nhanh chóng qua hai dịch vụ is.gd hoặc hunqShortLink.</p>
            </div>

            <!-- FORM CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                
                <!-- INPUT URL GROUP -->
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Liên kết gốc (URL)</label>
                    <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1.5 border border-black/[0.04] dark:border-white/[0.06]">
                        <i class="fas fa-link text-zinc-400 ml-3 text-xs"></i>
                        <input type="url" id="input-long-url" class="w-full bg-transparent border-none outline-none px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="https://example.com/duong-dan-dai-ngoang..." required>
                        <button id="btn-paste-url" class="bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-[12px] text-xs whitespace-nowrap active:scale-95 transition-transform">
                            <i class="far fa-clipboard mr-1"></i> Dán
                        </button>
                    </div>
                </div>

                <!-- PROVIDER SELECTOR & ALIAS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Dịch vụ rút gọn</label>
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.06] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="shortener-provider-tabs">
                            <button class="provider-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all" data-provider="isgd">
                                is.gd
                            </button>
                            <button class="provider-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all border border-transparent" data-provider="hunq">
                                hunqShortLink
                            </button>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hậu tố tùy chỉnh (Tùy chọn)</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3 py-2 border border-black/[0.04] dark:border-white/[0.06]">
                            <i class="fas fa-signature text-zinc-400 mr-2 text-xs"></i>
                            <input type="text" id="input-custom-shorturl" class="w-full bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="my-custom-link">
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTON -->
                <button id="btn-shorten" class="w-full h-11 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                    <i class="fas fa-compress-alt text-xs"></i> Rút Gọn Liên Kết
                </button>
            </div>

            <!-- RESULT CARD (HIDDEN BY DEFAULT) -->
            <div id="result-card" class="hidden rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kết quả liên kết ngắn</h3>
                    <span id="result-provider-badge" class="text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold bg-accent-theme-alpha text-accent-theme">is.gd</span>
                </div>

                <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] p-1.5 border border-black/[0.04] dark:border-white/[0.06]">
                    <i class="fas fa-globe text-accent-theme ml-3 text-xs"></i>
                    <input type="text" id="input-result-url" class="w-full bg-transparent border-none outline-none px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-white" readonly>
                    <button id="btn-copy-result" class="bg-accent-theme text-white font-bold px-4 py-1.5 rounded-[12px] text-xs whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1.5">
                        <i class="far fa-copy"></i> Sao chép
                    </button>
                </div>
            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 2. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#url-shortener-container') || hostElement;
    let selectedProvider = 'isgd';

    // -------------------------------------------------------------
    // Áp dụng Theme Accent
    // -------------------------------------------------------------
    const updateAccent = () => {
        ThemeKit.applyAccent(rootContainer); //
    };
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // -------------------------------------------------------------
    // Quét trạng thái Island[cite: 1]
    // -------------------------------------------------------------
    const updateEngineBadge = () => {
        const isIslandOn = IslandKit.isIslandActive(); //[cite: 1]
        const badge = hostElement.querySelector('#shortener-island-status');
        if (badge) {
            badge.textContent = isIslandOn ? 'Island: Ready' : 'Toast Fallback';
            badge.className = `text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${isIslandOn
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`;
        }
    };
    updateEngineBadge();

    // -------------------------------------------------------------
    // Tab Provider Selection
    // -------------------------------------------------------------
    const tabs = hostElement.querySelectorAll('#shortener-provider-tabs .provider-tab');
    const activeClass = 'provider-tab active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all';
    const inactiveClass = 'provider-tab py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all border border-transparent';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.className = inactiveClass);
            tab.className = activeClass;
            selectedProvider = tab.getAttribute('data-provider');
        });
    });

    // -------------------------------------------------------------
    // Paste Clipboard Event
    // -------------------------------------------------------------
    hostElement.querySelector('#btn-paste-url')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                hostElement.querySelector('#input-long-url').value = text;
                IslandKit.notify('Đã dán', 'Đã tự động điền liên kết từ khay nhớ tạm.', 'info'); //[cite: 1]
            }
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể đọc dữ liệu từ khay nhớ tạm.', 'error'); //[cite: 1]
        }
    });

    // -------------------------------------------------------------
    // Shorten Handler
    // -------------------------------------------------------------
    hostElement.querySelector('#btn-shorten')?.addEventListener('click', async () => {
        const longUrl = hostElement.querySelector('#input-long-url')?.value.trim();
        const customAlias = hostElement.querySelector('#input-custom-shorturl')?.value.trim();
        const btnShorten = hostElement.querySelector('#btn-shorten');

        if (!longUrl) {
            IslandKit.notify('Cảnh báo', 'Vui lòng nhập đường dẫn URL cần rút gọn.', 'error'); //[cite: 1]
            return;
        }

        // Hiển thị Live Activity Syncing trên Island[cite: 1]
        const currentAccent = ThemeKit.getAccentColor(); //[cite: 1]
        IslandKit.setLiveView(`
            <div class="w-full h-full flex items-center justify-between px-2 text-[10px] font-mono select-none">
                <span style="color: ${currentAccent};" class="font-bold flex items-center gap-1">
                    <i class="fas fa-spinner animate-spin text-[8px]"></i> PROCESSING
                </span>
                <span class="text-white font-semibold">Creating Link...</span>
            </div>
        `, null); //[cite: 1]

        btnShorten.disabled = true;
        btnShorten.style.opacity = '0.6';

        try {
            let shortUrl = '';

            if (selectedProvider === 'isgd') {
                // Tích hợp API is.gd
                let endpoint = `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`;
                if (customAlias) {
                    endpoint += `&shorturl=${encodeURIComponent(customAlias)}`;
                }

                const res = await fetch(endpoint);
                const data = await res.json();

                if (data.shorturl) {
                    shortUrl = data.shorturl;
                } else if (data.errormessage) {
                    throw new Error(data.errormessage);
                } else {
                    throw new Error('Lỗi không xác định từ is.gd');
                }
            } else if (selectedProvider === 'hunq') {
                // Tích hợp Service hunqShortLink
                shortUrl = await hunqShortLink(longUrl, customAlias);
            }

            // Hiển thị kết quả
            const resultCard = hostElement.querySelector('#result-card');
            const resultInput = hostElement.querySelector('#input-result-url');
            const providerBadge = hostElement.querySelector('#result-provider-badge');

            resultInput.value = shortUrl;
            providerBadge.textContent = selectedProvider === 'isgd' ? 'is.gd' : 'hunqShortLink';
            resultCard.classList.remove('hidden');

            IslandKit.notify('Rút gọn thành công', `Liên kết đã tạo: ${shortUrl}`, 'success'); //[cite: 1]
        } catch (err) {
            IslandKit.notify('Rút gọn thất bại', err.message || 'Không thể tạo liên kết ngắn.', 'error'); //[cite: 1]
        } finally {
            IslandKit.resetLiveView(); // Trả Island về mặc định[cite: 1]
            btnShorten.disabled = false;
            btnShorten.style.opacity = '1';
        }
    });

    // -------------------------------------------------------------
    // Copy Result Link
    // -------------------------------------------------------------
    hostElement.querySelector('#btn-copy-result')?.addEventListener('click', async () => {
        const shortUrl = hostElement.querySelector('#input-result-url')?.value;
        if (!shortUrl) return;

        try {
            await navigator.clipboard.writeText(shortUrl);
            IslandKit.notify('Đã sao chép', 'Đã lưu liên kết ngắn vào clipboard.', 'success'); //[cite: 1]
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể sao chép liên kết.', 'error'); //[cite: 1]
        }
    });
}

// =============================================================================
// 3. HUNQ SHORT LINK SERVICE PLACEHOLDER
// =============================================================================
/**
 * Hàm xử lý rút gọn link qua dịch vụ hunqShortLink
 * (Có thể cập nhật mã nguồn thực tế tại đây sau)
 */
async function hunqShortLink(longUrl, customAlias = '') {
    // Demo Async Call Placeholder
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (longUrl.includes('error')) {
                reject(new Error('Dịch vụ hunqShortLink từ chối liên kết này.'));
            } else {
                const alias = customAlias || Math.random().toString(36).substring(2, 7);
                resolve(`https://hunq.link/${alias}`);
            }
        }, 600);
    });
}