// asset/calculator.js
(function () {
    const multiCalculator = document.getElementById('multi-calculator');
    if (!multiCalculator) return;

    const tabsBar = multiCalculator.querySelector('#tabs-bar');
    const addCalculatorBtn = multiCalculator.querySelector('#add-calculator-btn');
    const calculatorContainer = multiCalculator.querySelector('#calculator-container');
    const calculatorTemplate = document.getElementById('calculator-template');
    
    if (!tabsBar || !addCalculatorBtn || !calculatorContainer || !calculatorTemplate) {
        console.error("Lỗi: Thiếu thành phần HTML.");
        return;
    }

    let calculatorIdCounter = 0;
    let pressTimer = null;

    const backspaceIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" style="pointer-events: none;"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.53.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.17 11.59L17.59 16 15 13.41 12.41 16 11 14.59 13.59 12 11 9.41 12.41 8 15 10.59 17.59 8 19 9.41 16.41 12l2.59 2.59z"/></svg>`;
    const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

    const updateUIAfterStateChange = (calculator) => {
        if (!calculator) return;
        const display = calculator.querySelector('.calculator-display');
        const clearButton = calculator.querySelector('[data-action="clear-backspace"]');
        const copyButton = calculator.querySelector('.btn-copy');

        if (!display) return;
        const isResult = display.dataset.isResult === 'true';
        const isEmpty = display.value === '';

        if(clearButton) clearButton.innerHTML = (isResult || isEmpty) ? 'C' : backspaceIcon;
        if (copyButton) copyButton.style.display = (isResult && !isEmpty && display.value !== 'Lỗi') ? 'flex' : 'none';
    };

    const switchToTab = (tabId) => {
        multiCalculator.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        multiCalculator.querySelectorAll('.calculator').forEach(calc => calc.classList.remove('active'));

        const tabButton = multiCalculator.querySelector(`.tab-btn[data-target="${tabId}"]`);
        const calculatorPanel = multiCalculator.querySelector(`#${tabId}`);

        if (tabButton) tabButton.classList.add('active');
        if (calculatorPanel) {
            calculatorPanel.classList.add('active');
            updateUIAfterStateChange(calculatorPanel);
        }
    };

    const addToHistory = (calculator, expression, result) => {
        const historyList = calculator.querySelector('.history-list');
        if (!historyList) return;
        if (historyList.children.length >= 20) historyList.lastElementChild.remove();

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<div class="history-expression">${expression}</div><div class="history-result">${result}</div>`;
        
        item.addEventListener('click', () => {
            const display = calculator.querySelector('.calculator-display');
            display.value = result;
            display.dataset.isResult = 'true';
            updateUIAfterStateChange(calculator);
        });
        historyList.prepend(item);
    };

    const addCalculator = () => {
        calculatorIdCounter++;
        const newTabId = `calc-${calculatorIdCounter}`;

        const tabButton = document.createElement('button');
        tabButton.className = 'tab-btn';
        tabButton.dataset.target = newTabId;
        tabButton.textContent = `Máy tính ${calculatorIdCounter}`;
        tabsBar.insertBefore(tabButton, addCalculatorBtn);

        const calculatorNode = calculatorTemplate.content.cloneNode(true);
        const calculatorElement = calculatorNode.querySelector('.calculator');
        calculatorElement.id = newTabId;
        
        const copyButton = calculatorElement.querySelector('.btn-copy');
        if(copyButton) copyButton.innerHTML = copyIcon;

        calculatorContainer.appendChild(calculatorNode);

        const titleInput = calculatorElement.querySelector('.calculator-title');
        titleInput.value = `Máy tính ${calculatorIdCounter}`;
        titleInput.addEventListener('input', () => {
            tabButton.textContent = titleInput.value.trim() || `Máy tính ${calculatorIdCounter}`;
        });

        switchToTab(newTabId);
    };

    const performCalculation = (calculator) => {
        const display = calculator.querySelector('.calculator-display');
        let expression = display.value;
        if (expression === '' || expression === 'Lỗi') return;

        const originalExpression = expression;
        try {
            expression = expression.replace(/(\d+\.?\d*)\s*([+\-*/])\s*(\d+\.?\d*)%/g, (match, base, op, perc) => {
                const baseVal = parseFloat(base);
                const percVal = parseFloat(perc);
                if (op === '+' || op === '-') return baseVal + (baseVal * (percVal / 100) * (op === '+' ? 1 : -1));
                return baseVal * (percVal / 100);
            });
            expression = expression.replace(/(\d+\.?\d*)%/g, (match, perc) => parseFloat(perc) / 100);

            const result = new Function('return ' + expression.replace(/[^-()\d/*+.]/g, ''))();
            if (!isFinite(result)) throw new Error("Infinite");

            const finalResult = parseFloat(result.toPrecision(12));
            display.value = finalResult;
            display.dataset.isResult = 'true';
            addToHistory(calculator, originalExpression, finalResult);

        } catch (error) {
            display.value = 'Lỗi';
            display.dataset.isResult = 'false';
        }
        updateUIAfterStateChange(calculator);
    };

    // --- Event Listeners ---
    tabsBar.addEventListener('click', (event) => {
        if (event.target.id === 'add-calculator-btn') addCalculator();
        if (event.target.classList.contains('tab-btn')) switchToTab(event.target.dataset.target);
    });

    calculatorContainer.addEventListener('click', (event) => {
        const calculator = event.target.closest('.calculator');
        if (!calculator) return;
        const display = calculator.querySelector('.calculator-display');

        if (event.target.closest('.btn-delete')) {
            const tabId = calculator.id;
            const tabButton = multiCalculator.querySelector(`.tab-btn[data-target="${tabId}"]`);
            if (!tabButton) return;
            const nextTab = tabButton.nextElementSibling?.classList.contains('tab-btn') ? tabButton.nextElementSibling : tabButton.previousElementSibling;
            calculator.remove(); tabButton.remove();
            if (nextTab) switchToTab(nextTab.dataset.target);
            else if (tabsBar.querySelector('.tab-btn')) switchToTab(tabsBar.querySelector('.tab-btn').dataset.target);
            else addCalculator();
            return;
        }

        if (event.target.closest('.btn-copy')) {
            const btn = event.target.closest('.btn-copy');
            navigator.clipboard.writeText(display.value).then(() => {
                btn.innerHTML = checkIcon;
                btn.style.color = 'var(--success-text)';
                setTimeout(() => { btn.innerHTML = copyIcon; btn.style.color = ''; }, 1500);
            });
            return;
        }

        if (event.target.closest('.btn-history')) {
            const historyPanel = calculator.querySelector('.history-container');
            const btn = event.target.closest('.btn-history');
            if (historyPanel.style.display === 'none') {
                historyPanel.style.display = 'block';
                btn.classList.add('active');
            } else {
                historyPanel.style.display = 'none';
                btn.classList.remove('active');
            }
            return;
        }

        if (event.target.closest('.btn-clear-history')) {
             calculator.querySelector('.history-list').innerHTML = '';
             return;
        }

        const button = event.target.closest('.calculator-buttons button');
        if (button && button.dataset.action !== 'clear-backspace') {
            const action = button.dataset.action;
            if (display.dataset.isResult === 'true' && action !== 'calculate') {
                if (['+', '-', '*', '/'].includes(button.textContent)) display.dataset.isResult = 'false';
                else { display.value = ''; display.dataset.isResult = 'false'; }
            }
            if (display.value === 'Lỗi') display.value = '';
            if (action === 'append' || action === 'percentage') display.value += button.textContent;
            else if (action === 'calculate') performCalculation(calculator);
            updateUIAfterStateChange(calculator);
        }
    });

    const handleClearPress = (button) => {
        const calculator = button.closest('.calculator');
        pressTimer = setTimeout(() => {
            const display = calculator.querySelector('.calculator-display');
            display.value = ''; display.dataset.isResult = 'false';
            updateUIAfterStateChange(calculator); pressTimer = null;
        }, 500);
    };

    const handleClearRelease = (button) => {
        if (!pressTimer) return;
        clearTimeout(pressTimer); pressTimer = null;
        const calculator = button.closest('.calculator');
        const display = calculator.querySelector('.calculator-display');
        if (display.dataset.isResult === 'true') display.value = '';
        else display.value = display.value.slice(0, -1);
        display.dataset.isResult = 'false';
        updateUIAfterStateChange(calculator);
    };

    calculatorContainer.addEventListener('mousedown', e => { if(e.target.dataset.action === 'clear-backspace') handleClearPress(e.target); });
    calculatorContainer.addEventListener('mouseup', e => { if(e.target.dataset.action === 'clear-backspace') handleClearRelease(e.target); });
    calculatorContainer.addEventListener('touchstart', e => { if(e.target.dataset.action === 'clear-backspace') { e.preventDefault(); handleClearPress(e.target); } }, {passive: false});
    calculatorContainer.addEventListener('touchend', e => { if(e.target.dataset.action === 'clear-backspace') handleClearRelease(e.target); });

    calculatorContainer.addEventListener('input', (event) => {
        if (event.target.matches('.calculator-display')) {
            const calc = event.target.closest('.calculator');
            event.target.value = event.target.value.replace(/[^-0-9/*+%.()]/g, '');
            event.target.dataset.isResult = 'false';
            updateUIAfterStateChange(calc);
        }
    });

    calculatorContainer.addEventListener('keydown', (event) => {
        if (event.target.matches('.calculator-display') && event.key === 'Enter') {
            event.preventDefault(); performCalculation(event.target.closest('.calculator'));
        }
    });

    addCalculator();
})();