// js/utils.js

export const debounce = (func, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

export const SafeMath = {
    round: (num) => Math.round(Number(num) * 100) / 100,
    add: (...args) => {
        const sum = args.reduce((acc, val) => acc + (Number(val) || 0) * 100, 0);
        return Math.round(sum) / 100;
    },
    subtract: (a, b) => Math.round((Number(a) * 100) - (Number(b) * 100)) / 100,
    multiply: (a, b) => Math.round((Number(a) * Number(b)) * 100) / 100,
    divide: (a, b) => Number(b) === 0 ? 0 : Math.round((Number(a) / Number(b)) * 100) / 100
};

export const getMoneyValue = (str) => {
    if (str === null || str === undefined || str === '') return 0;
    let s = String(str).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
    return parseFloat(s) || 0;
};

export const formatNumToVN = (num) => {
    const n = Number(num) || 0;
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

export const formatMoney = (amount, currency = 'đ') => {
    const formatted = formatNumToVN(amount);
    return currency === '$' ? `$${formatted}` : `${formatted} ${currency}`;
};

export const formatInputMoney = (e) => {
    let input = e.target;
    let val = input.value.replace(/[^0-9,\-]/g, '');
    const parts = val.split(',');
    if (parts.length > 2) val = parts[0] + ',' + parts.slice(1).join('');
    if (val === '' || val === '-') { input.value = val; return; }

    let isNegative = val.startsWith('-');
    if (isNegative) val = val.substring(1);

    let intPart = val.split(',')[0];
    let decPart = val.split(',').length > 1 ? ',' + val.split(',')[1] : '';

    if (intPart !== '') intPart = parseInt(intPart, 10).toLocaleString('vi-VN');
    input.value = (isNegative ? '-' : '') + intPart + decPart;
};

export const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().split('T')[0];
};

export const getMonthKey = () => document.getElementById('cycleMonthPicker').value || "default";