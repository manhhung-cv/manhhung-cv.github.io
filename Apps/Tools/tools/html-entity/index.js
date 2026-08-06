import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Kế thừa Scrollbar và Animation từ UI Kit */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            
            .ui-block { position: relative; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <!-- Header -->
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Entity Encoder / Decoder</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Chuyển đổi ký tự đặc biệt sang HTML Entities và ngược lại một cách an toàn.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Input Block -->
                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Đầu vào (Input)</h3>
                        <button id="btn-clear" class="btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:text-red-500 dark:hover:text-red-400" title="Xóa dữ liệu"><i class="fas fa-trash-alt text-xs"></i></button>
                    </div>
                    
                    <textarea id="entity-input" class="w-full flex-1 min-h-[250px] bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-y custom-scrollbar placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow" placeholder="Nhập văn bản hoặc mã HTML cần chuyển đổi..."></textarea>
                    
                    <div class="flex gap-3 mt-4">
                        <button id="btn-encode" class="btn-premium flex-1 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                            <i class="fas fa-code"></i> Encode
                        </button>
                        <button id="btn-decode" class="btn-premium flex-1 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <i class="fas fa-file-code"></i> Decode
                        </button>
                    </div>
                </div>

                <!-- Output Block -->
                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Kết quả (Output)</h3>
                        <button id="btn-copy" class="btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:text-emerald-600 dark:hover:text-emerald-400" title="Copy kết quả"><i class="far fa-copy text-xs"></i></button>
                    </div>
                    
                    <textarea id="entity-output" class="w-full flex-1 min-h-[250px] bg-zinc-50 dark:bg-[#121214]/50 border border-transparent rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-y custom-scrollbar placeholder-zinc-400/50" placeholder="Kết quả sẽ hiển thị ở đây..." readonly></textarea>
                    
                    <div class="mt-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-3 flex items-center gap-3 border border-zinc-100 dark:border-zinc-800/50">
                        <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="flex-1">
                            <p id="status-text" class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Đang chờ thao tác</p>
                            <p class="text-[10px] text-zinc-400 font-medium mt-0.5">Hệ thống hỗ trợ xử lý mã an toàn, không chạy các script độc hại.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const inputEl = document.getElementById('entity-input');
    const outputEl = document.getElementById('entity-output');
    const btnEncode = document.getElementById('btn-encode');
    const btnDecode = document.getElementById('btn-decode');
    const btnClear = document.getElementById('btn-clear');
    const btnCopy = document.getElementById('btn-copy');
    const statusText = document.getElementById('status-text');

    // Hàm an toàn để Encode HTML
    const encodeHTML = (str) => {
        return str.replace(/[\u00A0-\u9999<>\&"']/g, (i) => {
            return '&#' + i.charCodeAt(0) + ';';
        });
    };

    // Hàm an toàn để Decode HTML (Sử dụng DOMParser để tránh XSS so với innerHTML trực tiếp)
    const decodeHTML = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.documentElement.textContent;
    };

    // Cập nhật trạng thái hiển thị
    const updateStatus = (message, isSuccess = true) => {
        statusText.textContent = message;
        statusText.classList.remove('text-zinc-500', 'text-emerald-500', 'text-red-500');
        statusText.classList.add(isSuccess ? 'text-emerald-500' : 'text-red-500');
        
        setTimeout(() => {
            statusText.textContent = 'Sẵn sàng';
            statusText.classList.remove('text-emerald-500', 'text-red-500');
            statusText.classList.add('text-zinc-500');
        }, 3000);
    };

    // Nút Encode
    btnEncode.addEventListener('click', () => {
        const val = inputEl.value;
        if (!val.trim()) {
            UI.showAlert('Cảnh báo', 'Vui lòng nhập dữ liệu vào ô đầu vào.', 'error');
            return;
        }
        outputEl.value = encodeHTML(val);
        updateStatus('Đã mã hóa (Encode) thành công');
        UI.showAlert('Thành công', 'Văn bản đã được chuyển đổi sang Entities.', 'success');
    });

    // Nút Decode
    btnDecode.addEventListener('click', () => {
        const val = inputEl.value;
        if (!val.trim()) {
            UI.showAlert('Cảnh báo', 'Vui lòng nhập dữ liệu vào ô đầu vào.', 'error');
            return;
        }
        outputEl.value = decodeHTML(val);
        updateStatus('Đã giải mã (Decode) thành công');
        UI.showAlert('Thành công', 'Entities đã được khôi phục thành văn bản gốc.', 'success');
    });

    // Nút Copy
    btnCopy.addEventListener('click', async () => {
        const val = outputEl.value;
        if (!val) {
            UI.showAlert('Cảnh báo', 'Không có dữ liệu đầu ra để copy.', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(val);
            updateStatus('Đã sao chép vào Clipboard');
            UI.showAlert('Đã chép', 'Kết quả đã được sao chép vào Clipboard.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt của bạn không hỗ trợ sao chép.', 'error');
        }
    });

    // Nút Xóa
    btnClear.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        inputEl.focus();
        updateStatus('Đã xóa dữ liệu');
    });
}