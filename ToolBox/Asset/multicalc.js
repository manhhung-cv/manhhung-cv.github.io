
// Đặt toàn bộ script trong một hàm IIFE để tránh xung đột biến toàn cục
(function () {
    // Chỉ thực thi nếu thành phần calculator tồn tại
    const multiCalculator = document.getElementById('multi-calculator');
    if (!multiCalculator) return;

    const tabsBar = multiCalculator.querySelector('#tabs-bar');
    const addCalculatorBtn = multiCalculator.querySelector('#add-calculator-btn');
    const calculatorContainer = multiCalculator.querySelector('#calculator-container');
    const calculatorTemplate = multiCalculator.querySelector('#calculator-template');
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

        if (!display || !clearButton || !copyButton) return;

        const isResult = display.dataset.isResult === 'true';
        const isEmpty = display.value === '';

        if (isResult || isEmpty) {
            clearButton.innerHTML = 'C';
        } else {
            clearButton.innerHTML = backspaceIcon;
        }

        if (isResult && !isEmpty && display.value !== 'Lỗi') {
            copyButton.style.display = 'flex';
        } else {
            copyButton.style.display = 'none';
        }
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
        calculatorContainer.appendChild(calculatorNode);

        const titleInput = calculatorElement.querySelector('.calculator-title');
        titleInput.value = `Máy tính ${calculatorIdCounter}`;
        titleInput.addEventListener('input', () => {
            tabButton.textContent = titleInput.value.trim() || `Máy tính ${calculatorIdCounter}`;
        });

        switchToTab(newTabId);
    };

    if (tabsBar && addCalculatorBtn && calculatorContainer && calculatorTemplate) {
        addCalculator();

        tabsBar.addEventListener('click', (event) => {
            if (event.target.id === 'add-calculator-btn') {
                addCalculator();
            }
            if (event.target.classList.contains('tab-btn')) {
                switchToTab(event.target.dataset.target);
            }
        });

        const handleClearPress = (button) => {
            const calculator = button.closest('.calculator');
            if (!calculator) return;

            pressTimer = setTimeout(() => {
                const display = calculator.querySelector('.calculator-display');
                display.value = '';
                display.dataset.isResult = 'false';
                updateUIAfterStateChange(calculator);
                pressTimer = null;
            }, 500);
        };

        const handleClearRelease = (button) => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;

                const calculator = button.closest('.calculator');
                if (!calculator) return;
                const display = calculator.querySelector('.calculator-display');

                if (display.dataset.isResult === 'true') {
                    display.value = '';
                } else {
                    display.value = display.value.slice(0, -1);
                }
                display.dataset.isResult = 'false';
                updateUIAfterStateChange(calculator);
            }
        };

        ['mousedown', 'touchstart'].forEach(evt => {
            calculatorContainer.addEventListener(evt, (event) => {
                const button = event.target.closest('[data-action="clear-backspace"]');
                if (button) {
                    if (evt === 'touchstart') event.preventDefault();
                    handleClearPress(button);
                }
            }, { passive: false });
        });

        ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
            calculatorContainer.addEventListener(evt, (event) => {
                if (pressTimer) {
                    const button = event.target.closest('[data-action="clear-backspace"]');
                    if (evt === 'mouseup' || evt === 'touchend') {
                        if (button) handleClearRelease(button);
                    } else {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                }
            });
        });

        const performCalculation = (calculator) => {
            const display = calculator.querySelector('.calculator-display');
            let expression = display.value;
            if (expression === '' || expression === 'Lỗi') return;

            try {
                expression = expression.replace(/(\d+\.?\d*)\s*([+\-*/])\s*(\d+\.?\d*)%/g, (match, base, op, perc) => {
                    const baseVal = parseFloat(base);
                    const percVal = parseFloat(perc);
                    if (op === '+' || op === '-') {
                        return baseVal + (baseVal * (percVal / 100) * (op === '+' ? 1 : -1));
                    } else {
                        return baseVal * (percVal / 100);
                    }
                });
                expression = expression.replace(/(\d+\.?\d*)%/g, (match, perc) => {
                    return parseFloat(perc) / 100;
                });

                const result = new Function('return ' + expression.replace(/[^-()\d/*+.]/g, ''))();
                if (result === Infinity || isNaN(result)) {
                    display.value = 'Lỗi';
                    display.dataset.isResult = 'false';
                } else {
                    display.value = Math.round(result * 1e12) / 1e12;
                    display.dataset.isResult = 'true';
                }
            } catch (error) {
                display.value = 'Lỗi';
                display.dataset.isResult = 'false';
            }
            updateUIAfterStateChange(calculator);
        };

        calculatorContainer.addEventListener('click', (event) => {
            const calculator = event.target.closest('.calculator');
            if (!calculator) return;

            if (event.target.closest('.btn-delete')) {
                const tabId = calculator.id;
                const tabButton = multiCalculator.querySelector(`.tab-btn[data-target="${tabId}"]`);
                const nextTab = tabButton.nextElementSibling.classList.contains('tab-btn') ? tabButton.nextElementSibling : tabButton.previousElementSibling;

                calculator.remove();
                tabButton.remove();

                if (nextTab) {
                    switchToTab(nextTab.dataset.target);
                } else if (tabsBar.querySelector('.tab-btn')) {
                    switchToTab(tabsBar.querySelector('.tab-btn').dataset.target);
                }
                return;
            }

            if (event.target.closest('.btn-copy')) {
                const copyButton = event.target.closest('.btn-copy');
                const display = calculator.querySelector('.calculator-display');
                const valueToCopy = display.value;

                const textArea = document.createElement('textarea');
                textArea.value = valueToCopy;
                textArea.style.position = 'absolute';
                textArea.style.left = '-9999px';
                textArea.setAttribute('readonly', '');

                document.body.appendChild(textArea);
                textArea.select();

                try {
                    document.execCommand('copy');
                    copyButton.innerHTML = checkIcon;
                    copyButton.style.color = '#4CAF50';

                    setTimeout(() => {
                        copyButton.innerHTML = copyIcon;
                        copyButton.style.color = '';
                    }, 1500);
                } catch (err) {
                    console.error('Không thể sao chép kết quả:', err);
                }

                document.body.removeChild(textArea);
                return;
            }

            const button = event.target.closest('.calculator-buttons button');
            if (button && button.dataset.action !== 'clear-backspace') {
                const display = calculator.querySelector('.calculator-display');
                const action = button.dataset.action;
                const buttonContent = button.textContent;

                switch (action) {
                    case 'append':
                        if (display.dataset.isResult === 'true' || display.value === 'Lỗi') {
                            display.value = '';
                            display.dataset.isResult = 'false';
                        }
                        display.value += buttonContent;
                        break;

                    case 'percentage':
                        if (display.dataset.isResult === 'true' || display.value === 'Lỗi') {
                            display.value = '';
                            display.dataset.isResult = 'false';
                        }
                        display.value += '%';
                        break;

                    case 'calculate':
                        performCalculation(calculator);
                        break;
                }
                updateUIAfterStateChange(calculator);
            }
        });

        calculatorContainer.addEventListener('input', (event) => {
            if (event.target.matches('.calculator-display')) {
                const calculator = event.target.closest('.calculator');
                const display = event.target;

                display.value = display.value.replace(/[^-0-9/*+%.]/g, '');

                display.dataset.isResult = 'false';
                updateUIAfterStateChange(calculator);
            }
        });

        calculatorContainer.addEventListener('keydown', (event) => {
            if (event.target.matches('.calculator-display') && event.key === 'Enter') {
                event.preventDefault();
                const calculator = event.target.closest('.calculator');
                performCalculation(calculator);
            }
        });
    }
})();