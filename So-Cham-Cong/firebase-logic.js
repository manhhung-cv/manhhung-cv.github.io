// firebase-logic.js

// === DOM Elements for Firebase UI (Lấy sau khi DOM sẵn sàng) ===
let loginBtn, logoutBtn, userStatus, authSection, backupRestoreSection,
    autoBackupSwitch, manualBackupBtn, backupList, noBackups,
    backupNameModal, backupNameInput, confirmBackupNameBtn,
    confirmActionModal, confirmActionTitle, confirmActionMessage,
    confirmActionBackupId, confirmActionType, confirmActionButton,
    userInfoDiv, userPhoto, notLoggedInStatus; // Thêm các biến mới

// Hàm để lấy các DOM elements sau khi DOM đã tải
function getFirebaseDOMElements() {
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    userStatus = document.getElementById('userStatus'); // Giữ nguyên
    authSection = document.getElementById('authSection');
    backupRestoreSection = document.getElementById('backupRestoreSection');
    autoBackupSwitch = document.getElementById('autoBackupSwitch');
    manualBackupBtn = document.getElementById('manualBackupBtn');
    backupList = document.getElementById('backupList');
    noBackups = document.getElementById('noBackups');
    backupNameModal = document.getElementById('backupNameModal');
    backupNameInput = document.getElementById('backupNameInput');
    confirmBackupNameBtn = document.getElementById('confirmBackupNameBtn');
    confirmActionModal = document.getElementById('confirmActionModal');
    confirmActionTitle = document.getElementById('confirmActionTitle');
    confirmActionMessage = document.getElementById('confirmActionMessage');
    confirmActionBackupId = document.getElementById('confirmActionBackupId');
    confirmActionType = document.getElementById('confirmActionType');
    confirmActionButton = document.getElementById('confirmActionButton');

    // Thêm các dòng sau:
    userInfoDiv = document.getElementById('userInfo');
    userPhoto = document.getElementById('userPhoto');
    notLoggedInStatus = document.getElementById('notLoggedInStatus');
    console.log("firebase-logic.js: getFirebaseDOMElements finished"); // Thêm log
}

// === State variables ===
let currentUser = null;
let autoBackupEnabled = true; // Mặc định bật
let autoBackupTimeout; // Biến cho debounce

// --- HÀM XỬ LÝ FIREBASE ---

// Lắng nghe trạng thái đăng nhập
function setupAuthListener() {
    console.log("firebase-logic.js: setupAuthListener started"); // Thêm log
    // === SỬ DỤNG window.auth ===
    if (typeof window.auth !== 'undefined') {
        console.log("firebase-logic.js: window.auth is defined, setting up listener."); // Thêm log
        window.auth.onAuthStateChanged(user => {
            console.log("firebase-logic.js: Auth state changed. User:", user ? user.uid : 'null'); // Thêm log
            currentUser = user;
            if (user) {
                // Đã đăng nhập
                if (userInfoDiv) userInfoDiv.style.display = 'flex'; // Hiển thị khu vực user info
                if (notLoggedInStatus) notLoggedInStatus.style.display = 'none'; // Ẩn thông báo chưa đăng nhập
                if (userStatus) userStatus.textContent = `${user.displayName || user.email}`; // Hiển thị tên
                if (userPhoto && user.photoURL) {
                    userPhoto.src = user.photoURL; // Gán ảnh đại diện
                    userPhoto.style.display = 'inline-block'; // Đảm bảo ảnh hiển thị
                } else if (userPhoto) {
                    userPhoto.style.display = 'none'; // Ẩn nếu không có ảnh
                }

                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'flex';
                if (backupRestoreSection) backupRestoreSection.style.display = 'block';
                loadBackupSettings();
                listBackups();

                // Chức năng wrap persistAllData sẽ được gọi khi sự kiện 'scriptJsReady' được kích hoạt
                // (Xem listener ở cuối file)

            } else {
                // Chưa đăng nhập / Đã đăng xuất
                if (userInfoDiv) userInfoDiv.style.display = 'none'; // Ẩn khu vực user info
                if (userPhoto) userPhoto.src = ''; // Xóa ảnh cũ
                if (notLoggedInStatus) {
                   notLoggedInStatus.textContent = 'Bạn chưa đăng nhập.'; // Hiển thị thông báo chưa đăng nhập
                   notLoggedInStatus.style.display = 'block';
                }
                if (userStatus) userStatus.textContent = ''; // Xóa tên cũ

                if (loginBtn) loginBtn.style.display = 'flex';
                if (logoutBtn) logoutBtn.style.display = 'none';
                if (backupRestoreSection) backupRestoreSection.style.display = 'none';
                currentUser = null;
                if (backupList) backupList.innerHTML = '';
                if (noBackups) noBackups.style.display = 'block';
                autoBackupEnabled = true; // Reset về mặc định khi đăng xuất
                if(autoBackupSwitch) autoBackupSwitch.checked = true;
            }
        });
    } else {
        console.warn("Firebase auth is not defined BEFORE setting up listener. Backup features disabled.");
        if (notLoggedInStatus) { // Sửa lại phần tử hiển thị lỗi
            notLoggedInStatus.textContent = 'Lỗi kết nối sao lưu Firebase.';
            notLoggedInStatus.style.display = 'block'; // Đảm bảo hiển thị
        }
        if (authSection) authSection.style.display = 'block'; // Hiển thị section để thấy lỗi
        if (loginBtn) loginBtn.style.display = 'none'; // Ẩn nút đăng nhập vì auth lỗi
        if (userInfoDiv) userInfoDiv.style.display = 'none';
    }
}

