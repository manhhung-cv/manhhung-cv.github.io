import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            /* Toggle Flat */
            .flat-toggle { appearance: none; width: 36px; height: 20px; background: #e4e4e7; border-radius: 10px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; border: 1px solid #d4d4d8; }
            .dark .flat-toggle { background: #27272a; border-color: #3f3f46; }
            .flat-toggle::after { content: ''; position: absolute; top: 1px; left: 1px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; border: 1px solid #d4d4d8; }
            .dark .flat-toggle::after { background: #71717a; border-color: #3f3f46; }
            .flat-toggle:checked { background: #18181b; border-color: #18181b; }
            .dark .flat-toggle:checked { background: #fff; border-color: #fff; }
            .flat-toggle:checked::after { transform: translateX(16px); background: #fff; border-color: #18181b; }
            .dark .flat-toggle:checked::after { background: #18181b; border-color: #fff; }

            /* Vòng Quay Minimal Styles */
            #wheel-canvas { transition: transform 5s ease-out; }
            .spin-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; letter-spacing: 1px; cursor: pointer; z-index: 10; border: 4px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.1s ease, background 0.2s; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
            .spin-btn:hover { background: #222; transform: translate(-50%, -50%) scale(1.05); }
            .spin-btn:active { transform: translate(-50%, -50%) scale(0.95); }
            .spin-btn.disabled { background: #ccc; cursor: not-allowed; pointer-events: none; }
            
            @keyframes shake {
                0% { transform: translate(1px, 1px) rotate(0deg); }
                10% { transform: translate(-1px, -2px) rotate(-1deg); }
                20% { transform: translate(-3px, 0px) rotate(1deg); }
                30% { transform: translate(3px, 2px) rotate(0deg); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                50% { transform: translate(-1px, 2px) rotate(-1deg); }
                60% { transform: translate(-3px, 1px) rotate(0deg); }
                70% { transform: translate(3px, 1px) rotate(-1deg); }
                80% { transform: translate(-1px, -1px) rotate(1deg); }
                90% { transform: translate(1px, 2px) rotate(0deg); }
                100% { transform: translate(1px, -2px) rotate(-1deg); }
            }
            .wheel-charging { animation: shake 0.4s infinite; box-shadow: 0 0 30px #ff4500, 0 0 60px #ff8c00 inset; border-color: #ff4500 !important; }
            .btn-charging { background: #ff4500 !important; border-color: #ff8c00 !important; box-shadow: 0 0 20px #ff4500; transform: translate(-50%, -50%) scale(1.1) !important; color: white !important; }
            
            .pointer { position: absolute; top: 50%; right: -10px; transform: translateY(-50%); width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-right: 35px solid #000; z-index: 20; }
            input[type="color"] { -webkit-appearance: none; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; padding: 0; background: none; border: 1px solid #e5e7eb; }
            input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
            input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
        </style>

        <div class="relative flex flex-col w-full max-w-[960px] mx-auto min-h-[500px]">
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Quay Ngẫu Nhiên</h2>
                    <p class="text-xs text-zinc-500 mt-1">Quay số, bốc thăm tên, chia đội và vòng quay may mắn.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden max-h-[85vh]">
                        
                        <div class="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]" id="rand-tabs">
                            <button class="tab-btn active flex-1 py-3.5 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="number"><i class="fas fa-dice mr-1"></i> Số</button>
                            <button class="tab-btn flex-1 py-3.5 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="name"><i class="fas fa-list-ul mr-1"></i> Tên</button>
                            <button class="tab-btn flex-1 py-3.5 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="team"><i class="fas fa-users mr-1"></i> Đội</button>
                            <!-- Tab Vòng quay mới thêm -->
                            <button class="tab-btn flex-1 py-3.5 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="wheel"><i class="fas fa-life-ring mr-1"></i> Vòng quay</button>
                        </div>

                        <div class="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                            <!-- Các pane có sẵn -->
                            <div id="pane-number" class="rand-pane block animate-in fade-in">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="space-y-1.5">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số nhỏ nhất (Min)</label>
                                        <input type="number" id="num-min" value="1" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white">
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số lớn nhất (Max)</label>
                                        <input type="number" id="num-max" value="100" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white">
                                    </div>
                                </div>
                            </div>

                            <div id="pane-name" class="rand-pane hidden animate-in fade-in">
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Nhập danh sách (Mỗi dòng 1 tên)</label>
                                    <textarea id="name-list" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white min-h-[120px] resize-y custom-scrollbar" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."></textarea>
                                </div>
                            </div>

                            <div id="pane-team" class="rand-pane hidden animate-in fade-in">
                                <div class="space-y-4">
                                    <div class="space-y-1.5">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Thành viên (Mỗi dòng 1 tên)</label>
                                        <textarea id="team-list" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-medium text-zinc-900 dark:text-white min-h-[100px] resize-y custom-scrollbar" placeholder="Hùng&#10;Dũng&#10;Sang&#10;Trọng..."></textarea>
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số lượng đội</label>
                                        <input type="number" id="team-qty" value="2" min="2" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white">
                                    </div>
                                </div>
                            </div>

                            <!-- Pane Vòng quay -->
                            <div id="pane-wheel" class="rand-pane hidden animate-in fade-in flex-col gap-4">
                                <div>
                                    <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Bảng màu nhanh</p>
                                    <div class="flex flex-wrap gap-2">
                                        <button onclick="window.wheelApp.applyPalette('pastel')" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold rounded text-zinc-700 dark:text-zinc-200 flex items-center gap-1"><div class="w-2.5 h-2.5 rounded-full bg-[#FFB3BA]"></div> Pastel</button>
                                        <button onclick="window.wheelApp.applyPalette('bold')" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold rounded text-zinc-700 dark:text-zinc-200 flex items-center gap-1"><div class="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></div> Đậm</button>
                                        <button onclick="window.wheelApp.applyPalette('neon')" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold rounded text-zinc-700 dark:text-zinc-200 flex items-center gap-1"><div class="w-2.5 h-2.5 rounded-full bg-[#00FFFF]"></div> Neon</button>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-12 gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-2 px-1">
                                    <div class="col-span-5">Nội dung</div>
                                    <div class="col-span-2 text-center">Tỉ lệ</div>
                                    <div class="col-span-2 text-center">Màu</div>
                                    <div class="col-span-2 text-center">Ảnh</div>
                                </div>

                                <div id="items-container" class="flex flex-col gap-2 min-h-[150px]">
                                    <!-- Items load by JS -->
                                </div>

                                <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                                    <button onclick="window.wheelApp.addNewItem()" class="w-full py-2.5 border-2 border-zinc-900 dark:border-zinc-400 font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-300 rounded-lg hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-plus"></i> Thêm Mục
                                    </button>
                                    
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="remove-winner-cb" class="flat-toggle">
                                        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Loại bỏ người trúng sau khi quay</span>
                                    </label>
                                </div>
                            </div>

                            <div class="h-px bg-zinc-100 dark:bg-zinc-800 my-1 w-full" id="divider-common"></div>

                            <div class="space-y-4" id="common-settings">
                                <div class="space-y-1.5" id="group-qty">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Số lượng kết quả rút ra</label>
                                    <input type="number" id="rand-qty" value="1" min="1" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 dark:focus:border-white text-sm font-bold text-zinc-900 dark:text-white">
                                </div>

                                <label class="flex items-center justify-between group cursor-pointer" id="group-dup">
                                    <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Cho phép trùng lặp (Duplicate)</span>
                                    <input type="checkbox" id="rand-duplicate" class="flat-toggle">
                                </label>

                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Thuật toán ngẫu nhiên</label>
                                    <select id="rand-engine" class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 outline-none text-[13px] font-bold text-zinc-900 dark:text-white appearance-none">
                                        <option value="math">Tiêu chuẩn (Math.random)</option>
                                        <option value="crypto" selected>Bảo mật cao (Crypto API)</option>
                                    </select>
                                </div>
                            </div>

                            <button id="btn-generate" class="w-full h-12 mt-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[13px] active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wider">
                                <i class="fas fa-play"></i> QUAY SỐ
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
                        
                        <div id="res-header" class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-[#121214]">
                            <span class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider"><i class="fas fa-poll-h mr-1.5 text-zinc-400"></i> KẾT QUẢ</span>
                            <button id="btn-copy-res" class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform flex items-center gap-1.5">
                                <i class="far fa-copy"></i> Sao chép
                            </button>
                        </div>

                        <!-- Khung hiển thị kết quả mặc định -->
                        <div id="res-display" class="flex-1 p-6 flex flex-col items-center justify-center text-center relative overflow-y-auto custom-scrollbar block">
                            <div class="text-zinc-300 dark:text-zinc-800 opacity-50 flex flex-col items-center" id="res-empty">
                                <i class="fas fa-random text-6xl mb-4"></i>
                                <span class="text-sm font-bold uppercase tracking-widest">Đang chờ lệnh...</span>
                            </div>
                        </div>

                        <!-- Khung hiển thị vòng quay -->
                        <div id="wheel-display" class="flex-1 items-center justify-center relative p-6 hidden">
                            <div class="relative w-full max-w-[400px] aspect-square mx-auto">
                                <div class="pointer"></div>
                                <div id="wheel-wrapper" class="w-full h-full rounded-full border-[6px] border-zinc-900 shadow-xl p-1 bg-white transition-all duration-300">
                                    <canvas id="wheel-canvas" width="600" height="600" class="w-full h-full rounded-full"></canvas>
                                </div>
                                <div id="spin-btn" class="spin-btn">QUAY</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Modal Kết Quả Vòng Quay -->
        <div id="result-modal" class="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm hidden items-center justify-center z-[100] transition-opacity opacity-0">
            <div class="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-8 max-w-sm w-full mx-4 text-center transform scale-90 transition-transform duration-300 relative shadow-2xl">
                <button onclick="window.wheelApp.closeModal()" class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Kết Quả Vòng Quay</p>
                <div id="winner-display" class="mb-8">
                    <img id="winner-img" src="" class="mx-auto max-h-32 rounded border border-zinc-200 dark:border-zinc-700 mb-4 hidden object-contain">
                    <h2 id="winner-text" class="text-3xl font-extrabold text-zinc-900 dark:text-white break-words leading-tight"></h2>
                </div>
                <button onclick="window.wheelApp.closeModal()" class="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-3 px-6 rounded-xl uppercase tracking-wider transition-transform active:scale-95">
                    Tuyệt Vời
                </button>
            </div>
        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('#rand-tabs .tab-btn');
    const panes = {
        'number': document.getElementById('pane-number'),
        'name': document.getElementById('pane-name'),
        'team': document.getElementById('pane-team'),
        'wheel': document.getElementById('pane-wheel') // Added Wheel Pane
    };
    
    const numMin = document.getElementById('num-min');
    const numMax = document.getElementById('num-max');
    const nameList = document.getElementById('name-list');
    const teamList = document.getElementById('team-list');
    const teamQty = document.getElementById('team-qty');
    
    const randQty = document.getElementById('rand-qty');
    const randDup = document.getElementById('rand-duplicate');
    const randEngine = document.getElementById('rand-engine');
    
    const groupQty = document.getElementById('group-qty');
    const groupDup = document.getElementById('group-dup');
    const commonSettings = document.getElementById('common-settings');
    const dividerCommon = document.getElementById('divider-common');

    const btnGenerate = document.getElementById('btn-generate');
    const resDisplay = document.getElementById('res-display');
    const resEmpty = document.getElementById('res-empty');
    const btnCopy = document.getElementById('btn-copy-res');
    
    const resHeader = document.getElementById('res-header');
    const wheelDisplay = document.getElementById('wheel-display');

    let currentMode = 'number';
    let isRolling = false;
    let finalResultsForCopy = '';

    // --- CHUYỂN ĐỔI CHẾ ĐỘ ---
    tabs.forEach(tab => {
        tab.onclick = () => {
            if (isRolling) return;

            tabs.forEach(t => {
                t.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
                t.classList.add('text-zinc-400', 'border-transparent');
            });
            tab.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white');
            tab.classList.remove('text-zinc-400', 'border-transparent');
            
            currentMode = tab.dataset.mode;
            
            Object.values(panes).forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            
            // Xử lý flex/block riêng cho wheel vs standard panes
            if(currentMode === 'wheel') {
                panes[currentMode].classList.remove('hidden');
                panes[currentMode].classList.add('flex');
            } else {
                panes[currentMode].classList.remove('hidden');
                panes[currentMode].classList.add('block');
            }
            
            // UI Cập nhật theo mode[cite: 1]
            if (currentMode === 'wheel') {
                commonSettings.style.display = 'none';
                dividerCommon.style.display = 'none';
                btnGenerate.style.display = 'none';
                resHeader.style.display = 'none';
                resDisplay.style.display = 'none';
                wheelDisplay.style.display = 'flex';
                // Trigger vẽ lại phòng hờ canvas đổi kích thước
                setTimeout(() => window.wheelApp && window.wheelApp.drawWheel(), 50);
            } else {
                commonSettings.style.display = 'block';
                dividerCommon.style.display = 'block';
                btnGenerate.style.display = 'flex';
                resHeader.style.display = 'flex';
                resDisplay.style.display = 'flex';
                wheelDisplay.style.display = 'none';

                if (currentMode === 'number') {
                    btnGenerate.innerHTML = '<i class="fas fa-dice"></i> QUAY SỐ';
                    groupQty.style.display = 'block';
                    groupDup.style.display = 'flex';
                } else if (currentMode === 'name') {
                    btnGenerate.innerHTML = '<i class="fas fa-list-ul"></i> CHỌN TÊN';
                    groupQty.style.display = 'block';
                    groupDup.style.display = 'flex';
                } else if (currentMode === 'team') {
                    btnGenerate.innerHTML = '<i class="fas fa-users"></i> CHIA ĐỘI';
                    groupQty.style.display = 'none'; 
                    groupDup.style.display = 'none'; 
                }
            }
        };
    });
    
    // --- LÕI THUẬT TOÁN NGẪU NHIÊN CHUNG ---
    const getRandomInt = (min, max, engine) => {
        if (engine === 'math') {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            const range = max - min + 1;
            const maxSafe = Math.floor(4294967296 / range) * range; 
            const array = new Uint32Array(1);
            let randomValue;
            do {
                window.crypto.getRandomValues(array);
                randomValue = array[0];
            } while (randomValue >= maxSafe); 
            return min + (randomValue % range);
        }
    };

    const shuffleArray = (array, engine) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = getRandomInt(0, i, engine);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // --- TẠO KẾT QUẢ CHO TAB SỐ/TÊN/ĐỘI ---
    const generateResults = () => {
        const engine = randEngine.value;
        const qty = parseInt(randQty.value) || 1;
        const allowDup = randDup.checked;
        
        let results = null;

        if (currentMode === 'number') {
            const min = parseInt(numMin.value);
            const max = parseInt(numMax.value);
            
            if (isNaN(min) || isNaN(max) || min > max) {
                UI.showAlert('Lỗi', 'Giá trị Min/Max không hợp lệ.', 'error');
                return null;
            }
            if (!allowDup && qty > (max - min + 1)) {
                UI.showAlert('Lỗi', 'Số lượng yêu cầu lớn hơn phạm vi số (khi không cho phép trùng).', 'error');
                return null;
            }

            results = [];
            if (allowDup) {
                for(let i = 0; i < qty; i++) results.push(getRandomInt(min, max, engine));
            } else {
                let pool = [];
                for(let i = min; i <= max; i++) pool.push(i);
                pool = shuffleArray(pool, engine);
                results = pool.slice(0, qty);
            }
        } 
        else if (currentMode === 'name') {
            const rawNames = nameList.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
            
            if (rawNames.length === 0) {
                UI.showAlert('Lỗi', 'Vui lòng nhập ít nhất 1 tên.', 'warning');
                return null;
            }
            if (!allowDup && qty > rawNames.length) {
                UI.showAlert('Lỗi', 'Số lượng yêu cầu lớn hơn số tên đã nhập.', 'error');
                return null;
            }

            results = [];
            if (allowDup) {
                for(let i = 0; i < qty; i++) {
                    const rIndex = getRandomInt(0, rawNames.length - 1, engine);
                    results.push(rawNames[rIndex]);
                }
            } else {
                let pool = shuffleArray(rawNames, engine);
                results = pool.slice(0, qty);
            }
        }
        else if (currentMode === 'team') {
            const rawMembers = teamList.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
            const numTeams = parseInt(teamQty.value) || 2;

            if (rawMembers.length < numTeams) {
                UI.showAlert('Lỗi', 'Số lượng người ít hơn số lượng đội.', 'error');
                return null;
            }

            const shuffled = shuffleArray(rawMembers, engine);
            results = Array.from({ length: numTeams }, () => []);
            shuffled.forEach((member, index) => {
                results[index % numTeams].push(member);
            });
        }
        return results;
    };

    const renderResults = (results) => {
        if (resEmpty) resEmpty.style.display = 'none';

        if (currentMode === 'number' || currentMode === 'name') {
            finalResultsForCopy = results.join('\n');
            
            if (results.length === 1) {
                resDisplay.innerHTML = `<div class="text-[5rem] sm:text-[6rem] font-black text-zinc-900 dark:text-white leading-none break-all font-mono tracking-tighter animate-in zoom-in-90 duration-200">${results[0]}</div>`;
            } else {
                let html = '<div class="flex flex-wrap gap-2.5 justify-center content-start w-full">';
                results.forEach((res, idx) => {
                    html += `<div class="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-lg sm:text-xl font-bold border border-zinc-200 dark:border-zinc-700 animate-in zoom-in-90" style="animation-delay: ${idx * 30}ms">${res}</div>`;
                });
                html += '</div>';
                resDisplay.innerHTML = html;
            }
        } 
        else if (currentMode === 'team') {
            let copyText = '';
            let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full content-start text-left">';
            
            results.forEach((team, idx) => {
                copyText += `Đội ${idx + 1}:\n- ${team.join('\n- ')}\n\n`;
                html += `
                    <div class="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4" style="animation-delay: ${idx * 50}ms">
                        <div class="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Đội ${idx + 1} (${team.length} người)</div>
                        <ul class="space-y-1.5">
                            ${team.map(member => `<li class="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2"><i class="fas fa-user text-zinc-400 text-[10px]"></i> ${member}</li>`).join('')}
                        </ul>
                    </div>
                `;
            });
            html += '</div>';
            
            finalResultsForCopy = copyText.trim();
            resDisplay.innerHTML = html;
        }
    };

    const animateRoll = (finalResults) => {
        isRolling = true;
        btnGenerate.disabled = true;
        btnGenerate.classList.add('opacity-50', 'pointer-events-none');
        btnGenerate.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ĐANG TÌM...';
        
        if (resEmpty) resEmpty.style.display = 'none';
        
        let ticks = 0;
        const maxTicks = 12; 
        const hackerChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
        
        const interval = setInterval(() => {
            ticks++;
            let fakeData = '';
            const len = currentMode === 'number' ? 4 : 7; 
            for (let i = 0; i < len; i++) {
                fakeData += hackerChars.charAt(Math.floor(Math.random() * hackerChars.length));
            }
            
            resDisplay.innerHTML = `<div class="text-[4rem] font-black text-zinc-400 opacity-50 font-mono tracking-widest break-all blur-[1px]">${fakeData}</div>`;
            
            if (ticks >= maxTicks) {
                clearInterval(interval);
                isRolling = false;
                btnGenerate.disabled = false;
                btnGenerate.classList.remove('opacity-50', 'pointer-events-none');
                
                if (currentMode === 'number') btnGenerate.innerHTML = '<i class="fas fa-dice"></i> QUAY SỐ';
                else if (currentMode === 'name') btnGenerate.innerHTML = '<i class="fas fa-list-ul"></i> CHỌN TÊN';
                else btnGenerate.innerHTML = '<i class="fas fa-users"></i> CHIA ĐỘI';
                
                renderResults(finalResults);
            }
        }, 60); 
    };

    btnGenerate.onclick = () => {
        if (isRolling) return;
        const results = generateResults();
        if (results) animateRoll(results);
    };

    btnCopy.onclick = async () => {
        if (!finalResultsForCopy) return UI.showAlert('Trống', 'Chưa có kết quả để chép.', 'warning');
        try {
            await navigator.clipboard.writeText(finalResultsForCopy);
            const ori = btnCopy.innerHTML;
            btnCopy.innerHTML = '<i class="fas fa-check"></i> Đã chép';
            btnCopy.classList.replace('text-zinc-500', 'text-zinc-900');
            btnCopy.classList.replace('bg-zinc-200', 'bg-zinc-300');
            setTimeout(() => {
                btnCopy.innerHTML = ori;
                btnCopy.classList.replace('text-zinc-900', 'text-zinc-500');
                btnCopy.classList.replace('bg-zinc-300', 'bg-zinc-200');
            }, 1500);
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể chép dữ liệu.', 'error');
        }
    };

    // ==========================================
    // MODULE VÒNG QUAY MAY MẮN
    // ==========================================
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const itemsContainer = document.getElementById('items-container');
    const spinBtn = document.getElementById('spin-btn');
    
    let wheelCurrentRotation = 0;
    let wheelIsSpinning = false;
    let isCharging = false;
    let chargeStartTime = 0;
    let updateTimeout;
    
    const palettes = {
        pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E8BAFF', '#FFC4E1'],
        bold: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6'],
        neon: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#0000FF', '#FF8800'],
    };
    let currentPalette = palettes.bold;
    
    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    let wheelItems = [
        { id: generateId(), text: 'Phần thưởng A', ratio: 1, color: '#FF3B30', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'Phần thưởng B', ratio: 1, color: '#007AFF', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'Mất lượt', ratio: 2, color: '#18181b', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'Phần thưởng C', ratio: 1, color: '#34C759', imageSrc: null, imageObj: null }
    ];

    // Expose sang window để gọi bằng onclick HTML
    window.wheelApp = {
        applyPalette: (type) => {
            currentPalette = palettes[type] || palettes.bold;
            wheelItems.forEach((item, index) => { item.color = currentPalette[index % currentPalette.length]; });
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
        },
        updateItem: (id, field, value) => {
            const item = wheelItems.find(i => i.id === id);
            if (item) {
                item[field] = value;
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => window.wheelApp.drawWheel(), 300);
            }
        },
        addNewItem: () => {
            const nextColor = currentPalette[wheelItems.length % currentPalette.length];
            wheelItems.push({ id: generateId(), text: `Mục ${wheelItems.length + 1}`, ratio: 1, color: nextColor, imageSrc: null, imageObj: null });
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
            itemsContainer.scrollTop = itemsContainer.scrollHeight;
        },
        removeItem: (id) => {
            wheelItems = wheelItems.filter(item => item.id !== id);
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
        },
        handleImageUpload: (event, id) => {
            const file = event.target.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const img = new Image();
                img.onload = () => {
                    const item = wheelItems.find(i => i.id === id);
                    if (item) { item.imageSrc = dataUrl; item.imageObj = img; window.wheelApp.renderItemInputs(); window.wheelApp.drawWheel(); }
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        },
        removeImage: (id) => {
            const item = wheelItems.find(i => i.id === id);
            if (item) { item.imageSrc = null; item.imageObj = null; window.wheelApp.renderItemInputs(); window.wheelApp.drawWheel(); }
        },
        closeModal: () => {
            const modal = document.getElementById('result-modal');
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-90');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                const removeId = modal.getAttribute('data-remove-id');
                if (removeId) window.wheelApp.removeItem(removeId);
            }, 300);
        },
        renderItemInputs: () => {
            itemsContainer.innerHTML = '';
            if (wheelItems.length === 0) {
                itemsContainer.innerHTML = `<p class="text-center text-zinc-400 py-4 text-xs italic border border-dashed border-zinc-300 dark:border-zinc-700 rounded">Không có dữ liệu. Hãy thêm mục mới.</p>`;
                return;
            }
            wheelItems.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'grid grid-cols-12 gap-1 items-center bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-lg hover:border-zinc-300 transition-colors';
                row.innerHTML = `
                    <div class="col-span-5">
                        <input type="text" value="${item.text}" oninput="window.wheelApp.updateItem('${item.id}', 'text', this.value)" placeholder="Tên..." class="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white outline-none px-1 py-1 text-xs font-medium text-zinc-900 dark:text-white">
                    </div>
                    <div class="col-span-2 flex justify-center">
                        <input type="number" value="${item.ratio}" min="1" step="0.5" oninput="window.wheelApp.updateItem('${item.id}', 'ratio', parseFloat(this.value) || 1)" class="w-full max-w-[45px] text-center bg-transparent border-b border-zinc-200 dark:border-zinc-800 outline-none focus:border-zinc-900 dark:focus:border-white text-xs py-1 text-zinc-900 dark:text-white">
                    </div>
                    <div class="col-span-2 flex justify-center">
                        <input type="color" value="${item.color}" oninput="window.wheelApp.updateItem('${item.id}', 'color', this.value)">
                    </div>
                    <div class="col-span-2 flex justify-center relative">
                        <input type="file" id="file-${item.id}" accept="image/*" class="hidden" onchange="window.wheelApp.handleImageUpload(event, '${item.id}')">
                        <button onclick="document.getElementById('file-${item.id}').click()" class="w-7 h-7 flex items-center justify-center rounded ${item.imageSrc ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'} transition-colors" title="${item.imageSrc ? 'Đổi ảnh' : 'Thêm ảnh'}">
                            <i class="fa-regular fa-image text-[10px]"></i>
                        </button>
                        ${item.imageSrc ? `<button onclick="window.wheelApp.removeImage('${item.id}')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]"><i class="fa-solid fa-xmark"></i></button>` : ''}
                    </div>
                    <div class="col-span-1 flex justify-center">
                        <button onclick="window.wheelApp.removeItem('${item.id}')" class="text-zinc-400 hover:text-red-500 transition-colors">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                `;
                itemsContainer.appendChild(row);
            });
        },
        drawWheel: () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 5; 
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
            if (wheelItems.length === 0 || totalRatio === 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#f4f4f5'; ctx.fill();
                ctx.lineWidth = 2; ctx.strokeStyle = '#e4e4e7'; ctx.stroke();
                ctx.fillStyle = '#a1a1aa'; ctx.font = '600 24px Inter, sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TRỐNG', centerX, centerY);
                spinBtn.classList.add('disabled');
                return;
            }

            spinBtn.classList.remove('disabled');
            let currentAngle = 0; 
            
            for (let i = 0; i < wheelItems.length; i++) {
                const item = wheelItems[i];
                const ratio = item.ratio > 0 ? item.ratio : 0;
                const sliceAngle = (ratio / totalRatio) * 2 * Math.PI;
                if (sliceAngle === 0) continue; 
                
                const startAngle = currentAngle;
                const endAngle = currentAngle + sliceAngle;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = item.color || '#000000';
                ctx.fill();
                ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();

                ctx.save();
                const textAngle = startAngle + sliceAngle / 2;
                const contentDist = radius * 0.65; 
                ctx.translate(centerX + Math.cos(textAngle) * contentDist, centerY + Math.sin(textAngle) * contentDist);
                ctx.rotate(textAngle);
                
                // Trắng hoặc đen tùy màu nền để nổi text
                const hex = (item.color || '#000000').replace('#', '');
                const brightness = hex.length === 6 ? ((parseInt(hex.substr(0,2),16)*299) + (parseInt(hex.substr(2,2),16)*587) + (parseInt(hex.substr(4,2),16)*114))/1000 : 0;
                ctx.fillStyle = brightness > 140 ? '#000000' : '#ffffff';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                const hasImage = !!item.imageObj;
                const hasText = item.text && item.text.trim() !== '';

                if (hasImage && hasText) {
                    drawItemImage(ctx, item.imageObj, 15, 0, 40);
                    ctx.font = '600 16px Inter, sans-serif';
                    ctx.fillText(item.text.length > 12 ? item.text.substring(0, 10)+'..' : item.text, -25, 0);
                } else if (hasImage) {
                    ctx.rotate(Math.PI / 2);
                    drawItemImage(ctx, item.imageObj, 0, 0, 60);
                } else if (hasText) {
                    let fontSize = sliceAngle < 0.2 ? 12 : (sliceAngle < 0.4 ? 16 : 22);
                    ctx.font = `800 ${fontSize}px Inter, sans-serif`;
                    ctx.fillText(item.text.length > 18 ? item.text.substring(0, 16)+'..' : item.text, 0, 0);
                }
                ctx.restore();
                currentAngle += sliceAngle;
            }

            // Tâm vòng quay
            ctx.beginPath(); ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff'; ctx.fill();
            ctx.lineWidth = 4; ctx.strokeStyle = '#000000'; ctx.stroke();
        }
    };
    
    function drawItemImage(context, imgObj, x, y, size) {
        context.save(); context.beginPath(); context.arc(x, y, size/2, 0, Math.PI * 2); context.closePath(); context.clip();
        context.drawImage(imgObj, x - size/2, y - size/2, size, size); context.restore();
        context.beginPath(); context.arc(x, y, size/2, 0, Math.PI * 2); context.lineWidth = 2; context.strokeStyle = 'rgba(255,255,255,0.8)'; context.stroke();
    }

    // Gồng lực và Quay Vòng
    // ==========================================
    // Gồng lực và Quay Vòng (Nhấn giữ & Combo Click)
    // ==========================================
    let clickCount = 0;
    let clickTimer = null;

    const startCharge = () => {
        const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
        if (wheelIsSpinning || wheelItems.length === 0 || totalRatio === 0) return;
        
        isCharging = true; 
        chargeStartTime = Date.now();
        
        // Hủy lượt quay nếu người dùng đang nhấp liên tục (Combo)
        if (clickTimer) clearTimeout(clickTimer);
        
        document.getElementById('wheel-wrapper').classList.add('wheel-charging');
        spinBtn.classList.add('btn-charging');
        spinBtn.textContent = 'GỒNG..';
    };

    const releaseCharge = () => {
        if (!isCharging) return;
        isCharging = false;
        
        const holdTime = Date.now() - chargeStartTime;
        
        document.getElementById('wheel-wrapper').classList.remove('wheel-charging');
        spinBtn.classList.remove('btn-charging');
        spinBtn.textContent = 'QUAY';

        // Nếu thời gian giữ dưới 200ms -> Được tính là 1 lần Click nhanh
        if (holdTime < 200) { 
            clickCount++;
            
            // Đợi 350ms xem người dùng có click tiếp không
            clickTimer = setTimeout(() => {
                // Mỗi lần click tương đương ~35% lực gồng (3 click = Max lực)
                const powerRatio = Math.min(clickCount * 0.35, 1);
                clickCount = 0; // Reset đếm
                spinWheel(3 + (powerRatio * 7), powerRatio);
            }, 350);
        } 
        // Nếu nhấn giữ lâu (Hold)
        else { 
            const powerRatio = Math.min(holdTime / 3000, 1); 
            clickCount = 0; // Reset đếm
            spinWheel(3 + (powerRatio * 7), powerRatio);
        }
    };

    // Gắn sự kiện cho nút (Desktop & Mobile)
    spinBtn.addEventListener('mousedown', startCharge);
    window.addEventListener('mouseup', releaseCharge);
    spinBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); // Chống menu ngữ cảnh
        startCharge(); 
    }, { passive: false });
    window.addEventListener('touchend', releaseCharge);
    
    // --- KHỐI HÀM SPIN WHEEL ĐƯỢC GIỮ NGUYÊN BÊN DƯỚI ---
    const spinWheel = (durationSec, powerRatio) => {
        const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
        if (wheelIsSpinning || wheelItems.length === 0 || totalRatio === 0) return;
        wheelIsSpinning = true; spinBtn.classList.add('disabled');
        
        canvas.style.transition = `transform ${durationSec}s ease-out`;
        const extraSpins = 360 * (5 + Math.floor(powerRatio * 15));
        wheelCurrentRotation += extraSpins + (Math.random() * 360);
        canvas.style.transform = `rotate(${wheelCurrentRotation}deg)`;

        setTimeout(() => {
            wheelIsSpinning = false; spinBtn.classList.remove('disabled');
            const pointerAngle = (360 - (wheelCurrentRotation % 360)) % 360; 
            let startAngle = 0; let winner = null;
            
            for (let i = 0; i < wheelItems.length; i++) {
                const ratio = wheelItems[i].ratio > 0 ? wheelItems[i].ratio : 0;
                if (ratio === 0) continue;
                const endAngle = startAngle + ((ratio / totalRatio) * 360);
                if (pointerAngle >= startAngle && pointerAngle < endAngle) { winner = wheelItems[i]; break; }
                startAngle = endAngle;
            }
            if (!winner) { for (let i = wheelItems.length - 1; i >= 0; i--) if (wheelItems[i].ratio > 0) { winner = wheelItems[i]; break; } }
            
            // Hiện Modal Kết quả
            const modal = document.getElementById('result-modal');
            const winnerTextEl = document.getElementById('winner-text');
            const winnerImgEl = document.getElementById('winner-img');
            
            winnerTextEl.textContent = winner.text || '';
            const isDarkColor = winner.color && (parseInt(winner.color.replace('#','').substr(0,2),16)*299 + parseInt(winner.color.replace('#','').substr(2,2),16)*587 + parseInt(winner.color.replace('#','').substr(4,2),16)*114)/1000 < 140;
            winnerTextEl.style.color = (winner.color && !isDarkColor) ? winner.color : ''; 
            
            if (winner.imageSrc) { winnerImgEl.src = winner.imageSrc; winnerImgEl.classList.remove('hidden'); }
            else { winnerImgEl.classList.add('hidden'); winnerImgEl.src = ''; }

            modal.classList.remove('hidden'); modal.classList.add('flex');
            setTimeout(() => { modal.classList.remove('opacity-0'); modal.querySelector('div').classList.remove('scale-90'); modal.querySelector('div').classList.add('scale-100'); }, 10);
            
            if (document.getElementById('remove-winner-cb').checked) modal.setAttribute('data-remove-id', winner.id);
            else modal.removeAttribute('data-remove-id');
        }, durationSec * 1000 + 100); 
    };

    // Khởi chạy giao diện Vòng Quay lần đầu
    window.wheelApp.renderItemInputs();
    window.wheelApp.drawWheel();
}