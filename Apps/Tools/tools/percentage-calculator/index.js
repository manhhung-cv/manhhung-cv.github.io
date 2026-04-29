import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="relative flex flex-col w-full max-w-[400px] mx-auto sm:max-w-none min-h-[500px]">
            <div class="flex justify-between items-center mb-4 px-1">
                <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Tính Phần Trăm</h2>
                <button class="h-8 px-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform" id="btn-pc-clear">
                    <i class="fas fa-redo-alt"></i> Làm mới
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between">
                    <div>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span class="w-5 h-5 rounded bg-zinc-100 dark:bg-[#121214] text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-800"><i class="fas fa-percentage text-[10px]"></i></span>
                            Phần trăm cơ bản
                        </h3>
                        
                        <div class="flex items-center gap-2 mb-3">
                            <input type="number" id="pc-1-x" class="pc-input w-20 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="X">
                            <span class="text-sm font-semibold text-zinc-500">% của</span>
                            <input type="number" id="pc-1-y" class="pc-input flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="Y">
                        </div>
                    </div>

                    <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-end">
                        <span class="text-xs font-bold text-zinc-400 mb-1">Kết quả:</span>
                        <div class="flex flex-col items-end group">
                            <div class="text-3xl font-medium text-zinc-900 dark:text-white font-mono tracking-tighter" id="pc-1-res">0</div>
                            <button class="btn-pc-copy text-[9px] font-bold uppercase tracking-wider text-zinc-400 active:text-zinc-900 dark:active:text-white transition-colors flex items-center gap-1 mt-1" data-target="pc-1-res"><i class="far fa-copy"></i> Copy</button>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between">
                    <div>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span class="w-5 h-5 rounded bg-zinc-100 dark:bg-[#121214] text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-800"><i class="fas fa-chart-pie text-[10px]"></i></span>
                            Tỷ trọng
                        </h3>
                        
                        <div class="flex items-center gap-2 mb-3">
                            <input type="number" id="pc-2-x" class="pc-input w-20 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="X">
                            <span class="text-sm font-semibold text-zinc-500">là bao nhiêu % của</span>
                            <input type="number" id="pc-2-y" class="pc-input flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="Y">
                        </div>
                    </div>

                    <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-end">
                        <span class="text-xs font-bold text-zinc-400 mb-1">Kết quả:</span>
                        <div class="flex flex-col items-end group">
                            <div class="flex items-baseline gap-1 text-zinc-900 dark:text-white">
                                <span class="text-3xl font-medium font-mono tracking-tighter" id="pc-2-res">0</span>
                                <span class="text-lg font-bold">%</span>
                            </div>
                            <button class="btn-pc-copy text-[9px] font-bold uppercase tracking-wider text-zinc-400 active:text-zinc-900 dark:active:text-white transition-colors flex items-center gap-1 mt-1" data-target="pc-2-res"><i class="far fa-copy"></i> Copy</button>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-[#09090b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                    <div>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span class="w-5 h-5 rounded bg-zinc-100 dark:bg-[#121214] text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-800"><i class="fas fa-chart-line text-[10px]"></i></span>
                            Tăng / Giảm
                        </h3>
                        
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-sm font-semibold text-zinc-500">Từ</span>
                            <input type="number" id="pc-3-x" class="pc-input flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="X">
                            <i class="fas fa-arrow-right text-zinc-300 dark:text-zinc-700 text-xs"></i>
                            <span class="text-sm font-semibold text-zinc-500">lên</span>
                            <input type="number" id="pc-3-y" class="pc-input flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="Y">
                        </div>
                    </div>

                    <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-end">
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-zinc-400 mb-1">Thay đổi:</span>
                            <span id="pc-3-status" class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">--</span>
                        </div>
                        <div class="flex flex-col items-end group">
                            <div class="flex items-baseline gap-1" id="pc-3-res-color">
                                <span class="text-3xl font-medium font-mono tracking-tighter" id="pc-3-res">0</span>
                                <span class="text-lg font-bold">%</span>
                            </div>
                            <button class="btn-pc-copy text-[9px] font-bold uppercase tracking-wider text-zinc-400 active:text-zinc-900 dark:active:text-white transition-colors flex items-center gap-1 mt-1" data-target="pc-3-res"><i class="far fa-copy"></i> Copy</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const i1x = document.getElementById('pc-1-x');
    const i1y = document.getElementById('pc-1-y');
    const r1  = document.getElementById('pc-1-res');

    const i2x = document.getElementById('pc-2-x');
    const i2y = document.getElementById('pc-2-y');
    const r2  = document.getElementById('pc-2-res');

    const i3x = document.getElementById('pc-3-x');
    const i3y = document.getElementById('pc-3-y');
    const r3  = document.getElementById('pc-3-res');
    const s3  = document.getElementById('pc-3-status');
    const c3  = document.getElementById('pc-3-res-color');

    const btnClear = document.getElementById('btn-pc-clear');
    const btnsCopy = document.querySelectorAll('.btn-pc-copy');
    const inputs   = document.querySelectorAll('.pc-input');

    // --- Format Number Chuẩn Việt Nam ---
    const formatNumberVN = (num) => {
        if (isNaN(num) || !isFinite(num)) return 'Lỗi';
        
        // Làm tròn tối đa 4 chữ số thập phân để tránh số quá dài
        let rounded = Math.round(num * 10000) / 10000;
        
        let parts = String(rounded).split('.');
        // Thêm dấu chấm cho hàng nghìn
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        // Gộp bằng dấu phẩy
        return parts.join(',');
    };

    // --- Calculation Logics ---
    const calc1 = () => {
        const x = parseFloat(i1x.value);
        const y = parseFloat(i1y.value);
        if (isNaN(x) || isNaN(y)) {
            r1.textContent = '0';
            return;
        }
        const res = (x / 100) * y;
        r1.textContent = formatNumberVN(res);
    };

    const calc2 = () => {
        const x = parseFloat(i2x.value);
        const y = parseFloat(i2y.value);
        if (isNaN(x) || isNaN(y) || y === 0) {
            r2.textContent = '0';
            return;
        }
        const res = (x / y) * 100;
        r2.textContent = formatNumberVN(res);
    };

    const calc3 = () => {
        const x = parseFloat(i3x.value);
        const y = parseFloat(i3y.value);
        if (isNaN(x) || isNaN(y) || x === 0) {
            r3.textContent = '0';
            s3.textContent = '--';
            s3.className = 'text-[11px] font-bold uppercase tracking-wider text-zinc-500';
            c3.className = 'flex items-baseline gap-1 text-zinc-900 dark:text-white';
            return;
        }
        
        const change = ((y - x) / Math.abs(x)) * 100;
        r3.textContent = formatNumberVN(Math.abs(change));

        if (change > 0) {
            s3.innerHTML = '<i class="fas fa-long-arrow-alt-up"></i> TĂNG';
            s3.className = 'text-[11px] font-bold uppercase tracking-wider text-emerald-500';
            c3.className = 'flex items-baseline gap-1 text-emerald-500';
        } else if (change < 0) {
            s3.innerHTML = '<i class="fas fa-long-arrow-alt-down"></i> GIẢM';
            s3.className = 'text-[11px] font-bold uppercase tracking-wider text-red-500';
            c3.className = 'flex items-baseline gap-1 text-red-500';
        } else {
            s3.innerHTML = 'KHÔNG ĐỔI';
            s3.className = 'text-[11px] font-bold uppercase tracking-wider text-zinc-500';
            c3.className = 'flex items-baseline gap-1 text-zinc-900 dark:text-white';
        }
    };

    // --- Binds ---
    i1x.addEventListener('input', calc1);
    i1y.addEventListener('input', calc1);

    i2x.addEventListener('input', calc2);
    i2y.addEventListener('input', calc2);

    i3x.addEventListener('input', calc3);
    i3y.addEventListener('input', calc3);

    btnClear.addEventListener('click', () => {
        inputs.forEach(inp => inp.value = '');
        calc1(); calc2(); calc3();
    });

    btnsCopy.forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.dataset.target;
            const resText = document.getElementById(targetId).textContent;
            if (resText === '0' || resText === 'Lỗi') return;

            try {
                await navigator.clipboard.writeText(resText);
                const oriHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> OK';
                btn.classList.add('text-zinc-900', 'dark:text-white');
                setTimeout(() => {
                    btn.innerHTML = oriHtml;
                    btn.classList.remove('text-zinc-900', 'dark:text-white');
                }, 1000);
            } catch (err) {}
        });
    });
}