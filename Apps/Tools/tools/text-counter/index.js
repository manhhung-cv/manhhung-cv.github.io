import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* CẤU TRÚC LAYOUT TỐI ƯU */
            .tt-layout { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
            
            /* THỨ TỰ TRÊN MOBILE (Lorem lên đầu tiên) */
            .tt-lor { order: 1; }
            .tt-in  { order: 2; }
            .tt-act { order: 3; }
            .tt-out { order: 4; }

            /* THANH CUỘN NGANG CHO NÚT BẤM (CHỈ Ở MOBILE) */
            .action-scroll {
                display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
                white-space: nowrap; -webkit-overflow-scrolling: touch;
                scrollbar-width: none; /* Ẩn scrollbar trên Firefox */
                
                /* FIX LỖI TRÀN CARD & VUỐT MƯỢT CHẠM MÉP */
                margin: 0 -16px;
                padding: 0 16px 8px 16px;
                width: calc(100% + 32px);
            }
            .action-scroll::-webkit-scrollbar { display: none; } /* Ẩn scrollbar trên Chrome/Safari */
            
            .action-btn { flex-shrink: 0; } /* Không cho nút bị bóp méo khi vuốt */

            /* GRID 2 CỘT CHO DESKTOP */
            @media(min-width: 768px) {
                .tt-layout {
                    display: grid; grid-template-columns: 1fr 1fr;
                    grid-template-areas: "in out" "act act" "lor lor";
                    gap: 20px;
                }
                .tt-in { grid-area: in; } .tt-out { grid-area: out; }
                .tt-act { grid-area: act; } .tt-lor { grid-area: lor; }
                
                /* Bỏ cuộn ngang trên Desktop, cho rớt dòng bình thường */
                .action-scroll { 
                    flex-wrap: wrap; white-space: normal; overflow-x: visible; 
                    margin: 0; padding: 0; width: 100%; /* Reset cho Desktop */
                }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 16px;">
            <div>
                <h1 class="h1">AIO Text Tools</h1>
                <p class="text-mut">Bộ công cụ xử lý, trích xuất và so sánh văn bản an toàn.</p>
            </div>
        </div>

        <div class="tabs" id="aio-text-tabs" style="margin-bottom: 16px;">
            <button class="tab-btn active" data-target="tab-process"><i class="fas fa-magic"></i> Xử lý & Phân tích</button>
            <button class="tab-btn" data-target="tab-compare"><i class="fas fa-not-equal"></i> So sánh (Diff)</button>
        </div>

        <div class="tab-pane active" id="tab-process">
            
            <div class="tt-layout">
                
                <div class="card flex-between tt-lor" style="padding: 12px 16px; flex-wrap: wrap; gap: 12px; border-color: transparent; background: var(--bg-sec);">
                    <div class="flex-row" style="gap: 8px; font-weight: 500; font-size: 0.95rem; color: var(--text-main);">
                        <i class="fas fa-pen-nib text-mut"></i> Chèn Lorem Ipsum
                    </div>
                    
                    <div class="input-group" style="width: 100%; height: 40px; background: var(--bg-main); border-radius: var(--radius); border: 1px solid var(--border);">
                        <input type="number" id="lorem-count" value="3" min="1" max="1000" style="color: var(--text-main); width: 100%; border: none; background: transparent; padding: 8px; text-align: center; font-size: 0.85rem;" title="Số lượng">
                        <select id="lorem-type" class="btn btn-ghost" style=" width: 80%; padding: 0 8px; border-left: 1px solid var(--border); border-right: 1px solid var(--border); border-radius: 0; font-size: 0.85rem;">
                            <option value="p">Đoạn</option>
                            <option value="w">Từ</option>
                            <option value="c">Ký tự</option>
                        </select>
                        <button class="btn btn-primary" id="btn-lorem" style="border-radius: 0 var(--radius) var(--radius) 0; border: none; padding: 4px 12px; font-size: 0.85rem;">
                            <i class="fas fa-plus"></i> Chèn
                        </button>
                    </div>
                </div>

                <div class="card tt-in" style="padding: 0; display: flex; flex-direction: column; overflow: hidden;">
                    <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-sec);">
                        <div class="text-mut" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                            <i class="fas fa-keyboard"></i> Đầu vào (Input)
                        </div>
                        <div class="flex-row" style="gap: 2px;">
                            <button class="btn btn-ghost" id="btn-paste-in" title="Dán" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-paste"></i> Dán</button>
                            <button class="btn btn-ghost" id="btn-clear-all" title="Xóa sạch" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444;"><i class="fas fa-trash"></i> Xóa</button>
                        </div>
                    </div>
                    <textarea id="text-input" class="textarea" rows="8" 
                        style="border: none; border-radius: 0; flex: 1; padding: 12px; resize: vertical; line-height: 1.6; background: transparent; font-size: 0.95rem;" 
                        placeholder="Nhập hoặc dán văn bản gốc vào đây..."></textarea>
                    
                    <div class="flex-between" style="padding: 8px 12px; border-top: 1px solid var(--border); background: var(--bg-sec); color: var(--text-mut); font-size: 0.8rem;">
                        <div style="display: flex; gap: 12px;">
                            <span>Đoạn: <strong id="stat-para" style="color: var(--text-main);">0</strong></span>
                            <span>Từ: <strong id="stat-word" style="color: var(--text-main);">0</strong></span>
                            <span>Ký tự: <strong id="stat-char" style="color: var(--text-main);">0</strong></span>
                        </div>
                        <span class="desktop-only">Dòng: <strong id="stat-line" style="color: var(--text-main);">0</strong></span>
                    </div>
                </div>

                <div class="grid-2 tt-act" style="gap: 12px;">
                    <div class="card" style="padding: 12px 16px 8px; overflow: hidden; min-width: 0;">
                        <div style="font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: var(--text-mut); text-transform: uppercase;"><i class="fas fa-font"></i> Định dạng & Làm sạch</div>
                        <div class="action-scroll">
                            <button class="btn btn-outline btn-sm action-btn" data-action="upper">IN HOA</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="lower">in thường</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="capitalize">Hoa Từng Từ</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="sentence">Hoa đầu câu</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="trim-spaces">Xóa khoảng trắng</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="remove-empty-lines">Xóa dòng trống</button>
                        </div>
                    </div>
                    
                    <div class="card" style="padding: 12px 16px 8px; overflow: hidden; min-width: 0;">
                        <div style="font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: var(--text-mut); text-transform: uppercase;"><i class="fas fa-filter"></i> Trích xuất & Chuyển đổi</div>
                        <div class="action-scroll">
                            <button class="btn btn-outline btn-sm action-btn" data-action="extract-emails"><i class="fas fa-at"></i> Lọc Email</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="extract-links"><i class="fas fa-link"></i> Lọc Link</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="slugify">Tạo Slug</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="base64-encode">B64 Encode</button>
                            <button class="btn btn-outline btn-sm action-btn" data-action="base64-decode">B64 Decode</button>
                        </div>
                    </div>
                </div>

                <div class="card tt-out" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-sec); border-color: #3b82f640;">
                    <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-main);">
                        <div class="text-mut" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: #3b82f6;">
                            <i class="fas fa-poll-h"></i> Kết quả (Output)
                        </div>
                        <div class="flex-row" style="gap: 4px;">
                            <button class="btn btn-outline" id="btn-move-to-input" title="Dùng làm Input" style="padding: 4px 8px; font-size: 0.75rem;">
                                <i class="fas fa-arrow-up"></i> Tái sử dụng
                            </button>
                            <button class="btn btn-primary" id="btn-copy-out" style="padding: 4px 12px; font-size: 0.8rem;">
                                <i class="fas fa-copy"></i> Chép
                            </button>
                        </div>
                    </div>
                    <textarea id="text-output" class="textarea" rows="8" 
                        style="border: none; border-radius: 0; flex: 1; padding: 12px; resize: vertical; line-height: 1.6; background: transparent; cursor: text; font-size: 0.95rem;" 
                        placeholder="Kết quả sau khi xử lý sẽ hiển thị ở đây..." readonly></textarea>
                </div>

            </div> </div>

        <div class="tab-pane" id="tab-compare">
            <div class="card" style="margin-bottom: 24px; padding: 16px;">
                <p class="text-mut" style="margin-bottom: 12px; font-size: 0.9rem;">So sánh sự khác biệt từng dòng giữa 2 văn bản.</p>
                <div class="grid-2" style="margin-bottom: 12px; gap: 12px;">
                    <div style="border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;">
                        <div style="padding: 6px 12px; background: var(--bg-sec); border-bottom: 1px solid var(--border); font-size: 0.85rem; font-weight: 500;">Bản gốc (A)</div>
                        <textarea id="diff-1" class="textarea" rows="6" style="border: none; border-radius: 0; resize: vertical; font-size: 0.9rem;" placeholder="Dán văn bản gốc..."></textarea>
                    </div>
                    <div style="border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;">
                        <div style="padding: 6px 12px; background: var(--bg-sec); border-bottom: 1px solid var(--border); font-size: 0.85rem; font-weight: 500;">Bản sửa đổi (B)</div>
                        <textarea id="diff-2" class="textarea" rows="6" style="border: none; border-radius: 0; resize: vertical; font-size: 0.9rem;" placeholder="Dán văn bản đã sửa..."></textarea>
                    </div>
                </div>
                <button class="btn btn-primary" id="btn-compare" style="width: 100%; justify-content: center;"><i class="fas fa-play"></i> Thực hiện so sánh</button>
            </div>

            <div class="card" id="diff-result-wrap" style="display: none; padding: 16px;">
                <div class="h1" style="font-size: 1.05rem; margin-bottom: 12px;">Kết quả phân tích</div>
                <div id="diff-output" style="font-family: monospace; font-size: 0.85rem; line-height: 1.6; background: var(--bg-sec); padding: 12px; border-radius: var(--radius); overflow-x: auto; white-space: pre-wrap;"></div>
            </div>
        </div>
    `;
}

export function init() {
    // -----------------------------------------------------------------
    // 0. LOGIC CHUYỂN TAB
    // -----------------------------------------------------------------
    const tabs = document.querySelectorAll('#aio-text-tabs .tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // -----------------------------------------------------------------
    // 1. LOGIC XỬ LÝ VĂN BẢN (INPUT -> OUTPUT)
    // -----------------------------------------------------------------
    const input = document.getElementById('text-input');
    const output = document.getElementById('text-output');

    const statChar = document.getElementById('stat-char');
    const statWord = document.getElementById('stat-word');
    const statLine = document.getElementById('stat-line');
    const statPara = document.getElementById('stat-para');

    const updateStats = () => {
        const text = input.value;
        statChar.textContent = text.length;
        statWord.textContent = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        statLine.textContent = text.length === 0 ? 0 : text.split('\n').length;
        if (statPara) statPara.textContent = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    };

    input.addEventListener('input', updateStats);

    // Bộ máy xử lý
    const processAction = (actionType) => {
        if (!input.value) {
            output.value = '';
            return UI.showAlert('Trống', 'Vui lòng nhập văn bản vào cột Input.', 'warning');
        }

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const hasSelection = start !== end;

        let textToProcess = hasSelection ? input.value.substring(start, end) : input.value;
        let result = textToProcess;
        let isExtraction = false;

        try {
            switch (actionType) {
                // Định dạng
                case 'upper': result = textToProcess.toUpperCase(); break;
                case 'lower': result = textToProcess.toLowerCase(); break;
                case 'capitalize':
                    result = textToProcess.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase()); break;
                case 'sentence':
                    result = textToProcess.toLowerCase().replace(/(^\s*\w|[\.\!\?]\n*\s*\w)/g, c => c.toUpperCase()); break;
                case 'trim-spaces':
                    result = textToProcess.replace(/[ \t]+/g, ' ').replace(/^ /gm, '').replace(/ $/gm, ''); break;
                case 'remove-empty-lines':
                    result = textToProcess.replace(/^\s*[\r\n]/gm, ''); break;

                // Trích xuất & Chuyển đổi
                case 'slugify':
                    result = textToProcess.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''); break;
                case 'extract-emails':
                    const emails = textToProcess.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
                    result = emails ? [...new Set(emails)].join('\n') : ''; isExtraction = true;
                    if (!result) throw new Error('Không tìm thấy Email nào.'); break;
                case 'extract-links':
                    const links = textToProcess.match(/https?:\/\/[^\s]+/g);
                    result = links ? [...new Set(links)].join('\n') : ''; isExtraction = true;
                    if (!result) throw new Error('Không tìm thấy Link nào.'); break;
                case 'base64-encode':
                    result = btoa(unescape(encodeURIComponent(textToProcess))); break;
                case 'base64-decode':
                    result = decodeURIComponent(escape(atob(textToProcess))); break;
            }

            if (isExtraction) {
                output.value = result;
            } else {
                if (hasSelection) output.value = input.value.substring(0, start) + result + input.value.substring(end);
                else output.value = result;
            }

            UI.showAlert('Thành công', 'Kết quả đã hiển thị ở ô Output.', 'success');

            if (window.innerWidth <= 768) {
                setTimeout(() => { document.querySelector('.tt-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
            }
        } catch (err) {
            output.value = '';
            UI.showAlert('Lỗi', err.message || 'Dữ liệu không hợp lệ.', 'error');
        }
    };

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => processAction(e.target.dataset.action));
    });

    document.getElementById('btn-copy-out').onclick = async () => {
        if (!output.value) return UI.showAlert('Trống', 'Không có kết quả để sao chép.', 'warning');
        try {
            await navigator.clipboard.writeText(output.value);
            UI.showAlert('Đã chép', 'Kết quả đã được lưu.', 'success');
        } catch (e) { UI.showAlert('Lỗi', 'Bôi đen và Copy thủ công.', 'error'); }
    };

    document.getElementById('btn-paste-in').onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const start = input.selectionStart;
            input.value = input.value.substring(0, start) + text + input.value.substring(input.selectionEnd);
            updateStats();
        } catch (e) { UI.showAlert('Lỗi dán', 'Trình duyệt chặn, hãy ấn Ctrl+V vào ô Input.', 'error'); }
    };

    document.getElementById('btn-clear-all').onclick = () => {
        if (!input.value && !output.value) return;
        UI.showConfirm('Xóa sạch?', 'Cả Input và Output sẽ bị xóa hoàn toàn.', () => {
            input.value = ''; output.value = ''; updateStats(); input.focus();
        });
    };

    document.getElementById('btn-move-to-input').onclick = () => {
        if (!output.value) return UI.showAlert('Trống', 'Chưa có kết quả để chuyển.', 'warning');
        input.value = output.value; output.value = ''; updateStats();
        UI.showAlert('Đã tái sử dụng', 'Đã đẩy dữ liệu lên Input.', 'info');

        if (window.innerWidth <= 768) {
            document.querySelector('.tt-in').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // -----------------------------------------------------------------
    // 2. LOGIC LOREM IPSUM (Chèn vào Input)
    // -----------------------------------------------------------------
    document.getElementById('btn-lorem').onclick = () => {
        const count = parseInt(document.getElementById('lorem-count').value) || 1;
        const type = document.getElementById('lorem-type').value;
        const baseText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";

        let result = "";
        if (type === 'p') result = Array(count).fill(baseText.trim()).join('\n\n');
        else if (type === 'w') result = baseText.repeat(Math.ceil(count / 50)).split(' ').slice(0, count).join(' ');
        else if (type === 'c') result = baseText.repeat(Math.ceil(count / baseText.length)).substring(0, count);

        const start = input.selectionStart; const end = input.selectionEnd;
        input.value = input.value.substring(0, start) + result + input.value.substring(end);

        updateStats(); input.focus();
        UI.showAlert('Đã chèn', `Văn bản giả đã được thêm.`, 'success');

        if (window.innerWidth <= 768) {
            document.querySelector('.tt-in').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // -----------------------------------------------------------------
    // 3. LOGIC SO SÁNH (DIFF)
    // -----------------------------------------------------------------
    document.getElementById('btn-compare').onclick = () => {
        const text1 = document.getElementById('diff-1').value;
        const text2 = document.getElementById('diff-2').value;
        const outputDiff = document.getElementById('diff-output');
        const wrap = document.getElementById('diff-result-wrap');

        if (!text1 && !text2) return UI.showAlert('Trống', 'Vui lòng nhập văn bản vào cả 2 ô.', 'warning');

        wrap.style.display = 'block';

        const lines1 = text1.split('\n'); const lines2 = text2.split('\n');
        let diffHTML = ''; const maxLines = Math.max(lines1.length, lines2.length);
        const escapeHTML = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        for (let i = 0; i < maxLines; i++) {
            const l1 = lines1[i]; const l2 = lines2[i];

            if (l1 === l2) {
                diffHTML += `<div style="color: var(--text-mut)"><span style="display:inline-block;width:24px;opacity:0.5;">=</span> ${escapeHTML(l1)}</div>`;
            } else {
                if (l1 !== undefined) diffHTML += `<div style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 0;"><span style="display:inline-block;width:24px;font-weight:bold;">-</span> <del>${escapeHTML(l1)}</del></div>`;
                if (l2 !== undefined) diffHTML += `<div style="color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 0;"><span style="display:inline-block;width:24px;font-weight:bold;">+</span> ${escapeHTML(l2)}</div>`;
            }
        }
        outputDiff.innerHTML = diffHTML;

        if (window.innerWidth <= 768) {
            setTimeout(() => { wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
        }
    };
}