// --- LUCKY WHEEL FUNCTIONS (NEW & IMPROVED ADMIN CONFIG) ---

// This function remains the same for the user view
async function setupLuckyWheel() {
    const grid = document.getElementById('lucky-wheel-grid');
    const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
    const configSnap = await getDoc(configRef);

    let prizes = [];
    if (configSnap.exists()) {
        prizes = configSnap.data().prizes;
    } else {
        // Default placeholder prizes if not configured
        for (let i = 0; i < 8; i++) {
            prizes.push({ name: `Vật phẩm ${i+1}`, imageUrl: 'https://via.placeholder.com/50' });
        }
    }

    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        if (i === 4) { // Center button
            const canSpin = !currentUserData.lastSpin || !isSameDay(currentUserData.lastSpin.toDate(), new Date());
            grid.innerHTML += `<button id="spin-btn" class="lucky-wheel-item" ${!canSpin ? 'disabled' : ''}>
                                 <i class="fas fa-play text-4xl"></i>
                                 <span>${canSpin ? 'QUAY' : 'ĐÃ QUAY'}</span>
                               </button>`;
        } else {
            const prizeIndex = i < 4 ? i : i - 1;
            const prize = prizes[prizeIndex] || { name: '...', imageUrl: 'https://via.placeholder.com/50' };
            grid.innerHTML += `<div class="lucky-wheel-item" data-index="${prizeIndex}">
                                 <img src="${prize.imageUrl}" alt="${prize.name}">
                                 <span>${prize.name}</span>
                               </div>`;
        }
    }

    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', handleSpin);
    }
}

// This function remains the same
async function handleSpin() {
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    showLoading();

    try {
        const canSpin = !currentUserData.lastSpin || !isSameDay(currentUserData.lastSpin.toDate(), new Date());
        if (!canSpin) {
            throw new Error("Bạn đã hết lượt quay hôm nay.");
        }
        
        const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
        const configDoc = await getDoc(configRef);
        if (!configDoc.exists()) throw new Error("Vòng quay chưa được cấu hình.");

        let prizes = configDoc.data().prizes.map((p, index) => ({...p, originalIndex: index}));
        
        prizes = prizes.filter(p => p.quantity > 0);

        const totalRate = prizes.reduce((sum, p) => sum + p.winRate, 0);
        let random = Math.random() * totalRate;
        let wonPrize = null;

        for (const prize of prizes) {
            random -= prize.winRate;
            if (random <= 0) {
                wonPrize = prize;
                break;
            }
        }
        
        if (!wonPrize) throw new Error("Không thể xác định phần thưởng. Vui lòng thử lại.");
        
        await animateSpin(wonPrize.originalIndex);
        await processPrize(wonPrize);

        document.getElementById('prize-won-image').src = wonPrize.imageUrl;
        document.getElementById('prize-won-name').textContent = wonPrize.rewardType === 'money'
            ? formatCurrency(wonPrize.rewardValue)
            : wonPrize.name;
        document.getElementById('prize-won-modal').style.display = 'flex';

    } catch (error) {
        showToast(error.message, true);
        spinBtn.disabled = false;
    } finally {
        hideLoading();
    }
}

// This function remains the same
function animateSpin(winningIndex) {
    return new Promise(resolve => {
        const gridItems = document.querySelectorAll('.lucky-wheel-item:not(#spin-btn)');
        let currentIndex = 0;
        let rounds = 3;
        const totalItems = 8;
        let delay = 100;
        
        const spinInterval = setInterval(() => {
            gridItems.forEach(item => item.classList.remove('highlight'));
            const currentGridItem = Array.from(gridItems).find(item => parseInt(item.dataset.index) === (currentIndex % totalItems));
            if(currentGridItem) currentGridItem.classList.add('highlight');
            
            currentIndex++;

            if (rounds === 1 && (totalItems - (currentIndex % totalItems)) < 4) {
                delay += 50;
            }

            const mappedWinningIndex = Array.from(gridItems).findIndex(item => parseInt(item.dataset.index) === winningIndex);
            
            if (currentIndex > rounds * totalItems + mappedWinningIndex) {
                clearInterval(spinInterval);
                setTimeout(() => resolve(), 500); 
            }
        }, delay);
    });
}

// This function remains the same
async function processPrize(prize) {
     const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
     const userRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);

    await runTransaction(db, async (transaction) => {
        const configDoc = await transaction.get(configRef);
        const prizes = configDoc.data().prizes;
        const prizeInDb = prizes[prize.originalIndex];
        
        if (prizeInDb.quantity < 1) throw new Error("Phần thưởng này đã hết!");

        prizes[prize.originalIndex].quantity -= 1;
        transaction.update(configRef, { prizes: prizes });
        transaction.update(userRef, { lastSpin: serverTimestamp() });

        if (prize.rewardType === 'money') {
            transaction.update(userRef, { balance: currentUserData.balance + prize.rewardValue });
            const transactionRef = doc(collection(db, `artifacts/${appId}/transactions`));
            transaction.set(transactionRef, {
                type: 'lucky_spin_win',
                userId: currentUser.uid,
                userName: currentUserData.displayName,
                amount: prize.rewardValue,
                prizeName: prize.name,
                content: `Trúng thưởng vòng quay`,
                timestamp: serverTimestamp()
            });
        } else { 
            const requestRef = doc(collection(db, `artifacts/${appId}/itemPrizeRequests`));
            transaction.set(requestRef, {
                userId: currentUser.uid,
                userDisplayName: currentUserData.displayName,
                prizeName: prize.name,
                prizeImageUrl: prize.imageUrl,
                createdAt: serverTimestamp(),
                status: 'pending'
            });
        }
    });
}


