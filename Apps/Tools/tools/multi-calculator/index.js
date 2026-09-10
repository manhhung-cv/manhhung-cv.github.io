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
// 2. TEMPLATE RENDERER (AVOID DYNAMIC ISLAND & PREMIUM UI)
// =============================================================================
export function template() {
    return `
    <div id="multi-calc-root" class="w-full h-full bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200 select-none flex flex-col">
        
        <style>
            #multi-calc-root {
                --kit-accent: #10b981;
                /* Xử lý an toàn tránh Dynamic Island / Notch / Bottom Bar */
                padding-top: env(safe-area-inset-top, 0px);
                padding-bottom: env(safe-area-inset-bottom, 0px);
                padding-left: env(safe-area-inset-left, 0px);
                padding-right: env(safe-area-inset-right, 0px);
            }
            .bg-accent-theme { background-color: var(--kit-accent) !important; }
            .text-accent-theme { color: var(--kit-accent) !important; }
            .border-accent-theme { border-color: var(--kit-accent) !important; }
            
            /* Responsive Keypad Buttons */
            .calc-btn-base {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                border-radius: 18px;
                font-size: clamp(1.2rem, 4.5vw, 1.5rem);
                font-weight: 600;
                user-select: none;
                transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
                -webkit-tap-highlight-color: transparent;
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            }
            .calc-btn-base:active, .calc-btn-base.key-pressed {
                transform: scale(0.93);
                filter: brightness(0.88);
            }
            .dark .calc-btn-base:active, .dark .calc-btn-base.key-pressed {
                filter: brightness(1.25);
            }

            /* Custom Scrollbar */
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>

        <!-- CONTAINER WRAPPER -->
        <div class="w-full h-full flex flex-col max-w-5xl mx-auto p-2 sm:p-4 md:p-6 gap-2 sm:gap-3">
            
            <!-- TOP APP BAR (Dời xuống nhẹ tránh đè Notch/Island) -->
            <header class="px-2 pt-2 sm:pt-0 flex items-center justify-between gap-3 shrink-0">
                <div class="flex items-center gap-2.5">
                    <div class="w-3 h-3 rounded-full bg-accent-theme shadow-sm ring-4 ring-accent-theme/20"></div>
                    <div>
                        <h1 class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Máy Tính Đa Tab</h1>
                    </div>
                    <span class="hidden lg:inline-block text-[10px] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/60 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">Numpad Active</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <button id="btn-add-calc" class="h-9 px-3.5 rounded-xl bg-accent-theme hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-accent-theme/20">
                        <i class="fas fa-plus text-[11px]"></i> <span>Thêm Tab</span>
                    </button>
                    <button id="btn-clear-all" class="w-9 h-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/5 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center active:scale-95 transition-all" title="Xóa tất cả">
                        <i class="far fa-trash-can text-xs"></i>
                    </button>
                </div>
            </header>

            <!-- TABS SCROLLER -->
            <div class="px-1 shrink-0">
                <div class="p-1 rounded-2xl bg-zinc-200/50 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5">
                    <div class="flex gap-1.5 overflow-x-auto no-scrollbar" id="calc-tabs"></div>
                </div>
            </div>

            <!-- WORKSPACE AREA -->
            <main id="calc-panes" class="flex-1 w-full min-h-0 overflow-hidden relative"></main>

        </div>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS, KEYBOARD ENGINE & DATA STORE
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#multi-calc-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);

    const tabsContainer = _('#calc-tabs');
    const panesContainer = _('#calc-panes');
    const btnAdd = _('#btn-add-calc');
    const btnClearAll = _('#btn-clear-all');

    const STORAGE_KEY = 'aio_multi_calc_v9';
    let calcCounter = 0;
    const calculators = new Map();
    let currentActiveTabId = null;

    const activeTabClass = 'calc-tab active py-1.5 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10 transition-all whitespace-nowrap shrink-0 flex items-center justify-between gap-2.5 cursor-pointer';
    const inactiveTabClass = 'calc-tab py-1.5 px-3.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all whitespace-nowrap shrink-0 flex items-center justify-between gap-2.5 cursor-pointer';

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

    const switchTab = (targetId) => {
        hostElement.querySelectorAll('.calc-tab').forEach(tab => {
            tab.className = inactiveTabClass;
        });
        hostElement.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('flex');
            pane.classList.add('hidden');
        });
        
        const targetTab = hostElement.querySelector(`.calc-tab[data-target="${targetId}"]`);
        const targetPane = hostElement.querySelector(`#${targetId}`);
        
        if (targetTab && targetPane) {
            targetTab.className = activeTabClass;
            targetPane.classList.remove('hidden');
            targetPane.classList.add('flex');
            targetTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            
            currentActiveTabId = targetId;
            saveState(); 
        }
    };

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
            const tabBtn = document.createElement('button');
            tabBtn.type = 'button';
            tabBtn.className = inactiveTabClass;
            tabBtn.dataset.target = this.id;
            tabBtn.innerHTML = `
                <span class="tab-name truncate max-w-[90px] sm:max-w-[130px]">${this.title}</span>
                <span class="calc-tab-close opacity-40 hover:opacity-100 hover:text-rose-500 transition-colors w-4 h-4 flex items-center justify-center rounded-full"><i class="fas fa-xmark text-[10px]"></i></span>
            `;
            tabsContainer.appendChild(tabBtn);

            const pane = document.createElement('div');
            pane.className = 'tab-pane hidden w-full h-full flex-col md:grid md:grid-cols-12 md:gap-4 animate-in fade-in duration-150 relative';
            pane.id = this.id;
            
            pane.innerHTML = `
                <!-- MAIN CALCULATOR APP -->
                <div class="w-full h-full md:col-span-7 lg:col-span-8 flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 overflow-hidden p-3 sm:p-4 gap-3">
                    
                    <!-- TAB BAR MINI RENAME & ACTIONS -->
                    <div class="flex justify-between items-center px-1 pb-2 border-b border-black/5 dark:border-white/5 shrink-0">
                        <div class="flex items-center gap-2">
                            <i class="far fa-pen-to-square text-[11px] text-zinc-400"></i>
                            <input type="text" class="calc-rename text-xs font-bold tracking-wide bg-transparent border-b border-transparent focus:border-accent-theme outline-none text-zinc-600 dark:text-zinc-300 focus:text-zinc-900 dark:focus:text-white transition-colors w-32 p-0 select-text" value="${this.title}" placeholder="Tên tab...">
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button class="btn-copy text-zinc-400 hover:text-accent-theme text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1">
                                <i class="far fa-copy text-[10px]"></i> <span>Chép</span>
                            </button>
                            <button class="btn-toggle-hist md:hidden text-zinc-400 hover:text-accent-theme w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center active:scale-95 transition-all" title="Lịch sử">
                                <i class="fas fa-clock-rotate-left text-xs"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- DISPLAY AREA -->
                    <div class="flex-1 w-full px-3 py-2 text-right flex flex-col justify-end bg-zinc-50/80 dark:bg-zinc-950/50 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden min-h-[100px]">
                        <div class="calc-expr text-xs sm:text-sm font-mono text-zinc-400 min-h-[1.25rem] truncate"></div>
                        <div class="calc-result text-3xl sm:text-5xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight truncate">0</div>
                    </div>
                    
                    <!-- KEYPAD -->
                    <div class="grid grid-cols-4 gap-2 h-[52vh] min-h-[400px] max-h-[420px] md:h-auto md:max-h-none shrink-0">
                        <button class="calc-btn-base act-clear" data-val="clear">C</button>
                        <button class="calc-btn-base act-del" data-val="del"><i class="fas fa-delete-left text-base sm:text-lg"></i></button>
                        <button class="calc-btn-base op" data-val="%">%</button>
                        <button class="calc-btn-base op" data-val="/">÷</button>

                        <button class="calc-btn-base num" data-val="7">7</button>
                        <button class="calc-btn-base num" data-val="8">8</button>
                        <button class="calc-btn-base num" data-val="9">9</button>
                        <button class="calc-btn-base op" data-val="*">×</button>

                        <button class="calc-btn-base num" data-val="4">4</button>
                        <button class="calc-btn-base num" data-val="5">5</button>
                        <button class="calc-btn-base num" data-val="6">6</button>
                        <button class="calc-btn-base op" data-val="-">−</button>

                        <button class="calc-btn-base num" data-val="1">1</button>
                        <button class="calc-btn-base num" data-val="2">2</button>
                        <button class="calc-btn-base num" data-val="3">3</button>
                        <button class="calc-btn-base op" data-val="+">+</button>

                        <button class="calc-btn-base num col-span-2" data-val="0">0</button>
                        <button class="calc-btn-base num" data-val=".">,</button>
                        <button class="calc-btn-base op-eq" data-val="=">=</button>
                    </div>
                </div>

                <!-- LỊCH SỬ PHÉP TÍNH -->
                <div class="hist-panel fixed md:static inset-x-2 bottom-2 top-20 md:top-auto z-40 md:z-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl md:backdrop-blur-none md:col-span-5 lg:col-span-4 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl md:shadow-xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-[120%] md:translate-y-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto">
                    <div class="px-4 py-3 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/40">
                        <span class="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-clock-rotate-left text-accent-theme"></i> Lịch sử phép tính
                        </span>
                        <div class="flex items-center gap-1">
                            <button class="btn-clear-hist text-[11px] font-medium text-zinc-400 hover:text-rose-500 px-2 py-1 rounded-lg transition-colors">Xóa</button>
                            <button class="btn-close-hist md:hidden w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 flex items-center justify-center"><i class="fas fa-chevron-down text-xs"></i></button>
                        </div>
                    </div>
                    <div class="calc-history flex-1 overflow-y-auto no-scrollbar p-3 space-y-2"></div>
                </div>

                <style>
                    #${this.id} .num { 
                        background: #ffffff; 
                        color: #09090b; 
                        border: 1px solid rgba(0,0,0,0.06); 
                    }
                    .dark #${this.id} .num { 
                        background: #18181b; 
                        color: #ffffff; 
                        border-color: rgba(255,255,255,0.06); 
                    }
                    #${this.id} .op { 
                        background: #f4f4f5; 
                        color: #09090b; 
                        border: 1px solid rgba(0,0,0,0.05); 
                    }
                    .dark #${this.id} .op { 
                        background: #27272a; 
                        color: #ffffff; 
                        border-color: rgba(255,255,255,0.06); 
                    }
                    #${this.id} .op-eq { 
                        background: var(--kit-accent); 
                        color: #ffffff; 
                        border: 1px solid transparent; 
                        box-shadow: 0 4px 12px color-mix(in srgb, var(--kit-accent) 35%, transparent);
                    }
                    #${this.id} .act-clear, #${this.id} .act-del { 
                        background: rgba(244, 63, 94, 0.1); 
                        color: #f43f5e; 
                        border: 1px solid rgba(244, 63, 94, 0.2); 
                    }
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
                btnClearHist: pane.querySelector('.btn-clear-hist'),
                btnCopy: pane.querySelector('.btn-copy')
            };
        }

        bindEvents() {
            this.DOM.tabBtn.onclick = () => switchTab(this.id);
            this.DOM.tabCloseBtn.onclick = (e) => { 
                e.stopPropagation(); 
                this.destroy(); 
            };

            this.DOM.renameInput.addEventListener('input', (e) => {
                const newName = e.target.value.trim() || 'Máy tính';
                this.DOM.tabNameStr.textContent = newName;
                this.title = newName;
                saveState();
            });

            // Slide up panel lịch sử trên Mobile
            this.DOM.btnToggleHist.onclick = () => {
                this.DOM.histPanel.classList.remove('translate-y-[120%]', 'opacity-0', 'pointer-events-none');
                this.DOM.histPanel.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
            };
            this.DOM.btnCloseHist.onclick = () => {
                this.DOM.histPanel.classList.add('translate-y-[120%]', 'opacity-0', 'pointer-events-none');
                this.DOM.histPanel.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
            };
            this.DOM.btnClearHist.onclick = () => {
                this.history = [];
                this.renderHistory();
                saveState();
            };

            this.DOM.btnCopy.onclick = async () => {
                if (this.currentValue === 'Lỗi') {
                    IslandKit.notify('Cảnh báo', 'Giá trị lỗi không thể sao chép.', 'warning');
                    return;
                }
                try {
                    const formattedForCopy = String(this.currentValue).replace('.', ',');
                    await navigator.clipboard.writeText(formattedForCopy);
                    IslandKit.notify('Đã sao chép', formattedForCopy, 'success');
                } catch (err) {
                    IslandKit.notify('Lỗi sao chép', 'Trình duyệt chặn truy cập clipboard.', 'error');
                }
            };

            this.DOM.pane.querySelectorAll('.calc-btn-base').forEach(btn => {
                btn.onclick = () => {
                    const val = btn.dataset.val;
                    this.triggerAction(val);
                };
            });
            
            this.DOM.historyBox.addEventListener('click', async (e) => {
                const item = e.target.closest('.history-item');
                if (item) {
                    try {
                        const copyVal = String(item.dataset.val).replace('.', ',');
                        await navigator.clipboard.writeText(copyVal);
                        IslandKit.notify('Đã sao chép', copyVal, 'success');
                    } catch (err) {}
                }
            });
        }

        triggerAction(val) {
            if (!val) return;
            if ((val >= '0' && val <= '9') || val === '.') this.inputNumber(val);
            else if (['+', '-', '*', '/', '%'].includes(val)) this.inputOperator(val);
            else if (val === 'clear') this.clearAll();
            else if (val === 'del') this.deleteChar();
            else if (val === '=') this.calculate();

            const targetBtn = this.DOM.pane.querySelector(`[data-val="${val}"]`);
            if (targetBtn) {
                targetBtn.classList.add('key-pressed');
                setTimeout(() => targetBtn.classList.remove('key-pressed'), 90);
            }
        }

        formatNumberVN(numStr) {
            if (numStr === 'Lỗi') return numStr;
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
                this.DOM.historyBox.innerHTML = '<div class="text-zinc-400 text-center text-xs font-mono py-10">Chưa có phép tính nào được lưu.</div>';
                return;
            }
            let html = '';
            this.history.forEach(item => {
                const formatRes = this.formatNumberVN(item.res);
                html += `
                    <div class="history-item flex flex-col items-end p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 cursor-pointer hover:border-accent-theme active:scale-[0.98] transition-all" data-val="${item.res}" title="Nhấn để copy kết quả">
                        <div class="text-[10px] font-mono text-zinc-400 mb-0.5">${item.expr} =</div>
                        <div class="text-sm sm:text-base font-bold font-mono text-zinc-900 dark:text-white">${formatRes}</div>
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

    // =========================================================================
    // 4. LẮNG NGHE BÀN PHÍM VẬT LÝ & NUMPAD
    // =========================================================================
    const handleKeyDown = (e) => {
        if (e.target && e.target.classList.contains('calc-rename')) return;

        const activeCalc = calculators.get(currentActiveTabId);
        if (!activeCalc) return;

        let key = e.key;

        if (key >= '0' && key <= '9') {
            e.preventDefault();
            activeCalc.triggerAction(key);
        } else if (key === '.' || key === ',') {
            e.preventDefault();
            activeCalc.triggerAction('.');
        } else if (['+', '-', '*', '/', '%'].includes(key)) {
            e.preventDefault();
            activeCalc.triggerAction(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            activeCalc.triggerAction('=');
        } else if (key === 'Backspace') {
            e.preventDefault();
            activeCalc.triggerAction('del');
        } else if (key === 'Delete' || key === 'Escape') {
            e.preventDefault();
            activeCalc.triggerAction('clear');
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    // =========================================================================
    // 5. KHỞI CHẠY VÀ QUẢN LÝ TỔNG
    // =========================================================================
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

    btnAdd?.addEventListener('click', () => {
        const newId = createNewCalculator();
        switchTab(newId);
        IslandKit.notify('Đã thêm tab', `Tạo thêm phiên máy tính mới.`, 'info');
    });

    btnClearAll?.addEventListener('click', () => {
        if (calculators.size === 0) return;
        UI.showConfirm(
            'Xóa tất cả các tab?',
            'Toàn bộ các tab máy tính và lịch sử tính toán sẽ bị làm sạch.',
            () => {
                tabsContainer.innerHTML = '';
                panesContainer.innerHTML = '';
                calculators.clear();
                calcCounter = 0;
                localStorage.removeItem(STORAGE_KEY);
                const firstId = createNewCalculator();
                switchTab(firstId);
                IslandKit.notify('Đã làm mới', 'Toàn bộ máy tính đã được đặt lại.', 'success');
            }
        );
    });
}