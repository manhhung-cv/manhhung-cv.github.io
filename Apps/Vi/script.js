// Đăng ký Service Worker để hoạt động offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker đã được đăng ký thành công:', registration.scope);
            })
            .catch(err => {
                console.log('Đăng ký Service Worker thất bại:', err);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // [FIREBASE] 1. CẤU HÌNH FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyA154aDjGrayZKcNB7-VjtZGKz22Op3U4g",
        authDomain: "smart-wallet-hunq.firebaseapp.com",
        projectId: "smart-wallet-hunq",
        storageBucket: "smart-wallet-hunq.firebasestorage.app",
        messagingSenderId: "707382516261",
        appId: "1:707382516261:web:d735f3672661dc0d25bdcc",
        measurementId: "G-MJ81D7D757"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // 1. STATE MANAGEMENT
    const getDefaultState = () => ({
        wallets: [{ id: Date.now(), name: 'Tiền mặt', balance: 0 }],
        transactions: [],
        funds: [], // [CẬP NHẬT] Đổi tên từ savings -> funds
        expenses: [],
        debts: [], // [MỚI] Thêm sổ nợ
        settings: {
            theme: 'dark',
            currency: 'VND',
            balanceVisible: true,
            autoBackup: true,
            categories: {
                expense: ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Mua sắm', 'Giải trí', 'Sức khỏe'],
                income: ['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng']
            },
            budgetAllocation: { // [MỚI] Phân bổ ngân sách
                customize: false,
                essential: 50,
                wants: 30,
                savings: 20,
                categoryMap: {} // Map 'Category Name' -> 'essential' | 'wants'
            }
        },
        uiState: {
            activeScreen: 'dashboard-screen',
            activeDashboardTab: 'wallets',
            activeInfoCardView: 'balance'
        },
        editingWalletId: null,
        editingTransactionId: null,
        editingSavingGoalId: null,
        editingExpenseId: null,
        editingDebtId: null, // [MỚI]
        payingDebtId: null, // [MỚI]
        addingToSavingGoalId: null,
        withdrawingFromSavingGoalId: null,
    });

    let state = getDefaultState();
    state.currentUser = null;
    let autoBackupTimeout;

    // 2. DOM ELEMENTS
    const body = document.body;
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const toggleBalanceVisibilityBtn = document.getElementById('toggle-balance-visibility');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardTabContents = document.querySelectorAll('.dashboard-tab-content');
    const dashboardTabGlider = document.getElementById('dashboard-tab-glider');
    const walletListContent = document.getElementById('wallets-content');
    const recentTransactionsContent = document.getElementById('recent-transactions-content');
    const infoCardNav = document.getElementById('info-card-nav');
    const infoCardPanes = document.querySelectorAll('.info-card-pane');
    const fullTransactionListEl = document.getElementById('full-transaction-list');
    const savingGoalsListEl = document.getElementById('saving-goals-list');
    const recurringExpensesTimelineEl = document.getElementById('recurring-expenses-timeline');
    const allModals = document.querySelectorAll('.modal-backdrop');
    const addTransactionModal = document.getElementById('add-transaction-modal');
    const editTransactionModal = document.getElementById('edit-transaction-modal');
    const addWalletModal = document.getElementById('add-wallet-modal');
    const editWalletModal = document.getElementById('edit-wallet-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const savingGoalModal = document.getElementById('saving-goal-modal');
    const recurringExpenseModal = document.getElementById('recurring-expense-modal');
    const addToSavingModal = document.getElementById('add-to-saving-modal');
    const withdrawFromSavingModal = document.getElementById('withdraw-from-saving-modal');
    const restoreModal = document.getElementById('restore-modal');
    const transactionForm = document.getElementById('transaction-form');
    const editTransactionForm = document.getElementById('edit-transaction-form');
    const walletForm = document.getElementById('wallet-form');
    const editWalletForm = document.getElementById('edit-wallet-form');
    const savingGoalForm = document.getElementById('saving-goal-form');
    const recurringExpenseForm = document.getElementById('recurring-expense-form');
    const addToSavingForm = document.getElementById('add-to-saving-form');
    const withdrawFromSavingForm = document.getElementById('withdraw-from-saving-form');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const loginGoogleBtn = document.getElementById('login-google-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const manualBackupBtn = document.getElementById('manual-backup-btn');
    const restoreBackupBtn = document.getElementById('restore-backup-btn');
    const autoBackupToggle = document.getElementById('auto-backup-toggle');
    const backupRestoreView = document.getElementById('backup-restore-view');
    const backupLoginPrompt = document.getElementById('backup-login-prompt');
    const backupListEl = document.getElementById('backup-list');
    const lastBackupInfoEl = document.getElementById('last-backup-info');

    // [MỚI] DOM Elements
    const debtListEl = document.getElementById('debt-list');
    const debtModal = document.getElementById('debt-modal');
    const debtForm = document.getElementById('debt-form');
    const addDebtBtn = document.getElementById('add-debt-btn');
    const payDebtModal = document.getElementById('pay-debt-modal');
    const payDebtForm = document.getElementById('pay-debt-form');
    const debtHistoryModal = document.getElementById('debt-history-modal');
    const manageCategoriesModal = document.getElementById('manage-categories-modal');
    const budgetComparisonContainer = document.getElementById('budget-comparison-container');
    const manageCategoriesBtn = document.getElementById('manage-categories-btn');

    let transactionType = 'expense';
    let editTransactionType = 'expense';
    let confirmCallback = () => { };
    let expenseChartInstance = null;

    // 3. CORE FUNCTIONS
    const getPersistentState = () => {
        const { editingWalletId, editingTransactionId, editingSavingGoalId, editingExpenseId, editingDebtId, payingDebtId, addingToSavingGoalId, withdrawingFromSavingGoalId, currentUser, ...persistentState } = state;
        return persistentState;
    };

    const saveData = () => {
        localStorage.setItem('financeApp_v3.9', JSON.stringify(getPersistentState())); // Nâng version
        if (state.currentUser && state.settings.autoBackup) {
            clearTimeout(autoBackupTimeout);
            autoBackupTimeout = setTimeout(autoBackupToFirebase, 3000);
        }
    };

    const loadData = () => {
        const localData = localStorage.getItem('financeApp_v3.9'); // Nâng version
        const defaultState = getDefaultState();
        if (localData) {
            const loadedState = JSON.parse(localData);
            state = {
                ...defaultState,
                ...loadedState,
                settings: {
                    ...defaultState.settings,
                    ...loadedState.settings,
                    budgetAllocation: {
                        ...defaultState.settings.budgetAllocation,
                        ...(loadedState.settings.budgetAllocation || {})
                    }
                },
                funds: loadedState.funds || loadedState.savings || [], // Tương thích ngược
            };
        } else {
            state = defaultState;
        }
        applyTheme(state.settings.theme || 'dark');
        document.getElementById('currency-select').value = state.settings.currency;
        if (autoBackupToggle) autoBackupToggle.checked = state.settings.autoBackup;

        applyUiState();
        renderAll();
    };

    const autoBackupToFirebase = async () => {
        if (!state.currentUser) return;
        const backupStatusIcon = document.getElementById('auto-backup-status');
        console.log("Performing automatic backup...");
        const backupData = getPersistentState();
        delete backupData.uiState;
        const backup = { name: `Tự động sao lưu`, timestamp: firebase.firestore.FieldValue.serverTimestamp(), data: backupData };
        try {
            backupStatusIcon.classList.add('saving');
            await db.collection('users').doc(state.currentUser.uid).collection('backups').doc('auto_backup').set(backup);
            updateLastBackupInfo();
        } catch (error) {
            console.error("Auto backup failed:", error);
            showToast("Sao lưu tự động thất bại!");
        } finally {
            setTimeout(() => { backupStatusIcon.classList.remove('saving'); }, 1500);
        }
    };

    const manualBackupToFirebase = async () => {
        const backupName = prompt("Đặt tên cho bản sao lưu của bạn:", `Sao lưu ngày ${new Date().toLocaleDateString('vi-VN')}`);
        if (!backupName) return;
        showToast("Đang sao lưu...");
        const backupData = getPersistentState();
        delete backupData.uiState;
        const backup = { name: backupName, timestamp: firebase.firestore.FieldValue.serverTimestamp(), data: backupData };
        try {
            await db.collection('users').doc(state.currentUser.uid).collection('backups').add(backup);
            showToast("Sao lưu thủ công thành công!");
        } catch (error) {
            console.error("Manual backup failed:", error);
            showToast("Sao lưu thất bại!");
        }
    };

    const fetchAndShowBackups = async () => {
        if (!state.currentUser) return;
        backupListEl.innerHTML = `<p>Đang tải danh sách...</p>`;
        openModal(restoreModal);
        try {
            const querySnapshot = await db.collection('users').doc(state.currentUser.uid).collection('backups').orderBy('timestamp', 'desc').get();
            if (querySnapshot.empty) { backupListEl.innerHTML = `<p>Không tìm thấy bản sao lưu nào.</p>`; return; }
            backupListEl.innerHTML = querySnapshot.docs.map(doc => {
                const backup = doc.data();
                const date = backup.timestamp?.toDate().toLocaleString('vi-VN') || 'N/A';
                return `<div class="p-3 border rounded-lg flex justify-between items-center" style="border-color: var(--border-color);">
                            <div>
                                <p class="font-semibold">${backup.name}</p>
                                <p class="text-xs" style="color: var(--text-secondary);">${date}</p>
                            </div>
                            <div class="p-3 rounded-lg flex justify-between items-center">
                                <button class="restore-btn btn btn-primary !py-1 !px-3 mr-2" data-id="${doc.id}">Chọn</button>
                                <button class="delete-backup-btn btn btn-secondary !py-1 !px-3" data-id="${doc.id}" style="background-color: var(--expense-color); color: white;"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>`;
            }).join('');
        } catch (error) {
            console.error("Failed to fetch backups:", error);
            backupListEl.innerHTML = `<p>Lỗi khi tải danh sách sao lưu.</p>`;
        }
    };

    const restoreFromBackup = async (backupId) => {
        closeModal(restoreModal);
        showConfirmation({
            title: 'Xác nhận Phục hồi', message: 'Dữ liệu hiện tại trên thiết bị này sẽ bị ghi đè hoàn toàn. Bạn có chắc chắn?', okText: 'Phục hồi',
            onConfirm: async () => {
                try {
                    const docRef = db.collection('users').doc(state.currentUser.uid).collection('backups').doc(backupId);
                    const docSnap = await docRef.get();
                    // [SỬA LỖI] Thay đổi từ docSnap.exists() thành docSnap.exists
                    if (docSnap.exists) { 
                        const backupData = docSnap.data().data;
                        localStorage.setItem('financeApp_v3.9', JSON.stringify(backupData));
                        showToast("Phục hồi thành công! Đang tải lại...");
                        setTimeout(() => location.reload(), 1500);
                    } else { showToast("Không tìm thấy bản sao lưu!"); }
                } catch (error) { console.error("Restore failed:", error); showToast("Phục hồi thất bại!"); }
            }
        });
    };
    
    // [MỚI] Thêm chức năng xóa bản sao lưu
    const deleteBackupFromFirebase = async (backupId) => {
        if (backupId === 'auto_backup') {
            showToast("Không thể xóa bản sao lưu tự động.");
            return;
        }
        showConfirmation({
            title: 'Xác nhận Xóa',
            message: 'Bạn có chắc chắn muốn xóa vĩnh viễn bản sao lưu này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            onConfirm: async () => {
                try {
                    await db.collection('users').doc(state.currentUser.uid).collection('backups').doc(backupId).delete();
                    showToast("Đã xóa bản sao lưu thành công!");
                    fetchAndShowBackups(); // Tải lại danh sách
                } catch (error) {
                    console.error("Delete backup failed:", error);
                    showToast("Xóa bản sao lưu thất bại!");
                }
            }
        });
    };

    const updateLastBackupInfo = async () => {
        if (!state.currentUser || !lastBackupInfoEl) return;
        try {
            const docRef = db.collection('users').doc(state.currentUser.uid).collection('backups').doc('auto_backup');
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                const timestamp = docSnap.data().timestamp;
                if (timestamp) { lastBackupInfoEl.textContent = `Sao lưu tự động lần cuối: ${timestamp.toDate().toLocaleString('vi-VN')}`; }
                else { lastBackupInfoEl.textContent = 'Chưa có bản sao lưu tự động nào.'; }
            }
        } catch (error) { console.log("Could not fetch last backup info."); }
    };

    const applyUiState = () => {
        if (!state.uiState) { state.uiState = getDefaultState().uiState; }
        switchScreen(state.uiState.activeScreen || 'dashboard-screen');
        const activeDashboardTab = document.querySelector(`.dashboard-tab[data-tab="${state.uiState.activeDashboardTab || 'wallets'}"]`);
        if (activeDashboardTab) {
            document.querySelectorAll('.dashboard-tab').forEach((tab, index) => {
                const isActive = tab.dataset.tab === activeDashboardTab.dataset.tab;
                tab.classList.toggle('active', isActive);
                if (isActive && dashboardTabGlider) { dashboardTabGlider.style.left = `${index * 50}%`; }
            });
            document.querySelectorAll('.dashboard-tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `${activeDashboardTab.dataset.tab}-content`);
            });
        }
    };

    const applyTheme = (themeName) => { body.className = `theme-${themeName}`; document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeName)); state.settings.theme = themeName; };
    const switchScreen = (screenId) => { screens.forEach(s => s.classList.remove('active')); const screenToShow = document.getElementById(screenId); if (screenToShow) { screenToShow.classList.add('active'); } else { document.getElementById('dashboard-screen').classList.add('active'); screenId = 'dashboard-screen'; } navItems.forEach(item => item.classList.toggle('active', item.dataset.screen === screenId)); if (state.uiState) state.uiState.activeScreen = screenId; };
    const openModal = (modal) => modal.classList.add('visible');
    const closeModal = (modal) => modal.classList.remove('visible');
    const showToast = (message) => { const toast = document.getElementById('toast'); const toastMessage = document.getElementById('toast-message'); if (!toast || !toastMessage) return; toastMessage.textContent = message; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2500); };
    const showConfirmation = ({ title, message, okText = 'Đồng ý', onConfirm = () => { } }) => { document.getElementById('confirm-title').textContent = title; document.getElementById('confirm-message').textContent = message; confirmOkBtn.textContent = okText; confirmOkBtn.style.backgroundColor = okText.toLowerCase().includes('xóa') ? 'var(--expense-color)' : 'var(--primary-color)'; confirmOkBtn.style.color = okText.toLowerCase().includes('xóa') ? 'white' : (state.settings.theme === 'light' ? 'white' : 'var(--background-color)'); confirmCallback = onConfirm; openModal(confirmModal); };
    const formatCurrency = (num) => { if (typeof num !== 'number') return '******'; if (!state.settings.balanceVisible) return '******'; try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: state.settings.currency, minimumFractionDigits: 0 }).format(num); } catch (e) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num); } };
    const updateWalletOptions = (selectElement, excludeId = null) => { selectElement.innerHTML = state.wallets.filter(w => w.id !== excludeId).map(w => `<option value="${w.id}">${w.name}</option>`).join(''); };
    const updateWalletFilters = () => { const historyWalletFilter = document.getElementById('history-wallet-filter'); const currentVal = historyWalletFilter.value; historyWalletFilter.innerHTML = '<option value="all">Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join(''); historyWalletFilter.value = currentVal; };
    const formatDateHeader = (date) => { const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const transactionDate = new Date(date); if (transactionDate.toDateString() === today.toDateString()) return 'Hôm nay'; if (transactionDate.toDateString() === yesterday.toDateString()) return 'Hôm qua'; return transactionDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };

    // 4. RENDERING FUNCTIONS
    const renderAll = () => { renderDashboard(); renderHistory(); renderFundsScreen(); renderExpensesScreen(); renderDebtScreen(); renderReportsScreen(); renderSettingsScreen(); updateWalletFilters(); };
    const renderDashboard = () => { renderInfoCard(); walletListContent.innerHTML = state.wallets.map(wallet => `<div class="list-item p-4 rounded-xl flex justify-between items-center" style="background-color: var(--card-background)"><div class="flex items-center"><div class="w-10 h-10 rounded-full flex items-center justify-center mr-4" style="background-color: var(--background-color);"><i class="fas fa-wallet" style="color:var(--primary-color);"></i></div><div><p class="font-semibold">${wallet.name}</p><p class="text-sm" style="color:var(--text-secondary)">Số dư</p></div></div><div class="flex items-center"><p class="font-bold text-lg mr-2">${formatCurrency(wallet.balance)}</p><button class="edit-wallet-btn p-2 text-sm" data-id="${wallet.id}" style="color:var(--text-secondary);"><i class="fas fa-edit"></i></button><button class="delete-wallet-btn p-2 text-sm" data-id="${wallet.id}" style="color:var(--text-secondary);"><i class="fas fa-trash-alt"></i></button></div></div>`).join('') || `<p class="text-center py-4" style="color:var(--text-secondary)">Chưa có ví nào.</p>`; const recentTxs = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); recentTransactionsContent.innerHTML = recentTxs.map(createTransactionHTML).join('') || `<div class="text-center py-4" style="color:var(--text-secondary)"><i class="fas fa-receipt text-3xl mb-2"></i><p>Chưa có giao dịch nào.</p></div>`; };
    const renderInfoCard = () => { if (!state.uiState) state.uiState = getDefaultState().uiState; const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0); const monthStart = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0); const monthlyTxs = state.transactions.filter(tx => new Date(tx.date) >= monthStart); const totalIncome = monthlyTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0); const totalExpense = monthlyTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0); const totalSaved = state.funds.reduce((sum, s) => sum + s.savedAmount, 0); const totalSavingTarget = state.funds.reduce((sum, s) => sum + s.targetAmount, 0); const totalMonthlyExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0); document.getElementById('total-balance').textContent = formatCurrency(totalBalance); document.getElementById('total-income').textContent = formatCurrency(totalIncome); document.getElementById('total-expense').textContent = formatCurrency(totalExpense); document.getElementById('total-saved').textContent = formatCurrency(totalSaved); document.getElementById('total-saving-target').textContent = `/ ${formatCurrency(totalSavingTarget)}`; document.getElementById('total-monthly-expenses').textContent = formatCurrency(totalMonthlyExpenses); document.getElementById('total-expenses-count').textContent = `${state.expenses.length} chi phí định kỳ`; infoCardPanes.forEach(pane => pane.classList.toggle('active', pane.id === `${state.uiState.activeInfoCardView}-view`)); document.querySelectorAll('.info-card-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === state.uiState.activeInfoCardView)); };
    const createTransactionHTML = (tx) => { const wallet = state.wallets.find(w => w.id === tx.walletId); const isIncome = tx.type === 'income'; const color = isIncome ? 'var(--income-color)' : 'var(--expense-color)'; const icon = ['Chuyển tiền đi', 'Nhận tiền', 'Nạp tiền tiết kiệm', 'Rút tiền tiết kiệm', 'Trả nợ'].includes(tx.category) ? 'fa-exchange-alt' : (isIncome ? 'fa-arrow-up' : 'fa-arrow-down'); const descriptionHTML = tx.description ? `<p class="text-xs italic mt-1" style="color:var(--text-secondary);">${tx.description}</p>` : ''; return ` <div class="transaction-item list-item flex items-center" data-id="${tx.id}"> <div class="w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style="background-color: color-mix(in srgb, ${color} 15%, transparent);"> <i class="fas ${icon} text-sm" style="color: ${color};"></i> </div> <div class="flex-grow cursor-pointer"> <p class="font-semibold leading-tight">${tx.category}</p> <p class="text-xs leading-tight" style="color:var(--text-secondary)"> <span>${wallet ? wallet.name : 'Ví đã xóa'}</span> </p> ${descriptionHTML} </div> <div class="text-right ml-2 flex-shrink-0"> <p class="font-bold" style="color: ${isIncome ? 'var(--income-color)' : 'var(--text-primary)'};"> ${isIncome ? '+' : '-'}${formatCurrency(tx.amount)} </p> <button class="copy-transaction-btn text-xs p-1 mt-1" style="color:var(--text-secondary);" data-id="${tx.id}"> <i class="far fa-copy"></i> Sao chép </button> </div> </div> `; };
    const renderHistory = () => { const searchTerm = document.getElementById('history-search-input').value.toLowerCase(); const typeFilter = document.getElementById('history-type-filter').value; const walletFilter = document.getElementById('history-wallet-filter').value; const startDate = document.getElementById('history-start-date').value; const endDate = document.getElementById('history-end-date').value; let filteredTxs = state.transactions.filter(tx => { const txDate = new Date(tx.date); const start = startDate ? new Date(startDate) : null; const end = endDate ? new Date(endDate) : null; if (start) start.setHours(0, 0, 0, 0); if (end) end.setHours(23, 59, 59, 999); const matchSearch = tx.category.toLowerCase().includes(searchTerm) || (tx.description && tx.description.toLowerCase().includes(searchTerm)); const matchType = typeFilter === 'all' || tx.type === typeFilter; const matchWallet = walletFilter === 'all' || tx.walletId == walletFilter; const matchDate = (!start || txDate >= start) && (!end || txDate <= end); return matchSearch && matchType && matchWallet && matchDate; }); const grouped = filteredTxs.sort((a, b) => new Date(b.date) - new Date(a.date)).reduce((acc, tx) => { const dateKey = new Date(tx.date).toLocaleDateString(); if (!acc[dateKey]) acc[dateKey] = []; acc[dateKey].push(tx); return acc; }, {}); if (Object.keys(grouped).length === 0) { fullTransactionListEl.innerHTML = `<div class="text-center py-12 mt-4" style="color:var(--text-secondary)"><i class="fas fa-search-dollar text-5xl mb-4" style="color:var(--primary-color);"></i><p class="text-lg font-semibold mb-2">Không tìm thấy giao dịch.</p><p class="text-sm">Hãy thử điều chỉnh bộ lọc hoặc tạo giao dịch mới.</p></div>`; return; } let html = ''; for (const dateKey in grouped) { html += `<div class="day-group-card"><div class="date-header">${formatDateHeader(grouped[dateKey][0].date)}</div>`; html += grouped[dateKey].map(createTransactionHTML).join(''); html += `</div>`; } fullTransactionListEl.innerHTML = html; };
    const renderFundsScreen = () => { savingGoalsListEl.innerHTML = state.funds.map(goal => { const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0; let deadlineHTML = ''; let progressBarColor = 'var(--primary-color)'; if (goal.deadline) { const today = new Date().setHours(0, 0, 0, 0); const deadlineDate = new Date(goal.deadline).setHours(0, 0, 0, 0); const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)); if (daysLeft > 0) { deadlineHTML = `<div class="flex items-center text-xs mt-1" style="color: var(--text-secondary);"><i class="far fa-clock mr-2"></i><span>Còn ${daysLeft} ngày</span></div>`; progressBarColor = 'var(--income-color)'; } else if (daysLeft === 0) { deadlineHTML = `<div class="flex items-center text-xs mt-1 font-bold" style="color: var(--primary-color);"><i class="fas fa-hourglass-end mr-2"></i><span>Hôm nay là hạn chót!</span></div>`; progressBarColor = 'var(--primary-color)'; } else { deadlineHTML = `<div class="flex items-center text-xs mt-1 font-bold" style="color: var(--expense-color);"><i class="fas fa-exclamation-circle mr-2"></i><span>Đã trễ hạn ${Math.abs(daysLeft)} ngày</span></div>`; progressBarColor = 'var(--expense-color)'; } } return ` <div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);"> <div class="flex items-start justify-between"> <div class="flex items-center"> <span class="text-2xl mr-4">${goal.icon || '🎯'}</span> <div> <p class="font-bold">${goal.name}</p> <p class="text-xs" style="color: var(--text-secondary);">${goal.note || ''}</p> </div> </div> <div class="flex gap-2"> <button class="edit-saving-btn p-2" data-id="${goal.id}"><i class="fas fa-edit"></i></button> <button class="delete-saving-btn p-2" data-id="${goal.id}"><i class="fas fa-trash"></i></button> </div> </div> <div class="mt-4"> <div class="progress-bar rounded-full h-2"> <div class="progress-bar-inner rounded-full" style="width: ${Math.min(progress, 100)}%; background-color: ${progressBarColor};"></div> </div> <div class="flex justify-between items-center mt-2"> <div> <p class="text-sm font-semibold" style="color: ${progressBarColor};">${formatCurrency(goal.savedAmount)} / ${formatCurrency(goal.targetAmount)}</p> ${deadlineHTML} </div> <span class="text-sm font-bold">${progress.toFixed(0)}%</span> </div> </div> <div class="flex gap-3 mt-4"> <button class="withdraw-from-saving-btn w-full btn btn-secondary !py-2 text-sm" data-id="${goal.id}">Rút tiền</button> <button class="add-to-saving-btn w-full btn btn-primary !py-2 text-sm" data-id="${goal.id}">Nạp tiền</button> </div> </div>`; }).join('') || `<div class="text-center py-12" style="color:var(--text-secondary)"><i class="fas fa-piggy-bank text-5xl mb-4"></i><p>Chưa có quỹ nào.</p></div>`; };
    const renderExpensesScreen = () => { recurringExpensesTimelineEl.innerHTML = `<div class="relative">${state.expenses.length > 1 ? '<div class="absolute top-5 h-full ml-5 -translate-x-1/2 border-l-2" style="border-color: var(--border-color)"></div>' : ''}${[...state.expenses].sort((a, b) => (a.day || 99) - (b.day || 99)).map(expense => { let dateText = `Chi phí không cố định`; if (expense.type === 'fixed') { switch (expense.frequency) { case 'weekly': dateText = `Hàng tuần`; break; case 'yearly': dateText = `Hàng năm`; break; case 'quarterly': dateText = `Mỗi 3 tháng`; break; case 'half-yearly': dateText = `Mỗi 6 tháng`; break; case 'custom': dateText = `Mỗi ${expense.customFreq} tháng`; break; default: dateText = `Ngày ${expense.day} hàng tháng`; } } return `<div class="flex"><div class="timeline-icon flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl z-10">${expense.icon || '💰'}</div><div class="flex-grow pl-4 pb-6"><div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);"><div class="flex justify-between items-start"><div><p class="font-bold">${expense.name}</p><p class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style="background-color: ${expense.type === 'fixed' ? 'var(--border-color)' : `color-mix(in srgb, var(--primary-color) 30%, transparent)`};">${expense.type === 'fixed' ? 'Cố định' : 'Linh hoạt'}</p></div><div class="flex gap-2"><button class="edit-expense-btn p-2" data-id="${expense.id}"><i class="fas fa-edit"></i></button><button class="delete-expense-btn p-2" data-id="${expense.id}"><i class="fas fa-trash"></i></button></div></div><p class="text-2xl font-bold my-2" style="color: var(--expense-color);">${formatCurrency(expense.amount)}</p><p class="text-xs" style="color: var(--text-secondary);">${dateText}</p>${expense.note ? `<p class="text-xs mt-2 italic" style="color: var(--text-secondary);">${expense.note}</p>` : ''}</div></div></div>` }).join('') || `<div class="text-center py-12" style="color:var(--text-secondary)"><i class="fas fa-calendar-alt text-5xl mb-4"></i><p>Chưa có chi phí định kỳ nào.</p></div>`}</div>`; };
    const renderDebtScreen = () => {
        debtListEl.innerHTML = state.debts.map(debt => {
            const isDebt = debt.type === 'debt';
            const title = isDebt ? `Nợ ${debt.person}` : `Cho ${debt.person} vay`;
            const color = isDebt ? 'var(--expense-color)' : 'var(--income-color)';
            const amountPaid = (debt.history || []).reduce((sum, item) => sum + item.amount, 0);
            const amountRemaining = debt.amount - amountPaid;
            const progress = debt.amount > 0 ? (amountPaid / debt.amount) * 100 : 0;
            return `
            <div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="font-bold">${title}</p>
                        <p class="text-xs" style="color: var(--text-secondary);">
                           Còn lại: <span class="font-semibold" style="color: ${color}">${formatCurrency(amountRemaining)}</span> / ${formatCurrency(debt.amount)}
                        </p>
                    </div>
                    <div class="flex gap-2 items-center">
                         <button class="debt-history-btn p-2 text-lg" data-id="${debt.id}"><i class="fas fa-history"></i></button>
                         <button class="edit-debt-btn p-2 text-lg" data-id="${debt.id}"><i class="fas fa-edit"></i></button>
                         <button class="delete-debt-btn p-2 text-lg" data-id="${debt.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="progress-bar">
                        <div class="progress-bar-inner" style="width: ${Math.min(progress, 100)}%; background-color: ${color};"></div>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button class="pay-debt-btn w-full btn btn-primary !py-2 text-sm" data-id="${debt.id}">${isDebt ? 'Trả Nợ' : 'Nhận Tiền'}</button>
                </div>
            </div>`;
        }).join('') || `<div class="text-center py-12" style="color:var(--text-secondary)"><i class="fas fa-book text-5xl mb-4"></i><p>Chưa có khoản nợ hay cho vay nào.</p></div>`;
    };
    const renderReportsScreen = () => {
        const canvasEl = document.getElementById('expense-chart');
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        const monthStart = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
        const monthlyTxs = state.transactions.filter(tx => new Date(tx.date) >= monthStart);
        const monthlyExpenses = monthlyTxs.filter(tx => tx.type === 'expense');
        const expenseByCategory = monthlyExpenses.reduce((acc, tx) => { if (!acc[tx.category]) acc[tx.category] = 0; acc[tx.category] += tx.amount; return acc; }, {});
        const sortedCategories = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a);
        const labels = sortedCategories.map(([category]) => category);
        const data = sortedCategories.map(([, amount]) => amount);
        if (expenseChartInstance) { expenseChartInstance.destroy(); }
        if (labels.length > 0) {
            expenseChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{ label: 'Chi tiêu', data: data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7CFFB2'], borderColor: 'var(--card-background)', borderWidth: 2, }] }, options: { responsive: true, plugins: { legend: { position: 'top', labels: { color: 'var(--text-primary)', font: { family: "'Be Vietnam Pro', sans-serif" } } }, tooltip: { callbacks: { label: (context) => `${context.label || ''}: ${formatCurrency(context.parsed)}` } } } } });
        } else if (ctx) {
            // Clear canvas if no data
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        }

        const totalIncome = monthlyTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const budgetSettings = state.settings.budgetAllocation;
        const categoryMap = budgetSettings.categoryMap || {};
        const spending = { essential: 0, wants: 0, unassigned: 0, savings: monthlyTxs.filter(tx => tx.category === 'Nạp tiền tiết kiệm').reduce((sum, tx) => sum + tx.amount, 0), };
        monthlyExpenses.forEach(tx => {
            const budgetType = categoryMap[tx.category];
            if (budgetType === 'essential') { spending.essential += tx.amount; }
            else if (budgetType === 'wants') { spending.wants += tx.amount; }
            else if (tx.category !== 'Trả nợ' && tx.category !== 'Nạp tiền tiết kiệm') { spending.unassigned += tx.amount; }
        });
        const budget = { essential: totalIncome * (budgetSettings.essential / 100), wants: totalIncome * (budgetSettings.wants / 100), savings: totalIncome * (budgetSettings.savings / 100), };
        const createBudgetBar = (type, title, spent, budgetAmount) => {
            const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const isOver = spent > budgetAmount;
            return `<div><div class="flex justify-between text-sm mb-1"><span class="font-semibold">${title}</span><span style="color: ${isOver ? 'var(--expense-color)' : 'var(--text-secondary)'}">${formatCurrency(spent)} / ${formatCurrency(budgetAmount)}</span></div><div class="progress-bar"><div class="progress-bar-inner" style="width: ${Math.min(progress, 100)}%; background-color: ${isOver ? 'var(--expense-color)' : `var(--${type}-color, var(--primary-color))`};"></div></div></div>`;
        };
        budgetComparisonContainer.innerHTML = createBudgetBar('income', 'Thiết yếu', spending.essential, budget.essential) + createBudgetBar('primary', 'Mong muốn', spending.wants, budget.wants) + createBudgetBar('expense', 'Tiết kiệm & Đầu tư', spending.savings, budget.savings);

        const customizeBudgetToggle = document.getElementById('customize-budget-toggle');
        const customBudgetInputs = document.getElementById('custom-budget-inputs');
        customizeBudgetToggle.checked = budgetSettings.customize;
        customBudgetInputs.classList.toggle('hidden', !budgetSettings.customize);
        document.getElementById('essential-percent').value = budgetSettings.essential;
        document.getElementById('wants-percent').value = budgetSettings.wants;
        document.getElementById('savings-percent').value = budgetSettings.savings;
    };
    const renderSettingsScreen = () => { if (state.currentUser) { loggedInView.classList.remove('hidden'); loggedOutView.classList.add('hidden'); backupRestoreView.classList.remove('hidden'); backupLoginPrompt.classList.add('hidden'); document.getElementById('user-avatar').src = state.currentUser.photoURL || ''; document.getElementById('user-display-name').textContent = state.currentUser.displayName || 'Người dùng'; document.getElementById('user-email').textContent = state.currentUser.email || ''; } else { loggedInView.classList.add('hidden'); loggedOutView.classList.remove('hidden'); backupRestoreView.classList.add('hidden'); backupLoginPrompt.classList.remove('hidden'); } };

    // 5. EVENT LISTENERS & HANDLERS
    const loginWithGoogle = () => { const provider = new firebase.auth.GoogleAuthProvider(); auth.signInWithPopup(provider).catch(error => console.error("Google Sign-In Error:", error)); };
    const logoutUser = () => { auth.signOut(); };
    auth.onAuthStateChanged(user => { if (user) { state.currentUser = { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }; updateLastBackupInfo(); } else { state.currentUser = null; } renderSettingsScreen(); });
    loadData();
    loginGoogleBtn.addEventListener('click', loginWithGoogle);
    logoutBtn.addEventListener('click', logoutUser);
    manualBackupBtn.addEventListener('click', manualBackupToFirebase);
    restoreBackupBtn.addEventListener('click', fetchAndShowBackups);
    autoBackupToggle.addEventListener('change', () => { state.settings.autoBackup = autoBackupToggle.checked; saveData(); });
    // [CẬP NHẬT] Thêm listener cho nút xóa
    backupListEl.addEventListener('click', e => { 
        const restoreTarget = e.target.closest('.restore-btn'); 
        if (restoreTarget) { 
            restoreFromBackup(restoreTarget.dataset.id); 
        }
        const deleteTarget = e.target.closest('.delete-backup-btn');
        if (deleteTarget) {
            deleteBackupFromFirebase(deleteTarget.dataset.id);
        }
    });
    resetDataBtn.addEventListener('click', () => { showConfirmation({ title: 'Xóa Dữ Liệu Local?', message: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu trên thiết bị này không? Hành động này không ảnh hưởng đến các bản sao lưu online.', okText: 'Xóa', onConfirm: () => { localStorage.removeItem('financeApp_v3.9'); state = getDefaultState(); applyUiState(); renderAll(); saveData(); showToast("Đã xóa dữ liệu local."); } }); });
    navItems.forEach(item => item.addEventListener('click', () => { if (item.dataset.screen) { switchScreen(item.dataset.screen);} }));
    toggleBalanceVisibilityBtn.addEventListener('click', () => { state.settings.balanceVisible = !state.settings.balanceVisible; toggleBalanceVisibilityBtn.querySelector('i').className = state.settings.balanceVisible ? 'fas fa-eye' : 'fas fa-eye-slash'; renderAll(); });
    document.getElementById('quick-action-expense').addEventListener('click', () => openTransactionModal('expense'));
    document.getElementById('quick-action-income').addEventListener('click', () => openTransactionModal('income'));
    document.getElementById('quick-action-transfer').addEventListener('click', () => openTransactionModal('transfer'));
    document.getElementById('quick-action-add-wallet').addEventListener('click', openAddWalletModal);
    document.getElementById('add-saving-goal-btn').addEventListener('click', () => openSavingGoalModal());
    document.getElementById('add-recurring-expense-btn').addEventListener('click', () => openRecurringExpenseModal());
    document.getElementById('add-debt-btn').addEventListener('click', () => openDebtModal());
    manageCategoriesBtn.addEventListener('click', () => openManageCategoriesModal());
    allModals.forEach(modal => { modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); }); modal.querySelector('.btn-cancel-modal')?.addEventListener('click', () => closeModal(modal)); });
    confirmOkBtn.addEventListener('click', () => { confirmCallback(); closeModal(confirmModal); });
    confirmCancelBtn.addEventListener('click', () => closeModal(confirmModal));
    document.querySelectorAll('#history-screen input, #history-screen select').forEach(el => el.addEventListener('input', renderHistory));
    dashboardTabs.forEach((tab) => tab.addEventListener('click', () => { if (state.uiState) state.uiState.activeDashboardTab = tab.dataset.tab; applyUiState(); }));
    infoCardNav.addEventListener('click', (e) => {
        const tab = e.target.closest('.info-card-tab'); if (tab && tab.dataset.view) { if (state.uiState) state.uiState.activeInfoCardView = tab.dataset.view; renderInfoCard(); }
    });
    function openAddWalletModal() { walletForm.reset(); document.getElementById('initial-balance').value = 0; openModal(addWalletModal); }
    walletForm.addEventListener('submit', (e) => { e.preventDefault(); state.wallets.push({ id: Date.now(), name: document.getElementById('wallet-name').value, balance: parseFloat(document.getElementById('initial-balance').value) || 0 }); closeModal(addWalletModal); saveData(); renderAll(); });
    function openEditWalletModal(walletId) { state.editingWalletId = walletId; const wallet = state.wallets.find(w => w.id === walletId); if (wallet) { document.getElementById('edit-wallet-name').value = wallet.name; document.getElementById('edit-wallet-balance').value = wallet.balance; openModal(editWalletModal); } }
    editWalletForm.addEventListener('submit', (e) => { e.preventDefault(); const wallet = state.wallets.find(w => w.id === state.editingWalletId); if (wallet) { const newName = document.getElementById('edit-wallet-name').value; const newBalance = parseFloat(document.getElementById('edit-wallet-balance').value); const oldBalance = wallet.balance; const adjustment = newBalance - oldBalance; if (adjustment !== 0) { const adjType = adjustment > 0 ? 'income' : 'expense'; state.transactions.push({ id: Date.now(), type: adjType, amount: Math.abs(adjustment), category: "Điều chỉnh số dư", walletId: wallet.id, description: `Thay đổi số dư`, date: new Date().toISOString() }); } wallet.name = newName; wallet.balance = newBalance; } closeModal(editWalletModal); saveData(); renderAll(); });
    function setupTransactionModalUI(type, modal = addTransactionModal) { transactionType = type; const title = modal.querySelector('#transaction-modal-title'); const transactionFields = modal.querySelector('#transaction-fields'); const transferFields = modal.querySelector('#transfer-fields'); const budgetWrapper = modal.querySelector('[id*="budget-category-wrapper"]'); modal.querySelectorAll('.transaction-type-btn').forEach(btn => { btn.style.backgroundColor = 'var(--background-color)'; btn.style.color = 'var(--text-secondary)'; }); if (type === 'transfer') { title.textContent = "Chuyển Tiền"; transactionFields.classList.add('hidden'); transferFields.classList.remove('hidden'); modal.querySelector('[data-type="transfer"]').style.backgroundColor = 'var(--primary-color)'; if (budgetWrapper) budgetWrapper.classList.add('hidden'); } else { title.textContent = type === 'expense' ? "Thêm Khoản Chi" : "Thêm Khoản Thu"; transactionFields.classList.remove('hidden'); transferFields.classList.add('hidden'); const btn = modal.querySelector(`[data-type="${type}"]`); btn.style.backgroundColor = `var(--${type}-color)`; btn.style.color = 'white'; modal.querySelector('#wallet-select-label').textContent = type === 'income' ? 'Vào ví' : 'Từ ví'; if (budgetWrapper) { budgetWrapper.classList.toggle('hidden', type !== 'expense'); } } }
    function openTransactionModal(type) { if (state.wallets.length === 0 && type !== 'transfer') { showConfirmation({ title: 'Chưa có ví', message: 'Bạn cần tạo ví trước.', okText: 'OK' }); return; } if (state.wallets.length < 2 && type === 'transfer') { showConfirmation({ title: 'Yêu cầu 2 ví', message: 'Bạn cần ít nhất 2 ví để chuyển tiền.', okText: 'OK' }); return; } transactionForm.reset(); setupTransactionModalUI(type); if (type !== 'transfer') { document.getElementById('transaction-date').valueAsDate = new Date(); updateWalletOptions(document.getElementById('wallet-select')); renderCategoryChips(type, document.getElementById('category-chips-container'), document.getElementById('category')); } else { document.getElementById('transfer-date').valueAsDate = new Date(); updateWalletOptions(document.getElementById('from-wallet-select')); updateWalletOptions(document.getElementById('to-wallet-select')); if (document.getElementById('to-wallet-select').options.length > 1) { document.getElementById('to-wallet-select').selectedIndex = 1; } } openModal(addTransactionModal); }
    addTransactionModal.querySelectorAll('.transaction-type-btn').forEach(btn => btn.addEventListener('click', () => setupTransactionModalUI(btn.dataset.type)));
    transactionForm.addEventListener('submit', (e) => { e.preventDefault(); if (transactionType === 'transfer') { const amount = parseFloat(document.getElementById('transfer-amount').value); const fromId = parseInt(document.getElementById('from-wallet-select').value); const toId = parseInt(document.getElementById('to-wallet-select').value); const date = document.getElementById('transfer-date').value; if (fromId === toId) { showConfirmation({ title: 'Lỗi', message: 'Ví nguồn và ví đích không được trùng nhau.', okText: 'OK' }); return; } const fromWallet = state.wallets.find(w => w.id === fromId); const toWallet = state.wallets.find(w => w.id === toId); if (!fromWallet || !toWallet || !amount || amount <= 0) return; if (fromWallet.balance < amount) { showConfirmation({ title: 'Không đủ số dư', message: `Ví "${fromWallet.name}" không đủ tiền.`, okText: 'OK' }); return; } const txDate = date ? new Date(date).toISOString() : new Date().toISOString(); const desc = document.getElementById('description').value || `Từ ${fromWallet.name} đến ${toWallet.name}`; state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Chuyển tiền đi', walletId: fromId, description: desc, date: txDate }); fromWallet.balance -= amount; state.transactions.push({ id: Date.now() + 1, type: 'income', amount, category: 'Nhận tiền', walletId: toId, description: desc, date: txDate }); toWallet.balance += amount; } else { const amount = parseFloat(document.getElementById('amount').value); const walletId = parseInt(document.getElementById('wallet-select').value); const category = document.getElementById('category').value; const date = document.getElementById('transaction-date').value; const budgetCategory = document.getElementById('budget-category').value; const wallet = state.wallets.find(w => w.id === walletId); if (!wallet || !amount || amount <= 0 || !category) { if (!category) showConfirmation({ title: 'Thiếu thông tin', message: 'Vui lòng chọn một hạng mục.', okText: 'OK' }); return; } const txDate = date ? new Date(date).toISOString() : new Date().toISOString(); state.transactions.push({ id: Date.now(), type: transactionType, amount, category, walletId, description: document.getElementById('description').value, date: txDate, budgetCategory: transactionType === 'expense' ? budgetCategory : undefined }); wallet.balance += (transactionType === 'income' ? amount : -amount); } closeModal(addTransactionModal); saveData(); renderAll(); });
    function renderCategoryChips(type, container, hiddenInput, selectedCategory = null) { const categories = state.settings.categories[type] || []; container.innerHTML = categories.map(cat => `<button type="button" class="category-chip ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join('') + `<button type="button" class="category-chip add-category-btn">+</button>`; hiddenInput.value = selectedCategory || ''; const addCategoryForm = container.nextElementSibling; if (addCategoryForm) { addCategoryForm.classList.add('hidden'); addCategoryForm.querySelector('input').value = ''; } }
    function handleCategoryChipClick(event) { const target = event.target; const form = target.closest('form'); if (!form) return; if (target.classList.contains('category-chip')) { const container = target.parentElement; const hiddenInput = form.querySelector('input[type="hidden"][id*="category"]'); const addCategoryForm = container.nextElementSibling; if (target.classList.contains('add-category-btn')) { addCategoryForm.classList.toggle('hidden'); if (!addCategoryForm.classList.contains('hidden')) { addCategoryForm.querySelector('input').focus(); } } else { container.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active')); target.classList.add('active'); hiddenInput.value = target.dataset.category; } } if (target.classList.contains('save-new-category-btn')) { const addCategoryForm = target.closest('.add-category-form'); const newCategoryInput = addCategoryForm.querySelector('input'); const newCategory = newCategoryInput.value.trim(); if (newCategory) { const currentType = form.id.includes('edit') ? editTransactionType : transactionType; if (!state.settings.categories[currentType].includes(newCategory)) { state.settings.categories[currentType].push(newCategory); saveData(); const container = addCategoryForm.previousElementSibling; const hiddenInput = form.querySelector('input[type="hidden"][id*="category"]'); renderCategoryChips(currentType, container, hiddenInput, newCategory); } } } }
    addTransactionModal.addEventListener('click', handleCategoryChipClick);
    editTransactionModal.addEventListener('click', handleCategoryChipClick);
    document.querySelector('.theme-btn').parentElement.addEventListener('click', e => { if (e.target.closest('.theme-btn')) { applyTheme(e.target.closest('.theme-btn').dataset.theme); saveData(); } });
    document.getElementById('currency-select').addEventListener('change', () => { state.settings.currency = document.getElementById('currency-select').value; saveData(); renderAll(); });
    document.getElementById('export-data-btn').addEventListener('click', () => { const dataStr = JSON.stringify(getPersistentState(), null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = `tro-ly-tai-chinh-data-${new Date().toISOString().split('T')[0]}.json`; link.click(); URL.revokeObjectURL(url); });
    document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
    document.getElementById('import-file-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; showConfirmation({ title: 'Nhập Dữ Liệu', message: 'Thao tác này sẽ ghi đè lên toàn bộ dữ liệu hiện tại.', okText: 'Nhập', onConfirm: () => { const reader = new FileReader(); reader.onload = (e) => { try { const importedState = JSON.parse(e.target.result); if (importedState.wallets && importedState.transactions && importedState.settings) { const defaultState = getDefaultState(); state = { ...defaultState, ...importedState, settings: { ...defaultState.settings, ...importedState.settings }, currentUser: state.currentUser }; applyTheme(state.settings.theme || 'dark'); document.getElementById('currency-select').value = state.settings.currency; applyUiState(); renderAll(); saveData(); } else { showConfirmation({ title: 'Lỗi', message: 'Tệp dữ liệu không hợp lệ.', okText: 'OK' }); } } catch (error) { showConfirmation({ title: 'Lỗi', message: 'Không thể đọc tệp.', okText: 'OK' }); } }; reader.readAsText(file); } }); event.target.value = ''; });
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-transaction-btn');
        if (copyBtn) {
            const txId = parseInt(copyBtn.dataset.id);
            const tx = state.transactions.find(t => t.id === txId);
            if (tx) { const wallet = state.wallets.find(w => w.id === tx.walletId); const dateStr = new Date(tx.date).toLocaleString('vi-VN'); const amountStr = `${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}`; const textToCopy = [`Ngày: ${dateStr}`, `Số tiền: ${amountStr}`, `Hạng mục: ${tx.category}`, `Ví: ${wallet ? wallet.name : 'N/A'}`, tx.description ? `Ghi chú: ${tx.description}` : null].filter(line => line !== null).join('\n'); navigator.clipboard.writeText(textToCopy).then(() => { showToast('Đã sao chép vào bộ nhớ đệm!'); }).catch(err => { showToast('Sao chép thất bại!'); console.error('Copy error:', err); }); }
            return;
        }
        const txItemBody = e.target.closest('.transaction-item .cursor-pointer');
        if (txItemBody) { const parent = txItemBody.closest('.transaction-item'); if (parent) openEditTransactionModal(parseInt(parent.dataset.id)); return; }
        const delegatedActions = {
            '.edit-wallet-btn': (el) => openEditWalletModal(parseInt(el.dataset.id)),
            '.delete-wallet-btn': (el) => { const id = parseInt(el.dataset.id); const wallet = state.wallets.find(w => w.id === id); const txCount = state.transactions.filter(tx => tx.walletId === id).length; showConfirmation({ title: `Xóa Ví "${wallet.name}"?`, message: `Thao tác này sẽ xóa ${txCount} giao dịch liên quan.`, okText: 'Xóa', onConfirm: () => { state.transactions = state.transactions.filter(tx => tx.walletId !== id); state.wallets = state.wallets.filter(w => w.id !== id); saveData(); renderAll(); } }); },
            '.edit-saving-btn': (el) => openSavingGoalModal(parseInt(el.dataset.id)),
            '.delete-saving-btn': (el) => { const id = parseInt(el.dataset.id); showConfirmation({ title: 'Xóa Quỹ?', message: 'Tiền đã tiết kiệm sẽ không được hoàn lại ví.', okText: 'Xóa', onConfirm: () => { state.funds = state.funds.filter(s => s.id !== id); saveData(); renderAll(); } }); },
            '.add-to-saving-btn': (el) => { state.addingToSavingGoalId = parseInt(el.dataset.id); updateWalletOptions(document.getElementById('add-saving-wallet-select')); addToSavingForm.reset(); openModal(addToSavingModal); },
            '.withdraw-from-saving-btn': (el) => { state.withdrawingFromSavingGoalId = parseInt(el.dataset.id); updateWalletOptions(document.getElementById('withdraw-saving-wallet-select')); withdrawFromSavingForm.reset(); openModal(withdrawFromSavingModal); },
            '.edit-expense-btn': (el) => openRecurringExpenseModal(parseInt(el.dataset.id)),
            '.delete-expense-btn': (el) => { const id = parseInt(el.dataset.id); showConfirmation({ title: 'Xóa Chi Phí?', message: 'Bạn có muốn xóa chi phí định kỳ này?', okText: 'Xóa', onConfirm: () => { state.expenses = state.expenses.filter(ex => ex.id !== id); saveData(); renderAll(); } }); },
            '.edit-debt-btn': (el) => openDebtModal(parseInt(el.dataset.id)),
            '.delete-debt-btn': (el) => { const id = parseInt(el.dataset.id); showConfirmation({ title: 'Xóa Khoản Nợ?', message: 'Bạn có chắc muốn xóa vĩnh viễn mục này? Mọi lịch sử trả nợ cũng sẽ bị xóa.', okText: 'Xóa', onConfirm: () => { state.debts = state.debts.filter(d => d.id !== id); saveData(); renderAll(); } }); },
            '.pay-debt-btn': (el) => openPayDebtModal(parseInt(el.dataset.id)),
            '.debt-history-btn': (el) => openDebtHistoryModal(parseInt(el.dataset.id)),
        };
        for (const selector in delegatedActions) { const element = e.target.closest(selector); if (element) { delegatedActions[selector](element); break; } }
    });
    function openEditTransactionModal(txId) { const tx = state.transactions.find(t => t.id === txId); if (!tx || ["Điều chỉnh số dư", "Chuyển tiền đi", "Nhận tiền", "Nạp tiền tiết kiệm", "Rút tiền tiết kiệm", "Trả nợ"].includes(tx.category)) { showConfirmation({ title: 'Thông Báo', message: 'Giao dịch tự động không thể chỉnh sửa.', okText: 'OK' }); return; } state.editingTransactionId = txId; updateWalletOptions(document.getElementById('edit-wallet-select'));['amount', 'wallet-select', 'description'].forEach(id => document.getElementById(`edit-${id}`).value = tx[id === 'wallet-select' ? 'walletId' : id]); const txDate = new Date(tx.date); document.getElementById('edit-transaction-date').value = txDate.toISOString().split('T')[0]; editTransactionType = tx.type; const editTypeExpenseBtn = document.getElementById('edit-type-expense'); const editTypeIncomeBtn = document.getElementById('edit-type-income'); setupTransactionModalUI(tx.type, editTransactionModal); if (tx.type === 'income') { editTypeIncomeBtn.style.backgroundColor = 'var(--income-color)'; editTypeIncomeBtn.style.color = 'white'; editTypeExpenseBtn.style.backgroundColor = 'var(--border-color)'; editTypeExpenseBtn.style.color = 'var(--text-secondary)'; } else { editTypeExpenseBtn.style.backgroundColor = 'var(--expense-color)'; editTypeExpenseBtn.style.color = 'white'; editTypeIncomeBtn.style.backgroundColor = 'var(--border-color)'; editTypeIncomeBtn.style.color = 'var(--text-secondary)'; } renderCategoryChips(tx.type, document.getElementById('edit-category-chips-container'), document.getElementById('edit-category'), tx.category); if (tx.type === 'expense') { document.getElementById('edit-budget-category').value = tx.budgetCategory || 'none'; } openModal(editTransactionModal); }
    editTransactionForm.addEventListener('submit', (e) => { e.preventDefault(); const txIndex = state.transactions.findIndex(t => t.id === state.editingTransactionId); if (txIndex === -1) return; const originalTx = { ...state.transactions[txIndex] }; const originalWallet = state.wallets.find(w => w.id === originalTx.walletId); if (originalWallet) { originalWallet.balance += originalTx.type === 'expense' ? originalTx.amount : -originalTx.amount; } const newAmount = parseFloat(document.getElementById('edit-amount').value); const newWalletId = parseInt(document.getElementById('edit-wallet-select').value); const newWallet = state.wallets.find(w => w.id === newWalletId); const newDate = document.getElementById('edit-transaction-date').value; const newBudgetCategory = document.getElementById('edit-budget-category').value; if (newWallet) { newWallet.balance += editTransactionType === 'income' ? newAmount : -newAmount; } state.transactions[txIndex] = { ...originalTx, type: editTransactionType, amount: newAmount, category: document.getElementById('edit-category').value, walletId: newWalletId, description: document.getElementById('edit-description').value, date: new Date(newDate).toISOString(), budgetCategory: editTransactionType === 'expense' ? newBudgetCategory : undefined }; closeModal(editTransactionModal); saveData(); renderAll(); });
    document.getElementById('delete-transaction-btn').addEventListener('click', () => { showConfirmation({ title: 'Xóa Giao Dịch?', message: 'Bạn chắc chắn muốn xóa vĩnh viễn giao dịch này?', okText: 'Xóa', onConfirm: () => { const txIndex = state.transactions.findIndex(t => t.id === state.editingTransactionId); if (txIndex === -1) return; const txToDelete = state.transactions[txIndex]; const wallet = state.wallets.find(w => w.id === txToDelete.walletId); if (wallet) { wallet.balance += txToDelete.type === 'expense' ? txToDelete.amount : -txToDelete.amount; } state.transactions.splice(txIndex, 1); closeModal(editTransactionModal); saveData(); renderAll(); } }); });
    function openSavingGoalModal(goalId = null) { state.editingSavingGoalId = goalId; savingGoalForm.reset(); if (goalId) { const goal = state.funds.find(s => s.id === goalId); document.getElementById('saving-goal-modal-title').textContent = "Chỉnh Sửa Quỹ";['name', 'icon', 'target', 'deadline', 'note'].forEach(id => document.getElementById(`saving-${id}`).value = goal[id === 'target' ? 'targetAmount' : id] || ''); } else { document.getElementById('saving-goal-modal-title').textContent = "Thêm Quỹ Mới"; } openModal(savingGoalModal); }
    function openRecurringExpenseModal(expenseId = null) { state.editingExpenseId = expenseId; recurringExpenseForm.reset(); const expenseTypeSelect = document.getElementById('expense-type'); const dateWrapper = document.getElementById('expense-date-wrapper'); const dateInput = document.getElementById('expense-date'); const toggleDateVisibility = () => { if (expenseTypeSelect.value === 'flexible') { dateWrapper.classList.add('hidden'); dateInput.required = false; } else { dateWrapper.classList.remove('hidden'); dateInput.required = true; } }; if (expenseId) { const expense = state.expenses.find(e => e.id === expenseId); document.getElementById('recurring-expense-modal-title').textContent = "Chỉnh Sửa Chi Phí";['name', 'icon', 'amount', 'type', 'note'].forEach(id => document.getElementById(`expense-${id}`).value = expense[id] || ''); if (expense.day) dateInput.value = expense.day; } else { document.getElementById('recurring-expense-modal-title').textContent = "Thêm Chi Phí Định Kỳ"; } expenseTypeSelect.removeEventListener('change', toggleDateVisibility); expenseTypeSelect.addEventListener('change', toggleDateVisibility); toggleDateVisibility(); openModal(recurringExpenseModal); }
    const handleFrequencyChange = () => { document.getElementById('expense-custom-freq-wrapper').classList.toggle('hidden', document.getElementById('expense-frequency').value !== 'custom'); };
    savingGoalForm.addEventListener('submit', e => { e.preventDefault(); const goalData = { name: document.getElementById('saving-name').value, icon: document.getElementById('saving-icon').value, targetAmount: parseFloat(document.getElementById('saving-target').value), deadline: document.getElementById('saving-deadline').value, note: document.getElementById('saving-note').value }; if (state.editingSavingGoalId) { const index = state.funds.findIndex(s => s.id === state.editingSavingGoalId); state.funds[index] = { ...state.funds[index], ...goalData }; } else { state.funds.push({ ...goalData, id: Date.now(), savedAmount: 0, history: [] }); } closeModal(savingGoalModal); saveData(); renderAll(); });
    recurringExpenseForm.addEventListener('submit', e => { e.preventDefault(); const expenseType = document.getElementById('expense-type').value; const expenseData = { name: document.getElementById('expense-name').value, icon: document.getElementById('expense-icon').value, amount: parseFloat(document.getElementById('expense-amount').value), type: expenseType, day: expenseType === 'fixed' ? parseInt(document.getElementById('expense-date').value) : null, note: document.getElementById('expense-note').value }; if (state.editingExpenseId) { const index = state.expenses.findIndex(ex => ex.id === state.editingExpenseId); state.expenses[index] = { ...state.expenses[index], ...expenseData }; } else { state.expenses.push({ ...expenseData, id: Date.now() }); } closeModal(recurringExpenseModal); saveData(); renderAll(); });
    addToSavingForm.addEventListener('submit', e => { e.preventDefault(); const amount = parseFloat(document.getElementById('add-saving-amount').value); const walletId = parseInt(document.getElementById('add-saving-wallet-select').value); const goal = state.funds.find(s => s.id === state.addingToSavingGoalId); const wallet = state.wallets.find(w => w.id === walletId); if (!amount || !goal || !wallet || amount <= 0) return; if (wallet.balance < amount) { showConfirmation({ title: 'Không đủ số dư', message: `Ví "${wallet.name}" không đủ tiền.`, okText: 'OK' }); return; } wallet.balance -= amount; goal.savedAmount += amount; state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Nạp tiền tiết kiệm', walletId, description: `Nạp vào "${goal.name}"`, date: new Date().toISOString() }); closeModal(addToSavingModal); saveData(); renderAll(); });
    withdrawFromSavingForm.addEventListener('submit', e => { e.preventDefault(); const amount = parseFloat(document.getElementById('withdraw-saving-amount').value); const walletId = parseInt(document.getElementById('withdraw-saving-wallet-select').value); const goal = state.funds.find(s => s.id === state.withdrawingFromSavingGoalId); const wallet = state.wallets.find(w => w.id === walletId); if (!amount || !goal || !wallet || amount <= 0) return; if (amount > goal.savedAmount) { showConfirmation({ title: 'Không đủ tiền', message: `Bạn chỉ có thể rút tối đa ${formatCurrency(goal.savedAmount)}.`, okText: 'OK' }); return; } wallet.balance += amount; goal.savedAmount -= amount; state.transactions.push({ id: Date.now(), type: 'income', amount, category: 'Rút tiền tiết kiệm', walletId, description: `Rút từ quỹ "${goal.name}"`, date: new Date().toISOString() }); closeModal(withdrawFromSavingModal); saveData(); renderAll(); });
    debtForm.addEventListener('submit', e => { e.preventDefault(); const debtData = { type: document.getElementById('debt-type').value, person: document.getElementById('debt-person').value, amount: parseFloat(document.getElementById('debt-amount').value), currency: document.getElementById('debt-currency').value, startDate: document.getElementById('debt-start-date').value, endDate: document.getElementById('debt-end-date').value, note: document.getElementById('debt-note').value, }; if (state.editingDebtId) { const index = state.debts.findIndex(d => d.id === state.editingDebtId); state.debts[index] = { ...state.debts[index], ...debtData }; } else { state.debts.push({ ...debtData, id: Date.now(), history: [] }); } closeModal(debtModal); saveData(); renderAll(); });
    payDebtForm.addEventListener('submit', e => { e.preventDefault(); const amount = parseFloat(document.getElementById('pay-debt-amount').value); const walletId = parseInt(document.getElementById('pay-debt-wallet-select').value); const date = document.getElementById('pay-debt-date').value; const note = document.getElementById('pay-debt-note').value; const debt = state.debts.find(d => d.id === state.payingDebtId); const wallet = state.wallets.find(w => w.id === walletId); if (!amount || !debt || !wallet || amount <= 0) return; if (wallet.balance < amount) { showConfirmation({ title: 'Không đủ số dư', message: `Ví "${wallet.name}" không đủ tiền.`, okText: 'OK' }); return; } const amountRemaining = debt.amount - (debt.history || []).reduce((sum, item) => sum + item.amount, 0); if (amount > amountRemaining) { showConfirmation({ title: 'Số tiền không hợp lệ', message: `Số tiền trả vượt quá số tiền còn lại (${formatCurrency(amountRemaining)}).`, okText: 'OK' }); return; } wallet.balance -= amount; if (!debt.history) debt.history = []; debt.history.push({ id: Date.now(), amount, date, note, walletId }); const txDesc = debt.type === 'debt' ? `Trả nợ cho ${debt.person}` : `Ghi nhận ${debt.person} trả nợ`; state.transactions.push({ id: Date.now() + 1, type: 'expense', amount, category: 'Trả nợ', walletId, description: `${txDesc}${note ? ' - ' + note : ''}`, date: new Date(date).toISOString() }); closeModal(payDebtModal); saveData(); renderAll(); });
    function openDebtModal(debtId = null) { state.editingDebtId = debtId; debtForm.reset(); document.getElementById('debt-start-date').valueAsDate = new Date(); if (debtId) { const debt = state.debts.find(d => d.id === debtId); document.getElementById('debt-modal-title').textContent = "Chỉnh Sửa Khoản Nợ";['type', 'person', 'amount', 'currency', 'startDate', 'endDate', 'note'].forEach(id => { document.getElementById(`debt-${id}`).value = debt[id] || ''; }); } else { document.getElementById('debt-modal-title').textContent = "Thêm Khoản Nợ Mới"; } openModal(debtModal); }
    function openPayDebtModal(debtId) { state.payingDebtId = debtId; payDebtForm.reset(); updateWalletOptions(document.getElementById('pay-debt-wallet-select')); document.getElementById('pay-debt-date').valueAsDate = new Date(); openModal(payDebtModal); }
    function openDebtHistoryModal(debtId) { const debt = state.debts.find(d => d.id === debtId); const historyListEl = document.getElementById('debt-history-list'); if (!debt || !debt.history || debt.history.length === 0) { historyListEl.innerHTML = `<p class="text-center" style="color: var(--text-secondary);">Chưa có lịch sử trả nợ.</p>`; } else { historyListEl.innerHTML = [...debt.history].reverse().map(item => { const wallet = state.wallets.find(w => w.id === item.walletId); return `<div class="p-2 rounded" style="background-color: var(--highlight-color);"><div class="flex justify-between font-semibold"><span>${formatCurrency(item.amount)}</span><span>${new Date(item.date).toLocaleDateString('vi-VN')}</span></div><p class="text-xs" style="color: var(--text-secondary);">Từ ví: ${wallet ? wallet.name : 'N/A'}</p><p class="text-xs italic" style="color: var(--text-secondary);">${item.note || 'Không có ghi chú'}</p></div>` }).join(''); } openModal(debtHistoryModal); }
    let draggedItem = null;
    function openManageCategoriesModal() { const categoryMap = state.settings.budgetAllocation.categoryMap || {}; const allCategories = state.settings.categories.expense; const lists = { unassigned: document.getElementById('unassigned-categories-list'), essential: document.getElementById('essential-categories-list'), wants: document.getElementById('wants-categories-list'), }; Object.values(lists).forEach(list => list.innerHTML = ''); allCategories.forEach(cat => { const assignedGroup = categoryMap[cat] || 'unassigned'; const catEl = document.createElement('div'); catEl.textContent = cat; catEl.className = 'p-2 rounded cursor-grab text-sm'; catEl.style.backgroundColor = 'var(--border-color)'; catEl.draggable = true; catEl.dataset.category = cat; lists[assignedGroup].appendChild(catEl); }); document.querySelectorAll('[id$="-categories-container"]').forEach(container => { container.addEventListener('dragover', e => e.preventDefault()); container.addEventListener('drop', handleDrop); }); document.querySelectorAll('[id$="-categories-list"] [data-category]').forEach(item => { item.addEventListener('dragstart', handleDragStart); }); openModal(manageCategoriesModal); }
    function handleDragStart(e) { draggedItem = e.target; }
    function handleDrop(e) { e.preventDefault(); const container = e.target.closest('[id$="-categories-container"]'); if (container && draggedItem) { const list = container.querySelector('[id$="-categories-list"]'); list.appendChild(draggedItem); const newGroup = container.id.split('-')[0]; const categoryName = draggedItem.dataset.category; if (newGroup === 'unassigned') { delete state.settings.budgetAllocation.categoryMap[categoryName]; } else { state.settings.budgetAllocation.categoryMap[categoryName] = newGroup; } saveData(); renderReportsScreen(); } draggedItem = null; }
});