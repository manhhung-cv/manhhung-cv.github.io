
function initGmailTrick() {
    const toolContainer = document.getElementById('gmail-trick');
    if (!toolContainer) return;

    // --- DOM Element References ---
    const generateBtn = toolContainer.querySelector('#generateBtn');
    const emailInput = toolContainer.querySelector('#emailInput');
    const errorMessage = toolContainer.querySelector('#error-message');
    const deleteConfirmModal = toolContainer.querySelector('#deleteConfirmModal');
    const cancelDeleteBtnModal = toolContainer.querySelector('#deleteConfirmModal .btn-cancel');
    const confirmDeleteBtn = toolContainer.querySelector('#confirmDeleteBtn');
    const cardsContainer = toolContainer.querySelector('#cards-container');
    const historyList = toolContainer.querySelector('#copy-history-list');
    const editHistoryBtn = toolContainer.querySelector('#edit-history-btn');
    const deleteActionsDiv = toolContainer.querySelector('.delete-actions');
    const selectAllBtn = toolContainer.querySelector('#select-all-btn');
    const deleteSelectedBtn = toolContainer.querySelector('#delete-selected-btn');
    const cancelDeleteBtn = toolContainer.querySelector('#cancel-delete-btn');

    // --- State and Constants ---
    const CARDS_STORAGE_KEY = 'gmailTrickCardsData';
    const HISTORY_STORAGE_KEY = 'gmailTrickHistory';
    let cardToDelete = null;

    // --- Helper Functions (Encapsulated) ---

    /**
     * Copies the given text to the clipboard and provides visual feedback.
     */
    function copyToClipboard(text, buttonElement, isIndividualCopy = false) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');

            if (isIndividualCopy) {
                addCopyToHistory(text);
            }

            if (buttonElement) {
                const originalContent = buttonElement.innerHTML;
                const buttonText = buttonElement.querySelector('.copy-text');
                if (buttonText) {
                    buttonText.textContent = 'Đã chép!';
                } else {
                    buttonElement.innerHTML = '<span style="font-size: 0.875rem;">Đã chép!</span>';
                }
                setTimeout(() => {
                    buttonElement.innerHTML = originalContent;
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Không thể sao chép.');
        }
        document.body.removeChild(textarea);
    }

    /**
     * Gets history data from localStorage.
     */
    function getHistoryFromStorage() {
        const data = localStorage.getItem(HISTORY_STORAGE_KEY);
        try {
            const parsed = data ? JSON.parse(data) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Saves history data to localStorage.
     */
    function saveHistoryToStorage(history) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }

    /**
     * Adds or updates an item in the copy history.
     */
    function addCopyToHistory(email) {
        let history = getHistoryFromStorage();
        const existingItem = history.find(item => item.email === email);
        const note = existingItem ? existingItem.note : '';
        const count = existingItem ? (existingItem.copyCount || 1) + 1 : 1;

        history = history.filter(item => item.email !== email);
        history.unshift({
            email: email,
            timestamp: new Date().toISOString(),
            note: note,
            copyCount: count
        });
        if (history.length > 20) {
            history.pop();
        }
        saveHistoryToStorage(history);
        renderCopyHistory();
    }

    /**
     * Saves a note for a specific history item.
     */
    function saveNoteForHistoryItem(email, note) {
        let history = getHistoryFromStorage();
        const itemIndex = history.findIndex(item => item.email === email);
        if (itemIndex > -1) {
            history[itemIndex].note = note;
            saveHistoryToStorage(history);
        }
    }

    /**
     * Toggles the UI for deleting history items.
     */
    function toggleDeleteMode(active) {
        if (active) {
            toolContainer.classList.add('delete-mode');
            editHistoryBtn.style.display = 'none';
            deleteActionsDiv.style.display = 'flex';
        } else {
            toolContainer.classList.remove('delete-mode');
            if (getHistoryFromStorage().length > 0) {
                editHistoryBtn.style.display = 'block';
            }
            deleteActionsDiv.style.display = 'none';
            selectAllBtn.textContent = 'Chọn tất cả';
            toolContainer.querySelectorAll('.history-item-checkbox').forEach(cb => cb.checked = false);
        }
        renderCopyHistory();
    }

    /**
     * Renders the copy history list.
     */
    function renderCopyHistory() {
        const isDeleteMode = toolContainer.classList.contains('delete-mode');
        const history = getHistoryFromStorage();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = `<li class="history-placeholder">Chưa có mục nào trong lịch sử.</li>`;
            editHistoryBtn.style.display = 'none';
            if (isDeleteMode) {
                toggleDeleteMode(false);
            }
        } else {
            if (!isDeleteMode) {
                editHistoryBtn.style.display = 'block';
            }
            history.forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = 'history-item';
                const formattedDate = new Date(item.timestamp).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const countDisplay = item.copyCount > 1 ? `<span class="copy-count">(${item.copyCount} lần)</span>` : '';
                const timestampLabel = item.copyCount > 1 ? 'Lần gần nhất: ' : '';

                listItem.innerHTML = `
                            <input type="checkbox" class="history-item-checkbox" data-email="${item.email}">
                            <div class="history-item-content">
                                <div class="history-item-header">
                                    <span class="history-item-email">${item.email}${countDisplay}</span>
                                    <button class="copy-btn individual-copy" data-clipboard-text="${item.email}" title="Sao chép lại">
                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </div>
                                <p class="history-item-timestamp">${timestampLabel}${formattedDate}</p>
                                <div class="note-group">
                                    <input type="text" class="note-input" placeholder="Thêm ghi chú..." value="${item.note || ''}" data-email="${item.email}">
                                    <button class="save-note-btn" data-email="${item.email}">Lưu</button>
                                </div>
                            </div>
                        `;
                historyList.appendChild(listItem);
            });
        }
    }

    /**
     * Gets card data from localStorage.
     */
    function getCardsFromStorage() {
        const data = localStorage.getItem(CARDS_STORAGE_KEY);
        try { return data ? JSON.parse(data) : []; } catch (e) { return []; }
    }

    /**
     * Saves card data to localStorage.
     */
    function saveCardsToStorage(cardsData) {
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardsData));
    }

    function openModal() {
        deleteConfirmModal.classList.add('modal-visible');
    }

    function closeModal() {
        deleteConfirmModal.classList.remove('modal-visible');
    }

    function renderAllCards() {
        cardsContainer.innerHTML = '';
        const cardsData = getCardsFromStorage();
        if (cardsData.length === 0) {
            cardsContainer.innerHTML = `
                        <div class="empty-state">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <h3>Chưa có email nào</h3>
                            <p>Hãy nhập một email để bắt đầu tạo biến thể.</p>
                        </div>`;
        } else {
            cardsData.forEach(cardData => {
                const username = cardData.email.split('@')[0];
                const reversedUsername = username.split('').reverse().join('');
                const reversedVariations = generateAllDotTricks(reversedUsername);
                const finalVariations = reversedVariations.map(v => v.split('').reverse().join(''));
                const variationsForCard = finalVariations.filter(v => v !== username);
                createResultCard(cardData.id, cardData.email, variationsForCard);
            });
        }
    }

    function handleGeneration() {
        let email = emailInput.value.trim().toLowerCase();
        if (email && !email.includes('@')) email += '@gmail.com';

        if (!email || !email.endsWith('@gmail.com')) {
            errorMessage.textContent = 'Vui lòng nhập một địa chỉ Gmail hợp lệ.'; return;
        }
        const username = email.split('@')[0];
        if (username.length === 0) {
            errorMessage.textContent = 'Tên người dùng không thể để trống.'; return;
        }
        if (username.length > 15) {
            errorMessage.textContent = 'Tên người dùng quá dài để tránh treo trình duyệt.'; return;
        }

        errorMessage.textContent = '';
        const cardsData = getCardsFromStorage();

        if (cardsData.some(card => card.email === email)) {
            errorMessage.textContent = 'Email này đã được thêm.'; return;
        }

        const newCard = { id: Date.now(), email: email };
        cardsData.unshift(newCard);
        saveCardsToStorage(cardsData);
        renderAllCards();
        emailInput.value = '';
        emailInput.focus();
    }

    function generateAllDotTricks(username) {
        const results = new Set();
        const n = username.length;
        if (n === 0) return [];
        const limit = 1 << (n - 1);
        for (let i = 0; i < limit; i++) {
            let newUsername = username[0];
            for (let j = 0; j < n - 1; j++) {
                if ((i >> j) & 1) newUsername += '.';
                newUsername += username[j + 1];
            }
            results.add(newUsername);
        }
        return Array.from(results);
    }

    function createResultCard(id, originalEmail, variations) {
        const card = document.createElement('div');
        card.className = 'card-item';
        card.dataset.id = id;

        const listItems = variations.map(variation => `
                    <div class="variation-item">
                        <span>${variation}@gmail.com</span>
                        <button class="copy-btn individual-copy" data-clipboard-text="${variation}@gmail.com">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>`).join('');

        const allEmailsText = variations.map(v => `${v}@gmail.com`).join('\n');

        card.innerHTML = `
                    <div class="card-header">
                        <div>
                            <p class="original-email-label">Email gốc</p>
                            <h3 class="original-email">${originalEmail}</h3>
                            <p class="variations-count">Đã tạo <span>${variations.length}</span> biến thể.</p>
                        </div>
                        <button class="delete-btn">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                    <div class="variations-list custom-scrollbar">${listItems}</div>
                    <div class="card-footer">
                        <button class="copy-all-btn copy-btn" data-clipboard-text="${allEmailsText}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1rem; height: 1rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 0-9.375 0" /></svg>
                            <span class="copy-text">Sao chép tất cả (${variations.length})</span>
                        </button>
                    </div>`;
        cardsContainer.appendChild(card);
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', handleGeneration);
    emailInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); handleGeneration(); }
    });

    toolContainer.addEventListener('click', function (e) {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            const isIndividual = !copyBtn.classList.contains('copy-all-btn');
            copyToClipboard(copyBtn.dataset.clipboardText, copyBtn, isIndividual);
            return;
        }
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            cardToDelete = deleteBtn.closest('.card-item');
            openModal();
        }
    });

    historyList.addEventListener('click', function (e) {
        if (toolContainer.classList.contains('delete-mode')) return;

        if (e.target.classList.contains('save-note-btn')) {
            const email = e.target.dataset.email;
            const input = historyList.querySelector(`.note-input[data-email="${email}"]`);
            if (input) {
                saveNoteForHistoryItem(email, input.value);
                const originalText = e.target.textContent;
                e.target.textContent = 'Đã lưu!';
                setTimeout(() => { e.target.textContent = originalText; }, 1500);
            }
        }
    });

    editHistoryBtn.addEventListener('click', () => toggleDeleteMode(true));
    cancelDeleteBtn.addEventListener('click', () => toggleDeleteMode(false));

    selectAllBtn.addEventListener('click', () => {
        const checkboxes = toolContainer.querySelectorAll('.history-item-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        if (allChecked) {
            checkboxes.forEach(cb => cb.checked = false);
            selectAllBtn.textContent = 'Chọn tất cả';
        } else {
            checkboxes.forEach(cb => cb.checked = true);
            selectAllBtn.textContent = 'Bỏ chọn tất cả';
        }
    });

    deleteSelectedBtn.addEventListener('click', () => {
        const selectedEmails = [];
        toolContainer.querySelectorAll('.history-item-checkbox:checked').forEach(cb => {
            selectedEmails.push(cb.dataset.email);
        });

        if (selectedEmails.length > 0) {
            let history = getHistoryFromStorage();
            history = history.filter(item => !selectedEmails.includes(item.email));
            saveHistoryToStorage(history);
            toggleDeleteMode(false);
        }
    });

    cancelDeleteBtnModal.addEventListener('click', closeModal);
    confirmDeleteBtn.addEventListener('click', () => {
        if (cardToDelete) {
            const cardId = cardToDelete.dataset.id;
            let cardsData = getCardsFromStorage();
            cardsData = cardsData.filter(card => card.id.toString() !== cardId);
            saveCardsToStorage(cardsData);
            renderAllCards();
            cardToDelete = null;
        }
        closeModal();
    });

    // Initial render on page load
    renderAllCards();
    renderCopyHistory();
}

document.addEventListener('DOMContentLoaded', initGmailTrick);
