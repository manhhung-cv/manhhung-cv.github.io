import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .rx-widget { max-width: 900px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Khu vực nhập Regex (Pattern & Flags) */
            .rx-input-group { 
                display: flex; align-items: stretch; background: var(--bg-main); 
                border: 2px solid var(--border); border-radius: 12px; overflow: hidden;
                margin-bottom: 20px; transition: border-color 0.2s, box-shadow 0.2s;
            }
            .rx-input-group:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
            .rx-input-group.error { border-color: #ef4444; }
            
            .rx-slash { 
                background: var(--bg-sec); color: var(--text-mut); font-weight: 700; 
                font-size: 1.5rem; padding: 12px 16px; display: flex; align-items: center; 
                user-select: none; font-family: 'Courier New', Courier, monospace;
            }
            
            .rx-pattern-input { 
                flex: 1; border: none; background: transparent; padding: 12px; 
                font-size: 1.2rem; color: var(--text-main); outline: none; 
                font-family: 'Courier New', Courier, monospace; font-weight: 600;
            }
            .rx-pattern-input::placeholder { color: var(--text-mut); opacity: 0.4; font-weight: 400; }
            
            .rx-flags-input { 
                width: 80px; border: none; border-left: 1px solid var(--border); 
                background: transparent; padding: 12px; font-size: 1.2rem; color: #10b981; 
                outline: none; font-family: 'Courier New', Courier, monospace; font-weight: 600;
                text-align: center; letter-spacing: 2px;
            }

            /* Layout Test String & Output */
            .rx-split-view { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px; }
            @media (min-width: 768px) { .rx-split-view { grid-template-columns: 1fr 1fr; } }
            
            .rx-card { background: var(--bg-main); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
            .rx-card-header { background: var(--bg-sec); padding: 10px 16px; font-size: 0.85rem; font-weight: 600; color: var(--text-mut); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
            
            .rx-textarea { 
                width: 100%; height: 250px; border: none; padding: 16px; resize: none; 
                font-family: 'Courier New', Courier, monospace; font-size: 1rem; line-height: 1.6;
                color: var(--text-main); background: transparent; outline: none;
            }
            
            .rx-output { 
                width: 100%; height: 250px; padding: 16px; overflow-y: auto; 
                font-family: 'Courier New', Courier, monospace; font-size: 1rem; line-height: 1.6;
                color: var(--text-main); background: #1e1e1e; color: #d4d4d4; white-space: pre-wrap; word-wrap: break-word;
            }
            
            /* Highlight Mark */
            .rx-output mark { 
                background-color: rgba(59, 130, 246, 0.4); color: #fff; 
                border-radius: 3px; border-bottom: 2px solid #3b82f6;
                padding: 0 2px; margin: 0 -2px; /* Tránh text bị giật khi thêm padding */
                box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
            }
            /* Đổi màu luân phiên nếu match sát nhau */
            .rx-output mark:nth-child(even) { background-color: rgba(16, 185, 129, 0.4); border-bottom-color: #10b981; box-shadow: 0 0 4px rgba(16, 185, 129, 0.5); }

            /* Match Details List */
            .rx-details { padding: 16px; max-height: 200px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; }
            .rx-match-item { padding: 8px 12px; border-bottom: 1px dashed var(--border); display: flex; gap: 12px; align-items: baseline; }
            .rx-match-item:last-child { border-bottom: none; }
            .rx-match-badge { background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

            /* Cheatsheet / Quick Insert */
            .rx-cheatsheet { background: var(--bg-sec); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
            .rx-tag-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            .rx-tag { 
                background: var(--bg-main); border: 1px solid var(--border); padding: 6px 12px; 
                border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; 
                display: flex; align-items: center; gap: 6px; color: var(--text-main);
            }
            .rx-tag:hover { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
            .rx-tag code { font-family: monospace; color: #ef4444; font-weight: 600; }

        </style>

        <div class="rx-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Kiểm tra Regex</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Biểu thức chính quy & Highlight thời gian thực.</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-rx-clear" style="color: #ef4444;">
                    <i class="fas fa-trash-alt"></i> Xóa
                </button>
            </div>

            <div class="rx-input-group shadow-sm" id="rx-input-wrapper">
                <div class="rx-slash">/</div>
                <input type="text" class="rx-pattern-input" id="rx-pattern" placeholder="Nhập biểu thức (VD: \\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b)" value="\\d+">
                <div class="rx-slash">/</div>
                <input type="text" class="rx-flags-input" id="rx-flags" placeholder="gmi" value="gm" title="Flags (g: global, m: multiline, i: ignore case)">
            </div>
            <div id="rx-error-msg" style="color: #ef4444; font-size: 0.85rem; margin-top: -12px; margin-bottom: 16px; display: none;"><i class="fas fa-exclamation-triangle"></i> <span>Lỗi cú pháp</span></div>

            <div class="rx-split-view">
                
                <div class="rx-card shadow-sm">
                    <div class="rx-card-header">
                        <span>Văn bản cần kiểm tra</span>
                    </div>
                    <textarea class="rx-textarea" id="rx-text" spellcheck="false" placeholder="Nhập đoạn văn bản để kiểm thử Regex tại đây...">Tôi sinh năm 1995.
Email của tôi là admin@example.com và contact@company.vn.
Số điện thoại: 0901234567.
Giá sản phẩm là 250,000 VNĐ.</textarea>
                </div>

                <div class="rx-card shadow-sm">
                    <div class="rx-card-header" style="background: #2d2d2d; color: #aaa; border-color: #444;">
                        <span>Kết quả Highlight</span>
                        <span id="rx-match-count" style="color: #10b981;">0 matches</span>
                    </div>
                    <div class="rx-output" id="rx-output"></div>
                </div>

            </div>

            <div class="rx-card shadow-sm" style="margin-bottom: 20px;">
                <div class="rx-card-header">Danh sách trích xuất (Trích xuất các nhóm)</div>
                <div class="rx-details" id="rx-details">
                    <div class="text-mut" style="text-align: center; padding: 20px;">Không có kết quả.</div>
                </div>
            </div>

            <div class="rx-cheatsheet shadow-sm">
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;"><i class="fas fa-bolt" style="color: #f59e0b;"></i> Chèn nhanh Regex (Mẫu phổ biến)</div>
                <div class="rx-tag-group">
                    <button class="rx-tag" data-pattern="\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" data-flag="g"><code>Email</code> Địa chỉ Email</button>
                    <button class="rx-tag" data-pattern="(84|0[3|5|7|8|9])+([0-9]{8})\\b" data-flag="g"><code>Phone</code> Số điện thoại VN</button>
                    <button class="rx-tag" data-pattern="\\d+" data-flag="g"><code>\\d+</code> Các con số</button>
                    <button class="rx-tag" data-pattern="[A-Z][a-z]+" data-flag="g"><code>[A-Z]</code> Từ viết hoa chữ đầu</button>
                    <button class="rx-tag" data-pattern="<[^>]+>" data-flag="g"><code>&lt;...&gt;</code> Thẻ HTML</button>
                    <button class="rx-tag" data-pattern="\\b(https?:\\/\\/\\S+)" data-flag="gi"><code>URL</code> Đường dẫn Web</button>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- DOM ELEMENTS ---
    const inPattern = document.getElementById('rx-pattern');
    const inFlags = document.getElementById('rx-flags');
    const inText = document.getElementById('rx-text');
    const outDisplay = document.getElementById('rx-output');
    const matchCount = document.getElementById('rx-match-count');
    const detailsBox = document.getElementById('rx-details');
    
    const inputWrapper = document.getElementById('rx-input-wrapper');
    const errorMsg = document.getElementById('rx-error-msg');
    const btnClear = document.getElementById('btn-rx-clear');
    const insertTags = document.querySelectorAll('.rx-tag');

    // --- UTILS ---
    // Hàm escape HTML để in ra <div> một cách an toàn mà không bị trình duyệt render thẻ
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    };

    // --- CORE LOGIC ---
    const evaluateRegex = () => {
        const pattern = inPattern.value;
        const flags = inFlags.value;
        const text = inText.value;

        // Reset trạng thái
        inputWrapper.classList.remove('error');
        errorMsg.style.display = 'none';
        
        if (!pattern) {
            outDisplay.innerHTML = escapeHTML(text);
            matchCount.textContent = '0 matches';
            detailsBox.innerHTML = '<div class="text-mut" style="text-align: center; padding: 20px;">Vui lòng nhập biểu thức Regex.</div>';
            return;
        }

        let regex;
        try {
            // Cố gắng biên dịch regex
            regex = new RegExp(pattern, flags);
        } catch (e) {
            // Lỗi cú pháp Regex
            inputWrapper.classList.add('error');
            errorMsg.querySelector('span').textContent = e.message;
            errorMsg.style.display = 'block';
            outDisplay.innerHTML = escapeHTML(text);
            matchCount.textContent = 'Error';
            detailsBox.innerHTML = '';
            return;
        }

        // Logic Highlight
        let match;
        let resultHTML = "";
        let detailsHTML = "";
        let count = 0;
        let lastCursor = 0;

        const isGlobal = regex.global;
        // Bắt buộc reset lastIndex
        regex.lastIndex = 0; 
        
        // Cảnh báo chống treo trình duyệt (Giới hạn tối đa 2000 matches)
        const MAX_MATCHES = 2000;

        while ((match = regex.exec(text)) !== null) {
            count++;
            
            // Xử lý Highlight HTML
            // 1. Text bình thường phía trước Match (Escape an toàn)
            resultHTML += escapeHTML(text.substring(lastCursor, match.index));
            // 2. Wrap Match vào thẻ <mark> (Cũng escape đoạn match an toàn)
            resultHTML += `<mark>${escapeHTML(match[0])}</mark>`;
            
            lastCursor = regex.lastIndex;

            // Xử lý List trích xuất chi tiết
            if (count <= 100) { // Giới hạn chỉ render 100 chi tiết để nhẹ DOM
                let groupsHtml = '';
                // Nếu có Capture Groups (ví dụ match[1], match[2]...)
                if (match.length > 1) {
                    for(let i = 1; i < match.length; i++) {
                        if(match[i] !== undefined) {
                            groupsHtml += `<span style="color:#10b981; margin-left:8px; font-size:0.8rem;">Group ${i}: "${escapeHTML(match[i])}"</span>`;
                        }
                    }
                }
                detailsHTML += `
                    <div class="rx-match-item">
                        <div class="rx-match-badge">#${count}</div>
                        <div style="flex:1;">
                            <span style="color:var(--text-mut);">Index ${match.index}:</span> 
                            <span style="color:var(--text-main); font-weight:600;">"${escapeHTML(match[0])}"</span>
                            ${groupsHtml}
                        </div>
                    </div>`;
            }

            // Chống lặp vô hạn nếu Regex match với chuỗi rỗng (zero-length match như ^, $)
            if (!isGlobal) break;
            if (regex.lastIndex === match.index) regex.lastIndex++;
            if (count > MAX_MATCHES) {
                detailsHTML += `<div class="text-mut" style="padding:12px;">Đã đạt giới hạn hiển thị ${MAX_MATCHES} kết quả.</div>`;
                break; 
            }
        }

        // Gắn nốt phần text còn lại sau Match cuối cùng
        resultHTML += escapeHTML(text.substring(lastCursor));

        // Cập nhật DOM
        outDisplay.innerHTML = resultHTML || escapeHTML(text);
        matchCount.textContent = `${count} matches`;
        matchCount.style.color = count > 0 ? '#10b981' : '#ef4444';
        
        if (count === 0) {
            detailsBox.innerHTML = '<div class="text-mut" style="text-align: center; padding: 20px;">Không có kết quả trùng khớp.</div>';
        } else {
            detailsBox.innerHTML = detailsHTML;
        }
    };

    // --- EVENT LISTENERS ---
    
    // Auto-calculate khi gõ
    inPattern.addEventListener('input', evaluateRegex);
    inFlags.addEventListener('input', evaluateRegex);
    inText.addEventListener('input', evaluateRegex);

    // Xử lý cuộn đồng bộ (Tùy chọn: nếu muốn màn hình highlight tự cuộn theo Textarea)
    inText.addEventListener('scroll', () => {
        // Tỷ lệ phần trăm cuộn
        const percentage = inText.scrollTop / (inText.scrollHeight - inText.clientHeight);
        outDisplay.scrollTop = percentage * (outDisplay.scrollHeight - outDisplay.clientHeight);
    });

    // Nút Clear
    btnClear.addEventListener('click', () => {
        inPattern.value = '';
        inText.value = '';
        inText.focus();
        evaluateRegex();
    });

    // Các thẻ Cheatsheet bấm để điền nhanh
    insertTags.forEach(tag => {
        tag.addEventListener('click', () => {
            inPattern.value = tag.dataset.pattern;
            inFlags.value = tag.dataset.flag;
            evaluateRegex();
            // Highlight viền nhẹ để user biết vừa chèn
            inputWrapper.style.transform = 'scale(1.02)';
            setTimeout(() => inputWrapper.style.transform = 'scale(1)', 150);
        });
    });

    // Khởi chạy lần đầu
    evaluateRegex();
}