// --- NEW ADMIN FUNCTIONS ---

// Helper function to render a single prize configuration item
function renderPrizeConfigItem(prize = {}, index) {
    const prizeData = prize || {};
    return `
        <div class="bg-tertiary p-4 rounded-lg prize-config-item" data-index="${index}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-primary">Vật phẩm ${index + 1}</h4>
                <button class="remove-prize-btn p-2 text-danger hover:bg-secondary rounded-md"><i class="fas fa-trash"></i></button>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Tên vật phẩm" class="admin-lw-name w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.name || ''}">
                <input type="text" placeholder="URL Hình ảnh" class="admin-lw-image w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.imageUrl || ''}">
                <input type="number" placeholder="Tỉ lệ trúng (VD: 10)" class="admin-lw-rate w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.winRate || 0}">
                <input type="number" placeholder="Số lượng" class="admin-lw-quantity w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.quantity || 0}">
                <select class="admin-lw-type w-full p-2 rounded bg-secondary border border-color text-primary focus:ring-2 ring-accent">
                    <option value="money" ${prizeData.rewardType === 'money' ? 'selected' : ''}>Phần thưởng là Tiền</option>
                    <option value="item" ${prizeData.rewardType === 'item' ? 'selected' : ''}>Phần thưởng là Vật phẩm</option>
                </select>
                <input type="number" placeholder="Giá trị (nếu là tiền)" class="admin-lw-value w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.rewardValue || 0}">
            </div>
        </div>
    `;
}

// Helper function to enable/disable the 'Add' button
function updateAddPrizeButtonState() {
    const prizesCount = document.querySelectorAll('.prize-config-item').length;
    const addBtn = document.getElementById('admin-add-prize-btn');
    addBtn.disabled = prizesCount >= 8;
    if (addBtn.disabled) {
        addBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// NEW function to replace the old setupAdminLuckyWheel
function setupAdminLuckyWheel() {
    if (unsubscribeAdminLuckyWheel) unsubscribeAdminLuckyWheel();
    const container = document.getElementById('admin-lucky-wheel-prizes-list');
    const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
    
    unsubscribeAdminLuckyWheel = onSnapshot(configRef, (docSnap) => {
        let prizes = [];
        if (docSnap.exists() && docSnap.data().prizes) {
            prizes = docSnap.data().prizes;
        }

        container.innerHTML = ''; // Clear current list
        prizes.forEach((prize, index) => {
            container.insertAdjacentHTML('beforeend', renderPrizeConfigItem(prize, index));
        });
        updateAddPrizeButtonState();
    });
}

// NEW Event listener for the 'Add Prize' button
document.getElementById('admin-add-prize-btn').addEventListener('click', () => {
    const container = document.getElementById('admin-lucky-wheel-prizes-list');
    const newIndex = container.children.length;
    if (newIndex < 8) {
        container.insertAdjacentHTML('beforeend', renderPrizeConfigItem({}, newIndex));
        updateAddPrizeButtonState();
    }
});

// NEW Event listener for 'Remove Prize' buttons (using event delegation)
document.getElementById('admin-lucky-wheel-prizes-list').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-prize-btn');
    if (removeBtn) {
        removeBtn.closest('.prize-config-item').remove();
        // Re-index remaining items to keep the numbering correct
        document.querySelectorAll('.prize-config-item').forEach((item, index) => {
            item.dataset.index = index;
            item.querySelector('h4').textContent = `Vật phẩm ${index + 1}`;
        });
        updateAddPrizeButtonState();
    }
});

// NEW Event listener to replace the old 'save' button logic
document.getElementById('save-lucky-wheel-btn').addEventListener('click', async () => {
    const prizeElements = document.querySelectorAll('#admin-lucky-wheel-prizes-list .prize-config-item');
    const newPrizes = [];
    let isValid = true;
    
    prizeElements.forEach(el => {
        const name = el.querySelector('.admin-lw-name').value;
        const imageUrl = el.querySelector('.admin-lw-image').value;
        const winRate = parseInt(el.querySelector('.admin-lw-rate').value) || 0;
        const quantity = parseInt(el.querySelector('.admin-lw-quantity').value) || 0;
        const rewardType = el.querySelector('.admin-lw-type').value;
        const rewardValue = parseInt(el.querySelector('.admin-lw-value').value) || 0;

        if(!name || !imageUrl) {
            isValid = false;
        }
        
        newPrizes.push({ name, imageUrl, winRate, quantity, rewardType, rewardValue });
    });

    if(!isValid) return showToast("Tên và URL ảnh của mỗi vật phẩm không được để trống.", true);
    if (newPrizes.length > 8) return showToast("Chỉ có thể cấu hình tối đa 8 vật phẩm.", true);

    showLoading();
    try {
        const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
        await setDoc(configRef, { prizes: newPrizes }); 
        showToast("Đã lưu cấu hình vòng quay!");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});