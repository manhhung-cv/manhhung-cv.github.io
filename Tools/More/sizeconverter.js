// asset/size-converter.js

document.addEventListener('DOMContentLoaded', () => {
    const converterContainer = document.getElementById('converter');
    if (!converterContainer) return;

    // --- DATA ---
    const systemDescriptions = { "EU": "Châu Âu", "US (Nam)": "Mỹ - Nam", "US (Nữ)": "Mỹ - Nữ", "US (Trẻ em)": "Mỹ - Trẻ em", "UK": "Anh", "cm": "Centimet", "VN": "Việt Nam", "JP": "Nhật Bản", "KR (mm)": "Hàn Quốc (mm)", "Quốc tế": "Cỡ Quốc tế (S, M, L)", "US (Nam/Waist)": "Cỡ quần Nam Mỹ (vòng eo, inch)", "US (Nữ/Jean)": "Cỡ Jean Nữ Mỹ", "Nike (US)": "Nike - Cỡ Mỹ", "Adidas (US)": "Adidas - Cỡ Mỹ", "Converse (US)": "Converse - Cỡ Mỹ", "MLB (KR)": "MLB - Cỡ Hàn Quốc", "EU (Nam)": "Châu Âu - Nam", "EU (Nữ)": "Châu Âu - Nữ" };
    const sizeData = {
        "Giày": { default: { standards: ["EU", "US (Nam)", "US (Nữ)", "US (Trẻ em)", "UK", "cm", "VN", "JP", "Nike (US)", "Adidas (US)", "Converse (US)", "MLB (KR)"], data: [["28",null,null,"10.5","10","17","28","17",null,null,null,null],["30",null,null,"12.5","12","18.5","30","18.5",null,null,null,null],["32",null,null,"1.5","1","20","32","20",null,null,null,null],["34",null,null,"3","2.5","21.5","34","21.5",null,null,null,null],["35","3.5","5",null,"2.5","22","35","22","5.5","5","3.5","220"],["36","4.5","6",null,"3.5","22.5","36","22.5","6","5.5","4","230"],["37","5","6.5",null,"4.5","23.5","37","23.5","6.5","6","4.5","235"],["38","6","7.5",null,"5.5","24","38","24","7","6.5","5.5","240"],["39","6.5","8",null,"6","24.5","39","24.5","7.5","7","6.5","250"],["40","7.5","9",null,"7","25.5","40","25.5","8","7.5","7.5",null],["41","8","9.5",null,"7.5","26","41","26","8.5","8","8","260"],["42","9","10.5",null,"8.5","27","42","27","9","8.5","9","265"],["43","10","11.5",null,"9.5","28","43","28","9.5","9.5","10","270"],["44","10.5","12",null,"10","28.5","44","28.5","10","10","10.5","280"],["45","11.5",null,null,"11","29.5","45","29.5","11","11","11.5","290"]] } },
        "Áo": { default: { standards: ["Quốc tế", "EU (Nam)", "EU (Nữ)", "US (Nam)", "US (Nữ)", "VN"], data: [["XS","44","34","34","2","S"],["S","46","36","36","4-6","M"],["M","48-50","38-40","38-40","8-10","L"],["L","52-54","42-44","42-44","12-14","XL"],["XL","56","46","46-48","16-18","XXL"],["XXL","58","48","50-52","20","XXXL"]] } },
        "Quần": { default: { standards: ["US (Nam/Waist)", "US (Nữ/Jean)", "EU (Nam)", "EU (Nữ)", "VN"], data: [[null,"24-25",null,"32-34","S"],[null,"26-27",null,"36-38","M"],["28-29",null,"44",null,"S/M"],["30-31","28-29","46","40","L"],["32-33","30-31","48","42","XL"],["34-36","32","50-52","44","XXL"],["38",null,"54",null,"XXXL"]] } }
    };

    // --- DOM ELEMENTS ---
    const productTypeContainer = document.getElementById('product-type-container');
    const systemContainer = document.getElementById('system-container');
    const sizeSuggestionsContainer = document.getElementById('size-suggestions-container');
    const resultsContainer = document.getElementById('results-container');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const systemSelectionArea = document.getElementById('system-selection-area');
    const sizeSelectionArea = document.getElementById('size-selection-area');
    const saveModal = document.getElementById('save-modal');
    const viewSavedModal = document.getElementById('view-saved-modal');
    const savedItemsContainer = document.getElementById('saved-items-container');
    const resultActionsContainer = document.getElementById('result-actions-container');
    const confirmDeleteModal = document.getElementById('size-converter-confirm-modal'); // Modal xác nhận xóa

    // --- STATE VARIABLES ---
    let selectedProductType = null;
    let selectedSystem = null;
    let currentResultData = null;
    let itemToDeleteIndex = null; // Biến để lưu chỉ số của mục cần xóa

    // --- FUNCTIONS ---
    function createBlocks(container, items, clickHandler, addTooltip = false) {
        if (!container) return;
        container.innerHTML = '';
        items.forEach(item => {
            const block = document.createElement('div');
            block.className = 'selectable-block'; block.textContent = item; block.dataset.value = item;
            block.addEventListener('click', () => clickHandler(block));
            if (addTooltip && systemDescriptions[item]) {
                const tooltip = document.createElement('span');
                tooltip.className = 'size-tooltip'; tooltip.textContent = systemDescriptions[item];
                block.appendChild(tooltip);
            }
            container.appendChild(block);
        });
    }

    function handleProductTypeClick(clickedBlock) {
        selectedProductType = clickedBlock.dataset.value;
        updateActiveState(productTypeContainer, clickedBlock);
        const { displayStandards, valueMap } = groupDisplayStandards(sizeData[selectedProductType].default);
        createBlocks(systemContainer, displayStandards, (block) => handleSystemClick(block, valueMap), true);
        systemSelectionArea.classList.remove('hidden'); sizeSelectionArea.classList.add('hidden');
        resetResults();
    }

    function handleSystemClick(clickedBlock, valueMap) {
        selectedSystem = valueMap[clickedBlock.dataset.value];
        updateActiveState(systemContainer, clickedBlock);
        populateSizeSuggestions();
        sizeSelectionArea.classList.remove('hidden');
        resetResults();
    }

    function handleSizeClick(clickedBlock) {
        updateActiveState(sizeSuggestionsContainer, clickedBlock);
        convertAndDisplaySizes(clickedBlock.dataset.value);
    }

    function populateSizeSuggestions() {
        const currentData = sizeData[selectedProductType].default;
        const systemIndex = currentData.standards.indexOf(selectedSystem);
        if (systemIndex === -1) return;
        const sizes = [...new Set(currentData.data.map(row => row[systemIndex]).filter(s => s != null && String(s).trim() !== ''))];
        createBlocks(sizeSuggestionsContainer, sizes, handleSizeClick);
        const customButton = document.createElement('div');
        customButton.className = 'selectable-block custom-size-btn'; customButton.textContent = 'Khác';
        customButton.addEventListener('click', () => transformToInput(customButton));
        sizeSuggestionsContainer.appendChild(customButton);
    }

    function transformToInput(buttonElement) {
        updateActiveState(sizeSuggestionsContainer, null);
        const input = document.createElement('input');
        input.type = 'text'; input.placeholder = 'Nhập cỡ...'; input.className = 'dynamic-input';
        buttonElement.replaceWith(input);
        input.classList.add('active'); input.focus();
        input.addEventListener('input', () => convertAndDisplaySizes(input.value));
        input.addEventListener('blur', () => { if (input.value.trim() === '') { input.replaceWith(buttonElement); resetResults(); } });
    }
    
    function parseSize(sizeStr) {
        if (sizeStr == null) return NaN;
        const s = String(sizeStr).trim();
        if (s.includes('-')) { const parts = s.split('-').map(p => parseFloat(p.trim())); return (parts[0] + parts[1]) / 2; }
        return parseFloat(s);
    }

    function convertAndDisplaySizes(sizeValue) {
        const size = String(sizeValue || '').trim();
        if (!selectedProductType || !selectedSystem || !size) { resetResults(); return; }
        const defaultData = sizeData[selectedProductType].default;
        const matchingRow = defaultData.data.find(row => String(row[defaultData.standards.indexOf(selectedSystem)]).toLowerCase() === size.toLowerCase());
        if (matchingRow) { displayResults(matchingRow, defaultData.standards, false); }
        else {
             const calculatedData = calculateApproximateSizes(size, defaultData);
             if (calculatedData) { displayResults(calculatedData.results, defaultData.standards, calculatedData.isApproximate); }
             else { resetResults(); if (resultsPlaceholder) { resultsPlaceholder.querySelector('p').innerHTML = `Không tìm thấy kích cỡ <span style="font-weight: 600; color: var(--accent-color);">${size}</span>.`; } }
        }
    }

    function calculateApproximateSizes(inputValue, dataSet) {
        const inputSize = parseSize(inputValue);
        if (isNaN(inputSize)) return null;
        const standards = dataSet.standards;
        const systemIndex = standards.indexOf(selectedSystem);
        const numericData = dataSet.data.map(row => ({ original: row, parsed: row.map(val => parseSize(val)) })).filter(item => !isNaN(item.parsed[systemIndex]));
        if (numericData.length < 2) return null;
        numericData.sort((a, b) => a.parsed[systemIndex] - b.parsed[systemIndex]);
        let p1, p2;
        if (inputSize <= numericData[0].parsed[systemIndex]) { [p1, p2] = [numericData[0], numericData[1]]; }
        else if (inputSize >= numericData[numericData.length - 1].parsed[systemIndex]) { [p1, p2] = [numericData[numericData.length - 2], numericData[numericData.length - 1]]; }
        else { for (let i = 0; i < numericData.length - 1; i++) { if (inputSize >= numericData[i].parsed[systemIndex] && inputSize <= numericData[i + 1].parsed[systemIndex]) { [p1, p2] = [numericData[i], numericData[i + 1]]; break; } } }
        if (!p1 || !p2) return null;
        const x1 = p1.parsed[systemIndex], x2 = p2.parsed[systemIndex];
        if (x1 === x2) return { results: p1.original, isApproximate: false };
        const t = (inputSize - x1) / (x2 - x1);
        const calculatedRow = standards.map((_, i) => {
            const y1 = p1.parsed[i], y2 = p2.parsed[i];
            if (isNaN(y1) || isNaN(y2)) { return t < 0.5 ? p1.original[i] : p2.original[i]; }
            const result = y1 + t * (y2 - y1);
            return `≈${result.toFixed(1).replace('.0', '')}`;
        });
        calculatedRow[systemIndex] = inputValue;
        return { results: calculatedRow, isApproximate: true };
    }

    function displayResults(resultRow, standards, isApproximate = false) {
        if (!resultsContainer || !resultActionsContainer) return;
        resultsContainer.innerHTML = ''; resultActionsContainer.innerHTML = '';
        currentResultData = { standards, resultRow };
        if (isApproximate) { const warningBox = document.createElement('div'); warningBox.className = 'info-box warning-box'; warningBox.innerHTML = '<strong>Lưu ý:</strong> Kích thước được tính toán dựa trên dữ liệu gần nhất và chỉ mang tính tham khảo.'; resultsContainer.appendChild(warningBox); }
        const groupedResults = {};
        resultRow.forEach((size, index) => { if (size == null || String(size).trim() === '') return; const standard = standards[index]; const sizeKey = String(size); if (!groupedResults[sizeKey]) groupedResults[sizeKey] = []; groupedResults[sizeKey].push(standard); });
        const resultsGrid = document.createElement('div'); resultsGrid.className = 'results-grid';
        for (const size in groupedResults) {
            const associatedStandards = groupedResults[size];
            const item = document.createElement('div'); item.className = 'result-item';
            item.innerHTML = `<div class="standard-name">${associatedStandards.join(' / ')}</div><div class="size-value">${size}</div><span class="size-tooltip">${associatedStandards.map(s => systemDescriptions[s] || s).join(', ')}</span>`;
            resultsGrid.appendChild(item);
        }
        resultsContainer.appendChild(resultsGrid);
        const copyButton = document.createElement('button'); copyButton.className = 'btn btn-secondary'; copyButton.innerHTML = '<i class="fa-regular fa-copy"></i> Sao chép'; copyButton.addEventListener('click', copyResultsToClipboard); resultActionsContainer.appendChild(copyButton);
        const saveButton = document.createElement('button'); saveButton.className = 'btn btn-primary'; saveButton.innerHTML = '<i class="fa-regular fa-bookmark"></i> Lưu kết quả'; saveButton.addEventListener('click', openSaveModal); resultActionsContainer.appendChild(saveButton);
    }
    
    function copyResultsToClipboard() {
        if (!currentResultData) return;
        const textToCopy = currentResultData.resultRow.map((size, index) => (size == null || String(size).trim() === '') ? null : `${currentResultData.standards[index]}: ${size}`).filter(Boolean).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => { showToast('success', 'Đã sao chép!', 'Kết quả đã được chép vào clipboard.'); }).catch(err => { showToast('danger', 'Lỗi!', 'Không thể sao chép kết quả.'); console.error('Lỗi khi sao chép:', err); });
    }

    function updateActiveState(container, activeBlock) { if (!container) return; Array.from(container.children).forEach(child => child.classList.remove('active')); if (activeBlock) activeBlock.classList.add('active'); }

    function resetResults() { if (resultsContainer && resultsPlaceholder && resultActionsContainer) { resultsContainer.innerHTML = ''; resultsContainer.appendChild(resultsPlaceholder); resultsPlaceholder.querySelector('p').textContent = 'Kết quả sẽ được hiển thị ở đây.'; resultActionsContainer.innerHTML = ''; currentResultData = null; } }

    function groupDisplayStandards(dataSet) {
        const standards = dataSet.standards; const data = dataSet.data; const valueMap = {}; const grouped = {};
        standards.forEach((standard, index) => { const columnValues = data.map(row => row[index]).join(','); if (!grouped[columnValues]) grouped[columnValues] = []; grouped[columnValues].push(standard); });
        return { displayStandards: Object.values(grouped).map(group => { const displayName = group.join(' / '); valueMap[displayName] = group[0]; return displayName; }), valueMap };
    }

    function getSavedSizes() { return JSON.parse(localStorage.getItem('savedSizes') || '[]'); }
    function saveSizes(sizes) { localStorage.setItem('savedSizes', JSON.stringify(sizes)); }
    
    function openSaveModal() { if (saveModal) { saveModal.classList.add('show'); const input = document.getElementById('save-name-input'); if (input) { input.value = ''; input.focus(); } } }
    function closeSaveModal() { if (saveModal) saveModal.classList.remove('show'); }
    
    function openViewSavedModal() {
        if (!viewSavedModal || !savedItemsContainer) return;
        const savedSizes = getSavedSizes();
        savedItemsContainer.innerHTML = savedSizes.length === 0 ? '<p>Chưa có kích cỡ nào được lưu.</p>' : '';
        if (savedSizes.length > 0) {
            const list = document.createElement('ul'); list.className = 'saved-items-list';
            savedSizes.forEach((item, index) => {
                const detailsHtml = item.sizes.map(s => `<span>${s.standard}: <strong>${s.size}</strong></span>`).join('');
                const li = document.createElement('li'); li.className = 'saved-item';
                li.innerHTML = `<div><div class="saved-item-header"><strong>${item.name}</strong><div class="saved-item-actions"><button class="copy-button" data-index="${index}" title="Sao chép"><i class="fa-regular fa-copy"></i></button><button class="delete-button" data-index="${index}" title="Xóa">&times;</button></div></div><div class="saved-item-details">${detailsHtml}</div></div>`;
                list.appendChild(li);
            });
            savedItemsContainer.appendChild(list);
            list.querySelectorAll('.delete-button').forEach(button => button.addEventListener('click', e => { e.stopPropagation(); showDeleteConfirmation(parseInt(e.currentTarget.dataset.index, 10)); }));
            list.querySelectorAll('.copy-button').forEach(button => button.addEventListener('click', e => { e.stopPropagation(); copySavedItem(parseInt(e.currentTarget.dataset.index, 10)); }));
        }
        viewSavedModal.classList.add('show');
    }
    
    function closeViewSavedModal() { if (viewSavedModal) viewSavedModal.classList.remove('show'); }

    function showDeleteConfirmation(index) { itemToDeleteIndex = index; if (confirmDeleteModal) { confirmDeleteModal.classList.add('show'); } }

    function copySavedItem(index) {
        const item = getSavedSizes()[index]; if (!item) return;
        const textToCopy = `${item.name}\n` + item.sizes.map(s => `${s.standard}: ${s.size}`).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => { showToast('success', 'Đã sao chép!', 'Kích cỡ đã lưu được chép vào clipboard.'); }).catch(err => { showToast('danger', 'Lỗi!', 'Không thể sao chép.'); });
    }

    function deleteSavedSize(index) { let savedSizes = getSavedSizes(); savedSizes.splice(index, 1); saveSizes(savedSizes); openViewSavedModal(); }
    
    function confirmSave() {
        const nameInput = document.getElementById('save-name-input'); const name = nameInput ? nameInput.value.trim() : null;
        if (!name) { showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập tên cho bộ kích cỡ.'); return; }
        if (!currentResultData) { showToast('danger', 'Lỗi', 'Không có dữ liệu để lưu.'); return; }
        const sizesToSave = currentResultData.resultRow.map((size, index) => ({ standard: currentResultData.standards[index], size })).filter(item => item.size != null && String(item.size).trim() !== '');
        const savedSizes = getSavedSizes(); savedSizes.push({ name, sizes: sizesToSave }); saveSizes(savedSizes); closeSaveModal();
        showToast('success', 'Đã lưu!', 'Kích cỡ của bạn đã được lưu thành công.');
    }

    function init() {
        createBlocks(productTypeContainer, Object.keys(sizeData), handleProductTypeClick);
        document.getElementById('view-saved-button')?.addEventListener('click', openViewSavedModal);
        document.getElementById('cancel-save-button')?.addEventListener('click', closeSaveModal);
        document.getElementById('confirm-save-button')?.addEventListener('click', confirmSave);
        document.getElementById('close-view-saved-button')?.addEventListener('click', closeViewSavedModal);
        
        const confirmDeleteBtn = confirmDeleteModal?.querySelector('.btn-confirm-delete');
        const cancelDeleteBtns = confirmDeleteModal?.querySelectorAll('.btn-cancel, .modal-close-btn');
        if (confirmDeleteBtn) { confirmDeleteBtn.addEventListener('click', () => { if (itemToDeleteIndex !== null) { deleteSavedSize(itemToDeleteIndex); } if (confirmDeleteModal) confirmDeleteModal.classList.remove('show'); }); }
        if (cancelDeleteBtns) { cancelDeleteBtns.forEach(btn => btn.addEventListener('click', () => { if (confirmDeleteModal) confirmDeleteModal.classList.remove('show'); })); }

        [saveModal, viewSavedModal, confirmDeleteModal].forEach(modal => { modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); }); });
    }

    init();
});