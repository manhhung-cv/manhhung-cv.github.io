document.addEventListener('DOMContentLoaded', function() {
    const toolContainer = document.getElementById('gmail-alias');
    if (!toolContainer) return;

    // --- DOM Element References ---
    const generateBtn = toolContainer.querySelector('#generateBtn');
    const emailInput = toolContainer.querySelector('#emailInput');
    const deleteConfirmModal = toolContainer.querySelector('#deleteConfirmModal');
    const confirmDeleteBtn = toolContainer.querySelector('#confirmDeleteBtn');
    const allModalCloseBtns = deleteConfirmModal.querySelectorAll('.modal-close-btn, .btn-cancel');
    const cardsContainer = toolContainer.querySelector('#cards-container');
    const historyList = toolContainer.querySelector('#copy-history-list');
    const editHistoryBtn = toolContainer.querySelector('#edit-history-btn');
    const deleteActionsDiv = toolContainer.querySelector('.delete-actions');
    const selectAllBtn = toolContainer.querySelector('#select-all-btn');
    const deleteSelectedBtn = toolContainer.querySelector('#delete-selected-btn');
    const cancelDeleteBtn = toolContainer.querySelector('#cancel-delete-btn');
    const infoBox = document.getElementById('info-gmail-trick');

    // --- State and Constants ---
    const CARDS_STORAGE_KEY = 'gmailTrickCardsData';
    const HISTORY_STORAGE_KEY = 'gmailTrickHistory';
    let cardToDelete = null;

    // --- Info Box ---
    const version = "1.2.0";
    const updated = "31/07/2025";
    if (infoBox) {
        infoBox.style.display = 'block';
        infoBox.innerHTML = `
        <i class="fa-solid fa-info-circle" style="margin-right: 4px;"></i>
        Phiên bản: <strong>${version}</strong> • Cập nhật: <strong>${updated}</strong>
    `;
    }

    // --- Helper Functions ---
    function copyToClipboard(text, buttonElement, isIndividualCopy = false) {
        navigator.clipboard.writeText(text).then(() => {
            if (isIndividualCopy) {
                addCopyToHistory(text);
            }
            if (buttonElement) {
                const originalContent = buttonElement.innerHTML;
                const buttonText = buttonElement.querySelector('.copy-text');
                if (buttonText) {
                     buttonText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã sao chép';
                } else {
                     buttonElement.innerHTML = '<i class="fa-solid fa-check"></i>';
                }
                setTimeout(() => { buttonElement.innerHTML = originalContent; }, 1500);
            }
        }).catch(err => {
            showToast('danger', 'Lỗi', 'Không thể sao chép vào clipboard.');
        });
    }

    function getHistoryFromStorage() {
        try { return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function saveHistoryToStorage(history) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
    function getCardsFromStorage() {
        try { return JSON.parse(localStorage.getItem(CARDS_STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function saveCardsToStorage(cardsData) {
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardsData));
    }

    function addCopyToHistory(email) {
        let history = getHistoryFromStorage();
        const existingItem = history.find(item => item.email === email);
        const count = existingItem ? (existingItem.copyCount || 1) + 1 : 1;
        history = history.filter(item => item.email !== email);
        history.unshift({
            email: email, timestamp: new Date().toISOString(),
            note: existingItem ? existingItem.note : '', copyCount: count
        });
        if (history.length > 20) history.pop();
        saveHistoryToStorage(history);
        renderCopyHistory();
    }

    function saveNoteForHistoryItem(email, note) {
        let history = getHistoryFromStorage();
        const itemIndex = history.findIndex(item => item.email === email);
        if (itemIndex > -1) {
            history[itemIndex].note = note;
            saveHistoryToStorage(history);
        }
    }

    function toggleDeleteMode(active) {
        toolContainer.classList.toggle('delete-mode', active);
        editHistoryBtn.style.display = active ? 'none' : 'block';
        deleteActionsDiv.style.display = active ? 'flex' : 'none';
        if (!active && getHistoryFromStorage().length === 0) {
            editHistoryBtn.style.display = 'none';
        }
        renderCopyHistory();
    }

    function renderCopyHistory() {
        const history = getHistoryFromStorage();
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = `<li style="font-size: 14px; color: var(--text-secondary); text-align: center; padding: 10px 0;">Chưa có mục nào.</li>`;
            editHistoryBtn.style.display = 'none';
            if (toolContainer.classList.contains('delete-mode')) toggleDeleteMode(false);
            return;
        }

        editHistoryBtn.style.display = toolContainer.classList.contains('delete-mode') ? 'none' : 'block';
        history.forEach(item => {
            const date = new Date(item.timestamp).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
            const count = item.copyCount > 1 ? `<span class="copy-count">(${item.copyCount})</span>` : '';
            historyList.innerHTML += `
                <li class="history-item">
                    <input type="checkbox" class="history-item-checkbox" data-email="${item.email}">
                    <div class="history-item-content">
                        <div class="history-item-header">
                            <span class="history-item-email">${item.email}${count}</span>
                            <button class="btn btn-secondary copy-btn" data-clipboard-text="${item.email}" style="padding: 4px 8px; font-size: 13px;"><i class="fa-regular fa-clone"></i></button>
                        </div>
                        <p class="history-item-timestamp">${date}</p>
                        <div class="note-group">
                            <input type="text" class="input-field note-input" placeholder="Thêm ghi chú..." value="${item.note || ''}" data-email="${item.email}">
                            <button class="btn btn-secondary save-note-btn" data-email="${item.email}" style="padding: 4px 8px; font-size: 13px;">Lưu</button>
                        </div>
                    </div>
                </li>`;
        });
    }

    function renderAllCards() {
        const cardsData = getCardsFromStorage();
        cardsContainer.innerHTML = '';
        if (cardsData.length === 0) {
            cardsContainer.innerHTML = `<div class="empty-state"><i class="fa-regular fa-envelope-open"></i><h3>Chưa có email</h3><p>Nhập email để bắt đầu.</p></div>`;
            return;
        }
        cardsData.forEach(card => createResultCard(card.id, card.email));
    }

    function handleGeneration() {
        let email = emailInput.value.trim().toLowerCase();
        if (email && !email.includes('@')) email += '@gmail.com';

        if (!email.endsWith('@gmail.com') || email.split('@')[0].length === 0) {
            return showToast('warning', 'Dữ liệu không hợp lệ', 'Vui lòng nhập một địa chỉ Gmail.');
        }
        if (email.split('@')[0].length > 12) {
            return showToast('danger', 'Quá giới hạn', 'Tên người dùng quá dài, có thể làm treo trình duyệt.');
        }

        const cardsData = getCardsFromStorage();
        if (cardsData.some(card => card.email === email)) {
            return showToast('info', 'Thông tin', 'Email này đã được thêm vào danh sách.');
        }
        cardsData.unshift({ id: Date.now(), email: email });
        saveCardsToStorage(cardsData);
        renderAllCards();
        emailInput.value = '';
        emailInput.focus();
    }

    function generateAllDotTricks(username) {
        if (username.length === 0 || username.length > 12) return [username];
        const results = new Set([username]);
        for (let i = 1; i < (1 << (username.length - 1)); i++) {
            let combination = username[0];
            for (let j = 0; j < username.length - 1; j++) {
                if ((i >> j) & 1) combination += '.';
                combination += username[j + 1];
            }
            results.add(combination);
        }
        return Array.from(results);
    }
    
    function createResultCard(id, originalEmail) {
        const username = originalEmail.split('@')[0];
        const variations = generateAllDotTricks(username);
        const totalVariations = variations.length;
        const allEmailsText = variations.map(v => `${v}@gmail.com`).join('\n');

        const listItems = variations.slice(0, 50).map(v => `
            <div class="variation-item">
                <span>${v}@gmail.com</span>
                <button class="btn btn-secondary copy-btn" data-clipboard-text="${v}@gmail.com"><i class="fa-regular fa-clone"></i></button>
            </div>`).join('');
        
        cardsContainer.innerHTML += `
            <div class="mailbox" data-id="${id}">
                <div class="mailhead">
                    <div><h3>${originalEmail}</h3><p>${totalVariations} biến thể</p></div>
                    <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <div class="variations-list">${listItems} ${totalVariations > 50 ? `<p class="variation-item">... và ${totalVariations-50} mục khác</p>` : ''}</div>
                <div class="card-footer">
                    <button class="btn btn-primary copy-btn" data-clipboard-text="${allEmailsText}">
                        <i class="fa-regular fa-copy"></i>
                        <span class="copy-text"> Sao chép tất cả (${totalVariations})</span>
                    </button>
                </div>
            </div>`;
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', handleGeneration);
    emailInput.addEventListener('keydown', e => e.key === 'Enter' && (e.preventDefault(), handleGeneration()));

    toolContainer.addEventListener('click', function (e) {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            copyToClipboard(copyBtn.dataset.clipboardText, copyBtn, !copyBtn.querySelector('.copy-text'));
        }
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            cardToDelete = deleteBtn.closest('.mailbox');
            deleteConfirmModal.classList.add('show');
        }
    });

    historyList.addEventListener('click', function (e) {
        if (toolContainer.classList.contains('delete-mode')) return;
        const saveBtn = e.target.closest('.save-note-btn');
        if (saveBtn) {
            const input = historyList.querySelector(`.note-input[data-email="${saveBtn.dataset.email}"]`);
            saveNoteForHistoryItem(saveBtn.dataset.email, input.value);
            saveBtn.textContent = 'Đã lưu!';
            setTimeout(() => { saveBtn.textContent = 'Lưu'; }, 1500);
        }
    });

    editHistoryBtn.addEventListener('click', () => toggleDeleteMode(true));
    cancelDeleteBtn.addEventListener('click', () => toggleDeleteMode(false));
    
    selectAllBtn.addEventListener('click', () => {
        const checkboxes = toolContainer.querySelectorAll('.history-item-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        selectAllBtn.textContent = allChecked ? 'Chọn tất cả' : 'Bỏ chọn';
    });

    deleteSelectedBtn.addEventListener('click', () => {
        const selectedEmails = Array.from(toolContainer.querySelectorAll('.history-item-checkbox:checked')).map(cb => cb.dataset.email);
        if (selectedEmails.length > 0) {
            let history = getHistoryFromStorage();
            saveHistoryToStorage(history.filter(item => !selectedEmails.includes(item.email)));
            toggleDeleteMode(false);
        } else {
            showToast('info', 'Thông báo', 'Vui lòng chọn mục cần xóa.');
        }
    });

    allModalCloseBtns.forEach(btn => btn.addEventListener('click', () => deleteConfirmModal.classList.remove('show')));
    confirmDeleteBtn.addEventListener('click', () => {
        if (cardToDelete) {
            saveCardsToStorage(getCardsFromStorage().filter(card => card.id.toString() !== cardToDelete.dataset.id));
            renderAllCards();
        }
        deleteConfirmModal.classList.remove('show');
    });
    
    // --- Initial render ---
    renderAllCards();
    renderCopyHistory();
});