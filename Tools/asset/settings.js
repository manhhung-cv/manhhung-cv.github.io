// asset/settings.js
document.addEventListener('DOMContentLoaded', () => {
    const settingsTool = document.getElementById('settings-tool');
    if (!settingsTool) return;

    const storageUsageValue = document.getElementById('storage-usage-value');
    const storageUsageBar = document.getElementById('storage-usage-bar-inner');
    const storageList = document.getElementById('storage-list');
    const totalCapacity = 5 * 1024 * 1024; // 5MB in bytes

    const keyMappings = {
        'gmailTrickCardsData': 'Bí danh Gmail (Danh sách)',
        'gmailTrickHistory': 'Bí danh Gmail (Lịch sử)',
        'quickNote': 'Ghi chú nhanh',
        'randomizerSettings': 'Cài đặt Random',
        'savedSizes': 'Chuyển đổi Kích cỡ (Đã lưu)',
        'trackedCurrencies': 'Tỷ giá (Đang theo dõi)',
        'baseTrackingCurrency': 'Tỷ giá (Tiền tệ cơ sở)',
        'roundingOption': 'Tỷ giá (Làm tròn)',
        'theme-mode': 'Giao diện'
    };

    function calculateStorageUsage() {
        let totalBytes = 0;
        const items = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            // Ước tính kích thước: mỗi ký tự UTF-16 chiếm 2 bytes
            const itemBytes = (key.length + value.length) * 2;
            totalBytes += itemBytes;
            items.push({
                key: key,
                name: keyMappings[key] || key,
                size: itemBytes
            });
        }
        return { totalBytes, items };
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function renderStorageInfo() {
        const { totalBytes, items } = calculateStorageUsage();
        const percentage = (totalBytes / totalCapacity) * 100;

        storageUsageValue.textContent = `${formatBytes(totalBytes)} / 5 MB`;
        storageUsageBar.style.width = `${percentage}%`;

        storageList.innerHTML = '';
        if (items.length === 0) {
            storageList.innerHTML = '<p>Chưa có dữ liệu nào được lưu.</p>';
            return;
        }

        items.sort((a, b) => b.size - a.size).forEach(item => {
            const li = document.createElement('li');
            li.className = 'storage-item';
            li.innerHTML = `
                <div class="storage-item-info">
                    <strong>${item.name}</strong>
                    <span>${formatBytes(item.size)}</span>
                </div>
                <button class="btn-delete-storage" data-key="${item.key}" title="Xóa dữ liệu này">&times;</button>
            `;
            storageList.appendChild(li);
        });
    }

    storageList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-storage')) {
            const key = e.target.dataset.key;
            const itemName = keyMappings[key] || key;

            // Sử dụng modal xác nhận mới
            showConfirmationModal(
                'Xác nhận xóa',
                `Bạn có chắc chắn muốn xóa dữ liệu cho mục "${itemName}" không?`,
                () => {
                    // Hành động sẽ được thực thi khi người dùng nhấn "Xác nhận"
                    localStorage.removeItem(key);
                    renderStorageInfo(); // Cập nhật lại giao diện
                    if (typeof showToast === 'function') {
                        showToast('success', 'Đã xóa!', 'Dữ liệu đã được xóa thành công.');
                    }
                }
            );
        }
    });
    
    // Thêm listener để cập nhật khi tab được chọn
    const settingsLink = document.querySelector('a[href="#settings-tool"]');
    if(settingsLink) {
        settingsLink.addEventListener('click', renderStorageInfo);
    }

    // Chạy lần đầu khi trang được tải
    renderStorageInfo();
});