// Đăng nhập
function handleLogin() {
    // === SỬ DỤNG window.auth và window.provider ===
    if (typeof window.auth !== 'undefined' && typeof window.provider !== 'undefined') {
        window.auth.signInWithPopup(window.provider)
            .then((result) => {
                window.showToast('Đăng nhập thành công!');
            }).catch((error) => {
                console.error("Lỗi đăng nhập:", error);
                window.showToast(`Lỗi đăng nhập: ${error.code} - ${error.message}`); // Hiển thị mã lỗi
            });
    } else {
        window.showToast('Lỗi: Chưa khởi tạo Firebase Auth.');
        console.error("handleLogin failed: window.auth or window.provider is undefined.");
    }
}

// Đăng xuất
function handleLogout() {
    // === SỬ DỤNG window.auth ===
    if (typeof window.auth !== 'undefined') {
        window.auth.signOut().then(() => {
            window.showToast('Đã đăng xuất.');
        }).catch((error) => {
            console.error("Lỗi đăng xuất:", error);
            window.showToast(`Lỗi đăng xuất: ${error.message}`);
        });
    } else {
         console.error("handleLogout failed: window.auth is undefined.");
    }
}

// Lấy dữ liệu cần sao lưu
function getDataForBackup() {
    const currentLuongData = typeof window.luongData !== 'undefined' ? window.luongData : {};
    // === TRUY CẬP BIẾN GLOBAL ===
    return {
        scheduleData: window.scheduleData || {},
        timesheetEntries: window.timesheetEntries || {},
        settings: {
            firstDayIsMonday: window.firstDayIsMonday || false, // Đảm bảo có giá trị mặc định
            baseWorkHours: window.baseWorkHours || 8,
            startWorkDay: window.startWorkDay || 1,
            displayMode: window.displayMode || 'fullMonth',
            currency: window.currentCurrency || 'VND'
        },
        luongData: currentLuongData
    };
}

// Mở modal sao lưu thủ công
function openManualBackupModal() {
    if (!currentUser) {
        window.showToast('Vui lòng đăng nhập để sao lưu.');
        return;
    }
    if (backupNameInput) backupNameInput.value = `Sao lưu ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`;
    if (backupNameModal) backupNameModal.style.display = 'flex';
}

// Xác nhận tên và sao lưu thủ công
function confirmManualBackup() {
    const backupName = backupNameInput.value.trim();
    if (!backupName) {
        window.showToast('Vui lòng nhập tên cho bản sao lưu.');
        return;
    }
    if (backupNameModal) backupNameModal.style.display = 'none';
    backupDataToFirebase(backupName, true); // true = isManual
}

