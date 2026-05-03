document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const startBtn = document.getElementById('startBtn');
    const unitContainer = document.getElementById('unitContainer');
    const unitList = document.getElementById('unitList');
    const selectAll = document.getElementById('selectAll');
    const statusEl = document.getElementById('status');
    const selectionCountEl = document.getElementById('selectionCount'); // Phần tử đếm số lượng

    // Modal Logic
    const modal = document.getElementById('customModal');
    const modalText = document.getElementById('modalText');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    const showModal = (text) => { 
        modalText.innerText = text; 
        modal.style.display = 'flex'; 
    };
    
    closeModalBtn.addEventListener('click', () => { 
        modal.style.display = 'none'; 
    });

    // Hàm cập nhật bộ đếm hiển thị
    const updateCount = () => {
        const total = document.querySelectorAll('.unit-cb').length;
        const checked = document.querySelectorAll('.unit-cb:checked').length;
        
        selectionCountEl.innerText = `Đã chọn: ${checked}/${total}`;
        
        // Tự động check/uncheck nút "Chọn tất cả" dựa trên trạng thái danh sách
        if (total > 0 && checked === total) {
            selectAll.checked = true;
        } else {
            selectAll.checked = false;
        }
    };

    // Quét danh sách tướng
    scanBtn.addEventListener('click', () => {
        statusEl.innerText = "Đang mở tab ẩn để quét danh sách...\nVui lòng chờ khoảng 5 giây.";
        scanBtn.disabled = true;
        scanBtn.innerText = "Đang quét...";
        
        chrome.runtime.sendMessage({ action: "scanChampions" }, (response) => {
            scanBtn.disabled = false;
            scanBtn.innerText = "1. Quét Lại Danh Sách";
            
            if (response && response.units && response.units.length > 0) {
                unitList.innerHTML = '';
                response.units.forEach(unit => {
                    const div = document.createElement('div');
                    div.innerHTML = `<label><input type="checkbox" class="unit-cb" value="${unit}"> ${unit}</label>`;
                    unitList.appendChild(div);
                });
                
                unitContainer.style.display = 'block';
                startBtn.disabled = false;
                statusEl.innerText = "Quét thành công! Hãy chọn tướng và thiết lập dữ liệu.";
                
                // Reset trạng thái và cập nhật số lượng sau khi quét
                selectAll.checked = false;
                updateCount();
            } else {
                showModal("Lỗi: Không tìm thấy danh sách tướng. Vui lòng thử lại!");
                statusEl.innerText = "Lỗi quét dữ liệu.";
            }
        });
    });

    // Lắng nghe sự kiện tick chọn từng tướng
    unitList.addEventListener('change', (e) => {
        if(e.target.classList.contains('unit-cb')) {
            updateCount();
        }
    });

    // Lắng nghe sự kiện chọn tất cả
    selectAll.addEventListener('change', (e) => {
        document.querySelectorAll('.unit-cb').forEach(cb => {
            cb.checked = e.target.checked;
        });
        updateCount();
    });

    // Bắt đầu cào dữ liệu
    startBtn.addEventListener('click', () => {
        const selectedUnits = Array.from(document.querySelectorAll('.unit-cb:checked')).map(cb => cb.value);
        
        if (selectedUnits.length === 0) {
            showModal("Vui lòng chọn ít nhất 1 tướng để lấy dữ liệu!");
            return;
        }

        const config = {
            bestBuilds: document.getElementById('toggleBestBuilds').checked,
            builds: document.getElementById('toggleBuilds').checked,
            buildsCount: document.getElementById('buildsCount').value.trim()
        };

        statusEl.innerText = `Đang khởi chạy ngầm cho ${selectedUnits.length} tướng...\nBạn có thể làm việc khác.`;
        startBtn.disabled = true;
        scanBtn.disabled = true;
        
        chrome.runtime.sendMessage({ 
            action: "startScraping", 
            units: selectedUnits, 
            config: config 
        });
    });
});