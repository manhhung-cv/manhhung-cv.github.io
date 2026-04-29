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
        </style>

        <div class="relative flex flex-col w-full max-w-[960px] mx-auto min-h-[500px]">
            <div class="flex justify-between items-center mb-5 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Quay Ngẫu Nhiên</h2>
                    <p class="text-xs text-zinc-500 mt-1">Quay số, bốc thăm tên và chia đội nhanh chóng.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                        
                        <div class="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]" id="rand-tabs">
                            <button class="tab-btn active flex-1 py-3.5 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="number"><i class="fas fa-dice mr-1"></i> Số</button>
                            <button class="tab-btn flex-1 py-3.5 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="name"><i class="fas fa-list-ul mr-1"></i> Danh sách</button>
                            <button class="tab-btn flex-1 py-3.5 text-[12px] font-bold text-zinc-400 border-b-2 border-transparent transition-colors whitespace-nowrap active:bg-zinc-200 dark:active:bg-zinc-800" data-mode="team"><i class="fas fa-users mr-1"></i> Chia đội</button>
                        </div>

                        <div class="p-5 flex flex-col gap-4">
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

                            <div class="h-px bg-zinc-100 dark:bg-zinc-800 my-1 w-full"></div>

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

                <div class="lg:col-span-7 flex flex-col h-full min-h-[350px]">
                    <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
                        
                        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-[#121214]">
                            <span class="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider"><i class="fas fa-poll-h mr-1.5 text-zinc-400"></i> KẾT QUẢ</span>
                            <button id="btn-copy-res" class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform flex items-center gap-1.5">
                                <i class="far fa-copy"></i> Sao chép
                            </button>
                        </div>

                        <div id="res-display" class="flex-1 p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#09090b] relative overflow-y-auto custom-scrollbar">
                            <div class="text-zinc-300 dark:text-zinc-800 opacity-50 flex flex-col items-center" id="res-empty">
                                <i class="fas fa-random text-6xl mb-4"></i>
                                <span class="text-sm font-bold uppercase tracking-widest">Đang chờ lệnh...</span>
                            </div>
                            </div>

                    </div>
                </div>

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
        'team': document.getElementById('pane-team')
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

    const btnGenerate = document.getElementById('btn-generate');
    const resDisplay = document.getElementById('res-display');
    const resEmpty = document.getElementById('res-empty');
    const btnCopy = document.getElementById('btn-copy-res');

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
            panes[currentMode].classList.remove('hidden');
            panes[currentMode].classList.add('block');
            
            // UI Cập nhật theo mode
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
                groupQty.style.display = 'none'; // Chia đội không cần qty
                groupDup.style.display = 'none'; // Chia đội không có dup
            }
        };
    });
    
    // --- LÕI THUẬT TOÁN NGẪU NHIÊN ---
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

    // --- TẠO KẾT QUẢ ---
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
                UI.showAlert('Lỗi', 'Số lượng yêu cầu lớn hơn số tên đã nhập (khi không cho phép trùng).', 'error');
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
            
            // Logic chia mảng thành các mảng con đều nhau
            results = Array.from({ length: numTeams }, () => []);
            shuffled.forEach((member, index) => {
                results[index % numTeams].push(member);
            });
        }

        return results;
    };

    // --- HIỂN THỊ KẾT QUẢ ---
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

    // --- HIỆU ỨNG QUAY "HACKER" ---
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

    // --- BIND EVENTS ---
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
}