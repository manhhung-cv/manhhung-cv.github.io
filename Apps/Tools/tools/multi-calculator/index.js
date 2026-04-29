import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .calc-tabs-wrapper::-webkit-scrollbar { display: none; }
            .calc-tabs-wrapper { scrollbar-width: none; }
            
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
        </style>

        <div class="relative flex flex-col w-full max-w-[340px] mx-auto sm:max-w-none min-h-[500px]">
            <div class="flex justify-between items-center mb-4 px-1">
                <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Máy Tính Đa Tab</h2>
                <div class="flex items-center gap-2">
                    <button class="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center transition-transform active:scale-95" id="btn-clear-all" title="Xóa tất cả">
                        <i class="fas fa-trash-alt text-[11px]"></i>
                    </button>
                    <button class="h-8 px-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-transform active:scale-95" id="btn-add-calc">
                        <i class="fas fa-plus"></i> Thêm Tab
                    </button>
                </div>
            </div>

            <div class="calc-tabs-wrapper flex gap-2 overflow-x-auto pb-2 px-1 mb-2 border-b border-zinc-200 dark:border-zinc-800" id="calc-tabs">
                </div>

            <div id="calc-panes" class="flex-1 flex justify-center items-start pt-2">
                </div>
        </div>
    `;
}

export function init() {
    const tabsContainer = document.getElementById('calc-tabs');
    const panesContainer = document.getElementById('calc-panes');
    const btnAdd = document.getElementById('btn-add-calc');
    const btnClearAll = document.getElementById('btn-clear-all');
    
    const STORAGE_KEY = 'aio_multi_calc_v6';
    let calcCounter = 0;
    const calculators = new Map();
    let currentActiveTabId = null;

    // --- HỆ THỐNG LƯU TRỮ LOCALSTORAGE ---
    const saveState = () => {
        const state = {
            calcCounter: calcCounter,
            activeTabId: currentActiveTabId,
            items: []
        };
        calculators.forEach(calc => {
            state.items.push({
                id: calc.id,
                title: calc.title,
                currentValue: calc.currentValue,
                previousValue: calc.previousValue,
                operator: calc.operator,
                waitingForNewValue: calc.waitingForNewValue,
                history: calc.history
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    const loadState = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    // --- LOGIC CHUYỂN TAB ---
    const switchTab = (targetId) => {
        document.querySelectorAll('.calc-tab').forEach(tab => {
            tab.classList.remove('bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.add('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-500');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('block');
            pane.classList.add('hidden');
        });
        
        const targetTab = document.querySelector(`.calc-tab[data-target="${targetId}"]`);
        const targetPane = document.getElementById(targetId);
        
        if (targetTab && targetPane) {
            targetTab.classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-500');
            targetTab.classList.add('bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            
            targetPane.classList.remove('hidden');
            targetPane.classList.add('block');
            targetTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            
            currentActiveTabId = targetId;
            saveState(); 
        }
    };

    // --- CLASS ĐỊNH NGHĨA MÁY TÍNH ---
    class Calculator {
        constructor(initialState = {}) {
            this.id = initialState.id;
            this.title = initialState.title || 'Máy tính';
            this.currentValue = initialState.currentValue || '0';
            this.previousValue = initialState.previousValue || '';
            this.operator = initialState.operator || null;
            this.waitingForNewValue = initialState.waitingForNewValue || false;
            this.history = initialState.history || [];
            
            this.render();
            this.bindEvents();
            this.updateDisplay();
            this.renderHistory();
        }

        render() {
            // Render Tab Button (Flat)
            const tabBtn = document.createElement('button');
            tabBtn.className = 'calc-tab flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-transform whitespace-nowrap shrink-0 active:scale-95';
            tabBtn.dataset.target = this.id;
            tabBtn.innerHTML = `
                <span class="tab-name truncate max-w-[80px]">${this.title}</span>
                <span class="calc-tab-close opacity-50 active:opacity-100 active:text-red-500 transition-colors w-4 h-4 flex items-center justify-center rounded-full"><i class="fas fa-times text-[9px]"></i></span>
            `;
            tabsContainer.appendChild(tabBtn);

            // Render Calculator Pane
            const pane = document.createElement('div');
            pane.className = 'tab-pane hidden w-full animate-in fade-in zoom-in-95 duration-200';
            pane.id = this.id;
            
            pane.innerHTML = `
                <div class="calc-widget relative w-full max-w-[340px] mx-auto bg-white dark:bg-[#09090b] rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                    
                    <div class="px-5 pt-4 pb-2 flex justify-between items-center z-10 bg-white dark:bg-[#09090b]">
                        <input type="text" class="calc-rename text-[11px] font-bold uppercase tracking-widest bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 outline-none text-zinc-900 dark:text-white transition-colors w-28 p-0 m-0" value="${this.title}" placeholder="Tên tab...">
                        <button class="btn-toggle-hist text-zinc-400 w-7 h-7 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center transition-transform active:scale-95"><i class="fas fa-history text-[10px]"></i></button>
                    </div>
                    
                    <div class="px-5 pb-4 pt-1 text-right relative z-10 flex flex-col justify-end min-h-[90px] bg-white dark:bg-[#09090b]">
                        <button class="btn-copy absolute top-0 left-5 text-zinc-500 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md opacity-50 active:opacity-100 transition-opacity active:scale-95"><i class="far fa-copy"></i> Copy</button>
                        <div class="calc-expr text-[13px] text-zinc-400 font-medium h-5 mb-1 truncate tracking-wide"></div>
                        <div class="calc-result text-5xl font-medium text-zinc-900 dark:text-white tracking-tighter truncate leading-none pb-1">0</div>
                    </div>
                    
                    <div class="p-3 grid grid-cols-4 gap-2 z-10 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-zinc-800">
                        <button class="calc-btn act-clear" data-val="clear">C</button>
                        <button class="calc-btn act-del" data-val="del"><i class="fas fa-backspace"></i></button>
                        <button class="calc-btn op" data-val="%">%</button>
                        <button class="calc-btn op" data-val="/">÷</button>

                        <button class="calc-btn num" data-val="7">7</button>
                        <button class="calc-btn num" data-val="8">8</button>
                        <button class="calc-btn num" data-val="9">9</button>
                        <button class="calc-btn op" data-val="*">×</button>

                        <button class="calc-btn num" data-val="4">4</button>
                        <button class="calc-btn num" data-val="5">5</button>
                        <button class="calc-btn num" data-val="6">6</button>
                        <button class="calc-btn op" data-val="-">−</button>

                        <button class="calc-btn num" data-val="1">1</button>
                        <button class="calc-btn num" data-val="2">2</button>
                        <button class="calc-btn num" data-val="3">3</button>
                        <button class="calc-btn op" data-val="+">+</button>

                        <button class="calc-btn num col-span-2" data-val="0">0</button>
                        <button class="calc-btn num" data-val=".">,</button>
                        <button class="calc-btn op-eq" data-val="=">=</button>
                    </div>

                    <div class="hist-panel absolute inset-x-0 bottom-0 top-[110px] bg-white dark:bg-[#09090b] z-20 transition-transform duration-300 translate-y-full flex flex-col border-t border-zinc-200 dark:border-zinc-800">
                        <div class="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-[#121214]">
                            <span class="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Lịch sử</span>
                            <button class="btn-close-hist w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 active:text-zinc-900 dark:active:text-white flex items-center justify-center transition-colors"><i class="fas fa-chevron-down text-[10px]"></i></button>
                        </div>
                        <div class="calc-history flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1"></div>
                    </div>
                </div>

                <style>
                    /* Phím bấm phẳng 100%, không bóng, không hover */
                    #${this.id} .calc-btn { 
                        display: flex; align-items: center; justify-content: center; 
                        height: 52px; border-radius: 16px; font-size: 1.15rem; font-weight: 500; 
                        transition: transform 0.1s; user-select: none; font-family: ui-sans-serif, system-ui, sans-serif;
                    }
                    #${this.id} .calc-btn:active { transform: scale(0.92); }
                    
                    /* Numbers */
                    #${this.id} .num { background: #ffffff; color: #18181b; border: 1px solid #e4e4e7; }
                    .dark #${this.id} .num { background: #18181b; color: #ffffff; border-color: #27272a; }

                    /* Operators */
                    #${this.id} .op { background: #f4f4f5; color: #18181b; font-weight: 600; border: 1px solid #e4e4e7; }
                    .dark #${this.id} .op { background: #27272a; color: #ffffff; border-color: #3f3f46; }

                    /* Equal */
                    #${this.id} .op-eq { background: #18181b; color: #ffffff; font-weight: 600; border: 1px solid #18181b; }
                    .dark #${this.id} .op-eq { background: #ffffff; color: #18181b; border-color: #ffffff; }

                    /* Clear & Del */
                    #${this.id} .act-clear, #${this.id} .act-del { background: #fef2f2; color: #ef4444; font-weight: 600; border: 1px solid #fecaca; }
                    .dark #${this.id} .act-clear, .dark #${this.id} .act-del { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(248, 113, 113, 0.2); }
                </style>
            `;
            panesContainer.appendChild(pane);
            
            this.DOM = {
                tabBtn: tabBtn,
                tabNameStr: tabBtn.querySelector('.tab-name'),
                tabCloseBtn: tabBtn.querySelector('.calc-tab-close'),
                pane: pane,
                renameInput: pane.querySelector('.calc-rename'),
                expr: pane.querySelector('.calc-expr'),
                res: pane.querySelector('.calc-result'),
                histPanel: pane.querySelector('.hist-panel'),
                historyBox: pane.querySelector('.calc-history'),
                btnToggleHist: pane.querySelector('.btn-toggle-hist'),
                btnCloseHist: pane.querySelector('.btn-close-hist'),
                btnCopy: pane.querySelector('.btn-copy')
            };
        }

        bindEvents() {
            this.DOM.tabBtn.onclick = () => switchTab(this.id);
            this.DOM.tabCloseBtn.onclick = (e) => { e.stopPropagation(); this.destroy(); };

            this.DOM.renameInput.addEventListener('input', (e) => {
                const newName = e.target.value.trim() || 'Máy tính';
                this.DOM.tabNameStr.textContent = newName;
                this.title = newName;
                saveState();
            });

            // Toggle History
            this.DOM.btnToggleHist.onclick = () => {
                this.DOM.histPanel.classList.remove('translate-y-full');
            };
            this.DOM.btnCloseHist.onclick = () => {
                this.DOM.histPanel.classList.add('translate-y-full');
            };

            this.DOM.btnCopy.onclick = async () => {
                if (this.currentValue === 'Lỗi') return UI.showAlert('Lỗi', 'Không thể chép.', 'warning');
                try {
                    const formattedForCopy = String(this.currentValue).replace('.', ',');
                    await navigator.clipboard.writeText(formattedForCopy);
                    UI.showAlert('Đã chép', `Giá trị: ${formattedForCopy}`, 'success', 1000);
                } catch (err) {}
            };

            // Phím bấm
            this.DOM.pane.querySelectorAll('.calc-btn').forEach(btn => {
                btn.onclick = () => {
                    const val = btn.dataset.val;
                    if (btn.classList.contains('num')) this.inputNumber(val);
                    else if (btn.classList.contains('op')) this.inputOperator(val);
                    else if (btn.classList.contains('act-clear')) this.clearAll();
                    else if (btn.classList.contains('act-del')) this.deleteChar();
                    else if (btn.classList.contains('op-eq')) this.calculate();
                };
            });
            
            // Lịch sử Click -> Copy
            this.DOM.historyBox.addEventListener('click', async (e) => {
                const item = e.target.closest('.history-item');
                if (item) {
                    try {
                        const copyVal = String(item.dataset.val).replace('.', ',');
                        await navigator.clipboard.writeText(copyVal);
                        UI.showAlert('Đã chép', `${copyVal}`, 'success', 1000);
                    } catch (err) { }
                }
            });
        }

        // ĐỊNH DẠNG CHUẨN VIỆT NAM
        formatNumberVN(numStr) {
            if(numStr === 'Lỗi') return numStr;
            const parts = String(numStr).split('.'); 
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(',');
        }

        updateDisplay() {
            this.DOM.res.textContent = this.formatNumberVN(this.currentValue);
            
            if (this.operator != null) {
                const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
                this.DOM.expr.textContent = `${this.formatNumberVN(this.previousValue)} ${opMap[this.operator]}`;
            } else {
                this.DOM.expr.textContent = '';
            }
        }

        inputNumber(num) {
            if (this.waitingForNewValue) {
                this.currentValue = num === '.' ? '0.' : num;
                this.waitingForNewValue = false;
            } else {
                if (num === '.' && String(this.currentValue).includes('.')) return;
                this.currentValue = this.currentValue === '0' && num !== '.' ? num : String(this.currentValue) + num;
            }
            this.updateDisplay();
            saveState();
        }

        inputOperator(op) {
            if (this.operator && !this.waitingForNewValue) this.calculate(false);
            this.previousValue = this.currentValue;
            this.operator = op;
            this.waitingForNewValue = true;
            this.updateDisplay();
            saveState();
        }

        calculate(saveHistory = true) {
            if (!this.operator || this.waitingForNewValue) return;

            const prev = parseFloat(this.previousValue);
            const curr = parseFloat(this.currentValue);
            if (isNaN(prev) || isNaN(curr)) return;

            let result = 0;
            switch (this.operator) {
                case '+': result = prev + curr; break;
                case '-': result = prev - curr; break;
                case '*': result = prev * curr; break;
                case '/': result = curr === 0 ? 'Lỗi' : prev / curr; break;
                case '%': result = prev % curr; break;
            }

            if (result !== 'Lỗi') {
                result = Math.round(result * 10000000000) / 10000000000;
                result = String(result);
            }

            if (saveHistory) {
                const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
                const exprString = `${this.formatNumberVN(this.previousValue)} ${opMap[this.operator]} ${this.formatNumberVN(this.currentValue)}`;
                this.addHistory(exprString, result);
            }

            this.currentValue = result;
            this.operator = null;
            this.previousValue = '';
            this.waitingForNewValue = true;
            this.updateDisplay();
            saveState();
        }

        clearAll() {
            this.currentValue = '0';
            this.previousValue = '';
            this.operator = null;
            this.waitingForNewValue = false;
            this.updateDisplay();
            saveState();
        }

        deleteChar() {
            if (this.waitingForNewValue) return;
            let strVal = String(this.currentValue);
            if (strVal.length === 1 || (strVal.length === 2 && strVal.startsWith('-'))) {
                this.currentValue = '0';
            } else {
                this.currentValue = strVal.slice(0, -1);
            }
            this.updateDisplay();
            saveState();
        }

        addHistory(expr, res) {
            this.history.unshift({ expr, res });
            if (this.history.length > 30) this.history.pop(); 
            this.renderHistory();
        }

        renderHistory() {
            if (this.history.length === 0) {
                this.DOM.historyBox.innerHTML = '<div class="text-zinc-400 text-center text-[11px] font-medium py-10 opacity-50">Chưa có phép tính nào.</div>';
                return;
            }
            let html = '';
            this.history.forEach(item => {
                const formatRes = this.formatNumberVN(item.res);
                html += `
                    <div class="history-item flex flex-col items-end p-2.5 rounded-xl cursor-pointer active:bg-zinc-100 dark:active:bg-zinc-800/50 transition-colors active:scale-95" data-val="${item.res}" title="Nhấn để copy">
                        <div class="text-[11px] font-medium text-zinc-400 mb-0.5">${item.expr} =</div>
                        <div class="text-xl font-bold text-zinc-900 dark:text-white">${formatRes}</div>
                    </div>
                `;
            });
            this.DOM.historyBox.innerHTML = html;
        }

        destroy() {
            let nextTabId = null;
            if (this.DOM.tabBtn.classList.contains('active')) {
                const allTabs = Array.from(tabsContainer.querySelectorAll('.calc-tab'));
                const currentIndex = allTabs.indexOf(this.DOM.tabBtn);
                if (allTabs.length > 1) {
                    const nextTab = allTabs[currentIndex - 1] || allTabs[currentIndex + 1];
                    nextTabId = nextTab.dataset.target;
                }
            }

            this.DOM.tabBtn.remove();
            this.DOM.pane.remove();
            calculators.delete(this.id);

            if (nextTabId) {
                switchTab(nextTabId);
            } else if (calculators.size === 0) {
                createNewCalculator();
            } else {
                saveState();
            }
        }
    }

    // --- KHỞI TẠO VÀ PHỤC HỒI DỮ LIỆU ---
    const createNewCalculator = (initialData = null) => {
        if (!initialData) {
            calcCounter++;
            initialData = { id: `mc-tab-${calcCounter}`, title: `Máy tính ${calcCounter}` };
        }
        const calc = new Calculator(initialData);
        calculators.set(initialData.id, calc);
        return initialData.id;
    };

    const savedState = loadState();
    if (savedState && savedState.items && savedState.items.length > 0) {
        calcCounter = savedState.calcCounter || 0;
        savedState.items.forEach(item => createNewCalculator(item));
        
        if (savedState.activeTabId && calculators.has(savedState.activeTabId)) {
            switchTab(savedState.activeTabId);
        } else {
            switchTab(savedState.items[0].id);
        }
    } else {
        const firstId = createNewCalculator();
        switchTab(firstId);
    }

    // --- SỰ KIỆN THANH CÔNG CỤ ---
    btnAdd.onclick = () => {
        const newId = createNewCalculator();
        switchTab(newId);
    };

    btnClearAll.onclick = () => {
        if (calculators.size === 0) return;
        UI.showConfirm('Đóng tất cả?', 'Bạn có chắc chắn muốn xóa toàn bộ máy tính và lịch sử không?', () => {
            tabsContainer.innerHTML = '';
            panesContainer.innerHTML = '';
            calculators.clear();
            calcCounter = 0;
            localStorage.removeItem(STORAGE_KEY);
            const firstId = createNewCalculator();
            switchTab(firstId);
        });
    };
}