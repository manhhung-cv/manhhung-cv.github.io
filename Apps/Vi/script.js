// Đăng ký Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. FIREBASE CONFIG
    const firebaseConfig = {
        apiKey: "AIzaSyA154aDjGrayZKcNB7-VjtZGKz22Op3U4g",
        authDomain: "smart-wallet-hunq.firebaseapp.com",
        projectId: "smart-wallet-hunq",
        storageBucket: "smart-wallet-hunq.firebasestorage.app",
        messagingSenderId: "707382516261",
        appId: "1:707382516261:web:d735f3672661dc0d25bdcc",
        measurementId: "G-MJ81D7D757"
    };
    // Kiểm tra để tránh khởi tạo lại nếu đã có
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // 2. STATE & VARIABLES
    const getDefaultState = () => ({
        wallets: [{ id: Date.now(), name: 'Tiền mặt', balance: 0 }],
        transactions: [],
        funds: [],
        expenses: [],
        debts: [],
        settings: {
            currency: 'VND',
            balanceVisible: true,
            autoBackup: true,
            totalMonthlyBudget: 0,
            categories: {
                expense: ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Mua sắm', 'Giải trí', 'Sức khỏe'],
                income: ['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng']
            },
            budgetAllocation: {
                customize: false,
                essential: 50,
                wants: 30,
                savings: 20,
                categoryMap: {}
            }
        },
        uiState: {
            activeScreen: 'dashboard-screen',
            activeDashboardTab: 'wallets',
            activeInfoCardView: 'balance'
        }
    });

    let state = getDefaultState();
    state.currentUser = null;

    // Runtime variables
    let editingWalletId = null;
    let editingTransactionId = null;
    let editingSavingGoalId = null;
    let editingExpenseId = null;
    let editingDebtId = null;
    let payingDebtId = null;
    let addingToSavingGoalId = null;
    let withdrawingFromSavingGoalId = null;

    let autoBackupTimeout;
    let transactionType = 'expense';
    let editTransactionType = 'expense';
    let confirmCallback = () => { };
    let expenseChartInstance = null;

    // 3. HELPER FUNCTIONS
    const formatCurrency = (num) => {
        if (typeof num !== 'number') return '******';
        if (!state.settings.balanceVisible) return '******';
        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: state.settings.currency || 'VND',
                minimumFractionDigits: 0
            }).format(num);
        } catch (e) { return num + ""; }
    };

    const formatNumberInput = (value) => {
        if (!value && value !== 0) return '';
        const num = parseInt(value.toString().replace(/\D/g, ''), 10);
        return isNaN(num) ? '' : new Intl.NumberFormat('de-DE').format(num);
    };

    const deformatNumber = (formattedValue) => {
        if (!formattedValue) return 0;
        return parseFloat(formattedValue.toString().replace(/\./g, '')) || 0;
    };

    const showToast = (message) => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerHTML = `<i class="fas fa-info-circle" style="margin-right:8px"></i> ${message}`;
            toast.classList.add('show'); // CSS dùng .show hoặc animation
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    };

    const openModal = (modal) => {
        if (modal) modal.classList.add('active'); // CSS dùng .active
    };

    const closeModal = (modal) => {
        if (modal) modal.classList.remove('active');
    };

    const showConfirmation = ({ title, message, okText = 'Đồng ý', onConfirm = () => { } }) => {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        const btn = document.getElementById('confirm-ok-btn');
        btn.textContent = okText;

        // Reset classes first
        btn.className = 'btn';
        if (okText.toLowerCase().includes('xóa')) {
            btn.classList.add('btn-danger');
        } else {
            btn.classList.add('btn-primary');
        }

        confirmCallback = onConfirm;
        openModal(document.getElementById('confirm-modal'));
    };

    // Gán event listener cho nút confirm duy nhất 1 lần
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
        confirmCallback();
        closeModal(document.getElementById('confirm-modal'));
    });

    document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
        closeModal(document.getElementById('confirm-modal'));
    });


    // 4. DATA PERSISTENCE
    const getPersistentState = () => {
        const { currentUser, ...persistentState } = state;
        return persistentState;
    };

    const saveData = () => {
        localStorage.setItem('financeApp_v3.9', JSON.stringify(getPersistentState()));
        if (navigator.onLine && state.currentUser && state.settings.autoBackup) {
            clearTimeout(autoBackupTimeout);
            autoBackupTimeout = setTimeout(autoBackupToFirebase, 3000);
        }
    };

    const loadData = () => {
        const localData = localStorage.getItem('financeApp_v3.9');
        if (localData) {
            const loadedState = JSON.parse(localData);
            state = { ...getDefaultState(), ...loadedState, settings: { ...getDefaultState().settings, ...loadedState.settings } };
        }

        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) currencySelect.value = state.settings.currency;

        const autoBackupToggle = document.getElementById('auto-backup-toggle');
        if (autoBackupToggle) autoBackupToggle.checked = state.settings.autoBackup;

        applyUiState();
        renderAll();
    };

    // Firebase Backup
    const autoBackupToFirebase = async () => {
        if (!navigator.onLine || !state.currentUser) return;
        const backupData = getPersistentState();
        delete backupData.uiState;
        try {
            await db.collection('users').doc(state.currentUser.uid).collection('backups').doc('auto_backup').set({
                name: 'Tự động sao lưu',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                data: backupData
            });
            const infoEl = document.getElementById('last-backup-info');
            if (infoEl) infoEl.textContent = `Sao lưu tự động lần cuối: ${new Date().toLocaleTimeString()}`;
        } catch (error) { console.error("Auto backup failed:", error); }
    };

    const manualBackupToFirebase = async () => {
        if (!navigator.onLine) return showToast("Bạn đang ngoại tuyến.");
        const backupName = prompt("Đặt tên bản sao lưu:", `Sao lưu ${new Date().toLocaleDateString('vi-VN')}`);
        if (!backupName) return;

        const backupData = getPersistentState();
        delete backupData.uiState;
        try {
            await db.collection('users').doc(state.currentUser.uid).collection('backups').add({
                name: backupName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                data: backupData
            });
            showToast("Sao lưu thành công!");
        } catch (error) { showToast("Lỗi sao lưu!"); }
    };

    const fetchAndShowBackups = async () => {
        if (!navigator.onLine || !state.currentUser) return showToast("Cần đăng nhập và có mạng.");
        const listEl = document.getElementById('backup-list');
        listEl.innerHTML = '<div class="text-center p-4">Đang tải dữ liệu...</div>';
        openModal(document.getElementById('restore-modal'));

        try {
            const snapshot = await db.collection('users').doc(state.currentUser.uid).collection('backups').orderBy('timestamp', 'desc').limit(10).get();
            if (snapshot.empty) { listEl.innerHTML = '<p class="text-center p-4">Chưa có bản sao lưu nào.</p>'; return; }

            listEl.innerHTML = snapshot.docs.map(doc => {
                const d = doc.data();
                return `
                <div class="list-item p-2 flex justify-between items-center">
                    <div>
                        <div class="font-bold">${d.name}</div>
                        <div class="text-xs text-secondary">${d.timestamp ? d.timestamp.toDate().toLocaleString() : ''}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-primary restore-action-btn" style="padding: 4px 12px; font-size: 12px; width: auto;" data-id="${doc.id}">Chọn</button>
                        <button class="btn btn-danger delete-backup-btn" style="padding: 4px 12px; font-size: 12px; width: auto;" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            }).join('');

            listEl.querySelectorAll('.restore-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const doc = snapshot.docs.find(d => d.id === btn.dataset.id);
                    if (doc) restoreFromBackup(doc.data().data);
                });
            });
            listEl.querySelectorAll('.delete-backup-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteBackupFromFirebase(btn.dataset.id));
            });

        } catch (error) { listEl.innerHTML = '<p class="text-center p-4" style="color: var(--expense-color)">Lỗi tải dữ liệu.</p>'; }
    };

    const restoreFromBackup = (data) => {
        showConfirmation({
            title: 'Khôi phục dữ liệu?',
            message: 'Dữ liệu hiện tại trên máy sẽ bị thay thế hoàn toàn.',
            okText: 'Khôi phục',
            onConfirm: () => {
                localStorage.setItem('financeApp_v3.9', JSON.stringify(data));
                location.reload();
            }
        });
    };

    const deleteBackupFromFirebase = async (id) => {
        if (id === 'auto_backup') return showToast("Không thể xóa bản sao lưu tự động");
        try {
            await db.collection('users').doc(state.currentUser.uid).collection('backups').doc(id).delete();
            fetchAndShowBackups();
            showToast("Đã xóa.");
        } catch (e) { showToast("Lỗi khi xóa."); }
    };

    // 5. NAVIGATION & UI LOGIC
    const applyUiState = () => {
        const activeScreenId = state.uiState.activeScreen || 'dashboard-screen';

        // Screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const activeScreen = document.getElementById(activeScreenId);
        if (activeScreen) activeScreen.classList.add('active');

        // Bottom Nav
        document.querySelectorAll('.nav-item').forEach(n =>
            n.classList.toggle('active', n.dataset.screen === activeScreenId));

        // Dashboard Tabs
        if (activeScreenId === 'dashboard-screen') {
            const activeTab = state.uiState.activeDashboardTab || 'wallets';
            document.querySelectorAll('.dashboard-tab').forEach((tab, index) => {
                const isActive = tab.dataset.tab === activeTab;
                tab.classList.toggle('active', isActive);
                // Handle glider
                const glider = document.getElementById('dashboard-tab-glider');
                if (isActive && glider) glider.style.left = `${index * 50}%`;
            });
            const contents = document.querySelectorAll('.dashboard-tab-content');
            contents.forEach(c => c.classList.toggle('active', c.id.includes(activeTab)));
        }
    };

    // 6. RENDER FUNCTIONS (PURE CSS CLASSES)
    const renderAll = () => {
        renderDashboard();
        renderHistory();
        renderFundsScreen();
        renderExpensesScreen();
        renderDebtScreen();
        renderReportsScreen();
        renderSettingsScreen();

        const historyWalletFilter = document.getElementById('history-wallet-filter');
        if (historyWalletFilter) {
            const current = historyWalletFilter.value;
            historyWalletFilter.innerHTML = '<option value="all">Tất cả ví</option>' +
                state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
            historyWalletFilter.value = current;
        }
    };

    // --- DASHBOARD RENDER ---
    const renderDashboard = () => {
        // Calculation
        const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
        const monthStart = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
        const monthlyTxs = state.transactions.filter(tx => new Date(tx.date) >= monthStart);

        const totalIncome = monthlyTxs.filter(tx => tx.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = monthlyTxs.filter(tx => tx.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const totalSaved = state.funds.reduce((s, f) => s + f.savedAmount, 0);
        const totalTarget = state.funds.reduce((s, f) => s + f.targetAmount, 0);
        const totalMonthlyFixed = state.expenses.reduce((s, e) => s + e.amount, 0);

        // Update Info Card
        document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
        document.getElementById('total-income').textContent = formatCurrency(totalIncome);
        document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
        document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
        document.getElementById('total-saving-target').textContent = `/ ${formatCurrency(totalTarget)}`;
        document.getElementById('total-monthly-expenses').textContent = formatCurrency(totalMonthlyFixed);
        document.getElementById('total-expenses-count').textContent = `${state.expenses.length} chi phí định kỳ`;

        // Info Card Tabs
        const activeView = state.uiState.activeInfoCardView || 'balance';
        document.querySelectorAll('.info-card-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(`${activeView}-view`);
        if (activePane) activePane.classList.add('active');
        document.querySelectorAll('.info-card-tab').forEach(t => t.classList.toggle('active', t.dataset.view === activeView));

        // Render Wallets List
        const walletContainer = document.getElementById('wallets-content');
        if (state.wallets.length === 0) {
            walletContainer.innerHTML = '<div class="text-center p-4 text-secondary">Chưa có ví nào. Hãy tạo ví mới!</div>';
        } else {
            // Render Wallets List
            walletContainer.innerHTML = state.wallets.map(w => `
                <div class="list-item wallet-item">
                    <div class="wallet-left">
                        <div class="wallet-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="wallet-info">
                            <p class="wallet-name">${w.name}</p>
                            <p class="wallet-label">Số dư</p>
                        </div>
                    </div>
                    <div class="wallet-right">
                        <p class="wallet-balance">${formatCurrency(w.balance)}</p>
                        <div class="wallet-actions">
                            <button class="action-btn edit-wallet-btn" data-id="${w.id}"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-wallet-btn" data-id="${w.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Render Recent Transactions
        const recentTxs = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        const recentContainer = document.getElementById('recent-transactions-content');
        if (recentTxs.length === 0) {
            recentContainer.innerHTML = '<div class="text-center p-4 text-secondary">Chưa có giao dịch nào.</div>';
        } else {
            recentContainer.innerHTML = recentTxs.map(createTransactionHTML).join('');
        }
    };

    // Helper: Generate Transaction Item HTML
    const createTransactionHTML = (tx) => {
        const wallet = state.wallets.find(w => w.id === tx.walletId);
        const isIncome = tx.type === 'income';
        const colorVar = isIncome ? 'var(--income-color)' : 'var(--expense-color)';
        let icon = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';

        if (['Chuyển tiền đi', 'Nhận tiền', 'Trả nợ', 'Nạp tiền tiết kiệm'].includes(tx.category)) {
            icon = 'fa-exchange-alt';
            if (tx.category === 'Trả nợ') colorVar = 'var(--expense-color)';
        }

        return `
            <div class="list-item transaction-item" data-id="${tx.id}">
                <div class="transaction-icon-wrapper" style="background-color: color-mix(in srgb, ${colorVar} 15%, transparent);">
                    <i class="fas ${icon}" style="color: ${colorVar};"></i>
                </div>
                
                <div class="transaction-content">
                    <p class="t-category">${tx.category}</p>
                    <p class="t-wallet">
                        <span>${wallet ? wallet.name : 'Đã xóa'}</span>
                    </p>
                    ${tx.description ? `<p class="t-note">${tx.description}</p>` : ''}
                </div>
                
                <div class="transaction-right">
                    <p class="t-amount" style="color: ${isIncome ? 'var(--income-color)' : 'var(--text-primary)'};">
                        ${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}
                    </p>
                    <div class="t-actions">
                        <button class="action-btn delete-transaction-btn" data-id="${tx.id}" title="Xóa"><i class="fas fa-trash-alt"></i></button>
                        <button class="action-btn edit-transaction-btn" data-id="${tx.id}" title="Sửa"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
            </div>
        `;
    };
    // --- HISTORY RENDER ---
    const renderHistory = () => {
        const search = document.getElementById('history-search-input').value.toLowerCase();
        const type = document.getElementById('history-type-filter').value;
        const walletId = document.getElementById('history-wallet-filter').value;
        const start = document.getElementById('history-start-date').value;
        const end = document.getElementById('history-end-date').value;

        let txs = state.transactions.filter(t => {
            const d = new Date(t.date);
            return (type === 'all' || t.type === type) &&
                (walletId === 'all' || t.walletId == walletId) &&
                (!start || d >= new Date(start)) &&
                (!end || d <= new Date(end).setHours(23, 59, 59)) &&
                (!search || t.category.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search)));
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        const grouped = txs.reduce((acc, tx) => {
            const d = new Date(tx.date).toLocaleDateString('vi-VN');
            if (!acc[d]) acc[d] = [];
            acc[d].push(tx);
            return acc;
        }, {});

        const container = document.getElementById('full-transaction-list');
        if (Object.keys(grouped).length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 mt-4" style="color:var(--text-secondary)">
                    <i class="fas fa-search-dollar text-5xl mb-4" style="color:var(--primary-color);"></i>
                    <p class="text-lg font-semibold mb-2">Không tìm thấy giao dịch.</p>
                </div>`;
            return;
        }

        container.innerHTML = Object.entries(grouped).map(([date, items]) => `
            <div class="mb-4">
                <div class="text-sm font-bold text-secondary mb-2 px-2" style="color: var(--primary-dark)">${date}</div>
                <div class="space-y-2">
                    ${items.map(createTransactionHTML).join('')}
                </div>
            </div>
        `).join('');
    };

    // --- FUNDS RENDER ---
    const renderFundsScreen = () => {
        const list = document.getElementById('saving-goals-list');
        if (state.funds.length === 0) {
            list.innerHTML = '<div class="text-center p-4 text-secondary">Chưa có mục tiêu nào.</div>';
            return;
        }
        list.innerHTML = state.funds.map(f => {
            const pct = f.targetAmount > 0 ? (f.savedAmount / f.targetAmount) * 100 : 0;
            return `
            <div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);">
                <div class="flex items-start justify-between">
                    <div class="flex items-center">
                        <span class="text-2xl mr-4">${f.icon || '🎯'}</span>
                        <div>
                            <p class="font-bold">${f.name}</p>
                            ${f.deadline ? `<p class="text-xs" style="color: var(--text-secondary);">Hạn: ${new Date(f.deadline).toLocaleDateString('vi-VN')}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="edit-saving-btn p-2" data-id="${f.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-saving-btn p-2" data-id="${f.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="progress-bar rounded-full h-2">
                        <div class="progress-bar-inner rounded-full" style="width: ${Math.min(pct, 100)}%; background-color: var(--primary-color);"></div>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <div>
                            <p class="text-sm font-semibold" style="color: var(--primary-color);">${formatCurrency(f.savedAmount)} / ${formatCurrency(f.targetAmount)}</p> 
                        </div>
                        <span class="text-sm font-bold">${Math.round(pct)}%</span>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button class="withdraw-from-saving-btn w-full btn btn-secondary !py-2 text-sm" data-id="${f.id}">Rút tiền</button>
                    <button class="add-to-saving-btn w-full btn btn-primary !py-2 text-sm" data-id="${f.id}">Nạp tiền</button>
                </div>
            </div>`;
        }).join('');
    };

    // --- EXPENSES RENDER ---
    const renderExpensesScreen = () => {
        const sorted = [...state.expenses].sort((a, b) => (a.day || 32) - (b.day || 32));
        const container = document.getElementById('recurring-expenses-timeline');
        if (sorted.length === 0) {
            container.innerHTML = '<div class="text-center p-4 text-secondary">Chưa có chi phí định kỳ.</div>';
            return;
        }
        container.innerHTML = `<div class="relative">
            <div class="absolute top-5 h-full ml-5 -translate-x-1/2 border-l-2" style="border-color: var(--border-color)"></div>` +
            sorted.map(e => `
            <div class="flex">
                <div class="timeline-icon flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl z-10">${e.icon || '🧾'}</div>
                <div class="flex-grow pl-4 pb-6">
                    <div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold">${e.name}</p>
                                <p class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style="background-color: ${e.type === 'fixed' ? 'var(--border-color)' : 'color-mix(in srgb, var(--primary-color) 30%, transparent)'};">
                                    ${e.type === 'fixed' ? 'Cố định' : 'Linh hoạt'}
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button class="edit-expense-btn p-2" data-id="${e.id}"><i class="fas fa-edit"></i></button>
                                <button class="delete-expense-btn p-2" data-id="${e.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <p class="text-2xl font-bold my-2" style="color: var(--expense-color);">${formatCurrency(e.amount)}</p>
                        <p class="text-xs" style="color: var(--text-secondary);">${e.type === 'fixed' && e.frequency === 'monthly' ? `Ngày ${e.day} hàng tháng` : 'Chi phí không cố định'}</p>
                        ${e.note ? `<p class="text-xs mt-2 italic" style="color: var(--text-secondary);">${e.note}</p>` : ''}
                    </div>
                </div>
            </div>
        `).join('') + `</div>`;
    };

    // --- DEBTS RENDER ---
    const renderDebtScreen = () => {
        const list = document.getElementById('debt-list');
        if (state.debts.length === 0) {
            list.innerHTML = '<div class="text-center p-4 text-secondary">Sổ nợ trống.</div>';
            return;
        }
        list.innerHTML = state.debts.map(d => {
            const paid = (d.history || []).reduce((s, h) => s + h.amount, 0);
            const remain = d.amount - paid;
            const isLoan = d.type === 'loan';
            const pct = d.amount > 0 ? (paid / d.amount) * 100 : 0;
            return `
            <div class="list-item p-4 rounded-xl" style="background-color: var(--card-background);">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="font-bold">${isLoan ? 'Cho vay' : 'Đi vay'}: ${d.person}</p>
                        <p class="text-xs" style="color: var(--text-secondary);">
                           Còn lại: <span class="font-semibold" style="color: ${isLoan ? 'var(--income-color)' : 'var(--expense-color)'}">${formatCurrency(remain)}</span> / ${formatCurrency(d.amount)}
                        </p>
                    </div>
                    <div class="flex gap-2 items-center">
                         <button class="debt-history-btn p-2 text-lg" data-id="${d.id}"><i class="fas fa-history"></i></button>
                         <button class="edit-debt-btn p-2 text-lg" data-id="${d.id}"><i class="fas fa-edit"></i></button>
                         <button class="delete-debt-btn p-2 text-lg" data-id="${d.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="progress-bar">
                        <div class="progress-bar-inner" style="width: ${Math.min(pct, 100)}%; background-color: ${isLoan ? 'var(--income-color)' : 'var(--expense-color)'};"></div>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button class="pay-debt-btn w-full btn btn-primary !py-2 text-sm" data-id="${d.id}">${isLoan ? 'Nhận trả' : 'Trả Nợ'}</button>
                </div>
            </div>`;
        }).join('');
    };

    // --- REPORTS RENDER ---
    const renderReportsScreen = () => {
        // Budget Bar logic
        const budgetInput = document.getElementById('total-budget-input');
        if (budgetInput && document.activeElement !== budgetInput) {
            budgetInput.value = state.settings.totalMonthlyBudget ? formatNumberInput(state.settings.totalMonthlyBudget) : '';
        }

        const totalIncome = state.transactions.filter(t => t.type === 'income' && new Date(t.date) >= new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)).reduce((s, t) => s + t.amount, 0);
        const budget = state.settings.totalMonthlyBudget || totalIncome;

        const spending = { essential: 0, wants: 0, savings: 0 };
        const map = state.settings.budgetAllocation.categoryMap;

        state.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)).forEach(t => {
            if (t.category === 'Nạp tiền tiết kiệm') spending.savings += t.amount;
            else if (map[t.category] === 'essential') spending.essential += t.amount;
            else if (map[t.category] === 'wants') spending.wants += t.amount;
        });

        const alloc = state.settings.budgetAllocation;
        const renderBar = (label, key, color) => {
            const limit = budget * (alloc[key] / 100);
            const used = spending[key];
            const pct = limit > 0 ? (used / limit) * 100 : 0;
            const isOver = used > limit;
            return `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-semibold">${label}</span>
                        <span style="color: var(--text-secondary)">${formatCurrency(used)} / ${formatCurrency(limit)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-bar-inner" style="width: ${Math.min(pct, 100)}%; background-color: ${isOver ? 'var(--expense-color)' : color};"></div>
                    </div>
                </div>`;
        };

        document.getElementById('budget-comparison-container').innerHTML =
            renderBar('Thiết yếu', 'essential', 'var(--income-color)') +
            renderBar('Mong muốn', 'wants', 'var(--primary-color)') +
            renderBar('Tiết kiệm & Đầu tư', 'savings', 'var(--expense-color)'); // Màu dùng tạm để phân biệt

        // Custom Budget Toggles
        const toggle = document.getElementById('customize-budget-toggle');
        if (toggle) {
            toggle.checked = alloc.customize;
            document.getElementById('custom-budget-inputs').style.display = alloc.customize ? 'flex' : 'none';
            if (alloc.customize) {
                document.getElementById('essential-percent').value = alloc.essential;
                document.getElementById('wants-percent').value = alloc.wants;
                document.getElementById('savings-percent').value = alloc.savings;
            }
        }
    };

    // --- SETTINGS RENDER ---
    const renderSettingsScreen = () => {
        if (state.currentUser) {
            document.getElementById('logged-in-view').classList.remove('hidden');
            document.getElementById('logged-out-view').classList.add('hidden');
            document.getElementById('backup-restore-view').classList.remove('hidden');
            document.getElementById('backup-login-prompt').classList.add('hidden');
            document.getElementById('user-display-name').textContent = state.currentUser.displayName;
            document.getElementById('user-email').textContent = state.currentUser.email;
            document.getElementById('user-avatar').src = state.currentUser.photoURL;
        } else {
            document.getElementById('logged-in-view').classList.add('hidden');
            document.getElementById('logged-out-view').classList.remove('hidden');
            document.getElementById('backup-restore-view').classList.add('hidden');
            document.getElementById('backup-login-prompt').classList.remove('hidden');
        }
    };

    // 7. UI HELPER FUNCTIONS
    const setupTransactionModalUI = (type, modal) => {
        transactionType = type;
        const title = modal.querySelector('.modal-header');
        const fields = modal.querySelector('#transaction-fields');
        const transfer = modal.querySelector('#transfer-fields');

        modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        const btn = modal.querySelector(`.type-btn[data-type="${type}"]`);
        if (btn) btn.classList.add('active');

        if (type === 'transfer') {
            title.textContent = "Chuyển Tiền";
            fields.classList.add('hidden');
            transfer.classList.remove('hidden');
        } else {
            title.textContent = type === 'income' ? 'Thêm Thu Nhập' : 'Thêm Chi Tiêu';
            fields.classList.remove('hidden');
            transfer.classList.add('hidden');
            const label = modal.querySelector('#wallet-select-label');
            if (label) label.textContent = type === 'income' ? 'Vào ví' : 'Từ ví';

            // Render Chips
            const container = modal.querySelector('.category-chips');
            const input = modal.querySelector('input[type="hidden"][id*="category"]');
            if (container && input) renderCategoryChips(type, container, input, input.value);
        }
    };

    const renderCategoryChips = (type, container, input, selected) => {
        const cats = state.settings.categories[type] || [];
        container.innerHTML = cats.map(c =>
            `<div class="category-chip ${c === selected || input.value === c ? 'active' : ''}" data-val="${c}">${c}</div>`
        ).join('') + `<div class="category-chip add-cat-btn"><i class="fas fa-plus"></i></div>`;

        if (!input.value && cats.length > 0) input.value = cats[0];
    };

    const updateWalletSelect = (select, excludeId = null) => {
        if (!select) return;
        select.innerHTML = state.wallets
            .filter(w => w.id !== excludeId)
            .map(w => `<option value="${w.id}">${w.name} (${formatCurrency(w.balance)})</option>`)
            .join('');
    };

    // 8. EVENT LISTENERS

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => {
        state.uiState.activeScreen = item.dataset.screen;
        applyUiState();
        renderAll(); // Rerender để cập nhật dữ liệu mới nhất
    }));
    document.querySelectorAll('.dashboard-tab').forEach(tab => tab.addEventListener('click', () => {
        state.uiState.activeDashboardTab = tab.dataset.tab;
        applyUiState();
    }));
    document.querySelectorAll('.info-card-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            state.uiState.activeInfoCardView = btn.dataset.view;
            renderDashboard();
        });
    });
    document.getElementById('toggle-balance-visibility').addEventListener('click', () => {
        state.settings.balanceVisible = !state.settings.balanceVisible;
        saveData(); renderAll();
    });

    // Event Delegation
    document.body.addEventListener('click', e => {
        const t = e.target;

        // Chips
        if (t.classList.contains('category-chip') && !t.classList.contains('add-cat-btn')) {
            const container = t.parentElement;
            container.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            t.classList.add('active');
            const form = t.closest('form');
            const input = form.querySelector('input[type="hidden"][id*="category"]');
            if (input) input.value = t.dataset.val;
        }
        // Add Cat
        if (t.classList.contains('add-cat-btn') || t.closest('.add-cat-btn')) {
            const btn = t.classList.contains('add-cat-btn') ? t : t.closest('.add-cat-btn');
            const formContainer = btn.closest('.form-group').querySelector('.add-category-form');
            if (formContainer) formContainer.classList.toggle('hidden');
        }
        // Save Cat
        if (t.classList.contains('save-new-category-btn')) {
            const form = t.closest('form');
            const input = t.previousElementSibling;
            const val = input.value.trim();
            if (val) {
                const type = form.id.includes('edit') ? editTransactionType : transactionType;
                if (!state.settings.categories[type].includes(val)) {
                    state.settings.categories[type].push(val);
                    saveData();
                    renderCategoryChips(type, form.querySelector('.category-chips'), form.querySelector('input[type="hidden"][id*="category"]'), val);
                    input.parentElement.classList.add('hidden');
                }
            }
        }

        // --- ACTIONS ---
        // Wallet
        if (t.closest('.edit-wallet-btn')) {
            editingWalletId = parseInt(t.closest('.edit-wallet-btn').dataset.id);
            const w = state.wallets.find(x => x.id === editingWalletId);
            if (w) {
                document.getElementById('edit-wallet-name').value = w.name;
                document.getElementById('edit-wallet-balance').value = formatNumberInput(w.balance);
                openModal(document.getElementById('edit-wallet-modal'));
            }
        }
        if (t.closest('.delete-wallet-btn')) {
            const id = parseInt(t.closest('.delete-wallet-btn').dataset.id);
            showConfirmation({
                title: 'Xóa Ví?', message: 'Tất cả giao dịch của ví sẽ bị xóa.', okText: 'Xóa',
                onConfirm: () => {
                    state.wallets = state.wallets.filter(w => w.id !== id);
                    state.transactions = state.transactions.filter(tx => tx.walletId !== id);
                    saveData(); renderAll();
                }
            });
        }

        // Transaction
        if (t.closest('.edit-transaction-btn')) {
            editingTransactionId = parseInt(t.closest('.edit-transaction-btn').dataset.id);
            const tx = state.transactions.find(x => x.id === editingTransactionId);
            if (tx) {
                const modal = document.getElementById('edit-transaction-modal');
                editTransactionType = tx.type;
                setupTransactionModalUI(tx.type, modal);
                document.getElementById('edit-amount').value = formatNumberInput(tx.amount);
                document.getElementById('edit-description').value = tx.description || '';
                document.getElementById('edit-transaction-date').value = tx.date.split('T')[0];

                // Active class cho type toggle trong edit modal
                modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                const activeBtn = modal.querySelector(tx.type === 'income' ? '#edit-type-income' : '#edit-type-expense');
                if (activeBtn) activeBtn.classList.add('active');

                setTimeout(() => {
                    document.getElementById('edit-wallet-select').value = tx.walletId;
                    renderCategoryChips(tx.type, document.getElementById('edit-category-chips-container'), document.getElementById('edit-category'), tx.category);
                    if (tx.type === 'expense') document.getElementById('edit-budget-category').value = tx.budgetCategory || 'none';
                }, 0);
                openModal(modal);
            }
        }
        if (t.closest('.delete-transaction-btn') || t.id === 'delete-transaction-btn') {
            const id = t.id === 'delete-transaction-btn' ? editingTransactionId : parseInt(t.closest('.delete-transaction-btn').dataset.id);
            showConfirmation({
                title: 'Xóa giao dịch?', message: 'Không thể hoàn tác.', okText: 'Xóa',
                onConfirm: () => {
                    const tx = state.transactions.find(x => x.id === id);
                    if (tx) {
                        const w = state.wallets.find(x => x.id === tx.walletId);
                        if (w) w.balance -= (tx.type === 'income' ? tx.amount : -tx.amount);
                        state.transactions = state.transactions.filter(x => x.id !== id);
                        saveData(); renderAll(); closeModal(document.getElementById('edit-transaction-modal'));
                    }
                }
            });
        }

        // Saving
        if (t.closest('.edit-saving-btn')) {
            editingSavingGoalId = parseInt(t.closest('.edit-saving-btn').dataset.id);
            const f = state.funds.find(x => x.id === editingSavingGoalId);
            if (f) {
                document.getElementById('saving-name').value = f.name;
                document.getElementById('saving-target').value = formatNumberInput(f.targetAmount);
                document.getElementById('saving-icon').value = f.icon;
                document.getElementById('saving-deadline').value = f.deadline;
                openModal(document.getElementById('saving-goal-modal'));
            }
        }
        if (t.closest('.delete-saving-btn')) {
            const id = parseInt(t.closest('.delete-saving-btn').dataset.id);
            showConfirmation({
                title: 'Xóa Quỹ?', message: 'Không thể hoàn tác.', okText: 'Xóa',
                onConfirm: () => { state.funds = state.funds.filter(f => f.id !== id); saveData(); renderAll(); }
            });
        }
        if (t.classList.contains('add-to-saving-btn')) {
            addingToSavingGoalId = parseInt(t.dataset.id);
            updateWalletSelect(document.getElementById('add-saving-wallet-select'));
            document.getElementById('add-to-saving-form').reset();
            openModal(document.getElementById('add-to-saving-modal'));
        }
        if (t.classList.contains('withdraw-from-saving-btn')) {
            withdrawingFromSavingGoalId = parseInt(t.dataset.id);
            updateWalletSelect(document.getElementById('withdraw-saving-wallet-select'));
            document.getElementById('withdraw-from-saving-form').reset();
            openModal(document.getElementById('withdraw-from-saving-modal'));
        }

        // Expense
        if (t.closest('.edit-expense-btn')) {
            editingExpenseId = parseInt(t.closest('.edit-expense-btn').dataset.id);
            const eData = state.expenses.find(x => x.id === editingExpenseId);
            if (eData) {
                document.getElementById('expense-name').value = eData.name;
                document.getElementById('expense-amount').value = formatNumberInput(eData.amount);
                document.getElementById('expense-icon').value = eData.icon;
                document.getElementById('expense-type').value = eData.type;
                document.getElementById('expense-date').value = eData.day || '';
                openModal(document.getElementById('recurring-expense-modal'));
            }
        }
        if (t.closest('.delete-expense-btn')) {
            const id = parseInt(t.closest('.delete-expense-btn').dataset.id);
            showConfirmation({
                title: 'Xóa?', message: 'Xóa khoản chi này?', okText: 'Xóa',
                onConfirm: () => { state.expenses = state.expenses.filter(x => x.id !== id); saveData(); renderAll(); }
            });
        }

        // Debt
        if (t.closest('.edit-debt-btn')) {
            editingDebtId = parseInt(t.closest('.edit-debt-btn').dataset.id);
            const d = state.debts.find(x => x.id === editingDebtId);
            if (d) {
                document.getElementById('debt-type').value = d.type;
                document.getElementById('debt-person').value = d.person;
                document.getElementById('debt-amount').value = formatNumberInput(d.amount);
                document.getElementById('debt-start-date').value = d.startDate;
                document.getElementById('debt-end-date').value = d.endDate;
                openModal(document.getElementById('debt-modal'));
            }
        }
        if (t.closest('.delete-debt-btn')) {
            const id = parseInt(t.closest('.delete-debt-btn').dataset.id);
            showConfirmation({
                title: 'Xóa sổ nợ?', message: 'Xóa vĩnh viễn.', okText: 'Xóa',
                onConfirm: () => { state.debts = state.debts.filter(x => x.id !== id); saveData(); renderAll(); }
            });
        }
        if (t.classList.contains('pay-debt-btn')) {
            payingDebtId = parseInt(t.dataset.id);
            updateWalletSelect(document.getElementById('pay-debt-wallet-select'));
            document.getElementById('pay-debt-form').reset();
            document.getElementById('pay-debt-date').valueAsDate = new Date();
            openModal(document.getElementById('pay-debt-modal'));
        }
        if (t.closest('.debt-history-btn')) {
            const id = parseInt(t.closest('.debt-history-btn').dataset.id);
            const d = state.debts.find(x => x.id === id);
            const list = document.getElementById('debt-history-list');
            list.innerHTML = (d.history || []).map(h => `
                <div class="list-item p-2 mb-2 flex justify-between" style="background-color: var(--background-color); border-radius: 8px;">
                    <span class="font-bold">${formatCurrency(h.amount)}</span>
                    <span class="text-sm text-secondary">${new Date(h.date).toLocaleDateString('vi-VN')}</span>
                </div>
            `).join('') || '<div class="text-center p-2 text-secondary">Chưa có lịch sử.</div>';
            openModal(document.getElementById('debt-history-modal'));
        }
    });

    // 9. FORM SUBMIT HANDLERS

    // Quick Buttons
    document.getElementById('quick-action-expense').addEventListener('click', () => {
        document.getElementById('transaction-form').reset();
        setupTransactionModalUI('expense', document.getElementById('add-transaction-modal'));
        updateWalletSelect(document.getElementById('wallet-select'));
        document.getElementById('transaction-date').valueAsDate = new Date();
        openModal(document.getElementById('add-transaction-modal'));
    });
    document.getElementById('quick-action-income').addEventListener('click', () => {
        document.getElementById('transaction-form').reset();
        setupTransactionModalUI('income', document.getElementById('add-transaction-modal'));
        updateWalletSelect(document.getElementById('wallet-select'));
        document.getElementById('transaction-date').valueAsDate = new Date();
        openModal(document.getElementById('add-transaction-modal'));
    });
    document.getElementById('quick-action-transfer').addEventListener('click', () => {
        document.getElementById('transaction-form').reset();
        setupTransactionModalUI('transfer', document.getElementById('add-transaction-modal'));
        updateWalletSelect(document.getElementById('from-wallet-select'));
        updateWalletSelect(document.getElementById('to-wallet-select'));
        document.getElementById('transfer-date').valueAsDate = new Date();
        openModal(document.getElementById('add-transaction-modal'));
    });
    document.getElementById('quick-action-add-wallet').addEventListener('click', () => {
        document.getElementById('wallet-form').reset();
        openModal(document.getElementById('add-wallet-modal'));
    });

    // Add Buttons
    document.getElementById('add-saving-goal-btn').addEventListener('click', () => {
        editingSavingGoalId = null;
        document.getElementById('saving-goal-form').reset();
        openModal(document.getElementById('saving-goal-modal'));
    });
    document.getElementById('add-recurring-expense-btn').addEventListener('click', () => {
        editingExpenseId = null;
        document.getElementById('recurring-expense-form').reset();
        openModal(document.getElementById('recurring-expense-modal'));
    });
    document.getElementById('add-debt-btn').addEventListener('click', () => {
        editingDebtId = null;
        document.getElementById('debt-form').reset();
        document.getElementById('debt-start-date').valueAsDate = new Date();
        openModal(document.getElementById('debt-modal'));
    });

    // Modal Type Toggles
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal-content').parentElement;

            // Nếu là edit modal, chỉ cập nhật biến type
            if (modal.id === 'edit-transaction-modal') {
                modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                editTransactionType = this.id === 'edit-type-income' ? 'income' : 'expense';
                // Load lại categories cho type mới
                renderCategoryChips(editTransactionType, document.getElementById('edit-category-chips-container'), document.getElementById('edit-category'), '');
            } else {
                setupTransactionModalUI(this.dataset.type, modal);
            }
        });
    });

    // Wallet Submit
    document.getElementById('wallet-form').addEventListener('submit', e => {
        e.preventDefault();
        state.wallets.push({
            id: Date.now(),
            name: document.getElementById('wallet-name').value,
            balance: deformatNumber(document.getElementById('initial-balance').value)
        });
        saveData(); renderAll(); closeModal(document.getElementById('add-wallet-modal'));
    });

    // Edit Wallet Submit
    document.getElementById('edit-wallet-form').addEventListener('submit', e => {
        e.preventDefault();
        const w = state.wallets.find(x => x.id === editingWalletId);
        if (w) {
            const newBal = deformatNumber(document.getElementById('edit-wallet-balance').value);
            const diff = newBal - w.balance;
            if (diff !== 0) {
                state.transactions.push({
                    id: Date.now(), type: diff > 0 ? 'income' : 'expense', amount: Math.abs(diff),
                    category: 'Điều chỉnh số dư', walletId: w.id, date: new Date().toISOString()
                });
            }
            w.name = document.getElementById('edit-wallet-name').value;
            w.balance = newBal;
            saveData(); renderAll(); closeModal(document.getElementById('edit-wallet-modal'));
        }
    });

    // Transaction Submit
    document.getElementById('transaction-form').addEventListener('submit', e => {
        e.preventDefault();
        const isTransfer = transactionType === 'transfer';
        const dateVal = document.getElementById(isTransfer ? 'transfer-date' : 'transaction-date').value;
        const date = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

        if (isTransfer) {
            const amount = deformatNumber(document.getElementById('transfer-amount').value);
            const fromId = parseInt(document.getElementById('from-wallet-select').value);
            const toId = parseInt(document.getElementById('to-wallet-select').value);

            if (!amount || !fromId || !toId || fromId === toId) return showToast('Kiểm tra lại thông tin');
            const wFrom = state.wallets.find(x => x.id === fromId);
            const wTo = state.wallets.find(x => x.id === toId);

            if (wFrom.balance < amount) return showToast('Số dư không đủ');

            wFrom.balance -= amount;
            wTo.balance += amount;
            const note = document.getElementById('description').value;

            state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Chuyển tiền đi', walletId: fromId, description: `Đến ${wTo.name}. ${note}`, date });
            state.transactions.push({ id: Date.now() + 1, type: 'income', amount, category: 'Nhận tiền', walletId: toId, description: `Từ ${wFrom.name}. ${note}`, date });
        } else {
            const amount = deformatNumber(document.getElementById('amount').value);
            const walletId = parseInt(document.getElementById('wallet-select').value);
            const category = document.getElementById('category').value;
            const desc = document.getElementById('description').value;
            const budgetCat = document.getElementById('budget-category').value;

            if (!amount || !walletId || !category) return showToast('Nhập đủ thông tin');

            const w = state.wallets.find(x => x.id === walletId);
            w.balance += (transactionType === 'income' ? amount : -amount);

            const newTx = {
                id: Date.now(), type: transactionType, amount, category, walletId,
                description: desc, date
            };
            if (transactionType === 'expense') newTx.budgetCategory = budgetCat;
            state.transactions.push(newTx);
        }
        saveData(); renderAll(); closeModal(document.getElementById('add-transaction-modal'));
        e.target.reset();
    });

    // Edit Transaction Submit
    document.getElementById('edit-transaction-form').addEventListener('submit', e => {
        e.preventDefault();
        const idx = state.transactions.findIndex(x => x.id === editingTransactionId);
        if (idx === -1) return;

        const oldTx = state.transactions[idx];
        const wOld = state.wallets.find(x => x.id === oldTx.walletId);
        if (wOld) wOld.balance -= (oldTx.type === 'income' ? oldTx.amount : -oldTx.amount);

        const amount = deformatNumber(document.getElementById('edit-amount').value);
        const walletId = parseInt(document.getElementById('edit-wallet-select').value);
        const date = new Date(document.getElementById('edit-transaction-date').value).toISOString();
        const category = document.getElementById('edit-category').value;
        const desc = document.getElementById('edit-description').value;

        const wNew = state.wallets.find(x => x.id === walletId);
        wNew.balance += (editTransactionType === 'income' ? amount : -amount);

        state.transactions[idx] = {
            ...oldTx, type: editTransactionType, amount, walletId, category, description: desc, date,
            budgetCategory: editTransactionType === 'expense' ? document.getElementById('edit-budget-category').value : undefined
        };
        saveData(); renderAll(); closeModal(document.getElementById('edit-transaction-modal'));
    });

    // Other Submits
    document.getElementById('saving-goal-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            name: document.getElementById('saving-name').value,
            icon: document.getElementById('saving-icon').value,
            targetAmount: deformatNumber(document.getElementById('saving-target').value),
            deadline: document.getElementById('saving-deadline').value
        };
        if (editingSavingGoalId) {
            const idx = state.funds.findIndex(x => x.id === editingSavingGoalId);
            state.funds[idx] = { ...state.funds[idx], ...data };
        } else {
            state.funds.push({ ...data, id: Date.now(), savedAmount: 0 });
        }
        saveData(); renderAll(); closeModal(document.getElementById('saving-goal-modal'));
    });

    document.getElementById('add-to-saving-form').addEventListener('submit', e => {
        e.preventDefault();
        const amount = deformatNumber(document.getElementById('add-saving-amount').value);
        const walletId = parseInt(document.getElementById('add-saving-wallet-select').value);
        const w = state.wallets.find(x => x.id === walletId);
        const f = state.funds.find(x => x.id === addingToSavingGoalId);
        if (w.balance < amount) return showToast('Số dư không đủ');
        w.balance -= amount;
        f.savedAmount += amount;
        state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Nạp tiền tiết kiệm', walletId, description: `Vào ${f.name}`, date: new Date().toISOString() });
        saveData(); renderAll(); closeModal(document.getElementById('add-to-saving-modal'));
    });

    document.getElementById('withdraw-from-saving-form').addEventListener('submit', e => {
        e.preventDefault();
        const amount = deformatNumber(document.getElementById('withdraw-saving-amount').value);
        const walletId = parseInt(document.getElementById('withdraw-saving-wallet-select').value);
        const w = state.wallets.find(x => x.id === walletId);
        const f = state.funds.find(x => x.id === withdrawingFromSavingGoalId);
        if (f.savedAmount < amount) return showToast('Quỹ không đủ tiền');
        w.balance += amount;
        f.savedAmount -= amount;
        state.transactions.push({ id: Date.now(), type: 'income', amount, category: 'Rút tiền tiết kiệm', walletId, description: `Từ ${f.name}`, date: new Date().toISOString() });
        saveData(); renderAll(); closeModal(document.getElementById('withdraw-from-saving-modal'));
    });

    document.getElementById('recurring-expense-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            name: document.getElementById('expense-name').value,
            icon: document.getElementById('expense-icon').value,
            amount: deformatNumber(document.getElementById('expense-amount').value),
            type: document.getElementById('expense-type').value,
            day: parseInt(document.getElementById('expense-date').value) || null,
            frequency: document.getElementById('expense-frequency').value,
            note: document.getElementById('expense-note').value
        };
        if (editingExpenseId) {
            const idx = state.expenses.findIndex(x => x.id === editingExpenseId);
            state.expenses[idx] = { ...state.expenses[idx], ...data };
        } else {
            state.expenses.push({ ...data, id: Date.now() });
        }
        saveData(); renderAll(); closeModal(document.getElementById('recurring-expense-modal'));
    });

    document.getElementById('debt-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            type: document.getElementById('debt-type').value,
            person: document.getElementById('debt-person').value,
            amount: deformatNumber(document.getElementById('debt-amount').value),
            startDate: document.getElementById('debt-start-date').value,
            endDate: document.getElementById('debt-end-date').value,
            note: document.getElementById('debt-note').value
        };
        if (editingDebtId) {
            const idx = state.debts.findIndex(x => x.id === editingDebtId);
            state.debts[idx] = { ...state.debts[idx], ...data };
        } else {
            state.debts.push({ ...data, id: Date.now(), history: [] });
        }
        saveData(); renderAll(); closeModal(document.getElementById('debt-modal'));
    });

    document.getElementById('pay-debt-form').addEventListener('submit', e => {
        e.preventDefault();
        const amount = deformatNumber(document.getElementById('pay-debt-amount').value);
        const walletId = parseInt(document.getElementById('pay-debt-wallet-select').value);
        const date = document.getElementById('pay-debt-date').value;
        const d = state.debts.find(x => x.id === payingDebtId);
        const w = state.wallets.find(x => x.id === walletId);

        if (d.type === 'debt') {
            if (w.balance < amount) return showToast('Số dư không đủ');
            w.balance -= amount;
            state.transactions.push({ id: Date.now(), type: 'expense', amount, category: 'Trả nợ', walletId, description: `Trả ${d.person}`, date: new Date(date).toISOString() });
        } else {
            w.balance += amount;
            state.transactions.push({ id: Date.now(), type: 'income', amount, category: 'Thu hồi nợ', walletId, description: `${d.person} trả`, date: new Date(date).toISOString() });
        }
        d.history.push({ amount, date, note: document.getElementById('pay-debt-note').value });
        saveData(); renderAll(); closeModal(document.getElementById('pay-debt-modal'));
    });

    // Misc
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        showConfirmation({
            title: 'Xóa toàn bộ?', message: 'Dữ liệu sẽ mất hết.', okText: 'Xóa sạch',
            onConfirm: () => { localStorage.removeItem('financeApp_v3.9'); location.reload(); }
        });
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(getPersistentState(), null, 2)], { type: 'application/json' }));
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });

    document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
    document.getElementById('import-file-input').addEventListener('change', e => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.wallets) { localStorage.setItem('financeApp_v3.9', JSON.stringify(data)); location.reload(); }
            } catch (err) { showToast('Lỗi file'); }
        };
        if (e.target.files[0]) reader.readAsText(e.target.files[0]);
    });

    document.getElementById('currency-select').addEventListener('change', e => { state.settings.currency = e.target.value; saveData(); renderAll(); });

    // Auth
    document.getElementById('login-google-btn').addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
    auth.onAuthStateChanged(user => {
        state.currentUser = user; renderSettingsScreen();
        if (user && state.settings.autoBackup) autoBackupToFirebase();
    });

    document.getElementById('manual-backup-btn').addEventListener('click', manualBackupToFirebase);
    document.getElementById('restore-backup-btn').addEventListener('click', fetchAndShowBackups);
    document.getElementById('auto-backup-toggle').addEventListener('change', e => { state.settings.autoBackup = e.target.checked; saveData(); });

    // Modal close global handler
    document.querySelectorAll('.modal-backdrop').forEach(m => {
        m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
        m.querySelector('.btn-cancel-modal')?.addEventListener('click', () => closeModal(m));
    });

    // Format inputs
    ['amount', 'transfer-amount', 'edit-amount', 'initial-balance', 'edit-wallet-balance', 'saving-target', 'expense-amount', 'debt-amount', 'pay-debt-amount', 'add-saving-amount', 'withdraw-saving-amount', 'total-budget-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => e.target.value = formatNumberInput(e.target.value));
    });

    // Manage Categories (Basic implementation to open modal)
    document.getElementById('manage-categories-btn').addEventListener('click', () => {
        // Logic mở modal quản lý danh mục (nếu cần triển khai sâu hơn)
        showToast("Tính năng đang phát triển");
    });

    // Initial load
    loadData();
});