// Hàm sao lưu dữ liệu lên Firebase
function backupDataToFirebase(backupName = `Tự động ${new Date().toISOString()}`, isManual = false) {
    // === SỬ DỤNG window.db ===
    if (!currentUser || typeof window.db === 'undefined') {
         console.error("backupDataToFirebase failed: No user or db.");
         window.showToast('Lỗi: Chưa đăng nhập hoặc lỗi kết nối DB.');
         return;
    }

    const dataToBackup = getDataForBackup();
    // Kiểm tra nhanh xem dữ liệu có vẻ hợp lệ không
    if (!dataToBackup.scheduleData || !dataToBackup.timesheetEntries || !dataToBackup.settings) {
        console.error("backupDataToFirebase failed: Invalid data retrieved for backup.", dataToBackup);
        window.showToast('Lỗi: Dữ liệu sao lưu không hợp lệ.');
        return;
    }

    const backupTimestamp = firebase.firestore.FieldValue.serverTimestamp();

    const backupDoc = {
        name: backupName,
        timestamp: backupTimestamp,
        isManual: isManual,
        data: JSON.stringify(dataToBackup) // Chuyển đổi thành JSON string
    };

    window.db.collection('users').doc(currentUser.uid).collection('backups')
        .add(backupDoc)
        .then((docRef) => {
            window.showToast(`Đã sao lưu thành công: ${backupName}`);
            listBackups(); // Cập nhật danh sách sau khi sao lưu
        })
        .catch((error) => {
            console.error("Lỗi sao lưu Firebase:", error);
            window.showToast(`Lỗi sao lưu: ${error.message}`);
        });
}


// Liệt kê các bản sao lưu
function listBackups() {
    // === SỬ DỤNG window.db ===
    if (!currentUser || typeof window.db === 'undefined' || !backupList || !noBackups) return;

    backupList.innerHTML = ''; // Xóa danh sách cũ
    noBackups.style.display = 'block'; // Hiển thị 'chưa có' mặc định

    window.db.collection('users').doc(currentUser.uid).collection('backups')
        .orderBy('timestamp', 'desc') // Sắp xếp mới nhất lên đầu
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                 console.log("Không tìm thấy bản sao lưu nào.");
                return; // Giữ nguyên 'chưa có'
            }

            noBackups.style.display = 'none'; // Ẩn 'chưa có'
            querySnapshot.forEach((doc) => {
                 const backup = doc.data();
                const backupId = doc.id;
                const date = backup.timestamp?.toDate(); // Lấy timestamp an toàn
                const formattedDate = date ? date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Không rõ ngày';

                const li = document.createElement('li');
                li.style.cssText = 'padding: 10px 15px; border-bottom: 1px solid var(--separator-color); display: flex; justify-content: space-between; align-items: center; cursor: default;'; // Thêm cursor

                const nameSpan = document.createElement('span');
                nameSpan.textContent = `${backup.name} (${formattedDate})`;
                nameSpan.style.cssText = 'flex-grow: 1; margin-right: 10px; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                nameSpan.title = 'Nhấn để khôi phục';
                // Listener để khôi phục
                nameSpan.addEventListener('click', (e) => {
                     e.stopPropagation(); // Ngăn sự kiện nổi bọt lên li
                     promptConfirmAction('restore', backupId, backup.name);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.style.cssText = 'padding: 5px 8px; font-size: 14px; color: var(--red-destructive); background: none; border: none; cursor: pointer; flex-shrink: 0;';
                deleteBtn.title = 'Xoá bản sao lưu này';
                // Listener để xóa
                deleteBtn.addEventListener('click', (e) => {
                     e.stopPropagation(); // Ngăn sự kiện nổi bọt lên li
                     promptConfirmAction('delete', backupId, backup.name);
                });

                li.appendChild(nameSpan);
                li.appendChild(deleteBtn);
                backupList.appendChild(li);
            });
            // Bỏ border dưới của item cuối cùng
             if(backupList.lastElementChild) {
                backupList.lastElementChild.style.borderBottom = 'none';
            }
        })
        .catch((error) => {
            console.error("Lỗi tải danh sách sao lưu:", error);
            window.showToast(`Lỗi tải danh sách sao lưu: ${error.message}`);
             if(backupList) backupList.innerHTML = '<li style="padding: 15px; text-align: center; color: var(--red-destructive);">Lỗi tải danh sách</li>';
             if(noBackups) noBackups.style.display = 'none'; // Ẩn 'chưa có' khi có lỗi
        });
}

