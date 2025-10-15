// asset/percentage-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const percentageTool = document.getElementById('percentage-calculator');
    if (!percentageTool) return;

    // --- Helper function to format numbers ---
    const formatResult = (value) => {
        if (isNaN(value) || !isFinite(value)) return '...';
        // Tự động hiển thị số lẻ nếu cần, tối đa 12 chữ số có nghĩa
        return parseFloat(value.toPrecision(12));
    };

    // --- Tab 1: What is x% of y? ---
    const p1_percent = document.getElementById('p1-percent');
    const p1_value = document.getElementById('p1-value');
    const p1_result = document.getElementById('p1-result');
    function calculateP1() {
        const percent = parseFloat(p1_percent.value);
        const value = parseFloat(p1_value.value);
        if (isNaN(percent) || isNaN(value)) {
            p1_result.textContent = '...'; return;
        }
        const result = (percent / 100) * value;
        p1_result.textContent = formatResult(result);
    }
    [p1_percent, p1_value].forEach(el => el.addEventListener('input', calculateP1));

    // --- Tab 2: x is what % of y? ---
    const p2_value1 = document.getElementById('p2-value1');
    const p2_value2 = document.getElementById('p2-value2');
    const p2_result = document.getElementById('p2-result');
    function calculateP2() {
        const val1 = parseFloat(p2_value1.value);
        const val2 = parseFloat(p2_value2.value);
        if (isNaN(val1) || isNaN(val2) || val2 === 0) {
            p2_result.textContent = '...'; return;
        }
        const result = (val1 / val2) * 100;
        p2_result.textContent = formatResult(result);
    }
    [p2_value1, p2_value2].forEach(el => el.addEventListener('input', calculateP2));

    // --- Tab 3: Percentage change from x to y ---
    const p3_from = document.getElementById('p3-from');
    const p3_to = document.getElementById('p3-to');
    const p3_result = document.getElementById('p3-result');
    function calculateP3() {
        const from = parseFloat(p3_from.value);
        const to = parseFloat(p3_to.value);
        if (isNaN(from) || isNaN(to) || from === 0) {
            p3_result.textContent = '...'; return;
        }
        const result = ((to - from) / from) * 100;
        p3_result.textContent = formatResult(result);
    }
    [p3_from, p3_to].forEach(el => el.addEventListener('input', calculateP3));

    // --- Tab 4: Increase/Decrease by x% ---
    const p4_operation = document.getElementById('p4-operation');
    const p4_value = document.getElementById('p4-value');
    const p4_percent = document.getElementById('p4-percent');
    const p4_result = document.getElementById('p4-result');
    function calculateP4() {
        const operation = p4_operation.value;
        const value = parseFloat(p4_value.value);
        const percent = parseFloat(p4_percent.value);
        if (isNaN(value) || isNaN(percent)) {
            p4_result.textContent = '...'; return;
        }
        let result;
        if (operation === 'increase') {
            result = value * (1 + percent / 100);
        } else {
            result = value * (1 - percent / 100);
        }
        p4_result.textContent = formatResult(result);
    }
    [p4_operation, p4_value, p4_percent].forEach(el => el.addEventListener('input', calculateP4));

    // Initialize tab switching for this tool
    const container = document.querySelector('#percentage-calculator');
    if(container) {
        // We reuse the generic tab initializer from main.js if it exists
        if (typeof initializeTabs === 'function') {
            initializeTabs(container);
        } else { // Fallback just in case
            const tabLinks = container.querySelectorAll('.tab-link');
            const tabPanels = container.querySelectorAll('.tab-panel');
            tabLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const targetId = link.getAttribute('data-tab');
                    tabLinks.forEach(t => t.classList.remove('active'));
                    link.classList.add('active');
                    tabPanels.forEach(panel => {
                        panel.classList.toggle('active', panel.id === targetId);
                    });
                });
            });
        }
    }
});