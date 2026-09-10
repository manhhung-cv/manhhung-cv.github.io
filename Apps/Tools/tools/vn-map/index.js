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
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER (CHỈ BÁO KHI CẦN THIẾT)
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        return Boolean(isEnabled && wrapper);
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive() && typeof window.triggerIslandNotification === 'function') {
            window.triggerIslandNotification(title, desc, type, duration);
        } else if (typeof UI !== 'undefined' && typeof UI.showAlert === 'function') {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="addr-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #addr-root-container {
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

            .addr-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Registry</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Chuyển Đổi Địa Chỉ</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Cập nhật đơn vị hành chính Việt Nam mới nhất theo quy chuẩn tự động và tra cứu thủ công.</p>
                </div>

                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold text-accent-theme px-3 py-1.5 rounded-[12px] bg-accent-theme-alpha flex items-center gap-1.5">
                        <i class="fas fa-database text-[10px]"></i> <span id="addr-db-badge">Đang tải DB...</span>
                    </span>
                </div>
            </div>

            <!-- TAB CONTROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="address-tabs">
                    <button class="tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-target="tab-address-auto">
                        <i class="fas fa-wand-magic-sparkles text-[11px]"></i> Tự động đồng loạt
                    </button>
                    <button class="tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="tab-address-manual">
                        <i class="fas fa-map-location-dot text-[11px]"></i> Tra cứu thủ công
                    </button>
                </div>
            </div>

            <!-- WORKSPACE CONTAINER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm">
                
                <!-- 1. PANE AUTO -->
                <div class="tab-pane block space-y-4" id="tab-address-auto">
                    <!-- Input Area -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dữ liệu nguồn cần chuẩn hóa</span>
                            <button id="btn-paste-input" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                                <i class="far fa-paste text-[11px]"></i> <span>Dán</span>
                            </button>
                        </div>
                        <textarea id="address-input" 
                            class="addr-input-zen w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 outline-none text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white resize-y min-h-[120px] custom-scrollbar placeholder-zinc-400 focus:border-accent-theme transition-all" 
                            placeholder="Dán văn bản hoặc danh sách địa chỉ cũ vào đây... Hỗ trợ tách nhiều dòng hoặc phân tách bằng dấu chấm phẩy (;)."></textarea>
                    </div>

                    <button id="btn-convert-auto" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-arrows-rotate text-xs"></i> <span>Xử lý và cập nhật địa chỉ</span>
                    </button>

                    <!-- Result Area -->
                    <div class="space-y-2 pt-1">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kết quả địa chỉ mới</span>
                            <button id="btn-copy-result" class="h-7 px-2.5 rounded-[8px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                                <i class="far fa-copy text-[11px]"></i> <span>Sao chép</span>
                            </button>
                        </div>
                        <textarea id="address-result" readonly 
                            class="addr-input-zen w-full bg-accent-theme-alpha border border-accent-theme/20 rounded-[18px] p-3.5 outline-none text-xs sm:text-sm font-semibold text-accent-theme resize-y min-h-[120px] custom-scrollbar placeholder-accent-theme/40" 
                            placeholder="Kết quả sau khi chuẩn hóa sẽ xuất hiện tại đây..."></textarea>
                    </div>
                </div>

                <!-- 2. PANE MANUAL -->
                <div class="tab-pane hidden space-y-4" id="tab-address-manual">
                    <div class="rounded-[20px] bg-[#f2f2f7] dark:bg-black/40 p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] space-y-3.5">
                        
                        <!-- Tỉnh / Thành -->
                        <div class="space-y-1 relative">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tỉnh / Thành phố</label>
                            <div class="relative flex items-center bg-white dark:bg-[#27272a] rounded-[14px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06]">
                                <select id="sel-province" class="zen-select addr-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer pr-6">
                                    <option value="">Đang tải danh mục...</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>

                        <!-- Quận / Huyện -->
                        <div class="space-y-1 relative">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Quận / Huyện (Cũ)</label>
                            <div class="relative flex items-center bg-white dark:bg-[#27272a] rounded-[14px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06]">
                                <select id="sel-district" disabled class="zen-select addr-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer pr-6 disabled:opacity-40">
                                    <option value="">Chọn Quận/Huyện</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>

                        <!-- Phường / Xã -->
                        <div class="space-y-1 relative">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phường / Xã (Cũ)</label>
                            <div class="relative flex items-center bg-white dark:bg-[#27272a] rounded-[14px] px-3.5 h-11 border border-black/[0.04] dark:border-white/[0.06]">
                                <select id="sel-ward" disabled class="zen-select addr-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer pr-6 disabled:opacity-40">
                                    <option value="">Chọn Phường/Xã</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>

                    </div>

                    <!-- Block Kết quả tra cứu thủ công -->
                    <div id="manual-result-box" class="hidden rounded-[20px] bg-accent-theme-alpha border border-accent-theme/20 p-5 space-y-1.5 shadow-sm">
                        <span class="text-[10px] font-bold text-accent-theme uppercase tracking-wider block">Đơn vị hành chính mới cập nhật</span>
                        <div id="manual-new-address" class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-relaxed"></div>
                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING (CHỈ BÁO THÔNG TIN KHI CẦN THIẾT)
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#addr-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // 1. Quản lý Tabs
    const tabs = hostElement.querySelectorAll('#address-tabs .tab-btn');
    const panes = hostElement.querySelectorAll('.tab-pane');

    const activeClass = 'tab-btn active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveClass = 'tab-btn h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.className = inactiveClass; });
            tab.className = activeClass;

            panes.forEach(p => { 
                p.classList.remove('block'); 
                p.classList.add('hidden'); 
            });

            const targetPane = hostElement.querySelector(`#${tab.getAttribute('data-target')}`);
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('block');
            }
        });
    });

    // 2. Fetch Data & Cấu hình Database
    const dbUrl = new URL('./database.json', import.meta.url).href;
    const dbBadge = hostElement.querySelector('#addr-db-badge');

    fetch(dbUrl)
        .then(res => {
            if (!res.ok) throw new Error('Không thể tải file database');
            return res.json();
        })
        .then(addressDB => {
            const dbRows = addressDB.rows || [];
            if (dbBadge) dbBadge.textContent = `${dbRows.length.toLocaleString()} bản ghi`;
            initAutoMode(dbRows);
            initManualMode(dbRows);
        })
        .catch(err => {
            console.error('Lỗi nạp database.json:', dbUrl, err);
            if (dbBadge) dbBadge.textContent = 'Lỗi nạp DB';
            IslandKit.notify('Lỗi dữ liệu', 'Không thể kết nối cơ sở dữ liệu địa chỉ hành chính.', 'error');
        });

    // 3. Chế độ Tự Động (Auto Mode)
    function initAutoMode(dbRows) {
        const inputArea = hostElement.querySelector('#address-input');
        const resultArea = hostElement.querySelector('#address-result');
        const btnAuto = hostElement.querySelector('#btn-convert-auto');
        const btnCopy = hostElement.querySelector('#btn-copy-result');
        const btnPaste = hostElement.querySelector('#btn-paste-input');

        function buildFlexiblePattern(fullName) {
            if (!fullName) return "";
            let prefix = "";
            let name = fullName;
            
            if (/^Phường\s+/i.test(fullName)) {
                prefix = "(?:Phường|P\\.?)\\s+";
                name = fullName.replace(/^Phường\s+/i, "");
            } else if (/^Xã\s+/i.test(fullName)) {
                prefix = "(?:Xã|X\\.?)\\s+";
                name = fullName.replace(/^Xã\s+/i, "");
            } else if (/^Thị trấn\s+/i.test(fullName)) {
                prefix = "(?:Thị trấn|TT\\.?)\\s+";
                name = fullName.replace(/^Thị trấn\s+/i, "");
            } else if (/^Quận\s+/i.test(fullName)) {
                prefix = "(?:Quận|Q\\.?)\\s+";
                name = fullName.replace(/^Quận\s+/i, "");
            } else if (/^Huyện\s+/i.test(fullName)) {
                prefix = "(?:Huyện|H\\.?)\\s+";
                name = fullName.replace(/^Huyện\s+/i, "");
            } else if (/^Thị xã\s+/i.test(fullName)) {
                prefix = "(?:Thị xã|TX\\.?)\\s+";
                name = fullName.replace(/^Thị xã\s+/i, "");
            }
            
            const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const flexName = escapeRegExp(name).trim().replace(/\\s|\s/g, '\\s+');
            
            return prefix ? prefix + flexName : flexName;
        }

        const getCoreName = (name) => name.replace(/^(Phường|Xã|Thị trấn|Quận|Huyện|Thị xã)\s+/i, '').trim();

        const sortedDbRows = [...dbRows].sort((a, b) => {
            const lenA = (a.old?.ward_name?.length || 0) + (a.old?.district_name?.length || 0);
            const lenB = (b.old?.ward_name?.length || 0) + (b.old?.district_name?.length || 0);
            return lenB - lenA;
        });

        // Dán nhanh không spam thông báo
        btnPaste?.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    inputArea.value = text;
                }
            } catch (err) {
                IslandKit.notify('Lỗi clipboard', 'Trình duyệt chặn truy cập, hãy nhấn Ctrl+V.', 'warning');
            }
        });

        // Xử lý chuyển đổi
        btnAuto?.addEventListener('click', () => {
            const rawText = inputArea.value;
            if (!rawText.trim()) {
                IslandKit.notify('Thiếu dữ liệu', 'Vui lòng nhập danh sách địa chỉ cần chuẩn hóa.', 'warning');
                return;
            }

            const originalBtnHTML = btnAuto.innerHTML;
            btnAuto.innerHTML = '<i class="fas fa-circle-notch fa-spin text-xs"></i> <span>Đang xử lý đối chiếu...</span>';
            btnAuto.disabled = true;

            setTimeout(() => {
                const addresses = rawText.split(/[\n;]+/).map(a => a.trim()).filter(a => a.length > 0);
                let matchCount = 0;

                const processedAddresses = addresses.map(address => {
                    let currentAddr = address;
                    let isModified = false;

                    sortedDbRows.forEach(row => {
                        const wardPattern = buildFlexiblePattern(row.old?.ward_name);
                        const distPattern = buildFlexiblePattern(row.old?.district_name);
                        if (!wardPattern || !distPattern) return;

                        const searchPattern = new RegExp("(" + wardPattern + ")(\\s*[,\\-]?\\s*)(" + distPattern + ")", "gi");
                        const searchPatternReverse = new RegExp("(" + distPattern + ")(\\s*[,\\-]?\\s*)(" + wardPattern + ")", "gi");

                        const newWard = row.new?.ward_name || '';
                        const newDist = row.new?.district_name || row.old?.district_name || '';

                        const coreWard = getCoreName(newWard);
                        const coreDist = getCoreName(newDist);

                        const tempAddr = currentAddr;

                        if (coreWard.toLowerCase() === coreDist.toLowerCase()) {
                            currentAddr = currentAddr.replace(searchPattern, newWard); 
                            currentAddr = currentAddr.replace(searchPatternReverse, newWard);
                        } else {
                            currentAddr = currentAddr.replace(searchPattern, newWard + "$2" + newDist);
                            currentAddr = currentAddr.replace(searchPatternReverse, newDist + "$2" + newWard);
                        }

                        if (currentAddr !== tempAddr) {
                            isModified = true;
                        }
                    });

                    if (isModified) matchCount++;
                    return currentAddr;
                });

                resultArea.value = processedAddresses.join('\n');
                btnAuto.innerHTML = originalBtnHTML;
                btnAuto.disabled = false;

                // Chỉ thông báo kết quả tổng hợp khi hoàn tất
                if (matchCount > 0) {
                    IslandKit.notify('Hoàn tất', `Đã chuẩn hóa ${matchCount} địa chỉ.`, 'success');
                } else {
                    IslandKit.notify('Thông báo', 'Không phát hiện địa chỉ cũ cần thay thế.', 'info');
                }
            }, 30);
        });

        // Sao chép kết quả
        btnCopy?.addEventListener('click', async () => {
            if (!resultArea.value) return;
            try {
                await navigator.clipboard.writeText(resultArea.value);
                IslandKit.notify('Đã sao chép', 'Kết quả đã lưu vào bộ nhớ tạm.', 'success');
            } catch (e) {
                IslandKit.notify('Lỗi sao chép', 'Không thể truy cập clipboard.', 'error');
            }
        });
    }

    // 4. Chế độ Thủ Công (Manual Mode)
    function initManualMode(dbRows) {
        const selProv = hostElement.querySelector('#sel-province');
        const selDist = hostElement.querySelector('#sel-district');
        const selWard = hostElement.querySelector('#sel-ward');
        const manualResultBox = hostElement.querySelector('#manual-result-box');
        const manualResultText = hostElement.querySelector('#manual-new-address');

        selProv.innerHTML = '<option value="">Chọn Tỉnh / Thành phố</option>';
        const provinces = [...new Set(dbRows.map(r => r.old?.province_name).filter(Boolean))];
        provinces.forEach(p => selProv.add(new Option(p, p)));

        selProv.addEventListener('change', (e) => {
            selDist.innerHTML = '<option value="">Chọn Quận / Huyện</option>';
            selWard.innerHTML = '<option value="">Chọn Phường / Xã</option>';
            selWard.disabled = true;
            manualResultBox.classList.add('hidden');

            if (!e.target.value) {
                selDist.disabled = true;
                return;
            }

            selDist.disabled = false;
            const districts = [...new Set(dbRows.filter(r => r.old?.province_name === e.target.value).map(r => r.old?.district_name).filter(Boolean))];
            districts.forEach(d => selDist.add(new Option(d, d)));
        });

        selDist.addEventListener('change', (e) => {
            selWard.innerHTML = '<option value="">Chọn Phường / Xã</option>';
            manualResultBox.classList.add('hidden');

            if (!e.target.value) {
                selWard.disabled = true;
                return;
            }

            selWard.disabled = false;
            const wards = dbRows.filter(r => r.old?.province_name === selProv.value && r.old?.district_name === e.target.value);
            
            const uniqueWards = {};
            wards.forEach(w => { 
                if (w.old?.ward_code) uniqueWards[w.old.ward_code] = w; 
            });
            
            Object.values(uniqueWards).forEach(w => {
                selWard.add(new Option(w.old.ward_name, w.old.ward_code));
            });
        });

        selWard.addEventListener('change', (e) => {
            if (!e.target.value) {
                manualResultBox.classList.add('hidden');
                return;
            }

            const match = dbRows.find(r => r.old?.ward_code === e.target.value);
            if (match) {
                manualResultBox.classList.remove('hidden');
                const newDist = match.new?.district_name || match.old?.district_name || ''; 
                manualResultText.innerHTML = `${match.new?.ward_name || ''} <br> <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">${newDist}, ${match.new?.province_name || ''}</span>`;
            }
        });
    }
}