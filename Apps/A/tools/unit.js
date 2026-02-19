window.render_unit = function(container) {
    container.innerHTML = `
        <div class="tool-container">
            <div class="tool-header">
                <div class="tool-icon"><i class="ph-fill ph-ruler"></i></div>
                <h2 class="tool-title">Đổi đơn vị (Chiều dài)</h2>
            </div>
            <p class="tool-desc">Nhập giá trị và chọn đơn vị để chuyển đổi trực tiếp.</p>
            
            <div class="input-group">
                <div class="input-wrapper">
                    <label class="input-label" for="unit-input">Giá trị gốc</label>
                    <input type="number" id="unit-input" value="1" placeholder="Nhập số lượng..." autocomplete="off">
                </div>
                <div class="input-wrapper">
                    <label class="input-label" for="unit-from">Từ đơn vị</label>
                    <select id="unit-from">
                        <option value="m">Mét (m)</option>
                        <option value="cm">Centimét (cm)</option>
                        <option value="mm">Milimét (mm)</option>
                        <option value="in">Inch (in)</option>
                        <option value="ft">Foot (ft)</option>
                        <option value="yd">Yard (yd)</option>
                    </select>
                </div>
            </div>

            <div class="input-group">
                <div class="input-wrapper">
                    <label class="input-label" for="unit-output">Kết quả</label>
                    <input type="number" id="unit-output" readonly placeholder="0.00" style="background-color: var(--bg-body); font-weight: 600; color: var(--primary);">
                </div>
                <div class="input-wrapper">
                    <label class="input-label" for="unit-to">Sang đơn vị</label>
                    <select id="unit-to">
                        <option value="cm">Centimét (cm)</option>
                        <option value="m">Mét (m)</option>
                        <option value="mm">Milimét (mm)</option>
                        <option value="in">Inch (in)</option>
                        <option value="ft">Foot (ft)</option>
                        <option value="yd">Yard (yd)</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // DOM Elements
    const input = document.getElementById('unit-input');
    const output = document.getElementById('unit-output');
    const selectFrom = document.getElementById('unit-from');
    const selectTo = document.getElementById('unit-to');

    // Tỉ lệ chuyển đổi so với Mét (m)
    const rates = {
        m: 1, cm: 0.01, mm: 0.001,
        in: 0.0254, ft: 0.3048, yd: 0.9144
    };

    // Hàm tính toán
    const calculate = () => {
        const val = parseFloat(input.value);
        if (isNaN(val)) {
            output.value = '';
            return;
        }
        
        const fromRate = rates[selectFrom.value];
        const toRate = rates[selectTo.value];
        
        // Tính toán và giới hạn 6 chữ số thập phân, loại bỏ số 0 thừa ở đuôi
        const valueInMeters = val * fromRate;
        const finalValue = valueInMeters / toRate;
        output.value = parseFloat(finalValue.toFixed(6));
    };

    // Event Listeners (Lắng nghe sự kiện)
    input.addEventListener('input', calculate);
    selectFrom.addEventListener('change', calculate);
    selectTo.addEventListener('change', calculate);

    // Tính lần đầu
    calculate();
    // Tự động focus vào ô nhập liệu khi vừa mở tool lên (tăng trải nghiệm UX)
    input.focus();
};