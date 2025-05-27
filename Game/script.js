document.addEventListener('DOMContentLoaded', () => {
    console.log("KVTM - Offline! JS Loaded. Version 5.0 Watering & Fertilizer.");

    const khuVuonContainer = document.getElementById('khu-vuon-container');
    const saveGameButton = document.getElementById('save-game-button');
    const loadGameButton = document.getElementById('load-game-button');
    const resetGameButton = document.getElementById('reset-game-button');
    const playerGoldDisplay = document.getElementById('player-gold');

    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalOptionsContainer = document.getElementById('modal-options');
    const modalPlantSelector = document.getElementById('modal-plant-selector');
    const plantOptionsContainer = document.getElementById('plant-options-container');
    const closeModalButton = document.getElementById('close-modal-button');

    const SO_LUONG_CHAU_TOI_DA = 6;

    const potTiers = [
        { id: 'dat', name: 'Đất', upgradeCostToNext: 150, growthMultiplier: 1.0, yieldMultiplier: 1.0, color: '#D2B48C', borderColor: '#A07855' },
        { id: 'bac', name: 'Bạc', upgradeCostToNext: 400, growthMultiplier: 0.9, yieldMultiplier: 1.1, color: '#D0D0D5', borderColor: '#A8A8AD' },
        { id: 'vang', name: 'Vàng', upgradeCostToNext: 800, growthMultiplier: 0.8, yieldMultiplier: 1.2, color: '#FFDF80', borderColor: '#E5C100' },
        { id: 'bachkim', name: 'B.Kim', upgradeCostToNext: 2000, growthMultiplier: 0.7, yieldMultiplier: 1.3, color: '#E8E8EB', borderColor: '#C0C0C5' },
        { id: 'kimcuong', name: 'K.Cương', upgradeCostToNext: null, growthMultiplier: 0.6, yieldMultiplier: 1.5, color: '#C9F5FF', borderColor: '#A0D2DB' }
    ];

    const plantsData = [
        {
            id: 'hoa_hong', name: 'Hoa Hồng', icon: '🌹', stages: ['🌰', '🌱', '🌿', '🌹'],
            baseGrowthTime: 12, baseHarvestYield: 40, costToPlant: 8, waterNeedInterval: 20 // seconds
        },
        {
            id: 'huong_duong', name: 'H.Dương', icon: '🌻', stages: ['🌰', '🌱', '🌿', '🌻'],
            baseGrowthTime: 22, baseHarvestYield: 100, costToPlant: 20, waterNeedInterval: 30
        },
        {
            id: 'rau_cai', name: 'Rau Cải', icon: '🥬', stages: ['🌰', '🌱', '🥬'],
            baseGrowthTime: 7, baseHarvestYield: 15, costToPlant: 4, waterNeedInterval: 15
        },
        {
            id: 'ca_rot', name: 'Cà Rốt', icon: '🥕', stages: ['🌰', '🌱', '🌿', '🥕'],
            baseGrowthTime: 18, baseHarvestYield: 70, costToPlant: 12, waterNeedInterval: 25
        }
    ];

    const FERTILIZER_ITEM = {
        id: 'phan_bon_nhanh',
        name: 'Phân Bón Nhanh',
        cost: 30,
        durationSeconds: 60, // Tác dụng trong 60 giây
        speedBoostMultiplier: 0.5 // Giảm 50% thời gian lớn (tức là nhanh gấp đôi)
    };


    let gardenState = {
        pots: [],
        playerGold: 150,
    };

    let selectedPotData = null;
    let gameInterval = null;

    function initializeGarden() {
        if (gardenState.pots.length === 0 || gardenState.pots.some(p => typeof p.isWatered === 'undefined')) {
            gardenState.pots = []; // Reset nếu cấu trúc cũ hoặc trống
            for (let i = 0; i < SO_LUONG_CHAU_TOI_DA; i++) {
                gardenState.pots.push({
                    id: `chau-${i + 1}`,
                    tierId: potTiers[0].id,
                    plantId: null,
                    plantedAt: null,
                    isReady: false,
                    currentStageIndex: 0,
                    isWatered: true, // Mặc định là đã tưới khi mới tạo
                    lastWateredTime: null, // Sẽ được set khi trồng
                    fertilizedUntil: null, // Thời điểm phân bón hết tác dụng
                    // hasPest: false, // Cho sau này
                });
            }
        }
        renderAllPots();
        updateGoldDisplay();
        startGameLoop();
    }

    function handlePotClick(potDataClicked) {
        selectedPotData = potDataClicked;
        const potTier = getCurrentPotTier(selectedPotData);
        modalTitle.textContent = `Chậu ${selectedPotData.id.split('-')[1]} (${potTier.name})`;
        modalOptionsContainer.innerHTML = '';
        modalPlantSelector.classList.add('hidden');
        modalOptionsContainer.classList.remove('hidden');

        if (selectedPotData.plantId && selectedPotData.isReady) {
            harvestPlant(selectedPotData);
            return;
        } else if (selectedPotData.plantId && !selectedPotData.isReady) { // Cây đang lớn
            // Tùy chọn Tưới Cây
            if (!selectedPotData.isWatered) {
                const waterButton = document.createElement('button');
                waterButton.classList.add('modal-button', 'action-water');
                waterButton.textContent = 'Tưới Nước 💧';
                waterButton.addEventListener('click', () => waterPlant(selectedPotData));
                modalOptionsContainer.appendChild(waterButton);
            }

            // Tùy chọn Bón Phân
            if (!selectedPotData.fertilizedUntil || Date.now() > selectedPotData.fertilizedUntil) {
                const fertilizeButton = document.createElement('button');
                fertilizeButton.classList.add('modal-button', 'action-fertilize');
                fertilizeButton.textContent = `Bón Phân ✨ (${FERTILIZER_ITEM.cost} Vàng)`;
                if (gardenState.playerGold < FERTILIZER_ITEM.cost) {
                    fertilizeButton.disabled = true;
                    fertilizeButton.title = 'Không đủ vàng';
                }
                fertilizeButton.addEventListener('click', () => fertilizePlant(selectedPotData));
                modalOptionsContainer.appendChild(fertilizeButton);
            }
            
            if (modalOptionsContainer.children.length === 0) { // Nếu đã tưới và đã bón phân (hoặc vừa mới bón)
                 showTemporaryMessage('Cây đang phát triển tốt!', 'info');
                 hideActionModal(); // Không có hành động nào khác thì đóng modal
                 return;
            }
            showActionModal();

        } else { // Chậu trống
            const plantButton = document.createElement('button');
            plantButton.classList.add('modal-button', 'plant');
            plantButton.textContent = 'Trồng Cây Mới';
            plantButton.addEventListener('click', showPlantSelectorForPot);
            modalOptionsContainer.appendChild(plantButton);

            const currentTierIndex = potTiers.findIndex(t => t.id === potTier.id);
            if (currentTierIndex < potTiers.length - 1) {
                const nextTier = potTiers[currentTierIndex + 1];
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('modal-button', 'upgrade');
                upgradeButton.textContent = `Nâng lên ${nextTier.name} (${potTier.upgradeCostToNext} Vàng)`;
                if (gardenState.playerGold < potTier.upgradeCostToNext) {
                    upgradeButton.disabled = true;
                    upgradeButton.title = 'Không đủ vàng';
                }
                upgradeButton.addEventListener('click', () => upgradePot(selectedPotData));
                modalOptionsContainer.appendChild(upgradeButton);
            }
            showActionModal();
        }
    }
    
    function waterPlant(potToWater) {
        potToWater.isWatered = true;
        potToWater.lastWateredTime = Date.now(); // Ghi lại thời điểm tưới
        showTemporaryMessage(`Đã tưới nước cho chậu ${potToWater.id.split('-')[1]}!`, 'success');
        renderPot(potToWater.id);
        hideActionModal();
        saveGame();
    }

    function fertilizePlant(potToFertilize) {
        if (gardenState.playerGold >= FERTILIZER_ITEM.cost) {
            gardenState.playerGold -= FERTILIZER_ITEM.cost;
            updateGoldDisplay();
            potToFertilize.fertilizedUntil = Date.now() + FERTILIZER_ITEM.durationSeconds * 1000;
            showTemporaryMessage(`Đã bón phân cho chậu ${potToFertilize.id.split('-')[1]}!`, 'success');
            renderPot(potToFertilize.id);
            hideActionModal();
            saveGame();
        } else {
            showTemporaryMessage('Không đủ vàng để bón phân!', 'error');
        }
    }


    function harvestPlant(potToHarvest) {
        const plant = plantsData.find(p => p.id === potToHarvest.plantId);
        const potTier = getCurrentPotTier(potToHarvest);
        if (plant && potTier) {
            const actualYield = Math.floor(plant.baseHarvestYield * potTier.yieldMultiplier);
            gardenState.playerGold += actualYield;
            updateGoldDisplay();
            showTemporaryMessage(`+${actualYield} vàng từ ${plant.name}!`, 'success');
        }
        potToHarvest.plantId = null;
        potToHarvest.plantedAt = null;
        potToHarvest.isReady = false;
        potToHarvest.currentStageIndex = 0;
        potToHarvest.isWatered = true; // Chậu trống coi như đã được "tưới" sẵn
        potToHarvest.lastWateredTime = null;
        potToHarvest.fertilizedUntil = null;
        renderPot(potToHarvest.id);
        saveGame();
    }

    function upgradePot(potToUpgrade) {
        const currentTier = getCurrentPotTier(potToUpgrade);
        const currentTierIndex = potTiers.findIndex(t => t.id === currentTier.id);

        if (currentTierIndex < potTiers.length - 1) {
            const nextTier = potTiers[currentTierIndex + 1];
            if (gardenState.playerGold >= currentTier.upgradeCostToNext) {
                gardenState.playerGold -= currentTier.upgradeCostToNext;
                potToUpgrade.tierId = nextTier.id;
                updateGoldDisplay();
                showTemporaryMessage(`Chậu nâng cấp lên ${nextTier.name}!`, 'success');
                renderPot(potToUpgrade.id);
                hideActionModal();
                saveGame();
            } else {
                showTemporaryMessage("Không đủ vàng để nâng cấp!", 'error');
            }
        } else {
            showTemporaryMessage("Chậu đã ở cấp tối đa!", 'info');
        }
    }

    function showPlantSelectorForPot() {
        modalOptionsContainer.classList.add('hidden');
        modalPlantSelector.classList.remove('hidden');
        modalTitle.textContent = `Chọn cây cho Chậu ${selectedPotData.id.split('-')[1]} (${getCurrentPotTier(selectedPotData).name})`;
        populatePlantOptions();
    }

    function populatePlantOptions() {
        plantOptionsContainer.innerHTML = '';
        plantsData.forEach(plant => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('plant-option');
            optionButton.dataset.plantId = plant.id;

            const iconSpan = document.createElement('span');
            iconSpan.classList.add('plant-option-icon');
            iconSpan.textContent = plant.icon;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('plant-option-details');

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('plant-option-name');
            nameSpan.textContent = plant.name;

            const infoSpan = document.createElement('span');
            infoSpan.classList.add('plant-option-info');
            let plantInfoText = `Trồng: ${plant.costToPlant}V - Lớn: ${plant.baseGrowthTime}s - Thu: ${plant.baseHarvestYield}V`;

            if (gardenState.playerGold < plant.costToPlant) {
                optionButton.disabled = true;
                optionButton.title = 'Không đủ vàng';
                plantInfoText += ' (X)';
            }

            infoSpan.textContent = plantInfoText;
            detailsDiv.appendChild(nameSpan);
            detailsDiv.appendChild(infoSpan);
            optionButton.appendChild(iconSpan);
            optionButton.appendChild(detailsDiv);

            optionButton.addEventListener('click', () => {
                handlePlantSelection(plant.id);
            });
            plantOptionsContainer.appendChild(optionButton);
        });
    }

    function updateGoldDisplay() {
        if (playerGoldDisplay) {
            playerGoldDisplay.textContent = `Vàng: ${gardenState.playerGold}`;
        }
    }

    function handlePlantSelection(plantIdToPlant) {
        if (selectedPotData) {
            const plant = plantsData.find(p => p.id === plantIdToPlant);
            if (plant && gardenState.playerGold >= plant.costToPlant) {
                gardenState.playerGold -= plant.costToPlant;
                updateGoldDisplay();

                selectedPotData.plantId = plantIdToPlant;
                selectedPotData.plantedAt = Date.now();
                selectedPotData.lastWateredTime = Date.now(); // Coi như vừa trồng là đã tưới
                selectedPotData.isWatered = true;
                selectedPotData.isReady = false;
                selectedPotData.currentStageIndex = 0;
                selectedPotData.fertilizedUntil = null; // Reset phân bón khi trồng cây mới
                showTemporaryMessage(`Đã trồng ${plant.name}!`, 'success');

                hideActionModal();
                renderPot(selectedPotData.id);
                saveGame();
            } else if (plant && gardenState.playerGold < plant.costToPlant) {
                showTemporaryMessage("Không đủ vàng để trồng!", 'error');
            }
        }
    }

    function updateGameLogic() {
        let visualChangeOccurred = false;
        const now = Date.now();

        gardenState.pots.forEach(potData => {
            if (potData.plantId && !potData.isReady) {
                const plantInfo = plantsData.find(p => p.id === potData.plantId);
                const potTier = getCurrentPotTier(potData);
                if (!plantInfo || !potTier) return;

                // Kiểm tra nhu cầu nước
                if (potData.isWatered && plantInfo.waterNeedInterval && potData.lastWateredTime) {
                    if ((now - potData.lastWateredTime) / 1000 > plantInfo.waterNeedInterval) {
                        potData.isWatered = false;
                        visualChangeOccurred = true;
                        console.log(`Chậu ${potData.id} cần tưới nước.`);
                    }
                }
                
                // Kiểm tra phân bón hết hạn
                if (potData.fertilizedUntil && now > potData.fertilizedUntil) {
                    potData.fertilizedUntil = null;
                    visualChangeOccurred = true;
                    showTemporaryMessage(`Phân bón ở chậu ${potData.id.split('-')[1]} đã hết tác dụng.`, 'info');
                }

                // Chỉ cho cây phát triển nếu đã được tưới nước
                if (!potData.isWatered) {
                    // Cây ngừng phát triển hoặc phát triển rất chậm (hiện tại là ngừng)
                    // Thời gian hiển thị có thể vẫn đếm ngược nhưng dựa trên plantedAt,
                    // nhưng isReady sẽ không được set true.
                    // Hoặc chúng ta có thể không cập nhật timeElapsed nếu !isWatered
                     if (potData.isWatered !== potData._previousIsWateredStateForRender) { // Theo dõi thay đổi để render
                        visualChangeOccurred = true;
                     }
                     potData._previousIsWateredStateForRender = potData.isWatered; // Lưu trạng thái hiện tại

                } else { // Cây được tưới, tiếp tục phát triển
                    let currentGrowthTime = plantInfo.baseGrowthTime * potTier.growthMultiplier;
                    if (potData.fertilizedUntil && now < potData.fertilizedUntil) {
                        currentGrowthTime *= FERTILIZER_ITEM.speedBoostMultiplier;
                    }

                    const timeElapsed = (now - potData.plantedAt) / 1000;
                    const numberOfStages = plantInfo.stages.length;
                    const timePerStage = currentGrowthTime / (numberOfStages > 1 ? (numberOfStages - 1) : 1);

                    let newStageIndex = potData.currentStageIndex;
                    if (numberOfStages > 1 && timePerStage > 0 && timeElapsed < currentGrowthTime) {
                        newStageIndex = Math.min(Math.floor(timeElapsed / timePerStage), numberOfStages - 2);
                    }

                    if (newStageIndex !== potData.currentStageIndex) {
                        potData.currentStageIndex = newStageIndex;
                        visualChangeOccurred = true;
                    }

                    if (timeElapsed >= currentGrowthTime) {
                        if (!potData.isReady) {
                            potData.isReady = true;
                            potData.currentStageIndex = numberOfStages - 1;
                            visualChangeOccurred = true;
                        }
                    }
                     if (potData.isWatered !== potData._previousIsWateredStateForRender) {
                        visualChangeOccurred = true;
                     }
                     potData._previousIsWateredStateForRender = potData.isWatered;
                }
            }
        });

        if (visualChangeOccurred) {
            renderAllPots();
        } else {
            gardenState.pots.forEach(potData => {
                if (potData.plantId && !potData.isReady) {
                    const potElement = khuVuonContainer.querySelector(`.chau-cay[data-id="${potData.id}"]`);
                    if (potElement) updatePotElement(potElement, potData);
                }
            });
        }
    }


    function startGameLoop() {
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateGameLogic, 1000);
    }

    function renderAllPots() {
        khuVuonContainer.innerHTML = '';
        gardenState.pots.forEach(potData => {
            const potElement = createPotElement(potData);
            khuVuonContainer.appendChild(potElement);
        });
    }

    function renderPot(potId) {
        const potData = gardenState.pots.find(p => p.id === potId);
        let potElement = khuVuonContainer.querySelector(`.chau-cay[data-id="${potId}"]`);
        if (potData && !potElement) {
            potElement = createPotElement(potData);
            const existingPotElements = Array.from(khuVuonContainer.children);
            const potIndex = parseInt(potId.split('-')[1]) - 1;
            if (potIndex < existingPotElements.length && potIndex >=0 && existingPotElements[potIndex]) {
                 khuVuonContainer.insertBefore(potElement, existingPotElements[potIndex]);
            } else {
                 khuVuonContainer.appendChild(potElement);
            }
        }
        if (potData && potElement) {
            updatePotElement(potElement, potData);
        }
    }

    function getCurrentPotTier(potData) {
        return potTiers.find(tier => tier.id === potData.tierId) || potTiers[0];
    }

    function createPotElement(potData) {
        const potElement = document.createElement('div');
        potElement.classList.add('chau-cay');
        potElement.dataset.id = potData.id;

        const statusIconsContainer = document.createElement('div');
        statusIconsContainer.classList.add('pot-status-icons');
        
        const waterIcon = document.createElement('span');
        waterIcon.classList.add('water-status-icon');
        waterIcon.textContent = '💧'; // Sẽ được ẩn/hiện bởi CSS hoặc JS
        
        const fertilizerIcon = document.createElement('span');
        fertilizerIcon.classList.add('fertilizer-status-icon');
        fertilizerIcon.textContent = '✨';

        statusIconsContainer.appendChild(waterIcon);
        statusIconsContainer.appendChild(fertilizerIcon);
        // pestIcon sẽ thêm sau

        const plantImageElement = document.createElement('div');
        plantImageElement.classList.add('hinh-anh-cay');

        const plantNameElement = document.createElement('div');
        plantNameElement.classList.add('ten-cay');

        const potTierElement = document.createElement('div');
        potTierElement.classList.add('loai-chau');

        const statusElement = document.createElement('div');
        statusElement.classList.add('trang-thai-chau');

        const growthTimeElement = document.createElement('div');
        growthTimeElement.classList.add('thoi-gian-sinh-truong');

        potElement.appendChild(statusIconsContainer); // Thêm container icon vào đầu
        potElement.appendChild(plantImageElement);
        potElement.appendChild(plantNameElement);
        potElement.appendChild(potTierElement);
        potElement.appendChild(statusElement);
        potElement.appendChild(growthTimeElement);

        updatePotElement(potElement, potData);
        potElement.addEventListener('click', () => handlePotClick(potData));
        return potElement;
    }

    function updatePotElement(potElement, potData) {
        const plantImageElement = potElement.querySelector('.hinh-anh-cay');
        const plantNameElement = potElement.querySelector('.ten-cay');
        const potTierElement = potElement.querySelector('.loai-chau');
        const statusElement = potElement.querySelector('.trang-thai-chau');
        const growthTimeElement = potElement.querySelector('.thoi-gian-sinh-truong');
        
        const waterIcon = potElement.querySelector('.water-status-icon');
        const fertilizerIcon = potElement.querySelector('.fertilizer-status-icon');

        const currentTier = getCurrentPotTier(potData);
        potTierElement.textContent = currentTier.name;
        potElement.style.borderColor = currentTier.borderColor;
        potElement.style.backgroundColor = currentTier.color;

        const plantInfo = potData.plantId ? plantsData.find(p => p.id === potData.plantId) : null;

        // Cập nhật hiển thị icon trạng thái
        waterIcon.style.display = (potData.plantId && !potData.isWatered && !potData.isReady) ? 'inline' : 'none';
        waterIcon.classList.toggle('needs-water', !potData.isWatered && potData.plantId && !potData.isReady);

        fertilizerIcon.style.display = (potData.fertilizedUntil && Date.now() < potData.fertilizedUntil) ? 'inline' : 'none';
        fertilizerIcon.classList.toggle('is-fertilized', potData.fertilizedUntil && Date.now() < potData.fertilizedUntil);
        
        // Hiệu ứng cho cây cần nước
        plantImageElement.classList.toggle('grayscale', potData.plantId && !potData.isWatered && !potData.isReady);


        if (plantInfo) {
            plantNameElement.textContent = plantInfo.name;
            plantImageElement.textContent = plantInfo.stages[potData.currentStageIndex] || plantInfo.icon;

            if (potData.isReady) {
                statusElement.textContent = 'Sẵn sàng!';
                const actualYield = Math.floor(plantInfo.baseHarvestYield * currentTier.yieldMultiplier);
                growthTimeElement.textContent = `Thu: ${actualYield}V`;
                plantImageElement.textContent = plantInfo.icon;
            } else {
                let currentGrowthTime = plantInfo.baseGrowthTime * currentTier.growthMultiplier;
                if (potData.fertilizedUntil && Date.now() < potData.fertilizedUntil) {
                    currentGrowthTime *= FERTILIZER_ITEM.speedBoostMultiplier;
                }
                
                const timeElapsed = Math.floor((Date.now() - potData.plantedAt) / 1000);
                let timeLeft = Math.max(0, Math.floor(currentGrowthTime - timeElapsed));

                if (!potData.isWatered) {
                    statusElement.textContent = 'Cần tưới 💧';
                    // Thời gian có thể hiển thị là "Paused" hoặc vẫn là thời gian còn lại nhưng không đếm
                    growthTimeElement.textContent = `Còn: ${timeLeft}s (Khô hạn!)`;
                } else {
                    statusElement.textContent = 'Đang lớn...';
                    if (potData.fertilizedUntil && Date.now() < potData.fertilizedUntil) {
                        statusElement.textContent += ' ✨'; // Thêm icon phân bón vào status
                    }
                    growthTimeElement.textContent = `Còn: ${timeLeft}s`;
                }
            }
        } else { // Chậu trống
            plantNameElement.textContent = '';
            plantImageElement.textContent = '➕';
            statusElement.textContent = 'Chậu trống';
            growthTimeElement.textContent = 'Nhấp để xem';
        }
    }

    function showActionModal() {
        actionModal.classList.remove('hidden');
    }

    function hideActionModal() {
        actionModal.classList.add('hidden');
        modalOptionsContainer.classList.remove('hidden');
        modalPlantSelector.classList.add('hidden');
        selectedPotData = null;
    }

    function saveGame() {
        try {
            localStorage.setItem('kvtm_offline_gardenState_v5', JSON.stringify(gardenState));
            console.log('Game đã được lưu (v5)!', gardenState);
            showTemporaryMessage('Đã lưu game!', 'success');
        } catch (error) {
            console.error('Không thể lưu game:', error);
            showTemporaryMessage('Lỗi khi lưu game!', 'error');
        }
    }

    function loadGame() {
        try {
            const savedState = localStorage.getItem('kvtm_offline_gardenState_v5');
            if (savedState) {
                const loadedState = JSON.parse(savedState);
                if (loadedState.pots && loadedState.hasOwnProperty('playerGold') && Array.isArray(loadedState.pots)) {
                    loadedState.pots.forEach(pot => { // Đảm bảo các thuộc tính mới có giá trị mặc định
                        if (!pot.tierId || !potTiers.find(t => t.id === pot.tierId)) pot.tierId = potTiers[0].id;
                        if (typeof pot.currentStageIndex === 'undefined') pot.currentStageIndex = 0;
                        if (typeof pot.isWatered === 'undefined') pot.isWatered = true; // Mặc định là đã tưới
                        if (typeof pot.lastWateredTime === 'undefined') pot.lastWateredTime = (pot.plantId && pot.plantedAt) ? pot.plantedAt : null;
                        if (typeof pot.fertilizedUntil === 'undefined') pot.fertilizedUntil = null;
                        
                        // Recalculate stage for loaded plants that are growing
                        if (pot.plantId && !pot.isReady && pot.plantedAt) {
                             const plantInfo = plantsData.find(p => p.id === pot.plantId);
                             const potTier = getCurrentPotTier(pot);
                             if(plantInfo && potTier){
                                let currentGrowthTime = plantInfo.baseGrowthTime * potTier.growthMultiplier;
                                if (pot.fertilizedUntil && Date.now() < pot.fertilizedUntil) { // Check if still fertilized
                                    currentGrowthTime *= FERTILIZER_ITEM.speedBoostMultiplier;
                                }
                                const timeElapsed = (Date.now() - pot.plantedAt) / 1000;
                                const numberOfStages = plantInfo.stages.length;
                                const timePerStage = currentGrowthTime / (numberOfStages > 1 ? (numberOfStages - 1) : 1);
                                let newStageIndex = 0;
                                if (numberOfStages > 1 && timePerStage > 0 && timeElapsed < currentGrowthTime) {
                                     newStageIndex = Math.min(Math.floor(timeElapsed / timePerStage), numberOfStages - 2);
                                } else if (timeElapsed >= currentGrowthTime) {
                                    newStageIndex = numberOfStages -1; 
                                }
                                pot.currentStageIndex = newStageIndex;
                             }
                        } else if (!pot.plantId) {
                            pot.currentStageIndex = 0;
                        }
                    });
                    gardenState = loadedState;
                    if (gardenState.pots.length !== SO_LUONG_CHAU_TOI_DA) { // Xử lý nếu số lượng chậu thay đổi
                        gardenState.pots = []; // Bắt đầu lại mảng chậu nếu số lượng không khớp
                        console.log('Số lượng chậu đã thay đổi, reset mảng chậu.');
                    }

                    console.log('Game đã được tải từ localStorage (v5)!', gardenState);
                } else {
                    gardenState.pots = [];
                }
            } else {
                gardenState.pots = [];
            }
        }
        catch (error){
            console.error('Không thể tải game (v5):', error);
            gardenState.pots = [];
        }
        initializeGarden();
    }

    function resetGame() {
        if (confirm("Bạn có chắc muốn reset toàn bộ game không? Mọi tiến trình sẽ bị mất.")) {
            localStorage.removeItem('kvtm_offline_gardenState_v5');
            gardenState = { pots: [], playerGold: 150 };
            if (gameInterval) clearInterval(gameInterval);
            khuVuonContainer.innerHTML = '';
            initializeGarden();
            console.log("Game đã được reset (v5).");
            showTemporaryMessage('Game đã được reset!', 'info');
        }
    }

    function showTemporaryMessage(message, type = 'info') {
        let feedback = document.getElementById('temp-feedback-message');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'temp-feedback-message';
            feedback.style.opacity = '0';
            feedback.style.bottom = '0px';
            document.body.appendChild(feedback);
        }
        feedback.textContent = message;
        if (type === 'success') feedback.style.backgroundColor = 'rgba(92, 184, 92, 0.9)';
        else if (type === 'error') feedback.style.backgroundColor = 'rgba(217, 83, 79, 0.9)';
        else feedback.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';

        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.bottom = '15px';
        }, 10);

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.bottom = '0px';
        }, 2800);
    }

    saveGameButton.addEventListener('click', saveGame);
    loadGameButton.addEventListener('click', () => window.location.reload());
    resetGameButton.addEventListener('click', resetGame);
    closeModalButton.addEventListener('click', hideActionModal);

    loadGame();
});