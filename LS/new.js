// --- 1. HÀM LOAD DANH SÁCH LINK ADMIN (GIAO DIỆN MỚI) ---
   

        // --- 2. HÀM XỬ LÝ CHỌN TỪNG DÒNG (HIGHLIGHT) ---
        window.toggleSelectRow = (id, event) => {
            // Ngăn chặn nổi bọt nếu có nút con (nếu sau này thêm nút edit/delete riêng)
            // if (event && event.target.tagName === 'BUTTON') return;

            const row = document.getElementById(`row-${id}`);
            const chk = document.getElementById(`chk-${id}`);
            
            // Đảo ngược trạng thái
            chk.checked = !chk.checked;
            
            // Cập nhật giao diện (Thêm/Bỏ class .selected)
            if (chk.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
                // Nếu bỏ chọn 1 cái thì bỏ active nút Select All
                document.getElementById('btn-select-all').classList.remove('active');
            }
        };

        // --- 3. HÀM CHỌN TẤT CẢ (TOGGLE ALL) ---
        window.toggleSelectAll = () => {
            const btn = document.getElementById('btn-select-all');
            const isSelecting = !btn.classList.contains('active'); // Nếu chưa active thì là đang muốn chọn tất cả
            
            const checkboxes = document.querySelectorAll('.adm-chk-input');
            const rows = document.querySelectorAll('.adm-link-row');

            checkboxes.forEach(chk => chk.checked = isSelecting);
            
            if (isSelecting) {
                btn.classList.add('active');
                rows.forEach(row => row.classList.add('selected'));
            } else {
                btn.classList.remove('active');
                rows.forEach(row => row.classList.remove('selected'));
            }
        };

        // --- 4. HÀM XOÁ NHIỀU (ĐÃ CÓ, CẬP NHẬT SELECTOR) ---
        window.bulkDeleteLinks = async () => {
            // Lấy các input đã check
            const checkedInputs = document.querySelectorAll('.adm-chk-input:checked');
            
            if(checkedInputs.length === 0) return window.showModal('Thông báo', 'Chưa chọn mục nào để xoá!');
            
            window.showModal('Xác nhận', `Bạn có chắc muốn xoá vĩnh viễn <b style="color:var(--danger)">${checkedInputs.length}</b> link đã chọn?`, 'confirm', async (yes) => {
                if(yes) {
                    const batch = writeBatch(db);
                    checkedInputs.forEach(input => {
                        batch.delete(doc(db, "links", input.value));
                    });
                    
                    await batch.commit();
                    window.showModal('Thành công', 'Đã xoá các link đã chọn!');
                    loadAdmLinks(); // Load lại danh sách
                }
            });
        };