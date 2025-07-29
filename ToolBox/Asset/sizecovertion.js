
document.addEventListener('DOMContentLoaded', () => {
    // --- NEW DATA STRUCTURE ---
    const systemDescriptions = {
        "EU": "Châu Âu", "US (Nam)": "Mỹ - Nam", "US (Nữ)": "Mỹ - Nữ", "US (Trẻ em)": "Mỹ - Trẻ em",
        "UK": "Anh", "cm": "Centimet", "VN": "Việt Nam", "JP": "Nhật Bản", "KR (mm)": "Hàn Quốc (mm)",
        "Quốc tế": "Cỡ Quốc tế (S, M, L)", "US (Nam/Waist)": "Cỡ quần Nam Mỹ (vòng eo, inch)",
        "US (Nữ/Jean)": "Cỡ Jean Nữ Mỹ", "Nike (US)": "Nike - Cỡ Mỹ", "Adidas (US)": "Adidas - Cỡ Mỹ",
        "Converse (US)": "Converse - Cỡ Mỹ", "MLB (KR)": "MLB - Cỡ Hàn Quốc"
    };

    const sizeData = {
        "Giày": {
            default: {
                standards: ["EU", "US (Nam)", "US (Nữ)", "US (Trẻ em)", "UK", "cm", "VN", "JP", "Nike (US)", "Adidas (US)", "Converse (US)", "MLB (KR)"],
                data: [
                    ["28", null, null, "10.5", "10", "17", "28", "17", null, null, null, null],
                    ["30", null, null, "12.5", "12", "18.5", "30", "18.5", null, null, null, null],
                    ["32", null, null, "1.5", "1", "20", "32", "20", null, null, null, null],
                    ["34", null, null, "3", "2.5", "21.5", "34", "21.5", null, null, null, null],
                    ["35", "3.5", "5", null, "2.5", "22", "35", "22", "5.5", "5", "3.5", "220"],
                    ["36", "4.5", "6", null, "3.5", "22.5", "36", "22.5", "6", "5.5", "4", "230"],
                    ["37", "5", "6.5", null, "4.5", "23.5", "37", "23.5", "6.5", "6", "4.5", "235"],
                    ["38", "6", "7.5", null, "5.5", "24", "38", "24", "7", "6.5", "5.5", "240"],
                    ["39", "6.5", "8", null, "6", "24.5", "39", "24.5", "7.5", "7", "6.5", "250"],
                    ["40", "7.5", "9", null, "7", "25.5", "40", "25.5", "8", "7.5", "7.5", null],
                    ["41", "8", "9.5", null, "7.5", "26", "41", "26", "8.5", "8", "8", "260"],
                    ["42", "9", "10.5", null, "8.5", "27", "42", "27", "9", "8.5", "9", "265"],
                    ["43", "10", "11.5", null, "9.5", "28", "43", "28", "9.5", "9.5", "10", "270"],
                    ["44", "10.5", "12", null, "10", "28.5", "44", "28.5", "10", "10", "10.5", "280"],
                    ["45", "11.5", null, null, "11", "29.5", "45", "29.5", "11", "11", "11.5", "290"]
                ]
            }
        },
        "Áo": {
            default: {
                standards: ["Quốc tế", "EU (Nam)", "EU (Nữ)", "US (Nam)", "US (Nữ)", "VN"],
                data: [
                    ["XS", "44", "34", "34", "2", "S"], ["S", "46", "36", "36", "4-6", "M"],
                    ["M", "48-50", "38-40", "38-40", "8-10", "L"], ["L", "52-54", "42-44", "42-44", "12-14", "XL"],
                    ["XL", "56", "46", "46-48", "16-18", "XXL"], ["XXL", "58", "48", "50-52", "20", "XXXL"]
                ]
            }
        },
        "Quần": {
            default: {
                standards: ["US (Nam/Waist)", "US (Nữ/Jean)", "EU (Nam)", "EU (Nữ)", "VN"],
                data: [
                    [null, "24-25", null, "32-34", "S"], [null, "26-27", null, "36-38", "M"],
                    ["28-29", null, "44", null, "S/M"], ["30-31", "28-29", "46", "40", "L"],
                    ["32-33", "30-31", "48", "42", "XL"], ["34-36", "32", "50-52", "44", "XXL"],
                    ["38", null, "54", null, "XXXL"]
                ]
            }
        }
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

    // --- STATE VARIABLES ---
    let selectedProductType = null;
    let selectedSystem = null;
    let currentResultData = null;

    // --- FUNCTIONS ---
    function createBlocks(container, items, clickHandler, addTooltip = false) {
        container.innerHTML = '';
        items.forEach(item => {
            const block = document.createElement('div');
            block.className = 'selectable-block';
            block.textContent = item;
            block.dataset.value = item;
            block.addEventListener('click', () => clickHandler(block));
            if (addTooltip && systemDescriptions[item]) {
                const tooltip = document.createElement('span');
                tooltip.className = 'size-tooltip';
                tooltip.textContent = systemDescriptions[item];
                block.appendChild(tooltip);
            }
            container.appendChild(block);
        });
    }

    function handleProductTypeClick(clickedBlock) {
        selectedProductType = clickedBlock.dataset.value;
        updateActiveState(productTypeContainer, clickedBlock);

        // Gộp các hệ cỡ giống nhau để hiển thị
        const { displayStandards, valueMap } = groupDisplayStandards(sizeData[selectedProductType].default);

        createBlocks(systemContainer, displayStandards, (block) => handleSystemClick(block, valueMap), true);
        systemSelectionArea.classList.remove('hidden');
        sizeSelectionArea.classList.add('hidden');
        resetResults();
    }

    function handleSystemClick(clickedBlock, valueMap) {
        const displayValue = clickedBlock.dataset.value;
        selectedSystem = valueMap[displayValue]; // Lấy hệ cỡ thực tế để tra cứu
        updateActiveState(systemContainer, clickedBlock);
        populateSizeSuggestions();
        sizeSelectionArea.classList.remove('hidden');
        resetResults();
    }

    function handleSizeClick(clickedBlock) {
        const value = clickedBlock.dataset.value;
        updateActiveState(sizeSuggestionsContainer, clickedBlock);
        convertAndDisplaySizes(value);
    }

    function populateSizeSuggestions() {
        const currentData = sizeData[selectedProductType].default;
        const systemIndex = currentData.standards.indexOf(selectedSystem);
        const sizes = [...new Set(currentData.data.map(row => row[systemIndex]).filter(s => s !== null && s !== undefined && String(s).trim() !== ''))];
        createBlocks(sizeSuggestionsContainer, sizes, handleSizeClick);
        const customButton = document.createElement('div');
        customButton.className = 'selectable-block custom-size-btn';
        customButton.textContent = 'Tùy chỉnh';
        customButton.addEventListener('click', () => transformToInput(customButton));
        sizeSuggestionsContainer.appendChild(customButton);
    }

    function transformToInput(buttonElement) {
        updateActiveState(sizeSuggestionsContainer, null);
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Nhập cỡ...';
        input.className = 'dynamic-input';
        buttonElement.replaceWith(input);
        input.classList.add('active');
        input.focus();
        input.addEventListener('input', () => convertAndDisplaySizes(input.value));
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.replaceWith(buttonElement);
                resetResults();
            }
        });
    }

    function parseSize(sizeStr) {
        if (sizeStr === null || sizeStr === undefined) return NaN;
        if (typeof sizeStr !== 'string') return parseFloat(sizeStr);
        if (sizeStr.includes('-')) {
            const parts = sizeStr.split('-').map(s => parseFloat(s.trim()));
            return (parts[0] + parts[1]) / 2;
        }
        if (sizeStr.includes(' ')) {
            const parts = sizeStr.split(' ');
            const whole = parseInt(parts[0], 10);
            const fractionParts = parts[1].split('/');
            const numerator = parseInt(fractionParts[0], 10);
            const denominator = parseInt(fractionParts[1], 10);
            return whole + numerator / denominator;
        }
        return parseFloat(sizeStr);
    }

    function convertAndDisplaySizes(sizeValue) {
        const size = String(sizeValue || '').trim();
        if (!selectedProductType || !selectedSystem || !size) {
            resetResults();
            return;
        }
        const defaultData = sizeData[selectedProductType].default;
        const systemIndex = defaultData.standards.indexOf(selectedSystem);
        const matchingRow = defaultData.data.find(row => String(row[systemIndex]).toLowerCase() === size.toLowerCase());
        let resultRow = null;
        let isApprox = false;
        if (matchingRow) {
            resultRow = matchingRow;
        } else {
            const calculatedData = calculateApproximateSizes(size, defaultData);
            if (calculatedData) {
                resultRow = calculatedData.results;
                isApprox = calculatedData.isApproximate;
            }
        }
        if (resultRow) {
            displayResults(resultRow, defaultData.standards, isApprox);
        } else {
            resultsContainer.innerHTML = `<div id="results-placeholder"><p>Không tìm thấy kích cỡ <span style="font-weight: 600; color: var(--accent-color);">${size}</span>.</p></div>`;
        }
    }

    function calculateApproximateSizes(inputValue, dataSet) {
        const inputSize = parseSize(inputValue);
        if (isNaN(inputSize)) return null;
        const standards = dataSet.standards;
        const systemIndex = standards.indexOf(selectedSystem);
        const numericData = dataSet.data.map(row => row.map(val => parseSize(val))).filter(row => !isNaN(row[systemIndex]));
        if (numericData.length < 2) return null;
        numericData.sort((a, b) => a[systemIndex] - b[systemIndex]);
        let p1_row, p2_row;
        if (inputSize < numericData[0][systemIndex]) [p1_row, p2_row] = [numericData[0], numericData[1]];
        else if (inputSize > numericData[numericData.length - 1][systemIndex]) [p1_row, p2_row] = [numericData[numericData.length - 2], numericData[numericData.length - 1]];
        else {
            for (let i = 0; i < numericData.length - 1; i++) {
                if (inputSize >= numericData[i][systemIndex] && inputSize <= numericData[i + 1][systemIndex]) {
                    [p1_row, p2_row] = [numericData[i], numericData[i + 1]];
                    break;
                }
            }
        }
        if (!p1_row || !p2_row) return null;
        const x1 = p1_row[systemIndex], x2 = p2_row[systemIndex];
        if (x1 === x2) return null;
        const t = (inputSize - x1) / (x2 - x1);
        const calculatedRow = standards.map((_, i) => {
            const y1 = p1_row[i], y2 = p2_row[i];
            const originalRow1 = dataSet.data.find(row => parseSize(row[systemIndex]) === x1);
            if (isNaN(y1) || isNaN(y2)) return originalRow1?.[i] || null;
            const result = y1 + t * (y2 - y1);
            return `≈${result.toFixed(1).replace('.0', '')}`;
        });
        calculatedRow[systemIndex] = inputValue;
        return { results: calculatedRow, isApproximate: true };
    }

    function displayResults(resultRow, standards, isApproximate = false) {
        resultsContainer.innerHTML = '';
        currentResultData = { standards, resultRow };

        if (isApproximate) {
            const warningBox = document.createElement('div');
            warningBox.className = 'info-box warning-box';
            warningBox.innerHTML = '<strong>Lưu ý:</strong> Kích thước được tính toán dựa trên dữ liệu gần nhất và có thể không hoàn toàn chính xác.';
            resultsContainer.appendChild(warningBox);
        }

        // Grouping logic
        const groupedResults = {};
        resultRow.forEach((size, index) => {
            if (size === null) return;
            const standard = standards[index];
            const sizeKey = String(size);
            if (!groupedResults[sizeKey]) {
                groupedResults[sizeKey] = [];
            }
            groupedResults[sizeKey].push(standard);
        });

        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'results-grid';

        for (const size in groupedResults) {
            const associatedStandards = groupedResults[size];
            const item = document.createElement('div');
            item.className = 'result-item';

            const standardNameEl = document.createElement('div');
            standardNameEl.className = 'standard-name';
            standardNameEl.textContent = associatedStandards.join(' / ');

            const sizeValueEl = document.createElement('div');
            sizeValueEl.className = 'size-value';
            sizeValueEl.textContent = size;

            item.appendChild(standardNameEl);
            item.appendChild(sizeValueEl);

            if (associatedStandards.length > 1) {
                const tooltip = document.createElement('span');
                tooltip.className = 'size-tooltip';
                tooltip.textContent = associatedStandards.map(s => systemDescriptions[s] || s).join(', ');
                item.appendChild(tooltip);
            }
            resultsGrid.appendChild(item);
        }
        resultsContainer.appendChild(resultsGrid);

        const saveButtonContainer = document.createElement('div');
        saveButtonContainer.id = 'save-result-button-container';
        saveButtonContainer.innerHTML = `<button id="save-result-button" class="action-button">Lưu kết quả</button>`;
        resultsContainer.appendChild(saveButtonContainer);
        document.getElementById('save-result-button').addEventListener('click', openSaveModal);
    }

    function updateActiveState(container, activeBlock) {
        Array.from(container.children).forEach(child => child.classList.remove('active'));
        if (activeBlock) activeBlock.classList.add('active');
    }

    function resetResults() {
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsPlaceholder);
        currentResultData = null;
    }

    function groupDisplayStandards(dataSet) {
        const standards = dataSet.standards;
        const data = dataSet.data;
        const valueMap = {};
        const grouped = {};

        standards.forEach((standard, index) => {
            const columnValues = data.map(row => row[index]).join(',');
            if (!grouped[columnValues]) {
                grouped[columnValues] = [];
            }
            grouped[columnValues].push(standard);
        });

        const displayStandards = Object.values(grouped).map(group => {
            const displayName = group.join(' / ');
            valueMap[displayName] = group[0]; // Map display name to the first actual standard
            return displayName;
        });

        return { displayStandards, valueMap };
    }

    // --- Save/Load Logic ---
    function getSavedSizes() {
        return JSON.parse(localStorage.getItem('savedSizes') || '[]');
    }

    function saveSizes(sizes) {
        localStorage.setItem('savedSizes', JSON.stringify(sizes));
    }

    function openSaveModal() {
        document.getElementById('save-name-input').value = '';
        saveModal.classList.remove('hidden');
    }

    function closeSaveModal() {
        saveModal.classList.add('hidden');
    }

    function confirmSave() {
        const name = document.getElementById('save-name-input').value.trim();
        if (!name) {
            alert('Vui lòng nhập tên.');
            return;
        }
        if (!currentResultData) {
            alert('Không có dữ liệu để lưu.');
            return;
        }

        const sizesToSave = currentResultData.resultRow
            .map((size, index) => ({ standard: currentResultData.standards[index], size }))
            .filter(item => item.size !== null);

        const savedSizes = getSavedSizes();
        savedSizes.push({ name, sizes: sizesToSave });
        saveSizes(savedSizes);
        closeSaveModal();
        alert('Đã lưu thành công!');
    }

    function openViewSavedModal() {
        const savedSizes = getSavedSizes();
        savedItemsContainer.innerHTML = '';
        if (savedSizes.length === 0) {
            savedItemsContainer.innerHTML = '<p>Chưa có kích cỡ nào được lưu.</p>';
        } else {
            const list = document.createElement('ul');
            list.className = 'saved-items-list';
            savedSizes.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'saved-item';

                const detailsHtml = item.sizes.map(s => `<span>${s.standard}: <strong>${s.size}</strong></span>`).join('');

                listItem.innerHTML = `
                            <div>
                                <div class="saved-item-header">
                                    <strong>${item.name}</strong>
                                    <button class="delete-button" data-index="${index}">X</button>
                                </div>
                                <div class="saved-item-details">${detailsHtml}</div>
                            </div>
                        `;
                list.appendChild(listItem);
            });
            savedItemsContainer.appendChild(list);

            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.dataset.index, 10);
                    deleteSavedSize(index);
                });
            });
        }
        viewSavedModal.classList.remove('hidden');
    }

    function closeViewSavedModal() {
        viewSavedModal.classList.add('hidden');
    }

    function deleteSavedSize(index) {
        let savedSizes = getSavedSizes();
        savedSizes.splice(index, 1);
        saveSizes(savedSizes);
        openViewSavedModal(); // Refresh the list
    }

    function init() {
        createBlocks(productTypeContainer, Object.keys(sizeData), handleProductTypeClick);
        // Event listeners for modals
        document.getElementById('view-saved-button').addEventListener('click', openViewSavedModal);
        document.getElementById('cancel-save-button').addEventListener('click', closeSaveModal);
        document.getElementById('confirm-save-button').addEventListener('click', confirmSave);
        document.getElementById('close-view-saved-button').addEventListener('click', closeViewSavedModal);
    }

    init();
});