// Mở modal xác nhận hành động
function promptConfirmAction(actionType, backupId, backupName) {
    if (!confirmActionModal || !confirmActionType || !confirmActionBackupId || !confirmActionTitle || !confirmActionMessage || !confirmActionButton) {
        console.error("promptConfirmAction failed: Modal elements not found.");
        return;
    }
    confirmActionType.value = actionType;
    confirmActionBackupId.value = backupId;

    if (actionType === 'restore') {
        confirmActionTitle.textContent = 'Xác nhận khôi phục';
        confirmActionMessage.textContent = `Dữ liệu hiện tại trên thiết bị sẽ bị ghi đè bởi bản sao lưu "${backupName}". Bạn chắc chắn muốn khôi phục?`;
        confirmActionButton.className = 'btn btn-primary'; // Màu xanh cho khôi phục
        confirmActionButton.textContent = 'Khôi phục';
    } else if (actionType === 'delete') {
        confirmActionTitle.textContent = 'Xác nhận xoá';
        confirmActionMessage.textContent = `Bạn chắc chắn muốn xoá vĩnh viễn bản sao lưu "${backupName}"? Hành động này không thể hoàn tác.`;
        confirmActionButton.className = 'btn btn-danger'; // Màu đỏ cho xóa
        confirmActionButton.textContent = 'Xoá';
    }

    confirmActionModal.style.display = 'flex'; // Hiển thị modal
}

// Xử lý khi nhấn nút xác nhận trong modal
function handleConfirmAction() {
    const action = confirmActionType.value;
    const backupId = confirmActionBackupId.value;
    if (confirmActionModal) confirmActionModal.style.display = 'none'; // Ẩn modal

    if (action === 'restore') {
        restoreDataFromFirebase(backupId);
    } else if (action === 'delete') {
        deleteBackup(backupId);
    }
}

// Khôi phục dữ liệu từ Firebase
function restoreDataFromFirebase(backupId) {
    // === SỬ DỤNG window.db ===
    if (!currentUser || typeof window.db === 'undefined') {
         console.error("restoreDataFromFirebase failed: No user or db.");
         window.showToast('Lỗi: Chưa đăng nhập hoặc lỗi kết nối DB.');
         return;
    }

    window.db.collection('users').doc(currentUser.uid).collection('backups').doc(backupId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                try {
                    const backupJsonString = doc.data().data;
                    if (!backupJsonString) {
                         throw new Error("Dữ liệu sao lưu rỗng.");
                    }
                    const backupData = JSON.parse(backupJsonString);

                    // --- Cập nhật dữ liệu vào window ---
                    window.scheduleData = backupData.scheduleData || {};
                    window.timesheetEntries = backupData.timesheetEntries || {};

                    if (backupData.settings) {
                        window.firstDayIsMonday = backupData.settings.firstDayIsMonday || false;
                        window.baseWorkHours = backupData.settings.baseWorkHours || 8;
                        window.startWorkDay = backupData.settings.startWorkDay || 1;
                        window.displayMode = backupData.settings.displayMode || 'fullMonth';
                        window.currentCurrency = backupData.settings.currency || 'VND';
                    } else {
                         // Nếu không có settings trong backup, đặt về mặc định
                         window.firstDayIsMonday = false;
                         window.baseWorkHours = 8;
                         window.startWorkDay = 1;
                         window.displayMode = 'fullMonth';
                         window.currentCurrency = 'VND';
                    }

                    // Cập nhật dữ liệu lương nếu có
                    if (backupData.luongData && typeof window.luongData === 'object') {
                         // Xóa dữ liệu lương cũ trước khi gán để tránh merge không mong muốn
                         for (const key in window.luongData) {
                             delete window.luongData[key];
                         }
                        Object.assign(window.luongData, backupData.luongData);
                    } else if (typeof window.luongData === 'object') {
                         // Nếu backup không có luongData, reset dữ liệu lương hiện tại về mặc định
                         window.luongData.luongGio = 0;
                         window.luongData.luongTangCaGio = 0;
                         // ... reset các trường khác của luongData ...
                    }
                    // --- Kết thúc cập nhật dữ liệu window ---

                    // === Lưu dữ liệu mới vào LocalStorage ===
                    if (typeof window.persistAllData === 'function') {
                        // Gọi hàm gốc để lưu tất cả dữ liệu vào localStorage
                        // Thêm cờ 'true' để báo hiệu đây là khôi phục, không trigger auto backup
                        window.persistAllData(true);
                    } else {
                        console.error("Hàm persistAllData gốc không tồn tại trên window!");
                         window.showToast('Lỗi nghiêm trọng: Không thể lưu dữ liệu đã khôi phục.');
                         return; // Dừng lại nếu không lưu được
                    }

                    // === Cập nhật giao diện người dùng ===
                    if (typeof updateUICallbacks === 'object' && typeof updateUICallbacks.updateAllUI === 'function') {
                        updateUICallbacks.updateAllUI(); // Gọi hàm cập nhật toàn bộ UI
                    } else {
                         console.error("updateUICallbacks.updateAllUI không tìm thấy!");
                    }

                    window.showToast('Đã khôi phục dữ liệu thành công!');

                } catch (e) {
                    console.error("Lỗi phân tích hoặc xử lý dữ liệu sao lưu:", e);
                    window.showToast(`Lỗi khôi phục: ${e.message}`);
                }
            } else {
                console.warn("Không tìm thấy bản sao lưu với ID:", backupId);
                window.showToast('Lỗi: Không tìm thấy bản sao lưu.');
            }
        })
        .catch((error) => {
            console.error("Lỗi truy cập Firebase để khôi phục:", error);
            window.showToast(`Lỗi khôi phục: ${error.message}`);
        });
}

