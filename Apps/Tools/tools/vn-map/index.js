import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Nút bấm Premium */
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.7; pointer-events: none; transform: scale(1); cursor: not-allowed; }

            /* Animation */
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Chuyển Đổi Địa Chỉ</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Công cụ tự động & thủ công cập nhật địa chỉ hành chính Việt Nam mới nhất.</p>
            </div>

            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Tabs Control -->
                <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-6" id="address-tabs">
                    <button class="tab-btn active btn-premium px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-target="tab-address-auto">Tự động</button>
                    <button class="tab-btn btn-premium px-5 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800" data-target="tab-address-manual">Thủ công</button>
                </div>

                <!-- Tab: Tự Động -->
                <div class="tab-pane block animate-in fade-in" id="tab-address-auto">
                    <div class="space-y-4">
                        
                        <!-- Area: Nhập liệu -->
                        <div>
                            <div class="flex items-center justify-between mb-2 mt-1">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Dữ liệu cần xử lý</label>
                                <button id="btn-paste-input" class="btn-premium h-7 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold gap-1.5 transition-colors">
                                    <i class="fas fa-paste"></i> Dán nhanh
                                </button>
                            </div>
                            <textarea id="address-input" class="w-full bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-y min-h-[120px] custom-scrollbar placeholder-zinc-400 focus:ring-2 ring-zinc-900 dark:ring-white transition-all" placeholder="Dán văn bản hoặc danh sách địa chỉ cũ vào đây, có thể chuyển đổi hàng loạt bằng cách xuống dòng hoặc sử dụng &#x22;;&#x22; chấm phẩy."></textarea>
                        </div>
                        
                        <button id="btn-convert-auto" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                            <i class="fas fa-sync-alt"></i> Xử lý dữ liệu
                        </button>
                        
                        <!-- Area: Kết quả -->
                        <div>
                            <div class="flex items-center justify-between mb-2 mt-2">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Kết quả chuyển đổi</label>
                                <button id="btn-copy-result" class="btn-premium h-7 px-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold gap-1.5 transition-colors">
                                    <i class="far fa-copy"></i> Sao chép
                                </button>
                            </div>
                            <textarea id="address-result" readonly class="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 outline-none text-sm font-medium text-emerald-700 dark:text-emerald-400 resize-y min-h-[120px] custom-scrollbar placeholder-emerald-300 dark:placeholder-emerald-700" placeholder="Kết quả sẽ hiển thị tại đây..."></textarea>
                        </div>

                    </div>
                </div>

                <!-- Tab: Thủ Công -->
                <div class="tab-pane hidden animate-in fade-in" id="tab-address-manual">
                    <div class="space-y-4">
                        <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-5 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all relative">
                            <!-- Tỉnh / Thành -->
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Tỉnh / Thành Phố</label>
                            <div class="relative">
                                <select id="sel-province" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 mb-4 appearance-none cursor-pointer">
                                    <option value="">Đang tải dữ liệu...</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-0 top-1 text-xs text-zinc-400 pointer-events-none"></i>
                            </div>
                            <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-4"></div>

                            <!-- Quận / Huyện -->
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Quận / Huyện (Cũ)</label>
                            <div class="relative">
                                <select id="sel-district" disabled class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 mb-4 appearance-none cursor-pointer disabled:opacity-40">
                                    <option value="">Chọn Quận/Huyện</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-0 top-1 text-xs text-zinc-400 pointer-events-none"></i>
                            </div>
                            <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-4"></div>

                            <!-- Phường / Xã -->
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Phường / Xã (Cũ)</label>
                            <div class="relative">
                                <select id="sel-ward" disabled class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 appearance-none cursor-pointer disabled:opacity-40">
                                    <option value="">Chọn Phường/Xã</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-0 top-1 text-xs text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>

                        <!-- Block Kết Quả Thủ Công -->
                        <div id="manual-result-box" class="hidden bg-zinc-900 dark:bg-white rounded-2xl p-5 ui-fade-in relative mt-4">
                            <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">Đơn vị hành chính mới</label>
                            <div id="manual-new-address" class="text-sm font-bold text-white dark:text-zinc-900 leading-relaxed"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    // ----------------------------------------------------
    // 1. QUẢN LÝ TABS
    // ----------------------------------------------------
    const tabs = document.querySelectorAll('#address-tabs .tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            });
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.remove('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            
            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('block');
            }
        });
    });

    // ----------------------------------------------------
    // 2. FETCH DATA VÀ KHỞI TẠO LOGIC
    // ----------------------------------------------------

    const dbUrl = new URL('./database.json', import.meta.url).href;

    fetch(dbUrl)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(addressDB => {
            const dbRows = addressDB.rows || [];
            initAutoMode(dbRows);
            initManualMode(dbRows);
        })
        .catch(err => {
            console.error("Lỗi tải database.json tại:", dbUrl, err);
            if(typeof UI !== 'undefined') {
                UI.showAlert('Lỗi dữ liệu', 'Không thể tải dữ liệu database.json. Vui lòng kiểm tra lại đường dẫn.', 'error');
            }
        });

    // --- Hàm Khởi tạo Tự động ---
    function initAutoMode(dbRows) {
        const inputArea = document.getElementById('address-input');
        const resultArea = document.getElementById('address-result');
        const btnAuto = document.getElementById('btn-convert-auto');
        const btnCopy = document.getElementById('btn-copy-result');
        const btnPaste = document.getElementById('btn-paste-input');

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
            const lenA = a.old.ward_name.length + a.old.district_name.length;
            const lenB = b.old.ward_name.length + b.old.district_name.length;
            return lenB - lenA;
        });

        // Xử lý sự kiện Dán Nhanh
        btnPaste.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                inputArea.value = text;
            } catch (err) {
                if(typeof UI !== 'undefined') UI.showAlert('Lỗi', 'Không thể đọc clipboard. Vui lòng cấp quyền hoặc dán thủ công.', 'error');
            }
        });

        // Xử lý sự kiện Chuyển Đổi
        btnAuto.addEventListener('click', () => {
            const rawText = inputArea.value;
            if (!rawText.trim()) {
                if(typeof UI !== 'undefined') UI.showAlert('Lỗi', 'Vui lòng nhập văn bản chứa địa chỉ.', 'error');
                return;
            }

            // Lưu lại HTML cũ và chuyển trạng thái nút sang Đang Xử Lý
            const originalBtnHTML = btnAuto.innerHTML;
            btnAuto.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang xử lý...';
            btnAuto.disabled = true;

            // Sử dụng setTimeout để UI kịp thời update trạng thái nút trước khi chạy vòng lặp nặng
            setTimeout(() => {
                const addresses = rawText.split(/[\n;]+/).map(a => a.trim()).filter(a => a.length > 0);
                let matchCount = 0;

                const processedAddresses = addresses.map(address => {
                    let currentAddr = address;
                    let isModified = false;

                    sortedDbRows.forEach(row => {
                        const wardPattern = buildFlexiblePattern(row.old.ward_name);
                        const distPattern = buildFlexiblePattern(row.old.district_name);
                        if (!wardPattern || !distPattern) return;

                        const searchPattern = new RegExp("(" + wardPattern + ")(\\s*[,\\-]?\\s*)(" + distPattern + ")", "gi");
                        const searchPatternReverse = new RegExp("(" + distPattern + ")(\\s*[,\\-]?\\s*)(" + wardPattern + ")", "gi");

                        const newWard = row.new.ward_name;
                        const newDist = row.new.district_name || row.old.district_name;

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
                
                // Khôi phục trạng thái nút
                btnAuto.innerHTML = originalBtnHTML;
                btnAuto.disabled = false;

                if(typeof UI !== 'undefined') {
                    if(matchCount > 0) {
                        UI.showAlert('Thành công', `Đã cập nhật ${matchCount} địa chỉ trong danh sách.`, 'success');
                    } else {
                        UI.showAlert('Thông báo', 'Không tìm thấy địa chỉ cũ nào cần thay đổi.', 'info');
                    }
                }
            }, 50); // Timeout ngắn 50ms
        });

        // Xử lý sự kiện Chép Nhanh
        btnCopy.addEventListener('click', async () => {
            if(!resultArea.value) return;
            try {
                await navigator.clipboard.writeText(resultArea.value);
                if(typeof UI !== 'undefined') UI.showAlert('Đã chép', 'Kết quả đã được lưu vào Clipboard.', 'success');
            } catch (e) {
                if(typeof UI !== 'undefined') UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
            }
        });
    }

    // --- Hàm Khởi tạo Thủ công ---
    function initManualMode(dbRows) {
        const selProv = document.getElementById('sel-province');
        const selDist = document.getElementById('sel-district');
        const selWard = document.getElementById('sel-ward');
        const manualResultBox = document.getElementById('manual-result-box');
        const manualResultText = document.getElementById('manual-new-address');

        selProv.innerHTML = '<option value="">Chọn Tỉnh/Thành</option>';
        const provinces = [...new Set(dbRows.map(r => r.old.province_name))];
        provinces.forEach(p => selProv.add(new Option(p, p)));

        selProv.addEventListener('change', (e) => {
            selDist.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
            selWard.innerHTML = '<option value="">Chọn Phường/Xã</option>';
            selWard.disabled = true;
            manualResultBox.classList.add('hidden');

            if (!e.target.value) {
                selDist.disabled = true;
                return;
            }

            selDist.disabled = false;
            const districts = [...new Set(dbRows.filter(r => r.old.province_name === e.target.value).map(r => r.old.district_name))];
            districts.forEach(d => selDist.add(new Option(d, d)));
        });

        selDist.addEventListener('change', (e) => {
            selWard.innerHTML = '<option value="">Chọn Phường/Xã</option>';
            manualResultBox.classList.add('hidden');

            if (!e.target.value) {
                selWard.disabled = true;
                return;
            }

            selWard.disabled = false;
            const wards = dbRows.filter(r => r.old.province_name === selProv.value && r.old.district_name === e.target.value);
            
            const uniqueWards = {};
            wards.forEach(w => { uniqueWards[w.old.ward_code] = w; });
            
            Object.values(uniqueWards).forEach(w => {
                selWard.add(new Option(w.old.ward_name, w.old.ward_code));
            });
        });

        selWard.addEventListener('change', (e) => {
            if (!e.target.value) {
                manualResultBox.classList.add('hidden');
                return;
            }

            const match = dbRows.find(r => r.old.ward_code === e.target.value);
            if (match) {
                manualResultBox.classList.remove('hidden');
                const newDist = match.new.district_name || match.old.district_name; 
                manualResultText.innerHTML = `${match.new.ward_name} <br> <span class="text-zinc-500 dark:text-zinc-400 font-medium">${newDist}, ${match.new.province_name}</span>`;
            }
        });
    }
}