import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            
            /* Tùy chỉnh Range Slider phong cách Flat */
            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
            .flat-range::-webkit-slider-runnable-track { height: 4px; background: #e4e4e7; border-radius: 2px; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #18181b; margin-top: -6px; border: 2px solid #fff; }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }
            
            /* Tùy chỉnh Checkbox Toggle phẳng */
            .flat-toggle { appearance: none; width: 36px; height: 20px; background: #e4e4e7; border-radius: 10px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; border: 1px solid #d4d4d8; }
            .dark .flat-toggle { background: #27272a; border-color: #3f3f46; }
            .flat-toggle::after { content: ''; position: absolute; top: 1px; left: 1px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; border: 1px solid #d4d4d8; }
            .dark .flat-toggle::after { background: #71717a; border-color: #3f3f46; }
            .flat-toggle:checked { background: #18181b; border-color: #18181b; }
            .dark .flat-toggle:checked { background: #fff; border-color: #fff; }
            .flat-toggle:checked::after { transform: translateX(16px); background: #fff; border-color: #18181b; }
            .dark .flat-toggle:checked::after { background: #18181b; border-color: #fff; }
        </style>

        <div class="relative flex flex-col w-full max-w-[340px] mx-auto sm:max-w-none min-h-[500px]">
            <div class="flex justify-between items-center mb-4 px-1">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Mật Khẩu</h2>
                </div>
                <div class="flex items-center gap-1.5">
                    <button class="h-8 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform" id="btn-pg-history">
                        <i class="fas fa-history"></i> Lịch sử
                    </button>
                </div>
            </div>

            <div class="w-full max-w-[340px] mx-auto bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden relative">
                
                <div class="p-5 pb-4 bg-zinc-50 dark:bg-[#121214] border-b border-zinc-200 dark:border-zinc-800">
                    <div class="relative flex items-center justify-between mb-3">
                        <input type="text" id="pg-output" class="w-full bg-transparent border-none outline-none text-2xl font-mono font-medium text-zinc-900 dark:text-white tracking-wider pr-10 truncate selection:bg-zinc-200 dark:selection:bg-zinc-700" readonly>
                        <button id="btn-pg-copy" class="absolute right-0 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center active:scale-90 transition-transform"><i class="far fa-copy"></i></button>
                    </div>

                    <div class="flex items-center gap-2">
                        <div class="flex-1 flex gap-1 h-1.5">
                            <div class="flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors" id="st-1"></div>
                            <div class="flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors" id="st-2"></div>
                            <div class="flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors" id="st-3"></div>
                            <div class="flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors" id="st-4"></div>
                        </div>
                        <span class="text-[10px] font-bold uppercase w-12 text-right" id="st-text">--</span>
                    </div>
                </div>

                <div class="p-5 flex flex-col gap-5">
                    
                    <div class="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button class="pg-mode-btn active flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 transition-all" data-mode="random">Ngẫu nhiên</button>
                        <button class="pg-mode-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg text-zinc-500 border border-transparent transition-all" data-mode="pronounceable">Dễ đọc</button>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-[12px] font-bold text-zinc-900 dark:text-white">Độ dài</label>
                            <span class="text-[12px] font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700" id="pg-val-len">16</span>
                        </div>
                        <input type="range" id="pg-range-len" min="4" max="64" value="16" class="flat-range w-full">
                    </div>

                    <div class="space-y-3" id="pg-options">
                        <label class="flex items-center justify-between group cursor-pointer">
                            <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Chữ hoa (A-Z)</span>
                            <input type="checkbox" id="opt-upper" class="flat-toggle" checked>
                        </label>
                        <label class="flex items-center justify-between group cursor-pointer">
                            <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Chữ thường (a-z)</span>
                            <input type="checkbox" id="opt-lower" class="flat-toggle" checked>
                        </label>
                        <label class="flex items-center justify-between group cursor-pointer">
                            <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Chữ số (0-9)</span>
                            <input type="checkbox" id="opt-number" class="flat-toggle" checked>
                        </label>
                        <label class="flex items-center justify-between group cursor-pointer">
                            <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Ký tự đặc biệt (!@#)</span>
                            <input type="checkbox" id="opt-symbol" class="flat-toggle" checked>
                        </label>
                        <div class="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                        <label class="flex items-center justify-between group cursor-pointer">
                            <span class="text-[12px] font-medium text-zinc-700 dark:text-zinc-300 flex flex-col">
                                Loại bỏ nhầm lẫn
                                <span class="text-[9px] text-zinc-400 font-mono mt-0.5">Không dùng: i, l, 1, L, o, 0, O</span>
                            </span>
                            <input type="checkbox" id="opt-exclude" class="flat-toggle">
                        </label>
                    </div>

                    <button id="btn-pg-generate" class="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[13px] border border-zinc-900 dark:border-white active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2">
                        <i class="fas fa-sync-alt"></i> TẠO MẬT KHẨU MỚI
                    </button>
                </div>

                <div id="pg-hist-panel" class="absolute inset-x-0 bottom-0 top-0 bg-white dark:bg-[#09090b] z-20 transition-transform duration-300 translate-y-full flex flex-col">
                    <div class="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-[#121214]">
                        <span class="text-[12px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Đã tạo gần đây</span>
                        <div class="flex gap-2">
                            <button id="btn-pg-hist-clear" class="w-7 h-7 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 active:bg-red-100 dark:active:bg-red-900/30 flex items-center justify-center transition-colors"><i class="fas fa-trash-alt text-[10px]"></i></button>
                            <button id="btn-pg-hist-close" class="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:text-zinc-900 dark:active:text-white flex items-center justify-center transition-colors"><i class="fas fa-times text-[10px]"></i></button>
                        </div>
                    </div>
                    <div id="pg-history-list" class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2"></div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    // --- STATE ---
    let state = {
        mode: 'random', // random, pronounceable
        length: 16,
        upper: true,
        lower: true,
        number: true,
        symbol: true,
        exclude: false
    };

    const HISTORY_KEY = 'aio_pwd_history';
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    // --- DICTIONARIES ---
    const CHARS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        number: '0123456789',
        symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    const CONFUSING = /[ilLI|`oO0]/g;

    const PRONOUNCE = {
        vowels: 'aeiou',
        consonants: 'bcdfghjklmnpqrstvwxyz'
    };

    // --- DOM ELEMENTS ---
    const elOut = document.getElementById('pg-output');
    const btnCopy = document.getElementById('btn-pg-copy');
    const btnGen = document.getElementById('btn-pg-generate');
    
    const rangeLen = document.getElementById('pg-range-len');
    const valLen = document.getElementById('pg-val-len');
    
    const modeBtns = document.querySelectorAll('.pg-mode-btn');
    const optsBox = document.getElementById('pg-options');
    
    const chkUpper = document.getElementById('opt-upper');
    const chkLower = document.getElementById('opt-lower');
    const chkNumber = document.getElementById('opt-number');
    const chkSymbol = document.getElementById('opt-symbol');
    const chkExclude = document.getElementById('opt-exclude');

    const st1 = document.getElementById('st-1');
    const st2 = document.getElementById('st-2');
    const st3 = document.getElementById('st-3');
    const st4 = document.getElementById('st-4');
    const stText = document.getElementById('st-text');

    const histPanel = document.getElementById('pg-hist-panel');
    const btnHistOpen = document.getElementById('btn-pg-history');
    const btnHistClose = document.getElementById('btn-pg-hist-close');
    const btnHistClear = document.getElementById('btn-pg-hist-clear');
    const histList = document.getElementById('pg-history-list');

    // --- LOGIC ---
    const getRandomInt = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    };

    const calculateEntropy = (pwd) => {
        let poolSize = 0;
        if (/[a-z]/.test(pwd)) poolSize += 26;
        if (/[A-Z]/.test(pwd)) poolSize += 26;
        if (/[0-9]/.test(pwd)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

        if (poolSize === 0) return 0;
        const entropy = pwd.length * Math.log2(poolSize);
        return entropy;
    };

    const updateStrengthMeter = (pwd) => {
        const entropy = calculateEntropy(pwd);
        
        // Reset
        [st1, st2, st3, st4].forEach(el => el.className = 'flex-1 rounded-full transition-colors bg-zinc-200 dark:bg-zinc-800');
        
        if (entropy < 28) {
            st1.classList.replace('bg-zinc-200', 'bg-red-500'); st1.classList.replace('dark:bg-zinc-800', 'bg-red-500');
            stText.textContent = 'YẾU'; stText.className = 'text-[10px] font-bold uppercase w-12 text-right text-red-500';
        } else if (entropy < 50) {
            st1.classList.replace('bg-zinc-200', 'bg-orange-500'); st1.classList.replace('dark:bg-zinc-800', 'bg-orange-500');
            st2.classList.replace('bg-zinc-200', 'bg-orange-500'); st2.classList.replace('dark:bg-zinc-800', 'bg-orange-500');
            stText.textContent = 'VỪA'; stText.className = 'text-[10px] font-bold uppercase w-12 text-right text-orange-500';
        } else if (entropy < 70) {
            st1.classList.replace('bg-zinc-200', 'bg-blue-500'); st1.classList.replace('dark:bg-zinc-800', 'bg-blue-500');
            st2.classList.replace('bg-zinc-200', 'bg-blue-500'); st2.classList.replace('dark:bg-zinc-800', 'bg-blue-500');
            st3.classList.replace('bg-zinc-200', 'bg-blue-500'); st3.classList.replace('dark:bg-zinc-800', 'bg-blue-500');
            stText.textContent = 'TỐT'; stText.className = 'text-[10px] font-bold uppercase w-12 text-right text-blue-500';
        } else {
            st1.classList.replace('bg-zinc-200', 'bg-emerald-500'); st1.classList.replace('dark:bg-zinc-800', 'bg-emerald-500');
            st2.classList.replace('bg-zinc-200', 'bg-emerald-500'); st2.classList.replace('dark:bg-zinc-800', 'bg-emerald-500');
            st3.classList.replace('bg-zinc-200', 'bg-emerald-500'); st3.classList.replace('dark:bg-zinc-800', 'bg-emerald-500');
            st4.classList.replace('bg-zinc-200', 'bg-emerald-500'); st4.classList.replace('dark:bg-zinc-800', 'bg-emerald-500');
            stText.textContent = 'MẠNH'; stText.className = 'text-[10px] font-bold uppercase w-12 text-right text-emerald-500';
        }
    };

    const generatePassword = () => {
        let pwd = '';
        
        if (state.mode === 'pronounceable') {
            let isConsonant = true;
            for (let i = 0; i < state.length; i++) {
                if (isConsonant) {
                    pwd += PRONOUNCE.consonants[getRandomInt(PRONOUNCE.consonants.length)];
                } else {
                    pwd += PRONOUNCE.vowels[getRandomInt(PRONOUNCE.vowels.length)];
                }
                isConsonant = !isConsonant;
            }
            // Capitalize first letter optionally
            if (state.length > 0) pwd = pwd.charAt(0).toUpperCase() + pwd.slice(1);
            
            // Auto add 2 numbers at end to make it comply with basic systems
            if (state.length >= 4) {
                pwd = pwd.slice(0, -2) + getRandomInt(10) + getRandomInt(10);
            }

        } else {
            // Chế độ Ngẫu nhiên
            if (!state.upper && !state.lower && !state.number && !state.symbol) {
                // Rơi vào case bỏ tick hết, ép bật chữ thường
                state.lower = true;
                chkLower.checked = true;
            }

            let pool = '';
            if (state.upper) pool += CHARS.upper;
            if (state.lower) pool += CHARS.lower;
            if (state.number) pool += CHARS.number;
            if (state.symbol) pool += CHARS.symbol;

            if (state.exclude) {
                pool = pool.replace(CONFUSING, '');
            }

            // Đảm bảo có ít nhất 1 ký tự của mỗi loại đã chọn
            const mandatory = [];
            if (state.upper) mandatory.push(state.exclude ? CHARS.upper.replace(CONFUSING,'')[0] : CHARS.upper[0]);
            if (state.lower) mandatory.push(state.exclude ? CHARS.lower.replace(CONFUSING,'')[0] : CHARS.lower[0]);
            if (state.number) mandatory.push(state.exclude ? CHARS.number.replace(CONFUSING,'')[0] : CHARS.number[0]);
            if (state.symbol) mandatory.push(CHARS.symbol[0]); // Symbols gen ko bị confusing rule cắt mất hoàn toàn

            for (let i = 0; i < state.length; i++) {
                if (i < mandatory.length) {
                    pwd += mandatory[i];
                } else {
                    pwd += pool[getRandomInt(pool.length)];
                }
            }

            // Trộn mảng (Shuffle)
            pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
        }

        elOut.value = pwd;
        updateStrengthMeter(pwd);
    };

    const saveHistory = (pwd) => {
        if (!pwd || history[0] === pwd) return;
        history.unshift(pwd);
        if (history.length > 20) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
    };

    const renderHistory = () => {
        if (history.length === 0) {
            histList.innerHTML = '<div class="text-zinc-400 text-center text-[11px] font-medium py-10 opacity-50">Chưa có mật khẩu nào được lưu.</div>';
            return;
        }

        histList.innerHTML = history.map(item => `
            <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl active:scale-95 transition-transform cursor-pointer group hist-item" data-val="${item}">
                <div class="font-mono text-sm font-medium text-zinc-900 dark:text-white truncate pr-4">${item}</div>
                <button class="w-6 h-6 rounded flex items-center justify-center text-zinc-400 group-active:text-zinc-900 dark:group-active:text-white shrink-0"><i class="far fa-copy text-[10px]"></i></button>
            </div>
        `).join('');

        document.querySelectorAll('.hist-item').forEach(el => {
            el.addEventListener('click', async () => {
                const val = el.dataset.val;
                try {
                    await navigator.clipboard.writeText(val);
                    UI.showAlert('Đã chép', 'Mật khẩu đã được copy', 'success', 1000);
                } catch(e){}
            });
        });
    };

    // --- SỰ KIỆN ---

    // Đổi Mode
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => {
                b.classList.remove('active', 'bg-white', 'dark:bg-[#18181b]', 'text-zinc-900', 'dark:text-white', 'border-zinc-200', 'dark:border-zinc-700');
                b.classList.add('text-zinc-500', 'border-transparent');
            });
            btn.classList.add('active', 'bg-white', 'dark:bg-[#18181b]', 'text-zinc-900', 'dark:text-white', 'border-zinc-200', 'dark:border-zinc-700');
            btn.classList.remove('text-zinc-500', 'border-transparent');

            state.mode = btn.dataset.mode;

            if (state.mode === 'pronounceable') {
                optsBox.classList.add('opacity-30', 'pointer-events-none');
            } else {
                optsBox.classList.remove('opacity-30', 'pointer-events-none');
            }
            generatePassword();
        });
    });

    // Slider
    rangeLen.addEventListener('input', (e) => {
        state.length = parseInt(e.target.value);
        valLen.textContent = state.length;
        generatePassword();
    });

    // Checkboxes
    const updateCheckboxes = () => {
        state.upper = chkUpper.checked;
        state.lower = chkLower.checked;
        state.number = chkNumber.checked;
        state.symbol = chkSymbol.checked;
        state.exclude = chkExclude.checked;
        generatePassword();
    };

    [chkUpper, chkLower, chkNumber, chkSymbol, chkExclude].forEach(chk => {
        chk.addEventListener('change', updateCheckboxes);
    });

    // Nút Tạo mới
    btnGen.addEventListener('click', generatePassword);

    // Nút Copy
    btnCopy.addEventListener('click', async () => {
        const val = elOut.value;
        if (!val) return;
        try {
            await navigator.clipboard.writeText(val);
            saveHistory(val);
            
            const ori = btnCopy.innerHTML;
            btnCopy.innerHTML = '<i class="fas fa-check"></i>';
            btnCopy.classList.replace('text-zinc-600', 'text-emerald-500');
            btnCopy.classList.replace('dark:text-zinc-300', 'dark:text-emerald-400');
            
            setTimeout(() => {
                btnCopy.innerHTML = ori;
                btnCopy.classList.replace('text-emerald-500', 'text-zinc-600');
                btnCopy.classList.replace('dark:text-emerald-400', 'dark:text-zinc-300');
            }, 1000);
            
            UI.showAlert('Đã chép', 'Mật khẩu đã được lưu.', 'success', 1000);
        } catch (e) { }
    });

    // History Toggle
    btnHistOpen.addEventListener('click', () => {
        renderHistory();
        histPanel.classList.remove('translate-y-full');
    });
    
    btnHistClose.addEventListener('click', () => {
        histPanel.classList.add('translate-y-full');
    });

    btnHistClear.addEventListener('click', () => {
        if (history.length === 0) return;
        UI.showConfirm('Xóa lịch sử?', 'Toàn bộ mật khẩu đã tạo sẽ bị xóa.', () => {
            history = [];
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
        });
    });

    // Khởi chạy lần đầu
    generatePassword();
}