// Xoá bản sao lưu
function deleteBackup(backupId) {
    // === SỬ DỤNG window.db ===
    if (!currentUser || typeof window.db === 'undefined') {
        console.error("deleteBackup failed: No user or db.");
        window.showToast('Lỗi: Chưa đăng nhập hoặc lỗi kết nối DB.');
        return;
    }

    window.db.collection('users').doc(currentUser.uid).collection('backups').doc(backupId)
        .delete()
        .then(() => {
            window.showToast('Đã xoá bản sao lưu.');
            listBackups(); // Cập nhật lại danh sách
        })
        .catch((error) => {
            console.error("Lỗi xoá sao lưu:", error);
            window.showToast(`Lỗi xoá sao lưu: ${error.message}`);
        });
}

// Xử lý switch tự động sao lưu
function handleAutoBackupToggle(event) {
    if (!event || !event.target) return;
    autoBackupEnabled = event.target.checked;
    saveBackupSettings(); // Lưu cài đặt mới lên Firebase
    window.showToast(`Tự động sao lưu ${autoBackupEnabled ? 'đã bật' : 'đã tắt'}.`);
}

// Lưu cài đặt sao lưu lên Firebase
function saveBackupSettings() {
    if (!currentUser || typeof window.db === 'undefined') return;
    window.db.collection('users').doc(currentUser.uid).set({
        autoBackup: autoBackupEnabled // Chỉ lưu trạng thái autoBackup
    }, { merge: true }) // Dùng merge để không ghi đè các trường khác nếu có
        .catch(err => console.error("Lỗi lưu cài đặt sao lưu:", err));
}

// Tải cài đặt sao lưu từ Firebase
function loadBackupSettings() {
    if (!currentUser || typeof window.db === 'undefined' || !autoBackupSwitch) return;
    window.db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists && doc.data() && doc.data().autoBackup !== undefined) {
                autoBackupEnabled = doc.data().autoBackup; // Lấy trạng thái đã lưu
            } else {
                // Nếu chưa có cài đặt, mặc định là bật và lưu lại
                autoBackupEnabled = true;
                saveBackupSettings();
            }
            autoBackupSwitch.checked = autoBackupEnabled; // Cập nhật trạng thái switch UI
        })
        .catch(err => {
            console.error("Lỗi tải cài đặt sao lưu:", err);
            // Nếu lỗi, tạm thời mặc định là bật
            autoBackupEnabled = true;
            if(autoBackupSwitch) autoBackupSwitch.checked = true;
        });
}

