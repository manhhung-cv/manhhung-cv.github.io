import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="flex-between" style="margin-bottom: 32px;">
            <div>
                <div class="h1">UI Components Kit</div>
                <p class="text-mut">Thư viện giao diện Flat & Minimal tổng hợp. Sẵn sàng để tái sử dụng.</p>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="h1" style="font-size: 1.1rem;">1. Dynamic Modal & Alerts</div>
            <p class="text-mut" style="margin-bottom: 16px;">Gọi thông báo và cửa sổ xác nhận thông qua JavaScript <code>UI.showAlert()</code>.</p>
            
            <div class="flex-row" style="flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <button class="btn btn-outline" id="test-alert-success"><i class="fas fa-check" style="color: #10b981"></i> Alert Success</button>
                <button class="btn btn-outline" id="test-alert-error"><i class="fas fa-times" style="color: #ef4444"></i> Alert Error</button>
                <button class="btn btn-outline" id="test-alert-info"><i class="fas fa-info" style="color: #3b82f6"></i> Alert Info</button>
            </div>
            
            <div class="divider"></div>
            
            <button class="btn btn-primary" id="test-modal">
                <i class="fas fa-window-restore"></i> Mở Modal Xác Nhận
            </button>
        </div>

        <div class="grid-2" style="margin-bottom: 24px;">
            <div class="card">
                <div class="h1" style="font-size: 1.1rem;">2. Buttons (Nút bấm)</div>
                <div class="flex-row" style="margin-top: 16px; flex-wrap: wrap;">
                    <button class="btn btn-primary">Primary</button>
                    <button class="btn btn-outline">Outline</button>
                    <button class="btn btn-ghost">Ghost</button>
                </div>
                <div class="divider"></div>
                <div class="flex-row" style="flex-wrap: wrap;">
                    <button class="btn btn-primary"><i class="fas fa-download"></i> Icon Left</button>
                    <button class="btn btn-outline">Icon Right <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>

            <div class="card">
                <div class="h1" style="font-size: 1.1rem;">3. Basic Form & Toggle</div>
                <div class="form-group" style="margin-top: 16px;">
                    <label class="form-label">Input Text</label>
                    <input type="text" class="input" placeholder="Nhập văn bản...">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Cài đặt (Toggle Switch)</label>
                    <label class="switch-wrapper" style="margin-top: 8px;">
                        <input type="checkbox" class="switch-input" checked>
                        <div class="switch"></div>
                        <span class="switch-label">Bật chế độ nâng cao</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="h1" style="font-size: 1.1rem;">4. Đa dạng Input Types & Custom Checkbox</div>
            
            <div class="grid-2" style="margin-top: 16px;">
                <div class="form-group">
                    <label class="form-label">Email & Password</label>
                    <input type="email" class="input" placeholder="name@example.com" style="margin-bottom: 8px;">
                    <input type="password" class="input" placeholder="••••••••">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Date Picker & Color</label>
                    <div class="flex-row">
                        <input type="date" class="input" style="flex: 1;">
                        <input type="color" class="input input-color" value="#000000" style="width: 60px;">
                    </div>
                    <label class="form-label" style="margin-top: 12px;">Upload File</label>
                    <input type="file" class="input input-file">
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label flex-between">
                    <span>Độ mờ (Opacity)</span>
                    <span class="text-mut" style="font-weight: 400; font-size: 0.8rem;">0 - 100%</span>
                </label>
                <div class="range-wrapper">
                    <input type="range" class="range" min="0" max="100" value="50">
                    <span class="range-value">50</span>
                </div>
            </div>
            
            <div class="grid-2">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label class="form-label">Checkbox Custom</label>
                    <label class="check-label"><input type="checkbox" class="checkbox" checked> Ghi nhớ đăng nhập</label>
                    <label class="check-label"><input type="checkbox" class="checkbox"> Nhận thông báo qua email</label>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label class="form-label">Radio Custom</label>
                    <label class="check-label"><input type="radio" name="theme_rad" class="radio" checked> Tùy chọn mặc định</label>
                    <label class="check-label"><input type="radio" name="theme_rad" class="radio"> Tùy chọn thay thế</label>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="h1" style="font-size: 1.1rem;">5. Group Input (Nhóm liên kết)</div>
            <p class="text-mut" style="margin-bottom: 16px;">Sử dụng class <code>.input-group</code> để nối sát các thành phần lại với nhau.</p>
            
            <div class="grid-2">
                <div class="form-group">
                    <label class="form-label">Sao chép liên kết (2 thẻ)</label>
                    <div class="input-group">
                        <input type="text" class="input" value="https://my-aio-tools.com" readonly>
                        <button class="btn btn-primary"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Tìm kiếm (3 thẻ)</label>
                    <div class="input-group">
                        <button class="btn btn-outline"><i class="fas fa-filter"></i></button>
                        <input type="text" class="input" placeholder="Từ khóa...">
                        <button class="btn btn-outline">Tìm</button>
                    </div>
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Kích thước tùy chỉnh (Nhiều thẻ)</label>
                <div class="input-group">
                    <input type="number" class="input" placeholder="Rộng">
                    <button class="btn btn-ghost" style="pointer-events: none; padding: 0 12px;"><i class="fas fa-times"></i></button>
                    <input type="number" class="input" placeholder="Cao">
                    <button class="btn btn-outline">Áp dụng</button>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="h1" style="font-size: 1.1rem;">6. Tabs & Table Data</div>
            
            <div class="tabs" id="ui-kit-tabs" style="margin-top: 16px;">
                <button class="tab-btn active" data-target="tab-table">Bảng dữ liệu</button>
                <button class="tab-btn" data-target="tab-text">Nội dung Textarea</button>
            </div>
            
            <div class="tab-pane active" id="tab-table">
                <div class="table-wrap">
                    <table class="table">
                        <thead>
                            <tr><th>Tính năng</th><th>Trạng thái</th><th>Hành động</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Format JSON</td>
                                <td><span class="badge badge-success">Hoạt động</span></td>
                                <td><button class="btn btn-ghost"><i class="fas fa-edit"></i> Sửa</button></td>
                            </tr>
                            <tr>
                                <td>Base64 Encode</td>
                                <td><span class="badge badge-error">Bảo trì</span></td>
                                <td><button class="btn btn-ghost"><i class="fas fa-edit"></i> Sửa</button></td>
                            </tr>
                            <tr>
                                <td>QR Generator</td>
                                <td><span class="badge badge-info">Beta</span></td>
                                <td><button class="btn btn-ghost"><i class="fas fa-edit"></i> Sửa</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="tab-pane" id="tab-text">
                <textarea class="textarea" rows="4" placeholder="Nhập dữ liệu vào đây..."></textarea>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="h1" style="font-size: 1.1rem;">7. Media có Khung Điều Khiển</div>
            <p class="text-mut" style="margin-bottom: 16px;">Thêm class <code>.media-box-control</code> và cấu trúc nút bên trong để có Custom Controls.</p>

            <div class="grid-2">
                <div class="media-box media-box-control">
                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80" alt="Code setup">
                    <div class="media-overlay">
                        <button class="media-btn btn-fullscreen" title="Xem toàn màn hình"><i class="fas fa-expand"></i></button>
                    </div>
                    <div class="media-caption"><i class="fas fa-image"></i> cover_image.jpg</div>
                </div>

                <div class="media-box media-box-control">
                    <video loop muted playsinline style="width: 100%; aspect-ratio: 16/9; background: #000; object-fit: cover;">
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                    </video>
                    <div class="media-overlay">
                        <button class="media-btn btn-play" title="Phát/Dừng"><i class="fas fa-play"></i></button>
                        <button class="media-btn btn-mute" title="Tắt/Bật tiếng"><i class="fas fa-volume-mute"></i></button>
                        <button class="media-btn btn-fullscreen" title="Phóng to"><i class="fas fa-expand"></i></button>
                    </div>
                    <div class="media-caption"><i class="fas fa-video"></i> sample_video.mp4</div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    // ----------------------------------------------------
    // LOGIC CHO ALERTS
    // ----------------------------------------------------
    const btnSuccess = document.getElementById('test-alert-success');
    if (btnSuccess) btnSuccess.onclick = () => {
        UI.showAlert('Thành công', 'Hành động đã được thực thi hoàn hảo.', 'success');
    };
    
    const btnError = document.getElementById('test-alert-error');
    if (btnError) btnError.onclick = () => {
        UI.showAlert('Lỗi hệ thống', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.', 'error');
    };

    const btnInfo = document.getElementById('test-alert-info');
    if (btnInfo) btnInfo.onclick = () => {
        UI.showAlert('Cập nhật trạng thái', 'Đang xử lý dữ liệu ngầm, vui lòng đợi giây lát.', 'info');
    };

    // ----------------------------------------------------
    // LOGIC CHO MODAL XÁC NHẬN
    // ----------------------------------------------------
    const btnModal = document.getElementById('test-modal');
    if (btnModal) btnModal.onclick = () => {
        UI.showConfirm(
            'Xác nhận hành động nguy hiểm?',
            'Bạn đang chuẩn bị xóa toàn bộ cấu hình mặc định. Hành động này không thể hoàn tác, bạn có muốn tiếp tục không?',
            () => {
                // Callback khi bấm "Xác nhận"
                UI.showAlert('Đã xóa', 'Toàn bộ cấu hình đã được khôi phục về trạng thái trống.', 'success');
            }
        );
    };

    // ----------------------------------------------------
    // LOGIC CHO TABS
    // ----------------------------------------------------
    const tabs = document.querySelectorAll('#ui-kit-tabs .tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Xóa class active ở mọi tab và pane
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            // Thêm class active cho tab được bấm và pane tương ứng
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // ----------------------------------------------------
    // LOGIC CHO RANGE SLIDER (Tự động cập nhật số)
    // ----------------------------------------------------
    const rangeInputs = document.querySelectorAll('.range-wrapper');
    rangeInputs.forEach(wrapper => {
        const range = wrapper.querySelector('.range');
        const valueSpan = wrapper.querySelector('.range-value');
        
        if (range && valueSpan) {
            // Lắng nghe sự kiện 'input' để số nhảy liên tục khi đang kéo
            range.addEventListener('input', (e) => {
                valueSpan.textContent = e.target.value;
            });
        }
    });
UI.initMediaControls();
    console.log("UI Kit Core Components Fully Loaded!");
}