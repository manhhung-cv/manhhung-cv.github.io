import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .mc-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
            
            /* Tùy chỉnh Tabs */
            .calc-tabs-wrapper {
                display: flex; gap: 4px; border-bottom: 1px solid var(--border); 
                margin-bottom: 16px; overflow-x: auto; scrollbar-width: none;
                padding-bottom: 2px; scroll-behavior: smooth;
            }
            .calc-tabs-wrapper::-webkit-scrollbar { display: none; }
            
            .calc-tab {
                display: flex; align-items: center; gap: 6px;
                padding: 8px 12px; background: transparent; border: none;
                color: var(--text-mut); font-family: var(--font); font-size: 0.9rem; font-weight: 500;
                cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
                white-space: nowrap; margin-bottom: -1px;
            }
            .calc-tab:hover { color: var(--text-main); }
            .calc-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
            .calc-tab-close {
                opacity: 0.5; font-size: 0.75rem; padding: 4px; border-radius: 50%;
                transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;
            }
            .calc-tab:hover .calc-tab-close { opacity: 1; background: rgba(239, 68, 68, 0.05); }
            .calc-tab-close:hover { background: rgba(239, 68, 68, 0.15) !important; color: #ef4444; }

            /* Giao diện máy tính (Tối ưu cho Mobile) */
            .calc-widget { 
                max-width: 380px; margin: 0 auto; width: 100%;
                display: flex; flex-direction: column; background: var(--bg-main);
                padding: 16px; border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .calc-display { 
                background: var(--bg-sec); padding: 12px 12px; text-align: right; 
                border-radius: var(--radius); margin-bottom: 12px; 
                border: 1px solid var(--border); position: relative;
            }
            .calc-expr { font-size: 0.85rem; color: var(--text-mut); min-height: 1.2rem; font-family: monospace; letter-spacing: 0.5px; margin-bottom: 4px; }
            .calc-result { font-size: 2.2rem; font-weight: 600; color: var(--text-main); word-wrap: break-word; line-height: 1.1; overflow-x: auto; scrollbar-width: none; }
            .calc-result::-webkit-scrollbar { display: none; }

            .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
            .calc-btn { 
                padding: 12px 0; font-size: 1.2rem; font-weight: 500; background: var(--bg-sec); 
                border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; 
                color: var(--text-main); transition: all 0.1s; user-select: none; font-family: var(--font);
            }
            .calc-btn:active { transform: scale(0.92); }
            .calc-btn:hover { border-color: var(--text-mut); background: var(--border); }
            
            .calc-btn.op { color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
            .calc-btn.op-eq { background: #3b82f6; color: white; border-color: #3b82f6; }
            .calc-btn.op-eq:hover { opacity: 0.9; transform: scale(0.96); }
            .calc-btn.act-clear { color: #ef4444; background: rgba(239, 68, 68, 0.05); }
            .calc-btn.zero { grid-column: span 2; }

            .calc-history { 
                max-height: 180px; overflow-y: auto; font-size: 0.85rem; 
                margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 12px;
                display: none; flex-direction: column; gap: 6px;
            }
            .calc-history.show { display: flex; }
            .history-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-radius: 4px; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
            .history-item:hover { background: var(--bg-sec); border-color: var(--border); }
            .history-expr { color: var(--text-mut); font-size: 0.8rem; font-family: monospace; }
            .history-res { color: var(--text-main); font-weight: 600; font-size: 1rem; }

            /* Điều chỉnh riêng cho màn hình nhỏ (Mobile) */
            @media (max-width: 480px) {
                .mc-toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
                .mc-toolbar .flex-row { display: flex; justify-content: space-between; width: 100%; }
                .calc-widget { padding: 12px; border: none; border-top: 1px solid var(--border); border-radius: 0; }
                .calc-btn { padding: 14px 0; font-size: 1.15rem; }
                .calc-result { font-size: 2rem; }
                .calc-grid { gap: 6px; }
                .calc-display { padding: 10px; margin-bottom: 10px; }
            }
        </style>

        <div class="mc-toolbar">
            <div>
                <h1 class="h1">Multi Calculator</h1>
            </div>
            <div class="flex-row" style="gap: 8px;">
                <button class="btn btn-ghost btn-sm" id="btn-clear-all" style="color: #ef4444;"><i class="fas fa-trash"></i> Xóa tất cả</button>
                <button class="btn btn-primary btn-sm" id="btn-add-calc"><i class="fas fa-plus"></i> Thêm Tab</button>
            </div>
        </div>

        <div class="calc-tabs-wrapper" id="calc-tabs"></div>
        <div id="calc-panes"></div>
    `;
}

export function init() {
    const tabsContainer = document.getElementById('calc-tabs');
    const panesContainer = document.getElementById('calc-panes');
    const btnAdd = document.getElementById('btn-add-calc');
    const btnClearAll = document.getElementById('btn-clear-all');
    
    const STORAGE_KEY = 'aio_multi_calc_v1';
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
                history: calc.history,
                isHistoryShow: calc.DOM.historyBox.classList.contains('show')
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
        document.querySelectorAll('.calc-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        const targetTab = document.querySelector(`.calc-tab[data-target="${targetId}"]`);
        const targetPane = document.getElementById(targetId);
        
        if (targetTab && targetPane) {
            targetTab.classList.add('active');
            targetPane.classList.add('active');
            targetTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            currentActiveTabId = targetId;
            saveState(); // Lưu tab đang active
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
            
            this.render(initialState.isHistoryShow || false);
            this.bindEvents();
            this.updateDisplay();
            this.renderHistory();
        }

        render(isHistoryShow) {
            // Render Tab
            const tabBtn = document.createElement('button');
            tabBtn.className = 'calc-tab';
            tabBtn.dataset.target = this.id;
            tabBtn.innerHTML = `
                <span class="tab-name">${this.title}</span>
                <span class="calc-tab-close" title="Đóng tab"><i class="fas fa-times"></i></span>
            `;
            tabsContainer.appendChild(tabBtn);

            // Render Pane
            const pane = document.createElement('div');
            pane.className = 'tab-pane';
            pane.id = this.id;
            
            pane.innerHTML = `
                <div class="calc-widget">
                    <div class="flex-between" style="margin-bottom: 12px;">
                        <input type="text" class="input calc-rename" value="${this.title}" style="max-width: 160px; padding: 4px 8px; font-weight: 600; font-size: 0.95rem; border: none; background: transparent;" placeholder="Tên tab...">
                        <button class="btn btn-sm btn-toggle-hist ${isHistoryShow ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 8px;"><i class="fas fa-history"></i></button>
                    </div>
                    
                    <div class="calc-display">
                        <div style="position: absolute; top: 8px; left: 8px;">
                            <button class="btn btn-ghost btn-sm btn-copy" title="Sao chép" style="padding: 2px 6px; font-size: 0.75rem; color: #10b981;">
                                <i class="fas fa-copy"></i> 
                            </button>
                        </div>
                        <div class="calc-expr"></div>
                        <div class="calc-result">0</div>
                    </div>
                    
                    <div class="calc-grid">
                        <button class="calc-btn act-clear">C</button>
                        <button class="calc-btn act-del"><i class="fas fa-backspace"></i></button>
                        <button class="calc-btn op" data-op="%">%</button>
                        <button class="calc-btn op" data-op="/">÷</button>

                        <button class="calc-btn num" data-num="7">7</button>
                        <button class="calc-btn num" data-num="8">8</button>
                        <button class="calc-btn num" data-num="9">9</button>
                        <button class="calc-btn op" data-op="*">×</button>

                        <button class="calc-btn num" data-num="4">4</button>
                        <button class="calc-btn num" data-num="5">5</button>
                        <button class="calc-btn num" data-num="6">6</button>
                        <button class="calc-btn op" data-op="-">−</button>

                        <button class="calc-btn num" data-num="1">1</button>
                        <button class="calc-btn num" data-num="2">2</button>
                        <button class="calc-btn num" data-num="3">3</button>
                        <button class="calc-btn op" data-op="+">+</button>

                        <button class="calc-btn num zero" data-num="0">0</button>
                        <button class="calc-btn num" data-num=".">.</button>
                        <button class="calc-btn op-eq">=</button>
                    </div>
                    
                    <div class="calc-history ${isHistoryShow ? 'show' : ''}">
                        <div class="text-mut" style="text-align:center; font-size: 0.8rem; padding: 10px 0;">Chưa có lịch sử.</div>
                    </div>
                </div>
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
                historyBox: pane.querySelector('.calc-history'),
                btnToggleHist: pane.querySelector('.btn-toggle-hist'),
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
            this.DOM.renameInput.addEventListener('focus', (e) => { e.target.style.background = 'var(--bg-sec)'; });
            this.DOM.renameInput.addEventListener('blur', (e) => { e.target.style.background = 'transparent'; });

            this.DOM.btnToggleHist.onclick = () => {
                this.DOM.historyBox.classList.toggle('show');
                this.DOM.btnToggleHist.classList.toggle('btn-primary');
                this.DOM.btnToggleHist.classList.toggle('btn-outline');
                saveState();
            };

            this.DOM.btnCopy.onclick = async () => {
                if (this.currentValue === 'Lỗi') return UI.showAlert('Lỗi', 'Không thể chép dữ liệu lỗi.', 'warning');
                try {
                    await navigator.clipboard.writeText(this.currentValue);
                    UI.showAlert('Đã chép', `Giá trị: ${this.currentValue}`, 'success');
                } catch (err) {}
            };

            this.DOM.pane.querySelectorAll('.num').forEach(btn => btn.onclick = () => this.inputNumber(btn.dataset.num));
            this.DOM.pane.querySelectorAll('.op').forEach(btn => btn.onclick = () => this.inputOperator(btn.dataset.op));

            this.DOM.pane.querySelector('.act-clear').onclick = () => this.clearAll();
            this.DOM.pane.querySelector('.act-del').onclick = () => this.deleteChar();
            this.DOM.pane.querySelector('.op-eq').onclick = () => this.calculate();
            
            this.DOM.historyBox.addEventListener('click', async (e) => {
                const item = e.target.closest('.history-item');
                if (item) {
                    try {
                        await navigator.clipboard.writeText(item.dataset.val);
                        UI.showAlert('Đã chép lịch sử', `Kết quả: ${item.dataset.val}`, 'success');
                    } catch (err) { }
                }
            });
        }

        updateDisplay() {
            const formatNumber = (numStr) => {
                if(numStr === 'Lỗi') return numStr;
                const parts = String(numStr).split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join('.');
            };

            this.DOM.res.textContent = formatNumber(this.currentValue);
            
            if (this.operator != null) {
                const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
                this.DOM.expr.textContent = `${formatNumber(this.previousValue)} ${opMap[this.operator]}`;
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
                const exprString = `${this.previousValue} ${opMap[this.operator]} ${this.currentValue}`;
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
            if (this.history.length > 20) this.history.pop(); 
            this.renderHistory();
        }

        renderHistory() {
            if (this.history.length === 0) return;
            let html = '';
            this.history.forEach(item => {
                const formatRes = String(item.res).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                html += `
                    <div class="history-item" data-val="${item.res}" title="Nhấn để copy: ${item.res}">
                        <div class="history-expr">${item.expr} =</div>
                        <div class="history-res">${formatRes}</div>
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

    // Khôi phục từ LocalStorage
    const savedState = loadState();
    if (savedState && savedState.items && savedState.items.length > 0) {
        calcCounter = savedState.calcCounter || 0;
        savedState.items.forEach(item => createNewCalculator(item));
        
        // Active lại tab trước đó
        if (savedState.activeTabId && calculators.has(savedState.activeTabId)) {
            switchTab(savedState.activeTabId);
        } else {
            switchTab(savedState.items[0].id);
        }
    } else {
        // Mặc định lần đầu
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
        UI.showConfirm('Đóng tất cả máy tính?', 'Toàn bộ dữ liệu và lịch sử tính toán sẽ bị xóa hoàn toàn khỏi thiết bị.', () => {
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