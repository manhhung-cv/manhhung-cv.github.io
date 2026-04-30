import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .btn-premium { transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            .is-dragging { border-color: #18181b !important; background-color: rgba(24, 24, 27, 0.05) !important; }
            .dark .is-dragging { border-color: #ffffff !important; background-color: rgba(255, 255, 255, 0.05) !important; }

            @keyframes spin-flat { to { transform: rotate(360deg); } }
            .spinner-flat { width: 18px; height: 18px; border: 2px solid var(--tw-ring-color, #e4e4e7); border-top-color: #18181b; border-radius: 50%; animation: spin-flat 0.8s linear infinite; }
            .dark .spinner-flat { border-color: #27272a; border-top-color: #ffffff; }

            /* Thumbnail & Selection Grid Styles */
            .thumb-card { position: relative; border-radius: 12px; overflow: hidden; border: 2px solid transparent; transition: all 0.2s; cursor: pointer; user-select: none; background: #f4f4f5; }
            .dark .thumb-card { background: #27272a; }
            .thumb-card img { width: 100%; height: auto; display: block; object-fit: contain; pointer-events: none; }
            .thumb-card .page-num { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; backdrop-filter: blur(4px); pointer-events: none; }
            
            .thumb-card.selected { border-color: #3b82f6; }
            .thumb-card.selected::after { content: '\\f00c'; font-family: 'Font Awesome 5 Free'; font-weight: 900; position: absolute; top: 4px; right: 4px; background: #3b82f6; color: white; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 10px; }

            /* Organize Drag State */
            .org-card { cursor: grab; }
            .org-card:active { cursor: grabbing; }
            .org-card.dragging { opacity: 0.5; border: 2px dashed #a1a1aa; }
            .org-del { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(239,68,68,0.9); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; opacity: 0; transition: opacity 0.2s; }
            .org-card:hover .org-del { opacity: 1; }

            /* Workspace (Sign & Watermark) */
            .preview-workspace { position: relative; background: #fff; border: 1px solid #e4e4e7; border-radius: 8px; display: inline-block; user-select: none; touch-action: none; overflow: hidden; width: 100%; max-width: 600px; }
            .dark .preview-workspace { border-color: #3f3f46; background: #e4e4e7; }
            .preview-workspace img.bg-page { display: block; width: 100%; height: auto; pointer-events: none; }
            .drag-element { position: absolute; cursor: move; border: 1px dashed #3b82f6; padding: 2px; transform: translate(-50%, -50%); z-index: 10; transform-origin: center center; display: flex; align-items: center; justify-content: center; }
            .drag-element::after { content: ''; position: absolute; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; bottom: -5px; right: -5px; pointer-events: none;}
            .drag-element img { display: block; width: 100%; height: auto; pointer-events: none; }
            .drag-element span { font-weight: bold; pointer-events: none; white-space: nowrap; line-height: 1; }
            
            /* Flat Range */
            .flat-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
            .flat-range::-webkit-slider-runnable-track { height: 6px; background: #e4e4e7; border-radius: 3px; }
            .dark .flat-range::-webkit-slider-runnable-track { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #18181b; margin-top: -5px; border: 2px solid #fff; }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }
        </style>

        <div class="relative flex flex-col w-full max-w-[960px] mx-auto min-h-[600px]">
            
            <div class="mb-6 px-2 flex justify-between items-center">
                <div>
                    <h2 class="text-[22px] font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1">PDF Studio Pro</h2>
                    <p class="text-[13px] text-zinc-500 font-medium">Bảo mật tuyệt đối. Trực quan với Thumbnail & Kéo thả định vị.</p>
                </div>
                <button id="btn-pdf-clear" class="btn-premium h-9 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-[12px] flex items-center justify-center gap-1.5 hidden">
                    <i class="fas fa-trash-alt"></i> Xóa File
                </button>
            </div>

            <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-6 px-2 pb-2" id="pdf-tabs">
                <button class="pdf-tab active btn-premium px-4 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold whitespace-nowrap shrink-0" data-target="pane-merge"><i class="fas fa-layer-group mr-1.5"></i>Ghép PDF</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-split"><i class="fas fa-cut mr-1.5"></i>Tách PDF</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-compress"><i class="fas fa-compress mr-1.5"></i>Nén PDF</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-sign"><i class="fas fa-signature mr-1.5"></i>Ký PDF</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-convert"><i class="fas fa-exchange-alt mr-1.5"></i>Chuyển đổi</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-extract"><i class="fas fa-images mr-1.5"></i>Xuất Hình</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-organize"><i class="fas fa-sort-numeric-down mr-1.5"></i>Sắp xếp</button>
                <button class="pdf-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[11px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white" data-target="pane-watermark"><i class="fas fa-stamp mr-1.5"></i>Watermark</button>
            </div>

            <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 min-h-[400px]">
                
                <div id="global-dropzone" class="relative w-full min-h-[160px] bg-zinc-50 dark:bg-zinc-800/30 rounded-[24px] border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center transition-colors mb-5 group cursor-pointer overflow-hidden">
                    <input type="file" id="global-file-input" accept="application/pdf" class="hidden">
                    
                    <div class="flex flex-col items-center text-zinc-400 group-active:scale-95 transition-transform z-10" id="dz-idle">
                        <div class="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mb-2">
                            <i class="fas fa-file-upload text-lg"></i>
                        </div>
                        <span class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Chọn file PDF</span>
                        <span class="text-[10px] font-medium">Kéo thả hoặc chạm vào đây</span>
                    </div>

                    <div class="hidden flex-col items-center w-full px-6 gap-3 z-10 py-4" id="dz-loading">
                        <div class="spinner-flat"></div>
                        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest" id="dz-loading-text">Đang phân tích trang...</span>
                    </div>

                    <div class="hidden flex-row items-center justify-center w-full px-6 gap-6 z-10 py-4" id="dz-info">
                        <div class="w-20 h-28 bg-white border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                            <canvas id="dz-preview-canvas" class="w-full h-full object-cover"></canvas>
                        </div>
                        <div class="flex flex-col flex-1 min-w-0">
                            <span class="text-sm font-bold text-zinc-900 dark:text-white mb-1 truncate" id="dz-filename">filename.pdf</span>
                            <div class="flex gap-2 mt-1">
                                <span class="text-[10px] font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded" id="dz-filesize">-- MB</span>
                                <span class="text-[10px] font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded" id="dz-pagecount">-- Trang</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="pane-merge" class="pdf-pane block animate-in fade-in">
                    <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 mb-4">
                        <div class="flex justify-between items-center mb-3 px-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Danh sách File (Kéo đổi thứ tự)</span>
                            <button id="btn-merge-add" class="btn-premium text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">Thêm File</button>
                        </div>
                        <div id="merge-list" class="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div class="text-center text-[10px] font-medium text-zinc-400 py-6 opacity-50" id="merge-empty">Hãy thêm ít nhất 2 file.</div>
                        </div>
                    </div>
                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="merge" disabled>GHÉP NỐI PDF</button>
                </div>

                <div id="pane-split" class="pdf-pane hidden animate-in fade-in">
                    <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 mb-4 space-y-4">
                        
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chọn trang cần tách (<span id="split-selected-count" class="text-blue-500">0</span>)</span>
                            <div class="flex gap-1.5 overflow-x-auto hide-scrollbar">
                                <button id="sel-all" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Tất cả</button>
                                <button id="sel-odd" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Trang lẻ</button>
                                <button id="sel-even" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Trang chẵn</button>
                                <button id="sel-clear" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Bỏ chọn</button>
                            </div>
                        </div>
                        
                        <div>
                            <select id="split-mode" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none text-xs font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer mb-2" disabled>
                                <option value="range">Gộp các trang đã chọn thành 1 file mới</option>
                                <option value="burst">Tách mỗi trang đã chọn thành 1 file riêng (.zip)</option>
                            </select>
                        </div>

                        <div id="split-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                            <div class="col-span-full text-center text-[10px] font-medium text-zinc-400 py-6 opacity-50">Vui lòng tải file PDF lên trước.</div>
                        </div>
                    </div>
                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="split" disabled>TÁCH VÀ TẢI XUỐNG</button>
                </div>

                <div id="pane-compress" class="pdf-pane hidden animate-in fade-in">
                    <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-5 mb-4 text-[12px] font-medium text-blue-700 dark:text-blue-300 text-center flex flex-col items-center gap-3">
                        <i class="fas fa-tools text-3xl"></i>
                        <span>Tính năng nén Client-side đang được phát triển để tối ưu hóa thuật toán giảm dung lượng hình ảnh mà không cần máy chủ. Cảm ơn bạn đã chờ đợi!</span>
                    </div>
                    <button class="btn-premium w-full py-4 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-black text-sm tracking-widest uppercase cursor-not-allowed" disabled>ĐANG PHÁT TRIỂN</button>
                </div>

                <div id="pane-sign" class="pdf-pane hidden animate-in fade-in">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="md:col-span-1 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer group h-[120px]" id="sign-img-upload">
                            <input type="file" id="sign-file" accept="image/*" class="hidden">
                            <i class="fas fa-signature text-xl text-zinc-400 mb-1 group-active:scale-90 transition-transform"></i>
                            <span class="text-[10px] font-bold text-zinc-500 text-center">Tải ảnh chữ ký<br>(Mọi định dạng)</span>
                            <img id="sign-preview" class="hidden w-full h-full object-contain">
                        </div>
                        <div class="md:col-span-2 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 flex flex-col justify-center">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Trang cần ký</label>
                            <select id="sign-page-select" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer" disabled>
                                <option value="">Đang tải...</option>
                            </select>
                            <div class="flex items-center gap-2 mt-3">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cỡ chữ ký (<span id="val-sign-size">30</span>%)</span>
                                <input type="range" id="sign-size" min="5" max="100" value="30" class="flat-range flex-1" disabled>
                            </div>
                        </div>
                    </div>
                    
                    <div class="w-full bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 mb-4 flex flex-col items-center">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Xem trước (Kéo thả định vị chữ ký)</span>
                        <div id="sign-workspace" class="preview-workspace hidden" style="max-width: 500px;">
                            <img id="sign-bg-page" class="bg-page">
                            <div id="sign-draggable" class="drag-element hidden" style="width: 30%;">
                                <img id="sign-drag-img" src="">
                            </div>
                        </div>
                        <div id="sign-ws-empty" class="text-[10px] text-zinc-400 opacity-50 py-10">Vui lòng tải PDF và chữ ký.</div>
                    </div>

                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="sign" disabled>ĐÓNG DẤU CHỮ KÝ</button>
                </div>

                <div id="pane-convert" class="pdf-pane hidden animate-in fade-in">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Định dạng xuất</label>
                            <select id="conv-format" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer">
                                <option value="jpg">Ảnh JPG (.zip)</option>
                                <option value="png">Ảnh PNG (.zip)</option>
                            </select>
                        </div>
                        <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Lựa chọn trang</label>
                            <select id="conv-mode" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer" disabled>
                                <option value="all">Tất cả các trang</option>
                                <option value="odd">Chỉ các trang Lẻ (1,3,5...)</option>
                                <option value="even">Chỉ các trang Chẵn (2,4,6...)</option>
                                <option value="custom">Tùy chỉnh khoảng trang</option>
                            </select>
                            <input type="text" id="conv-range" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 mt-2 outline-none text-sm font-bold text-zinc-900 dark:text-white hidden" placeholder="VD: 1, 3, 5-10">
                        </div>
                    </div>
                    <p class="text-[10px] font-medium text-zinc-500 mb-4 px-1 italic">Lưu ý: Nếu xuất nhiều trang, hệ thống sẽ tự động nén thành file .ZIP để tải về.</p>
                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="convert" disabled>CHUYỂN ĐỔI SANG ẢNH</button>
                </div>

                <div id="pane-extract" class="pdf-pane hidden animate-in fade-in">
                    
                    <div id="ext-pre-scan" class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-6 mb-4 text-center">
                        <span class="text-[12px] font-bold text-zinc-600 dark:text-zinc-300 block mb-2">Trích xuất hình ảnh được nhúng trong PDF</span>
                        <span class="text-[10px] font-medium text-zinc-400">Hệ thống sẽ quét file để tìm và hiển thị các hình ảnh. Bạn có thể chọn để tải về.</span>
                        <button id="btn-extract-scan" class="btn-action btn-premium mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs" data-type="extract-scan" disabled><i class="fas fa-search mr-1"></i> Quét Tìm Ảnh</button>
                    </div>

                    <div id="ext-workspace" class="hidden flex-col bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 mb-4 space-y-3">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ảnh tìm thấy (<span id="ext-selected-count" class="text-blue-500">0</span>)</span>
                            <div class="flex gap-1.5 overflow-x-auto hide-scrollbar">
                                <button id="ext-sel-all" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Tất cả</button>
                                <button id="ext-sel-clear" class="btn-premium px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Bỏ chọn</button>
                            </div>
                        </div>
                        <div id="ext-grid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                            </div>
                    </div>

                    <button id="btn-extract-download" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase items-center justify-center gap-2 hidden" disabled>TẢI ẢNH ĐÃ CHỌN</button>
                </div>

                <div id="pane-organize" class="pdf-pane hidden animate-in fade-in">
                    <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 mb-4">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Kéo thả trang để đổi chỗ - Bấm X để xóa</span>
                        </div>
                        <div id="org-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                            <div class="col-span-full text-center text-[10px] font-medium text-zinc-400 py-6 opacity-50">Vui lòng tải file PDF lên trước.</div>
                        </div>
                    </div>
                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="organize" disabled>LƯU CẤU TRÚC MỚI</button>
                </div>

                <div id="pane-watermark" class="pdf-pane hidden animate-in fade-in">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                        
                        <div class="md:col-span-5 space-y-4">
                            <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 space-y-4">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="col-span-2">
                                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Nội dung</label>
                                        <input type="text" id="wm-text" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none text-sm font-bold text-zinc-900 dark:text-white" value="WATERMARK" disabled>
                                    </div>
                                    <div class="col-span-2">
                                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Font chữ</label>
                                        <select id="wm-font" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none text-xs font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer" disabled>
                                            <option value="Helvetica">Helvetica (Mặc định)</option>
                                            <option value="Times-Roman">Times Roman</option>
                                            <option value="Courier">Courier (Mono)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase">Màu sắc</span>
                                    <input type="color" id="wm-color" value="#ff0000" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0" disabled>
                                </div>
                                <div>
                                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 mb-1"><span>Độ mờ</span><span id="val-wm-opacity">30%</span></div>
                                    <input type="range" id="wm-opacity" min="0.1" max="1" step="0.1" value="0.3" class="flat-range" disabled>
                                </div>
                            </div>
                            
                            <div class="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 space-y-4">
                                <div>
                                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 mb-1"><span>Cỡ chữ</span><span id="val-wm-size">40</span></div>
                                    <input type="range" id="wm-size" min="10" max="150" value="40" class="flat-range" disabled>
                                </div>
                                <div>
                                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 mb-1"><span>Góc xoay</span><span id="val-wm-rotate">0°</span></div>
                                    <input type="range" id="wm-rotate" min="-180" max="180" value="0" class="flat-range" disabled>
                                </div>
                                <div>
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Đóng dấu tại</label>
                                    <select id="wm-page-select" class="w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer" disabled>
                                        <option value="all">Tất cả các trang</option>
                                        <option value="1">Chỉ trang 1</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="md:col-span-7 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 flex flex-col items-center">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Xem trước (Kéo thả định vị trực quan)</span>
                            <div id="wm-workspace" class="preview-workspace hidden w-full" style="max-width: 500px;">
                                <img id="wm-bg-page" class="bg-page">
                                <div id="wm-draggable" class="drag-element hidden" style="border-color: #ef4444;">
                                    <span id="wm-drag-text" style="color: rgba(255,0,0,0.3); font-family: Helvetica;">WATERMARK</span>
                                </div>
                            </div>
                            <div id="wm-ws-empty" class="text-[10px] text-zinc-400 opacity-50 py-10">Vui lòng tải file PDF.</div>
                        </div>

                    </div>
                    <button class="btn-action btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2" data-type="watermark" disabled>ĐÓNG DẤU WATERMARK</button>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- LOAD DYNAMIC LIBS ---
    const loadPdfLib = () => new Promise((res) => {
        if (window.PDFLib) return res(window.PDFLib);
        const script = document.createElement('script'); script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
        script.onload = () => res(window.PDFLib); document.head.appendChild(script);
    });

    const loadPdfJs = () => new Promise((res) => {
        if (window.pdfjsLib) return res(window.pdfjsLib);
        const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => {
            window.pdfjsLib = window['pdfjs-dist/build/pdf'];
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            res(window.pdfjsLib);
        };
        document.head.appendChild(script);
    });

    const loadJSZip = () => new Promise((res) => {
        if (window.JSZip) return res(window.JSZip);
        const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => res(window.JSZip); document.head.appendChild(script);
    });

    // --- STATE ---
    let activeFile = null;
    let mergeFiles = [];
    let pdfDocInfo = null; 
    let pdfThumbnails = []; 
    let extractedImages = []; 
    
    let signImageBytes = null;
    let currentMode = 'merge';
    
    // Arrays & Sets
    let splitSelection = new Set();
    let extractSelection = new Set();
    let orgPageOrder = [];
    
    // Đóng băng Tọa độ bằng object mutation (Tránh gán lại reference)
    const signPos = { x: 0.5, y: 0.5 };
    const wmPos = { x: 0.5, y: 0.5 };

    // --- DOM ---
    const tabs = document.querySelectorAll('.pdf-tab');
    const panes = document.querySelectorAll('.pdf-pane');
    const btnClearAll = document.getElementById('btn-pdf-clear');
    const actionBtns = document.querySelectorAll('.btn-action');
    
    const gDropzone = document.getElementById('global-dropzone');
    const gInput = document.getElementById('global-file-input');
    const dzIdle = document.getElementById('dz-idle');
    const dzLoading = document.getElementById('dz-loading');
    const dzInfo = document.getElementById('dz-info');

    // --- UTILS ---
    const formatBytes = (b) => {
        if (b === 0) return '0 B'; const k = 1024; const s = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
    };

    const downloadBlob = (bytes, filename, type = 'application/pdf') => {
        const blob = new Blob([bytes], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    };

    const toggleActionBtns = (enabled) => {
        actionBtns.forEach(btn => {
            if (btn.dataset.type === 'merge') btn.disabled = mergeFiles.length < 2;
            else if (btn.dataset.type === 'compress') btn.disabled = true; 
            else if (btn.dataset.type === 'extract-scan') btn.disabled = !enabled; 
            else if (btn.dataset.type !== 'extract') btn.disabled = !enabled; 
        });
        
        ['split-mode', 'sign-page-select', 'sign-size', 'conv-mode', 'conv-format', 'wm-text', 'wm-font', 'wm-size', 'wm-rotate', 'wm-opacity', 'wm-color', 'wm-page-select'].forEach(id => {
            const el = document.getElementById(id); if(el) el.disabled = !enabled;
        });
    };

    // --- DRAG & DROP THUẦN CHUẨN XÁC ---
    const makeDraggable = (workspace, dragEl, posState) => {
        let isDragging = false;
        
        const updatePos = (clientX, clientY) => {
            const rect = workspace.getBoundingClientRect();
            let x = clientX - rect.left;
            let y = clientY - rect.top;
            
            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));

            // Set Position bằng % 
            dragEl.style.left = `${(x / rect.width) * 100}%`;
            dragEl.style.top = `${(y / rect.height) * 100}%`;

            // Lưu tọa độ TÂM (0 -> 1)
            posState.x = x / rect.width;
            posState.y = y / rect.height;
        };

        const startDrag = (e) => { isDragging = true; e.preventDefault(); e.stopPropagation(); };
        const endDrag = () => { isDragging = false; };

        // Mouse
        dragEl.onmousedown = startDrag;
        window.addEventListener('mousemove', (e) => { if (isDragging) updatePos(e.clientX, e.clientY); });
        window.addEventListener('mouseup', endDrag);

        // Touch
        dragEl.ontouchstart = startDrag;
        window.addEventListener('touchmove', (e) => { if (isDragging) { e.preventDefault(); updatePos(e.touches[0].clientX, e.touches[0].clientY); } }, {passive: false});
        window.addEventListener('touchend', endDrag);
        
        // Click to place
        workspace.onmousedown = (e) => { if(e.target === workspace || e.target.classList.contains('bg-page')) updatePos(e.clientX, e.clientY); };
    };

    // Khởi tạo kéo thả một lần duy nhất lúc Init
    makeDraggable(document.getElementById('sign-workspace'), document.getElementById('sign-draggable'), signPos);
    makeDraggable(document.getElementById('wm-workspace'), document.getElementById('wm-draggable'), wmPos);


    // --- TABS LOGIC ---
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900'); t.classList.add('bg-transparent', 'text-zinc-500'); });
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900'); tab.classList.remove('bg-transparent', 'text-zinc-500');
            
            currentMode = tab.dataset.target.replace('pane-', '');
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            document.getElementById(tab.dataset.target).classList.remove('hidden'); document.getElementById(tab.dataset.target).classList.add('block');
            
            gDropzone.style.display = currentMode === 'merge' ? 'none' : 'flex';
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        };
    });
    gDropzone.style.display = 'none';

    // ==========================================
    // 1. MERGE LOGIC
    // ==========================================
    const mList = document.getElementById('merge-list');
    const mEmpty = document.getElementById('merge-empty');
    
    const renderMergeList = () => {
        if (mergeFiles.length === 0) {
            mList.innerHTML = ''; mList.appendChild(mEmpty); mEmpty.style.display = 'block';
            toggleActionBtns(false); btnClearAll.classList.add('hidden'); return;
        }
        mEmpty.style.display = 'none'; mList.innerHTML = ''; btnClearAll.classList.remove('hidden');
        
        mergeFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-2.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl';
            item.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-6 h-6 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0">${index + 1}</div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-[11px] font-bold text-zinc-900 dark:text-white truncate">${file.name}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1 shrink-0 ml-2">
                    <button class="m-up w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 flex items-center justify-center"><i class="fas fa-chevron-up text-[9px]"></i></button>
                    <button class="m-down w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 flex items-center justify-center"><i class="fas fa-chevron-down text-[9px]"></i></button>
                    <button class="m-del w-6 h-6 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"><i class="fas fa-times text-[9px]"></i></button>
                </div>
            `;
            item.querySelector('.m-up').onclick = () => { if(index > 0){ [mergeFiles[index-1], mergeFiles[index]]=[mergeFiles[index], mergeFiles[index-1]]; renderMergeList(); }};
            item.querySelector('.m-down').onclick = () => { if(index < mergeFiles.length-1){ [mergeFiles[index+1], mergeFiles[index]]=[mergeFiles[index], mergeFiles[index+1]]; renderMergeList(); }};
            item.querySelector('.m-del').onclick = () => { mergeFiles.splice(index, 1); renderMergeList(); };
            mList.appendChild(item);
        });
        toggleActionBtns(true);
    };

    document.getElementById('btn-merge-add').onclick = () => {
        const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf'; i.multiple = true;
        i.onchange = (e) => { mergeFiles.push(...Array.from(e.target.files).filter(f => f.type==='application/pdf')); renderMergeList(); };
        i.click();
    };


    // ==========================================
    // RENDER GRIDS (SPLIT / ORGANIZE)
    // ==========================================
    const renderSplitGrid = () => {
        const grid = document.getElementById('split-grid');
        grid.innerHTML = ''; document.getElementById('split-selected-count').textContent = splitSelection.size;

        pdfThumbnails.forEach((imgSrc, index) => {
            const card = document.createElement('div');
            card.className = `thumb-card bg-zinc-50 dark:bg-zinc-800/30 ${splitSelection.has(index) ? 'selected' : ''}`;
            card.innerHTML = `<img src="${imgSrc}"><div class="page-num">${index + 1}</div>`;
            
            card.onclick = () => {
                if (splitSelection.has(index)) { splitSelection.delete(index); card.classList.remove('selected'); } 
                else { splitSelection.add(index); card.classList.add('selected'); }
                document.getElementById('split-selected-count').textContent = splitSelection.size;
                const btn = document.querySelector('.btn-action[data-type="split"]');
                btn.disabled = splitSelection.size === 0;
            };
            grid.appendChild(card);
        });
    };

    document.getElementById('sel-all').onclick = () => { splitSelection = new Set(pdfThumbnails.map((_, i) => i)); renderSplitGrid(); document.querySelector('.btn-action[data-type="split"]').disabled = false; };
    document.getElementById('sel-odd').onclick = () => { splitSelection = new Set(pdfThumbnails.map((_, i) => i).filter(i => i % 2 === 0)); renderSplitGrid(); document.querySelector('.btn-action[data-type="split"]').disabled = false; }; 
    document.getElementById('sel-even').onclick = () => { splitSelection = new Set(pdfThumbnails.map((_, i) => i).filter(i => i % 2 !== 0)); renderSplitGrid(); document.querySelector('.btn-action[data-type="split"]').disabled = false; };
    document.getElementById('sel-clear').onclick = () => { splitSelection.clear(); renderSplitGrid(); document.querySelector('.btn-action[data-type="split"]').disabled = true; };


    const renderOrganizeGrid = () => {
        const grid = document.getElementById('org-grid');
        grid.innerHTML = '';
        
        orgPageOrder.forEach((originalIndex, currentIndex) => {
            const imgSrc = pdfThumbnails[originalIndex];
            const card = document.createElement('div');
            card.className = 'thumb-card org-card bg-zinc-50 dark:bg-zinc-800/30';
            card.draggable = true;
            card.dataset.index = currentIndex; 
            card.innerHTML = `<img src="${imgSrc}"><div class="page-num">${originalIndex + 1}</div><button class="org-del"><i class="fas fa-times"></i></button>`;
            
            card.querySelector('.org-del').onclick = (e) => {
                e.stopPropagation(); orgPageOrder.splice(currentIndex, 1); renderOrganizeGrid();
            };

            card.ondragstart = (e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', currentIndex); setTimeout(() => card.classList.add('dragging'), 0); };
            card.ondragend = () => card.classList.remove('dragging');
            card.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
            card.ondrop = (e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = currentIndex;
                if (fromIdx !== toIdx) {
                    const movedItem = orgPageOrder.splice(fromIdx, 1)[0];
                    orgPageOrder.splice(toIdx, 0, movedItem);
                    renderOrganizeGrid();
                }
            };
            grid.appendChild(card);
        });
    };


    // ==========================================
    // EXTRACT IMAGES LOGIC
    // ==========================================
    const renderExtractGrid = () => {
        const grid = document.getElementById('ext-grid');
        grid.innerHTML = ''; document.getElementById('ext-selected-count').textContent = extractSelection.size;
        
        extractedImages.forEach((imgSrc, index) => {
            const card = document.createElement('div');
            card.className = `thumb-card bg-zinc-50 dark:bg-zinc-800/30 ${extractSelection.has(index) ? 'selected' : ''}`;
            card.innerHTML = `<img src="${imgSrc}">`;
            
            card.onclick = () => {
                if (extractSelection.has(index)) { extractSelection.delete(index); card.classList.remove('selected'); } 
                else { extractSelection.add(index); card.classList.add('selected'); }
                document.getElementById('ext-selected-count').textContent = extractSelection.size;
                document.getElementById('btn-extract-download').disabled = extractSelection.size === 0;
            };
            grid.appendChild(card);
        });
    };

    document.getElementById('ext-sel-all').onclick = () => { extractSelection = new Set(extractedImages.map((_, i) => i)); renderExtractGrid(); document.getElementById('btn-extract-download').disabled = false; };
    document.getElementById('ext-sel-clear').onclick = () => { extractSelection.clear(); renderExtractGrid(); document.getElementById('btn-extract-download').disabled = true; };


    // ==========================================
    // GLOBAL FILE LOAD & PREVIEW
    // ==========================================
    const loadGlobalFile = async (file) => {
        if (!file || file.type !== 'application/pdf') return UI.showAlert('Lỗi', 'Chỉ chấp nhận file PDF.', 'warning');
        
        dzIdle.classList.add('hidden'); dzIdle.classList.remove('flex');
        dzLoading.classList.remove('hidden'); dzLoading.classList.add('flex');
        
        document.getElementById('dz-filename').textContent = file.name;
        document.getElementById('dz-filesize').textContent = formatBytes(file.size);
        
        activeFile = file;
        btnClearAll.classList.remove('hidden');

        try {
            pdfDocInfo = await file.arrayBuffer();
            
            const pdfjs = await loadPdfJs();
            const pdfjsDoc = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
            const pageCount = pdfjsDoc.numPages;
            document.getElementById('dz-pagecount').textContent = `${pageCount} Trang`;

            pdfThumbnails = [];
            for (let i = 1; i <= pageCount; i++) {
                document.getElementById('dz-loading-text').textContent = `Đang phân tích trang ${i}/${pageCount}...`;
                const page = await pdfjsDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 }); // Scale lớn hơn chút cho preview đẹp
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                pdfThumbnails.push(canvas.toDataURL('image/jpeg', 0.8));

                // Cập nhật ảnh preview ngoài dropzone
                if (i === 1) {
                    const dzCanvas = document.getElementById('dz-preview-canvas');
                    if(dzCanvas) {
                        const ctx = dzCanvas.getContext('2d');
                        dzCanvas.width = viewport.width;
                        dzCanvas.height = viewport.height;
                        ctx.drawImage(canvas, 0, 0);
                    }
                }
            }

            dzLoading.classList.add('hidden'); dzLoading.classList.remove('flex');
            dzInfo.classList.remove('hidden'); dzInfo.classList.add('flex');
            
            // Reset Arrays & Grids
            splitSelection = new Set();
            orgPageOrder = Array.from({length: pageCount}, (_, i) => i);
            renderSplitGrid();
            renderOrganizeGrid();
            
            extractedImages = []; extractSelection.clear();
            document.getElementById('ext-pre-scan').style.display = 'block';
            document.getElementById('ext-workspace').classList.remove('flex'); document.getElementById('ext-workspace').classList.add('hidden');
            document.getElementById('btn-extract-download').classList.remove('flex'); document.getElementById('btn-extract-download').classList.add('hidden');
            
            // Workspace Previews
            document.getElementById('sign-bg-page').src = pdfThumbnails[0];
            document.getElementById('wm-bg-page').src = pdfThumbnails[0];
            
            // Selects
            const sSelect = document.getElementById('sign-page-select');
            sSelect.innerHTML = '';
            for(let i=1; i<=pageCount; i++) sSelect.add(new Option(`Trang ${i}`, i));
            sSelect.disabled = false;
            sSelect.onchange = (e) => { document.getElementById('sign-bg-page').src = pdfThumbnails[parseInt(e.target.value)-1]; };
            
            const wSelect = document.getElementById('wm-page-select');
            wSelect.innerHTML = '<option value="all">Tất cả các trang</option>';
            for(let i=1; i<=pageCount; i++) wSelect.add(new Option(`Chỉ trang ${i}`, i));
            wSelect.disabled = false;
            wSelect.onchange = (e) => { 
                if(e.target.value !== 'all') document.getElementById('wm-bg-page').src = pdfThumbnails[parseInt(e.target.value)-1]; 
            };

            document.getElementById('sign-workspace').classList.remove('hidden'); document.getElementById('sign-ws-empty').classList.add('hidden');
            document.getElementById('wm-workspace').classList.remove('hidden'); document.getElementById('wm-ws-empty').classList.add('hidden');
            
            // Reset Tâm điểm. Mutate Object thay vì gán lại để không làm đứt tham chiếu trong Drag Event
            signPos.x = 0.5; signPos.y = 0.5;
            wmPos.x = 0.5; wmPos.y = 0.5;
            
            document.getElementById('sign-draggable').style.left = '50%'; document.getElementById('sign-draggable').style.top = '50%';
            document.getElementById('wm-draggable').style.left = '50%'; document.getElementById('wm-draggable').style.top = '50%';
            
            updateWmPreview(); 

            toggleActionBtns(true);
            document.querySelector('.btn-action[data-type="split"]').disabled = true; 
        } catch (e) {
            console.error(e);
            dzLoading.classList.add('hidden'); dzLoading.classList.remove('flex');
            dzIdle.classList.remove('hidden'); dzIdle.classList.add('flex');
            UI.showAlert('Lỗi', 'Không thể đọc file. Có thể file bị hỏng hoặc có mật khẩu.', 'error');
            toggleActionBtns(false);
        }
    };

    gDropzone.onclick = (e) => { if (e.target.closest('#btn-pdf-clear')) return; gInput.click(); };
    gInput.onchange = (e) => { if(e.target.files.length) loadGlobalFile(e.target.files[0]); gInput.value = ''; };
    gDropzone.ondragover = (e) => { e.preventDefault(); gDropzone.classList.add('is-dragging'); };
    gDropzone.ondragleave = () => gDropzone.classList.remove('is-dragging');
    gDropzone.ondrop = (e) => { e.preventDefault(); gDropzone.classList.remove('is-dragging'); if(e.dataTransfer.files.length) loadGlobalFile(e.dataTransfer.files[0]); };

    btnClearAll.onclick = () => {
        mergeFiles = []; renderMergeList();
        activeFile = null; pdfDocInfo = null; pdfThumbnails = []; signImageBytes = null; extractedImages = [];
        
        dzIdle.classList.remove('hidden'); dzIdle.classList.add('flex');
        dzInfo.classList.add('hidden'); dzInfo.classList.remove('flex');
        dzLoading.classList.add('hidden'); dzLoading.classList.remove('flex');
        
        document.getElementById('sign-preview').classList.add('hidden');
        document.getElementById('sign-img-upload').querySelector('i').classList.remove('hidden');
        document.getElementById('sign-img-upload').querySelector('span').classList.remove('hidden');
        document.getElementById('sign-draggable').classList.add('hidden');
        
        document.getElementById('split-grid').innerHTML = '<div class="col-span-full text-center text-[10px] text-zinc-400 py-6 opacity-50">Vui lòng tải file PDF lên trước.</div>';
        document.getElementById('org-grid').innerHTML = '<div class="col-span-full text-center text-[10px] text-zinc-400 py-6 opacity-50">Vui lòng tải file PDF lên trước.</div>';
        
        document.getElementById('sign-workspace').classList.add('hidden'); document.getElementById('sign-ws-empty').classList.remove('hidden');
        document.getElementById('wm-workspace').classList.add('hidden'); document.getElementById('wm-ws-empty').classList.remove('hidden');
        
        document.getElementById('ext-pre-scan').style.display = 'block';
        document.getElementById('ext-workspace').classList.remove('flex'); document.getElementById('ext-workspace').classList.add('hidden');
        document.getElementById('btn-extract-download').classList.remove('flex'); document.getElementById('btn-extract-download').classList.add('hidden');

        toggleActionBtns(false);
        btnClearAll.classList.add('hidden');
    };

    // ==========================================
    // UI BINDING
    // ==========================================
    document.getElementById('conv-mode').onchange = (e) => {
        const r = document.getElementById('conv-range');
        if (e.target.value === 'custom') { r.classList.remove('hidden'); r.disabled = false; }
        else { r.classList.add('hidden'); r.disabled = true; }
    };
    
    const updateWmPreview = () => {
        const t = document.getElementById('wm-text').value || "WATERMARK";
        const o = document.getElementById('wm-opacity').value;
        const c = document.getElementById('wm-color').value;
        const s = document.getElementById('wm-size').value;
        const r = document.getElementById('wm-rotate').value;
        const f = document.getElementById('wm-font').value;
        
        const dt = document.getElementById('wm-drag-text');
        dt.textContent = t;
        
        const rC = parseInt(c.slice(1,3), 16), gC = parseInt(c.slice(3,5), 16), bC = parseInt(c.slice(5,7), 16);
        dt.style.color = `rgba(${rC},${gC},${bC},${o})`;
        dt.style.fontFamily = f;
        
        // Cỡ chữ trên web thu nhỏ theo tỷ lệ ~60% so với PDF thật
        const wsWidth = document.getElementById('wm-workspace').clientWidth || 595;
        const scale = wsWidth / 595; 
        dt.style.fontSize = `${s * scale}px`; 
        
        document.getElementById('wm-draggable').style.transform = `translate(-50%, -50%) rotate(${r}deg)`;
        
        document.getElementById('val-wm-size').textContent = s;
        document.getElementById('val-wm-rotate').textContent = `${r}°`;
        
        const opValEl = document.getElementById('val-wm-opacity');
        if (opValEl) opValEl.textContent = `${Math.round(o * 100)}%`;
    };

    ['wm-text', 'wm-opacity', 'wm-color', 'wm-size', 'wm-rotate', 'wm-font'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateWmPreview);
    });

    document.getElementById('sign-size').addEventListener('input', (e) => {
        const scale = e.target.value;
        const dragEl = document.getElementById('sign-draggable');
        dragEl.style.width = `${scale}%`;
        document.getElementById('val-sign-size').textContent = scale;
    });

    // ==========================================
    // EXTRACT SCAN LOGIC
    // ==========================================
    document.querySelector('.btn-action[data-type="extract-scan"]').onclick = async (e) => {
        const btn = e.target; const oriT = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-flat" style="border-top-color:#fff"></div> Đang Quét...'; btn.disabled = true;
        
        try {
            const pdfjs = await loadPdfJs();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
            extractedImages = []; extractSelection.clear();
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const ops = await page.getOperatorList();
                for (let j = 0; j < ops.fnArray.length; j++) {
                    if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                        const objId = ops.argsArray[j][0];
                        try {
                            const imgObj = await page.objs.get(objId);
                            const canvas = document.createElement('canvas');
                            canvas.width = imgObj.width; canvas.height = imgObj.height;
                            const ctx = canvas.getContext('2d');
                            const imgData = ctx.createImageData(imgObj.width, imgObj.height);
                            imgData.data.set(imgObj.data);
                            ctx.putImageData(imgData, 0, 0);
                            extractedImages.push(canvas.toDataURL('image/png'));
                        } catch(e){}
                    }
                }
            }

            if (extractedImages.length === 0) {
                UI.showAlert('Thông báo', 'Không tìm thấy hình ảnh nào trong file PDF này.', 'warning');
            } else {
                document.getElementById('ext-pre-scan').style.display = 'none';
                document.getElementById('ext-workspace').classList.remove('hidden'); document.getElementById('ext-workspace').classList.add('flex');
                document.getElementById('btn-extract-download').classList.remove('hidden'); document.getElementById('btn-extract-download').classList.add('flex');
                
                extractSelection = new Set(extractedImages.map((_, i) => i));
                renderExtractGrid();
                document.getElementById('btn-extract-download').disabled = false;
            }
        } catch (err) {
            UI.showAlert('Lỗi', 'Lỗi trong quá trình quét ảnh.', 'error');
        } finally {
            btn.innerHTML = oriT; btn.disabled = false;
        }
    };

    document.getElementById('btn-extract-download').onclick = async (e) => {
        if (extractSelection.size === 0) return;
        const btn = e.target; const oriT = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-flat"></div> ĐANG TẢI...'; btn.disabled = true;
        
        try {
            if (extractSelection.size === 1) {
                const idx = Array.from(extractSelection)[0];
                const a = document.createElement('a'); a.href = extractedImages[idx]; a.download = `Extracted_Img_${idx+1}.png`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
            } else {
                const JSZip = await loadJSZip();
                const zip = new JSZip();
                let c = 1;
                Array.from(extractSelection).forEach(idx => {
                    const base64 = extractedImages[idx].split(',')[1];
                    zip.file(`Extracted_Img_${c}.png`, base64, {base64: true}); c++;
                });
                const zipBlob = await zip.generateAsync({type:"blob"});
                downloadBlob(zipBlob, `AIO_Extracted_Images_${Date.now()}.zip`, 'application/zip');
            }
        } catch(err) { UI.showAlert('Lỗi','Không thể tạo file tải về.','error'); }
        finally { btn.innerHTML = oriT; btn.disabled = false; }
    };


    // ==========================================
    // CORE ACTIONS HANDLER 
    // ==========================================
    actionBtns.forEach(btn => {
        if (btn.dataset.type === 'extract-scan') return; 

        btn.onclick = async () => {
            const type = btn.dataset.type;
            const oriText = btn.innerHTML;
            btn.innerHTML = '<div class="spinner-flat"></div> ĐANG XỬ LÝ...';
            btn.disabled = true;

            try {
                const PDFLib = await loadPdfLib();
                
                // 1. MERGE
                if (type === 'merge') {
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    for (const f of mergeFiles) {
                        const arr = await f.arrayBuffer();
                        const pdf = await PDFLib.PDFDocument.load(arr);
                        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        pages.forEach(p => mergedPdf.addPage(p));
                    }
                    downloadBlob(await mergedPdf.save(), `AIO_Merged_${Date.now()}.pdf`);
                }

                // 2. SPLIT
                else if (type === 'split') {
                    if (splitSelection.size === 0) throw new Error('Chưa chọn trang');
                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const mode = document.getElementById('split-mode').value;
                    const indices = Array.from(splitSelection).sort((a,b)=>a-b);

                    if (mode === 'range') {
                        const newPdf = await PDFLib.PDFDocument.create();
                        const copiedPages = await newPdf.copyPages(pdf, indices);
                        copiedPages.forEach(p => newPdf.addPage(p));
                        downloadBlob(await newPdf.save(), `AIO_Split_${Date.now()}.pdf`);
                    } else {
                        const JSZip = await loadJSZip();
                        const zip = new JSZip();
                        for (let i of indices) {
                            const singlePdf = await PDFLib.PDFDocument.create();
                            const [copiedPage] = await singlePdf.copyPages(pdf, [i]);
                            singlePdf.addPage(copiedPage);
                            const bytes = await singlePdf.save();
                            zip.file(`Page_${i+1}.pdf`, bytes);
                        }
                        const zipBlob = await zip.generateAsync({type:"blob"});
                        downloadBlob(zipBlob, `AIO_Split_Burst_${Date.now()}.zip`, 'application/zip');
                    }
                }

                // 4. SIGN
                else if (type === 'sign') {
                    if (!signImageBytes) { UI.showAlert('Lỗi', 'Vui lòng tải ảnh chữ ký.', 'warning'); throw new Error('No sign'); }
                    const pageNum = parseInt(document.getElementById('sign-page-select').value);
                    const scalePercent = parseFloat(document.getElementById('sign-size').value);
                    
                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const image = await pdf.embedPng(signImageBytes); 
                    
                    const page = pdf.getPage(pageNum - 1);
                    const { width, height } = page.getSize();
                    
                    const drawWidth = width * (scalePercent / 100);
                    const imgObj = new Image(); imgObj.src = signImageBytes;
                    await new Promise(r => imgObj.onload = r);
                    const drawHeight = drawWidth * (imgObj.height / imgObj.width);
                    
                    // PDFLib gốc tọa độ góc trái DƯỚI. signPos.y là tỷ lệ từ góc trái TRÊN
                    const x = width * signPos.x - (drawWidth/2);
                    const y = height * (1 - signPos.y) - (drawHeight/2);

                    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
                    downloadBlob(await pdf.save(), `AIO_Signed_${Date.now()}.pdf`);
                }

                // 5. CONVERT (TO IMAGE)
                else if (type === 'convert') {
                    const format = document.getElementById('conv-format').value;
                    const mode = document.getElementById('conv-mode').value;
                    
                    const pdfjs = await loadPdfJs();
                    const pdf = await pdfjs.getDocument({ data: new Uint8Array(pdfDocInfo) }).promise;
                    const max = pdf.numPages;
                    
                    let indices = [];
                    if (mode === 'all') indices = Array.from({length: max}, (_, i) => i);
                    else if (mode === 'odd') indices = Array.from({length: max}, (_, i) => i).filter(i => (i+1)%2 !== 0);
                    else if (mode === 'even') indices = Array.from({length: max}, (_, i) => i).filter(i => (i+1)%2 === 0);
                    else {
                        const rangeStr = document.getElementById('conv-range').value;
                        const pages = new Set();
                        rangeStr.split(',').forEach(part => {
                            if (part.includes('-')) {
                                const [s, e] = part.split('-').map(n => parseInt(n.trim()));
                                if (s > 0 && e >= s) for (let i = s; i <= e; i++) if(i <= max) pages.add(i-1);
                            } else {
                                const n = parseInt(part.trim());
                                if (n > 0 && n <= max) pages.add(n-1);
                            }
                        });
                        indices = Array.from(pages).sort((a,b)=>a-b);
                    }
                    
                    if (indices.length === 0) throw new Error('Range invalid');

                    if (indices.length === 1) {
                        const page = await pdf.getPage(indices[0] + 1);
                        const viewport = page.getViewport({ scale: 2.0 }); 
                        const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
                        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                        
                        const a = document.createElement('a'); a.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9); a.download = `Page_${indices[0]+1}.${format}`;
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    } else {
                        const JSZip = await loadJSZip();
                        const zip = new JSZip();
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        for (let i of indices) {
                            const page = await pdf.getPage(i + 1);
                            const viewport = page.getViewport({ scale: 2.0 }); 
                            canvas.width = viewport.width; canvas.height = viewport.height;
                            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                            
                            const base64Data = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9).split(',')[1];
                            zip.file(`Page_${i+1}.${format}`, base64Data, {base64: true});
                        }

                        const zipBlob = await zip.generateAsync({type:"blob"});
                        downloadBlob(zipBlob, `AIO_Images_${Date.now()}.zip`, 'application/zip');
                    }
                }

                // 7. ORGANIZE
                else if (type === 'organize') {
                    if (orgPageOrder.length === 0) throw new Error('Order empty');
                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    const newPdf = await PDFLib.PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(pdf, orgPageOrder);
                    copiedPages.forEach(p => newPdf.addPage(p));
                    downloadBlob(await newPdf.save(), `AIO_Organized_${Date.now()}.pdf`);
                }

                // 8. WATERMARK
                else if (type === 'watermark') {
                    const text = document.getElementById('wm-text').value || "WATERMARK";
                    const op = parseFloat(document.getElementById('wm-opacity').value);
                    const hex = document.getElementById('wm-color').value;
                    const pageMode = document.getElementById('wm-page-select').value;
                    const rotate = parseInt(document.getElementById('wm-rotate').value);
                    const customSize = parseInt(document.getElementById('wm-size').value);
                    const fontSelection = document.getElementById('wm-font').value;
                    
                    const r = parseInt(hex.slice(1,3), 16)/255;
                    const g = parseInt(hex.slice(3,5), 16)/255;
                    const b = parseInt(hex.slice(5,7), 16)/255;

                    const pdf = await PDFLib.PDFDocument.load(pdfDocInfo);
                    
                    let targetFont;
                    if (fontSelection === 'Times-Roman') targetFont = PDFLib.StandardFonts.TimesRoman;
                    else if (fontSelection === 'Courier') targetFont = PDFLib.StandardFonts.Courier;
                    else targetFont = PDFLib.StandardFonts.Helvetica;

                    const font = await pdf.embedFont(targetFont);
                    
                    const drawW = (page) => {
                        const { width, height } = page.getSize();
                        
                        const textWidth = font.widthOfTextAtSize(text, customSize);
                        
                        // Thuật toán lượng giác (Trigonometry) chống lệch tâm khi Xoay PDFLib
                        const cx = width * wmPos.x;
                        const cy = height * (1 - wmPos.y); 
                        
                        const rad = PDFLib.degrees(-rotate).inRadians(); 
                        const x = cx - (textWidth/2) * Math.cos(rad) + (customSize/2) * Math.sin(rad);
                        const y = cy - (textWidth/2) * Math.sin(rad) - (customSize/2) * Math.cos(rad);

                        page.drawText(text, {
                            x, y,
                            size: customSize,
                            font: font,
                            color: PDFLib.rgb(r, g, b),
                            opacity: op,
                            rotate: PDFLib.degrees(-rotate) 
                        });
                    };

                    if (pageMode === 'all') pdf.getPages().forEach(p => drawW(p));
                    else drawW(pdf.getPage(parseInt(pageMode) - 1));
                    
                    downloadBlob(await pdf.save(), `AIO_Watermark_${Date.now()}.pdf`);
                }

            } catch (error) {
                console.error(error);
                if (error.message === 'Chưa chọn trang') UI.showAlert('Lỗi', 'Vui lòng chạm vào các trang muốn tách.', 'warning');
                else if (error.message === 'Range invalid') UI.showAlert('Lỗi', 'Khoảng trang nhập vào không hợp lệ.', 'warning');
                else if (error.message !== 'No sign') UI.showAlert('Lỗi', 'Có lỗi xảy ra trong quá trình xuất PDF.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = oriText;
            }
        };
    });

    // --- UPLOAD SIGNATURE (Chuyển đổi mọi định dạng sang PNG Base64) ---
    const sImgUpload = document.getElementById('sign-img-upload');
    const sFile = document.getElementById('sign-file');
    sImgUpload.onclick = () => sFile.click();
    sFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                
                signImageBytes = canvas.toDataURL('image/png'); 
                
                document.getElementById('sign-preview').src = signImageBytes;
                document.getElementById('sign-preview').classList.remove('hidden');
                
                document.getElementById('sign-drag-img').src = signImageBytes;
                document.getElementById('sign-draggable').classList.remove('hidden');

                sImgUpload.querySelector('i').classList.add('hidden');
                sImgUpload.querySelector('span').classList.add('hidden');
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
    };
}