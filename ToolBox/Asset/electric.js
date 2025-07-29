// Đảm bảo script chỉ chạy trong phạm vi của #tool-electric
(function () {
    const toolContainer = document.getElementById('tool-electric');
    if (!toolContainer) return;

    // --- PHẦN LOGIC CHUNG: ĐIỀU HƯỚNG TAB ---
    const tabsContainer = toolContainer.querySelector('#tabs');
    const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
    const tabPanels = toolContainer.querySelectorAll('.tab-panel');

    tabsContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.tab-btn');
        if (!targetButton) return;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
        const tabId = targetButton.dataset.tab;
        tabPanels.forEach(panel => {
            panel.id === tabId ? panel.classList.add('active') : panel.classList.remove('active');
        });
    });

    // --- CÔNG CỤ 1: TÍNH TIẾT DIỆN DÂY DẪN ---
    const wsInputs = toolContainer.querySelectorAll('.ws-input');
    const wsResultS = toolContainer.querySelector('#ws-result-s');
    const wsResultStandard = toolContainer.querySelector('#ws-result-standard');
    const standardWireSizes = [0.5, 0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
    const wsMaterialSelect = toolContainer.querySelector('#ws-material');
    const wsCustomRhoContainer = toolContainer.querySelector('#ws-custom-rho-container');

    wsMaterialSelect.addEventListener('change', () => {
        wsCustomRhoContainer.classList.toggle('hidden', wsMaterialSelect.value !== 'custom');
        calculateWireSize();
    });

    function calculateWireSize() {
        const phase = toolContainer.querySelector('input[name="ws-phase"]:checked').value;
        const K = (phase === '1') ? 2 : 1;
        let rho = (wsMaterialSelect.value === 'custom')
            ? parseFloat(toolContainer.querySelector('#ws-custom-rho').value)
            : parseFloat(wsMaterialSelect.value);
        const P = parseFloat(toolContainer.querySelector('#ws-power').value);
        const U = parseFloat(toolContainer.querySelector('#ws-voltage').value);
        const L = parseFloat(toolContainer.querySelector('#ws-length').value);
        const dU_percent = parseFloat(toolContainer.querySelector('#ws-voltage-drop').value);

        if ([rho, P, U, L, dU_percent].some(isNaN) || P <= 0 || U <= 0 || L <= 0 || dU_percent <= 0) {
            wsResultS.textContent = '0.00 mm²';
            wsResultStandard.textContent = '-';
            return;
        }
        const S = (K * rho * L * P) / ((dU_percent / 100) * U * U);
        wsResultS.textContent = `${S.toFixed(2)} mm²`;
        const recommendedSize = standardWireSizes.find(size => size >= S);
        wsResultStandard.textContent = recommendedSize ? `Dây ${recommendedSize} mm²` : `> ${standardWireSizes[standardWireSizes.length - 1]} mm²`;
    }
    wsInputs.forEach(input => input.addEventListener('input', calculateWireSize));
    calculateWireSize();

    // --- CÔNG CỤ 2: TÍNH SỤT ÁP ---
    const vdInputs = toolContainer.querySelectorAll('.vd-input');
    const vdResultV = toolContainer.querySelector('#vd-result-v');
    const vdResultPercent = toolContainer.querySelector('#vd-result-percent');

    function calculateVoltageDrop() {
        const phase = toolContainer.querySelector('input[name="vd-phase"]:checked').value;
        const K = (phase === '1') ? 2 : 1;
        const rho = parseFloat(toolContainer.querySelector('#vd-material').value);
        const P = parseFloat(toolContainer.querySelector('#vd-power').value);
        const U = parseFloat(toolContainer.querySelector('#vd-voltage').value);
        const L = parseFloat(toolContainer.querySelector('#vd-length').value);
        const S = parseFloat(toolContainer.querySelector('#vd-size').value);

        if ([rho, P, U, L, S].some(isNaN) || P <= 0 || U <= 0 || L <= 0 || S <= 0) {
            vdResultV.textContent = '0.00 V';
            vdResultPercent.textContent = '0.00 %';
            return;
        }
        const deltaU_V = (K * rho * L * P) / (S * U);
        const deltaU_Percent = (deltaU_V / U) * 100;
        vdResultV.textContent = `${deltaU_V.toFixed(2)} V`;
        vdResultPercent.textContent = `${deltaU_Percent.toFixed(2)} %`;
        vdResultPercent.style.color = deltaU_Percent > 5 ? 'var(--accent-red)' : 'var(--accent-yellow)';
    }
    vdInputs.forEach(input => input.addEventListener('input', calculateVoltageDrop));
    calculateVoltageDrop();

    // --- CÔNG CỤ 3: TÍNH TỔNG CÔNG SUẤT ---
    const tpDeviceList = toolContainer.querySelector('#tp-device-list');
    const tpAddDeviceBtn = toolContainer.querySelector('#tp-add-device');
    const tpResultKw = toolContainer.querySelector('#tp-result-kw');
    const tpResultA = toolContainer.querySelector('#tp-result-a');
    const tpInputs = toolContainer.querySelectorAll('.tp-input');
    const tpPowerFactorGroup = toolContainer.querySelector('#tp-power-factor-group');

    function createDeviceElement() {
        const deviceDiv = document.createElement('div');
        deviceDiv.style.display = 'grid';
        deviceDiv.style.gridTemplateColumns = '5fr 3fr 2fr 1fr';
        deviceDiv.style.gap = '0.5rem';
        deviceDiv.style.alignItems = 'center';
        deviceDiv.innerHTML = `
                    <input type="text" placeholder="Tên thiết bị" class="tp-input">
                    <div class="input-wrapper"><input type="number" placeholder="Công suất" class="tp-input tp-power"><span>W</span></div>
                    <input type="number" value="1" min="1" class="tp-input tp-quantity">
                    <button class="btn-danger" style="padding: 0.5rem;">X</button>
                `;
        tpDeviceList.appendChild(deviceDiv);
        deviceDiv.querySelector('.btn-danger').addEventListener('click', () => {
            deviceDiv.remove();
            calculateTotalPower();
        });
        deviceDiv.querySelectorAll('.tp-input').forEach(el => el.addEventListener('input', calculateTotalPower));
    }

    function calculateTotalPower() {
        let totalPower = 0;
        tpDeviceList.querySelectorAll('.tp-power').forEach((powerInput, index) => {
            const power = parseFloat(powerInput.value) || 0;
            const quantity = parseInt(tpDeviceList.querySelectorAll('.tp-quantity')[index].value) || 0;
            totalPower += power * quantity;
        });

        const voltage = parseFloat(toolContainer.querySelector('#tp-voltage').value) || 0;
        const currentType = toolContainer.querySelector('input[name="tp-current-type"]:checked').value;
        const powerFactor = parseFloat(toolContainer.querySelector('#tp-power-factor').value) || 1.0;

        let totalAmps = 0;
        if (voltage > 0) {
            switch (currentType) {
                case 'dc':
                    totalAmps = totalPower / voltage;
                    break;
                case 'ac1':
                    totalAmps = totalPower / (voltage * powerFactor);
                    break;
                case 'ac3':
                    totalAmps = totalPower / (voltage * Math.sqrt(3) * powerFactor);
                    break;
            }
        }

        tpPowerFactorGroup.style.display = (currentType === 'dc') ? 'none' : 'flex';

        tpResultKw.textContent = (totalPower / 1000).toFixed(2);
        tpResultA.textContent = totalAmps.toFixed(2);
    }
    tpInputs.forEach(el => el.addEventListener('input', calculateTotalPower));
    tpAddDeviceBtn.addEventListener('click', createDeviceElement);
    createDeviceElement();
    calculateTotalPower();

    // --- CÔNG CỤ 4: TÍNH THỜI GIAN SẠC PIN ---
    const bcInputs = toolContainer.querySelectorAll('.bc-input');
    const bcResult = toolContainer.querySelector('#bc-result');
    function calculateBatteryChargeTime() {
        let capacity = parseFloat(toolContainer.querySelector('#bc-capacity').value);
        const capacityUnit = toolContainer.querySelector('#bc-capacity-unit').value;
        let current = parseFloat(toolContainer.querySelector('#bc-current').value);
        const currentUnit = toolContainer.querySelector('#bc-current-unit').value;
        const efficiency = parseFloat(toolContainer.querySelector('#bc-efficiency').value);

        if (capacityUnit === 'mAh') capacity /= 1000;
        if (currentUnit === 'mA') current /= 1000;

        if ([capacity, current, efficiency].some(isNaN) || current <= 0 || efficiency <= 0 || capacity <= 0) {
            bcResult.textContent = '0 giờ 0 phút'; return;
        }
        const timeInHours = capacity / (current * (efficiency / 100));
        const hours = Math.floor(timeInHours);
        const minutes = Math.round((timeInHours - hours) * 60);
        bcResult.textContent = `${hours} giờ ${minutes} phút`;
    }
    bcInputs.forEach(input => input.addEventListener('input', calculateBatteryChargeTime));
    calculateBatteryChargeTime();

    // --- CÔNG CỤ 5: TÍNH TIỀN ĐIỆN BẬC THANG ---
    const ecTiersContainer = toolContainer.querySelector('#ec-tiers-container');
    const ecAddTierBtn = toolContainer.querySelector('#ec-add-tier');
    const ecKwhMonthlyInput = toolContainer.querySelector('#ec-kwh-monthly');
    const ecResultDetails = toolContainer.querySelector('#ec-result-details');
    const ecResultTotalCost = toolContainer.querySelector('#ec-result-total-cost');
    const defaultTiers = [
        { limit: 50, price: 1678 }, { limit: 50, price: 1734 }, { limit: 100, price: 2014 },
        { limit: 100, price: 2536 }, { limit: 100, price: 2834 }, { limit: Infinity, price: 2927 }
    ];
    function createTierElement(limit, price) {
        const tierDiv = document.createElement('div');
        tierDiv.style.display = 'grid';
        tierDiv.style.gridTemplateColumns = '1fr 4fr 6fr 1fr';
        tierDiv.style.gap = '0.5rem';
        tierDiv.style.alignItems = 'center';
        tierDiv.innerHTML = `
                    <span>Bậc:</span>
                    <input type="number" value="${limit === Infinity ? '' : limit}" placeholder="kWh" class="ec-tier-limit">
                    <input type="number" value="${price}" placeholder="VNĐ/kWh" class="ec-tier-price">
                    <button class="btn-danger" style="padding: 0.5rem;">X</button>
                `;
        ecTiersContainer.appendChild(tierDiv);
        tierDiv.querySelector('.btn-danger').addEventListener('click', () => { tierDiv.remove(); calculateEnergyCost(); });
        tierDiv.querySelectorAll('input').forEach(el => el.addEventListener('input', calculateEnergyCost));
    }
    function calculateEnergyCost() {
        let totalKwh = parseFloat(ecKwhMonthlyInput.value) || 0;
        let remainingKwh = totalKwh;
        let totalCost = 0;
        let detailsHtml = '';
        ecTiersContainer.querySelectorAll('.ec-tier-limit').forEach((limitInput, index) => {
            if (remainingKwh <= 0) return;
            const limit = parseFloat(limitInput.value) || Infinity;
            const price = parseFloat(ecTiersContainer.querySelectorAll('.ec-tier-price')[index].value) || 0;
            const kwhInThisTier = Math.min(remainingKwh, limit);
            const costInThisTier = kwhInThisTier * price;
            totalCost += costInThisTier;
            detailsHtml += `<div style="display: flex; justify-content: space-between;"><span>Bậc ${index + 1} (${kwhInThisTier.toFixed(1)} kWh):</span> <strong>${costInThisTier.toLocaleString('vi-VN')} VNĐ</strong></div>`;
            remainingKwh -= kwhInThisTier;
        });
        ecResultDetails.innerHTML = totalKwh > 0 ? detailsHtml : '<p class="text-center">Nhập số kWh để xem chi tiết.</p>';
        ecResultTotalCost.textContent = `${totalCost.toLocaleString('vi-VN')} VNĐ`;
    }
    ecAddTierBtn.addEventListener('click', () => createTierElement('', ''));
    ecKwhMonthlyInput.addEventListener('input', calculateEnergyCost);
    defaultTiers.forEach(tier => createTierElement(tier.limit, tier.price));
    calculateEnergyCost();

    // --- CÔNG CỤ 6: CHUYỂN ĐỔI ĐƠN VỊ ---
    const pviWatts = toolContainer.querySelector('#pvi-watts'), pviVolts = toolContainer.querySelector('#pvi-volts'), pviAmps = toolContainer.querySelector('#pvi-amps');
    function calculatePVI() {
        const P = parseFloat(pviWatts.value), V = parseFloat(pviVolts.value), I = parseFloat(pviAmps.value);
        if ([P, V, I].filter(v => !isNaN(v)).length !== 2) return;
        if (isNaN(P)) pviWatts.value = (V * I).toFixed(2);
        else if (isNaN(I)) pviAmps.value = (P / V).toFixed(2);
        else if (isNaN(V)) pviVolts.value = (P / I).toFixed(2);
    }
    toolContainer.querySelectorAll('.pvi-input').forEach(el => el.addEventListener('input', calculatePVI));
    toolContainer.querySelector('#pvi-reset').addEventListener('click', () => { pviWatts.value = ''; pviVolts.value = ''; pviAmps.value = ''; });

    const ucInputs = toolContainer.querySelectorAll('.uc-input, .uc-from, .uc-to');
    const conversionFactors = {
        power: { W: 1, kW: 1000, HP: 745.7 },
        energy: { J: 1, Wh: 3600, kWh: 3600000 },
        area: {
            to_mm2: (v, f) => f === 'mm2' ? v : 0.05067 * Math.pow(92, (36 - v) / 19.5),
            from_mm2: (v, t) => t === 'mm2' ? v : 36 - 19.5 * Math.log(v / 0.05067) / Math.log(92)
        }
    };
    function convertUnits(e) {
        const type = e.target.dataset.type;
        const container = e.target.closest('div[style*="margin-bottom"]');
        const inputVal = parseFloat(container.querySelector('.uc-input').value) || 0;
        const fromUnit = container.querySelector('.uc-from').value;
        const toUnit = container.querySelector('.uc-to').value;
        const resultEl = container.querySelector('.uc-result');
        let result = 0;
        if (type === 'area') {
            const mm2 = conversionFactors.area.to_mm2(inputVal, fromUnit);
            result = conversionFactors.area.from_mm2(mm2, toUnit);
        } else {
            const base = inputVal * conversionFactors[type][fromUnit];
            result = base / conversionFactors[type][toUnit];
        }
        resultEl.textContent = result.toLocaleString('vi-VN', { maximumFractionDigits: 4 });
    }
    ucInputs.forEach(input => input.addEventListener('input', convertUnits));

    // --- CÔNG CỤ 7: BÙ CÔNG SUẤT PHẢN KHÁNG ---
    const pfInputs = toolContainer.querySelectorAll('.pf-input');
    const pfResult = toolContainer.querySelector('#pf-result');
    function calculatePowerFactorCorrection() {
        const P_kw = parseFloat(toolContainer.querySelector('#pf-power').value);
        const cosPhi1 = parseFloat(toolContainer.querySelector('#pf-initial').value);
        const cosPhi2 = parseFloat(toolContainer.querySelector('#pf-target').value);
        if (isNaN(P_kw) || isNaN(cosPhi1) || isNaN(cosPhi2) || P_kw <= 0 || cosPhi1 >= cosPhi2) {
            pfResult.textContent = '0.00 kVAR'; return;
        }
        const tanPhi1 = Math.tan(Math.acos(cosPhi1));
        const tanPhi2 = Math.tan(Math.acos(cosPhi2));
        const Qc = P_kw * (tanPhi1 - tanPhi2);
        pfResult.textContent = `${Qc.toFixed(2)} kVAR`;
    }
    pfInputs.forEach(input => input.addEventListener('input', calculatePowerFactorCorrection));
    calculatePowerFactorCorrection();

    // --- CÔNG CỤ 8: ĐỊNH LUẬT OHM ---
    const ohmVoltage = toolContainer.querySelector('#ohm-voltage'), ohmCurrent = toolContainer.querySelector('#ohm-current'), ohmResistance = toolContainer.querySelector('#ohm-resistance');
    function calculateOhmLaw() {
        const V = parseFloat(ohmVoltage.value), I = parseFloat(ohmCurrent.value), R = parseFloat(ohmResistance.value);
        if ([V, I, R].filter(v => !isNaN(v)).length !== 2) return;
        if (isNaN(V)) ohmVoltage.value = (I * R).toFixed(3);
        else if (isNaN(I)) ohmCurrent.value = (V / R).toFixed(3);
        else if (isNaN(R)) ohmResistance.value = (V / I).toFixed(3);
    }
    toolContainer.querySelectorAll('.ohm-input').forEach(el => el.addEventListener('input', calculateOhmLaw));
    toolContainer.querySelector('#ohm-reset').addEventListener('click', () => { ohmVoltage.value = ''; ohmCurrent.value = ''; ohmResistance.value = ''; });
})();