// === GHI ĐÈ persistAllData ĐỂ THÊM AUTO BACKUP ===
function wrapPersistAllDataForAutoBackup() {
    // Chỉ wrap MỘT LẦN và khi hàm gốc đã tồn tại
    if (typeof window.originalPersistAllData_Firebase === 'undefined' && typeof window.persistAllData === 'function') {
        console.log("Wrapping persistAllData for the first time.");
        window.originalPersistAllData_Firebase = window.persistAllData; // Lưu hàm gốc

        // Tạo hàm mới (wrapper)
        window.persistAllData = (isRestoring = false) => {
            // 1. Gọi hàm gốc để lưu vào localStorage
            window.originalPersistAllData_Firebase();

            // 2. Kích hoạt auto backup (nếu không phải đang khôi phục)
            if (!isRestoring && autoBackupEnabled && currentUser) {
                console.log("Data changed, debouncing auto backup...");
                clearTimeout(autoBackupTimeout); // Hủy timeout cũ (nếu có)
                // Đặt timeout mới
                autoBackupTimeout = setTimeout(() => {
                    // Kiểm tra lại trạng thái trước khi backup
                    if (autoBackupEnabled && currentUser) {
                        console.log("Executing debounced auto backup...");
                        backupDataToFirebase(`Tự động ${new Date().toISOString()}`, false); // Backup tự động
                    }
                }, 5000); // Debounce 5 giây
            }
        };
        console.log("persistAllData has been wrapped successfully.");

    } else if (typeof window.originalPersistAllData_Firebase === 'function') {
         console.log("persistAllData was already wrapped.");
         // Đảm bảo window.persistAllData là hàm đã wrap (phòng trường hợp bị ghi đè lại)
         if (window.persistAllData !== window.originalPersistAllData_Firebase) {
             // Hàm hiện tại không phải là hàm gốc, có vẻ đã wrap đúng
         } else {
             // Bị lỗi gì đó khiến hàm gốc bị gán lại, thử wrap lại (ít khi xảy ra)
             console.warn("persistAllData seems to have been reset to original, re-wrapping.");
             const tempOriginal = window.originalPersistAllData_Firebase; // Giữ lại bản gốc đã lưu
             window.persistAllData = (isRestoring = false) => { /* Nội dung wrapper như trên */
                  tempOriginal();
                  if (!isRestoring && autoBackupEnabled && currentUser) { /* Logic debounce */
                      clearTimeout(autoBackupTimeout);
                      autoBackupTimeout = setTimeout(() => { /* backupDataToFirebase() */ }, 5000);
                  }
             };

         }
    } else {
        // Lỗi này xảy ra nếu 'scriptJsReady' chưa kích hoạt hoặc hàm gốc bị xóa
        console.error("CRITICAL: Cannot wrap persistAllData - original function not found on window when wrap function executed.");
        window.showToast("Lỗi nghiêm trọng: Không thể bật tự động sao lưu.");
    }
}


// --- Gán Event Listeners sau khi DOM tải xong ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("firebase-logic.js: DOMContentLoaded event fired.");
    getFirebaseDOMElements(); // Lấy các element Firebase

    // Gán listener cho Firebase UI (chỉ gán, không gọi hàm logic ở đây)
    loginBtn?.addEventListener('click', handleLogin);
    logoutBtn?.addEventListener('click', handleLogout);
    manualBackupBtn?.addEventListener('click', openManualBackupModal);
    autoBackupSwitch?.addEventListener('change', handleAutoBackupToggle);
    confirmBackupNameBtn?.addEventListener('click', confirmManualBackup);
    confirmActionButton?.addEventListener('click', handleConfirmAction);

    // Đóng modals
    [backupNameModal, confirmActionModal].forEach(modal => {
        if (modal) {
             modal.addEventListener('click', e => { if (e.target === modal) e.target.style.display = 'none'; });
             const cancelButton = modal.querySelector('.btn-cancel');
             if (cancelButton) {
                 cancelButton.addEventListener('click', () => modal.style.display = 'none');
             }
        }
    });

    // Bắt đầu lắng nghe trạng thái đăng nhập
    // Phải chắc chắn rằng window.auth đã tồn tại (do script khởi tạo trong index.html)
    if (typeof window.auth !== 'undefined') {
         console.log("firebase-logic.js: Calling setupAuthListener from DOMContentLoaded.");
         setupAuthListener();
    } else {
         console.error("firebase-logic.js: window.auth is UNDEFINED in DOMContentLoaded!");
         // Hiển thị lỗi cho người dùng ngay lập tức
         if (notLoggedInStatus) {
              notLoggedInStatus.textContent = "Lỗi: Không thể khởi tạo xác thực Firebase.";
              notLoggedInStatus.style.color = 'red';
              notLoggedInStatus.style.display = 'block';
         }
         if(authSection) authSection.style.display = 'block'; // Hiển thị section để thấy lỗi
         if(loginBtn) loginBtn.style.display = 'none';
         if(userInfoDiv) userInfoDiv.style.display = 'none';
    }


    // Chờ script.js báo hiệu nó đã sẵn sàng TRƯỚC KHI wrap hàm
    window.addEventListener('scriptJsReady', () => {
        console.log("firebase-logic.js: Event 'scriptJsReady' received. Wrapping persistAllData...");
        wrapPersistAllDataForAutoBackup();
    }, { once: true }); // Chỉ chạy listener này MỘT LẦN

}); // End DOMContentLoaded for firebase-logic.js

