import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .b64-layout { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
            .b64-in { order: 1; }
            .b64-act { order: 2; display: flex; justify-content: center; gap: 12px; }
            .b64-out { order: 3; }

            @media(min-width: 768px) {
                .b64-layout {
                    display: grid; 
                    grid-template-columns: 1fr 1fr;
                    grid-template-areas: "in out";
                    gap: 20px;
                }
                .b64-in { grid-area: in; }
                .b64-out { grid-area: out; }
                /* Trên Desktop, đưa các nút hành động xuống dưới cùng */
                .b64-act { grid-column: span 2; margin-top: 8px; }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Base64 Encoder / Decoder</h1>
                <p class="text-mut">Mã hóa và giải mã chuỗi dữ liệu an toàn (Hỗ trợ Tiếng Việt & Unicode).</p>
            </div>
        </div>

        <div class="b64-layout">
            
            <div class="card b64-in" style="padding: 0; display: flex; flex-direction: column; overflow: hidden;">
                <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-sec);">
                    <div class="text-mut" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Đầu vào</div>
                    <div class="flex-row" style="gap: 4px;">
                        <button class="btn btn-ghost" id="b64-paste" title="Dán" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-paste"></i> Dán</button>
                        <button class="btn btn-ghost" id="b64-clear" title="Xóa" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444;"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
                <textarea id="b64-input" class="textarea" rows="12" 
                    style="border: none; border-radius: 0; flex: 1; padding: 16px; resize: vertical; line-height: 1.6; background: transparent;" 
                    placeholder="Nhập văn bản gốc hoặc chuỗi Base64 vào đây..."></textarea>
            </div>

            <div class="card b64-out" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-sec); border-color: #3b82f640;">
                <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-main);">
                    <div class="text-mut" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: #3b82f6;">Kết quả</div>
                    <div class="flex-row" style="gap: 4px;">
                        <button class="btn btn-outline" id="b64-swap" title="Đưa kết quả sang ô Đầu vào" style="padding: 4px 8px; font-size: 0.75rem;">
                            <i class="fas fa-exchange-alt"></i> Đảo chiều
                        </button>
                        <button class="btn btn-primary" id="b64-copy" title="Sao chép" style="padding: 4px 12px; font-size: 0.8rem;">
                            <i class="fas fa-copy"></i> Chép
                        </button>
                    </div>
                </div>
                <textarea id="b64-output" class="textarea" rows="12" 
                    style="border: none; border-radius: 0; flex: 1; padding: 16px; resize: vertical; line-height: 1.6; background: transparent; cursor: text;" 
                    placeholder="Kết quả sẽ hiển thị ở đây..." readonly></textarea>
            </div>

            <div class="b64-act">
                <button class="btn btn-primary" id="btn-encode" style="padding: 12px 24px; font-size: 1rem; flex: 1; max-width: 250px; justify-content: center;">
                    <i class="fas fa-lock"></i> Mã hóa (Encode)
                </button>
                <button class="btn btn-outline" id="btn-decode" style="padding: 12px 24px; font-size: 1rem; flex: 1; max-width: 250px; justify-content: center;">
                    <i class="fas fa-unlock"></i> Giải mã (Decode)
                </button>
            </div>

        </div>
    `;
}

export function init() {
    const input = document.getElementById('b64-input');
    const output = document.getElementById('b64-output');

    // MÃ HÓA
    document.getElementById('btn-encode').onclick = () => {
        if (!input.value) {
            output.value = '';
            return UI.showAlert('Trống', 'Vui lòng nhập văn bản cần mã hóa.', 'warning');
        }
        try {
            // Dùng unescape & encodeURIComponent để hỗ trợ mã hóa chuẩn tiếng Việt (Unicode)
            output.value = btoa(unescape(encodeURIComponent(input.value)));
            UI.showAlert('Thành công', 'Đã mã hóa sang Base64.', 'success');
            scrollToOutput();
        } catch (err) {
            output.value = '';
            UI.showAlert('Lỗi', 'Dữ liệu đầu vào không hợp lệ.', 'error');
        }
    };

    // GIẢI MÃ
    document.getElementById('btn-decode').onclick = () => {
        if (!input.value) {
            output.value = '';
            return UI.showAlert('Trống', 'Vui lòng nhập chuỗi Base64 cần giải mã.', 'warning');
        }
        try {
            // Loại bỏ khoảng trắng thừa nếu người dùng dán nhầm
            const cleanInput = input.value.replace(/\s/g, '');
            output.value = decodeURIComponent(escape(atob(cleanInput)));
            UI.showAlert('Thành công', 'Đã giải mã Base64.', 'success');
            scrollToOutput();
        } catch (err) {
            output.value = '';
            UI.showAlert('Lỗi', 'Chuỗi Base64 không hợp lệ hoặc bị hỏng.', 'error');
        }
    };

    // COPY
    document.getElementById('b64-copy').onclick = async () => {
        if (!output.value) return UI.showAlert('Trống', 'Không có kết quả để chép.', 'warning');
        try {
            await navigator.clipboard.writeText(output.value);
            UI.showAlert('Đã chép', 'Kết quả đã được lưu vào Clipboard.', 'success');
        } catch (e) { UI.showAlert('Lỗi', 'Vui lòng bôi đen và chép thủ công.', 'error'); }
    };

    // PASTE
    document.getElementById('b64-paste').onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const start = input.selectionStart;
            input.value = input.value.substring(0, start) + text + input.value.substring(input.selectionEnd);
            input.focus();
        } catch (e) { UI.showAlert('Lỗi dán', 'Trình duyệt chặn, hãy ấn Ctrl+V.', 'error'); }
    };

    // CLEAR
    document.getElementById('b64-clear').onclick = () => {
        if (!input.value && !output.value) return;
        input.value = '';
        output.value = '';
        input.focus();
    };

    // ĐẢO CHIỀU (Swap)
    document.getElementById('b64-swap').onclick = () => {
        if (!output.value) return UI.showAlert('Trống', 'Không có kết quả để đảo chiều.', 'warning');
        input.value = output.value;
        output.value = '';
        UI.showAlert('Đã chuyển', 'Kết quả đã được đưa sang ô Đầu vào.', 'info');
        if (window.innerWidth <= 768) {
            document.querySelector('.b64-in').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Hàm hỗ trợ cuộn trên mobile
    function scrollToOutput() {
        if (window.innerWidth <= 768) {
            setTimeout(() => { document.querySelector('.b64-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
        }
    }
}