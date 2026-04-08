window.renderSkeletonGrid = (count = 12) => {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="flex flex-col p-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 animate-pulse">
                <div class="w-full aspect-square rounded-lg bg-slate-200 dark:bg-slate-700/80 mb-2"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700/80 rounded w-2/3 mx-auto mt-1"></div>
            </div>
        `;
    }
    // Bọc trong grid chuẩn của Tướng/Đồ
    return `<div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 w-full">${html}</div>`;
};
window.escapeJS = (str) => str ? str.replace(/'/g, "\\'") : '';
window.escapeHTML = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
};

window.debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};