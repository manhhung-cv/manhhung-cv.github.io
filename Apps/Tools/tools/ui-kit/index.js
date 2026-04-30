import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Nút bấm Premium */
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            /* Toggle Switch Phẳng */
            .toggle-premium { appearance: none; width: 40px; height: 22px; background: #e4e4e7; border-radius: 11px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; flex-shrink: 0; }
            .dark .toggle-premium { background: #27272a; }
            .toggle-premium::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .toggle-premium:checked { background: #18181b; }
            .dark .toggle-premium:checked { background: #fff; }
            .toggle-premium:checked::after { transform: translateX(18px); background: #fff; }
            .dark .toggle-premium:checked::after { background: #18181b; }

            /* Range Slider Phẳng */
            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
            .flat-range::-webkit-slider-runnable-track { height: 6px; background: #e4e4e7; border-radius: 3px; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #18181b; margin-top: -6px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }

            /* Custom Checkbox */
            .chk-premium { appearance: none; width: 22px; height: 22px; border: 2px solid #d4d4d8; border-radius: 6px; position: relative; cursor: pointer; transition: all 0.2s; background: transparent; flex-shrink: 0; }
            .dark .chk-premium { border-color: #3f3f46; }
            .chk-premium:checked { background: #18181b; border-color: #18181b; }
            .dark .chk-premium:checked { background: #fff; border-color: #fff; }
            .chk-premium:checked::after { content: ''; position: absolute; left: 6px; top: 2px; width: 6px; height: 12px; border: solid #fff; border-width: 0 2.5px 2.5px 0; transform: rotate(45deg); }
            .dark .chk-premium:checked::after { border-color: #18181b; }

            /* Custom Radio */
            .rad-premium { appearance: none; width: 22px; height: 22px; border: 2px solid #d4d4d8; border-radius: 50%; position: relative; cursor: pointer; transition: all 0.2s; background: transparent; flex-shrink: 0; }
            .dark .rad-premium { border-color: #3f3f46; }
            .rad-premium:checked { border-color: #18181b; border-width: 6px; }
            .dark .rad-premium:checked { border-color: #fff; border-width: 6px; }

            /* Animation */
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Copy Code Overlay */
            .ui-block { position: relative; }
            .btn-copy-code { position: absolute; top: 16px; right: 16px; opacity: 0; transition: opacity 0.2s; z-index: 10; }
            .ui-block:hover .btn-copy-code { opacity: 1; }
            @media (max-width: 768px) { .btn-copy-code { opacity: 1; } }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">UI Components Kit</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Thư viện giao diện Flat & Minimal tổng hợp. Đã đồng bộ chuẩn thiết kế toàn hệ thống.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <div class="space-y-6">
                    
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy JS Code"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">1. Dynamic Modal & Alerts</h3>
                        
                        <div class="code-source" data-name="Alerts">
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <button id="test-alert-success" class="btn-premium flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                    <i class="fas fa-check-circle text-xl"></i>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">Success</span>
                                </button>
                                <button id="test-alert-error" class="btn-premium flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
                                    <i class="fas fa-exclamation-triangle text-xl"></i>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">Error</span>
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <button id="test-alert-info" class="btn-premium flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
                                    <i class="fas fa-info-circle text-xl"></i>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">Info</span>
                                </button>
                                <button id="test-modal" class="btn-premium flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                                    <i class="fas fa-window-restore text-xl"></i>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">Mở Modal</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy HTML"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">2. Buttons (Nút bấm)</h3>
                        
                        <div class="code-source flex flex-col gap-3" data-name="Buttons">
                            <button class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase">
                                Primary Button
                            </button>
                            <div class="flex gap-3">
                                <button class="btn-premium flex-1 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
                                    Outline
                                </button>
                                <button class="btn-premium flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm">
                                    Secondary
                                </button>
                            </div>
                            <div class="flex gap-3">
                                <button class="btn-premium flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2">
                                    <i class="fas fa-download"></i> Icon Left
                                </button>
                                <button class="btn-premium flex-1 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm flex items-center justify-center gap-2">
                                    Icon Right <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy HTML"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">4. Nhóm Input liên kết</h3>
                        
                        <div class="code-source space-y-4" data-name="Input Groups">
                            <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow">
                                <i class="fas fa-link text-zinc-400 ml-3 text-sm"></i>
                                <input type="text" class="w-full bg-transparent border-none outline-none px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-white" value="https://my-aio-tools.com" readonly>
                                <button class="btn-premium bg-zinc-900 dark:bg-white px-5 py-2.5 rounded-xl text-xs font-bold text-white dark:text-zinc-900 whitespace-nowrap">Copy</button>
                            </div>

                            <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow">
                                <button class="btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 w-10 h-10 rounded-xl text-zinc-500 flex items-center justify-center"><i class="fas fa-filter"></i></button>
                                <input type="text" class="w-full bg-transparent border-none outline-none px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400" placeholder="Từ khóa...">
                                <button class="btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">Tìm</button>
                            </div>

                            <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-shadow">
                                <input type="number" class="w-full bg-transparent border-none outline-none px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white text-center" placeholder="Rộng">
                                <i class="fas fa-times text-zinc-400 text-xs px-2"></i>
                                <input type="number" class="w-full bg-transparent border-none outline-none px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white text-center" placeholder="Cao">
                                <button class="btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">Áp dụng</button>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="space-y-6">
                    
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy HTML"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">3. Forms & Controls</h3>
                        
                        <div class="code-source space-y-5" data-name="Forms">
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Email & Mật khẩu</label>
                                <input type="email" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 mb-3 placeholder-zinc-400" placeholder="name@example.com">
                                <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-3"></div>
                                <input type="password" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 placeholder-zinc-400" placeholder="••••••••">
                            </div>

                            <div class="flex gap-3">
                                <div class="flex-1 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-3">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Ngày tháng</label>
                                    <input type="date" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                                </div>
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-3 flex flex-col items-center">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Màu</label>
                                    <input type="color" value="#000000" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0">
                                </div>
                            </div>

                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300">Cài đặt nâng cao (Toggle)</span>
                                    <input type="checkbox" class="toggle-premium" checked>
                                </div>
                                
                                <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>
                                
                                <label class="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" class="chk-premium" checked>
                                    <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Ghi nhớ đăng nhập (Checkbox)</span>
                                </label>
                                
                                <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>

                                <div class="flex gap-6">
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="demo-rad" class="rad-premium" checked>
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Lựa chọn 1</span>
                                    </label>
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="demo-rad" class="rad-premium">
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Lựa chọn 2</span>
                                    </label>
                                </div>

                                <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>

                                <div class="range-wrapper">
                                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                                        <span>Độ mờ (Opacity)</span>
                                        <span class="range-value text-zinc-900 dark:text-white">50%</span>
                                    </div>
                                    <input type="range" class="range flat-range" min="0" max="100" value="50">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy HTML"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">5. Tabs & Data</h3>
                        
                        <div class="code-source" data-name="Tabs">
                            <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-4" id="ui-kit-tabs">
                                <button class="tab-btn active btn-premium px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-target="tab-table">Bảng dữ liệu</button>
                                <button class="tab-btn btn-premium px-5 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-800" data-target="tab-text">Văn bản</button>
                            </div>
                            
                            <div class="tab-pane block animate-in fade-in" id="tab-table">
                                <div class="w-full overflow-x-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <table class="w-full text-left border-collapse">
                                        <thead>
                                            <tr class="bg-zinc-50 dark:bg-zinc-800/50">
                                                <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tính năng</th>
                                                <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Trạng thái</th>
                                                <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Tác vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody class="text-sm font-medium text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-800">
                                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                <td class="p-3">Format JSON</td>
                                                <td class="p-3 text-center"><span class="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-md">Active</span></td>
                                                <td class="p-3 text-right"><button class="btn-premium text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><i class="fas fa-edit"></i></button></td>
                                            </tr>
                                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                <td class="p-3">Base64 Encode</td>
                                                <td class="p-3 text-center"><span class="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase rounded-md">Error</span></td>
                                                <td class="p-3 text-right"><button class="btn-premium text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><i class="fas fa-edit"></i></button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="tab-pane hidden animate-in fade-in" id="tab-text">
                                <textarea class="w-full bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 outline-none text-sm font-medium text-zinc-900 dark:text-white resize-y min-h-[120px] custom-scrollbar placeholder-zinc-400" placeholder="Nhập văn bản vào đây..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <button class="btn-copy-code btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center" title="Copy HTML"><i class="far fa-copy text-xs"></i></button>
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">6. Media Overlay Controls</h3>
                        
                        <div class="code-source grid grid-cols-2 gap-4" data-name="Media Controls">
                            <div class="media-box-control relative rounded-2xl overflow-hidden group aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" alt="Code" class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button class="media-btn btn-premium w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black"><i class="fas fa-expand"></i></button>
                                </div>
                                <div class="absolute bottom-2 left-3 right-3 text-[10px] font-bold text-white truncate drop-shadow-md"><i class="fas fa-image mr-1"></i> cover_image.jpg</div>
                            </div>

                            <div class="media-box-control relative rounded-2xl overflow-hidden group aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <video loop muted playsinline class="w-full h-full object-cover">
                                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                                </video>
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button class="media-btn btn-play btn-premium w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black"><i class="fas fa-play text-xs"></i></button>
                                    <button class="media-btn btn-mute btn-premium w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black"><i class="fas fa-volume-mute text-xs"></i></button>
                                </div>
                                <div class="absolute bottom-2 left-3 right-3 text-[10px] font-bold text-white truncate drop-shadow-md"><i class="fas fa-video mr-1"></i> sample_video.mp4</div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // ----------------------------------------------------
    // COPY CODE LOGIC
    // ----------------------------------------------------
    const copyBtns = document.querySelectorAll('.btn-copy-code');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const sourceBlock = btn.closest('.ui-block').querySelector('.code-source');
            if (!sourceBlock) return;

            // Xử lý riêng cho block Alert (Copy mã JS)
            if (sourceBlock.dataset.name === 'Alerts') {
                const jsCode = `
// Success Alert
UI.showAlert('Thành công', 'Hệ thống giao diện mới đã được áp dụng hoàn hảo.', 'success');

// Error Alert
UI.showAlert('Lỗi hệ thống', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', 'error');

// Info Alert
UI.showAlert('Cập nhật trạng thái', 'Giao diện đang được render dưới nền, vui lòng đợi.', 'info');

// Confirm Modal
UI.showConfirm(
    'Xác nhận hành động?',
    'Bạn đang chuẩn bị xóa toàn bộ cấu hình mặc định. Hành động này không thể hoàn tác, bạn có muốn tiếp tục không?',
    () => {
        UI.showAlert('Đã xóa', 'Toàn bộ cấu hình đã được khôi phục.', 'success');
    }
);`.trim();
                try {
                    await navigator.clipboard.writeText(jsCode);
                    UI.showAlert('Đã chép JS', 'Mã JavaScript đã được sao chép.', 'success');
                } catch (e) {
                    UI.showAlert('Lỗi', 'Không thể sao chép.', 'error');
                }
                return;
            }

            // Copy HTML cho các block khác
            let htmlCode = sourceBlock.innerHTML.trim();
            // Lọc bỏ style rác do JS sinh ra nếu có
            htmlCode = htmlCode.replace(/ style="[^"]*"/g, ""); 

            try {
                await navigator.clipboard.writeText(htmlCode);
                UI.showAlert('Đã chép HTML', `Mã HTML của [${sourceBlock.dataset.name}] đã lưu vào Clipboard.`, 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
            }
        });
    });

    // ----------------------------------------------------
    // LOGIC CHO ALERTS
    // ----------------------------------------------------
    const btnSuccess = document.getElementById('test-alert-success');
    if (btnSuccess) btnSuccess.onclick = () => {
        UI.showAlert('Thành công', 'Hệ thống giao diện mới đã được áp dụng hoàn hảo.', 'success');
    };
    
    const btnError = document.getElementById('test-alert-error');
    if (btnError) btnError.onclick = () => {
        UI.showAlert('Lỗi hệ thống', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', 'error');
    };

    const btnInfo = document.getElementById('test-alert-info');
    if (btnInfo) btnInfo.onclick = () => {
        UI.showAlert('Cập nhật trạng thái', 'Giao diện đang được render dưới nền, vui lòng đợi.', 'info');
    };

    // ----------------------------------------------------
    // LOGIC CHO MODAL XÁC NHẬN
    // ----------------------------------------------------
    const btnModal = document.getElementById('test-modal');
    if (btnModal) btnModal.onclick = () => {
        UI.showConfirm(
            'Xác nhận hành động?',
            'Bạn đang chuẩn bị xóa toàn bộ cấu hình mặc định. Hành động này không thể hoàn tác, bạn có muốn tiếp tục không?',
            () => {
                UI.showAlert('Đã xóa', 'Toàn bộ cấu hình đã được khôi phục.', 'success');
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
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            });
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.remove('bg-transparent', 'text-zinc-500', 'border', 'border-zinc-200', 'dark:border-zinc-800');
            
            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('block');
            }
        });
    });

    // ----------------------------------------------------
    // LOGIC CHO RANGE SLIDER
    // ----------------------------------------------------
    const rangeInputs = document.querySelectorAll('.range-wrapper');
    rangeInputs.forEach(wrapper => {
        const range = wrapper.querySelector('.range');
        const valueSpan = wrapper.querySelector('.range-value');
        
        if (range && valueSpan) {
            range.addEventListener('input', (e) => {
                valueSpan.textContent = `${e.target.value}%`;
            });
        }
    });

    if(typeof UI.initMediaControls === 'function') {
        UI.initMediaControls();
    }
    
    console.log("Premium UI Kit Components Fully Loaded!");
}