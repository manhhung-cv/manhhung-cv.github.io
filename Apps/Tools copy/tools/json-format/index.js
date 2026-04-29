import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <div class="h1">Format JSON</div>
                <p class="text-mut">Làm đẹp, nén hoặc xác thực mã JSON của bạn. Xử lý 100% tại trình duyệt.</p>
            </div>
            <button class="btn btn-outline" id="btn-demo-json"><i class="fas fa-magic"></i> Dữ liệu mẫu</button>
        </div>

        <div class="grid-2" style="margin-bottom: 24px;">
            <div class="card" style="display: flex; flex-direction: column; gap: 12px; padding: 16px;">
                <div class="flex-between">
                    <label class="form-label" style="margin: 0;">Đầu vào (Input)</label>
                    <button class="btn btn-ghost" id="btn-clear-json" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-trash"></i> Xóa</button>
                </div>
                <textarea id="json-input" class="textarea" style="flex: 1; min-height: 400px; font-family: monospace; white-space: nowrap;" placeholder='Dán chuỗi JSON vào đây...'></textarea>
            </div>

            <div class="card" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--bg-sec);">
                <div class="flex-between">
                    <label class="form-label" style="margin: 0;">Kết quả (Output)</label>
                    <button class="btn btn-primary" id="btn-copy-json" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-copy"></i> Sao chép</button>
                </div>
                <textarea id="json-output" class="textarea" style="flex: 1; min-height: 400px; font-family: monospace; white-space: nowrap; background: transparent;" readonly placeholder='Kết quả sẽ hiển thị ở đây...'></textarea>
            </div>
        </div>

        <div class="flex-row">
            <button class="btn btn-primary" id="btn-format-json"><i class="fas fa-align-left"></i> Format (Làm đẹp)</button>
            <button class="btn btn-outline" id="btn-minify-json"><i class="fas fa-compress-alt"></i> Minify (Nén)</button>
        </div>
    `;
}

export function init() {
    const inputEl = document.getElementById('json-input');
    const outputEl = document.getElementById('json-output');

    // Hàm dùng chung để xử lý JSON
    const processJSON = (action) => {
        const rawData = inputEl.value.trim();
        if (!rawData) {
            UI.showAlert('Trống', 'Vui lòng nhập dữ liệu JSON đầu vào.', 'warning');
            return;
        }

        try {
            // Parse để kiểm tra cú pháp
            const parsed = JSON.parse(rawData);
            
            // Render kết quả tùy theo nút bấm
            if (action === 'format') {
                outputEl.value = JSON.stringify(parsed, null, 4); // Format thụt lề 4 space
                UI.showAlert('Thành công', 'Đã format JSON hợp lệ.', 'success');
            } else if (action === 'minify') {
                outputEl.value = JSON.stringify(parsed); // Nén không khoảng trắng
                UI.showAlert('Thành công', 'Đã nén JSON.', 'success');
            }
        } catch (error) {
            // Hiển thị lỗi cực kỳ trực quan
            outputEl.value = '';
            UI.showAlert('Lỗi cú pháp', error.message, 'error');
        }
    };

    // Bắt sự kiện các nút bấm
    document.getElementById('btn-format-json').onclick = () => processJSON('format');
    document.getElementById('btn-minify-json').onclick = () => processJSON('minify');

    // Nút Copy kết quả
    document.getElementById('btn-copy-json').onclick = async () => {
        if (!outputEl.value) return UI.showAlert('Thất bại', 'Không có kết quả để copy.', 'warning');
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                throw new Error('Không hỗ trợ copy');
            }
            await navigator.clipboard.writeText(outputEl.value);
            UI.showAlert('Đã chép', 'Đã sao chép kết quả vào Clipboard.', 'info');
        } catch (e) {
            UI.showAlert('Lỗi', 'Vui lòng bôi đen và copy thủ công (Ctrl+C).', 'error');
        }
    };

    // Nút Xóa trắng bằng Modal Xác nhận
    document.getElementById('btn-clear-json').onclick = () => {
        if (!inputEl.value && !outputEl.value) return;
        UI.showConfirm('Xóa dữ liệu', 'Bạn có chắc chắn muốn xóa sạch đầu vào và kết quả?', () => {
            inputEl.value = '';
            outputEl.value = '';
            inputEl.focus();
        });
    };

    // Nút điền Dữ liệu mẫu (Demo)
    document.getElementById('btn-demo-json').onclick = () => {
        const demoData = {"project":"AIO Tools","version":1.0,"features":["Format JSON","Base64 Decode"],"is_active":true,"author":{"name":"Admin","role":"Developer"}};
        inputEl.value = JSON.stringify(demoData);
        processJSON('format');
    };
}