// === Đối tượng chứa các hàm cập nhật UI để restore có thể gọi ===
const updateUICallbacks = {
     updateAllUI: () => {
        console.log("updateUICallbacks: Updating all UI components after restore.");
         // Sử dụng window.hàm_gốc
         if (typeof window.renderCalendar === 'function') {
             console.log("updateUICallbacks: Calling window.renderCalendar");
             window.renderCalendar();
         } else { console.error("updateUICallbacks: window.renderCalendar not found!"); }

         if (typeof window.updateStatistics === 'function' && typeof window.currentStatsDate !== 'undefined') {
             console.log("updateUICallbacks: Calling window.updateStatistics");
             window.updateStatistics(window.currentStatsDate);
         } else { console.error("updateUICallbacks: window.updateStatistics or window.currentStatsDate not found!"); }

         if (typeof window.renderTimesheetLog === 'function') {
             console.log("updateUICallbacks: Calling window.renderTimesheetLog");
             window.renderTimesheetLog();
         } else { console.error("updateUICallbacks: window.renderTimesheetLog not found!"); }

         // Cập nhật tab Máy tính nếu nó đang hiển thị
         const calcTab = document.getElementById('tabMayTinh');
         if (calcTab?.classList.contains('active') && typeof window.initCalcTab === 'function') {
             console.log("updateUICallbacks: Calling window.initCalcTab");
             window.initCalcTab();
         } else if (calcTab?.classList.contains('active')) {
             console.error("updateUICallbacks: window.initCalcTab not found but calc tab is active!");
         }

          // --- Cập nhật các input/select trong tab Cài đặt ---
          console.log("updateUICallbacks: Updating settings UI elements.");
          // Lấy lại các element phòng trường hợp chưa có
          const firstDayLabelElem = document.getElementById('firstDayLabel');
          const baseHoursInputElem = document.getElementById('baseHoursInput');
          const startWorkDayInputElem = document.getElementById('startWorkDayInput');
          const displayModeSelectElem = document.getElementById('displayModeSelect');
          const currencySelectorElem = document.getElementById('currencySelector');
          const themeSelectorElem = document.getElementById('themeSelector'); // Thêm theme

          if (firstDayLabelElem) firstDayLabelElem.textContent = window.firstDayIsMonday ? 'T2' : 'CN';
          if (baseHoursInputElem) baseHoursInputElem.value = window.baseWorkHours || 8; // Mặc định nếu null/undefined
          if (startWorkDayInputElem) startWorkDayInputElem.value = window.startWorkDay || 1;
          if (displayModeSelectElem) displayModeSelectElem.value = window.displayMode || 'fullMonth';
          if (currencySelectorElem) currencySelectorElem.value = window.currentCurrency || 'VND';

          // Cập nhật theme selector (lấy từ localStorage vì không lưu trong settings của backup)
           const savedTheme = localStorage.getItem('ts_theme_v16') || 'default';
           if (themeSelectorElem) themeSelectorElem.value = savedTheme;
           // Gọi hàm applyTheme để áp dụng theme trực quan (nếu cần thiết và hàm đó global)
           if (typeof window.applyTheme === 'function') { // Giả sử bạn đã làm applyTheme global
                // window.applyTheme(savedTheme); // Có thể gây vòng lặp nếu applyTheme gọi persistAllData? Cẩn thận!
           } else {
               // Hoặc áp dụng trực tiếp class vào body nếu applyTheme không global
               document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
               if (savedTheme && savedTheme !== 'default') document.body.classList.add(`theme-${savedTheme}`);
           }

           console.log("updateUICallbacks: Settings UI update attempt finished.");
           // --- Kết thúc cập nhật cài đặt ---
     }
 };