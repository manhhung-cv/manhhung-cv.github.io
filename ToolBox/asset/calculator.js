// asset/calculator.js

// Đặt toàn bộ script trong một hàm IIFE để tránh xung đột biến toàn cục
(function () {
    // Chỉ thực thi nếu thành phần calculator tồn tại
    const multiCalculator = document.getElementById('multi-calculator');
    if (!multiCalculator) return;

    // Lấy các phần tử DOM một cách an toàn
    const tabsBar = multiCalculator.querySelector('#tabs-bar');
    const addCalculatorBtn = multiCalculator.querySelector('#add-calculator-btn');
    const calculatorContainer = multiCalculator.querySelector('#calculator-container');
    // SỬA LỖI: Tìm template ở cấp độ document thay vì bên trong multiCalculator
    const calculatorTemplate = document.getElementById('calculator-template'); 
    
    // Kiểm tra các phần tử thiết yếu trước khi chạy
    if (!tabsBar || !addCalculatorBtn || !calculatorContainer || !calculatorTemplate) {
        console.error("Lỗi: Một hoặc nhiều thành phần của máy tính không được tìm thấy! Vui lòng kiểm tra lại cấu trúc HTML.");
        return;
    }

    let calculatorIdCounter = 0;
    let pressTimer = null;

    // --- Các icon SVG ---
    const backspaceIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" style="pointer-events: none;"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.53.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.17 11.59L17.59 16 15 13.41 12.41 16 11 14.59 13.59 12 11 9.41 12.41 8 15 10.59 17.59 8 19 9.41 16.41 12l2.59 2.59z"/></svg>`;
    const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

    // --- Các hàm xử lý ---
    const updateUIAfterStateChange = (calculator) => {
        if (!calculator) return;
        const display = calculator.querySelector('.calculator-display');
        const clearButton = calculator.querySelector('[data-action="clear-backspace"]');
        const copyButton = calculator.querySelector('.btn-copy');

        if (!display || !clearButton || !copyButton) return;

        const isResult = display.dataset.isResult === 'true';
        const isEmpty = display.value === '';

        clearButton.innerHTML = (isResult || isEmpty) ? 'C' : backspaceIcon;
        
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
            expression = expression.replace(/(\d+\.?\d*)%/g, (match, perc) => parseFloat(perc) / 100);

            const result = new Function('return ' + expression.replace(/[^-()\d/*+.]/g, ''))();
            
            if (!isFinite(result)) {
                display.value = 'Lỗi';
                display.dataset.isResult = 'false';
            } else {
                display.value = parseFloat(result.toPrecision(12));
                display.dataset.isResult = 'true';
            }
        } catch (error) {
            display.value = 'Lỗi';
            display.dataset.isResult = 'false';
        }
        updateUIAfterStateChange(calculator);
    };


    // --- Gán các sự kiện ---
    tabsBar.addEventListener('click', (event) => {
        if (event.target.id === 'add-calculator-btn') {
            addCalculator();
        }
        if (event.target.classList.contains('tab-btn')) {
            switchToTab(event.target.dataset.target);
        }
    });

    calculatorContainer.addEventListener('click', (event) => {
        const calculator = event.target.closest('.calculator');
        if (!calculator) return;
        const display = calculator.querySelector('.calculator-display');

        if (event.target.closest('.btn-delete')) {
            const tabId = calculator.id;
            const tabButton = multiCalculator.querySelector(`.tab-btn[data-target="${tabId}"]`);
            if (!tabButton) return;
            
            const nextTab = tabButton.nextElementSibling && tabButton.nextElementSibling.classList.contains('tab-btn') 
                ? tabButton.nextElementSibling 
                : tabButton.previousElementSibling;

            calculator.remove();
            tabButton.remove();

            if (nextTab) {
                switchToTab(nextTab.dataset.target);
            } else if (tabsBar.querySelector('.tab-btn')) {
                switchToTab(tabsBar.querySelector('.tab-btn').dataset.target);
            } else {
                addCalculator();
            }
            return;
        }

        if (event.target.closest('.btn-copy')) {
            const copyButton = event.target.closest('.btn-copy');
            navigator.clipboard.writeText(display.value).then(() => {
                copyButton.innerHTML = checkIcon;
                copyButton.style.color = 'var(--success-text)';
                setTimeout(() => {
                    copyButton.innerHTML = copyIcon;
                    copyButton.style.color = '';
                }, 1500);
            }).catch(err => {
                console.error('Không thể sao chép kết quả:', err);
            });
            return;
        }

        const button = event.target.closest('.calculator-buttons button');
        if (button && button.dataset.action !== 'clear-backspace') {
            const action = button.dataset.action;

            if (display.dataset.isResult === 'true' && action !== 'calculate') {
                if (['+', '-', '*', '/'].includes(button.textContent)) {
                    display.dataset.isResult = 'false';
                } else {
                    display.value = '';
                    display.dataset.isResult = 'false';
                }
            }
             if (display.value === 'Lỗi') display.value = '';

            switch (action) {
                case 'append':
                case 'percentage':
                    display.value += button.textContent;
                    break;
                case 'calculate':
                    performCalculation(calculator);
                    break;
            }
            updateUIAfterStateChange(calculator);
        }
    });

    const handleClearPress = (button) => {
        const calculator = button.closest('.calculator');
        pressTimer = setTimeout(() => {
            const display = calculator.querySelector('.calculator-display');
            display.value = '';
            display.dataset.isResult = 'false';
            updateUIAfterStateChange(calculator);
            pressTimer = null;
        }, 500);
    };

    const handleClearRelease = (button) => {
        if (!pressTimer) return;
        clearTimeout(pressTimer);
        pressTimer = null;
        
        const calculator = button.closest('.calculator');
        const display = calculator.querySelector('.calculator-display');

        if (display.dataset.isResult === 'true') {
            display.value = '';
        } else {
            display.value = display.value.slice(0, -1);
        }
        display.dataset.isResult = 'false';
        updateUIAfterStateChange(calculator);
    };

    calculatorContainer.addEventListener('mousedown', (e) => {
        if (e.target.dataset.action === 'clear-backspace') handleClearPress(e.target);
    });
    calculatorContainer.addEventListener('mouseup', (e) => {
        if (e.target.dataset.action === 'clear-backspace') handleClearRelease(e.target);
    });
    calculatorContainer.addEventListener('touchstart', (e) => {
        if (e.target.dataset.action === 'clear-backspace') {
            e.preventDefault();
            handleClearPress(e.target);
        }
    }, { passive: false });
     calculatorContainer.addEventListener('touchend', (e) => {
        if (e.target.dataset.action === 'clear-backspace') handleClearRelease(e.target);
    });

    calculatorContainer.addEventListener('input', (event) => {
        if (event.target.matches('.calculator-display')) {
            const calculator = event.target.closest('.calculator');
            const display = event.target;
            display.value = display.value.replace(/[^-0-9/*+%.()]/g, '');
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

    // --- KHỞI TẠO ---
    addCalculator();
})();