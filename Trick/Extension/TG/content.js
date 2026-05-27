const currencies = [
    { name: "USD", rate: 25400, regex: /\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/g },
    { name: "JPY_Prefix", rate: 165, regex: /[¥￥]\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/g },
    { name: "JPY_Suffix", rate: 165, regex: /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*円/g },
    { name: "KRW_Prefix", rate: 18.5, regex: /₩\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/g },
    { name: "KRW_Suffix", rate: 18.5, regex: /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*원/g },
    { name: "CNY_Suffix", rate: 3500, regex: /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*元/g }
];

function convertCurrency() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToReplace = [];

    while (node = walker.nextNode()) {
        const parentTag = node.parentElement.tagName.toLowerCase();
        if (['script', 'style', 'textarea', 'noscript'].includes(parentTag)) continue;
        
        // SỬA Ở ĐÂY: Đổi tên class kiểm tra thành 'currency-hover'
        if (node.parentElement.classList.contains('currency-hover')) continue;

        const hasCurrency = currencies.some(c => {
            c.regex.lastIndex = 0; 
            return c.regex.test(node.nodeValue);
        });

        if (hasCurrency) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(node => {
        let newHtml = node.nodeValue;
        let isChanged = false;

        currencies.forEach(currency => {
            currency.regex.lastIndex = 0; 
            if (currency.regex.test(newHtml)) {
                currency.regex.lastIndex = 0; 
                
                newHtml = newHtml.replace(currency.regex, (match, amountGroup) => {
                    isChanged = true;
                    const amountStr = amountGroup.replace(/,/g, '');
                    const amount = parseFloat(amountStr);
                    
                    if (isNaN(amount)) return match;

                    const convertedAmount = (amount * currency.rate).toLocaleString('vi-VN');
                    
                    // SỬA Ở ĐÂY: Bọc giá gốc bằng thẻ span chứa data-tooltip
                    return `<span class="currency-hover" data-tooltip="${convertedAmount} ₫">${match}</span>`;
                });
            }
        });

        if (isChanged) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = newHtml;
            node.parentNode.replaceChild(wrapper, node);
        }
    });
}

window.addEventListener('DOMContentLoaded', convertCurrency);
setTimeout(convertCurrency, 2000);