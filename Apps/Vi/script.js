document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE MANAGEMENT
    let state = {
        wallets: [],
        transactions: [],
        savings: [],
        expenses: [],
        settings: {
            theme: 'dark',
            currency: 'VND',
            balanceVisible: true,
            categories: {
                expense: ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Mua sắm', 'Giải trí', 'Sức khỏe'],
                income: ['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng']
            }
        },
        activeInfoCardView: 'balance',
        editingWalletId: null,
        editingTransactionId: null,
        editingSavingGoalId: null,
        editingExpenseId: null,
        addingToSavingGoalId: null,
    };

    // 2. DOM ELEMENTS
    const body = document.body;
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const fabContainer = document.getElementById('fab-container');
    const fabMain = document.getElementById('fab-main');
    const fabBackdrop = document.getElementById('fab-backdrop');
    const toggleBalanceVisibilityBtn = document.getElementById('toggle-balance-visibility');

    // Dashboard
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardTabContents = document.querySelectorAll('.dashboard-tab-content');
    const dashboardTabGlider = document.getElementById('dashboard-tab-glider');
    const walletListContent = document.getElementById('wallets-content');
    const recentTransactionsContent = document.getElementById('recent-transactions-content');
    const infoCardNav = document.getElementById('info-card-nav');
    const infoCardPanes = document.querySelectorAll('.info-card-pane');

    // History Screen
    const historyScreen = document.getElementById('history-screen');
    const fullTransactionListEl = document.getElementById('full-transaction-list');

    // Other Screens
    const savingGoalsListEl = document.getElementById('saving-goals-list');
    const recurringExpensesTimelineEl = document.getElementById('recurring-expenses-timeline');

    // Modals & Forms
    const allModals = document.querySelectorAll('.modal-backdrop');
    const addTransactionModal = document.getElementById('add-transaction-modal');
    const editTransactionModal = document.getElementById('edit-transaction-modal');
    const addWalletModal = document.getElementById('add-wallet-modal');
    const editWalletModal = document.getElementById('edit-wallet-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const savingGoalModal = document.getElementById('saving-goal-modal');
    const recurringExpenseModal = document.getElementById('recurring-expense-modal');
    const addToSavingModal = document.getElementById('add-to-saving-modal');
    const transactionForm = document.getElementById('transaction-form');
    const editTransactionForm = document.getElementById('edit-transaction-form');
    const walletForm = document.getElementById('wallet-form');
    const editWalletForm = document.getElementById('edit-wallet-form');
    const savingGoalForm = document.getElementById('saving-goal-form');
    const recurringExpenseForm = document.getElementById('recurring-expense-form');
    const addToSavingForm = document.getElementById('add-to-saving-form');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

    let transactionType = 'expense';
    let editTransactionType = 'expense';
    let confirmCallback = () => { };

    // 3. CORE FUNCTIONS
    const saveData = () => localStorage.setItem('financeApp_v3.6', JSON.stringify(state));
    const loadData = () => {
        const data = localStorage.getItem('financeApp_v3.6');
        if (data) {
            const loadedState = JSON.parse(data);
            const defaultState = {
                wallets: [], transactions: [], savings: [], expenses: [],
                settings: { theme: 'dark', currency: 'VND', balanceVisible: true, categories: { expense: ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Mua sắm', 'Giải trí', 'Sức khỏe'], income: ['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng'] } },
            };
            state = { ...defaultState, ...loadedState, settings: { ...defaultState.settings, ...loadedState.settings } };
        } else {
            state.wallets.push({ id: Date.now(), name: 'Tài khoản VCB', balance: 10000000 });
            state.wallets.push({ id: Date.now() + 1, name: 'Tiền mặt', balance: 500000 });
        }
        applyTheme(state.settings.theme || 'dark');
        document.getElementById('currency-select').value = state.settings.currency;
    };

    const applyTheme = (themeName) => {
        body.className = `theme-${themeName}`;
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeName));
        state.settings.theme = themeName;
    };

    const switchScreen = (screenId) => {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
        navItems.forEach(item => item.classList.toggle('active', item.dataset.screen === screenId));
    };

    const openModal = (modal) => modal.classList.add('visible');
    const closeModal = (modal) => modal.classList.remove('visible');

    const showConfirmation = ({ title, message, okText = 'Đồng ý', onConfirm = () => { } }) => {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        confirmOkBtn.textContent = okText;
        confirmOkBtn.style.backgroundColor = okText.toLowerCase().includes('xóa') ? 'var(--expense-color)' : 'var(--primary-color)';
        confirmOkBtn.style.color = okText.toLowerCase().includes('xóa') ? 'white' : (state.settings.theme === 'light' ? 'white' : 'var(--background-color)');
        confirmCallback = onConfirm;
        openModal(confirmModal);
    };

    const formatCurrency = (num) => {
        if (!state.settings.balanceVisible) return '******';
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: state.settings.currency, minimumFractionDigits: 0 }).format(num);
        } catch (e) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
        }
    };

    const updateWalletOptions = (selectElement, excludeId = null) => {
        selectElement.innerHTML = state.wallets
            .filter(w => w.id !== excludeId)
            .map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    };

    const updateWalletFilters = () => {
        const historyWalletFilter = document.getElementById('history-wallet-filter');
        const currentVal = historyWalletFilter.value;
        historyWalletFilter.innerHTML = '<option value="all">Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
        historyWalletFilter.value = currentVal;
    };

    const formatDateHeader = (date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const transactionDate = new Date(date);

        if (transactionDate.toDateString() === today.toDateString()) return 'Hôm nay';
        if (transactionDate.toDateString() === yesterday.toDateString()) return 'Hôm qua';
        return transactionDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // 4. RENDERING FUNCTIONS
    const renderAll = () => {
        renderDashboard();
        renderHistory();
        renderSavingsScreen();
        renderExpensesScreen();
        updateWalletFilters();
        saveData();
    };

    const renderDashboard = () => {
        renderInfoCard();
        walletListContent.innerHTML = state.wallets.map(wallet => `<div class="list-item p-4 rounded-xl flex justify-between items-center" style="background-color: var(--card-background)"><div class="flex items-center"><div class="w-10 h-10 rounded-full flex items-center justify-center mr-4" style="background-color: var(--background-color);"><i class="fas fa-wallet" style="color:var(--primary-color);"></i></div><div><p class="font-semibold">${wallet.name}</p><p class="text-sm" style="color:var(--text-secondary)">Số dư</p></div></div><div class="flex items-center"><p class="font-bold text-lg mr-2">${formatCurrency(wallet.balance)}</p><button class="edit-wallet-btn p-2 text-sm" data-id="${wallet.id}" style="color:var(--text-secondary);"><i class="fas fa-edit"></i></button><button class="delete-wallet-btn p-2 text-sm" data-id="${wallet.id}" style="color:var(--text-secondary);"><i class="fas fa-trash-alt"></i></button></div></div>`).join('') || `<p class="text-center py-4" style="color:var(--text-secondary)">Chưa có ví nào.</p>`;
        const recentTxs = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        recentTransactionsContent.innerHTML = recentTxs.map(createTransactionHTML).join('') || `<div class="text-center py-4" style="color:var(--text-secondary)"><i class="fas fa-receipt text-3xl mb-2"></i><p>Chưa có giao dịch nào.</p></div>`;
    };

    const renderInfoCard = () => {
        const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
        const monthStart = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
        const monthlyTxs = state.transactions.filter(tx => new Date(tx.date) >= monthStart);
        const totalIncome = monthlyTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = monthlyTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const totalSaved = state.savings.reduce((sum, s) => sum + s.savedAmount, 0);
        const totalSavingTarget = state.savings.reduce((sum, s) => sum + s.targetAmount, 0);
        const totalMonthlyExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);

        document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
        document.getElementById('total-income').textContent = formatCurrency(totalIncome);
        document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
        document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
        document.getElementById('total-saving-target').textContent = `/ ${formatCurrency(totalSavingTarget)}`;
        document.getElementById('total-monthly-expenses').textContent = formatCurrency(totalMonthlyExpenses);
        document.getElementById('total-expenses-count').textContent = `${state.expenses.length} chi phí định kỳ`;

        infoCardPanes.forEach(pane => pane.classList.toggle('active', pane.id === `${state.activeInfoCardView}-view`));
        document.querySelectorAll('.info-card-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === state.activeInfoCardView));
    };

    const createTransactionHTML = (tx) => {
        const wallet = state.wallets.find(w => w.id === tx.walletId);
        const isIncome = tx.type === 'income';
        const color = isIncome ? 'var(--income-color)' : 'var(--expense-color)';
        const icon = ['Chuyển tiền đi', 'Nhận tiền', 'Nạp tiền tiết kiệm'].includes(tx.category) ? 'fa-exchange-alt' : (isIncome ? 'fa-arrow-up' : 'fa-arrow-down');

        const transactionTime = new Date(tx.date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Cấu trúc HTML mới, gọn gàng hơn
        return `
            <div class="transaction-item list-item flex items-center cursor-pointer" data-id="${tx.id}">
                <div class="w-9 h-9 rounded-full flex items-center justify-center mr-3" style="background-color: color-mix(in srgb, ${color} 15%, transparent);">
                    <i class="fas ${icon} text-sm" style="color: ${color};"></i>
                </div>
                <div class="flex-grow">
                    <p class="font-semibold leading-tight">${tx.category}</p>
                    <p class="text-xs leading-tight" style="color:var(--text-secondary)">
                        <span>${wallet ? wallet.name : 'Ví đã xóa'}</span>
                        <span class="mx-1">•</span>
                        <span>${transactionTime}</span>
                    </p>
                </div>
                <p class="font-bold text-right ml-2" style="color: ${isIncome ? 'var(--income-color)' : 'var(--text-primary)'};">
                    ${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}
                </p>
            </div>
        `;
    };

    const renderHistory = () => {
        const searchTerm = document.getElementById('history-search-input').value.toLowerCase();
        const typeFilter = document.getElementById('history-type-filter').value;
        const walletFilter = document.getElementById('history-wallet-filter').value;
        const startDate = document.getElementById('history-start-date').value;
        const endDate = document.getElementById('history-end-date').value;

        let filteredTxs = state.transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);

            const matchSearch = tx.category.toLowerCase().includes(searchTerm) || (tx.description && tx.description.toLowerCase().includes(searchTerm));
            const matchType = typeFilter === 'all' || tx.type === typeFilter;
            const matchWallet = walletFilter === 'all' || tx.walletId == walletFilter;
            const matchDate = (!start || txDate >= start) && (!end || txDate <= end);

            return matchSearch && matchType && matchWallet && matchDate;
        });

        const grouped = filteredTxs.sort((a, b) => new Date(b.date) - new Date(a.date))
            .reduce((acc, tx) => {
                const dateKey = new Date(tx.date).toLocaleDateString();
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(tx);
                return acc;
            }, {});

        if (Object.keys(grouped).length === 0) {
            fullTransactionListEl.innerHTML = `
                <div class="text-center py-12 mt-4" style="color:var(--text-secondary)">
                    <i class="fas fa-search-dollar text-5xl mb-4" style="color:var(--primary-color);"></i>
                    <p class="text-lg font-semibold mb-2">Không tìm thấy giao dịch.</p>
                    <p class="text-sm">Hãy thử điều chỉnh bộ lọc hoặc tạo giao dịch mới.</p>
                </div>
            `;
            return;
        }

        let html = '';
        for (const dateKey in grouped) {
            // Bắt đầu một thẻ card cho mỗi ngày
            html += `<div class="day-group-card">`;
            html += `<div class="date-header">${formatDateHeader(grouped[dateKey][0].date)}</div>`;
            // Thêm các giao dịch của ngày đó vào trong card
            html += grouped[dateKey].map(createTransactionHTML).join('');
            // Đóng thẻ card
            html += `</div>`;
        }
        fullTransactionListEl.innerHTML = html;
    };

    const renderSavingsScreen = () => {
        savingGoalsListEl.innerHTML = state.savings.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            return `<div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);"><div class="flex items-start justify-between"><div class="flex items-center"><span class="text-2xl mr-4">${goal.icon || '🎯'}</span><div><p class="font-bold">${goal.name}</p><p class="text-xs" style="color: var(--text-secondary);">${goal.note || ''}</p></div></div><div class="flex gap-2"><button class="edit-saving-btn p-2" data-id="${goal.id}"><i class="fas fa-edit"></i></button><button class="delete-saving-btn p-2" data-id="${goal.id}"><i class="fas fa-trash"></i></button></div></div><div class="mt-4"><div class="progress-bar rounded-full h-2"><div class="progress-bar-inner rounded-full" style="width: ${Math.min(progress, 100)}%;"></div></div><div class="flex justify-between items-center mt-2 text-sm"><p class="font-semibold" style="color: var(--primary-color);">${formatCurrency(goal.savedAmount)}</p><p style="color: var(--text-secondary);">/ ${formatCurrency(goal.targetAmount)}</p></div></div><button class="add-to-saving-btn mt-4 w-full btn btn-secondary !py-2 text-sm" data-id="${goal.id}">Nạp tiền</button></div>`;
        }).join('') || `<div class="text-center py-12" style="color:var(--text-secondary)"><i class="fas fa-piggy-bank text-5xl mb-4"></i><p>Chưa có mục tiêu tiết kiệm nào.</p></div>`;
    };

    const renderExpensesScreen = () => {
        recurringExpensesTimelineEl.innerHTML = `<div class="relative">${state.expenses.length > 1 ? '<div class="absolute top-5 h-full ml-5 -translate-x-1/2 border-l-2" style="border-color: var(--border-color)"></div>' : ''}${[...state.expenses].sort((a, b) => a.day - b.day).map(expense => `<div class="flex"><div class="timeline-icon flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl z-10">${expense.icon || '💰'}</div><div class="flex-grow pl-4 pb-6"><div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);"><div class="flex justify-between items-start"><div><p class="font-bold">${expense.name}</p><p class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style="background-color: ${expense.type === 'fixed' ? 'var(--border-color)' : `color-mix(in srgb, var(--primary-color) 30%, transparent)`};">${expense.type === 'fixed' ? 'Cố định' : 'Linh hoạt'}</p></div><div class="flex gap-2"><button class="edit-expense-btn p-2" data-id="${expense.id}"><i class="fas fa-edit"></i></button><button class="delete-expense-btn p-2" data-id="${expense.id}"><i class="fas fa-trash"></i></button></div></div><p class="text-2xl font-bold my-2" style="color: var(--expense-color);">${formatCurrency(expense.amount)}</p><p class="text-xs" style="color: var(--text-secondary);">Ngày ${expense.day} hàng tháng</p>${expense.note ? `<p class="text-xs mt-2 italic" style="color: var(--text-secondary);">${expense.note}</p>` : ''}</div></div></div>`).join('') || `<div class="text-center py-12" style="color:var(--text-secondary)"><i class="fas fa-calendar-alt text-5xl mb-4"></i><p>Chưa có chi phí định kỳ nào.</p></div>`}</div>`;
    };

    // 5. EVENT LISTENERS & HANDLERS
    navItems.forEach(item => item.addEventListener('click', () => { if (item.dataset.screen) switchScreen(item.dataset.screen); }));
    fabMain.addEventListener('click', () => { fabContainer.classList.toggle('active'); fabBackdrop.classList.toggle('active'); });
    fabBackdrop.addEventListener('click', () => { fabContainer.classList.remove('active'); fabBackdrop.classList.remove('active'); });

    toggleBalanceVisibilityBtn.addEventListener('click', () => {
        state.settings.balanceVisible = !state.settings.balanceVisible;
        toggleBalanceVisibilityBtn.querySelector('i').className = state.settings.balanceVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
        renderAll();
    });

    const closeFab = () => { fabContainer.classList.remove('active'); fabBackdrop.classList.remove('active'); }
    document.getElementById('quick-action-expense').addEventListener('click', () => openTransactionModal('expense'));
    document.getElementById('quick-action-income').addEventListener('click', () => openTransactionModal('income'));
    document.getElementById('quick-action-transfer').addEventListener('click', () => openTransactionModal('transfer'));
    document.getElementById('quick-action-add-wallet').addEventListener('click', openAddWalletModal);

    document.getElementById('add-saving-goal-btn').addEventListener('click', () => openSavingGoalModal());
    document.getElementById('add-recurring-expense-btn').addEventListener('click', () => openRecurringExpenseModal());

    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        modal.querySelector('.btn-cancel-modal')?.addEventListener('click', () => closeModal(modal));
    });

    confirmOkBtn.addEventListener('click', () => { confirmCallback(); closeModal(confirmModal); });
    confirmCancelBtn.addEventListener('click', () => closeModal(confirmModal));

    document.querySelectorAll('#history-screen input, #history-screen select').forEach(el => el.addEventListener('input', renderHistory));

    dashboardTabs.forEach((tab, index) => tab.addEventListener('click', () => {
        if (dashboardTabGlider) { dashboardTabGlider.style.left = `${index * 50}%`; }
        dashboardTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        dashboardTabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab.dataset.tab}-content`)?.classList.add('active');
    }));

    infoCardNav.addEventListener('click', (e) => { const tab = e.target.closest('.info-card-tab'); if (tab && tab.dataset.view) { state.activeInfoCardView = tab.dataset.view; renderInfoCard(); } });

    // FORM SUBMISSION & MODAL LOGIC
    function openAddWalletModal() { walletForm.reset(); document.getElementById('initial-balance').value = 0; openModal(addWalletModal); }
    walletForm.addEventListener('submit', (e) => { e.preventDefault(); state.wallets.push({ id: Date.now(), name: document.getElementById('wallet-name').value, balance: parseFloat(document.getElementById('initial-balance').value) || 0 }); closeModal(addWalletModal); renderAll(); });
    function openEditWalletModal(walletId) { state.editingWalletId = walletId; const wallet = state.wallets.find(w => w.id === walletId); if (wallet) { document.getElementById('edit-wallet-name').value = wallet.name; document.getElementById('edit-wallet-balance').value = wallet.balance; openModal(editWalletModal); } }
    editWalletForm.addEventListener('submit', (e) => { e.preventDefault(); const wallet = state.wallets.find(w => w.id === state.editingWalletId); if (wallet) { const newName = document.getElementById('edit-wallet-name').value; const newBalance = parseFloat(document.getElementById('edit-wallet-balance').value); const oldBalance = wallet.balance; const adjustment = newBalance - oldBalance; if (adjustment !== 0) { const adjType = adjustment > 0 ? 'income' : 'expense'; state.transactions.push({ id: Date.now(), type: adjType, amount: Math.abs(adjustment), category: "Điều chỉnh số dư", walletId: wallet.id, description: `Thay đổi số dư`, date: new Date().toISOString() }); } wallet.name = newName; wallet.balance = newBalance; } closeModal(editWalletModal); renderAll(); });

    function setupTransactionModalUI(type, modal = addTransactionModal) {
        transactionType = type;
        const title = modal.querySelector('#transaction-modal-title');
        const transactionFields = modal.querySelector('#transaction-fields');
        const transferFields = modal.querySelector('#transfer-fields');
        const typeButtons = modal.querySelectorAll('.transaction-type-btn');

        const requiredFieldsNormal = [modal.querySelector('#amount'), modal.querySelector('#category'), modal.querySelector('#wallet-select'), modal.querySelector('#transaction-date')];
        const requiredFieldsTransfer = [modal.querySelector('#transfer-amount'), modal.querySelector('#from-wallet-select'), modal.querySelector('#to-wallet-select'), modal.querySelector('#transfer-date')];

        typeButtons.forEach(btn => { btn.style.backgroundColor = 'var(--background-color)'; btn.style.color = 'var(--text-secondary)'; });

        if (type === 'transfer') {
            title.textContent = "Chuyển Tiền";
            transactionFields.classList.add('hidden');
            transferFields.classList.remove('hidden');
            modal.querySelector('[data-type="transfer"]').style.backgroundColor = 'var(--primary-color)';
            requiredFieldsNormal.forEach(el => el.required = false);
            requiredFieldsTransfer.forEach(el => el.required = true);
        } else {
            title.textContent = "Thêm Giao Dịch";
            transactionFields.classList.remove('hidden');
            transferFields.classList.add('hidden');
            const btn = modal.querySelector(`[data-type="${type}"]`);
            btn.style.backgroundColor = `var(--${type}-color)`;
            btn.style.color = 'white';
            modal.querySelector('#wallet-select-label').textContent = type === 'income' ? 'Vào ví' : 'Từ ví';
            requiredFieldsNormal.forEach(el => el.required = true);
            requiredFieldsTransfer.forEach(el => el.required = false);
        }
    }

    function openTransactionModal(type) {
        if (state.wallets.length === 0 && type !== 'transfer') { showConfirmation({ title: 'Chưa có ví', message: 'Bạn cần tạo ví trước.', okText: 'OK' }); return; }
        if (state.wallets.length < 2 && type === 'transfer') { showConfirmation({ title: 'Yêu cầu 2 ví', message: 'Bạn cần ít nhất 2 ví để chuyển tiền.', okText: 'OK' }); return; }

        transactionForm.reset();
        setupTransactionModalUI(type);

        if (type !== 'transfer') {
            document.getElementById('transaction-date').valueAsDate = new Date();
            updateWalletOptions(document.getElementById('wallet-select'));
            renderCategoryChips(type, document.getElementById('category-chips-container'), document.getElementById('category'));
        } else {
            document.getElementById('transfer-date').valueAsDate = new Date();
            updateWalletOptions(document.getElementById('from-wallet-select'));
            updateWalletOptions(document.getElementById('to-wallet-select'));
            if (document.getElementById('to-wallet-select').options.length > 1) {
                document.getElementById('to-wallet-select').selectedIndex = 1;
            }
        }
        openModal(addTransactionModal);
    }

    addTransactionModal.querySelectorAll('.transaction-type-btn').forEach(btn => btn.addEventListener('click', () => setupTransactionModalUI(btn.dataset.type)));

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (transactionType === 'transfer') {
            const amount = parseFloat(document.getElementById('transfer-amount').value);
            const fromId = parseInt(document.getElementById('from-wallet-select').value);
            const toId = parseInt(document.getElementById('to-wallet-select').value);
            const date = document.getElementById('transfer-date').value;
            if (fromId === toId) { showConfirmation({ title: 'Lỗi', message: 'Ví nguồn và ví đích không được trùng nhau.', okText: 'OK' }); return; }
            const fromWallet = state.wallets.find(w => w.id === fromId);
            const toWallet = state.wallets.find(w => w.id === toId);
            if (!fromWallet || !toWallet || !amount || amount <= 0) return;
            if (fromWallet.balance < amount) { showConfirmation({ title: 'Không đủ số dư', message: `Ví "${fromWallet.name}" không đủ tiền.`, okText: 'OK' }); return; }
            const txDate = date ? new Date(date).toISOString() : new Date().toISOString();
            const desc = document.getElementById('description').value || `Từ ${fromWallet.name} đến ${toWallet.name}`;
            state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Chuyển tiền đi', walletId: fromId, description: desc, date: txDate });
            fromWallet.balance -= amount;
            state.transactions.push({ id: Date.now() + 1, type: 'income', amount, category: 'Nhận tiền', walletId: toId, description: desc, date: txDate });
            toWallet.balance += amount;
        } else {
            const amount = parseFloat(document.getElementById('amount').value);
            const walletId = parseInt(document.getElementById('wallet-select').value);
            const category = document.getElementById('category').value;
            const date = document.getElementById('transaction-date').value;
            const wallet = state.wallets.find(w => w.id === walletId);
            if (!wallet || !amount || amount <= 0 || !category) { if (!category) showConfirmation({ title: 'Thiếu thông tin', message: 'Vui lòng chọn một hạng mục.', okText: 'OK' }); return; }
            const txDate = date ? new Date(date).toISOString() : new Date().toISOString();
            state.transactions.push({ id: Date.now(), type: transactionType, amount, category, walletId, description: document.getElementById('description').value, date: txDate });
            wallet.balance += (transactionType === 'income' ? amount : -amount);
        }
        closeModal(addTransactionModal);
        renderAll();
    });

    function renderCategoryChips(type, container, hiddenInput, selectedCategory = null) {
        const categories = state.settings.categories[type] || [];
        container.innerHTML = categories.map(cat => `<button type="button" class="category-chip ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join('') + `<button type="button" class="category-chip add-category-btn">+</button>`;
        hiddenInput.value = selectedCategory || '';
        const addCategoryForm = container.nextElementSibling;
        if (addCategoryForm) { addCategoryForm.classList.add('hidden'); addCategoryForm.querySelector('input').value = ''; }
    }

    function handleCategoryChipClick(event) {
        const target = event.target;
        const form = target.closest('form');
        if (!form) return;

        if (target.classList.contains('category-chip')) {
            const container = target.parentElement;
            const hiddenInput = form.querySelector('input[type="hidden"][id*="category"]');
            const addCategoryForm = container.nextElementSibling;

            if (target.classList.contains('add-category-btn')) {
                addCategoryForm.classList.toggle('hidden');
                if (!addCategoryForm.classList.contains('hidden')) { addCategoryForm.querySelector('input').focus(); }
            } else {
                container.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
                target.classList.add('active');
                hiddenInput.value = target.dataset.category;
            }
        }
        if (target.closest('.save-new-category-btn')) {
            const addCategoryForm = target.closest('.add-category-form');
            const newCategoryInput = addCategoryForm.querySelector('input');
            const newCategory = newCategoryInput.value.trim();
            if (newCategory) {
                const currentType = form.id.includes('edit') ? editTransactionType : transactionType;
                if (!state.settings.categories[currentType].includes(newCategory)) {
                    state.settings.categories[currentType].push(newCategory);
                    saveData();
                    renderCategoryChips(currentType, form.querySelector('[id*="category-chips-container"]'), form.querySelector('input[type="hidden"][id*="category"]'), newCategory);
                }
            }
        }
    }
    addTransactionModal.addEventListener('click', handleCategoryChipClick);
    editTransactionModal.addEventListener('click', handleCategoryChipClick);

    // Other form handlers
    function openEditTransactionModal(txId) { const tx = state.transactions.find(t => t.id === txId); if (!tx || ["Điều chỉnh số dư", "Chuyển tiền đi", "Nhận tiền", "Nạp tiền tiết kiệm"].includes(tx.category)) { showConfirmation({ title: 'Thông Báo', message: 'Giao dịch tự động không thể chỉnh sửa.', okText: 'OK' }); return; } state.editingTransactionId = txId; updateWalletOptions(document.getElementById('edit-wallet-select'));['amount', 'wallet-select', 'description'].forEach(id => document.getElementById(`edit-${id}`).value = tx[id === 'wallet-select' ? 'walletId' : id]); const txDate = new Date(tx.date); document.getElementById('edit-transaction-date').value = txDate.toISOString().split('T')[0]; editTransactionType = tx.type; const editTypeExpenseBtn = document.getElementById('edit-type-expense'); const editTypeIncomeBtn = document.getElementById('edit-type-income'); if (tx.type === 'income') { editTypeIncomeBtn.style.backgroundColor = 'var(--income-color)'; editTypeIncomeBtn.style.color = 'white'; editTypeExpenseBtn.style.backgroundColor = 'var(--border-color)'; editTypeExpenseBtn.style.color = 'var(--text-secondary)'; } else { editTypeExpenseBtn.style.backgroundColor = 'var(--expense-color)'; editTypeExpenseBtn.style.color = 'white'; editTypeIncomeBtn.style.backgroundColor = 'var(--border-color)'; editTypeIncomeBtn.style.color = 'var(--text-secondary)'; } renderCategoryChips(tx.type, document.getElementById('edit-category-chips-container'), document.getElementById('edit-category'), tx.category); openModal(editTransactionModal); }
    editTransactionForm.addEventListener('submit', (e) => { e.preventDefault(); const txIndex = state.transactions.findIndex(t => t.id === state.editingTransactionId); if (txIndex === -1) return; const originalTx = { ...state.transactions[txIndex] }; const originalWallet = state.wallets.find(w => w.id === originalTx.walletId); if (originalWallet) { originalWallet.balance += originalTx.type === 'expense' ? originalTx.amount : -originalTx.amount; } const newAmount = parseFloat(document.getElementById('edit-amount').value); const newWalletId = parseInt(document.getElementById('edit-wallet-select').value); const newWallet = state.wallets.find(w => w.id === newWalletId); const newDate = document.getElementById('edit-transaction-date').value; if (newWallet) { newWallet.balance += editTransactionType === 'income' ? newAmount : -newAmount; } state.transactions[txIndex] = { ...originalTx, type: editTransactionType, amount: newAmount, category: document.getElementById('edit-category').value, walletId: newWalletId, description: document.getElementById('edit-description').value, date: new Date(newDate).toISOString() }; closeModal(editTransactionModal); renderAll(); });
    document.getElementById('delete-transaction-btn').addEventListener('click', () => { showConfirmation({ title: 'Xóa Giao Dịch?', message: 'Bạn chắc chắn muốn xóa vĩnh viễn giao dịch này?', okText: 'Xóa', onConfirm: () => { const txIndex = state.transactions.findIndex(t => t.id === state.editingTransactionId); if (txIndex === -1) return; const txToDelete = state.transactions[txIndex]; const wallet = state.wallets.find(w => w.id === txToDelete.walletId); if (wallet) { wallet.balance += txToDelete.type === 'expense' ? txToDelete.amount : -txToDelete.amount; } state.transactions.splice(txIndex, 1); closeModal(editTransactionModal); renderAll(); } }); });
    function openSavingGoalModal(goalId = null) { state.editingSavingGoalId = goalId; savingGoalForm.reset(); if (goalId) { const goal = state.savings.find(s => s.id === goalId); document.getElementById('saving-goal-modal-title').textContent = "Chỉnh Sửa Mục Tiêu";['name', 'icon', 'target', 'deadline', 'note'].forEach(id => document.getElementById(`saving-${id}`).value = goal[id === 'target' ? 'targetAmount' : id] || ''); } else { document.getElementById('saving-goal-modal-title').textContent = "Thêm Mục Tiêu Mới"; } openModal(savingGoalModal); }
    function openRecurringExpenseModal(expenseId = null) { state.editingExpenseId = expenseId; recurringExpenseForm.reset(); if (expenseId) { const expense = state.expenses.find(e => e.id === expenseId); document.getElementById('recurring-expense-modal-title').textContent = "Chỉnh Sửa Chi Phí";['name', 'icon', 'amount', 'type', 'date', 'note'].forEach(id => document.getElementById(`expense-${id}`).value = expense[id === 'date' ? 'day' : id] || ''); } else { document.getElementById('recurring-expense-modal-title').textContent = "Thêm Chi Phí Định Kỳ"; } openModal(recurringExpenseModal); }
    savingGoalForm.addEventListener('submit', e => { e.preventDefault(); const goalData = { name: document.getElementById('saving-name').value, icon: document.getElementById('saving-icon').value, targetAmount: parseFloat(document.getElementById('saving-target').value), deadline: document.getElementById('saving-deadline').value, note: document.getElementById('saving-note').value }; if (state.editingSavingGoalId) { const index = state.savings.findIndex(s => s.id === state.editingSavingGoalId); state.savings[index] = { ...state.savings[index], ...goalData }; } else { state.savings.push({ ...goalData, id: Date.now(), savedAmount: 0, history: [] }); } closeModal(savingGoalModal); renderAll(); });
    recurringExpenseForm.addEventListener('submit', e => { e.preventDefault(); const expenseData = { name: document.getElementById('expense-name').value, icon: document.getElementById('expense-icon').value, amount: parseFloat(document.getElementById('expense-amount').value), type: document.getElementById('expense-type').value, day: parseInt(document.getElementById('expense-date').value), note: document.getElementById('expense-note').value }; if (state.editingExpenseId) { const index = state.expenses.findIndex(ex => ex.id === state.editingExpenseId); state.expenses[index] = { ...state.expenses[index], ...expenseData }; } else { state.expenses.push({ ...expenseData, id: Date.now() }); } closeModal(recurringExpenseModal); renderAll(); });
    addToSavingForm.addEventListener('submit', e => { e.preventDefault(); const amount = parseFloat(document.getElementById('add-saving-amount').value); const walletId = parseInt(document.getElementById('add-saving-wallet-select').value); const goal = state.savings.find(s => s.id === state.addingToSavingGoalId); const wallet = state.wallets.find(w => w.id === walletId); if (!amount || !goal || !wallet || amount <= 0) return; if (wallet.balance < amount) { showConfirmation({ title: 'Không đủ số dư', message: `Ví "${wallet.name}" không đủ tiền.`, okText: 'OK' }); return; } wallet.balance -= amount; goal.savedAmount += amount; goal.history.push({ date: new Date().toISOString(), amount, walletId }); state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Nạp tiền tiết kiệm', walletId, description: `Nạp vào "${goal.name}"`, date: new Date().toISOString() }); closeModal(addToSavingModal); renderAll(); });

    // --- EVENT DELEGATION
    document.addEventListener('click', (e) => {
        const delegatedActions = {
            '.edit-wallet-btn': (el) => openEditWalletModal(parseInt(el.dataset.id)),
            '.delete-wallet-btn': (el) => { const id = parseInt(el.dataset.id); const wallet = state.wallets.find(w => w.id === id); const txCount = state.transactions.filter(tx => tx.walletId === id).length; showConfirmation({ title: `Xóa Ví "${wallet.name}"?`, message: `Thao tác này sẽ xóa ${txCount} giao dịch liên quan.`, okText: 'Xóa', onConfirm: () => { state.transactions = state.transactions.filter(tx => tx.walletId !== id); state.wallets = state.wallets.filter(w => w.id !== id); renderAll(); } }); },
            '.transaction-item': (el) => openEditTransactionModal(parseInt(el.dataset.id)),
            '.edit-saving-btn': (el) => openSavingGoalModal(parseInt(el.dataset.id)),
            '.delete-saving-btn': (el) => { const id = parseInt(el.dataset.id); showConfirmation({ title: 'Xóa Mục Tiêu?', message: 'Tiền đã tiết kiệm sẽ không được hoàn lại ví.', okText: 'Xóa', onConfirm: () => { state.savings = state.savings.filter(s => s.id !== id); renderAll(); } }); },
            '.add-to-saving-btn': (el) => { state.addingToSavingGoalId = parseInt(el.dataset.id); updateWalletOptions(document.getElementById('add-saving-wallet-select')); addToSavingForm.reset(); openModal(addToSavingModal); },
            '.edit-expense-btn': (el) => openRecurringExpenseModal(parseInt(el.dataset.id)),
            '.delete-expense-btn': (el) => { const id = parseInt(el.dataset.id); showConfirmation({ title: 'Xóa Chi Phí?', message: 'Bạn có muốn xóa chi phí định kỳ này?', okText: 'Xóa', onConfirm: () => { state.expenses = state.expenses.filter(ex => ex.id !== id); renderAll(); } }); }
        };
        for (const selector in delegatedActions) {
            const element = e.target.closest(selector);
            if (element) { delegatedActions[selector](element); break; }
        }
    });

    // --- Settings & Data I/O
    document.querySelector('.theme-btn').parentElement.addEventListener('click', e => { if (e.target.closest('.theme-btn')) { applyTheme(e.target.closest('.theme-btn').dataset.theme); saveData(); } });
    document.getElementById('currency-select').addEventListener('change', () => { state.settings.currency = document.getElementById('currency-select').value; renderAll(); });
    document.getElementById('export-data-btn').addEventListener('click', () => { const dataStr = JSON.stringify(state, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = `tro-ly-tai-chinh-data-${new Date().toISOString().split('T')[0]}.json`; link.click(); URL.revokeObjectURL(url); });
    document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
    document.getElementById('import-file-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; showConfirmation({ title: 'Nhập Dữ Liệu', message: 'Thao tác này sẽ ghi đè lên toàn bộ dữ liệu hiện tại.', okText: 'Nhập', onConfirm: () => { const reader = new FileReader(); reader.onload = (e) => { try { const importedState = JSON.parse(e.target.result); if (importedState.wallets && importedState.transactions && importedState.settings) { state = importedState; applyTheme(state.settings.theme || 'dark'); document.getElementById('currency-select').value = state.settings.currency; renderAll(); } else { showConfirmation({ title: 'Lỗi', message: 'Tệp dữ liệu không hợp lệ.', okText: 'OK' }); } } catch (error) { showConfirmation({ title: 'Lỗi', message: 'Không thể đọc tệp.', okText: 'OK' }); } }; reader.readAsText(file); } }); event.target.value = ''; });

    // --- INITIAL LOAD ---
    loadData();
    renderAll();
});